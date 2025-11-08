# Sprint 6A Tickets - Mock Card Issuance Service Foundation

**Sprint:** Sprint 6A
**Duration:** Week 13A-14A (2 weeks)
**Sprint Goal:** Build production-grade mock card issuance service
**Total Story Points:** 48

---

## Sprint Backlog

### 🎯 Epic: EPIC-17 - Mock Provider Service
**Total Points:** 48

---

## 📋 User Story: US-6A.1.1 - Mock Virtual Card Issuance (13 SP)

### Tasks

#### TASK-6A.1.1.1: Implement Card Number Generator with Luhn Algorithm (3 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Implement card number generation using Luhn algorithm for Visa, Mastercard, and Verve cards.

**Acceptance Criteria:**
- [ ] CardNumberGenerator class created
- [ ] Luhn algorithm implementation
- [ ] Support for Visa (16 digits), Mastercard (16 digits), Verve (19 digits)
- [ ] BIN (Bank Identification Number) configuration
- [ ] Card number validation method
- [ ] 100% test coverage for Luhn algorithm

**Files to Create:**
- `libs/card-provider/src/utils/card-number-generator.ts`
- `libs/card-provider/src/utils/card-number-generator.spec.ts`

**Test Cases:**
- Generate 1,000 card numbers and validate all pass Luhn check
- Verify BIN prefix correctness for each brand
- Test validation rejects invalid card numbers
- Test edge cases (short/long numbers)

---

#### TASK-6A.1.1.2: Implement CVV and Expiry Date Generators (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Create utilities for CVV generation (3 digits for Visa/MC, 4 for Amex) and expiry date calculation.

**Acceptance Criteria:**
- [ ] CVVGenerator class created
- [ ] 3-digit CVV for Visa/Mastercard/Verve
- [ ] 4-digit CVV for Amex
- [ ] ExpiryDateGenerator class created
- [ ] Default 3-year expiry from issuance
- [ ] Expiry validation method
- [ ] Unit tests for both generators

**Files to Create:**
- `libs/card-provider/src/utils/cvv-generator.ts`
- `libs/card-provider/src/utils/expiry-date-generator.ts`
- Test files

---

#### TASK-6A.1.1.3: Create Card Entity and Database Schema (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Design and implement card entity with proper encryption fields.

**Acceptance Criteria:**
- [ ] Card entity created with TypeORM
- [ ] Fields: id, user_id, wallet_id, encrypted_pan, encrypted_cvv, last_four_digits
- [ ] Expiry month/year fields
- [ ] Status enum (active, frozen, blocked, terminated)
- [ ] Spending limit fields (daily, monthly, per-transaction)
- [ ] Card type (virtual/physical), card brand
- [ ] Timestamps (created_at, frozen_at, terminated_at)
- [ ] Database migration created
- [ ] Indexes on user_id, wallet_id, last_four_digits

**Files to Create:**
- `apps/wallet-service/src/cards/entities/card.entity.ts`
- `apps/wallet-service/src/database/migrations/YYYYMMDDHHMMSS-create-cards-table.ts`

**Schema:**
```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  card_type VARCHAR(20) NOT NULL, -- VIRTUAL, PHYSICAL
  card_brand VARCHAR(20) NOT NULL, -- VISA, MASTERCARD, VERVE
  card_name VARCHAR(100),
  encrypted_pan TEXT NOT NULL,
  encrypted_cvv TEXT NOT NULL,
  last_four_digits VARCHAR(4) NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  currency VARCHAR(3) NOT NULL,
  spending_limit_daily BIGINT NOT NULL,
  spending_limit_monthly BIGINT NOT NULL,
  spending_limit_per_transaction BIGINT NOT NULL,
  blocked_merchant_categories TEXT[],
  is_mock BOOLEAN DEFAULT true,
  provider VARCHAR(50),
  provider_card_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  frozen_at TIMESTAMP,
  terminated_at TIMESTAMP,
  INDEX idx_cards_user_id (user_id),
  INDEX idx_cards_wallet_id (wallet_id),
  INDEX idx_cards_last_four (last_four_digits)
);
```

