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
import paginate from '../../../common/pagination/paginate';
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

    const dealershipUserIds = await this.getDealershipUserIds(
      user,
      user_default_dealership,
    );

    return await paginate(this.vehicleRepository, {
      page: params.page || 1,
      limit: params.limit || 10,
      findOptions: {
        where: [
          {
            vehicle_vin: {
              user_id: In(dealershipUserIds),
              dealership_id: user_default_dealership.dealership_id || IsNull(),
              status: params.status,
            },
            information: {
              title: params.search ? Like(`%${params.search}%`) : undefined,
            },
          },
          {
            vehicle_vin: {
              user_id: In(dealershipUserIds),
              dealership_id: user_default_dealership.dealership_id || IsNull(),
              status: params.status,
            },
            information: {
              description: params.search
                ? Like(`%${params.search}%`)
                : undefined,
            },
          },
        ],
        select: {
          id: true,
          vehicle_vin_id: true,
          mileage: true,
          fuel_type: true,
          transmission: true,
          created_at: true,
          vehicle_attachment: {
            id: true,
            user_id: true,
            vehicle_id: true,
            name: true,
            path: true,
          },
          information: {
            id: true,
            vehicle_id: true,
            title: true,
            description: true,
            characteristics: true,
          },
        },
        relations: {
          vehicle_attachment: true,
          information: true,
        },
        order: {
          [params.sort_column || 'created_at']: params.sort_direction || 'desc',
        },
      },
    });
  }

  async getDealershipUserIds(
    user: User,
    user_default_dealership: UserDealership,
  ) {
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
    return dealershipUserIds;
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
    } finally {
      await queryRunner.release();
    }
  }

  async details(req: Request, id: number): Promise<Record<string, any>> {
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
            dealership_id: userDefaultDealership.dealership_id || IsNull(),
          },
          vehicle_vin_id: id,
        },
        select: {
          id: true,
          vehicle_vin_id: true,
          body: true,
          mileage: true,
          fuel_type: true,
          business_phone: true,
          model_year: true,
          transmission: true,
          drive_type: true,
          condition: true,
          engine_size: true,
          door: true,
          cylinder: true,
          color: true,
          created_at: true,
          vehicle_vin: {
            id: true,
            user_id: true,
            dealership_id: true,
            user: {
              id: true,
              name: true,
              email: true,
              phone_number: true,
            },
            dealership: {
              id: true,
              name: true,
              license_class: true,
              business_type: true,
              addresses: {
                id: true,
                type: true,
                dealership_id: true,
                make_as_default: true,
                street_address: true,
                city: true,
                country: true,
                state: true,
                zip_code: true,
              },
            },
          },
          vehicle_attachments: {
            id: true,
            user_id: true,
            vehicle_id: true,
            name: true,
            path: true,
          },
          dimensions: {
            id: true,
            vehicle_id: true,
            length: true,
            width: true,
            height: true,
            wheelbase: true,
            height_including_roof_rails: true,
            width_including_mirrors: true,
            gross_weight: true,
            max_loading_weight: true,
            max_roof_load: true,
            seats: true,
          },
          information: {
            id: true,
            vehicle_id: true,
            title: true,
            description: true,
            characteristics: true,
          },
          vehicle_features: {
            id: true,
            vehicle_id: true,
            type: true,
            specs: true,
          },
          vehicle_inspections: {
            id: true,
            vehicle_id: true,
            vehicle_inspection_report_id: true,
            title: true,
            type: true,
            number_of_issues: true,
            path: true,
            description: true,
          },
          vehicle_inspection_report: {
            id: true,
            vehicle_id: true,
            point: true,
            title: true,
            details: true,
            created_at: true,
          },
        },
        relations: [
          'vehicle_vin.user',
          'vehicle_vin.dealership.addresses',
          'vehicle_attachments',
          'dimensions',
          'information',
          'vehicle_features',
          'vehicle_inspections',
          'vehicle_inspection_report',
        ],
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
            dealership_id: userDefaultDealership.dealership_id || IsNull(),
          },
          vehicle_vin_id: id,
        },
        relations: [
          'vehicle_vin',
          'vehicle_attachments',
          'dimensions',
          'information',
          'vehicle_features',
        ],
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

  async findById(id: number): Promise<Vehicle | null> {
    try {
      return await this.vehicleRepository.findOne({ where: { id } });
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
