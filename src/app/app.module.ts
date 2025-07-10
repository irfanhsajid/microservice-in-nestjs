import { Module } from '@nestjs/common';

import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import app from 'src/config/app';
import database from 'src/config/database';
import filesystems from 'src/config/filesystems';
import mail from 'src/config/mail';
import services from 'src/config/services';
import { GrpcModule } from 'src/grpc/grpc.module';
import { driver } from '../database/driver';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from './modules/logger/logger.module';
import { PaymentModule } from './modules/payment/payment.module';
// import { AppThrottlerModule } from './modules/throttler/throttler.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UserModule } from './modules/user/user.module';
import session from '../config/session';
import { DealershipModule } from './modules/dealership/dealership.module';
import { AppController } from './app.controller';
import { GuardsModule } from './guards/guards.module';
import oauth from 'src/config/oauth';
import { VehiclesListingModule } from './modules/vehicles-listing/vehicles-listing.module';
import { AbilityMiddleware } from './modules/auth/casl/ability.middleware';
import { CaslAbilityFactory } from './modules/auth/casl/casl-ability.factory';
import { RolesModule } from './modules/roles/roles.module';
import { IsUniqueConstraint } from './common/validation/is-unique-constraint';
import { AdminModule } from './modules/admin/admin.module';
import twilio from '../config/twilio';
import sms from '../config/sms';
import { SmsModule } from './modules/sms/sms.module';
import { IsExistsConstraint } from './common/validation/is-exists-constraint';
import { PdfGrpcModule } from 'src/grpc/pdf/pdf.grpc.module';
import { AuctionModule } from './modules/vehicle-auction/auction.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AuthModule,
    // AppThrottlerModule,
    ScheduleModule.forRoot(),
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
      load: [
        database,
        app,
        services,
        mail,
        filesystems,
        session,
        oauth,
        twilio,
        sms,
      ],
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
    DealershipModule,
    UserModule,
    AuthModule,
    PaymentModule,
    GrpcModule,
    LoggerModule,
    UploadsModule,
    GuardsModule,
    RolesModule,
    VehiclesListingModule,
    AdminModule,
    SmsModule,
    PdfGrpcModule,
    AuctionModule,
  ],
  controllers: [AppController],
  providers: [
    AbilityMiddleware,
    CaslAbilityFactory,
    IsUniqueConstraint,
    IsExistsConstraint,
  ],
})
export class AppModule {}
