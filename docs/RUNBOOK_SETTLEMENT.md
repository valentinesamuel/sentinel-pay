# Runbook: Settlement Operations

## Overview
Procedures for managing merchant settlements, investigating settlement issues, handling failed payouts, and settlement reconciliation.

## Severity Level
- **Impact**: Major (affects merchant payouts)
- **Duration**: 15-60 minutes depending on task
- **Frequency**: Daily execution (scheduled), 2-3 issue investigations per week
- **Rollback Possible**: Yes (can revert settlement with reconciliation)

---

## Prerequisites
- Database access (SELECT, UPDATE permissions on settlements)
- Admin API credentials
- Access to payment processor payout status
- Accounting team contact for reconciliation
- Settlement manager or VP Finance approval for reversals

## Required Tools
- `psql` - PostgreSQL CLI
- `curl` - API calls
- Payment processor dashboards (Stripe, Paystack)
- Settlement metrics dashboard
- Excel/Google Sheets for reconciliation

---

## Task 1: Manual Settlement Processing

### Use Cases
- Scheduled settlement batch execution (daily/weekly)
- Recovery from failed settlement job
- Manual payout for specific merchant
- Emergency settlement during processor outage

### Prerequisites
- [ ] Settlement date confirmed
- [ ] All transactions for period settled
- [ ] Merchant KYC status verified
- [ ] No disputes/holds on merchant account
- [ ] Backup verified recently

### Procedure

#### Phase 1: Pre-Settlement Verification

**Step 1: Verify settlement configuration**
```sql
-- Check settlement schedule and settings
SELECT
  merchant_id,
  business_name,
  settlement_schedule,
  settlement_day,
  settlement_currency,
  settlement_status,
  last_settlement_date,
  next_settlement_date
FROM merchants
WHERE settlement_schedule = 'daily'
  AND next_settlement_date = CURRENT_DATE;
```

**Expected result:** List of merchants due for settlement today

**Step 2: Verify merchant eligibility**
```sql
-- Check merchant status for settlement holds
SELECT
  merchant_id,
  business_name,
  kyc_status,
  status,
  suspension_reason,
  account_age_days,
  minimum_balance,
  maximum_hold_days
FROM merchants
WHERE id = '<MERCHANT_ID>';
```

**Acceptable to settle:**
- `kyc_status = 'VERIFIED'`
- `status = 'ACTIVE'`
- `suspension_reason IS NULL`
- `account_age_days >= 30` (no new merchant holds)

**Not acceptable to settle:**
- `kyc_status != 'VERIFIED'` - KYC pending/failed
- `status = 'SUSPENDED'` - Merchant suspended
- `suspension_reason` populated - Has active hold
- Active chargebacks on merchant

**Step 3: Calculate settlement amount**
```sql
-- Get all transactions for settlement period
SELECT
  merchant_id,
  COUNT(*) as transaction_count,
  SUM(amount) as gross_amount,
  SUM(fee_amount) as total_fees,
  SUM(amount) - SUM(fee_amount) as net_settlement_amount,
  MIN(created_at) as period_start,
  MAX(created_at) as period_end
FROM transactions
WHERE merchant_id = '<MERCHANT_ID>'
  AND status = 'COMPLETED'
  AND created_at::date BETWEEN CURRENT_DATE - INTERVAL '1 day' AND CURRENT_DATE - INTERVAL '1 second'
GROUP BY merchant_id;
```

**Verify**:
- Transaction count > 0
- Net amount > 0
- Dates aligned with settlement period

**Step 4: Check for holds/reserves**
```sql
-- Check reserve account
SELECT
  merchant_id,
  reserve_amount,
  reserve_reason,
  reserve_until,
  created_at
FROM merchant_reserves
WHERE merchant_id = '<MERCHANT_ID>'
  AND (reserve_until IS NULL OR reserve_until > NOW());
```

