import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
} from 'class-validator';
import { AddressType } from '../entities/address.entity';

export class AddressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(255)
  street_address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(100)
  country: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(20)
  zip_code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(100)
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(100)
  state: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(AddressType)
  type: AddressType;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  make_as_default: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  entity_type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  entity_id: number;
}
