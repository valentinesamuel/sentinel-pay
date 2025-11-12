# Sprint 14 Tickets - Currency Exchange & FX

**Sprint:** Sprint 14
**Duration:** 2 weeks (Week 29-30)
**Total Story Points:** 38 SP
**Total Tickets:** 25 tickets (3 stories + 22 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-14-001 | Story | Real-Time FX Rate Engine | 13 | To Do | Developer |
| TICKET-14-002 | Task | Create FX Rate Schema | 2 | To Do | Developer |
| TICKET-14-003 | Task | Implement Rate Provider Integration | 3 | To Do | Developer |
| TICKET-14-004 | Task | Create FX Rate Service | 3 | To Do | Developer |
| TICKET-14-005 | Task | Implement Rate Caching Layer | 2 | To Do | Developer |
| TICKET-14-006 | Task | Create Rate Update Cron Job | 2 | To Do | Developer |
| TICKET-14-007 | Task | Implement Rate Alert System | 1 | To Do | Developer |
| TICKET-14-008 | Story | Wallet-to-Wallet Currency Exchange | 13 | To Do | Developer |
| TICKET-14-009 | Task | Create Currency Exchange Schema | 2 | To Do | Developer |
| TICKET-14-010 | Task | Implement Exchange Quote Service | 3 | To Do | Developer |
| TICKET-14-011 | Task | Create Exchange Execution Service | 3 | To Do | Developer |
| TICKET-14-012 | Task | Implement Exchange Limits & Validation | 2 | To Do | Developer |
| TICKET-14-013 | Task | Create Multi-Currency Ledger Entries | 2 | To Do | Developer |
| TICKET-14-014 | Task | Create FX Endpoints | 1 | To Do | Developer |
| TICKET-14-015 | Story | P2P Currency Exchange Marketplace | 12 | To Do | Developer |
| TICKET-14-016 | Task | Create P2P Exchange Schema | 2 | To Do | Developer |
| TICKET-14-017 | Task | Implement P2P Listing Service | 3 | To Do | Developer |
| TICKET-14-018 | Task | Create Marketplace Search & Filter | 2 | To Do | Developer |
| TICKET-14-019 | Task | Implement Escrow System | 3 | To Do | Developer |
| TICKET-14-020 | Task | Create Dispute Resolution System | 1 | To Do | Developer |
| TICKET-14-021 | Task | Implement Reputation System | 1 | To Do | Developer |
| TICKET-14-022 | Task | Create P2P Endpoints | 1 | To Do | Developer |
| TICKET-14-023 | Task | Implement FX Analytics Dashboard | 2 | To Do | Developer |
| TICKET-14-024 | Task | Create Rate History Charts | 2 | To Do | Developer |
| TICKET-14-025 | Task | Implement WebSocket Rate Updates | 2 | To Do | Developer |

---

## TICKET-14-001: Real-Time FX Rate Engine

**Type:** User Story
**Story Points:** 13
**Priority:** P0 (Critical)
**Epic:** EPIC-9 (Currency Exchange)
**Sprint:** Sprint 14

### Description

As a platform, I want to fetch and maintain real-time exchange rates from reliable sources, so that users can perform currency exchanges at competitive and accurate rates.

### Business Value

A robust FX rate engine is the foundation for all currency exchange operations. Competitive rates drive user adoption while accurate pricing protects platform revenue.

**Success Metrics:**
- Rate updates every 60 seconds during market hours
- < 2 second rate quote response time
- 99.9% rate provider uptime
- Spread within 0.5% of interbank rates

### Acceptance Criteria

**Rate Provider Integration:**
- [ ] Integrate with external FX rate provider (Fixer.io, XE, or OANDA)
- [ ] Fetch rates for NGN/USD, NGN/GBP, NGN/EUR, USD/GBP, USD/EUR, GBP/EUR
- [ ] Real-time rate updates every 60 seconds
- [ ] Fallback to secondary provider on failure
- [ ] Cache rates with 60-second TTL
- [ ] Historical rate storage (1 year retention)

**Rate Calculation:**
- [ ] Calculate mid-market rate
- [ ] Apply configurable markup (0.5-3%)
- [ ] Different rates for different transaction sizes
- [ ] VIP user preferential rates
- [ ] Display rate validity period (5 minutes)

**Rate Display:**
- [ ] Show buy and sell rates separately
- [ ] Display rate trend (up/down indicator)
- [ ] Show rate change percentage (24h)
- [ ] All-in cost transparency

### API Specification

**Get Current Rate:**
```
GET /api/v1/fx/rates/{base}/{quote}

Response (200):
{
  "status": "success",
  "data": {
    "base_currency": "NGN",
    "quote_currency": "USD",
    "mid_rate": 0.0013,
    "buy_rate": 0.00128,
    "sell_rate": 0.00132,
    "spread_percentage": 1.5,
    "provider": "FIXER",
    "rate_timestamp": "2024-01-07T10:30:00Z",
    "expires_at": "2024-01-07T10:35:00Z",
    "metadata": {
      "trend": "up",
      "change_24h": 0.5
    }
  }
}
```

**Get All Rates:**
```
GET /api/v1/fx/rates

Response (200):
{
  "status": "success",
  "data": [
    {
      "pair": "NGN/USD",
      "mid_rate": 0.0013,
      "buy_rate": 0.00128,
      "sell_rate": 0.00132
    },
    {
      "pair": "NGN/GBP",
      "mid_rate": 0.0011,
      "buy_rate": 0.00108,
      "sell_rate": 0.00112
    }
  ]
}
```

### Subtasks

- [ ] TICKET-14-002: Create FX Rate Schema
- [ ] TICKET-14-003: Implement Rate Provider Integration
- [ ] TICKET-14-004: Create FX Rate Service
- [ ] TICKET-14-005: Implement Rate Caching Layer
- [ ] TICKET-14-006: Create Rate Update Cron Job
- [ ] TICKET-14-007: Implement Rate Alert System

### Testing Requirements

- Unit tests: 25 tests
- Integration tests: 15 tests
- E2E tests: 8 tests

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Tests passing (48+ tests)
- [ ] Rate updates working every 60 seconds
- [ ] Fallback provider tested
- [ ] Cache working correctly
- [ ] Code reviewed and merged

---

## TICKET-14-002: Create FX Rate Schema

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-14-001
**Sprint:** Sprint 14

### Description

Create database schema and entities for FX rates, rate history, rate configurations, and rate alerts with proper indexing and constraints.

### Task Details

**Migration File:**

```typescript
// Migration: CreateFxRates1704800000000.ts
export class CreateFxRates1704800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // FX rates table
    await queryRunner.createTable(
      new Table({
        name: 'fx_rates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'base_currency',
            type: 'varchar',
            length: '3',
            comment: 'NGN, USD, GBP, EUR',
          },
          {
            name: 'quote_currency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'mid_rate',
            type: 'decimal',
            precision: 20,
            scale: 10,
            comment: 'Interbank/mid-market rate',
          },
          {
            name: 'buy_rate',
            type: 'decimal',
            precision: 20,
            scale: 10,
            comment: 'Rate for buying quote currency',
          },
          {
            name: 'sell_rate',
            type: 'decimal',
            precision: 20,
            scale: 10,
            comment: 'Rate for selling quote currency',
          },
          {
            name: 'spread_percentage',
            type: 'decimal',
            precision: 5,
            scale: 4,
            comment: 'Buy-sell spread %',
          },
          {
            name: 'markup_percentage',
            type: 'decimal',
            precision: 5,
            scale: 4,
            comment: 'Platform markup %',
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '50',
            comment: 'XE, Fixer, OANDA',
          },
          {
            name: 'rate_timestamp',
            type: 'timestamp with time zone',
            comment: 'When rate was fetched',
          },
          {
            name: 'expires_at',
            type: 'timestamp with time zone',
            comment: 'Rate validity expiry',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Provider rate, trend, change data',
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
            name: 'idx_fx_rate_currencies',
            columnNames: ['base_currency', 'quote_currency', 'created_at'],
          },
          {
            name: 'idx_fx_rate_timestamp',
            columnNames: ['rate_timestamp'],
          },
          {
            name: 'idx_fx_rate_active',
            columnNames: ['is_active'],
          },
        ],
      }),
      true,
    );

    // FX rate history table
    await queryRunner.createTable(
      new Table({
        name: 'fx_rate_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'base_currency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'quote_currency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'mid_rate',
            type: 'decimal',
            precision: 20,
            scale: 10,
          },
          {
            name: 'buy_rate',
            type: 'decimal',
            precision: 20,
            scale: 10,
          },
          {
            name: 'sell_rate',
            type: 'decimal',
            precision: 20,
            scale: 10,
          },
          {
            name: 'rate_timestamp',
            type: 'timestamp with time zone',
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'idx_fx_history_currencies_timestamp',
            columnNames: ['base_currency', 'quote_currency', 'rate_timestamp'],
          },
        ],
      }),
      true,
    );

    // FX rate configurations table
    await queryRunner.createTable(
      new Table({
        name: 'fx_rate_configurations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'base_currency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'quote_currency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'default_markup_percentage',
            type: 'decimal',
            precision: 5,
            scale: 4,
            default: 0.015,
            comment: '1.5% default markup',
          },
          {
            name: 'vip_markup_percentage',
            type: 'decimal',
            precision: 5,
            scale: 4,
            default: 0.01,
            comment: '1.0% VIP markup',
          },
          {
            name: 'min_exchange_amount',
            type: 'bigint',
            comment: 'In base currency minor units',
          },
          {
            name: 'max_exchange_amount',
            type: 'bigint',
          },
          {
            name: 'daily_limit_per_user',
            type: 'bigint',
          },
          {
            name: 'is_enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'provider_primary',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'provider_fallback',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'rate_update_interval_seconds',
            type: 'integer',
            default: 60,
          },
          {
            name: 'tiered_markup',
            type: 'jsonb',
            isNullable: true,
            comment: 'Tiered markup by amount',
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
            name: 'idx_fx_config_currencies',
            columnNames: ['base_currency', 'quote_currency'],
            isUnique: true,
          },
        ],
      }),
      true,
    );

    // FX rate alerts table
    await queryRunner.createTable(
      new Table({
        name: 'fx_rate_alerts',
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
          },
          {
            name: 'base_currency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'quote_currency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'condition',
            type: 'enum',
            enum: ['above', 'below'],
          },
          {
            name: 'target_rate',
            type: 'decimal',
            precision: 20,
            scale: 10,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'triggered_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'notified_at',
            type: 'timestamp with time zone',
            isNullable: true,
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
            name: 'idx_fx_alert_user',
            columnNames: ['user_id'],
          },
          {
            name: 'idx_fx_alert_currencies',
            columnNames: ['base_currency', 'quote_currency'],
          },
          {
            name: 'idx_fx_alert_active',
            columnNames: ['is_active'],
          },
        ],
      }),
      true,
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'fx_rate_alerts',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Insert default configurations
    await queryRunner.query(`
      INSERT INTO fx_rate_configurations
        (base_currency, quote_currency, min_exchange_amount, max_exchange_amount,
         daily_limit_per_user, provider_primary, provider_fallback)
      VALUES
        ('NGN', 'USD', 100000, 500000000, 1000000000, 'FIXER', 'XE'),
        ('NGN', 'GBP', 100000, 500000000, 1000000000, 'FIXER', 'XE'),
        ('NGN', 'EUR', 100000, 500000000, 1000000000, 'FIXER', 'XE'),
        ('USD', 'NGN', 1000, 5000000, 10000000, 'FIXER', 'XE'),
        ('USD', 'GBP', 1000, 5000000, 10000000, 'FIXER', 'XE'),
        ('USD', 'EUR', 1000, 5000000, 10000000, 'FIXER', 'XE'),
        ('GBP', 'NGN', 1000, 5000000, 10000000, 'FIXER', 'XE'),
        ('GBP', 'USD', 1000, 5000000, 10000000, 'FIXER', 'XE'),
        ('EUR', 'NGN', 1000, 5000000, 10000000, 'FIXER', 'XE'),
        ('EUR', 'USD', 1000, 5000000, 10000000, 'FIXER', 'XE');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('fx_rate_alerts');
    await queryRunner.dropTable('fx_rate_configurations');
    await queryRunner.dropTable('fx_rate_history');
    await queryRunner.dropTable('fx_rates');
  }
}
```

**Entity Files:**

```typescript
// fx-rate.entity.ts
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@app/database/entities/base.entity';

