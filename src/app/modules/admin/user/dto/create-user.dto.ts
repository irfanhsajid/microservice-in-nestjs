import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { IsUnique } from 'src/app/common/validation/is-unique';

export class CreateAdminUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  role_id: number;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @IsUnique({ table: 'users', column: 'email' })
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phone_number: string;

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
}
