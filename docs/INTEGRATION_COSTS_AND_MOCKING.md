# Integration Costs & Mocking Guide
**Platform:** Ubiquitous Tribble Payment Platform
**Last Updated:** 2025-11-08

---

## Summary Table

| Feature | Free Tier? | Sandbox? | Can Mock? | Production Cost | Recommendation |
|---------|-----------|----------|-----------|-----------------|----------------|
| **Mobile Money** | ❌ No | ✅ Yes | ✅ Yes | Per-transaction | Mock first, integrate later |
| **USSD** | ❌ No | ✅ Yes | ✅ Yes | ~$500/mo + per-session | Mock for MVP |
| **SWIFT/Wire** | ❌ No | ⚠️ Limited | ✅ Yes | $10-50/transfer | Mock entirely |
| **Batch Payments** | ✅ Yes | N/A | ✅ Yes | Internal feature | Build fully |
| **Standing Orders** | ✅ Yes | N/A | ✅ Yes | Internal feature | Build fully |
| **Card Issuance** | ❌ No | ✅ Yes | ⚠️ Partial | $1-3/card + % | Mock with test cards |
| **POS Integration** | ❌ No | ✅ Yes | ✅ Yes | Hardware + % | Mock entirely |
| **QR Payments** | ✅ Yes | ✅ Yes | ✅ Yes | Free (internal) | Build fully |

---

## Detailed Breakdown

### 1. Mobile Money Integration 🟡
**Providers:** MTN MoMo, Airtel Money, M-Pesa

#### Costs
```yaml
Development Phase:
  - Sandbox access: FREE
  - No transaction fees in sandbox
  - Test accounts: FREE

Production:
  Setup:
    - Application fee: FREE - $500 (varies by provider)
    - Onboarding: FREE

  Per Transaction:
    - Deposit: 1-2% of transaction
    - Withdrawal: 1.5-3% of transaction
    - Example: ₦1,000 transaction = ₦20 fee
```

#### Can You Mock It?
**✅ YES - Highly Recommended**

```typescript
// Create mock mobile money service
@Injectable()
export class MockMobileMoneyService implements IMobileMoneyService {
  async deposit(phone: string, amount: number): Promise<DepositResult> {
    // Simulate 2-second delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 90% success rate for testing
    const success = Math.random() > 0.1;

    return {
      reference: `MOCK-MOMO-${Date.now()}`,
      status: success ? 'success' : 'failed',
      provider: 'MTN_MOCK',
      amount,
      fee: amount * 0.02, // 2% mock fee
    };
  }

  async withdraw(phone: string, amount: number): Promise<WithdrawResult> {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return { /* similar mock response */ };
  }
}
```

#### Recommendation
```
1. Build with mock service first (FREE)
2. Use provider sandbox when ready to test (FREE)
3. Go live with real integration (PAID)

Timeline:
  - Mock: Week 1-2 (development)
  - Sandbox: Week 3-4 (testing)
  - Production: After launch
```

---

### 2. USSD Support 🟡
**Providers:** Africa's Talking, Twilio, SMSGH

#### Costs
```yaml
Development Phase:
  - Sandbox: FREE (Africa's Talking)
  - Test USSD code: FREE

Production:
  Setup:
    - USSD shortcode: $500-2,000/year
    - SMS fallback: Included or separate

  Per Session:
    - USSD session: $0.005-0.02 per session
    - Example: 1,000 sessions/day = $5-20/day

  Monthly Estimate:
    - Low volume (30K sessions): $150-600/mo
    - Medium (100K sessions): $500-2,000/mo
```

#### Can You Mock It?
**✅ YES - Easy to Mock**

```typescript
// Mock USSD Gateway
@Injectable()
export class MockUSSDService {
  private sessions = new Map<string, USSDSession>();

  async handleUSSD(sessionId: string, phoneNumber: string, text: string) {
    // Simulate USSD menu navigation
    const menuLevel = text.split('*').length;

    switch (menuLevel) {
      case 1: return "CON Welcome to Tribble\n1. Balance\n2. Transfer\n3. Airtime";
      case 2: return this.handleMenuSelection(text);
      default: return "END Transaction completed";
    }
  }
}

// Or use HTTP simulator
app.post('/ussd/mock', (req, res) => {
  const { sessionId, phoneNumber, serviceCode, text } = req.body;
  // Return mock USSD response
  res.send('CON Mock USSD Menu...');
});
```

