# Sprint 4 Backlog - Wallet Core & Ledger System

**Sprint:** Sprint 4
**Duration:** 2 weeks (Week 9-10)
**Sprint Goal:** Implement double-entry ledger system, multi-currency wallet support, and transaction management foundation
**Story Points Committed:** 45
**Team Capacity:** 45 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1 (45 SP), Sprint 2 (42 SP), Sprint 3 (38 SP) = 42 SP, committed 45 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 4, we will have:
1. Double-entry ledger system implemented (core accounting)
2. Multi-currency wallet support (NGN, USD, GBP, EUR)
3. Transaction idempotency to prevent duplicates
4. Wallet balance queries (available, ledger, pending)
5. Wallet freezing/unfreezing capabilities
6. Wallet limits and thresholds per KYC tier
7. Atomic transaction processing with database transactions
8. Comprehensive audit trail for all financial operations

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (90% coverage)
- [ ] Integration tests passing
- [ ] Transaction isolation tests passing
- [ ] Double-entry accounting validated (debits = credits)
- [ ] API documentation updated (Swagger)
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-3: Wallet & Ledger Management

## FEATURE-3.1: Double-Entry Ledger

### 📘 User Story: US-4.1.1 - Double-Entry Ledger Implementation

**Story ID:** US-4.1.1
**Feature:** FEATURE-3.1 (Double-Entry Ledger)
**Epic:** EPIC-3 (Wallet & Ledger Management)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 4
**Status:** 🔄 Not Started

---

#### User Story

```
As a platform developer
I want to implement a double-entry ledger system
So that all financial transactions are accurately recorded and balanced
```

---

#### Business Value

**Value Statement:**
Double-entry ledger is the foundation of accurate financial record-keeping. Every transaction creates equal debits and credits, ensuring the books always balance and providing complete audit trail.

**Impact:**
- **Critical:** Foundation for all financial operations
- **Compliance:** Required for accounting standards (GAAP, IFRS)
- **Audit:** Complete transaction history with immutability
- **Reconciliation:** Enables automated reconciliation

**Success Criteria:**
- 100% of transactions balanced (debits = credits)
- Zero missing or orphaned ledger entries
- < 100ms ledger entry creation time
- Immutable ledger entries (no updates, only reversals)
- Complete audit trail for all transactions

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Every transaction creates at least 2 ledger entries (debit + credit)
- [ ] **AC2:** Sum of debits equals sum of credits for every transaction
- [ ] **AC3:** Ledger entries reference parent transaction
- [ ] **AC4:** Support for multi-leg transactions (>2 entries)
- [ ] **AC5:** Ledger entries immutable (no updates, only reversal entries)
- [ ] **AC6:** Each entry has: account, amount, type (debit/credit), balance_after
- [ ] **AC7:** Running balance calculated and stored
- [ ] **AC8:** Support for different account types (asset, liability, revenue, expense)
- [ ] **AC9:** Chart of accounts defined for platform operations
- [ ] **AC10:** Transaction reference includes: ID, type, description, metadata

**Data Integrity:**
- [ ] **AC11:** Atomic ledger entry creation (all or nothing)
- [ ] **AC12:** Database constraints enforce debit/credit balance
- [ ] **AC13:** Optimistic locking prevents race conditions
- [ ] **AC14:** Foreign key constraints maintain referential integrity
- [ ] **AC15:** Check constraints validate balance calculations

**Non-Functional:**
- [ ] **AC16:** Ledger entry creation < 100ms
- [ ] **AC17:** Support for 10,000+ transactions per second
- [ ] **AC18:** Database indexes optimize balance queries
- [ ] **AC19:** Partition strategy for large datasets
- [ ] **AC20:** Audit log for all ledger operations

---

#### Technical Specifications

**Database Schema:**

