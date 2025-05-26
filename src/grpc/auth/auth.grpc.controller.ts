import { Controller } from '@nestjs/common';
import {
  AUTH_SERVICE_NAME,
  AuthServiceController,
  RequestAuthorizationPayload,
  ResponseAuthorizationPayload,
} from '../types/auth.pb';
import { Observable } from 'rxjs';
import { GrpcMethod } from '@nestjs/microservices';

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
