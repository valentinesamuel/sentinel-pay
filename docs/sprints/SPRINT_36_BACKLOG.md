# Sprint 36 Backlog - Social Payments (Split Bills & Collections)

**Sprint:** Sprint 36
**Duration:** 2 weeks (Week 72-73)
**Sprint Goal:** Implement comprehensive social payment system for bill splitting and group collections
**Story Points Committed:** 32
**Team Capacity:** 32 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 27-35 (35, 30, 28, 32, 28, 30, 35, 30, 28) = 30.67 SP, committed 32 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 36, we will have:
1. Bill splitting engine (equal, itemized, custom, percentage-based, weighted)
2. Group collection pools for events/gifts
3. Multi-channel payment request distribution (WhatsApp, SMS, email, QR)
4. Payment processing from app users and non-users
5. Automated settlement and payout management
6. Group management with member roles
7. Expense tracking and analytics
8. Money request/response workflow
9. Fraud prevention and security
10. Complete UI/UX for social payments

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Settlement calculation tests passing
- [ ] Fraud detection tests passing
- [ ] API documentation updated (Swagger)
- [ ] Social payments UI functional
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC: Customer Experience & Social Features - Social Payments

## FEATURE-1: Bill Splitting Engine

### 📘 User Story: US-36.1.1 - Bill Splitting with Multiple Methods

**Story ID:** US-36.1.1
**Feature:** FEATURE-1 (Bill Splitting Engine)
**Epic:** Customer Experience & Social Features

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 36
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to split bills with friends using multiple splitting methods
So that we can easily settle expenses and avoid complicated calculations
```

---

#### Business Value

**Value Statement:**
Bill splitting is a massive use case for payment apps. Users frequently split restaurant bills, rent, trips. Easy-to-use splitting with multiple methods drives engagement and transaction volume.

**Impact:**
- **Critical:** Core viral feature (users invite friends to pay them)
- **Volume:** 5-10K splits/month expected
- **Engagement:** Social feature drives daily active users
- **Revenue:** 0.5-1% commission on settlements = ₦100-500K/month

**Success Criteria:**
- Create split in < 200ms
- Support all splitting methods (equal, custom, percentage, weighted, itemized)
- Accurate rounding (prevent ₦0.01 discrepancies)
- Participant management (add/remove users)
- Real-time settlement tracking
- Support for 10+ participants per split

---

#### Acceptance Criteria

**Equal Split:**
- [ ] **AC1:** Divide total amount equally among participants
- [ ] **AC2:** Show per-person amount
- [ ] **AC3:** Calculate split for 2-10 participants
- [ ] **AC4:** Accurate rounding (banker's rounding)
- [ ] **AC5:** Display remainder allocation (if any)

**Itemized Split:**
- [ ] **AC6:** Add line items to bill (food, drinks, service, etc.)
- [ ] **AC7:** Show item price
- [ ] **AC8:** Assign items to participants
- [ ] **AC9:** Auto-calculate per-person total from items
- [ ] **AC10:** Show itemized breakdown per person
- [ ] **AC11:** Receipt attachment support (photo)

**Custom Amount Split:**
- [ ] **AC12:** Specify custom amount per participant
- [ ] **AC13:** Validate amounts sum to total
- [ ] **AC14:** Allow fractional amounts (₦500.50)
- [ ] **AC15:** Manual adjustment of amounts

**Percentage-Based Split:**
- [ ] **AC16:** Set percentage per participant (50%, 30%, 20%)
- [ ] **AC17:** Validate percentages sum to 100%
- [ ] **AC18:** Calculate amounts from percentages
- [ ] **AC19:** Show calculated amounts per person

**Weighted Split:**
- [ ] **AC20:** Assign weights/units per participant
- [ ] **AC21:** Calculate pro-rata share based on weights
- [ ] **AC22:** Support decimal weights (1.5 units)
- [ ] **AC23:** Use case: roommates with different room sizes

**Tax & Tip Handling:**
- [ ] **AC24:** Add tax percentage (7.5% VAT, custom)
- [ ] **AC25:** Auto-split tax across participants
- [ ] **AC26:** Add tip percentage (15%, 20%, custom)
- [ ] **AC27:** Option to split tip or single person pays
- [ ] **AC28:** Show total with tax and tip

**Participant Management:**
- [ ] **AC29:** Add participants (email, phone, in-app user)
- [ ] **AC30:** Remove participant (recalculate amounts)
- [ ] **AC31:** Mark as payer or receiver
- [ ] **AC32:** Assign amount/percentage to participant
- [ ] **AC33:** Reorder participants
- [ ] **AC34:** Save frequently-used groups

**Data Validation & Calculations:**
- [ ] **AC35:** Validate total amount > 0
- [ ] **AC36:** Validate all amounts are positive
- [ ] **AC37:** Prevent rounding errors (sum to exact total)
- [ ] **AC38:** Detect duplicate participants
- [ ] **AC39:** Prevent self-payment (can't split with self)
- [ ] **AC40:** Show calculation breakdown

**Non-Functional:**
- [ ] **AC41:** Create split: < 200ms
- [ ] **AC42:** Calculate amounts: < 100ms
- [ ] **AC43:** Support 1M+ splits
- [ ] **AC44:** UI responsive (mobile, tablet, desktop)

---

#### Technical Specifications

**Bill Split Entity Schema:**

```typescript
@Entity('bill_splits')
export class BillSplit extends BaseEntity {
  @Column('uuid')
  creator_id: string;

