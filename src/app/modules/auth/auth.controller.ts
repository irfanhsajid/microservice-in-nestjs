import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { AuthGuard } from '@nestjs/passport';

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

  @Get('/error')
  errorTest() {
    const t = 0;
    const sum = t / 0 + 'asdsadsad';
    console.info(sum);
    throw new HttpException(
      'Interal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @UseGuards(AuthGuard('local'))
  @Post('docs-login')
  login(@Request() req: any) {
    console.info('docs login ', req);
    req.session.user = {
      id: req.user.id,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
    };
    return req.user;
  }

  @Post('docs-logout')
  async logout(@Request() req: any, @Response({ passthrough: true }) res: any) {
    return new Promise((resolve, reject) => {
      // Destroy the session directly
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
          return reject(
            new UnauthorizedException('Session destruction failed'),
          );
        }
        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.redirect('/');
        resolve(null);
      });
    });
  }
}
