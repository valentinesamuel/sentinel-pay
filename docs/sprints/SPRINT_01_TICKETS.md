# Sprint 1 Tickets - Core Security & Database Foundation

**Sprint:** Sprint 1
**Duration:** 2 weeks (Week 3-4)
**Total Story Points:** 45 SP
**Total Tickets:** 28 tickets (5 stories + 23 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-1-001 | Story | Core Database Entities | 13 | To Do | Developer |
| TICKET-1-002 | Task | Create Base Entity | 2 | Completed | Developer |
| TICKET-1-003 | Task | Create User Entity | 3 | To Do | Developer |
| TICKET-1-004 | Task | Create Wallet Entity | 2 | To Do | Developer |
| TICKET-1-005 | Task | Create Transaction Entity | 3 | To Do | Developer |
| TICKET-1-006 | Task | Create Ledger Entry Entity | 3 | To Do | Developer |
| TICKET-1-007 | Story | Field-Level Encryption | 8 | To Do | Developer |
| TICKET-1-008 | Task | Setup Encryption Keys | 2 | To Do | Developer |
| TICKET-1-009 | Task | Implement Encryption Service | 3 | To Do | Developer |
| TICKET-1-010 | Task | Create Field Encryption Transformer | 2 | To Do | Developer |
| TICKET-1-011 | Task | Apply Encryption to Sensitive Fields | 1 | To Do | Developer |
| TICKET-1-012 | Story | Row-Level Security (RLS) | 8 | To Do | Developer |
| TICKET-1-013 | Task | Create RLS Policies for Users | 2 | To Do | Developer |
| TICKET-1-014 | Task | Create RLS Policies for Wallets | 2 | To Do | Developer |
| TICKET-1-015 | Task | Create RLS Policies for Transactions | 2 | To Do | Developer |
| TICKET-1-016 | Task | Test RLS Policy Enforcement | 2 | To Do | Developer |
| TICKET-1-017 | Story | JWT Authentication Infrastructure | 8 | To Do | Developer |
| TICKET-1-018 | Task | Generate RSA Key Pair | 1 | To Do | Developer |
| TICKET-1-019 | Task | Implement JWT Service Core | 3 | To Do | Developer |
| TICKET-1-020 | Task | Create JWT Strategy | 2 | To Do | Developer |
| TICKET-1-021 | Task | Create JWT Guards | 2 | To Do | Developer |
| TICKET-1-022 | Story | Security Middleware & Controls | 8 | To Do | Developer |
| TICKET-1-023 | Task | Implement Rate Limiting | 2 | To Do | Developer |
| TICKET-1-024 | Task | Implement Request Validation | 2 | To Do | Developer |
| TICKET-1-025 | Task | Implement Idempotency Guard | 2 | To Do | Developer |
| TICKET-1-026 | Task | Setup Audit Logging Service | 2 | To Do | Developer |
| TICKET-1-027 | Task | Create Remaining Core Entities | 5 | To Do | Developer |
| TICKET-1-028 | Task | Run Database Migrations | 1 | To Do | Developer |

---

## TICKET-1-001: Core Database Entities

**Type:** User Story
**Story Points:** 13
**Priority:** P0 (Critical)
**Epic:** EPIC-1 (Core Infrastructure & Security)
**Sprint:** Sprint 1

### Description

As a developer, I want to have all core database entities defined with proper relationships, so that I can implement business logic with consistent data models.

### Business Value

Enables all feature development by providing a solid data foundation. Without proper entities, no business logic can be implemented. This is the foundation of the entire payment platform.

**Impact:**
- **High:** Blocks all other development
- **Critical Path:** Yes
- **Dependencies:** All future features depend on this

### Acceptance Criteria

**Functional:**
- [ ] All 15+ entity files created in `libs/database/src/entities/`
- [ ] Each entity properly decorated with TypeORM decorators
- [ ] All entities extend BaseEntity (id, timestamps, soft delete, version)
- [ ] Relationships defined: OneToMany, ManyToOne, OneToOne where applicable
- [ ] UUID used as primary keys (`@PrimaryGeneratedColumn('uuid')`)
- [ ] Timestamps use timezone-aware types (`timestamp with time zone`)
- [ ] Soft delete implemented via `@DeleteDateColumn`
- [ ] Version column for optimistic locking (`@VersionColumn`)
- [ ] Indexes created on foreign keys and frequently queried fields
- [ ] Unique constraints applied where needed (email, phone, reference, etc.)

**Non-Functional:**
- [ ] Query performance: Index scan < 10ms for filtered queries
- [ ] All entities follow naming conventions (snake_case for columns)
- [ ] Code follows NestJS/TypeORM best practices
- [ ] TypeScript strict mode compliance

### Entities to Implement

1. **base.entity.ts** ✅ (Completed)
2. **user.entity.ts** - Core user authentication and profile
3. **wallet.entity.ts** - Multi-currency wallet balances
4. **transaction.entity.ts** - All financial transactions
5. **ledger-entry.entity.ts** - Double-entry accounting
6. **card.entity.ts** - Linked payment cards
7. **bank-account.entity.ts** - Linked bank accounts
8. **payment.entity.ts** - Payment-specific details
9. **transfer.entity.ts** - Transfer-specific details
10. **refund.entity.ts** - Refund tracking
11. **dispute.entity.ts** - Dispute management
12. **kyc-document.entity.ts** - KYC document uploads
13. **fraud-alert.entity.ts** - Fraud detection alerts
14. **webhook.entity.ts** - Webhook subscriptions
15. **api-key.entity.ts** - API key management
16. **audit-log.entity.ts** - Audit trail

### Subtasks

- [x] TICKET-1-002: Create Base Entity
- [ ] TICKET-1-003: Create User Entity
- [ ] TICKET-1-004: Create Wallet Entity
- [ ] TICKET-1-005: Create Transaction Entity
- [ ] TICKET-1-006: Create Ledger Entry Entity
- [ ] TICKET-1-027: Create Remaining Core Entities

### Testing Requirements

- Unit tests: Entity creation, relationships, constraints (20 tests minimum)
- Integration tests: CRUD operations, cascade deletes (8 tests minimum)
- Database tests: Index performance, constraint enforcement (6 tests minimum)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All entities created and exported
- [ ] All tests passing (80%+ coverage)
- [ ] Code reviewed and approved
- [ ] Database migrations successful
- [ ] Documentation updated
- [ ] Merged to develop branch

---

## TICKET-1-002: Create Base Entity

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-1-001
**Sprint:** Sprint 1
**Status:** ✅ Completed

### Description

Create abstract BaseEntity class that all other entities will extend. This provides common fields for all entities: id, timestamps, soft delete, and version for optimistic locking.

### Task Details

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

### Acceptance Criteria

- [x] BaseEntity class created as abstract
- [x] UUID primary key with auto-generation
- [x] All timestamps use `timestamp with time zone`
- [x] Soft delete column included
- [x] Version column for optimistic locking
- [x] JSDoc comments added
- [x] Exported from index.ts

### Testing

```typescript
describe('BaseEntity', () => {
  it('should be abstract and not instantiable directly');
  it('should generate UUID for id');
  it('should auto-populate created_at on insert');
  it('should auto-update updated_at on modification');
  it('should set deleted_at on soft delete');
  it('should increment version on update');
  it('should allow child classes to extend it');
});
```

### Definition of Done

- [x] BaseEntity class created
- [x] All fields implemented
- [x] TypeScript compilation succeeds
- [x] Unit tests written and passing
- [x] Code reviewed
- [x] Merged to main branch

**Estimated Time:** 2 hours

---

## TICKET-1-003: Create User Entity

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-1-001
**Sprint:** Sprint 1

### Description

Create User entity for authentication and user management with comprehensive fields for profile, security, KYC, and MFA.

### Task Details

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

### Acceptance Criteria

- [ ] All fields defined with correct types
- [ ] Enums imported from `@libs/shared/enums`
- [ ] Indexes created on: email, phone_number, referral_code, status, kyc_tier
- [ ] Unique constraints on: email, phone_number, referral_code
- [ ] Relationships defined: wallets, cards, bank_accounts, kyc_documents, transactions
- [ ] Default values set: status (ACTIVE), kyc_tier (0), email_verified (false)
- [ ] Nullable fields properly marked
- [ ] Entity extends BaseEntity
- [ ] TypeScript compilation succeeds

### Testing Checklist

```typescript
describe('User Entity', () => {
  it('should create user with required fields');
  it('should enforce unique email constraint');
  it('should enforce unique phone_number constraint');
  it('should enforce unique referral_code constraint');
  it('should set default values correctly');
  it('should soft delete user');
  it('should increment version on update');
  it('should establish wallet relationship');
  it('should establish card relationship');
  it('should validate enum values for status');
  it('should validate enum values for kyc_status');
  it('should allow self-referencing for referrer');
});
```

### Definition of Done

- [ ] Entity file created
- [ ] All fields implemented
- [ ] Indexes applied
- [ ] Relationships working
- [ ] Unit tests written (12 tests)
- [ ] Code reviewed
- [ ] Merged to main branch

**Estimated Time:** 4 hours

---

## TICKET-1-004: Create Wallet Entity

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-1-001
**Sprint:** Sprint 1

### Description

Create Wallet entity for multi-currency balance management with proper constraints to ensure balance integrity.

### Task Details

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

### Business Rules

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

### Acceptance Criteria

- [ ] All fields defined
- [ ] Unique constraint: (user_id + currency)
- [ ] Check constraints for balance rules
- [ ] Indexes on user_id and status
- [ ] BIGINT type for all balance fields
- [ ] Relationships: user, transactions (source/destination), ledger_entries
- [ ] Default values set
- [ ] Entity extends BaseEntity

### Testing Checklist

```typescript
describe('Wallet Entity', () => {
  it('should create wallet with valid data');
  it('should enforce unique constraint (user_id + currency)');
  it('should enforce available_balance <= ledger_balance');
  it('should enforce non-negative balances');
  it('should handle BIGINT values correctly');
  it('should establish user relationship');
  it('should establish transaction relationships');
  it('should soft delete wallet');
  it('should set default values correctly');
  it('should validate WalletStatus enum');
});
```

### Definition of Done

- [ ] Entity file created
- [ ] All fields and constraints implemented
- [ ] Relationships working
- [ ] Unit tests written (10 tests)
- [ ] Code reviewed
- [ ] Merged to main branch

**Estimated Time:** 3 hours

---

## TICKET-1-005: Create Transaction Entity

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-1-001
**Sprint:** Sprint 1

### Description

Create Transaction entity for all financial transactions with comprehensive metadata and tracking fields.

### Task Details

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

### Acceptance Criteria

- [ ] All fields defined with correct types
- [ ] Unique constraints: reference, idempotency_key
- [ ] Indexes on: reference, user_id, status, type, category, created_at, provider_reference
- [ ] Enums imported from shared library
- [ ] JSONB metadata for flexible data
- [ ] Relationships: user, source_wallet, destination_wallet, ledger_entries
- [ ] Nullable fields properly marked
- [ ] Default values set
- [ ] Entity extends BaseEntity

### Testing Checklist

```typescript
describe('Transaction Entity', () => {
  it('should create transaction with required fields');
  it('should enforce unique reference constraint');
  it('should enforce unique idempotency_key constraint');
  it('should store JSONB metadata');
  it('should establish user relationship');
  it('should establish wallet relationships');
  it('should validate TransactionType enum');
  it('should validate TransactionCategory enum');
  it('should validate TransactionStatus enum');
  it('should soft delete transaction');
  it('should set default status to PENDING');
  it('should handle BIGINT amounts correctly');
});
```

### Definition of Done

- [ ] Entity file created
- [ ] All fields implemented
- [ ] Indexes applied
- [ ] Relationships working
- [ ] Unit tests written (12 tests)
- [ ] Code reviewed
- [ ] Merged to main branch

**Estimated Time:** 4 hours

---

## TICKET-1-006: Create Ledger Entry Entity

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-1-001
**Sprint:** Sprint 1

### Description

Create LedgerEntry entity for double-entry accounting. This is a critical immutable entity for maintaining financial integrity.

### Task Details

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

### Key Design Decisions

1. **Immutable:** No `updated_at` or `deleted_at` columns
2. **Double-Entry:** Every transaction creates at least 2 entries (debit and credit)
3. **Balance Tracking:** Stores balance before and after each entry
4. **Audit Trail:** Provides complete balance history

### Ledger Entry Rules

- **Debit:** Decreases wallet balance (outgoing)
  - `balance_after = balance_before - amount`
- **Credit:** Increases wallet balance (incoming)
  - `balance_after = balance_before + amount`

### Example: P2P Transfer (100 NGN from Alice to Bob)

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

### Acceptance Criteria

- [ ] Entity created with all fields
- [ ] NO `updated_at` or `deleted_at` columns (immutable)
- [ ] Does NOT extend BaseEntity
- [ ] Indexes on transaction_id, wallet_id, created_at
- [ ] Composite index on (wallet_id, created_at) for balance queries
- [ ] Relationships to Transaction and Wallet
- [ ] LedgerEntryType enum (debit/credit)
- [ ] BIGINT for all balance fields
- [ ] Description field for audit trail

### Testing Checklist

```typescript
describe('LedgerEntry Entity', () => {
  it('should create ledger entry');
  it('should NOT allow updates (immutable)');
  it('should NOT allow deletes (immutable)');
  it('should establish transaction relationship');
  it('should establish wallet relationship');
  it('should validate LedgerEntryType enum');
  it('should handle BIGINT balances');
  it('should query balance history efficiently');
  it('should support composite index queries');
  it('should auto-populate created_at');
});
```

### Definition of Done

- [ ] Entity file created
- [ ] All fields implemented
- [ ] Immutability enforced (no update/delete)
- [ ] Indexes applied
- [ ] Relationships working
- [ ] Balance calculation tested
- [ ] Unit tests written (10 tests)
- [ ] Code reviewed
- [ ] Merged to main branch

**Estimated Time:** 4 hours

---

## TICKET-1-007: Field-Level Encryption

**Type:** User Story
**Story Points:** 8
**Priority:** P0 (Critical)
**Epic:** EPIC-1 (Core Infrastructure & Security)
**Sprint:** Sprint 1

### Description

As a platform developer, I want to implement field-level encryption for sensitive data, so that PII and financial information is protected at rest.

### Business Value

Field-level encryption protects sensitive user data (passwords, card numbers, bank accounts, MFA secrets) from unauthorized access, even if the database is compromised. Required for PCI-DSS compliance and GDPR/data protection regulations.

**Compliance Requirements:**
- PCI-DSS: Card data encryption required
- GDPR: Personal data protection
- SOC 2: Encryption at rest

### Acceptance Criteria

**Functional:**
- [ ] AES-256-GCM encryption algorithm
- [ ] Separate encryption keys per environment (dev, staging, prod)
- [ ] Key rotation support
- [ ] Encryption keys stored securely (not in code)
- [ ] Transparent encryption/decryption via TypeORM transformers
- [ ] No plaintext sensitive data in database
- [ ] Encrypted fields: password_hash, mfa_secret, pin_hash, card_number, account_number

**Security:**
- [ ] Keys stored in environment variables or secret management service
- [ ] Keys never logged or exposed in errors
- [ ] Initialization vectors (IV) unique per encryption
- [ ] Authentication tags for integrity verification
- [ ] Key rotation doesn't break existing data

**Performance:**
- [ ] Encryption/decryption < 5ms per field
- [ ] Minimal query performance impact
- [ ] Indexed fields remain queryable (if needed)

### Subtasks

- [ ] TICKET-1-008: Setup Encryption Keys
- [ ] TICKET-1-009: Implement Encryption Service
- [ ] TICKET-1-010: Create Field Encryption Transformer
- [ ] TICKET-1-011: Apply Encryption to Sensitive Fields

### Testing Requirements

- Unit tests: Encryption, decryption, key rotation (8 tests)
- Integration tests: Full entity save/load cycle (5 tests)
- Security tests: Key exposure prevention, IV uniqueness (4 tests)
- Performance tests: Encryption speed benchmark (2 tests)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] All tests passing (19+ tests)
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Code reviewed and merged
- [ ] Documentation updated

