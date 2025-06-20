import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiGuard } from 'src/app/guards/api.guard';
import { RoleManagementService } from './role.service';

@ApiTags('Role Management')
@ApiBearerAuth('jwt')
@UseGuards(ApiGuard)
@Controller('api/v1/')
export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  @Get('all-permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  async getPermissions() {
    return this.roleManagementService.getPermissions();
  }
}
