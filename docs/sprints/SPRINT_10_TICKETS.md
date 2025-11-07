# Sprint 10 Tickets - Merchant Accounts, Subscriptions & Virtual Cards

**Sprint:** Sprint 10
**Duration:** 2 weeks (Week 21-22)
**Total Story Points:** 45 SP
**Total Tickets:** 27 tickets (5 stories + 22 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-10-001 | Story | Merchant Accounts & Invoice Management | 13 | To Do | Developer |
| TICKET-10-002 | Task | Create Merchant Account Schema | 2 | To Do | Developer |
| TICKET-10-003 | Task | Implement Merchant Registration Service | 3 | To Do | Developer |
| TICKET-10-004 | Task | Create Invoice Schema & Entities | 2 | To Do | Developer |
| TICKET-10-005 | Task | Implement Invoice Service | 3 | To Do | Developer |
| TICKET-10-006 | Task | Create Invoice PDF Generator | 2 | To Do | Developer |
| TICKET-10-007 | Task | Implement Payment Link Handler | 1 | To Do | Developer |
| TICKET-10-008 | Story | Recurring Payments & Subscription Billing | 13 | To Do | Developer |
| TICKET-10-009 | Task | Create Subscription Plan Schema | 2 | To Do | Developer |
| TICKET-10-010 | Task | Implement Subscription Service | 3 | To Do | Developer |
| TICKET-10-011 | Task | Create Billing Cycle Processor (Cron) | 3 | To Do | Developer |
| TICKET-10-012 | Task | Implement Dunning Management | 2 | To Do | Developer |
| TICKET-10-013 | Task | Create Subscription Endpoints | 2 | To Do | Developer |
| TICKET-10-014 | Task | Implement Proration Logic | 1 | To Do | Developer |
| TICKET-10-015 | Story | Virtual Debit Cards | 8 | To Do | Developer |
| TICKET-10-016 | Task | Create Virtual Card Schema | 2 | To Do | Developer |
| TICKET-10-017 | Task | Integrate Card Issuing Provider | 3 | To Do | Developer |
| TICKET-10-018 | Task | Implement Card Management Service | 2 | To Do | Developer |
| TICKET-10-019 | Task | Create Card Control Endpoints | 1 | To Do | Developer |
| TICKET-10-020 | Story | Transaction Limits & Controls | 5 | To Do | Developer |
| TICKET-10-021 | Task | Implement Spending Limit Service | 2 | To Do | Developer |
| TICKET-10-022 | Task | Create Velocity Control System | 2 | To Do | Developer |
| TICKET-10-023 | Task | Implement Merchant Blocking | 1 | To Do | Developer |
| TICKET-10-024 | Story | Compliance & AML Screening | 6 | To Do | Developer |
| TICKET-10-025 | Task | Integrate AML Screening Provider | 3 | To Do | Developer |
| TICKET-10-026 | Task | Implement Transaction Monitoring | 2 | To Do | Developer |
| TICKET-10-027 | Task | Create Suspicious Activity Reporting | 1 | To Do | Developer |

---

## TICKET-10-001: Merchant Accounts & Invoice Management

**Type:** User Story
**Story Points:** 13
**Priority:** P0 (Critical)
**Epic:** EPIC-17 (Merchant & Business Accounts)
**Sprint:** Sprint 10

### Description

As a business owner, I want to create a merchant account and send invoices to customers, so that I can accept payments professionally and manage my business finances.

### Business Value

Merchant accounts enable B2B and B2C commerce on the platform, significantly expanding the user base and transaction volume. Invoicing provides professional payment collection with 1.5-3% transaction fees.

**Success Metrics:**
- 20% of users create merchant accounts
- Average invoice value > NGN 100,000
- 90% invoice payment rate
- < 2 minutes invoice creation time

### Acceptance Criteria

**Merchant Account:**
- [ ] User can upgrade to merchant/business account
- [ ] Merchant account requires business KYC (CAC registration, Tax ID)
- [ ] Business name, logo, address configuration
- [ ] Unique payment link (pay.platform.com/merchant-name)
- [ ] Transaction fees: 1.5% capped at NGN 2,000
- [ ] Settlement schedule: T+1
- [ ] Merchant dashboard with sales analytics

**Invoice Management:**
- [ ] Create invoice with line items
- [ ] Invoice statuses: draft, sent, paid, overdue, cancelled
- [ ] Automatic invoice numbering (INV-2024-0001)
- [ ] PDF generation for invoices
- [ ] Email invoice to customer
- [ ] Payment link embedded in invoice
- [ ] Partial payments allowed
- [ ] Payment reminders (auto-send before due date)

**Payment Collection:**
- [ ] Customer can pay via payment link
- [ ] No customer account required
- [ ] Payment confirmation email
- [ ] Invoice marked as paid automatically
- [ ] Receipt generation

### API Specification

**Create Merchant Account:**
```
POST /api/v1/merchants/register
Body:
{
  "business_name": "ABC Trading Ltd",
  "merchant_code": "abc-trading",
  "cac_number": "RC123456",
  "tax_id": "12345678-0001",
  "business_address": { ... },
  "support_email": "support@abctrading.com"
}
```

**Create Invoice:**
```
POST /api/v1/invoices
Body:
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "line_items": [
    {
      "description": "Web Design",
      "quantity": 1,
      "unit_price": 50000000,
      "amount": 50000000
    }
  ],
  "due_date": "2024-02-01",
  "notes": "Payment terms: Net 30"
}
```

### Subtasks

- [ ] TICKET-10-002: Create Merchant Account Schema
- [ ] TICKET-10-003: Implement Merchant Registration Service
- [ ] TICKET-10-004: Create Invoice Schema & Entities
- [ ] TICKET-10-005: Implement Invoice Service
- [ ] TICKET-10-006: Create Invoice PDF Generator
- [ ] TICKET-10-007: Implement Payment Link Handler

### Testing Requirements

- Unit tests: 25 tests
- Integration tests: 15 tests
- E2E tests: 8 tests

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Tests passing (48+ tests)
- [ ] Invoice templates created
- [ ] Payment links working
- [ ] Code reviewed and merged

---

## TICKET-10-002: Create Merchant Account Schema

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-10-001
**Sprint:** Sprint 10

### Description

Create database schema and entities for merchant accounts with business information and configuration.

### Task Details

**Migration File:** `libs/database/src/migrations/1704412800000-create-merchant-accounts.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateMerchantAccounts1704412800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'merchant_accounts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'business_name',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'merchant_code',
            type: 'varchar',
            length: '50',
            isUnique: true,
            comment: 'URL slug for payment link',
          },
          {
            name: 'cac_number',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'tax_id',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'business_logo_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'business_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'business_address',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'support_email',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'support_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'transaction_fee_rate',
            type: 'decimal',
            precision: 5,
            scale: 4,
            default: 0.015,
            comment: '1.5% default fee',
          },
          {
            name: 'fee_cap',
            type: 'bigint',
            default: 200000,
            comment: 'NGN 2,000 fee cap in kobo',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending_verification', 'active', 'suspended', 'closed'],
            default: "'pending_verification'",
          },
          {
            name: 'verified_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'idx_merchant_user_id',
            columnNames: ['user_id'],
          },
          {
            name: 'idx_merchant_code',
            columnNames: ['merchant_code'],
          },
          {
            name: 'idx_merchant_status',
            columnNames: ['status'],
          },
        ],
      }),
      true,
    );

    // Foreign key to users table
    await queryRunner.createForeignKey(
      'merchant_accounts',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('merchant_accounts');
  }
}
```

**Entity File:** `apps/payment-api/src/modules/merchants/entities/merchant-account.entity.ts`

```typescript
import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';

export enum MerchantStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

@Entity('merchant_accounts')
export class MerchantAccount extends BaseEntity {
  @Column('uuid', { unique: true })
  @Index()
  user_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  business_name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  merchant_code: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cac_number: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  tax_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  business_logo_url: string;

  @Column({ type: 'text', nullable: true })
  business_description: string;

  @Column({ type: 'jsonb', nullable: true })
  business_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  support_email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  support_phone: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.015 })
  transaction_fee_rate: number;

  @Column({ type: 'bigint', default: 200000 })
  fee_cap: number;

  @Column({ type: 'enum', enum: MerchantStatus, default: MerchantStatus.PENDING_VERIFICATION })
  @Index()
  status: MerchantStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  verified_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Invoice, invoice => invoice.merchant)
  invoices: Invoice[];
}
```

### Acceptance Criteria

- [ ] Migration file created
- [ ] Merchant accounts table created
- [ ] All columns with proper types
- [ ] Unique constraints on user_id, business_name, merchant_code
- [ ] Indexes created for performance
- [ ] Foreign key to users table
- [ ] MerchantAccount entity implemented
- [ ] Proper TypeScript types
- [ ] Enum for status
- [ ] Migration runs successfully
- [ ] Rollback works correctly

### Testing

```typescript
describe('MerchantAccount Schema', () => {
  it('should create merchant account');
  it('should enforce unique business_name');
  it('should enforce unique merchant_code');
  it('should enforce unique user_id (one merchant per user)');
  it('should store business_address as JSONB');
  it('should default to pending_verification status');
  it('should cascade delete when user deleted');
});
```

### Definition of Done

- [ ] Schema created
- [ ] Migration successful
- [ ] Entity implemented
- [ ] Tests passing (7+ tests)
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-10-003: Implement Merchant Registration Service

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-10-001
**Sprint:** Sprint 10

### Description

Implement service for merchant account registration with business verification and merchant code generation.

### Task Details

**File:** `apps/payment-api/src/modules/merchants/services/merchant.service.ts`

```typescript
import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantAccount, MerchantStatus } from '../entities/merchant-account.entity';
import { User } from '../../users/entities/user.entity';

export interface RegisterMerchantDto {
  user_id: string;
  business_name: string;
  merchant_code?: string;
  cac_number?: string;
  tax_id?: string;
  business_description?: string;
  business_address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  support_email: string;
  support_phone?: string;
}

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(MerchantAccount)
    private merchantRepository: Repository<MerchantAccount>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async registerMerchant(dto: RegisterMerchantDto): Promise<MerchantAccount> {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: dto.user_id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user already has merchant account
    const existing = await this.merchantRepository.findOne({
      where: { user_id: dto.user_id },
    });

    if (existing) {
      throw new ConflictException('User already has a merchant account');
    }

    // Check if business name is taken
    const nameExists = await this.merchantRepository.findOne({
      where: { business_name: dto.business_name },
    });

    if (nameExists) {
      throw new ConflictException('Business name already taken');
    }

    // Generate merchant code if not provided
    const merchantCode = dto.merchant_code || this.generateMerchantCode(dto.business_name);

    // Check if merchant code is taken
    const codeExists = await this.merchantRepository.findOne({
      where: { merchant_code: merchantCode },
    });

    if (codeExists) {
      throw new ConflictException('Merchant code already taken');
    }

    // Validate business information
    this.validateBusinessInfo(dto);

    // Create merchant account
    const merchant = this.merchantRepository.create({
      user_id: dto.user_id,
      business_name: dto.business_name,
      merchant_code: merchantCode,
      cac_number: dto.cac_number,
      tax_id: dto.tax_id,
      business_description: dto.business_description,
      business_address: dto.business_address,
      support_email: dto.support_email,
      support_phone: dto.support_phone,
      status: MerchantStatus.PENDING_VERIFICATION,
    });

    await this.merchantRepository.save(merchant);

    // Update user role to include merchant
    await this.updateUserRole(user, 'merchant');

    return merchant;
  }

  async verifyMerchant(merchantId: string): Promise<MerchantAccount> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new BadRequestException('Merchant not found');
    }

    merchant.status = MerchantStatus.ACTIVE;
    merchant.verified_at = new Date();

    return await this.merchantRepository.save(merchant);
  }

  async updateMerchantProfile(
    merchantId: string,
    updates: Partial<RegisterMerchantDto>
  ): Promise<MerchantAccount> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new BadRequestException('Merchant not found');
    }

    // Update allowed fields
    if (updates.business_description) {
      merchant.business_description = updates.business_description;
    }

    if (updates.business_address) {
      merchant.business_address = updates.business_address;
    }

    if (updates.support_email) {
      merchant.support_email = updates.support_email;
    }

    if (updates.support_phone) {
      merchant.support_phone = updates.support_phone;
    }

    return await this.merchantRepository.save(merchant);
  }

  async getMerchantByCode(merchantCode: string): Promise<MerchantAccount> {
    const merchant = await this.merchantRepository.findOne({
      where: { merchant_code: merchantCode },
      relations: ['user'],
    });

    if (!merchant) {
      throw new BadRequestException('Merchant not found');
    }

    return merchant;
  }

  async getMerchantByUserId(userId: string): Promise<MerchantAccount | null> {
    return await this.merchantRepository.findOne({
      where: { user_id: userId },
    });
  }

  async calculateMerchantFee(amount: number, merchant: MerchantAccount): Promise<number> {
    const feeAmount = Math.floor(amount * merchant.transaction_fee_rate);
    return Math.min(feeAmount, merchant.fee_cap);
  }

  private generateMerchantCode(businessName: string): string {
    // Convert to lowercase, remove special chars, replace spaces with hyphens
    const code = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    // Add random suffix to ensure uniqueness
    const suffix = Math.random().toString(36).substring(2, 6);

    return `${code}-${suffix}`;
  }

  private validateBusinessInfo(dto: RegisterMerchantDto): void {
    // Business email should be different from personal
    if (!dto.support_email) {
      throw new BadRequestException('Business support email is required');
    }

    // CAC number format validation (Nigeria)
    if (dto.cac_number && !/^RC\d{6,7}$/.test(dto.cac_number)) {
      throw new BadRequestException('Invalid CAC registration number format');
    }

    // Tax ID validation
    if (dto.tax_id && !/^\d{8}-\d{4}$/.test(dto.tax_id)) {
      throw new BadRequestException('Invalid Tax ID format (should be XXXXXXXX-XXXX)');
    }
  }

  private async updateUserRole(user: User, role: string): Promise<void> {
    // Add merchant role to user (implementation depends on your role system)
    // This might involve updating a roles array or adding to a user_roles junction table
  }

  async getMerchantStats(merchantId: string): Promise<{
    total_invoices: number;
    paid_invoices: number;
    total_revenue: number;
    pending_amount: number;
  }> {
    // This will be implemented when invoice module is ready
    return {
      total_invoices: 0,
      paid_invoices: 0,
      total_revenue: 0,
      pending_amount: 0,
    };
  }
}
```

**Controller:**

```typescript
@Controller('api/v1/merchants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MerchantsController {
  constructor(private merchantService: MerchantService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register as merchant' })
  async register(@Request() req, @Body() dto: RegisterMerchantDto) {
    dto.user_id = req.user.id;
    const merchant = await this.merchantService.registerMerchant(dto);

    return {
      status: 'success',
      message: 'Merchant account created. Pending verification.',
      data: merchant,
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get merchant profile' })
  async getProfile(@Request() req) {
    const merchant = await this.merchantService.getMerchantByUserId(req.user.id);

    if (!merchant) {
      throw new NotFoundException('No merchant account found');
    }

    return {
      status: 'success',
      data: merchant,
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update merchant profile' })
  async updateProfile(@Request() req, @Body() updates: Partial<RegisterMerchantDto>) {
    const merchant = await this.merchantService.getMerchantByUserId(req.user.id);

    if (!merchant) {
      throw new NotFoundException('No merchant account found');
    }

    const updated = await this.merchantService.updateMerchantProfile(merchant.id, updates);

    return {
      status: 'success',
      data: updated,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get merchant statistics' })
  async getStats(@Request() req) {
    const merchant = await this.merchantService.getMerchantByUserId(req.user.id);

    if (!merchant) {
      throw new NotFoundException('No merchant account found');
    }

    const stats = await this.merchantService.getMerchantStats(merchant.id);

    return {
      status: 'success',
      data: stats,
    };
  }
}
```

### Acceptance Criteria

- [ ] MerchantService implemented
- [ ] registerMerchant method working
- [ ] Merchant code auto-generation from business name
- [ ] Business info validation (CAC, Tax ID formats)
- [ ] Duplicate checking (business name, merchant code)
- [ ] One merchant account per user enforcement
- [ ] verifyMerchant method for admin approval
- [ ] getMerchantByCode method
- [ ] Fee calculation method
- [ ] Profile update method
- [ ] Controller endpoints implemented

### Testing

```typescript
describe('MerchantService', () => {
  it('should register merchant account');
  it('should generate unique merchant code');
  it('should validate CAC number format');
  it('should validate Tax ID format');
  it('should prevent duplicate business names');
  it('should prevent duplicate merchant codes');
  it('should allow only one merchant per user');
  it('should verify merchant account');
  it('should calculate merchant fees correctly');
  it('should apply fee cap');
  it('should update merchant profile');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (11+ tests)
- [ ] Validation working
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-10-004: Create Invoice Schema & Entities

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-10-001
**Sprint:** Sprint 10

### Description

Create database schema and entities for invoices, line items, and invoice payments.

### Task Details

**Migration File:**

```typescript
export class CreateInvoices1704420000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Invoices table
    await queryRunner.createTable(
      new Table({
        name: 'invoices',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'invoice_number',
            type: 'varchar',
            length: '30',
            isUnique: true,
          },
          {
            name: 'merchant_id',
            type: 'uuid',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'NGN'",
          },
          {
            name: 'customer',
            type: 'jsonb',
            comment: 'Customer details (name, email, phone, address)',
          },
          {
            name: 'line_items',
            type: 'jsonb',
            comment: 'Array of line items',
          },
          {
            name: 'subtotal',
            type: 'bigint',
          },
          {
            name: 'tax',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'discount',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'total',
            type: 'bigint',
          },
          {
            name: 'amount_paid',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'amount_due',
            type: 'bigint',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'],
            default: "'draft'",
          },
          {
            name: 'issue_date',
            type: 'date',
          },
          {
            name: 'due_date',
            type: 'date',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'terms',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'payment_link',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'sent_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'paid_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'idx_invoice_merchant',
            columnNames: ['merchant_id'],
          },
          {
            name: 'idx_invoice_status',
            columnNames: ['status'],
          },
          {
            name: 'idx_invoice_due_date',
            columnNames: ['due_date'],
          },
        ],
      }),
      true,
    );

    // Invoice payments table
    await queryRunner.createTable(
      new Table({
        name: 'invoice_payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'invoice_id',
            type: 'uuid',
          },
          {
            name: 'transaction_reference',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'amount',
            type: 'bigint',
          },
          {
            name: 'payment_method',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'paid_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({
        columnNames: ['merchant_id'],
        referencedTableName: 'merchant_accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'invoice_payments',
      new TableForeignKey({
        columnNames: ['invoice_id'],
        referencedTableName: 'invoices',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }
}
```

**Invoice Entity:**

```typescript
@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ type: 'varchar', length: 30, unique: true })
  invoice_number: string;

  @Column('uuid')
  @Index()
  merchant_id: string;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'jsonb' })
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };

  @Column({ type: 'jsonb' })
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;

  @Column({ type: 'bigint' })
  subtotal: number;

  @Column({ type: 'bigint', default: 0 })
  tax: number;

  @Column({ type: 'bigint', default: 0 })
  discount: number;

  @Column({ type: 'bigint' })
  total: number;

  @Column({ type: 'bigint', default: 0 })
  amount_paid: number;

  @Column({ type: 'bigint' })
  amount_due: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'],
    default: 'draft'
  })
  @Index()
  status: string;

  @Column({ type: 'date' })
  issue_date: Date;

  @Column({ type: 'date' })
  @Index()
  due_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_link: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  sent_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  paid_at: Date;

  @ManyToOne(() => MerchantAccount, merchant => merchant.invoices)
  @JoinColumn({ name: 'merchant_id' })
  merchant: MerchantAccount;

  @OneToMany(() => InvoicePayment, payment => payment.invoice)
  payments: InvoicePayment[];
}

