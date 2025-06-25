import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Repository } from 'typeorm';
import { VehicleVins } from '../../entities/vehicle-vins.entity';
import { CustomLogger } from 'src/app/modules/logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';

@ValidatorConstraint({ name: 'isVehicleVinValid', async: true })
export class IsVehicleVinValid implements ValidatorConstraintInterface {
  private readonly logger = new CustomLogger(IsVehicleVinValid.name);
  constructor(
    @InjectRepository(VehicleVins)
    private readonly vehicleVinsRepository: Repository<VehicleVins>,
  ) {}

  async validate(vehicle_vin_id: number) {
    try {
      const vehicleVin = await this.vehicleVinsRepository.findOne({
        where: { id: vehicle_vin_id },
        relations: ['vehicle'],
      });

      return !!vehicleVin && !vehicleVin.vehicle;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Vehicle VIN ID ${args.value} does not exist or has no associated vehicle.`;
  }
}