**Table: ledger_entries**
```sql
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Transaction reference
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  transaction_type VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'transfer', 'payment'

  -- Account information
  account_id UUID NOT NULL, -- wallet_id or system account
  account_type VARCHAR(50) NOT NULL, -- 'user_wallet', 'system_fee', 'system_revenue', 'provider_payable'

  -- Amount and type
  amount DECIMAL(20, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL,
  entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('debit', 'credit')),

  -- Balance tracking
  balance_before DECIMAL(20, 2) NOT NULL,
  balance_after DECIMAL(20, 2) NOT NULL,

  -- Metadata
  description TEXT,
  metadata JSONB,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES users(id),

  -- Immutability
  is_reversed BOOLEAN DEFAULT false,
  reversed_by UUID REFERENCES ledger_entries(id),
  reversed_at TIMESTAMP WITH TIME ZONE,

  -- Version control
  version INTEGER DEFAULT 1 NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_ledger_entries_transaction_id ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_entries_account_id ON ledger_entries(account_id);
CREATE INDEX idx_ledger_entries_created_at ON ledger_entries(created_at DESC);
CREATE INDEX idx_ledger_entries_currency ON ledger_entries(currency);
CREATE INDEX idx_ledger_entries_account_created ON ledger_entries(account_id, created_at DESC);

-- Constraint: Ensure transaction balance
CREATE FUNCTION check_transaction_balance()
RETURNS TRIGGER AS $$
DECLARE
  debit_sum DECIMAL(20, 2);
  credit_sum DECIMAL(20, 2);
BEGIN
  -- Calculate sum of debits and credits for this transaction
  SELECT
    COALESCE(SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0)
  INTO debit_sum, credit_sum
  FROM ledger_entries
  WHERE transaction_id = NEW.transaction_id;

  -- Check if transaction is complete and balanced
  IF debit_sum > 0 AND credit_sum > 0 AND debit_sum != credit_sum THEN
    RAISE EXCEPTION 'Transaction % is not balanced: debits=% credits=%',
      NEW.transaction_id, debit_sum, credit_sum;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_transaction_balance
  AFTER INSERT ON ledger_entries
  FOR EACH ROW
  EXECUTE FUNCTION check_transaction_balance();
```

**Table: chart_of_accounts**
```sql
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_code VARCHAR(20) UNIQUE NOT NULL, -- 'WALLET_USER_NGN', 'FEE_REVENUE', 'PROVIDER_PAYABLE'
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'revenue', 'expense', 'equity'
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standard chart of accounts
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
('ASSET_USER_WALLETS', 'User Wallets', 'asset', 'User wallet balances'),
('ASSET_FLOAT', 'Float Account', 'asset', 'Platform float for operations'),
('LIABILITY_PROVIDER', 'Provider Payables', 'liability', 'Amount owed to payment providers'),
('REVENUE_FEES', 'Transaction Fees', 'revenue', 'Revenue from transaction fees'),
('REVENUE_FX', 'FX Spread Revenue', 'revenue', 'Revenue from currency exchange'),
('EXPENSE_PROVIDER', 'Provider Fees', 'expense', 'Fees paid to payment providers');
```

---

#### Implementation Details

