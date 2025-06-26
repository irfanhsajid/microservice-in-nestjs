import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from 'src/grpc/types/auth/auth.pb';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { BlacklistTokenStorageProvider } from '../../../common/interfaces/blacklist-token-storeage-provider';
import { CustomLogger } from '../../logger/logger.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PasswordResetService } from '../../user/password-reset.service';
import { User } from '../../user/entities/user.entity';
import { throwCatchError } from '../../../common/utils/throw-error';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import { Repository } from 'typeorm';

export class Service {
  protected readonly logger = new CustomLogger(Service.name);

  constructor(
    @InjectQueue('auth')
    protected authQueue: Queue,

    protected readonly configService: ConfigService,

    protected readonly userService: UserService,

    @Inject('AUTH_PACKAGE')
    protected grpcClient: ClientGrpc,

    protected jwtService: JwtService,

    @Inject('BLACKLIST_TOKEN_STORAGE_PROVIDER')
    protected readonly blackListTokenStoreProvider: BlacklistTokenStorageProvider,

    protected readonly passwordResetService: PasswordResetService,
  ) {}

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
  protected parseExpiresInToSeconds(expiresIn: string): number {
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

  // create jwt token
  async createJwtToken(
    user: User,
  ): Promise<{ access_token: string; expired_at: Date }> {
    try {
      const token = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });
      const expiresIn =
        this.configService.get<string>('session.token_lifetime') || '7d';
      // Calculate expiration time
      const expiresInSeconds = this.parseExpiresInToSeconds(expiresIn);
      const expiredAt = new Date(Date.now() + expiresInSeconds * 1000);

      return {
        access_token: token,
        expired_at: expiredAt,
      };
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async validateOrOAuthUser(data: {
    email: string;
    name: string;
    avatar: string;
  }): Promise<any> {
    return await this.userService.createOrLoginOauthUser(data);
  }
}
