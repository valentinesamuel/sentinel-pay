# Sprint 40 Backlog - Point of Sale (POS) System

**Sprint:** Sprint 40
**Duration:** 2 weeks (Week 80-81)
**Sprint Goal:** Build comprehensive Point of Sale system for in-store payment processing with multi-channel support and offline capabilities
**Story Points Committed:** 54
**Team Capacity:** 54 SP

---

## FEATURE-40.1: POS Hardware Integration

### 📘 User Story: US-40.1.1 - POS Terminal Integration & Multi-Payment Support (24 SP)

**As a merchant, I want to accept payments through integrated POS terminals supporting card, NFC, and QR code payments**

#### Business Value
Enables merchants to accept all modern payment methods in-store, capturing 45% additional revenue from customers preferring contactless payments. Reduces checkout time by 60% compared to manual entry, improving customer satisfaction. Supports Nigeria's push toward cashless transactions with card, NFC, QR, and USSD fallback.

#### Success Criteria
- Terminal connectivity (Bluetooth, USB, WiFi, 4G) with automatic failover
- Sub-1-second payment request latency for successful transactions
- Support for card transactions with EMV chip, magnetic stripe, and contactless
- Real-time inventory sync (optional) during transaction processing
- 99.5% transaction success rate in normal conditions

#### Acceptance Criteria

- [ ] **AC1:** Support hardware terminal initialization via Bluetooth with automatic device discovery
- [ ] **AC2:** Support hardware terminal initialization via USB connection with hot-swap capability
- [ ] **AC3:** Support hardware terminal initialization via WiFi network connectivity
- [ ] **AC4:** Support 4G failover when WiFi connectivity is lost
- [ ] **AC5:** Implement automatic network switching with <500ms switchover time
- [ ] **AC6:** Support card reader with EMV chip processing and PCI compliance
- [ ] **AC7:** Support magnetic stripe card reading for legacy cards
- [ ] **AC8:** Support contactless card payment (NFC) with Tap-to-Pay capability
- [ ] **AC9:** Support QR code payment with merchant-generated QR code scanning
- [ ] **AC10:** Support customer-initiated QR code scanning (dynamic QR at POS)
- [ ] **AC11:** Support USSD fallback payment for feature phone users
- [ ] **AC12:** Process card payment with real-time authorization from payment processor
- [ ] **AC13:** Process NFC payment with real-time authorization from payment processor
- [ ] **AC14:** Process QR payment with real-time authorization from payment processor
- [ ] **AC15:** Process USSD payment with delayed confirmation (5-15 seconds)
- [ ] **AC16:** Handle payment authorization timeout (>30 seconds) with user notification
- [ ] **AC17:** Support partial payment scenarios (multiple payment methods for single transaction)
- [ ] **AC18:** Implement receipt printing on connected thermal printer
- [ ] **AC19:** Support digital receipt via SMS with configurable template
- [ ] **AC20:** Support digital receipt via email with transaction details and QR code
- [ ] **AC21:** Calculate transaction amount with automatic currency formatting (NGN)
- [ ] **AC22:** Apply real-time discount codes at checkout (percentage, fixed, BOGO)
- [ ] **AC23:** Process transaction fees and display to merchant pre-authorization
- [ ] **AC24:** Support transaction history synchronization with backend
- [ ] **AC25:** Implement idempotent transaction processing for network retry scenarios
- [ ] **AC26:** Log all transaction attempts with timestamp, amount, payment method, and result
- [ ] **AC27:** Support transaction reversal within 24 hours with audit trail
- [ ] **AC28:** Encrypt all card data in transit using TLS 1.2+ (PCI DSS compliance)
- [ ] **AC29:** Support tokenization of card data for repeat customers
- [ ] **AC30:** Implement address verification system (AVS) for online card processing
- [ ] **AC31:** Implement CVV/CVC verification for card payments
- [ ] **AC32:** Support split payments between multiple accounts (e.g., sales rep commission)
- [ ] **AC33:** Implement real-time fraud scoring during transaction processing
- [ ] **AC34:** Support velocity limits (transactions per hour, daily spending limits)
- [ ] **AC35:** Validate merchant account status before processing transaction
- [ ] **AC36:** Support multi-currency merchant accounts with automatic conversion
- [ ] **AC37:** Calculate and display settlement amount after fees and conversions
- [ ] **AC38:** Support transaction metadata storage (customer name, email, phone optional)
- [ ] **AC39:** Implement geolocation capture for transaction security validation
- [ ] **AC40:** Support transaction categorization for accounting integration

