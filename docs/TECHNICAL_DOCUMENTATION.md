# Technical Documentation - Ubiquitous Tribble Payment Platform

**Version:** 1.0.0
**Last Updated:** January 2025
**Status:** Active Development
**License:** MIT

---

## 📚 Documentation Index

This is the master technical documentation for the Ubiquitous Tribble Payment Platform - a production-grade, multi-currency payment and wallet system built with NestJS and PostgreSQL.

---

## Table of Contents

### 1. [System Architecture](./architecture/SYSTEM_ARCHITECTURE.md)
- High-level architecture overview
- Service architecture (modular monolith + microservices)
- Communication patterns
- Infrastructure components
- Technology stack

### 2. [Technical Specifications](./technical/TECHNICAL_SPECIFICATIONS.md)
- System requirements
- Performance targets
- Scalability considerations
- Security requirements
- Compliance standards

### 3. [API Documentation](./api/API_DOCUMENTATION.md)
- API design principles
- Authentication & authorization
- Endpoint specifications
- Request/response formats
- Error handling
- Rate limiting

### 4. [Database Documentation](./database/DATABASE_DOCUMENTATION.md)
- Database architecture
- Entity relationship diagrams
- Schema definitions
- Indexes and constraints
- Migration strategy
- Data retention policies

### 5. [Security Documentation](./security/SECURITY_ARCHITECTURE.md)
- Security layers
- Authentication mechanisms
- Encryption standards
- Access control
- Audit logging
- Threat model

### 6. [Infrastructure Documentation](./infrastructure/INFRASTRUCTURE_GUIDE.md)
- Docker configuration
- Service dependencies
- Network topology
- Monitoring & logging
- Backup & recovery
- Disaster recovery

### 7. [Development Guide](./development/DEVELOPMENT_GUIDE.md)
- Getting started
- Development environment setup
- Coding standards
- Git workflow
- Testing practices
- Debugging tips

### 8. [Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)
- Deployment strategy
- Environment configuration
- CI/CD pipeline
- Zero-downtime deployment
- Rollback procedures
- Production checklist

### 9. [Testing Documentation](./testing/TESTING_STRATEGY.md)
- Testing philosophy
- Unit testing
- Integration testing
- E2E testing
- Load testing
- Security testing

### 10. [Integration Guide](./integration/INTEGRATION_GUIDE.md)
- External provider integrations
- Webhook implementation
- SDK usage
- Third-party services
- Mock providers

---

## Quick Start

### For Developers:
```bash
# Clone repository
git clone <repository-url>

# Read documentation
1. Start with: docs/development/DEVELOPMENT_GUIDE.md
2. Then read: docs/architecture/SYSTEM_ARCHITECTURE.md
3. Setup: Follow docs/development/DEVELOPMENT_GUIDE.md#setup

# Start development
npm install
docker-compose up -d
npm run start:dev
```

### For DevOps:
```bash
# Read deployment docs
1. docs/infrastructure/INFRASTRUCTURE_GUIDE.md
2. docs/deployment/DEPLOYMENT_GUIDE.md

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### For API Consumers:
```bash
# Read API documentation
1. docs/api/API_DOCUMENTATION.md
2. Access Swagger UI: http://localhost:3000/api/docs
```

---

## System Overview

### What is Ubiquitous Tribble?

A **production-grade payment platform** that combines features from Chipper Cash and OPay, supporting:

- ✅ Multi-currency wallets (NGN, USD, GBP, EUR)
- ✅ P2P transfers (local and international)
- ✅ Card payments (VISA, Mastercard, Verve)
- ✅ Bank transfers (NIBSS, NIP)
- ✅ Bill payments (airtime, utilities, cable TV)
- ✅ Currency exchange with FX rates
- ✅ Refunds and dispute management
- ✅ Automated reconciliation
- ✅ Rule-based fraud detection
- ✅ KYC verification and tiering

### Architecture Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (NGINX)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┬─────────────┐
         │             │             │             │
    ┌────▼───┐   ┌────▼───┐   ┌────▼───┐   ┌────▼────┐
    │Payment │   │ Mock   │   │Recon-  │   │Notifi-  │
    │  API   │   │Provider│   │ciliation│   │cation   │
    └────┬───┘   └────┬───┘   └────┬───┘   └────┬────┘
         │            │            │             │
    ┌────▼────────────▼────────────▼─────────────▼─────┐
    │              PostgreSQL Database                  │
    └───────────────────────────────────────────────────┘
         │            │            │
    ┌────▼───┐   ┌───▼────┐   ┌──▼────┐
    │ Redis  │   │ MinIO  │   │BullMQ │
    │ Cache  │   │Storage │   │ Queue │
    └────────┘   └────────┘   └───────┘
```

