import {
  Controller,
  Get,
  UseGuards,
  Req,
  BadRequestException,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { CustomLogger } from '../../logger/logger.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { User } from '../../user/entities/user.entity';
import { OAuthDto } from '../dto/create-user.dto';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GoogleAuthService } from '../services/google-auth-service.service';

@Controller('auth/oauth')
export class OAuthController {
  private readonly logger = new CustomLogger(OAuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Post('google')
  async googleLoginWithToken(@Body() dto: OAuthDto) {
    try {
      return await this.googleAuthService.login(dto.access_token);
    } catch (error) {
      this.logger.error(`Google OAuth error: ${error.message}`);
      throwCatchError(error);
    }
  }

  // Get google user token
  @Get('/get-google-access-token')
  @UseGuards(AuthGuard('google'))
  getGoogleToke() {
    this.logger.log('hudai');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request) {
    try {
      const user = req.user as User;

      if (!user) {
        throw new BadRequestException({
          message: 'Google signin error',
        });
      }

      const token = await this.authService.createJwtToken(user);
      return {
        access_token: token,
        user,
      };
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @Get('twitter')
  @UseGuards(AuthGuard('twitter'))
  twitterLogin() {
    // Initiates X (Twitter) OAuth flow
    this.logger.log('Initiating Google OAuth flow');
  }

  @Get('twitter/callback')
  @UseGuards(AuthGuard('twitter'))
  async twitterCallback(@Req() req: Request) {
    try {
      const user = req.user as User;

      if (!user) {
        throw new BadRequestException({
          message: 'Google signin error',
        });
      }

      const token = await this.authService.createJwtToken(user);
      return {
        access_token: token,
        user,
      };
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async getGoogleUser(accessToken: string) {
    const oauth2Client = new OAuth2Client();

    oauth2Client.setCredentials({ access_token: accessToken });

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    try {
      const { data } = await oauth2.userinfo.get();
      return data; // contains: id, email, name, picture, etc.
    } catch (error) {
      console.error('Google API error:', error.response?.data || error.message);
      throw new Error('Failed to fetch user data from Google');
    }
  }
}
