# Sprint 9 Backlog - Multi-Currency, Savings & Developer Portal

**Sprint:** Sprint 9
**Duration:** 2 weeks (Week 19-20)
**Sprint Goal:** Implement multi-currency support with FX trading, savings products, customer support system, referral program, and developer portal
**Story Points Committed:** 45
**Team Capacity:** 45 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1-8 (45, 42, 38, 45, 48, 45, 42, 45) = 43.75 SP, committed 45 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 9, we will have:
1. Multi-currency wallet support (USD, EUR, GBP, NGN)
2. Foreign exchange (FX) trading between currencies
3. Real-time exchange rate integration
4. Savings accounts with interest calculation
5. Fixed deposit products with lock periods
6. Live chat customer support system
7. Support ticket management
8. Referral program with rewards
9. Developer portal with API key management
10. API documentation and sandbox environment

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] FX rate provider tests passing
- [ ] Interest calculation tests passing
- [ ] API key generation tests passing
- [ ] API documentation updated (Swagger)
- [ ] Developer documentation published
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-14: Multi-Currency & Foreign Exchange

## FEATURE-14.1: Multi-Currency Wallets

### 📘 User Story: US-9.1.1 - Multi-Currency Support & FX Trading

**Story ID:** US-9.1.1
**Feature:** FEATURE-14.1 (Multi-Currency Wallets)
**Epic:** EPIC-14 (Multi-Currency & Foreign Exchange)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 9
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to hold multiple currencies in my wallet and exchange between them
So that I can make international payments and protect against currency fluctuations
```

---

#### Business Value

**Value Statement:**
Multi-currency support is critical for international expansion and serving users with cross-border payment needs. FX trading provides revenue through spreads and attracts sophisticated users.

**Impact:**
- **Critical:** Required for international expansion
- **Revenue:** FX spread revenue stream (0.5-2%)
- **Competitive:** Key differentiator in market
- **User Growth:** Attracts diaspora and traders

**Success Criteria:**
- Support 4 currencies: NGN, USD, EUR, GBP
- < 3 seconds FX transaction completion
- Real-time exchange rate updates (every 60 seconds)
- Transparent fee structure
- Competitive exchange rates (within 1% of mid-market)

---

#### Acceptance Criteria

**Multi-Currency Wallets:**
- [ ] **AC1:** User has separate balance for each supported currency
- [ ] **AC2:** Support NGN, USD, EUR, GBP currencies
- [ ] **AC3:** View all currency balances on dashboard
- [ ] **AC4:** Each currency has separate ledger entries
- [ ] **AC5:** Display total portfolio value in primary currency
- [ ] **AC6:** Currency balance updates in real-time
- [ ] **AC7:** Support for adding more currencies dynamically

**Foreign Exchange Trading:**
- [ ] **AC8:** User can exchange from one currency to another
- [ ] **AC9:** Display current exchange rate before confirmation
- [ ] **AC10:** Show FX fee/spread clearly
- [ ] **AC11:** Minimum exchange amount (equivalent to NGN 1,000)
- [ ] **AC12:** Maximum exchange amount based on KYC tier
- [ ] **AC13:** Exchange rate locked for 60 seconds during transaction
- [ ] **AC14:** FX transaction recorded in both currency ledgers
- [ ] **AC15:** Atomic double-entry for FX transactions

**Exchange Rate Management:**
- [ ] **AC16:** Integrate with FX rate provider (e.g., Open Exchange Rates API)
- [ ] **AC17:** Fetch rates every 60 seconds
- [ ] **AC18:** Cache rates in Redis for performance
- [ ] **AC19:** Apply spread markup (configurable per currency pair)
- [ ] **AC20:** Fallback to last known rate if provider fails
- [ ] **AC21:** Admin can set manual rate override
- [ ] **AC22:** Historical rate tracking for compliance

**Compliance & Limits:**
- [ ] **AC23:** Daily FX limit based on KYC tier
- [ ] **AC24:** Monthly FX volume tracking
- [ ] **AC25:** Suspicious FX pattern detection
- [ ] **AC26:** FX transaction history and reporting

**Non-Functional:**
- [ ] **AC27:** FX transaction completion < 3 seconds
- [ ] **AC28:** Rate fetch latency < 500ms
- [ ] **AC29:** Support concurrent FX transactions
- [ ] **AC30:** Proper error handling for rate unavailability

---

#### Technical Specifications

**Multi-Currency Wallet Schema:**

```typescript
@Entity('wallets')
export class Wallet extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string; // NGN, USD, EUR, GBP

  @Column({ type: 'bigint', default: 0 })
  balance: number; // In smallest unit (kobo, cents, pence)

  @Column({ type: 'bigint', default: 0 })
  available_balance: number; // Balance minus holds

  @Column({ type: 'bigint', default: 0 })
  held_balance: number; // Pending transactions

  @Column({ type: 'varchar', length: 20, unique: true })
  account_number: string; // Virtual account number per currency

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Index()
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // Unique constraint: one wallet per user per currency
  @Unique(['user_id', 'currency'])
}
```

**FX Transaction Schema:**

```typescript
@Entity('fx_transactions')
export class FxTransaction extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  reference: string;

  @Column({ type: 'varchar', length: 3 })
  from_currency: string;

  @Column({ type: 'varchar', length: 3 })
  to_currency: string;

  @Column({ type: 'bigint' })
  from_amount: number; // Amount debited

  @Column({ type: 'bigint' })
  to_amount: number; // Amount credited

  @Column({ type: 'decimal', precision: 12, scale: 6 })
  exchange_rate: number; // Rate used

  @Column({ type: 'decimal', precision: 12, scale: 6 })
  mid_market_rate: number; // Market rate at time

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  spread_percentage: number; // Our markup

  @Column({ type: 'bigint' })
  fee: number; // Additional fee if any

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'pending'
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    ip_address?: string;
    user_agent?: string;
    locked_until?: string; // Rate lock expiry
  };

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;
}
```

**Exchange Rate Service:**

```typescript
@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly baseUrl = 'https://openexchangerates.org/api';

  constructor(
    @InjectRedis() private redis: Redis,
    private configService: ConfigService,
  ) {}

  async getExchangeRate(
    from: string,
    to: string,
  ): Promise<{ rate: number; spread: number; final_rate: number }> {
    const cacheKey = `fx:rate:${from}:${to}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from provider
    const midMarketRate = await this.fetchRate(from, to);

    // Apply spread (configurable per pair)
    const spread = this.getSpreadForPair(from, to); // e.g., 0.015 = 1.5%
    const finalRate = midMarketRate * (1 + spread);

    const result = {
      rate: midMarketRate,
      spread,
      final_rate: finalRate,
    };

    // Cache for 60 seconds
    await this.redis.setex(cacheKey, 60, JSON.stringify(result));

    return result;
  }

  private async fetchRate(from: string, to: string): Promise<number> {
    try {
      const apiKey = this.configService.get('OPENEXCHANGERATES_API_KEY');

      const response = await axios.get(`${this.baseUrl}/latest.json`, {
        params: {
          app_id: apiKey,
          base: 'USD', // OER uses USD as base
        },
      });

      const rates = response.data.rates;

      // Convert from USD base to desired pair
      if (from === 'USD') {
        return rates[to];
      } else if (to === 'USD') {
        return 1 / rates[from];
      } else {
        // Cross rate calculation
        return rates[to] / rates[from];
      }
    } catch (error) {
      this.logger.error('Failed to fetch exchange rate', error);

      // Fallback to last known rate
      return this.getLastKnownRate(from, to);
    }
  }

  private getSpreadForPair(from: string, to: string): number {
    // Configurable spreads per currency pair
    const spreads = {
      'NGN:USD': 0.02,  // 2%
      'NGN:EUR': 0.02,
      'NGN:GBP': 0.02,
      'USD:EUR': 0.01,  // 1%
      'USD:GBP': 0.01,
      'EUR:GBP': 0.01,
      'default': 0.015, // 1.5%
    };

    const key = `${from}:${to}`;
    const reverseKey = `${to}:${from}`;

    return spreads[key] || spreads[reverseKey] || spreads['default'];
  }

  private async getLastKnownRate(from: string, to: string): Promise<number> {
    const fallbackKey = `fx:rate:fallback:${from}:${to}`;
    const cached = await this.redis.get(fallbackKey);

    if (cached) {
      return parseFloat(cached);
    }

    throw new Error('No exchange rate available');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateExchangeRates() {
    this.logger.log('Updating exchange rates');

    const pairs = [
      ['NGN', 'USD'],
      ['NGN', 'EUR'],
      ['NGN', 'GBP'],
      ['USD', 'EUR'],
      ['USD', 'GBP'],
      ['EUR', 'GBP'],
    ];

    for (const [from, to] of pairs) {
      try {
        await this.getExchangeRate(from, to);
      } catch (error) {
        this.logger.error(`Failed to update ${from}/${to}`, error);
      }
    }
  }
}
```

**FX Transaction Service:**

```typescript
@Injectable()
export class FxTransactionService {
  constructor(
    @InjectRepository(FxTransaction)
    private fxTransactionRepository: Repository<FxTransaction>,
    private walletService: WalletService,
    private exchangeRateService: ExchangeRateService,
    private ledgerService: LedgerService,
  ) {}

  async executeFxTrade(dto: ExecuteFxTradeDto): Promise<FxTransaction> {
    const { user_id, from_currency, to_currency, from_amount } = dto;

    // Get current exchange rate
    const rateInfo = await this.exchangeRateService.getExchangeRate(
      from_currency,
      to_currency,
    );

    // Calculate amounts
    const toAmount = Math.floor(from_amount * rateInfo.final_rate);

    // Create FX transaction record
    const fxTransaction = this.fxTransactionRepository.create({
      user_id,
      reference: `FX-${Date.now()}-${this.generateRandomString(6)}`,
      from_currency,
      to_currency,
      from_amount,
      to_amount,
      exchange_rate: rateInfo.final_rate,
      mid_market_rate: rateInfo.rate,
      spread_percentage: rateInfo.spread,
      fee: 0, // No additional fee for now
      status: 'pending',
      metadata: {
        locked_until: new Date(Date.now() + 60000).toISOString(), // 60 sec lock
      },
    });

    await this.fxTransactionRepository.save(fxTransaction);

    try {
      // Execute the exchange atomically
      await this.walletService.executeAtomicFxTransfer({
        user_id,
        from_currency,
        to_currency,
        from_amount,
        to_amount,
        reference: fxTransaction.reference,
      });

      // Update status
      fxTransaction.status = 'completed';
      fxTransaction.completed_at = new Date();
      await this.fxTransactionRepository.save(fxTransaction);

      // Record in ledger (both currencies)
      await this.recordFxInLedger(fxTransaction);

      return fxTransaction;
    } catch (error) {
      fxTransaction.status = 'failed';
      await this.fxTransactionRepository.save(fxTransaction);
      throw error;
    }
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
      description: `FX trade: ${fx.from_currency} to ${fx.to_currency}`,
    });

    // Credit entry in to_currency
    await this.ledgerService.createEntry({
      user_id: fx.user_id,
      currency: fx.to_currency,
      amount: fx.to_amount,
      type: 'credit',
      category: 'fx_trade',
      reference: fx.reference,
      description: `FX trade: ${fx.from_currency} to ${fx.to_currency}`,
    });
  }
}
```

---

# EPIC-15: Savings & Investment Products

## FEATURE-15.1: Savings Accounts

### 📘 User Story: US-9.2.1 - Savings Accounts & Fixed Deposits

**Story ID:** US-9.2.1
**Feature:** FEATURE-15.1 (Savings Accounts)
**Epic:** EPIC-15 (Savings & Investment Products)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 9
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to create savings accounts with interest and fixed deposits
So that I can grow my money and achieve savings goals
```

---

#### Business Value

**Value Statement:**
Savings products increase user engagement, wallet retention, and provide steady revenue. Fixed deposits lock liquidity, reducing platform risk and enabling lending products.

**Impact:**
- **Critical:** Major retention and engagement driver
- **Revenue:** Net interest margin (5-10% annual)
- **Liquidity:** Locks funds for predictable cash flow
- **Growth:** Attracts long-term users

**Success Criteria:**
- 30% of active users create savings accounts
- Average savings balance > NGN 50,000
- Interest calculation accuracy 100%
- < 5 minute account creation time
- Automated interest crediting

---

#### Acceptance Criteria

**Savings Account:**
- [ ] **AC1:** User can create flexible savings account
- [ ] **AC2:** Minimum initial deposit (NGN 1,000)
- [ ] **AC3:** Interest rate: 10% per annum (configurable)
- [ ] **AC4:** Interest calculated daily, credited monthly
- [ ] **AC5:** No lock-in period (withdraw anytime)
- [ ] **AC6:** No withdrawal fees
- [ ] **AC7:** Automatic top-up from main wallet (optional)
- [ ] **AC8:** Savings goal tracking (optional target amount)
- [ ] **AC9:** Multiple savings accounts per user

**Fixed Deposits:**
- [ ] **AC10:** Create fixed deposit with lock period (30, 90, 180, 365 days)
- [ ] **AC11:** Minimum deposit NGN 10,000
- [ ] **AC12:** Interest rates tiered by duration:
  - 30 days: 12% p.a.
  - 90 days: 14% p.a.
  - 180 days: 16% p.a.
  - 365 days: 18% p.a.
- [ ] **AC13:** Interest calculated upfront at creation
- [ ] **AC14:** Early withdrawal allowed with penalty (50% of interest)
- [ ] **AC15:** Auto-renewal option
- [ ] **AC16:** Maturity notification (email/SMS)
- [ ] **AC17:** Automatic maturity processing (principal + interest to wallet)

**Interest Calculation:**
- [ ] **AC18:** Daily interest accrual for savings
- [ ] **AC19:** Formula: (Balance × Rate × Days) / 365 / 100
- [ ] **AC20:** Interest compounding monthly for savings
- [ ] **AC21:** Simple interest for fixed deposits
- [ ] **AC22:** Interest recorded in ledger
- [ ] **AC23:** Interest withholding tax deduction (10% in Nigeria)

**Management & Reporting:**
- [ ] **AC24:** View all savings/fixed deposit accounts
- [ ] **AC25:** View interest earned to date
- [ ] **AC26:** View projected interest
- [ ] **AC27:** Transaction history per account
- [ ] **AC28:** Interest payment history
- [ ] **AC29:** Statement generation

**Non-Functional:**
- [ ] **AC30:** Support 100,000+ savings accounts
- [ ] **AC31:** Interest calculation batch job < 5 minutes
- [ ] **AC32:** Accurate to 2 decimal places

---

#### Technical Specifications

**Savings Account Schema:**

```typescript
@Entity('savings_accounts')
export class SavingsAccount extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  account_number: string;

  @Column('uuid')
  user_id: string;

  @Column({
    type: 'enum',
    enum: ['flexible', 'fixed_deposit'],
  })
  type: string;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'bigint', default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interest_rate: number; // Annual percentage

  @Column({ type: 'bigint', default: 0 })
  total_interest_earned: number;

  @Column({ type: 'integer', nullable: true })
  lock_period_days: number; // For fixed deposits

  @Column({ type: 'timestamp with time zone', nullable: true })
  maturity_date: Date;

  @Column({ type: 'boolean', default: false })
  auto_renew: boolean;

  @Column({ type: 'bigint', nullable: true })
  savings_goal: number; // Target amount

  @Column({
    type: 'enum',
    enum: ['active', 'matured', 'closed'],
    default: 'active'
  })
  status: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_interest_calculation: Date;
}
```

**Interest Calculation Service:**

```typescript
@Injectable()
export class InterestCalculationService {
  private readonly logger = new Logger(InterestCalculationService.name);

