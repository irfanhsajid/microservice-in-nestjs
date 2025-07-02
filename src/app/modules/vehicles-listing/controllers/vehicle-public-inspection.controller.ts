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
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomLogger } from '../../logger/logger.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { allowedImageMimeTypes } from 'src/app/common/types/allow-file-type';
import { VehicleInspectionService } from '../services/vehicle-inspection.service';
import { CreateVehicleInspectionDto } from '../dto/vehicle-inspection.dto';
import {
  VehicleInspectionTitleType,
  VehicleInspectionType,
} from '../entities/vehicle-inspection.entity';
import { EnsureTokenIsValidGuard } from '../../../guards/ensure-token-valid.guard';

@ApiTags('Vehicle-Public-Inspection')
@UseGuards(EnsureTokenIsValidGuard)
@Controller('api/v1')
export class VehiclePublicInspectionController {
  private readonly logger = new CustomLogger(
    VehiclePublicInspectionController.name,
  );

  constructor(
    private readonly vehicleInspectionService: VehicleInspectionService,
  ) {}

  @Post('vehicle/public-inspection/:vehicleId')
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
  ) {
    const file = req.file;

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

  @Get('vehicle/public-inspection/:vehicleId')
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

  @Delete('vehicle/public-inspection/:id')
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
