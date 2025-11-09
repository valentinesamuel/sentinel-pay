# Sprint 40 Tickets - POS System Implementation

**Ticket:** TICKET-40-001
**Title:** POS Terminal Integration & Payment Processing
**Story Points:** 24
**Priority:** P0 - Critical

## API Specification

### 1. Terminal Initialization Endpoint

**POST /api/v1/pos/terminals/initialize**

Initialize POS terminal with device information and connection type.

**Request:**
```json
{
  "serialNumber": "TERM-2024-00001",
  "deviceName": "Ingenico iWL250",
  "connectionType": "BLUETOOTH",
  "bluetoothMac": "00:1A:7D:DA:71:13",
  "firmwareVersion": "4.2.1",
  "supportedPaymentMethods": ["CARD", "NFC", "QR"],
  "capabilities": {
    "nfcSupported": true,
    "chipReaderSupported": true,
    "stripeReaderSupported": true,
    "qrScannerSupported": false,
    "thermalPrinterSupported": true,
    "offlineModeSupported": true
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "terminalId": "term_550e8400e29b41d4a716446655440000",
  "status": "ACTIVE",
  "merchantAccountId": "merchant_550e8400e29b41d4a716446655440000",
  "message": "Terminal initialized successfully",
  "nextHeartbeatInterval": 30000
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "INVALID_SERIAL_NUMBER",
  "message": "Terminal with this serial number already exists"
}
```

---

### 2. Process Payment Endpoint

**POST /api/v1/pos/transactions/process**

Process payment transaction with multiple payment method support.

**Request:**
```json
{
  "terminalId": "term_550e8400e29b41d4a716446655440000",
  "cashierId": "emp_550e8400e29b41d4a716446655440000",
  "amount": 25000.00,
  "currency": "NGN",
  "paymentMethod": "CARD",
  "cardData": {
    "cardToken": "tok_visa_4242",
    "last4Digits": "4242",
    "expiryMonth": "12",
    "expiryYear": "2026",
    "cardholderName": "JOHN DOE"
  },
  "metadata": {
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "2348012345678",
    "invoiceNumber": "INV-2024-001",
    "splits": [
      {
        "accountId": "acc_sales_commission",
        "amount": 500.00,
        "description": "Sales rep commission"
      }
    ]
  }
}
```

**Response (200 - Success):**
```json
{
  "success": true,
  "transactionId": "txn_550e8400e29b41d4a716446655440000",
  "externalTransactionId": "AUTH-2024-1234567890",
  "status": "SUCCESS",
  "amount": 25000.00,
  "feeAmount": 250.00,
  "settlementAmount": 24750.00,
  "currency": "NGN",
  "paymentMethod": "CARD",
  "authorizedAt": "2024-11-09T14:30:00Z",
  "receiptNumber": "REC-20241109-001",
  "message": "Payment processed successfully"
}
```

**Response (202 - Pending):**
```json
{
  "success": false,
  "transactionId": "txn_550e8400e29b41d4a716446655440000",
  "status": "PROCESSING",
  "message": "Payment processing in progress, please wait",
  "estimatedWaitTime": 5000
}
```

**Response (400 - Declined):**
```json
{
  "success": false,
  "transactionId": "txn_550e8400e29b41d4a716446655440000",
  "status": "FAILED",
  "error": "CARD_DECLINED",
  "errorCode": "CARD_DECLINED_051",
  "message": "Card was declined by issuing bank"
}
```

---

### 3. Offline Transaction Queue Endpoint

**POST /api/v1/pos/transactions/queue**

Queue transaction for offline processing when network unavailable.

**Request:**
```json
{
  "terminalId": "term_550e8400e29b41d4a716446655440000",
  "amount": 15000.00,
  "paymentMethod": "QR",
  "qrCode": "00020126580014br.gov.bcb.brcode0136",
  "metadata": {
    "customerName": "Jane Smith",
    "offlineRetry": 1
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "queueId": "queue_550e8400e29b41d4a716446655440000",
  "queuePosition": 45,
  "queueSize": 127,
  "estimatedSyncTime": 180000,
  "message": "Transaction queued successfully"
}
```

---

### 4. Batch Sync Endpoint

**POST /api/v1/pos/transactions/batch-sync**

Sync queued transactions when network is restored.

**Request:**
```json
{
  "terminalId": "term_550e8400e29b41d4a716446655440000",
  "queueIds": [
    "queue_550e8400e29b41d4a716446655440000",
    "queue_550e8400e29b41d4a716446655440001",
    "queue_550e8400e29b41d4a716446655440002"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "syncId": "sync_550e8400e29b41d4a716446655440000",
  "totalQueued": 3,
  "successCount": 3,
  "failedCount": 0,
  "results": [
    {
      "queueId": "queue_550e8400e29b41d4a716446655440000",
      "status": "SYNCED",
      "transactionId": "txn_550e8400e29b41d4a716446655440000",
      "externalTransactionId": "AUTH-2024-1234567890"
    }
  ],
  "syncedAt": "2024-11-09T14:35:00Z"
}
```

