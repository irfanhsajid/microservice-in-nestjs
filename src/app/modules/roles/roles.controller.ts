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

@ApiTags('Roles')
@ApiBearerAuth('jwt')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(ApiGuard)
  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @Req() req: Request) {
    try {
      return this.rolesService.create(
        createRoleDto,
        req.user_default_dealership?.id || null,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @UseGuards(ApiGuard)
  @Get()
  findAll(@Req() req: Request) {
    const dealerId = req.user_default_dealership?.id || null;
    return this.rolesService.findAll(dealerId);
  }

  @UseGuards(ApiGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const dealerId = req.user_default_dealership?.id || null;
    return this.rolesService.findOne(+id, dealerId);
  }

  @UseGuards(ApiGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @UseGuards(ApiGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
