import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DealershipAttachment } from '../entities/dealership-attachment.entity';
import { FileUploaderService } from '../../uploads/file-uploader.service';

@Injectable()
@EventSubscriber()
export class DealershipAttachmentSubscriber
  implements EntitySubscriberInterface<DealershipAttachment>
{
  constructor(private readonly fileUploadService: FileUploaderService) {}

  listenTo() {
    return DealershipAttachment;
  }

  afterLoad(entity: DealershipAttachment) {
    if (entity.path && entity.dealership_id) {
      entity.path = this.fileUploadService.path(
        `dealership/${entity.dealership_id}/${entity.path}`,
      );
    }
  }
}
