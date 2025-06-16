import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { BlacklistTokenStorageProvider } from 'src/app/common/interfaces/blacklist-token-storeage-provider';
import { PasswordResetService } from '../user/password-reset.service';
import { CustomLogger } from '../logger/logger.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { User } from '../user/entities/user.entity';
import { ResendVerifyEmailDto } from './dto/resend-verify-email.dto';

@Injectable()
export class AuthService {
  private readonly logger = new CustomLogger(AuthService.name);

  constructor(
    @InjectQueue('auth')
    private authQueue: Queue,

    private readonly configService: ConfigService,

    private readonly userService: UserService,

    @Inject('AUTH_PACKAGE')
    private grpcClient: ClientGrpc,

    private jwtService: JwtService,

    @Inject('BLACKLIST_TOKEN_STORAGE_PROVIDER')
    private readonly blackListTokenStoreProvider: BlacklistTokenStorageProvider,

    private readonly passwordResetService: PasswordResetService,
  ) {}

  // Register a new user
  async register(dto: CreateUserDto) {
    try {
      // 1. Create user
      const user = await this.userService.createUser(dto);

      // 2. Send verification email
      await this.sendVerificationEmail(user);
      return new UserResource(user);
    } catch (error) {
      return error;
    }
  }

  // send verification email
  private async sendVerificationEmail(user: User): Promise<void> {
    // 1. Generate email verification token
    const newVerifyEmailToken = await this.passwordResetService.create(
      user.email,
    );

    if (!newVerifyEmailToken) {
      this.logger.error('Error generating verify email token');
    }
    // 2. Send email otp by as email or sms
    await this.authQueue.add(
      'send-verification-email',
      {
        name: user.name,
        email: user.email,
        token: newVerifyEmailToken?.token,
      },
      { delay: 2000 },
    );
  }

  // User signin
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
    const expiresIn =
      configService.get<string>('session.token_lifetime') || '7d';

    // Calculate expiration time
    const expiresInSeconds = this.parseExpiresInToSeconds(expiresIn);
    const expiredAt = new Date(Date.now() + expiresInSeconds * 1000);

    return {
      access_token: token,
      expired_at: expiredAt,
      user: new UserResource(user),
    };
  }

  // Verify user email
  async verifyEmail(dto: VerifyEmailDto) {
    try {
      // 1. verify token by email and token
      const token = await this.passwordResetService.verify(
        dto.email,
        dto.token,
      );
      if (!token) {
        throw new Error('Token validation failed');
      }
      // Activate user account
      const user = await this.userService.updateEmailVerifyedAt(dto.email);

      if (!user) {
        throw new Error('Internal server error');
      }

      await this.authQueue.add(
        'send-verification-success',
        {
          name: user.name,
          email: user.email,
        },
        { delay: 2000 },
      );

      return {
        message: 'Your account activated successfully',
      };
    } catch (error) {
      return error;
    }
  }

  async resendVerificationEmail(dto: ResendVerifyEmailDto) {
    try {
      // 1. Find user by email
      const user = await this.userService.getUserByEmail(dto.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.sendVerificationEmail(user);
      return {
        message: 'Verification email send to: ' + dto.email,
      };
    } catch (error) {
      return error;
    }
  }

  // New function to validate JWT token
  async validateJwtToken(token: string): Promise<boolean> {
    try {
      // Verify the token using JwtService
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('app.key'),
      });
      this.logger.log('token payload', payload);
      // Validate payload structure
      if (!payload.sub || !payload.email) {
        return false;
      }

      return true;
    } catch (error) {
      // Handle specific JWT errors
      this.logger.error('error from token verification', error);
      return false;
    }
  }

  // Parse expiration time
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

  // Revoke user token
  async revokeToken(token: string, userId: number) {
    try {
      // Verify token before revoking
      const decoded = await this.jwtService.verifyAsync(token);
      const user = await this.userService.getById(userId);
      if (!user) {
        throw new UnauthorizedException('Invalid user');
      }
      const alreadBlackListed =
        await this.blackListTokenStoreProvider.isTokenBlacklisted(token);
      if (alreadBlackListed) {
        throw new UnauthorizedException('Invalid user');
      }
      await this.blackListTokenStoreProvider.storeToken(
        token,
        userId,
        new Date(decoded.exp * 1000),
      );
    } catch (error) {
      console.info(error);
      throw new UnauthorizedException('Invalid token or user');
    }
  }

  // Check is token is in blacklisted or not
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return await this.blackListTokenStoreProvider.isTokenBlacklisted(token);
  }
}
