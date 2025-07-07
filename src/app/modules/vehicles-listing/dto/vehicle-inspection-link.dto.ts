import {
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class VehicleInspectionLinkDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phone: string;
}
