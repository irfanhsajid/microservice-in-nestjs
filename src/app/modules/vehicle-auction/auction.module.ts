import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleAuction } from './entities/vehicle-auctions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleAuction])],
  controllers: [],
  providers: [],
  exports: [],
})
export class AuctionModule {}
