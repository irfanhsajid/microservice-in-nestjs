import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { PasswordReset } from './entities/password-reset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PasswordResetService {
  private readonly logger = new CustomLogger(PasswordResetService.name);
  private tokenLifeTime = 5; // in munites

  constructor(
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,

    private readonly configService: ConfigService,
  ) {}

  async findByEmail(email: string): Promise<PasswordReset | null> {
    try {
      const passwordResetToken = await this.passwordResetRepository.findOne({
        where: {
          email: email,
        },
      });
      return passwordResetToken;
    } catch (error) {
      this.logger.error(error);
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          'Failed to create user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  async create(email: string): Promise<PasswordReset | null> {
    try {
      // Remove any existing token for the email
      await this.passwordResetRepository.delete({ email });

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.tokenLifeTime);

      const newToken = this.passwordResetRepository.create({
        email,
        token,
        expires_at: expiresAt,
      });

      return await this.passwordResetRepository.save(newToken);
    } catch (error) {
      this.logger.error(error);
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          'Failed to create user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }

  async verify(email: string, token: string): Promise<PasswordReset> {
    try {
      const record = await this.passwordResetRepository.findOne({
        where: { email, token },
      });

      if (!record) {
        throw new NotFoundException('Invalid token');
      }

      const now = new Date();
      if (record.expires_at < now) {
        await this.passwordResetRepository.delete({ id: record.id });
        throw new HttpException('Invalid token', 498);
      }

      return record;
    } catch (error) {
      this.logger.error(error);
      if (!(error instanceof HttpException)) {
        throw new HttpException(
          'Failed to create user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }
}
