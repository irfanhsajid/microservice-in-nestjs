import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [Number], default: ['1', '2', '3'] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Type(() => Number)
  permission_ids: number[];
}
