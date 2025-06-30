import { CustomLogger } from '../../logger/logger.service';
import {
  Controller,
  Body,
  Post,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import { throwCatchError } from '../../../common/utils/throw-error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiGuard } from '../../../guards/api.guard';
import { EnsureEmailVerifiedGuard } from '../../../guards/ensure-email-verified.guard';
import { EnsureProfileCompletedGuard } from '../../../guards/ensure-profile-completed.guard';
import { EnsureHasDealershipGuard } from 'src/app/guards/ensure-has-dealership.guard';
import { VehicleInformationService } from '../services/vehicle-information.service';
import { CreateVehicleInformationDto } from '../dto/vehicle-information.dto';

@ApiTags('Vehicle-listing')
@UseGuards(
  ApiGuard,
  EnsureEmailVerifiedGuard,
  EnsureProfileCompletedGuard,
  //EnsureHasDealershipGuard,
)
@ApiBearerAuth('jwt')
@Controller('api/v1')
export class VehicleInformationController {
  private readonly logger = new CustomLogger(VehicleInformationController.name);

  constructor(
    private readonly vehicleInformationService: VehicleInformationService,
  ) {}

  @Post('/vehicles/information/:vinId')
  async store(
    @Request() req: any,
    @Body() dto: CreateVehicleInformationDto,
    @Param('vinId') id: number,
  ) {
    try {
      return await this.vehicleInformationService.store(req, { id, dto });
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
