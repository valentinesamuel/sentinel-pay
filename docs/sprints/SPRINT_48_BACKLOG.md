# Sprint 48 Backlog - Market-Specific Features (USSD, Mobile Money, International Transfers)

**Sprint:** Sprint 48
**Duration:** 3 weeks (Week 96-98)
**Sprint Goal:** Enable market-specific payment methods for Nigeria and African expansion (USSD, Mobile Money, International Transfers)
**Story Points Committed:** 55
**Team Capacity:** 55 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 48, we will have:
1. USSD payment support for feature phone users
2. MTN Mobile Money & Airtel Money integration
3. International wire transfer (SWIFT) support
4. Cross-border payment corridors
5. FX conversion and rate management
6. Comprehensive mock services for all payment methods
7. Offline transaction queuing for USSD

**Definition of Done:**
- [ ] All payment methods tested with realistic mock data
- [ ] Integration endpoints documented
- [ ] USSD gateway integration ready
- [ ] Mobile money provider APIs documented
- [ ] International wire transfer flows defined
- [ ] Error scenarios tested
- [ ] Fallback mechanisms implemented
- [ ] Mock services with realistic latencies and failure rates

---

## Sprint Backlog Items

---

# EPIC-24: Market-Specific Payment Methods

## FEATURE-48.1: USSD Payments (Unstructured Supplementary Service Data)

### 📘 User Story: US-48.1.1 - USSD Payment Support (18 SP)

**Story Points:** 18
**Priority:** P0 (Critical)
**Status:** 🔄 Not Started

---

#### User Story

```
As a feature phone user (non-smartphone)
I want to send money using USSD codes
So that I can access payment services without Internet or smartphone
```

---

#### Business Value

**Value Statement:**
USSD is critical for markets with low smartphone penetration. In Nigeria, 40%+ users still use feature phones. USSD enables payment access via simple dial codes (*390*...). This unlocks a massive market segment otherwise excluded.

**Impact:**
- **Market Reach:** +40% addressable market in Nigeria
- **Financial Inclusion:** Feature phone users can now access payments
- **Accessibility:** No data plan required, only active phone line

---

#### Acceptance Criteria

**Functional - USSD Session Management:**
- [ ] **AC1:** USSD session flow: User dials *390*MERCHANT*AMOUNT# → Receives OTP → Confirms → Transaction
- [ ] **AC2:** Session timeout: 2 minutes of inactivity (USSD standard)
- [ ] **AC3:** Session state tracking: INITIATED → AWAITING_PIN → CONFIRMED → COMPLETED
- [ ] **AC4:** Support multiple payment scenarios via menu:
  - [ ] **AC4a:** Check balance: *390*1#
  - [ ] **AC4b:** Send money: *390*2# (then follow prompts)
  - [ ] **AC4c:** Receive payment: *390*3# (generate receive code)
  - [ ] **AC4d:** Recent transactions: *390*4#
- [ ] **AC5:** USSD max text length: 182 characters per message (protocol limit)
- [ ] **AC6:** Support menu pagination: "More" option for results >182 chars

**Functional - Transaction Flow:**
- [ ] **AC7:** Recipient identification: phone number or receive code (short alphanumeric)
- [ ] **AC8:** Amount entry: confirm amount before PIN (prevent typos)
- [ ] **AC9:** PIN/OTP verification: send OTP to registered phone
- [ ] **AC10:** Rate limiting: max 3 failed PINs → session locked for 30 minutes
- [ ] **AC11:** Transaction confirmation: show details before final confirmation
- [ ] **AC12:** Receipt delivery: SMS receipt immediately after success
- [ ] **AC13:** Error messages: user-friendly, not technical

**Functional - Offline & Queue Management:**
- [ ] **AC14:** Network failure handling: queue transaction if USSD provider unavailable
- [ ] **AC15:** Offline queue: store up to 100 pending transactions locally
- [ ] **AC16:** Queue sync: automatic retry every 30 seconds when network returns
- [ ] **AC17:** User notification: SMS when queued transaction completes
- [ ] **AC18:** Timeout: mark as failed after 24 hours in queue
- [ ] **AC19:** Manual recovery: menu option to view/retry failed transactions