  @Column('varchar')
  split_name: string;  // e.g., "Lunch at XYZ Restaurant"

  @Column('decimal', { precision: 15, scale: 2 })
  total_amount: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  tax_percentage: number;  // 7.5, 10, 15

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  tax_amount: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  tip_percentage: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  tip_amount: number;

  @Column({ type: 'enum', enum: SplitType, default: 'equal' })
  split_type: SplitType;  // equal, itemized, custom, percentage, weighted

  @Column({ type: 'jsonb' })
  split_data: {
    items?: Array<{ name: string; amount: number; participants: string[] }>;
    percentages?: { [userId: string]: number };
    weights?: { [userId: string]: number };
    custom_amounts?: { [userId: string]: number };
  };

  @Column('varchar', { nullable: true })
  receipt_url: string;  // S3 URL to receipt photo

  @Column({ type: 'enum', enum: SplitStatus, default: 'draft' })
  status: SplitStatus;  // draft, pending, settled, cancelled

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  settled_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  cancelled_at: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => SplitParticipant, sp => sp.bill_split)
  participants: SplitParticipant[];

  @OneToMany(() => Payment, p => p.bill_split)
  payments: Payment[];
}

@Entity('split_participants')
export class SplitParticipant extends BaseEntity {
  @Column('uuid')
  split_id: string;

  @Column('uuid')
  participant_id: string;

  @Column({ type: 'enum', enum: ParticipantRole, default: 'recipient' })
  role: ParticipantRole;  // payer, recipient

  @Column('decimal', { precision: 15, scale: 2 })
  assigned_amount: number;  // Amount assigned to participant

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  paid_amount: number;  // Actual amount paid

  @Column({ type: 'enum', enum: PaymentStatus, default: 'pending' })
  payment_status: PaymentStatus;  // pending, partial, paid

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  paid_at: Date;

  // Relationships
  @ManyToOne(() => BillSplit)
  @JoinColumn({ name: 'split_id' })
  bill_split: BillSplit;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'participant_id' })
  participant: User;
}

enum SplitType {
  EQUAL = 'equal',
  ITEMIZED = 'itemized',
  CUSTOM = 'custom',
  PERCENTAGE = 'percentage',
  WEIGHTED = 'weighted',
}

enum SplitStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SETTLED = 'settled',
  CANCELLED = 'cancelled',
}

enum ParticipantRole {
  PAYER = 'payer',
  RECIPIENT = 'recipient',
}

enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
}
```

**Bill Split Service:**

```typescript
@Injectable()
export class BillSplitService {
  constructor(
    @InjectRepository(BillSplit)
    private splitRepository: Repository<BillSplit>,
    @InjectRepository(SplitParticipant)
    private participantRepository: Repository<SplitParticipant>,
  ) {}

