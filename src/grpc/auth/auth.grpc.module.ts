import { Module } from '@nestjs/common';
import { AuthGrpcController } from './auth.grpc.controller';

@Module({
  controllers: [AuthGrpcController],
  providers: [],
})
export class AuthGrpcModule {}
