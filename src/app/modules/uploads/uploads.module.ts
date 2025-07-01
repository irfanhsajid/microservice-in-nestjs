import { Module } from '@nestjs/common';
import { FileUploaderService } from './file-uploader.service';
import { LocalStorageProvider } from './local-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageProvider } from 'src/app/common/interfaces/storage-provider';
import { S3Client } from '@aws-sdk/client-s3';
import { UploadsController } from './uploads.controller';
import { Agent } from 'https';
import { Agent as HttpAgent } from 'http';
import { NodeHttpHandler } from '@smithy/node-http-handler';

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
          const region = configService.get<string>(
            'fileSystems.disk.s3.region',
          );
          const endpoint = configService.get<string>(
            'fileSystems.disk.s3.endpoint',
          );
          const accessKeyId = configService.get<string>(
            'fileSystems.disk.s3.accessKeyId',
          );
          const secretAccessKey = configService.get<string>(
            'fileSystems.disk.s3.accessKey',
          );
          console.info(region, endpoint, accessKeyId, secretAccessKey);
          if (!region || !accessKeyId || !secretAccessKey) {
            throw new Error('Missing required S3 configuration.');
          }

          const agentConfig = {
            keepAlive: true,
            maxSockets: 50,
          };

          s3Provider.setClient(
            new S3Client({
              region,
              ...(endpoint ? { endpoint: endpoint } : {}),
              credentials: {
                accessKeyId,
                secretAccessKey,
              },
              requestHandler: new NodeHttpHandler({
                httpAgent: new HttpAgent(agentConfig),
                httpsAgent: new Agent(agentConfig),
              }),
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
  exports: [FileUploaderService, 'STORAGE_PROVIDER'],
})
export class UploadsModule {}
