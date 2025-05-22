import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import database from '../config/database';
import app from '../config/app';
import { TypeOrmModule } from '@nestjs/typeorm';
import { driver } from '../database/driver';
import { AuthModule } from './modules/auth/auth.module';
import { QueueModule } from './modules/queue/queue.module';
import { PaymentModule } from './modules/payment/payment.module';
import { MailModule } from './modules/mail/mail.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, app],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: driver,
      inject: [ConfigService],
    }),
    AuthModule,
    QueueModule,
    PaymentModule,
    MailModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