**Ledger Service:**
```typescript
// ledger.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry)
    private ledgerEntryRepository: Repository<LedgerEntry>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private dataSource: DataSource,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Create double-entry ledger entries for a transaction
   * @param transaction - Parent transaction
   * @param entries - Array of ledger entries (must balance)
   * @returns Created ledger entries
   */
  async createLedgerEntries(
    transaction: Transaction,
    entries: CreateLedgerEntryDto[],
    queryRunner?: QueryRunner
  ): Promise<LedgerEntry[]> {
    const useExternalQueryRunner = !!queryRunner;
    const qr = queryRunner || this.dataSource.createQueryRunner();

    if (!useExternalQueryRunner) {
      await qr.connect();
      await qr.startTransaction();
    }

    try {
      // 1. Validate entries balance
      this.validateBalance(entries);

      // 2. Create ledger entries with balance calculation
      const createdEntries: LedgerEntry[] = [];

      for (const entryDto of entries) {
        // Get current balance
        const currentBalance = await this.getAccountBalance(
          entryDto.account_id,
          entryDto.currency,
          qr
        );

        // Calculate new balance
        const balanceChange = entryDto.entry_type === 'debit'
          ? -entryDto.amount
          : entryDto.amount;
        const newBalance = currentBalance + balanceChange;

        // Create entry
        const entry = qr.manager.create(LedgerEntry, {
          transaction_id: transaction.id,
          transaction_type: transaction.type,
          account_id: entryDto.account_id,
          account_type: entryDto.account_type,
          amount: entryDto.amount,
          currency: entryDto.currency,
          entry_type: entryDto.entry_type,
          balance_before: currentBalance,
          balance_after: newBalance,
          description: entryDto.description,
          metadata: entryDto.metadata,
          created_by: transaction.user_id,
        });

        const savedEntry = await qr.manager.save(entry);
        createdEntries.push(savedEntry);

        // Update wallet balance (if applicable)
        if (entryDto.account_type === 'user_wallet') {
          await this.updateWalletBalance(
            entryDto.account_id,
            entryDto.currency,
            balanceChange,
            qr
          );
        }
      }

      // 3. Audit log
      await this.auditLogService.log({
        user_id: transaction.user_id,
        action: 'LEDGER_ENTRIES_CREATED',
        resource: 'Ledger',
        resource_id: transaction.id,
        metadata: {
          transaction_type: transaction.type,
          entry_count: createdEntries.length,
          total_amount: entries.reduce((sum, e) => sum + e.amount, 0),
        },
      });

      if (!useExternalQueryRunner) {
        await qr.commitTransaction();
      }

      return createdEntries;

    } catch (error) {
      if (!useExternalQueryRunner) {
        await qr.rollbackTransaction();
      }
      throw error;
    } finally {
      if (!useExternalQueryRunner) {
        await qr.release();
      }
    }
  }

  /**
   * Validate that debits equal credits
   */
  private validateBalance(entries: CreateLedgerEntryDto[]): void {
    const debitSum = entries
      .filter(e => e.entry_type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);

    const creditSum = entries
      .filter(e => e.entry_type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);

    if (Math.abs(debitSum - creditSum) > 0.01) { // Allow for rounding
      throw new BadRequestException(
        `Transaction not balanced: debits=${debitSum}, credits=${creditSum}`
      );
    }

    // Ensure minimum 2 entries
    if (entries.length < 2) {
      throw new BadRequestException('Transaction must have at least 2 ledger entries');
    }
  }

  /**
   * Get current balance for an account
   */
  private async getAccountBalance(
    accountId: string,
    currency: string,
    queryRunner: QueryRunner
  ): Promise<number> {
    const result = await queryRunner.manager
      .createQueryBuilder(LedgerEntry, 'entry')
      .select('entry.balance_after', 'balance')
      .where('entry.account_id = :accountId', { accountId })
      .andWhere('entry.currency = :currency', { currency })
      .orderBy('entry.created_at', 'DESC')
      .limit(1)
      .getRawOne();

    return result?.balance || 0;
  }

  /**
   * Update wallet balance (for user wallets)
   */
  private async updateWalletBalance(
    walletId: string,
    currency: string,
    balanceChange: number,
    queryRunner: QueryRunner
  ): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .update(Wallet)
      .set({
        ledger_balance: () => `ledger_balance + ${balanceChange}`,
        available_balance: () => `available_balance + ${balanceChange}`,
        updated_at: new Date(),
        version: () => 'version + 1', // Optimistic locking
      })
      .where('id = :walletId', { walletId })
      .andWhere('currency = :currency', { currency })
      .execute();
  }

  /**
   * Reverse ledger entries (for refunds, cancellations)
   */
  async reverseLedgerEntries(
    originalTransactionId: string,
    reversalTransaction: Transaction,
    reason: string
  ): Promise<LedgerEntry[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Get original entries
      const originalEntries = await this.ledgerEntryRepository.find({
        where: { transaction_id: originalTransactionId },
      });

      if (originalEntries.length === 0) {
        throw new NotFoundException('Original transaction not found');
      }

      // Check if already reversed
      if (originalEntries.some(e => e.is_reversed)) {
        throw new BadRequestException('Transaction already reversed');
      }

      // 2. Create reversal entries (flip debit/credit)
      const reversalEntries: CreateLedgerEntryDto[] = originalEntries.map(entry => ({
        account_id: entry.account_id,
        account_type: entry.account_type,
        amount: entry.amount,
        currency: entry.currency,
        entry_type: entry.entry_type === 'debit' ? 'credit' : 'debit',
        description: `Reversal: ${entry.description} (Reason: ${reason})`,
        metadata: {
          ...entry.metadata,
          reversal_of: entry.id,
          reversal_reason: reason,
        },
      }));

      const createdReversals = await this.createLedgerEntries(
        reversalTransaction,
        reversalEntries,
        queryRunner
      );

      // 3. Mark original entries as reversed
      for (let i = 0; i < originalEntries.length; i++) {
        await queryRunner.manager.update(
          LedgerEntry,
          { id: originalEntries[i].id },
          {
            is_reversed: true,
            reversed_by: createdReversals[i].id,
            reversed_at: new Date(),
          }
        );
      }

      await queryRunner.commitTransaction();

      return createdReversals;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get ledger entries for an account
   */
  async getLedgerEntries(
    accountId: string,
    currency: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ entries: LedgerEntry[]; total: number }> {
    const query = this.ledgerEntryRepository
      .createQueryBuilder('entry')
      .where('entry.account_id = :accountId', { accountId })
      .andWhere('entry.currency = :currency', { currency });

    if (options.startDate) {
      query.andWhere('entry.created_at >= :startDate', { startDate: options.startDate });
    }

    if (options.endDate) {
      query.andWhere('entry.created_at <= :endDate', { endDate: options.endDate });
    }

    query.orderBy('entry.created_at', 'DESC');

    const total = await query.getCount();

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    const entries = await query.getMany();

    return { entries, total };
  }

  /**
   * Validate ledger integrity (for audits)
   */
  async validateLedgerIntegrity(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // 1. Check transaction balance
    const unbalancedTransactions = await this.ledgerEntryRepository
      .createQueryBuilder('entry')
      .select('entry.transaction_id', 'transaction_id')
      .addSelect('SUM(CASE WHEN entry_type = \'debit\' THEN amount ELSE 0 END)', 'debit_sum')
      .addSelect('SUM(CASE WHEN entry_type = \'credit\' THEN amount ELSE 0 END)', 'credit_sum')
      .groupBy('entry.transaction_id')
      .having('SUM(CASE WHEN entry_type = \'debit\' THEN amount ELSE 0 END) != SUM(CASE WHEN entry_type = \'credit\' THEN amount ELSE 0 END)')
      .getRawMany();

    if (unbalancedTransactions.length > 0) {
      issues.push(`Found ${unbalancedTransactions.length} unbalanced transactions`);
    }

    // 2. Check balance consistency
    // (Compare calculated balance vs stored balance_after)

    // 3. Check orphaned entries
    const orphanedEntries = await this.ledgerEntryRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.transaction', 'transaction')
      .where('transaction.id IS NULL')
      .getCount();

    if (orphanedEntries > 0) {
      issues.push(`Found ${orphanedEntries} orphaned ledger entries`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
```

