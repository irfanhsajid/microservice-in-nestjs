import { PartialType } from '@nestjs/swagger';
import { CreateUserDealershipDto } from './create-user-dealership.dto';

export class UpdateUserDealershipDto extends PartialType(
  CreateUserDealershipDto,
) {}
