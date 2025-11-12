# Sprint 27: Bill Payments (Detailed)

**Duration:** 2 weeks | **Story Points:** 25 SP

---

## User Stories

### US-27.1.1: Airtime & Data Topup (10 SP)

**Title:** Buy airtime and data bundles for mobile networks

**Acceptance Criteria:**
1. Support MTN, Airtel, Glo, 9Mobile
2. Real-time balance verification
3. Instant delivery (< 5 seconds)
4. Topup amount ranges (₦100-₦50k)
5. Data bundle selection (1GB-100GB)
6. Bonus tracking per provider
7. Failed topup auto-refund
8. Topup history
9. Scheduled topups (recurring)
10. Merchant topup reselling

**APIs:**
```
GET    /api/v1/bills/airtime/providers
       Response: [ { provider, plans: [], rates } ]

POST   /api/v1/bills/airtime/topup
       Request: { provider, phone, amount }
       Response: { topupId, status, amount, credit }

GET    /api/v1/bills/topups
       Response: [ { topupId, provider, amount, status, timestamp } ]
```

**Estimated Effort:** 10 SP

---

### US-27.1.2: Utility Bill Payments (8 SP)

**Title:** Pay electricity, water, internet bills

**Acceptance Criteria:**
1. Electricity (NEPA, Disco providers)
2. Water utilities
3. Internet service providers
4. Account lookup by ID
5. Bill amount verification
6. Payment confirmation with receipt
7. Bill payment history
8. Auto-bill reminders
9. Failed payment retry

**Estimated Effort:** 8 SP

---

### US-27.1.3: Insurance & Other Bills (4 SP)

**Title:** Pay insurance premiums and other bills

**Acceptance Criteria:**
1. Health insurance
2. Auto insurance
3. Home insurance
4. TV subscriptions
5. Other bill types (extensible)

**Estimated Effort:** 4 SP

---

### US-27.1.4: Bill Payment Webhooks (3 SP)

**Title:** Notify merchants of bill payment status

**Acceptance Criteria:**
1. Success webhooks
2. Failure notifications
3. Delivery guarantees
4. Retry logic

**Estimated Effort:** 3 SP

---

## Database Schema

```sql
CREATE TABLE bill_payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  bill_type VARCHAR(50),  -- airtime, electricity, water, internet, insurance
  provider VARCHAR(100),  -- MTN, Airtel, NEPA, etc
  account_id VARCHAR(100),
  amount DECIMAL(15,2),
  status VARCHAR(50),
  reference VARCHAR(100),
  receipt_url VARCHAR(500),
  created_at TIMESTAMP
);

CREATE TABLE bill_providers (
  id UUID PRIMARY KEY,
  provider_name VARCHAR(100) UNIQUE,
  bill_type VARCHAR(50),
  api_key VARCHAR(500) ENCRYPTED,
  timeout_seconds INT DEFAULT 30,
  success_rate DECIMAL(3,2) DEFAULT 0.99
);
```