**Usage Example (Deposit Transaction):**
```typescript
// When user deposits NGN 10,000
const transaction = await this.transactionsRepository.save({
  user_id: userId,
  type: 'deposit',
  amount: 10000,
  currency: 'NGN',
  status: 'completed',
});

// Create ledger entries
await this.ledgerService.createLedgerEntries(transaction, [
  {
    // Debit: User wallet (asset increases)
    account_id: userWalletId,
    account_type: 'user_wallet',
    amount: 10000,
    currency: 'NGN',
    entry_type: 'debit',
    description: 'Deposit to wallet',
  },
  {
    // Credit: Float account (liability increases)
    account_id: FLOAT_ACCOUNT_ID,
    account_type: 'system_float',
    amount: 10000,
    currency: 'NGN',
    entry_type: 'credit',
    description: 'Deposit from external source',
  },
]);
```

**Usage Example (Payment with Fee):**
```typescript
// When user pays NGN 1,000 with NGN 50 fee
const transaction = await this.transactionsRepository.save({
  user_id: userId,
  type: 'payment',
  amount: 1000,
  currency: 'NGN',
  fee: 50,
  status: 'completed',
});

// Create ledger entries
await this.ledgerService.createLedgerEntries(transaction, [
  {
    // Debit: User wallet (asset decreases by total)
    account_id: userWalletId,
    account_type: 'user_wallet',
    amount: 1050, // Amount + fee
    currency: 'NGN',
    entry_type: 'credit', // Credit decreases asset
    description: 'Payment',
  },
  {
    // Credit: Provider payable (liability increases)
    account_id: PROVIDER_ACCOUNT_ID,
    account_type: 'provider_payable',
    amount: 1000,
    currency: 'NGN',
    entry_type: 'debit',
    description: 'Payment to provider',
  },
  {
    // Credit: Fee revenue (revenue increases)
    account_id: FEE_REVENUE_ACCOUNT_ID,
    account_type: 'revenue',
    amount: 50,
    currency: 'NGN',
    entry_type: 'debit',
    description: 'Transaction fee',
  },
]);
```

