import { CustomLogger } from '../../logger/logger.service';
import { VehicleService } from '../services/vechicle.service';
import { Body, Get, Post, Request } from '@nestjs/common';
import { throwCatchError } from '../../../common/utils/throw-error';
import { CreateVehicleDto } from '../dto/vehicle.dto';

export class VehicleController {
  private readonly logger = new CustomLogger(VehicleController.name);

  constructor(private readonly vehicleService: VehicleService) {}

  @Get('/vehicles')
  async index(@Request() req: any): Promise<any> {
    try {
      return await this.vehicleService.index(req);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @Post('/vehicles')
  async addCarSpecification(
    @Request() req: any,
    @Body() dto: CreateVehicleDto,
  ) {
    try {
      return await this.vehicleService.store(req, dto);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