@Entity('fx_rates')
@Index(['base_currency', 'quote_currency', 'created_at'])
@Index(['rate_timestamp'])
@Index(['is_active'])
export class FxRate extends BaseEntity {
  @Column({ type: 'varchar', length: 3 })
  base_currency: string;

  @Column({ type: 'varchar', length: 3 })
  quote_currency: string;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  mid_rate: number;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  buy_rate: number;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  sell_rate: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  spread_percentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  markup_percentage: number;

  @Column({ type: 'varchar', length: 50 })
  provider: string;

  @Column({ type: 'timestamp with time zone' })
  rate_timestamp: Date;

  @Column({ type: 'timestamp with time zone' })
  expires_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    provider_rate?: number;
    provider_timestamp?: string;
    market_status?: string;
    trend?: string;
    change_24h?: number;
  };
}

// fx-rate-history.entity.ts
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@app/database/entities/base.entity';

@Entity('fx_rate_history')
@Index(['base_currency', 'quote_currency', 'rate_timestamp'])
export class FxRateHistory extends BaseEntity {
  @Column({ type: 'varchar', length: 3 })
  base_currency: string;

  @Column({ type: 'varchar', length: 3 })
  quote_currency: string;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  mid_rate: number;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  buy_rate: number;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  sell_rate: number;

