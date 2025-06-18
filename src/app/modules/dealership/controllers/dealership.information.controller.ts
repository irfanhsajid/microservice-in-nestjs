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

@ApiTags('Onboarding')
@UseGuards(ApiGuard)
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
  @Get('/dealership-info')
  async show() {
    return this.dealershipInformationService.show();
  }

  @ApiOperation({ summary: 'Store dealership information' })
  @Post('/dealership-info')
  async update(@Request() req: any, @Body() dto: DealershipDetailsDto) {
    try {
      return await this.dealershipInformationService.updateOrCreate(req, dto);
    } catch (error) {
      this.logger.error(error);
      throwCatchError(error);
    }
  }
}