#### Technical Specification

```typescript
// POS Transaction Entity
@Entity('pos_transactions')
export class POSTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantAccountId: string;

  @Column({ type: 'uuid' })
  terminalId: string;

  @Column({ type: 'uuid' })
  cashierId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod; // CARD, NFC, QR, USSD

  @Column({ type: 'enum', enum: TransactionStatus })
  status: TransactionStatus; // PENDING, PROCESSING, SUCCESS, FAILED, REVERSED

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  feeAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  settlementAmount: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cardTokenized: string; // Last 4 digits of card

  @Column({ type: 'varchar', length: 100, nullable: true })
  qrCode: string; // Dynamic or static QR code ID

  @Column({ type: 'varchar', length: 50 })
  externalTransactionId: string; // From payment processor

  @Column({ type: 'jsonb' })
  metadata: {
    deviceName?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    receiptNumber?: string;
    avsResult?: string;
    fraudScore?: number;
    geolocation?: { lat: number; lng: number };
    splits?: Array<{ accountId: string; amount: number }>;
  };

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'timestamp' })
  authorizedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  settledAt: Date;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;
}

enum PaymentMethod {
  CARD = 'CARD',
  NFC = 'NFC',
  QR = 'QR',
  USSD = 'USSD',
}

enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

// POS Terminal Entity
@Entity('pos_terminals')
export class POSTerminal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantAccountId: string;

  @Column({ type: 'varchar', length: 50 })
  serialNumber: string; // Device serial number

  @Column({ type: 'enum', enum: TerminalConnectionType })
  connectionType: TerminalConnectionType; // BLUETOOTH, USB, WIFI, 4G

  @Column({ type: 'varchar', length: 100, nullable: true })
  bluetoothMac: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  usbDeviceId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  wifiSsid: string;

  @Column({ type: 'enum', enum: TerminalStatus })
  status: TerminalStatus; // ACTIVE, INACTIVE, ERROR

  @Column({ type: 'varchar', length: 20 })
  firmwareVersion: string;

  @Column({ type: 'jsonb' })
  supportedPaymentMethods: PaymentMethod[];

  @Column({ type: 'jsonb' })
  capabilities: {
    nfcSupported: boolean;
    chipReaderSupported: boolean;
    stripeReaderSupported: boolean;
    qrScannerSupported: boolean;
    thermalPrinterSupported: boolean;
    offlineModeSupported: boolean;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastHeartbeat: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSync: Date;

  @Column({ type: 'simple-array' })
  allowedCashiers: string[]; // Cashier IDs

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;
}

enum TerminalConnectionType {
  BLUETOOTH = 'BLUETOOTH',
  USB = 'USB',
  WIFI = 'WIFI',
  '4G' = '4G',
}

enum TerminalStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
}
```

---

## FEATURE-40.2: Offline Processing & Transaction Queuing

### 📘 User Story: US-40.2.1 - Offline Mode with Automatic Sync (18 SP)

**As a merchant, I want POS terminal to queue transactions when offline and automatically sync when connectivity returns**

#### Business Value
Enables uninterrupted service even with network outages (common in Nigerian markets). Queue capacity for 500-1000 transactions reduces revenue loss from connectivity issues. Automatic sync ensures no transaction loss with guaranteed exactly-once delivery semantics.

