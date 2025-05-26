// src/app/modules/logger/logger.module.ts
import { Global, Module } from '@nestjs/common';
import { Logger } from './logger.service';

@Global()
@Module({
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}
