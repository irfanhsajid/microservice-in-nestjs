import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleAttachment } from '../entities/vehicle-attachments.entity';
import { Repository } from 'typeorm';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { FileUploaderService } from '../../uploads/file-uploader.service';
import { Readable } from 'stream';
import { User } from '../../user/entities/user.entity';
import { Vehicle } from '../entities/vehicles.entity';
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

  async store(req: Request, dto: any): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleInspectionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let uploadedFiles: any;

    try {
      const user = req['user'] as User;
      const vechicle_id = dto.id;

      // find vehicle report
      let vehicleReport = await queryRunner.manager.findOne(
        VehicleInspectionReport,
        {
          where: {
            vehicle_id: vechicle_id,
          },
        },
      );

      if (!vehicleReport) {
        vehicleReport = queryRunner.manager.create(VehicleInspectionReport, {
          vehicle_id: vechicle_id,
        });

        vehicleReport = await queryRunner.manager.save(
          VehicleInspectionReport,
          vehicleReport,
        );
      }

      // Upload file
      const fileName = dto.file.originalname;
      const fileStream = Readable.from(dto.file.buffer);
      const fileSize = dto.file.size;

      const folder = `vehicle/inspection/${vechicle_id}`;

      const newFile = await this.fileUploadService.uploadFileStream(
        fileStream,
        fileName,
        fileSize,
        folder,
      );

      uploadedFiles = `${folder}/${newFile}`;

      let u = queryRunner.manager.create(VehicleInspection, {
        name: newFile,
        user_id: user?.id,
        path: newFile,
        vehicle_id: vechicle_id,
        ...dto.dto,
        vehicle_inspection_report_id: vehicleReport?.id,
      });
      u = await queryRunner.manager.save(VehicleInspection, u);

      await queryRunner.commitTransaction();
      return {
        ...u,
        path: this.fileUploadService.path(uploadedFiles),
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
      const user = req['user'] as User;

      return await this.vehicleInspectionRepository.find({
        where: {
          vehicle_id: id,
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
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
