import { HttpException, Injectable } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { PasswordReset } from './entities/password-reset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { throwCatchError } from 'src/app/common/utils/throw-error';

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
      return throwCatchError(error);
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
      return throwCatchError(error);
    }
  }

  async verify(email: string, token: string): Promise<PasswordReset> {
    try {
      const record = await this.passwordResetRepository.findOne({
        where: { email, token, expires_at: MoreThan(new Date()) },
      });

      if (!record) {
        throw new HttpException(
          { message: 'Invalid token or expired token' },
          498,
        );
      }

      // Remove any existing token for the email
      await this.passwordResetRepository.delete({ email });

      return record;
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