**Action if reserves found**:
- If `reserve_reason = 'CHARGEBACK_RISK'`: Escalate to compliance
- If `reserve_reason = 'TESTING'`: Remove reserve if period expired
- If `reserve_reason = 'REGULATORY'`: Hold settlement until reserve lifted

**Step 5: Check for open disputes**
```sql
-- Find open disputes
SELECT
  id,
  merchant_id,
  dispute_status,
  amount,
  created_at
FROM disputes
WHERE merchant_id = '<MERCHANT_ID>'
  AND dispute_status IN ('FILED', 'UNDER_INVESTIGATION', 'AWAITING_EVIDENCE')
  AND created_at > NOW() - INTERVAL '90 days';
```

**Action if disputes found**:
- Hold settlement amount equal to disputed amount
- Settlement continues for undisputed amount

#### Phase 2: Settlement Execution

**Step 6: Create settlement batch**
```sql
-- Create settlement record
INSERT INTO settlements (
  batch_id,
  merchant_id,
  settlement_date,
  gross_amount,
  fee_amount,
  reserve_amount,
  net_amount,
  status,
  settlement_method,
  account_number,
  created_at
) VALUES (
  'SETTLE-' || to_char(NOW(), 'YYYY-MM-DD-HH24-MI-SS'),
  '<MERCHANT_ID>',
  CURRENT_DATE,
  <GROSS_AMOUNT>,
  <FEE_AMOUNT>,
  <RESERVE_AMOUNT>,
  <NET_AMOUNT>,
  'PENDING',
  'ACH',  -- or WIRE, CHECK, etc.
  '<MERCHANT_BANK_ACCOUNT>',
  NOW()
) RETURNING id, batch_id;
```

**Capture:** `settlement_id` and `batch_id` for tracking

**Step 7: Execute payout**
```bash
# Prepare settlement request
SETTLEMENT_ID="<settlement_id>"
MERCHANT_ID="<MERCHANT_ID>"
AMOUNT=<NET_AMOUNT>
BANK_ACCOUNT="<BANK_ACCOUNT>"

# Call settlement API
curl -X POST https://api.fintech.example.com/admin/settlements/process \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -d '{
    "settlement_id": "'$SETTLEMENT_ID'",
    "merchant_id": "'$MERCHANT_ID'",
    "amount": '$AMOUNT',
    "account_number": "'$BANK_ACCOUNT'",
    "settlement_date": "'$(date -u +%Y-%m-%d)'",
    "operator": "'$(whoami)'"
  }' | jq .
```

**Expected response:**
```json
{
  "success": true,
  "settlement_id": "settle_123456",
  "batch_id": "SETTLE-2024-01-15-10-30-45",
  "status": "PROCESSING",
  "amount": 5000.00,
  "processor_reference": "payout_789012",
  "estimated_arrival": "2024-01-17"
}
```

**Step 8: Monitor payout status**
```bash
# Poll payout status every 30 seconds
for i in {1..20}; do
  status=$(curl -s https://api.fintech.example.com/admin/settlements/<SETTLEMENT_ID>/status \
    -H "X-API-Key: $ADMIN_API_KEY" | jq -r '.status')

  echo "[$i/20] Settlement status: $status"

  if [ "$status" = "COMPLETED" ] || [ "$status" = "FAILED" ]; then
    echo "Settlement completed with status: $status"
    break
  fi

  sleep 30
done
```

#### Phase 3: Post-Settlement Verification

**Step 9: Verify settlement success**
```sql
-- Check settlement record
SELECT
  id,
  settlement_id,
  merchant_id,
  status,
  gross_amount,
  net_amount,
  processor_reference,
  created_at,
  completed_at
FROM settlements
WHERE id = '<SETTLEMENT_ID>';
```

**Expected result:**
- `status = 'COMPLETED'`
- `processor_reference` populated
- `completed_at` within last 5 minutes
- `net_amount` matches expectation

