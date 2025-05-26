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
}