---

#### Testing Checklist

**Unit Tests:**
- [ ] Test double-entry creation (debit + credit)
- [ ] Test balance validation (debits = credits)
- [ ] Test multi-leg transactions (>2 entries)
- [ ] Test balance calculation (balance_before, balance_after)
- [ ] Test reversal entry creation
- [ ] Test marking entries as reversed
- [ ] Test ledger query with filters
- [ ] Test integrity validation
- [ ] Test unbalanced transaction rejection
- [ ] Test minimum entry requirement (2+)
- [ ] Test wallet balance update
- [ ] Test optimistic locking

**Integration Tests:**
- [ ] Test full transaction flow with ledger
- [ ] Test concurrent transaction handling
- [ ] Test database transaction rollback
- [ ] Test constraint enforcement (balance check)
- [ ] Test foreign key integrity
- [ ] Test ledger query performance

**Security Tests:**
- [ ] Test ledger entry immutability
- [ ] Test unauthorized reversal prevention
- [ ] Test SQL injection prevention

**Performance Tests:**
- [ ] Test 10,000 transactions per second
- [ ] Test balance query performance
- [ ] Test ledger history query performance

---

#### Definition of Done

- [ ] Ledger service implemented
- [ ] Double-entry accounting enforced
- [ ] Database constraints in place
- [ ] Reversal mechanism working
- [ ] Ledger queries optimized
- [ ] Integrity validation implemented
- [ ] All unit tests passing (12+ tests)
- [ ] All integration tests passing (6+ tests)
- [ ] Performance tests passing
- [ ] Code reviewed and merged
- [ ] Documentation complete

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-4.1.1.1 | Create Ledger Database Schema | 3 | 🔄 To Do |
| TASK-4.1.1.2 | Implement Ledger Service | 5 | 🔄 To Do |
| TASK-4.1.1.3 | Implement Reversal Mechanism | 3 | 🔄 To Do |
| TASK-4.1.1.4 | Create Ledger Query API | 2 | 🔄 To Do |
| **Total** | | **13** | |

---

## FEATURE-3.2: Multi-Currency Wallets

### 📘 User Story: US-4.2.1 - Multi-Currency Wallet Support

