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
import { AddressDto } from '../../address/dto/address.dto';
import { Type } from 'class-transformer';

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

  @ApiProperty({ type: () => AddressDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  primary_address: AddressDto;

  @ApiProperty({ type: () => AddressDto, isArray: true })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  shipping_address: AddressDto[];

  @ApiProperty({ type: () => AddressDto, isArray: true })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  mailing_address: AddressDto[];
}
