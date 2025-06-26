import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VehicleVins,
      Vehicle,
      VehicleAttachment,
      VehicleFeature,
      VehicleDimension,
      VehicleInformation,
    ]),
    UserModule,
    UploadsModule,
    CaslModule,
  ],
  controllers: [
    VehicleVinController,
    VehicleController,
    VehicleAttachmentController,
    VehicleInformationController,
  ],
  providers: [
    VehicleVinsService,
    VehicleService,
    VehicleAttachmentService,
    IsVehicleVinValid,
    VehicleInformationService,
  ],
  exports: [],
})
export class VehiclesListingModule {}
