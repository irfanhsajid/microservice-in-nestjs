import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiGuard } from '../../../guards/api.guard';
import { EnsureEmailVerifiedGuard } from '../../../guards/ensure-email-verified.guard';
import { EnsureProfileCompletedGuard } from '../../../guards/ensure-profile-completed.guard';
import { responseReturn } from '../../../common/utils/response-return';
import { throwCatchError } from '../../../common/utils/throw-error';
import { VehicleInspectionLinkDto } from '../dto/vehicle-inspection-link.dto';
import { CustomLogger } from '../../logger/logger.service';
import { VehicleInspectionLinkService } from '../services/vehicle-inspection-link.service';

@ApiTags('Vehicle-Inspection-Link')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard)
@ApiBearerAuth('jwt')
@Controller('api/v1')
export class VehicleInspectionLinkController {
  constructor(
    protected readonly vehicleInspectionLinkService: VehicleInspectionLinkService,
  ) {}
  private readonly logger = new CustomLogger(
    VehicleInspectionLinkController.name,
  );
  @Post('/vehicle-inspection-link/:vehicleId')
  async addVehicleInspectionLink(
    @Body() dto: VehicleInspectionLinkDto,
    @Param('vehicleId') vehicleId: number,
  ) {
    try {
      const vehiclesInspectLink =
        await this.vehicleInspectionLinkService.createOrUpdate(dto, vehicleId);
      return responseReturn(
        'Vehicle inspection link created successfully',
        vehiclesInspectLink,
      );
    } catch (error) {
      this.logger.error(error);
      console.log(
        'Error in VehicleController.addVehicleInspectionLink:',
        error,
      );
      return throwCatchError(error);
    }
  }
}
