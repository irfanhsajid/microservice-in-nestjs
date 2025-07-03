import { Readable } from 'stream';

export interface StorageProvider {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
  path(path: string): string;
  uploadStream(
    key: string,
    fileStream: Readable,
    contentType: string,
    size: number,
  ): Promise<string>;
}
