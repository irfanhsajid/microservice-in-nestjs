import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MileageType } from '../entities/vehicle-vins.entity';
import { ApiProperty } from '@nestjs/swagger';

export class VehicleDiagnosticDto {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  vehicle_diagnostics?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  electrical_issues?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  engine_light?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  unreported_accidents?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;
}

export class CreateVehicleVinsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  vin_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mileage: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(MileageType)
  mileage_type: MileageType;

  @ApiProperty({ type: VehicleDiagnosticDto, isArray: true })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleDiagnosticDto)
  vehicle_diagnostics: VehicleDiagnosticDto[];
}
