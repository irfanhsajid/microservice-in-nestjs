import { Inject, Injectable } from '@nestjs/common';
import { CustomLogger } from '../logger/logger.service';
import { ISmsProvider } from '../../common/interfaces/sms-provider';

@Injectable()
export class SmsService {
  private readonly logger = new CustomLogger(SmsService.name);

  constructor(@Inject('SMS_PROVIDER') protected smsProvider: ISmsProvider) {}

  async sendSms(
    to: string | string[],
    message: string,
    from?: string,
    mediaUrl?: string | string[],
    statusCallback?: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Preparing to send SMS t0 ${to.toString()} with message: ${message}`,
      );
      await this.smsProvider
        .to(to)
        .message(message)
        .setMedia(mediaUrl || [])
        .setFrom(from || '')
        .setStatusCallback(statusCallback || '')
        .send();
      this.logger.log('SMS sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      throw error;
    }
  }
}
