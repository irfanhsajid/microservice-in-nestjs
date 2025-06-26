import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { ApiGuard } from 'src/app/guards/api.guard';
import { CustomLogger } from 'src/app/modules/logger/logger.service';
import { UpdateDealershipStatusDto } from '../dto/update-dealership-status.dto';
import { AdminDealershipService } from '../services/dealership.service';
import { responseReturn } from 'src/app/common/utils/response-return';
import { AbilityGuard } from 'src/app/modules/auth/casl/ability.guard';
import { CheckAbility } from 'src/app/modules/auth/casl/check-ability.decorator';

@ApiTags('Admin Dealership Management')
@ApiBearerAuth('jwt')
@UseGuards(ApiGuard)
@Controller('api/v1/admin/dealerships')
export class AdminDealershipController {
  constructor(
    private readonly adminDealershipService: AdminDealershipService,
  ) {}
  private readonly logger = new CustomLogger(AdminDealershipController.name);

  @UseGuards(AbilityGuard)
  @CheckAbility('update', 'dealership')
  @Patch('/:dealership_id/status')
  async updateStatus(
    @Req() req: Request,
    @Param('dealership_id') dealership_id: string,
    @Body() dto: UpdateDealershipStatusDto,
  ) {
    try {
      const dealership =
        await this.adminDealershipService.updateDealershipStatus(
          req,
          +dealership_id,
          dto,
        );
      return responseReturn(
        'Dealership status updated successfully',
        dealership,
      );
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
