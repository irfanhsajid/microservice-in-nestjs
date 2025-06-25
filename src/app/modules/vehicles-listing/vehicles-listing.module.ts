import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleVins } from './entities/vehicle-vins.entity';
import { VehicleAttachment } from './entities/vehicle-attachments.entity';
import { VehicleFeature } from './entities/vehicle-features.entity';
import { VehicleDimension } from './entities/vehicle-dimensions.entity';
import { VehicleInformation } from './entities/vehicle-informations.entity';
import { Vehicle } from './entities/vehicles.entity';
import { VehicleListingController } from './controllers/vehicle-listing.controller';
import { UserModule } from '../user/user.module';
import { VehicleVinsService } from './services/vehicle-vins.service';
import { VehicleService } from './services/vechicle.service';
import { VehicleController } from './controllers/vehicle.controller';

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
  ],
  controllers: [VehicleListingController, VehicleController],
  providers: [VehicleVinsService, VehicleService],
  exports: [],
})
export class VehiclesListingModule {}
