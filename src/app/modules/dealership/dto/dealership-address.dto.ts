import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DealershipAddressType } from '../entities/dealership-address.entity';

export class DealershipAddressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  street_address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  zip_code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  state: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(DealershipAddressType)
  type: DealershipAddressType;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  make_as_default: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  entity_type: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  entity_id: number;
}
