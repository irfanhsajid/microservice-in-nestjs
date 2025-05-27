import { Body, Controller, Get, Post } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';

@Controller('api/v1')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}
  private readonly logger = new CustomLogger(AuthController.name);

  @Post('/register')
  async credentioalLogin(@Body() dto: CreateUserDto) {
    return await this.authService.registerUser(dto);
  }

  @Get('/test-grpc')
  testGrpc() {
    return this.authService.getAuthrization({ email: 'test@hudai.com' });
  }

  @Get('/test-logger')
  testLogger() {
    this.logger.log('test logger >>>>');
    this.logger.error('test logger error >>>>');
    this.logger.warn('test logger warn >>>>');
    this.logger.debug('test logger debug >>>>');
    this.logger.verbose('test logger verbose >>>>');
    return 'test logger response!';
  }

  @Get('/test-mail')
  async sendWelcomeEmail() {
    return await this.mailService.sendWelcomeEmail(
      'user@example.com',
      'Shariful',
    );
  }
}