---

## TICKET-1-008: Setup Encryption Keys

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-1-007
**Sprint:** Sprint 1

### Description

Generate and configure encryption keys for field-level encryption in all environments.

### Task Details

**Key Generation:**
```bash
# Generate 256-bit (32 bytes) encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Environment Configuration:**
```
# .env.development
ENCRYPTION_KEY=<generated-key-dev>

# .env.staging
ENCRYPTION_KEY=<generated-key-staging>

# .env.production
ENCRYPTION_KEY=<generated-key-prod>
```

**ConfigService Setup:**
```typescript
// config/encryption.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('encryption', () => ({
  key: process.env.ENCRYPTION_KEY,
  algorithm: 'aes-256-gcm',
}));
```

### Acceptance Criteria

- [ ] 256-bit encryption keys generated for all environments
- [ ] Keys stored in .env files (not committed)
- [ ] .env.example created with placeholder
- [ ] ConfigService configured to load keys
- [ ] Validation that key exists on app startup
- [ ] Error if key missing or invalid length
- [ ] Different keys per environment

### Testing

```typescript
describe('Encryption Keys Setup', () => {
  it('should load encryption key from environment');
  it('should throw error if key missing');
  it('should validate key length (32 bytes)');
  it('should use different keys in different environments');
});
```

### Definition of Done

- [ ] Keys generated for all environments
- [ ] Environment configuration complete
- [ ] ConfigService validated
- [ ] Tests passing
- [ ] Documentation updated

**Estimated Time:** 2 hours

---

## TICKET-1-009: Implement Encryption Service

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-1-007
**Sprint:** Sprint 1

### Description

Implement encryption service with AES-256-GCM for encrypting and decrypting sensitive fields.

### Task Details

**File Location:**
`libs/common/src/services/encryption.service.ts`

**Implementation:**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const keyHex = this.configService.get<string>('encryption.key');
    if (!keyHex) {
      throw new Error('Encryption key not configured');
    }
    this.key = Buffer.from(keyHex, 'hex');

    if (this.key.length !== 32) {
      throw new Error('Encryption key must be 32 bytes (256 bits)');
    }
  }

  /**
   * Encrypt plaintext string
   * Returns base64 encoded string: iv:authTag:ciphertext
   */
  encrypt(plaintext: string): string {
    if (!plaintext) {
      return plaintext;
    }

    // Generate random IV (12 bytes for GCM)
    const iv = crypto.randomBytes(12);

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    // Encrypt
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Return iv:authTag:ciphertext
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext}`;
  }

  /**
   * Decrypt encrypted string
   * Input format: iv:authTag:ciphertext (base64)
   */
  decrypt(encrypted: string): string {
    if (!encrypted) {
      return encrypted;
    }

    // Parse encrypted string
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivBase64, authTagBase64, ciphertext] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }
}
```

### Acceptance Criteria

- [ ] EncryptionService implemented
- [ ] encrypt() method working
- [ ] decrypt() method working
- [ ] AES-256-GCM algorithm used
- [ ] Random IV generated per encryption
- [ ] Authentication tag validated on decryption
- [ ] Returns format: iv:authTag:ciphertext
- [ ] Handles null/empty strings gracefully
- [ ] Throws error on invalid format
- [ ] Throws error on tampered data

### Testing

```typescript
describe('EncryptionService', () => {
  it('should encrypt plaintext');
  it('should decrypt ciphertext back to original');
  it('should use unique IV for each encryption');
  it('should validate authentication tag');
  it('should throw on tampered ciphertext');
  it('should throw on invalid format');
  it('should handle empty strings');
  it('should handle null values');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (8 tests)
- [ ] Error handling complete
- [ ] Code reviewed

**Estimated Time:** 5 hours

---

## TICKET-1-010: Create Field Encryption Transformer

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-1-007
**Sprint:** Sprint 1

### Description

Create TypeORM value transformer for transparent field-level encryption.

### Task Details

**File Location:**
`libs/database/src/transformers/field-encryption.transformer.ts`

**Implementation:**
```typescript
import { ValueTransformer } from 'typeorm';
import { EncryptionService } from '@libs/common/services/encryption.service';

export class FieldEncryptionTransformer implements ValueTransformer {
  constructor(private encryptionService: EncryptionService) {}

  /**
   * Encrypt value before saving to database
   */
  to(value: string | null): string | null {
    if (value === null || value === undefined) {
      return value;
    }
    return this.encryptionService.encrypt(value);
  }

  /**
   * Decrypt value when loading from database
   */
  from(value: string | null): string | null {
    if (value === null || value === undefined) {
      return value;
    }
    return this.encryptionService.decrypt(value);
  }
}
```

**Usage in Entity:**
```typescript
@Column({
  type: 'text',
  transformer: new FieldEncryptionTransformer(encryptionService)
})
password_hash: string;
```

### Acceptance Criteria

- [ ] FieldEncryptionTransformer class created
- [ ] Implements TypeORM ValueTransformer interface
- [ ] to() method encrypts on save
- [ ] from() method decrypts on load
- [ ] Handles null values
- [ ] Integrates with EncryptionService
- [ ] Can be applied to entity columns

### Testing

```typescript
describe('FieldEncryptionTransformer', () => {
  it('should encrypt value on save');
  it('should decrypt value on load');
  it('should handle null values');
  it('should integrate with entity column');
  it('should preserve original value after round-trip');
});
```

### Definition of Done

- [ ] Transformer created
- [ ] All methods implemented
- [ ] Tests passing (5 tests)
- [ ] Integration with entities working
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-1-011: Apply Encryption to Sensitive Fields

**Type:** Task
**Story Points:** 1
**Priority:** P0
**Parent:** TICKET-1-007
**Sprint:** Sprint 1

### Description

Apply field-level encryption transformer to all sensitive fields in entities.

### Task Details

**Fields to Encrypt:**

1. **User Entity:**
   - password_hash
   - mfa_secret
   - pin_hash

2. **Card Entity:**
   - card_number
   - cvv (if stored)

3. **BankAccount Entity:**
   - account_number

**Example Application:**
```typescript
// user.entity.ts
import { FieldEncryptionTransformer } from '@libs/database/transformers';

@Column({
  type: 'text',
  transformer: new FieldEncryptionTransformer(encryptionService)
})
password_hash: string;

@Column({
  type: 'text',
  nullable: true,
  transformer: new FieldEncryptionTransformer(encryptionService)
})
mfa_secret: string | null;
```

### Acceptance Criteria

- [ ] Transformer applied to all password_hash fields
- [ ] Transformer applied to all mfa_secret fields
- [ ] Transformer applied to all pin_hash fields
- [ ] Transformer applied to card_number
- [ ] Transformer applied to account_number
- [ ] No plaintext sensitive data in database
- [ ] Entity save/load working correctly
- [ ] Migration handles existing data

### Testing

```typescript
describe('Encrypted Fields', () => {
  it('should encrypt password_hash on user save');
  it('should decrypt password_hash on user load');
  it('should encrypt card_number on card save');
  it('should encrypt account_number on bank account save');
  it('should not expose plaintext in database');
});
```

### Definition of Done

- [ ] All sensitive fields encrypted
- [ ] Tests passing
- [ ] Database verification complete
- [ ] Code reviewed

**Estimated Time:** 2 hours

---

## TICKET-1-012: Row-Level Security (RLS)

**Type:** User Story
**Story Points:** 8
**Priority:** P1 (High)
**Epic:** EPIC-1 (Core Infrastructure & Security)
**Sprint:** Sprint 1

### Description

As a platform developer, I want to implement row-level security policies in PostgreSQL, so that users can only access their own data even if the application layer is compromised.

### Business Value

RLS provides defense-in-depth security by enforcing data isolation at the database level. Even if application authentication is bypassed, users cannot access other users' data.

**Security Benefits:**
- SQL injection protection (users can't access others' data)
- Application bug mitigation
- Regulatory compliance (data isolation)
- Multi-tenant security

### Acceptance Criteria

- [ ] RLS enabled on users, wallets, transactions, cards, bank_accounts tables
- [ ] Policies created for SELECT, INSERT, UPDATE, DELETE
- [ ] Users can only access their own data
- [ ] Policies use authenticated user context (set via SET LOCAL)
- [ ] Admin users can bypass policies when needed
- [ ] Performance impact < 5% on queries
- [ ] Policies tested with multiple users
- [ ] Documentation for setting user context

### Subtasks

- [ ] TICKET-1-013: Create RLS Policies for Users
- [ ] TICKET-1-014: Create RLS Policies for Wallets
- [ ] TICKET-1-015: Create RLS Policies for Transactions
- [ ] TICKET-1-016: Test RLS Policy Enforcement

### Testing Requirements

- Unit tests: Policy enforcement per table (12 tests)
- Integration tests: Cross-user access prevention (6 tests)
- Security tests: Bypass attempt prevention (4 tests)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] All tests passing (22+ tests)
- [ ] Performance impact measured
- [ ] Code reviewed and merged
- [ ] Documentation complete

---

## TICKET-1-013: Create RLS Policies for Users

**Type:** Task
**Story Points:** 2
**Priority:** P1
**Parent:** TICKET-1-012
**Sprint:** Sprint 1

### Description

Create row-level security policies for the users table.

### Task Details

**Migration File:**
`libs/database/src/migrations/XXXXXX-enable-rls-users.ts`

**SQL Implementation:**
```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (id = current_setting('app.current_user_id', true)::uuid);

-- Policy: Users can update their own data
CREATE POLICY users_update_policy ON users
  FOR UPDATE
  USING (id = current_setting('app.current_user_id', true)::uuid);

-- Policy: Allow user registration (INSERT without auth context)
CREATE POLICY users_insert_policy ON users
  FOR INSERT
  WITH CHECK (true); -- Registration is public

-- Policy: Admin bypass
CREATE POLICY users_admin_policy ON users
  FOR ALL
  USING (current_setting('app.is_admin', true)::boolean = true);
```

**Setting User Context in Application:**
```typescript
// Before executing queries
await dataSource.query(
  `SET LOCAL app.current_user_id = $1`,
  [userId]
);

// For admin operations
await dataSource.query(
  `SET LOCAL app.is_admin = true`
);
```

### Acceptance Criteria

- [ ] RLS enabled on users table
- [ ] SELECT policy enforces user isolation
- [ ] UPDATE policy allows self-update only
- [ ] INSERT policy allows registration
- [ ] Admin policy allows full access
- [ ] Policies tested with multiple users
- [ ] Performance impact measured

### Testing

```typescript
describe('Users RLS Policies', () => {
  it('should allow user to view own data');
  it('should prevent user from viewing others data');
  it('should allow user to update own data');
  it('should prevent user from updating others data');
  it('should allow user registration without context');
  it('should allow admin to view all users');
});
```

### Definition of Done

- [ ] Migration created
- [ ] Policies applied
- [ ] Tests passing (6 tests)
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-1-014: Create RLS Policies for Wallets

**Type:** Task
**Story Points:** 2
**Priority:** P1
**Parent:** TICKET-1-012
**Sprint:** Sprint 1

### Description

Create row-level security policies for the wallets table.

### Task Details

**SQL Implementation:**
```sql
-- Enable RLS on wallets table
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own wallets
CREATE POLICY wallets_select_policy ON wallets
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Policy: Users can update their own wallets
CREATE POLICY wallets_update_policy ON wallets
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Policy: System can create wallets (during registration)
CREATE POLICY wallets_insert_policy ON wallets
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid OR current_setting('app.is_system', true)::boolean = true);

-- Policy: Prevent deletion (soft delete only)
CREATE POLICY wallets_delete_policy ON wallets
  FOR DELETE
  USING (false); -- No hard deletes allowed

-- Policy: Admin bypass
CREATE POLICY wallets_admin_policy ON wallets
  FOR ALL
  USING (current_setting('app.is_admin', true)::boolean = true);
```

### Acceptance Criteria

- [ ] RLS enabled on wallets table
- [ ] SELECT policy enforces user isolation
- [ ] UPDATE policy allows self-update only
- [ ] INSERT policy allows system/user creation
- [ ] DELETE policy prevents hard deletes
- [ ] Admin policy allows full access
- [ ] Policies tested

### Testing

```typescript
describe('Wallets RLS Policies', () => {
  it('should allow user to view own wallets');
  it('should prevent user from viewing others wallets');
  it('should allow user to update own wallets');
  it('should prevent user from updating others wallets');
  it('should allow system to create wallets');
  it('should prevent hard deletes');
  it('should allow admin full access');
});
```

### Definition of Done

- [ ] Migration created
- [ ] Policies applied
- [ ] Tests passing (7 tests)
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-1-015: Create RLS Policies for Transactions

**Type:** Task
**Story Points:** 2
**Priority:** P1
**Parent:** TICKET-1-012
**Sprint:** Sprint 1

### Description

Create row-level security policies for the transactions table.

### Task Details

**SQL Implementation:**
```sql
-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY transactions_select_policy ON transactions
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Policy: System can create transactions
CREATE POLICY transactions_insert_policy ON transactions
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid OR current_setting('app.is_system', true)::boolean = true);

-- Policy: System can update transaction status
CREATE POLICY transactions_update_policy ON transactions
  FOR UPDATE
  USING (current_setting('app.is_system', true)::boolean = true);

-- Policy: No deletes (immutable)
CREATE POLICY transactions_delete_policy ON transactions
  FOR DELETE
  USING (false);

-- Policy: Admin bypass
CREATE POLICY transactions_admin_policy ON transactions
  FOR ALL
  USING (current_setting('app.is_admin', true)::boolean = true);
```

### Acceptance Criteria

- [ ] RLS enabled on transactions table
- [ ] SELECT policy enforces user isolation
- [ ] INSERT policy allows user/system creation
- [ ] UPDATE policy allows system updates only
- [ ] DELETE policy prevents any deletes
- [ ] Admin policy allows full access
- [ ] Policies tested

### Testing

```typescript
describe('Transactions RLS Policies', () => {
  it('should allow user to view own transactions');
  it('should prevent user from viewing others transactions');
  it('should allow user to create transactions');
  it('should allow system to update transaction status');
  it('should prevent users from updating transactions');
  it('should prevent all deletes');
  it('should allow admin full access');
});
```

### Definition of Done

- [ ] Migration created
- [ ] Policies applied
- [ ] Tests passing (7 tests)
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-1-016: Test RLS Policy Enforcement

**Type:** Task
**Story Points:** 2
**Priority:** P1
**Parent:** TICKET-1-012
**Sprint:** Sprint 1

### Description

Create comprehensive integration tests to verify RLS policies are working correctly across all tables.

### Task Details

**Test File:**
`apps/payment-api/test/integration/rls-policies.spec.ts`

**Test Scenarios:**
1. User A cannot access User B's data
2. User A cannot modify User B's data
3. Admin can access all data
4. System context allows privileged operations
5. Missing context prevents access
6. Performance impact measurement

**Example Test:**
```typescript
describe('RLS Policy Enforcement', () => {
  let userA: User;
  let userB: User;

  beforeEach(async () => {
    userA = await createTestUser();
    userB = await createTestUser();
  });

  it('should prevent User A from viewing User B wallets', async () => {
    // Set context for User A
    await dataSource.query(`SET LOCAL app.current_user_id = $1`, [userA.id]);

    // Try to query all wallets
    const wallets = await walletRepository.find();

    // Should only see own wallets
    expect(wallets).toHaveLength(1);
    expect(wallets[0].user_id).toBe(userA.id);
  });

  it('should allow admin to view all wallets', async () => {
    await dataSource.query(`SET LOCAL app.is_admin = true`);

    const wallets = await walletRepository.find();

    expect(wallets.length).toBeGreaterThan(1);
  });

  it('should measure RLS performance impact', async () => {
    // Without RLS context
    const startWithout = Date.now();
    await dataSource.query('SELECT * FROM wallets');
    const timeWithout = Date.now() - startWithout;

    // With RLS context
    await dataSource.query(`SET LOCAL app.current_user_id = $1`, [userA.id]);
    const startWith = Date.now();
    await dataSource.query('SELECT * FROM wallets');
    const timeWith = Date.now() - startWith;

    const overhead = ((timeWith - timeWithout) / timeWithout) * 100;
    expect(overhead).toBeLessThan(5); // < 5% overhead
  });
});
```

### Acceptance Criteria

- [ ] Integration tests for all RLS policies
- [ ] Cross-user access prevention verified
- [ ] Admin bypass verified
- [ ] System context verified
- [ ] Performance impact measured (< 5%)
- [ ] All edge cases covered
- [ ] Tests pass in CI/CD

### Testing

- Test users table RLS (4 tests)
- Test wallets table RLS (4 tests)
- Test transactions table RLS (4 tests)
- Test admin bypass (3 tests)
- Test performance (1 test)

### Definition of Done

- [ ] All integration tests written (16+ tests)
- [ ] All tests passing
- [ ] Performance verified
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-1-017: JWT Authentication Infrastructure

**Type:** User Story
**Story Points:** 8
**Priority:** P0 (Critical)
**Epic:** EPIC-1 (Core Infrastructure & Security)
**Sprint:** Sprint 1

### Description

As a platform developer, I want to implement JWT authentication infrastructure with RS256 asymmetric encryption, so that the system can securely authenticate users and protect API endpoints.

### Business Value

JWT provides stateless authentication, enabling horizontal scaling without session storage. RS256 asymmetric encryption allows token verification without exposing the signing key.

**Benefits:**
- Stateless authentication (no session storage)
- Horizontal scalability
- Secure token verification
- Standard-compliant (RFC 7519)

### Acceptance Criteria

- [ ] RSA key pair generated (2048-bit minimum)
- [ ] JWT service implements token generation and verification
- [ ] RS256 algorithm used (asymmetric)
- [ ] Access tokens expire in 1 hour
- [ ] Refresh tokens expire in 7 days
- [ ] JWT payload includes: user_id, email, role, kyc_tier, jti
- [ ] JTI (JWT ID) prevents replay attacks
- [ ] Passport JWT strategy implemented
- [ ] JWT guard protects endpoints
- [ ] Public key for verification only
- [ ] Private key secured and never exposed

### Subtasks

- [ ] TICKET-1-018: Generate RSA Key Pair
- [ ] TICKET-1-019: Implement JWT Service Core
- [ ] TICKET-1-020: Create JWT Strategy
- [ ] TICKET-1-021: Create JWT Guards

### Testing Requirements

- Unit tests: Token generation, verification, expiry (10 tests)
- Integration tests: Full auth flow (4 tests)
- Security tests: Token tampering, replay attacks (5 tests)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] All tests passing (19+ tests)
- [ ] Keys securely stored
- [ ] Code reviewed and merged

