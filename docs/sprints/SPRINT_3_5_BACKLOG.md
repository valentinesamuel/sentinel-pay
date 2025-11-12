# Sprint 3.5: Request/Response Signing & Cryptographic Integrity

**Sprint Goal:** Implement comprehensive request/response signing using HMAC-SHA256 to ensure data integrity, prevent tampering, and enable secure API communication for all sensitive endpoints.

**Duration:** 1 week (7 days)
**Story Points:** 35 SP
**Team:** 2-3 Backend Engineers + 1 Security Engineer
**Dependencies:** Sprint 1 (Encryption setup), Sprint 2 (Authentication), Sprint 2.5 (Rate limiting)
**Blocks:** Sprints 5-6 (Payment APIs), Sprint 7 (Webhooks), Sprint 40 (POS)

---

## User Stories

### US-3.5.1: Request Signing Service (10 SP)

**Title:** Implement HMAC-SHA256 request signing for API clients

**Description:**
Create a request signing service that allows API clients to sign requests using a shared secret key. Server validates signatures to ensure requests haven't been tampered with and originate from legitimate clients.

**Acceptance Criteria:**
1. HMAC-SHA256 signature generation for request payloads
2. Signature calculation includes: HTTP method, path, body hash, timestamp, nonce
3. Signature added to `X-Signature` header in base64 format
4. Timestamp validation (request must be within 5 minutes of server time)
5. Nonce validation (prevent replay attacks, 24-hour storage)
6. Support for multiple signing algorithms (HMAC-SHA256, HMAC-SHA512)
7. Signature verification at request guard level (before handler)
8. Clear error messages for signature failures (invalid signature, expired timestamp, duplicate nonce)
9. Bypass signing for public endpoints (health check, login, registration)
10. Bypass signing for specific paths (webhooks have separate signing)
11. Key versioning support (support old keys during rotation)
12. Logging of all signature verification attempts (success and failure)
13. Metrics for signature verification latency and failure rates
14. Support for optional fields in signature (some fields can be excluded)
15. Integration with API key management (each API key has signing keys)

**Technical Specs:**
```typescript
// Request signature calculation
interface SignedRequest {
  method: string;          // HTTP method (POST, GET, etc.)
  path: string;            // Request path
  bodyHash: string;        // SHA256 hash of request body
  timestamp: number;       // Unix timestamp (seconds)
  nonce: string;           // Unique request ID (UUID)
  headers: {
    'X-Signature': string;     // Base64(HMAC-SHA256(signingKey, signaturePayload))
    'X-Timestamp': string;     // Unix timestamp
    'X-Nonce': string;         // Unique ID
    'X-Algorithm': string;     // 'HMAC-SHA256' or 'HMAC-SHA512'
  }
}

// Signature payload format
signaturePayload = `${method}|${path}|${bodyHash}|${timestamp}|${nonce}`

// Example:
// POST|/api/v1/payments/card/initialize|abc123def456|1699545660|550e8400-e29b-41d4-a716-446655440000
// HMAC-SHA256(signingKey, payload) = ...base64 encoded...
```

**Database Schema Changes:**
```sql
-- Signing keys for API keys (separate from API key itself)
CREATE TABLE api_key_signing_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signing_key_secret TEXT NOT NULL,  -- encrypted with app secret
  algorithm VARCHAR(50) DEFAULT 'HMAC-SHA256',
  version INT DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rotated_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id),
  UNIQUE(api_key_id, version)
);

-- Nonce tracking for replay attack prevention
CREATE TABLE request_nonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nonce VARCHAR(255) NOT NULL UNIQUE,
  api_key_id UUID NOT NULL REFERENCES api_keys(id),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL  -- 24 hours
);

-- Signature verification audit log
CREATE TABLE signature_verification_log (
  id BIGSERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  endpoint VARCHAR(255),
  method VARCHAR(10),
  signature_valid BOOLEAN,
  failure_reason VARCHAR(100),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET
);

CREATE INDEX idx_request_nonces_expires ON request_nonces(expires_at);
CREATE INDEX idx_signature_log_api_key ON signature_verification_log(api_key_id, timestamp DESC);
CREATE INDEX idx_api_key_signing_keys_active ON api_key_signing_keys(api_key_id) WHERE active = true;
```

**Estimated Effort:** 10 SP
- Signature algorithm: 2 SP
- Timestamp/nonce validation: 2 SP
- Key rotation support: 2 SP
- Request guard integration: 2 SP
- Testing & documentation: 2 SP

---

### US-3.5.2: Response Signing & Encryption (9 SP)

