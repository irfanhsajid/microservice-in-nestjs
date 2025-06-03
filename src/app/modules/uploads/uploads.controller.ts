import { Controller } from '@nestjs/common';
import { FileUploaderService } from './file-uploader.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly fileUploader: FileUploaderService) {}

  // @Post('/')
  // @UseInterceptors(FileInterceptor('file'))
  // async Upload(@UploadedFile() file: Express.Multer.File) {
  //   console.log(file);
  //   return this.fileUploader.uploadFile(file);
  // }
}
