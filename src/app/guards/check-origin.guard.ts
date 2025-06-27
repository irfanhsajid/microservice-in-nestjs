import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  applyDecorators,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { EntityManager } from 'typeorm';
import { User, UserAccountType } from '../modules/user/entities/user.entity';

// Custom CORS exception
export class CorsOriginException extends HttpException {
  constructor() {
    super('Invalid CORS origin', HttpStatus.FORBIDDEN);
  }
}

@Injectable()
export class AuthOriginGuard implements CanActivate {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const origin =
      request.get('origin') ||
      request.get('referer')?.split('/').slice(0, 3).join('/');
    const appUrl = this.configService.get<string>('app.app_url');
    const adminOrigin = [
      this.configService.get<string>('app.admin_url'),
      appUrl,
    ];
    const webOrigin = [this.configService.get<string>('app.web_url'), appUrl];

    const body = request.body;
    const path = request.path;

    if (path.includes('/login') && body?.email) {
      const user = (await this.entityManager
        .getRepository('users')
        .createQueryBuilder('users')
        .where({ email: body.email })
        .getOne()) as User;
      if (user && user.account_type === UserAccountType.MODERATOR) {
        if (!origin || !adminOrigin?.includes(origin)) {
          throw new CorsOriginException();
        }
      } else {
        if (!origin || !webOrigin?.includes(origin)) {
          throw new CorsOriginException();
        }
      }
    } else if (path.includes('/register')) {
      if (!origin || !webOrigin?.includes(origin)) {
        throw new CorsOriginException();
      }
    }
    return true;
  }
}

export function AuthOrigin() {
  return applyDecorators(
    // SetMetadata('allowedOrigins', origins),
    UseGuards(AuthOriginGuard),
  );
}
