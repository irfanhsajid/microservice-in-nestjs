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
@Controller('api/v1/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  private readonly logger = new CustomLogger(RolesController.name);

  @UseGuards(ApiGuard)
  @Get()
  index(@Req() req: Request) {
    try {
      const dealerId = req.user_default_dealership?.dealership_id || null;
      const roles = this.rolesService.index(dealerId);

      return responseReturn('Roles fetched successfully', roles);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @UseGuards(ApiGuard)
  @Post()
  store(@Body() createRoleDto: CreateRoleDto, @Req() req: Request) {
    try {
      const role = this.rolesService.store(
        createRoleDto,
        req.user_default_dealership?.dealership_id || null,
      );

      return responseReturn('Role created successfully', role);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @UseGuards(ApiGuard)
  @Get(':id')
  show(@Param('id') id: string, @Req() req: Request) {
    try {
      const dealerId = req.user_default_dealership?.id || null;
      const role = this.rolesService.show(+id, dealerId);
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
  destroy(@Param('id') id: string) {
    try {
      const role = this.rolesService.destroy(+id);
      return responseReturn('Role deleted successfully', role);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
