import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SigninDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
