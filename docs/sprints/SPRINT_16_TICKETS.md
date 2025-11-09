# Sprint 16 Tickets - Refunds & Disputes Part 2

**Sprint:** Sprint 16
**Duration:** 2 weeks (Week 33-34)
**Total Story Points:** 42 SP
**Total Tickets:** 22 tickets (3 stories + 19 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-16-001 | Story | Transaction Dispute Creation | 15 | To Do | Developer |
| TICKET-16-002 | Task | Create Dispute Schema | 2 | To Do | Developer |
| TICKET-16-003 | Task | Implement Dispute Service | 3 | To Do | Developer |
| TICKET-16-004 | Task | Create Evidence Upload System | 2 | To Do | Developer |
| TICKET-16-005 | Task | Implement Dispute Validation | 2 | To Do | Developer |
| TICKET-16-006 | Task | Create Dispute Endpoints | 2 | To Do | Developer |
| TICKET-16-007 | Task | Implement Dispute Notifications | 2 | To Do | Developer |
| TICKET-16-008 | Task | Create Dispute Timeline Tracking | 2 | To Do | Developer |
| TICKET-16-009 | Story | Dispute Investigation & Resolution | 15 | To Do | Developer |
| TICKET-16-010 | Task | Create Investigation Workflow | 3 | To Do | Developer |
| TICKET-16-011 | Task | Implement Assignment System | 2 | To Do | Developer |
| TICKET-16-012 | Task | Create Merchant Response System | 3 | To Do | Developer |
| TICKET-16-013 | Task | Implement Resolution Engine | 3 | To Do | Developer |
| TICKET-16-014 | Task | Create Mediation System | 2 | To Do | Developer |
| TICKET-16-015 | Task | Implement Internal Notes | 1 | To Do | Developer |
| TICKET-16-016 | Task | Create Admin Dashboard | 1 | To Do | Developer |
| TICKET-16-017 | Story | Chargeback Management | 12 | To Do | Developer |
| TICKET-16-018 | Task | Create Chargeback Schema | 2 | To Do | Developer |
| TICKET-16-019 | Task | Implement Provider Integration | 3 | To Do | Developer |
| TICKET-16-020 | Task | Create Chargeback Workflow | 3 | To Do | Developer |
| TICKET-16-021 | Task | Implement Evidence Collection | 2 | To Do | Developer |
| TICKET-16-022 | Task | Create Chargeback Analytics | 2 | To Do | Developer |

---

## TICKET-16-001: Transaction Dispute Creation

**Type:** User Story
**Story Points:** 15
**Priority:** P0 (Critical)
**Epic:** EPIC-10 (Refunds & Disputes)
**Sprint:** Sprint 16

### Description

As a user, I want to raise a dispute for a transaction I'm not satisfied with, so that I can seek resolution when refunds are rejected or there are issues with goods/services received.

### Business Value

Dispute management is critical for user trust and regulatory compliance in fintech platforms. Effective dispute resolution:
- Reduces chargeback rates by 30-40% (industry benchmark)
- Improves customer retention (disputed users 2x more likely to stay if resolved fairly)
- Protects merchant relationships
- Ensures compliance with payment network rules (Visa, Mastercard require dispute mechanisms)
- Minimizes financial losses from fraud

**Success Metrics:**
- 80%+ disputes resolved within 14 days (SLA)
- 90%+ user satisfaction with dispute process
- < 1% chargeback rate (industry standard: 1-2%)
- Average resolution time: 7 days

### Acceptance Criteria

**Functional Requirements:**
- [ ] User can create dispute for any completed transaction (status: completed, refunded, reversed)
- [ ] Cannot dispute same transaction twice (idempotency check)
- [ ] Dispute window: 60 days from transaction date (configurable)
- [ ] Select from 8 dispute categories with clear descriptions
- [ ] Provide detailed description (min 50 chars, max 2000 chars)
- [ ] Specify desired resolution amount (≤ transaction amount)
- [ ] Upload evidence files (up to 10 files, 5MB each)
- [ ] Supported file formats: JPG, PNG, PDF, DOCX, XLSX
- [ ] Evidence description for each file (max 500 chars)
- [ ] Unique dispute reference generation (DSP-{YYYYMMDD}-{6-digit-random})
- [ ] Automatic merchant notification within 1 hour
- [ ] Email confirmation to user with dispute reference
- [ ] Timeline tracking (submitted, under_investigation, resolved)

**Dispute Categories:**
- [ ] Unauthorized transaction (fraud)
- [ ] Goods/services not received
- [ ] Goods/services defective
- [ ] Amount charged differs from agreed
- [ ] Duplicate charge
- [ ] Fraud/scam
- [ ] Quality not as described
- [ ] Other (requires detailed explanation)

**Security Requirements:**
- [ ] JWT authentication required
- [ ] Only transaction owner can dispute
- [ ] Rate limiting: 5 disputes per day per user
- [ ] Evidence files scanned for malware (ClamAV)
- [ ] Files stored with encryption at rest (AES-256)
- [ ] Audit log for all dispute actions
- [ ] IP address and device fingerprint tracking
- [ ] Prevent disputes on already-disputed transactions

**Non-Functional Requirements:**
- [ ] Dispute creation response time < 2 seconds
- [ ] File upload response time < 5 seconds per file
- [ ] Support concurrent dispute creation (optimistic locking)
- [ ] Database transaction for dispute + evidence + notification
- [ ] Rollback on failure
- [ ] Evidence files accessible for 2 years (compliance)

### API Specification

**Endpoint:** POST /api/v1/disputes

**Request:**
```json
{
  "transaction_id": "uuid",
  "category": "not_received",
  "description": "Ordered product on Jan 1, 2025. Merchant confirmed shipment but item never arrived. Tracking number shows no updates for 15 days.",
  "desired_resolution_amount": 5000000,
  "evidence": [
    {
      "file": "base64-encoded-file-or-upload-url",
      "description": "Screenshot of order confirmation",
      "file_name": "order_confirmation.png"
    },
    {
      "file": "base64-encoded-file-or-upload-url",
      "description": "Email from merchant about shipment",
      "file_name": "shipment_email.pdf"
    }
  ]
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Dispute created successfully. Merchant has been notified.",
  "data": {
    "dispute": {
      "id": "uuid",
      "dispute_reference": "DSP-20250115-A3F5K9",
      "transaction_id": "uuid",
      "category": "not_received",
      "description": "Ordered product on Jan 1, 2025...",
      "disputed_amount": 5000000,
      "desired_resolution_amount": 5000000,
      "status": "submitted",
      "evidence_count": 2,
      "created_at": "2025-01-15T10:30:00Z",
      "merchant_response_deadline": "2025-01-22T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- 400: Invalid transaction ID
- 400: Dispute window expired (> 60 days)
- 400: Transaction already disputed
- 400: Invalid file format
- 400: File too large (> 5MB)
- 413: Too many files (> 10)
- 429: Rate limit exceeded

### Subtasks

- [ ] TICKET-16-002: Create Dispute Schema
- [ ] TICKET-16-003: Implement Dispute Service
- [ ] TICKET-16-004: Create Evidence Upload System
- [ ] TICKET-16-005: Implement Dispute Validation
- [ ] TICKET-16-006: Create Dispute Endpoints
- [ ] TICKET-16-007: Implement Dispute Notifications
- [ ] TICKET-16-008: Create Dispute Timeline Tracking

### Testing Requirements

**Unit Tests (25 tests):**
- Dispute creation with valid data
- Dispute category validation
- Evidence file validation (format, size, count)
- Description length validation
- Amount validation (≤ transaction amount)
- Duplicate dispute prevention
- Dispute window enforcement (60 days)
- Reference generation uniqueness

**Integration Tests (12 tests):**
- Full dispute creation flow
- Evidence upload to MinIO
- Merchant notification delivery
- User email confirmation
- Database transaction rollback on failure
- Concurrent dispute creation handling

**Security Tests (8 tests):**
- Only transaction owner can dispute
- Rate limiting enforcement
- Malware detection in uploads
- SQL injection prevention
- XSS prevention in description

**E2E Tests (5 tests):**
- Complete dispute submission journey
- Multi-file evidence upload
- Dispute creation with all categories
- Error handling (invalid files, expired window)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Tests passing (50+ tests)
- [ ] Code coverage ≥ 85%
- [ ] Evidence upload working (MinIO integration)
- [ ] Notifications sending correctly
- [ ] Swagger documentation complete
- [ ] Security review passed
- [ ] Code reviewed and merged

---

## TICKET-16-002: Create Dispute Schema

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-16-001
**Sprint:** Sprint 16

### Description

Create comprehensive database schema for disputes, evidence files, and dispute timeline tracking with proper indexes and constraints.

### Task Details

**Migration File:** `libs/database/src/migrations/1704500000000-create-disputes.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDisputes1704500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create disputes table
    await queryRunner.createTable(
      new Table({
        name: 'disputes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'dispute_reference',
            type: 'varchar',
            length: '50',
            isUnique: true,
            comment: 'Unique dispute reference (DSP-YYYYMMDD-XXXXXX)',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'transaction_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Original transaction being disputed',
          },
          {
            name: 'category',
            type: 'enum',
            enum: [
              'unauthorized',
              'not_received',
              'defective',
              'amount_differs',
              'duplicate',
              'fraud',
              'quality_issue',
              'other',
            ],
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
            comment: 'Detailed description from user',
          },
          {
            name: 'disputed_amount',
            type: 'bigint',
            isNullable: false,
            comment: 'Original transaction amount in minor units',
          },
          {
            name: 'desired_resolution_amount',
            type: 'bigint',
            isNullable: false,
            comment: 'Amount user wants refunded',
          },
          {
            name: 'actual_resolution_amount',
            type: 'bigint',
            isNullable: true,
            comment: 'Final resolution amount after investigation',
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'submitted',
              'under_investigation',
              'awaiting_merchant',
              'merchant_responded',
              'under_review',
              'mediation',
              'resolved',
              'withdrawn',
              'closed',
            ],
            default: "'submitted'",
          },
          {
            name: 'resolution',
            type: 'enum',
            enum: [
              'favor_customer',
              'favor_merchant',
              'partial_resolution',
              'dismissed',
              'withdrawn',
            ],
            isNullable: true,
            comment: 'Final resolution outcome',
          },
          {
            name: 'resolution_reason',
            type: 'text',
            isNullable: true,
            comment: 'Explanation for resolution decision',
          },
          {
            name: 'assigned_to',
            type: 'uuid',
            isNullable: true,
            comment: 'Support agent assigned to investigate',
          },
          {
            name: 'merchant_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Merchant involved in the transaction',
          },
          {
            name: 'merchant_notified_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'merchant_response_deadline',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: '7 days from merchant notification',
          },
          {
            name: 'merchant_responded_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'submitted_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'resolved_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'sla_deadline',
            type: 'timestamp with time zone',
            isNullable: false,
            comment: '14 days from submission (configurable)',
          },
          {
            name: 'chargeback_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Linked chargeback ID if escalated',
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
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
            name: 'idx_dispute_reference',
            columnNames: ['dispute_reference'],
          },
          {
            name: 'idx_dispute_user_id',
            columnNames: ['user_id'],
          },
          {
            name: 'idx_dispute_transaction_id',
            columnNames: ['transaction_id'],
            isUnique: true, // One dispute per transaction
          },
          {
            name: 'idx_dispute_status',
            columnNames: ['status'],
          },
          {
            name: 'idx_dispute_assigned_to',
            columnNames: ['assigned_to'],
          },
          {
            name: 'idx_dispute_merchant_id',
            columnNames: ['merchant_id'],
          },
          {
            name: 'idx_dispute_sla_deadline',
            columnNames: ['sla_deadline'],
          },
          {
            name: 'idx_dispute_created_at',
            columnNames: ['created_at'],
          },
        ],
      }),
      true,
    );

    // 2. Create dispute_evidence table
    await queryRunner.createTable(
      new Table({
        name: 'dispute_evidence',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'dispute_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'uploaded_by',
            type: 'uuid',
            isNullable: false,
            comment: 'User or merchant who uploaded',
          },
          {
            name: 'uploader_type',
            type: 'enum',
            enum: ['customer', 'merchant', 'support'],
            isNullable: false,
          },
          {
            name: 'file_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'file_url',
            type: 'varchar',
            length: '500',
            isNullable: false,
            comment: 'MinIO storage URL',
          },
          {
            name: 'file_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'MIME type',
          },
          {
            name: 'file_size',
            type: 'bigint',
            isNullable: false,
            comment: 'Size in bytes',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'uploaded_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'malware_scan_status',
            type: 'enum',
            enum: ['pending', 'clean', 'infected', 'error'],
            default: "'pending'",
          },
          {
            name: 'malware_scan_result',
            type: 'text',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'idx_evidence_dispute_id',
            columnNames: ['dispute_id'],
          },
          {
            name: 'idx_evidence_uploaded_by',
            columnNames: ['uploaded_by'],
          },
        ],
      }),
      true,
    );

    // 3. Create dispute_timeline table
    await queryRunner.createTable(
      new Table({
        name: 'dispute_timeline',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'dispute_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'event_type',
            type: 'enum',
            enum: [
              'created',
              'assigned',
              'merchant_notified',
              'merchant_responded',
              'evidence_uploaded',
              'status_changed',
              'resolved',
              'closed',
            ],
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'actor_id',
            type: 'uuid',
            isNullable: true,
            comment: 'User/agent who triggered event',
          },
          {
            name: 'actor_type',
            type: 'enum',
            enum: ['customer', 'merchant', 'support', 'system'],
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional event data',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'idx_timeline_dispute_id',
            columnNames: ['dispute_id'],
          },
          {
            name: 'idx_timeline_created_at',
            columnNames: ['created_at'],
          },
        ],
      }),
      true,
    );

    // 4. Create foreign keys
    await queryRunner.createForeignKey(
      'disputes',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'disputes',
      new TableForeignKey({
        columnNames: ['transaction_id'],
        referencedTableName: 'transactions',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'disputes',
      new TableForeignKey({
        columnNames: ['assigned_to'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'dispute_evidence',
      new TableForeignKey({
        columnNames: ['dispute_id'],
        referencedTableName: 'disputes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'dispute_evidence',
      new TableForeignKey({
        columnNames: ['uploaded_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'dispute_timeline',
      new TableForeignKey({
        columnNames: ['dispute_id'],
        referencedTableName: 'disputes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('dispute_timeline');
    await queryRunner.dropTable('dispute_evidence');
    await queryRunner.dropTable('disputes');
  }
}
```

**Entity File:** `apps/payment-api/src/modules/disputes/entities/dispute.entity.ts`

```typescript
import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@libs/database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { DisputeEvidence } from './dispute-evidence.entity';
import { DisputeTimeline } from './dispute-timeline.entity';

export enum DisputeCategory {
  UNAUTHORIZED = 'unauthorized',
  NOT_RECEIVED = 'not_received',
  DEFECTIVE = 'defective',
  AMOUNT_DIFFERS = 'amount_differs',
  DUPLICATE = 'duplicate',
  FRAUD = 'fraud',
  QUALITY_ISSUE = 'quality_issue',
  OTHER = 'other',
}

export enum DisputeStatus {
  SUBMITTED = 'submitted',
  UNDER_INVESTIGATION = 'under_investigation',
  AWAITING_MERCHANT = 'awaiting_merchant',
  MERCHANT_RESPONDED = 'merchant_responded',
  UNDER_REVIEW = 'under_review',
  MEDIATION = 'mediation',
  RESOLVED = 'resolved',
  WITHDRAWN = 'withdrawn',
  CLOSED = 'closed',
}

export enum DisputeResolution {
  FAVOR_CUSTOMER = 'favor_customer',
  FAVOR_MERCHANT = 'favor_merchant',
  PARTIAL_RESOLUTION = 'partial_resolution',
  DISMISSED = 'dismissed',
  WITHDRAWN = 'withdrawn',
}

@Entity('disputes')
export class Dispute extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  dispute_reference: string;

  @Column('uuid')
  @Index()
  user_id: string;

  @Column('uuid')
  @Index({ unique: true })
  transaction_id: string;

  @Column({ type: 'enum', enum: DisputeCategory })
  category: DisputeCategory;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'bigint' })
  disputed_amount: number;

  @Column({ type: 'bigint' })
  desired_resolution_amount: number;

  @Column({ type: 'bigint', nullable: true })
  actual_resolution_amount: number;

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.SUBMITTED })
  @Index()
  status: DisputeStatus;

  @Column({ type: 'enum', enum: DisputeResolution, nullable: true })
  resolution: DisputeResolution;

  @Column({ type: 'text', nullable: true })
  resolution_reason: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  assigned_to: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  merchant_id: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  merchant_notified_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  merchant_response_deadline: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  merchant_responded_at: Date;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  submitted_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  resolved_at: Date;

  @Column({ type: 'timestamp with time zone' })
  @Index()
  sla_deadline: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  chargeback_id: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to' })
  assigned_agent: User;

  @OneToMany(() => DisputeEvidence, evidence => evidence.dispute)
  evidence: DisputeEvidence[];

  @OneToMany(() => DisputeTimeline, timeline => timeline.dispute)
  timeline: DisputeTimeline[];
}
```

**Evidence Entity:** `apps/payment-api/src/modules/disputes/entities/dispute-evidence.entity.ts`

```typescript
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@libs/database/entities/base.entity';
import { Dispute } from './dispute.entity';
import { User } from '../../users/entities/user.entity';

export enum UploaderType {
  CUSTOMER = 'customer',
  MERCHANT = 'merchant',
  SUPPORT = 'support',
}

export enum MalwareScanStatus {
  PENDING = 'pending',
  CLEAN = 'clean',
  INFECTED = 'infected',
  ERROR = 'error',
}

@Entity('dispute_evidence')
export class DisputeEvidence extends BaseEntity {
  @Column('uuid')
  @Index()
  dispute_id: string;

  @Column('uuid')
  @Index()
  uploaded_by: string;

  @Column({ type: 'enum', enum: UploaderType })
  uploader_type: UploaderType;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'varchar', length: 500 })
  file_url: string;

  @Column({ type: 'varchar', length: 50 })
  file_type: string;

  @Column({ type: 'bigint' })
  file_size: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  uploaded_at: Date;

  @Column({ type: 'enum', enum: MalwareScanStatus, default: MalwareScanStatus.PENDING })
  malware_scan_status: MalwareScanStatus;

  @Column({ type: 'text', nullable: true })
  malware_scan_result: string;

  @ManyToOne(() => Dispute, dispute => dispute.evidence)
  @JoinColumn({ name: 'dispute_id' })
  dispute: Dispute;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;
}
```

**Timeline Entity:** `apps/payment-api/src/modules/disputes/entities/dispute-timeline.entity.ts`

```typescript
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@libs/database/entities/base.entity';
import { Dispute } from './dispute.entity';

export enum TimelineEventType {
  CREATED = 'created',
  ASSIGNED = 'assigned',
  MERCHANT_NOTIFIED = 'merchant_notified',
  MERCHANT_RESPONDED = 'merchant_responded',
  EVIDENCE_UPLOADED = 'evidence_uploaded',
  STATUS_CHANGED = 'status_changed',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ActorType {
  CUSTOMER = 'customer',
  MERCHANT = 'merchant',
  SUPPORT = 'support',
  SYSTEM = 'system',
}

@Entity('dispute_timeline')
export class DisputeTimeline extends BaseEntity {
  @Column('uuid')
  @Index()
  dispute_id: string;

  @Column({ type: 'enum', enum: TimelineEventType })
  event_type: TimelineEventType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  actor_id: string;

  @Column({ type: 'enum', enum: ActorType })
  actor_type: ActorType;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  created_at: Date;

  @ManyToOne(() => Dispute, dispute => dispute.timeline)
  @JoinColumn({ name: 'dispute_id' })
  dispute: Dispute;
}
```

### Acceptance Criteria

- [ ] Migration file created and tested
- [ ] disputes table created with all columns
- [ ] dispute_evidence table created
- [ ] dispute_timeline table created
- [ ] Unique constraint on dispute_reference
- [ ] Unique constraint on transaction_id (one dispute per transaction)
- [ ] Indexes created for performance (user_id, status, assigned_to, sla_deadline)
- [ ] Foreign keys created with proper cascade rules
- [ ] Dispute entity with proper TypeScript types
- [ ] DisputeEvidence entity implemented
- [ ] DisputeTimeline entity implemented
- [ ] Enums for category, status, resolution
- [ ] Relations properly configured
- [ ] Migration runs successfully (up)
- [ ] Migration rollback works (down)

### Testing

```typescript
describe('Dispute Schema', () => {
  it('should create disputes table');
  it('should create dispute_evidence table');
  it('should create dispute_timeline table');
  it('should enforce unique dispute_reference');
  it('should enforce one dispute per transaction');
  it('should cascade delete evidence on dispute deletion');
  it('should cascade delete timeline on dispute deletion');
  it('should set assigned_to to NULL when agent deleted');
  it('should prevent transaction deletion if disputed (RESTRICT)');
  it('should store SLA deadline correctly');
  it('should track merchant response deadline (7 days)');
});
```

### Definition of Done

- [ ] Migration created and tested
- [ ] All tables created successfully
- [ ] All entities implemented
- [ ] Relations working correctly
- [ ] Tests passing (11+ tests)
- [ ] Database rollback tested
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-16-003: Implement Dispute Service

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-16-001
**Sprint:** Sprint 16

### Description

Implement core dispute service with business logic for dispute creation, validation, reference generation, SLA calculation, and duplicate prevention.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/services/dispute.service.ts`

```typescript
import { Injectable, BadRequestException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Dispute, DisputeCategory, DisputeStatus } from '../entities/dispute.entity';
import { DisputeEvidence, UploaderType } from '../entities/dispute-evidence.entity';
import { DisputeTimeline, TimelineEventType, ActorType } from '../entities/dispute-timeline.entity';
import { Transaction, TransactionStatus } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import { CreateDisputeDto } from '../dto/create-dispute.dto';
import { addDays, addHours } from 'date-fns';

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    @InjectRepository(DisputeEvidence)
    private evidenceRepository: Repository<DisputeEvidence>,
    @InjectRepository(DisputeTimeline)
    private timelineRepository: Repository<DisputeTimeline>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * Create a new dispute
   */
  async createDispute(
    userId: string,
    dto: CreateDisputeDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<Dispute> {
    // 1. Validate transaction exists and belongs to user
    const transaction = await this.transactionRepository.findOne({
      where: { id: dto.transaction_id },
      relations: ['source_wallet', 'destination_wallet'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // 2. Verify transaction ownership
    if (transaction.user_id !== userId) {
      throw new BadRequestException('You can only dispute your own transactions');
    }

    // 3. Validate transaction status (must be completed)
    if (![TransactionStatus.COMPLETED, TransactionStatus.REFUNDED, TransactionStatus.REVERSED].includes(transaction.status)) {
      throw new BadRequestException('Only completed, refunded, or reversed transactions can be disputed');
    }

    // 4. Check dispute window (60 days from transaction date)
    const disputeWindowDays = 60;
    const transactionDate = new Date(transaction.created_at);
    const windowExpiry = addDays(transactionDate, disputeWindowDays);

    if (new Date() > windowExpiry) {
      throw new BadRequestException(
        `Dispute window expired. Disputes must be raised within ${disputeWindowDays} days of transaction.`
      );
    }

    // 5. Check for existing dispute on this transaction
    const existingDispute = await this.disputeRepository.findOne({
      where: { transaction_id: dto.transaction_id },
    });

    if (existingDispute) {
      throw new ConflictException(
        `Transaction already disputed. Dispute reference: ${existingDispute.dispute_reference}`
      );
    }

    // 6. Validate desired resolution amount
    if (dto.desired_resolution_amount > transaction.amount) {
      throw new BadRequestException(
        'Desired resolution amount cannot exceed transaction amount'
      );
    }

    if (dto.desired_resolution_amount <= 0) {
      throw new BadRequestException('Desired resolution amount must be greater than zero');
    }

    // 7. Generate unique dispute reference
    const disputeReference = await this.generateDisputeReference();

    // 8. Calculate SLA deadline (14 days from now)
    const slaDeadline = addDays(new Date(), 14);

    // 9. Calculate merchant response deadline (7 days from notification)
    const merchantResponseDeadline = addDays(new Date(), 7);

    // 10. Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 11. Create dispute record
      const dispute = await queryRunner.manager.save(Dispute, {
        dispute_reference: disputeReference,
        user_id: userId,
        transaction_id: dto.transaction_id,
        category: dto.category,
        description: dto.description,
        disputed_amount: transaction.amount,
        desired_resolution_amount: dto.desired_resolution_amount,
        status: DisputeStatus.SUBMITTED,
        merchant_id: transaction.destination_wallet?.user_id || null,
        merchant_response_deadline: merchantResponseDeadline,
        submitted_at: new Date(),
        sla_deadline: slaDeadline,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      // 12. Create timeline entry for dispute creation
      await queryRunner.manager.save(DisputeTimeline, {
        dispute_id: dispute.id,
        event_type: TimelineEventType.CREATED,
        description: `Dispute created by customer for ${this.getCategoryLabel(dto.category)}`,
        actor_id: userId,
        actor_type: ActorType.CUSTOMER,
        metadata: {
          category: dto.category,
          desired_amount: dto.desired_resolution_amount,
          transaction_reference: transaction.reference,
        },
      });

      // 13. Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(`Dispute created: ${disputeReference} by user ${userId}`);

      return dispute;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create dispute:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get dispute by ID
   */
  async getDisputeById(disputeId: string, userId: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['user', 'transaction', 'evidence', 'timeline', 'assigned_agent'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    // Verify ownership (or admin/support access)
    if (dispute.user_id !== userId && dispute.merchant_id !== userId) {
      throw new BadRequestException('Access denied');
    }

    return dispute;
  }

  /**
   * Get dispute by reference
   */
  async getDisputeByReference(reference: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { dispute_reference: reference },
      relations: ['user', 'transaction', 'evidence', 'timeline', 'assigned_agent'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  /**
   * Get user's disputes
   */
  async getUserDisputes(
    userId: string,
    filters?: {
      status?: DisputeStatus;
      category?: DisputeCategory;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ disputes: Dispute[]; total: number }> {
    const query = this.disputeRepository
      .createQueryBuilder('dispute')
      .leftJoinAndSelect('dispute.transaction', 'transaction')
      .leftJoinAndSelect('dispute.evidence', 'evidence')
      .where('dispute.user_id = :userId', { userId });

    if (filters?.status) {
      query.andWhere('dispute.status = :status', { status: filters.status });
    }

    if (filters?.category) {
      query.andWhere('dispute.category = :category', { category: filters.category });
    }

    query.orderBy('dispute.created_at', 'DESC');

    if (filters?.limit) {
      query.take(filters.limit);
    }

    if (filters?.offset) {
      query.skip(filters.offset);
    }

    const [disputes, total] = await query.getManyAndCount();

    return { disputes, total };
  }

  /**
   * Withdraw dispute
   */
  async withdrawDispute(disputeId: string, userId: string, reason: string): Promise<Dispute> {
    const dispute = await this.getDisputeById(disputeId, userId);

    // Can only withdraw if submitted or under investigation
    if (![DisputeStatus.SUBMITTED, DisputeStatus.UNDER_INVESTIGATION].includes(dispute.status)) {
      throw new BadRequestException('Dispute cannot be withdrawn at this stage');
    }

    // Update dispute status
    dispute.status = DisputeStatus.WITHDRAWN;
    dispute.resolution = DisputeResolution.WITHDRAWN;
    dispute.resolution_reason = reason;
    dispute.resolved_at = new Date();

    await this.disputeRepository.save(dispute);

    // Add timeline entry
    await this.timelineRepository.save({
      dispute_id: dispute.id,
      event_type: TimelineEventType.CLOSED,
      description: `Dispute withdrawn by customer`,
      actor_id: userId,
      actor_type: ActorType.CUSTOMER,
      metadata: { reason },
    });

    this.logger.log(`Dispute withdrawn: ${dispute.dispute_reference}`);

    return dispute;
  }

  /**
   * Generate unique dispute reference
   */
  private async generateDisputeReference(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().replace(/[-:]/g, '').split('T')[0]; // YYYYMMDD

    let reference: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      reference = `DSP-${dateStr}-${random}`;

      const existing = await this.disputeRepository.findOne({
        where: { dispute_reference: reference },
      });

      if (!existing) {
        return reference;
      }

      attempts++;
    } while (attempts < maxAttempts);

    throw new Error('Failed to generate unique dispute reference');
  }

  /**
   * Get category label for display
   */
  private getCategoryLabel(category: DisputeCategory): string {
    const labels = {
      [DisputeCategory.UNAUTHORIZED]: 'Unauthorized Transaction',
      [DisputeCategory.NOT_RECEIVED]: 'Goods/Services Not Received',
      [DisputeCategory.DEFECTIVE]: 'Defective Goods/Services',
      [DisputeCategory.AMOUNT_DIFFERS]: 'Amount Differs from Agreed',
      [DisputeCategory.DUPLICATE]: 'Duplicate Charge',
      [DisputeCategory.FRAUD]: 'Fraud/Scam',
      [DisputeCategory.QUALITY_ISSUE]: 'Quality Not as Described',
      [DisputeCategory.OTHER]: 'Other Issue',
    };

    return labels[category] || category;
  }

  /**
   * Check if dispute is within SLA
   */
  isWithinSLA(dispute: Dispute): boolean {
    return new Date() <= new Date(dispute.sla_deadline);
  }

  /**
   * Get disputes nearing SLA breach
   */
  async getDisputesNearingSLA(hoursBeforeBreach: number = 24): Promise<Dispute[]> {
    const threshold = addHours(new Date(), hoursBeforeBreach);

    return await this.disputeRepository
      .createQueryBuilder('dispute')
      .where('dispute.status NOT IN (:...resolvedStatuses)', {
        resolvedStatuses: [DisputeStatus.RESOLVED, DisputeStatus.CLOSED, DisputeStatus.WITHDRAWN],
      })
      .andWhere('dispute.sla_deadline <= :threshold', { threshold })
      .andWhere('dispute.sla_deadline > :now', { now: new Date() })
      .getMany();
  }
}
```

**DTO File:** `apps/payment-api/src/modules/disputes/dto/create-dispute.dto.ts`

```typescript
import { IsEnum, IsString, IsNumber, IsUUID, MinLength, MaxLength, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisputeCategory } from '../entities/dispute.entity';

export class CreateDisputeDto {
  @ApiProperty({ description: 'Transaction ID to dispute' })
  @IsUUID('4')
  transaction_id: string;

  @ApiProperty({
    description: 'Dispute category',
    enum: DisputeCategory,
    example: DisputeCategory.NOT_RECEIVED,
  })
  @IsEnum(DisputeCategory)
  category: DisputeCategory;

  @ApiProperty({
    description: 'Detailed description of the issue',
    minLength: 50,
    maxLength: 2000,
    example: 'Ordered product on Jan 1, 2025. Merchant confirmed shipment but item never arrived. Tracking shows no updates for 15 days.',
  })
  @IsString()
  @MinLength(50, { message: 'Description must be at least 50 characters' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description: string;

  @ApiProperty({
    description: 'Desired resolution amount in minor units (kobo/cents)',
    example: 5000000,
  })
  @IsNumber()
  @Min(1)
  desired_resolution_amount: number;
}
```

### Acceptance Criteria

- [ ] DisputeService implemented with all methods
- [ ] createDispute method with full validation
- [ ] Transaction ownership verification
- [ ] Transaction status validation (completed, refunded, reversed)
- [ ] Dispute window enforcement (60 days)
- [ ] Duplicate dispute prevention
- [ ] Amount validation (≤ transaction amount)
- [ ] Unique dispute reference generation (DSP-YYYYMMDD-XXXXXX)
- [ ] SLA deadline calculation (14 days from submission)
- [ ] Merchant response deadline (7 days from notification)
- [ ] Database transaction for atomicity
- [ ] Timeline entry creation on dispute creation
- [ ] getDisputeById with ownership check
- [ ] getUserDisputes with filters (status, category, pagination)
- [ ] withdrawDispute with status validation
- [ ] Error handling for all edge cases
- [ ] Logging for audit trail

### Testing

```typescript
describe('DisputeService', () => {
  describe('createDispute', () => {
    it('should create dispute successfully');
    it('should enforce transaction ownership');
    it('should reject non-completed transactions');
    it('should enforce 60-day dispute window');
    it('should prevent duplicate disputes');
    it('should validate resolution amount <= transaction amount');
    it('should generate unique dispute reference');
    it('should calculate SLA deadline (14 days)');
    it('should calculate merchant response deadline (7 days)');
    it('should create timeline entry');
    it('should rollback on error');
  });

  describe('getDisputeById', () => {
    it('should return dispute with relations');
    it('should enforce ownership check');
    it('should allow merchant access');
    it('should throw NotFoundException for invalid ID');
  });

  describe('withdrawDispute', () => {
    it('should withdraw submitted dispute');
    it('should withdraw dispute under investigation');
    it('should prevent withdrawal of resolved dispute');
    it('should create timeline entry');
  });

  describe('generateDisputeReference', () => {
    it('should generate unique reference with format DSP-YYYYMMDD-XXXXXX');
    it('should retry on collision');
    it('should throw error after max attempts');
  });

  describe('SLA checks', () => {
    it('should identify disputes within SLA');
    it('should identify disputes breaching SLA');
    it('should get disputes nearing SLA (24 hours)');
  });
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] DTO validation configured
- [ ] Tests passing (20+ tests)
- [ ] Error handling complete
- [ ] Logging implemented
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-16-004: Create Evidence Upload System

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-16-001
**Sprint:** Sprint 16

### Description

Implement secure file upload system for dispute evidence with MinIO integration, malware scanning, file validation, and encryption at rest.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/services/evidence-upload.service.ts`

```typescript
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisputeEvidence, UploaderType, MalwareScanStatus } from '../entities/dispute-evidence.entity';
import { Dispute } from '../entities/dispute.entity';
import { DisputeTimeline, TimelineEventType, ActorType } from '../entities/dispute-timeline.entity';
import { MinioService } from '../../storage/minio.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as path from 'path';

interface UploadEvidenceDto {
  dispute_id: string;
  file: Express.Multer.File;
  description?: string;
  uploaded_by: string;
  uploader_type: UploaderType;
}

@Injectable()
export class EvidenceUploadService {
  private readonly logger = new Logger(EvidenceUploadService.name);
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  ];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly maxFilesPerDispute = 10;
  private readonly bucketName = 'dispute-evidence';

  constructor(
    @InjectRepository(DisputeEvidence)
    private evidenceRepository: Repository<DisputeEvidence>,
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    @InjectRepository(DisputeTimeline)
    private timelineRepository: Repository<DisputeTimeline>,
    private minioService: MinioService,
    private configService: ConfigService,
  ) {
    this.initializeBucket();
  }

  /**
   * Initialize MinIO bucket for dispute evidence
   */
  private async initializeBucket(): Promise<void> {
    try {
      const exists = await this.minioService.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioService.createBucket(this.bucketName);
        // Set bucket policy for encryption at rest
        await this.minioService.setBucketEncryption(this.bucketName);
        this.logger.log(`Created bucket: ${this.bucketName} with encryption`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize bucket:', error);
    }
  }

  /**
   * Upload evidence file
   */
  async uploadEvidence(dto: UploadEvidenceDto): Promise<DisputeEvidence> {
    // 1. Validate dispute exists
    const dispute = await this.disputeRepository.findOne({
      where: { id: dto.dispute_id },
      relations: ['evidence'],
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    // 2. Check file count limit
    if (dispute.evidence && dispute.evidence.length >= this.maxFilesPerDispute) {
      throw new BadRequestException(
        `Maximum ${this.maxFilesPerDispute} evidence files allowed per dispute`
      );
    }

    // 3. Validate file
    this.validateFile(dto.file);

    // 4. Generate secure filename
    const secureFilename = this.generateSecureFilename(dto.file.originalname);
    const objectPath = `${dto.dispute_id}/${secureFilename}`;

    // 5. Upload to MinIO
    const uploadResult = await this.minioService.uploadFile(
      this.bucketName,
      objectPath,
      dto.file.buffer,
      dto.file.mimetype,
    );

    // 6. Get file URL
    const fileUrl = await this.minioService.getFileUrl(this.bucketName, objectPath);

    // 7. Create evidence record
    const evidence = await this.evidenceRepository.save({
      dispute_id: dto.dispute_id,
      uploaded_by: dto.uploaded_by,
      uploader_type: dto.uploader_type,
      file_name: dto.file.originalname,
      file_url: fileUrl,
      file_type: dto.file.mimetype,
      file_size: dto.file.size,
      description: dto.description,
      malware_scan_status: MalwareScanStatus.PENDING,
    });

    // 8. Add timeline entry
    await this.timelineRepository.save({
      dispute_id: dto.dispute_id,
      event_type: TimelineEventType.EVIDENCE_UPLOADED,
      description: `Evidence file uploaded: ${dto.file.originalname}`,
      actor_id: dto.uploaded_by,
      actor_type: dto.uploader_type === UploaderType.CUSTOMER ? ActorType.CUSTOMER :
                   dto.uploader_type === UploaderType.MERCHANT ? ActorType.MERCHANT : ActorType.SUPPORT,
      metadata: {
        file_name: dto.file.originalname,
        file_size: dto.file.size,
        file_type: dto.file.mimetype,
      },
    });

    // 9. Trigger async malware scan
    this.scanForMalware(evidence.id, objectPath).catch(err => {
      this.logger.error(`Malware scan failed for evidence ${evidence.id}:`, err);
    });

    this.logger.log(`Evidence uploaded: ${evidence.id} for dispute ${dto.dispute_id}`);

    return evidence;
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`
      );
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: JPG, PNG, PDF, DOCX, XLSX`
      );
    }

    // Check file has content
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }

    // Validate file extension matches MIME type
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeToExt = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    };

    const allowedExts = mimeToExt[file.mimetype] || [];
    if (!allowedExts.includes(ext)) {
      throw new BadRequestException(
        `File extension ${ext} does not match MIME type ${file.mimetype}`
      );
    }
  }

  /**
   * Generate secure filename to prevent directory traversal
   */
  private generateSecureFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Scan file for malware using ClamAV (async)
   */
  private async scanForMalware(evidenceId: string, objectPath: string): Promise<void> {
    try {
      // Download file from MinIO
      const fileStream = await this.minioService.getFileStream(this.bucketName, objectPath);

      // Scan with ClamAV (integrate with clamscan library)
      const scanResult = await this.performClamAVScan(fileStream);

      // Update evidence record
      await this.evidenceRepository.update(
        { id: evidenceId },
        {
          malware_scan_status: scanResult.isInfected
            ? MalwareScanStatus.INFECTED
            : MalwareScanStatus.CLEAN,
          malware_scan_result: scanResult.viruses?.join(', ') || 'Clean',
        }
      );

      if (scanResult.isInfected) {
        this.logger.warn(`Malware detected in evidence ${evidenceId}: ${scanResult.viruses}`);

        // Delete infected file
        await this.minioService.deleteFile(this.bucketName, objectPath);

        // Could send notification to admin
      }

    } catch (error) {
      this.logger.error(`Malware scan error for evidence ${evidenceId}:`, error);

      await this.evidenceRepository.update(
        { id: evidenceId },
        {
          malware_scan_status: MalwareScanStatus.ERROR,
          malware_scan_result: error.message,
        }
      );
    }
  }

  /**
   * Perform ClamAV scan (placeholder - integrate with clamscan library)
   */
  private async performClamAVScan(fileStream: any): Promise<{
    isInfected: boolean;
    viruses?: string[];
  }> {
    // TODO: Integrate with clamscan library
    // For now, return clean status
    // In production: use NodeClam or similar library

    // Example integration:
    // const NodeClam = require('clamscan');
    // const clamscan = await new NodeClam().init();
    // const { isInfected, viruses } = await clamscan.scanStream(fileStream);
    // return { isInfected, viruses };

    return { isInfected: false };
  }

  /**
   * Get evidence by ID
   */
  async getEvidence(evidenceId: string): Promise<DisputeEvidence> {
    const evidence = await this.evidenceRepository.findOne({
      where: { id: evidenceId },
      relations: ['dispute', 'uploader'],
    });

    if (!evidence) {
      throw new BadRequestException('Evidence not found');
    }

    return evidence;
  }

  /**
   * Get all evidence for a dispute
   */
  async getDisputeEvidence(disputeId: string): Promise<DisputeEvidence[]> {
    return await this.evidenceRepository.find({
      where: { dispute_id: disputeId },
      order: { uploaded_at: 'ASC' },
    });
  }

  /**
   * Delete evidence (soft delete - mark as deleted, keep in storage for compliance)
   */
  async deleteEvidence(evidenceId: string, userId: string): Promise<void> {
    const evidence = await this.getEvidence(evidenceId);

    // Only uploader or admin can delete
    if (evidence.uploaded_by !== userId) {
      throw new BadRequestException('Only the uploader can delete this evidence');
    }

    // Soft delete - don't actually delete from MinIO (compliance requirement)
    await this.evidenceRepository.softDelete(evidenceId);

    this.logger.log(`Evidence soft-deleted: ${evidenceId}`);
  }

  /**
   * Generate temporary signed URL for evidence download
   */
  async getEvidenceDownloadUrl(evidenceId: string, userId: string): Promise<string> {
    const evidence = await this.getEvidence(evidenceId);

    // Verify user has access to this dispute
    const dispute = await this.disputeRepository.findOne({
      where: { id: evidence.dispute_id },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    // Check access (user, merchant, or support)
    if (dispute.user_id !== userId && dispute.merchant_id !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Generate 1-hour temporary URL
    const objectPath = evidence.file_url.split(`${this.bucketName}/`)[1];
    const signedUrl = await this.minioService.getPresignedUrl(
      this.bucketName,
      objectPath,
      3600 // 1 hour
    );

    return signedUrl;
  }
}
```

**MinIO Service:** `apps/payment-api/src/modules/storage/minio.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get<string>('MINIO_PORT')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
  }

  async bucketExists(bucketName: string): Promise<boolean> {
    return await this.minioClient.bucketExists(bucketName);
  }

  async createBucket(bucketName: string): Promise<void> {
    await this.minioClient.makeBucket(bucketName, 'us-east-1');
  }

  async setBucketEncryption(bucketName: string): Promise<void> {
    // Set SSE-S3 encryption
    const encryptionConfig = {
      Rule: [
        {
          ApplyServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256',
          },
        },
      ],
    };
    // Note: MinIO SDK encryption configuration
  }

  async uploadFile(
    bucketName: string,
    objectName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<any> {
    return await this.minioClient.putObject(
      bucketName,
      objectName,
      buffer,
      buffer.length,
      { 'Content-Type': contentType }
    );
  }

  async getFileUrl(bucketName: string, objectName: string): Promise<string> {
    return `${this.configService.get<string>('MINIO_ENDPOINT')}:${this.configService.get<string>('MINIO_PORT')}/${bucketName}/${objectName}`;
  }

  async getFileStream(bucketName: string, objectName: string): Promise<any> {
    return await this.minioClient.getObject(bucketName, objectName);
  }

  async getPresignedUrl(
    bucketName: string,
    objectName: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    return await this.minioClient.presignedGetObject(bucketName, objectName, expirySeconds);
  }

  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, objectName);
  }
}
```

### Acceptance Criteria

- [ ] EvidenceUploadService implemented
- [ ] MinIO integration working
- [ ] File validation (size, MIME type, extension)
- [ ] Maximum file size enforced (5MB)
- [ ] Maximum files per dispute enforced (10 files)
- [ ] Allowed file formats validated (JPG, PNG, PDF, DOCX, XLSX)
- [ ] Secure filename generation (prevent directory traversal)
- [ ] Files uploaded to MinIO with encryption at rest (AES-256)
- [ ] Evidence record created in database
- [ ] Timeline entry created on upload
- [ ] Malware scanning integration (ClamAV)
- [ ] Infected files deleted automatically
- [ ] Presigned URL generation for secure downloads (1-hour expiry)
- [ ] Soft delete implementation (compliance - keep files for 2 years)
- [ ] Error handling for upload failures
- [ ] Logging for audit trail

### Testing

```typescript
describe('EvidenceUploadService', () => {
  it('should upload valid evidence file');
  it('should reject file larger than 5MB');
  it('should reject invalid file type');
  it('should reject file with mismatched extension and MIME type');
  it('should enforce maximum 10 files per dispute');
  it('should generate secure filename');
  it('should upload to MinIO successfully');
  it('should create evidence database record');
  it('should create timeline entry');
  it('should trigger malware scan asynchronously');
  it('should delete infected files');
  it('should generate presigned download URL');
  it('should enforce access control on download');
  it('should soft delete evidence');
  it('should prevent empty file upload');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] MinIO integration tested
- [ ] File validation working
- [ ] Malware scanning configured (ClamAV)
- [ ] Tests passing (15+ tests)
- [ ] Encryption at rest enabled
- [ ] Code reviewed

**Estimated Time:** 4 hours

**Dependencies:**
```bash
npm install minio
npm install clamscan  # For malware scanning
```

**Environment Variables:**
```bash
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

---

## TICKET-16-005: Implement Dispute Validation

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-16-001
**Sprint:** Sprint 16

### Description

Implement comprehensive validation middleware and guards for dispute operations including rate limiting, ownership verification, and business rule enforcement.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/guards/dispute-ownership.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from '../entities/dispute.entity';

@Injectable()
export class DisputeOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const disputeId = request.params.disputeId || request.params.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!disputeId) {
      throw new ForbiddenException('Dispute ID not provided');
    }

    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new ForbiddenException('Dispute not found');
    }

    // Allow access if user is:
    // 1. The dispute creator (customer)
    // 2. The merchant involved
    // 3. Support/Admin (check user roles)
    const hasAccess =
      dispute.user_id === userId ||
      dispute.merchant_id === userId ||
      request.user.roles?.includes('support') ||
      request.user.roles?.includes('admin');

    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this dispute');
    }

    // Attach dispute to request for controller use
    request.dispute = dispute;

    return true;
  }
}
```

**File:** `apps/payment-api/src/modules/disputes/decorators/dispute-rate-limit.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const DISPUTE_RATE_LIMIT_KEY = 'dispute_rate_limit';