**Functional - Session Security:**
- [ ] **AC20:** PIN entry: not echoed back to user (security)
- [ ] **AC21:** Session encryption: TLS for USSD provider communication
- [ ] **AC22:** Rate limiting: max 10 transactions per hour per phone
- [ ] **AC23:** Fraud detection: flag unusual transaction patterns
- [ ] **AC24:** Auto-timeout: clear session data after 2 minutes idle
- [ ] **AC25:** Support multi-step verification: PIN + optional SMS OTP

**Non-Functional:**
- [ ] **AC26:** USSD response time: <5 seconds per menu (user experience)
- [ ] **AC27:** Transaction completion: <15 seconds end-to-end
- [ ] **AC28:** Success rate: 95% (accounting for network failures)
- [ ] **AC29:** Support 10,000 concurrent USSD sessions (Nigeria scale)
- [ ] **AC30:** Session persistence: survive provider connection drops

---

#### Technical Specifications

**USSD Endpoints:**

```
Gateway Provider: Likely African Operator USSD Gateways
- Airtel USSD
- MTN USSD
- Glo USSD
- 9Mobile USSD

Sample USSD Flow:
User dials: *390*2*1234567890*50000#
Provider sends POST: /webhook/ussd
{
  "sessionId": "USSD-550e8400e29b41d4",
  "phoneNumber": "+2348012345678",
  "ussdCode": "*390*2*1234567890*50000#",
  "operation": "CheckBalance|SendMoney|ReceiveCode",
  "text": "balance: ₦50,000. Reply 1 to continue",
  "sessionState": "new|ongoing|end"
}

System responds:
{
  "ussdResponse": "Enter recipient code: ",
  "sessionState": "continue",
  "messageType": "request"
}

User replies: Code provided
Provider sends: /webhook/ussd (continuation)
{
  "sessionId": "USSD-550e8400e29b41d4",
  "userInput": "ABC123",
  "sessionState": "continue"
}

System responds:
{
  "ussdResponse": "Enter PIN: ",
  "sessionState": "await_pin"
}

User enters PIN
Provider sends PIN
System responds:
{
  "ussdResponse": "Transaction successful. ₦50,000 sent to ABC123.",
  "sessionState": "end"
}
```

**USSD Message Queue (SQLite - Terminal-Local):**

```sql
CREATE TABLE ussd_pending_transactions (
  id TEXT PRIMARY KEY,
  phone_number TEXT NOT NULL,
  recipient TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP,
  attempted_at TIMESTAMP,
  completed_at TIMESTAMP,
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Insert when network fails
INSERT INTO ussd_pending_transactions
VALUES ('TXN-123', '2348012345678', 'recipient_code', 50000, 'NGN', 'PENDING', now(), NULL, NULL, NULL, 0);

-- Retry on network return
SELECT * FROM ussd_pending_transactions WHERE status = 'PENDING' ORDER BY created_at;
```

---

## FEATURE-48.2: Mobile Money Integration

### 📘 User Story: US-48.2.1 - MTN & Airtel Mobile Money (20 SP)

**Story Points:** 20
**Priority:** P0 (Critical)
**Status:** 🔄 Not Started

---

#### User Story

```
As a merchant/user
I want to send money to MTN Mobile Money & Airtel Money wallets
So that customers can receive payments via their mobile wallet
```

---

#### Business Value

**Value Statement:**
Mobile Money (MTN & Airtel) is ubiquitous in Nigeria with 50M+ active wallets. Integration enables sending payments directly to customer mobile wallets. Essential for merchant payouts and customer refunds.

**Impact:**
- **Payment Option:** Instant wallet-to-wallet transfers
- **Merchant Reach:** Can pay customers without bank accounts
- **Liquidity:** High float requirement but massive transaction volume

---

#### Acceptance Criteria

