import { Module } from '@nestjs/common';
import { AppController } from './app/Http/Controllers/app.controller';
import { AppService } from './app/Services/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import database from './config/database';
import app from './config/app';
import { TypeOrmModule } from '@nestjs/typeorm';
import { driver } from './database/driver';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, app],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: driver,
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
