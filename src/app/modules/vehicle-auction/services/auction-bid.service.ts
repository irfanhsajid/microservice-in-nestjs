import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { CustomLogger } from '../../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { type QueryRunner, Repository } from 'typeorm';
import { throwCatchError } from 'src/app/common/utils/throw-error';

import { extractUser } from 'src/app/common/utils/user-data-utils';
import { VehicleAuctionBidDto } from '../dto/auction-bid.dto';
import { VehicleAuctionBid } from '../entities/vehicle-auctions-bid.entity';
import { VehicleAuction } from '../entities/vehicle-auctions.entity';
import { BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
export class AuctionBidService implements ServiceInterface {
  private readonly logger = new CustomLogger(AuctionBidService.name);

  constructor(
    @InjectRepository(VehicleAuctionBid)
    private readonly vehicleAuctionBid: Repository<VehicleAuctionBid>,

    @InjectQueue('auto-bid-queue')
    private readonly autoBidQueue: Queue,
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

      // check bidding amount
      if (dto.data.amount < auction.starting_amount) {
        throw new BadRequestException({
          amount: `Invalid bidding amount. bidding amount must be greater than ${auction.starting_amount} `,
        });
      }

      // check auction ended or not
      // if ended throw error
      if (new Date() > auction.ending_time) {
        throw new BadRequestException('Auction has already ended');
      }

      // Check current max bid
      const maxBid = await this.getCurrentMaxBid(queryRunner, auction.id);

      if (maxBid) {
        if (maxBid.amount > dto.data.amount) {
          throw new BadRequestException({
            amount: 'Bidding amount is too low',
          });
        }
      }

      // Check user set auto bid
      const currentUserBid = await queryRunner.manager.findOne(
        VehicleAuctionBid,
        {
          where: {
            user_id: user.id,
            vehicle_auction_id: auction.id,
            auto_bid: true,
          },
        },
      );

      if (currentUserBid) {
        return {
          message:
            'You have already placed a auto bid for this auction. No need to manually placed the bidding',
        };
      }

      // New user bid
      const newBid = queryRunner.manager.create(VehicleAuctionBid, {
        amount: dto.data.amount,
        user_id: user.id,
        vehicle_id: auction.vehicle_id,
        vehicle_auction_id: auction.id,
        auto_bid: dto.data.auto_bid,
      });

      await queryRunner.manager.save(VehicleAuctionBid, newBid);

      // If auto bid is true
      // Run a backgroud job that will set bid automatically upto maximun set bid
      // Trigger corn job for current spcific user
      // The bidding will place base on current max bid amount of the auction
      if (dto.data.auto_bid) {
        console.log('auto bid enabled');
        await this.autoBidQueue.add(
          'place-auto-bid',
          {
            userId: user.id,
            auctionId: auction.id,
            maxBidAmount: dto.data.max_amount,
            bidIncrement: 100,
          },
          {
            repeat: {
              every: 1000,
              endDate: auction.ending_time,
            },
          },
        );
      }

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

  async getCurrentMaxBid(
    repo: QueryRunner | Repository<VehicleAuctionBid>,
    id: number,
  ): Promise<VehicleAuctionBid | null> {
    try {
      return await repo.manager
        .createQueryBuilder(VehicleAuctionBid, 'bid')
        .where('bid.vehicle_auction_id = :auctionId', { auctionId: id })
        .orderBy('bid.amount', 'DESC')
        .getOne();
    } catch (error) {
      this.logger.error(`Failed to fetch current bid for auction ${id}`, error);
      return null;
    }
  }
}
