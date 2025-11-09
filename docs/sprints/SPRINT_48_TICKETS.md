# Sprint 48 Tickets - Market-Specific Payment Methods

**Sprint:** 48
**Total Story Points:** 55 SP
**Total Tickets:** 22 tickets (3 stories + 19 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Dependencies |
|-----------|------|-------|--------------|--------------|
| TICKET-48-001 | Story | USSD Payment Support | 18 | Sprint 5, 7 |
| TICKET-48-002 | Task | Create USSD Session Schema & State Management | 3 | TICKET-48-001 |
| TICKET-48-003 | Task | Implement USSD Gateway Integration Mock | 2 | TICKET-48-001 |
| TICKET-48-004 | Task | Implement USSD Menu System & Flow | 3 | TICKET-48-001 |
| TICKET-48-005 | Task | Implement Offline Queue (SQLite) | 3 | TICKET-48-001 |
| TICKET-48-006 | Task | Implement USSD Security & Rate Limiting | 2 | TICKET-48-001 |
| TICKET-48-007 | Task | Create USSD Webhook Endpoints | 2 | TICKET-48-001 |
| TICKET-48-008 | Task | Implement USSD Error Recovery & Retry | 1 | TICKET-48-001 |
| TICKET-48-009 | Task | USSD Testing & Validation | 2 | TICKET-48-001 |
| TICKET-48-010 | Story | Mobile Money Integration (MTN & Airtel) | 20 | Sprint 5, 7 |
| TICKET-48-011 | Task | Create Mobile Money Provider Adapters | 3 | TICKET-48-010 |
| TICKET-48-012 | Task | Implement MTN Mobile Money API Integration | 3 | TICKET-48-010 |
| TICKET-48-013 | Task | Implement Airtel Money API Integration | 3 | TICKET-48-010 |
| TICKET-48-014 | Task | Create Beneficiary Management System | 2 | TICKET-48-010 |
| TICKET-48-015 | Task | Implement Automated Reconciliation | 2 | TICKET-48-010 |
| TICKET-48-016 | Task | Implement Reversal & Dispute Handling | 2 | TICKET-48-010 |
| TICKET-48-017 | Task | Create Mobile Money Status Tracking | 2 | TICKET-48-010 |
| TICKET-48-018 | Task | Mobile Money Testing & Validation | 2 | TICKET-48-010 |
| TICKET-48-019 | Story | International Wire Transfers (SWIFT) | 17 | Sprint 5, 8 |
| TICKET-48-020 | Task | Create Wire Transfer Schema & Beneficiary Management | 2 | TICKET-48-019 |
| TICKET-48-021 | Task | Implement FX Rate Management & Conversion | 2 | TICKET-48-019 |
| TICKET-48-022 | Task | Implement Sanctions Screening (OFAC) | 3 | TICKET-48-019 |
| TICKET-48-023 | Task | Create Wire Transfer Endpoints & Workflows | 3 | TICKET-48-019 |
| TICKET-48-024 | Task | Implement SWIFT Message Formatting | 2 | TICKET-48-019 |
| TICKET-48-025 | Task | International Wires Testing & Validation | 2 | TICKET-48-019 |

---

## TICKET-48-001: USSD Payment Support

**Type:** User Story
**Story Points:** 18
**Priority:** P0 (Critical)

### API Specifications

#### 1. USSD Webhook (Provider → Platform)

```
POST /api/v1/ussd/webhook

Headers:
  Authorization: Bearer {USSD_PROVIDER_KEY}
  Content-Type: application/json

Initial Request (Menu):
{
  "sessionId": "USSD-550e8400e29b41d4",
  "phoneNumber": "+2348012345678",
  "ussdCode": "*390#",
  "operation": "INITIATE",
  "sessionState": "new"
}

Response:
{
  "ussdResponse": "Welcome to PaymentApp\\n1. Send Money\\n2. Check Balance\\n3. Recent Tx\\n4. Help\\nReply with your choice:",
  "sessionState": "menu",
  "messageType": "request",
  "sessionId": "USSD-550e8400e29b41d4"
}

Continuation (Send Money):
{
  "sessionId": "USSD-550e8400e29b41d4",
  "phoneNumber": "+2348012345678",
  "userInput": "1",
  "sessionState": "continue"
}

Response:
{
  "ussdResponse": "Enter recipient code or number:",
  "sessionState": "await_recipient",
  "sessionId": "USSD-550e8400e29b41d4"
}

And so on...
```

#### 2. Check USSD Status

```
GET /api/v1/ussd/sessions/{sessionId}/status

Response:
{
  "sessionId": "USSD-550e8400e29b41d4",
  "phoneNumber": "+2348012345678",
  "status": "COMPLETED",
  "transaction": {
    "transactionId": "TXN-550e8400e29b41d4",
    "amount": 50000,
    "recipient": "+2349012345678",
    "status": "SUCCESS"
  }
}
```

### Database Schema

```sql
CREATE TABLE ussd_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  phone_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  current_state VARCHAR(50),
  transaction_id UUID REFERENCES transactions(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expired_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE ussd_menu_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) NOT NULL REFERENCES ussd_sessions(session_id),
  step_number INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL,
  user_input TEXT,
  system_response TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ussd_offline_queue (
  id TEXT PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP,
  synced_at TIMESTAMP
);

CREATE INDEX idx_ussd_sessions_phone ON ussd_sessions(phone_number);
CREATE INDEX idx_ussd_sessions_status ON ussd_sessions(status);
CREATE INDEX idx_ussd_sessions_user_id ON ussd_sessions(user_id);
```

### Implementation

```typescript
@Controller('api/v1/ussd')
export class USSDController {
  constructor(
    private ussdService: USSDService,
    private transactionService: TransactionService,
  ) {}

  @Post('webhook')
  async handleUSSDRequest(@Body() request: USSDRequest): Promise<USSDResponse> {
    const session = await this.ussdService.getOrCreateSession(
      request.sessionId,
      request.phoneNumber,
    );

    // Route to handler based on state
    if (request.sessionState === 'new' || request.operation === 'INITIATE') {
      return this.handleMenuStart(session);
    }

    // Route based on current state
    switch (session.current_state) {
      case 'MENU':
        return this.handleMenuSelection(session, request.userInput);
      case 'AWAIT_RECIPIENT':
        return this.handleRecipientInput(session, request.userInput);
      case 'AWAIT_AMOUNT':
        return this.handleAmountInput(session, request.userInput);
      case 'AWAIT_PIN':
        return this.handlePINInput(session, request.userInput);
      case 'AWAIT_CONFIRMATION':
        return this.handleConfirmation(session, request.userInput);
      default:
        return this.handleMenuStart(session);
    }
  }

  private async handleMenuStart(session: USSDSession): Promise<USSDResponse> {
    await this.ussdService.updateSessionState(session.id, 'MENU');

    return {
      ussdResponse: `*PaymentApp*\n1. Send Money\n2. Check Balance\n3. Recent Tx\n4. Help\nReply:`,
      sessionState: 'menu',
      sessionId: session.session_id,
    };
  }

  private async handleMenuSelection(
    session: USSDSession,
    choice: string,
  ): Promise<USSDResponse> {
    switch (choice) {
      case '1':
        await this.ussdService.updateSessionState(session.id, 'AWAIT_RECIPIENT');
        return {
          ussdResponse: 'Enter recipient code:\n(or dial # to cancel)',
          sessionState: 'continue',
          sessionId: session.session_id,
        };

      case '2':
        const balance = await this.getUSSDBalance(session.user_id);
        await this.endSession(session.id, 'END');
        return {
          ussdResponse: `Balance: ₦${balance.toLocaleString()}\n\nThank you!`,
          sessionState: 'end',
          sessionId: session.session_id,
        };

      case '3':
        const recent = await this.getRecentTransactions(session.user_id, 5);
        const txText = recent
          .map((tx, i) => `${i + 1}. ${tx.amount} to ${tx.recipient}`)
          .join('\n');
        await this.endSession(session.id, 'END');
        return {
          ussdResponse: `Recent:\n${txText}\n\nThank you!`,
          sessionState: 'end',
          sessionId: session.session_id,
        };

      default:
        await this.endSession(session.id, 'EXPIRED');
        return {
          ussdResponse: 'Invalid choice. Session expired.',
          sessionState: 'end',
          sessionId: session.session_id,
        };
    }
  }

  private async handleRecipientInput(
    session: USSDSession,
    recipient: string,
  ): Promise<USSDResponse> {
    if (recipient === '#') {
      await this.endSession(session.id, 'CANCELLED');
      return {
        ussdResponse: 'Transaction cancelled. Thank you!',
        sessionState: 'end',
        sessionId: session.session_id,
      };
    }

    // Validate recipient
    const recipientValid = await this.ussdService.validateRecipient(recipient);
    if (!recipientValid) {
      return {
        ussdResponse: 'Recipient not found. Try again:',
        sessionState: 'continue',
        sessionId: session.session_id,
      };
    }

    session.metadata = { ...session.metadata, recipient };
    await this.ussdService.updateSessionState(session.id, 'AWAIT_AMOUNT');

    return {
      ussdResponse: 'Enter amount in Naira:\n(or dial # to cancel)',
      sessionState: 'continue',
      sessionId: session.session_id,
    };
  }

  private async handleAmountInput(
    session: USSDSession,
    amount: string,
  ): Promise<USSDResponse> {
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return {
        ussdResponse: 'Invalid amount. Please try again:',
        sessionState: 'continue',
        sessionId: session.session_id,
      };
    }

    session.metadata = { ...session.metadata, amount: amountNum };
    await this.ussdService.updateSessionState(session.id, 'AWAIT_PIN');

    return {
      ussdResponse: `Send ₦${amountNum} to ${session.metadata.recipient}?\nEnter PIN (or #):`,
      sessionState: 'await_pin',
      sessionId: session.session_id,
    };
  }

  private async handlePINInput(
    session: USSDSession,
    pin: string,
  ): Promise<USSDResponse> {
    if (pin === '#') {
      await this.endSession(session.id, 'CANCELLED');
      return {
        ussdResponse: 'Cancelled. Thank you!',
        sessionState: 'end',
        sessionId: session.session_id,
      };
    }

    // Verify PIN
    const pinValid = await this.ussdService.verifyPIN(session.user_id, pin);
    if (!pinValid) {
      session.metadata.failedPins = (session.metadata.failedPins || 0) + 1;
      if (session.metadata.failedPins >= 3) {
        await this.endSession(session.id, 'LOCKED');
        return {
          ussdResponse: 'Too many attempts. Try again later.',
          sessionState: 'end',
          sessionId: session.session_id,
        };
      }

      return {
        ussdResponse: `Wrong PIN. Tries left: ${3 - session.metadata.failedPins}`,
        sessionState: 'continue',
        sessionId: session.session_id,
      };
    }

    // Execute transaction
    try {
      const transaction = await this.transactionService.createUSSDTransfer(
        session.user_id,
        {
          amount: session.metadata.amount,
          recipient: session.metadata.recipient,
          description: 'USSD Transfer',
        },
      );

      session.transaction_id = transaction.id;
      await this.endSession(session.id, 'COMPLETED');

      return {
        ussdResponse: `Success! ₦${session.metadata.amount} sent.\nRef: ${transaction.id}\nThank you!`,
        sessionState: 'end',
        sessionId: session.session_id,
      };
    } catch (error) {
      // Queue for offline retry
      await this.ussdService.queueOfflineTransaction(session);

      return {
        ussdResponse: `Request queued. Will complete when network returns.\nRef: ${session.session_id}`,
        sessionState: 'end',
        sessionId: session.session_id,
      };
    }
  }
}

