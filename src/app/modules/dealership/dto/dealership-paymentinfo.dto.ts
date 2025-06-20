import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class DealershipPaymentInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(10, 255)
  account_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(10, 255)
  bank_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(10, 50)
  transit_number: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(10, 50)
  institution_number: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(10, 50)
  account_number: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @Length(10, 255)
  email: string;
}
