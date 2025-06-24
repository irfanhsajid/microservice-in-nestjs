import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { Repository } from 'typeorm';
import { VehicleVins } from '../entities/vehicle-vins.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVehicleVinsDto } from '../dto/vehicle-vins.dto';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { Request } from 'express';
import { User } from '../../user/entities/user.entity';
import { Dealership } from '../../dealership/entities/dealerships.entity';

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
      const defaultDealership = req['user_default_dealership'] as Dealership;
      this.logger.log(user);
      console.log('default dealership', defaultDealership);
      const newCarVin = this.vehicleVinsRepository.create({
        user_id: user?.id,
        dealership_id: defaultDealership?.id,
        ...dto,
      });

      return await this.vehicleVinsRepository.save(newCarVin);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async show(req: Request): Promise<VehicleVins[]> {
    try {
      const user = req['user'] as User;
      const defaultDealership = req['user_default_dealership'] as Dealership;
      return await this.vehicleVinsRepository.find({
        where: { user_id: user.id, dealership_id: defaultDealership.id },
      });
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
