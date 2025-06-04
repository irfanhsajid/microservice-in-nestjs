import {
  BadRequestException,
  Body,
  Controller,
  Post,
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
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { SigninDto } from '../user/dto/signin.dto';
import { ApiGuard } from './api.guard';

@ApiTags('Auth')
@Controller('api/v1')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}
  private readonly logger = new CustomLogger(AuthController.name);

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @Post('/register')
  async registerUser(@Body() dto: CreateUserDto) {
    return await this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login user' })
  @Post('/login')
  async tokenBasedLogin(@Body() dto: SigninDto) {
    return await this.authService.signin(dto);
  }

  @UseGuards(ApiGuard)
  @ApiOperation({ summary: 'Revoke the current JWT token' })
  @ApiBearerAuth('JWT')
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
