import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from 'src/app/common/interfaces/storage-provider';
import { Readable } from 'stream';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private s3Client: S3Client;
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>(
      'fileSystems.disk.s3.bucket',
    ) as string;
    if (!this.bucket) {
      throw new Error('S3 bucket name is not configured');
    }
  }

  async uploadFileStream(
    fileStream: Readable,
    fileName: string,
    folder: string = '',
    fileSize: number = 0,
    contentType?: string,
  ): Promise<string> {
    try {
      const sanitizedFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const key = folder ? `${folder}/${sanitizedFileName}` : sanitizedFileName;

      console.info(`Uploading file to S3 with key: ${key}`);
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileStream,
        ContentLength: fileSize,
        ContentType: contentType || 'application/octet-stream',
      });

      await this.s3Client.send(command);
      const fileUrl = `https://${this.bucket}.s3.amazonaws.com/${key}`;
      console.info(`File uploaded successfully: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error(`S3 stream upload error: ${error.message}`);
      throw new InternalServerErrorException(
        `S3 stream upload error: ${error.message}`,
      );
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const key = folder ? `${folder}/${fileName}` : fileName;

      console.info(`Uploading file to S3 with key: ${key}`);
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);
      const fileUrl = `https://${this.bucket}.s3.amazonaws.com/${key}`;
      console.info(`File uploaded successfully: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error(`S3 upload error: ${error.message}`);
      throw new InternalServerErrorException(
        `S3 upload error: ${error.message}`,
      );
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (!filePath) {
        throw new BadRequestException('File path is required');
      }

      // Extract the key from the filePath
      const urlPattern = new RegExp(
        `https://${this.bucket}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)`,
      );
      const match = filePath.match(urlPattern);
      if (!match || !match[1]) {
        throw new BadRequestException(`Invalid file path: ${filePath}`);
      }
      const key = match[1];

      console.info(`Deleting file from S3 with key: ${key}`);
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      console.info(`File deleted successfully: ${filePath}`);
    } catch (error) {
      console.error(`S3 deletion error: ${error.message}`);
      throw new BadRequestException(
        `File deletion failed: S3 deletion error: ${error.message}`,
      );
    }
  }

  setClient(client: S3Client) {
    this.s3Client = client;
  }
}
