import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  Response,
  UnprocessableEntityException,
  UploadedFile,
  UploadedFiles,
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
import { EnsureEmailVerifiedGuard } from 'src/app/guards/ensure-email-verified.guard';
import { allowedImageMimeTypes } from 'src/app/common/types/allow-file-type';
import { EnsureProfileCompletedGuard } from 'src/app/guards/ensure-profile-completed.guard';
import { VehicleAttachmentService } from '../services/vehicle-attachment.service';
import { CustomFileInterceptor } from 'src/app/common/interceptors/file-upload.interceptor';

@ApiTags('Vehicle-listing')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard)
@ApiBearerAuth('jwt')
@Controller('api/v1')
export class VehicleAttachmentController {
  private readonly logger = new CustomLogger(VehicleAttachmentController.name);

  constructor(
    private readonly vehicleAttachmentService: VehicleAttachmentService,
  ) {}

  @Post('vehicle/attachments/:vinId')
  @UseInterceptors(
    new CustomFileInterceptor(
      'file',
      1,
      {
        limits: {
          fileSize: 1024 * 1024 * 100,
        },
      },
      allowedImageMimeTypes,
    ),
  )
  @ApiOperation({ summary: 'Upload an attachment for a vehicle' })
  @ApiBody({
    description: 'File upload along with metadata',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Attachments uploaded successfully',
  })
  async upload(
    @Request() req: any,
    @Param('vinId') id: number,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new UnprocessableEntityException({
        file: 'The file field is required',
      });
    }

    const dtoCombine = {
      id,
      file: file,
    };

    return await this.vehicleAttachmentService.store(req, dtoCombine);
  }

  @Get('vehicle/attachments/:vinId')
  @ApiOperation({ summary: 'Get all attachments for a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Attachments retrieved successfully',
  })
  async getAttachments(
    @Request() req: any,
    @Param('vinId') id: number,
  ): Promise<any> {
    try {
      return await this.vehicleAttachmentService.show(req, id);
    } catch (error) {
      this.logger.error(`Failed to retrieve attachments: ${error.message}`);
      throw error;
    }
  }

  @Delete('vehicle/attachments/:id')
  @ApiOperation({ summary: 'Delete an attachment by ID' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async delete(@Request() req: any, @Param('id') id: number): Promise<any> {
    try {
      return await this.vehicleAttachmentService.destroy(req, id);
    } catch (error) {
      this.logger.error(`Failed to delete attachment: ${error.message}`);
      throw error;
    }
  }
}
