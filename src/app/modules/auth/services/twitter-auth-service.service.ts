import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { Service } from './service';
import * as OAuth from 'oauth-1.0a';
import { TwitterOAuthDto } from '../dto/create-user.dto';
import * as crypto from 'crypto';

@Injectable()
export class TwitterAuthService extends Service {
  async login(dto: TwitterOAuthDto) {
    const key = this.configService.get('oAuth.twitter.consumer_key');
    const secret = this.configService.get('oAuth.twitter.consumer_secret');
    try {
      const oauth = new OAuth({
        consumer: {
          key,
          secret,
        },
        signature_method: 'HMAC-SHA1',
        hash_function(baseString, key) {
          return crypto
            .createHmac('sha1', key)
            .update(baseString)
            .digest('base64');
        },
      });

      const requestData = {
        url: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
        method: 'GET',
      };

      const authHeader = oauth.toHeader(
        oauth.authorize(requestData, {
          key: dto.token,
          secret: dto.tokenSecret,
        }),
      );

      const response = await axios.get(requestData.url, {
        headers: {
          ...authHeader,
        },
      });

      const user = response.data;
      if (!user) {
        throw new UnauthorizedException('Invalid Twitter token');
      }

      return await this.validateOrOAuthUser({
        name: user?.name || 'Unknown',
        email: user?.email || '',
        avatar: user?.profile_image_url_https || '',
      });
    } catch (error) {
      this.logger.error(error.response?.data || error.message);
      throw new UnauthorizedException('Failed to verify Twitter token');
    }
  }
}