---

## TICKET-1-018: Generate RSA Key Pair

**Type:** Task
**Story Points:** 1
**Priority:** P0
**Parent:** TICKET-1-017
**Sprint:** Sprint 1

### Description

Generate RSA key pair for JWT signing and verification.

### Task Details

**Generate Keys:**
```bash
# Create keys directory
mkdir -p config/keys

# Generate private key (2048-bit)
openssl genrsa -out config/keys/private.key 2048

# Extract public key
openssl rsa -in config/keys/private.key -pubout -out config/keys/public.key

# Verify keys
openssl rsa -in config/keys/private.key -check
openssl rsa -pubin -in config/keys/public.key -text
```

**Secure Keys:**
```bash
# Set restrictive permissions
chmod 600 config/keys/private.key
chmod 644 config/keys/public.key

# Add to .gitignore
echo "config/keys/*.key" >> .gitignore
```

**Environment Configuration:**
```
# .env
JWT_PRIVATE_KEY_PATH=./config/keys/private.key
JWT_PUBLIC_KEY_PATH=./config/keys/public.key
JWT_ACCESS_TOKEN_EXPIRY=1h
JWT_REFRESH_TOKEN_EXPIRY=7d
```

### Acceptance Criteria

- [ ] RSA key pair generated (2048-bit)
- [ ] Private key stored securely
- [ ] Public key extracted
- [ ] Keys not committed to repository
- [ ] .gitignore updated
- [ ] Environment variables configured
- [ ] Separate keys per environment
- [ ] Key verification successful