  async createSplit(dto: CreateBillSplitDto, userId: string): Promise<BillSplit> {
    const split = this.splitRepository.create({
      creator_id: userId,
      split_name: dto.split_name,
      total_amount: dto.total_amount,
      tax_percentage: dto.tax_percentage,
      tip_percentage: dto.tip_percentage,
      split_type: dto.split_type,
      split_data: {},
      status: 'draft',
    });

    return await this.splitRepository.save(split);
  }

  async calculateEqualSplit(
    split: BillSplit,
    participantCount: number
  ): Promise<{ [userId: string]: number }> {
    let totalAmount = split.total_amount;

    // Add tax
    if (split.tax_percentage) {
      split.tax_amount = totalAmount * (split.tax_percentage / 100);
      totalAmount += split.tax_amount;
    }

    // Add tip
    if (split.tip_percentage) {
      split.tip_amount = totalAmount * (split.tip_percentage / 100);
      totalAmount += split.tip_amount;
    }

    // Calculate per-person amount
    const perPerson = totalAmount / participantCount;
    const amountPerPerson = Math.round(perPerson * 100) / 100;

    // Handle rounding remainder (banker's rounding)
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

  async calculatePercentageSplit(
    split: BillSplit
  ): Promise<{ [userId: string]: number }> {
    let totalAmount = split.total_amount;

    if (split.tax_percentage) {
      split.tax_amount = totalAmount * (split.tax_percentage / 100);
      totalAmount += split.tax_amount;
    }

    if (split.tip_percentage) {
      split.tip_amount = totalAmount * (split.tip_percentage / 100);
      totalAmount += split.tip_amount;
    }

    const percentages = split.split_data.percentages;
    const amounts: { [userId: string]: number } = {};

    Object.entries(percentages).forEach(([userId, percentage]) => {
      amounts[userId] = (totalAmount * (percentage as number)) / 100;
    });

    return amounts;
  }

  async calculateWeightedSplit(
    split: BillSplit
  ): Promise<{ [userId: string]: number }> {
    let totalAmount = split.total_amount;

    if (split.tax_percentage) {
      split.tax_amount = totalAmount * (split.tax_percentage / 100);
      totalAmount += split.tax_amount;
    }

    if (split.tip_percentage) {
      split.tip_amount = totalAmount * (split.tip_percentage / 100);
      totalAmount += split.tip_amount;
    }

    const weights = split.split_data.weights;
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + (w as number), 0);
    const amounts: { [userId: string]: number } = {};

    Object.entries(weights).forEach(([userId, weight]) => {
      amounts[userId] = (totalAmount * (weight as number)) / totalWeight;
    });

    return amounts;
  }

  async validateSplit(split: BillSplit): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (split.total_amount <= 0) {
      errors.push('Total amount must be greater than 0');
    }

    if (split.participants.length < 2) {
      errors.push('At least 2 participants required');
    }

    // Validate based on split type
    if (split.split_type === 'percentage') {
      const percentages = Object.values(split.split_data.percentages);
      const sum = percentages.reduce((a, b) => (a as number) + (b as number), 0);
      if (Math.abs((sum as number) - 100) > 0.01) {
        errors.push('Percentages must sum to 100%');
      }
    }

