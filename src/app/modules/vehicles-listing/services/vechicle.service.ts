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
          dealership_id: user_default_dealership?.dealership_id,
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
  async store(req: Request, dto: any): Promise<Record<string, any>> {
    try {
      const user = req['user'] as User;

      const queryRunner =
        this.vehicleRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      throw new Error('Method not implements');
    } catch (error) {
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
