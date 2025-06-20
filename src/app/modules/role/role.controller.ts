import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleManagementService } from './role.service';

@ApiTags('Role Management')
@Controller('api/v1/')
export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  @Get('all-permissions')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiBearerAuth('jwt')
  async getPermissions() {
    return this.roleManagementService.getPermissions();
  }
}