#### Recommendation
```
1. Mock entirely for MVP (FREE)
2. Add to Phase 3 if needed (PAID)
3. Not critical for launch
```

---

### 3. International Transfers (SWIFT/SEPA) 🔴
**Providers:** Wise API, TransferGo, Banking partners

#### Costs
```yaml
Development Phase:
  - Sandbox: LIMITED (most don't offer full sandbox)
  - Wise API: Test mode available

Production:
  Setup:
    - API access: FREE - $1,000 setup
    - Correspondent banking: $5,000+ relationships

  Per Transfer:
    - SWIFT: $10-50 per transfer
    - SEPA: $0.20-5 per transfer
    - Wise API: 0.5-2% of amount

  Compliance:
    - OFAC screening: $0.10-0.50 per check
    - Sanctions screening: Included or separate
```

#### Can You Mock It?
**✅ YES - Definitely Mock**

```typescript
@Injectable()
export class MockInternationalTransferService {
  async initiateWireTransfer(request: WireTransferRequest): Promise<WireTransferResult> {
    // Simulate 1-3 day processing
    const processingDays = Math.floor(Math.random() * 3) + 1;
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + processingDays);

    return {
      reference: `SWIFT-MOCK-${Date.now()}`,
      status: 'pending',
      estimatedCompletion: completionDate,
      fee: 25.00, // Mock $25 SWIFT fee
      exchangeRate: 1.23, // Mock rate
      beneficiaryAmount: request.amount * 1.23,
    };
  }

  async checkStatus(reference: string): Promise<TransferStatus> {
    // Randomly return status updates
    const statuses = ['pending', 'processing', 'completed', 'failed'];
    return {
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastUpdated: new Date(),
    };
  }
}
```

#### Recommendation
```
❌ SKIP for MVP - Too expensive, complex compliance
✅ Mock if you want the feature in documentation
💡 Defer to Year 2 or never
```

---

### 4. Batch/Bulk Payments ✅
**No External Provider Needed**

#### Costs
```yaml
Development: FREE (internal feature)
Production: FREE (just database + processing)

Infrastructure:
  - Queue system (BullMQ + Redis): Already in stack
  - Storage: Minimal
  - Processing: Internal
```