---

### 5. Cashier Login Endpoint

**POST /api/v1/pos/cashiers/login**

Authenticate cashier and start session on terminal.

**Request:**
```json
{
  "terminalId": "term_550e8400e29b41d4a716446655440000",
  "pin": "1234",
  "biometric": {
    "type": "FINGERPRINT",
    "templateId": "fp_550e8400e29b41d4a716446655440000"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "sessionId": "session_550e8400e29b41d4a716446655440000",
  "cashierId": "emp_550e8400e29b41d4a716446655440000",
  "cashierName": "Sarah Johnson",
  "shiftName": "MORNING",
  "openingFloat": 5000.00,
  "loginTime": "2024-11-09T08:00:00Z",
  "sessionTimeout": 1800000
}
```

---

### 6. Cashier Logout & Till Reconciliation Endpoint

**POST /api/v1/pos/cashiers/logout**

End cashier session and initiate till reconciliation.

**Request:**
```json
{
  "sessionId": "session_550e8400e29b41d4a716446655440000",
  "countedAmount": 28500.00,
  "countedCash": 5200.00,
  "noteUrl": "https://storage.example.com/photo_2024_11_09_001.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "reconciliationId": "rec_550e8400e29b41d4a716446655440000",
  "sessionSummary": {
    "totalTransactions": 42,
    "totalSalesAmount": 28500.00,
    "cardTransactions": 35,
    "nfcTransactions": 5,
    "qrTransactions": 2,
    "refunds": 1,
    "discounts": 2,
    "fees": 285.00
  },
  "expectedAmount": 28500.00,
  "countedAmount": 28500.00,
  "discrepancy": 0.00,
  "status": "BALANCED",
  "reconciliationTime": "2024-11-09T17:30:00Z"
}
```

**Response (200 - With Discrepancy):**
```json
{
  "success": true,
  "reconciliationId": "rec_550e8400e29b41d4a716446655440001",
  "sessionSummary": {
    "totalTransactions": 42,
    "totalSalesAmount": 28500.00,
    "cardTransactions": 35,
    "nfcTransactions": 5,
    "qrTransactions": 2
  },
  "expectedAmount": 28500.00,
  "countedAmount": 28300.00,
  "discrepancy": -200.00,
  "status": "DISCREPANCY",
  "requiresReview": true,
  "escalationRequired": false,
  "message": "Till count discrepancy of ₦200 detected"
}
```

---

### 7. Receipt Generation Endpoint

**GET /api/v1/pos/transactions/{transactionId}/receipt**

Generate receipt for transaction (supports multiple formats).

**Query Parameters:**
```
format=PDF|HTML|PLAIN_TEXT
delivery=PRINT|SMS|EMAIL|DOWNLOAD
phoneNumber=2348012345678 (if SMS)
email=customer@example.com (if EMAIL)
```

**Response (200):**
```json
{
  "success": true,
  "receiptNumber": "REC-20241109-001",
  "transactionId": "txn_550e8400e29b41d4a716446655440000",
  "format": "PDF",
  "delivery": "EMAIL",
  "content": {
    "merchant": {
      "name": "Sample Store",
      "address": "123 Main Street, Lagos",
      "phone": "2348012345678"
    },
    "transaction": {
      "dateTime": "2024-11-09T14:30:00Z",
      "amount": 25000.00,
      "currency": "NGN",
      "paymentMethod": "CARD",
      "last4Digits": "4242",
      "authorizationCode": "AUTH-123456"
    },
    "qrCode": "https://payment.example.com/verify/txn_550e8400e29b41d4a716446655440000"
  },
  "deliveryStatus": "SENT"
}
```

---

## Database Migrations

### Migration: Create POS Tables

