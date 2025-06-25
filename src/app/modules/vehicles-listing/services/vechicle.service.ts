import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { Repository } from 'typeorm';
import { VehicleDimension } from '../entities/vehicle-dimensions.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VehicleService {
  private readonly logger = new CustomLogger(VehicleService.name);

  constructor(
    @InjectRepository(VehicleDimension)
    private readonly vehicleDemensionRepository: Repository<VehicleDimension>,
  ) {}
}
