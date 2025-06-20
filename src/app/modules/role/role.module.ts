import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDealership } from '../dealership/entities/user-dealership.entity';
import { UserModule } from '../user/user.module';
import { Permission } from './entities/permission.entity';
import { RoleHasPermission } from './entities/role-has-permission.entity';
import { Role } from './entities/role.entity';
import { RoleManagementController } from './role.controller';
import { RoleManagementService } from './role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RoleHasPermission,
      UserDealership,
    ]),
    UserModule,
  ],
  controllers: [RoleManagementController],
  providers: [RoleManagementService],
  exports: [RoleManagementService],
})
export class RoleManagementModule {}