@Injectable()
export class USSDService {
  constructor(
    @InjectRepository(USSDSession)
    private sessionRepository: Repository<USSDSession>,
    private database: Database,
  ) {}

  async queueOfflineTransaction(session: USSDSession): Promise<void> {
    // Save to SQLite offline queue
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(':memory:');

    db.run(
      `INSERT INTO ussd_offline_queue (id, phone_number, recipient, amount, status, created_at)
       VALUES (?, ?, ?, ?, 'PENDING', datetime('now'))`,
      [
        session.session_id,
        session.phone_number,
        session.metadata.recipient,
        session.metadata.amount,
      ]
    );
  }

  async syncOfflineQueue(): Promise<void> {
    // Check if network available
    // If yes, retry all pending items with exponential backoff
  }
}
```

---

## TICKET-48-010: Mobile Money Integration

**Type:** User Story
**Story Points:** 20
**Priority:** P0 (Critical)

### API Specifications

#### 1. Create Mobile Money Transfer

```
POST /api/v1/mobile-money/transfer

Headers:
  Authorization: Bearer {JWT}
  Content-Type: application/json

Request:
{
  "provider": "MTN",
  "recipientPhone": "+2349012345678",
  "amount": 50000,
  "currency": "NGN",
  "description": "Payment for services"
}

