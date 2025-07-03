import { Injectable } from '@nestjs/common';
import { SMSProvider } from '../../common/interfaces/sms-provider';
import { CustomLogger } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioSMSProvider extends SMSProvider {
  private readonly logger = new CustomLogger(TwilioSMSProvider.name);
  private readonly client: Twilio.Twilio;
  private readonly defaultFrom: string;

  constructor(configService: ConfigService) {
    super();
    const accountSid = configService.get<string>('twilio.account_sid') || null;
    const authToken =
      configService.get<string>('twilio.account_auth_token') || null;
    this.defaultFrom = configService.get<string>('twilio.default_from') || '';

    if (!accountSid || !authToken) {
      this.logger.error('Twilio credentials are missing');
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
    }

    this.client = Twilio(accountSid, authToken);
    this.logger.log('TwilioSMSProvider initialized');
  }

  async send(): Promise<void> {
    try {
      if (!this.receiver || !this.body) {
        this.logger.error('Receiver and message body must be set');
        throw new Error('Receiver and message body are required');
      }

      const to = Array.isArray(this.receiver) ? this.receiver : [this.receiver];
      const mediaUrl = Array.isArray(this.mediaUrl)
        ? this.mediaUrl
        : this.mediaUrl
          ? [this.mediaUrl]
          : undefined;

      for (const recipient of to) {
        this.logger.log(
          `Sending SMS to ${recipient} with message: ${this.body}` +
            (mediaUrl ? `, media: ${mediaUrl.join(', ')}` : '') +
            (this.from
              ? `, from: ${this.from}`
              : `, from: ${this.defaultFrom}`) +
            (this.statusCallback
              ? `, statusCallback: ${this.statusCallback}`
              : ''),
        );

        await this.client.messages.create({
          to: recipient,
          from: this.from || this.defaultFrom,
          body: this.body,
          mediaUrl,
          statusCallback: this.statusCallback || undefined,
        });
      }

      this.logger.log('SMS sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      throw error;
    }
  }
}