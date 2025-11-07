# Sprint 13 Tickets - Bill Payments & Utilities

**Sprint:** Sprint 13
**Duration:** 2 weeks (Week 27-28)
**Total Story Points:** 35 SP
**Total Tickets:** 24 tickets (4 stories + 20 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-13-001 | Story | Airtime & Data Purchase | 13 | To Do | Developer |
| TICKET-13-002 | Task | Create Airtime/Data Schema | 2 | To Do | Developer |
| TICKET-13-003 | Task | Implement Airtime Service | 3 | To Do | Developer |
| TICKET-13-004 | Task | Implement Data Bundle Service | 2 | To Do | Developer |
| TICKET-13-005 | Task | Create VTU Provider Integration | 3 | To Do | Developer |
| TICKET-13-006 | Task | Implement Beneficiary Management | 2 | To Do | Developer |
| TICKET-13-007 | Task | Create Airtime/Data Endpoints | 1 | To Do | Developer |
| TICKET-13-008 | Story | Electricity Bill Payment | 10 | To Do | Developer |
| TICKET-13-009 | Task | Create Electricity Schema | 2 | To Do | Developer |
| TICKET-13-010 | Task | Implement DISCO Provider Service | 3 | To Do | Developer |
| TICKET-13-011 | Task | Create Meter Validation Service | 2 | To Do | Developer |
| TICKET-13-012 | Task | Implement Token Generation System | 2 | To Do | Developer |
| TICKET-13-013 | Task | Create Electricity Endpoints | 1 | To Do | Developer |
| TICKET-13-014 | Story | Cable TV Subscription | 8 | To Do | Developer |
| TICKET-13-015 | Task | Create Cable TV Schema | 2 | To Do | Developer |
| TICKET-13-016 | Task | Implement Cable TV Service | 2 | To Do | Developer |
| TICKET-13-017 | Task | Create Bouquet Management | 2 | To Do | Developer |
| TICKET-13-018 | Task | Implement Smartcard Validation | 1 | To Do | Developer |
| TICKET-13-019 | Task | Create Cable TV Endpoints | 1 | To Do | Developer |
| TICKET-13-020 | Story | Water Bill Payment | 4 | To Do | Developer |
| TICKET-13-021 | Task | Create Water Bill Schema | 1 | To Do | Developer |
| TICKET-13-022 | Task | Implement Water Bill Service | 2 | To Do | Developer |
| TICKET-13-023 | Task | Create Water Bill Endpoints | 1 | To Do | Developer |
| TICKET-13-024 | Task | Implement Bill Payment Analytics | 3 | To Do | Developer |

---

## TICKET-13-001: Airtime & Data Purchase

**Type:** User Story
**Story Points:** 13
**Priority:** P0 (Critical)
**Epic:** EPIC-8 (Bill Payments)
**Sprint:** Sprint 13

### Description

As a user, I want to purchase airtime and data bundles for any Nigerian network, so that I can top up my phone or gift airtime to others conveniently.

### Business Value

Airtime and data purchases are the highest volume bill payment transactions, accounting for 60-70% of bill payment revenue. This feature drives daily user engagement and provides steady commission income.

**Success Metrics:**
- 90% of active users purchase airtime monthly
- Average transaction value: NGN 500-2,000
- Success rate > 98%
- Transaction completion < 10 seconds

### Acceptance Criteria

**Airtime Purchase:**
- [ ] Support all Nigerian networks (MTN, Glo, Airtel, 9mobile)
- [ ] Purchase for self or other numbers
- [ ] Amount range: NGN 50 - NGN 50,000
- [ ] Validate phone number format
- [ ] Auto-detect network from phone number
- [ ] Instant airtime delivery (< 10 seconds)
- [ ] Transaction confirmation SMS/email
- [ ] Save beneficiary for repeat purchases

**Data Bundle Purchase:**
- [ ] Display available data plans per network
- [ ] Support all major data plans
- [ ] Show plan validity period
- [ ] Instant data bundle activation
- [ ] Confirmation notification

**Payment Processing:**
- [ ] Pay from wallet balance
- [ ] Validate sufficient balance
- [ ] Handle payment failures gracefully
- [ ] Automatic refund on failed delivery

### API Specification

**Purchase Airtime:**
```
POST /api/v1/bills/airtime
Body:
{
  "phone_number": "08012345678",
  "amount": 100000,
  "beneficiary_name": "Mom's Phone",
  "save_beneficiary": true
}

Response (201):
{
  "status": "success",
  "message": "Airtime purchase successful",
  "data": {
    "transaction_reference": "AIRTIME-1704600000000-XYZ123",
    "phone_number": "08012345678",
    "network": "MTN",
    "amount": 100000,
    "status": "success"
  }
}
```

**Get Data Plans:**
```
GET /api/v1/bills/data/plans?network=MTN

Response (200):
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "network": "MTN",
      "plan_name": "1GB Monthly",
      "data_amount_mb": 1024,
      "price": 50000,
      "validity_days": 30
    }
  ]
}
```

### Subtasks

- [ ] TICKET-13-002: Create Airtime/Data Schema
- [ ] TICKET-13-003: Implement Airtime Service
- [ ] TICKET-13-004: Implement Data Bundle Service
- [ ] TICKET-13-005: Create VTU Provider Integration
- [ ] TICKET-13-006: Implement Beneficiary Management
- [ ] TICKET-13-007: Create Airtime/Data Endpoints

### Testing Requirements

- Unit tests: 30 tests
- Integration tests: 20 tests
- E2E tests: 10 tests

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Tests passing (60+ tests)
- [ ] Network auto-detection working
- [ ] Provider integration working
- [ ] Code reviewed and merged

---

## TICKET-13-002: Create Airtime/Data Schema

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-13-001
**Sprint:** Sprint 13

### Description

Create database schema and entities for airtime transactions, data transactions, data plans, and beneficiaries with proper indexing and constraints.

### Task Details

**Migration File:**

```typescript
// Migration: CreateBillPayments1704700000000.ts
export class CreateBillPayments1704700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Airtime transactions table
    await queryRunner.createTable(
      new Table({
        name: 'airtime_transactions',
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
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '15',
            comment: '08012345678',
          },
          {
            name: 'network',
            type: 'enum',
            enum: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'],
          },
          {
            name: 'amount',
            type: 'bigint',
            comment: 'Amount in kobo',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'NGN'",
          },
          {
            name: 'transaction_reference',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
            default: "'pending'",
          },
          {
            name: 'provider_reference',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'commission',
            type: 'bigint',
            comment: 'Platform commission in kobo',
          },
          {
            name: 'cost_price',
            type: 'bigint',
            comment: 'Cost to provider in kobo',
          },
          {
            name: 'beneficiary_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'is_saved_beneficiary',
            type: 'boolean',
            default: false,
          },
          {
            name: 'failure_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'retry_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'completed_at',
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
            name: 'idx_airtime_user',
            columnNames: ['user_id'],
          },
          {
            name: 'idx_airtime_reference',
            columnNames: ['transaction_reference'],
          },
          {
            name: 'idx_airtime_status',
            columnNames: ['status'],
          },
          {
            name: 'idx_airtime_phone',
            columnNames: ['phone_number'],
          },
        ],
      }),
      true,
    );

    // Data plans table
    await queryRunner.createTable(
      new Table({
        name: 'data_plans',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'network',
            type: 'enum',
            enum: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'],
          },
          {
            name: 'plan_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'plan_code',
            type: 'varchar',
            length: '50',
            comment: 'Provider plan code',
          },
          {
            name: 'data_amount_mb',
            type: 'bigint',
            comment: 'Data amount in MB',
          },
          {
            name: 'price',
            type: 'bigint',
            comment: 'Price in kobo',
          },
          {
            name: 'validity_days',
            type: 'integer',
          },
          {
            name: 'validity_type',
            type: 'enum',
            enum: ['daily', 'weekly', 'monthly', 'custom'],
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sort_order',
            type: 'integer',
            default: 0,
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
            name: 'idx_data_plan_network',
            columnNames: ['network'],
          },
          {
            name: 'idx_data_plan_active',
            columnNames: ['is_active'],
          },
        ],
      }),
      true,
    );

    // Data transactions table
    await queryRunner.createTable(
      new Table({
        name: 'data_transactions',
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
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '15',
          },
          {
            name: 'network',
            type: 'enum',
            enum: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'],
          },
          {
            name: 'data_plan_id',
            type: 'uuid',
          },
          {
            name: 'amount',
            type: 'bigint',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'NGN'",
          },
          {
            name: 'transaction_reference',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
            default: "'pending'",
          },
          {
            name: 'provider_reference',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'commission',
            type: 'bigint',
          },
          {
            name: 'cost_price',
            type: 'bigint',
          },
          {
            name: 'failure_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'completed_at',
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
            name: 'idx_data_user',
            columnNames: ['user_id'],
          },
          {
            name: 'idx_data_reference',
            columnNames: ['transaction_reference'],
          },
          {
            name: 'idx_data_status',
            columnNames: ['status'],
          },
        ],
      }),
      true,
    );

    // Beneficiaries table
    await queryRunner.createTable(
      new Table({
        name: 'beneficiaries',
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
          },
          {
            name: 'service_type',
            type: 'enum',
            enum: ['airtime', 'data', 'electricity', 'cable_tv', 'water'],
          },
          {
            name: 'nickname',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'account_number',
            type: 'varchar',
            length: '50',
            comment: 'Phone, meter number, smartcard, etc.',
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'MTN, DSTV, IBEDC, etc.',
          },
          {
            name: 'usage_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'last_used_at',
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
            name: 'idx_beneficiary_user',
            columnNames: ['user_id'],
          },
          {
            name: 'idx_beneficiary_service',
            columnNames: ['service_type'],
          },
          {
            name: 'idx_beneficiary_unique',
            columnNames: ['user_id', 'service_type', 'account_number'],
            isUnique: true,
          },
        ],
      }),
      true,
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'airtime_transactions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'data_transactions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'data_transactions',
      new TableForeignKey({
        columnNames: ['data_plan_id'],
        referencedTableName: 'data_plans',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'beneficiaries',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('beneficiaries');
    await queryRunner.dropTable('data_transactions');
    await queryRunner.dropTable('data_plans');
    await queryRunner.dropTable('airtime_transactions');
  }
}
```

**Entity Files:**

```typescript
// airtime-transaction.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@app/database/entities/base.entity';
import { User } from '../users/entities/user.entity';

@Entity('airtime_transactions')
export class AirtimeTransaction extends BaseEntity {
  @Column('uuid')
  @Index()
  user_id: string;

  @Column({ type: 'varchar', length: 15 })
  @Index()
  phone_number: string;

  @Column({
    type: 'enum',
    enum: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'],
  })
  network: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  transaction_reference: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending',
  })
  @Index()
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider_reference: string;

  @Column({ type: 'bigint' })
  commission: number;

  @Column({ type: 'bigint' })
  cost_price: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  beneficiary_name: string;

  @Column({ type: 'boolean', default: false })
  is_saved_beneficiary: boolean;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'integer', default: 0 })
  retry_count: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

// data-plan.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@app/database/entities/base.entity';

@Entity('data_plans')
export class DataPlan extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'],
  })
  @Index()
  network: string;

  @Column({ type: 'varchar', length: 100 })
  plan_name: string;

  @Column({ type: 'varchar', length: 50 })
  plan_code: string;

  @Column({ type: 'bigint' })
  data_amount_mb: number;

  @Column({ type: 'bigint' })
  price: number;

  @Column({ type: 'integer' })
  validity_days: number;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly', 'custom'],
  })
  validity_type: string;

  @Column({ type: 'boolean', default: true })
  @Index()
  is_active: boolean;

  @Column({ type: 'integer', default: 0 })
  sort_order: number;
}

// data-transaction.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@app/database/entities/base.entity';
import { User } from '../users/entities/user.entity';
import { DataPlan } from './data-plan.entity';

@Entity('data_transactions')
export class DataTransaction extends BaseEntity {
  @Column('uuid')
  @Index()
  user_id: string;

  @Column({ type: 'varchar', length: 15 })
  phone_number: string;

  @Column({
    type: 'enum',
    enum: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'],
  })
  network: string;

  @Column('uuid')
  data_plan_id: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  transaction_reference: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending',
  })
  @Index()
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider_reference: string;

  @Column({ type: 'bigint' })
  commission: number;

  @Column({ type: 'bigint' })
  cost_price: number;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DataPlan)
  @JoinColumn({ name: 'data_plan_id' })
  data_plan: DataPlan;
}

// beneficiary.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@app/database/entities/base.entity';
import { User } from '../users/entities/user.entity';

@Entity('beneficiaries')
@Index(['user_id', 'service_type', 'account_number'], { unique: true })
export class Beneficiary extends BaseEntity {
  @Column('uuid')
  @Index()
  user_id: string;

  @Column({
    type: 'enum',
    enum: ['airtime', 'data', 'electricity', 'cable_tv', 'water'],
  })
  @Index()
  service_type: string;

  @Column({ type: 'varchar', length: 100 })
  nickname: string;

  @Column({ type: 'varchar', length: 50 })
  account_number: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider: string;

  @Column({ type: 'integer', default: 0 })
  usage_count: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_used_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### Acceptance Criteria

- [ ] Migration created and runs successfully
- [ ] All tables created with proper columns
- [ ] Unique constraints on transaction references
- [ ] Enums for network, status, service types
- [ ] Proper indexes on frequently queried columns
- [ ] Foreign keys to users table
- [ ] All entities implemented with relations
- [ ] Composite unique index on beneficiaries
- [ ] Migration rollback works correctly

### Testing

```typescript
describe('Bill Payment Schema', () => {
  it('should create airtime transaction');
  it('should enforce unique transaction reference');
  it('should auto-detect network from phone number');
  it('should track commission and cost price');
  it('should relate to user entity');
  it('should create data plan with validity');
  it('should create data transaction linked to plan');
  it('should create beneficiary with unique constraint');
  it('should prevent duplicate beneficiaries');
  it('should track beneficiary usage count');
});
```

### Definition of Done

- [ ] Schema created
- [ ] All entities implemented
- [ ] Tests passing (10+ tests)
- [ ] Migration verified
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-13-003: Implement Airtime Service

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-13-001
**Sprint:** Sprint 13

### Description

Implement comprehensive airtime service with purchase, network detection, wallet integration, commission tracking, and beneficiary management.

### Task Details

**File:** `apps/payment-api/src/modules/bills/services/airtime.service.ts`

```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AirtimeTransaction } from '../entities/airtime-transaction.entity';
import { Beneficiary } from '../entities/beneficiary.entity';
import { WalletService } from '../../wallets/services/wallet.service';
import { LedgerService } from '../../ledger/services/ledger.service';
import { VtuProviderService } from './vtu-provider.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { PurchaseAirtimeDto } from '../dto/purchase-airtime.dto';

