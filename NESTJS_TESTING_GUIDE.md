# NestJS Testing Guide for Sentinel Pay

## Table of Contents
1. [Testing Strategy](#testing-strategy)
2. [Setup & Configuration](#setup--configuration)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Test Organization](#test-organization)
7. [Testing Best Practices](#testing-best-practices)
8. [Coverage & Metrics](#coverage--metrics)
9. [CI/CD Integration](#cicd-integration)

---

## Testing Strategy

### The Testing Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /____\
     /      \
    / Integ. \ Integration Tests (30%)
   /___Tests__\
  /            \
 / Unit Tests   \ Unit Tests (60%)
/______________\
```

### Coverage Targets for Fintech

| Layer | Coverage | Priority | Tools |
|-------|----------|----------|-------|
| **Unit Tests** | 80%+ | Critical | Jest |
| **Integration** | 60%+ | High | Jest + Test Containers |
| **E2E Tests** | 40%+ | Medium | Jest + Supertest |
| **Load Tests** | Key scenarios | Medium | k6 (already have) |

---

## Setup & Configuration

### Install Dependencies

```bash
npm install --save-dev \
  @nestjs/testing \
  jest \
  ts-jest \
  @types/jest \
  supertest \
  @types/supertest \
  testcontainers \
  @testcontainers/postgresql
```

### Jest Configuration

**jest.config.js:**
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testDir: 'test',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts', // Skip module files
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>', '<rootDir>/../test'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  coveragePathIgnorePatterns: [
    'node_modules',
    'dist',
    '.module.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Test Scripts in package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:integration": "jest --config ./test/jest-integration.json --runInBand"
  }
}
```

---

## Unit Testing

### Example 1: Service Testing

**File: src/payments/services/payment.service.ts**
```typescript
import { Injectable } from '@nestjs/common';
import { TransactionRepository } from '../repositories/transaction.repository';
import { WalletRepository } from '../repositories/wallet.repository';
import { PaymentProcessorService } from './payment-processor.service';
import { ProcessPaymentDto } from '../dto/process-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private transactionRepo: TransactionRepository,
    private walletRepo: WalletRepository,
    private paymentProcessor: PaymentProcessorService,
  ) {}

  async processPayment(dto: ProcessPaymentDto) {
    // Check idempotency
    const existing = await this.transactionRepo.findByIdempotencyKey(
      dto.idempotency_key,
    );
    if (existing) {
      return existing;
    }

    // Check wallet balance
    const wallet = await this.walletRepo.findById(dto.wallet_id);
    if (!wallet || wallet.balance < dto.amount) {
      throw new Error('Insufficient funds');
    }

    // Create transaction
    const transaction = {
      id: crypto.randomUUID(),
      wallet_id: dto.wallet_id,
      amount: dto.amount,
      status: 'PROCESSING',
      idempotency_key: dto.idempotency_key,
    };

    await this.transactionRepo.save(transaction);

    // Process payment
    try {
      const result = await this.paymentProcessor.charge(dto);
      transaction.status = 'COMPLETED';
      transaction.processor_reference = result.reference;
    } catch (error) {
      transaction.status = 'FAILED';
      transaction.error = error.message;
      throw error;
    }

    await this.transactionRepo.save(transaction);
    return transaction;
  }
}
```

**Test File: test/unit/payments/payment.service.spec.ts**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../../src/payments/services/payment.service';
import { TransactionRepository } from '../../../src/payments/repositories/transaction.repository';
import { WalletRepository } from '../../../src/payments/repositories/wallet.repository';
import { PaymentProcessorService } from '../../../src/payments/services/payment-processor.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let transactionRepo: jest.Mocked<TransactionRepository>;
  let walletRepo: jest.Mocked<WalletRepository>;
  let paymentProcessor: jest.Mocked<PaymentProcessorService>;

  beforeEach(async () => {
    // Mock all dependencies
    const mockTransactionRepo = {
      findByIdempotencyKey: jest.fn(),
      save: jest.fn(),
    };

    const mockWalletRepo = {
      findById: jest.fn(),
    };

    const mockPaymentProcessor = {
      charge: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: TransactionRepository,
          useValue: mockTransactionRepo,
        },
        {
          provide: WalletRepository,
          useValue: mockWalletRepo,
        },
        {
          provide: PaymentProcessorService,
          useValue: mockPaymentProcessor,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    transactionRepo = module.get(TransactionRepository);
    walletRepo = module.get(WalletRepository);
    paymentProcessor = module.get(PaymentProcessorService);
  });

  describe('processPayment', () => {
    it('should return existing transaction if idempotency key already processed', async () => {
      // Arrange
      const dto = {
        wallet_id: 'wallet_123',
        amount: 1000,
        idempotency_key: 'idempotent_key_123',
      };

      const existingTransaction = {
        id: 'txn_123',
        status: 'COMPLETED',
      };

      transactionRepo.findByIdempotencyKey.mockResolvedValue(
        existingTransaction,
      );

      // Act
      const result = await service.processPayment(dto);

      // Assert
      expect(result).toEqual(existingTransaction);
      expect(paymentProcessor.charge).not.toHaveBeenCalled();
    });

    it('should throw error if wallet has insufficient funds', async () => {
      // Arrange
      const dto = {
        wallet_id: 'wallet_123',
        amount: 10000,
        idempotency_key: 'idempotent_key_456',
      };

      transactionRepo.findByIdempotencyKey.mockResolvedValue(null);
      walletRepo.findById.mockResolvedValue({
        id: 'wallet_123',
        balance: 1000, // Less than required
      });

      // Act & Assert
      await expect(service.processPayment(dto)).rejects.toThrow(
        'Insufficient funds',
      );
    });

    it('should process payment successfully', async () => {
      // Arrange
      const dto = {
        wallet_id: 'wallet_123',
        amount: 1000,
        idempotency_key: 'idempotent_key_789',
      };

      transactionRepo.findByIdempotencyKey.mockResolvedValue(null);
      walletRepo.findById.mockResolvedValue({
        id: 'wallet_123',
        balance: 5000,
      });

      paymentProcessor.charge.mockResolvedValue({
        reference: 'proc_ref_123',
        status: 'SUCCESS',
      });

      // Act
      const result = await service.processPayment(dto);

      // Assert
      expect(result.status).toBe('COMPLETED');
      expect(result.processor_reference).toBe('proc_ref_123');
      expect(transactionRepo.save).toHaveBeenCalledTimes(2); // Save on create, save on complete
      expect(paymentProcessor.charge).toHaveBeenCalledWith(dto);
    });

    it('should mark transaction as failed if processor returns error', async () => {
      // Arrange
      const dto = {
        wallet_id: 'wallet_123',
        amount: 1000,
        idempotency_key: 'idempotent_key_error',
      };

      transactionRepo.findByIdempotencyKey.mockResolvedValue(null);
      walletRepo.findById.mockResolvedValue({
        id: 'wallet_123',
        balance: 5000,
      });

      paymentProcessor.charge.mockRejectedValue(
        new Error('Payment processor error'),
      );

      // Act & Assert
      await expect(service.processPayment(dto)).rejects.toThrow(
        'Payment processor error',
      );

      // Verify transaction marked as failed
      const saveCall = transactionRepo.save.mock.calls[1][0];
      expect(saveCall.status).toBe('FAILED');
      expect(saveCall.error).toBe('Payment processor error');
    });
  });
});
```

### Example 2: Repository Testing

**File: test/unit/payments/transaction.repository.spec.ts**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepository } from '../../../src/payments/repositories/transaction.repository';
import { Transaction } from '../../../src/payments/entities/transaction.entity';

describe('TransactionRepository', () => {
  let repository: TransactionRepository;
  let typeormRepo: jest.Mocked<Repository<Transaction>>;

  beforeEach(async () => {
    const mockTypeormRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepository,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTypeormRepo,
        },
      ],
    }).compile();

    repository = module.get<TransactionRepository>(TransactionRepository);
    typeormRepo = module.get(getRepositoryToken(Transaction));
  });

  describe('findByIdempotencyKey', () => {
    it('should return transaction if found', async () => {
      const transaction = {
        id: 'txn_123',
        idempotency_key: 'key_123',
      };

      typeormRepo.findOne.mockResolvedValue(transaction);

      const result = await repository.findByIdempotencyKey('key_123');

      expect(result).toEqual(transaction);
      expect(typeormRepo.findOne).toHaveBeenCalledWith({
        where: { idempotency_key: 'key_123' },
      });
    });

    it('should return null if transaction not found', async () => {
      typeormRepo.findOne.mockResolvedValue(null);

      const result = await repository.findByIdempotencyKey('nonexistent_key');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save transaction', async () => {
      const transaction = new Transaction();
      transaction.id = 'txn_123';
      transaction.amount = 1000;
      transaction.status = 'COMPLETED';

      typeormRepo.save.mockResolvedValue(transaction);

      const result = await repository.save(transaction);

      expect(result).toEqual(transaction);
      expect(typeormRepo.save).toHaveBeenCalledWith(transaction);
    });
  });
});
```

---

## Integration Testing

### Setup: Test Database with Testcontainers

**File: test/setup.ts**
```typescript
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer } from 'testcontainers';

let postgresContainer;
let redisContainer;

export async function setupTestDatabases() {
  // Start PostgreSQL
  postgresContainer = await new PostgreSqlContainer()
    .withDatabase('sentinel_test')
    .withUsername('test_user')
    .withUserPassword('test_password')
    .start();

  // Start Redis
  redisContainer = await new GenericContainer('redis:7-alpine')
    .withExposedPorts(6379)
    .start();

  const postgresDsn = postgresContainer.getConnectionUri();
  const redisUrl = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;

  process.env.DATABASE_URL = postgresDsn;
  process.env.REDIS_URL = redisUrl;

  return { postgresContainer, redisContainer };
}

export async function teardownTestDatabases() {
  if (postgresContainer) {
    await postgresContainer.stop();
  }
  if (redisContainer) {
    await redisContainer.stop();
  }
}
```

**File: jest-integration.json**
```json
{
  "displayName": "integration",
  "preset": "ts-jest",
  "testEnvironment": "node",
  "testMatch": ["**/test/integration/**/*.spec.ts"],
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.module.ts"
  ],
  "coveragePathIgnorePatterns": [
    "node_modules",
    "dist"
  ],
  "setupFilesAfterEnv": ["<rootDir>/test/setup.ts"],
  "maxWorkers": 1
}
```

### Integration Test Example

**File: test/integration/payments/payment-flow.spec.ts**
```typescript
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsModule } from '../../../src/payments/payments.module';
import { Transaction } from '../../../src/payments/entities/transaction.entity';
import { Wallet } from '../../../src/payments/entities/wallet.entity';
import { setupTestDatabases } from '../../setup';

describe('Payment Flow Integration', () => {
  let app: INestApplication;
  let transactionRepo: Repository<Transaction>;
  let walletRepo: Repository<Wallet>;

  beforeAll(async () => {
    await setupTestDatabases();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: process.env.DATABASE_URL,
          entities: ['src/**/*.entity.ts'],
          synchronize: true,
        }),
        PaymentsModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    transactionRepo = module.get(getRepositoryToken(Transaction));
    walletRepo = module.get(getRepositoryToken(Wallet));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    await transactionRepo.delete({});
    await walletRepo.delete({});
  });

  it('should process payment end-to-end', async () => {
    // Setup: Create wallet with balance
    const wallet = walletRepo.create({
      id: 'wallet_123',
      user_id: 'user_123',
      balance: 5000,
      currency: 'USD',
    });
    await walletRepo.save(wallet);

    // Act: Process payment
    const service = app.get('PaymentService');
    const result = await service.processPayment({
      wallet_id: 'wallet_123',
      amount: 1000,
      idempotency_key: 'idempotent_123',
    });

    // Assert: Verify transaction created
    const transaction = await transactionRepo.findOne({
      where: { id: result.id },
    });

    expect(transaction).toBeDefined();
    expect(transaction.status).toBe('COMPLETED');
    expect(transaction.amount).toBe(1000);

    // Assert: Verify wallet balance not decreased (we're not implementing that in this example)
    const updatedWallet = await walletRepo.findOne({
      where: { id: 'wallet_123' },
    });
    expect(updatedWallet).toBeDefined();
  });

  it('should handle duplicate idempotency keys', async () => {
    const wallet = walletRepo.create({
      id: 'wallet_456',
      user_id: 'user_456',
      balance: 5000,
      currency: 'USD',
    });
    await walletRepo.save(wallet);

    const service = app.get('PaymentService');

    // Process first payment
    const result1 = await service.processPayment({
      wallet_id: 'wallet_456',
      amount: 1000,
      idempotency_key: 'duplicate_key',
    });

    // Process same payment again
    const result2 = await service.processPayment({
      wallet_id: 'wallet_456',
      amount: 1000,
      idempotency_key: 'duplicate_key',
    });

    // Should return same transaction
    expect(result1.id).toBe(result2.id);

    // Should only have 1 transaction in DB
    const count = await transactionRepo.count();
    expect(count).toBe(1);
  });
});
```

---

## E2E Testing

### API Testing with Supertest

**File: test/e2e/payments.e2e.spec.ts**
```typescript
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PaymentsModule } from '../../src/payments/payments.module';
import { AuthModule } from '../../src/auth/auth.module';

describe('Payments API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let walletId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, PaymentsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Register and login user
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);

    authToken = registerRes.body.token;

    // Create wallet
    const walletRes = await request(app.getHttpServer())
      .post('/wallets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currency: 'USD',
        walletType: 'primary',
      })
      .expect(201);

    walletId = walletRes.body.id;
  });

  describe('POST /payments', () => {
    it('should process payment successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Idempotency-Key', 'idempotent_key_123')
        .send({
          wallet_id: walletId,
          amount: 1000,
          currency: 'USD',
          merchant_id: 'merchant_123',
        })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          status: 'COMPLETED',
          amount: 1000,
          currency: 'USD',
        }),
      );
    });

    it('should return 400 for invalid amount', async () => {
      await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          wallet_id: walletId,
          amount: -100, // Invalid
          currency: 'USD',
          merchant_id: 'merchant_123',
        })
        .expect(400);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/payments')
        .send({
          wallet_id: walletId,
          amount: 1000,
          currency: 'USD',
          merchant_id: 'merchant_123',
        })
        .expect(401);
    });

    it('should return 409 for duplicate idempotency key', async () => {
      const idempotencyKey = 'duplicate_idempotent_key';

      // First request
      const response1 = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Idempotency-Key', idempotencyKey)
        .send({
          wallet_id: walletId,
          amount: 1000,
          currency: 'USD',
          merchant_id: 'merchant_123',
        })
        .expect(201);

      // Second request with same idempotency key
      const response2 = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Idempotency-Key', idempotencyKey)
        .send({
          wallet_id: walletId,
          amount: 1000,
          currency: 'USD',
          merchant_id: 'merchant_123',
        });

      // Should return same transaction (409 Conflict or 200 OK depending on implementation)
      expect([200, 409]).toContain(response2.status);
      expect(response2.body.id).toBe(response1.body.id);
    });
  });

  describe('GET /payments/:id', () => {
    it('should retrieve payment by ID', async () => {
      // Create payment first
      const createRes = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          wallet_id: walletId,
          amount: 1000,
          currency: 'USD',
          merchant_id: 'merchant_123',
        })
        .expect(201);

      const paymentId = createRes.body.id;

      // Get payment
      const getRes = await request(app.getHttpServer())
        .get(`/payments/${paymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getRes.body).toEqual(
        expect.objectContaining({
          id: paymentId,
          status: 'COMPLETED',
        }),
      );
    });

    it('should return 404 for non-existent payment', async () => {
      await request(app.getHttpServer())
        .get('/payments/nonexistent_id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

---

## Test Organization

### Directory Structure

```
test/
├── setup.ts                          # Test database setup
├── fixtures/                         # Test data factories
│   ├── transaction.fixture.ts
│   ├── wallet.fixture.ts
│   └── merchant.fixture.ts
├── unit/
│   ├── payments/
│   │   ├── payment.service.spec.ts
│   │   ├── transaction.repository.spec.ts
│   │   └── payment.controller.spec.ts
│   ├── settlement/
│   ├── merchants/
│   └── fraud/
├── integration/
│   ├── payments/
│   │   ├── payment-flow.spec.ts
│   │   └── payment-refund.spec.ts
│   ├── settlement/
│   └── merchant-onboarding/
├── e2e/
│   ├── payments.e2e.spec.ts
│   ├── settlement.e2e.spec.ts
│   ├── merchants.e2e.spec.ts
│   └── auth.e2e.spec.ts
├── jest.config.js
├── jest-integration.json
└── jest-e2e.json
```

### Test Fixtures (Factory Pattern)

**File: test/fixtures/transaction.fixture.ts**
```typescript
import { Transaction } from '../../src/payments/entities/transaction.entity';

export class TransactionFixture {
  static create(overrides?: Partial<Transaction>): Transaction {
    const transaction = new Transaction();
    transaction.id = overrides?.id || `txn_${Date.now()}`;
    transaction.wallet_id = overrides?.wallet_id || 'wallet_123';
    transaction.amount = overrides?.amount || 1000;
    transaction.currency = overrides?.currency || 'USD';
    transaction.status = overrides?.status || 'COMPLETED';
    transaction.idempotency_key = overrides?.idempotency_key || `key_${Date.now()}`;
    transaction.created_at = overrides?.created_at || new Date();
    return transaction;
  }

  static createMany(count: number, overrides?: Partial<Transaction>): Transaction[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({ ...overrides, id: `txn_${Date.now()}_${i}` }),
    );
  }
}
```

---

## Testing Best Practices

### 1. Use Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => {});
it('test payment', () => {});

// ✅ Good
it('should return existing transaction if idempotency key already processed', () => {});
it('should throw InsufficientFundsError when wallet balance is less than payment amount', () => {});
it('should mark transaction as failed if payment processor returns error', () => {});
```

### 2. Follow AAA Pattern

```typescript
it('should process payment successfully', async () => {
  // Arrange - Setup
  const dto = { wallet_id: 'wallet_123', amount: 1000 };
  transactionRepo.findByIdempotencyKey.mockResolvedValue(null);
  walletRepo.findById.mockResolvedValue({ id: 'wallet_123', balance: 5000 });
  paymentProcessor.charge.mockResolvedValue({ reference: 'proc_ref_123' });

  // Act - Execute
  const result = await service.processPayment(dto);

  // Assert - Verify
  expect(result.status).toBe('COMPLETED');
});
```

### 3. Don't Test Implementation Details

```typescript
// ❌ Bad - Testing internal implementation
it('should call transactionRepo.save exactly 2 times', () => {
  expect(transactionRepo.save).toHaveBeenCalledTimes(2);
});

// ✅ Good - Testing behavior
it('should persist transaction after processing', () => {
  expect(result.id).toBeDefined();
  expect(result.status).toBe('COMPLETED');
});
```

### 4. Mock External Dependencies

```typescript
// ✅ Good - Mock payment processor (external)
const mockPaymentProcessor = {
  charge: jest.fn().mockResolvedValue({ reference: 'ref_123' }),
};

// ✅ Good - Don't mock repositories (test with real DB in integration tests)
// Use testcontainers for real database
```

### 5. Test Error Cases

```typescript
describe('error cases', () => {
  it('should throw InvalidAmountError for negative amount', () => {
    expect(() => transaction.setAmount(-100)).toThrow(InvalidAmountError);
  });

  it('should throw InsufficientFundsError when balance < amount', async () => {
    await expect(service.processPayment(largeAmount)).rejects.toThrow(
      InsufficientFundsError,
    );
  });

  it('should handle payment processor timeout gracefully', async () => {
    paymentProcessor.charge.mockRejectedValue(
      new TimeoutError('Processor timeout'),
    );

    await expect(service.processPayment(dto)).rejects.toThrow(TimeoutError);
  });
});
```

---

## Coverage & Metrics

### Run Tests with Coverage

```bash
# Generate coverage report
npm run test:cov

# View coverage report
open coverage/lcov-report/index.html
```

### Coverage Report Example

```
-----------|---------|---------|---------|---------|---------|---------
File       | % Stmts | % Branch| % Funcs | % Lines | Uncovered
-----------|---------|---------|---------|---------|---------|---------
All files  |   82.5  |   78.3  |   85.2  |   82.1  |
  payments |   85.0  |   80.0  |   87.5  |   84.8  |
  settlement|  78.0  |   75.0  |   80.0  |   78.2  |
  merchants|   80.0  |   77.0  |   82.0  |   79.8  |
```

### Critical Paths to Test

**MUST have 95%+ coverage:**
- Payment processing service
- Transaction repository
- Idempotency checking
- Wallet balance validation
- Settlement calculation

**SHOULD have 80%+ coverage:**
- Authentication service
- Fraud detection service
- Merchant onboarding
- Notification service

**CAN have 70%+ coverage:**
- Admin endpoints
- Analytics queries
- Cache layer
- Logging

---

## CI/CD Integration

### GitHub Actions Workflow

**File: .github/workflows/test.yml**
```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: sentinel_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Run integration tests
        run: npm run test:integration

      - name: Run e2e tests
        run: npm run test:e2e

      - name: Generate coverage report
        run: npm run test:cov

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
```

### Pre-commit Hook

**File: .husky/pre-commit**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "Running tests..."
npm test -- --bail --findRelatedTests

if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi

echo "Tests passed! Proceeding with commit."
```

---

## Running Tests

### Common Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- payments.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="processPayment"

# Run with coverage
npm run test:cov

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run in debug mode
npm run test:debug

# Run with verbose output
npm test -- --verbose
```

### Test Execution Gotchas

**Issue: Tests are slow**
```bash
# Run in parallel (default)
npm test

# Run sequentially (for integration/e2e tests)
npm run test:integration -- --runInBand
```

**Issue: Database connection fails**
```bash
# Ensure test database is running
docker-compose -f docker-compose.test.yml up -d

# Check connection
psql -h localhost -U test_user -d sentinel_test
```

**Issue: Port already in use**
```bash
# Kill process using port 5432
lsof -ti:5432 | xargs kill -9
```

---

## Testing Checklist for Sentinel Pay

- [ ] Unit tests for all services (80%+ coverage)
- [ ] Unit tests for repositories (80%+ coverage)
- [ ] Unit tests for DTOs/validators
- [ ] Integration tests for payment flow
- [ ] Integration tests for settlement flow
- [ ] Integration tests for merchant onboarding
- [ ] E2E tests for critical user journeys
- [ ] E2E tests for error scenarios
- [ ] Performance tests for fraud detection (<300ms)
- [ ] Load tests with k6 (1000+ TPS)
- [ ] Security tests for request signing
- [ ] Idempotency tests
- [ ] Database transaction tests
- [ ] Concurrent request tests

---

## Next Steps

1. **Install dependencies** from Setup section
2. **Copy test structure** to your project
3. **Write tests incrementally** (TDD style)
4. **Run tests locally** before committing
5. **Set up CI/CD** pipeline for automated testing
6. **Monitor coverage** and aim for 80%+

