import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { Repository } from 'typeorm';
import { VehicleVins, VehicleVinStatus } from '../entities/vehicle-vins.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVehicleVinsDto } from '../dto/vehicle-vins.dto';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { Request } from 'express';
import { User } from '../../user/entities/user.entity';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';

@Injectable()
export class VehicleVinsService {
  private readonly logger = new CustomLogger(VehicleVinsService.name);
  constructor(
    @InjectRepository(VehicleVins)
    private readonly vehicleVinsRepository: Repository<VehicleVins>,
  ) {}

  async create(req: Request, dto: CreateVehicleVinsDto): Promise<VehicleVins> {
    try {
      const user = req['user'] as User;
      const defaultDealership = req[
        'user_default_dealership'
      ] as UserDealership;

      // find vin number if exist
      let vehicleVin = await this.vehicleVinsRepository.findOne({
        where: {
          user_id: user.id,
          dealership_id: defaultDealership.dealership_id,
          vin_number: dto.vin_number,
        },
      });

      if (vehicleVin) {
        vehicleVin = this.vehicleVinsRepository.merge(vehicleVin, dto);
      } else {
        vehicleVin = this.vehicleVinsRepository.create({
          user_id: user?.id,
          dealership_id: defaultDealership?.dealership_id,
          ...dto,
          status: VehicleVinStatus.DRAFT,
        });
      }

      return await this.vehicleVinsRepository.save(vehicleVin);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async show(req: Request, id: number): Promise<VehicleVins | null> {
    try {
      const user = req['user'] as User;
      const defaultDealership = req[
        'user_default_dealership'
      ] as UserDealership;
      return await this.vehicleVinsRepository.findOne({
        where: {
          user_id: user.id,
          dealership_id: defaultDealership.dealership_id,
          id: id,
        },
      });
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
