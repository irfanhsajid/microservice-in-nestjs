import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { CustomLogger } from '../../modules/logger/logger.service';
import { QueryFailedError } from 'typeorm';

export class GlobalServerExceptionsFilter implements ExceptionFilter {
  private readonly logger = new CustomLogger(GlobalServerExceptionsFilter.name);

  constructor(private httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | Record<string, string[]> = 'Internal server error';
    let errorTitle = 'Internal Server Error';

    // Handle TypeORM exception
    if (exception instanceof QueryFailedError) {
      if (
        exception.driverError.code === '23505' ||
        exception.driverError.errno === 1062
      ) {
        httpStatus = HttpStatus.CONFLICT;
        errorTitle = 'Unique Constraint Violation';

        const detail =
          exception.driverError.detail || exception.driverError.message;
        const fieldMatch =
          detail?.match(/Key \((.*?)\)=/) ||
          detail?.match(/Duplicate entry '.*?' for key '(.*?)'/);
        const field = fieldMatch ? fieldMatch[1] : 'unknown field';
        message = `A record with this ${field} already exists.`;
      } else {
        // Handle other QueryFailedError cases
        message = 'Database error occurred';
        errorTitle = 'Database Error';
      }
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
        errorTitle = HttpStatus[httpStatus] || 'Error';
      } else if (typeof response === 'object') {
        const res: any = response;
        // Handle ValidationPipe formatted errors
        if (
          res.message &&
          typeof res.message === 'object' &&
          !Array.isArray(res.message)
        ) {
          message = res.message;
          errorTitle = res;
        } else if (Array.isArray(res.message)) {
          const fieldErrors: Record<string, string[]> = {};
          for (const err of res.message) {
            if (err.property && err.constraints) {
              fieldErrors[err.property] = Object.values(err.constraints);
            }
          }
          message = Object.keys(fieldErrors).length ? fieldErrors : res.message;
        } else {
          message = res.message || res.error || 'Unexpected error';
        }
        if (
          !(
            res.message &&
            typeof res.message === 'object' &&
            !Array.isArray(res.message)
          )
        ) {
          errorTitle = res.error || res || HttpStatus[httpStatus] || 'Error';
        }
      }
    }

    this.logger.error(
      `Status: ${httpStatus}, Error: ${JSON.stringify(message)}\n ${exception.stack}`,
    );

    const responseBody = {
      statusCode: httpStatus,
      errors: errorTitle,
      message,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
