# Database Documentation - Payment Platform

**Version:** 1.0.0
**DBMS:** PostgreSQL 15
**ORM:** TypeORM 0.3.17

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Schema Design](#schema-design)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Table Specifications](#table-specifications)
5. [Indexes & Performance](#indexes--performance)
6. [Constraints & Business Rules](#constraints--business-rules)
7. [Security](#security)
8. [Migrations](#migrations)
9. [Backup & Recovery](#backup--recovery)
10. [Query Examples](#query-examples)

---

## Database Overview

### Database Configuration

**Connection Details:**
- **Host:** localhost (dev) / postgres (docker)
- **Port:** 5432
- **Database:** payment_db
- **User:** payment_user
- **SSL:** Required in production
- **Encoding:** UTF8
- **Timezone:** UTC

### Key Design Principles

1. **Normalization:** 3NF (Third Normal Form)
2. **Data Integrity:** Foreign keys, check constraints
3. **Auditing:** Timestamps on all tables
4. **Soft Deletes:** Preserve data for compliance
5. **Optimistic Locking:** Version column for concurrency
6. **UUID Primary Keys:** Security and distributed systems
7. **Double-Entry Accounting:** Financial accuracy

### Database Statistics

| Metric | Value |
|--------|-------|
| Total Tables | 16+ |
| Total Indexes | 50+ |
| Estimated Row Growth | 1M rows/year (transactions) |
| Database Size (Year 1) | ~50 GB |
| Connection Pool | 20 connections max |

---

## Schema Design

### Core Entities

```
User (Authentication & Profile)
  ├── Wallet (Multi-currency balances)
  │     ├── LedgerEntry (Double-entry accounting)
  │     └── Transaction (Financial transactions)
  │           ├── Payment (Payment details)
  │           ├── Transfer (Transfer details)
  │           └── Refund (Refund tracking)
  ├── Card (Linked payment cards)
  ├── BankAccount (Linked bank accounts)
  ├── KYCDocument (Verification documents)
  └── FraudAlert (Fraud detection alerts)

Dispute (Dispute management)
Webhook (Webhook subscriptions)
APIKey (API key management)
AuditLog (Audit trail)
```

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐
│    Users     │───────│   Wallets    │
│              │ 1   * │              │
│ - id (PK)    │       │ - id (PK)    │
│ - email      │       │ - user_id(FK)│
│ - password   │       │ - currency   │
│ - kyc_tier   │       │ - balance    │
└──────┬───────┘       └──────┬───────┘
       │                      │
       │ 1                    │ 1
       │                      │
       │ *                    │ *
┌──────▼───────┐       ┌─────▼────────┐
│Transactions  │───────│ LedgerEntry  │
│              │ 1   * │              │
│ - id (PK)    │       │ - id (PK)    │
│ - reference  │       │ - txn_id(FK) │
│ - amount     │       │ - wallet(FK) │
│ - status     │       │ - type       │
└──────┬───────┘       │ - amount     │
       │               └──────────────┘
       │
   ┌───┴───┬───────┐
   │       │       │
┌──▼──┐ ┌─▼───┐ ┌─▼────┐
│Payment│Transfer│Refund│
└──────┘ └─────┘ └──────┘
```

---

## Table Specifications

### 1. Users Table

**Purpose:** Store user authentication and profile information

**Table:** `users`

**Schema:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  password_hash TEXT NOT NULL, -- Encrypted

  -- Profile
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  country_code VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2

  -- Status & Verification
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,

  -- KYC
  kyc_tier INTEGER DEFAULT 0, -- 0: Unverified, 1-3: Tiers
  kyc_status VARCHAR(20) DEFAULT 'pending',

  -- MFA
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT, -- Encrypted

  -- Security
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_login_ip VARCHAR(45),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  pin_hash TEXT, -- Encrypted, for transaction PIN

  -- Referral
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_by_id UUID REFERENCES users(id),

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 0,

  CONSTRAINT users_status_check CHECK (status IN ('active', 'suspended', 'closed')),
  CONSTRAINT users_kyc_tier_check CHECK (kyc_tier BETWEEN 0 AND 3)
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_phone ON users(phone_number);
CREATE UNIQUE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_kyc_tier ON users(kyc_tier);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Relationships:**
- `users.referred_by_id` → `users.id` (self-referential)
- One-to-Many → Wallets, Cards, BankAccounts, Transactions

**Business Rules:**
- Email and phone must be unique
- Password must be hashed (bcrypt, 12 rounds)
- MFA secret encrypted (AES-256-GCM)
- PIN hashed separately from password
- Failed login attempts reset after successful login
- Account locked for 30 minutes after 5 failed attempts

---

### 2. Wallets Table

**Purpose:** Multi-currency wallet balances

**Table:** `wallets`

**Schema:**
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  currency VARCHAR(3) NOT NULL, -- ISO 4217

  -- Balances (in minor units: kobo, cents)
  available_balance BIGINT DEFAULT 0,
  ledger_balance BIGINT DEFAULT 0,
  pending_balance BIGINT DEFAULT 0,

  status VARCHAR(20) DEFAULT 'active',
  is_primary BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 0,

  CONSTRAINT wallets_user_currency_unique UNIQUE (user_id, currency),
  CONSTRAINT wallets_status_check CHECK (status IN ('active', 'suspended', 'closed')),
  CONSTRAINT wallets_balance_check CHECK (available_balance <= ledger_balance),
  CONSTRAINT wallets_available_balance_check CHECK (available_balance >= 0),
  CONSTRAINT wallets_ledger_balance_check CHECK (ledger_balance >= 0),
  CONSTRAINT wallets_pending_balance_check CHECK (pending_balance >= 0)
);

-- Indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE UNIQUE INDEX idx_wallets_user_currency ON wallets(user_id, currency);
CREATE INDEX idx_wallets_status ON wallets(status);
```

**Relationships:**
- `wallets.user_id` → `users.id`
- One-to-Many → Transactions, LedgerEntries

**Business Rules:**
- One wallet per currency per user
- `available_balance` = `ledger_balance` - `pending_balance`
- Balances stored in minor units (kobo for NGN, cents for USD)
- All balances must be non-negative
- Available balance cannot exceed ledger balance

**Supported Currencies:**
- NGN (Nigerian Naira) - 100 kobo = 1 NGN
- USD (US Dollar) - 100 cents = 1 USD
- GBP (British Pound) - 100 pence = 1 GBP
- EUR (Euro) - 100 cent = 1 EUR

---

### 3. Transactions Table

**Purpose:** Record all financial transactions

**Table:** `transactions`

**Schema:**
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference VARCHAR(50) UNIQUE NOT NULL, -- TXN-{timestamp}-{random}

  -- Ownership
  user_id UUID NOT NULL REFERENCES users(id),
  source_wallet_id UUID REFERENCES wallets(id),
  destination_wallet_id UUID REFERENCES wallets(id),

  -- Transaction Details
  type VARCHAR(30) NOT NULL, -- payment, transfer, refund, etc.
  category VARCHAR(50) NOT NULL, -- p2p, card_payment, etc.

  -- Financial
  amount BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  fee BIGINT DEFAULT 0,
  tax BIGINT DEFAULT 0,
  net_amount BIGINT NOT NULL, -- amount - fee - tax

  -- Status
  status VARCHAR(20) DEFAULT 'pending',

  -- Metadata
  description TEXT,
  metadata JSONB,

  -- Provider
  provider_reference VARCHAR(100),
  provider_name VARCHAR(50),
  failure_reason TEXT,

  -- Timestamps
  completed_at TIMESTAMP WITH TIME ZONE,
  reversed_at TIMESTAMP WITH TIME ZONE,
  reversal_transaction_id UUID REFERENCES transactions(id),

  -- Idempotency
  idempotency_key VARCHAR(36) UNIQUE NOT NULL,

  -- Request Context
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 0,

  CONSTRAINT txn_status_check CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'reversed'
  )),
  CONSTRAINT txn_amount_check CHECK (amount > 0),
  CONSTRAINT txn_fee_check CHECK (fee >= 0),
  CONSTRAINT txn_tax_check CHECK (tax >= 0)
);

-- Indexes
CREATE UNIQUE INDEX idx_txn_reference ON transactions(reference);
CREATE UNIQUE INDEX idx_txn_idempotency ON transactions(idempotency_key);
CREATE INDEX idx_txn_user_id ON transactions(user_id);
CREATE INDEX idx_txn_status ON transactions(status);
CREATE INDEX idx_txn_type ON transactions(type);
CREATE INDEX idx_txn_category ON transactions(category);
CREATE INDEX idx_txn_created_at ON transactions(created_at);
CREATE INDEX idx_txn_provider_ref ON transactions(provider_reference);
CREATE INDEX idx_txn_user_status ON transactions(user_id, status);
```

**Relationships:**
- `transactions.user_id` → `users.id`
- `transactions.source_wallet_id` → `wallets.id`
- `transactions.destination_wallet_id` → `wallets.id`
- `transactions.reversal_transaction_id` → `transactions.id` (self-referential)
- One-to-One → Payment, Transfer, Refund
- One-to-Many → LedgerEntries

**Business Rules:**
- Reference format: `TXN-{YYYYMMDD}{HHMMSS}-{RANDOM_6}`
- Amount must be positive
- Idempotency key must be unique (UUID v4)
- Completed transactions cannot be modified
- Reversals create new transactions

---

### 4. Ledger Entries Table

**Purpose:** Double-entry accounting ledger

**Table:** `ledger_entries`

**Schema:**
```sql
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  wallet_id UUID NOT NULL REFERENCES wallets(id),

  entry_type VARCHAR(10) NOT NULL, -- debit, credit
  amount BIGINT NOT NULL,
  balance_before BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,

  description TEXT NOT NULL,

  -- NO updated_at or deleted_at (immutable)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT ledger_entry_type_check CHECK (entry_type IN ('debit', 'credit')),
  CONSTRAINT ledger_amount_check CHECK (amount > 0),
  CONSTRAINT ledger_balance_check CHECK (balance_after >= 0)
);

-- Indexes
CREATE INDEX idx_ledger_txn ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_wallet ON ledger_entries(wallet_id);
CREATE INDEX idx_ledger_created ON ledger_entries(created_at);
CREATE INDEX idx_ledger_wallet_created ON ledger_entries(wallet_id, created_at);
```

**Relationships:**
- `ledger_entries.transaction_id` → `transactions.id`
- `ledger_entries.wallet_id` → `wallets.id`

**Business Rules:**
- **Immutable:** No updates or deletes allowed
- **Double-Entry:** Every transaction creates at least 2 entries
- **Balance Calculation:**
  - Debit: `balance_after = balance_before - amount`
  - Credit: `balance_after = balance_before + amount`
- **Verification:** Sum of all debits = Sum of all credits (for each transaction)

**Example: P2P Transfer (100 NGN)**
```sql
-- Transaction: Alice sends 100 NGN to Bob

-- Entry 1: Alice's wallet (debit)
INSERT INTO ledger_entries VALUES (
  uuid(), txn_id, alice_wallet_id,
  'debit', 10000, 50000, 40000,
  'Transfer to Bob', NOW()
);

-- Entry 2: Bob's wallet (credit)
INSERT INTO ledger_entries VALUES (
  uuid(), txn_id, bob_wallet_id,
  'credit', 10000, 20000, 30000,
  'Transfer from Alice', NOW()
);

-- Verification: debit_sum (10000) = credit_sum (10000) ✓
```

---

### 5. Cards Table

**Purpose:** Store linked payment cards

**Table:** `cards`

**Schema:**
```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Card Details (encrypted)
  card_number TEXT NOT NULL, -- Encrypted, stored as token
  cvv TEXT, -- Encrypted, optional

  -- Card Info
  last4 VARCHAR(4) NOT NULL,
  brand VARCHAR(20) NOT NULL, -- visa, mastercard, verve
  card_type VARCHAR(10), -- debit, credit
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  cardholder_name VARCHAR(100) NOT NULL,

  -- Billing Address
  billing_address JSONB,

  -- Status
  status VARCHAR(20) DEFAULT 'active',
  is_default BOOLEAN DEFAULT FALSE,

  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 0,

  CONSTRAINT cards_status_check CHECK (status IN ('active', 'expired', 'blocked')),
  CONSTRAINT cards_exp_month_check CHECK (exp_month BETWEEN 1 AND 12),
  CONSTRAINT cards_exp_year_check CHECK (exp_year >= EXTRACT(YEAR FROM NOW()))
);

-- Indexes
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_last4 ON cards(last4);
CREATE INDEX idx_cards_status ON cards(status);
```

**Security:**
- `card_number` encrypted with AES-256-GCM
- `cvv` encrypted or not stored (PCI-DSS)
- Only `last4` digits stored in plaintext

---

### 6. Bank Accounts Table

**Purpose:** Store linked bank accounts

**Table:** `bank_accounts`

**Schema:**
```sql
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Bank Details
  account_number TEXT NOT NULL, -- Encrypted
  account_name VARCHAR(255) NOT NULL,
  bank_code VARCHAR(10) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  is_default BOOLEAN DEFAULT FALSE,

  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_method VARCHAR(20), -- micro_deposit, instant

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 0,

  CONSTRAINT bank_status_check CHECK (status IN ('pending', 'verified', 'failed', 'blocked'))
);

-- Indexes
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_status ON bank_accounts(status);
```

**Security:**
- `account_number` encrypted with AES-256-GCM

---

### 7. Audit Logs Table

**Purpose:** Complete audit trail

**Table:** `audit_logs`

**Schema:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),

  -- Action Details
  action VARCHAR(50) NOT NULL, -- LOGIN, PAYMENT_CREATED, etc.
  resource VARCHAR(50) NOT NULL, -- User, Payment, Transfer
  resource_id UUID,

  -- Changes
  old_value JSONB,
  new_value JSONB,

  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- NO updated_at or deleted_at (immutable)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Partitioning (future)
-- Partition by month for performance
```

**Business Rules:**
- **Immutable:** No updates or deletes
- **Retention:** 7 years (compliance)
- **Partitioning:** By month (for performance)

---

## Indexes & Performance

### Index Strategy

**Primary Indexes:**
- All primary keys (UUID) have automatic B-tree index
- All foreign keys have explicit indexes

**Query Indexes:**
- Status fields (frequently filtered)
- Timestamp fields (for range queries)
- User IDs (for user-specific queries)
- Unique constraints (email, phone, reference)

**Composite Indexes:**
```sql
-- Common query patterns
CREATE INDEX idx_wallets_user_currency ON wallets(user_id, currency);
CREATE INDEX idx_txn_user_status ON transactions(user_id, status);
CREATE INDEX idx_ledger_wallet_created ON ledger_entries(wallet_id, created_at);
```

### Query Performance Targets

| Query Type | Target | Strategy |
|------------|--------|----------|
| User lookup by email | < 5ms | Index scan |
| Wallet balance query | < 10ms | Index scan |
| Transaction list (paginated) | < 50ms | Index scan + limit |
| Ledger balance calculation | < 100ms | Index scan |
| Full transaction search | < 200ms | Multi-column index |

### Performance Optimization

1. **Connection Pooling:**
   ```typescript
   // TypeORM config
   max: 20,        // Max connections
   min: 5,         // Min connections
   idle: 30000,    // Idle timeout
   acquire: 10000, // Acquire timeout
   ```

2. **Query Caching:**
   ```typescript
   // Cache frequently accessed data
   cache: {
     type: 'redis',
     duration: 30000, // 30 seconds
   }
   ```

3. **Prepared Statements:**
   - TypeORM uses parameterized queries (SQL injection protection + performance)

4. **Pagination:**
   ```sql
   SELECT * FROM transactions
   WHERE user_id = $1
   ORDER BY created_at DESC
   LIMIT $2 OFFSET $3;
   ```

---

## Constraints & Business Rules

### Check Constraints

```sql
-- Balance validation
CONSTRAINT wallets_balance_check CHECK (available_balance <= ledger_balance);

-- Amount validation
CONSTRAINT txn_amount_check CHECK (amount > 0);

-- Status validation
CONSTRAINT users_status_check CHECK (status IN ('active', 'suspended', 'closed'));

-- KYC tier validation
CONSTRAINT users_kyc_tier_check CHECK (kyc_tier BETWEEN 0 AND 3);
```

### Foreign Key Constraints

```sql
-- Cascade on delete (soft delete via application)
ALTER TABLE wallets
  ADD CONSTRAINT fk_wallets_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE RESTRICT;

-- Prevent orphaned records
ALTER TABLE transactions
  ADD CONSTRAINT fk_txn_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE RESTRICT;
```

### Unique Constraints

```sql
-- Email uniqueness
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- One wallet per currency per user
ALTER TABLE wallets ADD CONSTRAINT wallets_user_currency_unique
  UNIQUE (user_id, currency);

-- Transaction reference uniqueness
ALTER TABLE transactions ADD CONSTRAINT txn_reference_unique
  UNIQUE (reference);
```

---

## Security

### Row-Level Security (RLS)

**Enable RLS on sensitive tables:**

```sql
-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own wallets
CREATE POLICY wallet_select_policy ON wallets
FOR SELECT
USING (user_id = current_setting('app.current_user_id')::uuid);

-- Policy: Users can only update their own wallets
CREATE POLICY wallet_update_policy ON wallets
FOR UPDATE
USING (user_id = current_setting('app.current_user_id')::uuid);

-- Set user context (in application)
SET app.current_user_id = 'user-uuid';
```

### Encryption

**Encrypted Fields:**
- `users.password_hash` - bcrypt
- `users.mfa_secret` - AES-256-GCM
- `users.pin_hash` - bcrypt
- `cards.card_number` - AES-256-GCM + tokenization
- `cards.cvv` - AES-256-GCM (or not stored)
- `bank_accounts.account_number` - AES-256-GCM

**SSL/TLS Connection:**
```typescript
// TypeORM config
ssl: {
  rejectUnauthorized: true,
  ca: fs.readFileSync('./certs/ca-cert.pem').toString(),
}
```

---

## Migrations

### Migration Strategy

**Tool:** TypeORM migrations

**Naming Convention:**
```
{timestamp}-{description}.ts

Examples:
20240115100000-InitialSchema.ts
20240115110000-AddKYCTier.ts
20240115120000-CreateLedgerEntries.ts
```

### Generate Migration

```bash
# Generate from entity changes
npm run migration:generate -- src/migrations/AddNewField

# Create empty migration
npm run migration:create -- src/migrations/UpdateIndexes
```

### Run Migrations

```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Migration Best Practices

1. **Always Test Rollback:**
   ```typescript
   export class AddKYCTier1699564800 implements MigrationInterface {
     public async up(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(`ALTER TABLE users ADD COLUMN kyc_tier INTEGER DEFAULT 0`);
     }

     public async down(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(`ALTER TABLE users DROP COLUMN kyc_tier`);
     }
   }
   ```

2. **Add Indexes Concurrently:**
   ```sql
   CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
   ```

3. **Backup Before Migration:**
   ```bash
   pg_dump payment_db > backup_$(date +%Y%m%d).sql
   npm run migration:run
   ```

---

## Backup & Recovery

### Backup Strategy

**Frequency:**
- **Full Backup:** Daily (3 AM UTC)
- **Incremental:** Every 6 hours
- **WAL Archiving:** Continuous

**Retention:**
- **Daily Backups:** 30 days
- **Weekly Backups:** 12 weeks
- **Monthly Backups:** 12 months
- **Yearly Backups:** 7 years (compliance)

### Backup Commands

```bash
# Full backup
pg_dump -h localhost -U payment_user -F c -f payment_db_$(date +%Y%m%d).backup payment_db

# Backup with compression
pg_dump -h localhost -U payment_user payment_db | gzip > payment_db_$(date +%Y%m%d).sql.gz

# Restore from backup
pg_restore -h localhost -U payment_user -d payment_db payment_db_20240115.backup
```

### Point-in-Time Recovery (PITR)

```bash
# Enable WAL archiving in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /archive/%f'

# Restore to specific point in time
recovery_target_time = '2024-01-15 10:30:00'
```

---

## Query Examples

### Get User with Wallets

```sql
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.kyc_tier,
  json_agg(
    json_build_object(
      'id', w.id,
      'currency', w.currency,
      'balance', w.available_balance
    )
  ) AS wallets
FROM users u
LEFT JOIN wallets w ON w.user_id = u.id
WHERE u.id = $1
GROUP BY u.id;
```

### Calculate Wallet Balance from Ledger

```sql
-- Get current balance
SELECT
  wallet_id,
  balance_after AS current_balance
FROM ledger_entries
WHERE wallet_id = $1
ORDER BY created_at DESC
LIMIT 1;

-- Get balance at specific time
SELECT
  wallet_id,
  balance_after AS balance_at_time
FROM ledger_entries
WHERE wallet_id = $1
  AND created_at <= $2
ORDER BY created_at DESC
LIMIT 1;
```

### Transaction Summary by User

```sql
SELECT
  user_id,
  COUNT(*) AS total_transactions,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_count,
  SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS total_volume
FROM transactions
WHERE user_id = $1
  AND created_at >= $2
GROUP BY user_id;
```

### Double-Entry Verification

```sql
-- Verify ledger balance for transaction
SELECT
  transaction_id,
  SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END) AS total_debits,
  SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END) AS total_credits,
  SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE -amount END) AS net_balance
FROM ledger_entries
WHERE transaction_id = $1
GROUP BY transaction_id
HAVING SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE -amount END) = 0;
-- Should return row with net_balance = 0
```

---

## Database Maintenance

### Vacuum & Analyze

```sql
-- Analyze tables for query planner
ANALYZE users;
ANALYZE transactions;

-- Vacuum to reclaim space
VACUUM ANALYZE;

-- Full vacuum (requires table lock)
VACUUM FULL;
```

### Reindexing

```sql
-- Rebuild index
REINDEX INDEX idx_users_email;

-- Rebuild all indexes on table
REINDEX TABLE transactions;
```

### Monitor Table Size

```sql
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
```

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Next Review:** After Sprint 4
