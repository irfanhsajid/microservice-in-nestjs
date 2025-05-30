import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { AuthConsumer } from './auth.queue';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { globSync } from 'glob';
import { CARVU_PACKAGE_NAME } from 'src/grpc/types/auth/auth.pb';
import { MailModule } from '../mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthStrategyService } from './auth.local-strategy';
import { ConfigService } from '@nestjs/config';
import { Session } from './entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    UserModule,
    // Grpc client
    ClientsModule.registerAsync([
      {
        name: 'AUTH_PACKAGE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: CARVU_PACKAGE_NAME,
            protoPath: globSync('src/grpc/proto/carvu_proto/**/*.proto', {
              absolute: true,
            }),
            url: `${configService.get<string>('services.grpc.host')}:${configService.get<number>('services.grpc.port')}`,
          },
        }),
      },
    ]),
    BullModule.registerQueue({
      name: 'auth',
    }),
    MailModule,
    PassportModule.register({ session: true }),
    // SessionModule.forRootAsync({
    //   imports: [ConfigModule, TypeOrmModule.forFeature([Session])],
    //   inject: [ConfigService, 'SessionRepository'],
    //   useFactory: (
    //     configService: ConfigService,
    //     sessionRepository: Repository<Session>,
    //   ) => {
    //     const TypeormStore = connectTypeorm.TypeormStore;
    //     return {
    //       session: {
    //         secret: configService.get('SESSION_SECRET', 'your-secret-key'),
    //         resave: false,
    //         saveUninitialized: true,
    //         store: new TypeormStore({
    //           cleanupLimit: 2,
    //           ttl: 86400, // 24 hours
    //         }).connect(sessionRepository),
    //         cookie: {
    //           maxAge: 24 * 60 * 60 * 1000, // 24 hours
    //           httpOnly: true,
    //           secure: configService.get('NODE_ENV') === 'production',
    //         },
    //       },
    //     };
    //   },
    // }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthConsumer, LocalAuthStrategyService],
})
export class AuthModule {}
