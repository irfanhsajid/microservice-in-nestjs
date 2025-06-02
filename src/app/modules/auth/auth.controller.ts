import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomLogger } from '../logger/logger.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';

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
  async credentioalLogin(@Body() dto: CreateUserDto) {
    return await this.authService.registerUser(dto);
  }

  @ApiOperation({ summary: 'Test gRPC connection' })
  @Get('/test-grpc')
  testGrpc() {
    return this.authService.getAuthorization({ email: 'test@hudai.com' });
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
}
