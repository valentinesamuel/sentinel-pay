# Sprint 37 Backlog - Escrow Services

**Sprint:** Sprint 37
**Duration:** 2 weeks (Week 74-75)
**Sprint Goal:** Implement secure escrow transaction system with milestone-based releases, dispute resolution, and arbitration
**Story Points Committed:** 28
**Team Capacity:** 28 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of previous sprints = 30 SP, committed 28 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 37, we will have:
1. Secure escrow transaction creation and management
2. Milestone-based payment release system
3. Comprehensive dispute management and resolution
4. Arbitration workflow (automated and manual)
5. Real-time fund status tracking and notifications
6. Escrow analytics and reporting dashboard
7. Integration templates for marketplaces (e-commerce, freelance, real estate)
8. Full compliance with CBN fund segregation requirements
9. Appeal process for dispute resolution

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met (151+ ACs)
- [ ] Unit tests written and passing (85+ coverage)
- [ ] Integration tests passing (48+ tests)
- [ ] E2E tests passing (16+ tests)
- [ ] Fund segregation verified
- [ ] Audit trail logging tested
- [ ] API documentation updated (Swagger)
- [ ] Escrow dashboard UI functional
- [ ] Compliance checklist completed
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-16: Escrow Services & Trust

## FEATURE-16.1: Escrow Transaction Management

### 📘 User Story: US-37.1.1 - Escrow Transaction Creation & Setup

**Story ID:** US-37.1.1
**Feature:** FEATURE-16.1 (Escrow Transaction Management)
**Epic:** EPIC-16 (Escrow Services & Trust)

**Story Points:** 7
**Priority:** P0 (Critical)
**Sprint:** Sprint 37
**Status:** 🔄 Not Started

---

#### User Story

```
As a buyer or seller
I want to create secure escrow transactions with defined terms and milestones
So that both parties have confidence in high-value exchanges
```

---

#### Business Value

**Value Statement:**
Escrow services are critical for building trust in P2P transactions. By securely holding funds until both parties agree, we enable high-value transactions that would otherwise be risky. This opens new market segments (freelance, real estate, vehicles) and increases transaction volumes.

**Impact:**
- **Market Expansion:** Enable ₦100M-500M under management
- **Trust:** 90%+ customer satisfaction with dispute resolution
- **Revenue:** 1-3% escrow fees = ₦1M-5M/month from 1K-5K transactions
- **Risk Mitigation:** Reduce fraud in high-value P2P transactions

**Success Criteria:**
- Create escrow in < 300ms
- Fund lockup in < 1 second
- 99.99% fund security (no losses)
- Support 5K concurrent escrows
- Full audit trail for compliance

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Create escrow transaction (buyer, seller, amount, description)
- [ ] **AC2:** Support 2-party escrow (buyer-seller)
- [ ] **AC3:** Support 3-party escrow (with intermediary)
- [ ] **AC4:** Set escrow deadline/expiration
- [ ] **AC5:** Define escrow terms and conditions
- [ ] **AC6:** Create milestone-based escrow (Phase 1, Phase 2)
- [ ] **AC7:** Set fee amount (1-3% of transaction)
- [ ] **AC8:** Attach receipt/contract (PDF upload)
- [ ] **AC9:** Bulk escrow creation (for marketplaces)
- [ ] **AC10:** Generate unique escrow reference number
- [ ] **AC11:** Assign arbitrator/intermediary
- [ ] **AC12:** Create custom escrow templates (e-commerce, freelance, real estate, vehicle, service, rental)
- [ ] **AC13:** Clone existing escrow as template
- [ ] **AC14:** View all escrow transactions (buyer, seller, arbitrator perspectives)
- [ ] **AC15:** Edit escrow (before funding)
- [ ] **AC16:** Cancel escrow (before funding)
- [ ] **AC17:** Archive completed escrow
- [ ] **AC18:** Support multiple escrows between same parties
- [ ] **AC19:** Escrow metadata storage (terms, conditions, contacts)
- [ ] **AC20:** Escrow creation validation (amount > 0, parties different, KYC verified)

**Milestones:**
- [ ] **AC21:** Define payment milestones within escrow
- [ ] **AC22:** Set milestone conditions (text description)
- [ ] **AC23:** Set milestone release date/trigger
- [ ] **AC24:** Milestone amounts (e.g., 50% Phase 1, 50% Phase 2)
- [ ] **AC25:** Support threshold-based releases (₦5K increments)
- [ ] **AC26:** Auto-milestone creation from templates

**Non-Functional:**
- [ ] **AC27:** Create escrow < 300ms
- [ ] **AC28:** Support 5K concurrent escrows
- [ ] **AC29:** Escrow data persistence and recovery
- [ ] **AC30:** Encryption of sensitive escrow data
- [ ] **AC31:** Audit log all escrow creation events

---

#### Technical Specifications

**Escrow Transaction Entity:**

```typescript
@Entity('escrow_transactions')
export class EscrowTransaction extends BaseEntity {
  @Column('uuid')
  buyer_id: string;

  @Column('uuid')
  seller_id: string;

  @Column('uuid', { nullable: true })
  intermediary_id: string;  // For 3-party escrow

  @Column('varchar', { unique: true })
  escrow_reference: string;  // e.g., ESC-20240115-001

  @Column('decimal', { precision: 15, scale: 2 })
  escrow_amount: number;

  @Column('decimal', { precision: 15, scale: 2 })
  escrow_fee: number;

  @Column('decimal', { precision: 5, scale: 2 })
  fee_percentage: number;  // 1-3%

  @Column('varchar')
  escrow_type: EscrowType;  // '2_party', '3_party'

  @Column('varchar')
  currency: string;  // Default: 'NGN'

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  terms_and_conditions: string;

  @Column({ type: 'enum', enum: EscrowStatus, default: 'created' })
  status: EscrowStatus;  // 'created', 'funded', 'in_progress', 'pending_release', 'released', 'disputed', 'resolved', 'refunded'

  @Column('date')
  deadline: Date;

  @Column('date', { nullable: true })
  release_date: Date;

  @Column('varchar', { nullable: true })
  contract_url: string;  // PDF of contract

  @Column({ type: 'enum', enum: DisputeEscalationLevel, default: 'none' })
  escalation_level: DisputeEscalationLevel;  // 'none', 'pending', 'arbitrator', 'legal'

  @Column('uuid', { nullable: true })
  assigned_arbitrator_id: string;

  @Column('boolean', { default: false })
  auto_release_enabled: boolean;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  updated_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  funded_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  released_at: Date;

  @OneToMany(() => EscrowMilestone, em => em.escrow)
  milestones: EscrowMilestone[];

  @OneToMany(() => EscrowFundMovement, efm => efm.escrow)
  fund_movements: EscrowFundMovement[];

  @OneToMany(() => Dispute, d => d.escrow)
  disputes: Dispute[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'intermediary_id' })
  intermediary: User;
}
```

