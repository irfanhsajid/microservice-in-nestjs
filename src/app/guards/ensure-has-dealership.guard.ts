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
import { UserDealership } from '../modules/dealership/entities/user-dealership.entity';

@Injectable()
export class EnsureHasDealershipGuard implements CanActivate {
  private readonly logger = new CustomLogger(EnsureHasDealershipGuard.name);

  constructor(private readonly userService: UserService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request['user'] as User;

    if (!user || !user.email) {
      throw new UnauthorizedException('User information missing or invalid');
    }

    try {
      const userDealership = request[
        'user_default_dealership'
      ] as UserDealership;

      if (!userDealership?.dealership_id) {
        throw new ForbiddenException(
          'Error: No dealership assign to your account!',
        );
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Dealership checking failed ${user?.email}:`,
        error?.message || error,
      );
      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnauthorizedException('Could not validate user dealership');
    }
  }
}
