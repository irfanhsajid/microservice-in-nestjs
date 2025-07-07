import { CreateVehicleInspectionDto } from './../dto/vehicle-inspection.dto';
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
import { VehicleInspection } from '../entities/vehicle-inspection.entity';
import { VehicleInspectionReport } from '../entities/vehicle-inspection-report.entity';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';

@Injectable()
export class VehicleInspectionService implements ServiceInterface {
  private readonly logger = new CustomLogger(VehicleInspectionService.name);

  constructor(
    @InjectRepository(VehicleInspection)
    private readonly vehicleInspectionRepository: Repository<VehicleInspection>,

    private readonly fileUploadService: FileUploaderService,
  ) {}

  index(req: Request, params: any): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }

  async store(
    req: Request,
    dto: {
      id: number;
      file: Express.Multer.File;
      dto: CreateVehicleInspectionDto;
    },
  ): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleInspectionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let uploadedFiles: any;

    try {
      const vechicle_id = dto.id;
      const defaultUserDealership = req[
        'user_default_dealership'
      ] as UserDealership;

      // find a vehicle report
      let vehicleReport = await queryRunner.manager.findOne(
        VehicleInspectionReport,
        {
          where: {
            vehicle_id: vechicle_id,
            vehicle: {
              vehicle_vin: {
                dealership_id: defaultUserDealership.dealership_id,
              },
            },
          },
        },
      );

      if (!vehicleReport) {
        // check file is exist or not in current vehicle report not exist
        if (!dto.file) {
          throw new UnprocessableEntityException({
            file: 'The File is required',
          });
        }

        vehicleReport = queryRunner.manager.create(VehicleInspectionReport, {
          vehicle_id: vechicle_id,
        });

        vehicleReport = await queryRunner.manager.save(
          VehicleInspectionReport,
          vehicleReport,
        );
      }
      let newFile = '';
      let fileSize = 0;
      // Check if file exist
      if (dto.file) {
        // Upload a file
        const folder = `vehicle/inspection/${vechicle_id}`;
        const file = dto.file;
        const fileName = `${Date.now()}-${file.originalname}`;
        const fileStream = Readable.from(file.buffer);
        const key = `${folder}/${fileName}`;
        newFile = await this.fileUploadService.uploadStream(
          key,
          fileStream,
          file.mimetype,
          file.size,
        );
        uploadedFiles = `${folder}/${newFile}`;
        fileSize = file.size;
      }

      // find inspection
      let inspection = await queryRunner.manager.findOne(VehicleInspection, {
        where: {
          vehicle_id: vechicle_id,
          vehicle_inspection_report_id: vehicleReport.id,
          type: dto.dto.type,
          title: dto.dto.title,
        },
      });

      if (!inspection) {
        inspection = queryRunner.manager.create(VehicleInspection, {
          path: newFile,
          vehicle_id: vechicle_id,
          ...dto.dto,
          vehicle_inspection_report_id: vehicleReport?.id,
          size: fileSize,
        });
      } else {
        inspection = queryRunner.manager.merge(VehicleInspection, inspection, {
          ...dto.dto,
          ...(dto.file ? { path: newFile, size: fileSize } : {}),
        });
      }

      inspection = await queryRunner.manager.save(
        VehicleInspection,
        inspection,
      );

      // commit transaction
      await queryRunner.commitTransaction();

      return {
        ...inspection,
        path: dto.file
          ? this.fileUploadService.path(uploadedFiles)
          : inspection.path,
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
      const defaultDealership = req[
        'user_default_dealership'
      ] as UserDealership;

      if (!defaultDealership) {
        return [];
      }
      return await this.vehicleInspectionRepository.find({
        where: {
          vehicle_id: id,
          vehicle: {
            vehicle_vin: {
              dealership_id: defaultDealership.dealership_id,
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
      this.vehicleInspectionRepository.manager.connection.createQueryRunner();
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

      const inspection = await queryRunner.manager.findOne(VehicleInspection, {
        where: {
          id: id,
          vehicle: {
            vehicle_vin: {
              dealership_id: defaultDealership.dealership_id,
            },
          },
        },
      });

      if (!inspection) {
        throw new BadRequestException('Not Vehicle inspection found to delete');
      }

      // try delete the attachment from s3
      await this.fileUploadService.deleteFile(inspection.path);

      // delete attachment from database Record
      await queryRunner.manager.delete(VehicleInspection, id);

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
}
