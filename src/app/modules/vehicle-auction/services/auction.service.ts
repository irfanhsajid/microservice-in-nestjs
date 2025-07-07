import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { CustomLogger } from '../../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleAuction } from '../entities/vehicle-auctions.entity';
import { Repository } from 'typeorm';
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
export class AuctionService implements ServiceInterface {
  private readonly logger = new CustomLogger(AuctionService.name);

  constructor(
    @InjectRepository(VehicleAuction)
    private readonly vehicleAuction: Repository<VehicleAuction>,
  ) {}

  index(req: Request, params: any): Record<string, any> {
    throw new Error('Method not implemented.');
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
      const userDearship = extractUserDealership(req);
      if (!userDearship) {
        throw new BadRequestException(
          `You don't have a dealership. Please apply for dealership`,
        );
      }

      // check vehicle id valid or not
      const vehicle = await queryRunner.manager.findOne(Vehicle, {
        where: {
          id: dto.vehicle_id,
          vehicle_vin: {
            dealership_id: userDearship.dealership_id,
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
          dealership_id: userDearship.dealership_id,
        },
      });

      if (!address) {
        throw new UnprocessableEntityException({
          shipping_address_id: 'Invalid shipping address provided',
        });
      }

      let newAuction = queryRunner.manager.create(VehicleAuction, {
        ...dto,
        dealership_id: userDearship.dealership_id,
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
