import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../modules/user/user.service';
import { CaslAbilityFactory } from '../modules/auth/casl/casl-ability.factory';
import { extractAuthorizeToken } from '../common/utils/extract-authorize-token';

@Injectable()
export class ApiGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly abilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.info('connection got here');
    const request = context.switchToHttp().getRequest();
    const token = extractAuthorizeToken(request);
    console.info('token user', token);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('app.key'),
      });
      const user = await this.userService.getUserByEmail(payload?.email, false);

      if (!user) {
        throw new UnauthorizedException();
      }

      const userDealership = await this.userService.userDefaultDealership(user);

      if (userDealership) {
        request['user_default_dealership'] = userDealership;
        const permissions = await this.userService.getPermissionsByRole(
          userDealership?.role_id,
        );
        request['ability'] = this.abilityFactory.createForUser(
          user,
          permissions,
        );
      }

      request['user'] = user;
    } catch (error) {
      console.info(error);
      throw new UnauthorizedException();
    }
    return true;
  }
}
