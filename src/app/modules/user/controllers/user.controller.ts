import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { responseReturn } from 'src/app/common/utils/response-return';
import { throwCatchError } from '../../../common/utils/throw-error';
import { ApiGuard } from '../../../guards/api.guard';
import { UserDealership } from '../../dealership/entities/user-dealership.entity';
import { CustomLogger } from '../../logger/logger.service';
import { User } from '../entities/user.entity';
import { UserResource } from '../resource/user.resource';
import { UserService } from '../user.service';

@ApiTags('User')
@ApiBearerAuth('jwt')
@UseGuards(ApiGuard)
@Controller('api/v1')
export class UserController {
  constructor(protected readonly userService: UserService) {}
  private readonly logger = new CustomLogger(UserController.name);

  @Get('/user/me')
  @ApiOperation({ summary: 'Get authenticated user' })
  // @UseGuards(AbilityGuard)
  // @CheckAbility('create', 'user')
  async me(@Request() request: Request) {
    try {
      const user = request['user'] as User;
      const userDealership = request[
        'user_default_dealership'
      ] as UserDealership;
      const userPermissions =
        await this.userService.getUserWithPermissionsByRole(
          user,
          userDealership?.role_id,
        );

      return responseReturn('User fetched successfully', userPermissions);
    } catch (e) {
      this.logger.error(e);
      return throwCatchError(e);
    }
  }

  @Get('/user')
  @ApiOperation({ summary: 'Revoke authenticate user' })
  show(@Request() request: Request): UserResource | null {
    try {
      const user = request['user'] as User;
      return new UserResource(user);
    } catch (e) {
      this.logger.error(e);
      return throwCatchError(e);
    }
  }
}