Response (202 Accepted):
{
  "transferId": "MM-550e8400e29b41d4",
  "provider": "MTN",
  "externalId": "MTN-EXT-123456",
  "recipientPhone": "+2349012345678",
  "amount": 50000,
  "status": "PROCESSING",
  "estimatedCompletionAt": "2024-11-09T14:30:30Z",
  "reference": "TXN-550e8400e29b41d4"
}
```

#### 2. Check Transfer Status

```
GET /api/v1/mobile-money/transfer/{transferId}

Response:
{
  "transferId": "MM-550e8400e29b41d4",
  "provider": "MTN",
  "status": "COMPLETED",
  "recipientPhone": "+2349012345678",
  "amount": 50000,
  "completedAt": "2024-11-09T14:30:15Z",
  "reference": "TXN-550e8400e29b41d4",
  "smsNotificationSent": true,
  "fees": 500
}
```

### Database Schema

```sql
CREATE TABLE mobile_money_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  transfer_id VARCHAR(50) UNIQUE NOT NULL,
  provider VARCHAR(20) NOT NULL,
  external_id VARCHAR(100),
  recipient_phone VARCHAR(20) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  status VARCHAR(20) DEFAULT 'PROCESSING',
  transaction_id UUID REFERENCES transactions(id),
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mobile_money_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_date DATE NOT NULL,
  provider VARCHAR(20) NOT NULL,
  sent_count INTEGER,
  received_count INTEGER,
  discrepancy_count INTEGER,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mm_transfers_user_id ON mobile_money_transfers(user_id);
