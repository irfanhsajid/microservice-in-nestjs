import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VehicleCondition } from '../entities/vehicles.entity';
import { CreateVehicleDimensionDto } from './vehicles-demension.dto';
import { Type } from 'class-transformer';
import { CreateVehicleFeatureDto } from './vehicle-feature.dto';

export class CreateVehicleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  vehicle_vin_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mileage?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fuel_type?: string;

  @ApiProperty()
  @IsPhoneNumber()
  @IsNotEmpty()
  business_phone?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  model_year?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transmission?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  drive_type?: string;

  @ApiProperty()
  @IsEnum(VehicleCondition)
  condition?: VehicleCondition;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  engine_size?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  door?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cylinder?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  color?: string;

  @ApiProperty({ type: CreateVehicleDimensionDto })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateVehicleDimensionDto)
  dimensions?: CreateVehicleDimensionDto;

  @ApiProperty({ type: CreateVehicleFeatureDto, isArray: true })
  @ValidateNested({ each: true })
  @Type(() => CreateVehicleFeatureDto)
  @IsArray()
  @IsNotEmpty()
  vehicle_features?: CreateVehicleFeatureDto[];
}

export class UpdateVehicleDto extends CreateVehicleDto {}
