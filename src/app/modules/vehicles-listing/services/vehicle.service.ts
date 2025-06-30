import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { In, IsNull, Like, QueryRunner, Repository, Unique } from 'typeorm';
import { VehicleDimension } from '../entities/vehicle-dimensions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceInterface } from '../../../common/interfaces/service.interface';
import { VehicleFeature } from '../entities/vehicle-features.entity';
import { Vehicle } from '../entities/vehicles.entity';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { User } from '../../user/entities/user.entity';
import { paginate } from '../../../common/pagination/paginate';
import { VehicleIndexDto } from '../dto/vehicle-index.dto';
import { CreateVehicleDto } from '../dto/vehicle.dto';
import { VehicleVins, VehicleVinStatus } from '../entities/vehicle-vins.entity';
import { CreateVehicleVinsDto } from '../dto/vehicle-vins.dto';

@Injectable()
export class VehicleService implements ServiceInterface {
  private readonly logger = new CustomLogger(VehicleService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,

    @InjectRepository(UserDealership)
    private readonly userDealershipRepository: Repository<UserDealership>,
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

    let dealershipUserIds = [user.id];
    if (user_default_dealership.dealership_id) {
      const userDealerships = await this.userDealershipRepository
        .find({
          where: {
            dealership_id: user_default_dealership.dealership_id,
          },
          select: ['user_id'],
        })
        .then((res) => res.map((dealership) => dealership.user_id));

      dealershipUserIds = [...dealershipUserIds, ...userDealerships];
    }

    const [vehicles, total] = await this.vehicleRepository.findAndCount({
      where: {
        vehicle_vin: {
          user_id: In(dealershipUserIds),
          dealership_id: user_default_dealership.dealership_id || IsNull(),
          status: params.status,
        },

        information: {
          title: params.search ? Like(`%${params.search}%`) : undefined,
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
        'vehicle_attachment',
        'information',
      ],
      relations: ['vehicle_attachment', 'information'],
      order: {
        [params.sort_column || 'created_at']: params.sort_direction || 'desc',
      },
      skip: skip,
      take: limit,
    });

    return paginate(vehicles, total, page, limit);
  }

  // Store or create
  async storeVehicleVin(
    req: Request,
    queryRunner: QueryRunner,
    dto: CreateVehicleVinsDto,
  ): Promise<VehicleVins> {
    try {
      const user = req['user'] as User;
      const defaultDealership = req[
        'user_default_dealership'
      ] as UserDealership;

      if (!defaultDealership) {
        throw new BadRequestException('Opps, No user dealership found!');
      }

      // find vin number if exist
      let vehicleVin = await queryRunner.manager.findOne(VehicleVins, {
        where: {
          user_id: user.id,
          dealership_id: defaultDealership.dealership_id,
          vin_number: dto.vin_number,
        },
      });

      if (vehicleVin) {
        vehicleVin = queryRunner.manager.merge(VehicleVins, vehicleVin, {
          ...dto,
        });
      } else {
        vehicleVin = queryRunner.manager.create(VehicleVins, {
          user_id: user?.id,
          dealership_id: defaultDealership?.dealership_id,
          ...dto,
          status: VehicleVinStatus.DRAFT,
        });
      }

      return await queryRunner.manager.save(VehicleVins, vehicleVin);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
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
      const { dimensions, vehicle_vin, vehicle_features, ...vehicleProperty } =
        dto;
      // store vehicle vin
      const vehicleVin = await this.storeVehicleVin(
        req,
        queryRunner,
        vehicle_vin,
      );

      // Check if a vehicle exists by vehicle_vin_id
      let vehicle = await queryRunner.manager.findOne(Vehicle, {
        where: { vehicle_vin_id: vehicleVin.id },
        relations: ['dimensions', 'vehicle_features'],
      });

      if (vehicle) {
        // Update existing vehicle
        vehicle = queryRunner.manager.merge(Vehicle, vehicle, {
          ...vehicleProperty,
        });
      } else {
        // Create a new vehicle
        vehicle = queryRunner.manager.create(Vehicle, {
          ...vehicleProperty,
          vehicle_vin_id: vehicleVin.id,
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
        vehicle_vin: vehicleVin,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
  async show(req: Request, id: number): Promise<Record<string, any>> {
    try {
      const user = req['user'] as User;
      const userDefaultDealership = req[
        'user_default_dealership'
      ] as UserDealership;

      if (!userDefaultDealership) {
        return {};
      }

      const vehicle = await this.vehicleRepository.findOne({
        where: {
          vehicle_vin: {
            user_id: user.id,
            dealership_id: userDefaultDealership.dealership_id,
          },
          vehicle_vin_id: id,
        },
        relations: ['vehicle_attachments', 'information', 'vehicle_features'],
      });

      if (!vehicle) {
        return {};
      }
      return vehicle;
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
  update(req: Request, dto: any, id: number): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
  destroy(req: Request, id: number): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
}
