import { CreateVehicleInspectionDto } from './../dto/vehicle-inspection.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { FileUploaderService } from '../../uploads/file-uploader.service';
import { Readable } from 'stream';
import { User } from '../../user/entities/user.entity';
import { VehicleInspection } from '../entities/vehicle-inspection.entity';
import { VehicleInspectionReport } from '../entities/vehicle-inspection-report.entity';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import { VehicleFaxReport } from '../entities/vehicle-fax-report.entity';
import { Vehicle } from '../entities/vehicles.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { validateCarfaxFormat } from 'src/app/common/utils/carfax.parser';

@Injectable()
export class VehicleFaxReportService implements ServiceInterface {
  private readonly logger = new CustomLogger(VehicleFaxReportService.name);

  constructor(
    @InjectQueue('vehicle-consumer')
    protected vehicleQueue: Queue,

    @InjectRepository(VehicleFaxReport)
    private readonly vehicleFaxReportRepository: Repository<VehicleFaxReport>,

    private readonly fileUploadService: FileUploaderService,
  ) {}

  index(req: Request, params: any): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }

  async store(
    req: Request,
    dto: { id: number; file: any },
  ): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleFaxReportRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let uploadedFiles: any;

    try {
      const vechicle_id = dto.id;
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
        throw new BadRequestException('Invalid CARFAX PDF format');
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

      const folder = `vehicle/fax/${vechicle_id}`;

      // Upload attachment file
      const fileName = dto.file.originalname;
      const fileStream = Readable.from(dto.file.buffer);
      const fileSize = dto.file.size;

      const newFile = await this.fileUploadService.uploadFileStream(
        fileStream,
        fileName,
        fileSize,
        folder,
      );

      uploadedFiles = `${folder}/${newFile}`;

      if (!vehicleFaxReport) {
        // create a vehicle report and upload vehicle and delete old one
        vehicleFaxReport = queryRunner.manager.create(VehicleFaxReport, {
          vehicle_id: vehicle.id,
          attachment: newFile,
          expired_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // add 60 days
        });
      } else {
        // Delete old vehicle fax report and update new one and merge
        // -------------
        // Delete old Fax report
        await this.fileUploadService.deleteFile(vehicleFaxReport.attachment);

        // Merge vehicle Fax report with new fax file attachment
        vehicleFaxReport = queryRunner.manager.merge(
          VehicleFaxReport,
          vehicleFaxReport,
          {
            attachment: newFile,
            expired_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // add 60 days
          },
        );
      }

      // Save the new vehicle fax
      vehicleFaxReport = await queryRunner.manager.save(
        VehicleFaxReport,
        vehicleFaxReport,
      );

      // Add extraction task to queue
      await this.vehicleQueue.add('vehicle-fax-report', {
        vehicleFaxReport,
        filePath: this.fileUploadService.path(uploadedFiles),
        user: req['user'],
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
      await this.fileUploadService.deleteFile(vehicleFaxReport.attachment);

      // delete attachment from database Record
      await queryRunner.manager.delete(VehicleFaxReport, id);

      // commit transaction
      await queryRunner.commitTransaction();

      return {
        message: `Attachment removed successfully`,
      };
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
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
        });
      } else {
        // Delete old vehicle fax report and update new one and merge
        // -------------
        // Delete old Fax report
        await this.fileUploadService.deleteFile(vehicleFaxReport.attachment);

        // Merge vehicle Fax report with new fax file attachment
        vehicleFaxReport = queryRunner.manager.merge(
          VehicleFaxReport,
          vehicleFaxReport,
          {
            expired_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // add 60 days
          },
        );
      }

      // Add extraction task to queue
      await this.vehicleQueue.add('vehicle-fax-report-apply', vehicleFaxReport);

      // commit transaction
      await queryRunner.commitTransaction();

      return {
        message: `Attachment removed successfully`,
      };
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
