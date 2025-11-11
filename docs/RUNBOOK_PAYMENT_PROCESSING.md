# Runbook: Payment Processing Operations

## Overview
Procedures for managing, troubleshooting, and manually processing payments in the Ubiquitous Tribble platform. Covers manual payment creation, payment retry/replay, idempotency key management, and transaction state corrections.

## Severity Level
- **Impact**: Major (affects customer transactions)
- **Duration**: 5-30 minutes depending on task
- **Frequency**: 2-3 times per month
- **Rollback Possible**: Yes (with data restoration)

---

## Prerequisites
- Database access (SELECT, UPDATE permissions)
- Admin API credentials
- Monitoring dashboard access
- At least 2 hours in production experience
- Approval from Payment Team Lead for transaction modifications

## Required Tools
- `psql` - PostgreSQL CLI for direct database queries
- `curl` or Postman - API testing
- `jq` - JSON query tool
- Admin dashboard - https://admin.fintech.example.com
- Slack notifications for team alignment

---

## Task 1: Manual Payment Processing

### Use Cases
- Recovery from payment processor outage
- Customer-requested manual payment
- Bulk payment processing for merchant
- Testing payment workflow in production (limited)

### Prerequisites
- [ ] Customer transaction verified in system
- [ ] Payment amount confirmed with customer
- [ ] Merchant has sufficient credit
- [ ] No duplicate payment exists
- [ ] Reason for manual processing documented in Slack thread

### Step-by-Step Procedure

#### Phase 1: Preparation & Verification

**Step 1: Verify the transaction exists and its current state**
```sql
-- Query to find transaction
SELECT
  id,
  user_id,
  merchant_id,
  amount,
  currency,
  status,
  payment_method,
  created_at,
  updated_at
FROM transactions
WHERE id = '<TRANSACTION_ID>' OR idempotency_key = '<IDEMPOTENCY_KEY>';
```

**Expected result:** Transaction found in one of these states:
- `PENDING` - Not yet processed
- `FAILED` - Previous attempt failed
- `PROCESSING` - Still being processed (wait before retrying)

**Error handling:**
- If not found: Check spelling, user might be using different transaction
- If `COMPLETED`: Transaction already successful, no action needed
- If `PROCESSING` > 5 minutes: Contact payment processor support

**Step 2: Verify customer wallet has sufficient balance**
```sql
-- Check wallet balance
SELECT
  wallet_id,
  currency,
  balance,
  available_balance,
  reserved_amount
FROM wallets
WHERE user_id = '<USER_ID>' AND currency = '<CURRENCY>';
```

**Expected result:** `available_balance >= transaction_amount`

**Error handling:**
- If balance insufficient: Provide customer with wallet top-up instructions
- If wallet not found: Create wallet (see RUNBOOK_MERCHANT_OPERATIONS.md)
- If reserved_amount is high: Check for pending transactions blocking funds

**Step 3: Verify merchant configuration**
```sql
-- Check merchant status and fees
SELECT
  id,
  business_name,
  status,
  kyc_status,
  transaction_fee_bps,
  fixed_fee,
  settlement_currency
FROM merchants
WHERE id = '<MERCHANT_ID>';
```

**Expected result:**
- `status = 'ACTIVE'`
- `kyc_status = 'VERIFIED'`
- Fee structure defined

**Error handling:**
- If merchant inactive: Cannot process payments, notify merchant
- If KYC pending: Escalate to compliance team

**Step 4: Check for duplicate payments**
```sql
-- Check for existing successful payments
SELECT
  id,
  amount,
  status,
  created_at
FROM transactions
WHERE user_id = '<USER_ID>'
  AND merchant_id = '<MERCHANT_ID>'
  AND amount = <AMOUNT>
  AND status = 'COMPLETED'
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

**Expected result:** No results (no duplicate)

**Error handling:**
- If duplicate found: Stop, inform customer payment already processed
- If multiple duplicates: Escalate to Data team for investigation

#### Phase 2: Payment Execution

**Step 5: Prepare payment request with unique idempotency key**
```bash
# Generate unique idempotency key (must be UUID)
IDEMPOTENCY_KEY=$(uuidgen)
echo "Generated idempotency key: $IDEMPOTENCY_KEY"

