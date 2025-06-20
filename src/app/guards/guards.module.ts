// src/guards/guards.module.ts
import { Module } from '@nestjs/common';
import { ApiGuard } from './api.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from '../modules/user/user.module';
import { DealershipModule } from '../modules/dealership/dealership.module';
import { EnsureEmailVerifiedGuard } from './ensure-email-verified.guard';

@Module({
  imports: [JwtModule, ConfigModule, DealershipModule, UserModule],
  providers: [ApiGuard, EnsureEmailVerifiedGuard],
  exports: [ApiGuard, EnsureEmailVerifiedGuard],
})
export class GuardsModule {}