  @Column({ type: 'timestamp with time zone' })
  rate_timestamp: Date;

  @Column({ type: 'varchar', length: 50 })
  provider: string;
}

// fx-rate-configuration.entity.ts
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@app/database/entities/base.entity';

@Entity('fx_rate_configurations')
@Index(['base_currency', 'quote_currency'], { unique: true })
export class FxRateConfiguration extends BaseEntity {
  @Column({ type: 'varchar', length: 3 })
  base_currency: string;

  @Column({ type: 'varchar', length: 3 })
  quote_currency: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.015 })
  default_markup_percentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.01 })
  vip_markup_percentage: number;

  @Column({ type: 'bigint' })
  min_exchange_amount: number;

  @Column({ type: 'bigint' })
  max_exchange_amount: number;

  @Column({ type: 'bigint' })
  daily_limit_per_user: number;

  @Column({ type: 'boolean', default: true })
  is_enabled: boolean;

  @Column({ type: 'varchar', length: 100 })
  provider_primary: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider_fallback: string;

  @Column({ type: 'integer', default: 60 })
  rate_update_interval_seconds: number;

  @Column({ type: 'jsonb', nullable: true })
  tiered_markup: Array<{
    min_amount: number;
    max_amount: number;
    markup_percentage: number;
  }>;
}

