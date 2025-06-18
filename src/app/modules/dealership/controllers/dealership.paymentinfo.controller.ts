import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomLogger } from '../../logger/logger.service';
import { DealershipPaymentInfo } from '../entities/dealership-payment-info.entity';
import { DealershipPaymentInfoService } from '../services/dealership.paymentinfo.service';
import { ApiGuard } from '../../../guards/api.guard';

@ApiTags('Onboarding')
@ApiBearerAuth('jwt')
@UseGuards(ApiGuard)
@Controller('api/v1')
export class DealershipPaymentInfoController {
  constructor(protected paymentInfoService: DealershipPaymentInfoService) {}
  private readonly logger = new CustomLogger(
    DealershipPaymentInfoController.name,
  );

  @ApiOperation({ summary: 'Dealership bank payment info' })
  @Get('/payment-info')
  async show(): Promise<DealershipPaymentInfo> {
    return await this.paymentInfoService.show();
  }

  @ApiOperation({ summary: 'Dealership bank payment info update' })
  @Post('/payment-info')
  async update(): Promise<DealershipPaymentInfo> {
    return await this.paymentInfoService.updateOrCreate();
  }
}
