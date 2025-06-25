import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

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
  @IsObject()
  @IsNotEmpty()
  characteristics?: object;
}

export class UpdateVehicleInformationDto extends CreateVehicleInformationDto {}
