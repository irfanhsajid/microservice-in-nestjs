import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealership } from './entities/dealerships.entity';
import { DealershipPaymentInfo } from './entities/dealership-payment-info.entity';
import { UserDealership } from './entities/user-dealership.entity';
import { DealershipPaymentInfoController } from './controllers/dealership.paymentinfo.controller';
import { DealershipPaymentInfoService } from './services/dealership.paymentinfo.service';
import { DealershipInformationService } from './services/dealship.inforation.service';
import { DealershipInformationController } from './controllers/dealership.information.controller';
import { UserModule } from '../user/user.module';
import { AttachmentModule } from '../attachment/attachment.module';
import { DealershipAddress } from './entities/dealership-address.entity';
import { DealershipAttachment } from './entities/dealership-attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dealership,
      DealershipPaymentInfo,
      UserDealership,
      DealershipAddress,
      DealershipAttachment,
    ]),
    UserModule,
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
