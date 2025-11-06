import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const isDevelopment = configService.get('NODE_ENV') === 'development';

  // SSL configuration for production
  const sslConfig = isProduction
    ? {
        rejectUnauthorized: true,
        ca: fs.existsSync(path.join(__dirname, '../../certs/ca-cert.pem'))
          ? fs.readFileSync(path.join(__dirname, '../../certs/ca-cert.pem')).toString()
          : undefined,
      }
    : false;

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'payment_user'),
    password: configService.get<string>('DB_PASSWORD', 'payment_pass'),
    database: configService.get<string>('DB_DATABASE', 'payment_db'),

    // SSL/TLS Configuration
    ssl: sslConfig,

    // Connection pooling
    extra: {
      max: configService.get<number>('DB_POOL_MAX', 20),
      min: configService.get<number>('DB_POOL_MIN', 5),
      idleTimeoutMillis: configService.get<number>('DB_IDLE_TIMEOUT', 30000),
      connectionTimeoutMillis: configService.get<number>('DB_CONNECTION_TIMEOUT', 10000),
      query_timeout: configService.get<number>('DB_QUERY_TIMEOUT', 30000),
      statement_timeout: configService.get<number>('DB_STATEMENT_TIMEOUT', 30000),
    },

    // Entity and migration paths
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],

    // Synchronization and migrations
    synchronize: false, // Never use in production
    migrationsRun: isProduction,

    // Logging
    logging: isDevelopment ? ['query', 'error', 'warn'] : ['error', 'warn'],
    logger: 'advanced-console',

    // Performance
    cache: {
      type: 'redis',
      options: {
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        password: configService.get<string>('REDIS_PASSWORD'),
        db: configService.get<number>('REDIS_CACHE_DB', 1),
      },
      duration: 30000, // 30 seconds
    },

    // Retry logic
    maxQueryExecutionTime: 30000,

    // Application name for connection identification
    applicationName: 'payment-api',
  };
};

// Data source for TypeORM CLI (migrations)
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'payment_user',
  password: process.env.DB_PASSWORD || 'payment_pass',
  database: process.env.DB_DATABASE || 'payment_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
} as DataSourceOptions);
