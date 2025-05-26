import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { AuthConsumer } from './auth.queue';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { globSync } from 'glob';
import { CARVU_PACKAGE_NAME } from 'src/grpc/types/auth.pb';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
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
            protoPath: globSync('src/grpc/proto/*.proto'),
            url: `${configService.get<string>('grpc.host')}:${configService.get<number>('grpc.port')}`,
          },
        }),
      },
    ]),
    BullModule.registerQueue({
      name: 'auth',
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthConsumer],
})
export class AuthModule {}
