import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  VehicleInspectionTitleType,
  VehicleInspectionType,
} from '../entities/vehicle-inspection.entity';

export class CreateVehicleInspectionDto {
  @ApiProperty({
    description: 'The type of vehicle inspection view',
    enum: VehicleInspectionTitleType,
    example: VehicleInspectionTitleType.FRONT_VIEW,
  })
  @IsEnum(VehicleInspectionTitleType)
  @IsNotEmpty()
  title: VehicleInspectionTitleType;

  @ApiProperty({
    description: 'The type of vehicle inspection type',
    enum: VehicleInspectionType,
    example: VehicleInspectionType.INTERIOR,
  })
  @IsEnum(VehicleInspectionType)
  @IsNotEmpty()
  type: VehicleInspectionType;

  @ApiProperty({
    description: 'The number of issues found during the inspection',
    example: 3,
    type: Number,
  })
  @IsInt()
  @IsNotEmpty()
  number_of_issues: number;

  @ApiProperty({
    description: 'Detailed description of the inspection findings',
    example:
      'Minor scratches on the front bumper, headlight alignment issue detected.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