**Functional - Mobile Money Transfers:**
- [ ] **AC1:** Support sending to: MTN Mobile Money, Airtel Money
- [ ] **AC2:** Recipient identification: phone number (auto-detected via prefix)
- [ ] **AC3:** Transaction flow: validate recipient → check balance → deduct funds → credit wallet
- [ ] **AC4:** Instant settlement: funds appear in customer wallet within 30 seconds
- [ ] **AC5:** Transaction receipt: SMS confirmation for both sender and recipient
- [ ] **AC6:** Reversals: support 30-day reversal window for failed/disputed transactions
- [ ] **AC7:** Limits: Daily limit ₦1M per sender, ₦500K per transaction

**Functional - Provider Integration:**
- [ ] **AC8:** API integration with MTN API platform (OAuth2)
- [ ] **AC9:** API integration with Airtel Money APIs (API key + signature)
- [ ] **AC10:** Idempotency: same transaction ID prevents duplicate charges
- [ ] **AC11:** Real-time balance checking before transaction
- [ ] **AC12:** Provider rate limiting: queue requests if hitting limits
- [ ] **AC13:** Fallback: if direct transfer fails, queue for retry (with exponential backoff)

**Functional - Reconciliation:**
- [ ] **AC14:** Automated daily reconciliation: compare sent vs received
- [ ] **AC15:** Alert on discrepancies: reconciliation dashboard
- [ ] **AC16:** Manual override: operator can mark transaction as completed if status unclear
- [ ] **AC17:** Transaction status tracking: PENDING → COMPLETED/FAILED

**Functional - Compliance:**
- [ ] **AC18:** KYC verification: require Tier 2+ for large transfers
- [ ] **AC19:** AML screening: flag suspicious transaction patterns
- [ ] **AC20:** Transaction reporting: log for regulatory compliance
- [ ] **AC21:** Daily reporting to NCA: aggregate transaction data

**Non-Functional:**
- [ ] **AC22:** Transaction latency: <30 seconds end-to-end
- [ ] **AC23:** Provider reliability: 99.5% uptime target
- [ ] **AC24:** Throughput: 1000+ transactions/minute per provider
- [ ] **AC25:** Retry resilience: exponential backoff up to 24 hours

---

#### Technical Specifications

**Mobile Money API Integration:**

```typescript
// MTN API Example
interface MTNTransferRequest {
  amount: number;
  currency: string;
  externalId: string;  // Idempotency key
  payer: {
    partyIdType: 'MSISDN';
    partyId: string;  // Phone +234XXXXXXXXXX
  };
  payee: {
    partyIdType: 'MSISDN';
    partyId: string;  // Recipient phone
  };
  payerMessage: string;
  payeeMessage: string;
}

// Airtel Money API Example
interface AirtelTransferRequest {
  reference: string;  // External reference
  subscriber: {
    msisdn: string;  // Sender phone
  };
  transfer: {
    amount: number;
    currency: string;
  };
  recipient: {
    msisdn: string;  // Recipient phone
  };
}

// Implementation
async transferToMobileWallet(
  senderPhone: string,
  recipientPhone: string,
  amount: number,
  provider: 'MTN' | 'AIRTEL',
): Promise<TransactionResult> {
  const externalId = `MM-${Date.now()}-${uuid()}`;

  try {
    if (provider === 'MTN') {
      return await this.mtnApi.transfer({
        amount,
        currency: 'NGN',
        externalId,
        payer: { partyIdType: 'MSISDN', partyId: senderPhone },
        payee: { partyIdType: 'MSISDN', partyId: recipientPhone },
        payerMessage: 'Money transfer',
        payeeMessage: 'Money received',
      });
    } else {
      return await this.airtelApi.transfer({
        reference: externalId,
        subscriber: { msisdn: senderPhone },
        transfer: { amount, currency: 'NGN' },
        recipient: { msisdn: recipientPhone },
      });
    }
  } catch (error) {
    // Queue for retry if provider unavailable
    await this.queueForRetry({
      type: 'mobile_money',
      provider,
      request: { senderPhone, recipientPhone, amount },
      externalId,
    });
    throw error;
  }
}
```

---

