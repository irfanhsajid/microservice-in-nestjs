import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiGuard } from 'src/app/guards/api.guard';
import { CustomLogger } from '../../logger/logger.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { responseReturn } from 'src/app/common/utils/response-return';
import { EnsureEmailVerifiedGuard } from 'src/app/guards/ensure-email-verified.guard';
import {
  DealershipAddressCreateDto,
  DealershipAddressQueryDto,
} from '../dto/dealership-address.dto';
import { DealershipAddressService } from '../services/dealership-address.service';

@ApiTags('Dealership address')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard)
@Controller('api/v1')
@ApiBearerAuth('jwt')
export class DealershipAddressController {
  private readonly logger = new CustomLogger(DealershipAddressController.name);

  constructor(
    private readonly dealershipAddressService: DealershipAddressService,
  ) {}

  @ApiOperation({ summary: 'Get dealership information' })
  @Get('/dealership-address')
  async show(@Request() req: any, @Query() query: DealershipAddressQueryDto) {
    try {
      const dealership = await this.dealershipAddressService.index(req, query);
      return responseReturn('', dealership);
    } catch (error) {
      this.logger.error(error);
      throwCatchError(error);
    }
  }

  @ApiOperation({ summary: 'Store dealership information' })
  @Post('/dealership-address')
  async create(@Request() req: any, @Body() dto: DealershipAddressCreateDto) {
    try {
      const dealership = await this.dealershipAddressService.store(req, dto);
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
