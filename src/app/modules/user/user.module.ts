import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { PasswordResetService } from './password-reset.service';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, PasswordReset])],
  controllers: [UserController],
  providers: [UserService, PasswordResetService],
  exports: [UserService, PasswordResetService, TypeOrmModule],
})
export class UserModule {}