**Step 10: Update merchant accounting**
```sql
-- Record settlement in merchant ledger
INSERT INTO merchant_transactions (
  merchant_id,
  settlement_id,
  type,
  amount,
  description,
  created_at
) VALUES (
  '<MERCHANT_ID>',
  '<SETTLEMENT_ID>',
  'SETTLEMENT',
  <NET_AMOUNT>,
  'Daily settlement - ' || '<SETTLEMENT_ID>',
  NOW()
);

-- Verify merchant balance updated
SELECT
  merchant_id,
  settlement_account_balance,
  last_settlement_date,
  next_settlement_date
FROM merchants
WHERE id = '<MERCHANT_ID>';
```

**Step 11: Send merchant notification**
```sql
-- Create settlement completion notification
INSERT INTO notifications (
  merchant_id,
  event_type,
  title,
  message,
  data,
  status,
  created_at
) VALUES (
  '<MERCHANT_ID>',
  'SETTLEMENT_COMPLETED',
  'Settlement Processed',
  'Your daily settlement of $5,000.00 has been processed.',
  jsonb_build_object(
    'settlement_id', '<SETTLEMENT_ID>',
    'amount', <NET_AMOUNT>,
    'estimated_arrival', '2024-01-17'::text,
    'processor_reference', '<PROCESSOR_REF>'::text
  ),
  'PENDING',
  NOW()
);
```

## Verification Checklist
- [ ] Merchant eligible for settlement
- [ ] No active disputes holding settlement
- [ ] No reserves/holds blocking merchant
- [ ] Settlement amount calculated correctly
- [ ] Payout API call successful
- [ ] Settlement status COMPLETED
- [ ] Processor reference provided
- [ ] Merchant ledger updated
- [ ] Notification sent to merchant
- [ ] Dashboard shows settlement in list
- [ ] Accounting reconciliation complete

---

## Task 2: Failed Settlement Recovery

### Use Cases
- Settlement payout failed (insufficient balance, invalid account)
- Processor returned error
- Settlement stuck in PROCESSING for >1 hour
- Merchant account number changed

### Prerequisites
- Identify which settlement failed
- Verify actual funds status (did bank debit happen?)
- Merchant contacted and issue investigated

### Procedure

**Step 1: Check settlement status**
```sql
SELECT
  id,
  settlement_id,
  merchant_id,
  status,
  error_code,
  error_message,
  net_amount,
  created_at,
  completed_at
FROM settlements
WHERE id = '<SETTLEMENT_ID>';
```

**Status analysis**:
- `FAILED` with `error_code = 'INVALID_ACCOUNT'`: Update merchant bank account
- `FAILED` with `error_code = 'INSUFFICIENT_FUNDS'`: Contact payment processor
- `PROCESSING` for >1 hour: Check processor status or retry

**Step 2: Verify funds in escrow account**
```sql
-- Check escrow account balance
SELECT
  currency,
  balance,
  held_for_settlement,
  available_for_settlement,
  last_updated
FROM escrow_accounts
WHERE type = 'MERCHANT_SETTLEMENT';
```

**Step 3: Check processor payout history**
```bash
# Check payout status with payment processor
# Example: Stripe
curl https://api.stripe.com/v1/payouts/<PAYOUT_ID> \
  -u $STRIPE_API_KEY: | jq .
```

**Possible results**:
- `status: "paid"` - Payout succeeded at processor, update DB
- `status: "pending"` - Still processing, wait 24 hours
- `status: "failed"` - Payout failed, needs manual review
- Not found - Payout ID wrong or expired

**Step 4: Handle failed settlement**

**Option A: Update Bank Account & Retry**
```sql
-- Update merchant bank account
UPDATE merchants
SET settlement_account_number = '<NEW_ACCOUNT_NUMBER>',
    settlement_account_name = '<ACCOUNT_HOLDER>',
    settlement_account_bank = '<BANK_NAME>',
    updated_at = NOW()
WHERE id = '<MERCHANT_ID>';

-- Retry settlement
UPDATE settlements
SET status = 'PENDING_RETRY',
    retry_count = retry_count + 1,
    error_code = NULL,
    error_message = NULL,
    updated_at = NOW()
WHERE id = '<SETTLEMENT_ID>';
```

