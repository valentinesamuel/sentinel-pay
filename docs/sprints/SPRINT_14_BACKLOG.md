# Sprint 14 Backlog - Currency Exchange & FX

**Sprint:** Sprint 14
**Duration:** 2 weeks (Week 29-30)
**Sprint Goal:** Build comprehensive foreign exchange system with real-time rates, currency conversion, multi-currency wallets, and P2P currency exchange
**Story Points Committed:** 38
**Team Capacity:** 38 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1-13 (45, 42, 38, 45, 48, 45, 42, 45, 45, 45, 45, 45, 35) = 43.5 SP, committed 38 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 14, we will have:
1. Multi-currency wallet support (NGN, USD, GBP, EUR)
2. Real-time FX rate engine with external provider integration
3. Instant currency conversion between wallets
4. Rate markup and commission tracking
5. Exchange limits and compliance controls
6. Historical rate tracking and analytics
7. Rate alerts and notifications
8. P2P currency exchange marketplace
9. Competitive rate comparison
10. Transaction fee optimization

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] FX rate updates working in real-time
- [ ] Currency conversion tests passing
- [ ] Rate markup calculation tests passing
- [ ] API documentation updated (Swagger)
- [ ] Multi-currency ledger working
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-9: Currency Exchange

## FEATURE-9.1: FX Rate Engine

### 📘 User Story: US-14.1.1 - Real-Time FX Rate Engine

**Story ID:** US-14.1.1
**Feature:** FEATURE-9.1 (FX Rate Engine)
**Epic:** EPIC-9 (Currency Exchange)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 14
**Status:** 🔄 Not Started

---

#### User Story

```
As a platform
I want to fetch and maintain real-time exchange rates from reliable sources
So that users can perform currency exchanges at competitive and accurate rates
```

---

#### Business Value

**Value Statement:**
A robust FX rate engine is the foundation for international money transfers, multi-currency wallets, and cross-border payments. Competitive rates drive user adoption and transaction volume, while accurate pricing protects platform revenue.

**Impact:**
- **Critical:** Foundation for all FX operations
- **Revenue:** 1-3% margin on FX transactions
- **Volume:** 30-40% of users need FX services
- **Trust:** Transparent rates build customer confidence
- **Compliance:** Accurate rate tracking for regulatory reporting

**Success Criteria:**
- Rate updates every 60 seconds during market hours
- < 2 second rate quote response time
- 99.9% rate provider uptime
- Spread within 0.5% of interbank rates
- Support 10+ currency pairs

---

#### Acceptance Criteria

**Rate Provider Integration:**
- [ ] **AC1:** Integrate with external FX rate provider (e.g., XE, Fixer.io, OANDA)
- [ ] **AC2:** Fetch rates for NGN/USD, NGN/GBP, NGN/EUR, USD/GBP, USD/EUR, GBP/EUR
- [ ] **AC3:** Real-time rate updates every 60 seconds
- [ ] **AC4:** Fallback to secondary provider on failure
- [ ] **AC5:** Cache rates with 60-second TTL
- [ ] **AC6:** Historical rate storage (1 year retention)

**Rate Calculation:**
- [ ] **AC7:** Calculate mid-market rate (buy + sell / 2)
- [ ] **AC8:** Apply configurable markup (0.5-3%)
- [ ] **AC9:** Different rates for different transaction sizes
- [ ] **AC10:** Different rates for verified vs unverified users
- [ ] **AC11:** VIP user preferential rates
- [ ] **AC12:** Display rate validity period (5 minutes)

**Rate Display:**
- [ ] **AC13:** Show buy and sell rates separately
- [ ] **AC14:** Display rate trend (up/down indicator)
- [ ] **AC15:** Show rate change percentage (24h)
- [ ] **AC16:** Rate comparison with competitors
- [ ] **AC17:** All-in cost transparency (rate + fees)

**Rate Management:**
- [ ] **AC18:** Admin can override rates manually
- [ ] **AC19:** Configure rate markup per currency pair
- [ ] **AC20:** Set minimum/maximum exchange amounts
- [ ] **AC21:** Disable currency pairs during maintenance
- [ ] **AC22:** Rate alert thresholds for significant changes

---

#### Technical Specifications

**FX Rate Schema:**

