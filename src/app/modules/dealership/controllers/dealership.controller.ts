import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DealershipDeatilsDto } from '../dto/dealership-details.dto';
import { DealershipService } from '../services/dealship.service';
import { ApiGuard } from 'src/app/guards/api.guard';

@ApiTags('Onboarding')
@UseGuards(ApiGuard)
@Controller('api/v1')
@ApiBearerAuth('jwt')
export class DealershipController {
  constructor(private readonly dealershipService: DealershipService) {}

  @ApiOperation({ summary: 'Store dealership information' })
  @Post('/dealership-info')
  async storeDealershipInfo(@Body() dto: DealershipDeatilsDto) {
    return this.dealershipService.updateOrCreate(dto);
  }
}
