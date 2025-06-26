import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum DealershipAttachmentFileType {
  OMVIC_DEALER_LICENSE = 'OMVIC_DEALER_LICENSE',
  BUSINESS_VOID_CHEQUE = 'BUSINESS_VOID_CHEQUE',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  ARTICLES_OF_CORPORATION = 'ARTICLES_OF_CORPORATION',
  PAD_OR_PAW_AUTHORIZATION_FORM = 'PAD_OR_PAW_AUTHORIZATION_FORM',
}

export class DealershipAttachmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(DealershipAttachmentFileType)
  name: DealershipAttachmentFileType;
}
