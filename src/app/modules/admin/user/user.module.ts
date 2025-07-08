import { Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module';
import { CaslModule } from '../../auth/casl/casl.module';
import { AdminUserService } from './services/user.service';
import { AdminUserController } from './controllers/user.controller';
import { UploadsModule } from '../../uploads/uploads.module';
import { AdminUserSubscriber } from './subscriber/user.subscriber';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FileUploaderService } from '../../uploads/file-uploader.service';

@Module({
  imports: [UserModule, CaslModule, UploadsModule],
  providers: [AdminUserService],
  controllers: [AdminUserController],
})
export class AdminUserModule {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly fileUploaderService: FileUploaderService,
  ) {}

  onModuleInit() {
    const subscriber = new AdminUserSubscriber(this.fileUploaderService);
    this.dataSource.subscribers.push(subscriber);
  }
}
