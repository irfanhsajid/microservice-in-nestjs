// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, VerifyCallback } from 'passport-google-oauth20';
// import { ConfigService } from '@nestjs/config';
// import { AuthService } from '../services/auth.service';

// @Injectable()
// export class GoogleAuthStrategyService extends PassportStrategy(Strategy, 'google') {
//   constructor(
//     private readonly configService: ConfigService,
//     private readonly authService: AuthService,
//   ) {
//     super({
//       clientID: configService.get<string>('oauth.google.client_id'),
//       clientSecret: configService.get<string>('oauth.google.client_secret'),
//       callbackURL: configService.get<string>('oauth.google.callback_url'),
//       scope: ['email', 'profile'],
//     });
//   }

//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     profile: any,
//     done: VerifyCallback,
//   ): Promise<any> {
//     const { id, emails, displayName } = profile;
//     const user = await this.authService.validateOAuthUser({
//       provider: 'google',
//       providerId: id,
//       email: emails[0].value,
//       name: displayName,
//     });
//     done(null, user);
//   }
// }
