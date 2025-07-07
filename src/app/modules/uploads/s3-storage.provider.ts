/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-misused-promises */
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

      await new Promise<void>((resolve, reject) => {
        setImmediate(async () => {
          try {
            await this.s3Client.send(command);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });

      // await this.s3Client.send(command);
      const fileUrl = `https://${this.bucket}.s3.amazonaws.com/${key}`;
      console.info(`File uploaded successfully: ${fileUrl}`);
      return fileName;
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
      const key = this.getKeyFromPath(filePath);
      console.log('extracted key', key);
      // Verify object exists (optional, for better error handling)
      try {
        await this.s3Client.send(
          new HeadObjectCommand({
            Bucket: this.bucket,
            Key: key,
          }),
        );
        console.info('File exists, proceeding with deletion');
      } catch (error) {
        if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
          throw new BadRequestException(`File does not exist: ${key}`);
        }
        throw new BadRequestException(
          `Error checking file existence: ${error.message}`,
        );
      }

      await new Promise<void>((resolve, reject) => {
        setImmediate(async () => {
          try {
            await this.s3Client.send(
              new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
              }),
            );
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });

      console.info(`File deleted successfully: ${key}`);
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

  async uploadStream(
    key: string,
    fileStream: Readable,
    contentType: string,
    size: number,
    retries = 3,
    delay = 1000,
  ): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: fileStream,
          ContentType: contentType,
          ContentLength: size,
        });
        await this.s3Client.send(command);
        return key.split('/').pop()!;
      } catch (err: any) {
        if (err.Code === 'SlowDown' && attempt < retries) {
          console.warn(
            `S3 SlowDown error, retrying in ${delay}ms... attempt ${attempt}`,
          );
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
        } else {
          console.error('S3 upload failed:', err);
          throw new InternalServerErrorException('Failed to upload file');
        }
      }
    }
    throw new InternalServerErrorException('Exceeded upload retries');
  }

  getKeyFromPath(url: string) {
    const u = new URL(url);
    // const path = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;

    // return path;
    return url.replace(u.origin + '/', '');
  }

  setClient(client: S3Client) {
    this.s3Client = client;
  }
}
