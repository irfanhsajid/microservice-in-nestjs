import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { ResetPasswordDto } from '../dto/password-reset.dto';
import { SetNewPasswordDto } from '../dto/set-new-password.dto';

@ApiTags('Auth')
@Controller('api/v1')
export class PasswordResetLinkController {
  @ApiOperation({ summary: 'Reset user password' })
  @Post('/send-reset-link')
  async passwordReset(@Body() dto: ResetPasswordDto) {

    //this.authService.
    throw new HttpException(
      '@TODO implemente the logic',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @ApiOperation({ summary: 'Set new password' })
  @Put('/reset-password')
  async setNewPassword(@Body() dto: SetNewPasswordDto) {
    throw new HttpException(
      '@TODO implemente the logic',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
