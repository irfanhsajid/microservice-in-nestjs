import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateVehicleInformationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  characteristics?: Array<any>;
}

export class UpdateVehicleInformationDto extends CreateVehicleInformationDto {}
