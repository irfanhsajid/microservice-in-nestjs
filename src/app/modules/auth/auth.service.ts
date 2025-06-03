import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from 'src/grpc/types/auth/auth.pb';
import { SigninDto } from '../user/dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { UserResource } from '../user/resource/user.resource';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectQueue('auth')
    private authQueue: Queue,

    private readonly configService: ConfigService,

    private readonly userService: UserService,

    @Inject('AUTH_PACKAGE')
    private grpcClient: ClientGrpc,

    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
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

  async signin(dto: SigninDto) {
    const user = await this.userService.validateUser(dto);
    if (!user) {
      throw new UnauthorizedException('Invalid user credentials');
    }
    // generate jwt token
    const token = await this.jwtService.signAsync({
      sub: user?.id,
      email: user.email,
    });

    const configService = this.configService;
    const expiresIn = configService.get<string>('jwt.expireIn') || '20s';

    // Calculate expiration time
    const expiresInSeconds = this.parseExpiresInToSeconds(expiresIn);
    const expiredAt = new Date(Date.now() + expiresInSeconds * 1000);

    return {
      access_token: token,
      expired_at: expiredAt,
      user: new UserResource(user),
    };
  }

  private parseExpiresInToSeconds(expiresIn: string): number {
    const timeUnits: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    return value * timeUnits[unit];
  }

  // GRPC test service
  getAuthorization(dto: { accessToken: string }) {
    const authService =
      this.grpcClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    return authService.requestAuthorization(dto);
  }
}
