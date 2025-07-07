import {
  Controller,
  Get,
  Param,
  Post,
  Put,
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
import {
  allowedCarFaxMimeTypes,
  allowedImageMimeTypes,
} from 'src/app/common/types/allow-file-type';
import { EnsureProfileCompletedGuard } from 'src/app/guards/ensure-profile-completed.guard';
import { VehicleFaxReportService } from '../services/vehicle-fax-report.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { CustomFileInterceptor } from 'src/app/common/interceptors/file-upload.interceptor';

@ApiTags('Vehicle-CARFAX-Report')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard)
@Controller('api/v1')
@ApiBearerAuth('jwt')
export class VehicleFaxReportController {
  private readonly logger = new CustomLogger(VehicleFaxReportController.name);

  constructor(
    private readonly vehicleFaxReportService: VehicleFaxReportService,
  ) {}

  @Post('vehicle/fax/:vehicleId')
  @UseInterceptors(
    new CustomFileInterceptor(
      'file',
      1,
      {
        limits: {
          fieldSize: 1024 * 1024 * 100,
        },
      },
      allowedCarFaxMimeTypes,
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
    @Param('vehicleId') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new UnprocessableEntityException({
        file: 'The file is required',
      });
    }

    const dtoCombine = {
      id,
      file: file,
    };

    return await this.vehicleFaxReportService.store(req, dtoCombine);
  }

  @Get('vehicle/fax/:vehicleId')
  @ApiOperation({ summary: 'Get all attachments for a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Attachments retrieved successfully',
  })
  async getVehicleFax(
    @Request() req: any,
    @Param('vehicleId') id: number,
  ): Promise<any> {
    try {
      return await this.vehicleFaxReportService.show(req, id);
    } catch (error) {
      this.logger.error(`Failed to retrieve attachments: ${error.message}`);
      throwCatchError(error);
    }
  }

  @Put('vehicle/fax/:vehicleId')
  @ApiOperation({ summary: 'Get all attachments for a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle fax successfully',
  })
  async applyForVehicleFaxReport(
    @Request() req: any,
    @Param('vehicleId') id: number,
  ): Promise<any> {
    try {
      return await this.vehicleFaxReportService.applyForCarFaxReport(req, id);
    } catch (error) {
      this.logger.error(`Failed to retrieve attachments: ${error.message}`);
      throwCatchError(error);
    }
  }

  @Get('vehicle/fax/details/:faxReportId')
  async getFaxReportDetails(
    @Request() req: any,
    @Param('faxReportId') id: number,
  ): Promise<any> {
    try {
      return await this.vehicleFaxReportService.getFaxReportDetails(req, id);
    } catch (error) {
      this.logger.error(error);
      throwCatchError(error);
    }
  }
}
