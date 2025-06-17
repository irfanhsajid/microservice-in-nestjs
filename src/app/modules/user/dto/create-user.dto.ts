import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

import { UserAccountType } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

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
  accept_privacy: boolean;

  @ApiProperty({ enum: UserAccountType })
  @IsEnum(UserAccountType)
  account_type: UserAccountType;
}
