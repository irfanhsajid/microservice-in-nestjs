import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleAuctionBid } from '../entities/vehicle-auctions-bid.entity';
import { VehicleAuction } from '../entities/vehicle-auctions.entity';
import { BadRequestException } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';

@Processor('auto-bid-queue')
export class AutoBidProcessor extends WorkerHost {
  private readonly logger = new CustomLogger(AutoBidProcessor.name);

  constructor(
    @InjectRepository(VehicleAuctionBid)
    private readonly vehicleAuctionBid: Repository<VehicleAuctionBid>,
  ) {
    super();
  }

  process(job: Job, token?: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async handleAutoBid(
    job: Job<{
      userId: number;
      auctionId: number;
      maxBidAmount: number;
      bidIncrement: number;
    }>,
  ) {
    const { userId, auctionId, maxBidAmount, bidIncrement } = job.data;

    const queryRunner =
      this.vehicleAuctionBid.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the auction
      const auction = await queryRunner.manager.findOne(VehicleAuction, {
        where: { id: auctionId },
      });

      if (!auction) {
        throw new BadRequestException('Auction not found');
      }

      // Check if auction has ended
      if (new Date() > auction.ending_time) {
        throw new BadRequestException('Auction has ended');
      }

      // Find the current maximum bid
      const currentMaxBid = await queryRunner.manager
        .createQueryBuilder(VehicleAuctionBid, 'bid')
        .where('bid.vehicle_auction_id = :auctionId', { auctionId })
        .orderBy('bid.amount', 'DESC')
        .getOne();

      const currentMaxAmount = currentMaxBid
        ? currentMaxBid.amount
        : auction.starting_amount;

      // Calculate the next bid amount
      const nextBidAmount = currentMaxAmount + bidIncrement;

      // If the next bid is within the user's max bid amount, place the bid
      if (nextBidAmount <= maxBidAmount) {
        const newBid = queryRunner.manager.create(VehicleAuctionBid, {
          amount: nextBidAmount,
          user_id: userId,
          vehicle_id: auction.vehicle_id,
          vehicle_auction_id: auction.id,
          created_at: new Date(),
          updated_at: new Date(),
        });

        await queryRunner.manager.save(VehicleAuctionBid, newBid);
        this.logger.log(
          `Auto-bid placed for user ${userId} on auction ${auctionId}: ${nextBidAmount}`,
        );
      } else {
        // Stop the job if max bid is reached
        this.logger.log(
          `Max bid amount reached for user ${userId} on auction ${auctionId}`,
        );
        await job.remove(); // Remove the repeating job
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Auto-bid failed for user ${userId} on auction ${auctionId}: ${error.message}`,
      );
      throw error; // Let Bull handle retries or failures
    } finally {
      await queryRunner.release();
    }
  }
}
