import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  AUTH_SERVICE_NAME,
  AuthServiceController,
  RequestAuthorizationPayload,
  ResponseAuthorizationPayload,
} from '../types/auth/auth.pb';

@Controller('authGrpc')
export class AuthGrpcController implements AuthServiceController {
  @GrpcMethod(AUTH_SERVICE_NAME)
  requestAuthorization(
    request: RequestAuthorizationPayload,
  ):
    | Promise<ResponseAuthorizationPayload>
    | Observable<ResponseAuthorizationPayload>
    | ResponseAuthorizationPayload {
    console.info('got grpc request', request);
    return {
      accessToken: 'hudai',
      errors: 'none',
    };
  }
}
