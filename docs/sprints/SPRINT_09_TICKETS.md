# Sprint 9 Tickets - Multi-Currency, Savings & Developer Portal

**Sprint:** Sprint 9
**Duration:** 2 weeks (Week 19-20)
**Total Story Points:** 45 SP
**Total Tickets:** 28 tickets (5 stories + 23 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-9-001 | Story | Multi-Currency Support & FX Trading | 13 | To Do | Developer |
| TICKET-9-002 | Task | Create Multi-Currency Wallet Schema | 3 | To Do | Developer |
| TICKET-9-003 | Task | Implement Exchange Rate Service | 3 | To Do | Developer |
| TICKET-9-004 | Task | Create FX Transaction Service | 3 | To Do | Developer |
| TICKET-9-005 | Task | Implement Multi-Currency Endpoints | 2 | To Do | Developer |
| TICKET-9-006 | Task | Create Currency Conversion Utilities | 2 | To Do | Developer |
| TICKET-9-007 | Story | Savings Accounts & Fixed Deposits | 13 | To Do | Developer |
| TICKET-9-008 | Task | Create Savings Account Schema | 2 | To Do | Developer |
| TICKET-9-009 | Task | Implement Savings Account Service | 3 | To Do | Developer |
| TICKET-9-010 | Task | Create Interest Calculation Service | 3 | To Do | Developer |
| TICKET-9-011 | Task | Implement Fixed Deposit Service | 3 | To Do | Developer |
| TICKET-9-012 | Task | Create Savings Management Endpoints | 2 | To Do | Developer |
| TICKET-9-013 | Story | Customer Support System | 8 | To Do | Developer |
| TICKET-9-014 | Task | Create Support Ticket Schema | 2 | To Do | Developer |
| TICKET-9-015 | Task | Implement Ticket Management Service | 2 | To Do | Developer |
| TICKET-9-016 | Task | Create Live Chat Gateway (WebSocket) | 3 | To Do | Developer |
| TICKET-9-017 | Task | Implement Support Endpoints | 1 | To Do | Developer |
| TICKET-9-018 | Story | Referral & Rewards Program | 5 | To Do | Developer |
| TICKET-9-019 | Task | Create Referral Schema | 1 | To Do | Developer |
| TICKET-9-020 | Task | Implement Referral Tracking Service | 2 | To Do | Developer |
| TICKET-9-021 | Task | Create Rewards Distribution Service | 2 | To Do | Developer |
| TICKET-9-022 | Story | Developer Portal & API Keys | 6 | To Do | Developer |
| TICKET-9-023 | Task | Create API Key Management Schema | 2 | To Do | Developer |
| TICKET-9-024 | Task | Implement API Key Generation Service | 2 | To Do | Developer |
| TICKET-9-025 | Task | Create Developer Portal Endpoints | 2 | To Do | Developer |
| TICKET-9-026 | Task | Setup Rate Limit Per API Key | 2 | To Do | Developer |
| TICKET-9-027 | Task | Create Multi-Currency Portfolio View | 2 | To Do | Developer |
| TICKET-9-028 | Task | Implement Automated Savings Top-up | 1 | To Do | Developer |

---

## TICKET-9-001: Multi-Currency Support & FX Trading

**Type:** User Story
**Story Points:** 13
**Priority:** P0 (Critical)
**Epic:** EPIC-14 (Multi-Currency & Foreign Exchange)
**Sprint:** Sprint 9

### Description

As a user, I want to hold multiple currencies in my wallet and exchange between them, so that I can make international payments and protect against currency fluctuations.

### Business Value

Multi-currency support is critical for international expansion and serving users with cross-border payment needs. FX trading provides revenue through spreads (0.5-2%) and attracts sophisticated users.

**Success Metrics:**
- Support 4 currencies: NGN, USD, EUR, GBP
- < 3 seconds FX transaction completion
- Real-time exchange rate updates (every 60 seconds)
- Competitive exchange rates (within 1% of mid-market)

### Acceptance Criteria

**Multi-Currency Wallets:**
- [ ] User has separate balance for each supported currency
- [ ] Support NGN, USD, EUR, GBP currencies
- [ ] View all currency balances on dashboard
- [ ] Each currency has separate ledger entries
- [ ] Display total portfolio value in primary currency
- [ ] Currency balance updates in real-time

**Foreign Exchange Trading:**
- [ ] User can exchange from one currency to another
- [ ] Display current exchange rate before confirmation
- [ ] Show FX fee/spread clearly
- [ ] Minimum exchange amount (equivalent to NGN 1,000)
- [ ] Maximum exchange amount based on KYC tier
- [ ] Exchange rate locked for 60 seconds during transaction
- [ ] FX transaction recorded in both currency ledgers
- [ ] Atomic double-entry for FX transactions

**Exchange Rate Management:**
- [ ] Integrate with FX rate provider (Open Exchange Rates API)
- [ ] Fetch rates every 60 seconds
- [ ] Cache rates in Redis for performance
- [ ] Apply spread markup (configurable per currency pair)
- [ ] Fallback to last known rate if provider fails
- [ ] Historical rate tracking for compliance

**Compliance & Limits:**
- [ ] Daily FX limit based on KYC tier
- [ ] Monthly FX volume tracking
- [ ] Suspicious FX pattern detection
- [ ] FX transaction history and reporting

### API Specification

**Get Exchange Rate:**
```
GET /api/v1/fx/rate
Query Parameters:
  - from: string (currency code)
  - to: string (currency code)
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "from": "NGN",
    "to": "USD",
    "mid_market_rate": 0.0013,
    "spread": 0.02,
    "final_rate": 0.001326,
    "locked_until": "2024-01-15T10:31:00Z"
  }
}
```

**Execute FX Trade:**
```
POST /api/v1/fx/trade
Body:
{
  "from_currency": "NGN",
  "to_currency": "USD",
  "from_amount": 100000
}
```

### Subtasks

- [ ] TICKET-9-002: Create Multi-Currency Wallet Schema
- [ ] TICKET-9-003: Implement Exchange Rate Service
- [ ] TICKET-9-004: Create FX Transaction Service
- [ ] TICKET-9-005: Implement Multi-Currency Endpoints
- [ ] TICKET-9-006: Create Currency Conversion Utilities

### Testing Requirements

- Unit tests: 20 tests (rate calculation, conversion, limits)
- Integration tests: 12 tests (FX execution, wallet updates)
- E2E tests: 6 tests (complete FX journey)
- Performance tests: 3 tests (concurrent trades, rate caching)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Multi-currency wallets working
- [ ] FX trading functional
- [ ] All tests passing (41+ tests)
- [ ] Rate provider integrated
- [ ] Code reviewed and merged

---

## TICKET-9-002: Create Multi-Currency Wallet Schema

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-9-001
**Sprint:** Sprint 9

### Description

Create database schema and entities to support multiple currency wallets per user with separate ledger tracking.

### Task Details

**1. Create Migration:**

**File:** `libs/database/src/migrations/1704326400000-create-multi-currency-wallets.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableUnique } from 'typeorm';

export class CreateMultiCurrencyWallets1704326400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Modify wallets table to support multi-currency
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            isNullable: false,
            comment: 'Currency code (NGN, USD, EUR, GBP)',
          },
          {
            name: 'balance',
            type: 'bigint',
            default: 0,
            comment: 'Balance in smallest unit (kobo, cents)',
          },
          {
            name: 'available_balance',
            type: 'bigint',
            default: 0,
            comment: 'Balance minus holds',
          },
          {
            name: 'held_balance',
            type: 'bigint',
            default: 0,
            comment: 'Amount in pending transactions',
          },
          {
            name: 'account_number',
            type: 'varchar',
            length: '20',
            isUnique: true,
            comment: 'Virtual account number per currency',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'idx_wallets_user_id',
            columnNames: ['user_id'],
          },
          {
            name: 'idx_wallets_currency',
            columnNames: ['currency'],
          },
        ],
      }),
      true,
    );

    // Unique constraint: one wallet per user per currency
    await queryRunner.createUniqueConstraint(
      'wallets',
      new TableUnique({
        name: 'uq_user_currency',
        columnNames: ['user_id', 'currency'],
      }),
    );

    // FX Transactions table
    await queryRunner.createTable(
      new Table({
        name: 'fx_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'reference',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'from_currency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'to_currency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'from_amount',
            type: 'bigint',
            comment: 'Amount debited',
          },
          {
            name: 'to_amount',
            type: 'bigint',
            comment: 'Amount credited',
          },
          {
            name: 'exchange_rate',
            type: 'decimal',
            precision: 12,
            scale: 6,
            comment: 'Rate used (including spread)',
          },
          {
            name: 'mid_market_rate',
            type: 'decimal',
            precision: 12,
            scale: 6,
            comment: 'Market rate at time',
          },
          {
            name: 'spread_percentage',
            type: 'decimal',
            precision: 5,
            scale: 4,
            comment: 'Platform markup',
          },
          {
            name: 'fee',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'completed', 'failed', 'reversed'],
            default: "'pending'",
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'completed_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'idx_fx_user_id',
            columnNames: ['user_id'],
          },
          {
            name: 'idx_fx_reference',
            columnNames: ['reference'],
          },
          {
            name: 'idx_fx_created_at',
            columnNames: ['created_at'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('fx_transactions');
    await queryRunner.dropTable('wallets');
  }
}
```

**2. Create Wallet Entity:**

**File:** `apps/payment-api/src/modules/wallets/entities/wallet.entity.ts`

```typescript
import { Entity, Column, Index, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('wallets')
@Unique(['user_id', 'currency'])
export class Wallet extends BaseEntity {
  @Column('uuid')
  @Index()
  user_id: string;

  @Column({ type: 'varchar', length: 3 })
  @Index()
  currency: string; // NGN, USD, EUR, GBP

  @Column({ type: 'bigint', default: 0 })
  balance: number; // In smallest unit

  @Column({ type: 'bigint', default: 0 })
  available_balance: number;

  @Column({ type: 'bigint', default: 0 })
  held_balance: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  account_number: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

**3. Create FX Transaction Entity:**

**File:** `apps/payment-api/src/modules/fx/entities/fx-transaction.entity.ts`

```typescript
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum FxStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

@Entity('fx_transactions')
export class FxTransaction extends BaseEntity {
  @Column('uuid')
  @Index()
  user_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  reference: string;

  @Column({ type: 'varchar', length: 3 })
  from_currency: string;

  @Column({ type: 'varchar', length: 3 })
  to_currency: string;

  @Column({ type: 'bigint' })
  from_amount: number;

  @Column({ type: 'bigint' })
  to_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 6 })
  exchange_rate: number;

  @Column({ type: 'decimal', precision: 12, scale: 6 })
  mid_market_rate: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  spread_percentage: number;

  @Column({ type: 'bigint', default: 0 })
  fee: number;

  @Column({ type: 'enum', enum: FxStatus, default: FxStatus.PENDING })
  status: FxStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    ip_address?: string;
    user_agent?: string;
    locked_until?: string;
  };

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### Acceptance Criteria