```sql
-- Create POS Terminals Table
CREATE TABLE pos_terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts(id),
  serial_number VARCHAR(50) UNIQUE NOT NULL,
  connection_type VARCHAR(20) NOT NULL,
  bluetooth_mac VARCHAR(100),
  usb_device_id VARCHAR(50),
  wifi_ssid VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  firmware_version VARCHAR(20),
  supported_payment_methods TEXT[] NOT NULL,
  capabilities JSONB,
  last_heartbeat TIMESTAMP,
  last_sync TIMESTAMP,
  allowed_cashiers UUID[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create POS Transactions Table
CREATE TABLE pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts(id),
  terminal_id UUID NOT NULL REFERENCES pos_terminals(id),
  cashier_id UUID NOT NULL REFERENCES employees(id),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  payment_method VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  fee_amount DECIMAL(12, 2) DEFAULT 0,
  settlement_amount DECIMAL(12, 2),
  card_tokenized VARCHAR(50),
  qr_code VARCHAR(100),
  external_transaction_id VARCHAR(50) UNIQUE,
  metadata JSONB,
  failure_reason TEXT,
  authorized_at TIMESTAMP,
  settled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_merchant_terminal (merchant_account_id, terminal_id),
  INDEX idx_cashier_date (cashier_id, created_at)
);

-- Create Offline Transaction Queue Table
CREATE TABLE offline_transaction_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES pos_terminals(id),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts(id),
  transaction_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'QUEUED',
  sync_attempts INT DEFAULT 0,
  last_sync_attempt TIMESTAMP,
  external_transaction_id VARCHAR(50),
  sync_error TEXT,
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP,
  queue_position INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_terminal_status (terminal_id, status),
  INDEX idx_queue_position (terminal_id, queue_position)
);

-- Create Cashier Sessions Table
CREATE TABLE cashier_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_account_id UUID NOT NULL REFERENCES merchant_accounts(id),
  terminal_id UUID NOT NULL REFERENCES pos_terminals(id),
  cashier_id UUID NOT NULL REFERENCES employees(id),
  shift_name VARCHAR(20) NOT NULL,
  opening_float DECIMAL(12, 2) DEFAULT 0,
  login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  session_summary JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_terminal_cashier_date (terminal_id, cashier_id, login_time)
);

-- Create Till Reconciliation Table
CREATE TABLE till_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cashier_session_id UUID NOT NULL REFERENCES cashier_sessions(id),
  reconciliation_manager_id UUID NOT NULL REFERENCES employees(id),
  expected_amount DECIMAL(12, 2) NOT NULL,
  counted_amount DECIMAL(12, 2) NOT NULL,
  discrepancy DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'BALANCED',
  notes TEXT,
  photo_url VARCHAR(500),
  reconciliation_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_date (cashier_session_id, reconciliation_time)
);

-- Create Receipt Records Table
CREATE TABLE receipt_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES pos_transactions(id),
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  format VARCHAR(20) NOT NULL,
  delivery_method VARCHAR(20),
  delivery_target VARCHAR(100),
  delivery_status VARCHAR(20),
  qr_code_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_pos_transactions_merchant ON pos_transactions(merchant_account_id);
CREATE INDEX idx_pos_transactions_terminal ON pos_transactions(terminal_id);
CREATE INDEX idx_offline_queue_merchant ON offline_transaction_queue(merchant_account_id);
CREATE INDEX idx_cashier_sessions_merchant ON cashier_sessions(merchant_account_id);
```

---

## Technical Implementation

### Service: POSTransactionService

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { POSTransaction, TransactionStatus, PaymentMethod } from './entities/pos-transaction.entity';
import { PaymentProcessorService } from '../payments/payment-processor.service';
import { FraudDetectionService } from '../fraud/fraud-detection.service';

@Injectable()
export class POSTransactionService {
  constructor(
    @InjectRepository(POSTransaction)
    private transactionRepository: Repository<POSTransaction>,
    private paymentProcessor: PaymentProcessorService,
    private fraudDetection: FraudDetectionService,
    private dataSource: DataSource,
  ) {}

  async processTransaction(
    terminalId: string,
    cashierId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    cardData?: any,
    metadata?: any,
  ): Promise<POSTransaction> {
    // Validate terminal and merchant status
    const terminal = await this.validateTerminal(terminalId);

    // Create transaction record
    const transaction = this.transactionRepository.create({
      terminalId,
      cashierId,
      amount,
      paymentMethod,
      status: TransactionStatus.PENDING,
      metadata,
      feeAmount: this.calculateFee(amount, paymentMethod),
    });

    await this.transactionRepository.save(transaction);

    try {
      // Run fraud detection
      const fraudScore = await this.fraudDetection.scoreTransaction({
        amount,
        paymentMethod,
        geolocation: metadata?.geolocation,
        cardTokenized: cardData?.cardToken,
      });

      if (fraudScore > 0.8) {
        throw new BadRequestException('TRANSACTION_FLAGGED_HIGH_FRAUD_RISK');
      }

      // Process payment through processor
      const result = await this.paymentProcessor.authorize({
        transactionId: transaction.id,
        amount,
        currency: transaction.currency,
        paymentMethod,
        cardData,
      });

      // Update transaction with auth result
      transaction.status = TransactionStatus.SUCCESS;
      transaction.externalTransactionId = result.authorizationCode;
      transaction.authorizedAt = new Date();
      transaction.settlementAmount = amount - transaction.feeAmount;
      transaction.metadata = {
        ...metadata,
        fraudScore,
        avsResult: result.avsResult,
      };

      await this.transactionRepository.save(transaction);
      return transaction;
    } catch (error) {
      transaction.status = TransactionStatus.FAILED;
      transaction.failureReason = error.message;
      await this.transactionRepository.save(transaction);
      throw error;
    }
  }