    if (split.split_type === 'custom') {
      const amounts = Object.values(split.split_data.custom_amounts);
      const sum = amounts.reduce((a, b) => (a as number) + (b as number), 0);
      if (Math.abs((sum as number) - split.total_amount) > 0.01) {
        errors.push('Custom amounts must sum to total');
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
```

**API Endpoints:**

```typescript
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
    const splits = await this.billSplitService.listSplits(req.user.id, filters);
    return { status: 'success', data: splits };
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
  async calculateSplit(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req
  ) {
    const amounts = await this.billSplitService.calculateAmounts(id, req.user.id);
    return { status: 'success', data: amounts };
  }

  @Post(':id/send-requests')
  @ApiOperation({ summary: 'Send payment requests to participants' })
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
  async cancelSplit(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req
  ) {
    await this.billSplitService.cancelSplit(id, req.user.id);
    return { status: 'success', message: 'Split cancelled' };
  }
}
```

**Create Split Request/Response:**

```typescript
interface CreateBillSplitDto {
  split_name: string;
  total_amount: number;
  split_type: 'equal' | 'itemized' | 'custom' | 'percentage' | 'weighted';
  tax_percentage?: number;
  tip_percentage?: number;
  participant_ids: string[];  // Email, phone, or user IDs
  split_data?: {
    items?: Array<{ name: string; amount: number; participants: string[] }>;
    percentages?: { [userId: string]: number };
    weights?: { [userId: string]: number };
    custom_amounts?: { [userId: string]: number };
  };
  receipt_url?: string;
}

// Response
{
  "status": "success",
  "data": {
    "id": "split-uuid-123",
    "creator_id": "user-uuid",
    "split_name": "Lunch at XYZ Restaurant",
    "total_amount": 1200,
    "tax_amount": 90,
    "tip_amount": 300,
    "split_type": "equal",
    "status": "draft",
    "participants": [
      {
        "participant_id": "user-uuid-2",
        "assigned_amount": 530,
        "payment_status": "pending"
      },
      {
        "participant_id": "user-uuid-3",
        "assigned_amount": 530,
        "payment_status": "pending"
      }
    ],
    "created_at": "2024-01-20T12:00:00Z"
  }
}
```

---

## FEATURE-2: Group Collections

### 📘 User Story: US-36.2.1 - Group Collections for Events

**Story ID:** US-36.2.1
**Feature:** FEATURE-2 (Group Collections)
**Epic:** Customer Experience & Social Features

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 36
**Status:** 🔄 Not Started

---

#### User Story

```
As an event organizer
I want to collect money from multiple people for group gifts, events, or shared expenses
So that we can easily pool funds and reach collection goals
```

---

#### Business Value

**Value Statement:**
Group collections unlock a new use case: event planning, weddings, team gifts, emergency fundraising. Each collection is a high-value transaction (~₦50K-₦200K average).

**Impact:**
- **High:** 1K-5K collections/month
- **Volume:** High-value transactions (₦50K-₦500K average)
- **Engagement:** Social incentive to share and collect
- **Revenue:** 1-2% fee on collection = ₦1M-5M/month

**Success Criteria:**
- Create collection in < 300ms
- Support up to 100 contributors per collection
- Track contributions in real-time
- Auto-settle when goal reached or deadline expires
- Real-time contribution counter (progress bar)
- Support multiple payment methods

---

#### Acceptance Criteria

**Collection Creation:**
- [ ] **AC1:** Create collection with name, goal amount, deadline
- [ ] **AC2:** Add description and optional photo
- [ ] **AC3:** Set collection type (event, gift, fundraising, project)
- [ ] **AC4:** Choose settlement trigger (goal reached, deadline, manual)
- [ ] **AC5:** Configure who can withdraw funds
- [ ] **AC6:** Support minimum/maximum contribution amounts
- [ ] **AC7:** Allow collection owner to update goal

**Participant Management:**
- [ ] **AC8:** Invite participants (in-app, SMS, email, WhatsApp)
- [ ] **AC9:** Bulk invite from contact list
- [ ] **AC10:** Track participant status (invited, joined, contributed, paid)
- [ ] **AC11:** Show list of contributors and amounts
- [ ] **AC12:** Show who hasn't contributed yet
- [ ] **AC13:** Send reminders to non-contributors
- [ ] **AC14:** Allow participant to contribute multiple times

**Contribution Tracking:**
- [ ] **AC15:** Accept contributions from app users
- [ ] **AC16:** Accept contributions from non-users (via payment link)
- [ ] **AC17:** Support multiple payment methods (wallet, card, bank transfer, mobile money)
- [ ] **AC18:** Partial contributions allowed
- [ ] **AC19:** Real-time contribution updates
- [ ] **AC20:** Show progress toward goal (bar chart)
- [ ] **AC21:** Track contribution dates/times

**Settlement & Payouts:**
- [ ] **AC22:** Auto-settle when goal reached
- [ ] **AC23:** Auto-settle on deadline (even if goal not reached)
- [ ] **AC24:** Manual settlement trigger by owner
- [ ] **AC25:** Option to extend deadline
- [ ] **AC26:** Payout to owner's bank account or wallet
- [ ] **AC27:** Settlement fee transparency (show fee before settling)
- [ ] **AC28:** Settlement history and receipt

**Collection Notifications:**
- [ ] **AC29:** Notification when collection created
- [ ] **AC30:** Notification on new contribution
- [ ] **AC31:** Reminder notifications to non-contributors
- [ ] **AC32:** Notification when goal reached
- [ ] **AC33:** Notification when deadline approaching (24h before)
- [ ] **AC34:** Notification on settlement completion

**Non-Functional:**
- [ ] **AC35:** Create collection: < 300ms
- [ ] **AC36:** Process contribution: < 500ms
- [ ] **AC37:** Settlement calculation: < 2 seconds
- [ ] **AC38:** Support 100K+ collections
- [ ] **AC39:** Handle 1M+ contributions/month

---

#### Technical Specifications

**Collection Entity Schema:**

```typescript
@Entity('collections')
export class Collection extends BaseEntity {
  @Column('uuid')
  creator_id: string;

  @Column('varchar')
  collection_name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { nullable: true })
  image_url: string;

  @Column('decimal', { precision: 15, scale: 2 })
  goal_amount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  current_amount: number;

  @Column('integer', default: 0 })
  contributor_count: number;