export interface DisputeRateLimitOptions {
  maxAttempts: number;
  windowSeconds: number;
}

export const DisputeRateLimit = (options: DisputeRateLimitOptions) =>
  SetMetadata(DISPUTE_RATE_LIMIT_KEY, options);
```

**File:** `apps/payment-api/src/modules/disputes/guards/dispute-rate-limit.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, TooManyRequestsException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from '../entities/dispute.entity';
import { DISPUTE_RATE_LIMIT_KEY, DisputeRateLimitOptions } from '../decorators/dispute-rate-limit.decorator';
import { addSeconds } from 'date-fns';

@Injectable()
export class DisputeRateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<DisputeRateLimitOptions>(
      DISPUTE_RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!options) {
      return true; // No rate limit configured
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      return true; // Let auth guard handle authentication
    }

    const windowStart = addSeconds(new Date(), -options.windowSeconds);

    const recentDisputes = await this.disputeRepository.count({
      where: {
        user_id: userId,
        created_at: {
          $gte: windowStart,
        } as any,
      },
    });

    if (recentDisputes >= options.maxAttempts) {
      throw new TooManyRequestsException(
        `Rate limit exceeded. Maximum ${options.maxAttempts} dispute creations per ${options.windowSeconds / 3600} hour(s)`
      );
    }

    return true;
  }
}
```

**File:** `apps/payment-api/src/modules/disputes/validators/dispute-validation.service.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from '../../transactions/entities/transaction.entity';
import { Dispute } from '../entities/dispute.entity';
import { addDays } from 'date-fns';

