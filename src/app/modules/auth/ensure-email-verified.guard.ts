import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CustomLogger } from '../logger/logger.service';

@Injectable()
export class EnsureEmailVerifiedGuard implements CanActivate {
  private readonly logger = new CustomLogger(EnsureEmailVerifiedGuard.name);

  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request['user'];

    if (!user || !user.email) {
      throw new UnauthorizedException('User information missing or invalid');
    }

    try {
      const isEmailVerified = await this.userService.CheckEmailVerifyedat(
        user.email,
      );

      if (!isEmailVerified) {
        throw new ForbiddenException('Email address not verified');
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Email verification check failed for user ${user?.email}:`,
        error?.message || error,
      );
      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnauthorizedException('Could not validate email verification');
    }
  }
}
