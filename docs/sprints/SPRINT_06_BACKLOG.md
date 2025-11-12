# Sprint 6 Backlog - Withdrawals & Bill Payments

**Sprint:** Sprint 6
**Duration:** 2 weeks (Week 13-14)
**Sprint Goal:** Implement wallet withdrawal to bank accounts, bill payment services, and KYC verification workflows
**Story Points Committed:** 45
**Team Capacity:** 45 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1 (45 SP), Sprint 2 (42 SP), Sprint 3 (38 SP), Sprint 4 (45 SP), Sprint 5 (48 SP) = 43.6 SP, committed 45 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 6, we will have:
1. Wallet withdrawal to bank accounts (via Paystack)
2. Bank account verification (resolve account name)
3. Airtime and data purchase integration
4. Utility bill payments (electricity, cable TV)
5. KYC document upload and verification workflow
6. Transaction limits based on KYC tier enforcement
7. Withdrawal fee calculation and deduction
8. Bill payment history and receipts
9. Scheduled/recurring payments (optional)

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Bill payment provider tests passing
- [ ] Withdrawal reconciliation tests passing
- [ ] KYC workflow tests passing
- [ ] API documentation updated (Swagger)
- [ ] Postman collection updated
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-5: Withdrawals & Payouts

## FEATURE-5.1: Bank Account Withdrawals

### 📘 User Story: US-6.1.1 - Withdraw to Bank Account

