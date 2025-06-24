import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleVins } from './entities/vehicle-vins.entity';
import { VehicleAttachment } from './entities/vehicle-attachments.entity';
import { VehicleFeature } from './entities/vehicle-features.entity';
import { VehicleDimension } from './entities/vehicle-dimensions.entity';
import { VehicleInformation } from './entities/vehicle-informations.entity';
import { Vehicle } from './entities/vehicles.entity';

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
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class VehiclesListingModule {}
