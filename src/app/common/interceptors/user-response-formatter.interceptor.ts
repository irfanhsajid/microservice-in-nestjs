import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UserResponseFormatterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const request = httpContext.getRequest();
    const accept = request.headers['accept'];

    // ignore formatting the text/html data
    if (accept && accept.includes('text/html')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // Skip formatting for specific routes (e.g., Swagger)
        const request = httpContext.getRequest();
        if (request.url.includes('/docs')) {
          return data;
        }
        const status = data?.status;
        if (status >= 400 && status < 500) {
          return {
            statusCode: status,
            errors: data.response,
            message: data?.message,
          };
        } else if (status >= 100 && status < 400) {
          return {
            statusCode: status || 200,
            message: data?.message,
            data: data.response || null,
          };
        } else if (status >= 500) {
          return {
            statusCode: status || 500,
            message: data?.message,
            errors: data?.response,
          };
        }
        // Standard response format
        return {
          statusCode: response.statusCode || 200,
          message: 'Success',
          data: data || null,
        };
      }),
    );
  }
}
