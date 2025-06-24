import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiGuard } from 'src/app/guards/api.guard';
import { EnsureEmailVerifiedGuard } from 'src/app/guards/ensure-email-verified.guard';

@ApiTags('Vehicle-listing')
@UseGuards(ApiGuard, EnsureEmailVerifiedGuard)
@Controller('api/v1/')
export class VehicleListingController {}
