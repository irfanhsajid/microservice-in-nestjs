import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class DealershipPaymentInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  account_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bank_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transit_number: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  institution_number: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  account_number: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
