import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AuctionType } from '../enums/auction-type';

export class CreateVehicleAuctionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  vehicle_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  shipping_address_id: number;

  @ApiProperty({
    example: AuctionType.PRIVATE,
    type: 'string',
    enum: Object.values(AuctionType),
  })
  @IsNotEmpty()
  @IsEnum(AuctionType)
  type: AuctionType;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  starting_amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  reserve_amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  starting_time: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  ending_time: Date;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  financing: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  trade: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  warranty: boolean;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  warranty_data: any;
}
