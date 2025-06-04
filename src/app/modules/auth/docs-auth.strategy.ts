import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from '../user/user.service';

@Injectable()
export class DocsLocalAuthStrategyService extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super();
  }

  async validate(email: string, password: string): Promise<any> {
    console.info('auth comes on session');
    const validateUser = await this.userService.validateUser({
      email: email,
      password,
    });
    if (!validateUser) {
      throw new UnauthorizedException('Invalid user credentials');
    }
    return validateUser;
  }
}
