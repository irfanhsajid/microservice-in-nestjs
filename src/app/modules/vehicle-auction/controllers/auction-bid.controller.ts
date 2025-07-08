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
import { CustomLogger } from '../../logger/logger.service';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { VehicleAuctionBidDto } from '../dto/auction-bid.dto';
import { AuctionBidService } from '../services/auction-bid.service';

@ApiTags('Auction bid')
@ApiBearerAuth('jwt')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard)
@Controller('api/v1/auction/bid')
export class AuctionBidController {
  private readonly logger = new CustomLogger(AuctionBidController.name);

  constructor(private readonly auctionBidService: AuctionBidService) {}

  @Post('/:auctionId')
  async store(
    @Request() req: any,
    @Body() dto: VehicleAuctionBidDto,
    @Param('auctionId', ParseIntPipe) auctionId: number,
  ) {
    try {
      return await this.auctionBidService.store(req, {
        id: auctionId,
        data: dto,
      });
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @Get('/:auctionId')
  async show(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    try {
      return await this.auctionBidService.show(req, id);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