#### Success Criteria
- Queue capacity for minimum 500 transactions without blocking new sales
- Automatic sync within 30 seconds of network restoration
- Zero transaction loss even with unexpected app crash
- Merchant notification of offline status and queue size
- Transaction priority based on payment method (card > NFC > QR > USSD)

#### Acceptance Criteria

- [ ] **AC1:** Detect network unavailability within 2 seconds
- [ ] **AC2:** Automatically switch to offline mode on network loss
- [ ] **AC3:** Display clear offline status indicator on POS UI
- [ ] **AC4:** Queue transaction locally when offline with all transaction details
- [ ] **AC5:** Implement local SQLite database for offline transaction storage
- [ ] **AC6:** Support minimum 500 queued transactions before storage capacity warning
- [ ] **AC7:** Display queue size and estimated time to sync to merchant
- [ ] **AC8:** Prioritize QR and USSD transactions (faster fallback processing)
- [ ] **AC9:** Detect network restoration automatically
- [ ] **AC10:** Initiate automatic sync within 5 seconds of network detection
- [ ] **AC11:** Batch sync transactions (50 per request) to optimize bandwidth
- [ ] **AC12:** Implement exponential backoff for sync retry (2s, 4s, 8s, 16s, 32s max)
- [ ] **AC13:** Validate transaction data integrity before sync
- [ ] **AC14:** Handle partial sync failure and resume from failure point
- [ ] **AC15:** Maintain transaction order (FIFO) during sync
- [ ] **AC16:** Generate sync receipt with confirmation of all queued transactions
- [ ] **AC17:** Support selective resend of failed transactions from queue
- [ ] **AC18:** Persist queue to disk with automatic crash recovery
- [ ] **AC19:** Compress transaction payload to reduce bandwidth (gzip)
- [ ] **AC20:** Display sync progress bar during batch sync

#### Technical Specification

```typescript
// Offline Queue Entity
@Entity('offline_transaction_queue')
export class OfflineTransactionQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  terminalId: string;

  @Column({ type: 'uuid' })
  merchantAccountId: string;

  @Column({ type: 'jsonb' })
  transactionData: {
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
    cardTokenized?: string;
    qrCode?: string;
    metadata?: any;
    timestamp: number;
  };

  @Column({ type: 'enum', enum: QueueStatus })
  status: QueueStatus; // QUEUED, SYNCING, SYNCED, FAILED

  @Column({ type: 'integer', default: 0 })
  syncAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAttempt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  externalTransactionId: string;

  @Column({ type: 'text', nullable: true })
  syncError: string;

  @Column({ type: 'timestamp' })
  queuedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  syncedAt: Date;

  @Column({ type: 'integer' })
  queuePosition: number;
}

enum QueueStatus {
  QUEUED = 'QUEUED',
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
}
```

---

## FEATURE-40.3: Cashier Management & Till Reconciliation

### 📘 User Story: US-40.3.1 - Cashier Operations & Daily Till Reconciliation (12 SP)

**As a store manager, I want to manage cashier login/logout, track sales by cashier, and reconcile daily till**

#### Business Value
Accountability for ₦2.5T+ annual in-store payments in Nigeria requires per-cashier tracking. Till reconciliation identifies discrepancies within 5 minutes, improving inventory accuracy. Real-time sales tracking enables cashier performance management and theft prevention.

#### Success Criteria
- Cashier can login with 4-digit PIN + biometric (optional)
- Real-time per-cashier sales dashboard
- Till reconciliation completes in <5 minutes
- Discrepancies flagged automatically with variance tolerance (₦500 max)
- 99.9% uptime for cashier session management

#### Acceptance Criteria

