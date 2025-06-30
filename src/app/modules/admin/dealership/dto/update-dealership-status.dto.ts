import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
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
}