**Option B: Void Settlement & Create New One**
```sql
-- Void failed settlement
UPDATE settlements
SET status = 'VOIDED',
    void_reason = 'INVALID_ACCOUNT_RETRY_PENDING',
    voided_at = NOW(),
    voided_by = current_user,
    updated_at = NOW()
WHERE id = '<SETTLEMENT_ID>';

-- Funds automatically re-queued for next settlement
-- No manual action needed, will retry next day
```

**Option C: Manual Transfer (Last Resort)**
```sql
-- If automated settlement permanently broken, manual transfer may be needed
-- Requires VP Finance approval and careful documentation

INSERT INTO manual_settlements (
  merchant_id,
  amount,
  reason,
  approval_ticket,
  approved_by,
  approved_at,
  status,
  created_at
) VALUES (
  '<MERCHANT_ID>',
  <AMOUNT>,
  'Manual settlement due to failed automated payout: SETTLE-123',
  'FIN-12345',
  'vp.finance@fintech.example.com',
  NOW(),
  'APPROVED',
  NOW()
);
```

---

## Task 3: Settlement Reconciliation

### Use Cases
- Daily reconciliation of settlements vs actual payouts
- Monthly reconciliation against bank statements
- Investigating discrepancies
- Audit trail verification

### Prerequisites
- All settlements completed for period
- Bank statement available
- Accounting team coordinated

### Procedure

**Step 1: Extract settlement data from platform**
```sql
-- Get all settlements for day
SELECT
  settlement_id,
  merchant_id,
  merchant.business_name,
  status,
  net_amount,
  processor_reference,
  created_at,
  completed_at
FROM settlements s
LEFT JOIN merchants m ON s.merchant_id = m.id
WHERE created_at::date = CURRENT_DATE - INTERVAL '1 day'
  AND status = 'COMPLETED'
ORDER BY created_at;

-- Export to CSV
\copy (SELECT settlement_id, merchant_id, business_name, net_amount, processor_reference, completed_at FROM ...) To '/tmp/settlements_export.csv' WITH CSV HEADER;
```

**Step 2: Extract payout data from processor**
```bash
# Stripe example
curl https://api.stripe.com/v1/payouts \
  -u $STRIPE_API_KEY: \
  -d "created[gte]=$(date -d 'yesterday' +%s)" \
  -d "created[lt]=$(date +%s)" \
  -d "limit=100" | jq '.data[] | {id, amount, status, arrival_date}' > /tmp/stripe_payouts.json
```

**Step 3: Reconcile amounts**
```sql
-- Compare settlements to expected amounts
WITH expected_settlements AS (
  SELECT
    merchant_id,
    SUM(net_amount) as total_expected
  FROM settlements
  WHERE created_at::date = CURRENT_DATE - INTERVAL '1 day'
    AND status = 'COMPLETED'
  GROUP BY merchant_id
),
actual_payouts AS (
  SELECT
    merchant_id,
    SUM(amount) as total_paid
  FROM payout_log
  WHERE payout_date = CURRENT_DATE - INTERVAL '1 day'
    AND status = 'SUCCESS'
  GROUP BY merchant_id
)
SELECT
  es.merchant_id,
  COALESCE(es.total_expected, 0) as expected,
  COALESCE(ap.total_paid, 0) as actual,
  COALESCE(es.total_expected, 0) - COALESCE(ap.total_paid, 0) as variance,
  CASE
    WHEN COALESCE(es.total_expected, 0) = COALESCE(ap.total_paid, 0) THEN '✅ Match'
    ELSE '❌ Variance'
  END as status
FROM expected_settlements es
FULL OUTER JOIN actual_payouts ap ON es.merchant_id = ap.merchant_id
WHERE COALESCE(es.total_expected, 0) != COALESCE(ap.total_paid, 0);
```

