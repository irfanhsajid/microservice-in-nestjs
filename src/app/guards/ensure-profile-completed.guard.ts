import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../modules/user/user.service';
import { CustomLogger } from '../modules/logger/logger.service';
import { User } from '../modules/user/entities/user.entity';

@Injectable()
export class EnsureProfileCompletedGuard implements CanActivate {
  private readonly logger = new CustomLogger(EnsureProfileCompletedGuard.name);

  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request['user'] as User;

    if (!user || !user.email) {
      throw new UnauthorizedException('User information missing or invalid');
    }

    try {
      const isEmailVerified = await this.userService.CheckProfileCompleted(
        user.email,
      );

      if (!isEmailVerified) {
        throw new ForbiddenException('Profile is not completed yet!');
      }

      if (!user.profile_completed) {
        throw new ForbiddenException('Profile is not completed yet!');
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

      throw new UnauthorizedException('Could not validate user profile');
    }
  }
}
