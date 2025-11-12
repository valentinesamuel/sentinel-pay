# API Documentation - Payment Platform

**Version:** 1.0.0
**Base URL:** `http://localhost:3000/api/v1`
**Protocol:** HTTPS/TLS 1.3
**Format:** JSON

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Common Patterns](#common-patterns)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Pagination](#pagination)
7. [API Endpoints](#api-endpoints)
8. [Webhooks](#webhooks)
9. [SDKs & Libraries](#sdks--libraries)

---

## API Overview

### Design Principles

- **RESTful:** Resource-based URLs, HTTP verbs
- **Stateless:** No server-side sessions
- **Versioned:** URI versioning (`/v1`, `/v2`)
- **Consistent:** Standard patterns across all endpoints
- **Secure:** HTTPS only, JWT authentication
- **Idempotent:** Support for idempotency keys

### Request Headers

```http
POST /api/v1/payments HTTP/1.1
Host: api.paymentplatform.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
X-Request-ID: 7c9e6679-7425-40de-944b-e07fc1f90ae7
User-Agent: MyApp/1.0.0
```

### Response Headers

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Request-ID: 7c9e6679-7425-40de-944b-e07fc1f90ae7
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800
```

---

## Authentication

### JWT Bearer Token

All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer {access_token}
```

### Obtaining Tokens

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "kyc_tier": 1
    }
  }
}
```

### Token Refresh

**Endpoint:** `POST /api/v1/auth/refresh`

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

---

## Common Patterns

### Standard Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": {
    // Response payload
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be positive"
      }
    ]
  }
}
```

### Idempotency

Use `X-Idempotency-Key` header for idempotent operations:

```http
POST /api/v1/payments
X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

**Rules:**
- Must be a valid UUID v4
- Same key + same payload = cached response
- Same key + different payload = 409 Conflict
- TTL: 24 hours

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Business logic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service down |

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `AUTHENTICATION_FAILED` | Invalid credentials | 401 |
| `TOKEN_EXPIRED` | JWT token expired | 401 |
| `TOKEN_INVALID` | JWT token invalid | 401 |
| `INSUFFICIENT_PERMISSIONS` | No permission | 403 |
| `RESOURCE_NOT_FOUND` | Resource not found | 404 |
| `DUPLICATE_RESOURCE` | Resource exists | 409 |
| `INSUFFICIENT_BALANCE` | Not enough funds | 422 |
| `TRANSACTION_LIMIT_EXCEEDED` | Limit exceeded | 422 |
| `KYC_VERIFICATION_REQUIRED` | KYC needed | 422 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### Error Response Examples

**Validation Error (400):**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email must be valid"
      },
      {
        "field": "amount",
        "message": "Amount must be positive"
      }
    ]
  }
}
```

**Business Logic Error (422):**
```json
{
  "status": "error",
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance in wallet",
    "details": {
      "available_balance": 5000,
      "required_amount": 10000,
      "currency": "NGN"
    }
  }
}
```

---

## Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800
```

### Rate Limits by Endpoint

| Endpoint Pattern | Limit | Window |
|-----------------|-------|--------|
| `/auth/login` | 5 req | 15 min |
| `/auth/register` | 3 req | 1 hour |
| `/payments/*` | 10 req | 1 min |
| `/transfers/*` | 10 req | 1 min |
| `/wallets/*` | 30 req | 1 min |
| `/transactions/*` | 30 req | 1 min |
| Global | 100 req | 1 min |

### Rate Limit Exceeded Response (429)

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 300
  }
}
```

---

## Pagination

### Query Parameters

```http
GET /api/v1/transactions?page=1&limit=20&sort=created_at&order=desc
```

**Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page
- `sort` - Sort field
- `order` (asc/desc) - Sort order

### Paginated Response

```json
{
  "status": "success",
  "data": [
    // Array of items
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## API Endpoints

### Authentication

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+2348012345678",
  "country_code": "NG"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "email_verified": false,
      "kyc_tier": 0
    },
    "message": "Verification email sent"
  }
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "kyc_tier": 1
    }
  }
}
```

#### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer {token}

{
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### Wallets

#### Get All Wallets

```http
GET /api/v1/wallets
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "currency": "NGN",
      "available_balance": 50000,
      "ledger_balance": 50000,
      "pending_balance": 0,
      "status": "active",
      "is_primary": true,
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "currency": "USD",
      "available_balance": 10000,
      "ledger_balance": 10000,
      "pending_balance": 0,
      "status": "active",
      "is_primary": false,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Note:** Amounts are in minor units (kobo for NGN, cents for USD)

#### Get Single Wallet

```http
GET /api/v1/wallets/:id
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "currency": "NGN",
    "available_balance": 50000,
    "ledger_balance": 50000,
    "pending_balance": 0,
    "status": "active",
    "is_primary": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

#### Create Wallet

```http
POST /api/v1/wallets
Authorization: Bearer {token}
Content-Type: application/json

{
  "currency": "USD"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "currency": "USD",
    "available_balance": 0,
    "ledger_balance": 0,
    "pending_balance": 0,
    "status": "active",
    "is_primary": false,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### Payments

#### Create Payment

```http
POST /api/v1/payments
Authorization: Bearer {token}
X-Idempotency-Key: {uuid}
Content-Type: application/json

{
  "wallet_id": "uuid",
  "amount": 50000,
  "currency": "NGN",
  "payment_method": "card",
  "card_id": "uuid",
  "description": "Payment for order #12345",
  "metadata": {
    "order_id": "12345",
    "customer_name": "John Doe"
  }
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "reference": "TXN-20240115103045-A3F5K9",
    "amount": 50000,
    "currency": "NGN",
    "fee": 100,
    "tax": 0,
    "net_amount": 49900,
    "status": "pending",
    "payment_method": "card",
    "description": "Payment for order #12345",
    "created_at": "2024-01-15T10:30:45Z"
  }
}
```

#### Get Payment

```http
GET /api/v1/payments/:id
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "reference": "TXN-20240115103045-A3F5K9",
    "amount": 50000,
    "currency": "NGN",
    "fee": 100,
    "tax": 0,
    "net_amount": 49900,
    "status": "completed",
    "payment_method": "card",
    "card": {
      "id": "uuid",
      "last4": "4242",
      "brand": "visa",
      "exp_month": 12,
      "exp_year": 2025
    },
    "description": "Payment for order #12345",
    "metadata": {
      "order_id": "12345"
    },
    "completed_at": "2024-01-15T10:30:50Z",
    "created_at": "2024-01-15T10:30:45Z"
  }
}
```

#### List Payments

```http
GET /api/v1/payments?page=1&limit=20&status=completed
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "reference": "TXN-20240115103045-A3F5K9",
      "amount": 50000,
      "currency": "NGN",
      "status": "completed",
      "payment_method": "card",
      "created_at": "2024-01-15T10:30:45Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

### Transfers

#### Create P2P Transfer

```http
POST /api/v1/transfers
Authorization: Bearer {token}
X-Idempotency-Key: {uuid}
Content-Type: application/json

{
  "source_wallet_id": "uuid",
  "recipient_email": "recipient@example.com",
  "amount": 10000,
  "currency": "NGN",
  "description": "Payment for lunch",
  "pin": "1234"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "reference": "TXN-20240115103045-A3F5K9",
    "type": "p2p_transfer",
    "amount": 10000,
    "currency": "NGN",
    "fee": 0,
    "status": "completed",
    "recipient": {
      "name": "Jane Doe",
      "email": "recipient@example.com"
    },
    "description": "Payment for lunch",
    "created_at": "2024-01-15T10:30:45Z",
    "completed_at": "2024-01-15T10:30:46Z"
  }
}
```

#### Create Bank Transfer

```http
POST /api/v1/transfers/bank
Authorization: Bearer {token}
X-Idempotency-Key: {uuid}
Content-Type: application/json

{
  "source_wallet_id": "uuid",
  "bank_account_id": "uuid",
  "amount": 50000,
  "currency": "NGN",
  "description": "Withdrawal to bank",
  "pin": "1234"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "reference": "TXN-20240115103045-A3F5K9",
    "type": "bank_transfer",
    "amount": 50000,
    "currency": "NGN",
    "fee": 50,
    "status": "processing",
    "bank_account": {
      "bank_name": "GTBank",
      "account_number": "0123456789",
      "account_name": "John Doe"
    },
    "description": "Withdrawal to bank",
    "created_at": "2024-01-15T10:30:45Z"
  }
}
```

---

### Transactions

#### List Transactions

```http
GET /api/v1/transactions?page=1&limit=20&type=payment&status=completed
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `type` - Transaction type (payment, transfer, refund, etc.)
- `status` - Transaction status (pending, completed, failed, etc.)
- `from_date` - Start date (ISO 8601)
- `to_date` - End date (ISO 8601)
- `currency` - Currency filter (NGN, USD, etc.)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "reference": "TXN-20240115103045-A3F5K9",
      "type": "payment",
      "category": "card_payment",
      "amount": 50000,
      "currency": "NGN",
      "fee": 100,
      "net_amount": 49900,
      "status": "completed",
      "description": "Payment for order #12345",
      "created_at": "2024-01-15T10:30:45Z",
      "completed_at": "2024-01-15T10:30:50Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

#### Get Transaction Details

```http
GET /api/v1/transactions/:reference
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "reference": "TXN-20240115103045-A3F5K9",
    "type": "payment",
    "category": "card_payment",
    "amount": 50000,
    "currency": "NGN",
    "fee": 100,
    "tax": 0,
    "net_amount": 49900,
    "status": "completed",
    "description": "Payment for order #12345",
    "metadata": {
      "order_id": "12345"
    },
    "payment_method": "card",
    "card": {
      "last4": "4242",
      "brand": "visa"
    },
    "provider_reference": "ch_1234567890",
    "created_at": "2024-01-15T10:30:45Z",
    "completed_at": "2024-01-15T10:30:50Z",
    "ledger_entries": [
      {
        "type": "debit",
        "amount": 50100,
        "wallet_id": "uuid",
        "balance_after": 49900
      }
    ]
  }
}
```

---

### Cards

#### Link Card

```http
POST /api/v1/cards
Authorization: Bearer {token}
Content-Type: application/json

{
  "card_number": "4242424242424242",
  "exp_month": 12,
  "exp_year": 2025,
  "cvv": "123",
  "cardholder_name": "John Doe",
  "billing_address": {
    "line1": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "postal_code": "100001",
    "country": "NG"
  }
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "last4": "4242",
    "brand": "visa",
    "exp_month": 12,
    "exp_year": 2025,
    "cardholder_name": "John Doe",
    "status": "active",
    "created_at": "2024-01-15T10:30:45Z"
  }
}
```

#### List Cards

```http
GET /api/v1/cards
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "last4": "4242",
      "brand": "visa",
      "exp_month": 12,
      "exp_year": 2025,
      "cardholder_name": "John Doe",
      "status": "active",
      "is_default": true,
      "created_at": "2024-01-15T10:30:45Z"
    }
  ]
}
```

#### Delete Card

```http
DELETE /api/v1/cards/:id
Authorization: Bearer {token}
```

**Response (204 No Content)**

---

### Bill Payments

#### Get Bill Categories

```http
GET /api/v1/bills/categories
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "code": "airtime",
      "name": "Airtime",
      "description": "Mobile airtime recharge"
    },
    {
      "code": "data",
      "name": "Data Bundles",
      "description": "Mobile data bundles"
    },
    {
      "code": "electricity",
      "name": "Electricity",
      "description": "Electricity bill payments"
    }
  ]
}
```

#### Get Billers

```http
GET /api/v1/bills/billers?category=airtime
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "code": "mtn",
      "name": "MTN Nigeria",
      "category": "airtime"
    },
    {
      "code": "glo",
      "name": "Glo Mobile",
      "category": "airtime"
    }
  ]
}
```

#### Pay Bill

```http
POST /api/v1/bills/pay
Authorization: Bearer {token}
X-Idempotency-Key: {uuid}
Content-Type: application/json

{
  "wallet_id": "uuid",
  "category": "airtime",
  "biller_code": "mtn",
  "amount": 1000,
  "customer_id": "08012345678",
  "pin": "1234"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "reference": "TXN-20240115103045-A3F5K9",
    "category": "airtime",
    "biller": "MTN Nigeria",
    "amount": 1000,
    "currency": "NGN",
    "customer_id": "08012345678",
    "status": "completed",
    "created_at": "2024-01-15T10:30:45Z",
    "completed_at": "2024-01-15T10:30:47Z"
  }
}
```

---

### FX Rates

#### Get Exchange Rates

```http
GET /api/v1/fx/rates?from=NGN&to=USD
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "from": "NGN",
    "to": "USD",
    "rate": 0.00125,
    "inverse_rate": 800,
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

#### Convert Currency

```http
POST /api/v1/fx/convert
Authorization: Bearer {token}
Content-Type: application/json

{
  "from": "NGN",
  "to": "USD",
  "amount": 100000
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "from_currency": "NGN",
    "to_currency": "USD",
    "from_amount": 100000,
    "rate": 0.00125,
    "to_amount": 125,
    "fee": 0,
    "total_cost": 100000
  }
}
```

---

### Refunds

#### Request Refund

```http
POST /api/v1/refunds
Authorization: Bearer {token}
X-Idempotency-Key: {uuid}
Content-Type: application/json

{
  "transaction_id": "uuid",
  "amount": 50000,
  "reason": "duplicate_charge",
  "description": "Accidental duplicate payment"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "transaction_id": "uuid",
    "amount": 50000,
    "currency": "NGN",
    "reason": "duplicate_charge",
    "status": "pending",
    "created_at": "2024-01-15T10:30:45Z"
  }
}
```

---

## Webhooks

### Webhook Events

Subscribe to events and receive HTTP callbacks:

| Event | Description |
|-------|-------------|
| `payment.created` | Payment initiated |
| `payment.completed` | Payment successful |
| `payment.failed` | Payment failed |
| `transfer.completed` | Transfer successful |
| `refund.completed` | Refund processed |
| `dispute.created` | Dispute filed |
| `kyc.verified` | KYC approved |
| `wallet.credited` | Wallet received funds |
| `wallet.debited` | Wallet sent funds |

### Register Webhook

```http
POST /api/v1/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://example.com/webhooks/payment",
  "events": [
    "payment.completed",
    "transfer.completed"
  ],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload

```json
{
  "event": "payment.completed",
  "timestamp": "2024-01-15T10:30:50Z",
  "data": {
    "id": "uuid",
    "reference": "TXN-20240115103045-A3F5K9",
    "amount": 50000,
    "currency": "NGN",
    "status": "completed"
  },
  "signature": "sha256=..."
}
```

### Verify Webhook Signature

```typescript
import * as crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return `sha256=${hash}` === signature;
}
```

---

## SDKs & Libraries

### JavaScript/TypeScript

```bash
npm install @payment-platform/sdk
```

```typescript
import { PaymentClient } from '@payment-platform/sdk';

const client = new PaymentClient({
  apiKey: 'your-api-key',
  environment: 'production'
});

const payment = await client.payments.create({
  amount: 50000,
  currency: 'NGN',
  card_id: 'uuid'
});
```

### Python (Future)

```bash
pip install payment-platform
```

---

## Testing

### Swagger UI

Interactive API documentation:

```
http://localhost:3000/api/docs
```

### Postman Collection

Download Postman collection:

```
docs/api/postman-collection.json
```

### Test Cards

Use these test cards with mock provider:

| Card Number | Brand | Result |
|-------------|-------|--------|
| 4242424242424242 | Visa | Success |
| 4000000000000002 | Visa | Card Declined |
| 5555555555554444 | Mastercard | Success |
| 5200000000000007 | Mastercard | Insufficient Funds |

---

## API Changelog

### Version 1.0.0 (Current)
- Initial API release
- Authentication endpoints
- Wallet management
- Payment processing
- Transfer operations
- Bill payments
- Transaction history

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**API Version:** v1