# Document in Slack for team visibility
curl -X POST https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK \
  -d '{"text":"Processing manual payment: TXN-123456, IKey: '$IDEMPOTENCY_KEY'"}'
```

**Critical:** Idempotency key ensures we don't double-charge if request retried

**Step 6: Execute payment via admin API**
```bash
# Set environment variables
ADMIN_API_KEY="<YOUR_ADMIN_API_KEY>"
TRANSACTION_ID="<TRANSACTION_ID>"
MERCHANT_ID="<MERCHANT_ID>"
AMOUNT=<AMOUNT_IN_CENTS>
CURRENCY="USD"

# Create payment request with proper signing
curl -X POST https://api.fintech.example.com/admin/payments/process \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -H "X-Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{
    "transaction_id": "'$TRANSACTION_ID'",
    "merchant_id": "'$MERCHANT_ID'",
    "amount": '$AMOUNT',
    "currency": "'$CURRENCY'",
    "reason": "MANUAL_PROCESSING",
    "operator": "'$(whoami)'",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq .
```

**Expected response:**
```json
{
  "success": true,
  "transaction_id": "txn_123456",
  "status": "COMPLETED",
  "timestamp": "2024-01-15T10:30:00Z",
  "processor_reference": "proc_789012"
}
```

**Error handling:**
- `401 Unauthorized`: Check API key validity
- `429 Too Many Requests`: Wait 60 seconds, retry
- `500 Server Error`: Check service health, investigate logs
- `amount_mismatch`: Verify amount in request matches database

#### Phase 3: Verification

**Step 7: Verify payment success in database**
```sql
-- Verify transaction updated
SELECT
  id,
  status,
  processor_reference,
  processed_at,
  updated_at
FROM transactions
WHERE id = '<TRANSACTION_ID>';
```

**Expected result:**
- `status = 'COMPLETED'`
- `processor_reference` populated
- `processed_at` within last 5 minutes

**Step 8: Verify wallet was debited**
```sql
-- Check wallet transaction ledger
SELECT
  transaction_id,
  wallet_id,
  type,
  amount,
  running_balance,
  created_at
FROM wallet_transactions
WHERE transaction_id = '<TRANSACTION_ID>'
ORDER BY created_at DESC;
```

**Expected result:** Two entries:
1. DEBIT from customer wallet (negative amount)
2. CREDIT to merchant settlement account (positive amount - fees)

**Step 9: Verify merchant settlement queue updated**
```sql
-- Check settlement queue
SELECT
  id,
  merchant_id,
  amount,
  fee,
  net_amount,
  status,
  created_at
FROM settlement_items
WHERE merchant_id = '<MERCHANT_ID>'
  AND transaction_id = '<TRANSACTION_ID>';
```

**Expected result:**
- Entry created with `status = 'PENDING'`
- `net_amount = amount - fee`

**Step 10: Check payment notifications sent**
```sql
-- Verify notification delivery
SELECT
  id,
  user_id,
  event_type,
  status,
  attempts,
  last_attempt_at