**Escrow Milestone Entity:**

```typescript
@Entity('escrow_milestones')
export class EscrowMilestone extends BaseEntity {
  @Column('uuid')
  escrow_id: string;

  @Column('varchar')
  milestone_name: string;  // e.g., "Phase 1: Delivery", "50% Deposit"

  @Column('decimal', { precision: 15, scale: 2 })
  milestone_amount: number;

  @Column('text', { nullable: true })
  condition_description: string;  // e.g., "Delivery confirmed by buyer"

  @Column('date')
  release_date: Date;

  @Column('integer', { nullable: true })
  release_days_from_funded: number;  // Auto-release after X days from funding

  @Column({ type: 'enum', enum: MilestoneStatus, default: 'pending' })
  status: MilestoneStatus;  // 'pending', 'approved_by_buyer', 'released', 'disputed'

  @Column('timestamp with time zone', { nullable: true })
  approved_at: Date;

  @Column('uuid', { nullable: true })
  approved_by: string;

  @Column('timestamp with time zone', { nullable: true })
  released_at: Date;

  @Column('boolean', { default: false })
  auto_release_triggered: boolean;

  @ManyToOne(() => EscrowTransaction)
  @JoinColumn({ name: 'escrow_id' })
  escrow: EscrowTransaction;
}
```

**Escrow Service:**