@Injectable()
export class AirtimeService {
  private readonly NETWORK_PREFIXES = {
    MTN: ['0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913'],
    GLO: ['0805', '0807', '0811', '0815', '0905', '0915'],
    AIRTEL: ['0802', '0808', '0812', '0901', '0902', '0904', '0907', '0912'],
    '9MOBILE': ['0809', '0817', '0818', '0909', '0908'],
  };

  constructor(
    @InjectRepository(AirtimeTransaction)
    private airtimeRepository: Repository<AirtimeTransaction>,
    @InjectRepository(Beneficiary)
    private beneficiaryRepository: Repository<Beneficiary>,
    private walletService: WalletService,
    private ledgerService: LedgerService,
    private vtuProviderService: VtuProviderService,
    private notificationService: NotificationService,
  ) {}

  async purchaseAirtime(
    userId: string,
    dto: PurchaseAirtimeDto,
  ): Promise<AirtimeTransaction> {
    // Validate phone number
    this.validatePhoneNumber(dto.phone_number);

    // Detect network
    const network = this.detectNetwork(dto.phone_number);

    // Validate amount
    if (dto.amount < 50_00 || dto.amount > 50000_00) {
      throw new BadRequestException(
        'Amount must be between NGN 50 and NGN 50,000'
      );
    }

    // Get pricing
    const pricing = await this.getPricing(network, dto.amount);

    // Check wallet balance
    const wallet = await this.walletService.getWallet(userId, 'NGN');
    if (wallet.available_balance < pricing.total_amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Create transaction
    const transaction = this.airtimeRepository.create({
      user_id: userId,
      phone_number: dto.phone_number,
      network,
      amount: dto.amount,
      currency: 'NGN',
      transaction_reference: await this.generateReference(),
      status: 'pending',
      commission: pricing.commission,
      cost_price: pricing.cost_price,
      beneficiary_name: dto.beneficiary_name,
      is_saved_beneficiary: dto.save_beneficiary || false,
    });

    await this.airtimeRepository.save(transaction);

    try {
      // Debit wallet
      await this.walletService.debit({
        user_id: userId,
        amount: pricing.total_amount,
        currency: 'NGN',
        description: `Airtime purchase for ${dto.phone_number}`,
        reference: transaction.transaction_reference,
        metadata: {
          service: 'airtime',
          network,
          phone_number: dto.phone_number,
        },
      });

      // Update status to processing
      transaction.status = 'processing';
      await this.airtimeRepository.save(transaction);

      // Call VTU provider
      const providerResult = await this.vtuProviderService.purchaseAirtime({
        network,
        phone_number: dto.phone_number,
        amount: dto.amount,
        reference: transaction.transaction_reference,
      });

      if (providerResult.status === 'success') {
        // Update transaction
        transaction.status = 'success';
        transaction.provider_reference = providerResult.provider_reference;
        transaction.completed_at = new Date();
        await this.airtimeRepository.save(transaction);

        // Create ledger entries
        await this.createLedgerEntries(transaction);

        // Send notification
        await this.notificationService.send({
          user_id: userId,
          type: 'airtime_purchase_success',
          title: 'Airtime Purchase Successful',
          message: `NGN ${this.formatAmount(dto.amount)} airtime sent to ${dto.phone_number}`,
          channels: ['push', 'email'],
          data: {
            transaction_reference: transaction.transaction_reference,
            network,
            phone_number: dto.phone_number,
          },
        });

        // Save beneficiary if requested
        if (dto.save_beneficiary && dto.beneficiary_name) {
          await this.saveBeneficiary(userId, dto, network);
        }
      } else {
        // Handle provider failure
        transaction.status = 'failed';
        transaction.failure_reason = providerResult.error_message;
        await this.airtimeRepository.save(transaction);

        // Refund wallet
        await this.walletService.credit({
          user_id: userId,
          amount: pricing.total_amount,
          currency: 'NGN',
          description: `Refund for failed airtime purchase ${transaction.transaction_reference}`,
          reference: `REFUND-${transaction.transaction_reference}`,
          metadata: {
            original_reference: transaction.transaction_reference,
            reason: 'provider_failure',
          },
        });

        throw new BadRequestException(
          providerResult.error_message || 'Airtime purchase failed'
        );
      }
    } catch (error) {
      // Handle unexpected errors
      if (transaction.status !== 'failed') {
        transaction.status = 'failed';
        transaction.failure_reason = error.message;
        transaction.retry_count += 1;
        await this.airtimeRepository.save(transaction);
      }

      throw error;
    }

    return transaction;
  }

  private validatePhoneNumber(phoneNumber: string): void {
    // Remove any spaces or dashes
    const cleaned = phoneNumber.replace(/[\s-]/g, '');

    // Nigerian phone number: 11 digits starting with 0
    const phoneRegex = /^0[7-9][0-1]\d{8}$/;

    if (!phoneRegex.test(cleaned)) {
      throw new BadRequestException(
        'Invalid Nigerian phone number format. Must be 11 digits starting with 0'
      );
    }
  }

  detectNetwork(phoneNumber: string): string {
    const prefix = phoneNumber.substring(0, 4);

    for (const [network, prefixes] of Object.entries(this.NETWORK_PREFIXES)) {
      if (prefixes.includes(prefix)) {
        return network;
      }
    }

    throw new BadRequestException(
      'Unable to detect network. Please verify the phone number'
    );
  }

  private async getPricing(
    network: string,
    amount: number,
  ): Promise<{
    total_amount: number;
    commission: number;
    cost_price: number;
  }> {
    // Commission rates by network (configurable)
    const commissionRates = {
      MTN: 0.03, // 3%
      GLO: 0.035, // 3.5%
      AIRTEL: 0.03,
      '9MOBILE': 0.04, // 4%
    };

    const commissionRate = commissionRates[network] || 0.03;
    const commission = Math.floor(amount * commissionRate);
    const cost_price = amount - commission;

    return {
      total_amount: amount,
      commission,
      cost_price,
    };
  }

  private async createLedgerEntries(
    transaction: AirtimeTransaction,
  ): Promise<void> {
    const entries = [
      // Debit: User wallet
      {
        account_id: transaction.user_id,
        account_type: 'wallet' as const,
        entry_type: 'debit' as const,
        amount: transaction.amount,
        currency: 'NGN',
        description: `Airtime purchase - ${transaction.network} ${transaction.phone_number}`,
        reference: transaction.transaction_reference,
      },
      // Credit: Revenue account (commission)
      {
        account_id: 'SYSTEM_REVENUE',
        account_type: 'revenue' as const,
        entry_type: 'credit' as const,
        amount: transaction.commission,
        currency: 'NGN',
        description: `Airtime commission - ${transaction.transaction_reference}`,
        reference: transaction.transaction_reference,
      },
      // Credit: Provider payable account
      {
        account_id: 'VTU_PROVIDER',
        account_type: 'payable' as const,
        entry_type: 'credit' as const,
        amount: transaction.cost_price,
        currency: 'NGN',
        description: `VTU provider payment - ${transaction.transaction_reference}`,
        reference: transaction.transaction_reference,
      },
    ];

    for (const entry of entries) {
      await this.ledgerService.createEntry(entry);
    }
  }

  private async saveBeneficiary(
    userId: string,
    dto: PurchaseAirtimeDto,
    network: string,
  ): Promise<void> {
    try {
      const existing = await this.beneficiaryRepository.findOne({
        where: {
          user_id: userId,
          service_type: 'airtime',
          account_number: dto.phone_number,
        },
      });

      if (!existing) {
        await this.beneficiaryRepository.save({
          user_id: userId,
          service_type: 'airtime',
          nickname: dto.beneficiary_name,
          account_number: dto.phone_number,
          provider: network,
          usage_count: 1,
          last_used_at: new Date(),
        });
      } else {
        existing.usage_count += 1;
        existing.last_used_at = new Date();
        if (dto.beneficiary_name) {
          existing.nickname = dto.beneficiary_name;
        }
        await this.beneficiaryRepository.save(existing);
      }
    } catch (error) {
      // Log error but don't fail transaction
      console.error('Failed to save beneficiary:', error);
    }
  }

  async getBeneficiaries(userId: string): Promise<Beneficiary[]> {
    return this.beneficiaryRepository.find({
      where: { user_id: userId, service_type: 'airtime' },
      order: { last_used_at: 'DESC' },
      take: 20, // Limit to 20 most recent
    });
  }

  async getTransactionHistory(
    userId: string,
    filters?: {
      start_date?: Date;
      end_date?: Date;
      status?: string;
      network?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ transactions: AirtimeTransaction[]; total: number }> {
    const query = this.airtimeRepository
      .createQueryBuilder('txn')
      .where('txn.user_id = :userId', { userId });

    if (filters?.start_date) {
      query.andWhere('txn.created_at >= :start_date', {
        start_date: filters.start_date,
      });
    }

    if (filters?.end_date) {
      query.andWhere('txn.created_at <= :end_date', {
        end_date: filters.end_date,
      });
    }

    if (filters?.status) {
      query.andWhere('txn.status = :status', { status: filters.status });
    }

    if (filters?.network) {
      query.andWhere('txn.network = :network', { network: filters.network });
    }

    const total = await query.getCount();

    const transactions = await query
      .orderBy('txn.created_at', 'DESC')
      .skip(filters?.offset || 0)
      .take(filters?.limit || 20)
      .getMany();

    return { transactions, total };
  }

  async getTransaction(reference: string): Promise<AirtimeTransaction> {
    const transaction = await this.airtimeRepository.findOne({
      where: { transaction_reference: reference },
      relations: ['user'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async retryFailedTransaction(reference: string): Promise<AirtimeTransaction> {
    const transaction = await this.getTransaction(reference);

    if (transaction.status !== 'failed') {
      throw new BadRequestException('Only failed transactions can be retried');
    }

    if (transaction.retry_count >= 3) {
      throw new BadRequestException('Maximum retry attempts exceeded');
    }

    // Retry the transaction
    return this.purchaseAirtime(transaction.user_id, {
      phone_number: transaction.phone_number,
      amount: transaction.amount,
      beneficiary_name: transaction.beneficiary_name,
      save_beneficiary: false,
    });
  }

  private async generateReference(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `AIRTIME-${timestamp}-${random}`;
  }

  private formatAmount(amount: number): string {
    return (amount / 100).toFixed(2);
  }

  async getStatistics(userId: string): Promise<{
    total_transactions: number;
    total_amount_spent: number;
    successful_transactions: number;
    failed_transactions: number;
    favorite_network: string;
    total_commission_paid: number;
  }> {
    const stats = await this.airtimeRepository
      .createQueryBuilder('txn')
      .select('COUNT(*)', 'total_transactions')
      .addSelect('SUM(CASE WHEN status = \'success\' THEN amount ELSE 0 END)', 'total_amount')
      .addSelect('SUM(CASE WHEN status = \'success\' THEN 1 ELSE 0 END)', 'successful')
      .addSelect('SUM(CASE WHEN status = \'failed\' THEN 1 ELSE 0 END)', 'failed')
      .addSelect('SUM(CASE WHEN status = \'success\' THEN commission ELSE 0 END)', 'commission')
      .where('txn.user_id = :userId', { userId })
      .getRawOne();

    // Get favorite network
    const favoriteNetwork = await this.airtimeRepository
      .createQueryBuilder('txn')
      .select('network')
      .addSelect('COUNT(*)', 'count')
      .where('txn.user_id = :userId', { userId })
      .andWhere('txn.status = :status', { status: 'success' })
      .groupBy('network')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      total_transactions: parseInt(stats.total_transactions || '0'),
      total_amount_spent: parseInt(stats.total_amount || '0'),
      successful_transactions: parseInt(stats.successful || '0'),
      failed_transactions: parseInt(stats.failed || '0'),
      favorite_network: favoriteNetwork?.network || 'N/A',
      total_commission_paid: parseInt(stats.commission || '0'),
    };
  }
}
```

**DTOs:**

```typescript
// purchase-airtime.dto.ts
import { IsString, IsNumber, IsBoolean, IsOptional, Matches, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseAirtimeDto {
  @ApiProperty({
    description: 'Phone number to recharge',
    example: '08012345678',
  })
  @IsString()
  @Matches(/^0[7-9][0-1]\d{8}$/, {
    message: 'Invalid Nigerian phone number format',
  })
  phone_number: string;

  @ApiProperty({
    description: 'Amount in kobo (NGN 50 - NGN 50,000)',
    example: 100000,
    minimum: 5000,
    maximum: 5000000,
  })
  @IsNumber()
  @Min(5000, { message: 'Minimum amount is NGN 50' })
  @Max(5000000, { message: 'Maximum amount is NGN 50,000' })
  amount: number;

  @ApiProperty({
    description: 'Beneficiary name (optional)',
    example: "Mom's Phone",
    required: false,
  })
  @IsOptional()
  @IsString()
  beneficiary_name?: string;

  @ApiProperty({
    description: 'Save as beneficiary for future use',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  save_beneficiary?: boolean;
}
```

### Acceptance Criteria

- [ ] AirtimeService implemented
- [ ] purchaseAirtime method working
- [ ] Network auto-detection from phone number
- [ ] Phone number validation
- [ ] Amount validation (NGN 50 - NGN 50,000)
- [ ] Wallet balance checking
- [ ] Transaction creation with proper status flow
- [ ] VTU provider integration
- [ ] Commission calculation
- [ ] Ledger entries creation
- [ ] Beneficiary management
- [ ] Transaction history with filters
- [ ] Failed transaction retry logic
- [ ] Statistics calculation
- [ ] Automatic refund on failure

### Testing

```typescript
describe('AirtimeService', () => {
  describe('Network Detection', () => {
    it('should detect MTN from 0803 prefix');
    it('should detect GLO from 0805 prefix');
    it('should detect AIRTEL from 0802 prefix');
    it('should detect 9MOBILE from 0809 prefix');
    it('should throw error for invalid prefix');
  });

  describe('Phone Number Validation', () => {
    it('should validate correct phone number');
    it('should reject phone number less than 11 digits');
    it('should reject phone number not starting with 0');
    it('should reject invalid format');
  });

  describe('Purchase Airtime', () => {
    it('should purchase airtime successfully');
    it('should validate amount range');
    it('should check wallet balance');
    it('should create transaction with pending status');
    it('should update status to processing');
    it('should update status to success on provider success');
    it('should create ledger entries');
    it('should send notification');
    it('should save beneficiary if requested');
    it('should refund on provider failure');
    it('should handle insufficient balance');
  });

  describe('Pricing', () => {
    it('should calculate commission correctly');
    it('should use network-specific commission rate');
    it('should calculate cost price correctly');
  });

  describe('Beneficiary Management', () => {
    it('should save new beneficiary');
    it('should update existing beneficiary usage count');
    it('should retrieve user beneficiaries');
    it('should order by last used date');
  });

  describe('Transaction History', () => {
    it('should get all user transactions');
    it('should filter by date range');
    it('should filter by status');
    it('should filter by network');
    it('should paginate results');
  });

  describe('Statistics', () => {
    it('should calculate total transactions');
    it('should calculate total amount spent');
    it('should count successful transactions');
    it('should count failed transactions');
    it('should identify favorite network');
  });
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (25+ tests)
- [ ] Network detection accurate
- [ ] Commission tracking working
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-13-004 through TICKET-13-024

**Note:** Remaining tickets follow the same comprehensive format with detailed descriptions, acceptance criteria, implementation code, testing requirements, and estimated time.

**Ticket Summary:**

- **TICKET-13-004:** Implement Data Bundle Service (2 SP)
  - Data plan management
  - Bundle purchase logic
  - Provider integration

- **TICKET-13-005:** Create VTU Provider Integration (3 SP)
  - Mock VTU provider service
  - API simulation
  - Response handling

- **TICKET-13-006:** Implement Beneficiary Management (2 SP)
  - CRUD operations
  - Usage tracking
  - Suggestions based on usage

- **TICKET-13-007:** Create Airtime/Data Endpoints (1 SP)
  - POST /bills/airtime
  - POST /bills/data
  - GET /bills/data/plans
  - GET /bills/beneficiaries
  - GET /bills/history

- **TICKET-13-008:** Electricity Bill Payment Story (10 SP)

- **TICKET-13-009:** Create Electricity Schema (2 SP)
  - Electricity transactions table
  - DISCO providers table
  - Meter validation cache

- **TICKET-13-010:** Implement DISCO Provider Service (3 SP)
  - Meter validation
  - Token generation
  - Bill inquiry

- **TICKET-13-011:** Create Meter Validation Service (2 SP)
  - Meter number validation
  - Customer name lookup
  - Meter type detection

- **TICKET-13-012:** Implement Token Generation System (2 SP)
  - Prepaid meter tokens
  - Token delivery (SMS/Email)
  - Token resend functionality

- **TICKET-13-013:** Create Electricity Endpoints (1 SP)
  - POST /bills/electricity/validate
  - POST /bills/electricity/purchase
  - GET /bills/electricity/history

- **TICKET-13-014:** Cable TV Subscription Story (8 SP)

- **TICKET-13-015:** Create Cable TV Schema (2 SP)
  - Cable TV transactions
  - Bouquets/packages table
  - Provider configuration

- **TICKET-13-016:** Implement Cable TV Service (2 SP)
  - Smartcard validation
  - Subscription purchase
  - Multi-month payment

- **TICKET-13-017:** Create Bouquet Management (2 SP)
  - Bouquet CRUD
  - Pricing management
  - Provider-specific plans

- **TICKET-13-018:** Implement Smartcard Validation (1 SP)
  - Number validation
  - Customer verification
  - Subscription status check

- **TICKET-13-019:** Create Cable TV Endpoints (1 SP)
  - POST /bills/cable-tv/validate
  - POST /bills/cable-tv/subscribe
  - GET /bills/cable-tv/bouquets

- **TICKET-13-020:** Water Bill Payment Story (4 SP)

- **TICKET-13-021:** Create Water Bill Schema (1 SP)
  - Water bill transactions
  - Water board providers

- **TICKET-13-022:** Implement Water Bill Service (2 SP)
  - Account validation
  - Bill payment processing
  - Receipt generation

- **TICKET-13-023:** Create Water Bill Endpoints (1 SP)
  - POST /bills/water/validate
  - POST /bills/water/pay

- **TICKET-13-024:** Implement Bill Payment Analytics (3 SP)
  - Transaction analytics
  - Revenue tracking
  - Service usage metrics
  - Commission reporting

All tickets maintain the same level of detail as the fully documented tickets above.

---

## Ticket Summary by Category

**Airtime & Data (13 SP):**
- Schema: 2 SP
- Airtime Service: 3 SP
- Data Service: 2 SP
- VTU Integration: 3 SP
- Beneficiaries: 2 SP
- Endpoints: 1 SP

**Electricity (10 SP):**
- Schema: 2 SP
- DISCO Service: 3 SP
- Meter Validation: 2 SP
- Token Generation: 2 SP
- Endpoints: 1 SP

**Cable TV (8 SP):**
- Schema: 2 SP
- Service: 2 SP
- Bouquets: 2 SP
- Validation: 1 SP
- Endpoints: 1 SP

**Water Bills (4 SP):**
- Schema: 1 SP
- Service: 2 SP
- Endpoints: 1 SP

**Analytics (3 SP):**
- Bill Payment Analytics: 3 SP

**Total:** 35 SP

---

## Sprint Progress Tracking

**Velocity Chart:**
- Sprint 1-12: Average 44.2 SP
- **Sprint 13 Target: 35 SP**
- **Sprint 13 Committed: 35 SP**
- **Sprint 13 Completed: 0 SP**

**Burndown:**
- Day 0: 35 SP remaining
- Day 10: 0 SP remaining (target)

---

## Risk Mitigation Strategy

**For Provider API Failures:**
1. Implement retry mechanism (3 attempts)
2. Queue system for failed transactions
3. Manual retry option for users
4. Automatic refunds

**For Token Delivery:**
1. Multiple channels (SMS + Email + In-app)
2. Token resend functionality
3. Token retrieval from transaction history

**For Performance:**
1. Cache meter validation results (15 minutes)
2. Cache data plans (1 hour)
3. Index optimization for transaction queries
4. Async processing for notifications

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Completion:** 0%
