import { IsNotEmpty, IsString } from 'class-validator';

export class ResendVerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}
