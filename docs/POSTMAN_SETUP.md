# Postman Setup Guide for SentinelPay API

This guide provides ready-to-use Postman scripts for automatic request signing with HMAC-SHA256.

## Quick Setup

### 1. Set Environment Variables

In Postman, create a new environment with these variables:

| Variable Name | Type | Example Value | Description |
|--------------|------|---------------|-------------|
| `API_KEY` | default | `test_key_12345` | Your API Key (public) |
| `API_SECRET` | secret | `test_secret_67890` | Your API Secret (keep secret!) |
| `BASE_URL` | default | `http://localhost:3000` | API base URL |

**How to create environment:**
1. Click "Environments" in left sidebar
2. Click "+" to create new environment
3. Name it "SentinelPay Local" (or "SentinelPay Production")
4. Add the variables above
5. Mark `API_SECRET` as "secret" type
6. Save and select the environment

---

## Pre-Request Script

Copy this script into your **Collection** or **Request** pre-request script tab:

```javascript
// ============================================================================
// SentinelPay API Request Signing - Pre-Request Script
// ============================================================================
// This script automatically signs all requests using HMAC-SHA256
// Based on the specification in REQUEST_SIGNING_GUIDE.md
// ============================================================================

console.log('🔐 Starting request signing process...');

// ---------------------------------------------------------------------------
// 1. Get API credentials from environment
// ---------------------------------------------------------------------------
const apiKey = pm.environment.get('API_KEY');
const apiSecret = pm.environment.get('API_SECRET');
const baseUrl = pm.environment.get('BASE_URL') || 'http://localhost:3000';

// Validate credentials
if (!apiKey || !apiSecret) {
    console.error('❌ ERROR: API_KEY or API_SECRET not found in environment variables!');
    console.log('Please set up your environment with API_KEY and API_SECRET');
    throw new Error('Missing API credentials');
}

console.log('✓ API credentials loaded');
console.log('  API Key:', apiKey.substring(0, 10) + '...');

// ---------------------------------------------------------------------------
// 2. Generate nonce (unique request identifier)
// ---------------------------------------------------------------------------
// Using SHA256 hash of timestamp + random number (same as K6 tests)
const nonceInput = `${Date.now()}-${Math.random()}`;
const nonce = CryptoJS.SHA256(nonceInput).toString(CryptoJS.enc.Hex);

console.log('✓ Nonce generated:', nonce.substring(0, 20) + '...');

// ---------------------------------------------------------------------------
// 3. Get current timestamp (ISO 8601 format)
// ---------------------------------------------------------------------------
const timestamp = new Date().toISOString();

console.log('✓ Timestamp generated:', timestamp);

// ---------------------------------------------------------------------------
// 4. Prepare request body
// ---------------------------------------------------------------------------
let requestBody = '';

// Handle different request methods
if (pm.request.method === 'POST' || pm.request.method === 'PUT' || pm.request.method === 'PATCH') {
    // Get the raw body (for POST/PUT/PATCH requests)
    if (pm.request.body && pm.request.body.raw) {
        requestBody = pm.request.body.raw;
    } else if (pm.request.body && pm.request.body.mode === 'raw') {
        requestBody = pm.request.body.toString();
    } else {
        requestBody = '';
    }
} else {
    // For GET/DELETE requests, use empty string
    requestBody = '';
}

console.log('✓ Request body prepared');
console.log('  Method:', pm.request.method);
console.log('  Body length:', requestBody.length, 'characters');

// ---------------------------------------------------------------------------
// 5. Create message to sign
// ---------------------------------------------------------------------------
// Format: {requestBody}{nonce}{timestamp}
// NO delimiters, NO spaces - just concatenation
const message = `${requestBody}${nonce}${timestamp}`;

console.log('✓ Message to sign created');
console.log('  Message length:', message.length, 'characters');
console.log('  Message preview:', message.substring(0, 100) + '...');

// ---------------------------------------------------------------------------
// 6. Generate HMAC-SHA256 signature
// ---------------------------------------------------------------------------
const signature = CryptoJS.HmacSHA256(message, apiSecret).toString(CryptoJS.enc.Hex);

console.log('✓ Signature generated:', signature.substring(0, 20) + '...');

// ---------------------------------------------------------------------------
// 7. Set request headers
// ---------------------------------------------------------------------------
pm.request.headers.upsert({
    key: 'X-API-Key',
    value: apiKey
});

pm.request.headers.upsert({
    key: 'X-Request-Signature',
    value: signature
});

pm.request.headers.upsert({
    key: 'X-Request-Nonce',
    value: nonce
});

pm.request.headers.upsert({
    key: 'X-Request-Timestamp',
    value: timestamp
});

// Set Content-Type for requests with body
if (requestBody) {
    pm.request.headers.upsert({
        key: 'Content-Type',
        value: 'application/json'
    });
}

console.log('✓ Headers set successfully');
console.log('─────────────────────────────────────────────────────────────');
console.log('📋 Request Summary:');
console.log('  X-API-Key:', apiKey.substring(0, 15) + '...');
console.log('  X-Request-Signature:', signature.substring(0, 20) + '...');
console.log('  X-Request-Nonce:', nonce.substring(0, 20) + '...');
console.log('  X-Request-Timestamp:', timestamp);
console.log('─────────────────────────────────────────────────────────────');
console.log('✅ Request signing complete! Ready to send...');

// ---------------------------------------------------------------------------
// 8. Store values in environment for tests/debugging
// ---------------------------------------------------------------------------
pm.environment.set('LAST_NONCE', nonce);
pm.environment.set('LAST_TIMESTAMP', timestamp);
pm.environment.set('LAST_SIGNATURE', signature);
```

