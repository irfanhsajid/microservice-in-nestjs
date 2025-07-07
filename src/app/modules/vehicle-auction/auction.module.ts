import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleAuction } from './entities/vehicle-auctions.entity';
import { AuctionController } from './controllers/auction.controller';
import { UserModule } from '../user/user.module';
import { CaslModule } from '../auth/casl/casl.module';
import { AuctionService } from './services/auction.service';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleAuction]), UserModule, CaslModule],
  controllers: [AuctionController],
  providers: [AuctionService],
  exports: [],
})
export class AuctionModule {}
