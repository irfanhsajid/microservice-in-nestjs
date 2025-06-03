import { Module } from '@nestjs/common';
import { AuthGrpcController } from './auth.grpc.controller';
import { AuthModule } from 'src/app/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AuthGrpcController],
  providers: [],
})
export class AuthGrpcModule {}
