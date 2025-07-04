import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { UserDealershipStatus } from 'src/app/modules/dealership/entities/user-dealership.entity';

export class UpdateDealershipStatusDto {
  @ApiProperty({
    enum: UserDealershipStatus,
    required: true,
    default: UserDealershipStatus.REQUESTED,
  })
  @IsNotEmpty()
  @IsEnum(UserDealershipStatus)
  status: UserDealershipStatus;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.status === UserDealershipStatus.DENIED)
  @IsNotEmpty({
    message: `Rejected reason is required if status is ${UserDealershipStatus.DENIED}`,
  })
  @IsString()
  rejected_reason?: string;
}
