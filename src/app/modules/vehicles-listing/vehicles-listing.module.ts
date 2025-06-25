import { Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { VehicleVins } from './entities/vehicle-vins.entity';
import { VehicleAttachment } from './entities/vehicle-attachments.entity';
import { VehicleFeature } from './entities/vehicle-features.entity';
import { VehicleDimension } from './entities/vehicle-dimensions.entity';
import { VehicleInformation } from './entities/vehicle-informations.entity';
import { Vehicle } from './entities/vehicles.entity';
import { VehicleListingController } from './controllers/vehicle-listing.controller';
import { UserModule } from '../user/user.module';
import { VehicleVinsService } from './services/vehicle-vins.service';
import { VehicleService } from './services/vehicle.service';
import { IsVehicleVinValid } from './dto/validator/is-vehicle-vin-valid.validator';
import { VehicleController } from './controllers/vehicle.controller';
import { Repository } from 'typeorm';
import { useContainer } from 'class-validator';

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
export class VehiclesListingModule {
  constructor(
    @InjectRepository(VehicleVins)
    private readonly vehicleVinsRepository: Repository<VehicleVins>,
  ) {}

  onModuleInit() {
    const validatorInstance = new IsVehicleVinValid(this.vehicleVinsRepository);

    useContainer(
      {
        get: (type: any) => {
          if (type === IsVehicleVinValid) {
            return validatorInstance;
          }
          throw new Error(`No provider for ${type}`);
        },
      },
      { fallbackOnErrors: true },
    );
  }
}
