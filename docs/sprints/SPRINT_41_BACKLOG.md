# Sprint 41 Backlog - Batch Operations & Scheduled Transactions

**Sprint:** Sprint 41
**Duration:** 2 weeks (Week 82-83)
**Sprint Goal:** Enable merchants and users to process batch transfers, scheduled transactions, and recurring payments
**Story Points Committed:** 40
**Team Capacity:** 40 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 41, we will have:
1. Batch transfer processing system with validation and error handling
2. Scheduled transaction execution with recurring payment support
3. Batch job tracking and status monitoring
4. Retry logic for failed batch items
5. Webhook notifications for batch completions
6. CSV import for bulk operations
7. Comprehensive batch analytics and reporting

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85%+ coverage)
- [ ] Integration tests for batch processing pipeline
- [ ] Performance tests (1000 item batches, <30s processing)
- [ ] Idempotency tests for retry scenarios
- [ ] Mock services for external processor interactions
- [ ] API documentation updated (Swagger)
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-19: Batch Operations (35 SP) - FROM PRODUCT BACKLOG

## FEATURE-41.1: Batch Transfer Processing

### 📘 User Story: US-41.1.1 - Batch Transfer Submission & Processing (12 SP)

**Story ID:** US-41.1.1
**Feature:** FEATURE-41.1 (Batch Transfer Processing)
**Epic:** EPIC-19 (Batch Operations)

**Story Points:** 12
**Priority:** P0 (Critical)
**Sprint:** Sprint 41
**Status:** 🔄 Not Started

---

#### User Story

```
As a merchant/business user
I want to submit multiple transfers in a single API call
So that I can process payroll, vendor payments, or refunds in bulk without looping through individual API calls
```

---

#### Business Value

**Value Statement:**
Batch processing enables businesses to operate at scale. Instead of 1000 API calls for 1000 transfers, merchants can submit one batch job, track progress, and receive a single completion notification. This significantly reduces API overhead, improves operational efficiency, and enables payroll automation.

**Impact:**
- **Operational Efficiency:** Reduce API calls by 99% (1000 transfers = 1 call instead of 1000)
- **Scalability:** Enable payroll, vendor payments, refunds without system overload
- **Error Handling:** Smart retry logic for failed items without reprocessing successful ones
- **Visibility:** Real-time batch status tracking and detailed failure reports
- **Automation:** Enable scheduled batch execution for recurring needs

**Success Criteria:**
- Process 1000+ items per batch in <30 seconds
- 99.9% delivery success rate (retries included)
- Support for 50+ concurrent batches
- Idempotent processing (retry safety)
- Detailed error tracking per item

---

#### Acceptance Criteria

**Functional - Batch Submission:**
- [ ] **AC1:** Accept `POST /api/v1/transfers/batch` with 1-10000 transfer items
- [ ] **AC2:** Each batch item includes: `recipient_account`, `amount`, `currency`, `description`, `metadata`
- [ ] **AC3:** Validate all items before processing (pre-flight validation)
- [ ] **AC4:** Return batch ID immediately for async processing (non-blocking)
- [ ] **AC5:** Support idempotency key for duplicate prevention per batch submission
- [ ] **AC6:** Return immediate response with: `batchId`, `totalItems`, `validItems`, `validationErrors`
- [ ] **AC7:** Support optional webhook URL for batch completion notification
- [ ] **AC8:** Support optional email notification on batch completion

**Functional - Batch Processing:**
- [ ] **AC9:** Process valid items asynchronously in background queue
- [ ] **AC10:** Deduct funds from user wallet ONCE per batch (atomic operation)
- [ ] **AC11:** Create individual transfer records for each successful item
- [ ] **AC12:** Maintain batch-level transaction record with summary
- [ ] **AC13:** Implement exponential backoff retry (2s, 4s, 8s, 16s, 32s) for failed items
- [ ] **AC14:** Max 5 retry attempts per item (configurable)
- [ ] **AC15:** Store detailed failure reason for each failed item (insufficient funds, invalid account, etc.)
- [ ] **AC16:** Create separate failed_transfers log with recovery options

