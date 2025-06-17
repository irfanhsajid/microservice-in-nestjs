import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuthMailService } from '../mail/auth.service';
import { CustomLogger } from '../../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Processor('auth')
export class AuthConsumer extends WorkerHost {
  private readonly logger = new CustomLogger(AuthConsumer.name);

  constructor(
    private readonly mailService: AuthMailService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-verification-email': {
        const email = job.data?.email;
        const token = job.data?.token;
        if (!email || !token) {
          this.logger.error(
            'Error sending verification email: email or token is missing',
          );
          return;
        }
        const url =
          this.configService.get<string>('app.web_url') +
          '/verify-email?token=' +
          job.data.token +
          '&email=' +
          email;

        await this.mailService.sendVerificationEmail(
          email,
          job.data?.name || '',
          url,
        );
        this.logger.log('Success: Email verification send to: ' + email);
        return;
      }

      case 'send-reset-link': {
        const email = job.data?.email;
        const token = job.data?.token;
        if (!email || !token) {
          this.logger.error(
            'Error sending verification email: email or token is missing',
          );
          return;
        }
        const url =
          this.configService.get<string>('app.web_url') +
          '/password-reset?token=' +
          job.data.token +
          '&email=' +
          email;

        await this.mailService.sendResetLink(email, job.data?.name || '', url);
        this.logger.log('Success: Email verification send to: ' + email);
        return;
      }

      case 'send-verification-success': {
        const email = job.data?.email;
        const token = job.data?.token;
        if (!email || !token) {
          this.logger.error(
            'Error sending verification success email: email or token is missing',
          );
          return;
        }
        const url =
          this.configService.get<string>('app.web_url') +
          '/verify-email-success';

        await this.mailService.sendVerificationSuccessEmail(
          email,
          job.data?.name || '',
          url,
        );
        this.logger.log('Success: Email verification send to: ' + email);
        return;
      }
    }
  }
}
