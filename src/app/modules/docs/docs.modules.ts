import { Module } from '@nestjs/common';
import { DocsAuthController } from './docs.controller';

@Module({
  controllers: [DocsAuthController],
})
export class DocsModule {}