**Story ID:** US-4.2.1
**Feature:** FEATURE-3.2 (Multi-Currency Wallets)
**Epic:** EPIC-3 (Wallet & Ledger Management)

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 4
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to hold multiple currencies in my wallet
So that I can transact in different currencies without frequent conversions
```

---

#### Business Value

**Value Statement:**
Multi-currency support enables users to hold and transact in NGN, USD, GBP, EUR, reducing conversion friction and enabling international transactions.

**Impact:**
- **High:** Enables international payments
- **Revenue:** Reduces conversion frequency (users keep foreign currency)
- **UX:** Seamless multi-currency experience

**Success Criteria:**
- Support for 4+ currencies (NGN, USD, GBP, EUR)
- < 100ms wallet creation time
- 99.99% balance accuracy
- Zero currency mismatch errors

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can have wallets in multiple currencies
- [ ] **AC2:** Supported currencies: NGN, USD, GBP, EUR (expandable)
- [ ] **AC3:** Each currency has separate balance tracking
- [ ] **AC4:** Primary wallet designation per currency
- [ ] **AC5:** Automatic wallet creation on first currency use
- [ ] **AC6:** Each wallet has: available_balance, ledger_balance, pending_balance
- [ ] **AC7:** Currency ISO 4217 codes (3 letters)
- [ ] **AC8:** Display precision: 2 decimal places
- [ ] **AC9:** Storage precision: DECIMAL(20, 2)
- [ ] **AC10:** Support for wallet metadata (nickname, color)

**Data Integrity:**
- [ ] **AC11:** Unique constraint on (user_id, currency)
- [ ] **AC12:** Balance cannot be negative
- [ ] **AC13:** Pending balance cannot exceed available balance
- [ ] **AC14:** Soft delete (retain transaction history)

---

#### Technical Specifications

**Wallets Table (Extended):**
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Currency
  currency VARCHAR(3) NOT NULL, -- ISO 4217: 'NGN', 'USD', 'GBP', 'EUR'

  -- Balances (in minor units for precision)
  available_balance DECIMAL(20, 2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  ledger_balance DECIMAL(20, 2) NOT NULL DEFAULT 0,
  pending_balance DECIMAL(20, 2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  is_primary BOOLEAN DEFAULT false,

  -- Metadata
  nickname VARCHAR(100),
  metadata JSONB,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 1, -- Optimistic locking

  UNIQUE(user_id, currency)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_currency ON wallets(currency);
CREATE INDEX idx_wallets_status ON wallets(status);
CREATE INDEX idx_wallets_user_currency ON wallets(user_id, currency);
```

**Supported Currencies Table:**
```sql
CREATE TABLE supported_currencies (
  code VARCHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  decimal_places SMALLINT NOT NULL DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO supported_currencies (code, name, symbol) VALUES
('NGN', 'Nigerian Naira', '₦'),
('USD', 'United States Dollar', '$'),
('GBP', 'British Pound Sterling', '£'),
('EUR', 'Euro', '€');
```

**Wallet Service Implementation:**
```typescript
@Injectable()
export class WalletService {
  async createOrGetWallet(userId: string, currency: string): Promise<Wallet> {
    // Check if wallet exists
    let wallet = await this.walletsRepository.findOne({
      where: { user_id: userId, currency }
    });

    if (wallet) {
      return wallet;
    }

    // Validate currency
    const supportedCurrency = await this.currenciesRepository.findOne({
      where: { code: currency, is_active: true }
    });

    if (!supportedCurrency) {
      throw new BadRequestException(`Currency ${currency} not supported`);
    }

    // Create new wallet
    wallet = this.walletsRepository.create({
      user_id: userId,
      currency,
      available_balance: 0,
      ledger_balance: 0,
      pending_balance: 0,
      status: 'active',
      is_primary: false,
    });

    return await this.walletsRepository.save(wallet);
  }

  async getUserWallets(userId: string): Promise<Wallet[]> {
    return await this.walletsRepository.find({
      where: { user_id: userId, deleted_at: null },
      order: { is_primary: 'DESC', currency: 'ASC' }
    });
  }

  async getWalletBalance(walletId: string): Promise<WalletBalance> {
    const wallet = await this.walletsRepository.findOne({
      where: { id: walletId }
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      available_balance: wallet.available_balance,
      ledger_balance: wallet.ledger_balance,
      pending_balance: wallet.pending_balance,
      currency: wallet.currency,
    };
  }
}
```

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-4.2.1.1 | Extend Wallets Database Schema | 2 | 🔄 To Do |
| TASK-4.2.1.2 | Implement Multi-Currency Wallet Service | 3 | 🔄 To Do |
| TASK-4.2.1.3 | Create Wallet Management Endpoints | 2 | 🔄 To Do |
| TASK-4.2.1.4 | Add Currency Validation | 1 | 🔄 To Do |
| **Total** | | **8** | |

