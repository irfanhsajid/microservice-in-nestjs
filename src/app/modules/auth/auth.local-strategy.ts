import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from '../user/user.service';

@Injectable()
export class LocalAuthStrategyService extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    console.log('request got here', username, password);
    const validateUser = await this.userService.validateUserByEmailPassword(
      username,
      password,
    );
    if (!validateUser) {
      throw new UnauthorizedException('Invalid user credentials');
    }
    return validateUser;
  }
}
