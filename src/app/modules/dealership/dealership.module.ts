import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealership } from './entities/dealerships.entity';
import { DealershipPaymentInfo } from './entities/dealership-payment-info.entity';
import { UserDealership } from './entities/user-dealership.entity';
import { DealershipPaymentInfoController } from './controllers/dealership.paymentinfo.controller';
import { DealershipPaymentInfoService } from './services/dealership.paymentinfo.service';
import { DealershipInformationService } from './services/dealership.information.service';
import { DealershipInformationController } from './controllers/dealership.information.controller';
import { DealershipAddress } from './entities/dealership-address.entity';
import { DealershipAttachment } from './entities/dealership-attachment.entity';
import { DealershipAttachmentController } from './controllers/dealership.attachment.controller';
import { DealershipAttachmentService } from './services/dealership-attachment.service';
import { UploadsModule } from '../uploads/uploads.module';
import { UserModule } from '../user/user.module';

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
    UploadsModule,
  ],
  providers: [
    DealershipPaymentInfoService,
    DealershipInformationService,
    DealershipAttachmentService,
  ],
  controllers: [
    DealershipPaymentInfoController,
    DealershipInformationController,
    DealershipAttachmentController,
  ],
  exports: [DealershipInformationService],
})
export class DealershipModule {}
