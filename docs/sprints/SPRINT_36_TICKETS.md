# Sprint 36 Tickets - Social Payments (Split Bills & Collections)

**Sprint:** Sprint 36
**Duration:** 2 weeks (Week 72-73)
**Total Story Points:** 32 SP
**Total Tickets:** 24 tickets (4 stories + 20 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-36-001 | Story | Bill Splitting Engine | 8 | To Do | Developer |
| TICKET-36-002 | Task | Create Bill Split Entities & Schema | 2 | To Do | Developer |
| TICKET-36-003 | Task | Implement Bill Split Calculation Service | 3 | To Do | Developer |
| TICKET-36-004 | Task | Create Bill Split Endpoints | 2 | To Do | Developer |
| TICKET-36-005 | Task | Receipt Upload & OCR | 1 | To Do | Developer |
| TICKET-36-006 | Story | Group Collections | 8 | To Do | Developer |
| TICKET-36-007 | Task | Create Collection Entities & Schema | 2 | To Do | Developer |
| TICKET-36-008 | Task | Implement Collection Service | 3 | To Do | Developer |
| TICKET-36-009 | Task | Create Collection Endpoints | 2 | To Do | Developer |
| TICKET-36-010 | Task | Collection Progress Tracking | 1 | To Do | Developer |
| TICKET-36-011 | Story | Payment Request Distribution | 8 | To Do | Developer |
| TICKET-36-012 | Task | WhatsApp Integration | 2 | To Do | Developer |
| TICKET-36-013 | Task | SMS Integration (Twilio) | 2 | To Do | Developer |
| TICKET-36-014 | Task | Email Integration (SendGrid) | 2 | To Do | Developer |
| TICKET-36-015 | Task | QR Code & Payment Link Service | 1 | To Do | Developer |
| TICKET-36-016 | Task | Request Reminder Service | 1 | To Do | Developer |
| TICKET-36-017 | Story | Settlement, Analytics & Fraud | 8 | To Do | Developer |
| TICKET-36-018 | Task | Settlement & Payout Service | 2 | To Do | Developer |
| TICKET-36-019 | Task | Social Payments Analytics | 2 | To Do | Developer |
| TICKET-36-020 | Task | Fraud Detection for Splits | 2 | To Do | Developer |
| TICKET-36-021 | Task | Payment Processing Integration | 1 | To Do | Developer |
| TICKET-36-022 | Task | UI Components & Dashboard | 1 | To Do | Developer |
| TICKET-36-023 | Task | API Documentation & Postman | 1 | To Do | Developer |
| TICKET-36-024 | Task | Testing (Unit, Integration, E2E) | 2 | To Do | Developer |

---

## TICKET-36-001: Bill Splitting Engine

**Type:** User Story
**Story Points:** 8
**Priority:** P0 (Critical)
**Epic:** Customer Experience & Social Features
**Sprint:** Sprint 36

### Description

As a user, I want to split bills with friends using multiple splitting methods, so that we can easily settle expenses and avoid complicated calculations.

### Business Value

Bill splitting is a massive use case for payment apps. Users frequently split restaurant bills, rent, trips. Easy-to-use splitting with multiple methods drives engagement and transaction volume.

**Impact:**
- **Critical:** Core viral feature
- **Volume:** 5-10K splits/month expected
- **Engagement:** Social feature drives daily active users
- **Revenue:** 0.5-1% commission on settlements = ₦100-500K/month

### Acceptance Criteria

**Splitting Methods:**
- [ ] Equal split (divide equally among participants)
- [ ] Itemized split (add line items and assign to people)
- [ ] Custom amount split (specify exact amount per person)
- [ ] Percentage-based split (50%, 30%, 20%)
- [ ] Weighted split (roommates with different room sizes)
- [ ] Tax & tip handling (auto-split or single person)

**Participant Management:**
- [ ] Add participants (2-10 people)
- [ ] Remove participant (recalculate amounts)
- [ ] Assign role (payer, recipient)
- [ ] Assign amount/percentage per participant
- [ ] Reorder participants
- [ ] Save frequently-used groups

**Calculation & Validation:**
- [ ] Accurate rounding (banker's rounding, prevent ₦0.01 errors)
- [ ] Validate total amount > 0
- [ ] Prevent duplicate participants
- [ ] Prevent self-payment
- [ ] Show calculation breakdown
- [ ] Display per-person share clearly

**Data & Persistence:**
- [ ] Store split in database
- [ ] Track split status (draft, pending, settled)
- [ ] Store all split details (items, amounts, participants)
- [ ] Audit trail for split changes

**Non-Functional:**
- [ ] Create split: < 200ms
- [ ] Calculate amounts: < 100ms
- [ ] Support 1M+ splits
- [ ] UI responsive (mobile, tablet, desktop)

### API Specifications

#### Create Bill Split

```
POST /api/v1/social-payments/splits
Authorization: Bearer <token>

Request:
{
  "split_name": "Lunch at XYZ Restaurant",
  "total_amount": 1200,
  "split_type": "equal",
  "tax_percentage": 7.5,
  "tip_percentage": 15,
  "participant_ids": ["user-uuid-2", "user-uuid-3"],
  "receipt_url": "https://s3.amazonaws.com/receipts/..."
}

Response: 201 Created
{
  "status": "success",
  "data": {
    "id": "split-uuid-123",
    "split_name": "Lunch at XYZ Restaurant",
    "total_amount": 1200,
    "tax_amount": 90,
    "tip_amount": 300,
    "split_type": "equal",
    "status": "draft",
    "participants": [
      {
        "participant_id": "user-uuid-2",
        "assigned_amount": 795,
        "payment_status": "pending"
      },
      {
        "participant_id": "user-uuid-3",
        "assigned_amount": 795,
        "payment_status": "pending"
      }
    ],
    "created_at": "2024-01-20T12:00:00Z"
  }
}
```

#### Calculate Split

```
POST /api/v1/social-payments/splits/:id/calculate
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "success",
  "data": {
    "split_name": "Lunch at XYZ Restaurant",
    "total_amount": 1200,
    "tax_percentage": 7.5,
    "tax_amount": 90,
    "tip_percentage": 15,
    "tip_amount": 300,
    "final_total": 1590,
    "participants": [
      {
        "user_id": "user-uuid-2",
        "assigned_amount": 795,
        "breakdown": {
          "share_of_food": 600,
          "share_of_tax": 45,
          "share_of_tip": 150
        }
      },
      {
        "user_id": "user-uuid-3",
        "assigned_amount": 795,
        "breakdown": {
          "share_of_food": 600,
          "share_of_tax": 45,
          "share_of_tip": 150
        }
      }
    ],
    "validation": {
      "total_matches": true,
      "rounding_error": 0
    }
  }
}
```

#### Update Bill Split

```
PATCH /api/v1/social-payments/splits/:id
Authorization: Bearer <token>

Request:
{
  "split_name": "Lunch at XYZ Restaurant (Updated)",
  "total_amount": 1200
}

Response: 200 OK
{
  "status": "success",
  "message": "Split updated successfully"
}
```

#### List My Splits

```
GET /api/v1/social-payments/splits?status=pending&limit=50&page=1
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "split-uuid-123",
        "split_name": "Lunch at XYZ",
        "total_amount": 1200,
        "status": "pending",
        "participant_count": 2,
        "participants_paid": 0,
        "created_at": "2024-01-20T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 15,
      "pages": 1
    }
  }
}
```

#### Send Payment Requests

```
POST /api/v1/social-payments/splits/:id/send-requests
Authorization: Bearer <token>

Request:
{
  "channels": ["whatsapp", "sms", "email"],
  "message": "Let's settle this bill!"
}

Response: 200 OK
{
  "status": "success",
  "data": {
    "requests_sent": 2,
    "delivery_status": {
      "whatsapp": { "sent": 1, "failed": 0 },
      "sms": { "sent": 2, "failed": 0 },
      "email": { "sent": 2, "failed": 0 }
    }
  }
}
```

### Subtasks

- [ ] TICKET-36-002: Create Bill Split Entities & Schema
- [ ] TICKET-36-003: Implement Bill Split Calculation Service
- [ ] TICKET-36-004: Create Bill Split Endpoints
- [ ] TICKET-36-005: Receipt Upload & OCR

### Testing Requirements

- Unit tests: 30 tests (splitting logic, validation, rounding)
- Integration tests: 15 tests (API endpoints, calculations)
- E2E tests: 5 tests (complete split flow)
- Performance tests: 3 tests (calculation speed, bulk splits)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Split schema created
- [ ] All splitting methods working
- [ ] Rounding tests passing
- [ ] All tests passing (50+ tests)
- [ ] API documentation updated
- [ ] Code reviewed and merged

---

## TICKET-36-002: Create Bill Split Entities & Schema

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-36-001
**Sprint:** Sprint 36

### Description

Create the BillSplit, SplitParticipant, and related database entities and migrations needed for the bill splitting system.

### Implementation Details

**Entities to Create:**

```typescript
// src/social-payments/entities/bill-split.entity.ts
@Entity('bill_splits')
export class BillSplit extends BaseEntity {
  @Column('uuid')
  creator_id: string;

  @Column('varchar')
  split_name: string;

  @Column('decimal', { precision: 15, scale: 2 })
  total_amount: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  tax_percentage: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  tax_amount: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  tip_percentage: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  tip_amount: number;

  @Column({ type: 'enum', enum: SplitType, default: 'equal' })
  split_type: SplitType;

  @Column({ type: 'jsonb' })
  split_data: {
    items?: Array<{ name: string; amount: number; participants: string[] }>;
    percentages?: { [userId: string]: number };
    weights?: { [userId: string]: number };
    custom_amounts?: { [userId: string]: number };
  };

  @Column('varchar', { nullable: true })
  receipt_url: string;

  @Column({ type: 'enum', enum: SplitStatus, default: 'draft' })
  status: SplitStatus;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  settled_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => SplitParticipant, sp => sp.bill_split)
  participants: SplitParticipant[];

  @OneToMany(() => Payment, p => p.bill_split)
  payments: Payment[];
}

// src/social-payments/entities/split-participant.entity.ts
@Entity('split_participants')
export class SplitParticipant extends BaseEntity {
  @Column('uuid')
  split_id: string;

  @Column('uuid')
  participant_id: string;

  @Column({ type: 'enum', enum: ParticipantRole, default: 'recipient' })
  role: ParticipantRole;

  @Column('decimal', { precision: 15, scale: 2 })
  assigned_amount: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  paid_amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: 'pending' })
  payment_status: PaymentStatus;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  paid_at: Date;

  @ManyToOne(() => BillSplit)
  @JoinColumn({ name: 'split_id' })
  bill_split: BillSplit;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'participant_id' })
  participant: User;
}
```

**Database Migrations:**

```typescript
// src/migrations/1704931400000-CreateBillSplitTables.ts
export class CreateBillSplitTables1704931400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bill_splits',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'creator_id', type: 'uuid' },
          { name: 'split_name', type: 'varchar' },
          { name: 'total_amount', type: 'decimal', precision: 15, scale: 2 },
          { name: 'tax_percentage', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, isNullable: true },
          { name: 'tip_percentage', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'tip_amount', type: 'decimal', precision: 15, scale: 2, isNullable: true },
          { name: 'split_type', type: 'enum', enum: ['equal', 'itemized', 'custom', 'percentage', 'weighted'] },
          { name: 'split_data', type: 'jsonb' },
          { name: 'receipt_url', type: 'varchar', isNullable: true },
          { name: 'status', type: 'enum', enum: ['draft', 'pending', 'settled', 'cancelled'] },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'settled_at', type: 'timestamp with time zone', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['creator_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          },
        ],
        indices: [
          { columnNames: ['creator_id'] },
          { columnNames: ['status'] },
          { columnNames: ['created_at'] },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'split_participants',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'split_id', type: 'uuid' },
          { name: 'participant_id', type: 'uuid' },
          { name: 'role', type: 'enum', enum: ['payer', 'recipient'] },
          { name: 'assigned_amount', type: 'decimal', precision: 15, scale: 2 },
          { name: 'paid_amount', type: 'decimal', precision: 15, scale: 2, isNullable: true },
          { name: 'payment_status', type: 'enum', enum: ['pending', 'partial', 'paid'] },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'paid_at', type: 'timestamp with time zone', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['split_id'],
            referencedTableName: 'bill_splits',
            referencedColumnNames: ['id'],
          },
          {
            columnNames: ['participant_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          },
        ],
        indices: [
          { columnNames: ['split_id'] },
          { columnNames: ['participant_id'] },
          { columnNames: ['payment_status'] },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('split_participants');
    await queryRunner.dropTable('bill_splits');
  }
}
```

**Checklist:**
- [ ] BillSplit entity created
- [ ] SplitParticipant entity created
- [ ] Database migrations created
- [ ] DTOs created (CreateBillSplitDto, etc.)
- [ ] Enums created (SplitType, SplitStatus, ParticipantRole, PaymentStatus)

---

## TICKET-36-003: Implement Bill Split Calculation Service

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-36-001
**Sprint:** Sprint 36

### Description

Implement the BillSplitService with core functionality for calculating splits (equal, custom, percentage, weighted, itemized).

### Implementation Details

```typescript
// src/social-payments/services/bill-split.service.ts
@Injectable()
export class BillSplitService {
  constructor(
    @InjectRepository(BillSplit)
    private splitRepository: Repository<BillSplit>,
    @InjectRepository(SplitParticipant)
    private participantRepository: Repository<SplitParticipant>,
  ) {}

  async createSplit(dto: CreateBillSplitDto, userId: string): Promise<BillSplit> {
    // Validate input
    if (dto.total_amount <= 0) {
      throw new BadRequestException('Total amount must be greater than 0');
    }

    if (dto.participant_ids.length < 2) {
      throw new BadRequestException('At least 2 participants required');
    }

    const split = this.splitRepository.create({
      creator_id: userId,
      split_name: dto.split_name,
      total_amount: dto.total_amount,
      tax_percentage: dto.tax_percentage,
      tip_percentage: dto.tip_percentage,
      split_type: dto.split_type,
      split_data: dto.split_data || {},
      status: 'draft',
    });

    const savedSplit = await this.splitRepository.save(split);

    // Create participants
    for (const participantId of dto.participant_ids) {
      const participant = this.participantRepository.create({
        split_id: savedSplit.id,
        participant_id: participantId,
        assigned_amount: 0,  // Will be calculated later
      });
      await this.participantRepository.save(participant);
    }

    return savedSplit;
  }

  async calculateAmounts(splitId: string): Promise<{ [userId: string]: number }> {
    const split = await this.splitRepository.findOne({
      where: { id: splitId },
      relations: ['participants'],
    });

    if (!split) {
      throw new NotFoundException('Split not found');
    }

    let totalAmount = split.total_amount;

    // Add tax
    if (split.tax_percentage) {
      split.tax_amount = Number((totalAmount * split.tax_percentage) / 100);
      totalAmount += split.tax_amount;
    }

    // Add tip
    if (split.tip_percentage) {
      split.tip_amount = Number((totalAmount * split.tip_percentage) / 100);
      totalAmount += split.tip_amount;
    }

    let amounts: { [userId: string]: number } = {};

    switch (split.split_type) {
      case 'equal':
        amounts = this.calculateEqualSplit(split, totalAmount);
        break;
      case 'percentage':
        amounts = this.calculatePercentageSplit(split, totalAmount);
        break;
      case 'custom':
        amounts = this.calculateCustomSplit(split, totalAmount);
        break;
      case 'weighted':
        amounts = this.calculateWeightedSplit(split, totalAmount);
        break;
      case 'itemized':
        amounts = this.calculateItemizedSplit(split, totalAmount);
        break;
      default:
        throw new BadRequestException('Invalid split type');
    }

    // Validate total matches
    const sumAmounts = Object.values(amounts).reduce((a, b) => a + b, 0);
    if (Math.abs(sumAmounts - totalAmount) > 0.01) {
      throw new InternalServerErrorException('Rounding error in split calculation');
    }

    return amounts;
  }

  private calculateEqualSplit(split: BillSplit, totalAmount: number): { [userId: string]: number } {
    const participantCount = split.participants.length;
    const perPerson = totalAmount / participantCount;
    const amountPerPerson = Math.round(perPerson * 100) / 100;

    // Banker's rounding for remainder
    const remainder = totalAmount - (amountPerPerson * participantCount);

    const amounts: { [userId: string]: number } = {};
    split.participants.forEach((participant, index) => {
      if (index === 0) {
        amounts[participant.participant_id] = amountPerPerson + remainder;
      } else {
        amounts[participant.participant_id] = amountPerPerson;
      }
    });

    return amounts;
  }

  private calculatePercentageSplit(split: BillSplit, totalAmount: number): { [userId: string]: number } {
    const percentages = split.split_data.percentages;
    const amounts: { [userId: string]: number } = {};

    // Validate percentages sum to 100
    const sumPercentages = Object.values(percentages).reduce((a, b) => (a as number) + (b as number), 0);
    if (Math.abs((sumPercentages as number) - 100) > 0.01) {
      throw new BadRequestException('Percentages must sum to 100%');
    }

    Object.entries(percentages).forEach(([userId, percentage]) => {
      amounts[userId] = (totalAmount * (percentage as number)) / 100;
    });

    return amounts;
  }

  private calculateWeightedSplit(split: BillSplit, totalAmount: number): { [userId: string]: number } {
    const weights = split.split_data.weights;
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + (w as number), 0);
    const amounts: { [userId: string]: number } = {};

    Object.entries(weights).forEach(([userId, weight]) => {
      amounts[userId] = (totalAmount * (weight as number)) / totalWeight;
    });

    return amounts;
  }

  private calculateCustomSplit(split: BillSplit, totalAmount: number): { [userId: string]: number } {
    const customAmounts = split.split_data.custom_amounts;
    const sumAmounts = Object.values(customAmounts).reduce((sum, a) => sum + (a as number), 0);

    if (Math.abs((sumAmounts as number) - totalAmount) > 0.01) {
      throw new BadRequestException('Custom amounts must sum to total');
    }

    return customAmounts;
  }

  private calculateItemizedSplit(split: BillSplit, totalAmount: number): { [userId: string]: number } {
    // Group items by participant and sum amounts
    const amounts: { [userId: string]: number } = {};

    split.split_data.items?.forEach(item => {
      item.participants.forEach(participantId => {
        if (!amounts[participantId]) {
          amounts[participantId] = 0;
        }
        amounts[participantId] += item.amount / item.participants.length;
      });
    });

    return amounts;
  }
}
```

**Checklist:**
- [ ] All splitting methods implemented
- [ ] Validation logic implemented
- [ ] Rounding algorithm tested
- [ ] Error handling added

---

## TICKET-36-004: Create Bill Split Endpoints

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-36-001
**Sprint:** Sprint 36

### Description

Implement NestJS controller endpoints for bill split management with proper authorization and error handling.

### Implementation Details

```typescript
// src/social-payments/controllers/bill-split.controller.ts
@Controller('social-payments/splits')
@UseGuards(JwtAuthGuard)
@ApiTags('Social Payments - Bill Splits')
export class BillSplitController {
  constructor(private billSplitService: BillSplitService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new bill split' })
  async createSplit(@Body() dto: CreateBillSplitDto, @Request() req) {
    const split = await this.billSplitService.createSplit(dto, req.user.id);
    return { status: 'success', data: split };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get split details' })
  async getSplit(@Param('id', new ParseUUIDPipe()) id: string) {
    const split = await this.billSplitService.getSplit(id);
    return { status: 'success', data: split };
  }

  @Get()
  @ApiOperation({ summary: 'List my splits' })
  async listSplits(@Query() filters: SplitFiltersDto, @Request() req) {
    const { splits, pagination } = await this.billSplitService.list(req.user.id, filters);
    return { status: 'success', data: { items: splits, pagination } };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update split (draft only)' })
  async updateSplit(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBillSplitDto,
    @Request() req
  ) {
    await this.billSplitService.updateSplit(id, dto, req.user.id);
    return { status: 'success', message: 'Split updated' };
  }

  @Post(':id/calculate')
  @ApiOperation({ summary: 'Calculate split amounts' })
  async calculateSplit(@Param('id', new ParseUUIDPipe()) id: string, @Request() req) {
    const amounts = await this.billSplitService.calculateAmounts(id);
    return { status: 'success', data: amounts };
  }

  @Post(':id/send-requests')
  @ApiOperation({ summary: 'Send payment requests' })
  async sendPaymentRequests(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SendPaymentRequestsDto,
    @Request() req
  ) {
    await this.billSplitService.sendPaymentRequests(id, dto, req.user.id);
    return { status: 'success', message: 'Payment requests sent' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel split' })
  async cancelSplit(@Param('id', new ParseUUIDPipe()) id: string, @Request() req) {
    await this.billSplitService.cancelSplit(id, req.user.id);
    return { status: 'success', message: 'Split cancelled' };
  }
}
```

**Checklist:**
- [ ] All endpoints implemented
- [ ] Validation working
- [ ] Authorization checks in place
- [ ] Error handling complete

---

## TICKET-36-006 through TICKET-36-024 Summary

**Remaining Major Tickets:**

| Ticket | Title | SP | Key Features |
|--------|-------|----|----|
| TICKET-36-006 | Group Collections | 8 | Collection creation, contribution tracking, settlement |
| TICKET-36-007 | Collection Entities | 2 | Collection, Contribution entities |
| TICKET-36-008 | Collection Service | 3 | Contribution logic, settlement, notifications |
| TICKET-36-009 | Collection Endpoints | 2 | Create, list, contribute, settle endpoints |
| TICKET-36-010 | Progress Tracking | 1 | Real-time progress bar, analytics |
| TICKET-36-011 | Payment Distribution | 8 | WhatsApp, SMS, Email, QR, payment links |
| TICKET-36-012 | WhatsApp Integration | 2 | WhatsApp Business API, message delivery |
| TICKET-36-013 | SMS Integration | 2 | Twilio SMS delivery, tracking |
| TICKET-36-014 | Email Integration | 2 | SendGrid emails, templates |
| TICKET-36-015 | QR & Links | 1 | QR generation, payment link service |
| TICKET-36-016 | Reminders | 1 | Auto-reminders before deadline |
| TICKET-36-017 | Settlement & Analytics | 8 | Payout, fraud detection, analytics |
| TICKET-36-018 | Settlement Service | 2 | Process payouts, fee calculation |
| TICKET-36-019 | Analytics | 2 | Splits/collections analytics, reports |
| TICKET-36-020 | Fraud Detection | 2 | Velocity checks, amount validation |
| TICKET-36-021 | Payment Processing | 1 | Integrate with payment system |
| TICKET-36-022 | UI Components | 1 | Dashboard, split wizard, payment status |
| TICKET-36-023 | API Documentation | 1 | Swagger docs, Postman collection |
| TICKET-36-024 | Testing | 2 | Unit + integration + E2E tests (85%+ coverage) |

---

## Testing Strategy

**Unit Tests (40+ tests):**
- Equal, custom, percentage, weighted splits
- Rounding algorithms
- Validation logic
- Settlement calculations
- Fraud detection

**Integration Tests (20+ tests):**
- API endpoints
- Bill split workflow
- Collection workflow
- Payment distribution
- Settlement processing

**E2E Tests (8+ tests):**
- Complete split flow (create → pay → settle)
- Complete collection flow (create → contribute → settle)
- Multi-channel payment distribution
- Fraud detection scenarios

**Performance Tests:**
- Split calculation: < 100ms
- Collection settlement: < 2 seconds
- Message delivery: WhatsApp < 30s, SMS < 1m, Email < 5m

---

## Database Migrations Needed

1. **bill_splits** table
2. **split_participants** table
3. **collections** table
4. **contributions** table
5. **collection_participants** table
6. **payment_requests** table
7. **payment_deliveries** table (for message tracking)

---

## External Dependencies

- WhatsApp Business API
- Twilio (SMS)
- SendGrid (Email)
- AWS S3 (QR code storage)
- Payment gateway integration

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Total Tickets:** 24
**Total Story Points:** 32
**Sprint Status:** Not Started
