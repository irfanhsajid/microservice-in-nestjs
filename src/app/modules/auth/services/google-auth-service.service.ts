import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { Service } from './service';

@Injectable()
export class GoogleAuthService extends Service {
  async login(accessToken: string) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const userData = response.data;

      if (!userData) {
        throw new UnauthorizedException({
          message: 'Falied to login with google, try again',
        });
      }
      // validate or create oauth user
      return await this.validateOrOAuthUser({
        name: userData?.name || userData.given_name || 'Unknown',
        email: userData.email,
        avatar: userData?.picture,
      });
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException({
        message: 'Falied to login with google, try again',
      });
    }
  }
}
