import { Module } from '@nestjs/common';
import { AdminDealershipService } from './services/dealership.service';
import { AdminDealershipController } from './controllers/dealership.controller';
import { UserModule } from '../../user/user.module';
import { CaslModule } from '../../auth/casl/casl.module';

@Module({
  imports: [UserModule, CaslModule],
  providers: [AdminDealershipService],
  controllers: [AdminDealershipController],
})
export class AdminDealershipModule {}
