import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StorageProvider } from 'src/app/common/interfaces/storage-provider';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { pipeline, Readable } from 'stream';
import * as file from 'fs';

import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>(
      'fileSystems.disk.local.root',
      'uploads',
    );
  }

  path(path: string): string {
    return `${this.configService.get<string>('app.url', '')}/storage/${path}`;
  }

  async uploadFileStream(
    fileStream: Readable,
    fileName: string,
    folder: string,
  ): Promise<string> {
    try {
      const uploadPath = path.join(this.uploadDir, folder);
      await fs.mkdir(uploadPath, { recursive: true });

      const sanitizedFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadPath, sanitizedFileName);

      const writeStream = file.createWriteStream(filePath);
      await pipelineAsync(fileStream, writeStream);

      return path.join(folder, sanitizedFileName);
    } catch (error) {
      throw new InternalServerErrorException(
        `Local storage stream upload error: ${error.message}`,
      );
    }
  }
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const uploadPath = path.join(this.uploadDir, folder);
      await fs.mkdir(uploadPath, { recursive: true });

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadPath, fileName);
      await fs.writeFile(filePath, file.buffer);

      return path.join(folder, fileName);
    } catch (error) {
      throw new InternalServerErrorException(
        `Local storage error: ${error.message}`,
      );
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      throw new InternalServerErrorException(
        `Local storage deletion error: ${error.message}`,
      );
    }
  }
}
