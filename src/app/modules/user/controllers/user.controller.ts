import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { throwCatchError } from '../../../common/utils/throw-error';
import { ApiGuard } from '../../../guards/api.guard';
import { CustomLogger } from '../../logger/logger.service';
import { UserResource } from '../resource/user.resource';
import { UserService } from '../user.service';

@ApiTags('User')
@ApiBearerAuth('jwt')
@UseGuards(ApiGuard)
@Controller('api/v1')
export class UserController {
  constructor(protected readonly userService: UserService) {}
  private readonly logger = new CustomLogger(UserController.name);

  @Get('/user')
  @ApiOperation({ summary: 'Revoke authenticate user' })
  async show(@Request() request: Request): Promise<UserResource | null> {
    try {
      const user = await this.userService.getUserByEmail(request['user'].email);
      if (!user) return null;
      return new UserResource(user);
    } catch (e) {
      this.logger.error(e);
      return throwCatchError(e);
    }
  }
}
