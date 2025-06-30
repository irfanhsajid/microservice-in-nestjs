import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

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
}
