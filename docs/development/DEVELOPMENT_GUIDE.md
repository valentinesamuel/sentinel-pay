# Development Guide - Payment Platform

**Version:** 1.0.0
**Last Updated:** January 2025

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Git Workflow](#git-workflow)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20+ LTS | Runtime environment |
| **npm** | 9+ | Package manager |
| **Docker** | 24+ | Containerization |
| **Docker Compose** | 2.x | Local orchestration |
| **Git** | 2.x | Version control |
| **PostgreSQL** | 15 (via Docker) | Database |
| **Redis** | 7 (via Docker) | Cache & Queue |
| **VS Code** | Latest (recommended) | Code editor |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "firsttris.vscode-jest-runner",
    "ms-azuretools.vscode-docker",
    "ckolkman.vscode-postgres",
    "humao.rest-client",
    "pflannery.vscode-versionlens"
  ]
}
```

---

## Development Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/ubiquitous-tribble.git
cd ubiquitous-tribble
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Environment Variables:**
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

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=1h

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-1234567890ab
```

### 4. Start Infrastructure

```bash
# Start Docker services (PostgreSQL, Redis, MinIO, etc.)
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f postgres
```

### 5. Run Migrations

```bash
# Run database migrations
cd apps/payment-api
npm run migration:run

# Verify tables created
psql -h localhost -U payment_user -d payment_db -c "\dt"
```

### 6. Seed Database (Optional)

```bash
# Run seed script
npm run seed

# This creates:
# - Test users
# - Sample wallets
# - Test transactions
# - Sample data for development
```

### 7. Generate RSA Keys (for JWT)

```bash
# Generate RSA key pair for JWT signing
./scripts/generate-keys.sh

# Keys will be created in:
# - apps/payment-api/certs/private.key
# - apps/payment-api/certs/public.key
```

### 8. Start Development Servers

```bash
# Terminal 1: Payment API
cd apps/payment-api
npm run start:dev

# Terminal 2: Mock Providers (optional)
cd apps/mock-providers
npm run start:dev

# Terminal 3: Reconciliation Service (optional)
cd apps/reconciliation-service
npm run start:dev

# Terminal 4: Notification Service (optional)
cd apps/notification-service
npm run start:dev
```

### 9. Verify Setup

```bash
# Health check
curl http://localhost:3000/api/health

# API documentation
open http://localhost:3000/api/docs

# MailHog (email testing)
open http://localhost:8025

# Redis Commander
open http://localhost:8081

# BullMQ Board
open http://localhost:3400
```

---

## Project Structure

```
ubiquitous-tribble/
├── apps/                           # Applications
│   ├── payment-api/                # Main API
│   │   ├── src/
│   │   │   ├── modules/            # Feature modules
│   │   │   │   ├── auth/           # Authentication
│   │   │   │   ├── users/          # User management
│   │   │   │   ├── wallets/        # Wallet operations
│   │   │   │   └── ...             # 17 modules total
│   │   │   ├── config/             # Configuration
│   │   │   ├── migrations/         # Database migrations
│   │   │   ├── main.ts             # Entry point
│   │   │   └── app.module.ts       # Root module
│   │   ├── test/                   # E2E tests
│   │   └── package.json
│   │
│   ├── mock-providers/             # Mock external APIs
│   ├── reconciliation-service/     # Reconciliation
│   └── notification-service/       # Notifications
│
├── libs/                           # Shared libraries
│   ├── shared/                     # Utilities, constants
│   └── database/                   # Entities, migrations
│
├── docs/                           # Documentation
├── infrastructure/                 # IaC & Docker configs
├── scripts/                        # Utility scripts
└── .github/                        # CI/CD workflows
```

### Module Structure (Example: Wallets)

```
apps/payment-api/src/modules/wallets/
├── wallets.module.ts               # Module definition
├── wallets.controller.ts           # HTTP endpoints
├── wallets.service.ts              # Business logic
├── wallets.repository.ts           # Data access
├── dto/                            # Data Transfer Objects
│   ├── create-wallet.dto.ts
│   └── update-wallet.dto.ts
├── entities/                       # Database entities
│   └── wallet.entity.ts
├── interfaces/                     # TypeScript interfaces
│   └── wallet.interface.ts
├── guards/                         # Route guards
│   └── wallet-owner.guard.ts
├── decorators/                     # Custom decorators
│   └── wallet-id.decorator.ts
└── __tests__/                      # Unit tests
    ├── wallets.controller.spec.ts
    └── wallets.service.spec.ts
```

---

## Coding Standards

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

### Prettier Configuration

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

### Naming Conventions

**Files:**
```
✅ user.entity.ts           (entity)
✅ create-user.dto.ts       (DTO)
✅ users.controller.ts      (controller)
✅ users.service.ts         (service)
✅ users.module.ts          (module)
✅ user-owner.guard.ts      (guard)
✅ users.controller.spec.ts (test)
```

