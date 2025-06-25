import { CustomLogger } from '../../logger/logger.service';
import { VehicleService } from '../services/vechicle.service';
import { Get, Request } from '@nestjs/common';
import { throwCatchError } from '../../../common/utils/throw-error';

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
}