**Story ID:** US-6.1.1
**Feature:** FEATURE-5.1 (Bank Account Withdrawals)
**Epic:** EPIC-5 (Withdrawals & Payouts)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 6
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to withdraw funds from my wallet to my bank account
So that I can access my money in cash or use it outside the platform
```

---

#### Business Value

**Value Statement:**
Withdrawals are essential for user trust and platform viability. Users must be able to access their funds freely. Without withdrawals, the platform is essentially a closed loop with no utility.

**Impact:**
- **Critical:** Core feature for user trust
- **Regulatory:** Required for e-money license compliance
- **User Retention:** Users won't deposit if they can't withdraw
- **Business Model:** Withdrawal fees are a revenue stream

**Success Criteria:**
- 95% of valid withdrawals succeed
- < 30 seconds withdrawal initiation time
- < 24 hours withdrawal settlement time
- Zero balance discrepancies
- Proper fee calculation and deduction

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can initiate withdrawal to bank account
- [ ] **AC2:** Bank account must be verified before withdrawal
- [ ] **AC3:** Amount must be >= minimum (NGN 100)
- [ ] **AC4:** Amount must be <= daily withdrawal limit (based on KYC tier)
- [ ] **AC5:** User must have sufficient wallet balance
- [ ] **AC6:** Withdrawal fee calculated and displayed
- [ ] **AC7:** Transaction PIN required for all withdrawals
- [ ] **AC8:** Withdrawal initiated via Paystack Transfer API
- [ ] **AC9:** Wallet debited immediately (pending status)
- [ ] **AC10:** On success: Transaction marked as completed
- [ ] **AC11:** On failure: Transaction marked as failed, wallet refunded
- [ ] **AC12:** User notified via email/SMS
- [ ] **AC13:** Transaction reference generated
- [ ] **AC14:** Idempotency: Duplicate withdrawals prevented
- [ ] **AC15:** Daily withdrawal limit enforced per user

**Security:**
- [ ] **AC16:** Transaction PIN verification required
- [ ] **AC17:** JWT authentication required
- [ ] **AC18:** Rate limiting: 10 withdrawal attempts per day per user
- [ ] **AC19:** Withdrawal to verified accounts only
- [ ] **AC20:** Audit log for all withdrawals

**Non-Functional:**
- [ ] **AC21:** Withdrawal initiation < 30 seconds
- [ ] **AC22:** Atomic wallet debit (ledger + balance)
- [ ] **AC23:** Webhook processing for transfer status
- [ ] **AC24:** Proper error messages for all failure scenarios
- [ ] **AC25:** Fee deduction transparent to user

---

#### Technical Specifications

**Endpoint:** `POST /api/v1/withdrawals/bank-account`

**Request:**
```typescript
{
  "bank_account_id": "uuid",     // User's verified bank account
  "amount": 50000,                // NGN 500.00 in kobo
  "currency": "NGN",
  "pin": "1234",                  // Transaction PIN
  "reason": "Personal use",       // Optional
  "idempotency_key": "uuid"       // Client-generated UUID
}
```

**Response (201 Created):**
```typescript
{
  "status": "success",
  "data": {
    "withdrawal": {
      "id": "uuid",
      "reference": "WDL-20240115103045-A3F5K9",
      "amount": 50000,
      "fee": 1000,                  // NGN 10.00 fee
      "net_amount": 49000,          // Amount sent to bank
      "currency": "NGN",
      "status": "pending",
      "bank_account": {
        "account_number": "0123456789",
        "account_name": "John Doe",
        "bank_name": "GTBank"
      },
      "estimated_settlement": "2024-01-15T12:00:00Z",
      "created_at": "2024-01-15T10:30:45Z"
    },
    "balance": {
      "available": 950000,          // Updated balance after withdrawal
      "ledger": 950000
    },
    "message": "Withdrawal initiated successfully"
  }
}
```

**Error Response (400 - Insufficient Balance):**
```typescript
{
  "status": "error",
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient wallet balance",
    "details": {
      "required": 51000,            // amount + fee
      "available": 45000
    }
  }
}
```

**Error Response (403 - Daily Limit Exceeded):**
```typescript
{
  "status": "error",
  "error": {
    "code": "DAILY_LIMIT_EXCEEDED",
    "message": "Daily withdrawal limit exceeded",
    "details": {
      "limit": 1000000,             // NGN 10,000 per day
      "used": 980000,
      "remaining": 20000,
      "resets_at": "2024-01-16T00:00:00Z"
    }
  }
}
```

---

#### Implementation Details

**Withdrawal Fee Structure:**
```typescript
const withdrawalFees = {
  NGN: {
    0: 100,        // KYC Tier 0: NGN 100 flat
    1: 50,         // KYC Tier 1: NGN 50 flat
    2: 25,         // KYC Tier 2: NGN 25 flat
    3: 0,          // KYC Tier 3: Free
  },
  USD: {
    0: 5,
    1: 2,
    2: 1,
    3: 0,
  },
};
```

**Daily Withdrawal Limits:**
```typescript
const dailyWithdrawalLimits = {
  NGN: {
    0: 5000000,       // NGN 50,000
    1: 20000000,      // NGN 200,000
    2: 100000000,     // NGN 1,000,000
    3: 500000000,     // NGN 5,000,000
  },
  USD: {
    0: 100,
    1: 500,
    2: 2000,
    3: 10000,
  },
};
```

**Paystack Transfer API Integration:**

```typescript
@Injectable()
export class WithdrawalService {
  async initiateWithdrawal(
    userId: string,
    dto: CreateWithdrawalDto
  ): Promise<Withdrawal> {
    // 1. Verify transaction PIN
    await this.verifyTransactionPin(userId, dto.pin);

    // 2. Get user and bank account
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const bankAccount = await this.bankAccountsRepository.findOne({
      where: { id: dto.bank_account_id, user_id: userId, verified: true }
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found or not verified');
    }

    // 3. Get wallet
    const wallet = await this.walletsRepository.findOne({
      where: { user_id: userId, currency: dto.currency }
    });

    // 4. Calculate fee
    const fee = this.calculateWithdrawalFee(dto.amount, user.kyc_tier, dto.currency);
    const totalDebit = dto.amount + fee;

    // 5. Check sufficient balance
    if (BigInt(wallet.available_balance) < BigInt(totalDebit)) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_BALANCE',
        required: totalDebit,
        available: wallet.available_balance,
      });
    }

    // 6. Check daily limit
    const todayWithdrawals = await this.getTodayWithdrawalTotal(userId, dto.currency);
    const dailyLimit = this.getDailyWithdrawalLimit(user.kyc_tier, dto.currency);

    if (todayWithdrawals + dto.amount > dailyLimit) {
      throw new ForbiddenException({
        code: 'DAILY_LIMIT_EXCEEDED',
        limit: dailyLimit,
        used: todayWithdrawals,
        remaining: dailyLimit - todayWithdrawals,
      });
    }

    // 7. Generate reference
    const reference = this.generateWithdrawalReference();

    // 8. Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 9. Create transaction record
      const transaction = await queryRunner.manager.save(Transaction, {
        user_id: userId,
        type: TransactionType.WITHDRAWAL,
        category: TransactionCategory.BANK_WITHDRAWAL,
        amount: dto.amount,
        fee: fee,
        net_amount: dto.amount - fee,  // Net is less because fee is kept by platform
        currency: dto.currency,
        status: TransactionStatus.PENDING,
        description: dto.reason || 'Bank withdrawal',
        source_wallet_id: wallet.id,
        reference,
        idempotency_key: dto.idempotency_key,
      });

      // 10. Create withdrawal record
      const withdrawal = await queryRunner.manager.save(Withdrawal, {
        transaction_id: transaction.id,
        bank_account_id: bankAccount.id,
        amount: dto.amount,
        fee: fee,
        net_amount: dto.amount - fee,
      });

      // 11. Debit wallet via ledger (amount + fee)
      await this.ledgerService.createLedgerEntries(queryRunner, {
        transaction_id: transaction.id,
        entries: [
          // Debit wallet for withdrawal amount
          {
            wallet_id: wallet.id,
            entry_type: LedgerEntryType.DEBIT,
            amount: dto.amount,
            description: `Withdrawal to ${bankAccount.bank_name} ${bankAccount.account_number}`,
          },
          // Debit wallet for fee
          {
            wallet_id: wallet.id,
            entry_type: LedgerEntryType.DEBIT,
            amount: fee,
            description: 'Withdrawal fee',
          },
        ],
      });

      // 12. Initiate Paystack transfer
      const transferRecipient = await this.paystackService.createTransferRecipient({
        type: 'nuban',
        name: bankAccount.account_name,
        account_number: bankAccount.account_number,
        bank_code: bankAccount.bank_code,
        currency: dto.currency,
      });

      const transfer = await this.paystackService.initiateTransfer({
        source: 'balance',
        amount: dto.amount - fee,  // Send net amount
        recipient: transferRecipient.recipient_code,
        reason: dto.reason || 'Withdrawal',
        reference: reference,
      });

      // 13. Update withdrawal with Paystack reference
      await queryRunner.manager.update(Withdrawal,
        { id: withdrawal.id },
        {
          provider_reference: transfer.transfer_code,
        }
      );

      await queryRunner.commitTransaction();

      // 14. Send notification
      this.notificationService.sendWithdrawalInitiatedNotification(
        user,
        withdrawal,
        bankAccount
      ).catch(err => this.logger.error(err));

      // 15. Audit log
      await this.auditLogService.log({
        user_id: userId,
        action: 'WITHDRAWAL_INITIATED',
        resource: 'Withdrawal',
        resource_id: withdrawal.id,
      });

      return withdrawal;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private generateWithdrawalReference(): string {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WDL-${timestamp}-${random}`;
  }

  private calculateWithdrawalFee(amount: number, kycTier: number, currency: string): number {
    // Fee structure based on KYC tier
    const fees = {
      NGN: { 0: 10000, 1: 5000, 2: 2500, 3: 0 },
      USD: { 0: 500, 1: 200, 2: 100, 3: 0 },
    };

    return fees[currency]?.[kycTier] || fees[currency][0];
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
}
```

**Paystack Transfer Webhook Handler:**

```typescript
private async handleTransferSuccess(data: any) {
  const transaction = await this.transactionsRepository.findOne({
    where: { reference: data.reference },
    relations: ['user', 'withdrawal', 'withdrawal.bank_account'],
  });

  if (!transaction) {
    this.logger.error(`Transaction not found: ${data.reference}`);
    return;
  }

  if (transaction.status === TransactionStatus.COMPLETED) {
    return; // Already processed
  }

  // Update transaction status
  await this.transactionsRepository.update(
    { id: transaction.id },
    {
      status: TransactionStatus.COMPLETED,
      completed_at: new Date(),
    }
  );

  // Send notification
  this.notificationService.sendWithdrawalCompletedNotification(
    transaction.user,
    transaction.withdrawal
  ).catch(err => this.logger.error(err));

  // Audit log
  await this.auditLogService.log({
    user_id: transaction.user_id,
    action: 'WITHDRAWAL_COMPLETED',
    resource: 'Withdrawal',
    resource_id: transaction.withdrawal.id,
  });
}

private async handleTransferFailed(data: any) {
  const transaction = await this.transactionsRepository.findOne({
    where: { reference: data.reference },
    relations: ['user', 'withdrawal', 'source_wallet'],
  });

  if (!transaction) {
    return;
  }

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Update transaction status
    await queryRunner.manager.update(Transaction,
      { id: transaction.id },
      {
        status: TransactionStatus.FAILED,
        failure_reason: data.message || 'Transfer failed',
      }
    );

    // Refund wallet (reverse the debit)
    await this.ledgerService.createLedgerEntries(queryRunner, {
      transaction_id: transaction.id,
      entries: [
        // Credit back withdrawal amount
        {
          wallet_id: transaction.source_wallet_id,
          entry_type: LedgerEntryType.CREDIT,
          amount: transaction.amount,
          description: 'Withdrawal failed - refund',
        },
        // Credit back fee
        {
          wallet_id: transaction.source_wallet_id,
          entry_type: LedgerEntryType.CREDIT,
          amount: transaction.fee,
          description: 'Withdrawal fee refund',
        },
      ],
    });

    await queryRunner.commitTransaction();

    // Send notification
    this.notificationService.sendWithdrawalFailedNotification(
      transaction.user,
      transaction.withdrawal,
      data.message
    ).catch(err => this.logger.error(err));

    // Audit log
    await this.auditLogService.log({
      user_id: transaction.user_id,
      action: 'WITHDRAWAL_FAILED',
      resource: 'Withdrawal',
      resource_id: transaction.withdrawal.id,
      metadata: { reason: data.message },
    });

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

---

#### Testing Requirements

**Unit Tests (16 tests):**
- Initialize withdrawal with valid data
- Verify transaction PIN
- Calculate withdrawal fee correctly
- Enforce daily withdrawal limits
- Check sufficient balance (including fee)
- Generate unique reference
- Create transaction record
- Debit wallet via ledger
- Paystack transfer initiation
- Webhook signature verification
- Handle transfer success
- Handle transfer failure
- Refund on failure
- Idempotency check
- Notification sent
- Audit log created

**Integration Tests (8 tests):**
- Full withdrawal flow (initiate → webhook → completion)
- Withdrawal failure and refund flow
- Concurrent withdrawal handling
- Daily limit enforcement across multiple withdrawals
- KYC tier fee calculation
- Transaction rollback on Paystack error
- Webhook retry handling
- Balance reconciliation

**Security Tests (5 tests):**
- Invalid PIN rejected
- Unverified bank account rejected
- Rate limiting enforcement
- Unauthorized access prevention
- Webhook signature validation

**E2E Tests (3 tests):**
- Complete withdrawal journey (test bank account)
- Failed withdrawal handling
- Daily limit reached scenario

---

#### Tasks Breakdown

**Task 1: Create Withdrawal Schema (2 SP)**
- Create withdrawals table
- Add withdrawal-related columns
- Create TypeORM entity

**Task 2: Implement Bank Account Verification (3 SP)**
- Paystack account name resolution API
- Verify and save bank account
- Display verification status

**Task 3: Implement Withdrawal Service (4 SP)**
- Withdrawal initiation logic
- Fee calculation
- Daily limit checking
- Wallet debit via ledger

**Task 4: Implement Paystack Transfer Integration (2 SP)**
- Create transfer recipient
- Initiate transfer
- Handle transfer webhooks

**Task 5: Implement Withdrawal Endpoints (2 SP)**
- POST /withdrawals/bank-account
- GET /withdrawals
- GET /withdrawals/:id

---

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] Paystack transfer integration working
- [ ] Bank account verification working
- [ ] Withdrawal webhooks handled
- [ ] Refund on failure working
- [ ] All tests passing (32+ tests)
- [ ] API documentation complete
- [ ] Code reviewed and merged

---

## FEATURE-5.2: Bank Account Verification

### 📘 User Story: US-6.2.1 - Verify Bank Account

**Story ID:** US-6.2.1
**Feature:** FEATURE-5.2 (Bank Account Verification)
**Epic:** EPIC-5 (Withdrawals & Payouts)

**Story Points:** 5
**Priority:** P0 (Critical)
**Sprint:** Sprint 6
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to add and verify my bank account
So that I can withdraw funds securely to the correct account
```

---

#### Business Value

**Value Statement:**
Bank account verification prevents withdrawals to wrong accounts, reduces fraud, and ensures compliance. Account name resolution via Paystack provides instant verification.

**Impact:**
- **Critical:** Prevents costly withdrawal errors
- **Fraud Prevention:** Ensures account ownership
- **User Trust:** Users see verified checkmark
- **Compliance:** KYC requirement for withdrawals

**Success Criteria:**
- 100% of valid accounts verified successfully
- < 3 seconds account verification time
- Zero withdrawals to unverified accounts
- Account name mismatch detected

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can add bank account (bank code + account number)
- [ ] **AC2:** System resolves account name via Paystack
- [ ] **AC3:** User confirms account name matches
- [ ] **AC4:** Account marked as verified after confirmation
- [ ] **AC5:** User can view all saved accounts
- [ ] **AC6:** User can remove saved accounts
- [ ] **AC7:** User can set default account
- [ ] **AC8:** List of Nigerian banks available
- [ ] **AC9:** Account number validated (10 digits for Nigerian banks)
- [ ] **AC10:** Duplicate accounts prevented

**Non-Functional:**
- [ ] **AC11:** Account resolution < 3 seconds
- [ ] **AC12:** Rate limiting: 5 verifications per hour
- [ ] **AC13:** Audit log for account additions
- [ ] **AC14:** Proper error messages

---

#### Technical Specifications

**Endpoint:** `POST /api/v1/bank-accounts/verify`

**Request:**
```typescript
{
  "account_number": "0123456789",
  "bank_code": "058"              // Paystack bank code
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "account_number": "0123456789",
    "account_name": "JOHN DOE",
    "bank_name": "GTBank",
    "bank_code": "058"
  }
}
```

**Save Account Endpoint:** `POST /api/v1/bank-accounts`

**Request:**
```typescript
{
  "account_number": "0123456789",
  "account_name": "John Doe",
  "bank_code": "058",
  "is_default": true
}
```

---

## FEATURE-5.3: Bill Payments

### 📘 User Story: US-6.3.1 - Airtime & Data Purchase

**Story ID:** US-6.3.1
**Feature:** FEATURE-5.3 (Bill Payments)
**Epic:** EPIC-6 (Bill Payments & Services)

**Story Points:** 8
**Priority:** P1 (High)
**Sprint:** Sprint 6
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to purchase airtime and data bundles
So that I can recharge my phone directly from my wallet
```

---

#### Business Value

**Value Statement:**
Bill payments increase platform stickiness and transaction volume. Users prefer all-in-one platforms. Commission on bill payments provides additional revenue.

**Impact:**
- **High:** Increases user engagement
- **Revenue:** Commission on each transaction (1-5%)
- **Retention:** Users stay on platform for multiple services
- **Network Effect:** More services = more valuable

**Success Criteria:**
- 98% of airtime purchases succeed
- < 5 seconds purchase completion time
- Support all major Nigerian networks (MTN, Airtel, Glo, 9mobile)
- Real-time delivery confirmation

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can purchase airtime (NGN 50 - NGN 50,000)
- [ ] **AC2:** User can purchase data bundles
- [ ] **AC3:** Support for MTN, Airtel, Glo, 9mobile
- [ ] **AC4:** List available data plans per network
- [ ] **AC5:** Transaction PIN required for amount > NGN 5,000
- [ ] **AC6:** Wallet debited immediately
- [ ] **AC7:** Bill payment provider called (VTPass or Flutterwave)
- [ ] **AC8:** On success: Transaction completed, confirmation sent
- [ ] **AC9:** On failure: Wallet refunded, user notified
- [ ] **AC10:** Purchase history available
- [ ] **AC11:** Save beneficiary (phone number)
- [ ] **AC12:** Commission/markup applied transparently

**Non-Functional:**
- [ ] **AC13:** Purchase completion < 5 seconds
- [ ] **AC14:** Rate limiting: 20 purchases per day
- [ ] **AC15:** Idempotency: Duplicate purchases prevented
- [ ] **AC16:** Atomic wallet debit and refund

---

#### Technical Specifications

**Endpoint:** `POST /api/v1/bills/airtime`

**Request:**
```typescript
{
  "phone_number": "08012345678",
  "network": "mtn",                // mtn, airtel, glo, 9mobile
  "amount": 10000,                 // NGN 100.00 in kobo
  "pin": "1234"                    // Required if amount > 5000
}
```

**Response (201 Created):**
```typescript
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "uuid",
      "reference": "BIL-20240115103045-A3F5K9",
      "type": "airtime",
      "amount": 10000,
      "status": "completed",
      "phone_number": "08012345678",
      "network": "mtn",
      "created_at": "2024-01-15T10:30:45Z"
    },
    "balance": 940000
  }
}
```

**Data Bundle Endpoint:** `POST /api/v1/bills/data`

**Request:**
```typescript
{
  "phone_number": "08012345678",
  "network": "mtn",
  "plan_code": "MTN-1GB-30DAYS",
  "pin": "1234"
}
```

---

### 📘 User Story: US-6.3.2 - Utility Bill Payments

**Story ID:** US-6.3.2
**Feature:** FEATURE-5.3 (Bill Payments)
**Epic:** EPIC-6 (Bill Payments & Services)

**Story Points:** 8
**Priority:** P2 (Medium)
**Sprint:** Sprint 6
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to pay utility bills (electricity, cable TV)
So that I can manage all my bills from one platform
```