**Classes:**
```typescript
✅ class User extends BaseEntity {}
✅ class UsersController {}
✅ class UsersService {}
✅ class CreateUserDto {}
✅ interface UserInterface {}
✅ enum UserStatus {}
```

**Variables & Functions:**
```typescript
✅ const userId = '123';               // camelCase
✅ const MAX_LOGIN_ATTEMPTS = 5;      // UPPER_SNAKE_CASE for constants
✅ function getUserById(id: string) {} // camelCase
✅ async function createUser() {}     // camelCase
```

**Database:**
```typescript
✅ table: users                   // snake_case
✅ column: first_name             // snake_case
✅ column: created_at             // snake_case
```

---

## Git Workflow

### Branch Strategy

```
main (production)
  └── develop (staging)
      ├── feature/user-authentication
      ├── feature/wallet-operations
      ├── bugfix/transaction-calculation
      └── hotfix/security-patch
```

### Branch Naming

```bash
feature/{ticket-id}-{short-description}
bugfix/{ticket-id}-{short-description}
hotfix/{ticket-id}-{short-description}

Examples:
feature/US-1.1.1-core-entities
bugfix/TASK-1.2.1-encryption-fix
hotfix/SEC-001-sql-injection
```

### Commit Message Format

**Convention:** Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
feat(auth): implement JWT authentication

- Added JWT service
- Created auth guards
- Implemented token refresh

Closes US-1.3.1

---

fix(wallet): correct balance calculation

Fixed bug where pending balance was not subtracted from available balance.

Fixes TASK-1.1.1.3

---

docs(api): add API documentation

Added comprehensive API documentation with examples.

Closes TASK-DOC-001
```

### Workflow

```bash
# 1. Create feature branch
git checkout -b feature/US-1.1.1-core-entities

# 2. Make changes
# ... edit files ...

# 3. Stage changes
git add .

# 4. Commit with message
git commit -m "feat(database): create user and wallet entities

- Implemented User entity with all fields
- Implemented Wallet entity with balances
- Added relationships and indexes

Closes TASK-1.1.1.2, TASK-1.1.1.3"

# 5. Push to remote
git push -u origin feature/US-1.1.1-core-entities

# 6. Create Pull Request
# Use GitHub UI or gh CLI

# 7. After approval, merge to develop
git checkout develop
git merge feature/US-1.1.1-core-entities

# 8. Delete feature branch
git branch -d feature/US-1.1.1-core-entities
```

---

## Testing

### Test Structure

```
Unit Tests:       60% (600 tests)
Integration Tests: 30% (300 tests)
E2E Tests:        10% (100 tests)
```

### Unit Testing

**Example: Service Test**
```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user when email exists', async () => {
      const mockUser = {
        id: 'uuid',
        email: 'test@example.com',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when email does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });
});
```

### Integration Testing

**Example: Controller Integration Test**
```typescript
// wallets.controller.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('WalletsController (Integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/wallets (GET)', () => {
    it('should return user wallets', () => {
      return request(app.getHttpServer())
        .get('/api/v1/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('success');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/wallets')
        .expect(401);
    });
  });

  describe('/api/v1/wallets (POST)', () => {
    it('should create a new wallet', () => {
      return request(app.getHttpServer())
        .post('/api/v1/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currency: 'USD' })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.currency).toBe('USD');
          expect(res.body.data.available_balance).toBe(0);
        });
    });

    it('should validate currency', () => {
      return request(app.getHttpServer())
        .post('/api/v1/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currency: 'INVALID' })
        .expect(400);
    });
  });
});
```

### E2E Testing

```typescript
// payment-flow.e2e-spec.ts
describe('Payment Flow (E2E)', () => {
  it('complete payment flow: login -> fund wallet -> make payment', async () => {
    // 1. Register user
    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'e2e@example.com',
        password: 'Test123!',
        first_name: 'Test',
        last_name: 'User',
      })
      .expect(201);

    const userId = registerRes.body.data.user.id;

    // 2. Login
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'e2e@example.com',
        password: 'Test123!',
      })
      .expect(200);

    const token = loginRes.body.data.access_token;

    // 3. Get wallets (should have NGN wallet by default)
    const walletsRes = await request(app.getHttpServer())
      .get('/api/v1/wallets')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const walletId = walletsRes.body.data[0].id;

    // 4. Make payment
    const paymentRes = await request(app.getHttpServer())
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        wallet_id: walletId,
        amount: 50000,
        currency: 'NGN',
        payment_method: 'card',
        description: 'E2E test payment',
      })
      .expect(201);

    expect(paymentRes.body.data.status).toBe('pending');
  });
});
```

### Running Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:cov

# Run specific test file
npm test -- users.service.spec.ts

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run integration tests
npm run test:integration
```

---

## Debugging

### VS Code Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Payment API",
      "runtimeArgs": ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
      "args": ["${workspaceFolder}/apps/payment-api/src/main.ts"],
      "env": {
        "NODE_ENV": "development"
      },
      "sourceMaps": true,
      "cwd": "${workspaceFolder}/apps/payment-api",
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Jest Tests",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache", "--watchAll=false"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debugging Tips

