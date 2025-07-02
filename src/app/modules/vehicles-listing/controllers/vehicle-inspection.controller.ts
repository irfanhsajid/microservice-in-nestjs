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
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { EnsureEmailVerifiedGuard } from 'src/app/guards/ensure-email-verified.guard';
import { allowedImageMimeTypes } from 'src/app/common/types/allow-file-type';
import { EnsureProfileCompletedGuard } from 'src/app/guards/ensure-profile-completed.guard';
import { VehicleInspectionService } from '../services/vehicle-inspection.service';
import { CreateVehicleInspectionDto } from '../dto/vehicle-inspection.dto';
import {
  VehicleInspectionTitleType,
  VehicleInspectionType,
} from '../entities/vehicle-inspection.entity';
import { CustomFileInterceptor } from 'src/app/common/interceptors/file-upload.interceptor';

@ApiTags('Vehicle-Inspection')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard)
@Controller('api/v1')
@ApiBearerAuth('jwt')
export class VehicleInspectionController {
  private readonly logger = new CustomLogger(VehicleInspectionController.name);

  constructor(
    private readonly vehicleInspectionService: VehicleInspectionService,
  ) {}

  @Post('vehicle/inspection/:vehicleId')
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
        title: {
          type: 'string',
          enum: Object.values(VehicleInspectionTitleType),
          description: 'The type of vehicle inspection view',
          example: 'FRONT_VIEW',
        },
        type: {
          type: 'string',
          enum: Object.values(VehicleInspectionType),
          description: 'The title of the vehicle inspection',
          example: 'INTERIOR',
        },
        number_of_issues: {
          type: 'number',
          description: 'The number of issues found during the inspection',
          example: 3,
        },
        description: {
          type: 'string',
          description: 'Detailed description of the inspection findings',
          example:
            'Minor scratches on the front bumper, headlight alignment issue detected.',
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
    @Param('vehicleId') id: number,
    @Body() dto: CreateVehicleInspectionDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new UnprocessableEntityException({
        file: 'The File is required',
      });
    }

    const dtoCombine = {
      id,
      file: file,
      dto: dto,
    };

    return await this.vehicleInspectionService.store(req, dtoCombine);
  }

  @Get('vehicle/inspection/:vehicleId')
  @ApiOperation({ summary: 'Get all attachments for a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Attachments retrieved successfully',
  })
  async getAttachments(
    @Request() req: any,
    @Param('vehicleId') id: number,
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
