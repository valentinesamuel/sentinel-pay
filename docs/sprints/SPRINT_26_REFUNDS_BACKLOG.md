# Sprint 26: Refunds Management

**Duration:** 1 week | **Story Points:** 15 SP

---

## User Stories

### US-26.1.1: Refund Processing (8 SP)

**Title:** Full and partial refund support with immediate processing

**Acceptance Criteria:**
1. Full refunds (100% of transaction)
2. Partial refunds (any amount)
3. Multiple partial refunds per transaction
4. Refund within 24-48 hours (bank processing)
5. Refund status tracking (PENDING, PROCESSING, COMPLETED, FAILED)
6. Refund reason documentation
7. Customer notification (SMS, Email)
8. Refund history per transaction
9. Refund reversal (if needed)
10. Automatic refund on dispute approval
11. Chargeback deduction on refunds
12. Bulk refund processing (admin)
13. Refund reporting and analytics
14. Refund audit trail
15. Rate limits: max 5 refunds per transaction

**APIs:**
```
POST   /api/v1/transactions/:id/refund
       Request: { amount?, reason, description }
       Response: { refundId, status, amount, estimatedDate }

GET    /api/v1/transactions/:id/refunds
       Response: [ { refundId, amount, status, initiatedAt } ]

POST   /api/v1/refunds/:id/cancel
       Response: { success: true }
```

**Estimated Effort:** 8 SP

---

### US-26.1.2: Refund Limits & Policies (4 SP)

**Title:** Enforce refund limits by merchant and transaction type

**Acceptance Criteria:**
1. Configurable refund window (30-90 days)
2. Refund limits per merchant (daily/monthly)
3. Transaction type restrictions (some txns non-refundable)
4. Customer refund request limits
5. Auto-approve for legit reasons
6. Require evidence for fraud/chargeback
7. Refund cap per transaction (100% max)

**Estimated Effort:** 4 SP

---

### US-26.1.3: Reconciliation & Reporting (3 SP)

**Title:** Track and report on refunds

**Acceptance Criteria:**
1. Refund transaction reconciliation
2. Outstanding refunds report
3. Refund analytics (rates, reasons)
4. Merchant refund history

**Estimated Effort:** 3 SP

---

## Database Schema

```sql
CREATE TABLE refunds (
  id UUID PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  amount DECIMAL(15,2) NOT NULL,
  reason VARCHAR(100),
  status VARCHAR(50),  -- pending, processing, completed, failed
  initiated_by UUID REFERENCES users(id),
  initiated_at TIMESTAMP,
  completed_at TIMESTAMP,
  failure_reason TEXT
);

CREATE TABLE refund_policies (
  merchant_id UUID UNIQUE REFERENCES merchants(id),
  refund_window_days INT DEFAULT 30,
  max_daily_refunds DECIMAL(15,2),
  max_monthly_refunds DECIMAL(15,2),
  auto_approve BOOLEAN DEFAULT true
);
```

