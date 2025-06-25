import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RoleHasPermissions } from './entities/role_has_permissions.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, RoleHasPermissions]),
    UserModule,
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
