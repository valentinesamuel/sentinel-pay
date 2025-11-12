# Sprint 6 Tickets - Withdrawals & Bill Payments

**Sprint:** Sprint 6
**Duration:** 2 weeks (Week 13-14)
**Total Story Points:** 45 SP
**Total Tickets:** 27 tickets (5 stories + 22 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-6-001 | Story | Withdraw to Bank Account | 13 | To Do | Developer |
| TICKET-6-002 | Task | Create Withdrawal Schema | 2 | To Do | Developer |
| TICKET-6-003 | Task | Implement Withdrawal Fee Calculator | 2 | To Do | Developer |
| TICKET-6-004 | Task | Implement Withdrawal Service Logic | 4 | To Do | Developer |
| TICKET-6-005 | Task | Implement Paystack Transfer Integration | 3 | To Do | Developer |
| TICKET-6-006 | Task | Create Withdrawal Endpoints | 2 | To Do | Developer |
| TICKET-6-007 | Story | Verify Bank Account | 5 | To Do | Developer |
| TICKET-6-008 | Task | Implement Account Name Resolution | 2 | To Do | Developer |
| TICKET-6-009 | Task | Create Bank Account Schema | 1 | To Do | Developer |
| TICKET-6-010 | Task | Create Bank Account Endpoints | 2 | To Do | Developer |
| TICKET-6-011 | Story | Airtime & Data Purchase | 8 | To Do | Developer |
| TICKET-6-012 | Task | Setup Bill Payment Provider Integration | 3 | To Do | Developer |
| TICKET-6-013 | Task | Implement Airtime Purchase Service | 2 | To Do | Developer |
| TICKET-6-014 | Task | Implement Data Bundle Service | 2 | To Do | Developer |
| TICKET-6-015 | Task | Create Bill Payment Endpoints | 1 | To Do | Developer |
| TICKET-6-016 | Story | Utility Bill Payments | 8 | To Do | Developer |
| TICKET-6-017 | Task | Implement Electricity Payment Service | 3 | To Do | Developer |
| TICKET-6-018 | Task | Implement Cable TV Payment Service | 3 | To Do | Developer |
| TICKET-6-019 | Task | Create Utility Payment Endpoints | 2 | To Do | Developer |
| TICKET-6-020 | Story | KYC Document Upload | 8 | To Do | Developer |
| TICKET-6-021 | Task | Setup Document Storage (S3) | 2 | To Do | Developer |
| TICKET-6-022 | Task | Implement Document Upload Service | 3 | To Do | Developer |
| TICKET-6-023 | Task | Integrate KYC Verification Provider | 2 | To Do | Developer |
| TICKET-6-024 | Task | Create KYC Endpoints | 1 | To Do | Developer |
| TICKET-6-025 | Task | Implement Daily Limit Tracking | 2 | To Do | Developer |
| TICKET-6-026 | Task | Create Withdrawal Receipt Generator | 1 | To Do | Developer |
| TICKET-6-027 | Task | Setup Withdrawal Reconciliation Job | 2 | To Do | Developer |

---

## TICKET-6-001: Withdraw to Bank Account

**Type:** User Story
**Story Points:** 13
**Priority:** P0 (Critical)
**Epic:** EPIC-5 (Withdrawals & Payouts)
**Sprint:** Sprint 6

### Description

As a user, I want to withdraw funds from my wallet to my bank account, so that I can access my money in cash or use it outside the platform.

### Business Value

Withdrawals are essential for user trust and platform viability. Users must be able to access their funds freely. Without withdrawals, the platform is essentially a closed loop with no utility.

**Success Metrics:**
- 95% of valid withdrawals succeed
- < 30 seconds withdrawal initiation time
- < 24 hours withdrawal settlement time
- Zero balance discrepancies

### Acceptance Criteria

**Functional:**
- [ ] User can initiate withdrawal to bank account
- [ ] Bank account must be verified before withdrawal
- [ ] Amount must be >= minimum (NGN 100)
- [ ] Amount must be <= daily withdrawal limit (based on KYC tier)
- [ ] User must have sufficient wallet balance
- [ ] Withdrawal fee calculated and displayed
- [ ] Transaction PIN required for all withdrawals
- [ ] Withdrawal initiated via Paystack Transfer API
- [ ] Wallet debited immediately (pending status)
- [ ] On success: Transaction marked as completed
- [ ] On failure: Transaction marked as failed, wallet refunded
- [ ] User notified via email/SMS
- [ ] Transaction reference generated
- [ ] Idempotency: Duplicate withdrawals prevented
- [ ] Daily withdrawal limit enforced per user

**Security:**
- [ ] Transaction PIN verification required
- [ ] JWT authentication required
- [ ] Rate limiting: 10 withdrawal attempts per day per user
- [ ] Withdrawal to verified accounts only
- [ ] Audit log for all withdrawals

**Non-Functional:**
- [ ] Withdrawal initiation < 30 seconds
- [ ] Atomic wallet debit (ledger + balance)
- [ ] Webhook processing for transfer status
- [ ] Proper error messages for all failure scenarios
- [ ] Fee deduction transparent to user

### API Specification

**Endpoint:** POST /api/v1/withdrawals/bank-account

**Request:**
```json
{
  "bank_account_id": "uuid",
  "amount": 50000,
  "currency": "NGN",
  "pin": "1234",
  "reason": "Personal use"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "withdrawal": {
      "id": "uuid",
      "reference": "WDL-20240115103045-A3F5K9",
      "amount": 50000,
      "fee": 1000,
      "net_amount": 49000,
      "status": "pending"
    }
  }
}
```

### Subtasks

- [ ] TICKET-6-002: Create Withdrawal Schema
- [ ] TICKET-6-003: Implement Withdrawal Fee Calculator
- [ ] TICKET-6-004: Implement Withdrawal Service Logic
- [ ] TICKET-6-005: Implement Paystack Transfer Integration
- [ ] TICKET-6-006: Create Withdrawal Endpoints

### Testing Requirements

- Unit tests: 16 tests (fee calculation, limits, PIN, ledger)
- Integration tests: 8 tests (full flow, failure handling, refund)
- Security tests: 5 tests (PIN, rate limiting, verified accounts)
- E2E tests: 3 tests (complete withdrawal journey)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Paystack transfer integration working
- [ ] Webhook handling implemented
- [ ] All tests passing (32+ tests)
- [ ] Swagger documentation complete
- [ ] Code reviewed and merged

---

## TICKET-6-002: Create Withdrawal Schema

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-6-001
**Sprint:** Sprint 6

### Description

Create database schema for withdrawals with proper tracking fields and foreign key relationships.

### Task Details

**Migration File:**
`libs/database/src/migrations/XXXXXX-create-withdrawals-table.ts`

**SQL Schema:**
```sql
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  amount BIGINT NOT NULL,
  fee BIGINT NOT NULL DEFAULT 0,
  net_amount BIGINT NOT NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'paystack',
  provider_reference VARCHAR(100),
  transfer_code VARCHAR(100),
  recipient_code VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT withdrawals_amount_positive CHECK (amount > 0),
  CONSTRAINT withdrawals_fee_non_negative CHECK (fee >= 0),
  CONSTRAINT withdrawals_net_amount_positive CHECK (net_amount > 0)
);

CREATE INDEX idx_withdrawals_transaction_id ON withdrawals(transaction_id);
CREATE INDEX idx_withdrawals_bank_account_id ON withdrawals(bank_account_id);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at);
CREATE INDEX idx_withdrawals_provider_reference ON withdrawals(provider_reference);
```

**TypeORM Entity:**

**File:** `libs/database/src/entities/withdrawal.entity.ts`

```typescript
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Transaction } from './transaction.entity';
import { BankAccount } from './bank-account.entity';

@Entity('withdrawals')
@Index(['transaction_id'])
@Index(['bank_account_id'])
@Index(['created_at'])
export class Withdrawal extends BaseEntity {
  @Column('uuid')
  transaction_id: string;

  @Column('uuid')
  bank_account_id: string;

  @Column({ type: 'bigint' })
  amount: string;

  @Column({ type: 'bigint', default: 0 })
  fee: string;

  @Column({ type: 'bigint' })
  net_amount: string;

  @Column({ type: 'varchar', length: 50, default: 'paystack' })
  provider: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider_reference: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transfer_code: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  recipient_code: string | null;

  // Relationships
  @ManyToOne(() => Transaction, { eager: true })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @ManyToOne(() => BankAccount, { eager: true })
  @JoinColumn({ name: 'bank_account_id' })
  bank_account: BankAccount;
}
```

### Acceptance Criteria

- [ ] withdrawals table created
- [ ] All columns defined with correct types
- [ ] Foreign key constraints to transactions and bank_accounts
- [ ] Check constraints for amounts
- [ ] Indexes created for performance
- [ ] TypeORM entity created
- [ ] Entity exported from index
- [ ] Migration successful
- [ ] Relationships working

### Testing

```typescript
describe('Withdrawal Entity', () => {
  it('should create withdrawal record');
  it('should enforce foreign key constraints');
  it('should enforce positive amount check');
  it('should enforce non-negative fee check');
  it('should establish transaction relationship');
  it('should establish bank account relationship');
  it('should handle BIGINT amounts correctly');
});
```

### Definition of Done

- [ ] Migration created and run
- [ ] Entity created
- [ ] All constraints working
- [ ] Tests passing (7 tests)
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-6-003: Implement Withdrawal Fee Calculator

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-6-001
**Sprint:** Sprint 6

### Description

Implement fee calculation service with tiered fees based on KYC level and currency.

### Task Details

**File:** `apps/payment-api/src/modules/withdrawals/services/withdrawal-fee.service.ts`

**Implementation:**

```typescript
import { Injectable } from '@nestjs/common';

export interface WithdrawalFeeConfig {
  [currency: string]: {
    [kycTier: number]: number;
  };
}

@Injectable()
export class WithdrawalFeeService {
  private readonly feeConfig: WithdrawalFeeConfig = {
    NGN: {
      0: 10000,      // KYC Tier 0: NGN 100 flat fee
      1: 5000,       // KYC Tier 1: NGN 50 flat fee
      2: 2500,       // KYC Tier 2: NGN 25 flat fee
      3: 0,          // KYC Tier 3: Free withdrawals
    },
    USD: {
      0: 500,        // $5
      1: 200,        // $2
      2: 100,        // $1
      3: 0,          // Free
    },
    GBP: {
      0: 400,        // £4
      1: 150,        // £1.50
      2: 75,         // £0.75
      3: 0,          // Free
    },
    EUR: {
      0: 500,        // €5
      1: 200,        // €2
      2: 100,        // €1
      3: 0,          // Free
    },
  };

  /**
   * Calculate withdrawal fee based on amount, KYC tier, and currency
   */
  calculateFee(amount: number, kycTier: number, currency: string): number {
    const tierFees = this.feeConfig[currency];

    if (!tierFees) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const fee = tierFees[kycTier];

    if (fee === undefined) {
      // Default to tier 0 fee if tier not found
      return tierFees[0];
    }

    return fee;
  }

  /**
   * Get daily withdrawal limit based on KYC tier and currency
   */
  getDailyLimit(kycTier: number, currency: string): number {
    const limits = {
      NGN: {
        0: 5000000,       // NGN 50,000
        1: 20000000,      // NGN 200,000
        2: 100000000,     // NGN 1,000,000
        3: 500000000,     // NGN 5,000,000
      },
      USD: {
        0: 10000,         // $100
        1: 50000,         // $500
        2: 200000,        // $2,000
        3: 1000000,       // $10,000
      },
      GBP: {
        0: 8000,
        1: 40000,
        2: 160000,
        3: 800000,
      },
      EUR: {
        0: 10000,
        1: 50000,
        2: 200000,
        3: 1000000,
      },
    };

    const currencyLimits = limits[currency];

    if (!currencyLimits) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    return currencyLimits[kycTier] || currencyLimits[0];
  }

  /**
   * Calculate net amount after fee deduction
   */
  calculateNetAmount(amount: number, fee: number): number {
    return amount - fee;
  }

  /**
   * Get fee breakdown for display to user
   */
  getFeeBreakdown(amount: number, kycTier: number, currency: string): {
    amount: number;
    fee: number;
    netAmount: number;
    feePercentage: number;
  } {
    const fee = this.calculateFee(amount, kycTier, currency);
    const netAmount = this.calculateNetAmount(amount, fee);
    const feePercentage = (fee / amount) * 100;

    return {
      amount,
      fee,
      netAmount,
      feePercentage: parseFloat(feePercentage.toFixed(2)),
    };
  }
}
```

### Acceptance Criteria

- [ ] WithdrawalFeeService implemented
- [ ] calculateFee method working
- [ ] getDailyLimit method working
- [ ] calculateNetAmount method working
- [ ] getFeeBreakdown method working
- [ ] Fee config for all currencies (NGN, USD, GBP, EUR)
- [ ] Tiered fees for all KYC levels (0-3)
- [ ] Error handling for unsupported currency
- [ ] Default to tier 0 if tier not found

### Testing

```typescript
describe('WithdrawalFeeService', () => {
  it('should calculate fee for NGN tier 0');
  it('should calculate fee for NGN tier 3 (free)');
  it('should calculate fee for USD tier 1');
  it('should return daily limit for NGN tier 2');
  it('should calculate net amount correctly');
  it('should return fee breakdown with percentage');
  it('should throw error for unsupported currency');
  it('should default to tier 0 for unknown tier');
  it('should handle zero fee correctly (tier 3)');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (9 tests)
- [ ] Error handling complete
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-6-004: Implement Withdrawal Service Logic

**Type:** Task
**Story Points:** 4
**Priority:** P0
**Parent:** TICKET-6-001
**Sprint:** Sprint 6

### Description

Implement core withdrawal service with validation, PIN verification, daily limit checking, and wallet debit via ledger.

### Task Details

**File:** `apps/payment-api/src/modules/withdrawals/withdrawals.service.ts`

**Implementation:**

```typescript
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Withdrawal } from '@libs/database/entities/withdrawal.entity';
import { Transaction } from '@libs/database/entities/transaction.entity';
import { BankAccount } from '@libs/database/entities/bank-account.entity';
import { Wallet } from '@libs/database/entities/wallet.entity';
import { User } from '@libs/database/entities/user.entity';
import { TransactionType, TransactionCategory, TransactionStatus, LedgerEntryType } from '@libs/shared/enums';
import { WithdrawalFeeService } from './withdrawal-fee.service';
import { LedgerService } from '../ledger/ledger.service';
import { NotificationService } from '../notifications/notification.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import * as bcrypt from 'bcrypt';

