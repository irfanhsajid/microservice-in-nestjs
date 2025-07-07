import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { CustomLogger } from '../../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleAuction } from '../entities/vehicle-auctions.entity';
import { In, IsNull, Like, Repository } from 'typeorm';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { CreateVehicleAuctionDto } from '../dto/auction.dto';
import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Vehicle } from '../../vehicles-listing/entities/vehicles.entity';
import {
  DealershipAddress,
  DealershipAddressType,
} from '../../dealership/entities/dealership-address.entity';
import { extractUserDealership } from 'src/app/common/utils/user-data-utils';
import { User } from '../../user/entities/user.entity';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import paginate from '../../../common/pagination/paginate';
import { VehicleService } from '../../vehicles-listing/services/vehicle.service';
export class AuctionService implements ServiceInterface {
  private readonly logger = new CustomLogger(AuctionService.name);

  constructor(
    @InjectRepository(VehicleAuction)
    private readonly vehicleAuction: Repository<VehicleAuction>,

    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,

    private readonly vehicleService: VehicleService,
  ) {}

  async index(req: Request, params: any): Promise<Record<string, any>> {
    const user = req['user'] as User;
    const user_default_dealership = req[
      'user_default_dealership'
    ] as UserDealership;

    const dealershipUserIds = await this.vehicleService.getDealershipUserIds(
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

  async store(
    req: Request,
    dto: CreateVehicleAuctionDto,
  ): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleAuction.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userDealership = extractUserDealership(req);
      if (!userDealership) {
        throw new BadRequestException(
          `You don't have a dealership. Please apply for dealership`,
        );
      }

      // check vehicle id valid or not
      const vehicle = await queryRunner.manager.findOne(Vehicle, {
        where: {
          id: dto.vehicle_id,
          vehicle_vin: {
            dealership_id: userDealership.dealership_id,
          },
        },
      });

      if (!vehicle) {
        throw new UnprocessableEntityException({
          vehicle_id: 'Invalid vehicle provided',
        });
      }

      // Check address
      const address = await queryRunner.manager.findOne(DealershipAddress, {
        where: {
          id: dto.shipping_address_id,
          type: DealershipAddressType.SHIPPING,
          dealership_id: userDealership.dealership_id,
        },
      });

      if (!address) {
        throw new UnprocessableEntityException({
          shipping_address_id: 'Invalid shipping address provided',
        });
      }

      let newAuction = queryRunner.manager.create(VehicleAuction, {
        ...dto,
        dealership_id: userDealership.dealership_id,
      });

      newAuction = await queryRunner.manager.save(VehicleAuction, newAuction);

      await queryRunner.commitTransaction();

      return newAuction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      return throwCatchError(error);
    } finally {
      await queryRunner.release();
    }
  }
  async show(req: Request, id: number): Promise<Record<string, any>> {
    try {
      const userDearship = extractUserDealership(req);
      return (
        (await this.vehicleAuction.findOne({
          where: {
            id: id,
            dealership_id: userDearship.id,
          },
        })) ?? {}
      );
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
  update(req: Request, dto: any, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }
  destroy(req: Request, id: number): Record<string, any> {
    throw new Error('Method not implemented.');
  }
}
