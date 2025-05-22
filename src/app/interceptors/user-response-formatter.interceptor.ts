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

    return next.handle().pipe(
      map((data) => {
        // Skip formatting for specific routes (e.g., Swagger)
        const request = httpContext.getRequest();
        if (request.url.includes('/docs')) {
          return data;
        }

        if (data.status >= 400 && data.status < 500) {
          return {
            statusCode: data.status,
            errors: data.response,
            message: data?.message,
          };
        } else if (data.status >= 100 && data.status < 400) {
          return {
            statusCode: data.status || 200,
            message: data?.message,
            data: data.response || null,
          };
        } else if (data.status >= 500) {
          return {
            statusCode: data.status || 500,
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
