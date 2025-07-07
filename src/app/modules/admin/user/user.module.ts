import { Module } from '@nestjs/common';
import { UserModule } from '../../user/user.module';
import { CaslModule } from '../../auth/casl/casl.module';
import { AdminUserService } from './services/user.service';
import { AdminUserController } from './controllers/user.controller';

@Module({
  imports: [UserModule, CaslModule],
  providers: [AdminUserService],
  controllers: [AdminUserController],
})
export class AdminUserModule {}