FROM notifications
WHERE transaction_id = '<TRANSACTION_ID>'
ORDER BY created_at DESC;
```

**Expected result:**
- `PAYMENT_COMPLETED` event created
- `status = 'DELIVERED'`
- Sent within 2 minutes of payment

## Verification Checklist
- [ ] Transaction found in PENDING or FAILED state
- [ ] Customer wallet has sufficient balance
- [ ] Merchant is ACTIVE and VERIFIED
- [ ] No duplicate payment exists
- [ ] API call succeeded with 200 status
- [ ] Transaction status changed to COMPLETED
- [ ] Wallet ledger shows both DEBIT and CREDIT
- [ ] Settlement item created with correct net amount
- [ ] Notification marked as DELIVERED
- [ ] Dashboard shows payment in transaction list
- [ ] Ran smoke test (customer can view receipt)

## Rollback Procedure

**If payment was processed incorrectly:**

**Step 1: Stop notifications**
```sql
UPDATE notifications
SET status = 'CANCELLED'
WHERE transaction_id = '<TRANSACTION_ID>' AND status != 'DELIVERED';
```

**Step 2: Create reversal transaction**
```sql
-- Create reversal (creates CREDIT to customer wallet)
INSERT INTO transactions (
  user_id,
  merchant_id,
  amount,
  currency,
  status,
  payment_method,
  type,
  original_transaction_id,
  reason,
  created_at
) VALUES (
  '<USER_ID>',
  '<MERCHANT_ID>',
  <AMOUNT>,  -- Positive for refund
  '<CURRENCY>',
  'COMPLETED',
  'REVERSAL',
  'REFUND',
  '<ORIGINAL_TXN_ID>',
  'MANUAL_REVERSAL - Operator: '||current_user||' - Reason: <REASON>',
  NOW()
);
```

**Step 3: Verify reversal in wallet**
```sql
-- Verify customer received refund
SELECT SUM(amount) as net_change
FROM wallet_transactions
WHERE wallet_id = '<WALLET_ID>'
  AND transaction_id IN ('<ORIGINAL_TXN_ID>', '<REVERSAL_TXN_ID>');
```

**Expected result:** `net_change = 0` (original charge reversed)

**Step 4: Notify customer and merchant**
```bash
# Slack notification
curl -X POST https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK \
  -d '{
    "text": "⚠️ Payment reversal completed",
    "blocks": [
      {"type": "section", "text": {"type": "mrkdwn", "text": "*Transaction:* TXN-123456\n*Reason:* Incorrect merchant ID\n*Reversal TXN:* REV-123456"}}
    ]
  }'

# Send customer notification
psql fintech -c "
  INSERT INTO notifications (user_id, event_type, data, status)
  VALUES ('<USER_ID>', 'PAYMENT_REVERSED', '{\"reason\": \"Incorrect processing\"}', 'PENDING');
"
```

## Estimated Time
- **Full verification**: 5-10 minutes
- **Payment execution**: 1-2 minutes
- **Verification**: 3-5 minutes
- **Communication**: 2-3 minutes
- **Total**: 11-20 minutes

## Risk Assessment
- **Risk Level**: Medium
- **Customer Impact**: High if wrong merchant/amount
- **Data Risk**: Medium (permanent transaction record)

### Mitigation
- Always verify transaction ID and amount twice
- Use read-only queries before making changes
- Maintain idempotency keys to prevent double-processing
- Document every manual payment in ticket system
- Have second operator verify for large amounts (>$1000)
- All changes logged to audit table with operator ID

---

## Task 2: Payment Retry/Replay

### Use Cases
- Customer requests retry after declined card
- Payment processor had transient failure
- Network timeout that left transaction in PROCESSING state
- Test retry logic in production

### Prerequisites
- Transaction in FAILED or PROCESSING state (>10 minutes)
- Customer has confirmed they want retry
- Original payment method still valid OR new payment method provided

### Procedure

**Step 1: Check retry eligibility**
```sql
SELECT
  id,
  status,
  retry_count,
  last_retry_at,
  error_code,
  error_message,
  created_at
FROM transactions
WHERE id = '<TRANSACTION_ID>';
```

**Acceptable to retry:**
- `status = 'FAILED'` with `retry_count < 3`
- `status = 'PROCESSING'` and last attempted > 10 minutes ago

**Not acceptable:**
- `status = 'COMPLETED'` - Already processed
- `retry_count >= 3` - Too many attempts, contact support
- `error_code = 'INSUFFICIENT_FUNDS'` - Won't work until balance updated

**Step 2: Increment retry counter and attempt payment**
```sql
-- Update retry attempt
UPDATE transactions
SET
  retry_count = retry_count + 1,
  status = 'PROCESSING',
  last_retry_at = NOW()
WHERE id = '<TRANSACTION_ID>';
```

**Step 3: Execute payment retry via API**
```bash
curl -X POST https://api.fintech.example.com/admin/payments/<TRANSACTION_ID>/retry \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -d '{
    "attempt_number": 2,
    "reason": "CUSTOMER_REQUESTED_RETRY",
    "operator": "'$(whoami)'"
  }' | jq .
