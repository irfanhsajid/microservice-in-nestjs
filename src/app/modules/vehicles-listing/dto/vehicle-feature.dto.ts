import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import {
  ComfortConvenienceSpecs,
  ExteriorSpecs,
  FeatureType,
  InteriorSpecs,
  SafetySpecs,
} from '../entities/vehicle-features.entity';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class CreateVehicleFeatureDto {
  @ApiProperty({ enum: FeatureType })
  @IsEnum(FeatureType)
  @IsNotEmpty()
  type: FeatureType;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(InteriorSpecs) },
      { $ref: getSchemaPath(SafetySpecs) },
      { $ref: getSchemaPath(ExteriorSpecs) },
      { $ref: getSchemaPath(ComfortConvenienceSpecs) },
    ],
  })
  @IsNotEmpty()
  @IsObject()
  specs?: InteriorSpecs | SafetySpecs | ExteriorSpecs | ComfortConvenienceSpecs;
}

export class UpdateVehicleFeatureDto extends CreateVehicleFeatureDto {}
