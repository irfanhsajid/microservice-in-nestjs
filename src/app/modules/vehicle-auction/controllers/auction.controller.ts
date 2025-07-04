import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiGuard } from '../../../guards/api.guard';
import { EnsureEmailVerifiedGuard } from '../../../guards/ensure-email-verified.guard';
import { EnsureProfileCompletedGuard } from '../../../guards/ensure-profile-completed.guard';

@ApiTags('Auction Setup')
@ApiBearerAuth('jwt')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard, EnsureProfileCompletedGuard)
@Controller('api/v1')
export class AuctionController {}