**Functional - Batch Status & Monitoring:**
- [ ] **AC17:** Provide `GET /api/v1/transfers/batches/{batchId}` endpoint for status
- [ ] **AC18:** Return: `status`, `totalItems`, `successCount`, `failureCount`, `pendingCount`, `createdAt`, `completedAt`
- [ ] **AC19:** Provide `GET /api/v1/transfers/batches/{batchId}/items` for detailed item status
- [ ] **AC20:** Support filtering items by status (SUCCESS, FAILED, PENDING, RETRY)
- [ ] **AC21:** Provide `GET /api/v1/transfers/batches` list endpoint with pagination
- [ ] **AC22:** Filter batches by: date range, status, success rate
- [ ] **AC23:** Provide download link for detailed batch report (CSV)

**Functional - Idempotency & Safety:**
- [ ] **AC24:** Accept `X-Idempotency-Key` header on batch submission
- [ ] **AC25:** Prevent duplicate batch processing (same key = same result)
- [ ] **AC26:** Store idempotency result for 24 hours
- [ ] **AC27:** Return 409 Conflict if attempting batch with same key while in progress
- [ ] **AC28:** Support batch cancellation before processing starts
- [ ] **AC29:** Prevent modifications to batch after processing begins

**Functional - Cost Optimization:**
- [ ] **AC30:** Calculate total cost before processing (sum of transfer fees)
- [ ] **AC31:** Verify sufficient wallet balance for entire batch (prevent partial processing)
- [ ] **AC32:** Return cost breakdown: `subtotal`, `totalFees`, `netAmount`, `walletBalance`
- [ ] **AC33:** Show wallet impact: `balanceAfter`, `pendingAmount`

**Functional - Reporting:**
- [ ] **AC34:** Batch summary email with: batch ID, total items, success count, failure count
- [ ] **AC35:** CSV export includes: item #, recipient, amount, status, transaction ID, error reason
- [ ] **AC36:** Webhook payload includes: `batchId`, `status`, `summary`, `failedItems[]`
- [ ] **AC37:** Support batch analytics: success rate %, average processing time, cost analysis

**Analytics & Audit:**
- [ ] **AC38:** Track batch processing latency (queue time, processing time, total time)
- [ ] **AC39:** Log all batch operations for audit trail
- [ ] **AC40:** Store batch metadata: `createdBy`, `submittedBy`, `approvedBy` (if multi-auth)
- [ ] **AC41:** Support batch versioning (history of changes before processing)

**Non-Functional:**
- [ ] **AC42:** Batch validation: <1 second for 1000 items
- [ ] **AC43:** Batch processing: <30 seconds for 1000 items (including retry)
- [ ] **AC44:** Queue throughput: 10,000 items/minute
- [ ] **AC45:** Support concurrent batches: 50+ parallel processing
- [ ] **AC46:** Memory efficient: process large batches without loading all into memory
- [ ] **AC47:** Database transactions: ACID compliance for fund movements
- [ ] **AC48:** Error recovery: 99.9% successful delivery with retries

---

#### Technical Specifications

**Batch Transfer Request DTO:**

```typescript
interface BatchTransferRequest {
  idempotencyKey?: string;
  items: BatchTransferItem[];
  notificationWebhook?: string;
  notificationEmail?: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface BatchTransferItem {
  recipientAccount: string;  // Username, email, or phone
  amount: number;
  currency: 'NGN' | 'USD' | 'GBP' | 'EUR';
  description: string;
  metadata?: Record<string, any>;
  reference?: string;
}
```

**Batch Transfer Response:**

```typescript
interface BatchTransferResponse {
  batchId: string;
  status: 'VALIDATION_IN_PROGRESS' | 'VALIDATION_COMPLETE' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalItems: number;
  validItems: number;
  invalidItems: number;
  validationErrors: ValidationError[];
  costEstimate?: {
    subtotal: number;
    totalFees: number;
    netAmount: number;
  };
  walletImpact?: {
    currentBalance: number;
    balanceAfter: number;
    pendingAmount: number;
  };
  createdAt: Date;
  completedAt?: Date;
  estimatedCompletionTime?: Date;
}

interface ValidationError {
  itemIndex: number;
  field: string;
  error: string;
  value: any;
}
```

