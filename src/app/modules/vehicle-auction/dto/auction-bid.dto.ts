import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class VehicleAuctionBidDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  auto_bid: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  max_amount: number;
}