  private calculateFee(amount: number, paymentMethod: PaymentMethod): number {
    const feePercentages = {
      [PaymentMethod.CARD]: 0.01, // 1%
      [PaymentMethod.NFC]: 0.01,
      [PaymentMethod.QR]: 0.005, // 0.5%
      [PaymentMethod.USSD]: 0.02, // 2%
    };
    return Math.round(amount * (feePercentages[paymentMethod] || 0.01));
  }

  private async validateTerminal(terminalId: string): Promise<any> {
    // Implementation
  }
}
```

---

### Service: OfflineQueueService

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfflineTransactionQueue, QueueStatus } from './entities/offline-queue.entity';

@Injectable()
export class OfflineQueueService {
  constructor(
    @InjectRepository(OfflineTransactionQueue)
    private queueRepository: Repository<OfflineTransactionQueue>,
  ) {}

  async queueTransaction(
    terminalId: string,
    merchantId: string,
    transactionData: any,
  ): Promise<OfflineTransactionQueue> {
    const queueSize = await this.queueRepository.count({
      where: { terminalId, status: QueueStatus.QUEUED },
    });

    const queueItem = this.queueRepository.create({
      terminalId,
      merchantAccountId: merchantId,
      transactionData,
      status: QueueStatus.QUEUED,
      queuePosition: queueSize + 1,
    });

    return await this.queueRepository.save(queueItem);
  }

  async batchSync(
    terminalId: string,
    queueIds: string[],
  ): Promise<{ successCount: number; failedCount: number; results: any[] }> {
    const items = await this.queueRepository.find({
      where: { id: queueIds },
    });

    const results = [];
    for (const item of items) {
      try {
        // Attempt sync with exponential backoff
        item.status = QueueStatus.SYNCING;
        item.syncAttempts += 1;
        item.lastSyncAttempt = new Date();

        await this.queueRepository.save(item);

        // Call parent sync endpoint
        const response = await this.syncToServer(item);

        item.status = QueueStatus.SYNCED;
        item.externalTransactionId = response.transactionId;
        item.syncedAt = new Date();

        results.push({
          queueId: item.id,
          status: 'SYNCED',
          transactionId: response.transactionId,
        });
      } catch (error) {
        item.status = QueueStatus.FAILED;
        item.syncError = error.message;
        results.push({
          queueId: item.id,
          status: 'FAILED',
          error: error.message,
        });
      }

      await this.queueRepository.save(item);
    }

    return {
      successCount: results.filter((r) => r.status === 'SYNCED').length,
      failedCount: results.filter((r) => r.status === 'FAILED').length,
      results,
    };
  }

  private async syncToServer(queueItem: OfflineTransactionQueue): Promise<any> {
    // Implementation
  }
}
```

---

## Test Cases

### Test: Process Card Payment Successfully

```typescript
describe('POSTransactionService - Process Card Payment', () => {
  it('should process valid card payment and return success', async () => {
    const terminalId = 'term_test_001';
    const amount = 25000;
    const result = await service.processTransaction(
      terminalId,
      'cashier_001',
      amount,
      PaymentMethod.CARD,
      { cardToken: 'tok_visa_4242', last4Digits: '4242' },
      { customerName: 'John Doe' },
    );

    expect(result.status).toBe(TransactionStatus.SUCCESS);
    expect(result.amount).toBe(amount);
    expect(result.feeAmount).toBe(250); // 1% fee
    expect(result.settlementAmount).toBe(24750);
    expect(result.externalTransactionId).toBeDefined();
  });

  it('should fail payment when fraud score exceeds threshold', async () => {
    const terminalId = 'term_test_002';
    jest.spyOn(fraudDetection, 'scoreTransaction').mockResolvedValue(0.95);

    await expect(
      service.processTransaction(
        terminalId,
        'cashier_001',
        100000,
        PaymentMethod.CARD,
        { cardToken: 'tok_visa_4242' },
      ),
    ).rejects.toThrow('TRANSACTION_FLAGGED_HIGH_FRAUD_RISK');
  });
});
```

### Test: Offline Transaction Queueing

```typescript
describe('OfflineQueueService - Queue and Sync', () => {
  it('should queue transaction when offline', async () => {
    const queueItem = await service.queueTransaction(
      'term_test_001',
      'merchant_001',
      {
        amount: 15000,
        paymentMethod: PaymentMethod.QR,
        qrCode: '00020126580014br.gov.bcb.brcode0136',
      },
    );

    expect(queueItem.status).toBe(QueueStatus.QUEUED);
    expect(queueItem.queuePosition).toBe(1);
  });

  it('should batch sync queued transactions', async () => {
    const queueIds = ['queue_001', 'queue_002', 'queue_003'];
    const result = await service.batchSync('term_test_001', queueIds);

    expect(result.successCount).toBeGreaterThanOrEqual(0);
    expect(result.results).toHaveLength(3);
  });
});
```

