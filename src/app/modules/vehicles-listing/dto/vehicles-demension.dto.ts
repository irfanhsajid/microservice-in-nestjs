import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateVehicleDimensionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  length?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  height?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  wheelbase?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  height_including_roof_rails?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  width?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  width_including_mirrors?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gross_weight?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  max_loading_weight?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  max_roof_load?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  seats?: string;
}

export class UpdateVehicleDimensionDto extends CreateVehicleDimensionDto {}
