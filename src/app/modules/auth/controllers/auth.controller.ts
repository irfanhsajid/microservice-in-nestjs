import {
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomLogger } from '../../logger/logger.service';
import { AuthService } from '../services/auth.service';
import { SigninDto } from '../../user/dto/signin.dto';
import { ApiGuard } from '../../../guards/api.guard';
import { CheckOrigin } from 'src/app/guards/check-origin.guard';

@ApiTags('Auth')
@Controller('api/v1')
export class AuthenticatedController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new CustomLogger(AuthenticatedController.name);

  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: SigninDto })
  @Post('/login')
  @CheckOrigin([
    'https://staging.api.carvu.ca',
    'https://staging.admin.carvu.ca',
    'http://localhost:3000',
  ])
  async login(@Body() dto: SigninDto) {
    return await this.authService.login(dto);
  }

  @UseGuards(ApiGuard)
  @ApiOperation({ summary: 'Revoke the current JWT token' })
  @ApiBearerAuth('jwt')
  @Post('/logout')
  async logout(@Request() req: any) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = req.user.id;
      const email = req.user.email;

      if (!token || !userId) {
        throw new UnprocessableEntityException({
          message: 'Token and user ID are required',
        });
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