**1. Add Breakpoints:**
   - Click left of line numbers in VS Code
   - Or add `debugger;` statement

**2. Debug Requests:**
```typescript
// Add logging
console.log('Request body:', req.body);

// Or use Winston logger
this.logger.debug('Processing payment', {
  paymentId: payment.id,
  amount: payment.amount,
});
```

**3. Database Queries:**
```typescript
// Enable query logging
// In typeorm.config.ts
logging: ['query', 'error', 'warn'],
```

**4. Redis Commands:**
```bash
# Connect to Redis
docker exec -it redis redis-cli

# Monitor commands
MONITOR

# Get key
GET session:user-uuid

# List all keys
KEYS *
```

**5. Docker Logs:**
```bash
# View logs
docker-compose logs -f payment-api
docker-compose logs -f postgres

# Follow specific service
docker logs -f payment-api
```

---

## Common Tasks

### Create New Module

```bash
# Generate module with NestJS CLI
cd apps/payment-api
nest generate module modules/feature-name
nest generate controller modules/feature-name
nest generate service modules/feature-name

# Creates:
# - modules/feature-name/feature-name.module.ts
# - modules/feature-name/feature-name.controller.ts
# - modules/feature-name/feature-name.service.ts
```

### Create New Entity

```typescript
// 1. Create entity file
// libs/database/src/entities/feature.entity.ts

import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('features')
export class Feature extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;
}

// 2. Export entity
// libs/database/src/entities/index.ts
export { Feature } from './feature.entity';

// 3. Generate migration
cd apps/payment-api
npm run migration:generate -- src/migrations/CreateFeatureTable

// 4. Run migration
npm run migration:run
```

### Add New Endpoint

```typescript
// 1. Create DTO
// modules/feature/dto/create-feature.dto.ts
export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;
}

// 2. Add service method
// modules/feature/feature.service.ts
async create(dto: CreateFeatureDto): Promise<Feature> {
  const feature = this.repository.create(dto);
  return this.repository.save(feature);
}

// 3. Add controller endpoint
// modules/feature/feature.controller.ts
@Post()
async create(@Body() dto: CreateFeatureDto) {
  return this.service.create(dto);
}

// 4. Add tests
// modules/feature/__tests__/feature.service.spec.ts
describe('create', () => {
  it('should create feature', async () => {
    const dto = { name: 'Test', description: 'Test' };
    const result = await service.create(dto);
    expect(result).toBeDefined();
  });
});
```

### Run Database Seeder

```bash
# Run seeder
npm run seed

# Seeder creates:
# - 10 test users
# - Wallets for each user
# - Sample transactions
# - Test cards
```

---

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run start:dev
```

**2. Database Connection Error**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

**3. Migration Errors**
```bash
# Revert last migration
npm run migration:revert

# Drop schema and re-run
npm run schema:drop
npm run migration:run
```

**4. TypeScript Errors**
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

**5. Test Failures**
```bash
# Clear Jest cache
npm test -- --clearCache

# Run tests in band (sequential)
npm test -- --runInBand
```

---

## Best Practices

### 1. Error Handling

```typescript
// Use custom exceptions
throw new BadRequestException('Invalid amount');
throw new NotFoundException('User not found');
throw new UnauthorizedException('Invalid credentials');

// Catch and log errors
try {
  await this.processPayment(data);
} catch (error) {
  this.logger.error('Payment processing failed', {
    error: error.message,
    stack: error.stack,
    paymentId: data.id,
  });
  throw new InternalServerErrorException('Payment processing failed');
}
```

### 2. Logging

```typescript
// Use structured logging
this.logger.log('User created', {
  userId: user.id,
  email: user.email,
});

this.logger.error('Payment failed', {
  paymentId: payment.id,
  error: error.message,
});

// Log levels
this.logger.error('Critical error');
this.logger.warn('Warning message');
this.logger.log('Info message');
this.logger.debug('Debug info');
```

### 3. Validation

```typescript
// Use class-validator
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain letters and numbers',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;
}
```

### 4. Security

```typescript
// Sanitize inputs
@Transform(({ value }) => value.trim())
email: string;

// Hash passwords
const hashedPassword = await bcrypt.hash(password, 12);

// Encrypt sensitive data
const encrypted = this.encryptionService.encrypt(cardNumber);
```

### 5. Performance

```typescript
// Use transactions
await this.dataSource.transaction(async (manager) => {
  await manager.save(transaction);
  await manager.save(ledgerEntry1);
  await manager.save(ledgerEntry2);
});

// Use pagination
@Query('page') page: number = 1,
@Query('limit') limit: number = 20,

// Cache frequently accessed data
@Cacheable('user', 300) // 5 minutes
async findById(id: string): Promise<User> {
  return this.repository.findOne({ where: { id } });
}
```

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Next Review:** Quarterly
