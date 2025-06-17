import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Put } from '@nestjs/common';
import { ResetPasswordDto } from '../dto/password-reset.dto';
import { NewPasswordDto } from '../dto/new-password.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('api/v1')
export class PasswordResetLinkController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Reset user password' })
  @Post('/send-reset-link')
  async sendResetLink(@Body() dto: ResetPasswordDto) {
    return this.authService.sendResetLink(dto);
  }

  @ApiOperation({ summary: 'Set new password' })
  @Put('/reset-password')
  async store(@Body() dto: NewPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
