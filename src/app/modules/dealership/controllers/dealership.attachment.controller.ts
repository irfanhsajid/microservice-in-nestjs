import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UnprocessableEntityException,
  UploadedFile,
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
import {
  DealershipAttachmentDto,
  DealershipAttachmentFileType,
} from '../dto/dealership-attachment.dto';
import { memoryStorage } from 'multer';
import { Readable } from 'stream';
import { DealershipAttachment } from '../entities/dealership-attachment.entity';
import { EnsureEmailVerifiedGuard } from 'src/app/guards/ensure-email-verified.guard';
import { allowedMimeTypes } from 'src/app/common/types/allow-file-type';
import { CustomFileInterceptor } from 'src/app/common/interceptors/file-upload.interceptor';

@ApiTags('Onboarding')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard)
@Controller('api/v1')
@ApiBearerAuth('jwt')
export class DealershipAttachmentController {
  private readonly logger = new CustomLogger(
    DealershipAttachmentController.name,
  );

  constructor(
    private readonly dealershipAttachmentService: DealershipAttachmentService,
  ) {}

  @Post('dealership/attachments')
  @UseInterceptors(
    new CustomFileInterceptor(
      'file',
      1,
      {
        limits: {
          // limit to 100Mb
          fileSize: 1024 * 1024 * 100,
        },
      },
      allowedMimeTypes,
    ),
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
          enum: Object.values(DealershipAttachmentFileType),
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully' })
  async uploadAttachment(
    @Request() req: any,
    @Body() dto: DealershipAttachmentDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new UnprocessableEntityException({
        file: 'File is required',
      });
    }

    return this.dealershipAttachmentService.uploadAttachment(req, dto, file);
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
      return await this.dealershipAttachmentService.getAttachments(req);
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
      return await this.dealershipAttachmentService.deleteAttachment(
        attachmentId,
      );
    } catch (error) {
      this.logger.error(`Failed to delete attachment: ${error.message}`);
      throw error;
    }
  }
}
