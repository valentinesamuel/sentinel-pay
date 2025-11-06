# System Architecture - Ubiquitous Tribble Payment Platform

**Version:** 1.0.0
**Date:** January 2025
**Status:** Active Development

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Architectural Principles](#architectural-principles)
3. [Service Architecture](#service-architecture)
4. [Technology Stack](#technology-stack)
5. [Communication Patterns](#communication-patterns)
6. [Data Architecture](#data-architecture)
7. [Security Architecture](#security-architecture)
8. [Infrastructure Architecture](#infrastructure-architecture)
9. [Scalability & Performance](#scalability--performance)
10. [Monitoring & Observability](#monitoring--observability)

---

## Architecture Overview

### High-Level Architecture

The Ubiquitous Tribble Payment Platform follows a **Hybrid Microservices Architecture** - a modular monolith for the core payment API with selective microservices for specialized concerns (reconciliation, notifications).

```
┌────────────────────────────────────────────────────────────────────┐
│                         Client Applications                         │
│              (Web, Mobile, Third-party Integrations)                │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         │ HTTPS/TLS 1.3
                         │
┌────────────────────────▼───────────────────────────────────────────┐
│                    API Gateway / Load Balancer                      │
│                          (NGINX / Future)                           │
│                   - Rate Limiting                                   │
│                   - SSL Termination                                 │
│                   - Request Routing                                 │
└────────────────────────┬───────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬───────────────┐
         │               │               │               │
┌────────▼────────┐ ┌───▼─────────┐ ┌──▼──────────┐ ┌─▼─────────────┐
│  Payment API    │ │Mock Provider│ │Reconciliation│ │ Notification  │
│  (Monolith)     │ │  Service    │ │  Service     │ │   Service     │
│                 │ │             │ │              │ │               │
│ ┌─────────────┐ │ │ ┌─────────┐ │ │  ┌────────┐ │ │  ┌─────────┐  │
│ │Auth Module  │ │ │ │NIBSS    │ │ │  │Recon   │ │ │  │Email    │  │
│ │User Module  │ │ │ │NIP      │ │ │  │Engine  │ │ │  │SMS      │  │
│ │Wallet Module│ │ │ │Card Net │ │ │  │Matcher │ │ │  │Push     │  │
│ │Payment Module│ │ │ │Paystack │ │ │  │Reporter│ │ │  │Templates│  │
│ │Transfer Mod │ │ │ │Flutter  │ │ │  └────────┘ │ │  └─────────┘  │
│ │... 17 Mods  │ │ │ └─────────┘ │ │              │ │               │
│ └─────────────┘ │ │             │ │              │ │               │
│                 │ │             │ │              │ │               │
│  Port: 3000     │ │ Port: 3001  │ │ Port: 3002   │ │ Port: 3003    │
└────────┬────────┘ └──────┬──────┘ └──────┬───────┘ └───────┬───────┘
         │                 │                │                 │
         │                 │                │                 │
         └─────────────────┴────────────────┴─────────────────┘
                                    │
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
┌────────▼────────┐        ┌────────▼────────┐        ┌──────▼──────┐
│   PostgreSQL    │        │     Redis       │        │   MinIO     │
│   Database      │        │  Cache & Queue  │        │  Storage    │
│                 │        │                 │        │             │
│ - User Data     │        │ - Session Cache │        │ - Documents │
│ - Wallets       │        │ - Rate Limiting │        │ - KYC Files │
│ - Transactions  │        │ - Job Queues    │        │ - Receipts  │
│ - Ledger        │        │ - Pub/Sub       │        │             │
│                 │        │                 │        │             │
│ Port: 5432      │        │ Port: 6379      │        │ Port: 9000  │
└─────────────────┘        └─────────────────┘        └─────────────┘
```

---

## Architectural Principles

### 1. **Modularity**
- **Modular Monolith:** Core payment-api organized into feature modules
- **Clear Boundaries:** Each module is self-contained with its own controllers, services, and entities
- **Dependency Injection:** Loose coupling through NestJS DI container

### 2. **Scalability**
- **Horizontal Scaling:** Stateless services can scale horizontally
- **Vertical Scaling:** Database can scale with read replicas
- **Async Processing:** Heavy operations offloaded to queues

### 3. **Reliability**
- **Circuit Breakers:** Protect against cascading failures (Opossum)
- **Retry Logic:** Automatic retry with exponential backoff
- **Graceful Degradation:** Service continues with reduced functionality

### 4. **Security First**
- **Defense in Depth:** Multiple security layers
- **Principle of Least Privilege:** Minimal permissions
- **Zero Trust:** Verify every request

### 5. **Data Integrity**
- **Double-Entry Accounting:** Every transaction balanced
- **Event Sourcing:** Immutable audit trail
- **ACID Transactions:** Database consistency guaranteed

### 6. **Observability**
- **Structured Logging:** JSON logs with context
- **Health Checks:** Liveness and readiness probes
- **Audit Trail:** Complete operation history

---

## Service Architecture

### Payment API (Modular Monolith)

**Port:** 3000
**Language:** TypeScript (NestJS)
**Database:** PostgreSQL
**Cache:** Redis

#### Modules (17):

1. **Auth Module** - Authentication & authorization
   - JWT token generation
   - Refresh tokens
   - MFA support
   - Session management

2. **Users Module** - User management
   - User registration
   - Profile management
   - User search
   - User status management

3. **Wallets Module** - Multi-currency wallets
   - Wallet creation
   - Balance management
   - Currency support
   - Wallet operations

4. **Payments Module** - Payment processing
   - Card payments
   - Bank payments
   - Payment status tracking
   - Payment retry

5. **Transfers Module** - Money transfers
   - P2P transfers
   - International transfers
   - Transfer limits
   - Scheduled transfers

6. **Cards Module** - Card management
   - Card linking
   - Card tokenization
   - Card verification
   - 3D Secure

7. **Banks Module** - Bank account management
   - Account linking
   - Account verification
   - Bank list
   - NIP integration

8. **Transactions Module** - Transaction history
   - Transaction listing
   - Transaction details
   - Transaction search
   - Transaction export

9. **Refunds Module** - Refund processing
   - Refund requests
   - Partial refunds
   - Refund approval
   - Refund tracking

10. **Disputes Module** - Dispute management
    - Dispute filing
    - Evidence upload
    - Dispute resolution
    - Dispute tracking

11. **Bills Module** - Bill payments
    - Airtime purchase
    - Data bundles
    - Utility bills
    - Cable TV

12. **FX Module** - Currency exchange
    - FX rates
    - Currency conversion
    - Rate history
    - Rate caching

13. **KYC Module** - KYC verification
    - Document upload
    - Verification workflow
    - Tier management
    - Limit enforcement

14. **Webhooks Module** - Webhook management
    - Subscription management
    - Event delivery
    - Retry logic
    - Signature verification

15. **Reports Module** - Reporting & analytics
    - Transaction reports
    - Financial statements
    - User analytics
    - Custom reports

16. **Ledger Module** - Accounting ledger
    - Double-entry ledger
    - Balance calculation
    - Ledger queries
    - Financial accuracy

17. **Fraud Module** - Fraud detection
    - Rule engine
    - Risk scoring
    - Alert generation
    - Geo-blocking

18. **Notifications Module** - Internal notification coordination
    - Event emission
    - Notification queueing
    - Delivery tracking

19. **Health Module** - Health checks
    - Liveness probes
    - Readiness probes
    - Dependency checks

#### Why Modular Monolith?

**Advantages:**
- ✅ Simpler deployment (single artifact)
- ✅ Easier local development
- ✅ Shared database for ACID transactions
- ✅ No network latency between modules
- ✅ Simpler debugging and testing
- ✅ Lower infrastructure costs

**Trade-offs:**
- ❌ Entire app must deploy together
- ❌ Cannot scale modules independently
- ❌ Single point of failure
- ❌ Larger codebase

**Mitigation:**
- Extract services when needed (reconciliation, notifications already extracted)
- Use module boundaries to prepare for future extraction
- Design with eventual microservices in mind

---

### Mock Providers Service

**Port:** 3001
**Purpose:** Simulate external payment providers
**Language:** TypeScript (NestJS)

#### Modules (7):

1. **NIBSS Module** - Nigeria Inter-Bank Settlement System
   - Account verification
   - Transfer processing
   - Settlement files

2. **NIP Module** - Nigeria Instant Payment
   - Instant transfers
   - Account lookup
   - Transfer confirmation

3. **Card Networks Module** - VISA, Mastercard, Verve
   - Card verification
   - Payment authorization
   - 3D Secure simulation

4. **Paystack Module** - Paystack payment gateway
   - Card payments
   - Bank transfers
   - Webhooks

5. **Flutterwave Module** - Flutterwave payment gateway
   - Card payments
   - Bank transfers
   - Currency exchange

6. **Webhooks Module** - Webhook delivery simulation
   - Asynchronous callbacks
   - Retry logic
   - Signature generation

7. **Settlement Module** - Settlement file generation
   - Daily settlement files
   - Transaction reconciliation data
   - Discrepancy simulation

#### Mock Behavior

**Realistic Simulation:**
- ✅ Variable delays (100ms - 2000ms)
- ✅ Random failures (5% fail rate)
- ✅ Dynamic responses
- ✅ Webhook callbacks
- ✅ Settlement files with discrepancies

---

### Reconciliation Service

**Port:** 3002
**Purpose:** Automated transaction reconciliation
**Language:** TypeScript (NestJS)

#### Features:
- Daily reconciliation jobs
- Settlement file parsing
- Transaction matching
- Discrepancy detection
- Manual adjustment support
- Reconciliation reports

#### Why Separate Service?

**Reasons:**
- **Resource Intensive:** CPU-heavy reconciliation algorithms
- **Scheduled Jobs:** Runs on cron schedule
- **Isolation:** Failures don't affect payment processing
- **Scalability:** Can scale independently

---

### Notification Service

**Port:** 3003
**Purpose:** Multi-channel notifications
**Language:** TypeScript (NestJS)

#### Features:
- Email notifications (MailHog for dev)
- SMS notifications (mock for dev)
- Push notifications (future)
- Template management
- Delivery tracking
- Retry logic

#### Why Separate Service?

**Reasons:**
- **Async Operations:** Fire-and-forget notifications
- **Rate Limiting:** External SMS/email provider limits
- **Isolation:** Notification failures don't affect core transactions
- **Cost Management:** Separate monitoring for SMS costs

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20 LTS | Runtime environment |
| **NestJS** | 10.2+ | Backend framework |
| **TypeScript** | 5.3+ | Programming language |
| **TypeORM** | 0.3.17 | ORM for database |
| **Express** | 4.x | Web server |
| **class-validator** | 0.14+ | Request validation |
| **class-transformer** | 0.5+ | Object transformation |
| **Passport** | 0.7+ | Authentication |
| **JWT** | 10.2+ | Token-based auth |
| **bcrypt** | 5.1+ | Password hashing |
| **Opossum** | 8.1+ | Circuit breaker |

### Database & Storage

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 15 | Primary database |
| **Redis** | 7 | Cache & session store |
| **MinIO** | Latest | Object storage (S3-compatible) |

### Queue & Messaging

| Technology | Version | Purpose |
|------------|---------|---------|
| **BullMQ** | 5.1+ | Job queue |
| **Redis** | 7 | Queue backend |

### DevOps

| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | 24+ | Containerization |
| **Docker Compose** | 2.x | Local orchestration |
| **GitHub Actions** | N/A | CI/CD pipeline |
| **NGINX** | Latest | Reverse proxy (future) |

### Monitoring & Logging

| Technology | Version | Purpose |
|------------|---------|---------|
| **Winston** | 3.11+ | Structured logging |
| **Prometheus** | Latest | Metrics (future) |
| **Grafana** | Latest | Dashboards (future) |

---

## Communication Patterns

### 1. Synchronous Communication (HTTP/REST)

**Use Cases:**
- Client ↔ Payment API
- Payment API ↔ Mock Providers
- Payment API ↔ Reconciliation Service
- Payment API ↔ Notification Service

**Protocol:** HTTP/REST over TLS 1.3

**Format:** JSON

**Example:**
```typescript
// Payment API calls Mock Provider
const response = await this.httpService.post(
  'http://mock-providers:3001/api/nibss/transfer',
  {
    account_number: '0123456789',
    amount: 50000,
    narration: 'Payment'
  },
  {
    headers: {
      'Authorization': 'Bearer ${apiKey}',
      'X-Idempotency-Key': uuidv4()
    },
    timeout: 30000
  }
);
```

**Features:**
- Circuit breakers (Opossum)
- Retry logic (exponential backoff)
- Timeout handling
- Request/response logging

---

### 2. Asynchronous Communication (Message Queue)

**Use Cases:**
- Background job processing
- Event-driven workflows
- Notification sending
- Report generation
- Reconciliation jobs

**Technology:** BullMQ + Redis

**Example:**
```typescript
// Add job to queue
await this.paymentQueue.add('process-payment', {
  paymentId: 'uuid',
  amount: 50000,
  currency: 'NGN'
}, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
});

// Process job
@Processor('payments')
export class PaymentProcessor {
  @Process('process-payment')
  async handlePayment(job: Job) {
    const { paymentId } = job.data;
    // Process payment
  }
}
```

**Queue Types:**
- `payments` - Payment processing
- `notifications` - Notification delivery
- `reconciliation` - Reconciliation jobs
- `webhooks` - Webhook delivery
- `ledger` - Ledger entry creation
- `fraud-analysis` - Fraud detection
- `refunds` - Refund processing
- `reports` - Report generation

---

### 3. Event-Driven Architecture

**Technology:** NestJS EventEmitter + BullMQ

**Pattern:** Domain events

**Example:**
```typescript
// Emit event
this.eventEmitter.emit('payment.completed', {
  paymentId: 'uuid',
  userId: 'uuid',
  amount: 50000,
  currency: 'NGN',
  timestamp: new Date()
});

// Listen to event
@OnEvent('payment.completed')
async handlePaymentCompleted(payload: PaymentCompletedEvent) {
  // Create ledger entries
  // Send notification
  // Update wallet balance
  // Trigger fraud check
}
```

**Event Types:** 50+ events (see `libs/shared/src/constants/events.ts`)

---

## Data Architecture

### Database Schema Design

#### 1. **Normalization**
- 3NF (Third Normal Form)
- No data duplication
- Referential integrity enforced

#### 2. **Partitioning Strategy** (Future)
- Partition transactions by date (monthly)
- Partition audit logs by date
- Archive old data

#### 3. **Indexing Strategy**
```sql
-- Primary keys (automatic B-tree index)
-- Foreign keys (explicit indexes)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_wallets_user_currency ON wallets(user_id, currency);
CREATE INDEX idx_transactions_user_status ON transactions(user_id, status);

-- Unique constraints
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_transactions_reference ON transactions(reference);
```

#### 4. **Data Retention**
- **Transactions:** 7 years (compliance)
- **Audit Logs:** 7 years (compliance)
- **User Data:** Until account deletion + 90 days
- **Sessions:** 7 days
- **Logs:** 30 days

---

### Double-Entry Ledger System

**Principle:** Every transaction creates balanced ledger entries

**Example: P2P Transfer (100 NGN from Alice to Bob)**

```
Transaction:
  id: txn-123
  amount: 10000 (in kobo)
  status: completed

Ledger Entries:
  Entry 1 (Alice's wallet):
    type: DEBIT
    amount: 10000
    balance_before: 50000
    balance_after: 40000

  Entry 2 (Bob's wallet):
    type: CREDIT
    amount: 10000
    balance_before: 20000
    balance_after: 30000

Verification: SUM(debits) = SUM(credits) = 10000 ✓
```

**Benefits:**
- Mathematical balance verification
- Complete audit trail
- Historical balance reconstruction
- Fraud detection

---

### Caching Strategy

**Redis Cache Layers:**

1. **Session Cache**
   - TTL: 1 hour (access token)
   - TTL: 7 days (refresh token)
   - Key: `session:{userId}:{deviceId}`

2. **Rate Limit Cache**
   - TTL: 1 minute
   - Key: `ratelimit:{ip}:{endpoint}`

3. **FX Rate Cache**
   - TTL: 1 hour
   - Key: `fx:rate:{from}:{to}`

4. **Query Cache (TypeORM)**
   - TTL: 30 seconds
   - Key: Automatic (TypeORM manages)

5. **Idempotency Cache**
   - TTL: 24 hours
   - Key: `idempotency:{key}`

**Cache Invalidation:**
- Time-based (TTL)
- Event-based (on updates)
- Manual (admin action)

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────┐
│  Layer 1: Network Security              │
│  - TLS 1.3                               │
│  - HTTPS only                            │
│  - CORS whitelist                        │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│  Layer 2: API Gateway Security          │
│  - Rate limiting                         │
│  - DDoS protection                       │
│  - Request validation                    │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│  Layer 3: Application Security          │
│  - JWT authentication                    │
│  - Role-based access control             │
│  - Input validation                      │
│  - SQL injection prevention              │
│  - XSS protection                        │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│  Layer 4: Business Logic Security       │
│  - Transaction limits per KYC tier       │
│  - Fraud detection rules                 │
│  - Velocity checks                       │
│  - Geo-blocking                          │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│  Layer 5: Data Security                 │
│  - Field-level encryption                │
│  - Row-level security (RLS)              │
│  - Database SSL/TLS                      │
│  - Encrypted backups                     │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│  Layer 6: Audit & Monitoring            │
│  - Audit logging                         │
│  - Security alerts                       │
│  - Anomaly detection                     │
└─────────────────────────────────────────┘
```

**See:** [Security Architecture](../security/SECURITY_ARCHITECTURE.md) for complete details

---

## Infrastructure Architecture

### Development Environment

```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]

  mailhog:
    image: mailhog/mailhog
    ports: ["1025:1025", "8025:8025"]

  redis-commander:
    image: rediscommander/redis-commander
    ports: ["8081:8081"]

  bullmq-board:
    image: deadly0/bull-board
    ports: ["3400:3000"]
```

### Production Environment (Future)

```
┌─────────────────────────────────────────┐
│          Load Balancer (NGINX)          │
│             - SSL Termination            │
│             - Rate Limiting              │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
┌───────▼──────┐ ┌─────▼────────┐
│ Payment API  │ │ Payment API  │  (Horizontal Scaling)
│  Instance 1  │ │  Instance 2  │
└───────┬──────┘ └─────┬────────┘
        │               │
        └───────┬───────┘
                │
┌───────────────▼─────────────────────────┐
│        PostgreSQL Cluster                │
│  ┌──────────┐  ┌──────────┐            │
│  │ Primary  │→ │ Replica  │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

---

## Scalability & Performance

### Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| API Latency (p95) | < 200ms | Caching, indexing, connection pooling |
| API Latency (p99) | < 500ms | Same as above |
| Throughput | 100 TPS | Horizontal scaling, async processing |
| Database Queries | < 100ms | Indexes, query optimization, caching |
| Concurrent Users | 10,000 | Stateless services, Redis sessions |
| Availability | 99.9% | Health checks, auto-restart, monitoring |

### Scalability Strategy

**Horizontal Scaling:**
- Stateless services (no local state)
- Load balancer distribution
- Database connection pooling

**Vertical Scaling:**
- Database resources (CPU, RAM)
- Redis resources

**Async Processing:**
- BullMQ for heavy operations
- Background jobs for reports
- Webhook delivery offloaded

**Caching:**
- Redis for hot data
- TypeORM query cache
- CDN for static assets (future)

---

## Monitoring & Observability

### Health Checks

**Endpoints:**
- `GET /api/health` - Full health check
- `GET /api/health/liveness` - Service alive
- `GET /api/health/readiness` - Service ready

**Checks:**
- Database connectivity
- Redis connectivity
- Memory usage
- Disk space
- Response time

### Logging

**Structured Logging (Winston):**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "context": "PaymentService",
  "message": "Payment processed successfully",
  "metadata": {
    "paymentId": "uuid",
    "userId": "uuid",
    "amount": 50000,
    "currency": "NGN",
    "duration_ms": 250
  }
}
```

**Log Levels:**
- **error:** Application errors
- **warn:** Warning conditions
- **info:** Informational messages
- **debug:** Debug information (dev only)

### Metrics (Future)

**Prometheus Metrics:**
- Request rate (req/s)
- Response time (ms)
- Error rate (%)
- Active connections
- Queue length
- Cache hit rate

---

## Design Patterns

### 1. **Repository Pattern**
```typescript
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  async findByEmail(email: string): Promise<User> {
    return this.userRepo.findOne({ where: { email } });
  }
}
```

### 2. **Service Layer Pattern**
```typescript
@Injectable()
export class PaymentService {
  constructor(
    private paymentRepo: PaymentRepository,
    private walletService: WalletService,
    private ledgerService: LedgerService
  ) {}

  async processPayment(dto: CreatePaymentDto): Promise<Payment> {
    // Business logic
  }
}
```

### 3. **CQRS Pattern** (Partial)
- Commands: Write operations (create, update, delete)
- Queries: Read operations (find, list)
- Separate DTOs for commands and queries

### 4. **SAGA Pattern** (For Distributed Transactions)
```typescript
// Example: Transfer money between users
async transferMoney(from: string, to: string, amount: number) {
  // Step 1: Debit source wallet
  // Step 2: Credit destination wallet
  // Compensating actions if any step fails
}
```

### 5. **Circuit Breaker Pattern**
```typescript
const breaker = new CircuitBreaker(
  async () => {
    return await this.httpService.post(url, data);
  },
  {
    timeout: 30000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
  }
);
```

---

## Future Enhancements

### Phase 2 (Post-MVP):
- **Kubernetes Deployment:** Container orchestration
- **GraphQL API:** Alternative to REST
- **gRPC:** Service-to-service communication
- **Event Sourcing:** Complete event store
- **CQRS:** Full separation of read/write models
- **Read Replicas:** Database scaling
- **CDN:** Static asset delivery

### Phase 3 (Advanced):
- **Multi-Region:** Geographic distribution
- **Sharding:** Database horizontal partitioning
- **Message Broker:** Kafka/RabbitMQ
- **Service Mesh:** Istio
- **Observability:** Full Prometheus + Grafana stack
- **APM:** Application Performance Monitoring

---

## Architecture Decision Records (ADRs)

### ADR-001: Modular Monolith vs Microservices
**Decision:** Start with modular monolith, extract services as needed
**Rationale:** Simpler for solo developer, easier to refactor later
**Status:** Accepted

### ADR-002: PostgreSQL vs MongoDB
**Decision:** PostgreSQL
**Rationale:** ACID compliance, strong consistency, relational data
**Status:** Accepted

### ADR-003: REST vs GraphQL
**Decision:** REST for MVP, GraphQL future consideration
**Rationale:** REST is simpler, well-documented, industry standard
**Status:** Accepted

### ADR-004: BullMQ vs RabbitMQ
**Decision:** BullMQ
**Rationale:** Redis-based, simpler setup, good enough for MVP
**Status:** Accepted

### ADR-005: TypeORM vs Prisma
**Decision:** TypeORM
**Rationale:** Better NestJS integration, decorator-based, migrations support
**Status:** Accepted

---

## Conclusion

This architecture provides:
- ✅ **Scalability:** Horizontal and vertical scaling
- ✅ **Reliability:** Circuit breakers, retries, health checks
- ✅ **Security:** Multiple security layers
- ✅ **Maintainability:** Modular design, clear boundaries
- ✅ **Observability:** Logging, monitoring, health checks
- ✅ **Performance:** Caching, indexing, async processing

The hybrid approach balances simplicity (modular monolith) with flexibility (extracted microservices), making it ideal for a solo developer building a production-grade portfolio project.

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Next Review:** After Sprint 5
