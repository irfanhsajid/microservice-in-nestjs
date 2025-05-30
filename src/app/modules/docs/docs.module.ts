import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { PassportModule } from '@nestjs/passport';
import { DocsController } from './docs-auth.controller';
import { DocsLocalAuthStrategyService } from './docs-auth.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Session]),
    PassportModule.register({ session: true }),
  ],
  controllers: [DocsController],
  providers: [DocsLocalAuthStrategyService],
})
export class DocsModule {}
