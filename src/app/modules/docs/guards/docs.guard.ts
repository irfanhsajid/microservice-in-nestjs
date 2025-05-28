import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class DocsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.session && request.session['user']) {
      return true;
    }

    throw new UnauthorizedException(
      'Authentication required to access API documentation',
    );
  }
}