  @Column({ type: 'enum', enum: CollectionType })
  collection_type: CollectionType;  // event, gift, fundraising, project

  @Column('timestamp with time zone')
  deadline: Date;

  @Column({ type: 'enum', enum: CollectionStatus, default: 'active' })
  status: CollectionStatus;  // active, completed, settled, cancelled

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  min_contribution: number;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  max_contribution: number;

  @Column({ type: 'enum', enum: SettlementTrigger, default: 'manual' })
  settlement_trigger: SettlementTrigger;  // goal_reached, deadline, manual

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  settled_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  cancelled_at: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => Contribution, c => c.collection)
  contributions: Contribution[];

  @OneToMany(() => CollectionParticipant, cp => cp.collection)
  participants: CollectionParticipant[];
}

@Entity('contributions')
export class Contribution extends BaseEntity {
  @Column('uuid')
  collection_id: string;

  @Column('uuid')
  contributor_id: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column('varchar', nullable: true)
  contributor_name: string;  // For non-users

  @Column('varchar', nullable: true)
  contributor_email: string;

  @Column('varchar', nullable: true)
  contributor_phone: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: 'pending' })
  payment_status: PaymentStatus;  // pending, completed, failed

  @Column('varchar', nullable: true)
  payment_method: string;  // wallet, card, bank_transfer, mobile_money

  @Column('timestamp with time zone')
  contributed_at: Date;

  @Column('varchar', nullable: true)
  notes: string;

  // Relationships
  @ManyToOne(() => Collection)
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'contributor_id' })
  contributor: User;
}

enum CollectionType {
  EVENT = 'event',
  GIFT = 'gift',
  FUNDRAISING = 'fundraising',
  PROJECT = 'project',
}

enum CollectionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SETTLED = 'settled',
  CANCELLED = 'cancelled',
}

