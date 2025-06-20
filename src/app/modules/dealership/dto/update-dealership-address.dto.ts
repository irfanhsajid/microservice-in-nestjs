import { PartialType } from '@nestjs/swagger';
import { DealershipAddressDto } from './dealership-address.dto';

export class UpdateDealershipAddressDto extends PartialType(
  DealershipAddressDto,
) {}
