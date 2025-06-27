import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { FileUploaderService } from '../../uploads/file-uploader.service';
import { VehicleInspection } from '../entities/vehicle-inspection.entity';

@Injectable()
@EventSubscriber()
export class VehicleInspectionSubscriber
  implements EntitySubscriberInterface<VehicleInspection>
{
  constructor(private readonly fileUploadService: FileUploaderService) {}

  listenTo() {
    return VehicleInspection;
  }

  afterLoad(entity: VehicleInspection) {
    if (entity.path && entity.vehicle_id) {
      entity.path = this.fileUploadService.path(
        `vehicle/inspection/${entity.vehicle_id}/${entity.path}`,
      );
    }
  }
}
