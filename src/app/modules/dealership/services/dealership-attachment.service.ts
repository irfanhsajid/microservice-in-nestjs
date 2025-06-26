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
    const userDealership = req['user_default_dealership'] as UserDealership;
    let tempFilePath: string = '';

    try {
      const folder = `dealership/${userDealership?.dealership_id}`;

      // Upload file stream to storage
      const filePath = await this.fileUploaderService.uploadFileStream(
        fileStream,
        originalFileName,
        fileSize,
        folder,
      );

      tempFilePath = `${folder}/${filePath}`;

      // Create an attachment record
      const attachment = this.attachmentRepository.create({
        user: currentUser,
        dealership_id: userDealership?.dealership_id,
        name: dto.name as unknown as string,
        path: filePath,
      });

      // Save to a database
      await this.attachmentRepository.save(attachment);
      const data = instanceToPlain(attachment);
      delete data?.dealership;
      delete data?.user;
      return {
        ...data,
        path: this.fileUploaderService.path(tempFilePath + '/' + filePath),
      };
    } catch (error) {
      // delete file if attachment not created
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
      // Delete a file from storage
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
    return await this.attachmentRepository.find({
      where: {
        dealership_id: userDealership?.dealership_id,
      },
    });
  }
}
