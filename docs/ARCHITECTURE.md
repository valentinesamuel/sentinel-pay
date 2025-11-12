# Ubiquitous Tribble - System Architecture

> Comprehensive system architecture, data flows, and module relationships for the Ubiquitous Tribble payment platform.

**Document Version:** 1.0  
**Last Updated:** November 10, 2025  
**Platform:** Backend API (NestJS + PostgreSQL + Redis)

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Layered Architecture](#layered-architecture)
3. [Core Modules](#core-modules)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Payment Processing Flow](#payment-processing-flow)
6. [Fraud Detection Flow](#fraud-detection-flow)
7. [Subscription Charge Flow](#subscription-charge-flow)
8. [Dispute Resolution Flow](#dispute-resolution-flow)
9. [Real-Time Events Flow](#real-time-events-flow)
10. [Database Schema Overview](#database-schema-overview)
11. [Deployment Architecture](#deployment-architecture)
12. [Scalability & Performance](#scalability--performance)

---

## System Architecture Overview

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                          │
│  (Web, Mobile, Admin Dashboard, Merchant Portal, Webhooks)           │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     │ HTTPS/WebSocket
                     ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                               │
│  - Request validation, routing, rate limiting                        │
│  - CORS, authentication, request signing verification               │
│  - Load balancing (multiple instances)                              │
└────────────────────┬────────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬───────────────────┐
        ↓                         ↓                   ↓
┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  REST API        │  │  WebSocket      │  │  Admin APIs      │
│  (Controllers)   │  │  (Real-Time)    │  │  (Internal)      │
└────────┬─────────┘  └────────┬────────┘  └────────┬─────────┘
         │                     │                    │
         └─────────────────────┼────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER (Services)                     │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Transaction  │  │   Merchant   │  │    Fraud     │               │
│  │  Service     │  │   Service    │  │  Service     │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                  │                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Subscription │  │   Dispute    │  │   Refund     │               │
│  │  Service     │  │   Service    │  │  Service     │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                  │                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Analytics    │  │  Notification│  │  Bill Payment│               │
│  │  Service     │  │  Service     │  │  Service     │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                  │                       │
└─────────┼─────────────────┼──────────────────┼───────────────────────┘
          │                 │                  │
          └─────────────────┼──────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│              DATA ACCESS LAYER (TypeORM Repositories)                │
│  - Database queries, entity management, transactions                │
│  - Query optimization, pagination, filtering                       │
└────────────────────┬────────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────────────────────┐
        ↓                                         ↓
┌──────────────────────────────┐  ┌─────────────────────────┐
│   PRIMARY DATABASE           │  │   CACHE & QUEUE         │
│   (PostgreSQL)               │  │   (Redis)               │
│                              │  │                         │
│  - Users, Transactions       │  │  - Session storage      │
│  - Wallets, Cards            │  │  - Rate limit state     │
│  - Merchants, Disputes       │  │  - Job queue (Bull)     │
│  - Subscriptions, Analytics  │  │  - Pub/Sub events       │
│  - Audit logs, Documents     │  │  - Cache layer          │
└──────────────────────────────┘  └─────────────────────────┘
        ↑                                         ↑
        └─────────────────┬──────────────────────┘
                          │
        ┌─────────────────┴──────────────────┐
        ↓                                    ↓
┌──────────────────────┐           ┌───────────────────────┐
│  EXTERNAL SERVICES   │           │  STORAGE SERVICES     │
│  (MOCKED)            │           │  (S3-Compatible)      │
│                      │           │                       │
│ - Paystack (Payments)│           │ - Documents (encrypted)│
│ - Twilio (SMS)       │           │ - Receipts (7-year)   │
│ - SendGrid (Email)   │           │ - Dispute evidence    │
│ - MaxMind (IP Rep.)  │           │ - Merchant documents  │
│ - OFAC (Screening)   │           │ - Audit trails        │
│ - Bill Providers     │           │                       │
└──────────────────────┘           └───────────────────────┘
```

---

## Layered Architecture

### Detailed Layer Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│                  (REST API, WebSocket)                           │
│                                                                   │
│  Controllers ────> Guard (Auth) ────> Pipe (Validation)         │
│     ↓                 ↓                    ↓                      │
│   Route          Authorize          Transform Input              │
│ /api/v1/...      JWT, RBAC         class-validator              │
│                                                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        ↓                                     ↓
┌─────────────────────────────────────┐  ┌─────────────────────────────┐
│    HTTP Response Filter             │  │  Exception Filter           │
│  - Response transformation          │  │  - Error handling           │
│  - Status code mapping              │  │  - Error formatting         │
│  - Logging                          │  │  - Audit logging            │
└─────────────────────────────────────┘  └─────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                        │
│                    (Services, Use Cases)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Service Methods                                         │  │
│  │  - Business rules enforcement                            │  │
│  │  - Transaction orchestration                             │  │
│  │  - Event publishing                                      │  │
│  │  - External service calls                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                     ↓                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Domain Models                                           │  │
│  │  - Business entities                                     │  │
│  │  - Value objects                                         │  │
│  │  - Business logic encapsulation                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────┴───────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│                  (Repositories, TypeORM)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Repository Pattern                                      │  │
│  │  - Database queries                                      │  │
│  │  - Entity mapping                                        │  │
│  │  - Query building                                        │  │
│  │  - Transaction management                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                     ↓                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TypeORM Entities                                        │  │
│  │  - @Entity decorators                                    │  │
│  │  - @Column definitions                                   │  │
│  │  - Relationships (@OneToMany, @ManyToOne, etc)          │  │
│  │  - Indexes and constraints                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────┴───────────────────────────────────┐
│               PERSISTENCE LAYER (Databases)                      │
│                                                                   │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐  │
│  │  PostgreSQL (Primary)       │  │  Redis (Cache/Queue)     │  │
│  │                             │  │                          │  │
│  │  - ACID transactions        │  │  - Session storage       │  │
│  │  - Relational data          │  │  - Rate limit buckets    │  │
│  │  - Full-text search         │  │  - Job queue (Bull)      │  │
│  │  - JSON support             │  │  - Pub/Sub channels      │  │
│  │  - UUID primary keys        │  │  - Temporary caches      │  │
│  │  - Immutable audit logs     │  │  - Locks & semaphores    │  │
│  └─────────────────────────────┘  └──────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### Module Dependency Graph

```
                    ┌─────────────┐
                    │   Config    │
                    │  & Logger   │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            ↓              ↓              ↓
        ┌────────┐   ┌──────────┐   ┌─────────┐
        │  Auth  │   │ Database │   │  Cache  │
        │ Module │   │ Module   │   │ Module  │
        └────┬───┘   └──────────┘   └─────────┘
             │
    ┌────────┴─────────────────────────────────────┐
    ↓                                              ↓
┌──────────────┐                          ┌─────────────────┐
│ User Module  │                          │ Merchant Module │
│ - Signup     │                          │ - Onboarding    │
│ - KYC        │                          │ - KYC           │
│ - Profile    │                          │ - Settlement    │
└──────┬───────┘                          └────────┬────────┘
       │                                          │
       ├──────────────┬──────────────┬────────────┘
       ↓              ↓              ↓
┌─────────────┐  ┌──────────┐  ┌──────────────┐
│   Wallet    │  │   Card   │  │ Transaction  │
│   Module    │  │  Module  │  │   Module     │
└──────┬──────┘  └────┬─────┘  └──────┬───────┘
       │              │               │
       └──────────────┼───────────────┘
                      ↓
            ┌─────────────────────┐
            │   Fraud Module      │
            │ - Risk Scoring      │
            │ - Behavioral        │
            │ - Device FP         │
            └──────────┬──────────┘
                       │
        ┌──────────────┴──────────────┐
        ↓                             ↓
    ┌────────────┐         ┌─────────────────┐
    │  Dispute   │         │  Subscription   │
    │  Module    │         │   Module        │
    │ - Evidence │         │ - Plans         │
    │ - Inv.     │         │ - Charges       │
    │ - Chargebacks       │ - Analytics     │
    └─────┬──────┘         └────────┬────────┘
          │                         │
          └────────────┬────────────┘
                       ↓
    ┌──────────────────────────────────┐
    │    Notification Module           │
    │  - Email, SMS, Push, Webhooks   │
    └──────────────┬───────────────────┘
                   │
    ┌──────────────┴──────────────┐
    ↓                             ↓
┌────────────┐            ┌──────────────┐
│  Refund    │            │   Bill       │
│  Module    │            │  Payment     │
│ - Process  │            │  Module      │
│ - Reverse  │            │ - Airtime    │
│ - Report   │            │ - Utilities  │
└────────────┘            └──────────────┘
                                 │
                                 ↓
                         ┌──────────────────┐
                         │  Analytics       │
                         │  Module          │
                         │ - Metrics        │
                         │ - Reports        │
                         │ - Dashboards     │
                         └──────────────────┘
```

---

## Data Flow Diagrams

### 1. Authentication & Authorization Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /auth/login
     │    { email, password }
     ↓
┌─────────────────────────────────────┐
│  Auth Controller                    │
│  - Validate input                   │
│  - Route to service                 │
└────────┬────────────────────────────┘
         │
         │ 2. Call AuthService
         ↓
┌─────────────────────────────────────┐
│  Auth Service                       │
│  - Find user by email               │
│  - Verify password (bcrypt)         │
│  - Generate JWT token               │
│  - Create session in Redis          │
└────────┬────────────────────────────┘
         │
         │ 3. User found & verified
         ↓
┌─────────────────────────────────────┐
│  JWT Generator                      │
│  - Create token: { userId, role,    │
│    exp, iat }                       │
│  - Sign with JWT_SECRET             │
│  - Store in Redis: token → userId   │
└────────┬────────────────────────────┘
         │
         │ 4. Return { token, user }
         ↓
┌──────────────────────────────────────┐
│  Client receives JWT                 │
│  - Store in memory/localStorage      │
│  - Include in Authorization header   │
│    for future requests               │
└──────────────────────────────────────┘
         │
         │ 5. Subsequent request with JWT
         │    Authorization: Bearer <token>
         ↓
┌────────────────────────────────────────┐
│  Auth Guard (Middleware)               │
│  - Extract token from header           │
│  - Verify JWT signature                │
│  - Check Redis session validity        │
│  - Extract userId from token           │
│  - Attach user to request context      │
└────────┬───────────────────────────────┘
         │
         │ 6. Valid token → Continue
         ↓
┌─────────────────────────────────────┐
│  RBAC Guard                         │
│  - Get user roles from database     │
│  - Check endpoint requirements      │
│  - Grant/deny access                │
└─────────────────────────────────────┘
```

### 2. Request-Response Cycle with Signing

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. Create request payload
     │    { customerId, amount, ... }
     ↓
┌───────────────────────────────────────────┐
│  Client-Side Request Signing              │
│  1. Generate nonce: UUID()                │
│  2. Timestamp: Date.now()                 │
│  3. Request body JSON                     │
│  4. HMAC-SHA256(                          │
│       secret: API_KEY,                    │
│       message: body+nonce+timestamp       │
│     ) = signature                         │
│  5. Headers:                              │
│     X-Signature: signature                │
│     X-Nonce: nonce                        │
│     X-Timestamp: timestamp                │
└────────┬────────────────────────────────┘
         │
         │ POST /api/v1/transactions
         │ Headers: Auth, Signature, Nonce
         │ Body: { customerId, amount }
         ↓
┌───────────────────────────────────────────┐
│  API Gateway                              │
│  - Receive request                        │
│  - Extract headers                        │
└────────┬────────────────────────────────┘
         │
         │ 2. Verify Request Signature
         ↓
┌───────────────────────────────────────────┐
│  Request Signing Validator                │
│  1. Look up API key in database           │
│  2. Recalculate HMAC-SHA256 with secret   │
│  3. Compare with header signature         │
│  4. Verify nonce not in replay cache      │
│  5. Verify timestamp within 5 min         │
│  6. Store nonce in Redis (5 min TTL)      │
│  Result: Valid or Invalid                 │
└────────┬────────────────────────────────┘
         │
    ┌────┴────┐
    │ Valid?  │
    └────┬────┘
         │
    ┌────┴─────────┐
    Yes            No
    │              │
    ↓              ↓
Continue      Return 401
Process       Unauthorized
Request
    │
    │ 3. Execute business logic
    ↓
┌──────────────────────────┐
│  Transaction Service     │
│  - Process transaction   │
│  - Create response body  │
│  { transactionId, ...}   │
└────────┬─────────────────┘
         │
         │ 4. Sign Response
         ↓
┌───────────────────────────────────────────┐
│  Response Signing                         │
│  1. Response body JSON                    │
│  2. Response nonce: new UUID()            │
│  3. Response timestamp: Date.now()        │
│  4. Encrypt sensitive fields:             │
│     AES-256-GCM(body, API_key) = encrypted
│  5. HMAC-SHA256(                          │
│       secret: API_KEY,                    │
│       message: encrypted+nonce+timestamp  │
│     ) = signature                         │
│  6. Headers:                              │
│     X-Response-Signature: signature       │
│     X-Response-Nonce: nonce               │
└────────┬────────────────────────────────┘
         │
         │ Return 200 OK
         │ Headers: Response-Signature, Nonce
         │ Body: { encrypted response }
         ↓
┌──────────────────────────────────────┐
│  Client-Side Verification            │
│  1. Extract signature, nonce         │
│  2. Verify HMAC-SHA256               │
│  3. Decrypt response with AES-256    │
│  4. Extract transactionId, etc.      │
│  5. Display to user                  │
└──────────────────────────────────────┘
```

---

## Payment Processing Flow

### Transaction Lifecycle

```
┌────────────┐
│   Customer │
└─────┬──────┘
      │
      │ 1. Initiate transaction
      │    POST /api/v1/transactions
      │    { customerId, amount, merchantId, cardId }
      ↓
┌──────────────────────────────────────┐
│  Transaction Controller              │
│  - Validate request                  │
│  - Call TransactionService           │
└────────┬─────────────────────────────┘
         │
         │ 2. Start transaction process
         ↓
┌──────────────────────────────────────┐
│  Transaction Service                 │
│  1. Create Transaction record:        │
│     Status: PENDING                  │
│     Amount, Currency, Metadata       │
│  2. Generate idempotency key         │
│  3. Check for duplicate (same key)   │
│  4. Lock transaction (database)      │
└────────┬─────────────────────────────┘
         │
         │ 3. Validate transaction
         ↓
┌──────────────────────────────────────┐
│  Transaction Validator               │
│  - Amount > 0?                       │
│  - Merchant exists & active?         │
│  - Card exists & active?             │
│  - Customer KYC tier sufficient?     │
│  - Wallet has funds (if applicable)? │
│  - No velocity limit exceeded?       │
│  Result: Valid or Invalid            │
└────────┬─────────────────────────────┘
         │
         │ 4. Fraud Detection
         ↓
┌──────────────────────────────────────┐
│  Fraud Risk Scoring                  │
│  1. Calculate 10+ risk factors       │
│  2. Generate fraud score: 0-100      │
│  3. Determine action:                │
│     ALLOW, REQUIRE_VERIFICATION,     │
│     HOLD, DECLINE                    │
│  4. If HIGH risk: Save for review    │
└────────┬─────────────────────────────┘
         │
    ┌────┴─────────┬──────────────┬─────────┐
    │              │              │         │
  ALLOW         REQUIRE_V      HOLD      DECLINE
    │          (wait for 2FA)   │         │
    │              │            │         │
    ↓              ↓            ↓         ↓
Continue       Wait for    Suspend    Reject
Process        SMS code    Process    Trans.
               │
               │ 5. User submits OTP
               ↓
         Verify & Continue
               │
               ↓
┌──────────────────────────────────────┐
│  5. Debit Wallet (Ledger Entry)      │
│  1. Create ledger entry:             │
│     FROM: customer_wallet            │
│     TO: merchant_holding             │
│     Amount: transaction amount       │
│     Type: DEBIT                      │
│  2. Update wallet balance:           │
│     wallet.balance -= amount         │
│  3. Create reverse entry (Credit):   │
│     FROM: merchant_holding           │
│     TO: merchant_settlement          │
│     (Double-entry accounting)        │
└────────┬─────────────────────────────┘
         │
         │ 6. Call Payment Processor
         ↓
┌──────────────────────────────────────┐
│  Payment Service (Paystack - Mocked) │
│  1. Tokenized card charge            │
│     chargeCard({                     │
│       amount, currency, customerId,  │
│       paymentMethodId, metadata      │
│     })                               │
│  2. Wait for response (1-3 sec)      │
│  3. Handle response:                 │
│     - Success: chargeId              │
│     - Decline: error_code            │
│     - Timeout: retry logic           │
└────────┬─────────────────────────────┘
         │
    ┌────┴──────────┬──────────┐
    │               │          │
  SUCCESS        DECLINED    TIMEOUT
    │               │          │
    ↓               ↓          ↓
Update        Reverse      Retry with
Status &      Ledger       Exponential
Save ID       & Notify     Backoff
    │           │          │
    │           │ Notify   │
    │           │ Customer │
    │           │          │
    ↓           ↓          ↓
┌──────────────────────────────────────┐
│  Update Transaction Status           │
│  Status: SUCCESS | FAILED | PENDING  │
│  ProcessorChargeId: from response    │
│  ProcessorResponse: full response    │
│  CompletedAt: timestamp              │
└────────┬─────────────────────────────┘
         │
         │ 7. Publish Transaction Event
         ↓
┌──────────────────────────────────────┐
│  Event Publisher (Redis Pub/Sub)     │
│  Event: transaction:completed        │
│  Data: {                             │
│    transactionId, customerId,        │
│    merchantId, amount, status        │
│  }                                   │
│  Subscribers:                        │
│  - Notification Service              │
│  - Analytics Service                 │
│  - Webhook Service                   │
│  - Real-time WebSocket               │
└────────┬─────────────────────────────┘
         │
         │ 8. Notification
         ↓
┌──────────────────────────────────────┐
│  Notification Service                │
│  - Send receipt email                │
│  - Send SMS (optional)               │
│  - Push notification (mobile)        │
│  - Webhook to merchant               │
│  - Real-time update via WebSocket    │
└──────────────────────────────────────┘
```

---

## Fraud Detection Flow

### Real-Time Fraud Risk Scoring

```
┌─────────────┐
│ Transaction │
│  Received   │
└──────┬──────┘
       │
       │ 1. Start Fraud Check (<500ms target)
       ↓
┌────────────────────────────────────────┐
│  Fraud Scoring Service                 │
│  Initialize: riskScore = 0             │
│             riskFactors = []           │
└────────┬───────────────────────────────┘
         │
         │ 2. Evaluate 10 Risk Factors
         ↓
┌───────────────────────────────────────┐
│ FACTOR 1: Amount Deviation (15%)      │
│ - Get user avg transaction amount     │
│ - Current amount > 3x avg?            │
│ - Score: 0-100                        │
└────────┬──────────────────────────────┘
         │
         ↓
┌───────────────────────────────────────┐
│ FACTOR 2: Geographic Anomaly (12%)    │
│ - Get last transaction location       │
│ - Calculate travel time to current    │
│ - Impossible travel? (too fast)       │
│ - Score: 0-100                        │
└────────┬──────────────────────────────┘
         │
         ↓
┌───────────────────────────────────────┐
│ FACTOR 3: Device Mismatch (10%)       │
│ - Get device fingerprint              │
│ - Compare with known devices          │
│ - New device detected?                │
│ - Score: 0-100                        │
└────────┬──────────────────────────────┘
         │
         ↓
┌───────────────────────────────────────┐
│ FACTOR 4: Velocity Check (12%)        │
│ - Count transactions in last hour     │
│ - Count transactions in last day      │
│ - Compare with user baseline          │
│ - Exceed limit for tier?              │
│ - Score: 0-100                        │
└────────┬──────────────────────────────┘
         │
         ↓
┌───────────────────────────────────────┐
│ FACTOR 5: Merchant Risk (10%)         │
│ - Get merchant category (high-risk?)  │
│ - Get merchant chargeback rate        │
│ - Get merchant dispute rate           │
│ - Score: 0-100                        │
└────────┬──────────────────────────────┘
         │
         ↓
┌───────────────────────────────────────┐
│ FACTOR 6: Card Status (8%)            │
│ - Card age (new card = higher risk)   │
│ - Card type (credit vs debit)         │
│ - Previous fraud on card?             │
│ - Score: 0-100                        │
└────────┬──────────────────────────────┘
         │
         ↓
┌───────────────────────────────────────┐
│ FACTOR 7: User History (8%)           │
│ - Account age (new account = higher)  │
│ - Previous fraud flags?               │
│ - Chargeback history?                 │
│ - Score: 0-100                        │
└────────┬──────────────────────────────┘
         │
         ↓
┌───────────────────────────────────────┐
│ FACTOR 8: IP Reputation (7%)          │
│ - IP address in VPN/Proxy list?       │
│ - Datacenter IP?                      │
│ - Blacklist match?                    │
│ - Score: 0-100                        │
└────────┬──────────────────────────────┘
         │
         ↓
┌───────────────────────────────────────┐
│ FACTOR 9: Email/Phone Anomaly (5%)    │
│ - Email/phone changed recently?       │
│ - New contact method?                 │
│ - Score: 0-100                        │
└────────┬──────────────────────────────┘
         │
         ↓
┌───────────────────────────────────────┐
│ FACTOR 10: Blacklist Match (3%)       │
│ - Immediate escalation if matched     │
│ - Score: 100 (critical)               │
└────────┬──────────────────────────────┘
         │
         │ 3. Aggregate Scores
         ↓
┌────────────────────────────────────────┐
│  Calculate Final Risk Score            │
│  riskScore = Σ(factorScore × weight)  │
│  = (f1×0.15) + (f2×0.12) + ... +      │
│    (f10×0.03)                         │
│  Range: 0-100                         │
└────────┬───────────────────────────────┘
         │
         │ 4. Determine Risk Level
         ↓
┌────────────────────────────────────────┐
│  Risk Classification                   │
│  if riskScore < 30:  LOW               │
│  elif riskScore < 70: MEDIUM           │
│  elif riskScore < 85: HIGH             │
│  else:               CRITICAL          │
└────────┬───────────────────────────────┘
         │
    ┌────┴─────────┬────────────┬─────────┐
    │              │            │         │
   LOW          MEDIUM        HIGH    CRITICAL
    │              │            │         │
    ↓              ↓            ↓         ↓
┌───────┐   ┌───────────┐  ┌────────┐ ┌──────────┐
│ALLOW  │   │ALLOW with │  │  HOLD  │ │ DECLINE  │
│Trans  │   │Additional │  │  &     │ │ & Alert  │
│       │   │Check (2FA)│  │ Review │ │ Fraud    │
└───┬───┘   └─────┬─────┘  └───┬────┘ └────┬─────┘
    │             │            │          │
    └─────────────┴────────────┴──────────┘
            │
            │ 5. Return Decision
            ↓
┌────────────────────────────────────────┐
│  Fraud Score Result                    │
│  {                                     │
│    transactionId, riskScore,           │
│    riskLevel, decision,                │
│    riskFactors: [                      │
│      { name, weight, score,            │
│        explanation }                   │
│    ],                                  │
│    confidence, modelVersion            │
│  }                                     │
└────────┬───────────────────────────────┘
         │
         │ 6. Continue Transaction with Decision
         ↓
  (See Payment Processing Flow above)
```

---

## Subscription Charge Flow

### Automated Recurring Charge Processing

```
    ┌─ Scheduled ─┐
    │   Daily     │
    │   Cron Job  │
    └──────┬──────┘
           │
           │ 0:00 AM UTC
           ↓
┌───────────────────────────────────────────┐
│  Subscription Charge Processor (Cron)     │
│  @Cron('0 0 * * *')                       │
│  Run daily to process subscriptions due   │
└────────┬────────────────────────────────┘
         │
         │ 1. Query subscriptions due
         ↓
┌───────────────────────────────────────────┐
│  Fetch Due Subscriptions                  │
│  WHERE status = 'ACTIVE'                  │
│    AND nextChargeDate <= today            │
│    AND autoRenew = true                   │
│  Result: [sub1, sub2, ..., subN]         │
└────────┬────────────────────────────────┘
         │
         │ 2. Batch processing (1000+/min)
         ↓
┌───────────────────────────────────────────┐
│  Process in Batches                       │
│  Batch size: 100 subscriptions            │
│  Rate limit: wait 1s between batches      │
│  Throughput: 1000+ subscriptions/minute   │
└────────┬────────────────────────────────┘
         │
         │ For each subscription:
         ↓
┌───────────────────────────────────────────┐
│  Charge Subscription                      │
│  1. Generate idempotency key              │
│     key = sub_id + charge_count + date    │
│  2. Check for existing charge:            │
│     SELECT * WHERE chargeIdempotencyKey   │
│     If exists: Skip (prevent duplicate)   │
└────────┬────────────────────────────────┘
         │
         │ 3. Create charge record
         ↓
┌───────────────────────────────────────────┐
│  Create Subscription Charge               │
│  {                                        │
│    subscriptionId, amount, currency,      │
│    status: 'PENDING',                     │
│    chargeIdempotencyKey: key,             │
│    scheduledDate: today,                  │
│    paymentProcessor: 'paystack',          │
│    shouldRetry: true                      │
│  }                                        │
└────────┬────────────────────────────────┘
         │
         │ 4. Attempt charge
         ↓
┌───────────────────────────────────────────┐
│  Attempt Charge (1-3 seconds)             │
│  1. Call payment service:                 │
│     chargeCard({                          │
│       amount, customerId,                 │
│       paymentMethodId, metadata           │
│     })                                    │
│  2. Wait for response                     │
│  3. Record attempt                        │
└────────┬────────────────────────────────┘
         │
    ┌────┴─────────┬──────────┐
    │              │          │
 SUCCESS       DECLINED    TIMEOUT
    │              │          │
    ↓              ↓          ↓
Update Status    Check if     Retry
& Update Sub     Retryable    (3x max)
    │              │          │
    │              ↓          │
    │         Decide:         │
    │      Retry or          │
    │      Fail & Notify     │
    │              │         │
    │              ↓         │
    └──────────┬───┴────────┘
               │
               ↓
┌────────────────────────────────────────┐
│  5. Update Subscription                │
│  if charge_success:                    │
│    chargeCount++                       │
│    lastChargeDate = now                │
│    lastChargeAmount = amount           │
│    nextChargeDate = calculate_next()   │
│    if chargeCount >= maxCharges:       │
│      status = 'EXPIRED'                │
│  else:                                 │
│    status = 'RETRYING' (if retrying)   │
│    or status = 'PAUSED' (if gave up)   │
└────────┬───────────────────────────────┘
         │
         │ 6. Dunning workflow (on failure)
         ↓
┌────────────────────────────────────────┐
│  Dunning Events                        │
│  If charge failed:                     │
│  retryCount = 1:                       │
│    - Send notification                │
│    - Schedule retry in 24 hours        │
│  retryCount = 2:                       │
│    - Send reminder                     │
│    - Schedule retry in 48 hours        │
│  retryCount = 3:                       │
│    - Send final notice                 │
│    - Schedule retry in 72 hours        │
│  retryCount > 3:                       │
│    - Pause subscription                │
│    - Mark for manual review            │
│    - Send suspension notice            │
└────────┬───────────────────────────────┘
         │
         │ 7. Publish event
         ↓
┌────────────────────────────────────────┐
│  Publish Charge Event                  │
│  Event: subscription:charged           │
│  Data: {                               │
│    subscriptionId, chargeId, amount,   │
│    status, customerId, merchantId      │
│  }                                     │
│  OR                                    │
│  Event: subscription:charge_failed     │
│  Data: { subscriptionId, chargeId,    │
│    reason, retryDate }                │
└────────┬───────────────────────────────┘
         │
         │ 8. Notify customer
         ↓
┌────────────────────────────────────────┐
│  Notifications                         │
│  Success:                              │
│    - Receipt email                     │
│    - SMS confirmation                  │
│    - Push notification                 │
│  Failure:                              │
│    - Payment failed email              │
│    - Retry scheduled SMS               │
│    - Update payment method link        │
│  Suspension:                           │
│    - Subscription paused email         │
│    - Reactivation link                 │
└──────────────────────────────────────┘
```

---

## Dispute Resolution Flow

### Dispute Lifecycle

```
┌──────────────┐
│   Customer   │
│   Creates    │
│   Dispute    │
└──────┬───────┘
       │
       │ 1. POST /api/v1/transactions/:id/dispute
       │    { reason, description }
       ↓
┌────────────────────────────────┐
│  Dispute Service               │
│  Validate transaction:         │
│  - Exists & belongs to user?   │
│  - Within 90 days?             │
│  - Not already disputed?       │
└────────┬─────────────────────┘
         │
         │ 2. Create dispute
         ↓
┌─────────────────────────────────────┐
│  Create Dispute Record              │
│  {                                  │
│    transactionId, customerId,       │
│    merchantId, reason, amount,      │
│    status: 'OPEN',                  │
│    resolution: null,                │
│    deadline: 45 days from now       │
│  }                                  │
└────────┬────────────────────────────┘
         │
         │ 3. Notify merchant
         ↓
┌─────────────────────────────────────┐
│  Notification to Merchant           │
│  - Email: Dispute filed             │
│  - Dashboard alert                  │
│  - 10-day response deadline         │
└────────┬────────────────────────────┘
         │
         │ 4. Evidence collection
         ↓
┌─────────────────────────────────────┐
│  Evidence Submission Phase          │
│  Deadline: varies                   │
│  Max 10 files per dispute           │
│                                     │
│  Customer uploads:                  │
│  - Proof of non-delivery            │
│  - Communication with merchant      │
│  - Screenshots, receipts            │
│  - Payment proof (if applicable)    │
│                                     │
│  Merchant uploads:                  │
│  - Proof of delivery                │
│  - Service completion proof         │
│  - Customer communication           │
│  - Refund proof (if applicable)     │
└────────┬────────────────────────────┘
         │
         │ 5. Investigation queue
         ↓
┌──────────────────────────────────────┐
│  Admin Investigation Team            │
│  Review Queue:                       │
│  - Older disputes first              │
│  - High-value disputes               │
│  - Repeat merchant flags             │
│  - Pattern detection                 │
└────────┬─────────────────────────────┘
         │
         │ 6. Investigation workflow
         ↓
┌──────────────────────────────────────┐
│  Investigate Dispute                 │
│  1. Review all evidence              │
│  2. Pattern analysis:                │
│     - Same customer & merchant?      │
│     - Same issue type?               │
│     - Merchant chargeback rate       │
│  3. Assessment:                      │
│     - Clear fraud? → APPROVE refund  │
│     - Clear merchant fault? → DENY   │
│     - Unclear? → Request more info   │
│  4. Document decision                │
└────────┬─────────────────────────────┘
         │
    ┌────┴──────────┬──────────┐
    │               │          │
 APPROVE         PARTIAL       DENY
 REFUND          REFUND        DISPUTE
    │             │            │
    ↓             ↓            ↓
Create       Create         Reject
Refund       Refund          Case
Record       (50%)           Record
    │             │            │
    └──────────┬──┴────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│  7. Update Dispute Status            │
│  {                                   │
│    disputeId,                        │
│    status: 'RESOLVED',               │
│    resolution: 'APPROVED|DENIED',    │
│    resolvedAt: now,                  │
│    investigatorId: admin_id          │
│  }                                   │
└────────┬─────────────────────────────┘
         │
         │ 8. Process refund (if approved)
         ↓
┌──────────────────────────────────────┐
│  Refund Service                      │
│  1. Create refund record             │
│  2. Debit merchant account           │
│  3. Credit customer wallet           │
│  4. Queue payment to customer        │
│  5. Status: PENDING → COMPLETED      │
└────────┬─────────────────────────────┘
         │
         │ 9. Handle chargeback (if escalated)
         ↓
┌──────────────────────────────────────┐
│  Auto-Escalate to Chargeback         │
│  if dispute unresolved after 45 days:│
│  1. Mark as CHARGEBACK               │
│  2. Deduct chargeback fee            │
│  3. Notify merchant                  │
│  4. Process refund immediately       │
│  5. Flag merchant account            │
└────────┬─────────────────────────────┘
         │
         │ 10. Notify both parties
         ↓
┌──────────────────────────────────────┐
│  Notifications                       │
│  Customer receives:                  │
│  - Email: Dispute resolved           │
│  - Refund status (if approved)       │
│  - Decision explanation              │
│                                      │
│  Merchant receives:                  │
│  - Email: Dispute closed             │
│  - Amount deducted (if applicable)   │
│  - Investigation summary             │
│  - Appeal option                     │
└──────────────────────────────────────┘
```

---

## Real-Time Events Flow

### WebSocket Event Streaming

```
┌──────────────────┐
│  Web/Mobile App  │
└────────┬─────────┘
         │
         │ 1. Connect to WebSocket
         │    ws://api.example.com/socket.io
         ↓
┌─────────────────────────────────────┐
│  WebSocket Gateway (Socket.IO)      │
│  - Establish connection              │
│  - Authenticate with JWT             │
│  - Create socket session             │
└────────┬────────────────────────────┘
         │
         │ 2. Subscribe to events
         ↓
┌─────────────────────────────────────┐
│  Event Subscription                 │
│  socket.on('subscribe', {           │
│    channels: [                       │
│      'user:<userId>',               │
│      'merchant:<merchantId>',       │
│      'transaction:all'              │
│    ]                                │
│  })                                 │
└────────┬────────────────────────────┘
         │
         │ 3. User authorizes subscriptions
         ↓
┌─────────────────────────────────────┐
│  Authorization Check                │
│  - Can user access channel?         │
│  - Validate permissions             │
│  - Store subscriptions in Redis     │
└────────┬────────────────────────────┘
         │
         │ Connected & ready
         │ Waiting for events...
         │
    ┌────┴─────────────────────────────┐
    │  Meanwhile, in backend...        │
    │                                 │
    │ ┌─────────────────────────┐     │
    │ │ Transaction created     │     │
    │ │ - Service publishes     │     │
    │ │   event to Redis Pub/Sub│     │
    │ └──────┬──────────────────┘     │
    │        │                        │
    │        ↓                        │
    │ ┌─────────────────────────┐     │
    │ │ 4. Publish Event        │     │
    │ │ Redis.publish(          │     │
    │ │   'transaction:completed',
    │ │   {                     │     │
    │ │     transactionId,      │     │
    │ │     amount, status,     │     │
    │ │     customerId,         │     │
    │ │     merchantId          │     │
    │ │   }                     │     │
    │ │ )                       │     │
    │ └──────┬──────────────────┘     │
    │        │                        │
    │        ↓                        │
    │ ┌─────────────────────────┐     │
    │ │ 5. Event Handler        │     │
    │ │ (Monitors Redis Pub/Sub) │    │
    │ │ Receives event          │     │
    │ │ Determines targets:     │     │
    │ │ - User subscribers?     │     │
    │ │ - Merchant subscribers? │     │
    │ └──────┬──────────────────┘     │
    │        │                        │
    │        └─┬─────────┬──────┐     │
    │          ↓         ↓      ↓     │
    │    ┌─────────┐┌──────┐┌──────┐  │
    │    │Check    ││Check ││Check │  │
    │    │user     ││merc. ││all   │  │
    │    │sub?     ││sub?  ││subs? │  │
    │    └────┬────┘└──┬───┘└──┬──┘   │
    │         │        │       │      │
    │    Yes  │        │Yes    │Yes   │
    │    ↓    │        ↓       ↓      │
    │   Find  │       Find    Find   │
    │   all   │       all     all    │
    │   user  │       merc.   connected
    │   sockets       sockets  sockets
    │         │        │       │      │
    └─────────┼────────┼───────┘      │
              │        │              │
              └────┬───┴──────────────┘
                   │
                   ↓ (back to client)
┌─────────────────────────────────────┐
│  6. Emit Event to Subscribers       │
│  socket.emit('transaction:completed',
│    {                                │
│      transactionId, amount, status, │
│      createdAt, customerId,         │
│      merchantId                     │
│    }                                │
│  )                                  │
└────────┬────────────────────────────┘
         │
         │ 7. Client receives event
         ↓
┌─────────────────────────────────────┐
│  Client-Side Handler                │
│  socket.on('transaction:completed',
│    (data) => {                      │
│      // Update UI                   │
│      // Refresh balance             │
│      // Show notification           │
│      // Update transaction list     │
│    }                                │
│  )                                  │
└─────────────────────────────────────┘
```

---

## Database Schema Overview

### Entity Relationship Diagram (Simplified)

```
                    ┌─────────────┐
                    │    users    │
                    │─────────────│
                    │ id (UUID)   │
                    │ email       │
                    │ password    │
                    │ kyc_status  │
                    │ kyc_tier    │
                    └────┬────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ↓                         ↓
    ┌──────────────┐        ┌─────────────────┐
    │   wallets    │        │   merchants     │
    │──────────────│        │─────────────────│
    │ user_id (FK) │        │ user_id (FK)    │
    │ balance      │        │ kyc_status      │
    │ currency     │        │ settlement_freq │
    │ created_at   │        │ risk_level      │
    └───┬──────────┘        └────┬────────────┘
        │                        │
        │                        ↓
        │                ┌──────────────────────┐
        │                │ merchant_kyc_docs    │
        │                │──────────────────────│
        │                │ merchant_id (FK)     │
        │                │ document_type        │
        │                │ s3_url               │
        │                │ ocr_data (JSON)      │
        │                └──────────────────────┘
        │
        ├────────────────────┐
        ↓                    ↓
    ┌───────────────┐  ┌──────────────────┐
    │ transactions  │  │ payment_methods  │
    │───────────────│  │──────────────────│
    │ wallet_id (FK)│  │ user_id (FK)     │
    │ amount        │  │ type (card, bank)│
    │ status        │  │ is_active        │
    │ created_at    │  │ last_4_digits    │
    │               │  │ token_id         │
    └────┬──────────┘  └──────────────────┘
         │
         ├──────────────────┐
         ↓                  ↓
    ┌──────────────┐  ┌─────────────────┐
    │   disputes   │  │ subscription_    │
    │──────────────│  │    plans        │
    │ trans_id (FK)│  │─────────────────│
    │ reason       │  │ merchant_id (FK)│
    │ status       │  │ amount          │
    │ created_at   │  │ frequency       │
    └────┬─────────┘  │ trial_days      │
         │            └────┬────────────┘
         ↓                 │
    ┌──────────────────┐  ↓
    │dispute_evidence  │┌───────────────────┐
    │──────────────────││  subscriptions    │
    │dispute_id (FK)   ││───────────────────│
    │file_url (S3)     ││ plan_id (FK)      │
    │uploaded_at       ││ user_id (FK)      │
    └──────────────────││ status            │
                       ││ next_charge_date  │
                       └───────┬────────────┘
                               │
                               ↓
                        ┌───────────────────┐
                        │ subscription_     │
                        │   charges         │
                        │───────────────────│
                        │ subscription_id   │
                        │ amount            │
                        │ status            │
                        │ retry_count       │
                        │ scheduled_date    │
                        └───────────────────┘
```

---

## Deployment Architecture

### Production Infrastructure (Planned)

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENTS                                      │
│   Web │ Mobile │ Admin │ Partners │ Webhooks                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────────┐
│                  LOAD BALANCER (Nginx)                          │
│  - Route requests to API instances                              │
│  - SSL/TLS termination                                          │
│  - Request throttling                                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
      ┌────────────────┼────────────────┐
      ↓                ↓                ↓
┌───────────────┐┌───────────────┐┌───────────────┐
│ API Instance  ││ API Instance  ││ API Instance  │
│ (Docker)      ││ (Docker)      ││ (Docker)      │
│ NestJS        ││ NestJS        ││ NestJS        │
│ 8081          ││ 8082          ││ 8083          │
└───────┬───────┘└───────┬───────┘└───────┬───────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ↓                                 ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│  PostgreSQL (Primary)    │  │  Redis Cluster           │
│  - Replication (Primary  │  │  - Session storage       │
│    + 2 Replicas)         │  │  - Rate limit state      │
│  - Automated backups     │  │  - Job queue (Bull)      │
│  - Point-in-time restore │  │  - Pub/Sub               │
│  - 500 GB storage        │  │  - 50 GB memory          │
└──────────────────────────┘  └──────────────────────────┘
        ↑                                 ↑
        └────────────────┬────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ↓                                 ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│  S3 Storage (Documents)  │  │  Elasticsearch           │
│  - Encrypted documents   │  │  - Transaction logs      │
│  - Receipts (7 years)    │  │  - Audit logs            │
│  - Evidence files        │  │  - Metrics/analytics     │
│  - 2 TB storage          │  │  - Search capability     │
│  - Versioning            │  │                          │
│  - Lifecycle policies    │  │                          │
└──────────────────────────┘  └──────────────────────────┘
        ↑                                 ↑
        │                                 │
        └────────────────┬────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ↓                                 ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│  Monitoring & Logging    │  │  Message Queue           │
│  - Datadog               │  │  - Kafka (event stream)  │
│  - Winston logs          │  │  - Dead letter queues    │
│  - Alerting              │  │  - Guaranteed delivery   │
│  - Dashboards            │  │                          │
└──────────────────────────┘  └──────────────────────────┘
```

---

## Scalability & Performance

### Performance Targets

```
ENDPOINT LATENCY TARGETS:

Authentication (Login/Register)
├── P50: 200ms
├── P95: 500ms
└── P99: 1000ms

Transaction Processing (Payment)
├── P50: 300ms (excluding payment processor: 1-3s)
├── P95: 800ms
└── P99: 2000ms

Fraud Risk Scoring
├── P50: 100ms
├── P95: 300ms
└── P99: 500ms

Subscription Charging
├── P50: 1000ms (per charge, excluding payment processor)
├── P95: 2000ms
└── P99: 3000ms

Batch Operations (100 items)
├── P50: 500ms
├── P95: 1500ms
└── P99: 3000ms

THROUGHPUT TARGETS:

Transactions per second (TPS)
├── Current (Sprint): 100 TPS
├── Q1-Q2 (6 months): 500 TPS
├── Q3-Q4 (1 year): 2000 TPS
└── Year 2: 10,000 TPS

Concurrent WebSocket Connections
├── Current: 1,000
├── 6 months: 10,000
├── 1 year: 100,000
└── 2 years: 1,000,000

API Requests per Second
├── Current: 1,000 RPS
├── 6 months: 5,000 RPS
├── 1 year: 20,000 RPS
└── 2 years: 100,000 RPS

DATABASE:

Query Performance
├── Simple queries: <10ms (cached)
├── Complex queries: <100ms
├── Batch queries: <500ms (1000 items)
└── Analytics queries: <5s

Connection Pool
├── Pool size: 20 connections
├── Max connections: 100
├── Idle timeout: 30s
└── Statement caching: Enabled

CACHING:

Rate Limit Checks
├── Hit rate: >95%
├── Cache lookup: <5ms
├── Memory usage: <100MB

Session Cache
├── Hit rate: >99%
├── TTL: 24 hours
├── Memory: <500MB

API Response Caching
├── Static content: 1 hour
├── Merchant data: 5 minutes
├── User data: 1 minute
└── Transaction data: Not cached (real-time)
```

---

## Design Patterns Used

### 1. **Repository Pattern**
- Abstraction of data access layer
- Easy to mock for testing
- Consistent query interface

### 2. **Service Pattern**
- Business logic encapsulation
- Dependency injection
- Separation of concerns

### 3. **Dependency Injection**
- NestJS @Injectable() decorator
- Constructor-based injection
- Loose coupling

### 4. **Event-Driven Architecture**
- Redis Pub/Sub for events
- Decoupled services
- Real-time notifications

### 5. **Circuit Breaker Pattern**
- Payment processor timeout handling
- Graceful degradation
- Exponential backoff

### 6. **Idempotency Pattern**
- Duplicate transaction prevention
- UUID-based idempotency keys
- Safe retries

### 7. **Double-Entry Ledger**
- Guaranteed accounting accuracy
- Immutable transaction records
- Audit trails

### 8. **State Machine**
- Transaction states (PENDING → PROCESSING → SUCCESS/FAILED)
- Subscription states (PENDING → ACTIVE → PAUSED/CANCELLED/EXPIRED)
- Dispute states (OPEN → INVESTIGATING → RESOLVED)

### 9. **Decorator Pattern**
- @Guard for authentication
- @Pipe for validation
- @Interceptor for logging

### 10. **Adapter Pattern**
- Payment processor adapters (Paystack, Flutterwave)
- Notification adapters (Email, SMS, Push)
- External service interfaces

---

## Security Architecture

### Data Protection Layers

```
┌─────────────────────────────────────────┐
│     Client Request (HTTPS)              │
│  - TLS 1.3 encryption                   │
│  - Certificate pinning (mobile)         │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│     Request Signing Verification        │
│  - HMAC-SHA256 signature check          │
│  - Nonce replay prevention              │
│  - Timestamp validation (±5 min)        │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│     Authentication (JWT)                │
│  - Token validation                     │
│  - Expiration check                     │
│  - Redis session lookup                 │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│     Authorization (RBAC)                │
│  - Role-based access control            │
│  - Resource-level permissions           │
│  - API quota enforcement                │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│     Rate Limiting                       │
│  - Per-customer limits                  │
│  - Per-merchant quotas                  │
│  - Token-bucket algorithm               │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│     Input Validation                    │
│  - class-validator decorators           │
│  - Type checking                        │
│  - Sanitization                         │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│     Business Logic Execution            │
│  - Service layer processing             │
│  - Database queries (parameterized)     │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│     Field-Level Encryption              │
│  - AES-256-GCM for sensitive data       │
│  - Encryption keys in AWS KMS           │
│  - Encrypted at rest                    │
│  Encrypted fields:                      │
│  - Tax IDs                              │
│  - Bank account numbers                 │
│  - Card tokens                          │
│  - Personal ID numbers                  │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│     Database Storage                    │
│  - PostgreSQL with encryption           │
│  - Immutable audit logs                 │
│  - Point-in-time recovery               │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│     Response Encryption                 │
│  - AES-256-GCM encryption               │
│  - HMAC-SHA256 signing                  │
│  - Nonce and timestamp included         │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│     HTTPS Response                      │
│  - TLS 1.3 encryption                   │
│  - Security headers (HSTS, CSP, etc)    │
└─────────────────────────────────────────┘
```

---

## Document Version & Changelog

**Version:** 1.0  
**Date:** November 10, 2025

### What This Document Covers

- [x] System architecture overview
- [x] Layered architecture breakdown
- [x] Core module dependencies
- [x] Authentication & request signing flows
- [x] Payment processing lifecycle
- [x] Fraud detection real-time scoring
- [x] Subscription charge automation
- [x] Dispute resolution workflow
- [x] Real-time WebSocket events
- [x] Database schema overview
- [x] Deployment architecture (planned)
- [x] Scalability & performance targets
- [x] Security architecture

### Future Documentation

- [ ] API OpenAPI/Swagger specs
- [ ] Database migration guides
- [ ] Deployment playbooks
- [ ] Disaster recovery procedures
- [ ] Performance tuning guides
- [ ] Troubleshooting guides

---

**Architecture designed for scalability, security, and maintainability**  
**All diagrams ASCII-based for documentation consistency**  
**Subject to updates as implementation progresses**

