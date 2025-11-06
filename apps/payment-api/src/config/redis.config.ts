import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export const redisConfig = (configService: ConfigService): RedisOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    host: configService.get<string>('REDIS_HOST', 'localhost'),
    port: configService.get<number>('REDIS_PORT', 6379),
    password: configService.get<string>('REDIS_PASSWORD'),
    db: configService.get<number>('REDIS_DB', 0),

    // Connection settings
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError: (err: Error) => {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
      if (targetErrors.some((targetError) => err.message.includes(targetError))) {
        return true;
      }
      return false;
    },

    // Timeouts
    connectTimeout: 10000,
    commandTimeout: 5000,

    // TLS for production
    tls: isProduction
      ? {
          rejectUnauthorized: true,
        }
      : undefined,

    // Connection pool
    lazyConnect: false,
    keepAlive: 30000,
    enableReadyCheck: true,
    enableOfflineQueue: true,

    // Performance
    showFriendlyErrorStack: !isProduction,
  };
};
