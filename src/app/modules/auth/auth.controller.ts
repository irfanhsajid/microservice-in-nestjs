import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomLogger } from '../logger/logger.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { SigninDto } from '../user/dto/signin.dto';

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
}