- [ ] **AC1:** Implement cashier authentication with 4-digit PIN
- [ ] **AC2:** Support biometric authentication (fingerprint/face) for cashier login
- [ ] **AC3:** Support manager override login with master PIN
- [ ] **AC4:** Track cashier login timestamp and terminal assignment
- [ ] **AC5:** Track cashier logout timestamp and auto-logout after 30 minutes inactivity
- [ ] **AC6:** Calculate transactions per cashier in real-time
- [ ] **AC7:** Calculate total sales amount per cashier
- [ ] **AC8:** Calculate transaction count by payment method per cashier
- [ ] **AC9:** Display cashier sales dashboard on manager tablet/dashboard
- [ ] **AC10:** Support shift-based reporting (morning, afternoon, evening)
- [ ] **AC11:** Calculate total cash received (from card settlement + cash payments)
- [ ] **AC12:** Compare expected till amount vs actual counted amount
- [ ] **AC13:** Flag discrepancies >₦500 as requiring investigation
- [ ] **AC14:** Generate till reconciliation report with timestamp and manager signature
- [ ] **AC15:** Support till float (opening balance) initialization per shift
- [ ] **AC16:** Support till float carry-over to next shift
- [ ] **AC17:** Generate audit trail of all till adjustments with approval workflow
- [ ] **AC18:** Support photo capture of till count during reconciliation
- [ ] **AC19:** Integrate with escalation workflow for discrepancies >₦5,000
- [ ] **AC20:** Generate daily till summary report by cashier, shift, and payment method

#### Technical Specification

```typescript
// Cashier Session Entity
@Entity('cashier_sessions')
export class CashierSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  merchantAccountId: string;

  @Column({ type: 'uuid' })
  terminalId: string;

  @Column({ type: 'uuid' })
  cashierId: string; // Employee ID

  @Column({ type: 'varchar', length: 20 })
  shiftName: string; // MORNING, AFTERNOON, EVENING

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  openingFloat: number;

  @Column({ type: 'timestamp' })
  loginTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  logoutTime: Date;

  @Column({ type: 'enum', enum: SessionStatus })
  status: SessionStatus; // ACTIVE, CLOSED, TIMEOUT

  @Column({ type: 'jsonb' })
  sessionSummary: {
    totalTransactions: number;
    totalSalesAmount: number;
    cardTransactions: number;
    nfcTransactions: number;
    qrTransactions: number;
    ussdTransactions: number;
    refunds: number;
    discounts: number;
    fees: number;
  };

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;
}

// Till Reconciliation Entity
@Entity('till_reconciliations')
export class TillReconciliation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cashierSessionId: string;

  @Column({ type: 'uuid' })
  reconciliationManagerId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  expectedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  countedAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  discrepancy: number;

  @Column({ type: 'enum', enum: ReconciliationStatus })
  status: ReconciliationStatus; // BALANCED, DISCREPANCY, PENDING_REVIEW

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photoUrl: string; // Till count photo

  @Column({ type: 'timestamp' })
  reconciliationTime: Date;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;
}

enum SessionStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  TIMEOUT = 'TIMEOUT',
}

enum ReconciliationStatus {
  BALANCED = 'BALANCED',
  DISCREPANCY = 'DISCREPANCY',
  PENDING_REVIEW = 'PENDING_REVIEW',
}
```

---

## FEATURE-40.4: Receipt Management & Inventory Integration

### 📘 User Story: US-40.4.1 - Digital & Printed Receipt with Optional Inventory Sync (3 SP)

**As a customer, I want digital or printed receipts with transaction details, and merchants can optionally sync inventory**

#### Acceptance Criteria

- [ ] **AC1:** Generate receipt with merchant name, date, time, items list, total amount
- [ ] **AC2:** Print receipt on thermal printer with formatting
- [ ] **AC3:** Send SMS receipt with transaction confirmation code
- [ ] **AC4:** Send email receipt with PDF attachment
- [ ] **AC5:** Generate QR code on receipt linking to transaction details
- [ ] **AC6:** Support optional inventory item tracking per transaction
- [ ] **AC7:** Update inventory count in real-time on item sale

---

**Document Version:** 1.0.0