---

## Post-Request Script (Tests)

Copy this script into your **Collection** or **Request** tests tab:

```javascript
// ============================================================================
// SentinelPay API Request Signing - Post-Request Script (Tests)
// ============================================================================
// This script validates the response and can verify response signatures
// ============================================================================

console.log('📊 Starting response validation...');

// ---------------------------------------------------------------------------
// 1. Basic response validation
// ---------------------------------------------------------------------------
pm.test('Response status code is successful', function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
});

pm.test('Response time is acceptable', function () {
    pm.expect(pm.response.responseTime).to.be.below(5000); // 5 seconds
});

pm.test('Response has JSON content', function () {
    pm.response.to.have.header('Content-Type');
    pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});

// ---------------------------------------------------------------------------
// 2. Response structure validation
// ---------------------------------------------------------------------------
if (pm.response.code >= 200 && pm.response.code < 300) {
    const responseData = pm.response.json();

    pm.test('Response has expected structure', function () {
        pm.expect(responseData).to.be.an('object');
    });

    // Log response for debugging
    console.log('✓ Response received successfully');
    console.log('  Status:', pm.response.code, pm.response.status);
    console.log('  Response time:', pm.response.responseTime, 'ms');
}

// ---------------------------------------------------------------------------
// 3. Response signature verification (if implemented)
// ---------------------------------------------------------------------------
// Uncomment this section when response signing is implemented on the server

/*
const responseSignature = pm.response.headers.get('X-Response-Signature');
const responseNonce = pm.response.headers.get('X-Response-Nonce');
const responseTimestamp = pm.response.headers.get('X-Response-Timestamp');

if (responseSignature && responseNonce && responseTimestamp) {
    console.log('🔒 Verifying response signature...');

    const apiSecret = pm.environment.get('API_SECRET');
    const responseBody = pm.response.text();

    // Create message: {responseBody}{nonce}{timestamp}
    const message = `${responseBody}${responseNonce}${responseTimestamp}`;

    // Calculate expected signature
    const expectedSignature = CryptoJS.HmacSHA256(message, apiSecret).toString(CryptoJS.enc.Hex);

    pm.test('Response signature is valid', function () {
        pm.expect(responseSignature).to.equal(expectedSignature);
    });

    console.log('✓ Response signature verified');
} else {
    console.log('ℹ️  Response signing not implemented yet (expected)');
}
*/

// ---------------------------------------------------------------------------
// 4. Security headers validation
// ---------------------------------------------------------------------------
pm.test('Security headers are present', function () {
    // Check for common security headers
    const headers = pm.response.headers;

    // These are optional but recommended
    // Uncomment as your API adds these headers
    // pm.expect(headers.has('X-Content-Type-Options')).to.be.true;
    // pm.expect(headers.has('X-Frame-Options')).to.be.true;
    // pm.expect(headers.has('Strict-Transport-Security')).to.be.true;
});

// ---------------------------------------------------------------------------
// 5. Log full response for debugging
// ---------------------------------------------------------------------------
console.log('─────────────────────────────────────────────────────────────');
console.log('📋 Response Summary:');
console.log('  Status:', pm.response.code, pm.response.status);
console.log('  Time:', pm.response.responseTime, 'ms');
console.log('  Size:', pm.response.responseSize, 'bytes');
console.log('─────────────────────────────────────────────────────────────');
console.log('✅ Response validation complete!');

// ---------------------------------------------------------------------------
// 6. Error handling and detailed logging
// ---------------------------------------------------------------------------
if (pm.response.code >= 400) {
    console.error('❌ Request failed with error:');
    console.error('  Status:', pm.response.code, pm.response.status);

    try {
        const errorData = pm.response.json();
        console.error('  Error details:', JSON.stringify(errorData, null, 2));
    } catch (e) {
        console.error('  Error body:', pm.response.text());
    }

    // Log request details for debugging
    console.log('📤 Request details:');
    console.log('  Method:', pm.request.method);
    console.log('  URL:', pm.request.url.toString());
    console.log('  Nonce:', pm.environment.get('LAST_NONCE')?.substring(0, 20) + '...');
    console.log('  Timestamp:', pm.environment.get('LAST_TIMESTAMP'));
    console.log('  Signature:', pm.environment.get('LAST_SIGNATURE')?.substring(0, 20) + '...');
}
```