```typescript
@Injectable()
export class EscrowService {
  constructor(
    @InjectRepository(EscrowTransaction)
    private escrowRepository: Repository<EscrowTransaction>,
    @InjectRepository(EscrowMilestone)
    private milestoneRepository: Repository<EscrowMilestone>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private fundManagementService: FundManagementService,
    private notificationService: NotificationService,
  ) {}

  async createEscrow(dto: CreateEscrowDto): Promise<EscrowTransaction> {
    // Validate both parties are KYC verified
    const buyer = await this.userRepository.findOne({
      where: { id: dto.buyer_id },
    });
    const seller = await this.userRepository.findOne({
      where: { id: dto.seller_id },
    });

    if (!buyer || !seller) {
      throw new NotFoundException('Buyer or Seller not found');
    }

    if (!buyer.kyc_verified || !seller.kyc_verified) {
      throw new BadRequestException('Both parties must be KYC verified for escrow');
    }

    if (dto.escrow_amount <= 0) {
      throw new BadRequestException('Escrow amount must be positive');
    }

    // Calculate fee
    const feePercentage = this.calculateFeePercentage(dto.escrow_amount);
    const escrowFee = (dto.escrow_amount * feePercentage) / 100;

    // Generate unique reference
    const reference = `ESC-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const escrow = this.escrowRepository.create({
      buyer_id: dto.buyer_id,
      seller_id: dto.seller_id,
      intermediary_id: dto.intermediary_id,
      escrow_reference: reference,
      escrow_amount: dto.escrow_amount,
      escrow_fee: escrowFee,
      fee_percentage: feePercentage,
      escrow_type: dto.intermediary_id ? '3_party' : '2_party',
      description: dto.description,
      terms_and_conditions: dto.terms_and_conditions,
      deadline: dto.deadline,
      currency: dto.currency || 'NGN',
      status: 'created',
      auto_release_enabled: dto.auto_release_enabled || true,
    });

    const savedEscrow = await this.escrowRepository.save(escrow);

    // Create milestones if provided
    if (dto.milestones && dto.milestones.length > 0) {
      for (const milestoneDto of dto.milestones) {
        const milestone = this.milestoneRepository.create({
          escrow_id: savedEscrow.id,
          milestone_name: milestoneDto.milestone_name,
          milestone_amount: milestoneDto.milestone_amount,
          condition_description: milestoneDto.condition_description,
          release_date: milestoneDto.release_date,
          release_days_from_funded: milestoneDto.release_days_from_funded,
          status: 'pending',
        });

        await this.milestoneRepository.save(milestone);
      }
    }

    // Create audit log
    await this.createAuditLog(
      savedEscrow.id,
      'ESCROW_CREATED',
      `Escrow created for ₦${dto.escrow_amount} between ${buyer.email} and ${seller.email}`,
    );

    // Send notifications
    await this.notificationService.sendNotification(
      dto.buyer_id,
      ['in_app', 'email'],
      {
        title: 'Escrow Created',
        message: `Escrow transaction ${reference} created for ₦${dto.escrow_amount}. Please review terms and fund the escrow.`,
        type: 'escrow_created',
      },
    );

    await this.notificationService.sendNotification(
      dto.seller_id,
      ['in_app', 'email'],
      {
        title: 'Escrow Created',
        message: `Escrow transaction ${reference} created for ₦${dto.escrow_amount}. Please review terms. Funds will be held once buyer funds.`,
        type: 'escrow_created',
      },
    );

    return savedEscrow;
  }

  async fundEscrow(
    escrowId: string,
    buyerId: string,
    fundingMethod: 'wallet' | 'card' | 'bank_transfer',
  ): Promise<EscrowTransaction> {
    const escrow = await this.escrowRepository.findOne({
      where: { id: escrowId, buyer_id: buyerId },
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found or unauthorized');
    }

    if (escrow.status !== 'created') {
      throw new BadRequestException('Escrow already funded or completed');
    }

    if (new Date() > escrow.deadline) {
      throw new BadRequestException('Escrow deadline has passed');
    }

    // Deduct funds from buyer's account
    const totalAmount = escrow.escrow_amount + escrow.escrow_fee;
    await this.fundManagementService.deductFromBuyerWallet(buyerId, totalAmount);

    // Transfer to segregated escrow account
    await this.fundManagementService.transferToEscrowAccount(
      escrow.escrow_amount,
      escrow.escrow_reference,
    );

    // Update escrow status
    escrow.status = 'in_progress';
    escrow.funded_at = new Date();

    await this.escrowRepository.save(escrow);

    // Create fund movement record
    await this.createFundMovement(
      escrowId,
      'FUND_LOCKED',
      escrow.escrow_amount,
      buyerId,
    );

    // Create audit log
    await this.createAuditLog(
      escrowId,
      'ESCROW_FUNDED',
      `Escrow funded with ₦${escrow.escrow_amount} via ${fundingMethod}`,
    );

    // Send notifications
    await this.notificationService.sendNotification(
      buyerId,
      ['in_app', 'email', 'sms'],
      {
        title: 'Escrow Funded',
        message: `Funds (₦${escrow.escrow_amount}) have been securely held in escrow. Waiting for seller to fulfill.`,
        type: 'escrow_funded',
      },
    );

    await this.notificationService.sendNotification(
      escrow.seller_id,
      ['in_app', 'email'],
      {
        title: 'Escrow Funded',
        message: `Buyer has funded the escrow for ₦${escrow.escrow_amount}. Please proceed with order fulfillment.`,
        type: 'escrow_funded',
      },
    );

    return escrow;
  }

  async getEscrowStatus(escrowId: string): Promise<EscrowStatusDto> {
    const escrow = await this.escrowRepository.findOne({
      where: { id: escrowId },
      relations: ['milestones', 'disputes'],
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }

    const releasedAmount = await this.calculateReleasedAmount(escrowId);
    const remainingAmount = escrow.escrow_amount - releasedAmount;

    return {
      escrow_id: escrow.id,
      reference: escrow.escrow_reference,
      status: escrow.status,
      amount: escrow.escrow_amount,
      fee: escrow.escrow_fee,
      released_amount: releasedAmount,
      remaining_amount: remainingAmount,
      deadline: escrow.deadline,
      created_at: escrow.created_at,
      funded_at: escrow.funded_at,
      milestones: escrow.milestones.map(m => ({
        name: m.milestone_name,
        amount: m.milestone_amount,
        status: m.status,
        release_date: m.release_date,
      })),
      has_dispute: escrow.disputes.some(d => d.status !== 'resolved'),
      timeline: this.generateTimeline(escrow),
    };
  }

  private calculateFeePercentage(amount: number): number {
    // Tiered fee structure
    if (amount <= 50000) return 2.5;  // 2.5%
    if (amount <= 500000) return 2.0; // 2%
    return 1.5;  // 1.5% for amounts > ₦500K
  }

  private async calculateReleasedAmount(escrowId: string): Promise<number> {
    const movements = await this.getFundMovements(
      escrowId,
      'RELEASED',
    );

    return movements.reduce((sum, m) => sum + m.amount, 0);
  }

  private async createAuditLog(
    escrowId: string,
    eventType: string,
    description: string,
  ): Promise<void> {
    // Log to audit trail for compliance
    console.log(`[ESCROW AUDIT] ${escrowId} - ${eventType}: ${description}`);
  }

  private async createFundMovement(
    escrowId: string,
    movementType: string,
    amount: number,
    initiatedBy: string,
  ): Promise<void> {
    // Record fund movement for tracking
    console.log(`[FUND MOVEMENT] ${escrowId} - ${movementType}: ₦${amount}`);
  }

  private generateTimeline(escrow: EscrowTransaction): any[] {
    const timeline = [];

    timeline.push({
      event: 'Escrow Created',
      timestamp: escrow.created_at,
      status: 'completed',
    });

    if (escrow.funded_at) {
      timeline.push({
        event: 'Escrow Funded',
        timestamp: escrow.funded_at,
        status: 'completed',
      });
    }

    escrow.milestones?.forEach(m => {
      timeline.push({
        event: m.milestone_name,
        timestamp: m.release_date,
        status: m.status,
      });
    });

    if (escrow.released_at) {
      timeline.push({
        event: 'Escrow Released',
        timestamp: escrow.released_at,
        status: 'completed',
      });
    }

    return timeline;
  }
}
```

---

## FEATURE-16.2: Milestone-Based Release

### 📘 User Story: US-37.2.1 - Milestone-Based Payment Release

**Story ID:** US-37.2.1
**Feature:** FEATURE-16.2 (Milestone-Based Release)
**Epic:** EPIC-16 (Escrow Services & Trust)

**Story Points:** 6
**Priority:** P0 (Critical)
**Sprint:** Sprint 37
**Status:** 🔄 Not Started

---

#### User Story

```
As a buyer or seller
I want to release funds based on agreed milestones
So that payments are tied to delivery and completion of work
```

---

#### Business Value

**Value Statement:**
Milestone-based releases enable complex transactions like freelance projects and real estate deals where work is completed in phases. This reduces risk for both parties and enables high-value collaborations.

**Impact:**
- **Market Expansion:** Enable freelance and project-based transactions
- **Risk Reduction:** Partial releases tied to completion
- **Customer Satisfaction:** Fair payment structure increases trust

**Success Criteria:**
- Approve milestone in < 200ms
- Auto-release on scheduled date
- 99.99% release accuracy
- Support partial releases (e.g., 30%, 70%)

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Buyer approval workflow for milestone release
- [ ] **AC2:** Buyer reviews work, approves milestone
- [ ] **AC3:** Seller can request early release (with buyer approval)
- [ ] **AC4:** Automatic release on milestone date (if no dispute)
- [ ] **AC5:** Partial release (release 30% on confirmation, 70% on delivery)
- [ ] **AC6:** Threshold-based releases (release ₦5K increments as delivered)
- [ ] **AC7:** Milestone status tracking (pending, approved, released, disputed)
- [ ] **AC8:** Prevent release if dispute raised for milestone
- [ ] **AC9:** Multiple milestones per escrow
- [ ] **AC10:** Milestone sequential or independent
- [ ] **AC11:** Grace period notification (48h before auto-release)
- [ ] **AC12:** Request extension (either party can extend deadline)
- [ ] **AC13:** Milestone payment receipt generation
- [ ] **AC14:** View milestone payment history
- [ ] **AC15:** Timeline visualization of milestone progress
- [ ] **AC16:** Failed release handling (retry mechanism)
- [ ] **AC17:** Release approval notification (email, SMS, push)
- [ ] **AC18:** Partial release to multiple recipients (if 3-party)
- [ ] **AC19:** Refund on release failure (after 3 attempts)
- [ ] **AC20:** Milestone amendment (before funding)

**Non-Functional:**
- [ ] **AC21:** Approve milestone < 200ms
- [ ] **AC22:** Auto-release batch job (10K escrows < 10 seconds)
- [ ] **AC23:** Release fund transfer < 500ms
- [ ] **AC24:** Concurrent release handling

---

#### Technical Specifications

**Milestone Release Service:**

```typescript
@Injectable()
export class MilestoneReleaseService {
  constructor(
    @InjectRepository(EscrowMilestone)
    private milestoneRepository: Repository<EscrowMilestone>,
    @InjectRepository(EscrowTransaction)
    private escrowRepository: Repository<EscrowTransaction>,
    private fundManagementService: FundManagementService,
    private notificationService: NotificationService,
  ) {}

  async approveMilestoneRelease(
    milestoneId: string,
    buyerId: string,
  ): Promise<EscrowMilestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
      relations: ['escrow'],
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    // Verify buyer is the one approving
    if (milestone.escrow.buyer_id !== buyerId) {
      throw new ForbiddenException('Only buyer can approve release');
    }

    if (milestone.status !== 'pending') {
      throw new BadRequestException('Milestone already processed');
    }

    milestone.status = 'approved_by_buyer';
    milestone.approved_by = buyerId;
    milestone.approved_at = new Date();

    await this.milestoneRepository.save(milestone);

    // Immediately release funds
    await this.releaseMilestonePayment(milestone);

    return milestone;
  }

  private async releaseMilestonePayment(
    milestone: EscrowMilestone,
  ): Promise<void> {
    const escrow = await this.escrowRepository.findOne({
      where: { id: milestone.escrow_id },
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }

    // Transfer from escrow account to seller
    const success = await this.fundManagementService.transferFromEscrowToSeller(
      escrow.escrow_reference,
      escrow.seller_id,
      milestone.milestone_amount,
    );

    if (!success) {
      throw new InternalServerErrorException('Fund transfer failed');
    }

    milestone.status = 'released';
    milestone.released_at = new Date();

    await this.milestoneRepository.save(milestone);

    // Notify seller of payment
    await this.notificationService.sendNotification(
      escrow.seller_id,
      ['in_app', 'email', 'sms'],
      {
        title: 'Payment Released',
        message: `Milestone "${milestone.milestone_name}" released: ₦${milestone.milestone_amount} transferred to your account`,
        type: 'milestone_released',
      },
    );
  }

  async requestEarlyRelease(
    milestoneId: string,
    sellerId: string,
  ): Promise<EarlyReleaseRequest> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
      relations: ['escrow'],
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (milestone.escrow.seller_id !== sellerId) {
      throw new ForbiddenException('Only seller can request early release');
    }

    // Send approval request to buyer
    await this.notificationService.sendNotification(
      milestone.escrow.buyer_id,
      ['in_app', 'email'],
      {
        title: 'Early Release Request',
        message: `Seller is requesting early release of milestone "${milestone.milestone_name}" (₦${milestone.milestone_amount})`,
        type: 'early_release_request',
      },
    );

    return {
      milestone_id: milestoneId,
      status: 'pending',
      requested_at: new Date(),
    };
  }

  @Cron('0 0 * * *')  // Run daily at midnight
  async autoReleaseScheduledMilestones(): Promise<void> {
    const milestonesToRelease = await this.milestoneRepository.find({
      where: {
        status: 'pending',
        release_date: LessThanOrEqual(new Date()),
        auto_release_triggered: false,
      },
      relations: ['escrow'],
    });

    for (const milestone of milestonesToRelease) {
      try {
        // Check if any disputes exist for this milestone
        const dispute = await this.escrowRepository.findOne({
          where: {
            id: milestone.escrow_id,
            status: 'disputed',
          },
        });

        if (dispute) {
          continue;  // Skip if under dispute
        }

        // Send grace period notification (48h before)
        if (this.isDaysUntil(milestone.release_date, 2)) {
          await this.notificationService.sendNotification(
            milestone.escrow.buyer_id,
            ['in_app', 'email'],
            {
              title: 'Milestone Auto-Release Notice',
              message: `Milestone will auto-release in 48 hours if no dispute is raised`,
              type: 'auto_release_notice',
            },
          );
        } else if (this.isToday(milestone.release_date)) {
          // Release immediately
          await this.releaseMilestonePayment(milestone);
          milestone.auto_release_triggered = true;
          await this.milestoneRepository.save(milestone);
        }
      } catch (error) {
        console.error(`Failed to auto-release milestone ${milestone.id}:`, error);
      }
    }
  }

  async requestExtension(
    milestoneId: string,
    userId: string,
    newReleaseDate: Date,
  ): Promise<EscrowMilestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
      relations: ['escrow'],
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    // Either buyer or seller can request extension
    if (
      milestone.escrow.buyer_id !== userId &&
      milestone.escrow.seller_id !== userId
    ) {
      throw new ForbiddenException('Unauthorized');
    }

    if (newReleaseDate <= milestone.release_date) {
      throw new BadRequestException('New release date must be later than current');
    }

    milestone.release_date = newReleaseDate;

    return await this.milestoneRepository.save(milestone);
  }

  private isDaysUntil(targetDate: Date, days: number): boolean {
    const now = new Date();
    const daysUntil = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil <= days && daysUntil > days - 1;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
}
```

---

## FEATURE-16.3: Dispute Management

### 📘 User Story: US-37.3.1 - Dispute Management & Arbitration

**Story ID:** US-37.3.1
**Feature:** FEATURE-16.3 (Dispute Management)
**Epic:** EPIC-16 (Escrow Services & Trust)

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 37
**Status:** 🔄 Not Started

---

#### User Story

```
As a buyer or seller with a disagreement
I want to raise a dispute and have it resolved fairly
So that both parties' interests are protected
```

---

#### Business Value

**Value Statement:**
Dispute resolution is critical for customer trust. Fair, transparent, and timely resolution builds confidence that escrow is safe. Without good dispute handling, customers won't use escrow for high-value transactions.

**Impact:**
- **Trust:** 90%+ customer satisfaction with dispute resolution
- **Retention:** Good dispute resolution retains customers
- **Compliance:** Required for regulatory approval

**Success Criteria:**
- File dispute in < 200ms
- Resolve 80% of disputes in < 7 days
- 90%+ customer satisfaction with resolution
- Support multiple dispute categories (non-delivery, damaged goods, fraud)

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Raise dispute (buyer or seller can initiate)
- [ ] **AC2:** Select dispute category (non-delivery, damaged goods, service not rendered, fraud, other)
- [ ] **AC3:** Provide dispute description
- [ ] **AC4:** Submit evidence (photos, messages, transaction proofs)
- [ ] **AC5:** Evidence file upload (S3 storage)
- [ ] **AC6:** Dispute timeline (7-14 days resolution window)
- [ ] **AC7:** Both parties can submit evidence
- [ ] **AC8:** Automated dispute resolution (simple cases)
- [ ] **AC9:** Human arbitrator assignment (complex cases)
- [ ] **AC10:** Third-party arbitration option (high-value)
- [ ] **AC11:** Dispute communication thread (messages between parties)
- [ ] **AC12:** Settlement options (50/50 split, full release to seller, full refund to buyer, custom split)
- [ ] **AC13:** Both parties must accept settlement
- [ ] **AC14:** Appeal process (if dissatisfied)
- [ ] **AC15:** Escalation to legal (for unresolved high-value)
- [ ] **AC16:** Dispute status tracking (open, in_resolution, resolved, appealed)
- [ ] **AC17:** Timeline of dispute events
- [ ] **AC18:** Arbitrator notes and decision
- [ ] **AC19:** Dispute resolution receipt/document
- [ ] **AC20:** Prevent new disputes on resolved escrow

**Automation:**
- [ ] **AC21:** Simple disputes auto-resolved (clear evidence)
- [ ] **AC22:** Suspicious transactions flagged (fraud detection)
- [ ] **AC23:** Pattern-based categorization (help arbitrator)

**Non-Functional:**
- [ ] **AC24:** File dispute < 200ms
- [ ] **AC25:** Dispute query performance (100K disputes)
- [ ] **AC26:** Concurrent dispute handling

---

#### Technical Specifications

**Dispute Entity:**

```typescript
@Entity('disputes')
export class Dispute extends BaseEntity {
  @Column('uuid')
  escrow_id: string;

