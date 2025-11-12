# Ubiquitous Tribble - API Reference

> Complete API reference guide for the Ubiquitous Tribble payment platform. All endpoints use JSON and require HTTPS.

**API Version:** 1.0  
**Base URL:** `https://api.example.com/api/v1`  
**WebSocket URL:** `wss://api.example.com/socket.io`  
**Authentication:** JWT Bearer Token

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Wallet & Balances](#wallet--balances)
4. [Payment Methods](#payment-methods)
5. [Transactions](#transactions)
6. [Merchants](#merchants)
7. [Fraud Detection](#fraud-detection)
8. [Disputes & Chargebacks](#disputes--chargebacks)
9. [Subscriptions](#subscriptions)
10. [Bill Payments](#bill-payments)
11. [Refunds](#refunds)
12. [Receipts](#receipts)
13. [Analytics](#analytics)
14. [WebSocket Events](#websocket-events)
15. [Admin Endpoints](#admin-endpoints)
16. [Error Codes](#error-codes)

---

## Authentication

### POST /auth/register

Create a new user account with KYC verification.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+234801234567",
  "dateOfBirth": "1990-01-15",
  "accountType": "individual"
}
```

**Response:** `201 Created`
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "kycStatus": "PENDING",
  "kycTier": 0,
  "createdAt": "2025-11-10T10:30:00Z",
  "message": "Registration successful. Please verify your email and complete KYC."
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email, weak password, missing fields
- `409 Conflict` - Email already registered
- `422 Unprocessable Entity` - Invalid phone number format

---

### POST /auth/login

Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "kycStatus": "APPROVED",
    "kycTier": 2
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Account locked or suspended
- `404 Not Found` - User not found

---

### POST /auth/refresh-token

Get new access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

---

### POST /auth/logout

Invalidate current session.

**Request:**
```json
{
  "tokenId": "jwt-token-identifier"
}
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /auth/kyc-status

Check current KYC verification status.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "kycStatus": "APPROVED",
  "kycTier": 2,
  "submittedAt": "2025-11-05T14:20:00Z",
  "approvedAt": "2025-11-08T09:15:00Z",
  "documents": [
    {
      "documentType": "national_id",
      "status": "VERIFIED",
      "uploadedAt": "2025-11-05T14:20:00Z",
      "verifiedAt": "2025-11-08T09:15:00Z"
    },
    {
      "documentType": "proof_of_address",
      "status": "VERIFIED",
      "uploadedAt": "2025-11-05T14:25:00Z",
      "verifiedAt": "2025-11-08T09:16:00Z"
    }
  ],
  "limits": {
    "dailyLimit": 500000,
    "monthlyLimit": 5000000,
    "transactionsPerDay": 50
  }
}
```

---

### POST /auth/submit-kyc

Submit KYC documents for verification.

**Request (multipart/form-data):**
```
{
  "documentType": "national_id",
  "document": <file>,
  "ocr": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-15",
    "idNumber": "12345678901"
  }
}
```

**Response:** `200 OK`
```json
{
  "submissionId": "kyc-submission-001",
  "status": "SUBMITTED",
  "documentsSubmitted": 2,
  "estimatedReviewTime": "2-3 days",
  "message": "KYC documents submitted successfully"
}
```

---

## User Management

### GET /users/profile

Get current user profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+234801234567",
  "dateOfBirth": "1990-01-15",
  "accountType": "individual",
  "kycStatus": "APPROVED",
  "kycTier": 2,
  "createdAt": "2025-11-01T08:30:00Z",
  "lastLogin": "2025-11-10T10:30:00Z",
  "accountStatus": "ACTIVE"
}
```

---

### PUT /users/profile

Update user profile.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+234801234567"
}
```

**Response:** `200 OK`
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Profile updated successfully",
  "updatedAt": "2025-11-10T10:35:00Z"
}
```

---

### POST /users/change-password

Change account password.

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

---

## Wallet & Balances

### GET /wallets/:walletId

Get wallet balance and details.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "walletId": "wallet-001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "balance": 150000.00,
  "currency": "NGN",
  "status": "ACTIVE",
  "createdAt": "2025-11-01T08:30:00Z",
  "lastTransaction": {
    "transactionId": "txn-001",
    "amount": 5000.00,
    "type": "CREDIT",
    "timestamp": "2025-11-10T10:20:00Z"
  }
}
```

---

### GET /wallets

List all wallets for user.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
```
?currency=NGN&status=ACTIVE&limit=20&offset=0
```

**Response:** `200 OK`
```json
{
  "wallets": [
    {
      "walletId": "wallet-001",
      "currency": "NGN",
      "balance": 150000.00,
      "status": "ACTIVE"
    },
    {
      "walletId": "wallet-002",
      "currency": "USD",
      "balance": 500.00,
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 20,
    "offset": 0
  }
}
```

---

### POST /wallets/fund

Fund wallet from payment method.

**Request:**
```json
{
  "walletId": "wallet-001",
  "amount": 50000.00,
  "paymentMethodId": "card-001"
}
```

**Response:** `201 Created`
```json
{
  "transactionId": "txn-fund-001",
  "walletId": "wallet-001",
  "amount": 50000.00,
  "status": "PROCESSING",
  "transactionFee": 250.00,
  "totalAmount": 50250.00,
  "newBalance": 200250.00,
  "createdAt": "2025-11-10T10:35:00Z"
}
```

---

## Payment Methods

### POST /payment-methods

Add payment method (card or bank account).

**Request (Card):**
```json
{
  "type": "card",
  "cardNumber": "4532015112830366",
  "cardholderName": "John Doe",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvv": "123",
  "isDefault": true
}
```

**Response:** `201 Created`
```json
{
  "paymentMethodId": "card-001",
  "type": "card",
  "last4Digits": "0366",
  "cardholderName": "John Doe",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "brand": "VISA",
  "isDefault": true,
  "isActive": true,
  "createdAt": "2025-11-10T10:35:00Z",
  "message": "Card added successfully. Card has been tokenized."
}
```

**Error Responses:**
- `400 Bad Request` - Invalid card details
- `422 Unprocessable Entity` - Card validation failed

---

### GET /payment-methods

List all payment methods.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "paymentMethods": [
    {
      "paymentMethodId": "card-001",
      "type": "card",
      "last4Digits": "0366",
      "brand": "VISA",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "isDefault": true,
      "isActive": true
    },
    {
      "paymentMethodId": "bank-001",
      "type": "bank_account",
      "bankName": "GTBank",
      "accountNumber": "****5678",
      "accountHolder": "John Doe",
      "isDefault": false,
      "isActive": true
    }
  ]
}
```

---

### DELETE /payment-methods/:paymentMethodId

Remove payment method.

**Response:** `200 OK`
```json
{
  "message": "Payment method deleted successfully",
  "paymentMethodId": "card-001"
}
```

---

## Transactions

### POST /transactions

Create a new transaction (payment).

**Request:**
```json
{
  "amount": 10000.00,
  "currency": "NGN",
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "merchantId": "merchant-001",
  "paymentMethodId": "card-001",
  "description": "Payment for order #12345",
  "metadata": {
    "orderId": "order-12345",
    "reference": "REF-001"
  }
}
```

**Response:** `201 Created`
```json
{
  "transactionId": "txn-001",
  "amount": 10000.00,
  "currency": "NGN",
  "status": "PROCESSING",
  "fraudScore": {
    "score": 25,
    "riskLevel": "LOW",
    "decision": "ALLOW"
  },
  "createdAt": "2025-11-10T10:35:00Z",
  "processorChargeId": "charge_paystackXXX"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid amount or currency
- `402 Payment Required` - Insufficient funds
- `422 Unprocessable Entity` - Transaction validation failed

---

### GET /transactions/:transactionId

Get transaction details.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "transactionId": "txn-001",
  "amount": 10000.00,
  "currency": "NGN",
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "merchantId": "merchant-001",
  "status": "SUCCESS",
  "fraudScore": {
    "score": 25,
    "riskLevel": "LOW",
    "riskFactors": [
      {
        "name": "Amount Deviation",
        "weight": 15,
        "score": 10,
        "explanation": "Amount is within user average"
      }
    ]
  },
  "paymentMethod": {
    "type": "card",
    "last4Digits": "0366",
    "brand": "VISA"
  },
  "processorChargeId": "charge_paystackXXX",
  "processorResponse": {
    "status": "success",
    "message": "Transaction completed successfully"
  },
  "receipt": {
    "receiptId": "rcpt-001",
    "url": "https://cdn.example.com/receipts/rcpt-001.pdf"
  },
  "createdAt": "2025-11-10T10:35:00Z",
  "completedAt": "2025-11-10T10:36:30Z"
}
```

---

### GET /transactions

List transactions with filtering.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
```
?status=SUCCESS&startDate=2025-11-01&endDate=2025-11-10&limit=20&offset=0
```

**Response:** `200 OK`
```json
{
  "transactions": [
    {
      "transactionId": "txn-001",
      "amount": 10000.00,
      "currency": "NGN",
      "merchantId": "merchant-001",
      "status": "SUCCESS",
      "createdAt": "2025-11-10T10:35:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

---

## Merchants

### POST /merchants/register

Register as a merchant.

**Request:**
```json
{
  "businessName": "John's Store",
  "entityType": "sole_proprietor",
  "taxId": "12345678901",
  "industry": "retail",
  "bankAccount": {
    "bankCode": "044",
    "accountNumber": "1234567890",
    "accountHolder": "John Doe"
  }
}
```

**Response:** `201 Created`
```json
{
  "merchantId": "merchant-001",
  "businessName": "John's Store",
  "kycStatus": "PENDING",
  "riskLevel": "medium",
  "message": "Merchant account created. Please complete KYC verification.",
  "createdAt": "2025-11-10T10:35:00Z"
}
```

---

### GET /merchants/:merchantId

Get merchant profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "merchantId": "merchant-001",
  "businessName": "John's Store",
  "entityType": "sole_proprietor",
  "taxId": "12345678901",
  "industry": "retail",
  "kycStatus": "APPROVED",
  "riskLevel": "low",
  "bankAccounts": [
    {
      "accountId": "bank-001",
      "bankCode": "044",
      "accountNumber": "****7890",
      "accountHolder": "John Doe",
      "isVerified": true
    }
  ],
  "settlementSettings": {
    "frequency": "daily",
    "minimumAmount": 1000.00,
    "settlementFeePercent": 0.5,
    "holdPeriodDays": 1
  },
  "metrics": {
    "totalTransactions": 350,
    "totalVolume": 5000000.00,
    "chargebackRate": 0.5,
    "disputeRate": 1.2
  }
}
```

---

### POST /merchants/:merchantId/settlement

Configure settlement settings.

**Request:**
```json
{
  "frequency": "weekly",
  "minimumAmount": 5000.00,
  "settlementFeePercent": 0.75,
  "holdPeriodDays": 2
}
```

**Response:** `200 OK`
```json
{
  "merchantId": "merchant-001",
  "settlementSettings": {
    "frequency": "weekly",
    "minimumAmount": 5000.00,
    "settlementFeePercent": 0.75,
    "holdPeriodDays": 2
  },
  "message": "Settlement settings updated successfully"
}
```

---

### GET /merchants/:merchantId/dashboard

Get merchant dashboard metrics.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "merchantId": "merchant-001",
  "period": {
    "startDate": "2025-11-01",
    "endDate": "2025-11-10"
  },
  "metrics": {
    "totalTransactions": 45,
    "successfulTransactions": 44,
    "failedTransactions": 1,
    "totalVolume": 450000.00,
    "averageTransactionAmount": 10000.00,
    "chargebackCount": 1,
    "chargebackRate": 2.27,
    "disputeCount": 2,
    "refundCount": 3,
    "refundAmount": 15000.00
  },
  "settlements": {
    "totalSettled": 434750.00,
    "nextSettlementDate": "2025-11-11",
    "nextSettlementAmount": 15250.00,
    "pendingAmount": 15250.00
  },
  "topProducts": [
    {
      "name": "Product A",
      "transactionCount": 20,
      "totalAmount": 200000.00
    }
  ]
}
```

---

## Fraud Detection

### GET /transactions/:transactionId/risk-score

Get detailed fraud risk score for transaction.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "transactionId": "txn-001",
  "riskScore": 35,
  "riskLevel": "MEDIUM",
  "decision": "REQUIRE_VERIFICATION",
  "confidence": 0.92,
  "riskFactors": [
    {
      "name": "Amount Deviation",
      "weight": 0.15,
      "score": 45,
      "explanation": "Amount is 2.5x user average transaction"
    },
    {
      "name": "Device Mismatch",
      "weight": 0.10,
      "score": 80,
      "explanation": "New device detected - first time from this device"
    },
    {
      "name": "Velocity Check",
      "weight": 0.12,
      "score": 30,
      "explanation": "3 transactions in last hour - elevated but within limits"
    },
    {
      "name": "Geographic Anomaly",
      "weight": 0.12,
      "score": 10,
      "explanation": "Transaction location consistent with user profile"
    },
    {
      "name": "IP Reputation",
      "weight": 0.07,
      "score": 20,
      "explanation": "IP from residential ISP - low risk"
    }
  ],
  "modelVersion": "1.2.1",
  "calculatedAt": "2025-11-10T10:35:00Z"
}
```

---

### GET /admin/fraud/analytics

Get fraud analytics (admin only).

**Headers:**
```
Authorization: Bearer <adminToken>
```

**Query Parameters:**
```
?startDate=2025-11-01&endDate=2025-11-10&groupBy=daily
```

**Response:** `200 OK`
```json
{
  "period": {
    "startDate": "2025-11-01",
    "endDate": "2025-11-10"
  },
  "summary": {
    "totalTransactions": 1000,
    "fraudulentTransactions": 15,
    "fraudRate": 1.5,
    "averageFraudScore": 42,
    "blockedTransactions": 5,
    "declinedTransactions": 10
  },
  "riskLevelDistribution": {
    "LOW": 850,
    "MEDIUM": 120,
    "HIGH": 25,
    "CRITICAL": 5
  },
  "topFraudFactors": [
    {
      "factor": "Velocity Check",
      "occurrences": 250,
      "percentage": 25.0
    },
    {
      "factor": "Amount Deviation",
      "occurrences": 200,
      "percentage": 20.0
    }
  ]
}
```

---

## Disputes & Chargebacks

### POST /transactions/:transactionId/dispute

Create a dispute for transaction.

**Request:**
```json
{
  "reason": "product_not_received",
  "description": "I did not receive the ordered items",
  "evidenceFiles": ["file-id-1", "file-id-2"]
}
```

**Response:** `201 Created`
```json
{
  "disputeId": "dispute-001",
  "transactionId": "txn-001",
  "reason": "product_not_received",
  "amount": 10000.00,
  "status": "OPEN",
  "deadline": "2025-12-10T10:35:00Z",
  "createdAt": "2025-11-10T10:35:00Z",
  "message": "Dispute created successfully. Merchant has 10 days to respond."
}
```

---

### POST /disputes/:disputeId/evidence

Submit evidence for dispute.

**Request (multipart/form-data):**
```
{
  "files": [<file1>, <file2>],
  "description": "Screenshots of order confirmation and communication with seller"
}
```

**Response:** `200 OK`
```json
{
  "disputeId": "dispute-001",
  "evidenceCount": 2,
  "totalFileSize": 5242880,
  "uploadedAt": "2025-11-10T10:40:00Z",
  "message": "Evidence uploaded successfully"
}
```

---

### GET /disputes/:disputeId

Get dispute details.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "disputeId": "dispute-001",
  "transactionId": "txn-001",
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "merchantId": "merchant-001",
  "reason": "product_not_received",
  "amount": 10000.00,
  "status": "INVESTIGATING",
  "resolution": null,
  "deadline": "2025-12-10T10:35:00Z",
  "createdAt": "2025-11-10T10:35:00Z",
  "evidence": [
    {
      "evidenceId": "evidence-001",
      "type": "proof_of_order",
      "fileUrl": "https://cdn.example.com/disputes/evidence-001.jpg",
      "uploadedAt": "2025-11-10T10:40:00Z"
    }
  ],
  "investigation": {
    "startedAt": "2025-11-10T11:00:00Z",
    "merchantResponseDeadline": "2025-11-20T10:35:00Z",
    "merchantResponse": null,
    "notes": "Awaiting merchant response"
  }
}
```

---

### PUT /disputes/:disputeId/resolution

Resolve dispute (admin only).

**Request:**
```json
{
  "resolution": "APPROVED",
  "refundAmount": 10000.00,
  "notes": "Evidence clearly shows product was not delivered"
}
```

**Response:** `200 OK`
```json
{
  "disputeId": "dispute-001",
  "status": "RESOLVED",
  "resolution": "APPROVED",
  "refundId": "refund-001",
  "refundAmount": 10000.00,
  "resolvedAt": "2025-11-11T09:30:00Z",
  "message": "Dispute resolved and refund initiated"
}
```

---

## Subscriptions

### POST /subscription-plans

Create subscription plan.

**Request:**
```json
{
  "planName": "Premium Monthly",
  "planDescription": "Premium subscription plan with unlimited access",
  "amount": 9999.00,
  "currency": "NGN",
  "billingFrequency": "monthly",
  "trialPeriodDays": 7,
  "setupFee": 0,
  "maxCharges": null
}
```

**Response:** `201 Created`
```json
{
  "planId": "plan-001",
  "planName": "Premium Monthly",
  "amount": 9999.00,
  "billingFrequency": "monthly",
  "status": "ACTIVE",
  "createdAt": "2025-11-10T10:35:00Z"
}
```

---

### GET /subscription-plans/:planId

Get subscription plan details.

**Response:** `200 OK`
```json
{
  "planId": "plan-001",
  "merchantId": "merchant-001",
  "planName": "Premium Monthly",
  "planDescription": "Premium subscription plan with unlimited access",
  "amount": 9999.00,
  "currency": "NGN",
  "billingFrequency": "monthly",
  "billingInterval": 1,
  "trialPeriodDays": 7,
  "trialAmount": 0,
  "setupFee": 0,
  "maxCharges": null,
  "planType": "fixed",
  "status": "ACTIVE",
  "isActive": true,
  "createdAt": "2025-11-10T10:35:00Z"
}
```

---

### POST /subscriptions

Enroll customer in subscription plan.

**Request:**
```json
{
  "planId": "plan-001",
  "paymentMethodId": "card-001",
  "startDate": "2025-11-10"
}
```

**Response:** `201 Created`
```json
{
  "subscriptionId": "sub-001",
  "planId": "plan-001",
  "status": "ACTIVE",
  "autoRenew": true,
  "nextChargeDate": "2025-11-17",
  "trialEndDate": "2025-11-17",
  "chargeCount": 0,
  "createdAt": "2025-11-10T10:35:00Z",
  "message": "Subscription activated successfully. Trial period: 7 days"
}
```

---

### GET /subscriptions/:subscriptionId

Get subscription details.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "subscriptionId": "sub-001",
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "merchantId": "merchant-001",
  "planId": "plan-001",
  "planName": "Premium Monthly",
  "status": "ACTIVE",
  "autoRenew": true,
  "nextChargeDate": "2025-11-17",
  "trialEndDate": "2025-11-17",
  "chargeCount": 0,
  "maxCharges": null,
  "lastChargeDate": null,
  "lastChargeAmount": null,
  "createdAt": "2025-11-10T10:35:00Z",
  "charges": [
    {
      "chargeId": "charge-001",
      "amount": 9999.00,
      "status": "SUCCEEDED",
      "scheduledDate": "2025-11-17",
      "actualChargeDate": "2025-11-17",
      "attemptCount": 1
    }
  ]
}
```

---

### PUT /subscriptions/:subscriptionId/pause

Pause subscription.

**Request:**
```json
{
  "reason": "Temporarily pausing service"
}
```

**Response:** `200 OK`
```json
{
  "subscriptionId": "sub-001",
  "status": "PAUSED",
  "pausedAt": "2025-11-10T10:35:00Z",
  "message": "Subscription paused successfully"
}
```

---

### PUT /subscriptions/:subscriptionId/resume

Resume paused subscription.

**Response:** `200 OK`
```json
{
  "subscriptionId": "sub-001",
  "status": "ACTIVE",
  "nextChargeDate": "2025-11-17",
  "resumedAt": "2025-11-10T10:35:00Z",
  "message": "Subscription resumed successfully"
}
```

---

### PUT /subscriptions/:subscriptionId/cancel

Cancel subscription.

**Request:**
```json
{
  "reason": "No longer need the service"
}
```

**Response:** `200 OK`
```json
{
  "subscriptionId": "sub-001",
  "status": "CANCELLED",
  "cancelledAt": "2025-11-10T10:35:00Z",
  "cancelledReason": "No longer need the service",
  "message": "Subscription cancelled successfully"
}
```

---

### GET /customers/:customerId/subscriptions

List all subscriptions for customer.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "subscriptions": [
    {
      "subscriptionId": "sub-001",
      "planName": "Premium Monthly",
      "status": "ACTIVE",
      "nextChargeDate": "2025-11-17",
      "amount": 9999.00
    },
    {
      "subscriptionId": "sub-002",
      "planName": "Enterprise Yearly",
      "status": "PAUSED",
      "nextChargeDate": "2026-01-10",
      "amount": 99999.00
    }
  ],
  "summary": {
    "activeCount": 1,
    "pausedCount": 1,
    "cancelledCount": 0,
    "totalMRR": 9999.00
  }
}
```

---

### GET /merchants/:merchantId/subscription-metrics

Get subscription analytics for merchant.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
```
?startDate=2025-11-01&endDate=2025-11-10
```

**Response:** `200 OK`
```json
{
  "merchantId": "merchant-001",
  "period": {
    "startDate": "2025-11-01",
    "endDate": "2025-11-10"
  },
  "metrics": {
    "mrr": 29997.00,
    "arr": 359964.00,
    "activeSubscriptions": 3,
    "newSubscriptions": 2,
    "cancelledSubscriptions": 1,
    "pausedSubscriptions": 0,
    "churnRate": 33.33,
    "trialConversions": 1,
    "trialConversionRate": 50.0,
    "failedCharges": 1,
    "recoveredCharges": 0,
    "recoveryRate": 0.0,
    "expansionMrr": 9999.00,
    "contractionMrr": 0.00
  }
}
```

---

## Bill Payments

### GET /bills/airtime/providers

List airtime providers.

**Response:** `200 OK`
```json
{
  "providers": [
    {
      "providerId": "mtn",
      "name": "MTN Nigeria",
      "logo": "https://cdn.example.com/providers/mtn.png",
      "amountRange": {
        "min": 100,
        "max": 50000
      },
      "denominations": [100, 500, 1000, 2000, 5000, 10000, 20000, 50000]
    },
    {
      "providerId": "airtel",
      "name": "Airtel Nigeria",
      "logo": "https://cdn.example.com/providers/airtel.png",
      "amountRange": {
        "min": 100,
        "max": 50000
      }
    }
  ]
}
```

---

### POST /bills/airtime/topup

Purchase airtime.

**Request:**
```json
{
  "providerId": "mtn",
  "phoneNumber": "08012345678",
  "amount": 1000.00,
  "paymentMethodId": "card-001"
}
```

**Response:** `201 Created`
```json
{
  "transactionId": "bill-txn-001",
  "type": "airtime_topup",
  "provider": "mtn",
  "phoneNumber": "08012345678",
  "amount": 1000.00,
  "status": "SUCCESS",
  "reference": "ref-12345",
  "message": "Airtime topup successful. Balance will be credited within 5 seconds.",
  "createdAt": "2025-11-10T10:35:00Z"
}
```

---

### GET /bills/topups

List airtime topup history.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
```
?limit=20&offset=0&status=SUCCESS
```

**Response:** `200 OK`
```json
{
  "topups": [
    {
      "transactionId": "bill-txn-001",
      "provider": "mtn",
      "phoneNumber": "08012345678",
      "amount": 1000.00,
      "status": "SUCCESS",
      "reference": "ref-12345",
      "createdAt": "2025-11-10T10:35:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

---

## Refunds

### POST /transactions/:transactionId/refund

Request refund for transaction.

**Request:**
```json
{
  "amount": 5000.00,
  "reason": "partial_refund",
  "description": "Partial refund for damaged item"
}
```

**Response:** `201 Created`
```json
{
  "refundId": "refund-001",
  "transactionId": "txn-001",
  "amount": 5000.00,
  "status": "PENDING",
  "reason": "partial_refund",
  "createdAt": "2025-11-10T10:35:00Z",
  "message": "Refund initiated. Processing time: 24-48 hours"
}
```

---

### GET /transactions/:transactionId/refunds

List refunds for transaction.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "transactionId": "txn-001",
  "refunds": [
    {
      "refundId": "refund-001",
      "amount": 5000.00,
      "status": "COMPLETED",
      "reason": "partial_refund",
      "createdAt": "2025-11-10T10:35:00Z",
      "completedAt": "2025-11-11T10:35:00Z"
    }
  ],
  "summary": {
    "totalRefunded": 5000.00,
    "refundCount": 1
  }
}
```

---

## Receipts

### GET /transactions/:transactionId/receipt

Get receipt for transaction.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
```
?format=pdf
```

**Response:** `200 OK`
```json
{
  "receiptId": "rcpt-001",
  "transactionId": "txn-001",
  "format": "pdf",
  "url": "https://cdn.example.com/receipts/rcpt-001.pdf",
  "digitalSignature": "sig_abc123def456",
  "createdAt": "2025-11-10T10:35:00Z",
  "expiresAt": "2125-11-10T10:35:00Z"
}
```

---

### POST /transactions/:transactionId/receipt/generate

Generate receipt in specific format.

**Request:**
```json
{
  "format": "email",
  "recipient": "customer@example.com"
}
```

**Response:** `201 Created`
```json
{
  "receiptId": "rcpt-001",
  "format": "email",
  "status": "SENT",
  "recipient": "customer@example.com",
  "sentAt": "2025-11-10T10:35:00Z",
  "message": "Receipt sent successfully"
}
```

---

## Analytics

### GET /merchants/:merchantId/analytics

Get merchant transaction analytics.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
```
?startDate=2025-11-01&endDate=2025-11-10&groupBy=daily
```

**Response:** `200 OK`
```json
{
  "merchantId": "merchant-001",
  "period": {
    "startDate": "2025-11-01",
    "endDate": "2025-11-10"
  },
  "summary": {
    "totalTransactions": 150,
    "successfulTransactions": 147,
    "failedTransactions": 3,
    "totalVolume": 1500000.00,
    "averageTransactionAmount": 10000.00,
    "successRate": 98.0
  },
  "dailyMetrics": [
    {
      "date": "2025-11-10",
      "transactionCount": 25,
      "totalVolume": 250000.00,
      "averageAmount": 10000.00,
      "successRate": 98.0
    }
  ],
  "topCustomers": [
    {
      "customerId": "cust-001",
      "transactionCount": 10,
      "totalSpent": 100000.00
    }
  ]
}
```

---

## WebSocket Events

### Connect to WebSocket

```javascript
const socket = io('wss://api.example.com/socket.io', {
  auth: {
    token: 'Bearer <accessToken>'
  }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
  
  // Subscribe to events
  socket.emit('subscribe', {
    channels: ['user:' + userId, 'transaction:all']
  });
});
```

### Subscribed Events

#### transaction:completed
```json
{
  "event": "transaction:completed",
  "data": {
    "transactionId": "txn-001",
    "amount": 10000.00,
    "status": "SUCCESS",
    "merchantId": "merchant-001",
    "timestamp": "2025-11-10T10:35:00Z"
  }
}
```

#### subscription:charged
```json
{
  "event": "subscription:charged",
  "data": {
    "subscriptionId": "sub-001",
    "chargeId": "charge-001",
    "amount": 9999.00,
    "status": "SUCCEEDED",
    "nextChargeDate": "2025-12-10",
    "timestamp": "2025-11-10T10:35:00Z"
  }
}
```

#### dispute:created
```json
{
  "event": "dispute:created",
  "data": {
    "disputeId": "dispute-001",
    "transactionId": "txn-001",
    "reason": "product_not_received",
    "amount": 10000.00,
    "deadline": "2025-12-10",
    "timestamp": "2025-11-10T10:35:00Z"
  }
}
```

#### fraud:risk_alert
```json
{
  "event": "fraud:risk_alert",
  "data": {
    "transactionId": "txn-001",
    "riskScore": 85,
    "riskLevel": "CRITICAL",
    "decision": "HOLD",
    "requiresAction": true,
    "timestamp": "2025-11-10T10:35:00Z"
  }
}
```

---

## Admin Endpoints

### GET /admin/merchants/pending-kyc

List merchants pending KYC approval (admin only).

**Headers:**
```
Authorization: Bearer <adminToken>
```

**Response:** `200 OK`
```json
{
  "merchants": [
    {
      "merchantId": "merchant-001",
      "businessName": "John's Store",
      "submittedAt": "2025-11-08T10:35:00Z",
      "riskScore": 35,
      "nextReview": "2025-11-10T14:00:00Z",
      "documents": [
        {
          "type": "national_id",
          "status": "VERIFIED"
        },
        {
          "type": "business_registration",
          "status": "PENDING_REVIEW"
        }
      ]
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 20,
    "offset": 0
  }
}
```

---

### POST /admin/merchants/:merchantId/approve

Approve merchant KYC (admin only).

**Request:**
```json
{
  "notes": "All documents verified. Business legitimate."
}
```

**Response:** `200 OK`
```json
{
  "merchantId": "merchant-001",
  "kycStatus": "APPROVED",
  "approvedAt": "2025-11-10T10:35:00Z",
  "message": "Merchant approved successfully"
}
```

---

### POST /admin/merchants/:merchantId/reject

Reject merchant KYC (admin only).

**Request:**
```json
{
  "reason": "invalid_documents",
  "message": "Submitted documents do not match business requirements"
}
```

**Response:** `200 OK`
```json
{
  "merchantId": "merchant-001",
  "kycStatus": "REJECTED",
  "rejectionReason": "invalid_documents",
  "rejectionMessage": "Submitted documents do not match business requirements",
  "rejectedAt": "2025-11-10T10:35:00Z",
  "message": "Merchant rejected. They can appeal or resubmit."
}
```

---

## Error Codes

### Standard Error Response Format

```json
{
  "statusCode": 400,
  "errorCode": "INVALID_REQUEST",
  "message": "The request is invalid",
  "details": {
    "field": "amount",
    "message": "Amount must be greater than 0"
  },
  "timestamp": "2025-11-10T10:35:00Z",
  "requestId": "req-12345"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_REQUEST | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| UNPROCESSABLE_ENTITY | 422 | Business logic validation failed |
| RATE_LIMITED | 429 | Too many requests |
| INSUFFICIENT_FUNDS | 402 | Wallet or payment method has insufficient funds |
| TRANSACTION_FAILED | 400 | Payment processor declined transaction |
| FRAUD_BLOCK | 403 | Transaction blocked by fraud detection |
| KYC_INCOMPLETE | 403 | KYC verification not complete for this operation |
| MERCHANT_INACTIVE | 403 | Merchant account is not active |
| SUBSCRIPTION_ACTIVE | 409 | Subscription already active |
| DISPUTE_EXPIRED | 400 | Dispute window has expired |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |

---

## Rate Limiting

All API endpoints are rate-limited per user based on KYC tier:

| Tier | Requests/Second | Requests/Hour | Requests/Day |
|------|-----------------|---------------|--------------|
| Tier 0 | 1 | 100 | 1,000 |
| Tier 1 | 5 | 500 | 10,000 |
| Tier 2 | 10 | 1,000 | 50,000 |
| Tier 3 | 20 | 5,000 | 100,000 |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699600800
```

**When Rate Limited (429):**
```json
{
  "statusCode": 429,
  "errorCode": "RATE_LIMITED",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60,
  "resetAt": "2025-11-10T10:36:00Z"
}
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
```
?limit=20&offset=0
```

**Response:**
```json
{
  "items": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Filtering & Sorting

### Common Query Parameters

```
?status=SUCCESS
?startDate=2025-11-01&endDate=2025-11-10
?sortBy=createdAt&sortOrder=desc
?search=John Doe
```

---

**Last Updated:** November 10, 2025  
**API Version:** 1.0  
**Status:** Production Ready

