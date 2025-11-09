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

**Document Version:** 1.0.0
