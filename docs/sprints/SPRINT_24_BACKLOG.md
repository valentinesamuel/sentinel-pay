# Sprint 24: Dispute & Chargeback Management

**Sprint Goal:** Implement comprehensive dispute and chargeback handling with evidence collection, investigation workflow, and resolution management.

**Duration:** 2 weeks (14 days)
**Story Points:** 25 SP
**Team:** 1-2 Backend Engineers + 1 Compliance Officer
**Dependencies:** Sprint 5 (Transactions), Sprint 7 (Notifications)
**Enables:** Merchant operations, regulatory compliance

---

## User Stories

### US-24.1.1: Dispute Creation & Evidence Collection (8 SP)

**Title:** Allow customers/merchants to create disputes with evidence submission

**Acceptance Criteria:**
1. Customer-initiated dispute (transaction contested)
2. Merchant-initiated chargeback response
3. Evidence upload (up to 10 files per dispute)
4. Evidence types: Receipt, Proof of delivery, Communication, Refund proof, etc
5. Dispute creation within 90 days of transaction
6. Automatic dispute detection (high chargeback merchants)
7. Evidence validation (file type, size, format)
8. Encrypted evidence storage (S3)
9. Evidence timeline tracking
10. Auto-escalation to chargeback for unresolved disputes

**APIs:**
```
POST   /api/v1/transactions/:id/dispute
       Request: { reason, evidence[], description }
       Response: { disputeId, status: "OPEN", deadline }

POST   /api/v1/disputes/:id/evidence
       Request: { files[], description }
       Response: { evidenceIds: [], uploadedAt }

GET    /api/v1/disputes/:id
       Response: { disputeId, status, reason, amount, deadline, evidence[] }
```

**Database Schema:**
```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  customer_id UUID REFERENCES users(id),
  merchant_id UUID REFERENCES merchants(id),
  reason VARCHAR(100),          -- dispute_reason
  amount DECIMAL(15,2),
  status VARCHAR(50),           -- OPEN, INVESTIGATING, RESOLVED, CHARGEBACK
  resolution VARCHAR(50),       -- APPROVED, DENIED, PARTIAL_REFUND
  created_at TIMESTAMP,
  resolved_at TIMESTAMP,
  deadline TIMESTAMP            -- 45 days from creation
);

CREATE TABLE dispute_evidence (
  id UUID PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES disputes(id),
  file_url VARCHAR(500),
  file_hash VARCHAR(64),
  evidence_type VARCHAR(50),
  uploaded_at TIMESTAMP
);
```

**Estimated Effort:** 8 SP

---

### US-24.1.2: Dispute Investigation & Resolution (10 SP)

**Title:** Investigate disputes and determine resolution

**Acceptance Criteria:**
1. Investigation workflow with status tracking
2. Merchant response required (10 days)
3. Customer counter-evidence support
4. Investigation notes and timeline
5. Decision options: Approve refund, Deny dispute, Partial refund
6. Chargeback liability calculations
7. Pattern detection (repeat disputes with same merchant)
8. Auto-resolution for clear cases
9. Escalation to manager for complex cases
10. SLA tracking (30-day resolution target)

**Estimated Effort:** 10 SP

---

### US-24.1.3: Chargeback Handling & Liability (7 SP)

**Title:** Process chargebacks and manage liability

**Acceptance Criteria:**
1. Chargeback auto-notification
2. Liability assignment (customer vs merchant vs platform)
3. Chargeback fee deduction from next settlement
4. Chargeback prevention notifications (high-risk patterns)
5. Chargeback history per merchant
6. Regulation compliance (Visa/Mastercard rules)
7. Representation appeal option
8. Chargeback reversal if merchant wins appeal

**Estimated Effort:** 7 SP

---

## Success Criteria

- [ ] Dispute resolution time: <30 days average
- [ ] False dispute rate: <10%
- [ ] Merchant response: >90% within deadline
- [ ] Chargeback accuracy: 100%
- [ ] Evidence preservation: Permanent encryption
- [ ] SLA compliance: >95%
- [ ] Investigation accuracy: >85%

