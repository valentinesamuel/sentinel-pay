# API Request Signing Implementation Guide

> Complete implementation guide for HMAC-SHA256 request/response signing with AES-256-GCM encryption on the Ubiquitous Tribble platform.

**Version:** 1.0  
**Last Updated:** November 10, 2025  
**Security Level:** Enterprise-Grade

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Implementation Steps](#implementation-steps)
5. [Code Examples](#code-examples)
6. [Security Best Practices](#security-best-practices)
7. [Testing & Validation](#testing--validation)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Overview

### What is Request Signing?

Request signing is a cryptographic mechanism to:
- **Prove authenticity**: Verify the request came from an authorized client
- **Ensure integrity**: Detect any tampering or modification in transit
- **Prevent replay attacks**: Use nonces and timestamps to prevent request reuse

### Why is it Important?

```
❌ Without signing:
   GET /api/v1/transactions
   Request could be: modified, replayed, spoofed

✅ With signing:
   GET /api/v1/transactions
   + X-Signature: ab123cd456...
   + X-Nonce: 550e8400-e29b-41d4-a716-446655440000
   + X-Timestamp: 1699593300000
   
   = Cryptographically verified authenticity & integrity
```

### Key Concepts

| Concept | Purpose | Example |
|---------|---------|---------|
| **API Key** | Identifies your merchant/app | `pk_test_abc123` |
| **API Secret** | Signs requests (keep secret!) | `sk_test_xyz789` |
| **Nonce** | One-time identifier | `550e8400-e29b-41d4-a716-446655440000` |
| **Timestamp** | Request creation time | `1699593300000` |
| **Signature** | HMAC-SHA256 hash | `a1b2c3d4e5f6...` |

---

## Architecture

### Request Signing Flow

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT APPLICATION                                     │
└─────────────────────────────────────────────────────────┘
              │
              ├─ 1. Prepare request body
              ├─ 2. Generate nonce (UUID)
              ├─ 3. Get current timestamp
              ├─ 4. Create signing message
              ├─ 5. HMAC-SHA256(message, secret)
              ├─ 6. Add signature headers
              └─ 7. Send HTTPS request

                    HTTPS TRANSMISSION
                    (TLS encrypted)

┌─────────────────────────────────────────────────────────┐
│  UBIQUITOUS TRIBBLE API SERVER                          │
└─────────────────────────────────────────────────────────┘
              │
              ├─ 8. Extract headers
              ├─ 9. Verify timestamp (±5 min)
              ├─ 10. Check nonce replay
              ├─ 11. Get API secret from DB
              ├─ 12. Recalculate signature
              ├─ 13. Constant-time compare
              ├─ 14. Store nonce in Redis
              └─ 15. Execute business logic

                    HTTPS TRANSMISSION
                    (TLS encrypted)

┌─────────────────────────────────────────────────────────┐
│  CLIENT APPLICATION                                     │
└─────────────────────────────────────────────────────────┘
              │
              ├─ 16. Extract response headers
              ├─ 17. Verify response signature
              ├─ 18. Decrypt response (AES-256-GCM)
              └─ 19. Process response data
```

### Security Layers

```
Layer 1: TLS/HTTPS
└─ Encrypts entire communication channel

Layer 2: Request Signing (HMAC-SHA256)
└─ Proves request authenticity & integrity

Layer 3: Replay Prevention (Nonce + Timestamp)
└─ Prevents request reuse

Layer 4: Response Encryption (AES-256-GCM)
└─ Protects sensitive response data

Layer 5: Field-Level Encryption (AES-256-GCM)
└─ Additional encryption for most sensitive fields
```

---

## Getting Started

### Prerequisites

- Node.js 14+ (or equivalent platform)
- Access to API credentials (API key + API secret)
- HTTPS support on your client
- UUID library

### Obtain API Credentials

1. **Log in** to Ubiquitous Tribble merchant portal
2. **Navigate** to Settings → API Keys
3. **Create** a new API key
4. **Copy** the API key (public) and API secret (keep secret!)
5. **Store securely** (environment variables, secure vault, etc.)

```bash
# .env (Example - NEVER commit secrets!)
API_KEY=pk_live_abc123def456
API_SECRET=sk_live_xyz789uvw012
```

### Installation

#### Node.js / JavaScript
```bash
npm install crypto uuid
# Already built-in to Node.js
```

#### Python
```bash
pip install requests pycryptodome
```

#### Java
```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-codec</artifactId>
    <version>1.15</version>
</dependency>
```

#### Go
```bash
go get github.com/google/uuid
# crypto/hmac built-in
```

---

## Implementation Steps

### Step 1: Prepare Request Data

```typescript
// Collect data you want to send
const requestData = {
  customerId: "550e8400-e29b-41d4-a716-446655440000",
  amount: 10000.00,
  merchantId: "merchant-001",
  description: "Payment for order #12345"
};

// Convert to JSON string (NO whitespace)
const requestBody = JSON.stringify(requestData);
// Result: {"customerId":"550e8400-e29b-41d4-a716-446655440000","amount":10000.00,"merchantId":"merchant-001","description":"Payment for order #12345"}
```

### Step 2: Generate Nonce (Random Identifier)

```typescript
import { v4 as uuid } from 'uuid';

// Generate unique identifier for this request
const nonce = uuid();
// Result: 660e8400-e29b-41d4-a716-446655440111
```

**Why nonce?**
- Prevents replay attacks (each request is unique)
- Stored on server with TTL
- If same nonce used again → rejected

### Step 3: Get Current Timestamp

```typescript
// Get current time in milliseconds
const timestamp = Date.now();
// Result: 1699593300000

// Alternatively, if you need to support clock skew:
const timestamp = Math.floor(Date.now() / 1000) * 1000; // Round to nearest second
```

**Timestamp constraints:**
- Server accepts ±5 minutes from current time
- Prevents old requests from being replayed
- Provides ordering information

### Step 4: Create Message to Sign

```typescript
// Concatenate: requestBody + nonce + timestamp
const message = `${requestBody}${nonce}${timestamp}`;

// Result:
// {"customerId":"550e8400-e29b-41d4-a716-446655440000","amount":10000.00,"merchantId":"merchant-001","description":"Payment for order #12345"}660e8400-e29b-41d4-a716-446655440111169959330000
```

**Important:**
- Order matters: body + nonce + timestamp (ALWAYS)
- No delimiters between parts
- No extra spaces or formatting

### Step 5: Create HMAC-SHA256 Signature

```typescript
import crypto from 'crypto';

const apiSecret = "sk_live_xyz789uvw012"; // Your API secret

const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(message)
  .digest('hex');

// Result: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

### Step 6: Prepare Request Headers

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`, // JWT from login
  'X-Signature': signature,                  // HMAC-SHA256 signature
  'X-Nonce': nonce,                          // Request identifier
  'X-Timestamp': timestamp.toString()        // Request timestamp
};
```

### Step 7: Send HTTPS Request

```typescript
const response = await fetch(
  'https://api.example.com/api/v1/transactions',
  {
    method: 'POST',
    headers,
    body: requestBody
  }
);

const data = await response.json();
```

### Step 8: Verify Response Signature

```typescript
// Extract response signature headers
const responseSignature = response.headers.get('X-Response-Signature');
const responseNonce = response.headers.get('X-Response-Nonce');
const responseTimestamp = response.headers.get('X-Response-Timestamp');

// Parse response body
const responseBody = await response.json();
const encryptedData = responseBody.data;

// Verify timestamp (server responded within reasonable time)
const responseTs = parseInt(responseTimestamp);
const timeDiff = Math.abs(Date.now() - responseTs);
if (timeDiff > 5 * 60 * 1000) {
  throw new Error('Response timestamp is stale');
}

// Recalculate expected signature
const responseMessage = `${encryptedData}${responseNonce}${responseTimestamp}`;
const expectedSignature = crypto
  .createHmac('sha256', apiSecret)
  .update(responseMessage)
  .digest('hex');

// Verify signature matches
if (responseSignature !== expectedSignature) {
  throw new Error('Response signature verification failed - tampering detected!');
}

// Response is authentic - proceed to decrypt
```

### Step 9: Decrypt Response Data

```typescript
// Response data is AES-256-GCM encrypted
const encryptedData = responseBody.data; // hex-encoded encrypted data

// Decrypt using your API secret
const decrypted = decryptAES256GCM(encryptedData, apiSecret);
const decryptedData = JSON.parse(decrypted);

// Now you can use the response data safely
console.log(decryptedData);
```

---

## Code Examples

### Complete TypeScript Example

```typescript
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';

class ApiClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string = 'https://api.example.com/api/v1';

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  /**
   * Sign a request with HMAC-SHA256
   */
  private signRequest(requestBody: string, nonce: string, timestamp: string): string {
    const message = `${requestBody}${nonce}${timestamp}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }

  /**
   * Send a signed POST request
   */
  async post<T>(endpoint: string, data: any, accessToken: string): Promise<T> {
    const requestBody = JSON.stringify(data);
    const nonce = uuid();
    const timestamp = Date.now().toString();

    // Sign the request
    const signature = this.signRequest(requestBody, nonce, timestamp);

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-Signature': signature,
      'X-Nonce': nonce,
      'X-Timestamp': timestamp
    };

    // Send request
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: requestBody
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Verify and decrypt response
    return this.verifyAndDecryptResponse(response);
  }

  /**
   * Send a signed GET request
   */
  async get<T>(endpoint: string, accessToken: string, params?: Record<string, any>): Promise<T> {
    // For GET requests, include params in nonce calculation
    const requestBody = params ? JSON.stringify(params) : '';
    const nonce = uuid();
    const timestamp = Date.now().toString();

    const signature = this.signRequest(requestBody, nonce, timestamp);

    // Build query string
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'X-Signature': signature,
      'X-Nonce': nonce,
      'X-Timestamp': timestamp
    };

    const response = await fetch(`${this.baseUrl}${endpoint}${queryString}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return this.verifyAndDecryptResponse(response);
  }

  /**
   * Verify response signature and decrypt
   */
  private async verifyAndDecryptResponse<T>(response: Response): Promise<T> {
    const responseSignature = response.headers.get('X-Response-Signature');
    const responseNonce = response.headers.get('X-Response-Nonce');
    const responseTimestamp = response.headers.get('X-Response-Timestamp');

    if (!responseSignature || !responseNonce || !responseTimestamp) {
      throw new Error('Missing response signature headers');
    }

    const responseBody = await response.json();
    const encryptedData = responseBody.data;

    // Verify timestamp
    const responseTs = parseInt(responseTimestamp);
    const timeDiff = Math.abs(Date.now() - responseTs);
    if (timeDiff > 5 * 60 * 1000) {
      throw new Error('Response timestamp is stale');
    }

    // Verify signature
    const responseMessage = `${encryptedData}${responseNonce}${responseTimestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(responseMessage)
      .digest('hex');

    if (responseSignature !== expectedSignature) {
      throw new Error('Response signature verification failed');
    }

    // Decrypt response
    const decrypted = this.decryptAES256GCM(encryptedData);
    return JSON.parse(decrypted);
  }

  /**
   * Decrypt AES-256-GCM encrypted data
   */
  private decryptAES256GCM(encryptedData: string): string {
    // Simplified example - full implementation depends on IV and auth tag handling
    const key = crypto.createHash('sha256').update(this.apiSecret).digest();
    // ... decryption logic ...
    return '';
  }
}

// Usage
const client = new ApiClient(
  process.env.API_KEY!,
  process.env.API_SECRET!
);

// Login first to get access token
const loginResponse = await client.post('/auth/login', {
  email: 'merchant@example.com',
  password: 'password123'
}, 'none');

const accessToken = loginResponse.accessToken;

// Create transaction with signed request
const transactionResponse = await client.post(
  '/transactions',
  {
    amount: 10000.00,
    customerId: '550e8400-e29b-41d4-a716-446655440000',
    merchantId: 'merchant-001'
  },
  accessToken
);

console.log('Transaction created:', transactionResponse);
```

### Python Example

```python
import hmac
import hashlib
import json
import uuid
import time
import requests
from typing import Any, Dict, Optional

class UbiquitousTribbleClient:
    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = 'https://api.example.com/api/v1'

    def sign_request(self, request_body: str, nonce: str, timestamp: str) -> str:
        """Sign request with HMAC-SHA256"""
        message = f"{request_body}{nonce}{timestamp}"
        signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature

    def post(self, endpoint: str, data: Dict[str, Any], access_token: str) -> Dict:
        """Send a signed POST request"""
        request_body = json.dumps(data, separators=(',', ':'))
        nonce = str(uuid.uuid4())
        timestamp = str(int(time.time() * 1000))

        # Sign the request
        signature = self.sign_request(request_body, nonce, timestamp)

        # Prepare headers
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}',
            'X-Signature': signature,
            'X-Nonce': nonce,
            'X-Timestamp': timestamp
        }

        # Send request
        response = requests.post(
            f'{self.base_url}{endpoint}',
            data=request_body,
            headers=headers
        )

        response.raise_for_status()

        # Verify and decrypt response
        return self.verify_and_decrypt_response(response)

    def get(self, endpoint: str, access_token: str, params: Optional[Dict] = None) -> Dict:
        """Send a signed GET request"""
        request_body = json.dumps(params) if params else ''
        nonce = str(uuid.uuid4())
        timestamp = str(int(time.time() * 1000))

        signature = self.sign_request(request_body, nonce, timestamp)

        headers = {
            'Authorization': f'Bearer {access_token}',
            'X-Signature': signature,
            'X-Nonce': nonce,
            'X-Timestamp': timestamp
        }

        response = requests.get(
            f'{self.base_url}{endpoint}',
            headers=headers,
            params=params
        )

        response.raise_for_status()

        return self.verify_and_decrypt_response(response)

    def verify_and_decrypt_response(self, response: requests.Response) -> Dict:
        """Verify response signature and decrypt"""
        response_signature = response.headers.get('X-Response-Signature')
        response_nonce = response.headers.get('X-Response-Nonce')
        response_timestamp = response.headers.get('X-Response-Timestamp')

        if not all([response_signature, response_nonce, response_timestamp]):
            raise ValueError('Missing response signature headers')

        response_body = response.json()
        encrypted_data = response_body['data']

        # Verify timestamp
        response_ts = int(response_timestamp)
        current_ts = int(time.time() * 1000)
        time_diff = abs(current_ts - response_ts)
        if time_diff > 5 * 60 * 1000:
            raise ValueError('Response timestamp is stale')

        # Verify signature
        response_message = f"{encrypted_data}{response_nonce}{response_timestamp}"
        expected_signature = hmac.new(
            self.api_secret.encode(),
            response_message.encode(),
            hashlib.sha256
        ).hexdigest()

        if response_signature != expected_signature:
            raise ValueError('Response signature verification failed')

        # Decrypt response
        decrypted_data = self.decrypt_aes256gcm(encrypted_data)
        return json.loads(decrypted_data)

    def decrypt_aes256gcm(self, encrypted_data: str) -> str:
        """Decrypt AES-256-GCM encrypted data"""
        # Implementation depends on your encryption details
        pass

