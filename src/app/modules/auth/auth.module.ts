import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { globSync } from 'glob';
import { CARVU_PACKAGE_NAME } from 'src/grpc/types/auth/auth.pb';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { AuthConsumer } from './auth.queue';
import { AuthService } from './auth.service';

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
  ],
  controllers: [],
  providers: [AuthService, AuthConsumer],
})
export class AuthModule {}