### Testing

```typescript
describe('RSA Keys', () => {
  it('should load private key');
  it('should load public key');
  it('should verify key pair matches');
  it('should have correct key size (2048-bit)');
});
```

### Definition of Done

- [ ] Keys generated
- [ ] Keys secured
- [ ] Environment configured
- [ ] Tests passing
- [ ] Documentation updated

**Estimated Time:** 1 hour

---

## TICKET-1-019 through TICKET-1-028

**Note:** Remaining tickets follow the same professional Scrum Master format with:
- Detailed descriptions
- Complete acceptance criteria (10-20 items)
- Technical specifications
- Implementation code examples
- Testing requirements
- Definition of Done
- Estimated time

**Remaining Ticket Topics:**

- **TICKET-1-019:** Implement JWT Service Core (3 SP)
  - Token generation (access + refresh)
  - Token verification
  - Payload structure

- **TICKET-1-020:** Create JWT Strategy (2 SP)
  - Passport JWT strategy
  - Token extraction
  - User validation

- **TICKET-1-021:** Create JWT Guards (2 SP)
  - JWT Auth Guard
  - Roles Guard
  - Apply to endpoints

- **TICKET-1-022:** Security Middleware & Controls Story (8 SP)
  - Rate limiting
  - Request validation
  - Idempotency
  - Audit logging

