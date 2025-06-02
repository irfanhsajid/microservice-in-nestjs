import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from 'src/grpc/types/auth/auth.pb';

@Injectable()
export class AuthService {
  constructor(
    @InjectQueue('auth')
    private authQueue: Queue,

    private readonly userService: UserService,

    @Inject('AUTH_PACKAGE')
    private grpcClient: ClientGrpc,
  ) {}

  async registerUser(dto: CreateUserDto) {
    // 1. Create user
    // 2. Send email otp by as email or sms
    // 3. Return success message
    try {
      const user = await this.userService.createUser(dto);
      console.info('task added to queue');
      await this.authQueue.add(
        'send-otp',
        { name: user.first_name, email: user.email },
        { delay: 2000 },
      );
      return user;
    } catch (error) {
      return error;
    }
  }

  getAuthorization(dto: { email: string }) {
    const authService =
      this.grpcClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    return authService.requestAuthorization(dto);
  }
}
