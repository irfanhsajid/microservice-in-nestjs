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
import { OAuthDto, TwitterOAuthDto } from '../dto/create-user.dto';
import { GoogleAuthService } from '../services/google-auth-service.service';
import { TwitterAuthService } from '../services/twitter-auth-service.service';

@Controller('api/v1/oauth')
export class OAuthController {
  private readonly logger = new CustomLogger(OAuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly twitterAuthService: TwitterAuthService,
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

  @Post('twitter')
  async twitterLoginWithToken(@Body() dto: TwitterOAuthDto) {
    try {
      return await this.twitterAuthService.login(dto);
    } catch (error) {
      this.logger.error(`Twitter OAuth error: ${error.message}`);
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

  @Get('get-twitter-access-token')
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
          message: 'Twitter auth error',
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
}
