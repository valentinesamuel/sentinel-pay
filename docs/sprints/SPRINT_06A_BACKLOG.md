# Sprint 6A Backlog - Mock Card Issuance Service Foundation

**Sprint:** Sprint 6A (Inserted Sprint)
**Duration:** 2 weeks (Week 13A-14A)
**Sprint Goal:** Build production-grade mock card issuance service with complete transaction simulation and realistic card operations
**Story Points Committed:** 48
**Team Capacity:** 48 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Targeting 45-48 SP based on complexity

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 6A, we will have a **production-grade mock card issuance service** that:
1. ✅ Simulates 100% of real-world card operations
2. ✅ Can be swapped for Stripe/Paystack/Sudo later with zero API changes
3. ✅ Includes proper test card numbers and realistic transaction flows
4. ✅ Has spending controls, security features, and MCC validation
5. ✅ Supports both virtual and physical card simulation
6. ✅ Includes transaction authorization, settlement, and decline simulation
7. ✅ Uses Luhn algorithm for card number generation
8. ✅ Provides realistic CVV, expiry date, and PIN management

**Why This Sprint Matters:**
- **Cost Savings:** Card issuance providers charge $1-3 per card + transaction fees ($1,500-5,000/month at scale)
- **Development Speed:** No waiting for provider approvals or sandbox access
- **Testing:** Full control over test scenarios (declines, fraud, network errors)
- **Future-Proof:** Interface-based design allows swapping to real providers in Phase 3
- **Compliance:** Test KYC workflows without real customer data

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (90% coverage for mock service)
- [ ] Integration tests passing
- [ ] Card number generation uses Luhn algorithm
- [ ] Transaction simulation covers all scenarios
- [ ] API interface matches industry standards (Stripe-like)
- [ ] Documentation for swapping to real providers
- [ ] Code reviewed and merged
- [ ] Sprint demo completed (show card lifecycle + transactions)

---

## Sprint Backlog Items

---

# EPIC-17: Mock Provider Service

## FEATURE-17.3: Mock Card Issuance Service

### 📘 User Story: US-6A.1.1 - Mock Virtual Card Issuance

**Story ID:** US-6A.1.1
**Feature:** FEATURE-17.3 (Mock Card Issuance)
**Epic:** EPIC-17 (Mock Provider Service)

**Story Points:** 13
**Priority:** P0 (Critical - Blocks Sprint 10)
**Sprint:** Sprint 6A
**Status:** 🔄 Not Started

---

#### User Story

```
As a developer
I want a mock card issuance service that simulates real card providers
So that I can develop and test card features without costly provider integration
```

---

#### Business Value

**Value Statement:**
A production-grade mock card service saves $1,500-5,000/month in provider fees during development, enables unlimited testing scenarios, and provides a clean abstraction layer for future provider swaps.

**Impact:**
- **Cost Savings:** $18,000-60,000 saved during 12-month development
- **Development Speed:** No provider approval delays (typically 2-4 weeks)
- **Testing Coverage:** 100% control over success/failure scenarios
- **Future-Proof:** Zero code changes when swapping to real providers

**Success Criteria:**
- Mock service supports all card operations (issue, freeze, limits, etc.)
- Test card numbers pass Luhn validation
- Transaction authorization simulates real-world latency (100-300ms)
- 95% code coverage for all mock operations
- API interface matches Stripe/Sudo standards

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Issue virtual cards with realistic card numbers (Luhn-valid)
- [ ] **AC2:** Generate CVV (3 digits for Visa/MC, 4 for Amex)
- [ ] **AC3:** Set expiry dates (default: 3 years from issuance)
- [ ] **AC4:** Support multiple card brands (Visa, Mastercard, Verve)
- [ ] **AC5:** Assign card to user wallet
- [ ] **AC6:** Generate unique card ID and PAN (Primary Account Number)
- [ ] **AC7:** Set initial status (active/inactive)
- [ ] **AC8:** Set default spending limits (daily/monthly/per-transaction)
- [ ] **AC9:** Store card securely (encrypted PAN, CVV)
- [ ] **AC10:** Return masked card details for API responses
- [ ] **AC11:** Support card naming/labeling
- [ ] **AC12:** Track card creation timestamp
- [ ] **AC13:** Associate card with currency
- [ ] **AC14:** Generate card token for secure storage
- [ ] **AC15:** Simulate realistic issuance delay (200-500ms)

**Security:**
- [ ] **AC16:** Encrypt PAN and CVV at rest (AES-256)
- [ ] **AC17:** Never return full PAN in API responses (mask to last 4)
- [ ] **AC18:** Generate secure card tokens (non-reversible)
- [ ] **AC19:** Audit log all card issuance events
- [ ] **AC20:** Rate limiting: Max 5 cards per user per day