@Injectable()
export class DisputeValidationService {
  private readonly DISPUTE_WINDOW_DAYS = 60;
  private readonly MIN_DESCRIPTION_LENGTH = 50;
  private readonly MAX_DESCRIPTION_LENGTH = 2000;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
  ) {}

  /**
   * Validate if transaction can be disputed
   */
  async validateTransactionDisputable(transactionId: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['source_wallet', 'destination_wallet'],
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    // Verify ownership
    if (transaction.user_id !== userId) {
      throw new BadRequestException('You can only dispute your own transactions');
    }

    // Check transaction status
    const disputableStatuses = [
      TransactionStatus.COMPLETED,
      TransactionStatus.REFUNDED,
      TransactionStatus.REVERSED,
    ];

    if (!disputableStatuses.includes(transaction.status)) {
      throw new BadRequestException(
        `Only completed, refunded, or reversed transactions can be disputed. Current status: ${transaction.status}`
      );
    }

    // Check dispute window
    const transactionDate = new Date(transaction.created_at);
    const windowExpiry = addDays(transactionDate, this.DISPUTE_WINDOW_DAYS);

    if (new Date() > windowExpiry) {
      throw new BadRequestException(
        `Dispute window expired. Disputes must be raised within ${this.DISPUTE_WINDOW_DAYS} days of transaction date.`
      );
    }

    // Check for existing dispute
    const existingDispute = await this.disputeRepository.findOne({
      where: { transaction_id: transactionId },
    });

    if (existingDispute) {
      throw new BadRequestException(
        `Transaction already disputed. Dispute reference: ${existingDispute.dispute_reference}`
      );
    }

    return transaction;
  }

  /**
   * Validate dispute description
   */
  validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new BadRequestException('Description is required');
    }

    const trimmedLength = description.trim().length;

    if (trimmedLength < this.MIN_DESCRIPTION_LENGTH) {
      throw new BadRequestException(
        `Description must be at least ${this.MIN_DESCRIPTION_LENGTH} characters. Current: ${trimmedLength}`
      );
    }

    if (trimmedLength > this.MAX_DESCRIPTION_LENGTH) {
      throw new BadRequestException(
        `Description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters. Current: ${trimmedLength}`
      );
    }

    // Check for spam patterns
    if (this.isSpamDescription(description)) {
      throw new BadRequestException('Description appears to be spam or invalid');
    }
  }

  /**
   * Validate resolution amount
   */
  validateResolutionAmount(amount: number, transactionAmount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Resolution amount must be greater than zero');
    }

    if (amount > transactionAmount) {
      throw new BadRequestException(
        `Resolution amount (${amount}) cannot exceed transaction amount (${transactionAmount})`
      );
    }
  }

  /**
   * Check for spam descriptions
   */
  private isSpamDescription(description: string): boolean {
    // Check for repeated characters (e.g., "aaaaaaaaaa")
    const repeatedCharPattern = /(.)\1{9,}/;
    if (repeatedCharPattern.test(description)) {
      return true;
    }

    // Check for single word repeated
    const words = description.split(/\s+/);
    if (words.length >= 10) {
      const wordCounts = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const maxWordCount = Math.max(...Object.values(wordCounts));
      if (maxWordCount > words.length * 0.5) {
        return true; // More than 50% of words are the same
      }
    }

    // Check for common spam phrases
    const spamPhrases = [
      'click here',
      'buy now',
      'limited time',
      'act now',
      'free money',
      'guaranteed',
    ];

    const lowerDescription = description.toLowerCase();
    const spamCount = spamPhrases.filter(phrase => lowerDescription.includes(phrase)).length;

    if (spamCount >= 2) {
      return true;
    }

    return false;
  }

  /**
   * Validate dispute status transition
   */
  validateStatusTransition(currentStatus: string, newStatus: string, userRole: string): void {
    const allowedTransitions: Record<string, string[]> = {
      submitted: ['under_investigation', 'withdrawn'],
      under_investigation: ['awaiting_merchant', 'under_review', 'resolved', 'withdrawn'],
      awaiting_merchant: ['merchant_responded', 'under_review', 'resolved'],
      merchant_responded: ['under_review', 'mediation', 'resolved'],
      under_review: ['mediation', 'resolved'],
      mediation: ['resolved'],
      resolved: ['closed'],
      withdrawn: ['closed'],
    };

    const allowed = allowedTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }

    // Role-based restrictions
    if (newStatus === 'withdrawn' && userRole !== 'customer') {
      throw new BadRequestException('Only customers can withdraw disputes');
    }

    if (['resolved', 'closed'].includes(newStatus) && !['support', 'admin'].includes(userRole)) {
      throw new BadRequestException('Only support/admin can resolve or close disputes');
    }
  }
}
```

### Acceptance Criteria

- [ ] DisputeOwnershipGuard implemented
- [ ] Access control for dispute owner, merchant, and support
- [ ] DisputeRateLimitGuard implemented
- [ ] Rate limiting: 5 disputes per day per user (configurable)
- [ ] DisputeValidationService implemented
- [ ] Transaction disputability validation
- [ ] Ownership verification
- [ ] Transaction status validation
- [ ] Dispute window enforcement (60 days)
- [ ] Duplicate dispute prevention
- [ ] Description validation (50-2000 chars)
- [ ] Spam detection in descriptions
- [ ] Resolution amount validation
- [ ] Status transition validation
- [ ] Role-based permission checks
- [ ] Clear error messages for all validations

### Testing

```typescript
describe('Dispute Validation', () => {
  describe('DisputeOwnershipGuard', () => {
    it('should allow dispute owner access');
    it('should allow merchant access');
    it('should allow support/admin access');
    it('should deny unauthorized user access');
  });

  describe('DisputeRateLimitGuard', () => {
    it('should allow first 5 disputes in 24 hours');
    it('should block 6th dispute in 24 hours');
    it('should reset after 24 hours');
  });

  describe('DisputeValidationService', () => {
    it('should validate disputable transaction');
    it('should reject non-owned transaction');
    it('should reject pending transaction');
    it('should reject transaction outside dispute window');
    it('should reject already-disputed transaction');
    it('should validate description length (50-2000)');
    it('should detect spam descriptions');
    it('should validate resolution amount <= transaction amount');
    it('should validate status transitions');
    it('should enforce role-based status changes');
  });
});
```

### Definition of Done

- [ ] All guards implemented
- [ ] Validation service complete
- [ ] Tests passing (18+ tests)
- [ ] Error messages clear and user-friendly
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-16-006: Create Dispute Endpoints

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-16-001
**Sprint:** Sprint 16

### Description

Create RESTful API endpoints for dispute operations with Swagger documentation, proper authentication, authorization, and error handling.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/disputes.controller.ts`