**Batch Status Response:**

```typescript
interface BatchStatusResponse {
  batchId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIALLY_FAILED';
  totalItems: number;
  successCount: number;
  failureCount: number;
  pendingCount: number;
  successRate: number;  // percentage
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  processingTimeMs: number;
  summary: {
    totalAmount: number;
    totalFees: number;
    netAmount: number;
  };
  failureReasons: {
    [key: string]: number;  // e.g., "insufficient_funds": 5
  };
  downloadUrl?: string;  // CSV export
}

interface BatchItemStatus {
  itemIndex: number;
  recipientAccount: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'RETRY';
  transactionId?: string;
  errorReason?: string;
  retryCount: number;
  lastRetryAt?: Date;
}
```

**Batch Processing Entity (PostgreSQL):**

```sql
CREATE TABLE batch_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  batch_id VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING',
  total_items INTEGER NOT NULL,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  pending_count INTEGER DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  total_fees DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(15, 2),
  currency VARCHAR(3) NOT NULL,
  notification_webhook VARCHAR(500),
  notification_email VARCHAR(255),
  idempotency_key VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, idempotency_key)
);

CREATE TABLE batch_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batch_transfers(id),
  item_index INTEGER NOT NULL,
  recipient_account VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  transaction_id UUID REFERENCES transactions(id),
  error_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batch_transfer_failed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_item_id UUID NOT NULL REFERENCES batch_transfer_items(id),
  attempt_number INTEGER NOT NULL,
  error_code VARCHAR(50) NOT NULL,
  error_message TEXT,
  error_details JSONB,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_retry_at TIMESTAMP
);

CREATE INDEX idx_batch_transfers_user_id ON batch_transfers(user_id);
CREATE INDEX idx_batch_transfers_batch_id ON batch_transfers(batch_id);
CREATE INDEX idx_batch_transfers_status ON batch_transfers(status);
CREATE INDEX idx_batch_transfer_items_batch_id ON batch_transfer_items(batch_id);
CREATE INDEX idx_batch_transfer_items_status ON batch_transfer_items(status);
```

**Batch Transfer Service:**

