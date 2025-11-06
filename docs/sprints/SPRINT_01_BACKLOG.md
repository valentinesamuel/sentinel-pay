# Sprint 1 Backlog - Core Security & Database Foundation

**Sprint:** Sprint 1
**Duration:** 2 weeks (Week 3-4)
**Sprint Goal:** Implement security infrastructure and core database entities
**Story Points Committed:** 45
**Team Capacity:** 45 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** TBD (First sprint after Sprint 0)

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 1, we will have:
1. All core database entities created and migrated
2. Field-level encryption implemented for sensitive data
3. Row-level security policies applied
4. JWT authentication fully functional
5. Rate limiting configured
6. Request validation enabled
7. Idempotency keys supported
8. Audit logging operational

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (80% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed and merged to main branch
- [ ] Documentation updated
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-1: Core Infrastructure & Security

## FEATURE-1.1: Database Architecture & Entities

### 📘 User Story: US-1.1.1 - Core Database Entities

**Story ID:** US-1.1.1
**Feature:** FEATURE-1.1 (Database Architecture)
**Epic:** EPIC-1 (Core Infrastructure & Security)

**Story Points:** 13
**Priority:** P0 (Must Have)
**Sprint:** Sprint 1
**Status:** 🔄 In Progress

---

#### User Story

```
As a developer
I want to have all core database entities defined with proper relationships
So that I can implement business logic with consistent data models
```

---

#### Business Value

**Value Statement:**
Enables all feature development by providing a solid data foundation. Without proper entities, no business logic can be implemented.

**Impact:**
- **High:** Blocks all other development
- **Critical Path:** Yes
- **Dependencies:** All future features depend on this

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** All 15+ entity files created in `libs/database/src/entities/`
- [ ] **AC2:** Each entity properly decorated with TypeORM decorators
- [ ] **AC3:** All entities extend BaseEntity (id, timestamps, soft delete, version)
- [ ] **AC4:** Relationships defined: OneToMany, ManyToOne, OneToOne where applicable
- [ ] **AC5:** UUID used as primary keys (`@PrimaryGeneratedColumn('uuid')`)
- [ ] **AC6:** Timestamps use timezone-aware types (`timestamp with time zone`)
- [ ] **AC7:** Soft delete implemented via `@DeleteDateColumn`
- [ ] **AC8:** Version column for optimistic locking (`@VersionColumn`)
- [ ] **AC9:** Indexes created on foreign keys and frequently queried fields
- [ ] **AC10:** Unique constraints applied where needed (email, phone, reference, etc.)

**Non-Functional:**
- [ ] **AC11:** Query performance: Index scan < 10ms for filtered queries
- [ ] **AC12:** All entities follow naming conventions (snake_case for columns)
- [ ] **AC13:** Code follows NestJS/TypeORM best practices
- [ ] **AC14:** TypeScript strict mode compliance

---

#### Technical Specifications

**Entities to Implement:**

1. **base.entity.ts** ✅ (Completed)
   - id: UUID
   - created_at, updated_at, deleted_at: timestamp with time zone
   - version: integer

2. **user.entity.ts**
   - Core user authentication and profile
   - Fields: email, phone_number, password_hash, first_name, last_name, etc.
   - Relationships: OneToMany -> Wallet, Card, BankAccount, KYCDocument

3. **wallet.entity.ts**
   - Multi-currency wallet balances
   - Fields: user_id, currency, available_balance, ledger_balance, pending_balance
   - Unique constraint: (user_id + currency)

4. **transaction.entity.ts**
   - All financial transactions
   - Fields: reference, amount, currency, status, type, category, metadata
   - Relationships: ManyToOne -> User, Wallet (source/destination)

5. **ledger-entry.entity.ts**
   - Double-entry accounting
   - Fields: transaction_id, wallet_id, entry_type (debit/credit), amount, balance_before, balance_after
   - Immutable (no update/delete)

6. **card.entity.ts**
   - Linked payment cards
   - Fields: user_id, card_number (encrypted), card_type, brand, expiry_month, expiry_year, status
   - Tokenization support

7. **bank-account.entity.ts**
   - Linked bank accounts
   - Fields: user_id, account_number (encrypted), account_name, bank_code, bank_name, status

8. **payment.entity.ts**
   - Payment-specific details
   - Fields: transaction_id, payment_method, provider, card_id, bank_account_id, provider_reference

9. **transfer.entity.ts**
   - Transfer-specific details
   - Fields: transaction_id, transfer_type (local/international), recipient_name, recipient_account

10. **refund.entity.ts**
    - Refund tracking
    - Fields: original_transaction_id, refund_transaction_id, reason, status

11. **dispute.entity.ts**
    - Dispute management
    - Fields: transaction_id, reason, status, evidence, resolution

12. **kyc-document.entity.ts**
    - KYC document uploads
    - Fields: user_id, document_type, document_number, file_url, verification_status

13. **fraud-alert.entity.ts**
    - Fraud detection alerts
    - Fields: user_id, transaction_id, alert_type, risk_score, rule_triggered

14. **webhook.entity.ts**
    - Webhook subscriptions
    - Fields: user_id, url, events[], secret, status

15. **api-key.entity.ts**
    - API key management
    - Fields: user_id, key_name, key_hash, permissions[], last_used_at

16. **audit-log.entity.ts**
    - Audit trail
    - Fields: user_id, action, resource, resource_id, old_value, new_value, ip_address

---

#### Database Schema Design

**Key Design Decisions:**
1. **UUID for Primary Keys:** Better for distributed systems, no sequential leaks
2. **Soft Delete:** Preserve data for audit and compliance
3. **Optimistic Locking:** Prevent race conditions with version column
4. **Timezone-Aware Timestamps:** UTC storage for global operations
5. **BIGINT for Money:** Store in minor units (kobo/cents) to avoid floating point errors
6. **JSONB for Metadata:** Flexible schema for provider-specific data

**Index Strategy:**
- Primary keys: Automatic B-tree index
- Foreign keys: Explicit indexes for join performance
- Status fields: Index for filtered queries
- Composite indexes: For common query patterns (user_id + currency, user_id + status)
- Unique indexes: For business constraints (email, phone_number, reference)

---

#### Tasks Breakdown

---

### Task: TASK-1.1.1.1 - Create Base Entity ✅

**Task ID:** TASK-1.1.1.1
**Parent Story:** US-1.1.1
**Story Points:** 2
**Assignee:** [Developer]
**Status:** ✅ Completed

**Description:**
Create abstract BaseEntity class that all other entities will extend.

**File Location:**
`libs/database/src/entities/base.entity.ts`

**Implementation:**
```typescript
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
} from 'typeorm';

/**
 * Base entity with common fields for all entities
 *
 * @property id - Unique identifier (UUID v4)
 * @property created_at - Record creation timestamp
 * @property updated_at - Last update timestamp
 * @property deleted_at - Soft delete timestamp (null if active)
 * @property version - Optimistic locking version number
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deleted_at: Date | null;

  @VersionColumn({ default: 0 })
  version: number;
}
```

**Acceptance Criteria:**
- [x] BaseEntity class created as abstract
- [x] UUID primary key with auto-generation
- [x] All timestamps use `timestamp with time zone`
- [x] Soft delete column included
- [x] Version column for optimistic locking
- [x] JSDoc comments added
- [x] Exported from index.ts

**Testing:**
- [x] TypeScript compilation succeeds
- [x] Entity can be extended by child classes
- [x] Default values work correctly

---

### Task: TASK-1.1.1.2 - Create User Entity

**Task ID:** TASK-1.1.1.2
**Parent Story:** US-1.1.1
**Story Points:** 3
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create User entity for authentication and user management.

**File Location:**
`libs/database/src/entities/user.entity.ts`

**Schema:**
```typescript
import { Entity, Column, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserStatus, KYCStatus } from '@libs/shared/enums';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['phone_number'], { unique: true })
@Index(['referral_code'], { unique: true })
@Index(['status'])
@Index(['kyc_tier'])
export class User extends BaseEntity {
  // Authentication
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone_number: string | null;

  @Column({ type: 'text' })
  password_hash: string; // Will be encrypted with FieldEncryptionTransformer

  // Profile
  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date | null;

  @Column({ type: 'varchar', length: 2 }) // ISO 3166-1 alpha-2
  country_code: string;

  // Status & Verification
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({ type: 'boolean', default: false })
  phone_verified: boolean;

  // KYC
  @Column({ type: 'int', default: 0 }) // 0: Unverified, 1: Basic, 2: Intermediate, 3: Advanced
  kyc_tier: number;

  @Column({
    type: 'enum',
    enum: KYCStatus,
    default: KYCStatus.PENDING,
  })
  kyc_status: KYCStatus;

  // MFA
  @Column({ type: 'boolean', default: false })
  mfa_enabled: boolean;

  @Column({ type: 'text', nullable: true })
  mfa_secret: string | null; // Will be encrypted

  // Security
  @Column({ type: 'timestamp with time zone', nullable: true })
  last_login_at: Date | null;

  @Column({ type: 'varchar', length: 45, nullable: true }) // IPv4 or IPv6
  last_login_ip: string | null;

  @Column({ type: 'int', default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  locked_until: Date | null;

  @Column({ type: 'text', nullable: true })
  pin_hash: string | null; // Transaction PIN, will be encrypted

  // Referral
  @Column({ type: 'varchar', length: 20, unique: true })
  referral_code: string;

  @Column({ type: 'uuid', nullable: true })
  referred_by_id: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'referred_by_id' })
  referrer: User;

  // Relationships
  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => Card, (card) => card.user)
  cards: Card[];

  @OneToMany(() => BankAccount, (bankAccount) => bankAccount.user)
  bank_accounts: BankAccount[];

  @OneToMany(() => KYCDocument, (doc) => doc.user)
  kyc_documents: KYCDocument[];

  @OneToMany(() => Transaction, (txn) => txn.user)
  transactions: Transaction[];
}
```

**Acceptance Criteria:**
- [ ] All fields defined with correct types
- [ ] Enums imported from `@libs/shared/enums`
- [ ] Indexes created on: email, phone_number, referral_code, status, kyc_tier
- [ ] Unique constraints on: email, phone_number, referral_code
- [ ] Relationships defined: wallets, cards, bank_accounts, kyc_documents, transactions
- [ ] Default values set: status (ACTIVE), kyc_tier (0), email_verified (false)
- [ ] Nullable fields properly marked
- [ ] Entity extends BaseEntity
- [ ] TypeScript compilation succeeds

**Testing Checklist:**
- [ ] Create user with required fields
- [ ] Verify unique constraints (email, phone_number)
- [ ] Test soft delete
- [ ] Test version increment on update
- [ ] Test relationships (wallets, cards)
- [ ] Test enum values

**Definition of Done:**
- [ ] Entity file created
- [ ] All fields implemented
- [ ] Indexes applied
- [ ] Relationships working
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Merged to main branch

---

### Task: TASK-1.1.1.3 - Create Wallet Entity

**Task ID:** TASK-1.1.1.3
**Parent Story:** US-1.1.1
**Story Points:** 2
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create Wallet entity for multi-currency balance management.

**File Location:**
`libs/database/src/entities/wallet.entity.ts`

**Schema:**
```typescript
import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn, Check } from 'typeorm';
import { BaseEntity } from './base.entity';
import { WalletStatus } from '@libs/shared/enums';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { LedgerEntry } from './ledger-entry.entity';

@Entity('wallets')
@Index(['user_id'])
@Index(['user_id', 'currency'], { unique: true }) // One wallet per currency per user
@Index(['status'])
@Check('available_balance <= ledger_balance')
@Check('available_balance >= 0')
@Check('ledger_balance >= 0')
@Check('pending_balance >= 0')
export class Wallet extends BaseEntity {
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 3 }) // ISO 4217: NGN, USD, GBP, EUR
  currency: string;

  @Column({ type: 'bigint', default: 0 })
  available_balance: string; // Stored as string to handle BIGINT

  @Column({ type: 'bigint', default: 0 })
  ledger_balance: string;

  @Column({ type: 'bigint', default: 0 })
  pending_balance: string;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.ACTIVE,
  })
  status: WalletStatus;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean; // Primary wallet for the currency

  // Relationships
  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Transaction, (txn) => txn.source_wallet)
  outgoing_transactions: Transaction[];

  @OneToMany(() => Transaction, (txn) => txn.destination_wallet)
  incoming_transactions: Transaction[];

  @OneToMany(() => LedgerEntry, (entry) => entry.wallet)
  ledger_entries: LedgerEntry[];
}
```

**Business Rules:**
1. Each user can have multiple wallets (one per currency)
2. `available_balance` <= `ledger_balance` (always)
3. `available_balance` = `ledger_balance` - `pending_balance`
4. All balances stored as BIGINT in minor units:
   - NGN: kobo (1 NGN = 100 kobo)
   - USD: cents (1 USD = 100 cents)
   - GBP: pence (1 GBP = 100 pence)
   - EUR: cent (1 EUR = 100 cent)
5. Balances cannot be negative
6. Only one wallet can be primary per currency per user

**Acceptance Criteria:**
- [ ] All fields defined
- [ ] Unique constraint: (user_id + currency)
- [ ] Check constraints for balance rules
- [ ] Indexes on user_id and status
- [ ] BIGINT type for all balance fields
- [ ] Relationships: user, transactions (source/destination), ledger_entries
- [ ] Default values set
- [ ] Entity extends BaseEntity

**Testing Checklist:**
- [ ] Create wallet with valid data
- [ ] Verify unique constraint (user + currency)
- [ ] Test balance constraints (available <= ledger)
- [ ] Test BIGINT handling
- [ ] Test relationships
- [ ] Test soft delete

**Definition of Done:**
- [ ] Entity file created
- [ ] All fields and constraints implemented
- [ ] Relationships working
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Merged to main branch

---

### Task: TASK-1.1.1.4 - Create Transaction Entity

**Task ID:** TASK-1.1.1.4
**Parent Story:** US-1.1.1
**Story Points:** 3
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create Transaction entity for all financial transactions.

**File Location:**
`libs/database/src/entities/transaction.entity.ts`

**Schema:**
```typescript
import { Entity, Column, Index, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TransactionType, TransactionCategory, TransactionStatus } from '@libs/shared/enums';
import { User } from './user.entity';
import { Wallet } from './wallet.entity';
import { LedgerEntry } from './ledger-entry.entity';

@Entity('transactions')
@Index(['reference'], { unique: true })
@Index(['user_id'])
@Index(['idempotency_key'], { unique: true })
@Index(['status'])
@Index(['type'])
@Index(['category'])
@Index(['created_at'])
@Index(['provider_reference'])
export class Transaction extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  reference: string; // Format: TXN-{timestamp}-{random}

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  source_wallet_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  destination_wallet_id: string | null;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionCategory,
  })
  category: TransactionCategory;

  @Column({ type: 'bigint' })
  amount: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'bigint', default: 0 })
  fee: string;

  @Column({ type: 'bigint', default: 0 })
  tax: string;

  @Column({ type: 'bigint' })
  net_amount: string; // amount - fee - tax

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider_reference: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider_name: string | null;

  @Column({ type: 'text', nullable: true })
  failure_reason: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  reversed_at: Date | null;

  @Column({ type: 'uuid', nullable: true })
  reversal_transaction_id: string | null;

  @Column({ type: 'varchar', length: 36, unique: true })
  idempotency_key: string; // UUID v4

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string | null;

  @Column({ type: 'text', nullable: true })
  user_agent: string | null;

  // Relationships
  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Wallet, (wallet) => wallet.outgoing_transactions, { nullable: true })
  @JoinColumn({ name: 'source_wallet_id' })
  source_wallet: Wallet;

  @ManyToOne(() => Wallet, (wallet) => wallet.incoming_transactions, { nullable: true })
  @JoinColumn({ name: 'destination_wallet_id' })
  destination_wallet: Wallet;

  @OneToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'reversal_transaction_id' })
  reversal_transaction: Transaction;

  @OneToMany(() => LedgerEntry, (entry) => entry.transaction)
  ledger_entries: LedgerEntry[];
}
```

**Reference Format:**
```
TXN-{YYYYMMDD}{HHMMSS}-{RANDOM_6}
Example: TXN-20240115103045-A3F5K9
```

**Acceptance Criteria:**
- [ ] All fields defined with correct types
- [ ] Unique constraints: reference, idempotency_key
- [ ] Indexes on: reference, user_id, status, type, category, created_at, provider_reference
- [ ] Enums imported from shared library
- [ ] JSONB metadata for flexible data
- [ ] Relationships: user, source_wallet, destination_wallet, ledger_entries
- [ ] Nullable fields properly marked
- [ ] Default values set
- [ ] Entity extends BaseEntity

**Testing Checklist:**
- [ ] Create transaction with required fields
- [ ] Verify unique constraints
- [ ] Test JSONB metadata
- [ ] Test relationships
- [ ] Test status transitions
- [ ] Test soft delete
- [ ] Test optimistic locking

**Definition of Done:**
- [ ] Entity file created
- [ ] All fields implemented
- [ ] Indexes applied
- [ ] Relationships working
- [ ] Unit tests written (80% coverage)
- [ ] Code reviewed
- [ ] Merged to main branch

---

### Task: TASK-1.1.1.5 - Create Ledger Entry Entity

**Task ID:** TASK-1.1.1.5
**Parent Story:** US-1.1.1
**Story Points:** 3
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create LedgerEntry entity for double-entry accounting. This is a critical entity for maintaining financial integrity.

**File Location:**
`libs/database/src/entities/ledger-entry.entity.ts`

**Schema:**
```typescript
import { Entity, Column, Index, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { LedgerEntryType } from '@libs/shared/enums';
import { Transaction } from './transaction.entity';
import { Wallet } from './wallet.entity';

@Entity('ledger_entries')
@Index(['transaction_id'])
@Index(['wallet_id'])
@Index(['created_at'])
@Index(['wallet_id', 'created_at']) // For balance history queries
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  transaction_id: string;

  @Column({ type: 'uuid' })
  wallet_id: string;

  @Column({
    type: 'enum',
    enum: LedgerEntryType,
  })
  entry_type: LedgerEntryType; // 'debit' or 'credit'

  @Column({ type: 'bigint' })
  amount: string;

  @Column({ type: 'bigint' })
  balance_before: string;

  @Column({ type: 'bigint' })
  balance_after: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relationships
  @ManyToOne(() => Transaction, (txn) => txn.ledger_entries)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @ManyToOne(() => Wallet, (wallet) => wallet.ledger_entries)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;
}
```

**Key Design Decisions:**
1. **Immutable:** No `updated_at` or `deleted_at` columns
2. **Double-Entry:** Every transaction creates at least 2 entries (debit and credit)
3. **Balance Tracking:** Stores balance before and after each entry
4. **Audit Trail:** Provides complete balance history

**Ledger Entry Rules:**
- **Debit:** Decreases wallet balance (outgoing)
  - `balance_after = balance_before - amount`
- **Credit:** Increases wallet balance (incoming)
  - `balance_after = balance_before + amount`

**Example: P2P Transfer (100 NGN from Alice to Bob)**
```
Entry 1 (Alice's wallet):
- entry_type: DEBIT
- amount: 10000 (100 NGN in kobo)
- balance_before: 50000 (500 NGN)
- balance_after: 40000 (400 NGN)
- description: "Transfer to Bob"

Entry 2 (Bob's wallet):
- entry_type: CREDIT
- amount: 10000 (100 NGN in kobo)
- balance_before: 20000 (200 NGN)
- balance_after: 30000 (300 NGN)
- description: "Transfer from Alice"

Verification: Entry1.amount = Entry2.amount (balance maintained)
```

**Acceptance Criteria:**
- [ ] Entity created with all fields
- [ ] NO `updated_at` or `deleted_at` columns (immutable)
- [ ] Indexes on transaction_id, wallet_id, created_at
- [ ] Composite index on (wallet_id, created_at) for balance queries
- [ ] Relationships to Transaction and Wallet
- [ ] LedgerEntryType enum (debit/credit)
- [ ] BIGINT for all balance fields
- [ ] Description field for audit trail

**Testing Checklist:**
- [ ] Create ledger entries for transaction
- [ ] Verify balance calculations
- [ ] Test double-entry requirement
- [ ] Query balance history
- [ ] Verify immutability (cannot update)
- [ ] Test performance of balance queries

**Balance Query Example:**
```typescript
// Get wallet balance at specific point in time
const balanceAt = await ledgerEntryRepository
  .createQueryBuilder('entry')
  .where('entry.wallet_id = :walletId', { walletId })
  .andWhere('entry.created_at <= :timestamp', { timestamp })
  .orderBy('entry.created_at', 'DESC')
  .limit(1)
  .getOne();

return balanceAt?.balance_after || 0;
```

**Definition of Done:**
- [ ] Entity file created
- [ ] All fields implemented
- [ ] Immutability enforced (no update/delete)
- [ ] Indexes applied
- [ ] Relationships working
- [ ] Balance calculation tested
- [ ] Unit tests written (80% coverage)
- [ ] Code reviewed
- [ ] Merged to main branch

---

### Task: TASK-1.1.1.6 - Create Remaining Entities (Card, BankAccount, Payment, etc.)

**Task ID:** TASK-1.1.1.6
**Parent Story:** US-1.1.1
**Story Points:** 5 (covering all remaining entities)
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create the remaining 11 entities: Card, BankAccount, Payment, Transfer, Refund, Dispute, KYCDocument, FraudAlert, Webhook, APIKey, AuditLog.

**Files to Create:**

1. `card.entity.ts`
2. `bank-account.entity.ts`
3. `payment.entity.ts`
4. `transfer.entity.ts`
5. `refund.entity.ts`
6. `dispute.entity.ts`
7. `kyc-document.entity.ts`
8. `fraud-alert.entity.ts`
9. `webhook.entity.ts`
10. `api-key.entity.ts`
11. `audit-log.entity.ts`

**Acceptance Criteria:**
- [ ] All 11 entity files created
- [ ] All entities extend BaseEntity (except AuditLog - immutable)
- [ ] Proper relationships defined
- [ ] Sensitive fields marked for encryption (card_number, account_number)
- [ ] Indexes on foreign keys and query fields
- [ ] Enums imported from shared library
- [ ] All entities exported from index.ts

**Detailed specifications for each entity will be provided in separate task breakdowns if needed.**

**Definition of Done:**
- [ ] All entity files created
- [ ] TypeScript compilation succeeds
- [ ] Basic CRUD operations tested
- [ ] Relationships verified
- [ ] Unit tests written
- [ ] Code reviewed
- [ ] Merged to main branch

---

## Summary of Tasks for US-1.1.1

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-1.1.1.1 | Create Base Entity | 2 | ✅ Completed |
| TASK-1.1.1.2 | Create User Entity | 3 | 🔄 To Do |
| TASK-1.1.1.3 | Create Wallet Entity | 2 | 🔄 To Do |
| TASK-1.1.1.4 | Create Transaction Entity | 3 | 🔄 To Do |
| TASK-1.1.1.5 | Create Ledger Entry Entity | 3 | 🔄 To Do |
| TASK-1.1.1.6 | Create Remaining Entities | 5 | 🔄 To Do |
| **Total** | | **18** | |

**Note:** Total is 18 SP but user story is estimated at 13 SP. This is normal - task-level estimation is more detailed. Use user story points for sprint planning.

---

# Continuation of Sprint 1 backlog...

_(Due to length, I'll create this as the first section. The remaining user stories US-1.1.2, US-1.1.3, FEATURE-1.2, FEATURE-1.3, and FEATURE-1.4 would follow the same detailed format with:_
- _User story with business value_
- _Acceptance criteria (functional and non-functional)_
- _Technical specifications_
- _Request/Response schemas where applicable_
- _Task breakdown with implementation details_
- _Testing checklist_
- _Definition of done)_

Would you like me to continue with the remaining features for Sprint 1, or would you prefer I create similar detailed breakdowns for other sprints?

---

## Sprint 1 Velocity Tracking

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

## Sprint Ceremonies

### Sprint Planning
**Date:** [To be scheduled]
**Duration:** 2 hours
**Attendees:** Developer (acting as PO, SM, and Dev)
**Outcome:** Sprint backlog defined, commitment made

### Daily Standup
**Time:** 9:00 AM daily
**Duration:** 15 minutes (self-reflection)
**Questions:**
1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers?

### Sprint Review
**Date:** [End of Sprint 1]
**Duration:** 1 hour
**Demo:** Show completed features to stakeholders (self-demo for portfolio)

### Sprint Retrospective
**Date:** [End of Sprint 1]
**Duration:** 1 hour
**Questions:**
1. What went well?
2. What didn't go well?
3. What can be improved?
4. Action items for next sprint

---

## Definition of Done (Story Level)

A user story is considered "Done" when:

**Code Complete:**
- [ ] All acceptance criteria met
- [ ] Code written following best practices
- [ ] No compiler errors or warnings
- [ ] Code formatted and linted

**Testing:**
- [ ] Unit tests written (80% coverage minimum)
- [ ] Integration tests written for API endpoints
- [ ] All tests passing
- [ ] Manual testing completed

**Documentation:**
- [ ] Code comments added where necessary
- [ ] API documentation updated (Swagger)
- [ ] README updated if needed
- [ ] Database schema documented

**Review:**
- [ ] Code self-reviewed
- [ ] No security vulnerabilities
- [ ] Performance acceptable

**Deployment:**
- [ ] Changes merged to main branch
- [ ] Database migrations run successfully
- [ ] No breaking changes in API

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-1.1 | Database schema changes require migration rollback | Medium | High | Test migrations thoroughly, keep rollback scripts |
| RISK-1.2 | Performance issues with large datasets | Low | High | Add proper indexes, test with seed data |
| RISK-1.3 | Encryption overhead impacts performance | Medium | Medium | Benchmark encryption, optimize if needed |
| RISK-1.4 | JWT token expiry too short/long | Low | Medium | Make configurable, test with real usage |

---

## Notes & Decisions

**Technical Decisions:**
1. **TypeORM over Prisma:** Better for complex queries and migrations
2. **UUID over Integer IDs:** Better security, no sequential ID leaks
3. **BIGINT for money:** Avoid floating point errors
4. **Soft delete:** Preserve data for compliance and audit

**Open Questions:**
1. ❓ Should we implement database read replicas in Sprint 1? **Decision: No, defer to performance sprint**
2. ❓ Token expiry: 1 hour or 15 minutes? **Decision: 1 hour for better UX**

---

This detailed backlog provides everything you need to start Sprint 1 with clarity on what needs to be done, how to do it, and what "done" looks like. Would you like me to create similar detailed backlogs for other sprints or expand on any specific user story?
