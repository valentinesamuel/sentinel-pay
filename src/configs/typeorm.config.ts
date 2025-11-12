import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

import 'reflect-metadata';

import { config as dotenvConfig } from 'dotenv';

// DO NOT CHANGE THE SNAKE NAMING STRATEGY IMPORT TO AN ALIAS
import { SnakeNamingStrategy } from '../shared/repositories/snakeCaseNaming.strategy';

// We don't have access to the @nestjs/config module when running the
// migrations, so we need to load the environment variables manually.
dotenvConfig();

export const dataSource = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  database: process.env.DATABASE_DB,
  host: process.env.DATABASE_HOST,
  port: Number.parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  autoLoadEntities: true,
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
  migrationsTransactionMode: 'each',
  namingStrategy: new SnakeNamingStrategy(),
  migrationsRun: process.env.NODE_ENV === 'test',
  dropSchema: process.env.NODE_ENV === 'test',
  migrationsTableName: 'migrations',
  retryAttempts: parseInt(process.env.DATABASE_RETRY_ATTEMPTS),
};
export default registerAs('typeorm', () => dataSource);

export const connectionSource = new DataSource(dataSource as DataSourceOptions);
