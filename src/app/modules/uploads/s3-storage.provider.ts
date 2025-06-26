import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
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

  path(path: string): string {
    return `https://${this.bucket}.s3.amazonaws.com/${path}`;
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
      console.info(`File uploaded successfully: ${key}`);
      return sanitizedFileName;
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
      console.info(
        `Deleting file from S3 with key: ${filePath}, bucket: ${this.bucket}`,
      );

      // Verify object exists (optional, for better error handling)
      try {
        await this.s3Client.send(
          new HeadObjectCommand({
            Bucket: this.bucket,
            Key: filePath,
          }),
        );
        console.info('File exists, proceeding with deletion');
      } catch (error) {
        if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
          throw new BadRequestException(`File does not exist: ${filePath}`);
        }
        throw new BadRequestException(
          `Error checking file existence: ${error.message}`,
        );
      }

      // Delete object using the extracted key
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: filePath, // Use the extracted key, not filePath
        }),
      );
      console.info(`File deleted successfully: ${filePath}`);
    } catch (error) {
      console.error('S3 deletion error:', error);
      if (error.name === 'NoSuchKey' || error.name === 'NotFound') {
        throw new BadRequestException(`File does not exist: ${filePath}`);
      } else if (error.name === 'AccessDenied') {
        throw new BadRequestException('Permission denied to delete file');
      }
      throw new BadRequestException(`File deletion failed: ${error.message}`);
    }
  }

  setClient(client: S3Client) {
    this.s3Client = client;
  }
}
