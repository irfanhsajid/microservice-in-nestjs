import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { AuthService } from '../services/auth.service';
import { responseReturn } from 'src/app/common/utils/response-return';
import { throwCatchError } from 'src/app/common/utils/throw-error';

@ApiTags('Auth')
@Controller('api/v1')
export class RegisteredController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @Post('/register')
  async registerUser(@Body() dto: CreateUserDto) {
    try {
      const res = await this.authService.register(dto);
      return responseReturn('User register successfully', res);
    } catch (error) {
      throwCatchError(error);
    }
  }
}