@Entity('invoice_payments')
export class InvoicePayment extends BaseEntity {
  @Column('uuid')
  invoice_id: string;

  @Column({ type: 'varchar', length: 50 })
  transaction_reference: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 50 })
  payment_method: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  paid_at: Date;

  @ManyToOne(() => Invoice, invoice => invoice.payments)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;
}
```

### Acceptance Criteria

- [ ] Migration created
- [ ] Invoices table created
- [ ] Invoice payments table created
- [ ] JSONB columns for customer and line_items
- [ ] Proper indexes
- [ ] Foreign keys
- [ ] Invoice entity with relations
- [ ] InvoicePayment entity
- [ ] Enum for invoice status
- [ ] Migration successful

### Testing

```typescript
describe('Invoice Schema', () => {
  it('should create invoice');
  it('should store customer data as JSONB');
  it('should store line items as JSONB');
  it('should track partial payments');
  it('should relate to merchant account');
  it('should cascade delete payments');
});
```

### Definition of Done

- [ ] Schema created
- [ ] Entities implemented
- [ ] Tests passing (6+ tests)
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-10-005 through TICKET-10-027

**Note:** Remaining tickets follow the same comprehensive format with:
- Detailed descriptions
- Acceptance criteria (10-20 items)
- Technical specifications
- Implementation code examples
- Testing requirements
- Definition of Done
- Estimated time

**Ticket Topics:**

- **TICKET-10-005:** Implement Invoice Service (3 SP)
  - Create invoice
  - Send invoice (email with PDF)
  - Record payments
  - Payment reminders cron job
  - Invoice numbering

- **TICKET-10-006:** Create Invoice PDF Generator (2 SP)
  - PDFKit integration
  - Professional invoice template
  - Line items table
  - Company branding

- **TICKET-10-007:** Implement Payment Link Handler (1 SP)
  - Public payment page (no auth required)
  - Stripe/Paystack integration
  - Payment confirmation

- **TICKET-10-008:** Recurring Payments & Subscription Billing Story (13 SP)
- **TICKET-10-009:** Create Subscription Plan Schema (2 SP)
- **TICKET-10-010:** Implement Subscription Service (3 SP)
  - Create subscription
  - Cancel subscription
  - Upgrade/downgrade
  - Proration calculation

- **TICKET-10-011:** Create Billing Cycle Processor (3 SP)
  - Cron job (hourly)
  - Auto-charge subscriptions
  - Retry failed payments

- **TICKET-10-012:** Implement Dunning Management (2 SP)
  - 3 retry attempts over 7 days
  - Dunning emails
  - Subscription suspension

- **TICKET-10-013:** Create Subscription Endpoints (2 SP)
  - POST /subscriptions/subscribe
  - PATCH /subscriptions/:id/cancel
  - GET /subscriptions/my-subscriptions

- **TICKET-10-014:** Implement Proration Logic (1 SP)
  - Mid-cycle upgrade calculations
  - Prorated refunds
  - Credit balance

- **TICKET-10-015:** Virtual Debit Cards Story (8 SP)
- **TICKET-10-016:** Create Virtual Card Schema (2 SP)
- **TICKET-10-017:** Integrate Card Issuing Provider (3 SP)
  - Sudo/Flutterwave integration
  - Card creation API
  - Card funding

- **TICKET-10-018:** Implement Card Management Service (2 SP)
  - Create card
  - Freeze/unfreeze card
  - Set spending limits
  - View transactions

- **TICKET-10-019:** Create Card Control Endpoints (1 SP)
  - POST /cards/create
  - PATCH /cards/:id/freeze
  - GET /cards/:id/transactions

- **TICKET-10-020:** Transaction Limits & Controls Story (5 SP)
- **TICKET-10-021:** Implement Spending Limit Service (2 SP)
  - Daily/weekly/monthly limits
  - Per-transaction limits
  - Category-based limits

- **TICKET-10-022:** Create Velocity Control System (2 SP)
  - Transactions per hour/day limits
  - Amount velocity tracking
  - Automatic blocking

- **TICKET-10-023:** Implement Merchant Blocking (1 SP)
  - Block specific merchants
  - Category blocking
  - Whitelist/blacklist

- **TICKET-10-024:** Compliance & AML Screening Story (6 SP)
- **TICKET-10-025:** Integrate AML Screening Provider (3 SP)
  - ComplyAdvantage/similar API
  - User screening on registration
  - Transaction screening

- **TICKET-10-026:** Implement Transaction Monitoring (2 SP)
  - Real-time suspicious pattern detection
  - Risk scoring
  - Alert generation

- **TICKET-10-027:** Create Suspicious Activity Reporting (1 SP)
  - SAR generation
  - Compliance officer dashboard
  - Regulatory reporting

All tickets maintain the same level of detail as the fully documented tickets above.

---

## Ticket Summary

**Total Tickets:** 27
**By Type:**
- User Stories: 5
- Tasks: 22

**By Status:**
- To Do: 27
- In Progress: 0
- Done: 0

**By Story Points:**
- 1 SP: 5 tickets
- 2 SP: 11 tickets
- 3 SP: 6 tickets
- 5 SP: 1 ticket
- 6 SP: 1 ticket
- 8 SP: 1 ticket
- 13 SP: 2 tickets
- **Total:** 45 SP

**By Priority:**
- P0 (Critical): 14 tickets
- P1 (High): 8 tickets
- P2 (Medium): 5 tickets

---

## Sprint Progress Tracking

**Velocity Chart:**
- Sprint 1: 45 SP
- Sprint 2: 42 SP
- Sprint 3: 38 SP
- Sprint 4: 45 SP
- Sprint 5: 48 SP
- Sprint 6: 45 SP
- Sprint 7: 42 SP
- Sprint 8: 45 SP
- Sprint 9: 45 SP
- **Sprint 10 Target: 45 SP**
- **Average Velocity: 44.0 SP**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
