import { BusinessType, LicenseClass } from './../entities/dealerships.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUrl, Max } from 'class-validator';

export class CreateDealershipDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(100)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(LicenseClass)
  license_class: LicenseClass;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(BusinessType)
  business_type: BusinessType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(100)
  business_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(100)
  omvic_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(100)
  tax_identifier: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(100)
  phone_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(255)
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  website: string;
}
