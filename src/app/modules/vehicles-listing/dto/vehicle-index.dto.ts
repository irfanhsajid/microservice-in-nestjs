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

export class VehicleIndexDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(IndexSortColumn)
  sort_column: IndexSortColumn;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Sort)
  sort_direction: Sort;
}