```typescript
@Injectable()
export class BatchTransferService {
  constructor(
    @InjectRepository(BatchTransfer)
    private batchRepository: Repository<BatchTransfer>,
    @InjectRepository(BatchTransferItem)
    private itemRepository: Repository<BatchTransferItem>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private queue: Queue,
    private notificationService: NotificationService,
    private logger: Logger,
  ) {}

  async submitBatch(
    userId: string,
    dto: BatchTransferRequest,
  ): Promise<BatchTransferResponse> {
    // Check idempotency
    if (dto.idempotencyKey) {
      const existing = await this.batchRepository.findOne({
        where: {
          user_id: userId,
          idempotency_key: dto.idempotencyKey,
        },
      });
      if (existing) {
        return this.getBatchResponse(existing);
      }
    }

    // Validate all items
    const validationErrors: ValidationError[] = [];
    for (let i = 0; i < dto.items.length; i++) {
      const item = dto.items[i];
      const errors = await this.validateTransferItem(item);
      if (errors.length > 0) {
        validationErrors.push(...errors.map(e => ({ itemIndex: i, ...e })));
      }
    }

    // Calculate costs
    const costEstimate = this.calculateBatchCost(dto.items);

    // Verify wallet balance
    const wallet = await this.walletRepository.findOne({
      where: { user_id: userId, currency: dto.items[0].currency },
    });

    if (!wallet || wallet.available_balance < costEstimate.netAmount) {
      throw new InsufficientBalanceException(
        `Insufficient balance for batch. Need ${costEstimate.netAmount}, have ${wallet?.available_balance || 0}`,
      );
    }

    // Create batch record
    const batch = await this.batchRepository.save({
      user_id: userId,
      batch_id: this.generateBatchId(),
      status: 'VALIDATION_COMPLETE',
      total_items: dto.items.length,
      pending_count: dto.items.filter(i => validationErrors.every(e => e.itemIndex !== dto.items.indexOf(i))).length,
      failure_count: validationErrors.length,
      total_amount: costEstimate.subtotal,
      total_fees: costEstimate.totalFees,
      net_amount: costEstimate.netAmount,
      currency: dto.items[0].currency,
      notification_webhook: dto.notificationWebhook,
      notification_email: dto.notificationEmail,
      idempotency_key: dto.idempotencyKey,
      metadata: dto.metadata,
    });

    // Save batch items
    for (let i = 0; i < dto.items.length; i++) {
      const item = dto.items[i];
      const hasError = validationErrors.some(e => e.itemIndex === i);

      await this.itemRepository.save({
        batch_id: batch.id,
        item_index: i,
        recipient_account: item.recipientAccount,
        amount: item.amount,
        currency: item.currency,
        description: item.description,
        status: hasError ? 'FAILED' : 'PENDING',
        error_reason: hasError
          ? validationErrors.find(e => e.itemIndex === i)?.error
          : null,
        metadata: item.metadata,
      });
    }

    // Reserve funds in wallet
    await this.walletRepository.update(
      { id: wallet.id },
      {
        ledger_balance: wallet.ledger_balance - costEstimate.netAmount,
        available_balance: wallet.available_balance - costEstimate.netAmount,
      },
    );

    // Queue batch for processing
    await this.queue.add(
      'batch-transfer-process',
      { batchId: batch.id, userId },
      { delay: 0, attempts: 1 },
    );

    return this.getBatchResponse(batch, validationErrors);
  }

  async processBatch(batchId: string, userId: string): Promise<void> {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId, user_id: userId },
    });

    if (!batch) throw new NotFoundException('Batch not found');

    // Mark as processing
    batch.status = 'PROCESSING';
    batch.started_at = new Date();
    await this.batchRepository.save(batch);

    // Get all items
    const items = await this.itemRepository.find({
      where: { batch_id: batchId, status: 'PENDING' },
      order: { item_index: 'ASC' },
    });

    let successCount = 0;
    let failureCount = 0;

    for (const item of items) {
      try {
        const transaction = await this.processTransferItem(userId, item);
        item.transaction_id = transaction.id;
        item.status = 'SUCCESS';
        successCount++;
      } catch (error) {
        item.status = 'RETRY';
        item.retry_count = 1;
        item.last_retry_at = new Date();
        item.error_reason = error.message;
        failureCount++;

        // Queue for retry
        await this.queue.add(
          'batch-transfer-retry',
          { batchItemId: item.id, retryCount: 1 },
          { delay: 2000, attempts: 5 },
        );
      }

      await this.itemRepository.save(item);
    }

    // Update batch status
    batch.status = successCount === items.length ? 'COMPLETED' : 'PARTIALLY_FAILED';
    batch.success_count = successCount;
    batch.failure_count = failureCount;
    batch.pending_count = 0;
    batch.completed_at = new Date();
    await this.batchRepository.save(batch);

    // Send notifications
    await this.notifyBatchCompletion(batch);
  }

  async retryFailedItem(
    batchItemId: string,
    retryCount: number,
  ): Promise<void> {
    const item = await this.itemRepository.findOne({
      where: { id: batchItemId },
    });

    if (!item) return;

    try {
      const batch = await this.batchRepository.findOne({
        where: { id: item.batch_id },
      });

      const transaction = await this.processTransferItem(batch.user_id, item);
      item.transaction_id = transaction.id;
      item.status = 'SUCCESS';
    } catch (error) {
      item.status = retryCount < 5 ? 'RETRY' : 'FAILED';
      item.retry_count = retryCount;
      item.last_retry_at = new Date();
      item.error_reason = error.message;

      if (retryCount < 5) {
        const backoffDelays = [2000, 4000, 8000, 16000, 32000];
        await this.queue.add(
          'batch-transfer-retry',
          { batchItemId, retryCount: retryCount + 1 },
          { delay: backoffDelays[retryCount - 1] },
        );
      }
    }

    await this.itemRepository.save(item);
  }

  async getBatchStatus(batchId: string): Promise<BatchStatusResponse> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id: batchId },
    });

    if (!batch) throw new NotFoundException('Batch not found');

    const items = await this.itemRepository.find({
      where: { batch_id: batch.id },
    });

    const failureReasons = {};
    items
      .filter(i => i.error_reason)
      .forEach(i => {
        failureReasons[i.error_reason] = (failureReasons[i.error_reason] || 0) + 1;
      });

    return {
      batchId: batch.batch_id,
      status: batch.status,
      totalItems: batch.total_items,
      successCount: batch.success_count,
      failureCount: batch.failure_count,
      pendingCount: batch.pending_count,
      successRate: (batch.success_count / batch.total_items) * 100,
      createdAt: batch.created_at,
      startedAt: batch.started_at,
      completedAt: batch.completed_at,
      processingTimeMs: batch.completed_at
        ? batch.completed_at.getTime() - batch.created_at.getTime()
        : 0,
      summary: {
        totalAmount: batch.total_amount,
        totalFees: batch.total_fees,
        netAmount: batch.net_amount,
      },
      failureReasons,
    };
  }

  private async validateTransferItem(item: BatchTransferItem): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    if (!item.recipientAccount) {
      errors.push({ field: 'recipientAccount', error: 'Required', value: item.recipientAccount });
    }

    if (!item.amount || item.amount <= 0) {
      errors.push({ field: 'amount', error: 'Must be > 0', value: item.amount });
    }

    if (!['NGN', 'USD', 'GBP', 'EUR'].includes(item.currency)) {
      errors.push({ field: 'currency', error: 'Invalid currency', value: item.currency });
    }

    // Validate recipient account exists
    try {
      await this.getUserByAccount(item.recipientAccount);
    } catch {
      errors.push({ field: 'recipientAccount', error: 'Account not found', value: item.recipientAccount });
    }

    return errors;
  }

  private calculateBatchCost(items: BatchTransferItem[]): any {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const totalFees = items.length * 50; // ₦50 per transfer (example)
    const netAmount = subtotal + totalFees;

    return { subtotal, totalFees, netAmount };
  }

  private async processTransferItem(userId: string, item: BatchTransferItem): Promise<Transaction> {
    // Implement actual transfer logic
    // Return created transaction
  }

  private async notifyBatchCompletion(batch: BatchTransfer): Promise<void> {
    if (batch.notification_webhook) {
      const payload = {
        batchId: batch.batch_id,
        status: batch.status,
        summary: {
          totalItems: batch.total_items,
          successCount: batch.success_count,
          failureCount: batch.failure_count,
        },
        completedAt: batch.completed_at,
      };

      // Send webhook
      await this.notificationService.sendWebhook(batch.notification_webhook, payload);
    }

    if (batch.notification_email) {
      // Send email notification
      await this.notificationService.sendEmail(batch.notification_email, {
        subject: `Batch Transfer Completed - ${batch.batch_id}`,
        body: `Your batch transfer is complete. ${batch.success_count}/${batch.total_items} items processed successfully.`,
      });
    }
  }

  private generateBatchId(): string {
    return `BATCH-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }
}
```

---

## FEATURE-41.2: Scheduled & Recurring Payments

### 📘 User Story: US-41.2.1 - Schedule Transfers & Recurring Payments (13 SP)

**Story ID:** US-41.2.1
**Feature:** FEATURE-41.2 (Scheduled & Recurring Payments)
**Epic:** EPIC-21 (Recurring Payments) - FROM PRODUCT BACKLOG

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 41
**Status:** 🔄 Not Started

---

#### User Story

```
As a merchant/user
I want to schedule transfers for future dates or set up recurring payments
So that I can automate payroll, subscription billing, rent payments, and other regular expenses without manual intervention
```

---

#### Business Value

**Value Statement:**
Scheduled and recurring payments enable financial automation. Users and merchants can set up standing orders, subscription billing, and salary payroll to run automatically without manual processing each cycle. This reduces operational overhead and enables subscription-based business models.

**Impact:**
- **Automation:** Eliminate manual payment processing for recurring needs
- **Business Model:** Enable subscription-based services and recurring billing
- **Reliability:** Guaranteed payments on schedule (with retries)
- **Forecasting:** Users can plan cash flow with predictable payments
- **Compliance:** Audit trail for all scheduled transactions

**Success Criteria:**
- Schedule payments for specific dates or recurring intervals
- Support hourly, daily, weekly, biweekly, monthly, quarterly, annual recurrence
- Automatic execution with webhook notification
- Intelligent retry on failure (configurable)
- Pause/resume/cancel capabilities

---

#### Acceptance Criteria

**Functional - Scheduled Transfers:**
- [ ] **AC1:** Accept `POST /api/v1/transfers/scheduled` for single-date scheduling
- [ ] **AC2:** Support scheduling up to 1 year in advance
- [ ] **AC3:** Minimum scheduling: 1 hour from now (allow time for processing)
- [ ] **AC4:** Return scheduled transfer ID and execution time
- [ ] **AC5:** Support status updates: `SCHEDULED`, `EXECUTING`, `COMPLETED`, `FAILED`
- [ ] **AC6:** Provide `GET /api/v1/transfers/scheduled/{id}` for status check
- [ ] **AC7:** Provide `PATCH /api/v1/transfers/scheduled/{id}` for modifications before execution
- [ ] **AC8:** Provide `DELETE /api/v1/transfers/scheduled/{id}` for cancellation before execution
- [ ] **AC9:** Prevent modifications after execution starts
- [ ] **AC10:** Show execution time in UTC and user's local timezone

**Functional - Recurring Payments:**
- [ ] **AC11:** Accept `POST /api/v1/transfers/recurring` for recurring setup
- [ ] **AC12:** Support recurrence patterns: hourly, daily, weekly, biweekly, monthly, quarterly, annual
- [ ] **AC13:** Support `occurrences` limit (e.g., 12 times, then stop)
- [ ] **AC14:** Support `endDate` for open-ended cutoff
- [ ] **AC15:** Support `maxOccurrences` with daily/monthly cap
- [ ] **AC16:** Automatic execution on schedule (via background job)
- [ ] **AC17:** Create transaction records for each execution
- [ ] **AC18:** Support `skippedDates` for holidays/blackout dates
- [ ] **AC19:** Auto-adjust for month-end dates (e.g., Feb 29 → Feb 28 in non-leap years)
- [ ] **AC20:** Support smart scheduling (e.g., "last business day of month")

**Functional - Recurring Management:**
- [ ] **AC21:** Provide `GET /api/v1/transfers/recurring` to list all recurring transfers
- [ ] **AC22:** Filter by status: ACTIVE, PAUSED, COMPLETED, FAILED
- [ ] **AC23:** Show next execution date for each recurring transfer
- [ ] **AC24:** Support pause/resume: `PATCH /api/v1/transfers/recurring/{id}/pause`
- [ ] **AC25:** Support modification: `PATCH /api/v1/transfers/recurring/{id}` (amount, frequency)
- [ ] **AC26:** Support cancellation: `DELETE /api/v1/transfers/recurring/{id}`
- [ ] **AC27:** Provide execution history: `GET /api/v1/transfers/recurring/{id}/executions`
- [ ] **AC28:** Show upcoming executions: `GET /api/v1/transfers/recurring/{id}/upcoming`

**Functional - Failure Handling:**
- [ ] **AC29:** Implement exponential backoff retry for failed executions (2s, 4s, 8s, 16s, 32s)
- [ ] **AC30:** Max 3 retry attempts per execution (configurable)
- [ ] **AC31:** If all retries fail, mark execution as FAILED and log detailed reason
- [ ] **AC32:** Send failure notification via webhook/email
- [ ] **AC33:** Pause recurring transfer if 3 consecutive failures (configurable)
- [ ] **AC34:** Provide failure recovery options: `POST /api/v1/transfers/recurring/{id}/retry-failed`

**Functional - Cost Estimation:**
- [ ] **AC35:** Show total estimated cost for recurring transfer (all planned occurrences)
- [ ] **AC36:** Show balance impact: current balance, balance after all scheduled payments
- [ ] **AC37:** Alert if recurring schedule would cause overdraft on any execution
- [ ] **AC38:** Support `allowOverdraft` flag (configurable per user)

**Functional - Reporting & Analytics:**
- [ ] **AC39:** Provide scheduled transfer calendar view (upcoming 90 days)
- [ ] **AC40:** Show execution history with success/failure rate
- [ ] **AC41:** Export scheduled transfers as CSV or iCal format
- [ ] **AC42:** Dashboard widget: next 5 scheduled payments
- [ ] **AC43:** Analytics: total scheduled amount, frequency distribution

**Analytics & Audit:**
- [ ] **AC44:** Audit log: creation, modifications, executions, failures
- [ ] **AC45:** Store creator info and modification history
- [ ] **AC46:** Timestamp all state changes (scheduled, executed, paused, resumed)

**Non-Functional:**
- [ ] **AC47:** Scheduling API response: <100ms
- [ ] **AC48:** Execution latency: within 30 seconds of scheduled time
- [ ] **AC49:** Support 100,000+ active recurring transfers
- [ ] **AC50:** Support 1M+ scheduled executions per day
- [ ] **AC51:** Processing throughput: 10,000 executions/minute

---

#### Technical Specifications

**Scheduled Transfer Request:**

```typescript
interface ScheduleTransferRequest {
  recipientAccount: string;
  amount: number;
  currency: string;
  scheduledTime: Date;  // ISO 8601
  description: string;
  metadata?: Record<string, any>;
  notificationWebhook?: string;
  notificationEmail?: string;
}