```typescript
@Entity('fx_rates')
export class FxRate extends BaseEntity {
  @Column({ type: 'varchar', length: 3 })
  base_currency: string; // NGN, USD, GBP, EUR

  @Column({ type: 'varchar', length: 3 })
  quote_currency: string; // NGN, USD, GBP, EUR

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  mid_rate: number; // Interbank/mid-market rate

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  buy_rate: number; // Rate for buying quote currency

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  sell_rate: number; // Rate for selling quote currency

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  spread_percentage: number; // Buy-sell spread %

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  markup_percentage: number; // Platform markup %

  @Column({ type: 'varchar', length: 50 })
  provider: string; // XE, Fixer, OANDA

  @Column({ type: 'timestamp with time zone' })
  rate_timestamp: Date; // When rate was fetched

  @Column({ type: 'timestamp with time zone' })
  expires_at: Date; // Rate validity expiry

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    provider_rate?: number;
    provider_timestamp?: string;
    market_status?: string; // open, closed, pre-market
    trend?: string; // up, down, stable
    change_24h?: number;
  };

  @Index(['base_currency', 'quote_currency', 'created_at'])
  @Index(['rate_timestamp'])
  @Index(['is_active'])
}

@Entity('fx_rate_history')
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

  @Index(['base_currency', 'quote_currency', 'rate_timestamp'])
}

@Entity('fx_rate_configurations')
export class FxRateConfiguration extends BaseEntity {
  @Column({ type: 'varchar', length: 3 })
  base_currency: string;

  @Column({ type: 'varchar', length: 3 })
  quote_currency: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.015 })
  default_markup_percentage: number; // 1.5%

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.01 })
  vip_markup_percentage: number; // 1.0% for VIP users

  @Column({ type: 'bigint' })
  min_exchange_amount: number; // In base currency minor units

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

  @Index(['base_currency', 'quote_currency'], { unique: true })
}

@Entity('fx_rate_alerts')
export class FxRateAlert extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 3 })
  base_currency: string;

  @Column({ type: 'varchar', length: 3 })
  quote_currency: string;

  @Column({
    type: 'enum',
    enum: ['above', 'below'],
  })
  condition: string;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  target_rate: number;

  @Column({ type: 'boolean', default: true })
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

**FX Rate Service:**

```typescript
@Injectable()
export class FxRateService {
  private readonly SUPPORTED_CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR'];
  private readonly RATE_CACHE_TTL = 60; // seconds

  constructor(
    @InjectRepository(FxRate)
    private fxRateRepository: Repository<FxRate>,
    @InjectRepository(FxRateHistory)
    private historyRepository: Repository<FxRateHistory>,
    @InjectRepository(FxRateConfiguration)
    private configRepository: Repository<FxRateConfiguration>,
    @InjectRepository(FxRateAlert)
    private alertRepository: Repository<FxRateAlert>,
    private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async updateRates(): Promise<void> {
    for (const baseCurrency of this.SUPPORTED_CURRENCIES) {
      for (const quoteCurrency of this.SUPPORTED_CURRENCIES) {
        if (baseCurrency === quoteCurrency) continue;

        try {
          await this.fetchAndStoreRate(baseCurrency, quoteCurrency);
        } catch (error) {
          console.error(
            `Failed to update rate ${baseCurrency}/${quoteCurrency}:`,
            error.message
          );
        }
      }
    }
  }

  private async fetchAndStoreRate(
    baseCurrency: string,
    quoteCurrency: string,
  ): Promise<FxRate> {
    // Get configuration
    const config = await this.getConfiguration(baseCurrency, quoteCurrency);

    if (!config.is_enabled) {
      return null;
    }

    // Fetch rate from provider
    let providerRate: number;
    let provider: string;

    try {
      providerRate = await this.fetchRateFromProvider(
        config.provider_primary,
        baseCurrency,
        quoteCurrency,
      );
      provider = config.provider_primary;
    } catch (error) {
      // Try fallback provider
      if (config.provider_fallback) {
        providerRate = await this.fetchRateFromProvider(
          config.provider_fallback,
          baseCurrency,
          quoteCurrency,
        );
        provider = config.provider_fallback;
      } else {
        throw error;
      }
    }

    // Calculate rates with markup
    const markup = config.default_markup_percentage;
    const midRate = providerRate;
    const buyRate = midRate * (1 + markup / 2);
    const sellRate = midRate * (1 - markup / 2);
    const spreadPercentage = markup;

    // Get previous rate for trend analysis
    const previousRate = await this.getCurrentRate(baseCurrency, quoteCurrency);
    const trend = previousRate
      ? midRate > previousRate.mid_rate
        ? 'up'
        : midRate < previousRate.mid_rate
        ? 'down'
        : 'stable'
      : 'stable';

    const change24h = previousRate
      ? ((midRate - previousRate.mid_rate) / previousRate.mid_rate) * 100
      : 0;

    // Create new rate
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.RATE_CACHE_TTL * 1000);

    const fxRate = this.fxRateRepository.create({
      base_currency: baseCurrency,
      quote_currency: quoteCurrency,
      mid_rate: midRate,
      buy_rate: buyRate,
      sell_rate: sellRate,
      spread_percentage: spreadPercentage,
      markup_percentage: markup,
      provider,
      rate_timestamp: now,
      expires_at: expiresAt,
      is_active: true,
      metadata: {
        provider_rate: providerRate,
        provider_timestamp: now.toISOString(),
        trend,
        change_24h: change24h,
      },
    });

    await this.fxRateRepository.save(fxRate);

    // Store in history
    await this.historyRepository.save({
      base_currency: baseCurrency,
      quote_currency: quoteCurrency,
      mid_rate: midRate,
      buy_rate: buyRate,
      sell_rate: sellRate,
      rate_timestamp: now,
      provider,
    });

    // Invalidate cache
    await this.invalidateCache(baseCurrency, quoteCurrency);

    // Check rate alerts
    await this.checkRateAlerts(baseCurrency, quoteCurrency, midRate);

    return fxRate;
  }

