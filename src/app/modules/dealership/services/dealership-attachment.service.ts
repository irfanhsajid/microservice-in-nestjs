import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Readable } from 'stream';
import { DealershipAttachment } from '../entities/dealership-attachment.entity';
import { Dealership } from '../entities/dealerships.entity';
import { FileUploaderService } from '../../uploads/file-uploader.service';
import { DealershipAttachementDto } from '../dto/dealership-attachment.dto';
import { Request } from 'express';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { CustomLogger } from '../../logger/logger.service';
import { instanceToPlain } from 'class-transformer';
import { UserDealership } from '../entities/user-dealership.entity';

@Injectable()
export class DealershipAttachmentService {
  private readonly logger = new CustomLogger(DealershipAttachmentService.name);

  constructor(
    @InjectRepository(DealershipAttachment)
    private attachmentRepository: Repository<DealershipAttachment>,

    @InjectRepository(Dealership)
    private dealershipRepository: Repository<Dealership>,

    private fileUploaderService: FileUploaderService,
  ) {}

  async uploadAttachment(
    req: Request,
    originalFileName: string,
    fileStream: Readable,
    dto: DealershipAttachementDto,
    fileSize: number,
  ): Promise<any> {
    if (!fileStream) {
      throw new UnprocessableEntityException({
        file: 'File stream or file name not provided',
      });
    }
    const currentUser = req['user'] as User;
    let tempFilePath: string = '';

    const deaultDealership = currentUser?.user_dealerships?.find(
      (d) => d.is_default,
    );
    // Verify dealership exists
    const dealership = await this.dealershipRepository.findOne({
      where: { id: deaultDealership?.dealership?.id },
    });
    if (!dealership) {
      throw new NotFoundException('Dealership not found');
    }
    try {
      const folder = `dealership/${dealership?.id}`;

      // Upload file stream to storage
      const filePath = await this.fileUploaderService.uploadFileStream(
        fileStream,
        originalFileName,
        fileSize,
        folder,
      );

      tempFilePath = filePath;

      // Create attachment record
      const attachment = this.attachmentRepository.create({
        user: currentUser,
        dealership,
        name: dto.name as unknown as string,
        path: filePath,
      });

      // Save to database
      await this.attachmentRepository.save(attachment);
      const data = instanceToPlain(attachment);
      delete data?.dealership;
      delete data?.user;
      return data;
    } catch (error) {
      // delete file if attchement not created
      if (tempFilePath) {
        await this.fileUploaderService.deleteFile(tempFilePath);
      }
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async deleteAttachment(attachmentId: number): Promise<any> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId },
      relations: ['dealership'],
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    try {
      // Delete file from storage
      await this.fileUploaderService.deleteFile(attachment.path);

      // delete attachment record
      await this.attachmentRepository.delete(attachmentId);
      return {
        message: `Attachment deleted successfully`,
      };
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  async getAttachments(req: Request): Promise<DealershipAttachment[]> {
    const userDealership = req['user_default_dealership'] as UserDealership;

    const dealership = await this.dealershipRepository.findOne({
      where: { id: userDealership?.dealership_id },
    });
    if (!dealership) {
      return [];
    }

    return await this.attachmentRepository.find({
      where: {
        dealership: {
          id: dealership?.id,
        },
      },
    });
  }
}
