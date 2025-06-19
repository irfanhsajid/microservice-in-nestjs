import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import database from '../config/database';
import 'dotenv/config';

const databaseConfig = database();

export const driver = (config: ConfigService): TypeOrmModuleOptions => ({
  ...config.get(`database.connections[${config.get('database.default')}]`),
  cache: {
    type: 'ioredis',
    duration: 30000,
    options: {
      socket: {
        host: config.get('services.redis.host', 'localhost'),
        port: config.get('services.redis.port', 6379),
        password: config.get('services.redis.password', ''),
        db: config.get('services.redis.db', 0),
      },
    },
  },
});

export const dataSource = new DataSource({
  ...databaseConfig.database.connections[databaseConfig.database.default],
});
