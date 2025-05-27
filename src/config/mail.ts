import * as process from 'node:process';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

interface Transport {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface Template {
  dir: string;
  adapter: any;
  options: any;
}

interface ConfigType {
  mail: {
    default: string;
    from: string;
    mailers: {
      smtp: {
        transport: Transport;
      };
      mailgun?: {
        transport: Transport;
      };
    };
    template: Template;
  };
}

export default () =>
  ({
    mail: {
      default: process.env.MAIL_MAILER || 'smtp',
      from: process.env.MAIL_FROM_ADDRESS || 'hello@example.com',
      mailers: {
        smtp: {
          transport: {
            host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
            port: Number(process.env.MAIL_PORT) || 2525,
            secure: process.env.MAIL_SECURE != 'false',
            auth: {
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD,
            },
          },
        },
      },
      template: {
        dir: join(__dirname, '../app/modules/mail/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    },
  }) as ConfigType;
