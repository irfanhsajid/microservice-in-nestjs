import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DealershipDetailsDto } from '../dto/dealership-details.dto';
import { DealershipInformationService } from '../services/dealship.inforation.service';
import { ApiGuard } from 'src/app/guards/api.guard';
import { CustomLogger } from '../../logger/logger.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { responseReturn } from 'src/app/common/utils/response-return';
import { EnsureEmailVerifiedGuard } from 'src/app/guards/ensure-email-verified.guard';

@ApiTags('Onboarding')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard)
@Controller('api/v1')
@ApiBearerAuth('jwt')
export class DealershipInformationController {
  private readonly logger = new CustomLogger(
    DealershipInformationController.name,
  );

  constructor(
    private readonly dealershipInformationService: DealershipInformationService,
  ) {}

  @ApiOperation({ summary: 'Get dealership information' })
  @Get('/dealership')
  async show(@Request() req: any) {
    try {
      const dealership = await this.dealershipInformationService.show(req);
      return responseReturn('', dealership);
    } catch (error) {
      this.logger.error(error);
      throwCatchError(error);
    }
  }

  @ApiOperation({ summary: 'Store dealership information' })
  @Post('/dealership')
  async update(@Request() req: any, @Body() dto: DealershipDetailsDto) {
    try {
      console.log('connected got here', dto);
      const dealership = await this.dealershipInformationService.updateOrCreate(
        req,
        dto,
      );
      return responseReturn(
        'Dealership information saved successfully',
        dealership,
      );
    } catch (error) {
      this.logger.error(error);
      throwCatchError(error);
    }
  }
}