interface ScheduleTransferResponse {
  scheduledTransferId: string;
  status: 'SCHEDULED';
  recipientAccount: string;
  amount: number;
  currency: string;
  scheduledTime: Date;
  timezone?: string;
  createdAt: Date;
  estimatedFee: number;
}
```

**Recurring Transfer Request:**

```typescript
interface RecurringTransferRequest {
  recipientAccount: string;
  amount: number;
  currency: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';
  startDate: Date;
  endDate?: Date;  // For time-limited recurrence
  occurrences?: number;  // Max number of occurrences
  time?: string;  // HH:MM for daily+ frequency
  dayOfWeek?: number;  // 0-6 for weekly
  dayOfMonth?: number;  // 1-31 for monthly
  description: string;
  metadata?: Record<string, any>;
  skippedDates?: Date[];  // Holidays, blackout dates
  maxMonthlyAmount?: number;  // Cap per month
  maxDailyCount?: number;  // Cap per day
  notificationWebhook?: string;
  notificationEmail?: string;
  allowOverdraft?: boolean;
  pauseOnFailure?: boolean;  // Pause after N failures
  failureThreshold?: number;  // Number of consecutive failures to trigger pause
}

interface RecurringTransferResponse {
  recurringTransferId: string;
  status: 'ACTIVE';
  recipientAccount: string;
  amount: number;
  frequency: string;
  startDate: Date;
  nextExecutionDate: Date;
  endDate?: Date;
  totalOccurrences: number;
  completedOccurrences: number;
  failedOccurrences: number;
  estimatedTotalCost: number;
  createdAt: Date;
}
```

**Scheduled Transfer Entity:**

```sql
CREATE TABLE scheduled_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  scheduled_transfer_id VARCHAR(50) UNIQUE NOT NULL,
  recipient_account VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'SCHEDULED',
  transaction_id UUID REFERENCES transactions(id),
  description TEXT,
  notification_webhook VARCHAR(500),
  notification_email VARCHAR(255),
  metadata JSONB,
  executed_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recurring_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  recurring_transfer_id VARCHAR(50) UNIQUE NOT NULL,
  recipient_account VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  max_occurrences INTEGER,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  completed_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  next_execution_at TIMESTAMP,
  last_execution_at TIMESTAMP,
  paused_at TIMESTAMP,
  description TEXT,
  notification_webhook VARCHAR(500),
  notification_email VARCHAR(255),
  allow_overdraft BOOLEAN DEFAULT FALSE,
  pause_on_failure BOOLEAN DEFAULT TRUE,
  failure_threshold INTEGER DEFAULT 3,
  consecutive_failures INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recurring_transfer_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_transfer_id UUID NOT NULL REFERENCES recurring_transfers(id),
  execution_number INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  scheduled_for TIMESTAMP NOT NULL,
  executed_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scheduled_transfers_user_id ON scheduled_transfers(user_id);
