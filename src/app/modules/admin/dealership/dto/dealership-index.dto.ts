import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Sort } from 'src/app/common/pagination/sort';
import { DealershipIndexSortColumn } from '../enum/dealership-index-sort-column.enum';

export class AdminDealershipIndexDto {
  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  limit: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(DealershipIndexSortColumn)
  sort_column: DealershipIndexSortColumn;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(Sort)
  sort_direction: Sort;
}
