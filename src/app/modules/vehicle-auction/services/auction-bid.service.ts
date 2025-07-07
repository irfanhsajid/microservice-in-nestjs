import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { CustomLogger } from '../../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { throwCatchError } from 'src/app/common/utils/throw-error';

import {
  extractUser,
  extractUserDealership,
} from 'src/app/common/utils/user-data-utils';
import { VehicleAuctionBidDto } from '../dto/auction-bid.dto';
import { VehicleAuctionBid } from '../entities/vehicle-auctions-bid.entity';
import { VehicleAuction } from '../entities/vehicle-auctions.entity';
import { BadRequestException } from '@nestjs/common';
export class AuctionBidService implements ServiceInterface {
  private readonly logger = new CustomLogger(AuctionBidService.name);

  constructor(
    @InjectRepository(VehicleAuctionBid)
    private readonly vehicleAuctionBid: Repository<VehicleAuctionBid>,
  ) {}

  index(req: Request, params: any): Record<string, any> {
    throw new Error('Method not implemented.');
  }

  async store(
    req: Request,
    dto: { id: number; data: VehicleAuctionBidDto },
  ): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleAuctionBid.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = extractUser(req);

      // find auction by id
      const auction = await queryRunner.manager.findOne(VehicleAuction, {
        where: {
          id: dto.id,
        },
      });

      if (!auction) {
        throw new BadRequestException('Invalid auction');
      }

      // check auction ended or not
      // if ended throw error
      if (new Date() > auction.ending_time) {
        throw new BadRequestException('Auction has already ended');
      }

      // New user bid
      const newBid = queryRunner.manager.create(VehicleAuctionBid, {
        amount: dto.data.amount,
        user_id: user.id,
        vehicle_id: auction.vehicle_id,
        vehicle_auction_id: auction.id,
      });

      // @TODO
      // If auto bid is true
      // Run a backgroud job that will set bid automatically upto maximun set bid
      // Trigger corn job for current spcific user
      // The bidding will place base on current max bid amount of the auction

      await queryRunner.manager.save(VehicleAuctionBid, newBid);

      // commit changes
      await queryRunner.commitTransaction();

      return {
        message: dto.data.auto_bid
          ? 'Auto-bid enabled! We will bid on your behalf.'
          : 'You have successfully placed a bid.',
      };
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
      const user = extractUser(req);
      return await this.vehicleAuctionBid.find({
        where: {
          vehicle_auction_id: id,
          user_id: user.id,
        },
      });
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
