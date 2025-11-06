# Ubiquitous Tribble - Production-Grade Payment Platform

A comprehensive, production-ready multi-currency payment and wallet platform built to showcase enterprise-level financial system architecture. This project demonstrates advanced software engineering practices, financial system design, and security implementations.

## 🎯 Project Overview

This is a portfolio project that replicates the functionality of platforms like Chipper Cash and OPay, featuring:

- **Multi-currency wallet system** (NGN, USD, GBP, EUR)
- **P2P transfers** (local and international)
- **Bank transfers** (NIP/NIBSS integration simulation)
- **Card payments** (VISA, Mastercard, Verve)
- **Currency exchange** with real-time rates
- **Bill payments** (airtime, utilities, cable TV)
- **Merchant payment gateway**
- **Real-time reconciliation system**
- **Rule-based fraud detection**
- **Refunds & dispute management**

## 🏗️ Architecture

### Microservices Architecture (Hybrid Approach)

```
┌─────────────────────────────────────────────────┐
│  Payment API (Modular Monolith)                 │
│  - Auth, Users, Wallets, Payments, Transfers   │
│  - Cards, FX, Bills, Fraud Detection           │
│  - Ledger, Disputes, Refunds, Webhooks         │
└─────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼────────┐  ┌──▼────────────┐  ┌────────▼────────┐
│ Mock Providers │  │ Reconciliation│  │  Notification   │
│   Service      │  │   Service     │  │    Service      │
└────────────────┘  └───────────────┘  └─────────────────┘
```

### Technology Stack

**Backend:**
- **Framework:** NestJS (TypeScript/Node.js 20+)
- **Database:** PostgreSQL 15 (with read replicas)
- **Cache & Queue:** Redis + BullMQ
- **Storage:** MinIO (S3-compatible)
- **API:** REST + OpenAPI/Swagger

**Security:**
- **Authentication:** JWT (RS256)
- **Encryption:** AES-256-GCM, TLS 1.3
- **Compliance:** PCI DSS patterns, NDPR/GDPR
- **Protection:** Rate limiting, CSRF, session management

**Infrastructure:**
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Monitoring:** Winston logging, health checks

## 📋 Features

### ✅ Implemented Features

- [x] User authentication & authorization (JWT)
- [x] Multi-factor authentication (SMS, Email, TOTP)
- [x] KYC verification (Tier 1, 2, 3)
- [x] Multi-currency wallets
- [x] P2P transfers
- [x] Bank transfers (NIP simulation)
- [x] Card payments (tokenization)
- [x] Currency exchange
- [x] Bill payments
- [x] Double-entry ledger
- [x] Fraud detection (rule-based)
- [x] Transaction reconciliation
- [x] Refunds & disputes
- [x] Webhook system
- [x] Comprehensive audit logging

### 🔒 Security Features

- ✅ CSRF/XSRF protection
- ✅ Session hijacking prevention
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ Rate limiting & DDoS protection
- ✅ Brute force protection
- ✅ Card data tokenization (PCI DSS compliant)
- ✅ Encryption at rest & in transit
- ✅ Account takeover prevention
- ✅ SIM swap protection
- ✅ Race condition handling
- ✅ Idempotency
- ✅ Device fingerprinting
- ✅ Anomaly detection

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ LTS
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/valentinesamuel/ubiquitous-tribble.git
cd ubiquitous-tribble

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start infrastructure services (PostgreSQL, Redis, MinIO)
docker-compose up -d

# Run database migrations
npm run migration:run

# Seed database with test data
npm run seed

# Start all services
npm run start:all
```

### Running Individual Services

```bash
# Payment API (Main application)
npm run start:payment-api

# Mock Providers
npm run start:mock-providers

# Reconciliation Service
npm run start:reconciliation

# Notification Service
npm run start:notification
```

### Access Points

- **Payment API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api-docs
- **Mock Providers:** http://localhost:3001
- **Reconciliation Service:** http://localhost:3003
- **Notification Service:** http://localhost:3004
- **Admin Dashboard:** http://localhost:3002 (if implemented)

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Load testing
npm run test:load
```

## 📚 Documentation

