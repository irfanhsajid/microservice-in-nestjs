import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DealershipPaymentInfoService } from '../services/dealership.paymentinfo.service';
import { ApiGuard } from '../../../guards/api.guard';
import { responseReturn } from '../../../common/utils/response-return';
import { throwCatchError } from '../../../common/utils/throw-error';
import { CustomLogger } from '../../logger/logger.service';
import { DealershipPaymentInfoDto } from '../dto/dealership-paymentinfo.dto';
import { EnsureEmailVerifiedGuard } from 'src/app/guards/ensure-email-verified.guard';

@ApiTags('Onboarding')
@ApiBearerAuth('jwt')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard)
@Controller('api/v1')
export class DealershipPaymentInfoController {
  private readonly logger = new CustomLogger(DealershipPaymentInfoService.name);
  constructor(protected paymentInfoService: DealershipPaymentInfoService) {}

  @ApiOperation({ summary: 'Dealership bank payment info' })
  @Get('/payment-info')
  async show(@Request() request: any): Promise<any> {
    try {
      const paymentInfo = await this.paymentInfoService.show(request);
      return responseReturn('Dealer payment info data', paymentInfo);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @ApiOperation({ summary: 'Dealership bank payment info update' })
  @Post('/payment-info')
  async updateOrCreate(
    @Body() dto: DealershipPaymentInfoDto,
    @Request() request: any,
  ): Promise<any> {
    try {
      const paymentInfo = await this.paymentInfoService.updateOrCreate(
        request,
        dto,
      );
      return responseReturn(
        'Dealer payment info save successfully!',
        paymentInfo,
      );
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