```typescript
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DisputeService } from '../services/dispute.service';
import { EvidenceUploadService } from '../services/evidence-upload.service';
import { DisputeValidationService } from '../validators/dispute-validation.service';
import { DisputeOwnershipGuard } from '../guards/dispute-ownership.guard';
import { DisputeRateLimitGuard } from '../guards/dispute-rate-limit.guard';
import { DisputeRateLimit } from '../decorators/dispute-rate-limit.decorator';
import { CreateDisputeDto } from '../dto/create-dispute.dto';
import { WithdrawDisputeDto } from '../dto/withdraw-dispute.dto';
import { Ip } from '../../common/decorators/ip.decorator';
import { UserAgent } from '../../common/decorators/user-agent.decorator';

@ApiTags('Disputes')
@Controller('api/v1/disputes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DisputesController {
  constructor(
    private disputeService: DisputeService,
    private evidenceService: EvidenceUploadService,
    private validationService: DisputeValidationService,
  ) {}

  @Post()
  @UseGuards(DisputeRateLimitGuard)
  @DisputeRateLimit({ maxAttempts: 5, windowSeconds: 86400 }) // 5 per day
  @UseInterceptors(FilesInterceptor('evidence', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new dispute' })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 409, description: 'Transaction already disputed' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async createDispute(
    @Request() req,
    @Body() dto: CreateDisputeDto,
    @UploadedFiles() evidenceFiles: Express.Multer.File[],
    @Ip() ipAddress: string,
    @UserAgent() userAgent: string,
  ) {
    const userId = req.user.id;

    // Validate transaction
    const transaction = await this.validationService.validateTransactionDisputable(
      dto.transaction_id,
      userId,
    );

    // Validate description
    this.validationService.validateDescription(dto.description);

    // Validate resolution amount
    this.validationService.validateResolutionAmount(
      dto.desired_resolution_amount,
      transaction.amount,
    );

    // Create dispute
    const dispute = await this.disputeService.createDispute(
      userId,
      dto,
      ipAddress,
      userAgent,
    );

    // Upload evidence files if provided
    if (evidenceFiles && evidenceFiles.length > 0) {
      for (const file of evidenceFiles) {
        await this.evidenceService.uploadEvidence({
          dispute_id: dispute.id,
          file,
          description: dto.evidence_descriptions?.[evidenceFiles.indexOf(file)],
          uploaded_by: userId,
          uploader_type: 'customer' as any,
        });
      }
    }

    return {
      status: 'success',
      message: 'Dispute created successfully. Merchant has been notified.',
      data: {
        dispute: {
          id: dispute.id,
          dispute_reference: dispute.dispute_reference,
          transaction_id: dispute.transaction_id,
          category: dispute.category,
          status: dispute.status,
          disputed_amount: dispute.disputed_amount,
          desired_resolution_amount: dispute.desired_resolution_amount,
          merchant_response_deadline: dispute.merchant_response_deadline,
          sla_deadline: dispute.sla_deadline,
          created_at: dispute.created_at,
        },
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get user disputes with filters' })
  @ApiQuery({ name: 'status', required: false, enum: ['submitted', 'under_investigation', 'resolved', 'closed'] })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Disputes retrieved successfully' })
  async getUserDisputes(
    @Request() req,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const { disputes, total } = await this.disputeService.getUserDisputes(req.user.id, {
      status: status as any,
      category: category as any,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });

    return {
      status: 'success',
      data: {
        disputes: disputes.map(d => ({
          id: d.id,
          dispute_reference: d.dispute_reference,
          transaction_id: d.transaction_id,
          category: d.category,
          status: d.status,
          disputed_amount: d.disputed_amount,
          desired_resolution_amount: d.desired_resolution_amount,
          resolution: d.resolution,
          created_at: d.created_at,
          resolved_at: d.resolved_at,
          sla_deadline: d.sla_deadline,
          evidence_count: d.evidence?.length || 0,
        })),
        total,
        limit: limit || 20,
        offset: offset || 0,
      },
    };
  }

  @Get(':disputeId')
  @UseGuards(DisputeOwnershipGuard)
  @ApiOperation({ summary: 'Get dispute details' })
  @ApiResponse({ status: 200, description: 'Dispute details retrieved' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async getDisputeById(@Param('disputeId') disputeId: string, @Request() req) {
    const dispute = await this.disputeService.getDisputeById(disputeId, req.user.id);

    return {
      status: 'success',
      data: {
        dispute: {
          ...dispute,
          timeline: dispute.timeline.map(t => ({
            event_type: t.event_type,
            description: t.description,
            actor_type: t.actor_type,
            created_at: t.created_at,
          })),
        },
      },
    };
  }

  @Patch(':disputeId/withdraw')
  @UseGuards(DisputeOwnershipGuard)
  @ApiOperation({ summary: 'Withdraw dispute' })
  @ApiResponse({ status: 200, description: 'Dispute withdrawn successfully' })
  @ApiResponse({ status: 400, description: 'Dispute cannot be withdrawn' })
  async withdrawDispute(
    @Param('disputeId') disputeId: string,
    @Body() dto: WithdrawDisputeDto,
    @Request() req,
  ) {
    const dispute = await this.disputeService.withdrawDispute(
      disputeId,
      req.user.id,
      dto.reason,
    );

    return {
      status: 'success',
      message: 'Dispute withdrawn successfully',
      data: { dispute },
    };
  }

  @Get(':disputeId/evidence')
  @UseGuards(DisputeOwnershipGuard)
  @ApiOperation({ summary: 'Get dispute evidence files' })
  @ApiResponse({ status: 200, description: 'Evidence files retrieved' })
  async getDisputeEvidence(@Param('disputeId') disputeId: string) {
    const evidence = await this.evidenceService.getDisputeEvidence(disputeId);

    return {
      status: 'success',
      data: { evidence },
    };
  }

  @Get(':disputeId/evidence/:evidenceId/download')
  @UseGuards(DisputeOwnershipGuard)
  @ApiOperation({ summary: 'Get temporary download URL for evidence' })
  @ApiResponse({ status: 200, description: 'Download URL generated' })
  async getEvidenceDownloadUrl(
    @Param('disputeId') disputeId: string,
    @Param('evidenceId') evidenceId: string,
    @Request() req,
  ) {
    const downloadUrl = await this.evidenceService.getEvidenceDownloadUrl(
      evidenceId,
      req.user.id,
    );

    return {
      status: 'success',
      data: {
        download_url: downloadUrl,
        expires_in: 3600, // 1 hour
      },
    };
  }
}
```

**DTOs:**

```typescript
// dto/withdraw-dispute.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDisputeDto {
  @ApiProperty({
    description: 'Reason for withdrawing dispute',
    minLength: 10,
    maxLength: 500,
    example: 'Merchant resolved the issue offline',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason: string;
}
```

### Acceptance Criteria

- [ ] POST /api/v1/disputes endpoint created
- [ ] GET /api/v1/disputes endpoint with filters (status, category, pagination)
- [ ] GET /api/v1/disputes/:disputeId endpoint
- [ ] PATCH /api/v1/disputes/:disputeId/withdraw endpoint
- [ ] GET /api/v1/disputes/:disputeId/evidence endpoint
- [ ] GET /api/v1/disputes/:disputeId/evidence/:evidenceId/download endpoint
- [ ] JWT authentication required on all endpoints
- [ ] Rate limiting on POST /disputes (5 per day)
- [ ] Ownership guard on dispute details/withdrawal
- [ ] Multipart form data support for evidence upload
- [ ] Swagger documentation complete
- [ ] Request validation with class-validator
- [ ] Error responses with proper HTTP status codes
- [ ] Success responses with consistent format

### Testing

```typescript
describe('DisputesController', () => {
  describe('POST /disputes', () => {
    it('should create dispute with valid data');
    it('should upload evidence files');
    it('should enforce rate limiting');
    it('should return 400 for invalid data');
    it('should return 409 for duplicate dispute');
  });

  describe('GET /disputes', () => {
    it('should return user disputes');
    it('should filter by status');
    it('should filter by category');
    it('should paginate results');
  });

  describe('GET /disputes/:id', () => {
    it('should return dispute details with timeline');
    it('should return 403 for non-owner');
    it('should return 404 for invalid ID');
  });

  describe('PATCH /disputes/:id/withdraw', () => {
    it('should withdraw dispute');
    it('should return 400 if already resolved');
  });

  describe('GET /disputes/:id/evidence/:evidenceId/download', () => {
    it('should generate presigned URL');
    it('should enforce ownership');
  });
});
```

### Definition of Done

- [ ] All endpoints implemented
- [ ] Swagger documentation complete
- [ ] Tests passing (12+ tests)
- [ ] Error handling comprehensive
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-16-007: Implement Dispute Notifications

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-16-001
**Sprint:** Sprint 16

### Description

Implement email and SMS notifications for dispute lifecycle events including creation, merchant notification, status updates, and resolution.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/services/dispute-notification.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from '../entities/dispute.entity';
import { User } from '../../users/entities/user.entity';
import { EmailService } from '../../notifications/services/email.service';
import { SMSService } from '../../notifications/services/sms.service';