CREATE INDEX idx_scheduled_transfers_status ON scheduled_transfers(status);
CREATE INDEX idx_scheduled_transfers_scheduled_time ON scheduled_transfers(scheduled_time);
CREATE INDEX idx_recurring_transfers_user_id ON recurring_transfers(user_id);
CREATE INDEX idx_recurring_transfers_status ON recurring_transfers(status);
CREATE INDEX idx_recurring_transfers_next_execution ON recurring_transfers(next_execution_at);
CREATE INDEX idx_recurring_executions_recurring_id ON recurring_transfer_executions(recurring_transfer_id);
```

---

## FEATURE-41.3: CSV Import for Bulk Operations

### 📘 User Story: US-41.3.1 - CSV Import for Batch Transfers (6 SP)

**Story ID:** US-41.3.1
**Feature:** FEATURE-41.3 (CSV Import)
**Epic:** EPIC-19 (Batch Operations)

**Story Points:** 6
**Priority:** P1 (High)
**Sprint:** Sprint 41
**Status:** 🔄 Not Started

---

#### User Story

```
As a merchant/accounting team
I want to upload a CSV file with transfer recipients and amounts
So that I can easily process payroll, vendor payments, or refunds from spreadsheets without manual API integration
```

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Accept `POST /api/v1/transfers/batch/import-csv` with CSV file upload
- [ ] **AC2:** Support CSV format: `recipient_account`, `amount`, `currency`, `description`
- [ ] **AC3:** Validate CSV structure and field types
- [ ] **AC4:** Detect and report CSV parsing errors (malformed rows, missing columns)
- [ ] **AC5:** Parse CSV and convert to batch transfer format
- [ ] **AC6:** Return batch ID and processing details
- [ ] **AC7:** Support up to 100,000 rows per CSV file
- [ ] **AC8:** Provide `GET /api/v1/transfers/batch/import-csv/{uploadId}/status` for processing status
- [ ] **AC9:** Download invalid rows CSV for correction and re-upload

**Non-Functional:**
- [ ] **AC10:** CSV parsing: <5 seconds for 10,000 rows
- [ ] **AC11:** File upload: <30 seconds for 50MB file
- [ ] **AC12:** Validate at least 500 rows/second

---

## Sprint Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|-----------|
| RISK-41-001 | Batch processing with 10k items causes memory overflow | Low | Critical | Implement streaming/chunked processing, use database cursor pagination |
| RISK-41-002 | Scheduled transactions execute late due to job queue backlog | Medium | High | Implement priority queue, multiple worker processes, monitoring |
| RISK-41-003 | Race condition in concurrent batch submissions | Low | Critical | Database-level idempotency constraint, distributed locking |
| RISK-41-004 | Failed retry logic doesn't recover items properly | Medium | High | Comprehensive retry testing, manual recovery endpoint |
| RISK-41-005 | CSV file contains invalid encoding or special characters | Low | Medium | Support UTF-8, UTF-16, ASCII; sanitize input |

---

## Sprint Dependencies

- **Sprint 5** (Wallet & Transactions): Core transaction infrastructure required
- **Sprint 7** (Notifications): Webhook and email notification system
- **Sprint 8** (Analytics): Batch processing analytics and reporting
- **Bull Queue**: Job queue system for batch processing (already integrated)

---

## Sprint Notes & Decisions

1. **Batch Size Limits:** Max 10,000 items per batch to prevent memory/database issues; users can split larger operations
2. **Async Processing:** All batches process asynchronously for non-blocking API; response includes batch ID for status polling
3. **Idempotency:** Critical for production reliability; idempotency keys prevent duplicate processing on retry
4. **Retry Strategy:** Exponential backoff (2s, 4s, 8s, 16s, 32s) with max 5 attempts; failed items don't block entire batch
5. **Fund Reservation:** Funds reserved immediately upon batch submission; released if validation fails
6. **Recurring Math:** Use cron-like scheduling for complex recurrence patterns; handle month-end edge cases
7. **CSV Import:** Initial MVP supports basic format; advanced features (templates, scheduled imports) in Phase 2

---

**Document Version:** 1.0.0
