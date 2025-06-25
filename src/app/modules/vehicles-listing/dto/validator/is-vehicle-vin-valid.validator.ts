import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleVins } from '../../entities/vehicle-vins.entity';
import { CustomLogger } from 'src/app/modules/logger/logger.service';

@ValidatorConstraint({ name: 'IsVehicleVinExists', async: true })
@Injectable()
export class IsVehicleVinValid implements ValidatorConstraintInterface {
  private readonly logger = new CustomLogger(IsVehicleVinValid.name);
  constructor(
    @InjectRepository(VehicleVins)
    private readonly vehicleVinsRepository: Repository<VehicleVins>,
  ) {}

  async validate(vehicle_vin_id: number, args: ValidationArguments) {
    try {
      this.logger.log(args);
      const vehicleVin = await this.vehicleVinsRepository.findOne({
        where: { id: vehicle_vin_id },
        relations: ['vehicle'],
      });

      return !!vehicleVin && !!vehicleVin.vehicle;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Vehicle VIN ID ${args.value} does not exist or has no associated vehicle.`;
  }
}