  private async fetchRateFromProvider(
    provider: string,
    baseCurrency: string,
    quoteCurrency: string,
  ): Promise<number> {
    switch (provider) {
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
  ): Promise<number> {
    const apiKey = process.env.FIXER_API_KEY;
    const url = `https://api.fixer.io/latest?access_key=${apiKey}&base=${base}&symbols=${quote}`;

    const response = await firstValueFrom(this.httpService.get(url));
    return response.data.rates[quote];
  }

  private async fetchFromXE(base: string, quote: string): Promise<number> {
    // XE API implementation
    const apiKey = process.env.XE_API_KEY;
    const url = `https://xecdapi.xe.com/v1/convert_from?from=${base}&to=${quote}&amount=1`;

    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`,
        },
      })
    );

    return response.data.to[0].mid;
  }

  private async fetchFromOanda(base: string, quote: string): Promise<number> {
    // OANDA API implementation
    const apiKey = process.env.OANDA_API_KEY;
    const url = `https://api.oanda.com/v3/pricing/candles?instrument=${base}_${quote}&count=1&granularity=M1`;

    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
    );

    return parseFloat(response.data.candles[0].mid.c);
  }

  async getCurrentRate(
    baseCurrency: string,
    quoteCurrency: string,
  ): Promise<FxRate> {
    // Check cache first
    const cacheKey = `fx_rate:${baseCurrency}:${quoteCurrency}`;
    const cached = await this.cacheManager.get<FxRate>(cacheKey);

    if (cached) {
      return cached;
    }

    // Get from database
    const rate = await this.fxRateRepository.findOne({
      where: {
        base_currency: baseCurrency,
        quote_currency: quoteCurrency,
        is_active: true,
      },
      order: { rate_timestamp: 'DESC' },
    });

    if (!rate) {
      throw new NotFoundException(
        `No rate found for ${baseCurrency}/${quoteCurrency}`
      );
    }

    // Check if rate is expired
    if (new Date() > rate.expires_at) {
      // Trigger rate update
      await this.fetchAndStoreRate(baseCurrency, quoteCurrency);
      return this.getCurrentRate(baseCurrency, quoteCurrency);
    }

    // Cache the rate
    await this.cacheManager.set(cacheKey, rate, this.RATE_CACHE_TTL);

    return rate;
  }

  async getQuote(
    baseCurrency: string,
    quoteCurrency: string,
    amount: number,
    userId?: string,
  ): Promise<{
    base_currency: string;
    quote_currency: string;
    base_amount: number;
    quote_amount: number;
    rate: number;
    markup_percentage: number;
    fee: number;
    total_cost: number;
    expires_at: Date;
  }> {
    const config = await this.getConfiguration(baseCurrency, quoteCurrency);

    // Validate amount
    if (amount < config.min_exchange_amount) {
      throw new BadRequestException(
        `Minimum exchange amount is ${config.min_exchange_amount}`
      );
    }

    if (amount > config.max_exchange_amount) {
      throw new BadRequestException(
        `Maximum exchange amount is ${config.max_exchange_amount}`
      );
    }

    // Get current rate
    const fxRate = await this.getCurrentRate(baseCurrency, quoteCurrency);

    // Determine markup based on user tier and amount
    let markup = config.default_markup_percentage;

    if (userId) {
      const user = await this.getUserTier(userId);
      if (user.tier === 'VIP') {
        markup = config.vip_markup_percentage;
      }
    }

    // Apply tiered markup if configured
    if (config.tiered_markup) {
      for (const tier of config.tiered_markup) {
        if (amount >= tier.min_amount && amount <= tier.max_amount) {
          markup = tier.markup_percentage;
          break;
        }
      }
    }

    // Calculate quote amount
    const rate = fxRate.mid_rate * (1 - markup);
    const quoteAmount = Math.floor(amount * rate);

    // Calculate fee (0.5% of quote amount, min NGN 100)
    const feePercentage = 0.005;
    const fee = Math.max(Math.floor(quoteAmount * feePercentage), 100_00);

    const totalCost = amount;
    const netQuoteAmount = quoteAmount - fee;

    return {
      base_currency: baseCurrency,
      quote_currency: quoteCurrency,
      base_amount: amount,
      quote_amount: netQuoteAmount,
      rate,
      markup_percentage: markup,
      fee,
      total_cost: totalCost,
      expires_at: fxRate.expires_at,
    };
  }

