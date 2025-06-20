import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UnprocessableEntityException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { DealershipAttachment } from '../entities/dealership-attachment.entity';
import { EnsureEmailVerifiedGuard } from 'src/app/guards/ensure-email-verified.guard';

@ApiTags('Onboarding')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard)
@Controller('api/v1')
@ApiBearerAuth('jwt')
export class DealershipAttachmentController {
  private readonly logger = new CustomLogger(
    DealershipAttachmentController.name,
  );

  constructor(
    private readonly dealershipAttachementService: DealershipAttachmentService,
  ) {}

  @Post('dealership/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Minimal buffering to access metadata
      // limits: { fileSize: 10485760 }, // Enforce 10MB limit at Multer level
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
  @ApiBody({
    description: 'File upload along with metadata',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully' })
  async uploadAttachment(
    @Request() req: any,
    @Body() dto: DealershipAttachementDto,
  ) {
    const file = req.file;
    if (!file) {
      throw new UnprocessableEntityException('File is required');
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

  @Get('dealership/attachments')
  @ApiOperation({ summary: 'Get all attachments for a dealership' })
  @ApiResponse({
    status: 200,
    description: 'Attachments retrieved successfully',
    type: [DealershipAttachment],
  })
  async getAttachments(@Request() req: any): Promise<DealershipAttachment[]> {
    try {
      return await this.dealershipAttachementService.getAttachments(req);
    } catch (error) {
      this.logger.error(`Failed to retrieve attachments: ${error.message}`);
      throw error;
    }
  }

  @Delete('dealership/attachment/:attachmentId')
  @ApiOperation({ summary: 'Delete an attachment by ID' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async deleteAttachment(
    @Param('attachmentId') attachmentId: number,
  ): Promise<any> {
    try {
      return await this.dealershipAttachementService.deleteAttachment(
        attachmentId,
      );
    } catch (error) {
      this.logger.error(`Failed to delete attachment: ${error.message}`);
      throw error;
    }
  }
}
