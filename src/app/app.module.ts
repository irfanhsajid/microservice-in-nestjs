import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import database from '../config/database';
import app from '../config/app';
import services from 'src/config/services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { driver } from '../database/driver';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { MailModule } from './modules/mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, app, services],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: driver,
      inject: [ConfigService],
    }),
    // redis set up
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          password: configService.get<string>('redis.password'),
          url: configService.get<string>('redis.url'),
          db: configService.get<string>('redis.redisDb'),
          username: configService.get<string>('redis.username'),
        },
      }),
    }),
    AuthModule,
    PaymentModule,
    MailModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
