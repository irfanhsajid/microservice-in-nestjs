import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { Service } from './service';

@Injectable()
export class TwitterAuthService extends Service {
  async login(token: string) {
    try {
      const response = await axios.get('https://api.x.com/2/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = response.data.data;
      if (!user) {
        throw new UnauthorizedException({
          message: 'Invalid X token',
        });
      }
      console.info('X user ====================', response);
      // validate or create oauth user
      return await this.validateOrOAuthUser({
        name: user?.name || 'Unknown',
        email: user?.email || '',
        avatar: user?.picture || '',
      });
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Failed to verify X token');
    }
  }
}