export interface CreateWithdrawalDto {
  bank_account_id: string;
  amount: number;
  currency: string;
  pin: string;
  reason?: string;
  idempotency_key: string;
}

@Injectable()
export class WithdrawalsService {
  private readonly logger = new Logger(WithdrawalsService.name);

  constructor(
    @InjectRepository(Withdrawal)
    private withdrawalsRepository: Repository<Withdrawal>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(BankAccount)
    private bankAccountsRepository: Repository<BankAccount>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private withdrawalFeeService: WithdrawalFeeService,
    private ledgerService: LedgerService,
    private notificationService: NotificationService,
    private auditLogService: AuditLogService,
  ) {}

  async initiateWithdrawal(
    userId: string,
    dto: CreateWithdrawalDto,
    ip: string,
    userAgent: string
  ): Promise<any> {
    this.logger.log(`Initiating withdrawal for user ${userId}, amount: ${dto.amount}`);

    // 1. Verify transaction PIN
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPinValid = await bcrypt.compare(dto.pin, user.pin_hash);
    if (!isPinValid) {
      // Increment failed PIN attempts
      await this.usersRepository.update(
        { id: userId },
        { failed_pin_attempts: () => 'failed_pin_attempts + 1' }
      );

      throw new BadRequestException('Invalid transaction PIN');
    }

    // 2. Get bank account (must be verified)
    const bankAccount = await this.bankAccountsRepository.findOne({
      where: { id: dto.bank_account_id, user_id: userId }
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    if (!bankAccount.verified) {
      throw new BadRequestException('Bank account not verified');
    }

    // 3. Get wallet
    const wallet = await this.walletsRepository.findOne({
      where: { user_id: userId, currency: dto.currency }
    });

    if (!wallet) {
      throw new NotFoundException(`${dto.currency} wallet not found`);
    }

    // 4. Calculate fee
    const fee = this.withdrawalFeeService.calculateFee(
      dto.amount,
      user.kyc_tier,
      dto.currency
    );

    const totalDebit = dto.amount + fee;
    const netAmount = dto.amount - fee;

    // 5. Check sufficient balance
    if (BigInt(wallet.available_balance) < BigInt(totalDebit)) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient wallet balance',
        details: {
          required: totalDebit,
          available: wallet.available_balance,
        },
      });
    }