**Title:** Sign and optionally encrypt sensitive response payloads

**Description:**
Implement response signing so clients can verify that responses actually came from the server. Optional encryption for ultra-sensitive data (tokens, passwords, financial details).

**Acceptance Criteria:**
1. HMAC-SHA256 signature on response JSON bodies
2. Signature added to `X-Signature` header in response
3. Optional AES-256-GCM encryption for sensitive fields
4. Clients decrypt with API key password or provided key
5. Encrypted responses include IV (initialization vector)
6. Support for field-level encryption (encrypt specific fields only)
7. Signature includes response timestamp and request nonce echo
8. Clients can verify response came in response to their specific request
9. Timestamp on response (server time at response generation)
10. Support for response compression (signature calculated on uncompressed body)
11. Clear documentation on encryption algorithms and procedures
12. Performance: <10ms overhead per response
13. Support for partial encryption (some fields encrypted, some not)
14. Backward compatibility with unencrypted responses

**Technical Specs:**
```typescript
// Response signature calculation
interface SignedResponse {
  body: object;
  headers: {
    'X-Signature': string;              // Base64(HMAC-SHA256(...))
    'X-Response-Timestamp': string;     // Unix timestamp
    'X-Response-Nonce-Echo': string;    // Echo of request nonce
    'X-Encrypted': boolean;             // Whether body is encrypted
    'X-Encryption-Algorithm': string;   // 'AES-256-GCM' if encrypted
    'X-Encryption-IV': string;          // Base64 IV if encrypted
  }
}

// Response signature payload
signaturePayload = `${bodyHash}|${timestamp}|${requestNonce}`

// Example encrypted response field
{
  "publicFields": {
    "transactionId": "txn_123",
    "status": "SUCCESS"
  },
  "encryptedFields": {
    "data": "base64(AES-256-GCM encrypted JSON)"
  }
}
```

**Estimated Effort:** 9 SP
- Response signing implementation: 3 SP
- Field-level encryption: 3 SP
- Key management for encryption: 2 SP
- Testing & documentation: 1 SP

---

### US-3.5.3: Webhook Signature Verification (8 SP)

**Title:** Implement HMAC signature verification for inbound webhooks

**Description:**
Merchants sending webhooks to Ubiquitous Tribble must sign their payloads. Server verifies signatures to ensure webhooks come from legitimate sources and haven't been tampered with.

**Acceptance Criteria:**
1. Webhook requests include `X-Webhook-Signature` header
2. Signature calculated: HMAC-SHA256(merchantSecret, webhookPayload)
3. Signature verification before processing webhook
4. Reject unsigned webhook requests with 401
5. Log signature verification failures for security audit
6. Support for multiple signature algorithms (SHA256, SHA512)
7. Signature format: `algorithm=value` (e.g., `sha256=abcd1234`)
8. Request body available for signature calculation (not consumed by middleware)
9. Timestamp validation (webhook within 5 minutes of generation)
10. Idempotency: Same webhook processed only once (by event ID + merchant)
11. Clear error messages for signature failures
12. Webhook signing key rotation support
13. Documentation with example webhook signature generation

**Technical Specs:**
```typescript
// Inbound webhook validation
interface WebhookValidationRequest {
  headers: {
    'X-Webhook-Signature': string;    // 'sha256=abc123'
    'X-Webhook-Timestamp': string;    // Unix timestamp
    'X-Webhook-ID': string;            // Unique event ID
  },
  body: string;  // Raw request body for signature calculation
}

// Signature calculation (merchant side)
const payload = `${timestamp}.${body}`;
const signature = crypto
  .createHmac('sha256', merchantSecret)
  .update(payload)
  .digest('hex');
headers['X-Webhook-Signature'] = `sha256=${signature}`;
```

**Estimated Effort:** 8 SP
- Webhook signature verification: 3 SP
- Idempotency tracking: 2 SP
- Key rotation: 1.5 SP
- Testing & documentation: 1.5 SP

---

### US-3.5.4: Key Management & Rotation (5 SP)

**Title:** Implement secure key rotation and versioning for signing keys

**Description:**
Support key rotation without disrupting services. Old keys remain valid for a grace period, allowing clients time to update their keys.

**Acceptance Criteria:**
1. API endpoint to rotate signing keys
2. New key immediately becomes active
3. Old keys remain valid for 30 days (grace period)
4. Support for multiple simultaneous signing keys per API key
5. Version tracking for each signing key
6. Audit log of all key rotations (who, when, why)
7. Automatic key expiration after grace period
8. Client notification about upcoming key expiration
9. Support for manual key revocation (immediate)
10. Secure key generation using crypto.randomBytes()
11. Keys stored encrypted in database
12. Key rotation API requires strong authentication (MFA)
13. Integration with existing API key management

