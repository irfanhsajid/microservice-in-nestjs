import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomLogger } from '../logger/logger.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SigninDto } from '../user/dto/signin.dto';
import { ApiGuard } from './api.guard';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dto/password-reset.dto';
import { ResendVerifyEmailDto } from './dto/resend-verify-email.dto';
import { SetNewPasswordDto } from './dto/set-new-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('Auth')
@Controller('api/v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new CustomLogger(AuthController.name);

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @Post('/register')
  async registerUser(@Body() dto: CreateUserDto) {
    return await this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Verify email address' })
  @Post('/verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return await this.authService.verifyEmail(dto);
  }

  @Post('/resend-verification-email')
  async resendVerificationEmail(@Body() dto: ResendVerifyEmailDto) {
    return await this.authService.resendVerificationEmail(dto);
  }

  @ApiOperation({ summary: 'Reset user password' })
  @Post('/reset-password')
  async passwordReset(@Body() dto: ResetPasswordDto) {
    throw new HttpException(
      '@TODO implemente the logic',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @ApiOperation({ summary: 'Set new password' })
  @Put('/set-new-password')
  async setNewPassword(@Body() dto: SetNewPasswordDto) {
    throw new HttpException(
      '@TODO implemente the logic',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @ApiOperation({ summary: 'Login user' })
  @Post('/login')
  async tokenBasedLogin(@Body() dto: SigninDto) {
    return await this.authService.signin(dto);
  }

  @UseGuards(ApiGuard)
  @ApiOperation({ summary: 'Revoke the current JWT token' })
  @ApiBearerAuth('jwt')
  @Post('/logout')
  async revokeToken(@Request() req: any) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = req.user.sub;
      const email = req.user.email;

      if (!token || !userId) {
        throw new BadRequestException('Token and user ID are required');
      }

      await this.authService.revokeToken(token, userId);
      this.logger.log(`Token revoked for user ${userId} (${email})`);
      return { message: 'Token revoked successfully' };
    } catch (error) {
      this.logger.error(`Token revocation failed for user`, error);

      throw new UnauthorizedException('Invalid token or user');
    }
  }
}
