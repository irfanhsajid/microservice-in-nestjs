// src/app/modules/docs/guards/login-throttler.guard.ts
import { Injectable } from '@nestjs/common';
import { minutes, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, any>): Promise<string> {
    // Track by IP for login attempts (could be enhanced to track by username too)
    return Promise.resolve(req.ip);
  }

  // We override the handleRequest method to add custom behavior
  // This allows us to set special throttling limits just for login
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getThrottlerOptions() {
    return [
      {
        name: 'login',
        ttl: minutes(10), // 10 minute time window for login attempts
        limit: 5, // 5 attempts allowed
        blockDuration: minutes(1), // Block for 10 minutes after too many attempts
      },
    ];
  }
}
