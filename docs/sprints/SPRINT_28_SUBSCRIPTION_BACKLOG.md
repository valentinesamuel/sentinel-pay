# Sprint 28: Subscription Management

**Sprint Goal:** Implement comprehensive subscription and recurring billing management with plan creation, enrollment, automated charge processing, failed charge retry logic, and subscription analytics.

**Duration:** 2 weeks (14 days)
**Story Points:** 40 SP
**Team:** 2 Backend Engineers + 1 Payment Systems Engineer
**Dependencies:** Sprint 5 (Transactions), Sprint 5.5 (Card Tokenization), Sprint 7 (Notifications)
**Enables:** Sprints 41, 45, 48 (recurring revenue features)

---

## User Stories

### US-28.1.1: Subscription Plan Creation & Management (12 SP)

**Title:** Merchants create and manage subscription plans with flexible billing configurations

**Description:**
Enable merchants to define subscription plans with various billing frequencies, pricing models, trial periods, and currency support. Plans must support fixed charges, tiered pricing, and future plan versioning.

**Acceptance Criteria:**
1. Merchant subscription plan creation (name, description, icon)
2. Billing frequency: daily, weekly, monthly, quarterly, annual, custom
3. Plan types: Fixed charge, Usage-based, Tiered pricing
4. Trial period configuration (0-90 days, free trial with auto-charge)
5. Trial period charge amount (can differ from regular charge)
6. Currency per plan (₦, USD, EUR, etc)
7. Setup fee configuration (one-time charge on enrollment)
8. Plan pricing override per customer (custom negotiations)
9. Plan versioning (new version, keep old active)
10. Plan archival (retire old plans, prevent new signups)
11. Billing anchor date (e.g., always on 1st of month)
12. Pro-ration support (charge for partial periods)
13. Payment method override per merchant (card, wallet, invoice)
14. Plan metadata and custom fields
15. Bulk plan import/export (CSV)

**Database Schema:**
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  plan_name VARCHAR(255) NOT NULL,
  plan_description TEXT,
  billing_frequency VARCHAR(50),      -- daily, weekly, monthly, quarterly, annual, custom
  billing_interval INT DEFAULT 1,     -- e.g., every 2 weeks = frequency=weekly, interval=2
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  trial_period_days INT DEFAULT 0,
  trial_amount DECIMAL(15,2),         -- charge during trial (if any)
  setup_fee DECIMAL(15,2),            -- one-time charge on enrollment
  max_charges INT,                    -- NULL = unlimited, otherwise max charge count
  billing_anchor_day INT,             -- 1-31 for monthly/annual anchoring
  plan_type VARCHAR(50),              -- fixed, usage_based, tiered
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED, DRAFT
  merchant_status VARCHAR(50),        -- For merchant to pause all subscriptions
  plan_version INT DEFAULT 1,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  archived_at TIMESTAMP
);

CREATE TABLE subscription_plan_tiers (
  id UUID PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  tier_number INT,
  min_units INT,
  max_units INT,
  unit_price DECIMAL(15,2),
  flat_amount DECIMAL(15,2),
  created_at TIMESTAMP
);

CREATE TABLE subscription_plan_metadata (
  plan_id UUID PRIMARY KEY REFERENCES subscription_plans(id),
  metadata JSONB,
  custom_fields JSONB
);

CREATE INDEX idx_subscription_plans_merchant ON subscription_plans(merchant_id);
CREATE INDEX idx_subscription_plans_status ON subscription_plans(status);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active, merchant_id);
```

**APIs:**
```
POST   /api/v1/subscription-plans
       Request: { merchantId, planName, billingFrequency, amount, trialDays, setupFee }
       Response: { planId, createdAt, status }

GET    /api/v1/subscription-plans/:id
       Response: { planId, name, frequency, amount, trials, tiers[], metadata }

PUT    /api/v1/subscription-plans/:id
       Request: { updates... }
       Response: { planId, updatedAt, version }

POST   /api/v1/subscription-plans/:id/archive
       Response: { planId, status: "ARCHIVED" }

GET    /api/v1/subscription-plans
       Query: { merchantId, status, isActive }
       Response: { plans[], pagination }

POST   /api/v1/subscription-plans/:id/version
       Request: { newVersion... }
       Response: { newVersionId, version: 2 }