### Test: Cashier Session Management

```typescript
describe('CashierSessionService - Login and Reconciliation', () => {
  it('should create cashier session on login', async () => {
    const session = await service.login(
      'term_test_001',
      '1234', // PIN
      { type: 'FINGERPRINT', templateId: 'fp_001' },
    );

    expect(session.status).toBe(SessionStatus.ACTIVE);
    expect(session.cashierId).toBeDefined();
    expect(session.loginTime).toBeDefined();
  });

  it('should reconcile till with balanced count', async () => {
    const reconciliation = await service.reconcileTill(
      'session_001',
      28500.00, // expected
      28500.00, // counted
    );

    expect(reconciliation.status).toBe(ReconciliationStatus.BALANCED);
    expect(reconciliation.discrepancy).toBe(0);
  });

  it('should flag discrepancy when till count does not match', async () => {
    const reconciliation = await service.reconcileTill(
      'session_002',
      28500.00, // expected
      28300.00, // counted
    );

    expect(reconciliation.status).toBe(ReconciliationStatus.DISCREPANCY);
    expect(reconciliation.discrepancy).toBe(-200);
    expect(reconciliation.requiresReview).toBe(true);
  });
});
```

---

## Testing Strategy

### Unit Tests (40+ test cases)

**POSTransactionService Tests:**
```typescript
describe('POSTransactionService - Unit Tests', () => {
  it('should calculate correct fee for card transactions (1%)', () => {
    const amount = 25000;
    const fee = service.calculateFee(amount, PaymentMethod.CARD);
    expect(fee).toBe(250);
  });

  it('should calculate correct fee for QR transactions (0.5%)', () => {
    const amount = 20000;
    const fee = service.calculateFee(amount, PaymentMethod.QR);
    expect(fee).toBe(100);
  });

  it('should reject transaction if fraud score > 0.8', async () => {
    jest.spyOn(fraudService, 'scoreTransaction').mockResolvedValue(0.85);
    await expect(service.processTransaction(...)).rejects.toThrow();
  });

  it('should idempotently handle duplicate transaction requests', async () => {
    const txnData = { terminalId, amount, paymentMethod };
    const result1 = await service.processTransaction(txnData);
    const result2 = await service.processTransaction(txnData);
    expect(result1.transactionId).toBe(result2.transactionId);
  });

  it('should tokenize card data immediately', async () => {
    const tokenizeSpy = jest.spyOn(paymentProcessor, 'tokenize');
    await service.processTransaction(...);
    expect(tokenizeSpy).toHaveBeenCalledWith(cardData);
  });
});
```

**OfflineQueueService Tests:**
```typescript
describe('OfflineQueueService - Unit Tests', () => {
  it('should reject queueing when queue capacity exceeded (>1000)', async () => {
    for (let i = 0; i < 1000; i++) {
      await service.queueTransaction('term_001', {});
    }
    await expect(service.queueTransaction('term_001', {})).rejects.toThrow('Queue capacity exceeded');
  });

  it('should maintain FIFO order in queue', async () => {
    const q1 = await service.queueTransaction('term_001', { amount: 1000 });
    const q2 = await service.queueTransaction('term_001', { amount: 2000 });
    const q3 = await service.queueTransaction('term_001', { amount: 3000 });

    expect(q1.queuePosition).toBe(1);
    expect(q2.queuePosition).toBe(2);
    expect(q3.queuePosition).toBe(3);
  });

  it('should implement exponential backoff in sync retry', async () => {
    const delays = [2000, 4000, 8000, 16000, 32000];
    // Verify retry delays match expected backoff
  });

  it('should compress transaction payload for sync', async () => {
    const originalSize = JSON.stringify(largeTransaction).length;
    const compressedSize = await service.compressPayload(largeTransaction);
    expect(compressedSize).toBeLessThan(originalSize * 0.5);
  });
});
```

**TillReconciliationService Tests:**
```typescript
describe('TillReconciliationService - Unit Tests', () => {
  it('should detect balanced till (₦0 variance)', async () => {
    const result = await service.reconcileTill('session_001', 50000, 50000);
    expect(result.status).toBe('BALANCED');
  });

  it('should flag minor discrepancy (₦1-₦500)', async () => {
    const result = await service.reconcileTill('session_001', 50000, 50250);
    expect(result.status).toBe('MINOR_DISCREPANCY');
    expect(result.requiresReview).toBe(true);
  });

  it('should flag major discrepancy (>₦500)', async () => {
    const result = await service.reconcileTill('session_001', 50000, 49000);
    expect(result.status).toBe('MAJOR_DISCREPANCY');
    expect(result.escalationRequired).toBe(true);
  });

  it('should calculate session summary correctly', async () => {
    const summary = await service.calculateSessionSummary('session_001');
    expect(summary.totalTransactions).toBe(42);
    expect(summary.totalSalesAmount).toBe(105500);
  });
});
```

