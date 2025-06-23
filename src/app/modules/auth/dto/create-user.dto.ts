import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUrl,
} from 'class-validator';

export enum UserAccountType {
  BUYER = 'BUYER',
  DEALER = 'DEALER',
  OTHER = 'OTHER',
}

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  avatar: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsStrongPassword(
    {},
    {
      message:
        'Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol.',
    },
  )
  password: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty()
  @IsBoolean()
  @Equals(true, { message: 'You must accept the privacy policy.' })
  accept_privacy: boolean;

  @ApiProperty({ enum: UserAccountType })
  @IsEnum(UserAccountType)
  account_type: UserAccountType;
}

export class PartialUserDto extends PartialType(CreateUserDto) {}

export class OAuthDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