```

**Estimated Effort:** 12 SP

---

### US-28.1.2: Subscription Enrollment & Lifecycle Management (10 SP)

**Title:** Customers enroll in subscription plans and manage subscription lifecycle

**Description:**
Allow customers to browse merchant plans, select one, enroll with payment method, and manage their active subscriptions (pause, resume, cancel, upgrade/downgrade).

**Acceptance Criteria:**
1. Customer subscription enrollment (select plan, payment method)
2. Customer views available merchant plans
3. Subscription activation (immediate or after trial)
4. Trial period countdown with auto-charge notification
5. Subscription states: PENDING, ACTIVE, PAUSED, CANCELLED, EXPIRED
6. Subscription history and past subscriptions
7. Pause subscription (stop charges, resume later)
8. Resume subscription (restart charges from pause point)
9. Cancel subscription (permanent, with reason)
10. Upgrade/downgrade plans (mid-cycle with pro-ration)
11. Change payment method mid-subscription
12. Subscription renewal notifications (pre-charge, post-charge)
13. Failed subscription handling
14. Subscription expiration (max_charges reached)
15. Customer subscription dashboard

**Database Schema:**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  status VARCHAR(50) DEFAULT 'PENDING',  -- PENDING, ACTIVE, PAUSED, CANCELLED, EXPIRED
  auto_renew BOOLEAN DEFAULT true,
  next_charge_date DATE NOT NULL,
  trial_end_date DATE,
  charge_count INT DEFAULT 0,
  max_charges INT,
  last_charge_date DATE,
  last_charge_amount DECIMAL(15,2),
  cancelled_at TIMESTAMP,
  cancelled_reason VARCHAR(255),
  paused_at TIMESTAMP,
  resumed_at TIMESTAMP,
  custom_amount DECIMAL(15,2),        -- override plan amount if negotiated
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE subscription_events (
  id UUID PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  event_type VARCHAR(50),              -- enrolled, activated, paused, resumed, upgraded, charged, failed, cancelled
  amount DECIMAL(15,2),
  notes TEXT,
  created_at TIMESTAMP
);

CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_merchant ON subscriptions(merchant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_charge ON subscriptions(next_charge_date);
```

**APIs:**
```
POST   /api/v1/subscriptions
       Request: { customerId, planId, paymentMethodId, startDate }
       Response: { subscriptionId, status, nextChargeDate }

GET    /api/v1/subscriptions/:id
       Response: { subscriptionId, status, plan, nextCharge, chargeHistory[] }

PUT    /api/v1/subscriptions/:id/pause
       Response: { subscriptionId, status: "PAUSED", pausedAt }

PUT    /api/v1/subscriptions/:id/resume
       Response: { subscriptionId, status: "ACTIVE", nextChargeDate }

PUT    /api/v1/subscriptions/:id/cancel
       Request: { reason }
       Response: { subscriptionId, status: "CANCELLED", refund }

PUT    /api/v1/subscriptions/:id/upgrade
       Request: { newPlanId }
       Response: { subscriptionId, newPlan, proration }

GET    /api/v1/customers/:id/subscriptions
       Response: { subscriptions[], active, paused, cancelled }
```

**Estimated Effort:** 10 SP

---

### US-28.1.3: Recurring Charge Processing & Retry Logic (12 SP)

**Title:** Process recurring charges automatically with intelligent retry on failures

**Description:**
Execute scheduled subscription charges at exact times, handle failures with smart retry logic using exponential backoff, avoid duplicate charges, and maintain comprehensive audit trail.

**Acceptance Criteria:**
1. Scheduled charge execution at next_charge_date (timezone-aware)
2. Batch charge processing (100s of subscriptions per second)
3. Idempotent charge processing (prevent duplicates via charge_idempotency_key)
4. Charge attempt tracking (audit log for each attempt)
5. Retry on specific failures (network, temporary decline) not permanent (insufficient funds, card expired)
6. Exponential backoff retry: 1st at 24h, 2nd at 48h, 3rd at 72h
7. Max 3 retry attempts per charge
8. Webhook notification after each charge attempt
9. Dunning workflow: notifications before giving up
10. Partial charge support (if subscription amount > balance, allow partial)
11. Proration on plan changes (credit/debit next charge)
12. Charge timezone handling (charge in customer's timezone)
13. Rate limiting for payment processor (max 100 charges/second per processor)
14. Failed charge quarantine (review before retrying)
15. Charge reconciliation (matching platform charges vs payment gateway)

**Database Schema:**
```sql
CREATE TABLE subscription_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3),
  status VARCHAR(50),                 -- PENDING, PROCESSING, SUCCEEDED, FAILED, RETRYING
  charge_idempotency_key VARCHAR(100) UNIQUE NOT NULL,
  scheduled_date TIMESTAMP NOT NULL,
  actual_charge_date TIMESTAMP,
  last_retry_date TIMESTAMP,
  retry_count INT DEFAULT 0,
  next_retry_date TIMESTAMP,
  payment_processor VARCHAR(50),      -- paystack, flutterwave, etc
  processor_charge_id VARCHAR(100),
  processor_response JSONB,
  failure_reason VARCHAR(255),        -- insufficient_funds, card_expired, network_error, etc
  failure_code VARCHAR(50),
  should_retry BOOLEAN DEFAULT true,
  requires_review BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE subscription_charge_attempts (
  id UUID PRIMARY KEY,
  charge_id UUID NOT NULL REFERENCES subscription_charges(id),
  attempt_number INT,
  status VARCHAR(50),                 -- initiated, succeeded, failed
  processor_response JSONB,
  error_message TEXT,
  error_code VARCHAR(50),
  attempted_at TIMESTAMP,
  INDEX idx_charge_id ON subscription_charges(id)
);

CREATE TABLE dunning_events (
  id UUID PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  charge_id UUID REFERENCES subscription_charges(id),
  event_type VARCHAR(50),             -- first_attempt_failed, retry_scheduled, final_attempt, given_up
  notification_sent_at TIMESTAMP,
  customer_notified BOOLEAN,
  created_at TIMESTAMP
);

CREATE INDEX idx_subscription_charges_status ON subscription_charges(status);
CREATE INDEX idx_subscription_charges_next_retry ON subscription_charges(next_retry_date);
CREATE INDEX idx_subscription_charges_scheduled ON subscription_charges(scheduled_date);
```

**APIs:**
```
POST   /api/v1/subscriptions/:id/charge (admin only)
       Request: { amount, reason }
       Response: { chargeId, status, attemptAt }

GET    /api/v1/subscriptions/:id/charges
       Response: { charges[], status, amount, date, attempts[] }

GET    /api/v1/admin/subscription-charges
       Query: { status, startDate, endDate, failureReason }
       Response: { charges[], pagination }

POST   /api/v1/admin/subscription-charges/:id/retry (manual)
       Response: { chargeId, status: "RETRYING", nextAttemptAt }

POST   /api/v1/admin/subscription-charges/:id/mark-review
       Request: { reviewNotes }
       Response: { chargeId, requiresReview: true }
```

**Estimated Effort:** 12 SP

---

### US-28.1.4: Subscription Analytics & Reporting (6 SP)

**Title:** Track subscription metrics, churn rate, MRR, and provide analytics dashboard

**Description:**
Calculate and report key subscription business metrics including Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), churn rate, and cohort analysis.

