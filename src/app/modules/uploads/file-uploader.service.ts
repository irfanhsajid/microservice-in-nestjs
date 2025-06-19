import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { StorageProvider } from 'src/app/common/interfaces/storage-provider';
import { Readable } from 'stream';

@Injectable()
export class FileUploaderService {
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
      const filePath = await this.storageProvider.uploadFile(file, folder);
      return filePath;
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async uploadFileStream(
    fileStream: Readable,
    fileName: string,
    folder: string = '',
  ): Promise<string> {
    if (!fileStream || !fileName) {
      throw new BadRequestException('File stream or file name not provided');
    }

    try {
      const filePath = await this.storageProvider.uploadFileStream(
        fileStream,
        fileName,
        folder,
      );
      return filePath;
    } catch (error) {
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.storageProvider.deleteFile(filePath);
    } catch (error) {
      throw new BadRequestException(`File deletion failed: ${error.message}`);
    }
  }
}
