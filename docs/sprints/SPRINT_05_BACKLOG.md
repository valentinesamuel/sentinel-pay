# Sprint 5 Backlog - Payment Processing & Transaction Operations

**Sprint:** Sprint 5
**Duration:** 2 weeks (Week 11-12)
**Sprint Goal:** Implement payment processing flows, card payments, bank transfers, and transaction lifecycle management
**Story Points Committed:** 48
**Team Capacity:** 48 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1 (45 SP), Sprint 2 (42 SP), Sprint 3 (38 SP), Sprint 4 (45 SP) = 42.5 SP, committed 48 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 5, we will have:
1. Card payment processing with Paystack integration
2. Bank transfer (deposit) functionality
3. P2P wallet transfers (internal)
4. Transaction status management (pending, completed, failed)
5. Transaction reversals and refunds
6. Payment method management (add/remove cards)
7. Transaction history and filtering
8. Real-time payment notifications via webhooks
9. Payment receipt generation

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Payment gateway integration tests passing
- [ ] Webhook tests passing
- [ ] Transaction reconciliation tests passing
- [ ] API documentation updated (Swagger)
- [ ] Postman collection updated
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-4: Payment Processing

## FEATURE-4.1: Card Payment Processing

### 📘 User Story: US-5.1.1 - Card Payment with Paystack