enum SettlementTrigger {
  GOAL_REACHED = 'goal_reached',
  DEADLINE = 'deadline',
  MANUAL = 'manual',
}
```

**Collection Service:**

```typescript
@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    @InjectRepository(Contribution)
    private contributionRepository: Repository<Contribution>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createCollection(
    dto: CreateCollectionDto,
    userId: string
  ): Promise<Collection> {
    const collection = this.collectionRepository.create({
      creator_id: userId,
      collection_name: dto.collection_name,
      description: dto.description,
      goal_amount: dto.goal_amount,
      collection_type: dto.collection_type,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      settlement_trigger: dto.settlement_trigger || 'manual',
      status: 'active',
    });

    return await this.collectionRepository.save(collection);
  }

  async contributeToCollection(
    collectionId: string,
    dto: ContributeDto,
    userId?: string
  ): Promise<Contribution> {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.status !== 'active') {
      throw new BadRequestException('Collection is not active');
    }

    // Validate contribution amount
    if (collection.min_contribution && dto.amount < collection.min_contribution) {
      throw new BadRequestException(
        `Minimum contribution is ₦${collection.min_contribution}`
      );
    }

    if (collection.max_contribution && dto.amount > collection.max_contribution) {
      throw new BadRequestException(
        `Maximum contribution is ₦${collection.max_contribution}`
      );
    }

    const contribution = this.contributionRepository.create({
      collection_id: collectionId,
      contributor_id: userId,
      contributor_name: dto.contributor_name,
      contributor_email: dto.contributor_email,
      contributor_phone: dto.contributor_phone,
      amount: dto.amount,
      payment_method: dto.payment_method,
      contributed_at: new Date(),
      notes: dto.notes,
      payment_status: 'completed',
    });

    await this.contributionRepository.save(contribution);

    // Update collection
    collection.current_amount += dto.amount;
    collection.contributor_count += 1;
    await this.collectionRepository.save(collection);

    // Emit event
    this.eventEmitter.emit('contribution.made', {
      collection,
      contribution,
    });

    // Check if goal reached
    if (collection.settlement_trigger === 'goal_reached' &&
        collection.current_amount >= collection.goal_amount) {
      await this.settleCollection(collectionId);
    }

    return contribution;
  }

  async settleCollection(collectionId: string): Promise<void> {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.status === 'settled') {
      throw new BadRequestException('Collection already settled');
    }

    // Update collection status
    collection.status = 'settled';
    collection.settled_at = new Date();
    await this.collectionRepository.save(collection);

    // Emit settlement event
    this.eventEmitter.emit('collection.settled', {
      collection,
      amount: collection.current_amount,
    });
  }

  async getCollectionProgress(collectionId: string): Promise<any> {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
      relations: ['contributions'],
    });

    return {
      collection_name: collection.collection_name,
      goal_amount: collection.goal_amount,
      current_amount: collection.current_amount,
      progress_percentage: (collection.current_amount / collection.goal_amount) * 100,
      contributor_count: collection.contributor_count,
      status: collection.status,
      contributions: collection.contributions,
      time_remaining: collection.deadline.getTime() - new Date().getTime(),
    };
  }
}
```

---

## FEATURE-3: Payment Request Distribution

### 📘 User Story: US-36.3.1 - Multi-Channel Payment Distribution

**Story ID:** US-36.3.1
**Feature:** FEATURE-3 (Payment Request Distribution)
**Epic:** Customer Experience & Social Features

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 36
**Status:** 🔄 Not Started

---

#### User Story

```
As a split initiator or collection creator
I want to send payment requests via multiple channels (WhatsApp, SMS, Email)
So that participants can easily pay their share without friction
```

---

#### Business Value

**Value Statement:**
Multi-channel distribution is key to adoption. Users don't all use the app, so we need to reach them where they are: WhatsApp (90M+ Nigerian users), SMS (universal), email.

**Impact:**
- **High:** Enables peer-to-peer payments even with non-users
- **Volume:** Increases conversion from 20% to 60% (with WhatsApp)
- **Engagement:** WhatsApp links have 40% click-through rate

**Success Criteria:**
- Send payment requests in < 1 second
- WhatsApp delivery within 30 seconds
- SMS delivery within 1 minute
- Email delivery within 5 minutes
- Track delivery status
- Support request reminders

---

#### Acceptance Criteria

**WhatsApp Payment Requests:**
- [ ] **AC1:** Send payment request via WhatsApp Business API
- [ ] **AC2:** Include clickable payment link
- [ ] **AC3:** Auto-generate message template ("John Doe requested ₦250 for lunch")
- [ ] **AC4:** Support custom message
- [ ] **AC5:** Track message delivery status (sent, delivered, read)
- [ ] **AC6:** Include payment link that redirects to app
- [ ] **AC7:** Non-users can pay via payment link

**SMS Payment Requests:**
- [ ] **AC8:** Send SMS with short URL and amount
- [ ] **AC9:** SMS format: "Payment request: ₦250 for Lunch. Pay here: [link]"
- [ ] **AC10:** Support custom SMS template
- [ ] **AC11:** Track SMS delivery (sent, delivered)
- [ ] **AC12:** Short URL tracking (include ref parameter)
- [ ] **AC13:** Support up to 160 characters

**Email Payment Requests:**
- [ ] **AC14:** Send professional HTML email
- [ ] **AC15:** Include payment button/link
- [ ] **AC16:** Show split/collection details
- [ ] **AC17:** Show deadline/goal
- [ ] **AC18:** Support custom email template
- [ ] **AC19:** Track email open/click rate

**QR Code Sharing:**
- [ ] **AC20:** Generate QR code for payment link
- [ ] **AC21:** Support QR code download (PNG, SVG)
- [ ] **AC22:** Print-friendly QR code
- [ ] **AC23:** Share QR code on social media

**Payment Link Features:**
- [ ] **AC24:** Public payment link (no auth required)
- [ ] **AC25:** Pre-fill amount and description
- [ ] **AC26:** Payment link valid until deadline
- [ ] **AC27:** Track link clicks and conversion
- [ ] **AC28:** Show split/collection progress on link

**Reminder Functionality:**
- [ ] **AC29:** Send reminders 24h before deadline
- [ ] **AC30:** Send reminders 1h before deadline
- [ ] **AC31:** Configurable reminder frequency
- [ ] **AC32:** Only remind non-payers
- [ ] **AC33:** Suppress reminders if already paid

**Bulk Distribution:**
- [ ] **AC34:** Send to multiple participants at once
- [ ] **AC35:** Choose channels per participant
- [ ] **AC36:** Batch send (100+ messages)
- [ ] **AC37:** Show send progress/status

**Non-Functional:**
- [ ] **AC38:** Send request: < 1 second
- [ ] **AC39:** WhatsApp delivery: < 30 seconds
- [ ] **AC40:** SMS delivery: < 1 minute
- [ ] **AC41:** Email delivery: < 5 minutes
- [ ] **AC42:** Support 10K+ requests/day
- [ ] **AC43:** Track 100K+ message deliveries

---

## Summary of Sprint 36 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-36.1.1 | Bill Splitting Engine | 8 | P0 | To Do |
| US-36.2.1 | Group Collections | 8 | P0 | To Do |
| US-36.3.1 | Payment Distribution | 8 | P0 | To Do |
| US-36.4.1 | Settlement, Analytics & Fraud | 8 | P0 | To Do |
| **Total** | | **32** | | |

---

## Dependencies

**External:**
- WhatsApp Business API
- Twilio (SMS)
- SendGrid (Email)
- AWS S3 (QR code storage)
- Firebase Cloud Messaging (push notifications)

**Internal:**
- Wallet system (Sprint 4-5)
- Payment processing (Sprint 8)
- Notification system (Sprint 7)
- User management (Sprint 1-3)
- Batch payments (Sprint 27)

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-36.1 | WhatsApp API rate limiting | Medium | High | Implement queue, retry logic |
| RISK-36.2 | Rounding errors in splits | Low | High | Extensive unit tests, banker's rounding |
| RISK-36.3 | Payment non-completion | Medium | Medium | Automated reminders, retry logic |
| RISK-36.4 | Collection settlement disputes | Medium | Medium | Clear terms, dispute resolution |
| RISK-36.5 | Non-user payment link abuse | Medium | Low | Rate limiting, fraud detection |

---

## Notes & Decisions

**Technical Decisions:**
1. **WhatsApp:** WhatsApp Business API (official channel)
2. **SMS:** Twilio for reliability and scalability
3. **Email:** SendGrid for deliverability
4. **Rounding:** Banker's rounding (round-to-nearest-even)
5. **Settlement:** Immediate to wallet, T+1 to bank account

**Open Questions:**
1. ❓ Should split organizer always be a payer? **Decision: No, can be recipient**
2. ❓ Max participants per split? **Decision: 10 for MVP, scale to 100**
3. ❓ Should we charge commission? **Decision: Yes, 0.5-1% on settlements**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Implement complete social payments platform with bill splitting and collections