  async getRateHistory(
    baseCurrency: string,
    quoteCurrency: string,
    startDate: Date,
    endDate: Date,
    interval: 'hourly' | 'daily' = 'daily',
  ): Promise<FxRateHistory[]> {
    const query = this.historyRepository
      .createQueryBuilder('history')
      .where('history.base_currency = :baseCurrency', { baseCurrency })
      .andWhere('history.quote_currency = :quoteCurrency', { quoteCurrency })
      .andWhere('history.rate_timestamp >= :startDate', { startDate })
      .andWhere('history.rate_timestamp <= :endDate', { endDate });

    if (interval === 'hourly') {
      // Get one rate per hour
      query.andWhere(
        "EXTRACT(MINUTE FROM history.rate_timestamp) < 5"
      );
    } else {
      // Get one rate per day (at noon)
      query.andWhere(
        "EXTRACT(HOUR FROM history.rate_timestamp) BETWEEN 11 AND 13"
      );
    }

    return query
      .orderBy('history.rate_timestamp', 'ASC')
      .getMany();
  }

  private async getConfiguration(
    baseCurrency: string,
    quoteCurrency: string,
  ): Promise<FxRateConfiguration> {
    let config = await this.configRepository.findOne({
      where: { base_currency: baseCurrency, quote_currency: quoteCurrency },
    });

    if (!config) {
      // Create default configuration
      config = this.configRepository.create({
        base_currency: baseCurrency,
        quote_currency: quoteCurrency,
        default_markup_percentage: 0.015, // 1.5%
        vip_markup_percentage: 0.01, // 1%
        min_exchange_amount: 1000_00, // NGN 1,000 or $10
        max_exchange_amount: 5000000_00, // NGN 5,000,000 or $50,000
        daily_limit_per_user: 10000000_00,
        is_enabled: true,
        provider_primary: 'FIXER',
        provider_fallback: 'XE',
        rate_update_interval_seconds: 60,
      });

      await this.configRepository.save(config);
    }

    return config;
  }

  async createRateAlert(
    userId: string,
    baseCurrency: string,
    quoteCurrency: string,
    condition: 'above' | 'below',
    targetRate: number,
  ): Promise<FxRateAlert> {
    const alert = this.alertRepository.create({
      user_id: userId,
      base_currency: baseCurrency,
      quote_currency: quoteCurrency,
      condition,
      target_rate: targetRate,
      is_active: true,
    });

    return this.alertRepository.save(alert);
  }

  private async checkRateAlerts(
    baseCurrency: string,
    quoteCurrency: string,
    currentRate: number,
  ): Promise<void> {
    const alerts = await this.alertRepository.find({
      where: {
        base_currency: baseCurrency,
        quote_currency: quoteCurrency,
        is_active: true,
      },
      relations: ['user'],
    });

    for (const alert of alerts) {
      const triggered =
        (alert.condition === 'above' && currentRate >= alert.target_rate) ||
        (alert.condition === 'below' && currentRate <= alert.target_rate);

      if (triggered) {
        await this.notificationService.send({
          user_id: alert.user_id,
          type: 'fx_rate_alert',
          title: 'Rate Alert Triggered',
          message: `${baseCurrency}/${quoteCurrency} is now ${alert.condition} ${alert.target_rate}. Current rate: ${currentRate}`,
          channels: ['push', 'email'],
        });

        alert.triggered_at = new Date();
        alert.notified_at = new Date();
        alert.is_active = false;
        await this.alertRepository.save(alert);
      }
    }
  }