---

## Collection-Level Setup (Recommended)

For best results, add the scripts at the **Collection level** so they apply to all requests:

1. Right-click your SentinelPay collection
2. Click "Edit"
3. Go to "Pre-request Scripts" tab
4. Paste the pre-request script
5. Go to "Tests" tab
6. Paste the post-request script
7. Save

Now ALL requests in the collection will be automatically signed!

---

## Request Examples

### Example 1: Create Transaction (POST)

**Request:**
```
POST {{BASE_URL}}/api/v1/transactions
```

**Body (raw JSON):**
```json
{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 10000.00,
  "merchantId": "merchant-001",
  "description": "Payment for order #12345"
}
```

The pre-request script will automatically add:
- ✅ X-API-Key
- ✅ X-Request-Signature
- ✅ X-Request-Nonce
- ✅ X-Request-Timestamp

---

### Example 2: Get Transaction (GET)

**Request:**
```
GET {{BASE_URL}}/api/v1/transactions/550e8400-e29b-41d4-a716-446655440000
```

The pre-request script will automatically sign the request (with empty body for GET requests).

---

### Example 3: Update Transaction (PATCH)

**Request:**
```
PATCH {{BASE_URL}}/api/v1/transactions/550e8400-e29b-41d4-a716-446655440000
```

**Body (raw JSON):**
```json
{
  "status": "completed"
}
```

---

## Testing Public Endpoints

Some endpoints may be marked as `@Public()` and don't require signing. To test these:

1. Create a separate folder in your collection called "Public Endpoints"
2. Remove the pre-request script from this folder (right-click folder → Edit → Pre-request Scripts → clear)
3. Add your public endpoints here

---

## Debugging Tips

