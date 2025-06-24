import { Module } from '@nestjs/common';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
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
import { DealershipAttachmentSubscriber } from './subscriber/dealership.attachment.subscriber';
import { DataSource } from 'typeorm';
import { FileUploaderService } from '../uploads/file-uploader.service';

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
    DealershipAttachmentSubscriber,
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
export class DealershipModule {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly fileUploaderService: FileUploaderService,
  ) {}

  onModuleInit() {
    const subscriber = new DealershipAttachmentSubscriber(
      this.fileUploaderService,
    );
    this.dataSource.subscribers.push(subscriber);
  }
}