@Injectable()
export class DisputeNotificationService {
  private readonly logger = new Logger(DisputeNotificationService.name);

  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
    private smsService: SMSService,
  ) {}

  /**
   * Notify customer of dispute creation
   */
  async notifyCustomerDisputeCreated(disputeId: string): Promise<void> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['user', 'transaction'],
    });

    if (!dispute || !dispute.user) {
      this.logger.error(`Dispute or user not found: ${disputeId}`);
      return;
    }

    const emailData = {
      to: dispute.user.email,
      subject: `Dispute Created - ${dispute.dispute_reference}`,
      template: 'dispute-created-customer',
      context: {
        user_name: dispute.user.first_name,
        dispute_reference: dispute.dispute_reference,
        transaction_reference: dispute.transaction.reference,
        category: this.getCategoryLabel(dispute.category),
        disputed_amount: this.formatAmount(dispute.disputed_amount, dispute.transaction.currency),
        merchant_response_deadline: this.formatDate(dispute.merchant_response_deadline),
        sla_deadline: this.formatDate(dispute.sla_deadline),
        expected_resolution_days: 14,
      },
    };

    await this.emailService.sendEmail(emailData);

    // SMS notification
    if (dispute.user.phone) {
      await this.smsService.sendSMS({
        to: dispute.user.phone,
        message: `Your dispute ${dispute.dispute_reference} has been created. We'll investigate and respond within 14 days.`,
      });
    }

    this.logger.log(`Customer notified of dispute creation: ${dispute.dispute_reference}`);
  }

  /**
   * Notify merchant of new dispute
   */
  async notifyMerchantNewDispute(disputeId: string): Promise<void> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['user', 'transaction'],
    });

    if (!dispute || !dispute.merchant_id) {
      return;
    }

    const merchant = await this.userRepository.findOne({
      where: { id: dispute.merchant_id },
    });

    if (!merchant) {
      this.logger.error(`Merchant not found: ${dispute.merchant_id}`);
      return;
    }

    const emailData = {
      to: merchant.email,
      subject: `New Dispute Notification - ${dispute.dispute_reference}`,
      template: 'dispute-new-merchant',
      context: {
        merchant_name: merchant.first_name,
        dispute_reference: dispute.dispute_reference,
        transaction_reference: dispute.transaction.reference,
        category: this.getCategoryLabel(dispute.category),
        customer_description: dispute.description,
        disputed_amount: this.formatAmount(dispute.disputed_amount, dispute.transaction.currency),
        response_deadline: this.formatDate(dispute.merchant_response_deadline),
        days_to_respond: 7,
        action_url: `${process.env.APP_URL}/disputes/${dispute.id}`,
      },
    };

    await this.emailService.sendEmail(emailData);

    // SMS notification
    if (merchant.phone) {
      await this.smsService.sendSMS({
        to: merchant.phone,
        message: `New dispute ${dispute.dispute_reference}. Please respond within 7 days.`,
      });
    }

    // Update merchant_notified_at
    await this.disputeRepository.update(
      { id: disputeId },
      { merchant_notified_at: new Date() },
    );

    this.logger.log(`Merchant notified of new dispute: ${dispute.dispute_reference}`);
  }

  /**
   * Notify customer of status change
   */
  async notifyCustomerStatusChange(
    disputeId: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['user'],
    });

    if (!dispute || !dispute.user) {
      return;
    }

    const statusMessages = {
      under_investigation: 'Your dispute is now under investigation by our team.',
      awaiting_merchant: 'We are awaiting a response from the merchant.',
      merchant_responded: 'The merchant has responded to your dispute.',
      under_review: 'Your dispute is under review. We will reach a decision soon.',
      mediation: 'Your dispute has been escalated to mediation.',
      resolved: 'Your dispute has been resolved.',
    };

    const message = statusMessages[newStatus] || 'Your dispute status has been updated.';

    const emailData = {
      to: dispute.user.email,
      subject: `Dispute Status Update - ${dispute.dispute_reference}`,
      template: 'dispute-status-change',
      context: {
        user_name: dispute.user.first_name,
        dispute_reference: dispute.dispute_reference,
        old_status: this.getStatusLabel(oldStatus),
        new_status: this.getStatusLabel(newStatus),
        message,
        action_url: `${process.env.APP_URL}/disputes/${dispute.id}`,
      },
    };

    await this.emailService.sendEmail(emailData);

    this.logger.log(`Customer notified of status change: ${dispute.dispute_reference} (${oldStatus} → ${newStatus})`);
  }

  /**
   * Notify customer of dispute resolution
   */
  async notifyCustomerResolution(disputeId: string): Promise<void> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['user', 'transaction'],
    });

    if (!dispute || !dispute.user) {
      return;
    }

    const resolutionMessages = {
      favor_customer: 'in your favor. The refund will be processed within 3-5 business days.',
      favor_merchant: 'in favor of the merchant. No refund will be issued.',
      partial_resolution: 'with a partial refund.',
      dismissed: 'dismissed due to insufficient evidence.',
    };

    const outcome = resolutionMessages[dispute.resolution] || 'completed.';

    const emailData = {
      to: dispute.user.email,
      subject: `Dispute Resolved - ${dispute.dispute_reference}`,
      template: 'dispute-resolved-customer',
      context: {
        user_name: dispute.user.first_name,
        dispute_reference: dispute.dispute_reference,
        resolution: this.getResolutionLabel(dispute.resolution),
        outcome,
        resolution_reason: dispute.resolution_reason,
        refund_amount: dispute.actual_resolution_amount
          ? this.formatAmount(dispute.actual_resolution_amount, dispute.transaction.currency)
          : null,
        resolved_at: this.formatDate(dispute.resolved_at),
      },
    };

    await this.emailService.sendEmail(emailData);

    // SMS notification
    if (dispute.user.phone) {
      await this.smsService.sendSMS({
        to: dispute.user.phone,
        message: `Your dispute ${dispute.dispute_reference} has been resolved ${outcome}`,
      });
    }

    this.logger.log(`Customer notified of resolution: ${dispute.dispute_reference}`);
  }

  /**
   * Notify merchant of dispute resolution
   */
  async notifyMerchantResolution(disputeId: string): Promise<void> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['transaction'],
    });

    if (!dispute || !dispute.merchant_id) {
      return;
    }

    const merchant = await this.userRepository.findOne({
      where: { id: dispute.merchant_id },
    });

    if (!merchant) {
      return;
    }

    const emailData = {
      to: merchant.email,
      subject: `Dispute Resolved - ${dispute.dispute_reference}`,
      template: 'dispute-resolved-merchant',
      context: {
        merchant_name: merchant.first_name,
        dispute_reference: dispute.dispute_reference,
        resolution: this.getResolutionLabel(dispute.resolution),
        resolution_reason: dispute.resolution_reason,
        refund_amount: dispute.actual_resolution_amount
          ? this.formatAmount(dispute.actual_resolution_amount, dispute.transaction.currency)
          : null,
      },
    };

    await this.emailService.sendEmail(emailData);

    this.logger.log(`Merchant notified of resolution: ${dispute.dispute_reference}`);
  }

  /**
   * Send SLA breach alert to support team
   */
  async sendSLABreachAlert(disputeId: string): Promise<void> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['user'],
    });

    if (!dispute) {
      return;
    }

    const emailData = {
      to: process.env.SUPPORT_EMAIL,
      subject: `SLA Breach Alert - Dispute ${dispute.dispute_reference}`,
      template: 'dispute-sla-breach',
      context: {
        dispute_reference: dispute.dispute_reference,
        customer_name: `${dispute.user.first_name} ${dispute.user.last_name}`,
        customer_email: dispute.user.email,
        submitted_at: this.formatDate(dispute.submitted_at),
        sla_deadline: this.formatDate(dispute.sla_deadline),
        current_status: this.getStatusLabel(dispute.status),
        action_url: `${process.env.ADMIN_URL}/disputes/${dispute.id}`,
      },
    };

    await this.emailService.sendEmail(emailData);

    this.logger.warn(`SLA breach alert sent for dispute: ${dispute.dispute_reference}`);
  }

  // Helper methods
  private getCategoryLabel(category: string): string {
    const labels = {
      unauthorized: 'Unauthorized Transaction',
      not_received: 'Goods/Services Not Received',
      defective: 'Defective Goods/Services',
      amount_differs: 'Amount Differs from Agreed',
      duplicate: 'Duplicate Charge',
      fraud: 'Fraud/Scam',
      quality_issue: 'Quality Not as Described',
      other: 'Other Issue',
    };
    return labels[category] || category;
  }

  private getStatusLabel(status: string): string {
    const labels = {
      submitted: 'Submitted',
      under_investigation: 'Under Investigation',
      awaiting_merchant: 'Awaiting Merchant Response',
      merchant_responded: 'Merchant Responded',
      under_review: 'Under Review',
      mediation: 'In Mediation',
      resolved: 'Resolved',
      withdrawn: 'Withdrawn',
      closed: 'Closed',
    };
    return labels[status] || status;
  }

  private getResolutionLabel(resolution: string): string {
    const labels = {
      favor_customer: 'Resolved in Customer Favor',
      favor_merchant: 'Resolved in Merchant Favor',
      partial_resolution: 'Partial Resolution',
      dismissed: 'Dismissed',
      withdrawn: 'Withdrawn',
    };
    return labels[resolution] || resolution;
  }

  private formatAmount(amount: number, currency: string): string {
    return `${currency} ${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
```

**Email Templates (Handlebars):**

`templates/emails/dispute-created-customer.hbs`:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
    .content { margin: 20px 0; }
    .footer { margin-top: 30px; font-size: 12px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Dispute Created Successfully</h2>
    </div>
    <div class="content">
      <p>Hi {{user_name}},</p>

      <p>Your dispute has been created with reference: <strong>{{dispute_reference}}</strong></p>

      <p><strong>Dispute Details:</strong></p>
      <ul>
        <li>Transaction: {{transaction_reference}}</li>
        <li>Category: {{category}}</li>
        <li>Amount: {{disputed_amount}}</li>
        <li>Merchant Response Deadline: {{merchant_response_deadline}}</li>
        <li>Expected Resolution: {{expected_resolution_days}} days</li>
      </ul>

      <p>We have notified the merchant and they have 7 days to respond. Our team will investigate and aim to resolve this within 14 days.</p>

      <p>You can track your dispute status in your account dashboard.</p>
    </div>
    <div class="footer">
      <p>Thank you for your patience.</p>
      <p>The Support Team</p>
    </div>
  </div>
</body>
</html>
```

### Acceptance Criteria

- [ ] DisputeNotificationService implemented
- [ ] Customer notification on dispute creation
- [ ] Merchant notification on new dispute
- [ ] Status change notifications
- [ ] Resolution notifications (customer and merchant)
- [ ] SLA breach alerts to support team
- [ ] Email templates created for all events
- [ ] SMS notifications for critical events
- [ ] merchant_notified_at timestamp updated
- [ ] Error handling for failed notifications
- [ ] Retry logic for failed emails
- [ ] Logging for all notifications

### Testing

```typescript
describe('DisputeNotificationService', () => {
  it('should send customer creation email');
  it('should send merchant notification email');
  it('should send status change notification');
  it('should send resolution notification to customer');
  it('should send resolution notification to merchant');
  it('should send SLA breach alert');
  it('should send SMS for critical events');
  it('should update merchant_notified_at timestamp');
  it('should handle email send failures gracefully');
  it('should retry failed notifications');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All email templates created
- [ ] SMS integration working
- [ ] Tests passing (10+ tests)
- [ ] Error handling complete
- [ ] Code reviewed

**Estimated Time:** 4 hours

**Dependencies:**
- Email service (from notifications module)
- SMS service (from notifications module)
- Email templates (Handlebars or similar)

---

## TICKET-16-008: Create Dispute Timeline Tracking

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-16-001
**Sprint:** Sprint 16

### Description

Implement comprehensive timeline tracking system for disputes to maintain complete audit trail of all events, status changes, and actions taken by all parties.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/services/dispute-timeline.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisputeTimeline, TimelineEventType, ActorType } from '../entities/dispute-timeline.entity';
import { Dispute } from '../entities/dispute.entity';

interface CreateTimelineEntryDto {
  dispute_id: string;
  event_type: TimelineEventType;
  description: string;
  actor_id?: string;
  actor_type: ActorType;
  metadata?: Record<string, any>;
}

@Injectable()
export class DisputeTimelineService {
  private readonly logger = new Logger(DisputeTimelineService.name);

  constructor(
    @InjectRepository(DisputeTimeline)
    private timelineRepository: Repository<DisputeTimeline>,
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
  ) {}

  /**
   * Create timeline entry
   */
  async createEntry(dto: CreateTimelineEntryDto): Promise<DisputeTimeline> {
    const entry = await this.timelineRepository.save({
      dispute_id: dto.dispute_id,
      event_type: dto.event_type,
      description: dto.description,
      actor_id: dto.actor_id,
      actor_type: dto.actor_type,
      metadata: dto.metadata,
    });

    this.logger.log(`Timeline entry created for dispute ${dto.dispute_id}: ${dto.event_type}`);

    return entry;
  }

  /**
   * Get timeline for dispute
   */
  async getDisputeTimeline(disputeId: string): Promise<DisputeTimeline[]> {
    return await this.timelineRepository.find({
      where: { dispute_id: disputeId },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Record dispute creation event
   */
  async recordDisputeCreated(
    disputeId: string,
    userId: string,
    category: string,
    transactionRef: string,
  ): Promise<void> {
    await this.createEntry({
      dispute_id: disputeId,
      event_type: TimelineEventType.CREATED,
      description: `Dispute created by customer for ${category}`,
      actor_id: userId,
      actor_type: ActorType.CUSTOMER,
      metadata: {
        category,
        transaction_reference: transactionRef,
      },
    });
  }

  /**
   * Record assignment event
   */
  async recordAssignment(
    disputeId: string,
    agentId: string,
    agentName: string,
    assignedBy: string,
  ): Promise<void> {
    await this.createEntry({
      dispute_id: disputeId,
      event_type: TimelineEventType.ASSIGNED,
      description: `Dispute assigned to ${agentName}`,
      actor_id: assignedBy,
      actor_type: ActorType.SYSTEM,
      metadata: {
        assigned_to: agentId,
        assigned_to_name: agentName,
      },
    });
  }

  /**
   * Record merchant notification
   */
  async recordMerchantNotified(disputeId: string, merchantId: string): Promise<void> {
    await this.createEntry({
      dispute_id: disputeId,
      event_type: TimelineEventType.MERCHANT_NOTIFIED,
      description: 'Merchant notified of dispute',
      actor_type: ActorType.SYSTEM,
      metadata: {
        merchant_id: merchantId,
      },
    });
  }

  /**
   * Record merchant response
   */
  async recordMerchantResponse(
    disputeId: string,
    merchantId: string,
    response: string,
  ): Promise<void> {
    await this.createEntry({
      dispute_id: disputeId,
      event_type: TimelineEventType.MERCHANT_RESPONDED,
      description: 'Merchant submitted response to dispute',
      actor_id: merchantId,
      actor_type: ActorType.MERCHANT,
      metadata: {
        response_preview: response.substring(0, 200),
      },
    });
  }

  /**
   * Record evidence upload
   */
  async recordEvidenceUploaded(
    disputeId: string,
    uploaderId: string,
    uploaderType: ActorType,
    fileName: string,
  ): Promise<void> {
    await this.createEntry({
      dispute_id: disputeId,
      event_type: TimelineEventType.EVIDENCE_UPLOADED,
      description: `Evidence file uploaded: ${fileName}`,
      actor_id: uploaderId,
      actor_type: uploaderType,
      metadata: {
        file_name: fileName,
      },
    });
  }

  /**
   * Record status change
   */
  async recordStatusChange(
    disputeId: string,
    oldStatus: string,
    newStatus: string,
    changedBy: string,
    actorType: ActorType,
    reason?: string,
  ): Promise<void> {
    await this.createEntry({
      dispute_id: disputeId,
      event_type: TimelineEventType.STATUS_CHANGED,
      description: `Status changed from ${oldStatus} to ${newStatus}`,
      actor_id: changedBy,
      actor_type: actorType,
      metadata: {
        old_status: oldStatus,
        new_status: newStatus,
        reason,
      },
    });
  }

  /**
   * Record dispute resolution
   */
  async recordResolution(
    disputeId: string,
    resolution: string,
    resolutionAmount: number,
    resolvedBy: string,
    reason: string,
  ): Promise<void> {
    await this.createEntry({
      dispute_id: disputeId,
      event_type: TimelineEventType.RESOLVED,
      description: `Dispute resolved: ${resolution}`,
      actor_id: resolvedBy,
      actor_type: ActorType.SUPPORT,
      metadata: {
        resolution,
        resolution_amount: resolutionAmount,
        reason,
      },
    });
  }

  /**
   * Record dispute closure
   */
  async recordClosure(
    disputeId: string,
    closedBy: string,
    actorType: ActorType,
  ): Promise<void> {
    await this.createEntry({
      dispute_id: disputeId,
      event_type: TimelineEventType.CLOSED,
      description: 'Dispute closed',
      actor_id: closedBy,
      actor_type: actorType,
    });
  }

  /**
   * Get timeline statistics
   */
  async getTimelineStats(disputeId: string): Promise<{
    total_events: number;
    events_by_type: Record<string, number>;
    events_by_actor: Record<string, number>;
    first_event: Date;
    last_event: Date;
  }> {
    const timeline = await this.getDisputeTimeline(disputeId);

    const eventsByType = timeline.reduce((acc, entry) => {
      acc[entry.event_type] = (acc[entry.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByActor = timeline.reduce((acc, entry) => {
      acc[entry.actor_type] = (acc[entry.actor_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_events: timeline.length,
      events_by_type: eventsByType,
      events_by_actor: eventsByActor,
      first_event: timeline[0]?.created_at,
      last_event: timeline[timeline.length - 1]?.created_at,
    };
  }
}
```

### Acceptance Criteria

- [ ] DisputeTimelineService implemented
- [ ] Create timeline entry method
- [ ] Get dispute timeline method (ordered by created_at ASC)
- [ ] Record dispute creation event
- [ ] Record assignment event
- [ ] Record merchant notification event
- [ ] Record merchant response event
- [ ] Record evidence upload event
- [ ] Record status change event
- [ ] Record resolution event
- [ ] Record closure event
- [ ] Timeline statistics method
- [ ] All events include actor information
- [ ] Metadata stored in JSONB for flexibility
- [ ] Timeline immutable (no update/delete methods)
- [ ] Logging for audit trail

### Testing

```typescript
describe('DisputeTimelineService', () => {
  it('should create timeline entry');
  it('should get dispute timeline ordered by date');
  it('should record dispute creation');
  it('should record assignment');
  it('should record merchant notification');
  it('should record merchant response');
  it('should record evidence upload');
  it('should record status change with reason');
  it('should record resolution with metadata');
  it('should record closure');
  it('should calculate timeline statistics');
  it('should track events by type');
  it('should track events by actor');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All event recording methods working
- [ ] Tests passing (13+ tests)
- [ ] Timeline immutability enforced
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-16-009: Dispute Investigation & Resolution

**Type:** User Story
**Story Points:** 15
**Priority:** P0
**Epic:** EPIC-10 (Refunds & Disputes)
**Sprint:** Sprint 16

### Description

As a support agent, I want to investigate and resolve disputes fairly, so that customer satisfaction is maintained while protecting merchant interests.

### Business Value

Effective dispute investigation and resolution is critical for:
- Maintaining platform trust and credibility
- Reducing chargeback rates (industry avg: 0.9%, target: < 0.5%)
- Protecting both customer and merchant interests
- Regulatory compliance (payment network rules)
- Minimizing financial losses

**Success Metrics:**
- 90%+ disputes resolved within SLA (14 days)
- 85%+ customer satisfaction with resolution
- 80%+ merchant satisfaction with fairness
- < 5% escalation to mediation
- 95%+ resolution accuracy (minimal appeals)

### Acceptance Criteria

**Investigation Workflow:**
- [ ] Support agents can view pending disputes
- [ ] Auto-assignment to available agents (round-robin or workload-based)
- [ ] Manual reassignment by supervisors
- [ ] View complete dispute details (transaction, evidence, timeline)
- [ ] View merchant response and counter-evidence
- [ ] Add internal investigation notes (not visible to customer/merchant)
- [ ] Request additional evidence from customer or merchant
- [ ] Set investigation deadlines (configurable per case)
- [ ] Escalate complex cases to senior agents or mediation

**Merchant Response System:**
- [ ] Merchant receives dispute notification via email/SMS
- [ ] 7-day response window (configurable)
- [ ] Merchant can upload counter-evidence (up to 10 files)
- [ ] Merchant can accept or reject claim
- [ ] Merchant can propose alternative resolution
- [ ] Auto-escalation if merchant doesn't respond within deadline
- [ ] merchant_responded_at timestamp tracked

**Resolution Engine:**
- [ ] Support agent can resolve dispute with outcome:
  - Favor customer (full refund)
  - Favor merchant (no refund)
  - Partial resolution (split amount)
  - Insufficient evidence (dismiss)
- [ ] Resolution amount validation (0 to disputed_amount)
- [ ] Mandatory resolution reason (min 100 chars)
- [ ] Resolution triggers automatic refund (if applicable)
- [ ] Resolution notifies both parties via email/SMS
- [ ] Resolution creates ledger entries for refund
- [ ] Resolution updates transaction status
- [ ] Resolution marks dispute as resolved
- [ ] resolved_at timestamp recorded

**Security Requirements:**
- [ ] Only assigned agent or supervisor can resolve
- [ ] Resolution requires 2FA for high-value disputes (> ₦100K)
- [ ] Complete audit trail of all investigation actions
- [ ] Internal notes encrypted at rest
- [ ] Role-based access control (agent, supervisor, admin)

**Non-Functional Requirements:**
- [ ] Resolution processing time < 3 seconds
- [ ] Support 100+ concurrent investigations
- [ ] SLA breach alerts 24 hours before deadline
- [ ] Dashboard showing workload per agent
- [ ] Dispute aging report (> 7 days, > 10 days, > 14 days)

### API Specifications

**Endpoint:** POST /api/v1/disputes/:disputeId/assign

**Request:**
```json
{
  "agent_id": "uuid"
}
```

**Endpoint:** POST /api/v1/disputes/:disputeId/resolve

**Request:**
```json
{
  "resolution": "favor_customer",
  "resolution_amount": 5000000,
  "resolution_reason": "After reviewing evidence, customer provided proof of non-delivery with tracking showing package never reached destination. Merchant failed to respond within 7-day window.",
  "internal_notes": "Verified tracking number with courier. Merchant has pattern of non-response."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Dispute resolved successfully. Refund processed.",
  "data": {
    "dispute": {
      "id": "uuid",
      "dispute_reference": "DSP-20250115-A3F5K9",
      "status": "resolved",
      "resolution": "favor_customer",
      "resolution_amount": 5000000,
      "resolved_at": "2025-01-20T14:30:00Z",
      "refund_reference": "RFD-20250120-B4K7M2"
    }
  }
}
```

### Subtasks

- [ ] TICKET-16-010: Create Investigation Workflow
- [ ] TICKET-16-011: Implement Assignment System
- [ ] TICKET-16-012: Create Merchant Response System
- [ ] TICKET-16-013: Implement Resolution Engine
- [ ] TICKET-16-014: Create Mediation System
- [ ] TICKET-16-015: Implement Internal Notes
- [ ] TICKET-16-016: Create Admin Dashboard

### Testing Requirements

**Unit Tests (30 tests):**
- Assignment logic (auto and manual)
- Merchant response validation
- Resolution amount validation
- Resolution reason validation
- Refund trigger on resolution
- Status transitions
- SLA calculations

**Integration Tests (15 tests):**
- Full investigation workflow
- Merchant response flow
- Resolution with refund processing
- Notification delivery
- Ledger entry creation

**Security Tests (8 tests):**
- Role-based access control
- 2FA enforcement for high-value
- Internal notes encryption
- Audit trail completeness

**E2E Tests (6 tests):**
- Complete dispute lifecycle (creation → investigation → resolution)
- Merchant response acceptance
- Escalation to mediation
- SLA breach handling

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Tests passing (59+ tests)
- [ ] Code coverage ≥ 85%
- [ ] SLA monitoring working
- [ ] Refund integration tested
- [ ] Notifications working
- [ ] Code reviewed and merged

---

## TICKET-16-010: Create Investigation Workflow

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-16-009
**Sprint:** Sprint 16

### Description

Implement investigation workflow service with assignment logic, workload tracking, SLA monitoring, and escalation capabilities.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/services/investigation.service.ts`

```typescript
import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute, DisputeStatus } from '../entities/dispute.entity';
import { User } from '../../users/entities/user.entity';
import { DisputeTimelineService } from './dispute-timeline.service';
import { addDays } from 'date-fns';

@Injectable()
export class InvestigationService {
  private readonly logger = new Logger(InvestigationService.name);

  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private timelineService: DisputeTimelineService,
  ) {}

  /**
   * Auto-assign dispute to available agent
   */
  async autoAssignDispute(disputeId: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    if (dispute.assigned_to) {
      throw new BadRequestException('Dispute already assigned');
    }

    // Get agents with support role
    const agents = await this.userRepository.find({
      where: { role: 'support', is_active: true } as any,
    });

    if (agents.length === 0) {
      throw new BadRequestException('No available agents');
    }

    // Get agent workload (number of assigned open disputes)
    const workloads = await Promise.all(
      agents.map(async agent => {
        const count = await this.disputeRepository.count({
          where: {
            assigned_to: agent.id,
            status: {
              $in: [
                DisputeStatus.UNDER_INVESTIGATION,
                DisputeStatus.AWAITING_MERCHANT,
                DisputeStatus.UNDER_REVIEW,
              ],
            } as any,
          },
        });
        return { agent, workload: count };
      })
    );

    // Assign to agent with lowest workload
    workloads.sort((a, b) => a.workload - b.workload);
    const selectedAgent = workloads[0].agent;

    // Update dispute
    dispute.assigned_to = selectedAgent.id;
    dispute.status = DisputeStatus.UNDER_INVESTIGATION;
    await this.disputeRepository.save(dispute);

    // Record in timeline
    await this.timelineService.recordAssignment(
      disputeId,
      selectedAgent.id,
      `${selectedAgent.first_name} ${selectedAgent.last_name}`,
      'system',
    );

    this.logger.log(
      `Dispute ${dispute.dispute_reference} auto-assigned to agent ${selectedAgent.id} (workload: ${workloads[0].workload})`
    );

    return dispute;
  }

  /**
   * Manually assign dispute to specific agent
   */
  async assignDispute(
    disputeId: string,
    agentId: string,
    assignedBy: string,
  ): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    const agent = await this.userRepository.findOne({
      where: { id: agentId, role: 'support' } as any,
    });

    if (!agent) {
      throw new BadRequestException('Agent not found or not a support agent');
    }

    // Update dispute
    dispute.assigned_to = agentId;
    if (dispute.status === DisputeStatus.SUBMITTED) {
      dispute.status = DisputeStatus.UNDER_INVESTIGATION;
    }
    await this.disputeRepository.save(dispute);

    // Record in timeline
    await this.timelineService.recordAssignment(
      disputeId,
      agentId,
      `${agent.first_name} ${agent.last_name}`,
      assignedBy,
    );

    this.logger.log(`Dispute ${dispute.dispute_reference} assigned to agent ${agentId}`);

    return dispute;
  }

  /**
   * Reassign dispute to different agent
   */
  async reassignDispute(
    disputeId: string,
    newAgentId: string,
    reassignedBy: string,
    reason: string,
  ): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    const newAgent = await this.userRepository.findOne({
      where: { id: newAgentId, role: 'support' } as any,
    });

    if (!newAgent) {
      throw new BadRequestException('New agent not found');
    }

    const oldAgentId = dispute.assigned_to;

    // Update assignment
    dispute.assigned_to = newAgentId;
    await this.disputeRepository.save(dispute);

    // Record in timeline
    await this.timelineService.createEntry({
      dispute_id: disputeId,
      event_type: 'assigned' as any,
      description: `Dispute reassigned to ${newAgent.first_name} ${newAgent.last_name}. Reason: ${reason}`,
      actor_id: reassignedBy,
      actor_type: 'support' as any,
      metadata: {
        old_agent_id: oldAgentId,
        new_agent_id: newAgentId,
        reason,
      },
    });

    this.logger.log(`Dispute ${dispute.dispute_reference} reassigned from ${oldAgentId} to ${newAgentId}`);

    return dispute;
  }

  /**
   * Get agent workload
   */
  async getAgentWorkload(agentId: string): Promise<{
    total: number;
    by_status: Record<string, number>;
    aging: {
      under_7_days: number;
      between_7_10_days: number;
      over_10_days: number;
    };
  }> {
    const disputes = await this.disputeRepository.find({
      where: {
        assigned_to: agentId,
        status: {
          $in: [
            DisputeStatus.UNDER_INVESTIGATION,
            DisputeStatus.AWAITING_MERCHANT,
            DisputeStatus.UNDER_REVIEW,
          ],
        } as any,
      },
    });

    const byStatus = disputes.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const now = new Date();
    const aging = disputes.reduce(
      (acc, d) => {
        const ageInDays = Math.floor(
          (now.getTime() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (ageInDays < 7) acc.under_7_days++;
        else if (ageInDays <= 10) acc.between_7_10_days++;
        else acc.over_10_days++;

        return acc;
      },
      { under_7_days: 0, between_7_10_days: 0, over_10_days: 0 }
    );

    return {
      total: disputes.length,
      by_status: byStatus,
      aging,
    };
  }

  /**
   * Get disputes nearing SLA breach
   */
  async getDisputesNearingSLA(hoursBeforeBreach: number = 24): Promise<Dispute[]> {
    const threshold = addDays(new Date(), hoursBeforeBreach / 24);

    return await this.disputeRepository
      .createQueryBuilder('dispute')
      .where('dispute.status NOT IN (:...resolvedStatuses)', {
        resolvedStatuses: [DisputeStatus.RESOLVED, DisputeStatus.CLOSED, DisputeStatus.WITHDRAWN],
      })
      .andWhere('dispute.sla_deadline <= :threshold', { threshold })
      .andWhere('dispute.sla_deadline > :now', { now: new Date() })
      .orderBy('dispute.sla_deadline', 'ASC')
      .getMany();
  }

  /**
   * Escalate dispute to senior agent or mediation
   */
  async escalateDispute(
    disputeId: string,
    escalatedBy: string,
    reason: string,
    escalateTo?: string,
  ): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    // If escalateTo provided, reassign to that agent
    if (escalateTo) {
      await this.reassignDispute(disputeId, escalateTo, escalatedBy, `Escalated: ${reason}`);
    }

    // Update status to mediation if no specific agent
    if (!escalateTo) {
      dispute.status = DisputeStatus.MEDIATION;
      await this.disputeRepository.save(dispute);
    }

    // Record escalation
    await this.timelineService.createEntry({
      dispute_id: disputeId,
      event_type: 'status_changed' as any,
      description: `Dispute escalated. Reason: ${reason}`,
      actor_id: escalatedBy,
      actor_type: 'support' as any,
      metadata: {
        escalated_to: escalateTo,
        reason,
      },
    });

    this.logger.log(`Dispute ${dispute.dispute_reference} escalated by ${escalatedBy}`);

    return dispute;
  }

  /**
   * Request additional evidence from customer or merchant
   */
  async requestAdditionalEvidence(
    disputeId: string,
    requestedFrom: 'customer' | 'merchant',
    requestDetails: string,
    requestedBy: string,
  ): Promise<void> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    // Record in timeline
    await this.timelineService.createEntry({
      dispute_id: disputeId,
      event_type: 'status_changed' as any,
      description: `Additional evidence requested from ${requestedFrom}`,
      actor_id: requestedBy,
      actor_type: 'support' as any,
      metadata: {
        requested_from: requestedFrom,
        request_details: requestDetails,
      },
    });

    // TODO: Send notification to customer/merchant

    this.logger.log(`Additional evidence requested for dispute ${dispute.dispute_reference} from ${requestedFrom}`);
  }
}
```

### Acceptance Criteria

- [ ] InvestigationService implemented
- [ ] Auto-assignment with workload balancing (round-robin)
- [ ] Manual assignment to specific agent
- [ ] Reassignment with reason tracking
- [ ] Agent workload calculation (total, by status, aging)
- [ ] Disputes nearing SLA method
- [ ] Escalation to senior agent or mediation
- [ ] Request additional evidence
- [ ] Only support agents can be assigned
- [ ] Timeline entries for all actions
- [ ] Logging for audit trail

### Testing

```typescript
describe('InvestigationService', () => {
  it('should auto-assign to agent with lowest workload');
  it('should manually assign to specific agent');
  it('should reassign with reason');
  it('should calculate agent workload correctly');
  it('should get disputes nearing SLA');
  it('should escalate to mediation');
  it('should escalate to senior agent');
  it('should request additional evidence');
  it('should prevent assignment to non-support users');
  it('should create timeline entries for all actions');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All assignment methods working
- [ ] Tests passing (10+ tests)
- [ ] Workload balancing verified
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-16-011: Implement Assignment System

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-16-009
**Sprint:** Sprint 16

### Description

Create API endpoints and admin interface for dispute assignment, reassignment, and workload management.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/controllers/investigation.controller.ts`

```typescript
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { InvestigationService } from '../services/investigation.service';
import { AssignDisputeDto, ReassignDisputeDto, EscalateDisputeDto } from '../dto/investigation.dto';

@ApiTags('Dispute Investigation')
@Controller('api/v1/disputes/investigation')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvestigationController {
  constructor(private investigationService: InvestigationService) {}

  @Post(':disputeId/assign')
  @Roles('support', 'admin')
  @ApiOperation({ summary: 'Assign dispute to agent' })
  @ApiResponse({ status: 200, description: 'Dispute assigned successfully' })
  async assignDispute(
    @Param('disputeId') disputeId: string,
    @Body() dto: AssignDisputeDto,
    @Request() req,
  ) {
    const dispute = await this.investigationService.assignDispute(
      disputeId,
      dto.agent_id,
      req.user.id,
    );

    return {
      status: 'success',
      message: 'Dispute assigned successfully',
      data: { dispute },
    };
  }

  @Post(':disputeId/auto-assign')
  @Roles('admin')
  @ApiOperation({ summary: 'Auto-assign dispute to available agent' })
  @ApiResponse({ status: 200, description: 'Dispute auto-assigned successfully' })
  async autoAssignDispute(@Param('disputeId') disputeId: string) {
    const dispute = await this.investigationService.autoAssignDispute(disputeId);

    return {
      status: 'success',
      message: 'Dispute auto-assigned successfully',
      data: { dispute },
    };
  }

  @Patch(':disputeId/reassign')
  @Roles('admin')
  @ApiOperation({ summary: 'Reassign dispute to different agent' })
  @ApiResponse({ status: 200, description: 'Dispute reassigned successfully' })
  async reassignDispute(
    @Param('disputeId') disputeId: string,
    @Body() dto: ReassignDisputeDto,
    @Request() req,
  ) {
    const dispute = await this.investigationService.reassignDispute(
      disputeId,
      dto.new_agent_id,
      req.user.id,
      dto.reason,
    );

    return {
      status: 'success',
      message: 'Dispute reassigned successfully',
      data: { dispute },
    };
  }

  @Get('workload/:agentId')
  @Roles('support', 'admin')
  @ApiOperation({ summary: 'Get agent workload' })
  @ApiResponse({ status: 200, description: 'Agent workload retrieved' })
  async getAgentWorkload(@Param('agentId') agentId: string) {
    const workload = await this.investigationService.getAgentWorkload(agentId);

    return {
      status: 'success',
      data: { workload },
    };
  }

  @Get('sla-alerts')
  @Roles('support', 'admin')
  @ApiOperation({ summary: 'Get disputes nearing SLA breach' })
  @ApiResponse({ status: 200, description: 'SLA alerts retrieved' })
  async getSLAAlerts(@Query('hours') hours?: number) {
    const disputes = await this.investigationService.getDisputesNearingSLA(
      hours ? Number(hours) : 24
    );

    return {
      status: 'success',
      data: {
        disputes,
        total: disputes.length,
      },
    };
  }

  @Post(':disputeId/escalate')
  @Roles('support', 'admin')
  @ApiOperation({ summary: 'Escalate dispute to mediation or senior agent' })
  @ApiResponse({ status: 200, description: 'Dispute escalated successfully' })
  async escalateDispute(
    @Param('disputeId') disputeId: string,
    @Body() dto: EscalateDisputeDto,
    @Request() req,
  ) {
    const dispute = await this.investigationService.escalateDispute(
      disputeId,
      req.user.id,
      dto.reason,
      dto.escalate_to,
    );

    return {
      status: 'success',
      message: 'Dispute escalated successfully',
      data: { dispute },
    };
  }
}
```

**DTOs:**

```typescript
// dto/investigation.dto.ts
import { IsUUID, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignDisputeDto {
  @ApiProperty({ description: 'Agent ID to assign dispute to' })
  @IsUUID('4')
  agent_id: string;
}

export class ReassignDisputeDto {
  @ApiProperty({ description: 'New agent ID' })
  @IsUUID('4')
  new_agent_id: string;

  @ApiProperty({ description: 'Reason for reassignment', minLength: 10, maxLength: 500 })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason: string;
}

export class EscalateDisputeDto {
  @ApiProperty({ description: 'Reason for escalation', minLength: 20, maxLength: 1000 })
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  reason: string;

  @ApiProperty({ description: 'Senior agent ID (optional, escalates to mediation if not provided)', required: false })
  @IsOptional()
  @IsUUID('4')
  escalate_to?: string;
}
```

### Acceptance Criteria

- [ ] POST /api/v1/disputes/investigation/:disputeId/assign endpoint
- [ ] POST /api/v1/disputes/investigation/:disputeId/auto-assign endpoint
- [ ] PATCH /api/v1/disputes/investigation/:disputeId/reassign endpoint
- [ ] GET /api/v1/disputes/investigation/workload/:agentId endpoint
- [ ] GET /api/v1/disputes/investigation/sla-alerts endpoint
- [ ] POST /api/v1/disputes/investigation/:disputeId/escalate endpoint
- [ ] Role-based access control (support, admin)
- [ ] Swagger documentation complete
- [ ] DTO validation working
- [ ] Error handling comprehensive

### Testing

```typescript
describe('InvestigationController', () => {
  it('should assign dispute to agent');
  it('should auto-assign dispute');
  it('should reassign dispute with reason');
  it('should get agent workload');
  it('should get SLA alerts');
  it('should escalate dispute');
  it('should enforce role-based access');
  it('should validate request data');
});
```

### Definition of Done

- [ ] All endpoints implemented
- [ ] Tests passing (8+ tests)
- [ ] Role-based access working
- [ ] Swagger docs complete
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-16-012: Create Merchant Response System

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-16-009
**Sprint:** Sprint 16

### Description

Implement merchant response system allowing merchants to respond to disputes, upload counter-evidence, and propose resolutions within the 7-day response window.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/services/merchant-response.service.ts`

```typescript
import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute, DisputeStatus } from '../entities/dispute.entity';
import { DisputeTimelineService } from './dispute-timeline.service';
import { EvidenceUploadService } from './evidence-upload.service';
import { addDays } from 'date-fns';

interface MerchantResponseDto {
  response_type: 'accept' | 'reject' | 'propose_alternative';
  response_text: string;
  proposed_amount?: number;
  evidence_files?: Express.Multer.File[];
}

@Injectable()
export class MerchantResponseService {
  private readonly logger = new Logger(MerchantResponseService.name);

  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    private timelineService: DisputeTimelineService,
    private evidenceService: EvidenceUploadService,
  ) {}

  /**
   * Submit merchant response to dispute
   */
  async submitResponse(
    disputeId: string,
    merchantId: string,
    dto: MerchantResponseDto,
  ): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['transaction'],
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    // Verify merchant ownership
    if (dispute.merchant_id !== merchantId) {
      throw new ForbiddenException('You are not the merchant for this dispute');
    }

    // Check response window
    if (new Date() > new Date(dispute.merchant_response_deadline)) {
      throw new BadRequestException('Response window expired');
    }

    // Check if already responded
    if (dispute.merchant_responded_at) {
      throw new BadRequestException('You have already responded to this dispute');
    }

    // Validate response
    this.validateResponse(dto, dispute);

    // Update dispute
    dispute.status = DisputeStatus.MERCHANT_RESPONDED;
    dispute.merchant_responded_at = new Date();

    // Store response in metadata (or create separate table if needed)
    await this.disputeRepository.save(dispute);

    // Upload counter-evidence if provided
    if (dto.evidence_files && dto.evidence_files.length > 0) {
      for (const file of dto.evidence_files) {
        await this.evidenceService.uploadEvidence({
          dispute_id: disputeId,
          file,
          uploaded_by: merchantId,
          uploader_type: 'merchant' as any,
        });
      }
    }

    // Record in timeline
    await this.timelineService.recordMerchantResponse(
      disputeId,
      merchantId,
      dto.response_text,
    );

    this.logger.log(`Merchant response submitted for dispute ${dispute.dispute_reference}`);

    return dispute;
  }

  /**
   * Validate merchant response
   */
  private validateResponse(dto: MerchantResponseDto, dispute: Dispute): void {
    // Response text required (min 50 chars)
    if (!dto.response_text || dto.response_text.trim().length < 50) {
      throw new BadRequestException('Response text must be at least 50 characters');
    }

    if (dto.response_text.length > 2000) {
      throw new BadRequestException('Response text cannot exceed 2000 characters');
    }

    // If proposing alternative, amount must be provided
    if (dto.response_type === 'propose_alternative') {
      if (!dto.proposed_amount) {
        throw new BadRequestException('Proposed amount required for alternative resolution');
      }

      if (dto.proposed_amount <= 0 || dto.proposed_amount > dispute.disputed_amount) {
        throw new BadRequestException(
          'Proposed amount must be between 0 and disputed amount'
        );
      }
    }

    // Limit counter-evidence files
    if (dto.evidence_files && dto.evidence_files.length > 10) {
      throw new BadRequestException('Maximum 10 counter-evidence files allowed');
    }
  }

  /**
   * Get merchant response by dispute ID
   */
  async getMerchantResponse(disputeId: string): Promise<any> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    if (!dispute || !dispute.merchant_responded_at) {
      return null;
    }

    // Retrieve response from timeline or separate table
    const timeline = await this.timelineService.getDisputeTimeline(disputeId);
    const responseEvent = timeline.find(t => t.event_type === 'merchant_responded' as any);

    return {
      responded_at: dispute.merchant_responded_at,
      response_preview: responseEvent?.metadata?.response_preview,
    };
  }

  /**
   * Check if merchant response deadline passed
   */
  async checkResponseDeadlines(): Promise<Dispute[]> {
    const expiredDisputes = await this.disputeRepository.find({
      where: {
        status: DisputeStatus.AWAITING_MERCHANT,
        merchant_responded_at: null,
        merchant_response_deadline: {
          $lt: new Date(),
        } as any,
      },
    });

    // Auto-escalate expired disputes
    for (const dispute of expiredDisputes) {
      dispute.status = DisputeStatus.UNDER_REVIEW;
      await this.disputeRepository.save(dispute);

      await this.timelineService.createEntry({
        dispute_id: dispute.id,
        event_type: 'status_changed' as any,
        description: 'Merchant failed to respond within 7-day window. Auto-escalated to review.',
        actor_type: 'system' as any,
      });

      this.logger.warn(`Dispute ${dispute.dispute_reference} auto-escalated - merchant no response`);
    }

    return expiredDisputes;
  }
}
```

**Controller Endpoint:**

```typescript
@Post(':disputeId/merchant-response')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FilesInterceptor('evidence', 10))
@ApiOperation({ summary: 'Submit merchant response to dispute' })
async submitMerchantResponse(
  @Param('disputeId') disputeId: string,
  @Body() dto: MerchantResponseDto,
  @UploadedFiles() evidenceFiles: Express.Multer.File[],
  @Request() req,
) {
  dto.evidence_files = evidenceFiles;

  const dispute = await this.merchantResponseService.submitResponse(
    disputeId,
    req.user.id,
    dto,
  );

  return {
    status: 'success',
    message: 'Response submitted successfully',
    data: { dispute },
  };
}
```

### Acceptance Criteria

- [ ] MerchantResponseService implemented
- [ ] Submit merchant response method
- [ ] Response types: accept, reject, propose_alternative
- [ ] Response text validation (50-2000 chars)
- [ ] Counter-evidence upload (up to 10 files)
- [ ] Proposed amount validation
- [ ] merchant_responded_at timestamp tracking
- [ ] Response deadline enforcement (7 days)
- [ ] Auto-escalation for expired deadlines
- [ ] Timeline entry creation
- [ ] Ownership verification (only merchant can respond)
- [ ] Prevent duplicate responses

### Testing

```typescript
describe('MerchantResponseService', () => {
  it('should submit merchant response');
  it('should accept claim');
  it('should reject claim');
  it('should propose alternative resolution');
  it('should upload counter-evidence');
  it('should enforce response deadline');
  it('should prevent duplicate responses');
  it('should auto-escalate expired responses');
  it('should validate response text length');
  it('should validate proposed amount');
  it('should enforce ownership');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] Response validation working
- [ ] Auto-escalation tested
- [ ] Tests passing (11+ tests)
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-16-013: Implement Resolution Engine

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-16-009
**Sprint:** Sprint 16

### Description

Implement resolution engine that processes dispute outcomes, triggers refunds, updates ledger, and notifies all parties.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/services/resolution.service.ts`

```typescript
import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Dispute, DisputeStatus, DisputeResolution } from '../entities/dispute.entity';
import { RefundService } from '../../refunds/services/refund.service';
import { LedgerService } from '../../ledger/services/ledger.service';
import { DisputeTimelineService } from './dispute-timeline.service';
import { DisputeNotificationService } from './dispute-notification.service';

interface ResolveDisputeDto {
  resolution: DisputeResolution;
  resolution_amount: number;
  resolution_reason: string;
  internal_notes?: string;
}

@Injectable()
export class ResolutionService {
  private readonly logger = new Logger(ResolutionService.name);

  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    private refundService: RefundService,
    private ledgerService: LedgerService,
    private timelineService: DisputeTimelineService,
    private notificationService: DisputeNotificationService,
    private dataSource: DataSource,
  ) {}

  /**
   * Resolve dispute
   */
  async resolveDispute(
    disputeId: string,
    resolvedBy: string,
    dto: ResolveDisputeDto,
  ): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['transaction', 'user'],
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    // Verify dispute is in resolvable state
    if ([DisputeStatus.RESOLVED, DisputeStatus.CLOSED, DisputeStatus.WITHDRAWN].includes(dispute.status)) {
      throw new BadRequestException('Dispute already resolved or closed');
    }

    // Validate resolution
    this.validateResolution(dto, dispute);

    // Start database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update dispute
      dispute.status = DisputeStatus.RESOLVED;
      dispute.resolution = dto.resolution;
      dispute.actual_resolution_amount = dto.resolution_amount;
      dispute.resolution_reason = dto.resolution_reason;
      dispute.resolved_at = new Date();

      await queryRunner.manager.save(Dispute, dispute);

      // Process refund if applicable
      let refundReference = null;
      if (dto.resolution_amount > 0 && [DisputeResolution.FAVOR_CUSTOMER, DisputeResolution.PARTIAL_RESOLUTION].includes(dto.resolution)) {
        const refund = await this.processRefund(
          queryRunner,
          dispute,
          dto.resolution_amount,
          dto.resolution_reason,
        );
        refundReference = refund.refund_reference;
      }

      // Record in timeline
      await queryRunner.manager.save('DisputeTimeline', {
        dispute_id: disputeId,
        event_type: 'resolved',
        description: `Dispute resolved: ${dto.resolution}`,
        actor_id: resolvedBy,
        actor_type: 'support',
        metadata: {
          resolution: dto.resolution,
          resolution_amount: dto.resolution_amount,
          reason: dto.resolution_reason,
          refund_reference: refundReference,
        },
      });

      // Commit transaction
      await queryRunner.commitTransaction();

      // Send notifications (async)
      this.sendResolutionNotifications(disputeId).catch(err => {
        this.logger.error(`Failed to send resolution notifications for ${disputeId}:`, err);
      });

      this.logger.log(`Dispute ${dispute.dispute_reference} resolved: ${dto.resolution}`);

      return dispute;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to resolve dispute ${disputeId}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Validate resolution
   */
  private validateResolution(dto: ResolveDisputeDto, dispute: Dispute): void {
    // Resolution reason required (min 100 chars for audit trail)
    if (!dto.resolution_reason || dto.resolution_reason.trim().length < 100) {
      throw new BadRequestException('Resolution reason must be at least 100 characters for audit trail');
    }

    if (dto.resolution_reason.length > 2000) {
      throw new BadRequestException('Resolution reason cannot exceed 2000 characters');
    }

    // Validate resolution amount
    if (dto.resolution_amount < 0 || dto.resolution_amount > dispute.disputed_amount) {
      throw new BadRequestException(
        `Resolution amount must be between 0 and disputed amount (${dispute.disputed_amount})`
      );
    }

    // If favor_merchant or dismissed, amount should be 0
    if ([DisputeResolution.FAVOR_MERCHANT, DisputeResolution.DISMISSED].includes(dto.resolution)) {
      if (dto.resolution_amount !== 0) {
        throw new BadRequestException('Resolution amount must be 0 for favor_merchant or dismissed');
      }
    }

    // If favor_customer, amount should equal disputed_amount
    if (dto.resolution === DisputeResolution.FAVOR_CUSTOMER) {
      if (dto.resolution_amount !== dispute.disputed_amount) {
        throw new BadRequestException('Resolution amount must equal disputed amount for favor_customer');
      }
    }

    // If partial_resolution, amount should be > 0 and < disputed_amount
    if (dto.resolution === DisputeResolution.PARTIAL_RESOLUTION) {
      if (dto.resolution_amount <= 0 || dto.resolution_amount >= dispute.disputed_amount) {
        throw new BadRequestException('Partial resolution amount must be between 0 and disputed amount');
      }
    }
  }

  /**
   * Process refund for resolved dispute
   */
  private async processRefund(
    queryRunner: any,
    dispute: Dispute,
    amount: number,
    reason: string,
  ): Promise<any> {
    // Create refund via RefundService
    const refund = await this.refundService.createRefund({
      transaction_id: dispute.transaction_id,
      amount,
      reason: `Dispute resolution: ${reason}`,
      refund_type: 'dispute_resolution',
      requested_by: dispute.user_id,
    });

    // Process refund (credit wallet, create ledger entries)
    await this.refundService.processRefund(refund.id);

    return refund;
  }

  /**
   * Send resolution notifications
   */
  private async sendResolutionNotifications(disputeId: string): Promise<void> {
    // Notify customer
    await this.notificationService.notifyCustomerResolution(disputeId);

    // Notify merchant
    await this.notificationService.notifyMerchantResolution(disputeId);
  }

  /**
   * Close resolved dispute
   */
  async closeDispute(disputeId: string, closedBy: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.RESOLVED) {
      throw new BadRequestException('Only resolved disputes can be closed');
    }

    dispute.status = DisputeStatus.CLOSED;
    await this.disputeRepository.save(dispute);

    // Record in timeline
    await this.timelineService.recordClosure(disputeId, closedBy, 'support' as any);

    this.logger.log(`Dispute ${dispute.dispute_reference} closed`);

    return dispute;
  }
}
```

### Acceptance Criteria

- [ ] ResolutionService implemented
- [ ] Resolve dispute method with database transaction
- [ ] Resolution validation (amount, reason length)
- [ ] Refund processing for favor_customer and partial_resolution
- [ ] Ledger entry creation via RefundService
- [ ] Resolution notifications (customer and merchant)
- [ ] Timeline entry creation
- [ ] Close dispute method
- [ ] Error handling with rollback
- [ ] resolved_at timestamp tracking
- [ ] Support for all resolution types (favor_customer, favor_merchant, partial_resolution, dismissed)

### Testing

```typescript
describe('ResolutionService', () => {
  it('should resolve dispute with favor_customer');
  it('should resolve dispute with favor_merchant');
  it('should resolve dispute with partial_resolution');
  it('should resolve dispute as dismissed');
  it('should process refund for favor_customer');
  it('should process partial refund');
  it('should validate resolution amount');
  it('should validate resolution reason length (min 100 chars)');
  it('should send notifications on resolution');
  it('should rollback on refund failure');
  it('should close resolved dispute');
  it('should prevent closing non-resolved dispute');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] Refund integration tested
- [ ] Database transactions working
- [ ] Tests passing (12+ tests)
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-16-014: Create Mediation System

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-16-009
**Sprint:** Sprint 16

### Description

Implement mediation system for complex disputes requiring senior review or manual intervention when automated resolution criteria aren't met.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/services/mediation.service.ts`

```typescript
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute, DisputeStatus } from '../entities/dispute.entity';
import { DisputeTimeline } from '../entities/dispute-timeline.entity';
import { DisputeTimelineService } from './dispute-timeline.service';

interface MediationNote {
  id: string;
  dispute_id: string;
  note: string;
  created_by: string;
  created_at: Date;
}

@Injectable()
export class MediationService {
  private readonly logger = new Logger(MediationService.name);

  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    private timelineService: DisputeTimelineService,
  ) {}

  /**
   * Enter mediation
   */
  async enterMediation(
    disputeId: string,
    enteredBy: string,
    reason: string,
  ): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    if (dispute.status === DisputeStatus.MEDIATION) {
      throw new BadRequestException('Dispute already in mediation');
    }

    // Update status
    dispute.status = DisputeStatus.MEDIATION;
    await this.disputeRepository.save(dispute);

    // Record in timeline
    await this.timelineService.createEntry({
      dispute_id: disputeId,
      event_type: 'status_changed' as any,
      description: `Dispute entered mediation. Reason: ${reason}`,
      actor_id: enteredBy,
      actor_type: 'support' as any,
      metadata: { reason },
    });

    this.logger.log(`Dispute ${dispute.dispute_reference} entered mediation`);

    return dispute;
  }

  /**
   * Get disputes in mediation
   */
  async getDisputesInMediation(): Promise<Dispute[]> {
    return await this.disputeRepository.find({
      where: { status: DisputeStatus.MEDIATION },
      relations: ['user', 'transaction', 'assigned_agent'],
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Add mediation notes
   */
  async addMediationNote(
    disputeId: string,
    note: string,
    createdBy: string,
  ): Promise<void> {
    await this.timelineService.createEntry({
      dispute_id: disputeId,
      event_type: 'status_changed' as any,
      description: 'Mediation note added',
      actor_id: createdBy,
      actor_type: 'support' as any,
      metadata: { note },
    });

    this.logger.log(`Mediation note added to dispute ${disputeId}`);
  }
}
```

### Acceptance Criteria

- [ ] MediationService implemented
- [ ] Enter mediation method
- [ ] Get disputes in mediation
- [ ] Add mediation notes
- [ ] Timeline tracking
- [ ] Status update to MEDIATION
- [ ] Only support/admin can enter mediation

### Testing

```typescript
describe('MediationService', () => {
  it('should enter mediation');
  it('should prevent duplicate mediation entry');
  it('should get disputes in mediation');
  it('should add mediation notes');
  it('should create timeline entries');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] Tests passing (5+ tests)
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-16-015: Implement Internal Notes

**Type:** Task
**Story Points:** 1
**Priority:** P0
**Parent:** TICKET-16-009
**Sprint:** Sprint 16

### Description

Implement encrypted internal notes system for support agents to document investigation findings without exposing information to customers or merchants.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/entities/dispute-internal-note.entity.ts`

```typescript
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@libs/database/entities/base.entity';
import { Dispute } from './dispute.entity';
import { User } from '../../users/entities/user.entity';

@Entity('dispute_internal_notes')
export class DisputeInternalNote extends BaseEntity {
  @Column('uuid')
  @Index()
  dispute_id: string;

  @Column({ type: 'text' })
  note: string; // Encrypted at application level

  @Column('uuid')
  @Index()
  created_by: string;

  @Column({ type: 'boolean', default: false })
  is_confidential: boolean;

  @ManyToOne(() => Dispute)
  @JoinColumn({ name: 'dispute_id' })
  dispute: Dispute;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
```

**Service:** `apps/payment-api/src/modules/disputes/services/internal-notes.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisputeInternalNote } from '../entities/dispute-internal-note.entity';
import * as crypto from 'crypto';

@Injectable()
export class InternalNotesService {
  private readonly encryptionKey = process.env.INTERNAL_NOTES_ENCRYPTION_KEY;

  constructor(
    @InjectRepository(DisputeInternalNote)
    private notesRepository: Repository<DisputeInternalNote>,
  ) {}

  async addNote(disputeId: string, note: string, createdBy: string, isConfidential = false): Promise<DisputeInternalNote> {
    const encryptedNote = this.encrypt(note);

    return await this.notesRepository.save({
      dispute_id: disputeId,
      note: encryptedNote,
      created_by: createdBy,
      is_confidential: isConfidential,
    });
  }

  async getNotes(disputeId: string): Promise<Array<{ id: string; note: string; created_by: string; created_at: Date }>> {
    const notes = await this.notesRepository.find({
      where: { dispute_id: disputeId },
      relations: ['creator'],
      order: { created_at: 'ASC' },
    });

    return notes.map(n => ({
      id: n.id,
      note: this.decrypt(n.note),
      created_by: n.created_by,
      created_at: n.created_at,
    }));
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

### Acceptance Criteria

- [ ] DisputeInternalNote entity created
- [ ] InternalNotesService implemented
- [ ] AES-256-GCM encryption for notes
- [ ] Add note method
- [ ] Get notes method with decryption
- [ ] Confidential flag support
- [ ] Only support/admin can access
- [ ] Notes not visible to customers/merchants

### Testing

```typescript
describe('InternalNotesService', () => {
  it('should add encrypted note');
  it('should decrypt notes on retrieval');
  it('should mark notes as confidential');
  it('should get notes for dispute');
  it('should maintain encryption integrity');
});
```

### Definition of Done

- [ ] Entity and service implemented
- [ ] Encryption working
- [ ] Tests passing (5+ tests)
- [ ] Code reviewed

**Estimated Time:** 2 hours

---

## TICKET-16-016: Create Admin Dashboard

**Type:** Task
**Story Points:** 1
**Priority:** P1
**Parent:** TICKET-16-009
**Sprint:** Sprint 16

### Description

Create API endpoints for admin dashboard showing dispute statistics, SLA metrics, agent performance, and aging reports.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/controllers/admin-dashboard.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute, DisputeStatus } from '../entities/dispute.entity';

@ApiTags('Dispute Admin')
@Controller('api/v1/disputes/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'support')
@ApiBearerAuth()
export class AdminDashboardController {
  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
  ) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get dispute statistics' })
  async getStatistics(@Query('days') days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const disputes = await this.disputeRepository.find({
      where: {
        created_at: { $gte: startDate } as any,
      },
    });

    const byStatus = disputes.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = disputes.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolved = disputes.filter(d => d.status === DisputeStatus.RESOLVED);
    const avgResolutionTime = resolved.length > 0
      ? resolved.reduce((sum, d) => sum + (new Date(d.resolved_at).getTime() - new Date(d.created_at).getTime()), 0) / resolved.length / (1000 * 60 * 60 * 24)
      : 0;

    return {
      status: 'success',
      data: {
        total: disputes.length,
        by_status: byStatus,
        by_category: byCategory,
        avg_resolution_time_days: avgResolutionTime.toFixed(2),
        sla_compliance_rate: this.calculateSLACompliance(resolved),
      },
    };
  }

  @Get('agent-performance')
  @ApiOperation({ summary: 'Get agent performance metrics' })
  async getAgentPerformance() {
    // Implementation for agent performance metrics
    return { status: 'success', data: {} };
  }

  @Get('aging-report')
  @ApiOperation({ summary: 'Get dispute aging report' })
  async getAgingReport() {
    const disputes = await this.disputeRepository.find({
      where: {
        status: {
          $in: [DisputeStatus.SUBMITTED, DisputeStatus.UNDER_INVESTIGATION, DisputeStatus.UNDER_REVIEW],
        } as any,
      },
    });

    const now = new Date();
    const aging = {
      under_7_days: 0,
      between_7_10_days: 0,
      over_10_days: 0,
      sla_breached: 0,
    };

    disputes.forEach(d => {
      const ageInDays = (now.getTime() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays < 7) aging.under_7_days++;
      else if (ageInDays <= 10) aging.between_7_10_days++;
      else aging.over_10_days++;

      if (new Date() > new Date(d.sla_deadline)) aging.sla_breached++;
    });

    return {
      status: 'success',
      data: { total: disputes.length, aging },
    };
  }

  private calculateSLACompliance(resolvedDisputes: Dispute[]): string {
    if (resolvedDisputes.length === 0) return '0';
    const withinSLA = resolvedDisputes.filter(d => new Date(d.resolved_at) <= new Date(d.sla_deadline)).length;
    return ((withinSLA / resolvedDisputes.length) * 100).toFixed(2);
  }
}
```

### Acceptance Criteria

- [ ] GET /api/v1/disputes/admin/statistics endpoint
- [ ] GET /api/v1/disputes/admin/agent-performance endpoint
- [ ] GET /api/v1/disputes/admin/aging-report endpoint
- [ ] Statistics by status, category, resolution
- [ ] Average resolution time calculation
- [ ] SLA compliance rate
- [ ] Aging buckets (< 7 days, 7-10 days, > 10 days)
- [ ] Role-based access (admin, support)

### Testing

```typescript
describe('AdminDashboardController', () => {
  it('should get statistics');
  it('should calculate avg resolution time');
  it('should get aging report');
  it('should calculate SLA compliance');
  it('should enforce role-based access');
});
```

### Definition of Done

- [ ] All endpoints implemented
- [ ] Tests passing (5+ tests)
- [ ] Role-based access working
- [ ] Code reviewed

**Estimated Time:** 2 hours

---

## TICKET-16-017: Chargeback Management

**Type:** User Story
**Story Points:** 12
**Priority:** P1
**Epic:** EPIC-10 (Refunds & Disputes)
**Sprint:** Sprint 16

### Description

As a support agent, I want to manage chargebacks from payment networks (Visa, Mastercard), so that the platform can respond to network-initiated disputes and minimize financial losses.

### Business Value

Chargebacks are critical for fintech platforms:
- Average chargeback costs $15-25 per transaction (fees + lost revenue)
- High chargeback rates (> 1%) result in penalties from payment networks
- Excessive chargebacks can lead to account termination by acquirers
- Proper chargeback management protects merchant relationships

**Success Metrics:**
- < 0.5% chargeback rate (industry best practice: < 1%)
- 80%+ chargeback win rate with proper evidence
- 100% response to chargebacks within network deadlines
- Average chargeback response time: < 5 days

### Acceptance Criteria

**Chargeback Lifecycle:**
- [ ] Receive chargeback notifications from payment networks
- [ ] Parse chargeback reason codes (Visa, Mastercard, Amex)
- [ ] Link chargeback to original transaction
- [ ] Auto-create dispute if not already exists
- [ ] Notify merchant of chargeback
- [ ] Collect evidence for representment
- [ ] Submit representment to payment network
- [ ] Track chargeback status (pending, won, lost, reversed)
- [ ] Process chargeback fees
- [ ] Update merchant account on resolution

**Reason Code Mapping:**
- [ ] Map network reason codes to dispute categories
- [ ] Fraud-related (10.4, 4837, etc.)
- [ ] Authorization issues (11.1, 4808, etc.)
- [ ] Processing errors (12.1, 4834, etc.)
- [ ] Consumer disputes (13.1, 4853, etc.)

**Evidence Collection:**
- [ ] Proof of delivery
- [ ] Transaction receipts
- [ ] Customer communication logs
- [ ] Refund/cancellation policies
- [ ] IP address and device fingerprint
- [ ] AVS and CVV results

**Financial Impact:**
- [ ] Deduct chargeback amount from merchant balance
- [ ] Apply chargeback fee (₦5,000 - ₦15,000)
- [ ] Reverse on chargeback win
- [ ] Create ledger entries for all transactions

### API Specification

**Endpoint:** POST /api/v1/chargebacks/webhook

**Request (from payment network):**
```json
{
  "chargeback_id": "CB-2025-12345",
  "transaction_id": "TXN-20250110-XYZ",
  "reason_code": "10.4",
  "reason_description": "Fraudulent transaction - card absent",
  "chargeback_amount": 5000000,
  "chargeback_currency": "NGN",
  "dispute_deadline": "2025-02-10T23:59:59Z",
  "network": "visa"
}
```

### Subtasks

- [ ] TICKET-16-018: Create Chargeback Schema
- [ ] TICKET-16-019: Implement Provider Integration
- [ ] TICKET-16-020: Create Chargeback Workflow
- [ ] TICKET-16-021: Implement Evidence Collection
- [ ] TICKET-16-022: Create Chargeback Analytics

### Testing Requirements

**Unit Tests (20 tests):**
- Reason code parsing
- Evidence validation
- Fee calculation
- Status transitions

**Integration Tests (10 tests):**
- Full chargeback lifecycle
- Provider webhook processing
- Ledger integration
- Notification delivery

**E2E Tests (5 tests):**
- Receive chargeback → Representment → Win
- Receive chargeback → Representment → Loss
- Chargeback fee processing

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Tests passing (35+ tests)
- [ ] Provider integrations tested
- [ ] Financial calculations accurate
- [ ] Code reviewed and merged

---

## TICKET-16-018: Create Chargeback Schema

**Type:** Task
**Story Points:** 2
**Priority:** P1
**Parent:** TICKET-16-017
**Sprint:** Sprint 16

### Description

Create database schema for chargebacks with reason codes, evidence tracking, and network-specific fields.

### Task Details

**Migration:** `libs/database/src/migrations/1704600000000-create-chargebacks.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateChargebacks1704600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'chargebacks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'chargeback_reference',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'network_chargeback_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            comment: 'ID from payment network',
          },
          {
            name: 'transaction_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'dispute_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Linked dispute if exists',
          },
          {
            name: 'network',
            type: 'enum',
            enum: ['visa', 'mastercard', 'verve', 'amex'],
            isNullable: false,
          },
          {
            name: 'reason_code',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'reason_description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'chargeback_amount',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'chargeback_fee',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'under_review', 'representment_submitted', 'won', 'lost', 'reversed'],
            default: "'pending'",
          },
          {
            name: 'dispute_deadline',
            type: 'timestamp with time zone',
            isNullable: false,
          },
          {
            name: 'representment_submitted_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'resolved_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'merchant_notified_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'network_response',
            type: 'jsonb',
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
          { name: 'idx_chargeback_reference', columnNames: ['chargeback_reference'] },
          { name: 'idx_chargeback_transaction_id', columnNames: ['transaction_id'] },
          { name: 'idx_chargeback_status', columnNames: ['status'] },
          { name: 'idx_chargeback_network', columnNames: ['network'] },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'chargebacks',
      new TableForeignKey({
        columnNames: ['transaction_id'],
        referencedTableName: 'transactions',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'chargebacks',
      new TableForeignKey({
        columnNames: ['dispute_id'],
        referencedTableName: 'disputes',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chargebacks');
  }
}
```

**Entity:** `apps/payment-api/src/modules/disputes/entities/chargeback.entity.ts`

```typescript
import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@libs/database/entities/base.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Dispute } from './dispute.entity';

export enum ChargebackNetwork {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  VERVE = 'verve',
  AMEX = 'amex',
}

export enum ChargebackStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  REPRESENTMENT_SUBMITTED = 'representment_submitted',
  WON = 'won',
  LOST = 'lost',
  REVERSED = 'reversed',
}

@Entity('chargebacks')
export class Chargeback extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  chargeback_reference: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  network_chargeback_id: string;

  @Column('uuid')
  @Index()
  transaction_id: string;

  @Column({ type: 'uuid', nullable: true })
  dispute_id: string;

  @Column({ type: 'enum', enum: ChargebackNetwork })
  @Index()
  network: ChargebackNetwork;

  @Column({ type: 'varchar', length: 20 })
  reason_code: string;

  @Column({ type: 'text' })
  reason_description: string;

  @Column({ type: 'bigint' })
  chargeback_amount: number;

  @Column({ type: 'bigint', default: 0 })
  chargeback_fee: number;

  @Column({ type: 'enum', enum: ChargebackStatus, default: ChargebackStatus.PENDING })
  @Index()
  status: ChargebackStatus;

  @Column({ type: 'timestamp with time zone' })
  dispute_deadline: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  representment_submitted_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  resolved_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  merchant_notified_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  network_response: Record<string, any>;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @ManyToOne(() => Dispute)
  @JoinColumn({ name: 'dispute_id' })
  dispute: Dispute;
}
```

### Acceptance Criteria

- [ ] Migration created
- [ ] Chargeback entity implemented
- [ ] All columns defined
- [ ] Indexes created
- [ ] Foreign keys configured
- [ ] Enums for network and status
- [ ] Unique constraints on references

### Testing

```typescript
describe('Chargeback Schema', () => {
  it('should create chargebacks table');
  it('should enforce unique chargeback_reference');
  it('should enforce unique network_chargeback_id');
  it('should link to transaction');
  it('should optionally link to dispute');
});
```

### Definition of Done

- [ ] Migration working
- [ ] Entity created
- [ ] Tests passing (5+ tests)
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-16-019: Implement Provider Integration

**Type:** Task
**Story Points:** 3
**Priority:** P1
**Parent:** TICKET-16-017
**Sprint:** Sprint 16

### Description

Implement webhook integration to receive chargeback notifications from payment networks and mock providers.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/services/chargeback-provider.service.ts`

```typescript
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chargeback, ChargebackNetwork, ChargebackStatus } from '../entities/chargeback.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

interface ChargebackWebhookDto {
  chargeback_id: string;
  transaction_id: string;
  reason_code: string;
  reason_description: string;
  chargeback_amount: number;
  chargeback_currency: string;
  dispute_deadline: string;
  network: string;
}

@Injectable()
export class ChargebackProviderService {
  private readonly logger = new Logger(ChargebackProviderService.name);

  constructor(
    @InjectRepository(Chargeback)
    private chargebackRepository: Repository<Chargeback>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Process chargeback webhook from payment network
   */
  async processChargebackWebhook(dto: ChargebackWebhookDto): Promise<Chargeback> {
    // Validate transaction exists
    const transaction = await this.transactionRepository.findOne({
      where: { id: dto.transaction_id },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    // Check for duplicate
    const existing = await this.chargebackRepository.findOne({
      where: { network_chargeback_id: dto.chargeback_id },
    });

    if (existing) {
      this.logger.warn(`Duplicate chargeback webhook: ${dto.chargeback_id}`);
      return existing;
    }

    // Generate internal reference
    const reference = this.generateChargebackReference();

    // Calculate chargeback fee based on network
    const chargebackFee = this.calculateChargebackFee(dto.network as ChargebackNetwork, dto.chargeback_amount);

    // Create chargeback record
    const chargeback = await this.chargebackRepository.save({
      chargeback_reference: reference,
      network_chargeback_id: dto.chargeback_id,
      transaction_id: dto.transaction_id,
      network: dto.network as ChargebackNetwork,
      reason_code: dto.reason_code,
      reason_description: dto.reason_description,
      chargeback_amount: dto.chargeback_amount,
      chargeback_fee: chargebackFee,
      dispute_deadline: new Date(dto.dispute_deadline),
      status: ChargebackStatus.PENDING,
    });

    this.logger.log(`Chargeback received: ${reference} for transaction ${dto.transaction_id}`);

    // TODO: Notify merchant, auto-create dispute, deduct funds

    return chargeback;
  }

  /**
   * Generate unique chargeback reference
   */
  private generateChargebackReference(): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CB-${date}-${random}`;
  }

  /**
   * Calculate chargeback fee based on network
   */
  private calculateChargebackFee(network: ChargebackNetwork, amount: number): number {
    const fees = {
      [ChargebackNetwork.VISA]: 1500000, // ₦15,000
      [ChargebackNetwork.MASTERCARD]: 1500000,
      [ChargebackNetwork.VERVE]: 500000, // ₦5,000
      [ChargebackNetwork.AMEX]: 2000000, // ₦20,000
    };

    return fees[network] || 1000000;
  }

  /**
   * Map reason code to category
   */
  mapReasonCodeToCategory(reasonCode: string, network: ChargebackNetwork): string {
    const visaMapping = {
      '10.4': 'fraud',
      '11.1': 'authorization',
      '12.1': 'processing_error',
      '13.1': 'consumer_dispute',
    };

    const mastercardMapping = {
      '4837': 'fraud',
      '4808': 'authorization',
      '4834': 'processing_error',
      '4853': 'consumer_dispute',
    };

    const mapping = network === ChargebackNetwork.VISA ? visaMapping : mastercardMapping;
    return mapping[reasonCode] || 'other';
  }
}
```

**Controller:** `apps/payment-api/src/modules/disputes/controllers/chargeback-webhook.controller.ts`

```typescript
import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChargebackProviderService } from '../services/chargeback-provider.service';

@ApiTags('Chargebacks')
@Controller('webhooks/chargebacks')
export class ChargebackWebhookController {
  constructor(private chargebackService: ChargebackProviderService) {}

  @Post()
  @ApiOperation({ summary: 'Receive chargeback notification from payment network' })
  async receiveChargeback(@Body() dto: any, @Headers('x-webhook-signature') signature: string) {
    // TODO: Verify webhook signature

    const chargeback = await this.chargebackService.processChargebackWebhook(dto);

    return {
      status: 'success',
      message: 'Chargeback received',
      data: { chargeback },
    };
  }
}
```

### Acceptance Criteria

- [ ] ChargebackProviderService implemented
- [ ] Process webhook method
- [ ] Duplicate detection
- [ ] Chargeback reference generation
- [ ] Fee calculation by network
- [ ] Reason code mapping
- [ ] Webhook signature verification
- [ ] Transaction validation

### Testing

```typescript
describe('ChargebackProviderService', () => {
  it('should process chargeback webhook');
  it('should prevent duplicate chargebacks');
  it('should generate unique reference');
  it('should calculate correct fees');
  it('should map reason codes');
  it('should validate transaction exists');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] Webhook endpoint created
- [ ] Tests passing (6+ tests)
- [ ] Code reviewed

**Estimated Time:** 5 hours

---

## TICKET-16-020: Create Chargeback Workflow

**Type:** Task
**Story Points:** 3
**Priority:** P1
**Parent:** TICKET-16-017
**Sprint:** Sprint 16

### Description

Implement chargeback workflow including merchant notification, fund deduction, representment submission, and resolution processing.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/services/chargeback-workflow.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Chargeback, ChargebackStatus } from '../entities/chargeback.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { LedgerService } from '../../ledger/services/ledger.service';
import { DisputeService } from './dispute.service';

@Injectable()
export class ChargebackWorkflowService {
  private readonly logger = new Logger(ChargebackWorkflowService.name);

  constructor(
    @InjectRepository(Chargeback)
    private chargebackRepository: Repository<Chargeback>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private ledgerService: LedgerService,
    private disputeService: DisputeService,
    private dataSource: DataSource,
  ) {}

  /**
   * Process new chargeback (deduct funds, create dispute, notify)
   */
  async processNewChargeback(chargebackId: string): Promise<void> {
    const chargeback = await this.chargebackRepository.findOne({
      where: { id: chargebackId },
      relations: ['transaction'],
    });

    if (!chargeback) {
      throw new Error('Chargeback not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Deduct chargeback amount + fee from merchant wallet
      await this.deductChargebackFunds(queryRunner, chargeback);

      // 2. Auto-create dispute if not exists
      if (!chargeback.dispute_id) {
        const dispute = await this.disputeService.createDisputeFromChargeback(chargeback);
        chargeback.dispute_id = dispute.id;
        await queryRunner.manager.save(Chargeback, chargeback);
      }

      // 3. Update status
      chargeback.status = ChargebackStatus.UNDER_REVIEW;
      await queryRunner.manager.save(Chargeback, chargeback);

      await queryRunner.commitTransaction();

      // 4. Send notifications (async)
      this.notifyMerchant(chargebackId).catch(err => {
        this.logger.error(`Failed to notify merchant: ${err}`);
      });

      this.logger.log(`Chargeback processed: ${chargeback.chargeback_reference}`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Deduct chargeback funds from merchant wallet
   */
  private async deductChargebackFunds(queryRunner: any, chargeback: Chargeback): Promise<void> {
    const totalDeduction = chargeback.chargeback_amount + chargeback.chargeback_fee;

    // Create ledger entries
    await this.ledgerService.createEntry({
      type: 'chargeback_debit',
      amount: totalDeduction,
      currency: chargeback.transaction.currency,
      reference: chargeback.chargeback_reference,
      description: `Chargeback: ${chargeback.reason_description}`,
    });
  }

  /**
   * Submit representment to payment network
   */
  async submitRepresentment(chargebackId: string, evidenceIds: string[]): Promise<void> {
    const chargeback = await this.chargebackRepository.findOne({
      where: { id: chargebackId },
    });

    if (!chargeback) {
      throw new Error('Chargeback not found');
    }

    // TODO: Submit to payment network API

    chargeback.status = ChargebackStatus.REPRESENTMENT_SUBMITTED;
    chargeback.representment_submitted_at = new Date();
    await this.chargebackRepository.save(chargeback);

    this.logger.log(`Representment submitted for ${chargeback.chargeback_reference}`);
  }

  /**
   * Process chargeback resolution (won/lost)
   */
  async processResolution(chargebackId: string, won: boolean): Promise<void> {
    const chargeback = await this.chargebackRepository.findOne({
      where: { id: chargebackId },
    });

    if (!chargeback) {
      throw new Error('Chargeback not found');
    }

    chargeback.status = won ? ChargebackStatus.WON : ChargebackStatus.LOST;
    chargeback.resolved_at = new Date();

    if (won) {
      // Reverse chargeback deduction
      await this.reverseChargebackFunds(chargeback);
    }

    await this.chargebackRepository.save(chargeback);

    this.logger.log(`Chargeback ${won ? 'won' : 'lost'}: ${chargeback.chargeback_reference}`);
  }

  /**
   * Reverse chargeback funds on win
   */
  private async reverseChargebackFunds(chargeback: Chargeback): Promise<void> {
    const totalRefund = chargeback.chargeback_amount + chargeback.chargeback_fee;

    await this.ledgerService.createEntry({
      type: 'chargeback_reversal',
      amount: totalRefund,
      currency: chargeback.transaction.currency,
      reference: `${chargeback.chargeback_reference}-REVERSAL`,
      description: `Chargeback won - reversal`,
    });
  }

  /**
   * Notify merchant of chargeback
   */
  private async notifyMerchant(chargebackId: string): Promise<void> {
    // TODO: Send email/SMS to merchant
    this.logger.log(`Merchant notified of chargeback: ${chargebackId}`);
  }
}
```

### Acceptance Criteria

- [ ] ChargebackWorkflowService implemented
- [ ] Process new chargeback (deduct funds, create dispute)
- [ ] Submit representment
- [ ] Process resolution (won/lost)
- [ ] Reverse funds on win
- [ ] Merchant notifications
- [ ] Database transactions for atomicity
- [ ] Ledger integration

### Testing

```typescript
describe('ChargebackWorkflowService', () => {
  it('should process new chargeback');
  it('should deduct funds from merchant');
  it('should auto-create dispute');
  it('should submit representment');
  it('should process win (reverse funds)');
  it('should process loss (keep funds deducted)');
  it('should rollback on error');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] Fund deduction working
- [ ] Tests passing (7+ tests)
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-16-021: Implement Evidence Collection

**Type:** Task
**Story Points:** 2
**Priority:** P1
**Parent:** TICKET-16-017
**Sprint:** Sprint 16

### Description

Implement evidence collection system for chargeback representment with network-specific requirements and automatic evidence bundling.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/services/chargeback-evidence.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisputeEvidence } from '../entities/dispute-evidence.entity';
import { Chargeback, ChargebackNetwork } from '../entities/chargeback.entity';

@Injectable()
export class ChargebackEvidenceService {
  constructor(
    @InjectRepository(Chargeback)
    private chargebackRepository: Repository<Chargeback>,
    @InjectRepository(DisputeEvidence)
    private evidenceRepository: Repository<DisputeEvidence>,
  ) {}

  /**
   * Get required evidence for chargeback reason code
   */
  getRequiredEvidence(reasonCode: string, network: ChargebackNetwork): string[] {
    const fraudEvidence = [
      'proof_of_delivery',
      'avs_cvv_results',
      'ip_address_log',
      'device_fingerprint',
      'customer_communication',
    ];

    const authorizationEvidence = [
      'authorization_approval_code',
      'transaction_receipt',
      'cardholder_signature',
    ];

    const notReceivedEvidence = [
      'proof_of_delivery',
      'tracking_number',
      'shipping_confirmation',
    ];

    // Map reason codes to required evidence
    const evidenceMap = {
      '10.4': fraudEvidence, // Visa fraud
      '4837': fraudEvidence, // Mastercard fraud
      '11.1': authorizationEvidence, // Visa auth
      '4808': authorizationEvidence, // Mastercard auth
      '13.1': notReceivedEvidence, // Visa not received
      '4853': notReceivedEvidence, // Mastercard not received
    };

    return evidenceMap[reasonCode] || [];
  }

  /**
   * Bundle evidence for representment
   */
  async bundleEvidenceForRepresentment(chargebackId: string): Promise<any> {
    const chargeback = await this.chargebackRepository.findOne({
      where: { id: chargebackId },
      relations: ['dispute', 'dispute.evidence'],
    });

    if (!chargeback || !chargeback.dispute) {
      throw new Error('Chargeback or linked dispute not found');
    }

    const requiredEvidence = this.getRequiredEvidence(chargeback.reason_code, chargeback.network);

    const evidenceBundle = {
      chargeback_id: chargeback.network_chargeback_id,
      merchant_response: {
        evidence_files: chargeback.dispute.evidence.map(e => ({
          file_url: e.file_url,
          description: e.description,
          type: e.file_type,
        })),
        required_evidence: requiredEvidence,
        submission_date: new Date().toISOString(),
      },
    };

    return evidenceBundle;
  }
}
```

### Acceptance Criteria

- [ ] ChargebackEvidenceService implemented
- [ ] Get required evidence by reason code
- [ ] Bundle evidence for representment
- [ ] Network-specific requirements (Visa, Mastercard)
- [ ] Evidence type mapping
- [ ] Validation of required evidence

### Testing

```typescript
describe('ChargebackEvidenceService', () => {
  it('should get required evidence for fraud');
  it('should get required evidence for authorization');
  it('should bundle evidence for representment');
  it('should handle network-specific requirements');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] Evidence bundling working
- [ ] Tests passing (4+ tests)
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-16-022: Create Chargeback Analytics

**Type:** Task
**Story Points:** 2
**Priority:** P2
**Parent:** TICKET-16-017
**Sprint:** Sprint 16

### Description

Create analytics endpoints for chargeback metrics including win rate, reason code analysis, and financial impact reporting.

### Task Details

**File:** `apps/payment-api/src/modules/disputes/controllers/chargeback-analytics.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chargeback, ChargebackStatus } from '../entities/chargeback.entity';

@ApiTags('Chargeback Analytics')
@Controller('api/v1/chargebacks/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class ChargebackAnalyticsController {
  constructor(
    @InjectRepository(Chargeback)
    private chargebackRepository: Repository<Chargeback>,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get chargeback overview metrics' })
  async getOverview(@Query('days') days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const chargebacks = await this.chargebackRepository.find({
      where: { created_at: { $gte: startDate } as any },
    });

    const total = chargebacks.length;
    const won = chargebacks.filter(cb => cb.status === ChargebackStatus.WON).length;
    const lost = chargebacks.filter(cb => cb.status === ChargebackStatus.LOST).length;
    const pending = chargebacks.filter(cb =>
      [ChargebackStatus.PENDING, ChargebackStatus.UNDER_REVIEW, ChargebackStatus.REPRESENTMENT_SUBMITTED].includes(cb.status)
    ).length;

    const totalAmount = chargebacks.reduce((sum, cb) => sum + cb.chargeback_amount, 0);
    const totalFees = chargebacks.reduce((sum, cb) => sum + cb.chargeback_fee, 0);

    return {
      status: 'success',
      data: {
        total,
        won,
        lost,
        pending,
        win_rate: total > 0 ? ((won / (won + lost)) * 100).toFixed(2) : 0,
        total_amount: totalAmount,
        total_fees: totalFees,
        avg_chargeback_amount: total > 0 ? (totalAmount / total).toFixed(2) : 0,
      },
    };
  }

  @Get('by-reason')
  @ApiOperation({ summary: 'Get chargebacks by reason code' })
  async getByReason(@Query('days') days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const chargebacks = await this.chargebackRepository.find({
      where: { created_at: { $gte: startDate } as any },
    });

    const byReason = chargebacks.reduce((acc, cb) => {
      if (!acc[cb.reason_code]) {
        acc[cb.reason_code] = {
          code: cb.reason_code,
          description: cb.reason_description,
          count: 0,
          won: 0,
          lost: 0,
        };
      }
      acc[cb.reason_code].count++;
      if (cb.status === ChargebackStatus.WON) acc[cb.reason_code].won++;
      if (cb.status === ChargebackStatus.LOST) acc[cb.reason_code].lost++;
      return acc;
    }, {} as Record<string, any>);

    return {
      status: 'success',
      data: Object.values(byReason),
    };
  }

  @Get('by-network')
  @ApiOperation({ summary: 'Get chargebacks by network' })
  async getByNetwork(@Query('days') days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const chargebacks = await this.chargebackRepository.find({
      where: { created_at: { $gte: startDate } as any },
    });

    const byNetwork = chargebacks.reduce((acc, cb) => {
      acc[cb.network] = (acc[cb.network] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      status: 'success',
      data: byNetwork,
    };
  }
}
```

### Acceptance Criteria

- [ ] ChargebackAnalyticsController implemented
- [ ] GET /api/v1/chargebacks/analytics/overview endpoint
- [ ] GET /api/v1/chargebacks/analytics/by-reason endpoint
- [ ] GET /api/v1/chargebacks/analytics/by-network endpoint
- [ ] Win rate calculation
- [ ] Financial impact metrics (total amount, fees)
- [ ] Reason code analysis
- [ ] Network distribution
- [ ] Role-based access (admin only)

### Testing

```typescript
describe('ChargebackAnalyticsController', () => {
  it('should get overview metrics');
  it('should calculate win rate');
  it('should group by reason code');
  it('should group by network');
  it('should enforce admin access');
});
```

### Definition of Done

- [ ] All endpoints implemented
- [ ] Tests passing (5+ tests)
- [ ] Role-based access working
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## Sprint 16 Summary

**Total Story Points:** 42 SP
**Total Tickets:** 22 tickets (3 stories + 19 tasks)
**Estimated Time:** ~85 hours (2 weeks with 2 developers)

### Completion Checklist

- [ ] All 22 tickets completed and tested
- [ ] Dispute creation and evidence upload working
- [ ] Investigation workflow and assignment system operational
- [ ] Merchant response system functional
- [ ] Resolution engine with refund integration tested
- [ ] Mediation system implemented
- [ ] Internal notes encryption working
- [ ] Admin dashboard providing insights
- [ ] Chargeback management system complete
- [ ] All tests passing (200+ tests total)
- [ ] Code coverage ≥ 85%
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Sprint retrospective conducted

### Next Sprint Preview

**Sprint 17** will focus on:
- KYC verification system
- Document upload and validation
- Tier-based limits
- Compliance reporting
