import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealership } from './entities/dealerships.entity';
import { DealershipDoc } from './entities/dealershipdoc.entity';
import { DealershipPaymentInfo } from './entities/dealership-payment-info.entity';
import { UserDealership } from './entities/user-dealership.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dealership,
      DealershipDoc,
      DealershipPaymentInfo,
      UserDealership,
    ]),
  ],
  providers: [],
  exports: [],
})
export class DealershipModule {}