---

#### Acceptance Criteria

- [ ] **AC1:** Electricity bill payment (prepaid/postpaid)
- [ ] **AC2:** Cable TV subscription (DSTV, GOTV, Startimes)
- [ ] **AC3:** Validate meter/smartcard number
- [ ] **AC4:** Display customer name before payment
- [ ] **AC5:** List available subscription plans
- [ ] **AC6:** Transaction PIN required
- [ ] **AC7:** Instant token delivery (electricity)
- [ ] **AC8:** Subscription activation (cable TV)
- [ ] **AC9:** Receipt generation
- [ ] **AC10:** Refund on failure

---

## FEATURE-5.4: KYC Verification

### 📘 User Story: US-6.4.1 - KYC Document Upload

**Story ID:** US-6.4.1
**Feature:** FEATURE-5.4 (KYC Verification)
**Epic:** EPIC-7 (Compliance & KYC)

**Story Points:** 8
**Priority:** P1 (High)
**Sprint:** Sprint 6
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to upload KYC documents to verify my identity
So that I can increase my transaction limits
```

---

#### Business Value

**Value Statement:**
KYC verification is required for regulatory compliance and enables higher transaction limits. Automated KYC via identity verification APIs reduces manual review time.

**Impact:**
- **Compliance:** Required for e-money license
- **Risk Management:** Reduces fraud
- **Revenue:** Higher KYC = higher limits = more transactions
- **Regulation:** CBN requirement for financial services

**Success Criteria:**
- 90% of documents verified within 24 hours
- < 1 minute document upload time
- Support for BVN, NIN, Driver's License, Passport
- Automated verification where possible

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can upload ID document (front and back)
- [ ] **AC2:** Support for: BVN, NIN, Driver's License, International Passport
- [ ] **AC3:** User can upload selfie for liveness check
- [ ] **AC4:** User can enter document details (ID number, expiry date)
- [ ] **AC5:** Documents uploaded to secure storage (AWS S3)
- [ ] **AC6:** Automated verification via provider (Smile ID, Youverify)
- [ ] **AC7:** Manual review for failed automated verification
- [ ] **AC8:** User notified of verification status
- [ ] **AC9:** KYC tier upgraded on approval
- [ ] **AC10:** Transaction limits updated automatically
- [ ] **AC11:** Document expiry tracking
- [ ] **AC12:** Re-verification for expired documents

**Security:**
- [ ] **AC13:** Documents encrypted at rest
- [ ] **AC14:** Access logged and audited
- [ ] **AC15:** PII redaction in logs
- [ ] **AC16:** Secure file upload (signed URLs)

**Non-Functional:**
- [ ] **AC17:** File upload < 1 minute (up to 5MB)
- [ ] **AC18:** Automated verification < 2 minutes
- [ ] **AC19:** Image format validation (JPG, PNG, PDF)
- [ ] **AC20:** File size limit: 5MB per file

---

#### Technical Specifications

**Endpoint:** `POST /api/v1/kyc/documents/upload`

**Request (Multipart Form):**
```typescript
{
  "document_type": "nin",           // bvn, nin, drivers_license, passport
  "document_number": "12345678901",
  "document_front": File,           // Image file
  "document_back": File,            // Image file (optional)
  "selfie": File,                   // Selfie image
  "expiry_date": "2030-12-31"       // Optional
}
```

**Response (201 Created):**
```typescript
{
  "status": "success",
  "data": {
    "kyc_document": {
      "id": "uuid",
      "document_type": "nin",
      "document_number": "***********901",  // Masked
      "verification_status": "pending",
      "submitted_at": "2024-01-15T10:30:45Z",
      "estimated_completion": "2024-01-16T10:30:45Z"
    },
    "current_kyc_tier": 0,
    "next_kyc_tier": 2
  }
}
```

**BVN Verification Endpoint:** `POST /api/v1/kyc/bvn/verify`

**Request:**
```typescript
{
  "bvn": "22222222222",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "phone_number": "08012345678"
}
```

**Response:**
```typescript
{
  "status": "success",
  "data": {
    "verified": true,
    "match_score": 100,
    "details": {
      "first_name": "JOHN",
      "last_name": "DOE",
      "phone_number": "08012345678",
      "date_of_birth": "1990-01-01"
    }
  }
}
```

---

## Summary of Sprint 6 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-6.1.1 | Withdraw to Bank Account | 13 | P0 | To Do |
| US-6.2.1 | Verify Bank Account | 5 | P0 | To Do |
| US-6.3.1 | Airtime & Data Purchase | 8 | P1 | To Do |
| US-6.3.2 | Utility Bill Payments | 8 | P2 | To Do |
| US-6.4.1 | KYC Document Upload | 8 | P1 | To Do |
| **Total** | | **42** | | |

**Note:** 3 SP buffer for unexpected issues

---

## Sprint Velocity Tracking

**Planned Story Points:** 45 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

---

## Dependencies

**External:**
- Paystack transfer API access
- Bill payment provider account (VTPass or Flutterwave Bills)
- KYC verification provider (Smile ID, Youverify, or Dojah)
- AWS S3 for document storage
- Nigerian banks list

**Internal:**
- Sprint 1: Database entities, encryption, authentication
- Sprint 4: Double-entry ledger system
- Sprint 5: Payment processing, transaction management, PIN verification
- Sprint 5: Wallet debit functionality

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-6.1 | Paystack transfer failures | Medium | High | Implement retry logic, manual fallback process |
| RISK-6.2 | Bill payment provider downtime | Medium | High | Queue failed payments, automatic retry |
| RISK-6.3 | KYC verification delays | High | Medium | Set user expectations, provide status updates |
| RISK-6.4 | Withdrawal fraud | Low | Critical | Transaction PIN, velocity checks, anomaly detection |
| RISK-6.5 | Insufficient Paystack balance for withdrawals | Medium | High | Balance alerts, top-up automation |

---

## Notes & Decisions

**Technical Decisions:**
1. **Paystack for withdrawals:** Simpler than direct bank integration
2. **VTPass for bill payments:** Best coverage of Nigerian services
3. **Smile ID for KYC:** Good balance of cost and accuracy
4. **AWS S3 for documents:** Secure, scalable, compliant
5. **Withdrawal fee structure:** Tiered by KYC level to encourage verification

**Open Questions:**
1. ❓ Withdrawal fee: Flat or percentage? **Decision: Flat fee based on KYC tier**
2. ❓ Bill payment markup: How much? **Decision: 1-2% on top of provider cost**
3. ❓ KYC manual review: In-house or outsourced? **Decision: Start with outsourced**
4. ❓ Withdrawal limits: Daily or per transaction? **Decision: Daily cumulative**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Enable users to withdraw funds and pay bills directly from wallet