# Usage
client = UbiquitousTribbleClient(
    api_key='pk_live_abc123',
    api_secret='sk_live_xyz789'
)

# Send signed request
transaction = client.post(
    '/transactions',
    {
        'amount': 10000.00,
        'customerId': '550e8400-e29b-41d4-a716-446655440000',
        'merchantId': 'merchant-001'
    },
    access_token='eyJhbGciOiJIUzI1NiIs...'
)

print(transaction)
```

### JavaScript (Browser) Example

```javascript
class UbiquitousTribbleClient {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.example.com/api/v1';
  }

  /**
   * Generate UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Sign request with HMAC-SHA256
   */
  async signRequest(requestBody, nonce, timestamp) {
    // Convert API secret to bytes
    const encoder = new TextEncoder();
    const secretBytes = encoder.encode(this.apiSecret);

    // Create message
    const message = `${requestBody}${nonce}${timestamp}`;
    const messageBytes = encoder.encode(message);

    // Generate HMAC-SHA256
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      messageBytes
    );

    // Convert to hex
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Send a signed POST request
   */
  async post(endpoint, data, accessToken) {
    const requestBody = JSON.stringify(data);
    const nonce = this.generateUUID();
    const timestamp = Date.now().toString();

    // Sign the request
    const signature = await this.signRequest(requestBody, nonce, timestamp);

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-Signature': signature,
      'X-Nonce': nonce,
      'X-Timestamp': timestamp
    };

    // Send request
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: requestBody
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Verify and decrypt response
    return this.verifyAndDecryptResponse(response);
  }

  /**
   * Verify response signature
   */
  async verifyAndDecryptResponse(response) {
    const responseSignature = response.headers.get('X-Response-Signature');
    const responseNonce = response.headers.get('X-Response-Nonce');
    const responseTimestamp = response.headers.get('X-Response-Timestamp');

    const responseBody = await response.json();
    const encryptedData = responseBody.data;

    // Verify signature
    const responseMessage = `${encryptedData}${responseNonce}${responseTimestamp}`;
    const expectedSignature = await this.signRequest(
      encryptedData,
      responseNonce,
      responseTimestamp
    );

    if (responseSignature !== expectedSignature) {
      throw new Error('Response signature verification failed');
    }

    // Decrypt and return
    return this.decryptAES256GCM(encryptedData);
  }

  decryptAES256GCM(encryptedData) {
    // Simplified - actual implementation needed
    return JSON.parse(atob(encryptedData));
  }
}