  private async invalidateCache(
    baseCurrency: string,
    quoteCurrency: string,
  ): Promise<void> {
    const cacheKey = `fx_rate:${baseCurrency}:${quoteCurrency}`;
    await this.cacheManager.del(cacheKey);
  }

  private async getUserTier(userId: string): Promise<{ tier: string }> {
    // Placeholder - implement based on user service
    return { tier: 'STANDARD' };
  }
}
```

---

## FEATURE-9.2: Currency Exchange

### 📘 User Story: US-14.2.1 - Wallet-to-Wallet Currency Exchange

**Story ID:** US-14.2.1
**Feature:** FEATURE-9.2 (Currency Exchange)
**Epic:** EPIC-9 (Currency Exchange)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 14
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to exchange money between my multi-currency wallets
So that I can convert funds to the currency I need for transactions
```

---

#### Business Value

**Value Statement:**
Currency exchange is a high-margin revenue stream with minimal operational overhead. Users need this for international payments, travel, and receiving cross-border remittances. Seamless exchange keeps funds within the platform.

**Impact:**
- **Revenue:** 1-3% margin per exchange
- **Retention:** Keeps funds within platform ecosystem
- **Volume:** Average $500-2,000 per exchange
- **Frequency:** 20-30% of users exchange monthly
- **Competitive:** Essential for multi-currency fintech

**Success Criteria:**
- < 5 second exchange completion
- 99% success rate
- Average exchange volume: $1,000
- 25% of users exchange monthly
- 1.5% average margin

---

#### Acceptance Criteria

**Exchange Flow:**
- [ ] **AC1:** Select source wallet (NGN, USD, GBP, EUR)
- [ ] **AC2:** Select destination wallet
- [ ] **AC3:** Enter amount in source or destination currency
- [ ] **AC4:** Display real-time quote with rate and fees
- [ ] **AC5:** Show total cost and amount to receive
- [ ] **AC6:** Quote valid for 5 minutes
- [ ] **AC7:** Confirm exchange with PIN/biometric
- [ ] **AC8:** Instant balance update in both wallets

**Rate Display:**
- [ ] **AC9:** Show mid-market rate
- [ ] **AC10:** Display platform markup percentage
- [ ] **AC11:** Show all-in rate (rate after markup and fees)
- [ ] **AC12:** Compare with competitor rates
- [ ] **AC13:** Show rate trend (improving/worsening)
- [ ] **AC14:** Display rate validity countdown

**Transaction Limits:**
- [ ] **AC15:** Enforce minimum exchange amount
- [ ] **AC16:** Enforce maximum exchange amount
- [ ] **AC17:** Daily exchange limit per user
- [ ] **AC18:** Monthly cumulative limit
- [ ] **AC19:** Enhanced limits for verified users
- [ ] **AC20:** KYC tier-based limits

**Transaction Processing:**
- [ ] **AC21:** Validate sufficient source wallet balance
- [ ] **AC22:** Lock source funds during exchange
- [ ] **AC23:** Create exchange transaction record
- [ ] **AC24:** Update both wallet balances atomically
- [ ] **AC25:** Create ledger entries (double-entry)
- [ ] **AC26:** Track commission earned
- [ ] **AC27:** Send confirmation notification
- [ ] **AC28:** Generate transaction receipt

**History & Reporting:**
- [ ] **AC29:** View exchange history
- [ ] **AC30:** Filter by currency pair
- [ ] **AC31:** Download transaction receipts
- [ ] **AC32:** Track total exchanged per currency
- [ ] **AC33:** View total fees paid

---

#### Technical Specifications

**Exchange Transaction Schema:**

```typescript
@Entity('currency_exchanges')
export class CurrencyExchange extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  exchange_reference: string;

  @Column('uuid')
  source_wallet_id: string;

  @Column('uuid')
  destination_wallet_id: string;

  @Column({ type: 'varchar', length: 3 })
  source_currency: string;

  @Column({ type: 'varchar', length: 3 })
  destination_currency: string;

  @Column({ type: 'bigint' })
  source_amount: number;

  @Column({ type: 'bigint' })
  destination_amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  exchange_rate: number; // Actual rate applied

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  mid_market_rate: number; // Mid-market rate at time of exchange

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  markup_percentage: number;

  @Column({ type: 'bigint' })
  fee: number; // Platform fee

  @Column({ type: 'bigint' })
  commission: number; // Platform commission (from markup)

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  quoted_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  quote_expires_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    user_tier?: string;
    rate_provider?: string;
    quote_id?: string;
    ip_address?: string;
    device_id?: string;
  };

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'source_wallet_id' })
  source_wallet: Wallet;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'destination_wallet_id' })
  destination_wallet: Wallet;

  @Index(['user_id', 'created_at'])
  @Index(['status'])
  @Index(['exchange_reference'])
}
```

