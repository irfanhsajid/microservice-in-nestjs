import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { Repository } from 'typeorm';
import { VehicleDimension } from '../entities/vehicle-dimensions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceInterface } from '../../../common/interfaces/service.interface';
import { VehicleFeature } from '../entities/vehicle-features.entity';
import { VehicleInformation } from '../entities/vehicle-informations.entity';
import { Vehicle } from '../entities/vehicles.entity';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { User } from '../../user/entities/user.entity';
import { paginate } from '../../../common/pagination/paginate';
import { VehicleIndexDto } from '../dto/vehicle-index.dto';
import { CreateVehicleDto } from '../dto/vehicle.dto';

@Injectable()
export class VehicleService implements ServiceInterface {
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

  async index(
    req: Request,
    params: VehicleIndexDto,
  ): Promise<Record<string, any>> {
    const user = req['user'] as User;
    const user_default_dealership = req[
      'user_default_dealership'
    ] as UserDealership;

    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [vehicles, total] = await this.vehicleRepository.findAndCount({
      where: {
        vehicle_vin: {
          user_id: user.id,
          dealership_id: user_default_dealership.dealership_id!,
        },
      },
      select: [
        'id',
        'vehicle_vin',
        'vehicle_vin_id',
        'mileage',
        'fuel_type',
        'transmission',
        'created_at',
      ],
      relations: ['vehicle_attachment', 'information'],
      order: { [params.sort_column]: params.sort_direction },
      skip: skip,
      take: limit,
    });

    return paginate(vehicles, total, page, limit);
  }
  async store(
    req: Request,
    dto: CreateVehicleDto,
  ): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // destruct data
      const { dimensions, vehicle_features, ...vehicleProperty } = dto;

      // Check if vehicle exists by vehicle_vin_id
      let vehicle = await queryRunner.manager.findOne(Vehicle, {
        where: { vehicle_vin_id: vehicleProperty.vehicle_vin_id },
        relations: ['dimensions', 'vehicle_features'],
      });

      if (vehicle) {
        // Update existing vehicle
        vehicle = queryRunner.manager.merge(Vehicle, vehicle, {
          ...vehicleProperty,
        });
      } else {
        // Create new vehicle
        vehicle = queryRunner.manager.create(Vehicle, {
          ...vehicleProperty,
        });
      }
      vehicle = await queryRunner.manager.save(Vehicle, vehicle);

      // Handle dimensions (update or create)
      let dimension = await queryRunner.manager.findOne(VehicleDimension, {
        where: { vehicle_id: vehicle.id },
      });

      if (dimension) {
        // Update existing dimension
        dimension = queryRunner.manager.merge(VehicleDimension, dimension, {
          ...dimensions,
          vehicle_id: vehicle.id,
        });
      } else {
        // Create new dimension
        dimension = queryRunner.manager.create(VehicleDimension, {
          ...dimensions,
          vehicle_id: vehicle.id,
        });
      }
      dimension = await queryRunner.manager.save(VehicleDimension, dimension);

      const newFeatures: VehicleFeature[] = [];
      // create features for user
      for (const features of vehicle_features) {
        let newFeature = await queryRunner.manager.findOne(VehicleFeature, {
          where: {
            vehicle_id: vehicle.id,
            type: features.type,
          },
        });

        if (!newFeature) {
          newFeature = queryRunner.manager.create(VehicleFeature, {
            ...features,
            vehicle_id: vehicle.id,
          });
        } else {
          newFeature = queryRunner.manager.merge(VehicleFeature, newFeature, {
            ...features,
            vehicle_id: vehicle.id,
          });
        }

        newFeature = await queryRunner.manager.save(newFeature);
        newFeatures.push(newFeature);
      }

      // commit transaction
      await queryRunner.commitTransaction();

      return {
        ...vehicle,
        vehicle_features: newFeatures,
        dimensions: dimension,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
  async show(req: Request, id: number): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
  async update(
    req: Request,
    dto: any,
    id: number,
  ): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
  async destroy(req: Request, id: number): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
}