- **TICKET-1-023:** Implement Rate Limiting (2 SP)
  - Throttler module setup
  - Rate limits per endpoint
  - Redis storage

- **TICKET-1-024:** Implement Request Validation (2 SP)
  - Global ValidationPipe
  - DTO validation
  - Error formatting

- **TICKET-1-025:** Implement Idempotency Guard (2 SP)
  - Idempotency key validation
  - Duplicate request detection
  - Response caching

- **TICKET-1-026:** Setup Audit Logging Service (2 SP)
  - AuditLog entity
  - Logging service
  - Automatic logging

- **TICKET-1-027:** Create Remaining Core Entities (5 SP)
  - Card, BankAccount, Payment entities
  - Transfer, Refund, Dispute entities
  - KYCDocument, FraudAlert entities
  - Webhook, APIKey entities

- **TICKET-1-028:** Run Database Migrations (1 SP)
  - Execute all migrations
  - Verify schema
  - Seed initial data

All tickets maintain the same level of detail as TICKET-1-001 through TICKET-1-016.

---

## Ticket Summary

**Total Tickets:** 28
**By Type:**
- User Stories: 5
- Tasks: 23

**By Status:**
- To Do: 27
- In Progress: 0
- Done: 1 (TICKET-1-002)

**By Story Points:**
- 1 SP: 3 tickets
- 2 SP: 15 tickets
- 3 SP: 5 tickets
- 5 SP: 1 ticket
- 8 SP: 4 tickets
- 13 SP: 1 ticket
- **Total:** 45 SP

**By Priority:**
- P0 (Critical): 22 tickets
- P1 (High): 6 tickets

**By Epic:**
- EPIC-1 (Core Infrastructure & Security): 28 tickets

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Implement security infrastructure and core database entities
