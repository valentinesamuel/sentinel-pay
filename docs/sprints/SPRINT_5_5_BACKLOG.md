# Sprint 5.5: Card Tokenization & Stored Payment Methods

**Sprint Goal:** Implement secure card tokenization workflow enabling customers to save cards for future payments, recurring billing, and POS integration without storing sensitive card data.

**Duration:** 1 week (7 days)
**Story Points:** 32 SP
**Team:** 2 Backend Engineers + 1 Security Engineer
**Dependencies:** Sprint 5 (Card payments working), Sprint 3.5 (Request/response signing)
**Blocks:** Sprint 6 (Withdrawals - uses saved methods), Sprint 40 (POS - uses tokenized cards)

---

## User Stories

### US-5.5.1: Card Tokenization Workflow (12 SP)

**Title:** Implement secure card tokenization using payment provider tokens

**Description:**
Create a workflow to securely tokenize payment cards using Paystack's tokenization service. Tokens allow customers to make future payments without re-entering card details, while keeping the actual card data secure at Paystack.

**Acceptance Criteria:**
1. Tokenize cards during payment initialization (if "save for future use" flag is set)
2. Return permanent token from Paystack that can be used for future charges
3. Store encrypted token reference in database (not actual token)
4. Support one-time and recurring token usage
5. Tokens created for same card return same token (Paystack guarantees this)
6. Token expiration tracking (align with card expiration)
7. Soft delete tokens (don't actually delete, mark inactive)
8. Token metadata: card brand, last 4 digits, expiration date
9. Support both new cards and previously tokenized cards
10. PCI DSS Level 1 compliance (no raw card data touches our system)
11. Clear user feedback when token is created/used
12. Token lifecycle: active → expiring → expired → revoked
13. Token usage audit trail
14. Support for multiple tokens per user (saved cards)
15. Token reuse detection (prevent saving duplicate cards)

**Technical Specs:**
```typescript
// Tokenization request
interface CardTokenizationRequest {
  cardNumber: string;        // Encrypted in transit
  expiryMonth: number;
  expiryYear: number;
  cvv: string;               // Encrypted, not stored
  cardholderName: string;
  saveForFuture: boolean;    // Create persistent token
  recurring?: boolean;       // For recurring payments
}

// Token response
interface TokenizedCard {
  id: string;                      // Our internal ID
  paymentMethodId: string;         // Paystack token
  userToken: string;               // Token sent to client (different from storage)
  brand: 'visa' | 'mastercard' | 'amex' | string;
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  status: 'active' | 'expiring' | 'expired' | 'revoked';
  createdAt: Date;
  expiresAt: Date;
  usageCount: number;
}

// Use tokenized card for payment
interface PaymentWithTokenRequest {
  cardTokenId: string;       // Our internal ID
  amount: number;
  description: string;
}
```

**Database Schema Changes:**
```sql
-- Tokenized cards (saved payment methods)
CREATE TABLE tokenized_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paystack_token TEXT NOT NULL UNIQUE,  -- Encrypted
  user_visible_token VARCHAR(50),       -- For client-side display
  brand VARCHAR(50),                    -- visa, mastercard, amex
  last_four_digits VARCHAR(4),
  expiry_month INT,
  expiry_year INT,
  status VARCHAR(20) DEFAULT 'active',  -- active, expiring, expired, revoked
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  revoked_reason VARCHAR(100)
);

-- Token usage audit trail
CREATE TABLE tokenized_card_usage (
  id BIGSERIAL PRIMARY KEY,
  tokenized_card_id UUID NOT NULL REFERENCES tokenized_cards(id),
  user_id UUID NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  action VARCHAR(50),  -- used, charged, failed
  amount DECIMAL(15, 2),
  status VARCHAR(20),  -- success, failed
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tokenized_cards_user ON tokenized_cards(user_id, status);
CREATE INDEX idx_tokenized_card_usage_card ON tokenized_card_usage(tokenized_card_id, created_at DESC);
CREATE INDEX idx_tokenized_card_usage_user ON tokenized_card_usage(user_id, created_at DESC);
```

**Estimated Effort:** 12 SP
- Paystack integration: 4 SP
- Token storage/encryption: 3 SP
- Token lifecycle management: 3 SP
- Testing & security validation: 2 SP

---

### US-5.5.2: Stored Payment Methods Management (8 SP)

**Title:** Provide APIs for customers to manage their saved cards

**Description:**
Create endpoints for users to view, update, and delete their saved payment methods. Users can mark default cards, view usage history, and manage card expiration updates.

**Acceptance Criteria:**
1. List all saved cards for user (with expiration status)
2. Delete/revoke saved card (soft delete with audit trail)
3. Set default card for future payments
4. Update card metadata (nickname, preferred name)
5. View card usage history (last 50 transactions)
6. Automatic expiration marking as card expiry date approaches
7. Prompt user when card about to expire (30 days before)
8. Support for card replacement (move to new card same user)
9. Bulk delete old/expired cards (admin action)
10. Export saved cards list (for user backup)
11. Encryption of sensitive token data in logs
12. Rate limiting for list/delete operations
13. Clear audit trail for each operation (who deleted, when, why)
14. Support for card aliasing (customer can rename cards)

**APIs:**
```
GET    /api/v1/payment-methods
       Response: [ { id, brand, lastFour, expiryMonth, expiryYear, status, default } ]

GET    /api/v1/payment-methods/:id
       Response: { id, brand, lastFour, expiryMonth, expiryYear, status, createdAt, usageCount, lastUsedAt }

PATCH  /api/v1/payment-methods/:id
       Body: { alias?, default? }
       Response: Updated payment method

DELETE /api/v1/payment-methods/:id
       Response: { success: true, message: "Card removed" }

GET    /api/v1/payment-methods/:id/usage
       Response: [ { date, amount, status, description } ]

POST   /api/v1/payment-methods/:id/set-default
       Response: { success: true }
```

**Estimated Effort:** 8 SP
- API endpoints: 3 SP
- Business logic: 2 SP
- Audit logging: 1.5 SP
- Testing: 1.5 SP

---

### US-5.5.3: Recurring Billing with Tokenized Cards (7 SP)

**Title:** Enable recurring/subscription payments using saved cards

**Description:**
Support charging saved cards on a recurring basis for subscriptions, installment plans, and scheduled recurring payments.

**Acceptance Criteria:**
1. Mark tokens as recurring-enabled
2. Setup recurring charge schedule (daily, weekly, monthly, yearly)
3. Automatic charging on schedule
4. Retry failed recurring charges (3 retries over 3 days)
5. Notify user of successful/failed recurring charges
6. Allow user to pause/resume recurring charges
7. Allow user to cancel recurring charges
8. Update card used for recurring charges
9. Automatic failure handling (card expired → ask for new card)
10. Dunning management (failed payment recovery workflow)
11. Refund support for recurring charges
12. Subscription status tracking
13. Clear billing history for recurring charges

**Recurring Charge States:**
```
PENDING → PROCESSING → SUCCEEDED
       ↓
       FAILED → RETRYING (up to 3 times)
       ↓
       PERMANENTLY_FAILED → PAYMENT_METHOD_REQUIRED
       ↓
       UPDATED_METHOD → RETRYING
```

**Estimated Effort:** 7 SP
- Recurring charge scheduling: 2.5 SP
- Retry logic: 2 SP
- Failure handling: 1.5 SP
- Testing: 1 SP

---

### US-5.5.4: POS Terminal Card Tokenization (5 SP)

**Title:** Support tokenized cards at POS terminals

**Description:**
Enable POS terminals to use pre-tokenized cards for quick transactions without requiring card re-entry.

**Acceptance Criteria:**
1. POS can charge pre-saved customer card
2. Card selection UI at terminal (shows last 4 digits)
3. Tokenized card transaction audit trail
4. Receipt shows token used (not full card)
5. Support for new cards at POS (tokenize on transaction)
6. Offline tokenization support (queue for later)
7. Integration with Till reconciliation

**Estimated Effort:** 5 SP
- POS integration: 2 SP
- Offline tokenization queue: 2 SP
- Testing: 1 SP

---

## Implementation Notes

### Token Storage Security

```typescript
// Never store raw Paystack tokens in plaintext
// Always encrypt with application secret key

// In database:
paystack_token = AES_ENCRYPT(paystackToken, APP_SECRET_KEY)

// When using token:
1. Retrieve from database (still encrypted)
2. Decrypt in memory
3. Use for API call
4. Immediately delete from memory
5. Never log actual token value
```

### Token Reuse Detection

```
Customer A: Saves Visa ending in 1234
  → Paystack returns token: tkn_abc123

If Customer A tries to save same Visa 1234 again:
  → Paystack returns same token: tkn_abc123
  → Our system detects duplicate → reject "already saved"

If Customer B: Saves Visa ending in 1234 (different card):
  → Paystack returns different token: tkn_def456
  → Our system treats as separate token (correct)
```

### Tokenization Flow Diagram

```
Customer submits card + "Save for future" flag
              ↓
      Validate card locally
              ↓
      Encrypt card data in transit
              ↓
      Send to Paystack tokenization endpoint
              ↓
      Paystack validates, returns token
              ↓
      Our system receives token
              ↓
      Encrypt token + store in database
              ↓
      Return token reference to client
              ↓
      Client can use reference for future payments
```

---

## Success Criteria

- [ ] Card tokenization successful for 99%+ of valid cards
- [ ] Failed tokenization due to invalid card: <1%
- [ ] Token creation latency: <2 seconds
- [ ] Payment with saved token latency: <500ms faster than full card entry
- [ ] PCI DSS compliance: 0 raw card data in our logs
- [ ] Token security: All tokens encrypted in transit and at rest
- [ ] Recurring charges: 95%+ success on first attempt
- [ ] Failed recurring: Recovery within 3 days for 90% of customers
- [ ] User experience: Save card flow <10 seconds
- [ ] Audit trail: 100% complete for all token operations

---

## Dependencies & Blockers

**Depends On:**
- ✅ Sprint 5: Card payment processing working
- ✅ Sprint 3.5: Request/response signing (encrypts tokens in transit)
- ✅ Sprint 1: Encryption infrastructure

**Blocks:**
- Sprint 6: Withdrawals (uses saved payment methods)
- Sprint 40: POS (uses tokenized cards)
- Sprint 48: Market features (mobile money saved methods)

**External Dependencies:**
- Paystack tokenization API
- Encryption libraries (Node.js crypto)
- Job queue for recurring charges (Bull)

---

## Files to Create

1. `src/modules/payment-methods/tokenized-card.service.ts`
2. `src/modules/payment-methods/payment-method.controller.ts`
3. `src/modules/payment-methods/recurring-charge.service.ts`
4. `src/modules/payment-methods/entities/tokenized-card.entity.ts`
5. `src/database/migrations/create-tokenized-card-tables.ts`