**Step 4: Investigate variances**
```sql
-- Find which settlements weren't paid
SELECT
  s.settlement_id,
  s.merchant_id,
  s.net_amount,
  s.processor_reference,
  s.status,
  p.payout_id,
  p.status as payout_status,
  p.failure_reason
FROM settlements s
LEFT JOIN payout_log p ON s.processor_reference = p.settlement_reference
WHERE s.created_at::date = CURRENT_DATE - INTERVAL '1 day'
  AND s.status = 'COMPLETED'
  AND p.status IS NULL;
```

**Possible causes**:
- Settlement not yet processed by processor (waiting on batch)
- Processor reference mismatch in system
- Settlement created but never sent to processor
- Bank transfer pending (will show in next day)

**Step 5: Create reconciliation report**
```bash
cat > /tmp/settlement_reconciliation_$(date +%Y%m%d).txt << EOF
Settlement Reconciliation Report
Date: $(date -d 'yesterday' +%Y-%m-%d)
Generated: $(date)

SUMMARY:
========
Total Settlements Processed: $(psql -d fintech -tc "SELECT COUNT(*) FROM settlements WHERE created_at::date = CURRENT_DATE - INTERVAL '1 day' AND status = 'COMPLETED';")
Total Amount Settled: $(psql -d fintech -tc "SELECT SUM(net_amount) FROM settlements WHERE created_at::date = CURRENT_DATE - INTERVAL '1 day' AND status = 'COMPLETED';")
Total Payouts Received: $(wc -l < /tmp/stripe_payouts.json)
Variance: $0.00

STATUS: ✅ RECONCILED
EOF

cat /tmp/settlement_reconciliation_$(date +%Y%m%d).txt
```

---

## Task 4: Chargeback & Reversal Handling

### Use Cases
- Merchant disputes a settled transaction (claiming it was their error)
- Customer initiates chargeback through bank
- Payment processor reverses a payout
- Merchant requests refund after settlement

### Prerequisites
- Original settlement already completed
- Documentation of transaction and reason
- Customer/merchant written request
- Approval from VP Finance

### Procedure

**Step 1: Identify affected settlement**
```sql
-- Find settlement containing transaction
SELECT
  s.id,
  s.settlement_id,
  s.merchant_id,
  s.net_amount,
  s.status,
  t.transaction_id,
  t.amount,
  t.status as transaction_status
FROM settlements s
JOIN settlement_items si ON s.id = si.settlement_id
JOIN transactions t ON si.transaction_id = t.id
WHERE t.transaction_id = '<TRANSACTION_ID>';
```

**Step 2: Check if reversal possible**
```sql
-- Check settlement age (reversals only valid for recent settlements)
SELECT
  id,
  settlement_id,
  completed_at,
  NOW() - completed_at::timestamp as age,
  CASE
    WHEN NOW() - completed_at::timestamp <= INTERVAL '30 days' THEN 'Can reverse'
    ELSE 'Too old to reverse'
  END as reversibility
FROM settlements
WHERE id = '<SETTLEMENT_ID>';
```

**Acceptance criteria**:
- Settlement completed within last 30 days
- Payout has been received by merchant (not pending)
- Reversal request has valid reason and documentation

**Step 3: Create reversal transaction**
```sql
-- Create chargeback/reversal record
INSERT INTO chargebacks (
  settlement_id,
  transaction_id,
  merchant_id,
  amount,
  reason,
  chargeback_type,
  status,
  evidence_required,
  deadline,
  created_at
) VALUES (
  '<SETTLEMENT_ID>',
  '<TRANSACTION_ID>',
  '<MERCHANT_ID>',
  <AMOUNT>,
  'MERCHANT_REQUEST_REVERSAL',
  'REVERSAL',
  'FILED',
  false,
  NOW() + INTERVAL '45 days',
  NOW()
) RETURNING id;
```