### Technology Stack

**Backend:**
- NestJS 10 (TypeScript)
- Node.js 20 LTS
- TypeORM 0.3
- Express

**Database:**
- PostgreSQL 15
- Redis 7

**Queue:**
- BullMQ 5

**Storage:**
- MinIO (S3-compatible)

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- NGINX (API Gateway)

---

## Key Features by Epic

### EPIC-1: Core Infrastructure & Security
- Double-entry accounting ledger
- Field-level encryption (AES-256-GCM)
- Row-level security (RLS)
- JWT authentication with refresh tokens
- Rate limiting per endpoint
- Audit logging

### EPIC-2: User Management
- Email/phone registration
- Multi-factor authentication (TOTP, SMS, Email)
- Password policies
- Session management
- Device tracking

### EPIC-3: Wallet System
- Multi-currency support
- Real-time balance updates
- Transaction history
- Wallet freezing/unfreezing
- Balance locking for pending transactions

### EPIC-4: Payment Processing
- Card payments (3D Secure)
- Bank transfers
- Payment retry logic
- Idempotency keys
- Transaction reversals

### EPIC-5: Transfer & Remittance
- P2P transfers (local)
- International remittance
- Batch transfers
- Scheduled transfers
- Transfer limits per KYC tier

### EPIC-6: Card Management
- Card linking and tokenization
- Multiple cards per user
- Card verification (CVV, 3D Secure)
- Card expiry management

### EPIC-7: Bank Integration
- Bank account linking
- Account verification (micro-deposits)
- NIP integration
- Bank list management

### EPIC-8: Bill Payments
- Airtime purchase
- Data bundles
- Electricity bills
- Cable TV subscriptions
- Merchant payments

### EPIC-9: Currency Exchange
- FX rate engine
- Real-time rate updates
- Rate caching
- Historical rates
- Markup configuration

### EPIC-10: Refunds & Disputes
- Refund requests
- Partial refunds
- Dispute filing
- Evidence upload
- Resolution workflow

### EPIC-11: Fraud Detection
- Rule-based engine
- Velocity checks
- Geo-blocking
- Device fingerprinting
- Risk scoring
- Alert management

### EPIC-12: Reconciliation
- Automated reconciliation
- Settlement file parsing
- Discrepancy detection
- Manual adjustments
- Reconciliation reports

### EPIC-13: KYC & Compliance
- 4-tier KYC system
- Document upload
- Verification workflow
- Transaction limits per tier
- AML screening

### EPIC-14: Notifications
- Email notifications
- SMS notifications
- Push notifications
- Template management
- Delivery tracking

### EPIC-15: Reporting & Analytics
- Transaction reports
- Financial statements
- User analytics
- Revenue reports
- Custom reports

### EPIC-16: Webhooks
- Webhook subscriptions
- Event types
- Signature verification
- Retry logic
- Webhook logs

### EPIC-17: Mock Providers
- NIBSS mock
- NIP mock
- Card network mocks
- Paystack mock
- Settlement file generation

---

## Performance Targets

| Metric | Target | Measured |
|--------|--------|----------|
| API Response Time (p95) | < 200ms | TBD |
| API Response Time (p99) | < 500ms | TBD |
| Database Query Time (p95) | < 100ms | TBD |
| Transaction Throughput | 100 TPS | TBD |
| Concurrent Users | 10,000 | TBD |
| API Availability | 99.9% | TBD |
| Data Consistency | 100% | TBD |

---

## Security Standards

