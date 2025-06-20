import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { RoleHasPermission } from './entities/role-has-permission.entity';
import { Role } from './entities/role.entity';
import { UserRoleDealership } from './entities/user-role-dealership.entity';
import { RoleManagementController } from './role-management.controller';
import { RoleManagementService } from './role-management.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RoleHasPermission,
      UserRoleDealership,
    ]),
  ],
  controllers: [RoleManagementController],
  providers: [RoleManagementService],
  exports: [RoleManagementService],
})
export class RoleManagementModule {}