```

**Step 4: Monitor retry execution**
```bash
# Poll transaction status (every 5 seconds for up to 2 minutes)
for i in {1..24}; do
  status=$(psql -d fintech -tc "SELECT status FROM transactions WHERE id = '<TRANSACTION_ID>';")
  echo "[$i/24] Transaction status: $status"

  if [ "$status" = "COMPLETED" ] || [ "$status" = "FAILED" ]; then
    echo "Retry completed with status: $status"
    break
  fi

  sleep 5
done
```

**Step 5: Verify final outcome**
```sql
SELECT
  id,
  status,
  retry_count,
  error_code,
  processor_reference,
  updated_at
FROM transactions
WHERE id = '<TRANSACTION_ID>';
```

- If `COMPLETED`: Success, follow verification steps from Task 1
- If `FAILED`: Review error_code, escalate if needed
- If still `PROCESSING`: Payment processor may be slow, wait 5 more minutes

---

## Task 3: Idempotency Key Management

### Use Cases
- Recovering from request timeout where status unknown
- Reprocessing a payment that may or may not have been processed
- Migrating payments from old system

### Procedure

**Step 1: Generate/retrieve idempotency key**
```bash
# For NEW payments, generate unique UUID
NEW_IDEMPOTENCY_KEY=$(uuidgen)

# For EXISTING payments, find original key
ORIGINAL_KEY=$(psql -d fintech -tc "
  SELECT idempotency_key FROM transactions
  WHERE id = '<TRANSACTION_ID>'
  LIMIT 1;
")
echo "Original idempotency key: $ORIGINAL_KEY"
```

**Step 2: Lookup any previous processing with this key**
```sql
SELECT
  id,
  status,
  amount,
  processor_reference,
  created_at,
  completed_at
FROM transactions
WHERE idempotency_key = '<IDEMPOTENCY_KEY>'
ORDER BY created_at DESC;
```

**Results interpretation:**
- **No result**: First attempt with this key, safe to process
- **One COMPLETED**: Already successful, don't process again
- **One FAILED**: Can retry with same key (idempotent)
- **Multiple entries**: Data corruption, escalate to engineering

**Step 3: Verify payment request with retrieved key**
```bash
# If key already used, API should detect and return previous result
curl -X POST https://api.fintech.example.com/payments \
  -H "X-Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '...' | jq .
```

**Expected behavior:**
- Same request + same key = same response (even if called 10 times)
- Payment only charged once to customer
- Database automatically uses first successful result

---

## Task 4: Transaction State Correction

### Use Cases
- Manual state fix after system crash
- Customer dispute resolution
- Correcting transaction created with wrong status
- Reconciliation of missed transactions

### Prerequisites
- **REQUIRES**: Payment Team Lead approval + ticket reference
- **AUDIT TRAIL**: All state changes logged with reason
- **CUSTOMER NOTIFIED**: Before any corrections

### DANGEROUS - Use with extreme caution

**Step 1: Get approval**
```
Before making ANY state change:
1. Create ticket with detailed reason
2. Get approval from Payment Team Lead (sign-off required)
3. Notify customer of planned correction
4. Screenshot current state for audit trail
```

**Step 2: Document original state**
```sql
-- Save original transaction state
SELECT * FROM transactions WHERE id = '<TRANSACTION_ID>' \G
```

**Step 3: Perform state correction**
```sql
-- EXAMPLE: Fix transaction stuck in PROCESSING
UPDATE transactions
SET
  status = 'COMPLETED',
  processor_reference = '<MANUALLY_PROVIDED_REFERENCE>',
  processed_at = NOW(),
  updated_at = NOW(),
  metadata = jsonb_set(metadata, '{correction}', '{"reason": "MANUAL_FIX", "ticket": "PAY-12345", "operator": "'$(whoami)'", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}')
WHERE id = '<TRANSACTION_ID>';

-- Verify change
SELECT id, status, metadata->>'correction' FROM transactions WHERE id = '<TRANSACTION_ID>';
```

**Step 4: Create audit log entry**
```sql
INSERT INTO transaction_corrections (
  transaction_id,
  previous_state,
  new_state,
  reason,
  operator,
  ticket_id,
  created_at
) VALUES (
  '<TRANSACTION_ID>',
  'PROCESSING',
  'COMPLETED',
  'MANUAL_CORRECTION',
  current_user,
  'PAY-12345',
  NOW()
);
```

**Step 5: Notify stakeholders**
```bash
# Update Slack
curl -X POST https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK \
  -d '{
    "text": "🔧 Manual transaction correction",
    "blocks": [
      {"type": "section", "text": {"type": "mrkdwn", "text": "*TXN:* TXN-123456\n*Change:* PROCESSING → COMPLETED\n*Ticket:* PAY-12345\n*Operator:* '$(whoami)'"}}
    ]
  }'
