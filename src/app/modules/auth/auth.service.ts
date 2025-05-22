import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async registerUser(dto: CreateUserDto) {
    // 1. Create user
    // 2. Send email otp by as email or sms
    // 3. Return success message
    try {
      const user = await this.userService.createUser(dto);
      return user;
    } catch (error) {
      return error;
    }
  }
}
