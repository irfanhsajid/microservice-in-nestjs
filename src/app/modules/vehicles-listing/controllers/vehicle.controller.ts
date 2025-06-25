import { CustomLogger } from '../../logger/logger.service';
import { VehicleService } from '../services/vechicle.service';
import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { throwCatchError } from '../../../common/utils/throw-error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiGuard } from '../../../guards/api.guard';
import { EnsureEmailVerifiedGuard } from '../../../guards/ensure-email-verified.guard';
import { EnsureProfileCompletedGuard } from '../../../guards/ensure-profile-completed.guard';

@ApiTags('Vehicle-listing')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard)
@ApiBearerAuth('jwt')
@Controller('api/v1')
export class VehicleController {
  private readonly logger = new CustomLogger(VehicleController.name);

  constructor(private readonly vehicleService: VehicleService) {}

  /**
   * Get all vehicles
   * @param req Request object
   * @param params
   * @returns Promise with vehicle data
   */
  @Get('/vehicles')
  async index(@Request() req: any, @Param() params: any): Promise<any> {
    try {
      return await this.vehicleService.index(req, params);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