## FEATURE-48.3: International Wire Transfers (SWIFT)

### 📘 User Story: US-48.3.1 - Cross-Border Payments & SWIFT Transfers (17 SP)

**Story Points:** 17
**Priority:** P1 (High)
**Status:** 🔄 Not Started

---

#### User Story

```
As a merchant/user
I want to send money internationally to bank accounts
So that I can pay overseas suppliers, remit to family, or settle international invoices
```

---

#### Business Value

**Value Statement:**
International transfers enable global commerce. Support for SWIFT, ACH, and corridor transfers enables merchants to settle international payments. Essential for export-driven businesses.

**Impact:**
- **Market Expansion:** International commerce capability
- **Revenue:** Wire transfer fees (higher margin than domestic)
- **Complexity:** Higher compliance, AML, sanctions screening required

---

#### Acceptance Criteria

**Functional - International Transfers:**
- [ ] **AC1:** Support transfer corridors:
  - [ ] **AC1a:** Nigeria → USA (ACH, SWIFT)
  - [ ] **AC1b:** Nigeria → UK (Faster Payments, SWIFT)
  - [ ] **AC1c:** Nigeria → South Africa (SWIFT)
  - [ ] **AC1d:** Nigeria → Europe (SEPA, SWIFT)
- [ ] **AC2:** Recipient information: name, bank account, BIC/SWIFT, routing number (varies by country)
- [ ] **AC3:** FX conversion: automatic conversion at real-time rates
- [ ] **AC4:** Fee calculation: fixed + percentage, varies by corridor
- [ ] **AC5:** Processing time: 3-5 business days (SWIFT standard)
- [ ] **AC6:** Status tracking: SUBMITTED → PROCESSING → CLEARED → DELIVERED

**Functional - Compliance:**
- [ ] **AC7:** Sanctions screening: OFAC check before transfer
- [ ] **AC8:** Tier 3+ KYC requirement for international transfers
- [ ] **AC9:** AML screening: enhanced due diligence for high amounts
- [ ] **AC10:** Beneficial ownership verification if business account
- [ ] **AC11:** Transaction reporting: automatic CTR (if > threshold)
- [ ] **AC12:** Audit trail: complete documentation for regulatory inspection

**Functional - Recipient Management:**
- [ ] **AC13:** Add international beneficiary: bank details, compliance verification
- [ ] **AC14:** Approve beneficiary: admin verification for first transfer
- [ ] **AC15:** Update beneficiary: change bank details if needed
- [ ] **AC16:** Remove beneficiary: prevent future transfers
- [ ] **AC17:** Reuse beneficiary: subsequent transfers faster (pre-approved)

**Functional - FX Management:**
- [ ] **AC18:** Real-time FX rates: refresh every 30 seconds
- [ ] **AC19:** Rate lock: offer fixed rate for 30 seconds (user decision)
- [ ] **AC20:** Show in both currencies: "Send NGN 10M, receive $25,000"
- [ ] **AC21:** FX hedging: platform manages FX risk

**Non-Functional:**
- [ ] **AC22:** Sanctions check: <5 seconds per transfer
- [ ] **AC23:** FX rate update: <1 second latency
- [ ] **AC24:** Concurrent transfers: 100+ simultaneous processing
- [ ] **AC25:** Compliance review: <30 minutes for anomalous transfers

---

#### Technical Specifications

**International Wire Request:**

