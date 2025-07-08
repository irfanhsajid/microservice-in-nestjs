import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Validate,
} from 'class-validator';
import { IsMatch } from 'src/app/common/validation/is-match';

export class AdminUserChangePasswordDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(
    {},
    {
      message:
        'Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol.',
    },
  )
  current_password: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(
    {},
    {
      message:
        'Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol.',
    },
  )
  password: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(
    {},
    {
      message:
        'Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol.',
    },
  )
  @IsMatch('password', { message: 'Passwords do not match' })
  password_confirmation: string;
}
