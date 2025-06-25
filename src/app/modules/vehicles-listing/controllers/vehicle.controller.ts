import { CustomLogger } from '../../logger/logger.service';
import { VehicleService } from '../services/vehicle.service';
import {
  Controller,
  Body,
  Get,
  Post,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { throwCatchError } from '../../../common/utils/throw-error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiGuard } from '../../../guards/api.guard';
import { EnsureEmailVerifiedGuard } from '../../../guards/ensure-email-verified.guard';
import { EnsureProfileCompletedGuard } from '../../../guards/ensure-profile-completed.guard';
import { CreateVehicleDto } from '../dto/vehicle.dto';
import { VehicleIndexDto } from '../dto/vehicle-index.dto';
import { responseReturn } from '../../../common/utils/response-return';

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
  async index(
    @Request() req: any,
    @Query() params: VehicleIndexDto,
  ): Promise<any> {
    try {
      const vehicles = await this.vehicleService.index(req, params);
      return responseReturn('Vehicles fetched successfully', vehicles);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @Post('/vehicles')
  async store(@Request() req: any, @Body() dto: CreateVehicleDto) {
    try {
      return await this.vehicleService.store(req, dto);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
