import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerifyEmailDto } from '../dto/resend-verify-email.dto';

@ApiTags('Auth')
@Controller('api/v1')
export class VerifyEmailController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Verify email address' })
  @Post('/verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return await this.authService.verifyEmail(dto);
  }

  @Post('/resend-verification-email')
  async resendVerificationEmail(@Body() dto: ResendVerifyEmailDto) {
    return await this.authService.resendVerificationEmail(dto);
  }
}