CREATE INDEX idx_mm_transfers_status ON mobile_money_transfers(status);
CREATE INDEX idx_mm_transfers_provider ON mobile_money_transfers(provider);
```

---

## TICKET-48-019: International Wire Transfers

**Type:** User Story
**Story Points:** 17
**Priority:** P1 (High)

### API Specifications

#### 1. Create Wire Transfer

```
POST /api/v1/wires/transfer

Headers:
  Authorization: Bearer {JWT}
  Content-Type: application/json

Request:
{
  "amount": 250000,
  "sourceCurrency": "NGN",
  "targetCurrency": "USD",
  "beneficiary": {
    "name": "John Doe",
    "accountNumber": "123456789",
    "bankName": "Chase Bank",
    "bankBIC": "CHASUS33",
    "country": "US",
    "routingNumber": "021000021"
  },
  "reference": "INV-2024-001",
  "purpose": "Invoice payment"
}

Response (202 Accepted):
{
  "transferId": "WIRE-550e8400e29b41d4",
  "status": "SUBMITTED",
  "sourceAmount": 250000,
  "sourceCurrency": "NGN",
  "targetAmount": 600,
  "targetCurrency": "USD",
  "fxRate": 416.67,
  "fees": {
    "platform": 2500,
    "correspondent": 3000,
    "total": 5500
  },
  "estimatedDelivery": "2024-11-12T14:30:00Z",
  "complianceStatus": "CLEARED"
}
```

### Sanctions Screening

```typescript
async screenForSanctions(transferRequest: any): Promise<{
  cleared: boolean;
  score: number;  // 0-100
  matches: SanctionsMatch[];
}> {
  // Check recipient name against OFAC list
  // Check beneficiary country against blocked countries
  // Return score and decision
}
```

---

## Testing Strategy

### Unit Tests (40+ test cases)

- USSD menu flow (all paths)
- PIN verification and retry logic
- Mobile money provider integration
- FX conversion and fee calculation
- Sanctions screening
- Offline queue management

### Integration Tests

- End-to-end USSD flow
- Mobile money transfer with reconciliation
- Wire transfer with compliance checks
- Offline queue sync and retry

### Load Tests

- 10k concurrent USSD sessions
- 1k mobile money transfers/minute
- 100 wire transfers/minute

---

**Document Version:** 1.0.0
