import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  AUTH_SERVICE_NAME,
  AuthServiceController,
  RequestAuthorizationPayload,
  ResponseAuthorizationPayload,
} from '../types/auth/auth.pb';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthService } from 'src/app/modules/auth/auth.service';

@SkipThrottle()
@Controller('authGrpc')
export class AuthGrpcController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod(AUTH_SERVICE_NAME)
  requestAuthorization(
    request: RequestAuthorizationPayload,
  ):
    | Promise<ResponseAuthorizationPayload>
    | Observable<ResponseAuthorizationPayload>
    | ResponseAuthorizationPayload {
    console.info('got grpc request', request);
    return {
      status: true,
      errors: 'none',
    };
  }
}