- **Authentication:** JWT with RS256
- **Encryption at Rest:** AES-256-GCM
- **Encryption in Transit:** TLS 1.3
- **Password Hashing:** bcrypt (12 rounds)
- **Database Security:** Row-level security (RLS)
- **API Security:** Rate limiting, CORS, CSRF protection
- **Compliance:** PCI-DSS aware (mock providers only)

---

## Compliance Considerations

**Note:** This is a portfolio project using mock providers. In production:

- ✅ **PCI-DSS:** Required for card data handling
- ✅ **GDPR:** Required for EU users
- ✅ **KYC/AML:** Required for financial services
- ✅ **Data Retention:** 7 years for financial records
- ✅ **Audit Logs:** Immutable, tamper-proof

---

## Development Workflow

```
1. Pick a task from Sprint Backlog
   ↓
2. Create feature branch
   ↓
3. Implement with TDD
   ↓
4. Write tests (80% coverage minimum)
   ↓
5. Run linter and formatter
   ↓
6. Self code review
   ↓
7. Commit with conventional commits
   ↓
8. Push and create PR (to main branch)
   ↓
9. CI/CD runs tests
   ↓
10. Merge to main
    ↓
11. Deploy to staging
    ↓
12. Manual testing
    ↓
13. Deploy to production
```

---

## Project Structure

```
ubiquitous-tribble/
├── apps/
│   ├── payment-api/              # Main API service
│   │   ├── src/
│   │   │   ├── modules/          # Feature modules
│   │   │   │   ├── auth/         # Authentication
│   │   │   │   ├── users/        # User management
│   │   │   │   ├── wallets/      # Wallet operations
│   │   │   │   ├── payments/     # Payment processing
│   │   │   │   ├── transfers/    # Money transfers
│   │   │   │   └── ...
│   │   │   ├── config/           # Configuration
│   │   │   ├── migrations/       # Database migrations
│   │   │   ├── main.ts           # Application entry
│   │   │   └── app.module.ts     # Root module
│   │   ├── test/                 # E2E tests
│   │   └── package.json
│   │
│   ├── mock-providers/           # Mock external APIs
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── nibss/        # NIBSS mock
│   │   │   │   ├── nip/          # NIP mock
│   │   │   │   ├── card-networks/# Card mocks
│   │   │   │   └── ...
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   ├── reconciliation-service/   # Reconciliation microservice
│   │   └── ...
│   │
│   └── notification-service/     # Notification microservice
│       └── ...
│
├── libs/                         # Shared libraries
│   ├── shared/                   # Shared utilities
│   │   ├── src/
│   │   │   ├── constants/        # Constants
│   │   │   ├── enums/            # Enums
│   │   │   ├── interfaces/       # Interfaces
│   │   │   ├── utils/            # Utilities
│   │   │   └── services/         # Shared services
│   │   └── package.json
│   │
│   └── database/                 # Database entities
│       ├── src/
│       │   ├── entities/         # TypeORM entities
│       │   ├── migrations/       # Shared migrations
│       │   └── subscribers/      # Event subscribers
│       └── package.json
│
├── docs/                         # Documentation
│   ├── architecture/             # Architecture docs
│   ├── api/                      # API documentation
│   ├── database/                 # Database docs
│   ├── security/                 # Security docs
│   ├── infrastructure/           # Infrastructure docs
│   ├── development/              # Development guides
│   ├── deployment/               # Deployment guides
│   ├── testing/                  # Testing docs
│   ├── integration/              # Integration guides
│   ├── sprints/                  # Sprint backlogs
│   ├── PRODUCT_BACKLOG.md        # Product backlog
│   └── HOW_TO_USE_BACKLOG.md     # Backlog guide
│
├── infrastructure/               # Infrastructure as Code
│   ├── docker/                   # Docker configs
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.mock
│   │   └── init-scripts/
│   ├── kubernetes/               # K8s manifests (future)
│   └── terraform/                # Terraform (future)
│
├── scripts/                      # Utility scripts
│   ├── seed-data.ts              # Database seeding
│   ├── generate-keys.sh          # Generate RSA keys
│   └── backup-db.sh              # Database backup
│
├── .github/                      # GitHub configs
│   └── workflows/
│       ├── ci.yml                # CI pipeline
│       └── cd.yml                # CD pipeline
│
├── docker-compose.yml            # Development environment
├── docker-compose.prod.yml       # Production environment
├── .env.example                  # Environment template
├── package.json                  # Root package.json
├── tsconfig.json                 # TypeScript config
├── .gitignore
├── .eslintrc.js
├── .prettierrc
└── README.md
```