**Non-Functional:**
- [ ] **AC21:** Card issuance < 1 second (mock)
- [ ] **AC22:** Support 1,000+ concurrent card issuances
- [ ] **AC23:** Card number uniqueness guaranteed
- [ ] **AC24:** Proper error messages for all failure scenarios

---

#### Technical Specifications

**Card Number Generation (Luhn Algorithm):**

```typescript
/**
 * Generate valid card number using Luhn algorithm
 * @param bin - Bank Identification Number (first 6 digits)
 * @param length - Total card number length (16 for Visa/MC, 15 for Amex)
 */
export class CardNumberGenerator {
  private static readonly CARD_BINS = {
    VISA: ['400000', '424242', '411111'],
    MASTERCARD: ['510000', '530000', '555555'],
    VERVE: ['506099', '506100'],
  };

  static generateCardNumber(brand: CardBrand = 'VISA'): string {
    const bins = this.CARD_BINS[brand];
    const bin = bins[Math.floor(Math.random() * bins.length)];
    const length = brand === 'VISA' ? 16 : brand === 'MASTERCARD' ? 16 : 19;

    // Generate random digits
    let cardNumber = bin;
    while (cardNumber.length < length - 1) {
      cardNumber += Math.floor(Math.random() * 10);
    }

    // Calculate Luhn check digit
    const checkDigit = this.calculateLuhnCheckDigit(cardNumber);
    cardNumber += checkDigit;

    return cardNumber;
  }

  private static calculateLuhnCheckDigit(partialCardNumber: string): number {
    const digits = partialCardNumber.split('').map(Number);
    let sum = 0;

    // Process from right to left
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      // Double every second digit from right
      if ((digits.length - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
    }

    // Check digit makes total a multiple of 10
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
  }

  static validateCardNumber(cardNumber: string): boolean {
    if (!/^\d+$/.test(cardNumber)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    // Process from right to left
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }
}
```

**CVV Generation:**

```typescript
export class CVVGenerator {
  static generate(brand: CardBrand): string {
    const length = brand === 'AMEX' ? 4 : 3;
    let cvv = '';

    for (let i = 0; i < length; i++) {
      cvv += Math.floor(Math.random() * 10);
    }

    return cvv;
  }
}
```

**Expiry Date Generation:**

```typescript
export class ExpiryDateGenerator {
  static generate(yearsFromNow: number = 3): { month: number; year: number } {
    const now = new Date();
    const expiryDate = new Date(now.setFullYear(now.getFullYear() + yearsFromNow));

    return {
      month: expiryDate.getMonth() + 1,
      year: expiryDate.getFullYear(),
    };
  }

  static isExpired(month: number, year: number): boolean {
    const now = new Date();
    const expiry = new Date(year, month - 1);
    return expiry < now;
  }
}
```

**Mock Card Issuance Service:**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Card, CardStatus, CardBrand } from './entities/card.entity';
import { EncryptionService } from '@app/shared/encryption/encryption.service';
import { CardNumberGenerator } from './utils/card-number-generator';
import { CVVGenerator } from './utils/cvv-generator';
import { ExpiryDateGenerator } from './utils/expiry-date-generator';

export interface IssueVirtualCardDto {
  user_id: string;
  wallet_id: string;
  currency: string;
  card_brand?: CardBrand;
  card_name?: string;
  spending_limits?: {
    daily?: number;
    monthly?: number;
    per_transaction?: number;
  };
}

export interface VirtualCardResponse {
  card_id: string;
  card_number: string;          // Masked: 4111 **** **** 1111
  card_number_last4: string;
  cvv: string;                  // Only returned once during issuance
  expiry_month: number;
  expiry_year: number;
  card_brand: CardBrand;
  card_name: string;
  status: CardStatus;
  currency: string;
  spending_limits: {
    daily: number;
    monthly: number;
    per_transaction: number;
  };
  created_at: Date;
}

