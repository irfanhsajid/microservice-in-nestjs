import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { FileUploaderService } from '../../uploads/file-uploader.service';
import { Readable } from 'stream';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import {
  VehicleFaxReport,
  VehicleFaxReportStatus,
} from '../entities/vehicle-fax-report.entity';
import { Vehicle } from '../entities/vehicles.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { validateCarfaxFormat } from 'src/app/common/utils/carfax.parser';
import { VehicleFaxReportDetails } from '../entities/vehicle-fax-report-details.entity';
import { User } from '../../user/entities/user.entity';
import { FileCacheHandler } from 'src/app/common/utils/file-cache-handler';

@Injectable()
export class VehicleFaxReportService implements ServiceInterface {
  private readonly logger = new CustomLogger(VehicleFaxReportService.name);

  constructor(
    @InjectQueue('vehicle-consumer')
    protected vehicleQueue: Queue,

    @InjectRepository(VehicleFaxReport)
    private readonly vehicleFaxReportRepository: Repository<VehicleFaxReport>,

    @InjectRepository(VehicleFaxReportDetails)
    private readonly vehicleFaxReportDetailsRepository: Repository<VehicleFaxReportDetails>,

    private readonly fileUploadService: FileUploaderService,
  ) {}

  index(req: Request, params: any): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }

  async store(
    req: Request,
    dto: { id: number; file: Express.Multer.File },
  ): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleFaxReportRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let uploadedFiles: any;

    try {
      const vehicle_id = dto.id;
      const userDealership = req['user_default_dealership'] as UserDealership;

      // find a vehicle report
      const vehicle = await queryRunner.manager.findOne(Vehicle, {
        where: {
          id: dto.id,
          vehicle_vin: {
            dealership_id: userDealership.dealership_id,
          },
        },
      });

      if (!vehicle) {
        throw new BadRequestException('Invalid vehicle id');
      }
      // Validate valid carfax buffer
      const isValidFile = await validateCarfaxFormat(dto.file.buffer);

      if (!isValidFile) {
        throw new UnprocessableEntityException('Invalid CARFAX PDF format');
      }
      // Find a vehicle fax attachment report exist
      let vehicleFaxReport = await queryRunner.manager.findOne(
        VehicleFaxReport,
        {
          where: {
            vehicle_id: vehicle.id,
          },
        },
      );

      const folder = `vehicle/fax/${vehicle_id}`;

      // Upload attachment file
      const file = dto.file;
      const fileName = `${Date.now()}-${file.originalname}`;
      const fileStream = Readable.from(file.buffer);
      const key = `${folder}/${fileName}`;

      const newFile = await this.fileUploadService.uploadStream(
        key,
        fileStream,
        file.mimetype,
        file.size,
      );

      uploadedFiles = `${folder}/${newFile}`;

      if (!vehicleFaxReport) {
        // create a vehicle report and upload vehicle and delete old one
        vehicleFaxReport = queryRunner.manager.create(VehicleFaxReport, {
          vehicle_id: vehicle.id,
          attachment: newFile,
          expired_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // add 60 days
          status: VehicleFaxReportStatus.REQUESTED,
        });
      } else {
        // Delete old vehicle fax report and update new one and merge
        // -------------
        // Delete old Fax report
        if (vehicleFaxReport.attachment) {
          await this.fileUploadService.deleteFile(vehicleFaxReport.attachment);
        }

        // Merge vehicle Fax report with new fax file attachment
        vehicleFaxReport = queryRunner.manager.merge(
          VehicleFaxReport,
          vehicleFaxReport,
          {
            attachment: newFile,
            expired_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // add 60 days
            status: VehicleFaxReportStatus.REQUESTED,
          },
        );
      }

      // Save the new vehicle fax
      vehicleFaxReport = await queryRunner.manager.save(
        VehicleFaxReport,
        vehicleFaxReport,
      );

      // save file for report processing
      const cacheFileHandler = new FileCacheHandler();

      const savedCache = await cacheFileHandler.saveFile(file);

      let local = false;

      if (typeof savedCache === 'string') {
        local = true;
      }
      // Add extraction task to queue
      await this.vehicleQueue.add('vehicle-fax-report', {
        vehicleFaxReport,
        filePath: this.fileUploadService.path(uploadedFiles),
        user: req['user'],
        local,
        localPath: savedCache,
      });

      // commit transaction
      await queryRunner.commitTransaction();

      return {
        ...vehicleFaxReport,
        attachment: this.fileUploadService.path(uploadedFiles),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (uploadedFiles) {
        await this.fileUploadService.deleteFile(
          this.fileUploadService.path(uploadedFiles),
        );
      }
      this.logger.error(error);
      return throwCatchError(error);
    } finally {
      await queryRunner.release();
    }
  }

  async show(req: Request, id: number): Promise<Record<string, any>> {
    try {
      const userDealership = req['user_default_dealership'] as UserDealership;
      if (!userDealership) {
        return {};
      }
      return await this.vehicleFaxReportRepository.find({
        where: {
          vehicle_id: id,
          vehicle: {
            vehicle_vin: {
              dealership_id: userDealership.dealership_id,
            },
          },
        },
      });
    } catch (error) {
      this.logger.log(error);
      return throwCatchError(error);
    }
  }

  update(req: Request, dto: any, id: number): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }

  async destroy(req: Request, id: number): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleFaxReportRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const defaultDealership = req[
        'user_default_dealership'
      ] as UserDealership;

      if (!defaultDealership) {
        throw new BadRequestException(
          'Opps, Falied to delete resoure, it might not exist',
        );
      }
      const vehicleFaxReport = await queryRunner.manager.findOne(
        VehicleFaxReport,
        {
          where: {
            id: id,
            vehicle: {
              vehicle_vin: {
                dealership_id: defaultDealership.dealership_id,
              },
            },
          },
        },
      );

      if (!vehicleFaxReport) {
        throw new BadRequestException('Not Vehicle inspection found to delete');
      }

      // try delete the attachment from s3
      if (vehicleFaxReport.attachment) {
        await this.fileUploadService.deleteFile(vehicleFaxReport.attachment);
      }

      // delete attachment from database Record
      await queryRunner.manager.delete(VehicleFaxReport, id);

      // commit transaction
      await queryRunner.commitTransaction();

      return {
        message: `Attachment removed successfully`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      return throwCatchError(error);
    } finally {
      await queryRunner.release();
    }
  }

  async applyForCarFaxReport(
    req: Request,
    id: number,
  ): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleFaxReportRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const defaultDealership = req[
        'user_default_dealership'
      ] as UserDealership;

      let vehicleFaxReport = await queryRunner.manager.findOne(
        VehicleFaxReport,
        {
          where: {
            vehicle_id: id,
            vehicle: {
              vehicle_vin: {
                dealership_id: defaultDealership.dealership_id,
              },
            },
          },
        },
      );

      if (!vehicleFaxReport) {
        // create a vehicle report and upload vehicle and delete old one
        vehicleFaxReport = queryRunner.manager.create(VehicleFaxReport, {
          vehicle_id: id,
          expired_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // add 60 days
          status: VehicleFaxReportStatus.REQUESTED,
        });
      } else {
        // Check if user already requested for carfax report
        if (
          vehicleFaxReport.status === VehicleFaxReportStatus.REQUESTED ||
          vehicleFaxReport.status === VehicleFaxReportStatus.PENDING
        ) {
          return {
            message: 'You have already requested for carfax report',
          };
        }
        // Delete old vehicle fax report and update new one and merge
        // -------------
        // Delete old Fax report
        if (vehicleFaxReport.attachment) {
          await this.fileUploadService.deleteFile(vehicleFaxReport.attachment);
        }

        // Merge vehicle Fax report with new fax file attachment
        vehicleFaxReport = queryRunner.manager.merge(
          VehicleFaxReport,
          vehicleFaxReport,
          {
            expired_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // add 60 days
            status: VehicleFaxReportStatus.REQUESTED,
            attachment: null,
          },
        );
      }

      await queryRunner.manager.save(VehicleFaxReport, vehicleFaxReport);

      // Add extraction task to queue
      await this.vehicleQueue.add('vehicle-fax-report-apply', vehicleFaxReport);

      // commit transaction
      await queryRunner.commitTransaction();

      return {
        message: `CarFax report applied successfully`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      return throwCatchError(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getFaxReportDetails(req: Request, id: number): Promise<any> {
    try {
      const user = req['user'] as User;
      const carFaxReportData =
        await this.vehicleFaxReportDetailsRepository.findOne({
          where: {
            vehicle_fax_report_id: id,
            vehicle_fax_report: {
              vehicle: {
                vehicle_vin: {
                  user_id: user.id,
                },
              },
            },
          },
          relations: [
            'accidents',
            'service_records',
            'detailed_history',
            'recalls',
          ],
        });

      return carFaxReportData;
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