**Estimated Effort:** 5 SP
- Key rotation endpoints: 2 SP
- Grace period enforcement: 1.5 SP
- Audit logging: 1.5 SP

---

### US-3.5.5: Integration with Payment APIs (3 SP)

**Title:** Apply request/response signing to all payment endpoints (Sprints 5-6)

**Description:**
Integrate signing with payment processing endpoints to ensure data integrity for high-value transactions.

**Acceptance Criteria:**
1. All POST /api/v1/payments/* endpoints require request signatures
2. All POST /api/v1/transfers/* endpoints require request signatures
3. All POST /api/v1/withdrawals/* endpoints require request signatures
4. All responses from payment endpoints are signed
5. High-sensitivity data (tokens, PINs) in responses are encrypted
6. Signature enforcement configurable per endpoint
7. Clear error messages guide clients on how to sign requests
8. Integration doesn't add >10ms latency to payment endpoints

**Estimated Effort:** 3 SP
- Endpoint integration: 1.5 SP
- Testing: 1.5 SP

---

## Implementation Notes

### Request Signing Client Example

```typescript
// Client-side implementation (for API consumers)

class SigningApiClient {
  constructor(
    private apiKey: string,
    private signingKey: string,  // Shared secret
  ) {}

  async request(method: string, path: string, body?: object): Promise<any> {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomUUID();
    const bodyHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(body || {}))
      .digest('base64');

    // Create signature
    const signaturePayload = `${method}|${path}|${bodyHash}|${timestamp}|${nonce}`;
    const signature = crypto
      .createHmac('sha256', this.signingKey)
      .update(signaturePayload)
      .digest('base64');

    // Make request with signature headers
    return fetch(`https://api.ubiquitous-tribble.com${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Signature': signature,
        'X-Timestamp': timestamp.toString(),
        'X-Nonce': nonce,
        'X-Algorithm': 'HMAC-SHA256',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}
```

### Key Rotation Workflow

```
1. Client initiates key rotation via API
   → POST /api/v1/api-keys/{id}/rotate-signing-key

2. Server generates new signing key
   → Stored encrypted with version = previous_version + 1

3. Old key remains valid for 30 days
   → Version tracking allows server to validate both old and new

4. Client receives new key
   → Must update local signing configuration

5. After 30-day grace period
   → Old key automatically revoked
   → Requests with old key return 401

6. Audit trail recorded
   → Who requested rotation, timestamp, outcome
```

### Security Considerations

- Keys never transmitted in plaintext
- Signatures use HMAC (not RSA) for simplicity and performance
- Nonce prevents replay attacks
- Timestamp prevents delayed request injection
- Request bodies hashed (not full content) to handle large payloads
- Response signatures include request nonce for request-response binding
- Encryption uses authenticated encryption (GCM mode)
- Key rotation happens online (no service downtime)

---

## Success Criteria

- [ ] All sensitive endpoints protected with request signatures
- [ ] Request signature verification latency: <5ms (p99)
- [ ] Response signature generation latency: <5ms (p99)
- [ ] Signature verification accuracy: 100%
- [ ] Replay attack prevention: 0 duplicate nonces allowed
- [ ] Key rotation: 0 service disruption
- [ ] Backward compatibility: Old keys valid during grace period
- [ ] Encryption: AES-256-GCM with authenticated encryption
- [ ] Audit logging: All signature events logged
- [ ] Documentation: Complete with examples and best practices

---

## Dependencies & Blockers

**Depends On:**
- ✅ Sprint 1: Encryption infrastructure
- ✅ Sprint 2: Authentication & API keys
- ✅ Sprint 2.5: Rate limiting (can read user tier during signing)

**Blocks:**
- Sprint 5: Payment APIs (need signing)
- Sprint 6: Withdrawal APIs (need signing)
- Sprint 7: Webhooks (need signing)
- Sprint 40: POS APIs (need signing)

**External Dependencies:**
- Node.js crypto module (built-in)
- HMAC-SHA256 implementation
- Base64 encoding/decoding
- UUID generation for nonces

---

## Files to Create

1. `src/modules/signing/request-signing.service.ts`
2. `src/modules/signing/response-signing.service.ts`
3. `src/modules/signing/webhook-signing.validator.ts`
4. `src/modules/signing/signing.guard.ts`
5. `src/modules/signing/signing-key.service.ts`
6. `src/modules/signing/encryption.service.ts`
7. `src/database/migrations/create-signing-tables.ts`
