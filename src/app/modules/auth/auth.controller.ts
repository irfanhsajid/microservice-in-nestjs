import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('api/v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async credentioalLogin(@Body() dto: CreateUserDto) {
    return await this.authService.registerUser(dto);
  }
}