---

## FEATURE-3.3: Wallet Balance Management

### 📘 User Story: US-4.3.1 - Wallet Balance Queries

**Story ID:** US-4.3.1
**Feature:** FEATURE-3.3 (Wallet Balance Management)
**Epic:** EPIC-3 (Wallet & Ledger Management)

**Story Points:** 5
**Priority:** P0 (Critical)
**Sprint:** Sprint 4
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to check my wallet balances
So that I know how much money I have available, pending, and in total
```

---

#### Acceptance Criteria

**Functional:**
- [ ] Three balance types: available, ledger, pending
- [ ] GET /api/v1/wallets/:id/balance endpoint
- [ ] GET /api/v1/wallets endpoint (all user wallets)
- [ ] Real-time balance calculation
- [ ] Balance breakdown by currency
- [ ] Total portfolio value in base currency (optional)

**Performance:**
- [ ] Balance query < 50ms
- [ ] Support for 1000+ requests per second
- [ ] Caching strategy (Redis, 30 seconds TTL)

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-4.3.1.1 | Implement Balance Query Service | 2 | 🔄 To Do |
| TASK-4.3.1.2 | Create Balance Query Endpoints | 2 | 🔄 To Do |
| TASK-4.3.1.3 | Add Redis Caching | 1 | 🔄 To Do |
| **Total** | | **5** | |

---

## FEATURE-3.4: Transaction Reliability

### 📘 User Story: US-4.4.1 - Transaction Idempotency

**Story ID:** US-4.4.1
**Feature:** FEATURE-3.4 (Transaction Reliability)
**Epic:** EPIC-3 (Wallet & Ledger Management)

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 4
**Status:** 🔄 Not Started

---

#### User Story

```
As a platform developer
I want transaction idempotency
So that duplicate requests don't create duplicate transactions
```

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Idempotency key required for all financial operations
- [ ] **AC2:** UUID v4 format for keys
- [ ] **AC3:** Duplicate key returns original transaction
- [ ] **AC4:** Idempotency key stored with transaction
- [ ] **AC5:** TTL: 24 hours for idempotency keys
- [ ] **AC6:** HTTP header: X-Idempotency-Key
- [ ] **AC7:** Returns 409 Conflict if key used with different payload

**Implementation:**
```typescript
@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['x-idempotency-key'];

    if (!idempotencyKey) {
      throw new BadRequestException('X-Idempotency-Key header required');
    }

    // Check if key exists
    const cached = await this.redis.get(`idempotency:${idempotencyKey}`);

    if (cached) {
      const cachedResponse = JSON.parse(cached);
      throw new HttpException(cachedResponse, HttpStatus.OK);
    }

    // Store payload hash for verification
    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(request.body))
      .digest('hex');

    await this.redis.setex(
      `idempotency:${idempotencyKey}:hash`,
      86400,
      payloadHash
    );

    return true;
  }
}
```

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-4.4.1.1 | Implement Idempotency Guard | 3 | 🔄 To Do |
| TASK-4.4.1.2 | Add Idempotency to Transaction Endpoints | 3 | 🔄 To Do |
| TASK-4.4.1.3 | Create Idempotency Tests | 2 | 🔄 To Do |
| **Total** | | **8** | |

---

## FEATURE-3.5: Wallet Controls

### 📘 User Story: US-4.5.1 - Wallet Freezing/Unfreezing

**Story ID:** US-4.5.1
**Feature:** FEATURE-3.5 (Wallet Controls)
**Epic:** EPIC-3 (Wallet & Ledger Management)

**Story Points:** 5
**Priority:** P1 (Should Have)
**Sprint:** Sprint 4
**Status:** 🔄 Not Started

---

#### User Story

```
As a compliance officer
I want to freeze/unfreeze user wallets
So that I can prevent transactions on suspicious accounts
```

---

#### Acceptance Criteria

**Functional:**
- [ ] Admin can freeze wallet
- [ ] Admin can unfreeze wallet
- [ ] Frozen wallets block all outgoing transactions
- [ ] Frozen wallets allow incoming transactions
- [ ] Freeze reason required
- [ ] Email notification on freeze/unfreeze
- [ ] Audit log for freeze/unfreeze actions

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-4.5.1.1 | Implement Wallet Freeze Logic | 2 | 🔄 To Do |
| TASK-4.5.1.2 | Create Freeze/Unfreeze Endpoints | 2 | 🔄 To Do |
| TASK-4.5.1.3 | Add Freeze Checks to Transactions | 1 | 🔄 To Do |
| **Total** | | **5** | |

---

## FEATURE-3.6: Transaction Limits

### 📘 User Story: US-4.6.1 - Wallet Limits & Thresholds

**Story ID:** US-4.6.1
**Feature:** FEATURE-3.6 (Transaction Limits)
**Epic:** EPIC-3 (Wallet & Ledger Management)

**Story Points:** 6
**Priority:** P0 (Critical)
**Sprint:** Sprint 4
**Status:** 🔄 Not Started

---

#### User Story

```
As a compliance-focused platform
I want transaction limits per KYC tier
So that I can comply with financial regulations
```

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Transaction limits per KYC tier
- [ ] **AC2:** Daily, monthly limits
- [ ] **AC3:** Per-transaction limits
- [ ] **AC4:** Limits by currency
- [ ] **AC5:** Exceeded limit returns clear error

**KYC Tier Limits:**
```typescript
const TRANSACTION_LIMITS = {
  tier_0: {
    NGN: { daily: 50000, monthly: 200000, per_transaction: 10000 },
    USD: { daily: 100, monthly: 400, per_transaction: 20 },
  },
  tier_1: {
    NGN: { daily: 500000, monthly: 5000000, per_transaction: 100000 },
    USD: { daily: 1000, monthly: 10000, per_transaction: 200 },
  },
  tier_2: {
    NGN: { daily: 5000000, monthly: 50000000, per_transaction: 1000000 },
    USD: { daily: 10000, monthly: 100000, per_transaction: 2000 },
  },
};
```

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-4.6.1.1 | Define Transaction Limits | 1 | 🔄 To Do |
| TASK-4.6.1.2 | Implement Limit Checking Service | 3 | 🔄 To Do |
| TASK-4.6.1.3 | Add Limit Checks to Transactions | 2 | 🔄 To Do |
| **Total** | | **6** | |

---

## Sprint 4 Summary

### User Stories Overview

| Story ID | Story Name | Story Points | Status |
|----------|------------|--------------|--------|
| US-4.1.1 | Double-Entry Ledger Implementation | 13 | 🔄 To Do |
| US-4.2.1 | Multi-Currency Wallet Support | 8 | 🔄 To Do |
| US-4.3.1 | Wallet Balance Queries | 5 | 🔄 To Do |
| US-4.4.1 | Transaction Idempotency | 8 | 🔄 To Do |
| US-4.5.1 | Wallet Freezing/Unfreezing | 5 | 🔄 To Do |
| US-4.6.1 | Wallet Limits & Thresholds | 6 | 🔄 To Do |
| **Total** | | **45** | |

---

## Sprint 4 Velocity Tracking

**Planned Story Points:** 45 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

### Burndown Chart (To be updated daily)

| Day | Remaining SP | Completed SP | Notes |
|-----|--------------|--------------|-------|
| Day 1 | 45 | 0 | Sprint kickoff |
| Day 2 | | | |
| Day 3 | | | |
| ... | | | |
| Day 10 | 0 | 45 | Sprint complete (target) |

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
