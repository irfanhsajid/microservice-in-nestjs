import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealership } from './entities/dealerships.entity';
import { DealershipDoc } from './entities/dealershipdoc.entity';
import { DealershipPaymentInfo } from './entities/dealership-payment-info.entity';
import { UserDealership } from './entities/user-dealership.entity';
import { DealershipPaymentInfoController } from './controllers/dealership.paymentinfo.controller';
import { DealershipPaymentInfoService } from './services/dealership.paymentinfo.service';
import { DealershipInformationService } from './services/dealship.inforation.service';
import { DealershipInformationController } from './controllers/dealership.information.controller';
import { UserModule } from '../user/user.module';
import { AddressModule } from '../address/address.module';
import { AttachmentModule } from '../attachment/attachment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dealership,
      DealershipDoc,
      DealershipPaymentInfo,
      UserDealership,
    ]),
    UserModule,
    AddressModule,
    AttachmentModule,
  ],
  providers: [DealershipPaymentInfoService, DealershipInformationService],
  controllers: [
    DealershipPaymentInfoController,
    DealershipInformationController,
  ],
  exports: [],
})
export class DealershipModule {}