---

#### TASK-6A.1.1.4: Implement Mock Card Issuance Service (4 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Build the core mock card issuance service with all business logic.

**Acceptance Criteria:**
- [ ] MockCardIssuanceService created
- [ ] issueVirtualCard method implemented
- [ ] Card number generation integration
- [ ] CVV/expiry generation integration
- [ ] Encryption of PAN and CVV
- [ ] Spending limits default configuration
- [ ] Daily card issuance limit (5 per user)
- [ ] Simulated delay (200-500ms)
- [ ] Masked card number response
- [ ] CVV only returned once during issuance
- [ ] Transaction rollback on errors
- [ ] Audit log integration

**Files to Create:**
- `apps/wallet-service/src/cards/services/mock-card-issuance.service.ts`
- `apps/wallet-service/src/cards/services/mock-card-issuance.service.spec.ts`

---

#### TASK-6A.1.1.5: Create Card Issuance Controller and DTOs (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Create REST API endpoint for card issuance with validation.

**Acceptance Criteria:**
- [ ] CardsController created
- [ ] POST /api/v1/cards/virtual/issue endpoint
- [ ] IssueVirtualCardDto with validation
- [ ] JWT authentication guard
- [ ] Rate limiting (5 cards per day per user)
- [ ] Swagger documentation
- [ ] Response transformation (hide sensitive data)
- [ ] Error handling

**Files to Create:**
- `apps/wallet-service/src/cards/controllers/cards.controller.ts`
- `apps/wallet-service/src/cards/dto/issue-virtual-card.dto.ts`
- `apps/wallet-service/src/cards/dto/card-response.dto.ts`

---

#### Subtotal: US-6A.1.1 = 13 SP

---

## 📋 User Story: US-6A.1.2 - Card Lifecycle Management (8 SP)

### Tasks

#### TASK-6A.1.2.1: Implement Card Freeze/Unfreeze (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Implement card freeze and unfreeze operations with status validation.