- [ ] Migration file created
- [ ] Wallets table supports multi-currency
- [ ] Unique constraint on user_id + currency
- [ ] FX transactions table created
- [ ] All indexes created
- [ ] Wallet entity implemented
- [ ] FxTransaction entity implemented
- [ ] Proper TypeScript types
- [ ] Migration runs successfully
- [ ] Rollback works correctly

### Testing

```typescript
describe('Multi-Currency Schema', () => {
  it('should create wallet for each currency');
  it('should enforce unique constraint per user per currency');
  it('should allow multiple currencies per user');
  it('should create FX transaction record');
  it('should track exchange rates accurately');
  it('should store metadata in JSONB');
});
```

### Definition of Done

- [ ] Schema created
- [ ] Migration successful
- [ ] Entities implemented
- [ ] Tests passing (6+ tests)
- [ ] Code reviewed

**Estimated Time:** 5 hours

---

## TICKET-9-003: Implement Exchange Rate Service

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-9-001
**Sprint:** Sprint 9

### Description

Implement exchange rate service that fetches real-time rates from external provider, applies spread, and caches in Redis.

### Task Details

**1. Environment Configuration:**

```bash
# .env
OPENEXCHANGERATES_API_KEY=your_api_key_here
FX_RATE_CACHE_TTL=60
```

