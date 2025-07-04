import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';
import { TwilioSMSProvider } from './twilio.SMS.provider';
import { SMSProvider } from '../../common/interfaces/sms-provider';

@Module({
  imports: [ConfigModule],
  providers: [
    SmsService,
    TwilioSMSProvider,
    {
      provide: 'SMS_PROVIDER',
      useFactory: (
        configService: ConfigService,
        twilioSMSProvider: TwilioSMSProvider,
      ): SMSProvider => {
        const providerType = configService.get<string>(
          'sms.provider',
          'twilio',
        );
        if (providerType === 'twilio') {
          return twilioSMSProvider;
        }
        throw new Error(`Unsupported SMS provider: ${providerType}`);
      },
      inject: [ConfigService, TwilioSMSProvider],
    },
  ],
  exports: [SmsService],
})
export class SmsModule {}