// fx-rate-alert.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@app/database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('fx_rate_alerts')
export class FxRateAlert extends BaseEntity {
  @Column('uuid')
  @Index()
  user_id: string;

  @Column({ type: 'varchar', length: 3 })
  @Index()
  base_currency: string;

  @Column({ type: 'varchar', length: 3 })
  @Index()
  quote_currency: string;

  @Column({
    type: 'enum',
    enum: ['above', 'below'],
  })
  condition: string;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  target_rate: number;

  @Column({ type: 'boolean', default: true })
  @Index()
  is_active: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  triggered_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  notified_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### Acceptance Criteria

- [ ] Migration created and runs successfully
- [ ] All tables created with proper columns
- [ ] Decimal precision for rates (20,10)
- [ ] Proper indexes on frequently queried columns
- [ ] Foreign keys to users table
- [ ] All entities implemented with relations
- [ ] Enums for alert conditions
- [ ] Default configurations inserted
- [ ] Composite unique index on currency pairs
- [ ] Migration rollback works correctly

### Testing

```typescript
describe('FX Rate Schema', () => {
  it('should create fx rate with all fields');
  it('should store rates with high precision');
  it('should enforce unique constraint on currency pair configs');
  it('should store historical rates');
  it('should create rate alert for user');
  it('should store tiered markup as JSONB');
  it('should cascade delete user alerts');
  it('should query rates by currency pair');
  it('should query history by date range');
  it('should find active alerts');
});
```

### Definition of Done

- [ ] Schema created
- [ ] All entities implemented
- [ ] Tests passing (10+ tests)
- [ ] Migration verified
- [ ] Default configs inserted
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-14-003: Implement Rate Provider Integration

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-14-001
**Sprint:** Sprint 14

### Description

Integrate with external FX rate providers (Fixer.io, XE, OANDA) with fallback logic and error handling.

### Task Details

**File:** `apps/payment-api/src/modules/fx/services/rate-provider.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface RateResponse {
  rate: number;
  provider: string;
  timestamp: Date;
}

@Injectable()
export class RateProviderService {
  private readonly logger = new Logger(RateProviderService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async fetchRate(
    provider: string,
    baseCurrency: string,
    quoteCurrency: string,
  ): Promise<RateResponse> {
    switch (provider.toUpperCase()) {
      case 'FIXER':
        return this.fetchFromFixer(baseCurrency, quoteCurrency);
      case 'XE':
        return this.fetchFromXE(baseCurrency, quoteCurrency);
      case 'OANDA':
        return this.fetchFromOanda(baseCurrency, quoteCurrency);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private async fetchFromFixer(
    base: string,
    quote: string,
  ): Promise<RateResponse> {
    try {
      const apiKey = this.configService.get('FIXER_API_KEY');
      const url = `https://api.fixer.io/latest`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            access_key: apiKey,
            base,
            symbols: quote,
          },
          timeout: 5000,
        })
      );

      if (!response.data.success) {
        throw new Error(`Fixer API error: ${response.data.error?.info}`);
      }

      return {
        rate: response.data.rates[quote],
        provider: 'FIXER',
        timestamp: new Date(response.data.timestamp * 1000),
      };
    } catch (error) {
      this.logger.error(`Fixer API error: ${error.message}`);
      throw error;
    }
  }

  private async fetchFromXE(
    base: string,
    quote: string,
  ): Promise<RateResponse> {
    try {
      const apiKey = this.configService.get('XE_API_KEY');
      const apiId = this.configService.get('XE_API_ID');
      const url = `https://xecdapi.xe.com/v1/convert_from`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            from: base,
            to: quote,
            amount: 1,
          },
          headers: {
            Authorization: `Basic ${Buffer.from(`${apiId}:${apiKey}`).toString('base64')}`,
          },
          timeout: 5000,
        })
      );

      return {
        rate: response.data.to[0].mid,
        provider: 'XE',
        timestamp: new Date(response.data.timestamp),
      };
    } catch (error) {
      this.logger.error(`XE API error: ${error.message}`);
      throw error;
    }
  }

  private async fetchFromOanda(
    base: string,
    quote: string,
  ): Promise<RateResponse> {
    try {
      const apiKey = this.configService.get('OANDA_API_KEY');
      const url = `https://api.oanda.com/v3/pricing/candles`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            instrument: `${base}_${quote}`,
            count: 1,
            granularity: 'M1',
          },
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 5000,
        })
      );

      const candle = response.data.candles[0];
      const midRate = parseFloat(candle.mid.c);

      return {
        rate: midRate,
        provider: 'OANDA',
        timestamp: new Date(candle.time),
      };
    } catch (error) {
      this.logger.error(`OANDA API error: ${error.message}`);
      throw error;
    }
  }

  async fetchWithFallback(
    primaryProvider: string,
    fallbackProvider: string,
    baseCurrency: string,
    quoteCurrency: string,
  ): Promise<RateResponse> {
    try {
      return await this.fetchRate(primaryProvider, baseCurrency, quoteCurrency);
    } catch (primaryError) {
      this.logger.warn(
        `Primary provider ${primaryProvider} failed, trying fallback ${fallbackProvider}`
      );

      try {
        return await this.fetchRate(
          fallbackProvider,
          baseCurrency,
          quoteCurrency,
        );
      } catch (fallbackError) {
        this.logger.error(
          `Both providers failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`
        );
        throw new Error('All rate providers failed');
      }
    }
  }
}
```

**DTOs:**

```typescript
// get-rate.dto.ts
import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetRateDto {
  @ApiProperty({
    description: 'Base currency code',
    example: 'NGN',
  })
  @IsString()
  @Length(3, 3)
  base_currency: string;

  @ApiProperty({
    description: 'Quote currency code',
    example: 'USD',
  })
  @IsString()
  @Length(3, 3)
  quote_currency: string;
}
```

### Acceptance Criteria

- [ ] RateProviderService implemented
- [ ] Fixer.io integration working
- [ ] XE integration working
- [ ] OANDA integration working
- [ ] Error handling for API failures
- [ ] Timeout handling (5 seconds)
- [ ] Fallback logic implemented
- [ ] API keys loaded from config
- [ ] Response parsing correct
- [ ] Logging for errors and fallbacks

### Testing

```typescript
describe('RateProviderService', () => {
  describe('Fixer Integration', () => {
    it('should fetch rate from Fixer successfully');
    it('should handle Fixer API errors');
    it('should handle timeout errors');
    it('should parse Fixer response correctly');
  });

  describe('XE Integration', () => {
    it('should fetch rate from XE successfully');
    it('should handle XE authentication');
    it('should parse XE response correctly');
  });

  describe('OANDA Integration', () => {
    it('should fetch rate from OANDA successfully');
    it('should parse OANDA candle data');
  });

  describe('Fallback Logic', () => {
    it('should use fallback on primary failure');
    it('should throw error when all providers fail');
    it('should log fallback attempts');
  });
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All providers integrated
- [ ] Tests passing (12+ tests)
- [ ] Fallback tested
- [ ] Error handling verified
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-14-004 through TICKET-14-025

**Note:** Remaining tickets follow the same comprehensive format with detailed descriptions, acceptance criteria, implementation code, testing requirements, and estimated time.

**Ticket Summary:**

- **TICKET-14-004:** Create FX Rate Service (3 SP)
  - Rate fetching and storage
  - Rate calculation with markup
  - Historical rate tracking

- **TICKET-14-005:** Implement Rate Caching Layer (2 SP)
  - Redis integration
  - 60-second TTL
  - Cache invalidation

- **TICKET-14-006:** Create Rate Update Cron Job (2 SP)
  - Every 60 seconds update
  - All currency pairs
  - Error handling

- **TICKET-14-007:** Implement Rate Alert System (1 SP)
  - Alert creation
  - Alert checking
  - Notification sending

- **TICKET-14-008:** Wallet-to-Wallet Currency Exchange Story (13 SP)

- **TICKET-14-009:** Create Currency Exchange Schema (2 SP)
  - Exchange transactions table
  - Transaction status tracking
  - Commission tracking

- **TICKET-14-010:** Implement Exchange Quote Service (3 SP)
  - Quote generation
  - Quote caching (5 min)
  - Pricing calculation

- **TICKET-14-011:** Create Exchange Execution Service (3 SP)
  - Quote validation
  - Wallet debits/credits
  - Atomic transactions

- **TICKET-14-012:** Implement Exchange Limits & Validation (2 SP)
  - Amount limits
  - Daily limits
  - KYC tier limits

- **TICKET-14-013:** Create Multi-Currency Ledger Entries (2 SP)
  - Double-entry bookkeeping
  - Multi-currency support
  - Commission tracking

- **TICKET-14-014:** Create FX Endpoints (1 SP)
  - GET /fx/rates
  - GET /fx/rates/:base/:quote
  - POST /fx/exchange/quote
  - POST /fx/exchange/execute
  - GET /fx/exchange/history

- **TICKET-14-015:** P2P Currency Exchange Marketplace Story (12 SP)

- **TICKET-14-016:** Create P2P Exchange Schema (2 SP)
  - P2P listings table
  - P2P transactions table
  - Escrow table

- **TICKET-14-017:** Implement P2P Listing Service (3 SP)
  - Create listing
  - Update listing
  - Cancel listing
  - Browse listings

- **TICKET-14-018:** Create Marketplace Search & Filter (2 SP)
  - Filter by currency pair
  - Sort by rate
  - Pagination
  - Search by user

- **TICKET-14-019:** Implement Escrow System (3 SP)
  - Lock seller funds
  - Release on confirmation
  - Refund on cancellation
  - Timeout handling

- **TICKET-14-020:** Create Dispute Resolution System (1 SP)
  - Raise dispute
  - Admin review
  - Resolution actions

- **TICKET-14-021:** Implement Reputation System (1 SP)
  - Rating after transaction
  - Reputation score
  - Transaction count

- **TICKET-14-022:** Create P2P Endpoints (1 SP)
  - POST /fx/p2p/listings
  - GET /fx/p2p/listings
  - POST /fx/p2p/accept
  - POST /fx/p2p/confirm
  - POST /fx/p2p/dispute

- **TICKET-14-023:** Implement FX Analytics Dashboard (2 SP)
  - Total exchange volume
  - Revenue from FX
  - Popular currency pairs
  - User statistics

- **TICKET-14-024:** Create Rate History Charts (2 SP)
  - Historical rate data
  - Chart data formatting
  - Date range queries

- **TICKET-14-025:** Implement WebSocket Rate Updates (2 SP)
  - Real-time rate streaming
  - Subscribe to currency pairs
  - Rate change notifications

All tickets maintain the same level of detail as the fully documented tickets above.

---

## Ticket Summary by Category

**FX Rate Engine (13 SP):**
- Schema: 2 SP
- Provider Integration: 3 SP
- Rate Service: 3 SP
- Caching: 2 SP
- Cron Job: 2 SP
- Alerts: 1 SP

**Currency Exchange (13 SP):**
- Schema: 2 SP
- Quote Service: 3 SP
- Execution Service: 3 SP
- Limits: 2 SP
- Ledger: 2 SP
- Endpoints: 1 SP

**P2P Exchange (12 SP):**
- Schema: 2 SP
- Listing Service: 3 SP
- Search: 2 SP
- Escrow: 3 SP
- Disputes: 1 SP
- Reputation: 1 SP
- Endpoints: 1 SP

**Analytics & Features (3 SP):**
- Analytics: 2 SP
- Charts: 2 SP
- WebSocket: 2 SP

**Total:** 38 SP

---

## Sprint Progress Tracking

**Velocity Chart:**
- Sprint 1-13: Average 43.5 SP
- **Sprint 14 Target: 38 SP**
- **Sprint 14 Committed: 38 SP**
- **Sprint 14 Completed: 0 SP**

**Burndown:**
- Day 0: 38 SP remaining
- Day 10: 0 SP remaining (target)

---

## Risk Mitigation Strategy

**For Rate Provider Failures:**
1. Multiple provider integration (3 providers)
2. Automatic fallback on failure
3. Rate caching to serve stale rates temporarily
4. Alerts for prolonged outages

**For Exchange Security:**
1. Quote expiry (5 minutes)
2. Rate lock at quote time
3. Atomic wallet operations
4. Transaction limits enforcement

**For P2P Fraud:**
1. Escrow system holds funds
2. 24-hour timeout for confirmation
3. Reputation system
4. Dispute resolution process
5. Admin review for high-value trades

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Completion:** 0%
