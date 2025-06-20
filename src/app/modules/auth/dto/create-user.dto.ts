import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

import { UserAccountType } from '../../user/entities/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

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
