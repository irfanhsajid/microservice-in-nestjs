import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { IsUnique } from 'src/app/common/validation/is-unique';

export class UpdateAdminUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  role_id: number;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsUnique({ table: 'users', column: 'email' })
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phone_number: string;
}
