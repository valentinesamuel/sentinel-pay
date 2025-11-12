# Sprint 23: Merchant Onboarding & Account Management

**Sprint Goal:** Implement comprehensive merchant onboarding workflow with business verification, KYC compliance, settlement configuration, and merchant account management portal.

**Duration:** 2 weeks (14 days)
**Story Points:** 40 SP
**Team:** 2 Backend Engineers + 1 Compliance Officer + 1 Frontend Engineer
**Dependencies:** Sprint 1 (Auth), Sprint 2 (User management), Sprint 30 (KYC)
**Enables:** All merchant features (Sprints 5-48)

---

## User Stories

### US-23.1.1: Merchant Registration & KYC (12 SP)

**Title:** Complete merchant registration with business verification and KYC documents

**Description:**
Implement merchant registration flow with business entity verification, document upload, and KYC compliance checking. Different from individual KYC - includes business registration, tax ID, bank account verification.

**Acceptance Criteria:**
1. Merchant registration form (individual vs. business entity)
2. Business entity types: Sole Proprietor, Partnership, LLC, Corporate
3. Required documents by entity type:
   - Sole: National ID, Business registration, Tax ID
   - Partnership: Partnership agreement, Tax ID, Partner IDs
   - LLC: Articles of incorporation, Tax ID, Owner IDs
   - Corporate: Articles of incorporation, Tax ID, Company registration
4. Document upload with OCR validation (auto-extract data)
5. Parallel document verification (multiple docs simultaneously)
6. KYC tiers for merchants (Tier 0-3, different from individual tiers)
7. Merchant KYC status: PENDING → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
8. Auto-reject for fraud indicators (blacklist matches, sanctions)
9. Manual review queue for borderline cases
10. Appeal mechanism for rejected merchants
11. Document expiration tracking
12. Bulk merchant import (CSV) for platform operators
13. Merchant classification (high-risk categories require extra scrutiny)
14. PEP (Politically Exposed Person) screening
15. Enhanced due diligence for high-risk merchants

**Database Schema:**
```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,  -- sole, partnership, llc, corporate
  registration_number VARCHAR(100),
  tax_id VARCHAR(50) NOT NULL UNIQUE,
  industry_category VARCHAR(100),
  risk_level VARCHAR(50) DEFAULT 'medium',  -- low, medium, high
  kyc_status VARCHAR(50) DEFAULT 'pending',
  kyc_submitted_at TIMESTAMP,
  kyc_approved_at TIMESTAMP,
  kyc_rejected_reason TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE merchant_kyc_documents (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  document_type VARCHAR(50),       -- id, registration, tax_cert, bank_auth, etc
  document_url VARCHAR(500),       -- S3 URL
  document_hash VARCHAR(64),       -- For tampering detection
  status VARCHAR(50),              -- PENDING, VERIFIED, REJECTED
  ocr_data JSONB,                  -- Extracted text from OCR
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMP
);

CREATE TABLE merchant_bank_accounts (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  account_number VARCHAR(50) NOT NULL ENCRYPTED,
  bank_code VARCHAR(10),
  account_holder VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  verification_attempts INT DEFAULT 0,
  created_at TIMESTAMP,
  UNIQUE(merchant_id, account_number)
);

CREATE INDEX idx_merchants_kyc_status ON merchants(kyc_status);
CREATE INDEX idx_merchants_user ON merchants(user_id);
CREATE INDEX idx_merchant_docs_merchant ON merchant_kyc_documents(merchant_id);
```

**APIs:**
```
POST   /api/v1/merchants/register
       Request: { businessName, entityType, taxId, documents[], industry }
       Response: { merchantId, kycStatus, nextSteps }

GET    /api/v1/merchants/kyc-status
       Response: { status, submittedAt, approvedAt, rejectionReason, documents[] }

POST   /api/v1/merchants/submit-kyc
       Request: { merchantId, documents[], declaration }
       Response: { submissionId, reviewQueue, estimatedTime: "2-3 days" }

POST   /api/v1/merchants/appeal
       Request: { merchantId, reason, additionalDocs[] }
       Response: { appealId, status }

GET    /api/v1/admin/merchants/pending-kyc
       Response: { merchantId, businessName, submittedAt, riskScore, nextReview }
```

**Estimated Effort:** 12 SP

---

### US-23.1.2: Settlement Configuration & Payout Management (10 SP)

**Title:** Configure settlement accounts and manage payout schedules

**Description:**
Allow merchants to configure where transaction funds are settled, set settlement frequency, and manage payout schedules.

