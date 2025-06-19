import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DealershipAttachementDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
