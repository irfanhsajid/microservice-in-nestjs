import { Module } from '@nestjs/common';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
import { VehicleVins } from './entities/vehicle-vins.entity';
import { VehicleAttachment } from './entities/vehicle-attachments.entity';
import { VehicleFeature } from './entities/vehicle-features.entity';
import { VehicleDimension } from './entities/vehicle-dimensions.entity';
import { VehicleInformation } from './entities/vehicle-informations.entity';
import { Vehicle } from './entities/vehicles.entity';
import { VehicleVinController } from './controllers/vehicle-vin.controller';
import { UserModule } from '../user/user.module';
import { VehicleVinsService } from './services/vehicle-vins.service';
import { VehicleService } from './services/vehicle.service';
import { IsVehicleVinValid } from './dto/validator/is-vehicle-vin-valid.validator';
import { VehicleController } from './controllers/vehicle.controller';
import { VehicleAttachmentController } from './controllers/vehicle-attachment.controller';
import { UploadsModule } from '../uploads/uploads.module';
import { VehicleAttachmentService } from './services/vehicle-attachment.service';
import { CaslModule } from '../auth/casl/casl.module';
import { VehicleInformationService } from './services/vehicle-information.service';
import { VehicleInformationController } from './controllers/vehicle-information.controller';
import { DataSource } from 'typeorm';
import { FileUploaderService } from '../uploads/file-uploader.service';
import { VehicleAttachmentSubscriber } from './subscriber/vehicle.attachment.subscriber';
import { VehicleInspectionSubscriber } from './subscriber/vehicle-inspection.subscriber';
import { VehicleInspectionReport } from './entities/vehicle-inspection-report.entity';
import { VehicleInspection } from './entities/vehicle-inspection.entity';
import { VehicleInspectionService } from './services/vehicle-inspection.service';
import { VehicleInspectionController } from './controllers/vehicle-inspection.controller';
import { VehicleFaxReport } from './entities/vehicle-fax-report.entity';
import { VehicleFaxReportController } from './controllers/vehicle-fax-report.controller';
import { VehicleFaxReportSubscriber } from './subscriber/vehicle-fax.subscriber';
import { VehicleFaxReportService } from './services/vehicle-fax-report.service';
import { BullModule } from '@nestjs/bullmq';
import { VehicleConsumer } from './job/vehicle.queue';
import { VehicleInspectionLinkController } from './controllers/vehicle-inspection-link.controller';
import { VehicleInspectionLink } from './entities/vehicle-inspection-links.entity';
import { VehicleInspectionLinkService } from './services/vehicle-inspection-link.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VehicleVins,
      Vehicle,
      VehicleAttachment,
      VehicleFeature,
      VehicleDimension,
      VehicleInformation,
      VehicleInspectionReport,
      VehicleInspection,
      VehicleFaxReport,
      VehicleInspectionLink,
    ]),
    UserModule,
    UploadsModule,
    CaslModule,
    BullModule.registerQueue({
      name: 'vehicle-consumer',
    }),
  ],
  controllers: [
    VehicleVinController,
    VehicleController,
    VehicleAttachmentController,
    VehicleInformationController,
    VehicleInspectionController,
    VehicleFaxReportController,
    VehicleInspectionLinkController,
  ],
  providers: [
    VehicleConsumer,
    VehicleAttachmentSubscriber,
    VehicleInspectionSubscriber,
    VehicleVinsService,
    VehicleService,
    VehicleAttachmentService,
    IsVehicleVinValid,
    VehicleInformationService,
    VehicleInspectionService,
    VehicleFaxReportService,
    VehicleInspectionLinkService,
  ],
  exports: [],
})
export class VehiclesListingModule {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly fileUploaderService: FileUploaderService,
  ) {}

  onModuleInit() {
    const subscriber = new VehicleAttachmentSubscriber(
      this.fileUploaderService,
    );
    const vehicleInspection = new VehicleInspectionSubscriber(
      this.fileUploaderService,
    );
    const vehicleFax = new VehicleFaxReportSubscriber(this.fileUploaderService);
    this.dataSource.subscribers.push(subscriber);
    this.dataSource.subscribers.push(vehicleInspection);
    this.dataSource.subscribers.push(vehicleFax);
  }
}
