import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { StorageProvider } from 'src/app/common/interfaces/storage-provider';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { Readable } from 'stream';
import { CustomLogger } from '../logger/logger.service';

@Injectable()
export class FileUploaderService {
  private readonly logger = new CustomLogger(FileUploaderService.name);

  constructor(
    @Inject('STORAGE_PROVIDER') private storageProvider: StorageProvider,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    folder: string = '',
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      return await this.storageProvider.uploadFile(file, folder);
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async uploadFileStream(
    fileStream: Readable,
    fileName: string,
    fileSize: number = 0,
    folder: string = '',
  ): Promise<string> {
    if (!fileStream || !fileName) {
      throw new BadRequestException('File stream or file name not provided');
    }

    try {
      return await this.storageProvider.uploadFileStream(
        fileStream,
        fileName,
        folder,
        fileSize,
      );
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.storageProvider.deleteFile(filePath);
    } catch (error) {
      this.logger.log(error);
      throwCatchError(error);
    }
  }

  path(path: string): string {
    return this.storageProvider.path(path);
  }
}
