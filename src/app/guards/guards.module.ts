// src/guards/guards.module.ts
import { Module } from '@nestjs/common';
import { ApiGuard } from './api.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from '../modules/user/user.module';
import { DealershipModule } from '../modules/dealership/dealership.module';
import { EnsureEmailVerifiedGuard } from './ensure-email-verified.guard';
import { EnsureProfileCompletedGuard } from './ensure-profile-completed.guard';
import { CaslModule } from '../modules/auth/casl/casl.module';

@Module({
  imports: [JwtModule, ConfigModule, DealershipModule, UserModule, CaslModule],
  providers: [ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard],
  exports: [ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard],
})
export class GuardsModule {}