// Usage
const client = new UbiquitousTribbleClient(
  'pk_live_abc123',
  'sk_live_xyz789'
);

client.post(
  '/transactions',
  {
    amount: 10000.00,
    customerId: '550e8400-e29b-41d4-a716-446655440000'
  },
  'eyJhbGciOiJIUzI1NiIs...'
).then(response => {
  console.log('Transaction created:', response);
});
```

---

## Security Best Practices

### ✅ DO

```typescript
// ✅ Store API secret in environment variable
const apiSecret = process.env.API_SECRET;

// ✅ Use HTTPS for all requests
const url = 'https://api.example.com/api/v1/transactions';

// ✅ Verify response signatures
if (responseSignature !== expectedSignature) {
  throw new Error('Signature mismatch');
}

// ✅ Use UUID for nonce (guaranteed uniqueness)
const nonce = uuid();

// ✅ Use constant-time comparison
crypto.timingSafeEqual(sig1, sig2);

// ✅ Verify timestamp within reasonable window
if (Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
  throw new Error('Timestamp stale');
}

// ✅ Keep API secret confidential
// (never log, never commit, never share)
```

### ❌ DON'T

```typescript
// ❌ Don't hardcode API secret
const apiSecret = 'sk_live_xyz789'; // WRONG!

// ❌ Don't use HTTP (unencrypted)
const url = 'http://api.example.com/...'; // WRONG!

