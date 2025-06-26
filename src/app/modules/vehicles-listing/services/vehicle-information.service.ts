import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceInterface } from '../../../common/interfaces/service.interface';
import { VehicleInformation } from '../entities/vehicle-informations.entity';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { User } from '../../user/entities/user.entity';
import { VehicleIndexDto } from '../dto/vehicle-index.dto';
import { CreateVehicleInformationDto } from '../dto/vehicle-information.dto';
import { VehicleVins, VehicleVinStatus } from '../entities/vehicle-vins.entity';
import { Vehicle } from '../entities/vehicles.entity';

@Injectable()
export class VehicleInformationService implements ServiceInterface {
  private readonly logger = new CustomLogger(VehicleInformationService.name);

  constructor(
    @InjectRepository(VehicleInformation)
    private readonly vehicleInformationRepository: Repository<VehicleInformation>,
  ) {}

  index(req: Request, params: VehicleIndexDto): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }

  async store(
    req: Request,
    data: { id: number; dto: CreateVehicleInformationDto },
  ): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleInformationRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = req['user'] as User;
      const defaultUserDealership = req[
        'user_default_dealership'
      ] as UserDealership;

      // check vin number exist
      let vehicleVin = await queryRunner.manager.findOne(VehicleVins, {
        where: {
          user_id: user.id,
          dealership_id: defaultUserDealership.dealership_id,
          id: data.id,
        },
      });
      if (!vehicleVin) {
        throw new BadRequestException('Error: Invalid vehicle vin id provided');
      }

      // find car based on vin id
      const vehicle = await queryRunner.manager.findOne(Vehicle, {
        where: {
          vehicle_vin_id: vehicleVin.id,
        },
      });

      if (!vehicle) {
        throw new BadRequestException(
          `Error: vehicle is not associated with vin id: ${data.id}`,
        );
      }

      let newCarInformation = queryRunner.manager.create(VehicleInformation, {
        ...data.dto,
        vehicle_id: vehicle.id,
      });

      // save the new car information
      newCarInformation = await queryRunner.manager.save(
        VehicleInformation,
        newCarInformation,
      );

      // Update vehicle vin status to listed
      vehicleVin = queryRunner.manager.merge(VehicleVins, vehicleVin, {
        status: VehicleVinStatus.LISTED,
      });

      await queryRunner.manager.save(VehicleVins, vehicleVin);

      return newCarInformation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
  show(req: Request, id: number): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
  update(req: Request, dto: any, id: number): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
  destroy(req: Request, id: number): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
}
