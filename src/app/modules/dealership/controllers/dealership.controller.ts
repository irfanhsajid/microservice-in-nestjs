import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DealershipDeatilsDto } from '../dto/dealership-details.dto';
import { DealershipService } from '../services/dealship.service';

@ApiTags('Onboarding')
@Controller('api/v1')
export class DealershipController {
  constructor(private readonly dealershipService: DealershipService) {}

  @Post('/dealership-info')
  async storeDealershipInfo(dto: DealershipDeatilsDto) {
    return this.dealershipService.updateOrCreate(dto);
  }
}
