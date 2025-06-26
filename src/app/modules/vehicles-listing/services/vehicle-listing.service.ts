import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';

@Injectable()
export class VehicleListingService {
  private readonly logger = new CustomLogger(VehicleListingService.name);
}
