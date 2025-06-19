import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { BusinessType, LicenseClass } from '../entities/dealerships.entity';
import { Type } from 'class-transformer';
import { DealershipAddressDto } from './dealership-address.dto';

export class DealershipDetailsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEnum(LicenseClass)
  @IsNotEmpty()
  dealer_class: LicenseClass;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsPhoneNumber()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty()
  @IsEnum(BusinessType)
  @IsNotEmpty()
  business_type: BusinessType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  business_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  omvic_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tax_identifier: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  website: string;

  @ApiProperty({ type: () => DealershipAddressDto })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DealershipAddressDto)
  primary_address: DealershipAddressDto;

  @ApiProperty({ type: () => DealershipAddressDto, isArray: true })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DealershipAddressDto)
  shipping_address: DealershipAddressDto[];

  @ApiProperty({ type: () => DealershipAddressDto, isArray: true })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DealershipAddressDto)
  mailing_address: DealershipAddressDto[];
}
