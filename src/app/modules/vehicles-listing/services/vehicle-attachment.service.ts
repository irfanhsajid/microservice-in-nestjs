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

  async index(req: Request, params: any): Promise<Record<string, any>> {
    try {
      const user = req['user'] as User;
      const vehicle = await this.vehicleRepository.findOne({
        where: { vehicle_vin_id: params },
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

  async store(req: Request, dto: any): Promise<Record<string, any>> {
    const queryRunner =
      this.vehicleAttachmentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let uploadedFiles: any;

    try {
      const user = req['user'] as User;
      const vechicle = await queryRunner.manager.findOne(Vehicle, {
        where: {
          vehicle_vin_id: dto?.id,
        },
      });

      if (!vechicle) {
        throw new BadRequestException('Not vechile found to upload image');
      }

      // check how many file user has uploaded
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
        throw new BadRequestException('You can upload up to 5 files max');
      }

      const fileName = dto.file.originalname;
      const fileStream = Readable.from(dto.file.buffer);
      const fileSize = dto.file.size;

      const newFile = await this.fileUploadService.uploadFileStream(
        fileStream,
        fileName,
        fileSize,
      );

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
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (uploadedFiles) {
        await this.fileUploadService.deleteFile(uploadedFiles);
      }
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async show(req: Request, id: number): Promise<Record<string, any>> {
    try {
      const user = req['user'] as User;
      return user;
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
  async update(
    req: Request,
    dto: any,
    id: number,
  ): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
  async destroy(req: Request, id: number): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
}
