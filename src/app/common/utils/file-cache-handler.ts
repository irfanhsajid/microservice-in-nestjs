import * as fs from 'fs/promises';
import * as path from 'path';
import { CustomLogger } from 'src/app/modules/logger/logger.service';

export class FileCacheHandler {
  private readonly uploadDir: string = 'storage/app/temp';
  private readonly logger = new CustomLogger(FileCacheHandler.name);

  async saveFile(
    file: Express.Multer.File,
    folder: string = '',
  ): Promise<string | boolean> {
    try {
      const uploadPath = path.join(this.uploadDir, folder);
      await fs.mkdir(uploadPath, { recursive: true });

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadPath, fileName);
      await fs.writeFile(filePath, file.buffer);

      return filePath;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