**Acceptance Criteria:**
1. Multiple settlement bank accounts per merchant
2. Settlement frequency: daily, weekly, monthly
3. Minimum settlement amount threshold
4. Settlement fee configuration by merchant tier
5. Manual settlement request (on-demand)
6. Settlement hold period (1-7 days configurable)
7. Payout history with detailed breakdown
8. Reversal/chargeback impact on settlements
9. Reserve account management (hold percentage of transactions)
10. Tax withholding calculation and reporting
11. Settlement reconciliation
12. Payout performance metrics (on-time %, success %)
13. Settlement failure notification and retry
14. Bulk payout export (CSV, Excel)
15. Settlement calendar showing upcoming payouts

**Database Schema:**
```sql
CREATE TABLE merchant_settlement_settings (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL UNIQUE REFERENCES merchants(id),
  settlement_frequency VARCHAR(20),  -- daily, weekly, monthly
  minimum_amount DECIMAL(15,2),
  settlement_fee_percent DECIMAL(5,3),
  hold_period_days INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

CREATE TABLE merchant_payouts (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  settlement_account_id UUID NOT NULL,
  period_start DATE,
  period_end DATE,
  gross_amount DECIMAL(15,2),
  fees DECIMAL(15,2),
  chargebacks DECIMAL(15,2),
  refunds DECIMAL(15,2),
  net_amount DECIMAL(15,2),
  status VARCHAR(50),  -- scheduled, processing, completed, failed
  scheduled_date DATE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP,
  FOREIGN KEY (settlement_account_id) REFERENCES merchant_bank_accounts(id)
);

CREATE INDEX idx_payouts_merchant ON merchant_payouts(merchant_id, processed_at DESC);
CREATE INDEX idx_payouts_status ON merchant_payouts(status);
```

**Estimated Effort:** 10 SP

---

### US-23.1.3: Merchant Dashboard & Analytics (10 SP)

**Title:** Provide merchant dashboard for monitoring performance and transactions

**Description:**
Create dashboard where merchants can view their transactions, settlement status, performance metrics, and manage account settings.

**Acceptance Criteria:**
1. Real-time transaction feed
2. Settlement status and next payout date
3. Revenue metrics (daily/monthly)
4. Transaction success/failure rates
5. Top customers by volume
6. Chargeback and refund rates
7. Account alerts and notifications
8. Bulk transaction export
9. API usage and rate limit status
10. Webhook delivery status
11. Dispute management interface
12. Sub-merchant management (if applicable)
13. Custom date range reporting
14. Performance trend analysis
15. Customizable dashboard widgets

**Estimated Effort:** 10 SP

---

### US-23.1.4: Merchant Access Control & Permissions (8 SP)

**Title:** Manage merchant team members and their permissions

**Description:**
Allow merchants to add team members with granular permission controls for transaction management, settlement, reporting, etc.

**Acceptance Criteria:**
1. Multiple team members per merchant account
2. Role-based access: Admin, Finance, Viewer
3. Custom permission sets
4. Transaction approval workflows
5. 2FA requirement for financial operations
6. Audit log of all team actions
7. Team member invitation via email
8. Automatic removal on departure
9. Permission scoping by amount (e.g., approve transfers <₦100k)
10. API key management per team member
11. IP whitelist for team members
12. Session timeout policies
13. Activity monitoring and alerts
14. Team member disable (temporary suspension)
15. Permission conflict detection

**Database Schema:**
```sql
CREATE TABLE merchant_team_members (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50),  -- admin, finance, viewer
  custom_permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP,
  UNIQUE(merchant_id, user_id)
);

CREATE TABLE merchant_action_audit (
  id BIGSERIAL PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  team_member_id UUID REFERENCES merchant_team_members(id),
  action VARCHAR(100),  -- transaction_created, settlement_requested, etc
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Estimated Effort:** 8 SP

---

## Success Criteria

- [ ] Merchant registration complete in <10 minutes
- [ ] KYC approval/rejection within 2-3 business days
- [ ] 0 merchant account breaches
- [ ] Settlement payout success: >99%
- [ ] Dashboard load time: <2 seconds
- [ ] Permission system: 100% accurate enforcement
- [ ] Audit trail: 100% complete for all actions
- [ ] Merchant satisfaction: >85%
- [ ] API availability: 99.95%

---

## Dependencies

**Depends On:**
- ✅ Sprint 1: Auth framework
- ✅ Sprint 2: User management
- ✅ Sprint 30: KYC infrastructure

**Enables:**
- All Sprints 5-48 (merchants use these features)
