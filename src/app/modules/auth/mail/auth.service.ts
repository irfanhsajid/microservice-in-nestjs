import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthMailService {
  constructor(protected readonly mailerService: MailerService) {}

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

  async sendVerificationSuccessEmail(to: string, name: string, url: string) {
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

  async sendResetLink(to: string, name: string, url: string) {
    return await this.mailerService.sendMail({
      to,
      subject: 'Password Reset Link',
      template: 'password-reset-link',
      context: {
        name,
        url,
      },
    });
  }
}
