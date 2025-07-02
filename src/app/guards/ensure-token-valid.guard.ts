import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../modules/user/user.service';
import { CustomLogger } from '../modules/logger/logger.service';
import { VehicleInspectionLinkService } from '../modules/vehicles-listing/services/vehicle-inspection-link.service';
import { extractAuthorizeToken } from '../common/utils/extract-authorize-token';

@Injectable()
export class EnsureTokenIsValidGuard implements CanActivate {
  private readonly logger = new CustomLogger(EnsureTokenIsValidGuard.name);

  constructor(
    private readonly vehicleInspectionLinkService: VehicleInspectionLinkService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = extractAuthorizeToken(request);
      const user = await this.vehicleInspectionLinkService.validateToken(token);
      if (!user) {
        throw new UnauthorizedException();
      }

      request['user'] = user;

      const userDealership = await this.userService.userDefaultDealership(user);

      if (userDealership) {
        request['user_default_dealership'] = userDealership;
      }

      return true;
    } catch (error) {
      this.logger.error(`EnsureTokenIsValidGuard:`, error?.message || error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnauthorizedException('Could not validate user profile');
    }
  }
}