```

---

## Common Issues & Troubleshooting

### Issue 1: "Insufficient Funds" Error
**Symptom**: Payment fails with `insufficient_funds` error code

**Cause**: Customer wallet doesn't have enough balance available

**Solution**:
1. Check wallet balance: `SELECT available_balance FROM wallets WHERE user_id = '<USER_ID>';`
2. If low, customer must fund account
3. Check for reserved amounts: `SELECT reserved_amount FROM wallets WHERE user_id = '<USER_ID>';`
4. If high reserved amount, there may be pending transactions blocking funds

**Prevention**: Implement wallet balance verification before allowing payment

---

### Issue 2: "Duplicate Payment Detected"
**Symptom**: API returns `duplicate_payment` error on retry

**Cause**: Same idempotency key already used, payment already processed

**Solution**:
1. This is CORRECT behavior (idempotency working)
2. Query with idempotency key to find original transaction
3. Confirm original transaction completed successfully
4. Inform customer payment already received

**Prevention**: N/A - idempotency is working as designed

---

### Issue 3: "Payment Processor Unavailable"
**Symptom**: Payment stuck in PROCESSING for >10 minutes, payment processor down

**Cause**: External payment processor timeout or temporary unavailability

**Solution**:
1. Check payment processor status: https://status.stripe.example.com
2. If processor down: Wait 5 minutes before retrying
3. If specific merchant blocked: Contact processor support with merchant ID
4. Enable backup payment processor if available

**Prevention**:
- Monitor payment processor health proactively
- Implement circuit breaker pattern
- Have backup processor configured
- Page on-call if processor unavailable >5 minutes

---

### Issue 4: "Race Condition - Concurrent Payments"
**Symptom**: Customer charged twice for same transaction

**Cause**: Concurrent API requests with different idempotency keys

**Solution**:
1. This is customer's fault (double-clicking submit button)
2. Create refund for duplicate charge (see Rollback Procedure)
3. Contact payment processor for chargeback prevention
4. Offer customer service credit for inconvenience

**Prevention**:
- Client-side: Disable submit button after click
- Server-side: Rate limiting on payments per user
- Monitor for patterns of duplicate charges

---

## Historical Execution Log
| Date | Operator | Task | Duration | Status | Notes |
|------|----------|------|----------|--------|-------|
| 2024-01-15 | john.doe | Manual payment | 15m | Success | Customer email validation issue, payment successfully reprocessed |
| 2024-01-10 | jane.smith | Payment retry | 8m | Success | Card declined on first attempt, retry succeeded |
| 2024-01-05 | bob.jones | Duplicate payment reversal | 20m | Success | Customer double-clicked, reversal processed and refunded |

---

## Last Updated
2024-01-15 by Payment Operations Team

## Owner
Payment Operations Team | Contact: payments@fintech.example.com

---

## See Also
- [INCIDENT_RESPONSE_GUIDE.md](./INCIDENT_RESPONSE_GUIDE.md) - Handling payment outages
- [RUNBOOK_SETTLEMENT.md](./RUNBOOK_SETTLEMENT.md) - Settlement operations
- [Payment API Documentation](./API_REFERENCE.md#payments) - Payment endpoints

