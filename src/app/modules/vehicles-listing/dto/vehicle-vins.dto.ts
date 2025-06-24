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

export class VehicleDiagnosticDto {
  @IsOptional()
  @IsBoolean()
  vehicle_diagnostics?: boolean;

  @IsOptional()
  @IsBoolean()
  electrical_issues?: boolean;

  @IsOptional()
  @IsBoolean()
  engine_light?: boolean;

  @IsOptional()
  @IsBoolean()
  unreported_accidents?: boolean;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export class CreateVehicleVinsDto {
  @IsNotEmpty()
  @IsString()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  dealership_id: number;

  @IsNotEmpty()
  @IsString()
  vin_number: string;

  @IsNotEmpty()
  @IsString()
  mileage: string;

  @IsNotEmpty()
  @IsEnum(MileageType)
  mileage_type: MileageType;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleDiagnosticDto)
  vehicle_diagnostics: VehicleDiagnosticDto[];
}
