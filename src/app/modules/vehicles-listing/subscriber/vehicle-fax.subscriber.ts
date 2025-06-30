import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { FileUploaderService } from '../../uploads/file-uploader.service';
import { VehicleFaxReport } from '../entities/vehicle-fax-report.entity';

@Injectable()
@EventSubscriber()
export class VehicleFaxReportSubscriber
  implements EntitySubscriberInterface<VehicleFaxReport>
{
  constructor(private readonly fileUploadService: FileUploaderService) {}

  listenTo() {
    return VehicleFaxReport;
  }

  afterLoad(entity: VehicleFaxReport) {
    if (entity.attachment && entity.vehicle_id) {
      entity.attachment = this.fileUploadService.path(
        `vehicle/fax/${entity.vehicle_id}/${entity.attachment}`,
      );
    }
  }
}
