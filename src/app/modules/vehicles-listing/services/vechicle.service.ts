import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { Repository } from 'typeorm';
import { VehicleDimension } from '../entities/vehicle-dimensions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleFeature } from '../entities/vehicle-features.entity';
import { VehicleInformation } from '../entities/vehicle-informations.entity';
import { Vehicle } from '../entities/vehicles.entity';

@Injectable()
export class VehicleService {
  private readonly logger = new CustomLogger(VehicleService.name);

  constructor(
    @InjectRepository(VehicleDimension)
    private readonly vehicleDimensionRepository: Repository<VehicleDimension>,

    @InjectRepository(VehicleFeature)
    private readonly vehicleFeatureRepository: Repository<VehicleFeature>,

    @InjectRepository(VehicleInformation)
    private readonly vehicleInformationRepository: Repository<VehicleInformation>,

    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}
}
