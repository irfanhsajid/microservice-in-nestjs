import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Sort } from '../../../common/pagination/sort';
import { IndexSortColumn } from '../enums/vehicle-index.sortcolumn';
import { VehicleVinStatus } from '../entities/vehicle-vins.entity';

export class VehicleIndexDto {
  @ApiProperty({ example: VehicleVinStatus })
  @IsNotEmpty()
  @IsEnum(VehicleVinStatus)
  status: VehicleVinStatus;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(IndexSortColumn)
  sort_column: IndexSortColumn;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(Sort)
  sort_direction: Sort;
}
