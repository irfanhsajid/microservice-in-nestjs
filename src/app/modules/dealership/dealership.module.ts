import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealership } from './entities/dealerships.entity';
import { DealershipDoc } from './entities/dealershipdoc.entity';
import { DealershipPaymentInfo } from './entities/dealership-payment-info.entity';
import { UserDealership } from './entities/user-dealership.entity';
import { DealershipPaymentInfoController } from './controllers/dealership.paymentinfo.controller';
import { DealershipPaymentInfoService } from './services/dealership.paymentinfo.service';
import { DealershipService } from './services/dealship.service';
import { DealershipController } from './controllers/dealership.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dealership,
      DealershipDoc,
      DealershipPaymentInfo,
      UserDealership,
    ]),
  ],
  providers: [DealershipPaymentInfoService, DealershipService],
  controllers: [DealershipPaymentInfoController, DealershipController],
  exports: [],
})
export class DealershipModule {}
