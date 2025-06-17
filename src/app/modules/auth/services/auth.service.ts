import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { SigninDto } from '../../user/dto/signin.dto';
import { UserResource } from '../../user/resource/user.resource';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { User } from '../../user/entities/user.entity';
import { ResendVerifyEmailDto } from '../dto/resend-verify-email.dto';
import { AuthInterface } from './auth.base.interface';
import { Service } from './service';

@Injectable()
export class AuthService extends Service implements AuthInterface {
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

  async login(dto: SigninDto) {
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

  async sendVerificationEmail(user: User): Promise<void> {
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
}
