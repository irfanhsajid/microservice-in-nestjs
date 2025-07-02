import { Readable } from 'stream';

export interface StorageProvider {
  uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
  uploadFileStream(
    fileStream: Readable,
    fileName: string,
    folder: string,
    fileSize: number,
  ): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
  path(path: string): string;
  uploadFileFromPath(filePath: string, key: string, contentType): Promise<any>;
  uploadStream(
    key: string,
    fileStream: Readable,
    contentType: string,
    size: number,
  ): Promise<string>;
}
