import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { RoleStatus } from '../entities/role.entity';

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

  @ApiProperty({ enum: RoleStatus, default: RoleStatus.ACTIVE })
  @IsEnum(RoleStatus)
  @IsOptional()
  status: RoleStatus;

  @ApiProperty()
  @IsString()
  @IsOptional()
  guard: string;
}
