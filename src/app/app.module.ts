import { Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import services from 'src/config/services';
import { GrpcModule } from 'src/grpc/grpc.module';
import app from '../config/app';
import database from '../config/database';
import { driver } from '../database/driver';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from './modules/logger/logger.module';
import { MailModule } from './modules/mail/mail.module';
import { PaymentModule } from './modules/payment/payment.module';
import { UserModule } from './modules/user/user.module';

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
      useFactory: (configService: ConfigService) => {
        return {
          connection: {
            port: configService.get<number>('redis.port'),
            ...(configService.get<string>('redis.host')
              ? { host: configService.get<string>('redis.host') }
              : {}),
            ...(configService.get<string>('redis.username')
              ? { username: configService.get<string>('redis.username') }
              : {}),
            ...(configService.get<string>('redis.password')
              ? { password: configService.get<string>('redis.password') }
              : {}),
            ...(configService.get<string>('redis.url')
              ? { url: configService.get<string>('redis.url') }
              : {}),
            ...(configService.get<string>('redis.redisDb')
              ? { db: configService.get<string>('redis.redisDb') }
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
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
