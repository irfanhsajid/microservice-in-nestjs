import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Validate } from 'class-validator';
import { IsVehicleVinValid } from './validator/is-vehicle-vin-valid.validator';

export class VehicleAttachmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Validate(IsVehicleVinValid)
  vehicle_vin_id: number;
}
