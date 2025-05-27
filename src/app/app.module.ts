import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import database from 'src/config/database';
import app from 'src/config/app';
import services from 'src/config/services';
import mail from 'src/config/mail';
import { TypeOrmModule } from '@nestjs/typeorm';
import { driver } from '../database/driver';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { MailModule } from './modules/mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { GrpcModule } from 'src/grpc/grpc.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: configService.get(
            `mail.mailers[${configService.get<string>('mail.default')}].transport`,
          ),
          defaults: {
            from: configService.get<string>('mail.from'),
          },
          template: configService.get('mail.template'),
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, app, services, mail],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: driver,
      inject: [ConfigService],
    }),
    // redis set up
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          connection: {
            port: configService.get<number>('services.redis.port'),
            ...(configService.get<string>('services.redis.host')
              ? { host: configService.get<string>('services.redis.host') }
              : {}),
            ...(configService.get<string>('services.redis.username')
              ? {
                  username: configService.get<string>(
                    'services.redis.username',
                  ),
                }
              : {}),
            ...(configService.get<string>('services.redis.password')
              ? {
                  password: configService.get<string>(
                    'services.redis.password',
                  ),
                }
              : {}),
            ...(configService.get<string>('services.redis.url')
              ? { url: configService.get<string>('services.redis.url') }
              : {}),
            ...(configService.get<string>('services.redis.redisDb')
              ? { db: configService.get<string>('services.redis.redisDb') }
              : {}),
          },
        };
      },
    }),
    AuthModule,
    PaymentModule,
    MailModule,
    UserModule,
    GrpcModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
