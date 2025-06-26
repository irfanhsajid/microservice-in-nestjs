import {
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
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { EnsureEmailVerifiedGuard } from 'src/app/guards/ensure-email-verified.guard';
import { allowedImageMimeTypes } from 'src/app/common/types/allow-file-type';
import { EnsureProfileCompletedGuard } from 'src/app/guards/ensure-profile-completed.guard';
import { VehicleAttachmentService } from '../services/vehicle-attachment.service';
import { EnsureHasDealershipGuard } from 'src/app/guards/ensure-has-dealership.guard';
import { VehicleInspectionService } from '../services/vehicle-inspection.service';

@ApiTags('Vehicle-listing')
@UseGuards(
  ApiGuard,
  EnsureEmailVerifiedGuard,
  EnsureProfileCompletedGuard,
  EnsureHasDealershipGuard,
)
@Controller('api/v1')
@ApiBearerAuth('jwt')
export class VehicleInspectionController {
  private readonly logger = new CustomLogger(VehicleInspectionController.name);

  constructor(
    private readonly vehicleInspectionService: VehicleInspectionService,
  ) {}

  @Post('vehicle/inspection/:vinId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Minimal buffering to access metadata
      // limits: { fileSize: 10485760 }, // Enforce 10MB limit at Multer level
      fileFilter: (req, file, cb) => {
        if (!allowedImageMimeTypes.includes(file.mimetype)) {
          return cb(
            new UnprocessableEntityException({
              file: `Invalid file type. Allowed types: ${allowedImageMimeTypes.join(', ')}`,
            }),
            false,
          );
        }
        cb(null, true);
      },
    }),
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
  async upload(@Request() req: any, @Param('vinId') id: number) {
    const file = req.file;

    // Validate file count (3 to 5 files required)
    if (!file) {
      throw new UnprocessableEntityException({
        files: 'You must upload between 3 and 5 files.',
      });
    }

    const dtoCombine = {
      id,
      file: file,
    };

    return await this.vehicleInspectionService.store(req, dtoCombine);
  }

  @Get('vehicle/inspection/:vinId')
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
      return await this.vehicleInspectionService.show(req, id);
    } catch (error) {
      this.logger.error(`Failed to retrieve attachments: ${error.message}`);
      throw error;
    }
  }

  @Delete('vehicle/inspection/:id')
  @ApiOperation({ summary: 'Delete an attachment by ID' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async delete(@Request() req: any, @Param('id') id: number): Promise<any> {
    try {
      return await this.vehicleInspectionService.destroy(req, id);
    } catch (error) {
      this.logger.error(`Failed to delete attachment: ${error.message}`);
      throw error;
    }
  }
}
