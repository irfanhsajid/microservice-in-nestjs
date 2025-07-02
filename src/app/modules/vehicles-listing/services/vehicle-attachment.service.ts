import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomLogger } from '../../logger/logger.service';
import { ServiceInterface } from 'src/app/common/interfaces/service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleAttachment } from '../entities/vehicle-attachments.entity';
import { IsNull, Repository } from 'typeorm';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { FileUploaderService } from '../../uploads/file-uploader.service';
import { Readable } from 'stream';
import { User } from '../../user/entities/user.entity';
import { Vehicle } from '../entities/vehicles.entity';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import * as fs from 'fs';

@Injectable()
export class VehicleAttachmentService implements ServiceInterface {
  private readonly logger = new CustomLogger(VehicleAttachmentService.name);

  constructor(
    @InjectRepository(VehicleAttachment)
    private readonly vehicleAttachmentRepository: Repository<VehicleAttachment>,

    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,

    private readonly fileUploadService: FileUploaderService,
  ) {}

  index(req: Request, params: any): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }

  async store(req: Request, dto: any): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleAttachmentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let uploadedFiles: any;

    try {
      const user = req['user'] as User;
      const userDealership = req['user_default_dealership'] as UserDealership;

      const vechicle = await queryRunner.manager.findOne(Vehicle, {
        where: {
          vehicle_vin: {
            id: dto.id,
            dealership_id: userDealership.dealership_id || IsNull(),
          },
        },
      });

      if (!vechicle) {
        throw new BadRequestException('No vehicle found to upload image');
      }

      // check how many file users have uploaded
      const existingAttachment = await queryRunner.manager.find(
        VehicleAttachment,
        {
          where: {
            vehicle_id: vechicle.id,
            user_id: user.id,
          },
        },
      );

      if (existingAttachment && existingAttachment.length >= 5) {
        // Clean up the temp file
        fs.unlink(dto.file.path, (err) => {
          if (err) console.error('Temp file deletion failed:', err.message);
        });

        throw new BadRequestException('You can upload up to 5 files max');
      }

      // const fileName = dto.file.originalname;
      // const fileStream = Readable.from(dto.file.buffer);
      // const fileSize = dto.file.size;

      const folder = `vehicle/images/${vechicle.id}`;
      const file = dto.file;
      const localFilePath = file.path;
      const sanitizedFileName = file.filename;
      const key = `${folder}/${sanitizedFileName}`;

      /*const newFile = await this.fileUploadService.uploadFileStream(
        fileStream,
        fileName,
        fileSize,
        folder,
      );*/

      // const newFile = await this.fileUploadService.uploadFile(dto.file, folder);
      const newFile = await this.fileUploadService.uploadFileFromPath(
        localFilePath,
        key,
        file.mimetype,
      );

      console.log('file path', localFilePath);
      // Clean up the temp file
      fs.unlink(localFilePath, (err) => {
        if (err) console.error('Temp file deletion failed:', err.message);
      });

      uploadedFiles = `${folder}/${newFile}`;

      let u = queryRunner.manager.create(VehicleAttachment, {
        name: newFile,
        user_id: user?.id,
        path: newFile,
        vehicle_id: vechicle?.id,
      });
      u = await queryRunner.manager.save(VehicleAttachment, u);

      await queryRunner.commitTransaction();
      return {
        ...u,
        path: this.fileUploadService.path(folder + '/' + u.path),
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
      const vehicle = await this.vehicleRepository.findOne({
        where: { vehicle_vin_id: id },
      });

      if (!vehicle) {
        return [];
      }

      return await this.vehicleAttachmentRepository.find({
        where: {
          vehicle_id: vehicle?.id,
          user_id: user.id,
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
      this.vehicleAttachmentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = req['user'] as User;
      const attachment = await queryRunner.manager.findOne(VehicleAttachment, {
        where: {
          id: id,
          user_id: user.id,
        },
      });
      if (!attachment) {
        throw new BadRequestException('Vehicle attachment deletion failed');
      }

      // try delete the attachment from s3
      await this.fileUploadService.deleteFile(attachment.path);

      // delete attachment from database Record
      await queryRunner.manager.delete(VehicleAttachment, id);

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
