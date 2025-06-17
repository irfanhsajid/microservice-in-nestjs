import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { globSync } from 'glob';
import { CARVU_PACKAGE_NAME } from 'src/grpc/types/auth/auth.pb';
import { MailModule } from '../mail/mail.module';
import { AuthConsumer } from './auth.queue';
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthenticatedController } from './controllers/auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { PassportModule } from '@nestjs/passport';
import { DocsController } from './controllers/docs-auth.controller';
import { DocsLocalAuthStrategyService } from './docs-auth.strategy';
import { JwtAuthStrategyService } from './jwt-auth.strategy';
import { RedisModule } from '@nestjs-modules/ioredis';
import { BlacklistTokenStorageProvider } from 'src/app/common/interfaces/blacklist-token-storeage-provider';
import { TypeOrmBlacklistTokenStorageProvider } from './typeorm-blacklist-token-store.provider';
import { RedisBlacklistTokenStorageProvider } from './redis-blacklist-token-store.provider';
import { BlacklistTokenStore } from './entities/blacklist-token-store.entity';
import { RegisteredController } from './controllers/auth.registered.controller';
import { VerifyEmailController } from './controllers/auth.verifyemail.controller';
import { PasswordResetLinkController } from './controllers/auth.passwordresetlink.controller';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    UserModule,
    TypeOrmModule.forFeature([Session, BlacklistTokenStore]),
    PassportModule.register({ session: true }),
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
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('app.key'),
          signOptions: {
            expiresIn: configService.get<string>('session.token_lifetime'),
            algorithm: 'HS256',
          },
        };
      },
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: `redis://${configService.get<string>('services.redis.host')}:${configService.get('services.redis.port')}`,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthenticatedController,
    DocsController,
    RegisteredController,
    VerifyEmailController,
    PasswordResetLinkController,
  ],
  providers: [
    AuthService,
    AuthConsumer,
    DocsLocalAuthStrategyService,
    JwtAuthStrategyService,
    TypeOrmBlacklistTokenStorageProvider,
    RedisBlacklistTokenStorageProvider,
    {
      provide: 'BLACKLIST_TOKEN_STORAGE_PROVIDER',
      useFactory: (
        configService: ConfigService,
        typeOrmProvider: TypeOrmBlacklistTokenStorageProvider,
        redisProvider: RedisBlacklistTokenStorageProvider,
      ): BlacklistTokenStorageProvider => {
        const storageType = configService.get<string>(
          'session.blacklist_driver',
          'postgres',
        );
        if (storageType === 'redis') {
          return redisProvider;
        }
        return typeOrmProvider;
      },
      inject: [
        ConfigService,
        TypeOrmBlacklistTokenStorageProvider,
        RedisBlacklistTokenStorageProvider,
      ],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
