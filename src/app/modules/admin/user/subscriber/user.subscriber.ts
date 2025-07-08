import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from 'src/app/modules/user/entities/user.entity';
import { FileUploaderService } from 'src/app/modules/uploads/file-uploader.service';

@Injectable()
@EventSubscriber()
export class AdminUserSubscriber implements EntitySubscriberInterface<User> {
  constructor(private readonly fileUploadService: FileUploaderService) {}

  listenTo() {
    return User;
  }

  afterLoad(entity: User) {
    if (entity.avatar) {
      entity.avatar = this.fileUploadService.path(
        `user/avatar/${entity.avatar}`,
      );
    }
  }
}