@Injectable()
export class MockCardIssuanceService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    private encryptionService: EncryptionService,
    private dataSource: DataSource,
  ) {}

  /**
   * Issue a new virtual card
   * Simulates real card provider behavior with realistic delays
   */
  async issueVirtualCard(dto: IssueVirtualCardDto): Promise<VirtualCardResponse> {
    // Simulate realistic card issuance delay (200-500ms)
    await this.simulateDelay(200, 500);

    // Validate user hasn't exceeded daily card issuance limit
    const todayCardCount = await this.getTodayCardIssuanceCount(dto.user_id);
    if (todayCardCount >= 5) {
      throw new BadRequestException({
        code: 'DAILY_CARD_LIMIT_EXCEEDED',
        message: 'Maximum 5 cards can be issued per day',
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate card details
      const cardBrand = dto.card_brand || CardBrand.VISA;
      const cardNumber = CardNumberGenerator.generateCardNumber(cardBrand);
      const cvv = CVVGenerator.generate(cardBrand);
      const expiry = ExpiryDateGenerator.generate(3);

      // Encrypt sensitive data
      const encryptedPAN = await this.encryptionService.encrypt(cardNumber);
      const encryptedCVV = await this.encryptionService.encrypt(cvv);

      // Set default spending limits
      const defaultLimits = {
        daily: dto.spending_limits?.daily || 50000000, // NGN 500,000
        monthly: dto.spending_limits?.monthly || 200000000, // NGN 2,000,000
        per_transaction: dto.spending_limits?.per_transaction || 10000000, // NGN 100,000
      };

      // Create card entity
      const card = await queryRunner.manager.save(Card, {
        user_id: dto.user_id,
        wallet_id: dto.wallet_id,
        card_type: 'VIRTUAL',
        card_brand: cardBrand,
        card_name: dto.card_name || `${cardBrand} Virtual Card`,
        encrypted_pan: encryptedPAN,
        encrypted_cvv: encryptedCVV,
        last_four_digits: cardNumber.slice(-4),
        expiry_month: expiry.month,
        expiry_year: expiry.year,
        currency: dto.currency,
        status: CardStatus.ACTIVE,
        spending_limit_daily: defaultLimits.daily,
        spending_limit_monthly: defaultLimits.monthly,
        spending_limit_per_transaction: defaultLimits.per_transaction,
        is_mock: true,
        provider: 'MOCK_ISSUER',
      });

      await queryRunner.commitTransaction();

      // Return card details (CVV only returned during issuance)
      return {
        card_id: card.id,
        card_number: this.maskCardNumber(cardNumber),
        card_number_last4: card.last_four_digits,
        cvv: cvv, // ⚠️ Only returned once
        expiry_month: card.expiry_month,
        expiry_year: card.expiry_year,
        card_brand: card.card_brand,
        card_name: card.card_name,
        status: card.status,
        currency: card.currency,
        spending_limits: {
          daily: card.spending_limit_daily,
          monthly: card.spending_limit_monthly,
          per_transaction: card.spending_limit_per_transaction,
        },
        created_at: card.created_at,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Mask card number for secure display
   * Example: 4111111111111111 -> 4111 **** **** 1111
   */
  private maskCardNumber(cardNumber: string): string {
    if (cardNumber.length === 16) {
      return `${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(-4)}`;
    } else if (cardNumber.length === 15) {
      return `${cardNumber.slice(0, 4)} ****** ${cardNumber.slice(-4)}`;
    }
    return '**** **** **** ****';
  }

  /**
   * Simulate realistic delay for card operations
   */
  private async simulateDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Get number of cards issued today for a user
   */
  private async getTodayCardIssuanceCount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.cardsRepository.count({
      where: {
        user_id: userId,
        created_at: MoreThanOrEqual(today),
      },
    });
  }
}
```

**Endpoint:** `POST /api/v1/cards/virtual/issue`

**Request:**
```typescript
{
  "wallet_id": "uuid",
  "currency": "NGN",
  "card_brand": "VISA",        // Optional: VISA, MASTERCARD, VERVE
  "card_name": "Shopping Card", // Optional
  "spending_limits": {          // Optional
    "daily": 50000000,          // NGN 500,000
    "monthly": 200000000,       // NGN 2,000,000
    "per_transaction": 10000000 // NGN 100,000
  }
}
```

**Response (201 Created):**
```typescript
{
  "status": "success",
  "data": {
    "card": {
      "card_id": "card_mock_1737024000000_abc123",
      "card_number": "4111 **** **** 1111",
      "card_number_last4": "1111",
      "cvv": "123",                    // ⚠️ Only shown once
      "expiry_month": 1,
      "expiry_year": 2028,
      "card_brand": "VISA",
      "card_name": "Shopping Card",
      "status": "active",
      "currency": "NGN",
      "spending_limits": {
        "daily": 50000000,
        "monthly": 200000000,
        "per_transaction": 10000000
      },
      "created_at": "2025-01-16T10:00:00Z"
    },
    "security_notice": "Please store your CVV securely. It will not be shown again."
  }
}
```

---

### 📘 User Story: US-6A.1.2 - Card Lifecycle Management

**Story ID:** US-6A.1.2
**Feature:** FEATURE-17.3 (Mock Card Issuance)
**Epic:** EPIC-17 (Mock Provider Service)

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 6A
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to manage my card lifecycle (freeze, unfreeze, set limits, terminate)
So that I can control my card security and spending
```

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Freeze card (prevents all transactions)
- [ ] **AC2:** Unfreeze card (resumes normal operation)
- [ ] **AC3:** Update spending limits (daily/monthly/per-transaction)
- [ ] **AC4:** Terminate card (permanent, irreversible)
- [ ] **AC5:** Get card details (masked PAN, never full PAN)
- [ ] **AC6:** View card transaction history
- [ ] **AC7:** Update card name/label
- [ ] **AC8:** Check if card is expired
- [ ] **AC9:** Block card (temporary, can be unblocked)
- [ ] **AC10:** Transaction PIN update
- [ ] **AC11:** Rate limiting on freeze/unfreeze (prevent abuse)
- [ ] **AC12:** Audit log for all card status changes

**Security:**
- [ ] **AC13:** Require authentication for all operations
- [ ] **AC14:** Transaction PIN required for termination
- [ ] **AC15:** Never expose CVV after initial issuance
- [ ] **AC16:** Verify card ownership before operations

---

#### Technical Specifications

**Card Lifecycle Service:**

```typescript
@Injectable()
export class MockCardLifecycleService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Freeze card - prevents all transactions
   */
  async freezeCard(cardId: string, userId: string): Promise<void> {
    const card = await this.getCardForUser(cardId, userId);

    if (card.status === CardStatus.FROZEN) {
      throw new BadRequestException('Card is already frozen');
    }

    if (card.status === CardStatus.TERMINATED) {
      throw new BadRequestException('Cannot freeze a terminated card');
    }

    await this.cardsRepository.update(
      { id: cardId },
      {
        status: CardStatus.FROZEN,
        frozen_at: new Date(),
      }
    );

    await this.auditLogService.log({
      user_id: userId,
      action: 'CARD_FROZEN',
      resource: 'Card',
      resource_id: cardId,
    });
  }

  /**
   * Unfreeze card - resumes normal operation
   */
  async unfreezeCard(cardId: string, userId: string): Promise<void> {
    const card = await this.getCardForUser(cardId, userId);

    if (card.status !== CardStatus.FROZEN) {
      throw new BadRequestException('Card is not frozen');
    }

    await this.cardsRepository.update(
      { id: cardId },
      {
        status: CardStatus.ACTIVE,
        frozen_at: null,
      }
    );

    await this.auditLogService.log({
      user_id: userId,
      action: 'CARD_UNFROZEN',
      resource: 'Card',
      resource_id: cardId,
    });
  }

  /**
   * Update spending limits
   */
  async updateSpendingLimits(
    cardId: string,
    userId: string,
    limits: {
      daily?: number;
      monthly?: number;
      per_transaction?: number;
    }
  ): Promise<void> {
    const card = await this.getCardForUser(cardId, userId);

    await this.cardsRepository.update(
      { id: cardId },
      {
        spending_limit_daily: limits.daily ?? card.spending_limit_daily,
        spending_limit_monthly: limits.monthly ?? card.spending_limit_monthly,
        spending_limit_per_transaction: limits.per_transaction ?? card.spending_limit_per_transaction,
      }
    );

    await this.auditLogService.log({
      user_id: userId,
      action: 'CARD_LIMITS_UPDATED',
      resource: 'Card',
      resource_id: cardId,
      metadata: limits,
    });
  }

  /**
   * Terminate card - permanent and irreversible
   */
  async terminateCard(
    cardId: string,
    userId: string,
    pin: string
  ): Promise<void> {
    // Verify transaction PIN
    await this.verifyTransactionPin(userId, pin);

    const card = await this.getCardForUser(cardId, userId);

    if (card.status === CardStatus.TERMINATED) {
      throw new BadRequestException('Card is already terminated');
    }

    await this.cardsRepository.update(
      { id: cardId },
      {
        status: CardStatus.TERMINATED,
        terminated_at: new Date(),
      }
    );

    await this.auditLogService.log({
      user_id: userId,
      action: 'CARD_TERMINATED',
      resource: 'Card',
      resource_id: cardId,
    });
  }

  /**
   * Get card details (masked PAN)
   */
  async getCardDetails(cardId: string, userId: string): Promise<CardDetailsResponse> {
    const card = await this.getCardForUser(cardId, userId);

    return {
      card_id: card.id,
      card_number: `**** **** **** ${card.last_four_digits}`,
      card_number_last4: card.last_four_digits,
      expiry_month: card.expiry_month,
      expiry_year: card.expiry_year,
      card_brand: card.card_brand,
      card_name: card.card_name,
      card_type: card.card_type,
      status: card.status,
      currency: card.currency,
      spending_limits: {
        daily: card.spending_limit_daily,
        monthly: card.spending_limit_monthly,
        per_transaction: card.spending_limit_per_transaction,
      },
      is_expired: ExpiryDateGenerator.isExpired(card.expiry_month, card.expiry_year),
      created_at: card.created_at,
    };
  }

  private async getCardForUser(cardId: string, userId: string): Promise<Card> {
    const card = await this.cardsRepository.findOne({
      where: { id: cardId, user_id: userId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card;
  }
}
```

**Endpoints:**

```typescript
// Freeze card
PUT /api/v1/cards/:cardId/freeze

// Unfreeze card
PUT /api/v1/cards/:cardId/unfreeze

// Update spending limits
PUT /api/v1/cards/:cardId/limits
{
  "daily": 100000000,
  "monthly": 400000000,
  "per_transaction": 20000000
}

// Terminate card
DELETE /api/v1/cards/:cardId
{
  "pin": "1234"
}

// Get card details
GET /api/v1/cards/:cardId
```

---

### 📘 User Story: US-6A.2.1 - Transaction Authorization Simulation

**Story ID:** US-6A.2.1
**Feature:** FEATURE-17.3 (Mock Card Issuance)
**Epic:** EPIC-17 (Mock Provider Service)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 6A
**Status:** 🔄 Not Started

---

#### User Story

```
As a developer
I want realistic transaction authorization simulation
So that I can test payment flows with various success and failure scenarios
```

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Authorize card transactions (online/POS)
- [ ] **AC2:** Validate card status (active/frozen/expired/terminated)
- [ ] **AC3:** Validate CVV (online transactions)
- [ ] **AC4:** Check spending limits (daily/monthly/per-transaction)
- [ ] **AC5:** Check wallet balance (sufficient funds)
- [ ] **AC6:** Merchant Category Code (MCC) validation
- [ ] **AC7:** Simulate authorization holds
- [ ] **AC8:** Generate authorization codes
- [ ] **AC9:** Decline transactions with realistic reasons
- [ ] **AC10:** Simulate network latency (100-300ms)
- [ ] **AC11:** Support 3D Secure simulation
- [ ] **AC12:** Track daily/monthly spending
- [ ] **AC13:** Duplicate transaction prevention (5-minute window)
- [ ] **AC14:** Velocity checks (max 10 txns per hour)

**Decline Reasons:**
- [ ] **AC15:** Insufficient funds
- [ ] **AC16:** Card frozen/blocked/terminated
- [ ] **AC17:** Card expired
- [ ] **AC18:** Invalid CVV
- [ ] **AC19:** Spending limit exceeded
- [ ] **AC20:** MCC blocked (if configured)
- [ ] **AC21:** Suspected fraud
- [ ] **AC22:** Duplicate transaction
- [ ] **AC23:** Velocity limit exceeded

**Non-Functional:**
- [ ] **AC24:** Authorization < 500ms (simulated)
- [ ] **AC25:** Support 5,000+ authorizations per second
- [ ] **AC26:** Atomic balance checks and holds

---

#### Technical Specifications

**Transaction Authorization Service:**

```typescript
export interface AuthorizeTransactionDto {
  card_id: string;
  amount: number;
  currency: string;
  merchant_name: string;
  merchant_category_code: string; // MCC
  transaction_type: 'PURCHASE' | 'WITHDRAWAL' | 'REFUND';
  cvv?: string; // Required for online transactions
  is_online: boolean;
  metadata?: Record<string, any>;
}

export interface AuthorizationResponse {
  authorized: boolean;
  authorization_code?: string;
  decline_reason?: string;
  available_balance?: number;
  transaction_id?: string;
  timestamp: Date;
}

@Injectable()
export class MockCardAuthorizationService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    @InjectRepository(CardTransaction)
    private cardTransactionsRepository: Repository<CardTransaction>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    private encryptionService: EncryptionService,
    private dataSource: DataSource,
  ) {}

  /**
   * Authorize a card transaction
   * Simulates real card network behavior
   */
  async authorizeTransaction(dto: AuthorizeTransactionDto): Promise<AuthorizationResponse> {
    // Simulate network latency (100-300ms)
    await this.simulateNetworkLatency(100, 300);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Get card
      const card = await this.cardsRepository.findOne({
        where: { id: dto.card_id },
      });

      if (!card) {
        return this.decline('CARD_NOT_FOUND');
      }

      // 2. Validate card status
      const statusValidation = this.validateCardStatus(card);
      if (!statusValidation.valid) {
        return this.decline(statusValidation.reason);
      }

      // 3. Validate expiry
      if (ExpiryDateGenerator.isExpired(card.expiry_month, card.expiry_year)) {
        return this.decline('CARD_EXPIRED');
      }

      // 4. Validate CVV (for online transactions)
      if (dto.is_online && dto.cvv) {
        const cvvValid = await this.validateCVV(card, dto.cvv);
        if (!cvvValid) {
          return this.decline('INVALID_CVV');
        }
      }

      // 5. Check spending limits
      const limitsCheck = await this.checkSpendingLimits(card, dto.amount);
      if (!limitsCheck.valid) {
        return this.decline(limitsCheck.reason);
      }

      // 6. Check wallet balance
      const wallet = await this.walletsRepository.findOne({
        where: { id: card.wallet_id },
      });

      if (BigInt(wallet.available_balance) < BigInt(dto.amount)) {
        return this.decline('INSUFFICIENT_FUNDS');
      }

      // 7. Check for duplicate transactions (5-minute window)
      const isDuplicate = await this.checkDuplicateTransaction(
        dto.card_id,
        dto.amount,
        dto.merchant_name
      );
      if (isDuplicate) {
        return this.decline('DUPLICATE_TRANSACTION');
      }

      // 8. Velocity check (max 10 transactions per hour)
      const velocityCheck = await this.checkTransactionVelocity(dto.card_id);
      if (!velocityCheck.valid) {
        return this.decline('VELOCITY_LIMIT_EXCEEDED');
      }

      // 9. MCC validation (if configured)
      const mccCheck = this.validateMCC(card, dto.merchant_category_code);
      if (!mccCheck.valid) {
        return this.decline('MCC_BLOCKED');
      }

      // 10. Random fraud simulation (1% chance)
      if (Math.random() < 0.01) {
        return this.decline('SUSPECTED_FRAUD');
      }

      // 11. Create authorization hold
      const authCode = this.generateAuthorizationCode();
      const transaction = await queryRunner.manager.save(CardTransaction, {
        card_id: dto.card_id,
        wallet_id: card.wallet_id,
        user_id: card.user_id,
        amount: dto.amount,
        currency: dto.currency,
        transaction_type: dto.transaction_type,
        merchant_name: dto.merchant_name,
        merchant_category_code: dto.merchant_category_code,
        authorization_code: authCode,
        status: 'AUTHORIZED',
        is_online: dto.is_online,
        metadata: dto.metadata,
      });

      // 12. Place authorization hold on wallet
      await queryRunner.manager.update(Wallet,
        { id: wallet.id },
        {
          available_balance: () => `available_balance - ${dto.amount}`,
          // Ledger balance unchanged until settlement
        }
      );

      await queryRunner.commitTransaction();

      return {
        authorized: true,
        authorization_code: authCode,
        available_balance: Number(wallet.available_balance) - dto.amount,
        transaction_id: transaction.id,
        timestamp: new Date(),
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Settle an authorized transaction
   * Converts authorization hold to actual debit
   */
  async settleTransaction(transactionId: string): Promise<void> {
    // Simulate realistic settlement delay (1-3 days)
    // In real-world, this would be called by a batch job

    const transaction = await this.cardTransactionsRepository.findOne({
      where: { id: transactionId, status: 'AUTHORIZED' },
    });

    if (!transaction) {
      throw new NotFoundException('Authorized transaction not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update transaction status
      await queryRunner.manager.update(CardTransaction,
        { id: transactionId },
        {
          status: 'SETTLED',
          settled_at: new Date(),
        }
      );

      // Debit from ledger balance
      await queryRunner.manager.update(Wallet,
        { id: transaction.wallet_id },
        {
          ledger_balance: () => `ledger_balance - ${transaction.amount}`,
        }
      );

      await queryRunner.commitTransaction();

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Validate card status
   */
  private validateCardStatus(card: Card): { valid: boolean; reason?: string } {
    if (card.status === CardStatus.FROZEN) {
      return { valid: false, reason: 'CARD_FROZEN' };
    }
    if (card.status === CardStatus.BLOCKED) {
      return { valid: false, reason: 'CARD_BLOCKED' };
    }
    if (card.status === CardStatus.TERMINATED) {
      return { valid: false, reason: 'CARD_TERMINATED' };
    }
    return { valid: true };
  }

  /**
   * Validate CVV
   */
  private async validateCVV(card: Card, providedCVV: string): Promise<boolean> {
    const actualCVV = await this.encryptionService.decrypt(card.encrypted_cvv);
    return actualCVV === providedCVV;
  }

  /**
   * Check spending limits
   */
  private async checkSpendingLimits(
    card: Card,
    amount: number
  ): Promise<{ valid: boolean; reason?: string }> {
    // Per-transaction limit
    if (amount > card.spending_limit_per_transaction) {
      return { valid: false, reason: 'PER_TRANSACTION_LIMIT_EXCEEDED' };
    }

    // Daily limit
    const todaySpending = await this.getTodaySpending(card.id);
    if (todaySpending + amount > card.spending_limit_daily) {
      return { valid: false, reason: 'DAILY_LIMIT_EXCEEDED' };
    }

    // Monthly limit
    const monthlySpending = await this.getMonthlySpending(card.id);
    if (monthlySpending + amount > card.spending_limit_monthly) {
      return { valid: false, reason: 'MONTHLY_LIMIT_EXCEEDED' };
    }

    return { valid: true };
  }

  /**
   * Check for duplicate transactions
   */
  private async checkDuplicateTransaction(
    cardId: string,
    amount: number,
    merchantName: string
  ): Promise<boolean> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const duplicateCount = await this.cardTransactionsRepository.count({
      where: {
        card_id: cardId,
        amount: amount,
        merchant_name: merchantName,
        created_at: MoreThanOrEqual(fiveMinutesAgo),
        status: In(['AUTHORIZED', 'SETTLED']),
      },
    });

    return duplicateCount > 0;
  }

  /**
   * Check transaction velocity
   */
  private async checkTransactionVelocity(
    cardId: string
  ): Promise<{ valid: boolean; reason?: string }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const hourlyCount = await this.cardTransactionsRepository.count({
      where: {
        card_id: cardId,
        created_at: MoreThanOrEqual(oneHourAgo),
        status: In(['AUTHORIZED', 'SETTLED']),
      },
    });

    if (hourlyCount >= 10) {
      return { valid: false, reason: 'VELOCITY_LIMIT_EXCEEDED' };
    }

    return { valid: true };
  }

  /**
   * Validate Merchant Category Code
   */
  private validateMCC(
    card: Card,
    mcc: string
  ): { valid: boolean; reason?: string } {
    // Check if MCC is blocked for this card
    // (This would be configured per card or user preferences)
    const blockedMCCs = card.blocked_merchant_categories || [];

    if (blockedMCCs.includes(mcc)) {
      return { valid: false, reason: 'MCC_BLOCKED' };
    }

    return { valid: true };
  }

  /**
   * Generate authorization code (6 alphanumeric)
   */
  private generateAuthorizationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Decline response helper
   */
  private decline(reason: string): AuthorizationResponse {
    return {
      authorized: false,
      decline_reason: reason,
      timestamp: new Date(),
    };
  }

  /**
   * Simulate network latency
   */
  private async simulateNetworkLatency(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private async getTodaySpending(cardId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.cardTransactionsRepository
      .createQueryBuilder('txn')
      .select('SUM(txn.amount)', 'total')
      .where('txn.card_id = :cardId', { cardId })
      .andWhere('txn.created_at >= :today', { today })
      .andWhere('txn.status IN (:...statuses)', {
        statuses: ['AUTHORIZED', 'SETTLED']
      })
      .getRawOne();

    return parseInt(result?.total || '0');
  }

  private async getMonthlySpending(cardId: string): Promise<number> {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const result = await this.cardTransactionsRepository
      .createQueryBuilder('txn')
      .select('SUM(txn.amount)', 'total')
      .where('txn.card_id = :cardId', { cardId })
      .andWhere('txn.created_at >= :firstDayOfMonth', { firstDayOfMonth })
      .andWhere('txn.status IN (:...statuses)', {
        statuses: ['AUTHORIZED', 'SETTLED']
      })
      .getRawOne();

    return parseInt(result?.total || '0');
  }
}
```

**Test Card Numbers (Pre-configured):**

```typescript
export const TEST_CARDS = {
  // Always succeeds
  SUCCESS: {
    VISA: '4111111111111111',
    MASTERCARD: '5555555555554444',
    VERVE: '5061020000000000003',
  },

  // Always declines - insufficient funds
  INSUFFICIENT_FUNDS: {
    VISA: '4000000000000002',
  },

  // Always declines - invalid CVV
  INVALID_CVV: {
    VISA: '4000000000000010',
  },

  // Always declines - suspected fraud
  FRAUD: {
    VISA: '4100000000000019',
  },

  // 3D Secure required
  REQUIRE_3DS: {
    VISA: '4000000000000051',
  },
};
```

---

### 📘 User Story: US-6A.2.2 - Transaction Settlement & Batch Processing

**Story ID:** US-6A.2.2
**Feature:** FEATURE-17.3 (Mock Card Issuance)
**Epic:** EPIC-17 (Mock Provider Service)

**Story Points:** 8
**Priority:** P1 (High)
**Sprint:** Sprint 6A
**Status:** 🔄 Not Started

---

#### User Story

```
As a developer
I want realistic transaction settlement simulation
So that I can test authorization-to-settlement workflows
```

---

#### Acceptance Criteria

- [ ] **AC1:** Settle authorized transactions (batch processing)
- [ ] **AC2:** Simulate settlement delays (1-3 days)
- [ ] **AC3:** Convert authorization holds to actual debits
- [ ] **AC4:** Handle partial settlements
- [ ] **AC5:** Generate settlement reports
- [ ] **AC6:** Reversal of declined settlements
- [ ] **AC7:** Settlement retry for failed transactions
- [ ] **AC8:** Merchant settlement simulation
- [ ] **AC9:** Interchange fee calculation (mock)
- [ ] **AC10:** Settlement reconciliation

---

## Testing Requirements

**Unit Tests (40+ tests):**
- Card number generation (Luhn algorithm)
- CVV generation
- Expiry date generation and validation
- Card issuance
- Card lifecycle operations (freeze, unfreeze, terminate)
- Spending limit validation
- Transaction authorization (all decline reasons)
- Duplicate transaction detection
- Velocity checks
- MCC validation
- Balance checks
- Settlement processing

**Integration Tests (15 tests):**
- Full card issuance flow
- Card freeze → transaction decline → unfreeze → transaction success
- Spending limit enforcement
- Daily/monthly limit tracking
- Authorization → settlement flow
- Failed settlement reversal
- Concurrent transaction authorization

**E2E Tests (5 tests):**
- Complete card lifecycle (issue → use → freeze → unfreeze → terminate)
- Transaction flow (authorize → settle)
- Spending limit scenarios
- Decline reason testing
- Multi-card user scenario

---

## Summary of Sprint 6A Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-6A.1.1 | Mock Virtual Card Issuance | 13 | P0 | To Do |
| US-6A.1.2 | Card Lifecycle Management | 8 | P0 | To Do |
| US-6A.2.1 | Transaction Authorization Simulation | 13 | P0 | To Do |
| US-6A.2.2 | Transaction Settlement & Batch Processing | 8 | P1 | To Do |
| US-6A.3.1 | Test Card Numbers & Documentation | 3 | P2 | To Do |
| US-6A.3.2 | Provider Swap Interface Design | 3 | P1 | To Do |
| **Total** | | **48** | | |

---

## Sprint Velocity Tracking

**Planned Story Points:** 48 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

---

## Integration Points

**Integrates With:**
- **Sprint 10:** Virtual Cards feature will consume this mock service
- **Sprint 11:** Card management UI will use these APIs
- **Future:** Real provider swap (Stripe/Sudo/Paystack) in Phase 3

**Provider Interface (for future swapping):**

```typescript
export interface ICardIssuanceProvider {
  issueVirtualCard(dto: IssueVirtualCardDto): Promise<VirtualCardResponse>;
  freezeCard(cardId: string): Promise<void>;
  unfreezeCard(cardId: string): Promise<void>;
  terminateCard(cardId: string): Promise<void>;
  authorizeTransaction(dto: AuthorizeTransactionDto): Promise<AuthorizationResponse>;
  settleTransaction(transactionId: string): Promise<void>;
}

// Implementations
@Injectable()
export class MockCardIssuanceProvider implements ICardIssuanceProvider {
  // Mock implementation
}

@Injectable()
export class StripeCardIssuanceProvider implements ICardIssuanceProvider {
  // Real Stripe implementation (future)
}

@Injectable()
export class SudoCardIssuanceProvider implements ICardIssuanceProvider {
  // Real Sudo implementation (future)
}
```

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-6A.1 | Mock service too simplistic | Medium | Medium | Implement all real-world scenarios |
| RISK-6A.2 | Hard to swap to real provider later | Low | High | Interface-based design from start |
| RISK-6A.3 | Performance issues with large-scale testing | Low | Medium | Optimize database queries, use indexes |
| RISK-6A.4 | Security vulnerabilities in mock | Low | High | Encrypt sensitive data, audit logs |

---

## Definition of Done

- [ ] All acceptance criteria met for all stories
- [ ] Luhn algorithm implemented and tested
- [ ] All transaction scenarios covered (authorize, decline, settle)
- [ ] Spending limits enforced correctly
- [ ] Card lifecycle operations working
- [ ] 90%+ code coverage
- [ ] Integration tests passing
- [ ] API documentation complete
- [ ] Provider swap interface documented
- [ ] Code reviewed and merged
- [ ] Sprint demo completed

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Ready to Start
**Sprint Goal:** Production-grade mock card issuance service that enables full card feature development without provider costs
