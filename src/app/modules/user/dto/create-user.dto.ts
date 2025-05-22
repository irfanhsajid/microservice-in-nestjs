import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUrl,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsString()
  last_name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  have_dealership: boolean;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  website: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  license_class: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  car_view_accept_privacy: boolean;
}