  constructor(
    @InjectRepository(SavingsAccount)
    private savingsAccountRepository: Repository<SavingsAccount>,
    private ledgerService: LedgerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculateDailyInterest() {
    this.logger.log('Starting daily interest calculation');

    const accounts = await this.savingsAccountRepository.find({
      where: {
        type: 'flexible',
        status: 'active',
      },
    });

    for (const account of accounts) {
      try {
        await this.accrueInterest(account);
      } catch (error) {
        this.logger.error(`Failed to accrue interest for ${account.account_number}`, error);
      }
    }

    this.logger.log(`Interest calculated for ${accounts.length} accounts`);
  }

  private async accrueInterest(account: SavingsAccount): Promise<void> {
    const dailyRate = account.interest_rate / 365 / 100;
    const interestAmount = Math.floor(account.balance * dailyRate);

    if (interestAmount > 0) {
      // Create pending interest entry (not yet credited)
      await this.ledgerService.createEntry({
        user_id: account.user_id,
        currency: account.currency,
        amount: interestAmount,
        type: 'credit',
        category: 'interest_accrual',
        reference: `INT-${account.account_number}-${new Date().toISOString().split('T')[0]}`,
        description: 'Daily interest accrual',
        metadata: {
          account_number: account.account_number,
          status: 'pending',
        },
      });
    }

    account.last_interest_calculation = new Date();
    await this.savingsAccountRepository.save(account);
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async creditMonthlyInterest() {
    this.logger.log('Starting monthly interest crediting');

    // Get all pending interest for the previous month
    const accounts = await this.savingsAccountRepository.find({
      where: {
        type: 'flexible',
        status: 'active',
      },
    });

    for (const account of accounts) {
      try {
        const pendingInterest = await this.getPendingInterest(account);

        if (pendingInterest > 0) {
          // Deduct withholding tax (10%)
          const tax = Math.floor(pendingInterest * 0.1);
          const netInterest = pendingInterest - tax;

          // Credit net interest to savings account
          account.balance += netInterest;
          account.total_interest_earned += netInterest;

          await this.savingsAccountRepository.save(account);

          // Record tax deduction
          await this.ledgerService.createEntry({
            user_id: account.user_id,
            currency: account.currency,
            amount: tax,
            type: 'debit',
            category: 'withholding_tax',
            reference: `WHT-${account.account_number}-${Date.now()}`,
            description: 'Withholding tax on interest',
          });

          this.logger.log(
            `Credited interest: ${netInterest} (gross: ${pendingInterest}, tax: ${tax}) to ${account.account_number}`
          );
        }
      } catch (error) {
        this.logger.error(`Failed to credit interest for ${account.account_number}`, error);
      }
    }
  }

  calculateFixedDepositInterest(
    principal: number,
    ratePerAnnum: number,
    days: number,
  ): number {
    // Simple interest: P × R × T / 100
    const interest = Math.floor((principal * ratePerAnnum * days) / 365 / 100);
    return interest;
  }
}
```

---

# EPIC-16: Customer Support & Help Desk

## FEATURE-16.1: Live Chat & Ticketing

### 📘 User Story: US-9.3.1 - Customer Support System

**Story ID:** US-9.3.1
**Feature:** FEATURE-16.1 (Live Chat & Ticketing)
**Epic:** EPIC-16 (Customer Support & Help Desk)

**Story Points:** 8
**Priority:** P1 (High)
**Sprint:** Sprint 9
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to chat with support agents and raise support tickets
So that I can get help with issues and questions
```

---

#### Business Value

**Value Statement:**
Effective customer support reduces churn, increases satisfaction, and enables rapid issue resolution. Self-service options reduce support costs while maintaining quality.

**Impact:**
- **High:** Critical for user satisfaction
- **Operations:** Reduces support costs by 40%
- **Retention:** Improves user retention by 25%
- **Insight:** Identifies product improvement areas

**Success Criteria:**
- < 5 minute average first response time
- < 24 hour average resolution time
- 90%+ customer satisfaction score
- < 2 hour chat wait time
- Self-service knowledge base deflects 30% of tickets

---

#### Acceptance Criteria

**Live Chat:**
- [ ] **AC1:** Users can start live chat from dashboard
- [ ] **AC2:** Real-time messaging (WebSocket)
- [ ] **AC3:** Support agent assignment (round-robin)
- [ ] **AC4:** Chat history saved
- [ ] **AC5:** File attachment support (screenshots)
- [ ] **AC6:** Typing indicators
- [ ] **AC7:** Agent status (online/offline/busy)
- [ ] **AC8:** Automated greeting message
- [ ] **AC9:** Queue position display when agents busy

**Support Tickets:**
- [ ] **AC10:** Create support ticket with category
- [ ] **AC11:** Categories: Account, Transaction, Payment, Technical, Other
- [ ] **AC12:** Priority levels: Low, Medium, High, Urgent
- [ ] **AC13:** Attach files to ticket
- [ ] **AC14:** View ticket status (open, in progress, resolved, closed)
- [ ] **AC15:** Add comments to ticket
- [ ] **AC16:** Email notifications on status change
- [ ] **AC17:** Auto-close after 7 days of inactivity

**Agent Features:**
- [ ] **AC18:** Agent dashboard showing assigned tickets
- [ ] **AC19:** Respond to tickets
- [ ] **AC20:** Internal notes (not visible to user)
- [ ] **AC21:** Escalate to senior support
- [ ] **AC22:** Canned responses/templates
- [ ] **AC23:** View user profile and transaction history

**Non-Functional:**
- [ ] **AC24:** Support 1000+ concurrent chat sessions
- [ ] **AC25:** Message delivery < 1 second
- [ ] **AC26:** Chat history search

---

#### Technical Specifications

**Support Ticket Schema:**

```typescript
@Entity('support_tickets')
export class SupportTicket extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  ticket_number: string; // TKT-20240101-0001

  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ['account', 'transaction', 'payment', 'technical', 'other'],
  })
  category: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  })
  priority: string;

  @Column({
    type: 'enum',
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  })
  status: string;

  @Column('uuid', { nullable: true })
  assigned_to: string; // Support agent ID

  @Column({ type: 'jsonb', default: [] })
  attachments: string[]; // S3 URLs

  @Column({ type: 'timestamp with time zone', nullable: true })
  first_response_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  resolved_at: Date;

  @OneToMany(() => TicketComment, comment => comment.ticket)
  comments: TicketComment[];
}

@Entity('ticket_comments')
export class TicketComment extends BaseEntity {
  @Column('uuid')
  ticket_id: string;

  @Column('uuid')
  author_id: string;

  @Column({
    type: 'enum',
    enum: ['user', 'agent'],
  })
  author_type: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  is_internal: boolean; // Internal notes

  @ManyToOne(() => SupportTicket, ticket => ticket.comments)
  @JoinColumn({ name: 'ticket_id' })
  ticket: SupportTicket;
}
```

**Live Chat using Socket.IO:**

```typescript
@WebSocketGateway({
  namespace: 'support',
  cors: { origin: '*' },
})
export class SupportChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const user = await this.jwtService.verify(token);

      client.data.user = user;
      client.join(`user:${user.id}`);

      // Check for existing chat or create new
      const chat = await this.chatService.getOrCreateChat(user.id);
      client.join(`chat:${chat.id}`);

      this.server.to(`chat:${chat.id}`).emit('chat:connected', {
        chat_id: chat.id,
        agent: chat.agent,
      });
    } catch (error) {
      client.disconnect();
    }
  }

  @SubscribeMessage('chat:message')
  async handleMessage(client: Socket, payload: { message: string }) {
    const user = client.data.user;
    const chat = await this.chatService.getUserActiveChat(user.id);

    const message = await this.chatService.createMessage({
      chat_id: chat.id,
      author_id: user.id,
      author_type: 'user',
      message: payload.message,
    });

    this.server.to(`chat:${chat.id}`).emit('chat:message', message);

    // Notify agent
    if (chat.agent_id) {
      this.server.to(`agent:${chat.agent_id}`).emit('chat:new_message', {
        chat_id: chat.id,
        user,
        message,
      });
    }
  }

  @SubscribeMessage('chat:typing')
  async handleTyping(client: Socket, payload: { typing: boolean }) {
    const user = client.data.user;
    const chat = await this.chatService.getUserActiveChat(user.id);

    this.server.to(`chat:${chat.id}`).emit('chat:typing', {
      user_id: user.id,
      typing: payload.typing,
    });
  }
}
```

---

## Summary of Sprint 9 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-9.1.1 | Multi-Currency Support & FX Trading | 13 | P0 | To Do |
| US-9.2.1 | Savings Accounts & Fixed Deposits | 13 | P0 | To Do |
| US-9.3.1 | Customer Support System | 8 | P1 | To Do |
| US-9.4.1 | Referral & Rewards Program | 5 | P1 | To Do |
| US-9.5.1 | Developer Portal & API Keys | 6 | P2 | To Do |
| **Total** | | **45** | | |

---

## Sprint Velocity Tracking

**Planned Story Points:** 45 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

---

## Dependencies

**External:**
- Open Exchange Rates API (or similar FX provider)
- Socket.IO for real-time chat
- AWS S3 for file attachments
- Redis for rate caching

**Internal:**
- Sprint 1: Authentication, authorization
- Sprint 5: Transaction system, wallet operations
- Sprint 7: Notification system
- Sprint 8: Admin panel for support agents

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-9.1 | FX rate provider downtime | Medium | High | Fallback rates, multiple providers |
| RISK-9.2 | Interest calculation errors | Low | Critical | Comprehensive testing, audit trail |
| RISK-9.3 | Chat system scalability | Medium | Medium | Load testing, horizontal scaling |
| RISK-9.4 | Multi-currency ledger complexity | Medium | High | Thorough testing, code review |

---

## Notes & Decisions

**Technical Decisions:**
1. **FX Provider:** Open Exchange Rates API (60-second refresh)
2. **Interest Calculation:** Daily accrual, monthly crediting
3. **Chat System:** Socket.IO with Redis adapter for scaling
4. **Rate Caching:** Redis with 60-second TTL
5. **Multi-Currency:** Separate wallet per currency

**Open Questions:**
1. ❓ Support for cryptocurrency? **Decision: Phase 2**
2. ❓ Automated FX trading/limit orders? **Decision: Not in MVP**
3. ❓ Chatbot for common queries? **Decision: Future sprint**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Enable international expansion through multi-currency, retain users through savings products, and improve support efficiency
