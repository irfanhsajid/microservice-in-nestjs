import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import * as path from 'path';
import * as process from 'node:process';

interface ConfigType {
  database: {
    default: string;
    connections: {
      pgsql: TypeOrmModuleOptions;
      mysql: TypeOrmModuleOptions;
    };
  };
}

export default () =>
  ({
    database: {
      default: process.env.DB_CONNECTION || 'pgsql',
      connections: {
        pgsql: {
          type: 'postgres',
          host: process.env.DB_HOST || '127.0.0.1',
          port: Number(process.env.DB_PORT) || 5432,
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          synchronize: process.env.APP_ENV === 'development',
          entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
          migrations: [
            path.join(__dirname, '../database/migrations/*{.ts,.js}'),
          ],
          logging: ['error', 'info', 'schema', 'warn', 'migration', 'query'],
        } satisfies TypeOrmModuleOptions,

        mysql: {
          type: 'mysql',
          host: process.env.DB_HOST || '127.0.0.1',
          port: Number(process.env.DB_PORT) || 3306,
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          synchronize: process.env.APP_ENV === 'development',
          entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
          migrations: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
        } satisfies TypeOrmModuleOptions,
      },
    },
  }) as ConfigType;
