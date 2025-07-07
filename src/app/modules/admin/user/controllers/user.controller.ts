import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { throwCatchError } from 'src/app/common/utils/throw-error';
import { ApiGuard } from 'src/app/guards/api.guard';
import { CustomLogger } from 'src/app/modules/logger/logger.service';
import { responseReturn } from 'src/app/common/utils/response-return';
import { AbilityGuard } from 'src/app/modules/auth/casl/ability.guard';
import { CheckAbility } from 'src/app/modules/auth/casl/check-ability.decorator';
import { AdminUserService } from '../services/user.service';
import { AdminUserIndexDto } from '../dto/user-index-dto';
import { CreateAdminUserDto } from '../dto/create-user.dto';
import { UpdateAdminUserDto } from '../dto/update-user.dto';

@ApiTags('Admin User Management')
@ApiBearerAuth('jwt')
@UseGuards(ApiGuard)
@Controller('api/v1/admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}
  private readonly logger = new CustomLogger(AdminUserController.name);

  @UseGuards(AbilityGuard)
  @CheckAbility('create', 'user')
  @Post('/')
  async create(@Req() req: Request, @Body() dto: CreateAdminUserDto) {
    try {
      const user = await this.adminUserService.store(req, dto);
      return responseReturn('Users created successfully', user);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @UseGuards(AbilityGuard)
  @CheckAbility('update', 'user')
  @Put('/:id')
  async update(
    @Req() req: Request,
    @Body() dto: UpdateAdminUserDto,
    @Param('id') id: string,
  ) {
    try {
      const user = await this.adminUserService.update(req, dto, +id);
      return responseReturn('Users updated successfully', user);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @UseGuards(AbilityGuard)
  @CheckAbility('delete', 'user')
  @Delete('/:id')
  async destroy(@Req() req: Request, @Param('id') id: string) {
    try {
      const user = await this.adminUserService.destroy(req, +id);
      return responseReturn('Users deleted successfully', user);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @UseGuards(AbilityGuard)
  @CheckAbility('read', 'user')
  @Get('/')
  async index(@Req() req: Request, @Query() queryParams: AdminUserIndexDto) {
    try {
      const users = await this.adminUserService.index(req, queryParams);
      return responseReturn('Users fetched successfully', users);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @UseGuards(AbilityGuard)
  @CheckAbility('read', 'user')
  @Get('/:id')
  async show(@Req() req: Request, @Param('id') id: string) {
    try {
      const user = await this.adminUserService.show(req, +id);
      return responseReturn('User fetched successfully', user);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }
}