```typescript
interface InternationalTransferRequest {
  amount: number;
  sourceCurrency: 'NGN';
  targetCurrency: 'USD' | 'GBP' | 'EUR' | 'ZAR';
  recipient: {
    name: string;
    accountNumber: string;
    bankName: string;
    bankBIC: string;
    country: string;
    routingNumber?: string;  // For US/ACH
    IBAN?: string;  // For EU/SEPA
  };
  reference: string;
  purpose: string;  // Regulatory required
}

interface InternationalTransferResponse {
  transferId: string;
  status: 'SUBMITTED' | 'PROCESSING' | 'CLEARED' | 'DELIVERED' | 'FAILED';
  sourceAmount: number;
  sourceCurrency: string;
  targetAmount: number;
  targetCurrency: string;
  fxRate: number;
  fees: {
    platform: number;  // Platform fee in NGN
    correspondent: number;  // Bank correspondent fee
    total: number;
  };
  estimatedDelivery: Date;
  recipientReference?: string;  // SWIFT reference number
  complianceStatus: 'CLEARED' | 'PENDING_REVIEW' | 'BLOCKED';
  createdAt: Date;
}

// SWIFT Message Format (MT103)
interface SWIFTMessage {
  ':20:': string;  // Transaction Reference
  ':23B:': string;  // Bank Operation Code
  ':32A:': string;  // Value Date and Currency
  ':33B:': string;  // Instructed Amount
  ':36:': number;  // Exchange Rate
  ':50A:': string;  // Ordering Customer
  ':52A:': string;  // Ordering Bank
  ':53A:': string;  // Intermediary Bank
  ':54A:': string;  // Receiver's Correspondent Bank
  ':56A:': string;  // Intermediary Bank
  ':57A:': string;  // Account with Bank
  ':59:': string;  // Beneficiary Customer
  ':70:': string;  // Remittance Information
  ':71A:': string;  // Details of Charges
}
```

**Sanctions Screening Integration:**

```typescript
async screenForSanctions(
  transferRequest: InternationalTransferRequest,
): Promise<{
  cleared: boolean;
  reason?: string;
  sanctions: SanctionsMatch[];
  score: number;  // 0-100
}> {
  const matches = [];

  // Screen recipient name
  const nameMatch = await this.ofacService.screen(
    transferRequest.recipient.name,
    transferRequest.recipient.country,
  );

  if (nameMatch.score > 80) {
    matches.push({
      type: 'NAME_MATCH',
      entity: nameMatch.entity,
      score: nameMatch.score,
      reason: 'Possible OFAC match',
    });
  }

  // Screen by country (some countries blocked entirely)
  const blockedCountries = ['IR', 'KP', 'SY', 'CU'];
  if (blockedCountries.includes(transferRequest.recipient.country)) {
    matches.push({
      type: 'COUNTRY_BLOCK',
      reason: `Transfers to ${transferRequest.recipient.country} blocked`,
    });
  }

  const overallScore = this.calculateScore(matches);

  return {
    cleared: matches.length === 0 && overallScore < 70,
    reason: matches.length > 0 ? matches[0].reason : undefined,
    sanctions: matches,
    score: overallScore,
  };
}
```

---

## Sprint Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|-----------|
| RISK-48-001 | USSD provider unavailability blocks payments | Medium | High | Queue + retry, fallback to other methods |
| RISK-48-002 | Mobile Money float exhaustion | Medium | Critical | Pre-fund wallets, auto-rebalance |
| RISK-48-003 | SWIFT sanctions false positives block legitimate transfers | Low | High | Manual review process, appeal mechanism |
| RISK-48-004 | FX rate manipulation/arbitrage by users | Low | Medium | Rate lock duration, transaction limits |
| RISK-48-005 | Regulatory changes block market unexpectedly | Low | Critical | Quarterly compliance review, contingency planning |

---

## Sprint Dependencies

- **Sprint 5** (Wallet & Transactions): Core transaction infrastructure
- **Sprint 8** (Admin): Transaction monitoring and manual overrides
- **USSD Gateway**: Third-party USSD provider (Africell, etc.)
- **Mobile Money APIs**: MTN & Airtel API access
- **SWIFT Network**: Correspondent banking relationships

---

## Sprint Notes & Decisions

1. **Mock Services First:** Create comprehensive mock services BEFORE real provider integration
2. **Phased Rollout:** USSD → Mobile Money → International Wires (depends on provider availability)
3. **Float Management:** Pre-fund mobile money wallets; not real-time settlement
4. **Compliance:** Mandatory sanctions screening; manual review for flagged transactions
5. **Fallback:** All payment methods have graceful degradation and retry logic
6. **Testing:** Extensive testing with mock services before production deployment

---

**Document Version:** 1.0.0
