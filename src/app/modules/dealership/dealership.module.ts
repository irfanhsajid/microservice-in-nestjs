import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealership } from './entities/dealerships.entity';
import { DealershipDoc } from './entities/dealershipdoc.entity';
import { DealershipPaymentInfo } from './entities/dealership-payment-info.entity';
import { UserDealership } from './entities/user-dealership.entity';
import { DealershipPaymentInfoController } from './controllers/dealership.paymentinfo.controller';
import { DealershipPaymentInfoService } from './services/dealership.paymentinfo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dealership,
      DealershipDoc,
      DealershipPaymentInfo,
      UserDealership,
    ]),
  ],
  providers: [DealershipPaymentInfoService],
  exports: [],
  controllers: [DealershipPaymentInfoController],
})
export class DealershipModule {}