#### Can You Mock It?
**N/A - Build It Fully (It's Free)**

```typescript
// This is an internal feature - no mocking needed
@Injectable()
export class BatchPaymentService {
  async createBatch(userId: string, payments: Payment[]): Promise<Batch> {
    // Validate CSV/Excel
    const validatedPayments = await this.validateBatch(payments);

    // Create batch record
    const batch = await this.batchRepository.save({
      user_id: userId,
      total_payments: payments.length,
      total_amount: this.calculateTotal(payments),
      status: 'pending_approval',
    });

    // Queue for processing
    await this.queueService.addBatchJob(batch.id);

    return batch;
  }

  async processBatch(batchId: string): Promise<void> {
    const batch = await this.getBatch(batchId);

    for (const payment of batch.payments) {
      try {
        await this.paymentService.processPayment(payment);
      } catch (error) {
        await this.markPaymentFailed(payment.id, error);
      }
    }
  }
}
```

#### Recommendation
```
✅ BUILD FULLY - No external costs
🎯 High value for B2B customers
💪 Easy to implement
```

---

### 5. Standing Orders / Direct Debit ✅
**No External Provider Needed**

#### Costs
```yaml
Development: FREE (internal feature)
Production: FREE (scheduled jobs)

Infrastructure:
  - Cron jobs / Scheduler: FREE (node-cron or BullMQ)
  - Storage: Minimal
```

#### Can You Mock It?
**N/A - Build It Fully (It's Free)**

```typescript
@Injectable()
export class StandingOrderService {
  @Cron('0 0 * * *') // Run daily at midnight
  async processStandingOrders() {
    const dueOrders = await this.findDueStandingOrders();

    for (const order of dueOrders) {
      try {
        await this.executeStandingOrder(order);
        await this.scheduleNextExecution(order);
      } catch (error) {
        await this.handleFailedOrder(order, error);
      }
    }
  }

  async createStandingOrder(request: StandingOrderRequest): Promise<StandingOrder> {
    // Validate mandate
    // Create order
    // Schedule first execution
    return await this.repository.save({
      user_id: request.userId,
      beneficiary_id: request.beneficiaryId,
      amount: request.amount,
      frequency: request.frequency, // daily, weekly, monthly
      start_date: request.startDate,
      end_date: request.endDate,
      status: 'active',
    });
  }
}
```

#### Recommendation
```
✅ BUILD FULLY - Critical for recurring payments
💰 Zero external costs
📈 High user value
```

---

### 6. Card Issuance (Virtual/Physical) 🔴
**Providers:** Stripe Issuing, Marqeta, Adyen, Paystack Issuing

#### Costs
```yaml
Development Phase:
  - Sandbox: FREE (test card numbers)
  - Test transactions: FREE

Production:
  Setup:
    - Platform fee: $0 - $5,000
    - Card program setup: $5,000 - $50,000
    - BIN sponsorship: Handled by provider

  Per Card:
    - Virtual card: $0.50 - $2 per card
    - Physical card: $3 - $10 per card (including shipping)

  Per Transaction:
    - Interchange: 1-3% of transaction
    - Processing: $0.10 - 0.30 per transaction

  Monthly:
    - Platform fee: $0 - $500/mo
    - Active card fee: $1 - 3/card/month

Example:
  - 1,000 virtual cards issued: $500 - $2,000
  - 10,000 transactions/mo: $1,000 - $3,000
  - Total: ~$1,500 - $5,000/month at scale
```

#### Can You Mock It?
**⚠️ PARTIALLY - Use Test Cards**

```typescript
// Mock card issuance
@Injectable()
export class MockCardIssuanceService {
  async issueVirtualCard(userId: string): Promise<VirtualCard> {
    // Generate fake but valid-format card number
    const cardNumber = this.generateTestCardNumber();

    return {
      card_id: `card_mock_${Date.now()}`,
      user_id: userId,
      card_number: cardNumber, // 4111111111111111 (test)
      cvv: '123',
      expiry_month: 12,
      expiry_year: 2027,
      status: 'active',
      balance: 0,
      spending_limits: {
        daily: 100000, // ₦100,000
        monthly: 500000,
      },
    };
  }

  private generateTestCardNumber(): string {
    // Visa test cards: 4111111111111111
    // Mastercard test: 5555555555554444
    return '4111111111111111'; // Always passes Luhn check
  }

  async processCardTransaction(cardId: string, amount: number): Promise<TransactionResult> {
    // Simulate card authorization
    const approved = Math.random() > 0.05; // 95% approval rate

    return {
      approved,
      auth_code: approved ? `MOCK${Math.random().toString(36).substr(2, 6).toUpperCase()}` : null,
      decline_reason: approved ? null : 'insufficient_funds',
    };
  }
}
```

**Real Sandbox Option:**
```typescript
// Stripe Issuing sandbox (FREE)
import Stripe from 'stripe';
const stripe = new Stripe('sk_test_...', { apiVersion: '2023-10-16' });

// Create test card
const card = await stripe.issuing.cards.create({
  cardholder: cardholder.id,
  currency: 'usd',
  type: 'virtual',
  status: 'active',
});

// Test cards work in sandbox for FREE
// But production costs apply when live
```

#### Recommendation
```
🟡 MOCK for MVP documentation
🔴 Defer to Phase 3 (expensive)
💡 Use Stripe sandbox if you want real testing (FREE in test mode)
```

---

### 7. POS Integration 🔴
**Providers:** Square, Stripe Terminal, Paystack POS

#### Costs
```yaml
Development Phase:
  - SDK: FREE
  - Simulator: FREE
  - Test mode: FREE

Production:
  Hardware:
    - POS terminal: $50 - $300 per device
    - Card reader: $30 - $100

  Per Transaction:
    - Processing fee: 2-3.5% + ₦50

  Monthly:
    - No monthly fee (usually)
```

#### Can You Mock It?
**✅ YES - Fully Mockable**

```typescript
@Injectable()
export class MockPOSService {
  async initiatePOSPayment(terminalId: string, amount: number): Promise<POSTransaction> {
    // Simulate card tap/insert/swipe
    await this.simulateHardwareDelay(2000);

    // Simulate PIN entry
    await this.simulateHardwareDelay(3000);

    // Simulate processing
    await this.simulateHardwareDelay(2000);

    const approved = Math.random() > 0.1; // 90% approval

    return {
      terminal_id: terminalId,
      transaction_id: `POS-MOCK-${Date.now()}`,
      amount,
      status: approved ? 'approved' : 'declined',
      card_type: 'VISA',
      last_4_digits: '4242',
      receipt_number: `RCP${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    };
  }

  private simulateHardwareDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Can also create web-based POS simulator UI
@Controller('pos-simulator')
export class POSSimulatorController {
  @Get('terminal/:id')
  renderTerminal(@Param('id') terminalId: string) {
    // Return HTML page that simulates POS terminal
    return `
      <div class="pos-terminal">
        <h1>Mock POS Terminal ${terminalId}</h1>
        <button onclick="simulateCardTap()">Tap Card</button>
        <button onclick="simulateCardInsert()">Insert Card</button>
      </div>
    `;
  }
}
```

#### Recommendation
```
✅ MOCK entirely for MVP
❌ SKIP for backend-only approach
💡 Only build if you want merchant POS acceptance
```

---

### 8. QR Code Payments ✅
**No External Provider Needed (DIY)**

#### Costs
```yaml
Development: FREE
Production: FREE

Libraries:
  - qrcode (npm): FREE
  - qr-scanner (npm): FREE
```

#### Can You Mock It?
**N/A - Build It Fully (It's Free & Easy)**

```typescript
import * as QRCode from 'qrcode';

@Injectable()
export class QRPaymentService {
  // Generate dynamic QR for payment
  async generatePaymentQR(amount: number, reference: string): Promise<string> {
    const paymentData = {
      type: 'payment_request',
      amount,
      reference,
      merchant_id: 'MERCHANT_123',
      currency: 'NGN',
      expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    };

    const qrDataString = JSON.stringify(paymentData);
    const qrCodeDataURL = await QRCode.toDataURL(qrDataString);

    return qrCodeDataURL; // base64 image
  }

  // Generate static QR for merchant
  async generateMerchantQR(merchantId: string): Promise<string> {
    const merchantData = {
      type: 'merchant',
      merchant_id: merchantId,
      merchant_name: 'My Store',
    };

    return await QRCode.toDataURL(JSON.stringify(merchantData));
  }

  // Process scanned QR payment
  async processQRPayment(qrData: string, userId: string): Promise<PaymentResult> {
    const paymentRequest = JSON.parse(qrData);

    // Validate QR not expired
    if (new Date(paymentRequest.expires_at) < new Date()) {
      throw new Error('QR code expired');
    }

    // Process payment
    return await this.paymentService.processPayment({
      user_id: userId,
      amount: paymentRequest.amount,
      reference: paymentRequest.reference,
      type: 'qr_payment',
    });
  }
}
```

#### Recommendation
```
✅ BUILD FULLY - Free and valuable
🚀 Easy to implement
📱 Great for in-person payments
```

---

## 🎯 Final Recommendations by Priority

### ✅ Build Fully (FREE - No Mocking Needed)
1. **Batch/Bulk Payments** - High B2B value, zero cost
2. **Standing Orders** - High consumer value, zero cost
3. **QR Code Payments** - Modern, mobile-friendly, zero cost

**Total Cost:** $0
**Development Time:** 4-6 weeks (Sprint 27-28)

---

### 🟡 Mock for MVP, Integrate Later (PAID in Production)
4. **Mobile Money Integration**
   - Mock Cost: $0
   - Production: 1-3% per transaction
   - When: After achieving product-market fit
   - Value: HIGH for Nigerian/African market

5. **Card Issuance** (Optional)
   - Mock Cost: $0 (use test cards)
   - Production: $1,500-5,000/month at scale
   - When: Phase 3 (if needed)
   - Value: MEDIUM

---

### ❌ Skip Entirely or Defer to Year 2
6. **USSD Support**
   - Cost: $500-2,000/month
   - Value: MEDIUM (declining usage)
   - When: Only if customers demand it

7. **SWIFT/International Transfers**
   - Cost: $10-50 per transfer + compliance
   - Value: LOW for MVP
   - When: Year 2 if expanding internationally

8. **POS Integration**
   - Cost: Hardware + 2-3%
   - Value: LOW for backend-only API
   - When: Only if building merchant business

9. **Cryptocurrency** ❌
   - REMOVED per your request

---

## 💰 Revised Budget

```yaml
Phase 1 - Security (MUST HAVE):
  Secret Management (Infisical): $0 (self-hosted)
  Penetration Testing: $15,000 - $30,000
  Security Tools: $10,000 - $20,000/year
  WAF/DDoS (Cloudflare): $200 - $5,000/month
  SIEM (Self-hosted ELK): $0 - $5,000/year
  Total: $25,000 - $90,000 first year

Phase 2 - Free Features (SHOULD HAVE):
  Batch Payments: $0
  Standing Orders: $0
  QR Payments: $0
  Total: $0

Phase 3 - Premium Features (OPTIONAL):
  Mobile Money (when profitable): % of transactions
  Card Issuance (if needed): Pay-as-you-grow
  Total: Variable based on usage

GRAND TOTAL (First Year): $25,000 - $90,000
  (Mostly security - features are FREE!)
```

---

## 🚀 Recommended Implementation Order

### Sprints 24-25: Security Hardening (6 weeks)
```yaml
Must Complete Before Production:
  ✅ Set up Infisical for secrets
  ✅ Add vulnerability scanning to CI/CD
  ✅ Implement WAF/DDoS protection
  ✅ Set up SIEM monitoring
  ✅ Complete penetration test
  ✅ Fix security findings

Cost: $25K - $45K
```

### Sprints 26-27: Free High-Value Features (4 weeks)
```yaml
Build Fully:
  ✅ Batch/bulk payments with CSV upload
  ✅ Standing orders / recurring payments
  ✅ QR code payment system
  ✅ Enhanced API rate limiting

Cost: $0 (developer time only)
```

### Sprint 28: Mobile Money Mocks (2 weeks)
```yaml
Create Mocks for Future:
  ✅ Mock MTN MoMo service
  ✅ Mock Airtel Money service
  ✅ Mock M-Pesa service
  ✅ Document API contracts
  ✅ Prepare for future integration

Cost: $0 (swap mock for real when ready)
```

---

## 📋 Mock Service Architecture

For features you want to mock, use this pattern:

```typescript
// 1. Define interface
export interface IMobileMoneyService {
  deposit(phone: string, amount: number): Promise<DepositResult>;
  withdraw(phone: string, amount: number): Promise<WithdrawResult>;
  checkBalance(phone: string): Promise<number>;
}

// 2. Create mock implementation
@Injectable()
export class MockMobileMoneyService implements IMobileMoneyService {
  async deposit(phone: string, amount: number): Promise<DepositResult> {
    // Realistic mock with delays and occasional failures
    await this.delay(2000);
    return {
      reference: `MOCK-${Date.now()}`,
      status: Math.random() > 0.1 ? 'success' : 'failed',
    };
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 3. Create real implementation (later)
@Injectable()
export class MTNMoMoService implements IMobileMoneyService {
  async deposit(phone: string, amount: number): Promise<DepositResult> {
    // Real MTN MoMo API call
    return await this.mtnClient.deposit({ phone, amount });
  }
}

// 4. Use provider pattern to swap
@Module({
  providers: [
    {
      provide: IMobileMoneyService,
      useClass: process.env.USE_MOCK_MOMO === 'true'
        ? MockMobileMoneyService
        : MTNMoMoService,
    },
  ],
})
export class PaymentModule {}
```

---

## ✅ Summary

**Can Use Infisical?** ✅ YES - Perfect choice, free, modern

**Crypto Removed?** ✅ YES - Removed from all plans

**Free Features:**
- ✅ Batch payments - Build fully
- ✅ Standing orders - Build fully
- ✅ QR payments - Build fully
- 🟡 Mobile money - Mock for now, integrate later (paid)
- ❌ USSD - Skip or mock
- ❌ SWIFT - Skip entirely
- ❌ Card issuance - Mock if needed
- ❌ POS - Skip for backend API

**Your Focus:**
1. Security hardening (Infisical + pentest + monitoring) - $25K-45K
2. Free features (batch, standing orders, QR) - $0
3. Mobile money mocks for future - $0

**Total MVP Cost:** $25K-45K (all security, features are free!)
