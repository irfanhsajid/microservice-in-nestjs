import { Module } from '@nestjs/common';
import { AdminDealershipModule } from './dealership/dealership.module';
import { AbilityGuard } from '../auth/casl/ability.guard';
import { AdminUserModule } from './user/user.module';

@Module({
  imports: [AdminDealershipModule, AdminUserModule],
  providers: [AbilityGuard],
})
export class AdminModule {}
