import { Readable } from 'stream';

export interface StorageProvider {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
  uploadFileStream(
    fileStream: Readable,
    fileName: string,
    folder: string,
  ): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
}
