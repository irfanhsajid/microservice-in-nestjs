import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { PasswordResetService } from './password-reset.service';
import { UserController } from './controllers/user.controller';
import { Dealership } from '../dealership/entities/dealerships.entity';
import { UserDealership } from '../dealership/entities/user-dealership.entity';
import { RoleHasPermissions } from '../roles/entities/role_has_permissions.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../roles/entities/permission.entity';
import { CaslModule } from '../auth/casl/casl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PasswordReset,
      Dealership,
      UserDealership,
      RoleHasPermissions,
      Role,
      Permission,
    ]),
    CaslModule,
  ],
  controllers: [UserController],
  providers: [UserService, PasswordResetService],
  exports: [UserService, PasswordResetService, TypeOrmModule],
})
export class UserModule {}
