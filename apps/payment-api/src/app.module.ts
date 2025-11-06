import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

// Configuration
import { typeOrmConfig } from './config/typeorm.config';
import { redisConfig } from './config/redis.config';
import { queueConfig } from './config/queue.config';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { CardsModule } from './modules/cards/cards.module';
import { BanksModule } from './modules/banks/banks.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { BillsModule } from './modules/bills/bills.module';
import { FxModule } from './modules/fx/fx.module';
import { KycModule } from './modules/kyc/kyc.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ReportsModule } from './modules/reports/reports.module';

// Core Modules
import { LedgerModule } from './modules/ledger/ledger.module';
import { FraudModule } from './modules/fraud/fraud.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

// Health Check
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Logging
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              winston.format.errors({ stack: true }),
              winston.format.colorize({ all: true }),
              winston.format.printf(({ timestamp, level, message, context, trace }) => {
                return `${timestamp} [${context || 'Application'}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
              }),
            ),
          }),
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        ],
      }),
      inject: [ConfigService],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),

    // Redis & Queues
    BullModule.forRootAsync({
      useFactory: queueConfig,
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('THROTTLE_TTL', 60),
        limit: configService.get<number>('THROTTLE_LIMIT', 10),
      }),
      inject: [ConfigService],
    }),

    // Event Emitter
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    WalletsModule,
    PaymentsModule,
    TransfersModule,
    CardsModule,
    BanksModule,
    TransactionsModule,
    RefundsModule,
    DisputesModule,
    BillsModule,
    FxModule,
    KycModule,
    WebhooksModule,
    ReportsModule,

    // Core Modules
    LedgerModule,
    FraudModule,
    NotificationsModule,

    // Health
    HealthModule,
  ],
})
export class AppModule {}