### View Console Logs
1. Open Postman Console (View → Show Postman Console, or Cmd/Ctrl + Alt + C)
2. Send a request
3. See detailed logging of the signing process:
   ```
   🔐 Starting request signing process...
   ✓ API credentials loaded
   ✓ Nonce generated: 8f3a2b1c...
   ✓ Timestamp generated: 2025-11-13T18:30:00.000Z
   ✓ Request body prepared
   ✓ Message to sign created
   ✓ Signature generated: a1b2c3d4...
   ✓ Headers set successfully
   ✅ Request signing complete!
   ```

### Common Issues

**Issue 1: "Missing API credentials"**
- Solution: Set `API_KEY` and `API_SECRET` in your environment

**Issue 2: "401 Unauthorized"**
- Check API credentials are correct
- Verify the endpoint requires authentication
- Check console for signature details

**Issue 3: "Signature mismatch"**
- Verify request body is valid JSON
- Check for extra whitespace in body
- Ensure environment variables are set correctly
- Verify API_SECRET matches server-side secret

**Issue 4: "Timestamp out of range"**
- Server accepts ±5 minutes
- Check your system clock is correct
- Try syncing system time

---

## Security Best Practices

### ⚠️ IMPORTANT SECURITY NOTES

1. **Never commit API secrets**
   - Use environment variables
   - Mark `API_SECRET` as "secret" type in Postman
   - Never share exported collections with secrets

2. **Use HTTPS in production**
   - Change `BASE_URL` to `https://` in production environment
   - Never send API secrets over HTTP

3. **Separate environments**
   - Create separate environments for:
     - Local Development (`http://localhost:3000`)
     - Staging (`https://staging-api.sentinelpay.com`)
     - Production (`https://api.sentinelpay.com`)

4. **Rotate credentials regularly**
   - Generate new API keys periodically
   - Revoke old keys when no longer needed

5. **Limit access**
   - Only share API keys with team members who need them
   - Use team workspaces in Postman with proper access controls

---

## Environment Setup Examples

### Local Development Environment

```
Environment Name: SentinelPay - Local
Variables:
  API_KEY       = test_key_12345
  API_SECRET    = test_secret_67890  (secret)
  BASE_URL      = http://localhost:3000
```

### Staging Environment

```
Environment Name: SentinelPay - Staging
Variables:
  API_KEY       = pk_test_abc123def456
  API_SECRET    = sk_test_xyz789uvw012  (secret)
  BASE_URL      = https://staging-api.sentinelpay.com
```

### Production Environment

```
Environment Name: SentinelPay - Production
Variables:
  API_KEY       = pk_live_abc123def456
  API_SECRET    = sk_live_xyz789uvw012  (secret)
  BASE_URL      = https://api.sentinelpay.com
```

---

## Advanced: Request-Specific Overrides

If you need to override API credentials for a specific request:

1. Add these lines at the top of the request's pre-request script:
   ```javascript
   pm.environment.set('API_KEY', 'custom_key_here');
   pm.environment.set('API_SECRET', 'custom_secret_here');
   ```

2. The collection-level script will use these overrides

---

## Testing Signature Verification

To test if your signature is correct without a running server:

1. Use the `/test/verify-signature` endpoint (when implemented)
2. Compare your signature with K6 test outputs
3. Use the console logs to verify each step

---

## Related Documentation

- **Full Implementation Guide:** [REQUEST_SIGNING_GUIDE.md](./REQUEST_SIGNING_GUIDE.md)
- **Architecture Overview:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **K6 Load Tests:** `/k6_tests/03_request_signing_test.js`

---

## Support

If you encounter issues:

1. Check the Postman Console for detailed logs
2. Verify environment variables are set correctly
3. Review the REQUEST_SIGNING_GUIDE.md for specification details
4. Compare with K6 test examples in `/k6_tests/`

---

**Last Updated:** November 13, 2025
**Version:** 1.0
**Compatibility:** Postman v10.0+
