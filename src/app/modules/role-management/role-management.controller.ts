import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateRoleManagementDto } from './dto/create-role-management.dto';
import { UpdateRoleManagementDto } from './dto/update-role-management.dto';
import { RoleManagementService } from './role-management.service';

@Controller('role-management')
export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  @Post()
  create(@Body() createRoleManagementDto: CreateRoleManagementDto) {
    return this.roleManagementService.create(createRoleManagementDto);
  }

  @Get()
  findAll() {
    return this.roleManagementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleManagementService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleManagementDto: UpdateRoleManagementDto,
  ) {
    return this.roleManagementService.update(+id, updateRoleManagementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleManagementService.remove(+id);
  }
}
