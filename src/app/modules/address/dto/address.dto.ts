import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { AddressType } from '../entities/address.entity';

export class AddressDto {
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
  @IsNotEmpty()
  @IsString()
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
