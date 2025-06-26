import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Request } from 'express';
import { ApiGuard } from 'src/app/guards/api.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { CustomLogger } from '../logger/logger.service';
import { responseReturn } from 'src/app/common/utils/response-return';

@ApiTags('Roles')
@ApiBearerAuth('jwt')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  private readonly logger = new CustomLogger(RolesController.name);

  @UseGuards(ApiGuard)
  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @Req() req: Request) {
    try {
      const role = this.rolesService.create(
        createRoleDto,
        req.user_default_dealership?.id || null,
      );

      return responseReturn('Role created successfully', role);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @UseGuards(ApiGuard)
  @Get()
  findAll(@Req() req: Request) {
    try {
      const dealerId = req.user_default_dealership?.id || null;
      const roles = this.rolesService.findAll(dealerId);

      return responseReturn('Roles fetched successfully', roles);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @UseGuards(ApiGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    try {
      const dealerId = req.user_default_dealership?.id || null;
      const role = this.rolesService.findOne(+id, dealerId);
      return responseReturn('Role fetched successfully', role);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @UseGuards(ApiGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    try {
      const role = this.rolesService.update(+id, updateRoleDto);
      return responseReturn('Role updated successfully', role);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @UseGuards(ApiGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    try {
      const role = this.rolesService.remove(+id);
      return responseReturn('Role deleted successfully', role);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
