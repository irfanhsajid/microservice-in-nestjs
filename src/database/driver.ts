import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import database from '../config/database';
import 'dotenv/config';

const databaseConfig = database();

export const driver = (config: ConfigService): TypeOrmModuleOptions => ({
  ...config.get(`database.connections[${config.get('database.default')}]`),
});

export const dataSource = new DataSource({
  ...databaseConfig.database.connections[databaseConfig.database.default],
});