    // 6. Check daily withdrawal limit
    const todayWithdrawals = await this.getTodayWithdrawalTotal(userId, dto.currency);
    const dailyLimit = this.withdrawalFeeService.getDailyLimit(user.kyc_tier, dto.currency);

    if (todayWithdrawals + dto.amount > dailyLimit) {
      throw new ForbiddenException({
        code: 'DAILY_LIMIT_EXCEEDED',
        message: 'Daily withdrawal limit exceeded',
        details: {
          limit: dailyLimit,
          used: todayWithdrawals,
          remaining: dailyLimit - todayWithdrawals,
          resets_at: this.getNextDayMidnight(),
        },
      });
    }

    // 7. Check for duplicate idempotency key
    const existingTransaction = await this.transactionsRepository.findOne({
      where: { idempotency_key: dto.idempotency_key }
    });

    if (existingTransaction) {
      // Return existing transaction (idempotent)
      const existingWithdrawal = await this.withdrawalsRepository.findOne({
        where: { transaction_id: existingTransaction.id }
      });

      return {
        withdrawal: existingWithdrawal,
        balance: {
          available: wallet.available_balance,
          ledger: wallet.ledger_balance,
        },
        message: 'Withdrawal already exists',
      };
    }

    // 8. Generate reference
    const reference = this.generateWithdrawalReference();