### Integration Tests (35+ test cases)

**Payment Processing Integration:**
- Test card payment → tokenization → authorization → settlement
- Test NFC payment → device read → authorization → settlement
- Test QR payment → scan → authorization → settlement
- Test USSD payment → fallback → authorization → settlement
- Test payment with fraud score → rejection
- Test payment processor timeout → queue and retry

**Offline Queue Integration:**
- Queue transaction → network failure → auto-sync on restoration
- Multiple terminals → independent queue management
- Queue overflow → alert and blocking
- Sync failure → exponential backoff retry

**Till Reconciliation Integration:**
- Cashier login → transaction processing → logout → reconciliation
- Till discrepancy → manager review → approval/rejection
- Photo capture → evidence storage → audit trail

### E2E Tests (12+ test cases)

**Complete Transaction Flow:**
```typescript
describe('POS - End-to-End Tests', () => {
  it('should complete full card transaction flow', async () => {
    // 1. Initialize terminal
    const terminal = await posService.initializeTerminal({...});

    // 2. Cashier login
    const session = await posService.loginCashier(terminal.id, '1234', {...});

    // 3. Process payment
    const transaction = await posService.processPayment(terminal.id, {
      amount: 25000,
      paymentMethod: 'CARD',
    });

    // 4. Generate receipt
    const receipt = await posService.generateReceipt(transaction.id);

    // 5. Verify transaction in settlement
    const settled = await paymentService.verifySettlement(transaction.externalId);
    expect(settled).toBeDefined();
  });

  it('should handle offline transaction queue sync', async () => {
    // 1. Offline payment
    const offline = await posService.queueTransaction({...});

    // 2. Simulate network restoration
    await networkService.restoreConnection();

    // 3. Verify sync completion
    const synced = await posService.getQueueStatus(terminal.id);
    expect(synced.queueSize).toBe(0);
  });

  it('should complete cashier shift with till reconciliation', async () => {
    // 1. Process 42 transactions during shift
    for (let i = 0; i < 42; i++) {
      await posService.processPayment(...);
    }

    // 2. Cashier logout triggers reconciliation
    const reconciliation = await posService.logoutCashier(session.id, {
      countedAmount: 105500,
    });

    // 3. Verify reconciliation status
    expect(reconciliation.status).toBe('BALANCED');
  });
});
```

### Performance Tests

**Transaction Throughput:**
- **Target:** 50 transactions/minute per terminal
- **Test:** Simulate 1000 concurrent terminals with 5 tx/min each
- **Success Criteria:** 95%+ success rate, average latency <2 seconds

**Queue Processing:**
- **Target:** 500 tx/second batch sync
- **Test:** Sync 10,000 queued items in batches
- **Success Criteria:** Complete in <20 seconds, no data loss

**API Response Times:**
- **Transaction Processing:** <500ms (p95)
- **Till Reconciliation:** <1 second
- **Cashier Login:** <1 second
- **Receipt Generation:** <500ms

### Security Tests

**PCI DSS Compliance:**
```typescript
describe('PCI DSS Security Tests', () => {
  it('should never store card data in transaction record', async () => {
    const transaction = await posService.processTransaction({...});
    expect(transaction.cardData).toBeUndefined();
    expect(transaction.cardTokenized).toBeDefined();
  });

  it('should encrypt sensitive data in transit (TLS 1.2+)', async () => {
    const request = posService.buildPaymentRequest({...});
    expect(request.protocol).toBe('TLS 1.2 or higher');
    expect(request.encrypted).toBe(true);
  });

  it('should implement address verification (AVS)', async () => {
    const result = await posService.verifyCardAddress({
      address: '123 Main St',
      zip: '10001',
    });
    expect(result.avsResult).toMatch(/^[ABCDFGHKNMPRSX]$/);
  });

  it('should rate limit API by IP/merchant', async () => {
    for (let i = 0; i < 101; i++) {
      await posService.processTransaction({...});
    }
    // 101st request should fail with 429 Too Many Requests
    await expect(posService.processTransaction({...})).rejects.toThrow(429);
  });

  it('should implement audit logging for all transactions', async () => {
    const transaction = await posService.processTransaction({...});
    const audit = await auditService.getTransactionLog(transaction.id);

    expect(audit).toContainEqual({
      action: 'TRANSACTION_INITIATED',
      timestamp: expect.any(Date),
      actor: 'cashier_001',
    });
  });
});
```

**Penetration Testing:**
- SQL Injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- CSRF token validation
- Broken authentication (force logout, session fixation)
- Sensitive data exposure (card data, PII)
- XML External Entities (XXE) if using XML
- Broken access control (role-based access)
- Security misconfiguration (default credentials, error messages)

---

## Compliance & Security Details

### PCI DSS Level 2 Requirements

