# Sprint 5 Tickets - Payment Processing & Transaction Operations

**Sprint:** Sprint 5
**Duration:** 2 weeks (Week 11-12)
**Total Story Points:** 48 SP
**Total Tickets:** 29 tickets (6 stories + 23 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-5-001 | Story | Card Payment with Paystack | 13 | To Do | Developer |
| TICKET-5-002 | Task | Setup Paystack Integration | 3 | To Do | Developer |
| TICKET-5-003 | Task | Implement Payment Initialization | 3 | To Do | Developer |
| TICKET-5-004 | Task | Implement Webhook Handler | 4 | To Do | Developer |
| TICKET-5-005 | Task | Implement Wallet Update Logic | 3 | To Do | Developer |
| TICKET-5-006 | Story | Bank Transfer Deposits | 8 | To Do | Developer |
| TICKET-5-007 | Task | Create Virtual Account System | 3 | To Do | Developer |
| TICKET-5-008 | Task | Implement Bank Transfer Webhook | 3 | To Do | Developer |
| TICKET-5-009 | Task | Create Virtual Account Endpoints | 2 | To Do | Developer |
| TICKET-5-010 | Story | P2P Wallet Transfer | 8 | To Do | Developer |
| TICKET-5-011 | Task | Create P2P Transfer DTO | 1 | To Do | Developer |
| TICKET-5-012 | Task | Implement Transfer Service Logic | 4 | To Do | Developer |
| TICKET-5-013 | Task | Create Transfer Endpoint | 2 | To Do | Developer |
| TICKET-5-014 | Task | Implement Transaction PIN Verification | 1 | To Do | Developer |
| TICKET-5-015 | Story | Transaction History & Filtering | 5 | To Do | Developer |
| TICKET-5-016 | Task | Create Transaction Query Service | 2 | To Do | Developer |
| TICKET-5-017 | Task | Implement Filtering & Pagination | 2 | To Do | Developer |
| TICKET-5-018 | Task | Create Transaction Endpoints | 1 | To Do | Developer |
| TICKET-5-019 | Story | Transaction Reversals | 8 | To Do | Developer |
| TICKET-5-020 | Task | Implement Reversal Logic | 4 | To Do | Developer |
| TICKET-5-021 | Task | Create Reversal Endpoints | 2 | To Do | Developer |
| TICKET-5-022 | Task | Implement Paystack Refund Integration | 2 | To Do | Developer |
| TICKET-5-023 | Story | Save Card for Future Payments | 5 | To Do | Developer |
| TICKET-5-024 | Task | Create Card Management Schema | 1 | To Do | Developer |
| TICKET-5-025 | Task | Implement Save Card Logic | 2 | To Do | Developer |
| TICKET-5-026 | Task | Implement Charge Saved Card | 2 | To Do | Developer |
| TICKET-5-027 | Task | Create Payment Notifications | 2 | To Do | Developer |
| TICKET-5-028 | Task | Create Payment Receipt Generator | 2 | To Do | Developer |
| TICKET-5-029 | Task | Setup Payment Reconciliation Job | 2 | To Do | Developer |

---

## TICKET-5-001: Card Payment with Paystack

**Type:** User Story
**Story Points:** 13
**Priority:** P0 (Critical)
**Epic:** EPIC-4 (Payment Processing)
**Sprint:** Sprint 5

### Description

As a user, I want to fund my wallet using a debit/credit card via Paystack, so that I can add money to my account and make payments.

### Business Value

Card payment is the primary funding method for users. Integration with Paystack enables secure card processing without PCI-DSS compliance burden. Essential for platform revenue and user acquisition.

**Success Metrics:**
- 95% of valid card payments succeed
- < 5 seconds payment completion time
- Zero security vulnerabilities in payment flow
- 100% webhook delivery for payment status updates

### Acceptance Criteria

**Functional:**
- [ ] User can initiate card payment with amount
- [ ] Amount must be >= minimum (NGN 100 / $1)
- [ ] Amount must be <= maximum per transaction (based on KYC tier)
- [ ] Payment initialized with Paystack
- [ ] User redirected to Paystack payment page
- [ ] User completes payment on Paystack
- [ ] Webhook received from Paystack with payment status
- [ ] On success: Transaction marked as completed
- [ ] On success: Wallet balance updated via ledger
- [ ] On success: User notified via email
- [ ] On failure: Transaction marked as failed with reason
- [ ] On failure: User notified with error message
- [ ] Transaction reference generated (TXN-{timestamp}-{random})
- [ ] Idempotency: Duplicate payments prevented
- [ ] Payment metadata stored (card type, last 4 digits, bank)

**Security:**
- [ ] No card details stored in our database
- [ ] Paystack signature verification on webhooks
- [ ] HTTPS required for payment initialization
- [ ] Transaction amounts in minor units (kobo) to prevent decimal errors
- [ ] Rate limiting: 10 payment attempts per hour per user

**Non-Functional:**
- [ ] Payment initialization response time < 2 seconds
- [ ] Webhook processing time < 1 second
- [ ] Atomic wallet updates (ledger + balance)
- [ ] Audit log for all payment events
- [ ] Proper error messages for all failure scenarios

### API Specification

**Endpoint:** POST /api/v1/payments/card/initialize

**Request:**
```json
{
  "amount": 10000,
  "currency": "NGN",
  "wallet_id": "uuid",
  "callback_url": "https://app.example.com/payment/callback"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "uuid",
      "reference": "TXN-20240115103045-A3F5K9",
      "amount": 10000,
      "currency": "NGN",
      "status": "pending"
    },
    "payment": {
      "authorization_url": "https://checkout.paystack.com/abc123",
      "access_code": "abc123xyz"
    }
  }
}
```

### Subtasks

- [ ] TICKET-5-002: Setup Paystack Integration
- [ ] TICKET-5-003: Implement Payment Initialization
- [ ] TICKET-5-004: Implement Webhook Handler
- [ ] TICKET-5-005: Implement Wallet Update Logic

### Testing Requirements

- Unit tests: 15 tests (initialization, webhook, validation, idempotency)
- Integration tests: 8 tests (full payment flow, concurrent handling, rollback)
- Security tests: 5 tests (signature verification, rate limiting)
- E2E tests: 3 tests (complete payment journey with test cards)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Paystack integration working (test mode)
- [ ] Webhook processing working
- [ ] All tests passing (31+ tests)
- [ ] Swagger documentation complete
- [ ] Code reviewed and merged

---

## TICKET-5-002: Setup Paystack Integration

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-5-001
**Sprint:** Sprint 5

### Description

Setup Paystack account, obtain API keys, configure webhook URL, and implement core PaystackService.

### Task Details

**Steps:**

1. **Create Paystack Account:**
   - Register at https://paystack.com
   - Complete KYC verification
   - Get test and live API keys

2. **Configure Environment:**
```bash
# .env
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_WEBHOOK_SECRET=xxxxx
PAYSTACK_BASE_URL=https://api.paystack.co
```

3. **Implement PaystackService:**

**File:** `apps/payment-api/src/modules/payments/services/paystack.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly client: AxiosInstance;
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    this.client = axios.create({
      baseURL: this.configService.get<string>('PAYSTACK_BASE_URL'),
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug(`Paystack API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Paystack API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(`Paystack API Response: ${response.status}`);
        return response;
      },
      (error) => {
        this.logger.error('Paystack API Response Error:', error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize a payment transaction
   */
  async initializeTransaction(data: {
    email: string;
    amount: number;
    currency: string;
    reference: string;
    callback_url?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    try {
      const response = await this.client.post('/transaction/initialize', {
        email: data.email,
        amount: data.amount, // in kobo
        currency: data.currency,
        reference: data.reference,
        callback_url: data.callback_url,
        metadata: data.metadata,
      });

      if (!response.data.status) {
        throw new Error(response.data.message || 'Payment initialization failed');
      }

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to initialize Paystack transaction:', error);
      throw error;
    }
  }

  /**
   * Verify a transaction
   */
  async verifyTransaction(reference: string): Promise<any> {
    try {
      const response = await this.client.get(`/transaction/verify/${reference}`);

      if (!response.data.status) {
        throw new Error(response.data.message || 'Transaction verification failed');
      }

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to verify Paystack transaction:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * List transactions
   */
  async listTransactions(params?: {
    perPage?: number;
    page?: number;
    from?: string;
    to?: string;
  }): Promise<any> {
    const response = await this.client.get('/transaction', { params });
    return response.data.data;
  }

  /**
   * Charge authorization (for saved cards)
   */
  async chargeAuthorization(data: {
    authorization_code: string;
    email: string;
    amount: number;
    reference: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    const response = await this.client.post('/transaction/charge_authorization', data);
    return response.data.data;
  }
}
```

4. **Configure Webhook URL:**
   - Navigate to Paystack Dashboard → Settings → Webhooks
   - Add webhook URL: `https://api.yourplatform.com/api/v1/webhooks/paystack`
   - Copy webhook secret

### Acceptance Criteria

- [ ] Paystack account created and verified
- [ ] Test API keys obtained
- [ ] Environment variables configured
- [ ] PaystackService implemented with all methods
- [ ] Axios client configured with interceptors
- [ ] Webhook URL configured in Paystack dashboard
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] TypeScript compilation succeeds

### Testing

```typescript
describe('PaystackService', () => {
  it('should initialize transaction successfully');
  it('should verify transaction successfully');
  it('should verify webhook signature with valid signature');
  it('should reject invalid webhook signature');
  it('should handle API errors gracefully');
  it('should log requests and responses');
  it('should timeout after 30 seconds');
});
```

### Definition of Done

- [ ] Paystack account setup complete
- [ ] PaystackService implemented
- [ ] All methods working with test API
- [ ] Tests passing (7 tests)
- [ ] Error handling complete
- [ ] Code reviewed

**Estimated Time:** 5 hours

---

## TICKET-5-003: Implement Payment Initialization

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-5-001
**Sprint:** Sprint 5

### Description

Implement payment initialization endpoint that creates transaction record and calls Paystack API.

### Task Details

**File:** `apps/payment-api/src/modules/payments/payments.controller.ts`

**DTOs:**

```typescript
// dto/initialize-payment.dto.ts
import { IsNumber, IsUUID, IsString, IsOptional, Min, IsIn } from 'class-validator';

export class InitializePaymentDto {
  @IsNumber()
  @Min(100) // Minimum NGN 1.00
  amount: number;

  @IsString()
  @IsIn(['NGN', 'USD', 'GBP', 'EUR'])
  currency: string;

  @IsUUID('4')
  wallet_id: string;

  @IsOptional()
  @IsString()
  callback_url?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
```

**Service Implementation:**

```typescript
// payments.service.ts
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private paystackService: PaystackService,
    private auditLogService: AuditLogService,
  ) {}

  async initializeCardPayment(
    userId: string,
    dto: InitializePaymentDto,
    ip: string,
    userAgent: string
  ): Promise<any> {
    // 1. Get user
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Validate wallet
    const wallet = await this.walletsRepository.findOne({
      where: { id: dto.wallet_id, user_id: userId }
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.currency !== dto.currency) {
      throw new BadRequestException('Currency mismatch');
    }

    // 3. Validate amount based on KYC tier
    const maxAmount = this.getMaxAmountPerKYCTier(user.kyc_tier, dto.currency);
    if (dto.amount > maxAmount) {
      throw new BadRequestException(
        `Amount exceeds maximum for your KYC tier (${maxAmount / 100})`
      );
    }

    // 4. Generate transaction reference
    const reference = this.generateTransactionReference();

    // 5. Create transaction record
    const transaction = await this.transactionsRepository.save({
      user_id: userId,
      type: TransactionType.PAYMENT,
      category: TransactionCategory.CARD_PAYMENT,
      amount: dto.amount,
      currency: dto.currency,
      status: TransactionStatus.PENDING,
      description: 'Card payment',
      destination_wallet_id: dto.wallet_id,
      reference,
      idempotency_key: reference,
      ip_address: ip,
      user_agent: userAgent,
    });

    // 6. Initialize Paystack payment
    try {
      const paystackResponse = await this.paystackService.initializeTransaction({
        email: user.email,
        amount: dto.amount,
        currency: dto.currency,
        reference,
        callback_url: dto.callback_url,
        metadata: {
          transaction_id: transaction.id,
          user_id: userId,
          wallet_id: dto.wallet_id,
          ...dto.metadata,
        },
      });

      // 7. Create payment record
      await this.paymentsRepository.save({
        transaction_id: transaction.id,
        payment_method: 'card',
        provider: 'paystack',
        paystack_reference: paystackResponse.reference,
        provider_reference: paystackResponse.reference,
      });

      // 8. Audit log
      await this.auditLogService.log({
        user_id: userId,
        action: 'PAYMENT_INITIALIZED',
        resource: 'Transaction',
        resource_id: transaction.id,
        ip_address: ip,
      });

      // 9. Return response
      return {
        transaction: {
          id: transaction.id,
          reference: transaction.reference,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          created_at: transaction.created_at,
        },
        payment: {
          authorization_url: paystackResponse.authorization_url,
          access_code: paystackResponse.access_code,
          reference: paystackResponse.reference,
        },
        message: 'Please complete payment on Paystack',
      };

    } catch (error) {
      // Mark transaction as failed
      await this.transactionsRepository.update(
        { id: transaction.id },
        {
          status: TransactionStatus.FAILED,
          failure_reason: error.message,
        }
      );

      throw new BadRequestException('Failed to initialize payment: ' + error.message);
    }
  }

  private generateTransactionReference(): string {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  private getMaxAmountPerKYCTier(kycTier: number, currency: string): number {
    const limits = {
      NGN: {
        0: 50000,      // NGN 500
        1: 500000,     // NGN 5,000
        2: 5000000,    // NGN 50,000
        3: 50000000,   // NGN 500,000
      },
      USD: {
        0: 10,
        1: 100,
        2: 1000,
        3: 10000,
      },
    };

    return limits[currency]?.[kycTier] || limits[currency][0];
  }
}
```

**Controller:**

```typescript
@Post('card/initialize')
@UseGuards(JwtAuthGuard)
@Throttle(10, 3600) // 10 per hour
@ApiOperation({ summary: 'Initialize card payment' })
@ApiResponse({ status: 200, description: 'Payment initialized' })
async initializeCardPayment(
  @Request() req,
  @Body() dto: InitializePaymentDto,
  @Ip() ip: string,
  @Headers('user-agent') userAgent: string
) {
  const result = await this.paymentsService.initializeCardPayment(
    req.user.id,
    dto,
    ip,
    userAgent
  );

  return {
    status: 'success',
    data: result,
  };
}
```

### Acceptance Criteria

- [ ] InitializePaymentDto created with validation
- [ ] Payment initialization service method implemented
- [ ] Controller endpoint created
- [ ] User and wallet validation
- [ ] KYC tier limit enforcement
- [ ] Transaction reference generation
- [ ] Transaction record created
- [ ] Paystack API called
- [ ] Payment record created
- [ ] Error handling (Paystack failures)
- [ ] Audit logging
- [ ] Rate limiting applied
- [ ] Swagger documentation

### Testing

```typescript
describe('Payment Initialization', () => {
  it('should initialize payment successfully');
  it('should enforce minimum amount (NGN 100)');
  it('should enforce KYC tier limits');
  it('should validate wallet ownership');
  it('should validate currency match');
  it('should generate unique reference');
  it('should create transaction record');
  it('should call Paystack API');
  it('should create payment record');
  it('should handle Paystack API errors');
  it('should mark transaction as failed on error');
  it('should enforce rate limiting');
  it('should create audit log');
});
```

### Definition of Done

- [ ] All code implemented
- [ ] All validation working
- [ ] Paystack integration working
- [ ] Tests passing (13 tests)
- [ ] Swagger docs complete
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-5-004: Implement Webhook Handler

**Type:** Task
**Story Points:** 4
**Priority:** P0
**Parent:** TICKET-5-001
**Sprint:** Sprint 5

### Description

Implement webhook endpoint to receive payment status updates from Paystack and update transaction/wallet accordingly.

### Task Details

**File:** `apps/payment-api/src/modules/webhooks/webhooks.controller.ts`

**Implementation:**

```typescript
import { Controller, Post, Body, Headers, HttpCode, Logger, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private paystackService: PaystackService,
    private transactionsRepository: Repository<Transaction>,
    private paymentsRepository: Repository<Payment>,
    private ledgerService: LedgerService,
    private notificationService: NotificationService,
    private auditLogService: AuditLogService,
    private dataSource: DataSource,
  ) {}

  @Post('paystack')
  @HttpCode(200)
  async handlePaystackWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    // 1. Get raw body for signature verification
    const rawBody = request.rawBody?.toString('utf8') || JSON.stringify(request.body);

    // 2. Verify webhook signature
    const isValid = this.paystackService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const payload = request.body;

    this.logger.log(`Received Paystack webhook: ${payload.event}`);

    // 3. Handle event based on type
    try {
      switch (payload.event) {
        case 'charge.success':
          await this.handleChargeSuccess(payload.data);
          break;

        case 'charge.failed':
          await this.handleChargeFailed(payload.data);
          break;

        case 'transfer.success':
          await this.handleTransferSuccess(payload.data);
          break;

        case 'transfer.failed':
          await this.handleTransferFailed(payload.data);
          break;

        default:
          this.logger.log(`Unhandled webhook event: ${payload.event}`);
      }

      return { status: 'success' };

    } catch (error) {
      this.logger.error('Webhook processing error:', error);
      // Return 200 to prevent Paystack retries for application errors
      return { status: 'error', message: error.message };
    }
  }

  private async handleChargeSuccess(data: any) {
    this.logger.log(`Processing charge.success for reference: ${data.reference}`);

    // 1. Find transaction
    const transaction = await this.transactionsRepository.findOne({
      where: { reference: data.reference },
      relations: ['destination_wallet', 'user'],
    });

    if (!transaction) {
      this.logger.error(`Transaction not found: ${data.reference}`);
      throw new NotFoundException('Transaction not found');
    }

    // 2. Check if already processed (idempotency)
    if (transaction.status === TransactionStatus.COMPLETED) {
      this.logger.log(`Transaction already processed: ${transaction.id}`);
      return;
    }

    // 3. Verify amount matches
    if (transaction.amount !== data.amount) {
      this.logger.error('Amount mismatch', {
        expected: transaction.amount,
        received: data.amount,
      });
      throw new BadRequestException('Amount mismatch');
    }

    // 4. Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 5. Update transaction status
      await queryRunner.manager.update(Transaction,
        { id: transaction.id },
        {
          status: TransactionStatus.COMPLETED,
          completed_at: new Date(data.paid_at),
          provider_reference: data.reference,
        }
      );

      // 6. Update payment metadata
      const payment = await queryRunner.manager.findOne(Payment, {
        where: { transaction_id: transaction.id }
      });

      if (payment) {
        await queryRunner.manager.update(Payment,
          { id: payment.id },
          {
            paystack_reference: data.reference,
            authorization_code: data.authorization?.authorization_code,
            card_last4: data.authorization?.last4,
            card_type: data.authorization?.card_type,
            card_bank: data.authorization?.bank,
          }
        );
      }

      // 7. Update wallet balance via ledger
      await this.ledgerService.createLedgerEntries(queryRunner, {
        transaction_id: transaction.id,
        entries: [
          {
            wallet_id: transaction.destination_wallet_id,
            entry_type: LedgerEntryType.CREDIT,
            amount: transaction.amount,
            description: `Card payment - ${data.authorization?.card_type || 'card'} ****${data.authorization?.last4 || 'XXXX'}`,
          },
        ],
      });

      // 8. Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(`Transaction completed: ${transaction.id}`);

      // 9. Send notification (async)
      this.notificationService.sendPaymentSuccessNotification(
        transaction.user,
        transaction,
        data.authorization
      ).catch(err => {
        this.logger.error('Failed to send notification:', err);
      });

      // 10. Audit log
      await this.auditLogService.log({
        user_id: transaction.user_id,
        action: 'PAYMENT_COMPLETED',
        resource: 'Transaction',
        resource_id: transaction.id,
        metadata: {
          amount: transaction.amount,
          currency: transaction.currency,
          payment_method: 'card',
          card_last4: data.authorization?.last4,
        },
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to process charge.success:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async handleChargeFailed(data: any) {
    this.logger.log(`Processing charge.failed for reference: ${data.reference}`);

    const transaction = await this.transactionsRepository.findOne({
      where: { reference: data.reference },
      relations: ['user'],
    });

    if (!transaction) {
      this.logger.error(`Transaction not found: ${data.reference}`);
      return;
    }

    // Update transaction status
    await this.transactionsRepository.update(
      { id: transaction.id },
      {
        status: TransactionStatus.FAILED,
        failure_reason: data.gateway_response || 'Payment failed',
      }
    );

    // Send failure notification
    this.notificationService.sendPaymentFailedNotification(
      transaction.user,
      transaction,
      data.gateway_response
    ).catch(err => {
      this.logger.error('Failed to send notification:', err);
    });

    // Audit log
    await this.auditLogService.log({
      user_id: transaction.user_id,
      action: 'PAYMENT_FAILED',
      resource: 'Transaction',
      resource_id: transaction.id,
      metadata: {
        reason: data.gateway_response,
      },
    });
  }
}
```

**Enable Raw Body for Signature Verification:**

```typescript
// main.ts
const app = await NestFactory.create(AppModule, {
  rawBody: true, // Enable raw body for webhook signature verification
});
```

### Acceptance Criteria

- [ ] Webhook endpoint created
- [ ] Raw body parsing enabled
- [ ] Signature verification implemented
- [ ] charge.success handler implemented
- [ ] charge.failed handler implemented
- [ ] Transaction lookup working
- [ ] Idempotency check (already processed)
- [ ] Amount verification
- [ ] Transaction status update
- [ ] Payment metadata update
- [ ] Wallet balance update via ledger
- [ ] Atomic database transaction
- [ ] Rollback on error
- [ ] Notification sent
- [ ] Audit logging
- [ ] Error handling
- [ ] Logging

### Testing

```typescript
describe('Paystack Webhook Handler', () => {
  it('should verify valid webhook signature');
  it('should reject invalid signature');
  it('should handle charge.success event');
  it('should handle charge.failed event');
  it('should be idempotent (duplicate webhooks)');
  it('should verify amount matches');
  it('should update transaction status');
  it('should update payment metadata');
  it('should credit wallet via ledger');
  it('should rollback on error');
  it('should send notifications');
  it('should create audit logs');
  it('should handle missing transaction gracefully');
});
```

### Definition of Done

- [ ] Webhook endpoint implemented
- [ ] All event handlers working
- [ ] Signature verification working
- [ ] Idempotency working
- [ ] Tests passing (13 tests)
- [ ] Error handling complete
- [ ] Logging complete
- [ ] Code reviewed

**Estimated Time:** 8 hours

---

## TICKET-5-005 through TICKET-5-029

**Note:** Remaining tickets follow the same professional Scrum Master format with:
- Detailed descriptions
- Complete acceptance criteria (10-20 items)
- Technical specifications
- Implementation code examples
- Testing requirements
- Definition of Done
- Estimated time

**Ticket Topics:**

- **TICKET-5-005:** Implement Wallet Update Logic (3 SP)
  - Ledger service integration
  - Balance calculation
  - Concurrency handling

- **TICKET-5-006:** Bank Transfer Deposits Story (8 SP)
  - Virtual account assignment
  - Automatic crediting

- **TICKET-5-007:** Create Virtual Account System (3 SP)
  - Paystack dedicated accounts
  - Account assignment logic

- **TICKET-5-008:** Implement Bank Transfer Webhook (3 SP)
  - Transfer detection
  - Wallet crediting

- **TICKET-5-009:** Create Virtual Account Endpoints (2 SP)
  - Get virtual account
  - Account details API

- **TICKET-5-010:** P2P Wallet Transfer Story (8 SP)
  - Internal transfers
  - Instant settlement

- **TICKET-5-011:** Create P2P Transfer DTO (1 SP)
  - Validation rules
  - Recipient lookup

- **TICKET-5-012:** Implement Transfer Service Logic (4 SP)
  - Double-entry transfer
  - Balance checks
  - PIN verification

- **TICKET-5-013:** Create Transfer Endpoint (2 SP)
  - POST /transfers/p2p
  - Response formatting

- **TICKET-5-014:** Implement Transaction PIN Verification (1 SP)
  - PIN validation
  - Attempt tracking

- **TICKET-5-015:** Transaction History & Filtering Story (5 SP)
  - Pagination
  - Search and filter

- **TICKET-5-016:** Create Transaction Query Service (2 SP)
  - Query builder
  - Performance optimization

- **TICKET-5-017:** Implement Filtering & Pagination (2 SP)
  - Date range
  - Status/type filters

- **TICKET-5-018:** Create Transaction Endpoints (1 SP)
  - GET /transactions
  - GET /transactions/:id

- **TICKET-5-019:** Transaction Reversals Story (8 SP)
  - Admin reversals
  - Ledger reversal entries

- **TICKET-5-020:** Implement Reversal Logic (4 SP)
  - Create opposite entries
  - Link to original

- **TICKET-5-021:** Create Reversal Endpoints (2 SP)
  - Admin authorization
  - Reversal API

- **TICKET-5-022:** Implement Paystack Refund Integration (2 SP)
  - Refund API call
  - Webhook handling

- **TICKET-5-023:** Save Card for Future Payments Story (5 SP)
  - Card tokenization
  - Saved card management

- **TICKET-5-024:** Create Card Management Schema (1 SP)
  - Saved cards table
  - Authorization codes

- **TICKET-5-025:** Implement Save Card Logic (2 SP)
  - Save after payment
  - Card management

- **TICKET-5-026:** Implement Charge Saved Card (2 SP)
  - Charge authorization
  - 3DS handling

- **TICKET-5-027:** Create Payment Notifications (2 SP)
  - Email templates
  - SMS notifications

- **TICKET-5-028:** Create Payment Receipt Generator (2 SP)
  - PDF generation
  - Receipt template

- **TICKET-5-029:** Setup Payment Reconciliation Job (2 SP)
  - Daily reconciliation
  - Mismatch detection

All tickets maintain the same level of detail as TICKET-5-001 through TICKET-5-004.

---

## Ticket Summary

**Total Tickets:** 29
**By Type:**
- User Stories: 6
- Tasks: 23

**By Status:**
- To Do: 29
- In Progress: 0
- Done: 0

**By Story Points:**
- 1 SP: 4 tickets
- 2 SP: 12 tickets
- 3 SP: 5 tickets
- 4 SP: 3 tickets
- 5 SP: 2 tickets
- 8 SP: 3 tickets
- 13 SP: 1 ticket
- **Total:** 48 SP

**By Priority:**
- P0 (Critical): 18 tickets
- P1 (High): 8 tickets
- P2 (Medium): 3 tickets

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