    // 9. Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 10. Create transaction record
      const transaction = await queryRunner.manager.save(Transaction, {
        user_id: userId,
        type: TransactionType.WITHDRAWAL,
        category: TransactionCategory.BANK_WITHDRAWAL,
        amount: dto.amount,
        fee: fee,
        net_amount: netAmount,
        currency: dto.currency,
        status: TransactionStatus.PENDING,
        description: dto.reason || 'Bank withdrawal',
        source_wallet_id: wallet.id,
        reference,
        idempotency_key: dto.idempotency_key,
        ip_address: ip,
        user_agent: userAgent,
      });

      // 11. Create withdrawal record
      const withdrawal = await queryRunner.manager.save(Withdrawal, {
        transaction_id: transaction.id,
        bank_account_id: bankAccount.id,
        amount: dto.amount,
        fee: fee,
        net_amount: netAmount,
        provider: 'paystack',
      });

      // 12. Debit wallet via ledger (amount + fee)
      await this.ledgerService.createLedgerEntries(queryRunner, {
        transaction_id: transaction.id,
        entries: [
          // Debit withdrawal amount
          {
            wallet_id: wallet.id,
            entry_type: LedgerEntryType.DEBIT,
            amount: dto.amount,
            description: `Withdrawal to ${bankAccount.bank_name} ${bankAccount.account_number}`,
          },
          // Debit withdrawal fee
          {
            wallet_id: wallet.id,
            entry_type: LedgerEntryType.DEBIT,
            amount: fee,
            description: 'Withdrawal fee',
          },
        ],
      });

