import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { AuthConsumer } from './auth.queue';

@Module({
  imports: [
    UserModule,
    BullModule.registerQueue({
      name: 'auth',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthConsumer],
})
export class AuthModule {}
