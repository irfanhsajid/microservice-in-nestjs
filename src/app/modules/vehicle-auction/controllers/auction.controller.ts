import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
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
import { responseReturn } from '../../../common/utils/response-return';

@ApiTags('Auction Setup')
@ApiBearerAuth('jwt')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard)
@Controller('api/v1/auction')
export class AuctionController {
  private readonly logger = new CustomLogger(AuctionController.name);

  constructor(private readonly auctionService: AuctionService) {}

  @Get('/')
  async index(@Request() req: any, @Query() params: any) {
    try {
      const vehicles = await this.auctionService.index(req, params);
      return responseReturn('Vehicles auction fetched successfully', vehicles);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

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