- [Architecture Overview](./docs/architecture/system-design.md)
- [Database Design](./docs/architecture/database-design.md)
- [API Documentation](./docs/api/openapi.yaml)
- [Security Measures](./docs/security/security-overview.md)
- [Development Guide](./docs/guides/development.md)
- [Deployment Guide](./docs/guides/deployment.md)

## 🎨 Design Principles

### 1. Security First
Every feature is built with security in mind. Multiple layers of protection for sensitive operations.

### 2. Financial Accuracy
Double-entry ledger ensures all transactions balance. Immutable audit trail for compliance.

### 3. Scalability
Designed to handle high transaction volumes with horizontal scaling capabilities.

### 4. Resilience
Circuit breakers, retry logic, and graceful degradation for external service failures.

### 5. Observability
Comprehensive logging, monitoring, and alerting for production readiness.

## 🏛️ Key Architectural Patterns

- **Modular Monolith:** Main application organized into cohesive modules
- **Event-Driven:** Asynchronous processing with message queues
- **CQRS:** Separate read/write operations for complex queries
- **Event Sourcing:** Complete transaction history for audit trails
- **SAGA Pattern:** Distributed transactions across services
- **Circuit Breaker:** Fault tolerance for external service calls
- **Repository Pattern:** Data access abstraction
- **Strategy Pattern:** Pluggable payment providers

## 📊 Database Schema

### Core Entities

- **Users & Authentication:** User accounts, sessions, devices
- **KYC:** Document verification, compliance levels
- **Wallets:** Multi-currency balances, holds
- **Transactions:** Payments, transfers, fees
- **Ledger:** Double-entry accounting
- **Cards:** Tokenized payment methods
- **Disputes & Refunds:** Customer service workflows
- **Reconciliation:** Settlement matching

## 🔧 Configuration

### Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://payment_user:payment_pass@localhost:5432/payment_db
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key
TRANSACTION_SECRET=your-transaction-signing-secret

# External Services (Mock)
MOCK_PROVIDER_URL=http://localhost:3001

# File Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Monitoring
LOG_LEVEL=debug
```

## 🚦 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Wallets
- `GET /api/v1/wallets` - Get all user wallets
- `GET /api/v1/wallets/:currency` - Get specific wallet
- `POST /api/v1/wallets` - Create new wallet
- `GET /api/v1/wallets/:currency/transactions` - Transaction history

### Transfers
- `POST /api/v1/transfers/p2p` - P2P transfer
- `POST /api/v1/transfers/bank` - Bank transfer (NIP)
- `POST /api/v1/transfers/bank/name-enquiry` - Verify account
- `POST /api/v1/transfers/international` - International transfer

### Payments
- `POST /api/v1/payments` - Create payment
- `GET /api/v1/payments/:id` - Get payment details
- `POST /api/v1/payments/:id/cancel` - Cancel payment

[See full API documentation](./docs/api/openapi.yaml)

## 🎯 Project Goals

This project was built as a **portfolio showcase** to demonstrate:

1. **Enterprise-level architecture** for financial systems
2. **Security best practices** for payment processing
3. **Complex business logic** implementation
4. **Scalable system design**
5. **Clean code principles**
6. **Comprehensive testing**
7. **Production-ready infrastructure**
8. **Documentation standards**

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome! Please feel free to:

- Open issues for bugs or suggestions
- Submit pull requests for improvements
- Share architectural feedback

## 📄 License

This project is for educational and portfolio purposes.

## 👤 Author

**Valentine Samuel**
- GitHub: [@valentinesamuel](https://github.com/valentinesamuel)
- LinkedIn: [Valentine Samuel](https://linkedin.com/in/valentine-samuel)

## 🙏 Acknowledgments

- Inspired by Chipper Cash, OPay, and other fintech leaders
- Built with NestJS and the amazing TypeScript ecosystem
- Security best practices from OWASP and PCI DSS standards

## 📈 Project Status

**Current Phase:** Active Development (Sprint 0 - Infrastructure Setup)

**Progress:**
- [x] Architecture design
- [x] Security planning
- [x] API design
- [ ] Core implementation (in progress)
- [ ] Testing
- [ ] Documentation
- [ ] Deployment

---

**Note:** This is a portfolio project with mock external services. It is not connected to real payment processors or financial institutions. All transactions are simulated for demonstration purposes.
