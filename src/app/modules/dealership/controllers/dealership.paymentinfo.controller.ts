import { Controller, Post, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomLogger } from '../../logger/logger.service';
import { DealershipPaymentInfo } from '../entities/dealership-payment-info.entity';
import { DealershipPaymentInfoService } from '../services/dealership.paymentinfo.service';

@ApiTags('Onboarding')
@Controller('api/v1')
export class DealershipPaymentInfoController {
  constructor(protected paymentInfoService: DealershipPaymentInfoService) {}
  private readonly logger = new CustomLogger(
    DealershipPaymentInfoController.name,
  );

  @ApiOperation({ summary: 'Dealership bank payment info' })
  @Get('/login')
  async show(): Promise<DealershipPaymentInfo> {
    return this.paymentInfoService.show();
  }

  @ApiOperation({ summary: 'Dealership bank payment info update' })
  @Post('/login')
  async update(): Promise<DealershipPaymentInfo> {
    return this.paymentInfoService.update();
  }
}
