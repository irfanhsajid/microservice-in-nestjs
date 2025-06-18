import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerifyEmailDto } from '../dto/resend-verify-email.dto';
import { ApiGuard } from '../api.guard';

@ApiTags('Auth')
@Controller('api/v1')
export class VerifyEmailController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ApiGuard)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiBearerAuth('jwt')
  @Post('/verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return await this.authService.verifyEmail(dto);
  }

  @UseGuards(ApiGuard)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBearerAuth('jwt')
  @Post('/resend-verification-email')
  async resendVerificationEmail(@Body() dto: ResendVerifyEmailDto) {
    return await this.authService.resendVerificationEmail(dto);
  }
}
