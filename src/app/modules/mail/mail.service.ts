import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(to: string, name: string) {
    return await this.mailerService.sendMail({
      to,
      subject: 'Welcome!',
      template: 'welcome',
      context: { name },
    });
  }

  async sendVerificationEmail(to: string, name: string, url: string) {
    return await this.mailerService.sendMail({
      to,
      subject: 'Verification email',
      template: 'verify-email',
      context: {
        name,
        url,
      },
    });
  }

  async sendVerifycationSuccessEmail(to: string, name: string, url: string) {
    return await this.mailerService.sendMail({
      to,
      subject: 'Email verification success',
      template: 'verify-email-success',
      context: {
        name,
        url,
      },
    });
  }
}