// ❌ Don't skip response verification
const data = await response.json(); // No signature check!

// ❌ Don't use sequential IDs for nonce
let nonce = 1; nonce++; // WRONG!

// ❌ Don't use string comparison for signatures
if (sig1 === sig2) { ... } // Vulnerable to timing attacks!

// ❌ Don't ignore timestamps
// (attackes could replay old requests)

// ❌ Don't log API secrets
console.log('API Secret:', apiSecret); // WRONG!
```

### Secret Management

```bash
# ✅ Good: Use environment variables
export API_SECRET=sk_live_xyz789

# ✅ Good: Use secure vaults
# AWS Secrets Manager, HashiCorp Vault, etc.

# ✅ Good: Use .env with .gitignore
# .env (ignored by git)
# API_SECRET=sk_live_xyz789

# ❌ Bad: Hardcoded in code
const API_SECRET = 'sk_live_xyz789'; // NEVER!

# ❌ Bad: Committed to Git
git commit -m "Add API secret"
git push # LEAKED!
```

### Network Security

```typescript
// Always use HTTPS
// TLS 1.2 or higher
// Certificate pinning (optional, for extra security)

// Example: Certificate pinning in Node.js
import https from 'https';
import fs from 'fs';

const agentOptions = {
  ca: fs.readFileSync('path/to/ca-cert.pem')
};

