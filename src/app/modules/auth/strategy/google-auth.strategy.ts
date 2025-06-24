import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const clientID = configService.get<string>('oAuth.google.client_id');
    const clientSecret = configService.get<string>(
      'oAuth.google.client_secret',
    );
    const callbackURL = configService.get<string>('oAuth.google.callback_url');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing Google OAuth configuration');
    }
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): any {
    console.info(accessToken, refreshToken, profile);
    // const user = await this.authService.validateOrOAuthUser({
    //   email: emails[0].value,
    //   name: displayName,
    //   avatar: '',
    // });
    done(null, {});
  }
}
