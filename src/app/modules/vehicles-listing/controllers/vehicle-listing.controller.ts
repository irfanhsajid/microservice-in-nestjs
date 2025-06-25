import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiGuard } from 'src/app/guards/api.guard';
import { EnsureEmailVerifiedGuard } from 'src/app/guards/ensure-email-verified.guard';
import { CreateVehicleVinsDto } from '../dto/vehicle-vins.dto';
import { CustomLogger } from '../../logger/logger.service';
import { VehicleVinsService } from '../services/vehicle-vins.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { EnsureProfileCompletedGuard } from 'src/app/guards/ensure-profile-completed.guard';
import { CreateVehicleDto } from '../dto/vehicle.dto';

@ApiTags('Vehicle-listing')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard)
@ApiBearerAuth('jwt')
@Controller('api/v1')
export class VehicleListingController {
  private readonly logger = new CustomLogger(VehicleListingController.name);

  constructor(private readonly vehicleVinsService: VehicleVinsService) {}

  @Post('/vehicle-vin')
  async addVehicleVin(@Request() req: any, @Body() dto: CreateVehicleVinsDto) {
    try {
      return await this.vehicleVinsService.create(req, dto);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @Get('/vehicle-vin')
  async getVehicleVin(@Request() req: any) {
    try {
      return await this.vehicleVinsService.show(req);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @Post('/vehicles')
  async addCarSpecification(
    @Request() req: any,
    @Body() dto: CreateVehicleDto,
  ) {}
}