**Step 4: Reverse settlement**
```bash
# Call reversal API
curl -X POST https://api.fintech.example.com/admin/settlements/<SETTLEMENT_ID>/reverse \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -d '{
    "reversal_reason": "MERCHANT_REQUEST",
    "chargeback_id": "'<CHARGEBACK_ID>'",
    "amount": '$AMOUNT',
    "ticket": "FIN-12345",
    "approved_by": "vp.finance@fintech.example.com"
  }' | jq .
```

**Step 5: Initiate refund to merchant**
```sql
-- Create refund queue entry
INSERT INTO refund_queue (
  settlement_id,
  merchant_id,
  amount,
  reason,
  status,
  priority,
  created_at
) VALUES (
  '<SETTLEMENT_ID>',
  '<MERCHANT_ID>',
  <AMOUNT>,
  'SETTLEMENT_REVERSAL',
  'PENDING',
  'HIGH',
  NOW()
);

-- Refund will be processed in next settlement cycle
-- Or can be expedited if urgent
```

---

## Common Issues & Troubleshooting

### Issue 1: "Settlement Amount Mismatch"
**Symptom**: Settlement shows different amount than transactions

**Cause**: Reserve, dispute, or fee calculation changed after settlement created

**Solution**:
1. Query transactions for settlement period
2. Manually calculate gross + fees
3. Check for disputes/reserves applied
4. If calculation wrong: Create adjustment settlement
5. If calculation right: Investigate why settlement used different amount

---

### Issue 2: "Bank Account Rejected"
**Symptom**: Payout fails with "invalid account"

**Cause**: Merchant provided wrong account number, account closed, etc.

**Solution**:
1. Contact merchant for correct account information
2. Update merchant account in database
3. Request merchant re-verify account (KYC)
4. Retry settlement with new account
5. If still fails, hold settlement pending further investigation

---

### Issue 3: "Settlement Pending for Days"
**Symptom**: Settlement stuck in PROCESSING for >48 hours

**Cause**: Processor delayed, network issue, or system bug

**Solution**:
1. Check processor status page
2. Query settlement status: `SELECT status FROM settlements WHERE id = '<ID>';`
3. Check processor logs with support
4. Options:
   - If processor confirms success: Update DB status manually
   - If processor confirms failure: Retry settlement
   - If processor unknown: Wait 24 more hours, then escalate

---

## Verification Checklist
- [ ] All settlements completed successfully
- [ ] Amounts match expected calculations
- [ ] No disputes or holds blocking settlements
- [ ] Bank payouts received and reconciled
- [ ] Merchant notifications sent
- [ ] No outstanding variances
- [ ] Accounting records updated
- [ ] Audit trail complete

---

## Rollback Procedure

**If settlement reversal needed:**

1. Verify merchant request legitimate and approved
2. Check settlement age (must be <30 days)
3. Create reversal transaction as per Task 4
4. Fund returned to merchant in next settlement cycle
5. Document reason in audit trail
6. Notify merchant of reversal
7. Update accounting records

**If reversal not possible** (>30 days old):
- Only option is manual refund/adjustment settlement
- Requires VP Finance approval
- Must be authorized before execution

---

## Related Runbooks
- [RUNBOOK_PAYMENT_PROCESSING.md](./RUNBOOK_PAYMENT_PROCESSING.md) - Payment operations
- [RUNBOOK_MERCHANT_OPERATIONS.md](./RUNBOOK_MERCHANT_OPERATIONS.md) - Merchant management
- [INCIDENT_RESPONSE_GUIDE.md](./INCIDENT_RESPONSE_GUIDE.md) - Handling settlement outages

---

## Last Updated
2024-01-15 by Settlement Operations Team

## Owner
Finance Operations Team | Contact: finance@fintech.example.com