**Story ID:** US-5.1.1
**Feature:** FEATURE-4.1 (Card Payment Processing)
**Epic:** EPIC-4 (Payment Processing)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 5
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to fund my wallet using a debit/credit card via Paystack
So that I can add money to my account and make payments
```

---

#### Business Value

**Value Statement:**
Card payment is the primary funding method for users. Integration with Paystack enables secure card processing without PCI-DSS compliance burden. Essential for platform revenue and user acquisition.

**Impact:**
- **Critical:** Primary revenue stream for the platform
- **User Experience:** Instant funding (compared to bank transfers)
- **Business Metric:** Enables GMV (Gross Merchandise Value) growth
- **Compliance:** Paystack handles PCI-DSS compliance

**Success Criteria:**
- 95% of valid card payments succeed
- < 5 seconds payment completion time
- Zero security vulnerabilities in payment flow
- 100% webhook delivery for payment status updates
- Proper error handling for declined cards

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can initiate card payment with amount
- [ ] **AC2:** Amount must be >= minimum (NGN 100 / $1)
- [ ] **AC3:** Amount must be <= maximum per transaction (based on KYC tier)
- [ ] **AC4:** Payment initialized with Paystack
- [ ] **AC5:** User redirected to Paystack payment page
- [ ] **AC6:** User completes payment on Paystack
- [ ] **AC7:** Webhook received from Paystack with payment status
- [ ] **AC8:** On success: Transaction marked as completed
- [ ] **AC9:** On success: Wallet balance updated via ledger
- [ ] **AC10:** On success: User notified via email
- [ ] **AC11:** On failure: Transaction marked as failed with reason
- [ ] **AC12:** On failure: User notified with error message
- [ ] **AC13:** Transaction reference generated (TXN-{timestamp}-{random})
- [ ] **AC14:** Idempotency: Duplicate payments prevented
- [ ] **AC15:** Payment metadata stored (card type, last 4 digits, bank)

**Security:**
- [ ] **AC16:** No card details stored in our database
- [ ] **AC17:** Paystack signature verification on webhooks
- [ ] **AC18:** HTTPS required for payment initialization
- [ ] **AC19:** Transaction amounts in minor units (kobo) to prevent decimal errors
- [ ] **AC20:** Rate limiting: 10 payment attempts per hour per user

**Non-Functional:**
- [ ] **AC21:** Payment initialization response time < 2 seconds
- [ ] **AC22:** Webhook processing time < 1 second
- [ ] **AC23:** Atomic wallet updates (ledger + balance)
- [ ] **AC24:** Audit log for all payment events
- [ ] **AC25:** Proper error messages for all failure scenarios

---

#### Technical Specifications

**Endpoint:** `POST /api/v1/payments/card/initialize`

**Request:**
```typescript
{
  "amount": 10000,           // NGN 100.00 in kobo
  "currency": "NGN",
  "wallet_id": "uuid",       // Destination wallet
  "callback_url": "https://app.example.com/payment/callback",
  "metadata": {
    "source": "web",
    "device_id": "uuid"
  }
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "uuid",
      "reference": "TXN-20240115103045-A3F5K9",
      "amount": 10000,
      "currency": "NGN",
      "status": "pending",
      "created_at": "2024-01-15T10:30:45Z"
    },
    "payment": {
      "authorization_url": "https://checkout.paystack.com/abc123",
      "access_code": "abc123xyz",
      "reference": "PSK_abc123xyz"
    },
    "message": "Please complete payment on Paystack"
  }
}
```

**Paystack Webhook Payload:**
```typescript
{
  "event": "charge.success",
  "data": {
    "id": 123456,
    "reference": "TXN-20240115103045-A3F5K9",
    "amount": 10000,
    "currency": "NGN",
    "status": "success",
    "paid_at": "2024-01-15T10:31:00Z",
    "channel": "card",
    "authorization": {
      "authorization_code": "AUTH_xyz123",
      "card_type": "visa",
      "last4": "1234",
      "exp_month": "12",
      "exp_year": "2025",
      "bank": "Test Bank",
      "reusable": true
    },
    "customer": {
      "email": "user@example.com"
    },
    "metadata": {
      "source": "web",
      "device_id": "uuid"
    }
  }
}
```

**Webhook Endpoint:** `POST /api/v1/webhooks/paystack`

---

#### Implementation Details

**Paystack Integration Flow:**

1. **Payment Initialization:**
   - Validate amount and wallet
   - Create transaction record (status: pending)
   - Call Paystack Initialize Transaction API
   - Return authorization URL to frontend
   - Store Paystack reference

2. **User Payment:**
   - Redirect user to Paystack payment page
   - User enters card details on Paystack
   - Paystack processes payment
   - Paystack redirects back to callback URL

3. **Webhook Processing:**
   - Receive webhook from Paystack
   - Verify webhook signature (HMAC SHA512)
   - Extract transaction reference
   - Find transaction in database
   - Update transaction status
   - If success: Update wallet balance via ledger
   - Send notification to user
   - Return 200 OK to Paystack

**Database Changes:**
```sql
-- Add Paystack-specific columns to payments table
ALTER TABLE payments ADD COLUMN paystack_reference VARCHAR(100);
ALTER TABLE payments ADD COLUMN authorization_code VARCHAR(100);
ALTER TABLE payments ADD COLUMN card_last4 VARCHAR(4);
ALTER TABLE payments ADD COLUMN card_type VARCHAR(20);
ALTER TABLE payments ADD COLUMN card_bank VARCHAR(100);
```

**Paystack Service Implementation:**
```typescript
@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
  }

  async initializeTransaction(data: InitializePaymentDto): Promise<PaystackInitResponse> {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email: data.email,
        amount: data.amount, // in kobo
        currency: data.currency,
        reference: data.reference,
        callback_url: data.callback_url,
        metadata: data.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    const response = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      }
    );

    return response.data;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }
}
```

**Webhook Handler:**
```typescript
@Post('webhooks/paystack')
@HttpCode(200)
async handlePaystackWebhook(
  @Body() payload: PaystackWebhookDto,
  @Headers('x-paystack-signature') signature: string,
  @Req() request: Request
) {
  // 1. Verify signature
  const isValid = this.paystackService.verifyWebhookSignature(
    JSON.stringify(request.body),
    signature
  );

  if (!isValid) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  // 2. Handle event
  switch (payload.event) {
    case 'charge.success':
      await this.handleChargeSuccess(payload.data);
      break;
    case 'charge.failed':
      await this.handleChargeFailed(payload.data);
      break;
    default:
      this.logger.log(`Unhandled event: ${payload.event}`);
  }

  return { status: 'success' };
}

