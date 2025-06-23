import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TwitterAuthStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const consumerKey = configService.get<string>('oAuth.twitter.consumer_key');
    const consumerSecret = configService.get<string>(
      'oAuth.twitter.consumer_secret',
    );
    const callbackURL = configService.get<string>('oAuth.twitter.callback_url');

    if (!consumerKey || !consumerSecret || !callbackURL) {
      throw new Error('Missing Twitter OAuth configuration');
    }
    console.info(consumerKey, consumerSecret, callbackURL);
    super({
      consumerKey: consumerKey,
      consumerSecret: consumerSecret,
      callbackURL: callbackURL,
      includeEmail: true,
    });
  }

  validate(token: string, tokenSecret: string, profile: any, done: any): any {
    console.info('token', token, tokenSecret);
    // const { username, displayName, emails, photos } = profile;
    console.info(profile);
    // const user = await this.authService.validateOrOAuthUser({
    //   name: displayName || username,
    //   email: emails?.[0]?.value ?? null,
    //   avatar: photos?.[0]?.value ?? null,
    // });

    done(null, {});
  }
}