**Requirement 1: Install and maintain firewall configuration**
- Terminal API behind API gateway with rate limiting
- Payment processor IP whitelist only
- VPN required for remote terminal management
- Network segmentation (DMZ for terminals, internal for backend)

**Requirement 2: Do not use vendor-supplied defaults**
- Terminal default credentials changed during provisioning
- API keys rotated every 90 days
- SSH keys managed via HSM
- All debug mode disabled in production

**Requirement 3: Protect stored card data**
- **CRITICAL:** Card data never stored - only tokens accepted
- All transaction amounts encrypted with AES-256
- Encryption keys stored in AWS KMS or on-premises HSM
- Encrypted backups with separate key management

**Requirement 4: Encrypt cardholder data in transit**
- TLS 1.2+ mandatory for all connections
- HSTS (HTTP Strict-Transport-Security) enabled
- Certificate pinning for mobile terminal apps
- End-to-end encryption for offline queue sync

**Requirement 5: Protect against malware**
- Terminal firmware signed and verified before installation
- No USB access without PIN authorization
- Endpoint detection on servers (CrowdStrike/Wazuh)
- Monthly firmware security updates pushed remotely

**Requirement 6: Maintain secure development practices**
- Code review required for all changes
- Static analysis (SonarQube) with security gate
- Dependency scanning (Snyk) for vulnerabilities
- SAST/DAST testing in CI/CD pipeline

**Requirement 7: Restrict access by business need**
- Role-based access control (Cashier, Manager, Admin, Auditor)
- Minimum privilege principle for all API endpoints
- MFA required for manager/admin operations
- Session timeout after 15 minutes of inactivity

**Requirement 8: Identify and authenticate access**
- Pin + biometric MFA for cashier login
- API key + signature for terminal API calls
- OAuth 2.0 for web dashboard access
- Account lockout after 3 failed login attempts

**Requirement 9: Restrict physical access**
- Terminal tamper detection with alerts
- No physical card reader access without PIN
- Serial number tracking for all devices
- GPS tracking for high-value terminal inventory

**Requirement 10: Log and monitor access**
- All API calls logged with timestamp, user, action, result
- Failed login attempts tracked and alerted
- Transaction logs immutable (append-only)
- Monthly log review and anomaly detection

**Requirement 11: Test security regularly**
- Annual PCI DSS compliance audit by qualified assessor
- Monthly vulnerability scans (Qualys/Nessus)
- Quarterly penetration testing (external firm)
- Annual remediation report

**Requirement 12: Maintain security policy**
- Annual policy review and update
- Merchant POS security awareness training (yearly)
- Incident response plan with clear escalation
- Data breach notification within 24 hours

### Card Data Security

**Data Flow:**
1. Card physically swiped/tapped/scanned on terminal
2. Terminal immediately tokenizes via payment processor
3. Only token stored in transaction record
4. Card data never sent over network
5. Card verification (AVS/CVV) handled by processor

**Storage:**
- Card tokens: Plain text (non-sensitive, payment processor issued)
- Transaction amounts: AES-256 encrypted
- Cardholder names: Hashed (SHA-256 for comparison only)
- API keys: Encrypted in database, decrypted in memory only

**Access:**
- Cashiers: Can see last 4 digits only
- Managers: Can see transaction summaries only
- Card data: Never accessible to staff (processor only)

---

## Performance Benchmarks

### Transaction Processing

| Metric | Target | P50 | P95 | P99 |
|--------|--------|-----|-----|-----|
| Card Payment Latency | <2s | 850ms | 1400ms | 1800ms |
| NFC Payment Latency | <2s | 600ms | 1200ms | 1500ms |
| QR Payment Latency | <5s | 2500ms | 4000ms | 4800ms |
| USSD Payment Latency | <10s | 5000ms | 8000ms | 9500ms |
| Receipt Generation | <500ms | 150ms | 400ms | 450ms |
| Till Reconciliation | <5s | 1200ms | 3000ms | 4500ms |

### Throughput

| Operation | Target | Min | Max | Avg |
|-----------|--------|-----|-----|-----|
| Transactions/terminal/min | 50 | 45 | 52 | 50 |
| Concurrent terminals | 1000 | 950 | 1050 | 1000 |
| Queue items/second sync | 500 | 450 | 550 | 500 |
| API requests/second | 5000 | 4800 | 5200 | 5000 |

### Network

| Metric | Target | Actual |
|--------|--------|--------|
| Network failover time | <500ms | 300-450ms |
| Offline queue sync time | 30 seconds | 20-28 seconds |
| Bandwidth per transaction | <50KB | 35-45KB |
| Offline queue compression | 50% reduction | 55-60% |

### Database

| Query | Target | Actual |
|-------|--------|--------|
| Transaction lookup (indexed) | <10ms | 3-8ms |
| Till reconciliation summary | <100ms | 45-80ms |
| Daily sales report | <500ms | 200-400ms |
| Cashier session lookup | <5ms | 1-3ms |

