import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { PasswordReset } from './entities/password-reset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

@Injectable()
export class PasswordResetService {
  private readonly logger = new CustomLogger(PasswordResetService.name);

  constructor(
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,
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
      return null;
    }
  }

  async create(email: string): Promise<PasswordReset | null> {
    try {
      // Remove any existing token for the email
      await this.passwordResetRepository.delete({ email });

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      const newToken = this.passwordResetRepository.create({
        email,
        token,
        expires_at: expiresAt,
      });

      return await this.passwordResetRepository.save(newToken);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async verify(email: string, token: string): Promise<PasswordReset | null> {
    try {
      const record = await this.passwordResetRepository.findOne({
        where: { email, token },
      });

      if (!record) {
        return null;
      }

      const now = new Date();
      if (record.expires_at < now) {
        await this.passwordResetRepository.delete({ id: record.id });
        return null;
      }

      return record;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