  @Column('uuid')
  dispute_raiser_id: string;  // Buyer or seller who raised dispute

  @Column('uuid', { nullable: true })
  dispute_respondent_id: string;  // Other party

  @Column({ type: 'enum', enum: DisputeCategory })
  dispute_category: DisputeCategory;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount_in_dispute: number;

  @Column({ type: 'enum', enum: DisputeStatus, default: 'open' })
  status: DisputeStatus;

  @Column('integer', { default: 0 })
  evidence_count: number;

  @Column('uuid', { nullable: true })
  assigned_arbitrator_id: string;

  @Column({ type: 'enum', enum: ArbitrationType, nullable: true })
  arbitration_type: ArbitrationType;  // 'automated', 'human', 'third_party'

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  resolved_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  appealed_at: Date;

  @Column('uuid', { nullable: true })
  appeal_arbitrator_id: string;

  @Column('boolean', { default: false })
  is_appeal: boolean;

  @OneToMany(() => DisputeEvidence, de => de.dispute)
  evidence: DisputeEvidence[];

  @OneToMany(() => DisputeResolution, dr => dr.dispute)
  resolutions: DisputeResolution[];

  @ManyToOne(() => EscrowTransaction)
  @JoinColumn({ name: 'escrow_id' })
  escrow: EscrowTransaction;
}
```

**Dispute Service:**

```typescript
@Injectable()
export class DisputeService {
  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    @InjectRepository(DisputeEvidence)
    private evidenceRepository: Repository<DisputeEvidence>,
    @InjectRepository(EscrowTransaction)
    private escrowRepository: Repository<EscrowTransaction>,
    private arbitrationService: ArbitrationService,
    private notificationService: NotificationService,
  ) {}

  async raiseDispute(
    escrowId: string,
    userId: string,
    dto: RaiseDisputeDto,
  ): Promise<Dispute> {
    const escrow = await this.escrowRepository.findOne({
      where: { id: escrowId },
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }

    // Verify user is buyer or seller
    if (escrow.buyer_id !== userId && escrow.seller_id !== userId) {
      throw new ForbiddenException('Only buyer or seller can raise dispute');
    }

    // Check if within dispute window (within deadline + 7 days)
    const disputeDeadline = new Date(escrow.deadline.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (new Date() > disputeDeadline) {
      throw new BadRequestException('Dispute deadline has passed');
    }

    const dispute = this.disputeRepository.create({
      escrow_id: escrowId,
      dispute_raiser_id: userId,
      dispute_respondent_id: userId === escrow.buyer_id ? escrow.seller_id : escrow.buyer_id,
      dispute_category: dto.dispute_category,
      description: dto.description,
      amount_in_dispute: escrow.escrow_amount,
      status: 'open',
    });

    const savedDispute = await this.disputeRepository.save(dispute);

    // Update escrow status
    escrow.status = 'disputed';
    escrow.escalation_level = 'pending';
    await this.escrowRepository.save(escrow);

    // Determine arbitration type based on amount
    const arbitrationType = this.determineArbitrationType(escrow.escrow_amount);
    savedDispute.arbitration_type = arbitrationType;

    // Auto-assign arbitrator for human/third-party disputes
    if (arbitrationType !== 'automated') {
      const arbitrator = await this.arbitrationService.assignArbitrator(
        savedDispute.id,
        arbitrationType,
      );
      savedDispute.assigned_arbitrator_id = arbitrator.id;
    } else {
      // For simple cases, try automated resolution
      await this.arbitrationService.attemptAutomatedResolution(savedDispute.id);
    }

    await this.disputeRepository.save(savedDispute);

    // Notify other party
    const otherPartyId =
      userId === escrow.buyer_id ? escrow.seller_id : escrow.buyer_id;
    await this.notificationService.sendNotification(
      otherPartyId,
      ['in_app', 'email'],
      {
        title: 'Dispute Raised',
        message: `A dispute has been raised for escrow ${escrow.escrow_reference}. Review the details and provide evidence.`,
        type: 'dispute_raised',
      },
    );

    return savedDispute;
  }

  async submitEvidence(
    disputeId: string,
    userId: string,
    dto: SubmitEvidenceDto,
  ): Promise<DisputeEvidence> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['escrow'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    // Verify user is one of the parties
    if (
      dispute.dispute_raiser_id !== userId &&
      dispute.dispute_respondent_id !== userId
    ) {
      throw new ForbiddenException('Unauthorized');
    }

    if (dispute.status !== 'open') {
      throw new BadRequestException('Cannot submit evidence after dispute is closed');
    }

    // Upload evidence file
    const fileUrl = await this.uploadEvidenceFile(dto.file);

    const evidence = this.evidenceRepository.create({
      dispute_id: disputeId,
      submitted_by: userId,
      evidence_type: dto.evidence_type,
      description: dto.description,
      file_url: fileUrl,
      submitted_at: new Date(),
    });

    const savedEvidence = await this.evidenceRepository.save(evidence);

    // Update evidence count
    dispute.evidence_count += 1;
    await this.disputeRepository.save(dispute);

    // Notify arbitrator and other party
    await this.notificationService.sendNotification(
      dispute.dispute_respondent_id,
      ['in_app', 'email'],
      {
        title: 'Evidence Submitted',
        message: 'New evidence has been submitted for the dispute. Review and respond if needed.',
        type: 'evidence_submitted',
      },
    );

    if (dispute.assigned_arbitrator_id) {
      await this.notificationService.sendNotification(
        dispute.assigned_arbitrator_id,
        ['in_app', 'email'],
        {
          title: 'Dispute Evidence Updated',
          message: `New evidence submitted for dispute ${dispute.id}`,
          type: 'dispute_evidence_updated',
        },
      );
    }

    return savedEvidence;
  }

  async getDisputeStatus(disputeId: string): Promise<DisputeStatusDto> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['evidence', 'resolutions', 'escrow'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return {
      dispute_id: dispute.id,
      status: dispute.status,
      category: dispute.dispute_category,
      description: dispute.description,
      amount: dispute.amount_in_dispute,
      created_at: dispute.created_at,
      resolved_at: dispute.resolved_at,
      evidence_count: dispute.evidence_count,
      arbitrator_id: dispute.assigned_arbitrator_id,
      arbitration_type: dispute.arbitration_type,
      timeline: this.generateDisputeTimeline(dispute),
      resolution: dispute.resolutions[0] || null,
    };
  }

  private determineArbitrationType(amount: number): ArbitrationType {
    if (amount <= 50000) {
      return 'automated';  // Simple automated resolution
    } else if (amount <= 500000) {
      return 'human';  // Platform moderator
    } else {
      return 'third_party';  // External arbitrator
    }
  }

  private async uploadEvidenceFile(file: Express.Multer.File): Promise<string> {
    // Upload to S3 and return URL
    const key = `disputes/${Date.now()}-${file.originalname}`;
    return `https://s3.escrow.app/${key}`;
  }

  private generateDisputeTimeline(dispute: Dispute): any[] {
    const timeline = [];

    timeline.push({
      event: 'Dispute Raised',
      timestamp: dispute.created_at,
      status: 'completed',
    });

    if (dispute.evidence && dispute.evidence.length > 0) {
      const firstEvidence = dispute.evidence[0];
      timeline.push({
        event: `Evidence Submitted (${dispute.evidence_count} items)`,
        timestamp: firstEvidence.submitted_at,
        status: 'completed',
      });
    }

    if (dispute.resolved_at) {
      timeline.push({
        event: 'Dispute Resolved',
        timestamp: dispute.resolved_at,
        status: 'completed',
      });
    }

    if (dispute.appealed_at) {
      timeline.push({
        event: 'Appeal Filed',
        timestamp: dispute.appealed_at,
        status: 'pending',
      });
    }

    return timeline;
  }
}
```

---

## FEATURE-16.4: Arbitration & Resolution

### 📘 User Story: US-37.4.1 - Arbitration & Dispute Resolution

**Story ID:** US-37.4.1
**Feature:** FEATURE-16.4 (Arbitration & Resolution)
**Epic:** EPIC-16 (Escrow Services & Trust)

**Story Points:** 7
**Priority:** P0 (Critical)
**Sprint:** Sprint 37
**Status:** 🔄 Not Started

---

#### User Story

```
As a dispute arbitrator
I want to review evidence and make fair decisions
So that disputes are resolved quickly and both parties trust the outcome
```

---

#### Business Value

**Value Statement:**
Arbitration is the key to customer trust. Transparent, fair decision-making builds confidence that escrow disputes are handled justly.

**Impact:**
- **Trust:** 90%+ customer satisfaction with resolution
- **Retention:** Fair arbitration retains customers
- **Speed:** Quick resolution (7 days) keeps users engaged

**Success Criteria:**
- Resolve 80% of disputes in < 7 days
- 90%+ customer satisfaction with resolution
- Support 3 resolution types (automated, human, third-party)
- Appeal success rate < 10%

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Arbitrator receives dispute assignment
- [ ] **AC2:** Arbitrator can review all evidence
- [ ] **AC3:** Arbitrator can request additional evidence
- [ ] **AC4:** Arbitrator can communicate with both parties
- [ ] **AC5:** Settlement proposal (50/50, full release, full refund, custom)
- [ ] **AC6:** Both parties must accept settlement
- [ ] **AC7:** If rejected, arbitrator makes final decision
- [ ] **AC8:** Appeal process (either party can appeal)
- [ ] **AC9:** Appeal reassignment (new arbitrator)
- [ ] **AC10:** Escalation to legal (for unresolved high-value)
- [ ] **AC11:** Resolution documentation generation
- [ ] **AC12:** Arbitrator notes and reasoning
- [ ] **AC13:** Fund release per settlement
- [ ] **AC14:** Arbitrator performance tracking
- [ ] **AC15:** Dispute resolution metrics (cases, time, satisfaction)
- [ ] **AC16:** Prevent arbitrator conflict of interest
- [ ] **AC17:** Blind arbitration (anonymize parties if needed)
- [ ] **AC18:** Case history tracking
- [ ] **AC19:** Resolution appeal history
- [ ] **AC20:** Post-resolution feedback from both parties

**Non-Functional:**
- [ ] **AC21:** Arbitrator assignment < 100ms
- [ ] **AC22:** Resolution proposal < 500ms
- [ ] **AC23:** Fund release < 1 second

---

#### Technical Specifications

**Arbitration Service:**

```typescript
@Injectable()
export class ArbitrationService {
  constructor(
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    @InjectRepository(DisputeResolution)
    private resolutionRepository: Repository<DisputeResolution>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private fundManagementService: FundManagementService,
    private notificationService: NotificationService,
  ) {}

  async assignArbitrator(
    disputeId: string,
    arbitrationType: ArbitrationType,
  ): Promise<User> {
    // Get available arbitrators of the requested type
    const arbitrators = await this.userRepository.find({
      where: {
        role: 'arbitrator',
        arbitrator_type: arbitrationType,
        is_active: true,
      },
      order: { case_count: 'ASC' },  // Load balance: assign to least busy
      take: 1,
    });

    if (arbitrators.length === 0) {
      throw new NotFoundException(`No available arbitrators for type ${arbitrationType}`);
    }

    const arbitrator = arbitrators[0];

    // Assign to dispute
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    dispute.assigned_arbitrator_id = arbitrator.id;
    await this.disputeRepository.save(dispute);

    // Notify arbitrator
    await this.notificationService.sendNotification(
      arbitrator.id,
      ['in_app', 'email'],
      {
        title: 'New Dispute Assigned',
        message: `A new dispute has been assigned to you. Review evidence and provide resolution.`,
        type: 'dispute_assigned',
      },
    );

    return arbitrator;
  }

  async proposeSettlement(
    disputeId: string,
    arbitratorId: string,
    dto: SettlementProposalDto,
  ): Promise<DisputeResolution> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId, assigned_arbitrator_id: arbitratorId },
      relations: ['escrow'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found or not assigned to you');
    }

    // Validate settlement amounts
    const totalAmount = dispute.escrow.escrow_amount;
    if (dto.buyer_payout + dto.seller_payout !== totalAmount) {
      throw new BadRequestException('Settlement amounts do not match escrow amount');
    }

    const resolution = this.resolutionRepository.create({
      dispute_id: disputeId,
      resolution_type: 'settlement_proposal',
      buyer_payout: dto.buyer_payout,
      seller_payout: dto.seller_payout,
      resolved_by: arbitratorId,
      reasoning: dto.reasoning,
      created_at: new Date(),
    });

    const savedResolution = await this.resolutionRepository.save(resolution);

    // Send to both parties for acceptance
    await this.notificationService.sendNotification(
      dispute.escrow.buyer_id,
      ['in_app', 'email'],
      {
        title: 'Settlement Proposal',
        message: `A settlement proposal has been made: You receive ₦${dto.buyer_payout}`,
        type: 'settlement_proposal',
      },
    );

    await this.notificationService.sendNotification(
      dispute.escrow.seller_id,
      ['in_app', 'email'],
      {
        title: 'Settlement Proposal',
        message: `A settlement proposal has been made: You receive ₦${dto.seller_payout}`,
        type: 'settlement_proposal',
      },
    );

    return savedResolution;
  }

  async acceptSettlement(
    resolutionId: string,
    userId: string,
  ): Promise<void> {
    const resolution = await this.resolutionRepository.findOne({
      where: { id: resolutionId },
      relations: ['dispute', 'dispute.escrow'],
    });

    if (!resolution) {
      throw new NotFoundException('Resolution not found');
    }

    const escrow = resolution.dispute.escrow;

    // Track acceptance
    if (!resolution.accepted_by) {
      resolution.accepted_by = [userId];
    } else {
      resolution.accepted_by.push(userId);
    }

    // Check if both parties accepted
    if (resolution.accepted_by.length === 2) {
      // Execute settlement
      await this.executeSettlement(resolution, escrow);
    } else {
      // Notify other party that settlement was accepted
      const otherPartyId =
        userId === escrow.buyer_id ? escrow.seller_id : escrow.buyer_id;
      await this.notificationService.sendNotification(
        otherPartyId,
        ['in_app', 'email'],
        {
          title: 'Settlement Accepted',
          message: 'Other party has accepted the settlement proposal',
          type: 'settlement_accepted',
        },
      );
    }

    await this.resolutionRepository.save(resolution);
  }

  async rejectSettlement(
    resolutionId: string,
    userId: string,
    rejectionReason: string,
  ): Promise<void> {
    const resolution = await this.resolutionRepository.findOne({
      where: { id: resolutionId },
      relations: ['dispute', 'dispute.escrow'],
    });

    if (!resolution) {
      throw new NotFoundException('Resolution not found');
    }

    // Arbitrator makes final decision
    resolution.status = 'arbitrator_decision_pending';
    resolution.rejection_reason = rejectionReason;
    await this.resolutionRepository.save(resolution);

    const arbitrator = await this.userRepository.findOne({
      where: { id: resolution.resolved_by },
    });

    // Notify arbitrator
    await this.notificationService.sendNotification(
      arbitrator.id,
      ['in_app', 'email'],
      {
        title: 'Settlement Rejected',
        message: 'Settlement proposal was rejected. Please make a final decision.',
        type: 'settlement_rejected',
      },
    );
  }

  async makeArbitratorDecision(
    disputeId: string,
    arbitratorId: string,
    dto: ArbitratorDecisionDto,
  ): Promise<DisputeResolution> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId, assigned_arbitrator_id: arbitratorId },
      relations: ['escrow'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const resolution = this.resolutionRepository.create({
      dispute_id: disputeId,
      resolution_type: 'arbitrator_decision',
      buyer_payout: dto.buyer_payout,
      seller_payout: dto.seller_payout,
      resolved_by: arbitratorId,
      reasoning: dto.reasoning,
      created_at: new Date(),
      status: 'resolved',
    });

    const savedResolution = await this.resolutionRepository.save(resolution);

    // Execute the decision
    await this.executeSettlement(savedResolution, dispute.escrow);

    // Update dispute status
    dispute.status = 'resolved';
    dispute.resolved_at = new Date();
    await this.disputeRepository.save(dispute);

    return savedResolution;
  }

  private async executeSettlement(
    resolution: DisputeResolution,
    escrow: EscrowTransaction,
  ): Promise<void> {
    // Release buyer payout
    if (resolution.buyer_payout > 0) {
      await this.fundManagementService.transferFromEscrowToBuyer(
        escrow.escrow_reference,
        escrow.buyer_id,
        resolution.buyer_payout,
      );
    }

    // Release seller payout
    if (resolution.seller_payout > 0) {
      await this.fundManagementService.transferFromEscrowToSeller(
        escrow.escrow_reference,
        escrow.seller_id,
        resolution.seller_payout,
      );
    }

    // Handle fees (platform keeps unused funds or partially refunds)
    const totalPayout = resolution.buyer_payout + resolution.seller_payout;
    const platformFees = escrow.escrow_amount - totalPayout;

    if (platformFees > 0) {
      await this.fundManagementService.transferToFeesAccount(
        escrow.escrow_reference,
        platformFees,
      );
    }

    resolution.status = 'executed';
    resolution.executed_at = new Date();
    await this.resolutionRepository.save(resolution);
  }

  async attemptAutomatedResolution(disputeId: string): Promise<boolean> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['evidence', 'escrow'],
    });

    if (!dispute) {
      return false;
    }

    // For simple cases (small amounts), try 50/50 split
    if (dispute.escrow.escrow_amount <= 50000) {
      const halfAmount = dispute.escrow.escrow_amount / 2;

      const resolution = this.resolutionRepository.create({
        dispute_id: disputeId,
        resolution_type: 'automated_50_50',
        buyer_payout: halfAmount,
        seller_payout: halfAmount,
        reasoning: 'Automated resolution: Equal split for disputed amount',
        created_at: new Date(),
        status: 'resolved',
      });

      const savedResolution = await this.resolutionRepository.save(resolution);
      await this.executeSettlement(savedResolution, dispute.escrow);

      return true;
    }

    return false;
  }
}
```

---

## FEATURE-16.5: Escrow Analytics & Marketplace Integration

### 📘 User Story: US-37.5.1 - Analytics, Reporting & Marketplace Integration

**Story ID:** US-37.5.1
**Feature:** FEATURE-16.5 (Analytics & Integration)
**Epic:** EPIC-16 (Escrow Services & Trust)

**Story Points:** 0 (Covered in stories above)
**Priority:** P1 (High)
**Sprint:** Sprint 37
**Status:** 🔄 Not Started

---

#### User Story

```
As an admin or marketplace
I want to view escrow analytics and integrate escrow into my platform
So that I can manage escrow operations and enable escrow-protected transactions
```

---

#### Business Value

**Value Statement:**
Analytics enable operational visibility and optimization. Marketplace integration opens new revenue channels and enables partners to offer escrow-protected transactions.

**Impact:**
- **Visibility:** Real-time escrow metrics and KPIs
- **Partnership:** Integration with Jumia, Konga, etc.
- **Revenue:** Transaction volume increases with trust

**Success Criteria:**
- Dashboard loads in < 1 second
- Support 100K+ escrows in analytics
- Marketplace API available and documented

---

#### Acceptance Criteria

**Analytics:**
- [ ] **AC1:** Total escrow value under management
- [ ] **AC2:** Average escrow duration
- [ ] **AC3:** Dispute rate by category
- [ ] **AC4:** Resolution success rate
- [ ] **AC5:** Average dispute resolution time
- [ ] **AC6:** Arbitrator performance metrics
- [ ] **AC7:** Fraud incident tracking
- [ ] **AC8:** Revenue from escrow fees
- [ ] **AC9:** Transaction volume trends
- [ ] **AC10:** Dispute trend analysis

**Marketplace Integration:**
- [ ] **AC11:** REST API for marketplace integration
- [ ] **AC12:** Webhook notifications for order status
- [ ] **AC13:** Auto-create escrow on order
- [ ] **AC14:** Auto-release on delivery confirmation
- [ ] **AC15:** Merchant dashboard integration
- [ ] **AC16:** Rate limiting and throttling
- [ ] **AC17:** API authentication and authorization
- [ ] **AC18:** Postman collection for testing
- [ ] **AC19:** API documentation and examples
- [ ] **AC20:** Marketplace onboarding guide

---

## Sprint Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|-----------|
| RISK-37-001 | Fund segregation compliance not met | Low | Critical | Verify with bank and compliance, audit trail logging |
| RISK-37-002 | Dispute resolution taking > 14 days | Medium | High | Implement SLA tracking, escalate to legal on day 10 |
| RISK-37-003 | Arbitrator conflict of interest | Low | High | Implement conflict checking, randomized assignment |
| RISK-37-004 | Fund release failures | Low | High | Implement retry mechanism, manual override capability |
| RISK-37-005 | Concurrent dispute handling bugs | Medium | High | Load testing, pessimistic locking on updates |

---

## Sprint Dependencies

- **Sprint 11** (Payment Processing): Payment processing and fund transfer system must be stable
- **Sprint 29** (Transaction Management): Transaction tracking must work for escrow transactions
- **Sprint 33** (KYC & User Profile): User verification required for escrow participation

---

## Sprint Notes & Decisions

1. **Fund Segregation:** Separate bank account maintained for escrow holdings, verified with bank before go-live
2. **Dispute Resolution:** Start with 50/50 split for automated cases, human arbitrators for complex disputes
3. **Arbitrator Assignment:** Load balance assignment (assign to least busy arbitrator)
4. **Appeal Process:** Single appeal allowed, further escalation to legal/external arbitrator
5. **Compliance:** All transactions logged with audit trail, CBN fund segregation requirements met
6. **Marketplace API:** Initially internal only, external API available Q2 2024

