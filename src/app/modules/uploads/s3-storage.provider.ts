import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from 'src/app/common/interfaces/storage-provider';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private s3Client: S3Client;
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket =
      this.configService.get<string>('fileSystems.disk.s3.bucket') || '';
  }

  setClient(client: S3Client) {
    this.s3Client = client;
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const fileName = `${file.originalname}`;
      const key = folder ? `${folder}/${fileName}` : fileName;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);
      return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    } catch (error) {
      throw new InternalServerErrorException(
        `S3 upload error: ${error.message}`,
      );
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const key = filePath.replace(
        `https://${this.bucket}.s3.amazonaws.com/`,
        '',
      );
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException(
        `S3 deletion error: ${error.message}`,
      );
    }
  }
}
