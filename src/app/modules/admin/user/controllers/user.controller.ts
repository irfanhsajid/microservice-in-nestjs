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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
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
import { CustomFileInterceptor } from 'src/app/common/interceptors/file-upload.interceptor';
import { allowedImageMimeTypes } from 'src/app/common/types/allow-file-type';
import { AdminUserChangePasswordDto } from '../dto/change-password.dto';

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

  @UseInterceptors(
    new CustomFileInterceptor(
      'file',
      1,
      {
        limits: {
          // limit to 100Mb
          fileSize: 1024 * 1024 * 5,
        },
      },
      allowedImageMimeTypes,
    ),
  )
  @ApiBody({
    description: 'File upload along with metadata',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AbilityGuard)
  @CheckAbility('update', 'user')
  @Post('/:id/avatar')
  async uploadAvatar(
    @Req() req: Request,
    @UploadedFile()
    file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    try {
      console.log('fileController---->', file);
      const user = await this.adminUserService.uploadAvatar(req, +id, file);
      return responseReturn('Users avatar uploaded successfully', user);
    } catch (error) {
      this.logger.error(error);
      return throwCatchError(error);
    }
  }

  @Patch('/:id/change-password')
  @UseGuards(AbilityGuard)
  @CheckAbility('update', 'user')
  async changePassword(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() dto: AdminUserChangePasswordDto,
  ) {
    try {
      const user = await this.adminUserService.changePassword(req, id, dto);
      return responseReturn("User's password changed successfully", user);
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