**Acceptance Criteria:**
1. Monthly Recurring Revenue (MRR) calculation (active subscriptions * avg amount)
2. Annual Recurring Revenue (ARR) = MRR * 12
3. Churn rate (% subscriptions cancelled per month)
4. Expansion MRR (revenue from upgrades)
5. Contraction MRR (revenue lost from downgrades)
6. Customer Lifetime Value (CLV) calculation
7. Cohort analysis (by signup month)
8. Subscription growth trend (week over week)
9. Plan popularity metrics
10. Failed charge recovery rate
11. Trial conversion rate (trial → paid)
12. Dunning success rate (recovered charges from retries)
13. Merchant-specific analytics dashboard
14. Export reports (CSV, PDF)

**Database Schema:**
```sql
CREATE TABLE subscription_metrics (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  metric_date DATE,
  mrr DECIMAL(15,2),                  -- Monthly Recurring Revenue
  arr DECIMAL(15,2),                  -- Annual Recurring Revenue
  active_subscriptions INT,
  new_subscriptions INT,
  cancelled_subscriptions INT,
  paused_subscriptions INT,
  churn_rate DECIMAL(5,2),            -- percentage
  trial_conversions INT,
  trial_conversion_rate DECIMAL(5,2),
  failed_charges INT,
  recovered_charges INT,              -- via retries
  recovery_rate DECIMAL(5,2),
  expansion_mrr DECIMAL(15,2),
  contraction_mrr DECIMAL(15,2),
  created_at TIMESTAMP
);

CREATE TABLE subscription_cohorts (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL,
  cohort_month DATE,
  cohort_size INT,
  month_0_revenue DECIMAL(15,2),      -- revenue in month signed up
  month_1_revenue DECIMAL(15,2),
  month_2_revenue DECIMAL(15,2),
  month_3_revenue DECIMAL(15,2),
  month_6_revenue DECIMAL(15,2),
  month_12_revenue DECIMAL(15,2),
  created_at TIMESTAMP
);

CREATE INDEX idx_metrics_merchant_date ON subscription_metrics(merchant_id, metric_date);
CREATE INDEX idx_cohorts_merchant ON subscription_cohorts(merchant_id);
```

**APIs:**
```
GET    /api/v1/merchants/:id/subscription-metrics
       Query: { startDate, endDate }
       Response: { mrr, arr, activeCount, churnRate, trends[] }

GET    /api/v1/merchants/:id/subscription-cohorts
       Response: { cohorts[], month0, month3, month6, month12 }

GET    /api/v1/merchants/:id/subscription-report
       Query: { format: csv|pdf, startDate, endDate }
       Response: Download file

GET    /api/v1/merchants/:id/plan-performance
       Response: { plans[], subscribers, revenue, churn, conversionRate }
```

**Estimated Effort:** 6 SP

---

## Success Criteria

- [ ] Subscription plan creation: <2 minutes setup
- [ ] Charge execution: <100ms per charge
- [ ] Batch charge throughput: 1000+ subscriptions/minute
- [ ] Charge success rate: >98% on first attempt
- [ ] Failed charge recovery: >80% via retries
- [ ] Trial conversion rate: >40%
- [ ] Churn rate: <5% monthly
- [ ] Dunning notification delivery: 99.95% (pre-charge notifications)
- [ ] No duplicate charges: 100% idempotency guarantee
- [ ] Charge retry accuracy: >99% (correct retry on eligible errors)