---

## Environment Setup

### Prerequisites
- Node.js 20+ LTS
- Docker & Docker Compose
- PostgreSQL 15 (via Docker)
- Redis 7 (via Docker)
- Git

### Environment Variables

Create `.env` file (see `.env.example`):

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=payment_user
DB_PASSWORD=payment_pass
DB_DATABASE=payment_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here

# External Services (Mock)
MOCK_PROVIDERS_URL=http://localhost:3001

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Email (MailHog for dev)
EMAIL_HOST=localhost
EMAIL_PORT=1025

# SMS (Mock)
SMS_PROVIDER=mock

# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

---

## API Documentation

**Swagger UI:** http://localhost:3000/api/docs

**Base URL:** http://localhost:3000/api/v1

**Authentication:** Bearer Token (JWT)

**Content-Type:** application/json

### Example Request

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Example Response

```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

---

## Database Schema

**Entities:** 16+ core entities
**Relationships:** Fully normalized with foreign keys
**Constraints:** Check constraints, unique constraints, indexes
**Migrations:** Versioned with TypeORM

### Core Tables:
- `users` - User accounts
- `wallets` - Multi-currency wallets
- `transactions` - All financial transactions
- `ledger_entries` - Double-entry ledger
- `cards` - Linked payment cards
- `bank_accounts` - Linked bank accounts
- `payments` - Payment details
- `transfers` - Transfer details
- `refunds` - Refund tracking
- `disputes` - Dispute management
- `kyc_documents` - KYC documents
- `fraud_alerts` - Fraud detection alerts
- `webhooks` - Webhook subscriptions
- `api_keys` - API key management
- `audit_logs` - Audit trail

---

## Testing Strategy

### Test Pyramid

```
        ┌─────────────┐
        │   E2E Tests │  10%
        │   (100 tests)│
        ├─────────────┤
        │ Integration │  30%
        │   (300 tests)│
        ├─────────────┤
        │  Unit Tests │  60%
        │   (600 tests)│
        └─────────────┘
```

### Coverage Target
- **Overall:** 80% minimum
- **Critical Paths:** 95% (payments, transfers, auth)
- **Utilities:** 70%

### Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run specific test
npm test -- user.service.spec.ts

# Watch mode
npm run test:watch
```

---

## Deployment

### Development
```bash
docker-compose up -d
npm run start:dev
```

### Staging
```bash
docker-compose -f docker-compose.staging.yml up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks
- **Liveness:** GET /api/health/liveness
- **Readiness:** GET /api/health/readiness
- **Full Health:** GET /api/health

---

## Monitoring & Logging

### Logs
- **Location:** `logs/` directory
- **Format:** JSON structured logs
- **Levels:** error, warn, info, debug
- **Retention:** 30 days

### Metrics (Future)
- Prometheus metrics
- Grafana dashboards
- Alert manager

---

## Support & Resources

### Documentation
- [Architecture](./architecture/SYSTEM_ARCHITECTURE.md)
- [API Docs](./api/API_DOCUMENTATION.md)
- [Database](./database/DATABASE_DOCUMENTATION.md)
- [Development Guide](./development/DEVELOPMENT_GUIDE.md)

### Code Repository
- GitHub: [Repository URL]
- Issues: [Issues URL]
- Wiki: [Wiki URL]

### Contact
- Developer: [Your Name]
- Email: [Your Email]

---

## License

MIT License - See LICENSE file for details

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Sprint 0 completed
- ✅ Infrastructure setup
- ✅ Documentation structure
- 🔄 Sprint 1 in progress

---

**Last Updated:** January 2025
**Documentation Version:** 1.0.0
**Project Status:** Active Development (Sprint 1)