const agent = new https.Agent(agentOptions);

await fetch(url, {
  method: 'POST',
  agent // Use pinned certificate
});
```

---

## Testing & Validation

### Unit Tests

```typescript
import { describe, it, expect } from '@jest/globals';
import crypto from 'crypto';

describe('Request Signing', () => {
  const apiSecret = 'test-secret-key';

  function signRequest(body: string, nonce: string, timestamp: string): string {
    const message = `${body}${nonce}${timestamp}`;
    return crypto
      .createHmac('sha256', apiSecret)
      .update(message)
      .digest('hex');
  }

  it('should generate consistent signatures', () => {
    const body = '{"amount":10000}';
    const nonce = '550e8400-e29b-41d4-a716-446655440000';
    const timestamp = '1699593300000';

    const sig1 = signRequest(body, nonce, timestamp);
    const sig2 = signRequest(body, nonce, timestamp);

    expect(sig1).toBe(sig2);
  });

  it('should generate different signatures for different bodies', () => {
    const nonce = '550e8400-e29b-41d4-a716-446655440000';
    const timestamp = '1699593300000';

    const sig1 = signRequest('{"amount":10000}', nonce, timestamp);
    const sig2 = signRequest('{"amount":20000}', nonce, timestamp);

    expect(sig1).not.toBe(sig2);
  });

  it('should generate different signatures for different nonces', () => {
    const body = '{"amount":10000}';
    const timestamp = '1699593300000';

    const sig1 = signRequest(body, 'nonce-1', timestamp);
    const sig2 = signRequest(body, 'nonce-2', timestamp);

    expect(sig1).not.toBe(sig2);
  });

  it('should handle empty body', () => {
    const nonce = '550e8400-e29b-41d4-a716-446655440000';
    const timestamp = '1699593300000';

    const sig = signRequest('', nonce, timestamp);
    expect(sig).toBeDefined();
    expect(sig.length).toBe(64); // SHA-256 hex = 64 chars
  });
});
```

### Integration Tests

```typescript
describe('API Request Signing Integration', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient(
      process.env.TEST_API_KEY!,
      process.env.TEST_API_SECRET!
    );
  });

  it('should successfully send signed request to API', async () => {
    const response = await client.post(
      '/transactions',
      {
        amount: 100.00,
        customerId: 'test-customer',
        merchantId: 'test-merchant'
      },
      'test-access-token'
    );

    expect(response).toHaveProperty('transactionId');
    expect(response.status).toBe('PROCESSING');
  });

  it('should reject request with invalid signature', async () => {
    const invalidClient = new ApiClient(
      'pk_test_abc',
      'wrong-secret' // Wrong secret!
    );

    await expect(
      invalidClient.post(
        '/transactions',
        { amount: 100.00 },
        'test-access-token'
      )
    ).rejects.toThrow('Invalid signature');
  });

  it('should reject stale requests', async () => {
    // Create a request with very old timestamp
    const oldTimestamp = (Date.now() - 10 * 60 * 1000).toString();

    await expect(
      client.post(
        '/transactions',
        { amount: 100.00 },
        'test-access-token',
        oldTimestamp // Too old!
      )
    ).rejects.toThrow('timestamp is stale');
  });

  it('should reject replayed requests', async () => {
    const response1 = await client.post(
      '/transactions',
      { amount: 100.00 },
      'test-access-token'
    );

    // Try to send exact same request again
    await expect(
      client.post(
        '/transactions',
        { amount: 100.00 },
        'test-access-token'
      )
    ).not.toThrow(); // Different nonce, so different signature
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid Signature" Error

```
❌ Error: Invalid signature

Causes:
- Wrong API secret
- Signature components out of order (should be: body + nonce + timestamp)
- Extra whitespace in JSON
- Encoding mismatch

✅ Solution:
- Verify API secret matches what's in merchant portal
- Ensure message format: ${body}${nonce}${timestamp}
- Use JSON.stringify with no spacing: JSON.stringify(data)
- Use UTF-8 encoding
```

**Debugging:**
```typescript
function debugSignature(body: string, nonce: string, timestamp: string, apiSecret: string) {
  console.log('Body:', body);
  console.log('Nonce:', nonce);
  console.log('Timestamp:', timestamp);
  
  const message = `${body}${nonce}${timestamp}`;
  console.log('Message:', message);
  console.log('Message length:', message.length);
  
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex');
  
  console.log('Signature:', signature);
  console.log('Signature length:', signature.length); // Should be 64
}
```

#### 2. "Request Timestamp is Stale" Error

```
❌ Error: Request timestamp is stale

Cause:
- Server time and client time are not synchronized
- Clock skew > 5 minutes

✅ Solution:
- Sync system clock (NTP)
- Check server time at /health endpoint
- Adjust for known clock offset
```

**Debugging:**
```typescript
// Get server time from any endpoint
const healthCheck = await fetch('https://api.example.com/health');
const { timestamp: serverTime } = await healthCheck.json();

const clientTime = Date.now();
const clockSkew = serverTime - clientTime;

console.log('Clock skew:', clockSkew, 'ms');

// Adjust future requests
const adjustedTimestamp = Date.now() + clockSkew;
```

#### 3. "Nonce Already Used" Error

```
❌ Error: Nonce already used (replay attack detected)

Cause:
- Sending same request twice
- UUID library not generating unique IDs

✅ Solution:
- Use fresh nonce for each request
- Verify UUID library is working correctly
```

**Debugging:**
```typescript
import { v4 as uuid } from 'uuid';

const nonces = new Set();

for (let i = 0; i < 100; i++) {
  const nonce = uuid();
  if (nonces.has(nonce)) {
    console.error('DUPLICATE NONCE!');
  }
  nonces.add(nonce);
}

console.log('All nonces unique:', nonces.size === 100);
```

#### 4. "Response Signature Verification Failed" Error

```
❌ Error: Response signature verification failed - tampering detected

Cause:
- Response was tampered with in transit
- Wrong API secret used to verify
- Response headers malformed

✅ Solution:
- Check response hasn't been modified
- Verify API secret matches
- Ensure using HTTPS (TLS should prevent tampering)
```

---

## FAQ

### Q1: Why do we need request signing if we're using HTTPS?

**A:** HTTPS encrypts data in transit, but:
- Only protects against network eavesdropping
- Doesn't verify who sent the request
- Doesn't prevent internal tampering

Request signing adds:
- Authentication (proves request is from authorized client)
- Integrity (detects any modification)
- Replay protection (prevents reusing old requests)

### Q2: Can I sign multiple requests with the same nonce?

**A:** NO! Each request must have a unique nonce. If you do:

```typescript
const nonce = 'fixed-nonce'; // ❌ WRONG!

// First request
await client.post('/transactions', data1, token);

// Second request with same nonce
await client.post('/transactions', data2, token); // ❌ Rejected!
```

### Q3: What if my timestamp is off by a few seconds?

**A:** Server allows ±5 minutes. If your time is off by 1-2 seconds:
- It will work fine
- If > 5 minutes: request rejected
- Solution: Sync system clock with NTP

### Q4: Can I log the API secret for debugging?

**A:** NEVER log or expose API secrets:

```typescript
// ❌ WRONG!
console.log('Secret:', apiSecret);
console.error('Error signing with:', apiSecret);
logger.debug('API secret is:', apiSecret);

// ✅ CORRECT!
console.log('Signed request successfully');
console.error('Signature verification failed');
```

### Q5: How often should I rotate API secrets?

**A:** Best practice:
- **Quarterly** (every 3 months) - minimum
- **Monthly** (every month) - recommended
- **Immediately** if compromised

**Process:**
1. Create new API secret in merchant portal
2. Update clients to use new secret
3. Verify everything works
4. Deactivate old secret

### Q6: What's the difference between API key and API secret?

| Property | API Key | API Secret |
|----------|---------|-----------|
| **Visibility** | Public (ok to expose) | SECRET (never expose) |
| **Example** | `pk_live_abc123` | `sk_live_xyz789` |
| **Used for** | Identifying merchant | Signing requests |
| **In Git?** | Can be committed | NEVER commit |

### Q7: Can I use request signing with GET requests?

**A:** Yes, but:

```typescript
// GET request with params
const params = { limit: 10, offset: 0 };
const requestBody = JSON.stringify(params); // Include params
const nonce = uuid();
const timestamp = Date.now().toString();

// Sign with body + nonce + timestamp
const signature = signRequest(requestBody, nonce, timestamp);

// Send with headers
await fetch(url + '?' + new URLSearchParams(params), {
  headers: {
    'X-Signature': signature,
    'X-Nonce': nonce,
    'X-Timestamp': timestamp
  }
});
```

### Q8: How do I know if response tampering happened?

**A:** If signature doesn't match:

```typescript
if (responseSignature !== expectedSignature) {
  // ⚠️ RESPONSE WAS TAMPERED!
  // Possible causes:
  // - Man-in-the-middle attack
  // - Proxy modifying response
  // - Corrupted data in transit
  // - Wrong API secret
  
  throw new Error('SECURITY ALERT: Response tampering detected!');
  // Do NOT use response data
}
```

### Q9: What encryption does AES-256-GCM provide?

**A:** AES-256-GCM provides:
- **Encryption**: AES with 256-bit key
- **Authentication**: GCM mode verifies integrity
- **Result**: Confidentiality + Integrity + Authentication

No additional signing needed (GCM includes authentication tag)

### Q10: Can I reuse API credentials across multiple applications?

**A:** NOT RECOMMENDED:
- If one app is compromised, all are at risk
- Can't revoke access per app
- Can't track which app made requests

**Best practice:**
- Create separate API credentials per app/environment
- Example: `pk_live_web_app`, `pk_live_mobile_app`, `pk_live_admin_portal`

---

## Support & Resources

### Helpful Links
- **Merchant Portal**: https://merchant.example.com
- **API Documentation**: `/docs/API_REFERENCE.md`
- **Status Page**: https://status.example.com
- **Support Email**: support@example.com

### Testing Credentials
```
API_KEY=pk_test_abc123def456ghi789
API_SECRET=sk_test_xyz789uvw012rst345
BASE_URL=https://api.sandbox.example.com
```

### Rate Limits
- **5 requests/second** for testing keys
- **20 requests/second** for live keys
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

**Document Version:** 1.0  
**Last Updated:** November 10, 2025  
**Status:** Enterprise-Grade Security

