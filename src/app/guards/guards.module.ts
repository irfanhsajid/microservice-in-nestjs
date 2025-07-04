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
import { EnsureHasDealershipGuard } from './ensure-has-dealership.guard';
import { AuthOriginGuard } from './check-origin.guard';
import { EnsureTokenIsValidGuard } from './ensure-token-valid.guard';
import { VehiclesListingModule } from '../modules/vehicles-listing/vehicles-listing.module';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    DealershipModule,
    UserModule,
    CaslModule,
    VehiclesListingModule,
  ],
  providers: [
    ApiGuard,
    EnsureEmailVerifiedGuard,
    EnsureProfileCompletedGuard,
    EnsureHasDealershipGuard,
    AuthOriginGuard,
    EnsureTokenIsValidGuard,
  ],
  exports: [
    ApiGuard,
    EnsureEmailVerifiedGuard,
    EnsureProfileCompletedGuard,
    EnsureHasDealershipGuard,
    AuthOriginGuard,
    EnsureTokenIsValidGuard,
  ],
})
export class GuardsModule {}