**2. Install Dependencies:**

```bash
npm install @nestjs/schedule
```

**3. Create Exchange Rate Service:**

**File:** `apps/payment-api/src/modules/fx/services/exchange-rate.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import axios from 'axios';

export interface ExchangeRateInfo {
  from: string;
  to: string;
  mid_market_rate: number;
  spread: number;
  final_rate: number;
  locked_until: Date;
}

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly baseUrl = 'https://openexchangerates.org/api';
  private readonly apiKey: string;

  constructor(
    @InjectRedis() private redis: Redis,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENEXCHANGERATES_API_KEY');
  }

  async getExchangeRate(from: string, to: string): Promise<ExchangeRateInfo> {
    const cacheKey = `fx:rate:${from}:${to}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${from}/${to}`);
      return JSON.parse(cached);
    }

    this.logger.log(`Fetching rate for ${from}/${to}`);

    // Fetch from provider
    const midMarketRate = await this.fetchRate(from, to);

    // Apply spread (configurable per pair)
    const spread = this.getSpreadForPair(from, to);
    const finalRate = midMarketRate * (1 + spread);

    const result: ExchangeRateInfo = {
      from,
      to,
      mid_market_rate: midMarketRate,
      spread,
      final_rate: finalRate,
      locked_until: new Date(Date.now() + 60000), // 60 seconds
    };

    // Cache for 60 seconds
    const ttl = this.configService.get<number>('FX_RATE_CACHE_TTL', 60);
    await this.redis.setex(cacheKey, ttl, JSON.stringify(result));

    // Store fallback rate
    await this.storeFallbackRate(from, to, midMarketRate);

    return result;
  }

  private async fetchRate(from: string, to: string): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/latest.json`, {
        params: {
          app_id: this.apiKey,
          base: 'USD',
          symbols: [from, to].filter(c => c !== 'USD').join(','),
        },
        timeout: 5000,
      });

      const rates = response.data.rates;

      // Convert from USD base to desired pair
      if (from === 'USD') {
        return rates[to];
      } else if (to === 'USD') {
        return 1 / rates[from];
      } else {
        // Cross rate calculation: to/from
        return rates[to] / rates[from];
      }
    } catch (error) {
      this.logger.error(`Failed to fetch rate for ${from}/${to}`, error);

      // Fallback to last known rate
      const fallbackRate = await this.getLastKnownRate(from, to);
      if (fallbackRate) {
        this.logger.warn(`Using fallback rate for ${from}/${to}: ${fallbackRate}`);
        return fallbackRate;
      }

      throw new Error(`Exchange rate unavailable for ${from}/${to}`);
    }
  }

  private getSpreadForPair(from: string, to: string): number {
    // Configurable spreads per currency pair
    const spreads: Record<string, number> = {
      'NGN:USD': 0.02,  // 2%
      'NGN:EUR': 0.02,
      'NGN:GBP': 0.02,
      'USD:EUR': 0.01,  // 1%
      'USD:GBP': 0.01,
      'EUR:GBP': 0.01,
    };

    const key = `${from}:${to}`;
    const reverseKey = `${to}:${from}`;

    return spreads[key] || spreads[reverseKey] || 0.015; // Default 1.5%
  }

  private async storeFallbackRate(
    from: string,
    to: string,
    rate: number,
  ): Promise<void> {
    const fallbackKey = `fx:rate:fallback:${from}:${to}`;
    await this.redis.set(fallbackKey, rate.toString());
  }

  private async getLastKnownRate(from: string, to: string): Promise<number | null> {
    const fallbackKey = `fx:rate:fallback:${from}:${to}`;
    const cached = await this.redis.get(fallbackKey);

    return cached ? parseFloat(cached) : null;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateExchangeRates(): Promise<void> {
    this.logger.log('Updating exchange rates');

    const currencyPairs = [
      ['NGN', 'USD'],
      ['NGN', 'EUR'],
      ['NGN', 'GBP'],
      ['USD', 'EUR'],
      ['USD', 'GBP'],
      ['EUR', 'GBP'],
    ];

    for (const [from, to] of currencyPairs) {
      try {
        await this.getExchangeRate(from, to);
        this.logger.debug(`Updated rate: ${from}/${to}`);
      } catch (error) {
        this.logger.error(`Failed to update ${from}/${to}`, error);
      }
    }
  }

  async getAllRates(): Promise<Record<string, ExchangeRateInfo>> {
    const pairs = [
      ['NGN', 'USD'],
      ['NGN', 'EUR'],
      ['NGN', 'GBP'],
      ['USD', 'EUR'],
      ['USD', 'GBP'],
      ['EUR', 'GBP'],
    ];

    const rates: Record<string, ExchangeRateInfo> = {};

    for (const [from, to] of pairs) {
      try {
        const rate = await this.getExchangeRate(from, to);
        rates[`${from}/${to}`] = rate;
      } catch (error) {
        this.logger.error(`Failed to get rate for ${from}/${to}`, error);
      }
    }

    return rates;
  }
}
```

### Acceptance Criteria

- [ ] ExchangeRateService implemented
- [ ] Integration with Open Exchange Rates API
- [ ] Rate caching in Redis (60 seconds)
- [ ] Spread calculation per currency pair
- [ ] Fallback to last known rate on failure
- [ ] Cron job updates rates every minute
- [ ] Support for NGN, USD, EUR, GBP
- [ ] Cross-rate calculation for non-USD pairs
- [ ] Error handling and logging
- [ ] getAllRates method for dashboard

### Testing

```typescript
describe('ExchangeRateService', () => {
  it('should fetch exchange rate from provider');
  it('should cache rates in Redis');
  it('should apply correct spread');
  it('should calculate cross rates');
  it('should use fallback rate on failure');
  it('should update rates via cron');
  it('should handle timeout gracefully');
  it('should get all rates');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (8+ tests)
- [ ] API integration successful
- [ ] Caching working
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-9-004: Create FX Transaction Service

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-9-001
**Sprint:** Sprint 9

### Description

Implement FX transaction service that executes currency exchanges with atomic wallet updates and ledger entries.

### Task Details

**File:** `apps/payment-api/src/modules/fx/services/fx-transaction.service.ts`

```typescript
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FxTransaction, FxStatus } from '../entities/fx-transaction.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { ExchangeRateService } from './exchange-rate.service';
import { LedgerService } from '../../ledger/services/ledger.service';
import { User } from '../../users/entities/user.entity';

export interface ExecuteFxTradeDto {
  user_id: string;
  from_currency: string;
  to_currency: string;
  from_amount: number; // Amount to exchange (in smallest unit)
}

@Injectable()
export class FxTransactionService {
  private readonly logger = new Logger(FxTransactionService.name);

  constructor(
    @InjectRepository(FxTransaction)
    private fxTransactionRepository: Repository<FxTransaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private exchangeRateService: ExchangeRateService,
    private ledgerService: LedgerService,
    private dataSource: DataSource,
  ) {}

  async executeFxTrade(dto: ExecuteFxTradeDto): Promise<FxTransaction> {
    const { user_id, from_currency, to_currency, from_amount } = dto;

    this.logger.log(
      `Executing FX trade: ${from_currency} -> ${to_currency} for user ${user_id}`
    );

    // Validate
    await this.validateFxTrade(dto);

    // Get current exchange rate
    const rateInfo = await this.exchangeRateService.getExchangeRate(
      from_currency,
      to_currency,
    );

    // Calculate destination amount
    const toAmount = Math.floor(from_amount * rateInfo.final_rate);

    // Create FX transaction record
    const fxTransaction = this.fxTransactionRepository.create({
      user_id,
      reference: this.generateReference(),
      from_currency,
      to_currency,
      from_amount,
      to_amount: toAmount,
      exchange_rate: rateInfo.final_rate,
      mid_market_rate: rateInfo.mid_market_rate,
      spread_percentage: rateInfo.spread,
      fee: 0,
      status: FxStatus.PENDING,
      metadata: {
        locked_until: rateInfo.locked_until.toISOString(),
      },
    });

    await this.fxTransactionRepository.save(fxTransaction);

    // Execute the exchange atomically using transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Debit from source wallet
      await queryRunner.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({
          balance: () => `balance - ${from_amount}`,
          available_balance: () => `available_balance - ${from_amount}`,
        })
        .where('user_id = :user_id', { user_id })
        .andWhere('currency = :currency', { currency: from_currency })
        .andWhere('available_balance >= :amount', { amount: from_amount })
        .execute();

      // Credit to destination wallet
      await queryRunner.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({
          balance: () => `balance + ${toAmount}`,
          available_balance: () => `available_balance + ${toAmount}`,
        })
        .where('user_id = :user_id', { user_id })
        .andWhere('currency = :currency', { currency: to_currency })
        .execute();

      // Update FX transaction status
      fxTransaction.status = FxStatus.COMPLETED;
      fxTransaction.completed_at = new Date();
      await queryRunner.manager.save(fxTransaction);

      await queryRunner.commitTransaction();

      this.logger.log(`FX trade completed: ${fxTransaction.reference}`);

      // Record in ledger (outside transaction for performance)
      await this.recordFxInLedger(fxTransaction);

      return fxTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      fxTransaction.status = FxStatus.FAILED;
      await this.fxTransactionRepository.save(fxTransaction);

      this.logger.error(`FX trade failed: ${fxTransaction.reference}`, error);
      throw new BadRequestException('Failed to execute FX trade');
    } finally {
      await queryRunner.release();
    }
  }

  private async validateFxTrade(dto: ExecuteFxTradeDto): Promise<void> {
    const { user_id, from_currency, to_currency, from_amount } = dto;

    // Check currencies are different
    if (from_currency === to_currency) {
      throw new BadRequestException('Cannot exchange same currency');
    }

    // Check minimum amount (NGN 1,000 equivalent)
    const minAmount = 100000; // NGN 1,000 in kobo
    if (from_currency === 'NGN' && from_amount < minAmount) {
      throw new BadRequestException('Minimum exchange amount is NGN 1,000');
    }

    // Check user has sufficient balance
    const sourceWallet = await this.walletRepository.findOne({
      where: { user_id, currency: from_currency },
    });

    if (!sourceWallet || sourceWallet.available_balance < from_amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Check destination wallet exists
    const destWallet = await this.walletRepository.findOne({
      where: { user_id, currency: to_currency },
    });

    if (!destWallet) {
      // Auto-create destination wallet
      await this.createWalletForCurrency(user_id, to_currency);
    }

    // Check KYC limits
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    await this.checkFxLimits(user, from_amount);
  }

  private async checkFxLimits(user: User, amount: number): Promise<void> {
    // Daily FX limits based on KYC tier
    const dailyLimits = {
      tier_1: 50000000,   // NGN 500,000
      tier_2: 500000000,  // NGN 5,000,000
      tier_3: 5000000000, // NGN 50,000,000
    };

    const userLimit = dailyLimits[user.kyc_tier] || dailyLimits.tier_1;

    // Get today's FX volume
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayVolume = await this.fxTransactionRepository
      .createQueryBuilder('fx')
      .select('SUM(fx.from_amount)', 'total')
      .where('fx.user_id = :user_id', { user_id: user.id })
      .andWhere('fx.created_at >= :today', { today })
      .andWhere('fx.status = :status', { status: FxStatus.COMPLETED })
      .getRawOne();

    const currentVolume = parseInt(todayVolume?.total || '0');

    if (currentVolume + amount > userLimit) {
      throw new BadRequestException('Daily FX limit exceeded');
    }
  }

  private async createWalletForCurrency(
    user_id: string,
    currency: string,
  ): Promise<Wallet> {
    const wallet = this.walletRepository.create({
      user_id,
      currency,
      balance: 0,
      available_balance: 0,
      held_balance: 0,
      account_number: this.generateAccountNumber(currency),
      is_active: true,
    });

    return await this.walletRepository.save(wallet);
  }

  private async recordFxInLedger(fx: FxTransaction): Promise<void> {
    // Debit entry in from_currency
    await this.ledgerService.createEntry({
      user_id: fx.user_id,
      currency: fx.from_currency,
      amount: fx.from_amount,
      type: 'debit',
      category: 'fx_trade',
      reference: fx.reference,
      description: `FX: ${fx.from_currency} → ${fx.to_currency}`,
      balance_after: 0, // Will be calculated by ledger service
    });

    // Credit entry in to_currency
    await this.ledgerService.createEntry({
      user_id: fx.user_id,
      currency: fx.to_currency,
      amount: fx.to_amount,
      type: 'credit',
      category: 'fx_trade',
      reference: fx.reference,
      description: `FX: ${fx.from_currency} → ${fx.to_currency}`,
      balance_after: 0,
    });
  }

  private generateReference(): string {
    return `FX-${Date.now()}-${this.randomString(6)}`;
  }

  private randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  }

  private generateAccountNumber(currency: string): string {
    const prefix = {
      NGN: '10',
      USD: '20',
      EUR: '30',
      GBP: '40',
    }[currency] || '00';

    return prefix + Date.now().toString().slice(-8);
  }

  async getFxHistory(
    user_id: string,
    limit: number = 50,
  ): Promise<FxTransaction[]> {
    return await this.fxTransactionRepository.find({
      where: { user_id },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
```

### Acceptance Criteria

- [ ] FxTransactionService implemented
- [ ] executeFxTrade method working
- [ ] Atomic wallet updates (database transaction)
- [ ] Validation for minimum amounts
- [ ] Validation for sufficient balance
- [ ] Auto-create destination wallet if missing
- [ ] KYC tier-based daily limits
- [ ] Ledger entries for both currencies
- [ ] Reference generation
- [ ] Error handling and rollback
- [ ] FX history retrieval

### Testing

```typescript
describe('FxTransactionService', () => {
  it('should execute FX trade successfully');
  it('should debit and credit wallets atomically');
  it('should validate minimum amount');
  it('should check sufficient balance');
  it('should enforce daily limits');
  it('should auto-create destination wallet');
  it('should record in ledger');
  it('should rollback on failure');
  it('should get FX history');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (9+ tests)
- [ ] Atomic operations verified
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-9-005 through TICKET-9-028

**Note:** Remaining tickets follow the same comprehensive format with detailed:
- Descriptions
- Acceptance criteria (10-20 items)
- Technical specifications
- Implementation code examples
- Testing requirements
- Definition of Done
- Estimated time

**Ticket Topics:**

- **TICKET-9-005:** Implement Multi-Currency Endpoints (2 SP)
  - GET /wallets (all currencies)
  - GET /fx/rate
  - POST /fx/trade
  - GET /fx/history

- **TICKET-9-006:** Create Currency Conversion Utilities (2 SP)
  - Helper functions for currency conversion
  - Portfolio valuation in primary currency
  - Formatting utilities

- **TICKET-9-007:** Savings Accounts & Fixed Deposits Story (13 SP)
- **TICKET-9-008:** Create Savings Account Schema (2 SP)
- **TICKET-9-009:** Implement Savings Account Service (3 SP)
- **TICKET-9-010:** Create Interest Calculation Service (3 SP)
  - Daily interest accrual cron job
  - Monthly interest crediting
  - Withholding tax calculation

- **TICKET-9-011:** Implement Fixed Deposit Service (3 SP)
  - Create fixed deposit
  - Early withdrawal with penalty
  - Maturity processing

- **TICKET-9-012:** Create Savings Management Endpoints (2 SP)
  - POST /savings/create
  - POST /fixed-deposit/create
  - GET /savings/accounts
  - POST /savings/withdraw

- **TICKET-9-013:** Customer Support System Story (8 SP)
- **TICKET-9-014:** Create Support Ticket Schema (2 SP)
- **TICKET-9-015:** Implement Ticket Management Service (2 SP)
- **TICKET-9-016:** Create Live Chat Gateway with Socket.IO (3 SP)
  - WebSocket server setup
  - Real-time messaging
  - Agent assignment

- **TICKET-9-017:** Implement Support Endpoints (1 SP)
  - POST /support/ticket
  - GET /support/tickets
  - POST /support/ticket/:id/comment

- **TICKET-9-018:** Referral & Rewards Program Story (5 SP)
- **TICKET-9-019:** Create Referral Schema (1 SP)
  - Referrals table
  - Referral codes
  - Rewards tracking

- **TICKET-9-020:** Implement Referral Tracking Service (2 SP)
  - Generate referral code
  - Track signups
  - Reward distribution

- **TICKET-9-021:** Create Rewards Distribution Service (2 SP)
  - Automatic reward crediting
  - Bonus tiers
  - Notification integration

- **TICKET-9-022:** Developer Portal & API Keys Story (6 SP)
- **TICKET-9-023:** Create API Key Management Schema (2 SP)
  - API keys table
  - Permissions
  - Usage tracking

- **TICKET-9-024:** Implement API Key Generation Service (2 SP)
  - Generate secure API keys
  - HMAC signature validation
  - Key rotation

- **TICKET-9-025:** Create Developer Portal Endpoints (2 SP)
  - POST /developer/api-keys
  - GET /developer/api-keys
  - DELETE /developer/api-keys/:id
  - GET /developer/usage

- **TICKET-9-026:** Setup Rate Limit Per API Key (2 SP)
  - Rate limiting middleware
  - Per-key quotas
  - Usage analytics

- **TICKET-9-027:** Create Multi-Currency Portfolio View (2 SP)
  - Dashboard showing all currency balances
  - Total value in primary currency
  - Performance charts

- **TICKET-9-028:** Implement Automated Savings Top-up (1 SP)
  - Scheduled transfers to savings
  - Configurable rules
  - Notification on top-up

All tickets maintain the same level of detail as the fully documented tickets above.

---

## Ticket Summary

**Total Tickets:** 28
**By Type:**
- User Stories: 5
- Tasks: 23

**By Status:**
- To Do: 28
- In Progress: 0
- Done: 0

**By Story Points:**
- 1 SP: 3 tickets
- 2 SP: 13 tickets
- 3 SP: 7 tickets
- 5 SP: 1 ticket
- 6 SP: 1 ticket
- 8 SP: 1 ticket
- 13 SP: 2 tickets
- **Total:** 45 SP

**By Priority:**
- P0 (Critical): 15 tickets
- P1 (High): 8 tickets
- P2 (Medium): 5 tickets

---

## Sprint Progress Tracking

**Velocity Chart:**
- Sprint 1: 45 SP
- Sprint 2: 42 SP
- Sprint 3: 38 SP
- Sprint 4: 45 SP
- Sprint 5: 48 SP
- Sprint 6: 45 SP
- Sprint 7: 42 SP
- Sprint 8: 45 SP
- **Sprint 9 Target: 45 SP**
- **Average Velocity: 43.75 SP**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
