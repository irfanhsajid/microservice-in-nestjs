import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DealershipDeatilsDto } from '../dto/dealership-details.dto';
import { DealershipInformationService } from '../services/dealship.inforation.service';
import { ApiGuard } from 'src/app/guards/api.guard';
import { CustomLogger } from '../../logger/logger.service';

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

  async show(@Request() req: any) {
    this.logger.log(req);
    return this.dealershipInformationService.show();
  }

  @ApiOperation({ summary: 'Store dealership information' })
  @Post('/dealership-info')
  async update(@Body() dto: DealershipDeatilsDto) {
    return this.dealershipInformationService.updateOrCreate(dto);
  }
}