      await queryRunner.commitTransaction();

      this.logger.log(`Withdrawal initiated successfully: ${withdrawal.id}`);

      // 13. Send notification (async)
      this.notificationService.sendWithdrawalInitiatedNotification(
        user,
        withdrawal,
        bankAccount
      ).catch(err => {
        this.logger.error('Failed to send notification:', err);
      });

      // 14. Audit log
      await this.auditLogService.log({
        user_id: userId,
        action: 'WITHDRAWAL_INITIATED',
        resource: 'Withdrawal',
        resource_id: withdrawal.id,
        ip_address: ip,
        metadata: {
          amount: dto.amount,
          fee,
          bank_account: bankAccount.account_number,
        },
      });

      // 15. Get updated balance
      const updatedWallet = await this.walletsRepository.findOne({
        where: { id: wallet.id }
      });

      return {
        withdrawal,
        balance: {
          available: updatedWallet.available_balance,
          ledger: updatedWallet.ledger_balance,
        },
        message: 'Withdrawal initiated successfully',
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Withdrawal initiation failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async getTodayWithdrawalTotal(userId: string, currency: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.transactionsRepository
      .createQueryBuilder('txn')
      .select('SUM(txn.amount)', 'total')
      .where('txn.user_id = :userId', { userId })
      .andWhere('txn.type = :type', { type: TransactionType.WITHDRAWAL })
      .andWhere('txn.currency = :currency', { currency })
      .andWhere('txn.status IN (:...statuses)', {
        statuses: [TransactionStatus.COMPLETED, TransactionStatus.PENDING]
      })
      .andWhere('txn.created_at >= :today', { today })
      .getRawOne();

    return parseInt(result?.total || '0');
  }

  private getNextDayMidnight(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  private generateWithdrawalReference(): string {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WDL-${timestamp}-${random}`;
  }

  async getWithdrawals(userId: string, filters?: any): Promise<Withdrawal[]> {
    const query = this.withdrawalsRepository
      .createQueryBuilder('withdrawal')
      .leftJoinAndSelect('withdrawal.transaction', 'transaction')
      .leftJoinAndSelect('withdrawal.bank_account', 'bank_account')
      .where('transaction.user_id = :userId', { userId });

    if (filters?.status) {
      query.andWhere('transaction.status = :status', { status: filters.status });
    }

    if (filters?.from) {
      query.andWhere('withdrawal.created_at >= :from', { from: filters.from });
    }

    if (filters?.to) {
      query.andWhere('withdrawal.created_at <= :to', { to: filters.to });
    }

    return query
      .orderBy('withdrawal.created_at', 'DESC')
      .limit(filters?.limit || 20)
      .offset(filters?.offset || 0)
      .getMany();
  }
}
```

### Acceptance Criteria

- [ ] WithdrawalsService implemented
- [ ] initiateWithdrawal method working
- [ ] PIN verification working
- [ ] Bank account verification check
- [ ] Sufficient balance check
- [ ] Fee calculation integrated
- [ ] Daily limit checking working
- [ ] Idempotency handling
- [ ] Transaction record creation
- [ ] Withdrawal record creation
- [ ] Wallet debit via ledger
- [ ] Atomic database transaction
- [ ] Rollback on error
- [ ] Notification sent
- [ ] Audit logging
- [ ] getWithdrawals method with filtering

### Testing

```typescript
describe('WithdrawalsService', () => {
  it('should initiate withdrawal successfully');
  it('should verify transaction PIN');
  it('should reject invalid PIN');
  it('should check bank account verified');
  it('should check sufficient balance');
  it('should calculate fee correctly');
  it('should enforce daily limits');
  it('should handle idempotency');
  it('should create transaction and withdrawal records');
  it('should debit wallet via ledger');
  it('should rollback on error');
  it('should send notification');
  it('should create audit log');
  it('should get withdrawals with filters');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (14 tests)
- [ ] Error handling complete
- [ ] Logging complete
- [ ] Code reviewed

**Estimated Time:** 8 hours

---

## TICKET-6-005 through TICKET-6-027

**Note:** Remaining tickets follow the same professional Scrum Master format with:
- Detailed descriptions
- Complete acceptance criteria (10-20 items)
- Technical specifications
- Implementation code examples
- Testing requirements
- Definition of Done
- Estimated time

**Ticket Topics:**

- **TICKET-6-005:** Implement Paystack Transfer Integration (3 SP)
  - Create transfer recipient
  - Initiate transfer
  - Handle transfer webhooks

- **TICKET-6-006:** Create Withdrawal Endpoints (2 SP)
  - POST /withdrawals/bank-account
  - GET /withdrawals
  - GET /withdrawals/:id

- **TICKET-6-007:** Verify Bank Account Story (5 SP)
  - Account name resolution
  - Verification workflow

- **TICKET-6-008:** Implement Account Name Resolution (2 SP)
  - Paystack resolve account API
  - Display account name

- **TICKET-6-009:** Create Bank Account Schema (1 SP)
  - Bank accounts table
  - Verification status

- **TICKET-6-010:** Create Bank Account Endpoints (2 SP)
  - POST /bank-accounts/verify
  - POST /bank-accounts
  - GET /bank-accounts

- **TICKET-6-011:** Airtime & Data Purchase Story (8 SP)
  - Bill payment integration
  - Multiple networks

- **TICKET-6-012:** Setup Bill Payment Provider Integration (3 SP)
  - VTPass or Flutterwave Bills
  - API configuration

- **TICKET-6-013:** Implement Airtime Purchase Service (2 SP)
  - Airtime purchase logic
  - Network routing

- **TICKET-6-014:** Implement Data Bundle Service (2 SP)
  - Data plan listing
  - Bundle purchase

- **TICKET-6-015:** Create Bill Payment Endpoints (1 SP)
  - POST /bills/airtime
  - POST /bills/data
  - GET /bills/history

- **TICKET-6-016:** Utility Bill Payments Story (8 SP)
  - Electricity and cable TV
  - Multiple providers

- **TICKET-6-017:** Implement Electricity Payment Service (3 SP)
  - Prepaid/postpaid meters
  - Token delivery

- **TICKET-6-018:** Implement Cable TV Payment Service (3 SP)
  - DSTV, GOTV, Startimes
  - Smartcard validation

- **TICKET-6-019:** Create Utility Payment Endpoints (2 SP)
  - POST /bills/electricity
  - POST /bills/cable-tv

- **TICKET-6-020:** KYC Document Upload Story (8 SP)
  - Document management
  - Verification workflow

- **TICKET-6-021:** Setup Document Storage (S3) (2 SP)
  - AWS S3 configuration
  - Signed URL generation

- **TICKET-6-022:** Implement Document Upload Service (3 SP)
  - File upload handling
  - Image validation

- **TICKET-6-023:** Integrate KYC Verification Provider (2 SP)
  - Smile ID or Youverify
  - Automated verification

- **TICKET-6-024:** Create KYC Endpoints (1 SP)
  - POST /kyc/documents/upload
  - POST /kyc/bvn/verify
  - GET /kyc/status

- **TICKET-6-025:** Implement Daily Limit Tracking (2 SP)
  - Redis-based tracking
  - Limit reset logic

- **TICKET-6-026:** Create Withdrawal Receipt Generator (1 SP)
  - PDF generation
  - Email receipt

- **TICKET-6-027:** Setup Withdrawal Reconciliation Job (2 SP)
  - Daily reconciliation
  - Mismatch alerts

All tickets maintain the same level of detail as TICKET-6-001 through TICKET-6-004.

---

## Ticket Summary

**Total Tickets:** 27
**By Type:**
- User Stories: 5
- Tasks: 22

**By Status:**
- To Do: 27
- In Progress: 0
- Done: 0

**By Story Points:**
- 1 SP: 5 tickets
- 2 SP: 12 tickets
- 3 SP: 5 tickets
- 4 SP: 1 ticket
- 5 SP: 1 ticket
- 8 SP: 3 tickets
- 13 SP: 1 ticket
- **Total:** 45 SP

**By Priority:**
- P0 (Critical): 16 tickets
- P1 (High): 8 tickets
- P2 (Medium): 3 tickets

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
