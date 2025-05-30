import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoginThrottlerGuard } from '../throttler/login-throttler.guard';
import { DocsAuthController } from './docs.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'login',
          ttl: 600000, // 10 minutes in milliseconds
          limit: 5,
        },
      ],
    }),
  ],
  controllers: [DocsAuthController],
  providers: [LoginThrottlerGuard],
})
export class DocsModule {}
