import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiGuard } from '../../../guards/api.guard';
import { EnsureEmailVerifiedGuard } from '../../../guards/ensure-email-verified.guard';
import { EnsureProfileCompletedGuard } from '../../../guards/ensure-profile-completed.guard';
import { CreateVehicleAuctionDto } from '../dto/auction.dto';
import { CustomLogger } from '../../logger/logger.service';
import { AuctionService } from '../services/auction.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';

@ApiTags('Auction Setup')
@ApiBearerAuth('jwt')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard)
@Controller('api/v1/auction')
export class AuctionController {
  private readonly logger = new CustomLogger(AuctionController.name);

  constructor(private readonly auctionService: AuctionService) {}

  @Post('/store')
  async store(@Request() req: any, @Body() dto: CreateVehicleAuctionDto) {
    try {
      return await this.auctionService.store(req, dto);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @Get('/:id')
  async show(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    try {
      return await this.auctionService.show(req, id);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
