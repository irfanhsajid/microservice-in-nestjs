import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDealership } from '../dealership/entities/user-dealership.entity';
import { Permission } from './entities/permission.entity';
import { RoleHasPermission } from './entities/role-has-permission.entity';
import { Role } from './entities/role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './services/role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RoleHasPermission,
      UserDealership,
    ]),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