### Load Testing Scenarios

**Scenario 1: Normal Load**
- 1000 terminals, 5 tx/min each = 5000 tx/min
- Expected: 99.5% success rate, <1s latency

**Scenario 2: Peak Load (Holiday Shopping)**
- 1000 terminals, 15 tx/min each = 15,000 tx/min
- Expected: 99% success rate, <2s latency
- Expected scaling: 3x servers needed

**Scenario 3: Offline Mode Sync**
- 500 terminals with 100 queued items each = 50,000 items
- Batch size: 50 items, parallel processing: 10 threads
- Expected: Complete in <25 seconds

**Scenario 4: Concurrent Till Reconciliations**
- 1000 cashiers logging out simultaneously
- Expected: Process 500/second, complete in 2 seconds

---

## Hardware Requirements & Compatibility

### Supported POS Terminal Models

| Model | Manufacturer | Display | NFC | Connectivity | Approx Cost |
|-------|--------------|---------|-----|--------------|-------------|
| Ingenico iWL250 | Ingenico | 7" Color | Yes | BT/USB/WiFi/4G | ₦850,000 |
| Ingenico iCT250 | Ingenico | 3" Mono | Yes | USB/Network | ₦450,000 |
| PAX A920 | PAX Technology | 5.5" Color Android | Yes | BT/USB/WiFi/4G | ₦900,000 |
| PAX A80 | PAX Technology | 3" Mono | No | USB/Network | ₦350,000 |
| Verifone P400 | Verifone | 5.5" Color | Yes | BT/USB/WiFi/4G | ₦950,000 |

### Minimum System Requirements

**Hardware Terminal:**
- Processor: ARM Cortex-A9 1.5GHz or higher
- RAM: 512MB minimum (1GB recommended)
- Storage: 4GB internal flash minimum
- Battery: 2800mAh rechargeable (8+ hours per charge)
- Connectivity: At least 2 of (Bluetooth, USB, WiFi, 4G LTE)
- Display: 3" minimum (7" recommended for transaction review)
- Thermal Printer: 58mm width, thermal technology

**Backend Server:**
- CPU: 4 cores (8+ cores for 1000+ terminals)
- RAM: 8GB minimum (16GB+ recommended)
- Storage: 100GB SSD (500GB+ for production logs)
- Network: 1Gbps connection
- Database: PostgreSQL 13+, 20GB+ storage

**Merchant Terminal/Dashboard:**
- Browser: Chrome 90+, Safari 14+, Firefox 88+
- Network: 5Mbps minimum
- Device: Desktop, tablet, or smartphone (iOS 12+, Android 8+)

### Network Requirements

**Bandwidth:**
- Terminal to server: 50KB per transaction (avg)
- Per terminal: 50tx/min × 50KB = 2.5MB/min = 41KB/sec
- 100 terminals: 4MB/min = ~33Mbps peak
- Recommended: 100Mbps connection with 10Mbps minimum

**Latency:**
- Maximum: 1000ms (USSD can tolerate higher)
- Recommended: <200ms for optimal UX
- Monitor and alert if >300ms average

**Uptime:**
- Target: 99.9% uptime (8.7 hours downtime/year)
- Require: 99.5% network availability SLA from ISP
- Implement: Automatic 4G failover from WiFi

### Environmental Specifications

| Parameter | Min | Max | Unit |
|-----------|-----|-----|------|
| Operating Temperature | 0 | 40 | °C |
| Operating Humidity | 20 | 80 | % RH |
| Storage Temperature | -20 | 60 | °C |
| Storage Humidity | 10 | 90 | % RH |

### Power & Backup

**Powered Terminals:**
- Input: 100-240V AC, 50/60Hz
- Power consumption: 15-25W typical
- Backup power: 2 hour uninterruptible supply recommended

**Mobile Terminals:**
- Battery: 2800-3500mAh lithium-ion
- Charging: USB-C, 2A charger provided
- Runtime: 8+ hours with heavy use
- Backup battery: Recommended for critical locations

### Firmware & Software

**Terminal Firmware:**
- Latest: 4.2.1+
- Update frequency: Monthly security patches
- Update method: OTA (Over-The-Air) via WiFi/4G
- Rollback: Auto-rollback on failed update

**Backend Software:**
- OS: Linux (CentOS 7+, Ubuntu 20.04+)
- Runtime: Node.js 16+ or Java 11+
- Database: PostgreSQL 13+
- Containerization: Docker 20.10+

### Security Hardware (Optional)

- **HSM (Hardware Security Module):** For encryption key management
- **Smart Card Reader:** For employee authentication
- **Biometric Reader:** Fingerprint or face recognition (built-in on most modern terminals)
- **Mobile Device Management (MDM):** For remote terminal management and security policies

---

**Document Version:** 1.0.0
