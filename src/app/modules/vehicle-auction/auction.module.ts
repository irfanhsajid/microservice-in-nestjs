import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleAuction } from './entities/vehicle-auctions.entity';
import { AuctionController } from './controllers/auction.controller';
import { UserModule } from '../user/user.module';
import { CaslModule } from '../auth/casl/casl.module';
import { AuctionService } from './services/auction.service';
import { VehicleAuctionBid } from './entities/vehicle-auctions-bid.entity';
import { AuctionBidController } from './controllers/auction-bid.controller';
import { AuctionBidService } from './services/auction-bid.service';
import { Vehicle } from '../vehicles-listing/entities/vehicles.entity';
import { UserDealership } from '../dealership/entities/user-dealership.entity';
import { VehiclesListingModule } from '../vehicles-listing/vehicles-listing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VehicleAuction,
      VehicleAuctionBid,
      Vehicle,
      UserDealership,
    ]),
    UserModule,
    CaslModule,
    VehiclesListingModule,
  ],
  controllers: [AuctionController, AuctionBidController],
  providers: [AuctionService, AuctionBidService],
  exports: [],
})
export class AuctionModule {}
