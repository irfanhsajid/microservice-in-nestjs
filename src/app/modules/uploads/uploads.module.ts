import { Module } from '@nestjs/common';
import { FileUploaderService } from './file-uploader.service';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageProvider } from 'src/app/common/interfaces/storage-provider';
import { S3Client } from '@aws-sdk/client-s3';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [ConfigModule],
  providers: [
    FileUploaderService,
    LocalStorageProvider,
    S3StorageProvider,
    {
      provide: 'STORAGE_PROVIDER',
      useFactory: (
        configService: ConfigService,
        localProvider: LocalStorageProvider,
        s3Provider: S3StorageProvider,
      ): StorageProvider => {
        const storageType = configService.get<string>(
          'fileSystems.default',
          'local',
        );

        if (storageType === 's3') {
          const region = configService.get<string>('fileSystems.s3.region');
          const endpoint = configService.get<string>('fileSystems.s3.endpoint');
          const accessKeyId = configService.get<string>(
            'fileSystems.s3.accessKeyId',
          );
          const secretAccessKey = configService.get<string>(
            'fileSystems.s3.accessKey',
          );

          if (!region || !endpoint || !accessKeyId || !secretAccessKey) {
            throw new Error('Missing required S3 configuration.');
          }

          s3Provider.setClient(
            new S3Client({
              region,
              endpoint,
              credentials: {
                accessKeyId,
                secretAccessKey,
              },
            }),
          );
          return s3Provider;
        }
        return localProvider;
      },
      inject: [ConfigService, LocalStorageProvider, S3StorageProvider],
    },
  ],
  controllers: [UploadsController],
  exports: [FileUploaderService],
})
export class UploadsModule {}