**Currency Exchange Service:**

```typescript
@Injectable()
export class CurrencyExchangeService {
  constructor(
    @InjectRepository(CurrencyExchange)
    private exchangeRepository: Repository<CurrencyExchange>,
    private fxRateService: FxRateService,
    private walletService: WalletService,
    private ledgerService: LedgerService,
    private notificationService: NotificationService,
  ) {}

  async getQuote(
    userId: string,
    sourceCurrency: string,
    destinationCurrency: string,
    sourceAmount: number,
  ): Promise<{
    quote_id: string;
    source_currency: string;
    destination_currency: string;
    source_amount: number;
    destination_amount: number;
    exchange_rate: number;
    mid_market_rate: number;
    markup_percentage: number;
    fee: number;
    total_cost: number;
    expires_at: Date;
  }> {
    // Validate currencies
    if (sourceCurrency === destinationCurrency) {
      throw new BadRequestException('Source and destination currencies must be different');
    }

    // Get FX quote
    const fxQuote = await this.fxRateService.getQuote(
      sourceCurrency,
      destinationCurrency,
      sourceAmount,
      userId,
    );

    // Generate quote ID
    const quoteId = `QUOTE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Cache quote for 5 minutes
    await this.cacheQuote(quoteId, {
      user_id: userId,
      source_currency: sourceCurrency,
      destination_currency: destinationCurrency,
      source_amount: sourceAmount,
      destination_amount: fxQuote.quote_amount,
      rate: fxQuote.rate,
      mid_market_rate: fxQuote.rate / (1 - fxQuote.markup_percentage),
      markup_percentage: fxQuote.markup_percentage,
      fee: fxQuote.fee,
      expires_at: fxQuote.expires_at,
    });

    return {
      quote_id: quoteId,
      source_currency: sourceCurrency,
      destination_currency: destinationCurrency,
      source_amount: sourceAmount,
      destination_amount: fxQuote.quote_amount,
      exchange_rate: fxQuote.rate,
      mid_market_rate: fxQuote.rate / (1 - fxQuote.markup_percentage),
      markup_percentage: fxQuote.markup_percentage,
      fee: fxQuote.fee,
      total_cost: fxQuote.total_cost,
      expires_at: fxQuote.expires_at,
    };
  }

  async executeExchange(
    userId: string,
    quoteId: string,
  ): Promise<CurrencyExchange> {
    // Retrieve quote from cache
    const quote = await this.getCachedQuote(quoteId);

    if (!quote) {
      throw new BadRequestException('Quote not found or expired');
    }

    if (quote.user_id !== userId) {
      throw new UnauthorizedException('Quote belongs to different user');
    }

    if (new Date() > quote.expires_at) {
      throw new BadRequestException('Quote has expired. Please request a new quote');
    }

    // Get wallets
    const sourceWallet = await this.walletService.getWallet(
      userId,
      quote.source_currency,
    );
    const destinationWallet = await this.walletService.getWallet(
      userId,
      quote.destination_currency,
    );

    // Validate balance
    if (sourceWallet.available_balance < quote.source_amount) {
      throw new BadRequestException('Insufficient balance in source wallet');
    }

    // Check daily limits
    await this.validateExchangeLimits(userId, quote.source_currency, quote.source_amount);

    // Create exchange record
    const exchange = this.exchangeRepository.create({
      user_id: userId,
      exchange_reference: await this.generateReference(),
      source_wallet_id: sourceWallet.id,
      destination_wallet_id: destinationWallet.id,
      source_currency: quote.source_currency,
      destination_currency: quote.destination_currency,
      source_amount: quote.source_amount,
      destination_amount: quote.destination_amount,
      exchange_rate: quote.rate,
      mid_market_rate: quote.mid_market_rate,
      markup_percentage: quote.markup_percentage,
      fee: quote.fee,
      commission: Math.floor(quote.source_amount * quote.markup_percentage),
      status: 'pending',
      quoted_at: new Date(),
      quote_expires_at: quote.expires_at,
      metadata: {
        quote_id: quoteId,
      },
    });

    await this.exchangeRepository.save(exchange);

    try {
      // Execute exchange in transaction
      exchange.status = 'processing';
      await this.exchangeRepository.save(exchange);

      // Debit source wallet
      await this.walletService.debit({
        user_id: userId,
        wallet_id: sourceWallet.id,
        amount: quote.source_amount,
        currency: quote.source_currency,
        description: `Currency exchange to ${quote.destination_currency}`,
        reference: exchange.exchange_reference,
        metadata: {
          exchange_id: exchange.id,
          destination_currency: quote.destination_currency,
        },
      });

      // Credit destination wallet
      await this.walletService.credit({
        user_id: userId,
        wallet_id: destinationWallet.id,
        amount: quote.destination_amount,
        currency: quote.destination_currency,
        description: `Currency exchange from ${quote.source_currency}`,
        reference: exchange.exchange_reference,
        metadata: {
          exchange_id: exchange.id,
          source_currency: quote.source_currency,
        },
      });

      // Create ledger entries
      await this.createLedgerEntries(exchange);

      // Update status
      exchange.status = 'completed';
      exchange.completed_at = new Date();
      await this.exchangeRepository.save(exchange);

      // Send notification
      await this.notificationService.send({
        user_id: userId,
        type: 'currency_exchange_success',
        title: 'Exchange Completed',
        message: `Successfully exchanged ${this.formatAmount(quote.source_amount, quote.source_currency)} to ${this.formatAmount(quote.destination_amount, quote.destination_currency)}`,
        channels: ['push', 'email'],
        data: {
          exchange_reference: exchange.exchange_reference,
        },
      });

      // Invalidate quote
      await this.invalidateQuote(quoteId);
    } catch (error) {
      exchange.status = 'failed';
      exchange.failure_reason = error.message;
      await this.exchangeRepository.save(exchange);

      throw error;
    }

    return exchange;
  }

  private async createLedgerEntries(exchange: CurrencyExchange): Promise<void> {
    // Debit source currency from user
    await this.ledgerService.createEntry({
      account_id: exchange.user_id,
      account_type: 'wallet',
      entry_type: 'debit',
      amount: exchange.source_amount,
      currency: exchange.source_currency,
      description: `Exchange to ${exchange.destination_currency}`,
      reference: exchange.exchange_reference,
    });

    // Credit destination currency to user
    await this.ledgerService.createEntry({
      account_id: exchange.user_id,
      account_type: 'wallet',
      entry_type: 'credit',
      amount: exchange.destination_amount,
      currency: exchange.destination_currency,
      description: `Exchange from ${exchange.source_currency}`,
      reference: exchange.exchange_reference,
    });

    // Record commission
    await this.ledgerService.createEntry({
      account_id: 'SYSTEM_REVENUE',
      account_type: 'revenue',
      entry_type: 'credit',
      amount: exchange.commission,
      currency: exchange.source_currency,
      description: `FX commission - ${exchange.exchange_reference}`,
      reference: exchange.exchange_reference,
    });

    // Record fee
    if (exchange.fee > 0) {
      await this.ledgerService.createEntry({
        account_id: 'SYSTEM_REVENUE',
        account_type: 'revenue',
        entry_type: 'credit',
        amount: exchange.fee,
        currency: exchange.destination_currency,
        description: `FX fee - ${exchange.exchange_reference}`,
        reference: exchange.exchange_reference,
      });
    }
  }

  async getExchangeHistory(
    userId: string,
    filters?: {
      start_date?: Date;
      end_date?: Date;
      source_currency?: string;
      destination_currency?: string;
      status?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ exchanges: CurrencyExchange[]; total: number }> {
    const query = this.exchangeRepository
      .createQueryBuilder('exchange')
      .where('exchange.user_id = :userId', { userId });

    if (filters?.start_date) {
      query.andWhere('exchange.created_at >= :start_date', {
        start_date: filters.start_date,
      });
    }

    if (filters?.end_date) {
      query.andWhere('exchange.created_at <= :end_date', {
        end_date: filters.end_date,
      });
    }

    if (filters?.source_currency) {
      query.andWhere('exchange.source_currency = :source_currency', {
        source_currency: filters.source_currency,
      });
    }

    if (filters?.destination_currency) {
      query.andWhere('exchange.destination_currency = :destination_currency', {
        destination_currency: filters.destination_currency,
      });
    }

    if (filters?.status) {
      query.andWhere('exchange.status = :status', { status: filters.status });
    }

    const total = await query.getCount();

    const exchanges = await query
      .orderBy('exchange.created_at', 'DESC')
      .skip(filters?.offset || 0)
      .take(filters?.limit || 20)
      .getMany();

    return { exchanges, total };
  }

  private async validateExchangeLimits(
    userId: string,
    currency: string,
    amount: number,
  ): Promise<void> {
    // Get daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTotal = await this.exchangeRepository
      .createQueryBuilder('exchange')
      .select('SUM(exchange.source_amount)', 'total')
      .where('exchange.user_id = :userId', { userId })
      .andWhere('exchange.source_currency = :currency', { currency })
      .andWhere('exchange.status = :status', { status: 'completed' })
      .andWhere('exchange.created_at >= :today', { today })
      .getRawOne();

    const dailyLimit = 10000000_00; // NGN 10M or $100K
    const currentTotal = parseInt(dailyTotal?.total || '0');

    if (currentTotal + amount > dailyLimit) {
      throw new BadRequestException(
        `Daily exchange limit exceeded. Limit: ${this.formatAmount(dailyLimit, currency)}, Used: ${this.formatAmount(currentTotal, currency)}`
      );
    }
  }

  private async generateReference(): Promise<string> {
    return `EXCHANGE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  }

  private async cacheQuote(quoteId: string, quote: any): Promise<void> {
    // Implement caching (Redis)
  }

  private async getCachedQuote(quoteId: string): Promise<any> {
    // Implement cache retrieval
  }

  private async invalidateQuote(quoteId: string): Promise<void> {
    // Implement cache invalidation
  }
}
```

---

### 📘 User Story: US-14.3.1 - P2P Currency Exchange Marketplace

**Story ID:** US-14.3.1
**Feature:** FEATURE-9.3 (P2P Currency Exchange)
**Epic:** EPIC-9 (Currency Exchange)

**Story Points:** 12
**Priority:** P1 (High)
**Sprint:** Sprint 14
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to exchange currency with other users at negotiated rates
So that I can get better rates than the platform and help others access foreign currency
```

---

#### Acceptance Criteria

**Listing Creation:**
- [ ] **AC1:** Create buy/sell listings
- [ ] **AC2:** Set desired rate
- [ ] **AC3:** Set minimum/maximum amounts
- [ ] **AC4:** Set expiry time for listing
- [ ] **AC5:** Cancel listings anytime

**Marketplace:**
- [ ] **AC6:** Browse available listings
- [ ] **AC7:** Filter by currency pair
- [ ] **AC8:** Sort by best rate
- [ ] **AC9:** View seller reputation
- [ ] **AC10:** Accept listing

**Transaction:**
- [ ] **AC11:** Escrow funds from seller
- [ ] **AC12:** Confirm payment received
- [ ] **AC13:** Release funds to buyer
- [ ] **AC14:** Dispute resolution
- [ ] **AC15:** Platform fee (0.5%)

---

## Summary of Sprint 14 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-14.1.1 | Real-Time FX Rate Engine | 13 | P0 | To Do |
| US-14.2.1 | Wallet-to-Wallet Currency Exchange | 13 | P0 | To Do |
| US-14.3.1 | P2P Currency Exchange Marketplace | 12 | P1 | To Do |
| **Total** | | **38** | | |

---

## Sprint Velocity Tracking

**Planned Story Points:** 38 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

---

## Dependencies

**External:**
- FX rate provider APIs (Fixer.io, XE, OANDA)
- Redis for rate caching
- WebSocket for real-time rate updates

**Internal:**
- Sprint 4: Multi-currency wallet system
- Sprint 5: Ledger system
- Sprint 13: KYC verification for limits
- Sprint 14: Notification service

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-14.1 | Rate provider API downtime | Medium | High | Multiple providers, fallback logic |
| RISK-14.2 | Rate arbitrage abuse | Medium | Medium | Rate limits, monitoring alerts |
| RISK-14.3 | Currency exposure/loss | Low | Critical | Hedging strategy, limits |
| RISK-14.4 | P2P fraud | Medium | High | Escrow system, reputation |
| RISK-14.5 | Compliance violations | Low | Critical | Transaction limits, KYC checks |

---

## Notes & Decisions

**Technical Decisions:**
1. **Rate Providers:** Primary: Fixer.io, Fallback: XE
2. **Update Frequency:** Every 60 seconds during market hours
3. **Rate Caching:** Redis with 60-second TTL
4. **Markup:** 1.5% standard, 1.0% VIP, tiered by amount
5. **Quote Validity:** 5 minutes
6. **P2P Escrow:** Hold funds until confirmation or 24h timeout

**Open Questions:**
1. ❓ Crypto currency support? **Decision: Phase 2**
2. ❓ Automated hedging? **Decision: Manual for now**
3. ❓ White-label FX for merchants? **Decision: Sprint 20**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Build comprehensive FX infrastructure for multi-currency operations
