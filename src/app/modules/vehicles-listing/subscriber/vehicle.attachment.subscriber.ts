import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { FileUploaderService } from '../../uploads/file-uploader.service';
import { VehicleAttachment } from '../entities/vehicle-attachments.entity';

@Injectable()
@EventSubscriber()
export class VehicleAttachmentSubscriber
  implements EntitySubscriberInterface<VehicleAttachment>
{
  constructor(private readonly fileUploadService: FileUploaderService) {}

  listenTo() {
    return VehicleAttachment;
  }

  afterLoad(entity: VehicleAttachment) {
    if (entity.path && entity.vehicle_id) {
      entity.path = this.fileUploadService.path(
        `vehicle/images/${entity.vehicle_id}/${entity.path}`,
      );
    }
  }
}
