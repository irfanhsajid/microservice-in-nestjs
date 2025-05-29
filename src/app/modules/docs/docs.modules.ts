import { Module } from '@nestjs/common';
import { LoginThrottlerGuard } from '../throttler/login-throttler.guard';
import { DocsAuthController } from './docs.controller';

@Module({
  controllers: [DocsAuthController],
  imports: [LoginThrottlerGuard],
})
export class DocsModule {}
