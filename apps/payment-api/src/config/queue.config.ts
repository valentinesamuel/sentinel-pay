import { BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

export const queueConfig = (
  configService: ConfigService,
): BullModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    redis: {
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
      password: configService.get<string>('REDIS_PASSWORD'),
      db: configService.get<number>('REDIS_QUEUE_DB', 2),

      // Connection settings
      maxRetriesPerRequest: null, // BullMQ requirement
      retryStrategy: (times: number) => {
        return Math.min(times * 50, 2000);
      },

      // Timeouts
      connectTimeout: 10000,

      // TLS for production
      tls: isProduction
        ? {
            rejectUnauthorized: true,
          }
        : undefined,
    },

    // Default job options
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
        age: 24 * 3600, // Keep for 24 hours
      },
      removeOnFail: {
        count: 500, // Keep last 500 failed jobs for debugging
        age: 7 * 24 * 3600, // Keep for 7 days
      },
    },

    // Queue settings
    prefix: 'bull',

    // Limiter (optional - can be overridden per queue)
    settings: {
      lockDuration: 30000, // 30 seconds
      stalledInterval: 30000, // Check for stalled jobs every 30s
      maxStalledCount: 1, // Maximum number of times a job can be stalled
    },
  };
};