private async handleChargeSuccess(data: any) {
  const transaction = await this.transactionsRepository.findOne({
    where: { reference: data.reference }
  });

  if (!transaction) {
    throw new NotFoundException('Transaction not found');
  }

  if (transaction.status === 'completed') {
    return; // Already processed (idempotent)
  }

  // Start database transaction
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Update transaction
    await queryRunner.manager.update(Transaction,
      { id: transaction.id },
      {
        status: TransactionStatus.COMPLETED,
        completed_at: new Date(data.paid_at),
        provider_reference: data.reference,
      }
    );

    // Update payment metadata
    await queryRunner.manager.update(Payment,
      { transaction_id: transaction.id },
      {
        authorization_code: data.authorization.authorization_code,
        card_last4: data.authorization.last4,
        card_type: data.authorization.card_type,
        card_bank: data.authorization.bank,
      }
    );

    // Update wallet balance via ledger
    await this.ledgerService.createLedgerEntries(queryRunner, {
      transaction_id: transaction.id,
      entries: [
        {
          account_id: transaction.destination_wallet_id,
          entry_type: LedgerEntryType.CREDIT,
          amount: transaction.amount,
          description: `Card payment - ${data.authorization.card_type} ****${data.authorization.last4}`,
        },
      ],
    });

    await queryRunner.commitTransaction();

    // Send notification
    await this.notificationService.sendPaymentSuccessNotification(
      transaction.user_id,
      transaction
    );

    // Audit log
    await this.auditLogService.log({
      user_id: transaction.user_id,
      action: 'PAYMENT_COMPLETED',
      resource: 'Transaction',
      resource_id: transaction.id,
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

**Unit Tests (15 tests):**
- Initialize payment with valid data
- Validate minimum amount
- Validate maximum amount per KYC tier
- Generate unique transaction reference
- Paystack API call successful
- Paystack API call failed
- Webhook signature verification (valid)
- Webhook signature verification (invalid)
- Handle charge.success event
- Handle charge.failed event
- Idempotent webhook processing
- Ledger entry creation
- Wallet balance update
- Notification sent
- Audit log created

**Integration Tests (8 tests):**
- Full payment flow (initialize → webhook → wallet update)
- Concurrent payment handling
- Duplicate webhook handling (idempotency)
- Transaction rollback on error
- Multiple currency support
- KYC tier limit enforcement
- Webhook retry handling
- Payment verification fallback

**Security Tests (5 tests):**
- Invalid webhook signature rejected
- Tampered payload rejected
- Rate limiting enforcement
- Amount manipulation prevention
- HTTPS requirement

**E2E Tests (3 tests):**
- Complete card payment journey (using Paystack test cards)
- Failed payment handling
- Payment callback handling

---

#### Tasks Breakdown

**Task 1: Setup Paystack Integration (3 SP)**
- Register Paystack account
- Get API keys (test and live)
- Configure webhook URL
- Test API connectivity
- Implement PaystackService

**Task 2: Implement Payment Initialization (3 SP)**
- Create initialize payment endpoint
- Validate amount and wallet
- Create transaction record
- Call Paystack API
- Return authorization URL

**Task 3: Implement Webhook Handler (4 SP)**
- Create webhook endpoint
- Verify webhook signature
- Handle charge.success event
- Handle charge.failed event
- Transaction status updates

**Task 4: Implement Wallet Update Logic (3 SP)**
- Ledger entry creation
- Wallet balance update
- Atomic transaction handling
- Rollback on error

**Task 5: Implement Notifications (1 SP)**
- Payment success email
- Payment failed email
- SMS notifications (optional)

**Task 6: Testing & Documentation (2 SP)**
- Unit tests
- Integration tests
- Swagger documentation
- Postman collection

---

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] Paystack integration working (test mode)
- [ ] Webhook processing working
- [ ] Wallet updates working
- [ ] All tests passing (31+ tests)
- [ ] API documentation complete
- [ ] Postman collection updated
- [ ] Security audit passed
- [ ] Code reviewed and merged

---

## FEATURE-4.2: Bank Transfer (Deposits)

### 📘 User Story: US-5.2.1 - Bank Transfer Deposits

**Story ID:** US-5.2.1
**Feature:** FEATURE-4.2 (Bank Transfer Deposits)
**Epic:** EPIC-4 (Payment Processing)

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 5
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to fund my wallet via bank transfer
So that I can add money without using a card
```

---

#### Business Value

**Value Statement:**
Bank transfers provide an alternative funding method for users who prefer traditional banking or don't have cards. Critical for enterprise/business users with higher transaction volumes.

**Impact:**
- **High:** Serves users without cards or with large deposits
- **Lower Fees:** Bank transfers typically cheaper than card payments
- **Business Growth:** Enables B2B payments and larger transactions

**Success Criteria:**
- Unique virtual account assigned to each user
- Automatic payment detection and wallet crediting
- < 5 minute deposit confirmation after bank transfer
- 100% of valid transfers credited correctly

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Each user gets unique virtual bank account (via Paystack)
- [ ] **AC2:** Account number displayed in user dashboard
- [ ] **AC3:** User can transfer from any bank to virtual account
- [ ] **AC4:** Webhook received when transfer arrives
- [ ] **AC5:** Wallet credited automatically
- [ ] **AC6:** User notified via email/SMS
- [ ] **AC7:** Transaction history shows bank transfer details
- [ ] **AC8:** Support for NGN transfers initially
- [ ] **AC9:** Handle partial transfers correctly
- [ ] **AC10:** Handle duplicate transfers (idempotency)

**Non-Functional:**
- [ ] **AC11:** Virtual account assignment < 3 seconds
- [ ] **AC12:** Webhook processing < 2 seconds
- [ ] **AC13:** Audit log for all deposits
- [ ] **AC14:** Proper error handling

---

#### Technical Specifications

**Endpoint:** `POST /api/v1/payments/bank-transfer/initialize`

**Response:**
```typescript
{
  "status": "success",
  "data": {
    "virtual_account": {
      "account_number": "1234567890",
      "account_name": "John Doe - Payment Platform",
      "bank_name": "Wema Bank",
      "bank_code": "035"
    },
    "instructions": "Transfer funds to the account above. Your wallet will be credited automatically."
  }
}
```

**Paystack Dedicated Virtual Account:**
```typescript
async createDedicatedVirtualAccount(userId: string): Promise<VirtualAccount> {
  const user = await this.usersRepository.findOne({ where: { id: userId } });

  const response = await axios.post(
    `${this.baseUrl}/dedicated_account`,
    {
      customer: user.email,
      preferred_bank: 'wema-bank', // or 'titan-paystack'
    },
    {
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    }
  );

  // Store virtual account in database
  await this.virtualAccountsRepository.save({
    user_id: userId,
    account_number: response.data.data.account_number,
    account_name: response.data.data.account_name,
    bank_name: response.data.data.bank.name,
    bank_code: response.data.data.bank.id,
    provider: 'paystack',
    provider_reference: response.data.data.id,
  });

  return response.data.data;
}
```

---

## FEATURE-4.3: P2P Wallet Transfers

### 📘 User Story: US-5.3.1 - P2P Wallet Transfer

**Story ID:** US-5.3.1
**Feature:** FEATURE-4.3 (P2P Wallet Transfers)
**Epic:** EPIC-4 (Payment Processing)

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 5
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to transfer money from my wallet to another user's wallet
So that I can send money to friends, family, or pay for services
```

---

#### Business Value

**Value Statement:**
P2P transfers are the core value proposition of the platform - enabling instant, free money movement between users. Drives user engagement and platform stickiness.

**Impact:**
- **Critical:** Core platform feature
- **User Engagement:** Primary use case for most users
- **Network Effect:** More users = more valuable platform
- **Zero Cost:** Internal transfers have no external fees

**Success Criteria:**
- 100% of valid transfers succeed instantly
- < 500ms transfer completion time
- Zero balance discrepancies
- Complete audit trail via double-entry ledger

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can transfer to another user by email/phone/wallet ID
- [ ] **AC2:** Amount must be > 0
- [ ] **AC3:** Sender must have sufficient balance
- [ ] **AC4:** Transfer executed atomically (debit + credit)
- [ ] **AC5:** Both wallets updated via ledger entries
- [ ] **AC6:** Both users notified (sender + recipient)
- [ ] **AC7:** Transaction reference generated
- [ ] **AC8:** Transaction appears in both users' history
- [ ] **AC9:** Description/note can be added (optional)
- [ ] **AC10:** Idempotency: Duplicate transfers prevented
- [ ] **AC11:** Rate limiting: 50 transfers per day per user
- [ ] **AC12:** Transaction PIN verification required for transfers > NGN 5,000

**Security:**
- [ ] **AC13:** User authentication required
- [ ] **AC14:** Cannot transfer to self
- [ ] **AC15:** Cannot transfer negative amounts
- [ ] **AC16:** Atomic database transaction (rollback on failure)
- [ ] **AC17:** Optimistic locking prevents race conditions

**Non-Functional:**
- [ ] **AC18:** Transfer completion < 500ms
- [ ] **AC19:** Supports concurrent transfers
- [ ] **AC20:** Audit log for all transfers
- [ ] **AC21:** Proper error messages

---

#### Technical Specifications

**Endpoint:** `POST /api/v1/transfers/p2p`

**Request:**
```typescript
{
  "recipient": "user@example.com",  // or phone number or wallet_id
  "amount": 50000,                  // NGN 500.00 in kobo
  "currency": "NGN",
  "description": "Payment for lunch",
  "pin": "1234"                      // Transaction PIN (if amount > threshold)
}
```

**Response (201 Created):**
```typescript
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "uuid",
      "reference": "TXN-20240115103045-A3F5K9",
      "type": "transfer",
      "category": "p2p_transfer",
      "amount": 50000,
      "currency": "NGN",
      "status": "completed",
      "description": "Payment for lunch",
      "sender": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "recipient": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "created_at": "2024-01-15T10:30:45Z",
      "completed_at": "2024-01-15T10:30:45Z"
    }
  }
}
```

**Implementation:**
```typescript
@Injectable()
export class TransferService {
  async executeP2PTransfer(
    senderId: string,
    dto: CreateP2PTransferDto
  ): Promise<Transaction> {
    // 1. Find recipient
    const recipient = await this.findRecipient(dto.recipient);
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // 2. Prevent self-transfer
    if (senderId === recipient.id) {
      throw new BadRequestException('Cannot transfer to self');
    }

    // 3. Get sender and recipient wallets
    const senderWallet = await this.walletsRepository.findOne({
      where: { user_id: senderId, currency: dto.currency }
    });

    const recipientWallet = await this.walletsRepository.findOne({
      where: { user_id: recipient.id, currency: dto.currency }
    });

    // 4. Check sufficient balance
    if (BigInt(senderWallet.available_balance) < BigInt(dto.amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    // 5. Verify PIN if amount > threshold
    if (dto.amount > 500000) { // NGN 5,000
      await this.verifyTransactionPin(senderId, dto.pin);
    }

    // 6. Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create transaction record
      const transaction = await queryRunner.manager.save(Transaction, {
        user_id: senderId,
        type: TransactionType.TRANSFER,
        category: TransactionCategory.P2P_TRANSFER,
        amount: dto.amount,
        currency: dto.currency,
        status: TransactionStatus.COMPLETED,
        description: dto.description || 'P2P Transfer',
        source_wallet_id: senderWallet.id,
        destination_wallet_id: recipientWallet.id,
        reference: this.generateReference(),
        idempotency_key: dto.idempotency_key,
        completed_at: new Date(),
      });

      // Create ledger entries (double-entry)
      await this.ledgerService.createLedgerEntries(queryRunner, {
        transaction_id: transaction.id,
        entries: [
          // Debit sender
          {
            wallet_id: senderWallet.id,
            entry_type: LedgerEntryType.DEBIT,
            amount: dto.amount,
            description: `Transfer to ${recipient.first_name} ${recipient.last_name}`,
          },
          // Credit recipient
          {
            wallet_id: recipientWallet.id,
            entry_type: LedgerEntryType.CREDIT,
            amount: dto.amount,
            description: `Transfer from ${sender.first_name} ${sender.last_name}`,
          },
        ],
      });

      await queryRunner.commitTransaction();

      // Send notifications (async)
      this.notificationService.sendTransferNotifications(
        senderId,
        recipient.id,
        transaction
      ).catch(err => this.logger.error(err));

      // Audit log
      await this.auditLogService.log({
        user_id: senderId,
        action: 'P2P_TRANSFER_COMPLETED',
        resource: 'Transaction',
        resource_id: transaction.id,
      });

      return transaction;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async findRecipient(identifier: string): Promise<User> {
    // Find by email, phone, or wallet ID
    if (identifier.includes('@')) {
      return this.usersRepository.findOne({ where: { email: identifier } });
    } else if (identifier.startsWith('+')) {
      return this.usersRepository.findOne({ where: { phone_number: identifier } });
    } else {
      const wallet = await this.walletsRepository.findOne({
        where: { id: identifier },
        relations: ['user']
      });
      return wallet?.user;
    }
  }
}
```

---

## FEATURE-4.4: Transaction Management

### 📘 User Story: US-5.4.1 - Transaction History & Filtering

**Story ID:** US-5.4.1
**Feature:** FEATURE-4.4 (Transaction Management)
**Epic:** EPIC-4 (Payment Processing)

**Story Points:** 5
**Priority:** P1 (High)
**Sprint:** Sprint 5
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to view my transaction history with filtering and search
So that I can track my spending and find specific transactions
```

---

#### Acceptance Criteria

- [ ] **AC1:** View paginated transaction list
- [ ] **AC2:** Filter by type (payment, transfer, refund)
- [ ] **AC3:** Filter by status (pending, completed, failed)
- [ ] **AC4:** Filter by date range
- [ ] **AC5:** Search by reference or description
- [ ] **AC6:** Sort by date, amount
- [ ] **AC7:** Export to CSV/PDF
- [ ] **AC8:** View transaction details
- [ ] **AC9:** Performance: < 500ms query time
- [ ] **AC10:** Pagination: 20 items per page

---

## FEATURE-4.5: Payment Reversals & Refunds

### 📘 User Story: US-5.5.1 - Transaction Reversals

**Story ID:** US-5.5.1
**Feature:** FEATURE-4.5 (Payment Reversals & Refunds)
**Epic:** EPIC-4 (Payment Processing)

**Story Points:** 8
**Priority:** P1 (High)
**Sprint:** Sprint 5
**Status:** 🔄 Not Started

---

#### User Story

```
As an admin
I want to reverse/refund transactions when needed
So that I can handle disputes and errors
```

---

#### Acceptance Criteria

- [ ] **AC1:** Admin can reverse completed transactions
- [ ] **AC2:** Reversal creates opposite ledger entries
- [ ] **AC3:** Original transaction marked as reversed
- [ ] **AC4:** Wallet balances updated correctly
- [ ] **AC5:** Both users notified
- [ ] **AC6:** Reversal transaction linked to original
- [ ] **AC7:** Prevent double reversal
- [ ] **AC8:** Require admin approval
- [ ] **AC9:** Audit log with reason
- [ ] **AC10:** Card refund via Paystack API

---

## FEATURE-4.6: Payment Method Management

### 📘 User Story: US-5.6.1 - Save Card for Future Payments

**Story ID:** US-5.6.1
**Feature:** FEATURE-4.6 (Payment Method Management)
**Epic:** EPIC-4 (Payment Processing)

**Story Points:** 5
**Priority:** P2 (Medium)
**Sprint:** Sprint 5
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to save my card for future payments
So that I don't have to re-enter card details every time
```

---

#### Acceptance Criteria

- [ ] **AC1:** Save card authorization after successful payment
- [ ] **AC2:** View saved cards (masked)
- [ ] **AC3:** Remove saved cards
- [ ] **AC4:** Charge saved card (via Paystack authorization)
- [ ] **AC5:** 3DS verification when required
- [ ] **AC6:** Card expiry notifications
- [ ] **AC7:** No CVV stored
- [ ] **AC8:** PCI-DSS compliance via Paystack
- [ ] **AC9:** Set default card
- [ ] **AC10:** Limit: 5 cards per user

---

## Summary of Sprint 5 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-5.1.1 | Card Payment with Paystack | 13 | P0 | To Do |
| US-5.2.1 | Bank Transfer Deposits | 8 | P0 | To Do |
| US-5.3.1 | P2P Wallet Transfer | 8 | P0 | To Do |
| US-5.4.1 | Transaction History & Filtering | 5 | P1 | To Do |
| US-5.5.1 | Transaction Reversals | 8 | P1 | To Do |
| US-5.6.1 | Save Card for Future Payments | 5 | P2 | To Do |
| **Total** | | **47** | | |

**Note:** 1 SP buffer for unexpected issues

---

## Sprint Velocity Tracking

**Planned Story Points:** 48 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

### Burndown Chart (To be updated daily)

| Day | Remaining SP | Completed SP | Notes |
|-----|--------------|--------------|-------|
| Day 1 | 48 | 0 | Sprint kickoff |
| Day 2 | | | |
| Day 3 | | | |
| ... | | | |
| Day 10 | 0 | 48 | Sprint complete (target) |

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
**Date:** [End of Sprint 5]
**Duration:** 1 hour
**Demo:** Show completed payment flows

### Sprint Retrospective
**Date:** [End of Sprint 5]
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
- [ ] Unit tests written (85% coverage minimum)
- [ ] Integration tests written for API endpoints
- [ ] Payment gateway tests passing
- [ ] All tests passing
- [ ] Manual testing completed

**Documentation:**
- [ ] Code comments added where necessary
- [ ] API documentation updated (Swagger)
- [ ] Postman collection updated
- [ ] README updated if needed

**Review:**
- [ ] Code self-reviewed
- [ ] No security vulnerabilities
- [ ] Performance acceptable
- [ ] Payment flow tested end-to-end

**Deployment:**
- [ ] Changes merged to main branch
- [ ] Database migrations run successfully
- [ ] No breaking changes in API
- [ ] Webhooks configured

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-5.1 | Paystack API downtime | Low | High | Implement retry logic, fallback to manual processing |
| RISK-5.2 | Webhook delivery failures | Medium | High | Implement webhook retry mechanism, manual verification endpoint |
| RISK-5.3 | Double spending via race conditions | Low | Critical | Use database transactions, optimistic locking, idempotency keys |
| RISK-5.4 | Payment reconciliation mismatches | Medium | High | Daily reconciliation job, automated alerts, manual review process |
| RISK-5.5 | Card fraud/chargebacks | Medium | Medium | Fraud detection rules, velocity checks, Paystack fraud filters |

---

## Dependencies

**External:**
- Paystack account approval
- Paystack test/live API keys
- Webhook endpoint accessible
- SSL certificate for HTTPS

**Internal:**
- Sprint 1: Database entities (User, Wallet, Transaction)
- Sprint 1: Field-level encryption
- Sprint 1: JWT authentication
- Sprint 4: Double-entry ledger system
- Sprint 4: Wallet balance management

---

## Notes & Decisions

**Technical Decisions:**
1. **Paystack over Flutterwave:** Better documentation, more reliable webhooks
2. **Webhook-first approach:** Don't poll, rely on webhooks for payment status
3. **Idempotency keys:** Prevent duplicate payments/transfers
4. **Transaction PIN:** Required for transfers > NGN 5,000
5. **Amounts in minor units:** Store in kobo/cents to avoid decimal errors

**Open Questions:**
1. ❓ Card payment fee: Pass to user or absorb? **Decision: User pays (1.5% + NGN 100)**
2. ❓ P2P transfer limit per transaction? **Decision: NGN 1,000,000 (KYC Tier 3)**
3. ❓ Webhook retry policy? **Decision: 3 retries with exponential backoff**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Implement payment processing flows and enable users to fund wallets and transfer money