**Acceptance Criteria:**
- [ ] freezeCard method implemented
- [ ] unfreezeCard method implemented
- [ ] Status validation (can't freeze terminated card)
- [ ] Audit log for freeze/unfreeze actions
- [ ] Update frozen_at timestamp
- [ ] PUT /api/v1/cards/:cardId/freeze endpoint
- [ ] PUT /api/v1/cards/:cardId/unfreeze endpoint
- [ ] Unit tests

---

#### TASK-6A.1.2.2: Implement Spending Limit Updates (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Allow users to update daily, monthly, and per-transaction spending limits.

**Acceptance Criteria:**
- [ ] updateSpendingLimits method implemented
- [ ] Validation (limits must be positive)
- [ ] Partial update support (only update provided fields)
- [ ] PUT /api/v1/cards/:cardId/limits endpoint
- [ ] Audit log for limit changes
- [ ] Unit tests

---

#### TASK-6A.1.2.3: Implement Card Termination (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Permanent card termination with transaction PIN verification.

**Acceptance Criteria:**
- [ ] terminateCard method implemented
- [ ] Transaction PIN verification required
- [ ] Irreversible (can't unfreeze terminated card)
- [ ] Update terminated_at timestamp
- [ ] DELETE /api/v1/cards/:cardId endpoint
- [ ] Audit log for termination
- [ ] Unit tests

---

#### TASK-6A.1.2.4: Implement Get Card Details (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Retrieve masked card details without exposing sensitive information.

**Acceptance Criteria:**
- [ ] getCardDetails method implemented
- [ ] PAN masked to last 4 digits
- [ ] CVV never returned after issuance
- [ ] Expiry validation included
- [ ] Current spending limits returned
- [ ] Card status included
- [ ] GET /api/v1/cards/:cardId endpoint
- [ ] GET /api/v1/cards (list all user cards)
- [ ] Unit tests

---

#### Subtotal: US-6A.1.2 = 8 SP

---

## 📋 User Story: US-6A.2.1 - Transaction Authorization Simulation (13 SP)

### Tasks

#### TASK-6A.2.1.1: Create Card Transaction Entity (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Database schema for card transactions with authorization tracking.

**Acceptance Criteria:**
- [ ] CardTransaction entity created
- [ ] Fields: id, card_id, wallet_id, user_id, amount, currency
- [ ] Transaction type (purchase, withdrawal, refund)
- [ ] Merchant details (name, MCC)
- [ ] Authorization code, status (authorized, settled, declined, reversed)
- [ ] Online/offline transaction flag
- [ ] Timestamps (authorized_at, settled_at, declined_at)
- [ ] Database migration
- [ ] Indexes on card_id, user_id, status, created_at

**Schema:**
```sql
CREATE TABLE card_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES cards(id),
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL,
  merchant_name VARCHAR(200),
  merchant_category_code VARCHAR(4),
  authorization_code VARCHAR(10),
  status VARCHAR(20) NOT NULL,
  decline_reason VARCHAR(100),
  is_online BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  authorized_at TIMESTAMP,
  settled_at TIMESTAMP,
  declined_at TIMESTAMP,
  INDEX idx_card_transactions_card_id (card_id),
  INDEX idx_card_transactions_user_id (user_id),
  INDEX idx_card_transactions_status (status),
  INDEX idx_card_transactions_created_at (created_at)
);
```

---

#### TASK-6A.2.1.2: Implement Transaction Authorization Logic (5 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Core authorization logic with all validation checks.

**Acceptance Criteria:**
- [ ] authorizeTransaction method implemented
- [ ] Card status validation (active only)
- [ ] Expiry date validation
- [ ] CVV validation (online transactions)
- [ ] Spending limit checks (daily, monthly, per-transaction)
- [ ] Wallet balance check
- [ ] Duplicate transaction detection (5-minute window)
- [ ] Velocity check (max 10 txns/hour)
- [ ] MCC validation (blocked categories)
- [ ] Random fraud simulation (1% chance)
- [ ] Authorization hold on wallet
- [ ] Authorization code generation (6-char alphanumeric)
- [ ] Simulated network latency (100-300ms)
- [ ] Comprehensive decline reasons

**Decline Reasons:**
- CARD_NOT_FOUND
- CARD_FROZEN
- CARD_BLOCKED
- CARD_TERMINATED
- CARD_EXPIRED
- INVALID_CVV
- INSUFFICIENT_FUNDS
- PER_TRANSACTION_LIMIT_EXCEEDED
- DAILY_LIMIT_EXCEEDED
- MONTHLY_LIMIT_EXCEEDED
- DUPLICATE_TRANSACTION
- VELOCITY_LIMIT_EXCEEDED
- MCC_BLOCKED
- SUSPECTED_FRAUD

---

#### TASK-6A.2.1.3: Implement Authorization Endpoint (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
REST API endpoint for transaction authorization (simulates card network).

**Acceptance Criteria:**
- [ ] POST /api/v1/cards/authorize endpoint
- [ ] AuthorizeTransactionDto with validation
- [ ] Response includes authorization code or decline reason
- [ ] Swagger documentation
- [ ] Rate limiting (1000 req/min)
- [ ] Error handling
- [ ] Integration tests

---

#### TASK-6A.2.1.4: Implement Spending Tracking Queries (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P0

**Description:**
Efficient queries for tracking daily and monthly spending.

**Acceptance Criteria:**
- [ ] getTodaySpending method (optimized query)
- [ ] getMonthlySpending method (optimized query)
- [ ] Use database aggregation (SUM)
- [ ] Filter by status (authorized + settled only)
- [ ] Cache results (Redis) for performance
- [ ] Unit tests with time boundaries

---

#### TASK-6A.2.1.5: Create Test Card Numbers Configuration (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P2

**Description:**
Pre-configured test card numbers for specific scenarios.

**Acceptance Criteria:**
- [ ] TEST_CARDS constant with predefined numbers
- [ ] Always succeeds: 4111111111111111 (Visa)
- [ ] Insufficient funds: 4000000000000002
- [ ] Invalid CVV: 4000000000000010
- [ ] Suspected fraud: 4100000000000019
- [ ] Documentation in README
- [ ] Unit tests for each test card scenario

---

#### Subtotal: US-6A.2.1 = 13 SP

---

## 📋 User Story: US-6A.2.2 - Transaction Settlement & Batch Processing (8 SP)

### Tasks

#### TASK-6A.2.2.1: Implement Settlement Logic (3 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P1

**Description:**
Convert authorization holds to actual wallet debits.

**Acceptance Criteria:**
- [ ] settleTransaction method implemented
- [ ] Update transaction status to SETTLED
- [ ] Debit from wallet ledger balance
- [ ] Keep available balance unchanged (already held)
- [ ] Update settled_at timestamp
- [ ] Atomic database transaction
- [ ] Unit tests

---

#### TASK-6A.2.2.2: Implement Batch Settlement Job (3 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P1

**Description:**
Scheduled job to settle all authorized transactions (simulates T+1 settlement).

**Acceptance Criteria:**
- [ ] Batch settlement cron job (runs daily at midnight)
- [ ] Query all AUTHORIZED transactions older than 24 hours
- [ ] Settle each transaction
- [ ] Error handling (retry failed settlements)
- [ ] Settlement report generation
- [ ] Logging and monitoring

**Files to Create:**
- `apps/wallet-service/src/cards/jobs/card-settlement.job.ts`

---

#### TASK-6A.2.2.3: Implement Settlement Reversal (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P1

**Description:**
Handle failed settlements and authorization reversals.

**Acceptance Criteria:**
- [ ] reverseAuthorization method implemented
- [ ] Release authorization hold on wallet
- [ ] Update transaction status to REVERSED
- [ ] Refund available balance
- [ ] Audit log for reversals
- [ ] Unit tests

---

#### Subtotal: US-6A.2.2 = 8 SP

---

## 📋 User Story: US-6A.3.1 - Test Card Numbers & Documentation (3 SP)

### Tasks

#### TASK-6A.3.1.1: Create Test Card Documentation (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P2

**Description:**
Comprehensive documentation for using test cards.

**Acceptance Criteria:**
- [ ] docs/MOCK_CARD_SERVICE.md created
- [ ] List of all test card numbers
- [ ] Expected behavior for each test card
- [ ] CVV test values
- [ ] MCC codes reference
- [ ] Transaction flow examples
- [ ] Decline reason reference
- [ ] API endpoint documentation

---

#### TASK-6A.3.1.2: Create Postman Collection (1 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P2

**Description:**
Postman collection for testing all card operations.

**Acceptance Criteria:**
- [ ] Issue virtual card request
- [ ] Freeze/unfreeze card requests
- [ ] Update spending limits
- [ ] Terminate card
- [ ] Authorize transaction (success scenarios)
- [ ] Authorize transaction (decline scenarios)
- [ ] Get card details
- [ ] Environment variables configured

---

#### Subtotal: US-6A.3.1 = 3 SP

---

## 📋 User Story: US-6A.3.2 - Provider Swap Interface Design (3 SP)

### Tasks

#### TASK-6A.3.2.1: Design Card Provider Interface (2 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P1

**Description:**
Abstract interface for easy provider swapping (Stripe/Sudo/Paystack).

**Acceptance Criteria:**
- [ ] ICardIssuanceProvider interface created
- [ ] All operations abstracted (issue, freeze, authorize, settle)
- [ ] MockCardIssuanceProvider implements interface
- [ ] Factory pattern for provider selection
- [ ] Configuration-based provider switching
- [ ] Documentation on adding new providers

**Files to Create:**
- `libs/card-provider/src/interfaces/card-issuance-provider.interface.ts`
- `libs/card-provider/src/factories/card-provider.factory.ts`

---

#### TASK-6A.3.2.2: Create Provider Swap Guide (1 SP)
**Status:** ⚪ To Do
**Assignee:** Developer
**Priority:** P1

**Description:**
Step-by-step guide for swapping to real providers.

**Acceptance Criteria:**
- [ ] docs/CARD_PROVIDER_SWAP_GUIDE.md created
- [ ] Instructions for Stripe integration
- [ ] Instructions for Sudo integration
- [ ] Instructions for Paystack integration
- [ ] Configuration changes needed
- [ ] Data migration considerations
- [ ] Testing checklist

---

#### Subtotal: US-6A.3.2 = 3 SP

---

## Sprint Summary

| Story ID | Story Name | Story Points | Status |
|----------|-----------|--------------|--------|
| US-6A.1.1 | Mock Virtual Card Issuance | 13 | To Do |
| US-6A.1.2 | Card Lifecycle Management | 8 | To Do |
| US-6A.2.1 | Transaction Authorization Simulation | 13 | To Do |
| US-6A.2.2 | Transaction Settlement & Batch Processing | 8 | To Do |
| US-6A.3.1 | Test Card Numbers & Documentation | 3 | To Do |
| US-6A.3.2 | Provider Swap Interface Design | 3 | To Do |
| **Total** | | **48 SP** | |

---

## Task Progress Tracker

### Day 1-2: Card Number Generation & Entities
- [ ] TASK-6A.1.1.1: Card Number Generator (Luhn)
- [ ] TASK-6A.1.1.2: CVV & Expiry Generators
- [ ] TASK-6A.1.1.3: Card Entity & Schema

### Day 3-4: Card Issuance
- [ ] TASK-6A.1.1.4: Mock Card Issuance Service
- [ ] TASK-6A.1.1.5: Card Issuance Controller

### Day 5-6: Card Lifecycle
- [ ] TASK-6A.1.2.1: Freeze/Unfreeze
- [ ] TASK-6A.1.2.2: Spending Limit Updates
- [ ] TASK-6A.1.2.3: Card Termination
- [ ] TASK-6A.1.2.4: Get Card Details

### Day 7-8: Transaction Authorization
- [ ] TASK-6A.2.1.1: Card Transaction Entity
- [ ] TASK-6A.2.1.2: Authorization Logic
- [ ] TASK-6A.2.1.3: Authorization Endpoint
- [ ] TASK-6A.2.1.4: Spending Tracking Queries

### Day 9: Settlement
- [ ] TASK-6A.2.2.1: Settlement Logic
- [ ] TASK-6A.2.2.2: Batch Settlement Job
- [ ] TASK-6A.2.2.3: Settlement Reversal

### Day 10: Documentation & Testing
- [ ] TASK-6A.3.1.1: Test Card Documentation
- [ ] TASK-6A.3.1.2: Postman Collection
- [ ] TASK-6A.2.1.5: Test Card Numbers Configuration
- [ ] TASK-6A.3.2.1: Provider Interface
- [ ] TASK-6A.3.2.2: Provider Swap Guide

---

## Burndown Chart (To Be Updated Daily)

| Day | Planned Remaining | Actual Remaining | Completed Today |
|-----|-------------------|------------------|-----------------|
| 1   | 48                |                  |                 |
| 2   | 43                |                  |                 |
| 3   | 37                |                  |                 |
| 4   | 33                |                  |                 |
| 5   | 27                |                  |                 |
| 6   | 21                |                  |                 |
| 7   | 14                |                  |                 |
| 8   | 8                 |                  |                 |
| 9   | 3                 |                  |                 |
| 10  | 0                 |                  |                 |

---

## Dependencies

**External:**
- None (fully mocked)

**Internal:**
- Sprint 1: Encryption service for PAN/CVV
- Sprint 4: Ledger system for wallet debits
- Sprint 5: Transaction PIN verification

---

## Blockers

| ID | Description | Raised Date | Owner | Status | Resolution |
|----|-------------|-------------|-------|--------|------------|
| - | No blockers currently | - | - | - | - |

---

## Notes

**Daily Standups:**
- What did I complete yesterday?
- What will I work on today?
- Any blockers?

**Sprint Retrospective Topics:**
- What went well?
- What could be improved?
- Action items for next sprint

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Ready to Start
