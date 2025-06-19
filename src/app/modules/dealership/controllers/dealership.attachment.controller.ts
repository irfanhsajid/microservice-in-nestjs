import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiGuard } from 'src/app/guards/api.guard';
import { CustomLogger } from '../../logger/logger.service';
import { DealershipAttachmentService } from '../services/dealership-attachment.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DealershipAttachementDto } from '../dto/dealership-attachment.dto';
import { memoryStorage } from 'multer';
import { Readable } from 'stream';

@ApiTags('Onboarding')
@UseGuards(ApiGuard)
@Controller('api/v1')
@ApiBearerAuth('jwt')
export class DealershipAttachmentController {
  private readonly logger = new CustomLogger(
    DealershipAttachmentController.name,
  );

  constructor(
    private readonly dealershipAttachementService: DealershipAttachmentService,
  ) {}

  @Post('dealership/attachment')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Minimal buffering to access metadata
      limits: { fileSize: 10485760 }, // Enforce 10MB limit at Multer level
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'text/plain',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Upload an attachment for a dealership' })
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully' })
  async uploadAttachment(
    @Request() req: any,
    @Body() dto: DealershipAttachementDto,
  ) {
    const file = req.file;
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Create a readable stream from the file buffer (Multer still buffers in memoryStorage)
    // Note: This is not ideal for large files; see below for a fully streaming alternative
    const fileStream = Readable.from(file.buffer);

    return this.dealershipAttachementService.uploadAttachment(
      req,
      fileStream,
      dto,
    );
  }
}
