import { Module } from '@nestjs/common';
import { AdminDealershipModule } from './dealership/dealership.module';
import { AbilityGuard } from '../auth/casl/ability.guard';

@Module({
  imports: [AdminDealershipModule],
  providers: [AbilityGuard],
})
export class AdminModule {}
