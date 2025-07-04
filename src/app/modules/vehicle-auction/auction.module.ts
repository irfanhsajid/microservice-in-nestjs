import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleAuction } from './entities/vehicle-auctions.entity';
import { AuctionController } from './controllers/auction.controller';
import { UserModule } from '../user/user.module';
import { CaslModule } from '../auth/casl/casl.module';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleAuction]), UserModule, CaslModule],
  controllers: [AuctionController],
  providers: [],
  exports: [],
})
export class AuctionModule {}
