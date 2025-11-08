# Sprint 15 Backlog - Refunds & Disputes Part 1

**Sprint:** Sprint 15
**Duration:** 2 weeks (Week 31-32)
**Sprint Goal:** Implement comprehensive refund request and processing system with automated workflows, approval management, and financial reconciliation
**Story Points Committed:** 40
**Team Capacity:** 40 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1-14 (45, 42, 38, 45, 48, 45, 42, 45, 45, 45, 45, 45, 35, 38) = 43.1 SP, committed 40 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 15, we will have:
1. Refund request submission for all transaction types
2. Multi-level refund approval workflow
3. Automated refund processing for eligible transactions
4. Partial and full refund support
5. Refund reason categorization and tracking
6. Financial reconciliation for refunds
7. Refund status tracking and notifications
8. Admin dashboard for refund management
9. SLA-based refund processing timelines
10. Refund analytics and reporting

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Refund workflow tests passing
- [ ] Automated refund processing verified
- [ ] Financial reconciliation working
- [ ] API documentation updated (Swagger)
- [ ] Refund notifications working
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-10: Refunds & Disputes

## FEATURE-10.1: Refund Request System

### 📘 User Story: US-15.1.1 - Transaction Refund Request

**Story ID:** US-15.1.1
**Feature:** FEATURE-10.1 (Refund Request System)
**Epic:** EPIC-10 (Refunds & Disputes)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 15
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to request a refund for a failed or incorrect transaction
So that I can recover my money when something goes wrong
```

---

#### Business Value

**Value Statement:**
A robust refund system is critical for customer trust and satisfaction. Quick and transparent refund processing reduces customer support burden, improves retention, and demonstrates platform reliability.

**Impact:**
- **Critical:** Customer trust and satisfaction
- **Retention:** 85% of users more likely to transact again after smooth refund
- **Support:** 60% reduction in support tickets with self-service refunds
- **Compliance:** Required for financial service regulations
- **Brand:** Professional handling builds reputation

**Success Criteria:**
- 90% of refund requests processed within 24 hours
- 95% automated refund rate for eligible transactions
- < 2% refund fraud rate
- 98% user satisfaction with refund process
- Average refund processing time < 4 hours

---

#### Acceptance Criteria

**Refund Request Submission:**
- [ ] **AC1:** User can request refund for any transaction type (payment, transfer, bill, exchange)
- [ ] **AC2:** Select refund reason from predefined categories
- [ ] **AC3:** Provide detailed description (optional)
- [ ] **AC4:** Upload supporting documents (receipts, screenshots)
- [ ] **AC5:** Maximum file size 5MB per document
- [ ] **AC6:** Support image formats (JPG, PNG, PDF)
- [ ] **AC7:** Request tracking reference number
- [ ] **AC8:** Email confirmation on submission

**Refund Eligibility:**
- [ ] **AC9:** Validate transaction exists and belongs to user
- [ ] **AC10:** Check transaction status (completed, failed, pending)
- [ ] **AC11:** Verify refund window (30 days for most transactions)
- [ ] **AC12:** Check if already refunded
- [ ] **AC13:** Validate refund amount
- [ ] **AC14:** KYC verification for refunds > NGN 50,000

**Refund Reasons:**
- [ ] **AC15:** Failed transaction (payment not received)
- [ ] **AC16:** Duplicate transaction
- [ ] **AC17:** Incorrect amount charged
- [ ] **AC18:** Wrong recipient
- [ ] **AC19:** Service not delivered
- [ ] **AC20:** Unauthorized transaction
- [ ] **AC21:** Change of mind (within 24 hours)
- [ ] **AC22:** Technical error
- [ ] **AC23:** Other (with description)

**Status Tracking:**
- [ ] **AC24:** View refund request status
- [ ] **AC25:** Status updates: Submitted, Under Review, Approved, Processing, Completed, Rejected
- [ ] **AC26:** Email notification on status changes
- [ ] **AC27:** Push notification support
- [ ] **AC28:** Estimated completion time display

**Refund Types:**
- [ ] **AC29:** Full refund (100% of transaction amount)
- [ ] **AC30:** Partial refund (specified amount)
- [ ] **AC31:** Refund to original payment method
- [ ] **AC32:** Refund to wallet
- [ ] **AC33:** Fee refund (transaction fees)

---

#### Technical Specifications

**Refund Request Schema:**

```typescript
@Entity('refund_requests')
export class RefundRequest extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  refund_reference: string; // REF-1704900000000-ABC123

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  transaction_id: string;

  @Column({ type: 'varchar', length: 50 })
  transaction_reference: string;

  @Column({
    type: 'enum',
    enum: ['payment', 'transfer', 'bill_payment', 'currency_exchange', 'card_transaction'],
  })
  transaction_type: string;

  @Column({ type: 'bigint' })
  transaction_amount: number;

  @Column({ type: 'bigint' })
  refund_amount: number; // Can be less than transaction amount (partial)

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: [
      'failed_transaction',
      'duplicate_transaction',
      'incorrect_amount',
      'wrong_recipient',
      'service_not_delivered',
      'unauthorized_transaction',
      'change_of_mind',
      'technical_error',
      'other',
    ],
  })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['submitted', 'under_review', 'approved', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'submitted',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['full', 'partial'],
    default: 'full',
  })
  refund_type: string;

  @Column({
    type: 'enum',
    enum: ['original_payment_method', 'wallet', 'bank_transfer'],
    default: 'wallet',
  })
  refund_method: string;

  @Column({ type: 'boolean', default: false })
  is_automated: boolean; // Automated vs manual approval

  @Column({ type: 'varchar', length: 255, nullable: true })
  rejection_reason: string;

  @Column({ type: 'jsonb', nullable: true })
  supporting_documents: Array<{
    file_name: string;
    file_url: string;
    file_type: string;
    uploaded_at: Date;
  }>;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string; // Admin user ID

  @Column({ type: 'timestamp with time zone', nullable: true })
  approved_at: Date;

  @Column({ type: 'uuid', nullable: true })
  processed_by: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  processed_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  rejected_at: Date;

  @Column({ type: 'integer', default: 0 })
  sla_hours: number; // SLA based on transaction type/amount

  @Column({ type: 'timestamp with time zone', nullable: true })
  sla_deadline: Date;

  @Column({ type: 'boolean', default: false })
  sla_breached: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    ip_address?: string;
    device_id?: string;
    user_agent?: string;
    fraud_score?: number;
    risk_level?: string;
  };

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => RefundStatusHistory, history => history.refund_request)
  status_history: RefundStatusHistory[];

  @OneToMany(() => RefundApproval, approval => approval.refund_request)
  approvals: RefundApproval[];

  @Index(['user_id', 'created_at'])
  @Index(['transaction_id'])
  @Index(['status'])
  @Index(['refund_reference'])
  @Index(['sla_deadline'])
}

@Entity('refund_status_history')
export class RefundStatusHistory extends BaseEntity {
  @Column('uuid')
  refund_request_id: string;

  @Column({ type: 'varchar', length: 50 })
  previous_status: string;

  @Column({ type: 'varchar', length: 50 })
  new_status: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'uuid', nullable: true })
  changed_by: string; // User or admin ID

  @Column({ type: 'varchar', length: 50, nullable: true })
  changed_by_type: string; // 'user', 'admin', 'system'

  @ManyToOne(() => RefundRequest, request => request.status_history)
  @JoinColumn({ name: 'refund_request_id' })
  refund_request: RefundRequest;
}

@Entity('refund_approvals')
export class RefundApproval extends BaseEntity {
  @Column('uuid')
  refund_request_id: string;

  @Column({ type: 'integer' })
  approval_level: number; // 1, 2, 3 for multi-level approval

  @Column({ type: 'uuid', nullable: true })
  approver_id: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  actioned_at: Date;

  @ManyToOne(() => RefundRequest, request => request.approvals)
  @JoinColumn({ name: 'refund_request_id' })
  refund_request: RefundRequest;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approver_id' })
  approver: User;
}

@Entity('refund_transactions')
export class RefundTransaction extends BaseEntity {
  @Column('uuid')
  refund_request_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  refund_transaction_reference: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  wallet_transaction_reference: string;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @ManyToOne(() => RefundRequest)
  @JoinColumn({ name: 'refund_request_id' })
  refund_request: RefundRequest;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@Entity('refund_policies')
export class RefundPolicy extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ['payment', 'transfer', 'bill_payment', 'currency_exchange', 'card_transaction'],
  })
  transaction_type: string;

  @Column({ type: 'integer' })
  refund_window_days: number; // Days within which refund can be requested

  @Column({ type: 'boolean', default: false })
  auto_approve_enabled: boolean;

  @Column({ type: 'bigint', nullable: true })
  auto_approve_threshold: number; // Auto-approve if amount below this

  @Column({ type: 'integer', default: 24 })
  sla_hours: number; // Hours to process refund

  @Column({ type: 'jsonb', nullable: true })
  approval_levels: Array<{
    level: number;
    required_for_amount_above: number;
    approver_roles: string[];
  }>;

  @Column({ type: 'jsonb', nullable: true })
  eligible_reasons: string[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
```

**Refund Service:**

```typescript
@Injectable()
export class RefundService {
  constructor(
    @InjectRepository(RefundRequest)
    private refundRepository: Repository<RefundRequest>,
    @InjectRepository(RefundStatusHistory)
    private historyRepository: Repository<RefundStatusHistory>,
    @InjectRepository(RefundApproval)
    private approvalRepository: Repository<RefundApproval>,
    @InjectRepository(RefundTransaction)
    private refundTransactionRepository: Repository<RefundTransaction>,
    @InjectRepository(RefundPolicy)
    private policyRepository: Repository<RefundPolicy>,
    private walletService: WalletService,
    private ledgerService: LedgerService,
    private notificationService: NotificationService,
    private fileStorageService: FileStorageService,
  ) {}

  async createRefundRequest(
    userId: string,
    dto: CreateRefundRequestDto,
  ): Promise<RefundRequest> {
    // Validate transaction
    const transaction = await this.validateTransaction(userId, dto.transaction_id);

    // Check if already refunded
    const existingRefund = await this.refundRepository.findOne({
      where: {
        transaction_id: dto.transaction_id,
        status: In(['submitted', 'under_review', 'approved', 'processing', 'completed']),
      },
    });

    if (existingRefund) {
      throw new ConflictException('Refund request already exists for this transaction');
    }

    // Get refund policy
    const policy = await this.getRefundPolicy(transaction.transaction_type);

    // Validate refund window
    const transactionDate = new Date(transaction.created_at);
    const daysSinceTransaction = Math.floor(
      (Date.now() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceTransaction > policy.refund_window_days) {
      throw new BadRequestException(
        `Refund window has expired. Refunds must be requested within ${policy.refund_window_days} days`
      );
    }

    // Validate refund amount
    if (dto.refund_amount > transaction.amount) {
      throw new BadRequestException('Refund amount cannot exceed transaction amount');
    }

    // Determine refund type
    const refundType = dto.refund_amount === transaction.amount ? 'full' : 'partial';

    // Upload supporting documents
    let supportingDocuments = [];
    if (dto.documents && dto.documents.length > 0) {
      supportingDocuments = await this.uploadDocuments(dto.documents);
    }

    // Calculate SLA
    const slaHours = policy.sla_hours;
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + slaHours);

    // Determine if auto-approvable
    const isAutoApprovable =
      policy.auto_approve_enabled &&
      policy.auto_approve_threshold &&
      dto.refund_amount <= policy.auto_approve_threshold &&
      this.isEligibleForAutoApproval(dto.reason, policy);

    // Create refund request
    const refundRequest = this.refundRepository.create({
      refund_reference: await this.generateReference(),
      user_id: userId,
      transaction_id: dto.transaction_id,
      transaction_reference: transaction.reference,
      transaction_type: transaction.transaction_type,
      transaction_amount: transaction.amount,
      refund_amount: dto.refund_amount,
      currency: transaction.currency,
      reason: dto.reason,
      description: dto.description,
      status: 'submitted',
      refund_type: refundType,
      refund_method: dto.refund_method || 'wallet',
      is_automated: isAutoApprovable,
      supporting_documents: supportingDocuments,
      sla_hours: slaHours,
      sla_deadline: slaDeadline,
      metadata: {
        ip_address: dto.ip_address,
        device_id: dto.device_id,
        user_agent: dto.user_agent,
      },
    });

    await this.refundRepository.save(refundRequest);

    // Create status history
    await this.createStatusHistory(
      refundRequest.id,
      null,
      'submitted',
      'Refund request submitted',
      userId,
      'user'
    );

    // If auto-approvable, process immediately
    if (isAutoApprovable) {
      await this.autoApproveRefund(refundRequest.id);
    } else {
      // Create approval levels
      await this.createApprovalLevels(refundRequest, policy);
    }

    // Send confirmation email
    await this.notificationService.send({
      user_id: userId,
      type: 'refund_request_submitted',
      title: 'Refund Request Submitted',
      message: `Your refund request ${refundRequest.refund_reference} has been submitted and is under review.`,
      channels: ['email', 'push'],
      data: {
        refund_reference: refundRequest.refund_reference,
        amount: refundRequest.refund_amount,
        currency: refundRequest.currency,
      },
    });

    return refundRequest;
  }

  private async validateTransaction(
    userId: string,
    transactionId: string,
  ): Promise<any> {
    // This should query the appropriate transaction table based on type
    // For now, simplified version
    const transaction = await this.findTransaction(transactionId);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.user_id !== userId) {
      throw new UnauthorizedException('Transaction does not belong to user');
    }

    return transaction;
  }

  private async getRefundPolicy(transactionType: string): Promise<RefundPolicy> {
    let policy = await this.policyRepository.findOne({
      where: { transaction_type: transactionType, is_active: true },
    });

    if (!policy) {
      // Create default policy
      policy = this.policyRepository.create({
        transaction_type: transactionType,
        refund_window_days: 30,
        auto_approve_enabled: true,
        auto_approve_threshold: 50000_00, // NGN 50,000
        sla_hours: 24,
        approval_levels: [
          {
            level: 1,
            required_for_amount_above: 50000_00,
            approver_roles: ['support_agent'],
          },
          {
            level: 2,
            required_for_amount_above: 500000_00,
            approver_roles: ['support_manager'],
          },
        ],
        eligible_reasons: [
          'failed_transaction',
          'duplicate_transaction',
          'incorrect_amount',
          'technical_error',
        ],
        is_active: true,
      });

      await this.policyRepository.save(policy);
    }

    return policy;
  }

  private isEligibleForAutoApproval(
    reason: string,
    policy: RefundPolicy,
  ): boolean {
    if (!policy.eligible_reasons) return false;
    return policy.eligible_reasons.includes(reason);
  }

  private async autoApproveRefund(refundRequestId: string): Promise<void> {
    const refundRequest = await this.refundRepository.findOne({
      where: { id: refundRequestId },
    });

    if (!refundRequest) return;

    // Update status
    refundRequest.status = 'approved';
    refundRequest.approved_at = new Date();
    await this.refundRepository.save(refundRequest);

    // Create status history
    await this.createStatusHistory(
      refundRequestId,
      'submitted',
      'approved',
      'Auto-approved based on policy',
      null,
      'system'
    );

    // Process refund
    await this.processRefund(refundRequestId);
  }

  async processRefund(refundRequestId: string): Promise<void> {
    const refundRequest = await this.refundRepository.findOne({
      where: { id: refundRequestId },
      relations: ['user'],
    });

    if (!refundRequest) {
      throw new NotFoundException('Refund request not found');
    }

    if (refundRequest.status !== 'approved') {
      throw new BadRequestException('Refund must be approved before processing');
    }

    // Update status to processing
    refundRequest.status = 'processing';
    refundRequest.processed_at = new Date();
    await this.refundRepository.save(refundRequest);

    await this.createStatusHistory(
      refundRequestId,
      'approved',
      'processing',
      'Refund processing started',
      null,
      'system'
    );

    try {
      // Create refund transaction
      const refundTransaction = this.refundTransactionRepository.create({
        refund_request_id: refundRequestId,
        refund_transaction_reference: await this.generateTransactionReference(),
        user_id: refundRequest.user_id,
        amount: refundRequest.refund_amount,
        currency: refundRequest.currency,
        status: 'pending',
      });

      await this.refundTransactionRepository.save(refundTransaction);

      // Credit user wallet
      const walletCredit = await this.walletService.credit({
        user_id: refundRequest.user_id,
        amount: refundRequest.refund_amount,
        currency: refundRequest.currency,
        description: `Refund for ${refundRequest.transaction_reference}`,
        reference: refundTransaction.refund_transaction_reference,
        metadata: {
          refund_reference: refundRequest.refund_reference,
          original_transaction: refundRequest.transaction_reference,
        },
      });

      // Update refund transaction
      refundTransaction.status = 'completed';
      refundTransaction.wallet_transaction_reference = walletCredit.reference;
      refundTransaction.completed_at = new Date();
      await this.refundTransactionRepository.save(refundTransaction);

      // Create ledger entries
      await this.createRefundLedgerEntries(refundRequest, refundTransaction);

      // Update refund request
      refundRequest.status = 'completed';
      refundRequest.completed_at = new Date();
      await this.refundRepository.save(refundRequest);

      await this.createStatusHistory(
        refundRequestId,
        'processing',
        'completed',
        'Refund processed successfully',
        null,
        'system'
      );

      // Send notification
      await this.notificationService.send({
        user_id: refundRequest.user_id,
        type: 'refund_completed',
        title: 'Refund Completed',
        message: `Your refund of ${this.formatAmount(refundRequest.refund_amount, refundRequest.currency)} has been processed successfully.`,
        channels: ['email', 'push', 'sms'],
        data: {
          refund_reference: refundRequest.refund_reference,
          amount: refundRequest.refund_amount,
          currency: refundRequest.currency,
        },
      });
    } catch (error) {
      // Handle failure
      refundRequest.status = 'submitted';
      await this.refundRepository.save(refundRequest);

      await this.createStatusHistory(
        refundRequestId,
        'processing',
        'submitted',
        `Refund processing failed: ${error.message}`,
        null,
        'system'
      );

      throw error;
    }
  }

  private async createApprovalLevels(
    refundRequest: RefundRequest,
    policy: RefundPolicy,
  ): Promise<void> {
    if (!policy.approval_levels) return;

    for (const level of policy.approval_levels) {
      if (refundRequest.refund_amount > level.required_for_amount_above) {
        const approval = this.approvalRepository.create({
          refund_request_id: refundRequest.id,
          approval_level: level.level,
          status: 'pending',
        });

        await this.approvalRepository.save(approval);
      }
    }
  }

  async approveRefund(
    refundRequestId: string,
    approverId: string,
    approvalLevel: number,
    comment?: string,
  ): Promise<void> {
    const approval = await this.approvalRepository.findOne({
      where: {
        refund_request_id: refundRequestId,
        approval_level: approvalLevel,
        status: 'pending',
      },
    });

    if (!approval) {
      throw new NotFoundException('Approval not found or already actioned');
    }

    approval.approver_id = approverId;
    approval.status = 'approved';
    approval.comment = comment;
    approval.actioned_at = new Date();
    await this.approvalRepository.save(approval);

    // Check if all required approvals are complete
    const pendingApprovals = await this.approvalRepository.count({
      where: {
        refund_request_id: refundRequestId,
        status: 'pending',
      },
    });

    if (pendingApprovals === 0) {
      // All approvals complete, update refund request
      const refundRequest = await this.refundRepository.findOne({
        where: { id: refundRequestId },
      });

      refundRequest.status = 'approved';
      refundRequest.approved_by = approverId;
      refundRequest.approved_at = new Date();
      await this.refundRepository.save(refundRequest);

      await this.createStatusHistory(
        refundRequestId,
        'under_review',
        'approved',
        comment || 'Refund approved',
        approverId,
        'admin'
      );

      // Process refund
      await this.processRefund(refundRequestId);
    }
  }

  async rejectRefund(
    refundRequestId: string,
    rejectorId: string,
    reason: string,
  ): Promise<void> {
    const refundRequest = await this.refundRepository.findOne({
      where: { id: refundRequestId },
    });

    if (!refundRequest) {
      throw new NotFoundException('Refund request not found');
    }

    refundRequest.status = 'rejected';
    refundRequest.rejection_reason = reason;
    refundRequest.rejected_at = new Date();
    await this.refundRepository.save(refundRequest);

    await this.createStatusHistory(
      refundRequestId,
      refundRequest.status,
      'rejected',
      reason,
      rejectorId,
      'admin'
    );

    // Send notification
    await this.notificationService.send({
      user_id: refundRequest.user_id,
      type: 'refund_rejected',
      title: 'Refund Request Rejected',
      message: `Your refund request ${refundRequest.refund_reference} has been rejected. Reason: ${reason}`,
      channels: ['email', 'push'],
      data: {
        refund_reference: refundRequest.refund_reference,
        rejection_reason: reason,
      },
    });
  }

  private async createStatusHistory(
    refundRequestId: string,
    previousStatus: string,
    newStatus: string,
    comment: string,
    changedBy: string,
    changedByType: string,
  ): Promise<void> {
    const history = this.historyRepository.create({
      refund_request_id: refundRequestId,
      previous_status: previousStatus,
      new_status: newStatus,
      comment,
      changed_by: changedBy,
      changed_by_type: changedByType,
    });

    await this.historyRepository.save(history);
  }

  private async createRefundLedgerEntries(
    refundRequest: RefundRequest,
    refundTransaction: RefundTransaction,
  ): Promise<void> {
    // Credit user wallet
    await this.ledgerService.createEntry({
      account_id: refundRequest.user_id,
      account_type: 'wallet',
      entry_type: 'credit',
      amount: refundRequest.refund_amount,
      currency: refundRequest.currency,
      description: `Refund - ${refundRequest.refund_reference}`,
      reference: refundTransaction.refund_transaction_reference,
    });

    // Debit refund liability account
    await this.ledgerService.createEntry({
      account_id: 'REFUND_LIABILITY',
      account_type: 'liability',
      entry_type: 'debit',
      amount: refundRequest.refund_amount,
      currency: refundRequest.currency,
      description: `Refund processed - ${refundRequest.refund_reference}`,
      reference: refundTransaction.refund_transaction_reference,
    });
  }

  private async uploadDocuments(files: any[]): Promise<any[]> {
    const uploadedDocs = [];

    for (const file of files) {
      const url = await this.fileStorageService.upload(file, 'refund-documents');
      uploadedDocs.push({
        file_name: file.originalname,
        file_url: url,
        file_type: file.mimetype,
        uploaded_at: new Date(),
      });
    }

    return uploadedDocs;
  }

  private async generateReference(): Promise<string> {
    return `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private async generateTransactionReference(): Promise<string> {
    return `REFTXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  }

  private async findTransaction(transactionId: string): Promise<any> {
    // Implement transaction lookup across different transaction types
    // This is simplified for the example
    return {
      id: transactionId,
      user_id: 'user-id',
      reference: 'TXN-123',
      transaction_type: 'payment',
      amount: 100000,
      currency: 'NGN',
      created_at: new Date(),
    };
  }

  async getRefundRequests(
    userId: string,
    filters?: {
      status?: string;
      start_date?: Date;
      end_date?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ refunds: RefundRequest[]; total: number }> {
    const query = this.refundRepository
      .createQueryBuilder('refund')
      .where('refund.user_id = :userId', { userId });

    if (filters?.status) {
      query.andWhere('refund.status = :status', { status: filters.status });
    }

    if (filters?.start_date) {
      query.andWhere('refund.created_at >= :start_date', {
        start_date: filters.start_date,
      });
    }

    if (filters?.end_date) {
      query.andWhere('refund.created_at <= :end_date', {
        end_date: filters.end_date,
      });
    }

    const total = await query.getCount();

    const refunds = await query
      .orderBy('refund.created_at', 'DESC')
      .skip(filters?.offset || 0)
      .take(filters?.limit || 20)
      .getMany();

    return { refunds, total };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkSLABreaches(): Promise<void> {
    const breachedRefunds = await this.refundRepository.find({
      where: {
        status: In(['submitted', 'under_review', 'approved']),
        sla_breached: false,
      },
    });

    for (const refund of breachedRefunds) {
      if (new Date() > refund.sla_deadline) {
        refund.sla_breached = true;
        await this.refundRepository.save(refund);

        // Send alert to admins
        await this.notificationService.sendToAdmins({
          type: 'sla_breach_alert',
          title: 'Refund SLA Breach',
          message: `Refund ${refund.refund_reference} has breached SLA deadline`,
          priority: 'high',
        });
      }
    }
  }
}
```

---

## FEATURE-10.2: Automated Refund Processing

### 📘 User Story: US-15.2.1 - Automated Refund System

**Story ID:** US-15.2.1
**Feature:** FEATURE-10.2 (Automated Refund Processing)
**Epic:** EPIC-10 (Refunds & Disputes)

**Story Points:** 15
**Priority:** P0 (Critical)
**Sprint:** Sprint 15
**Status:** 🔄 Not Started

---

#### User Story

```
As a platform
I want to automatically process eligible refunds without manual intervention
So that refunds are faster and support team workload is reduced
```

---

#### Acceptance Criteria

**Auto-Approval Rules:**
- [ ] **AC1:** Failed transactions auto-refund within 5 minutes
- [ ] **AC2:** Duplicate transactions detected and auto-refunded
- [ ] **AC3:** Technical errors trigger immediate refund
- [ ] **AC4:** Refunds under NGN 50,000 auto-approved
- [ ] **AC5:** Whitelisted merchants get auto-approval
- [ ] **AC6:** Verified users (KYC Tier 3) get auto-approval up to NGN 200,000

**Processing Rules:**
- [ ] **AC7:** Process refunds in order of submission (FIFO)
- [ ] **AC8:** High-priority refunds processed first (technical errors, unauthorized)
- [ ] **AC9:** Batch processing for efficiency
- [ ] **AC10:** Retry failed refunds up to 3 times

**Risk Management:**
- [ ] **AC11:** Fraud score check before auto-approval
- [ ] **AC12:** Daily refund limit per user
- [ ] **AC13:** Velocity checks (multiple refunds in short time)
- [ ] **AC14:** Flag suspicious patterns for manual review

---

### 📘 User Story: US-15.3.1 - Refund Analytics & Reporting

**Story ID:** US-15.3.1
**Feature:** FEATURE-10.3 (Refund Analytics)
**Epic:** EPIC-10 (Refunds & Disputes)

**Story Points:** 12
**Priority:** P1 (High)
**Sprint:** Sprint 15
**Status:** 🔄 Not Started

---

#### User Story

```
As an admin
I want to view comprehensive refund analytics and reports
So that I can monitor refund trends, identify issues, and improve processes
```

---

#### Acceptance Criteria

**Refund Metrics:**
- [ ] **AC1:** Total refunds processed (count and value)
- [ ] **AC2:** Refund rate by transaction type
- [ ] **AC3:** Average refund processing time
- [ ] **AC4:** SLA compliance rate
- [ ] **AC5:** Auto-approval vs manual approval ratio
- [ ] **AC6:** Refund reasons distribution

**Reports:**
- [ ] **AC7:** Daily refund summary report
- [ ] **AC8:** Weekly trend analysis
- [ ] **AC9:** Monthly reconciliation report
- [ ] **AC10:** Refund by merchant/service
- [ ] **AC11:** Top refund requesters
- [ ] **AC12:** Suspicious refund patterns

**Dashboards:**
- [ ] **AC13:** Real-time refund queue dashboard
- [ ] **AC14:** SLA breach alerts
- [ ] **AC15:** Pending approvals list
- [ ] **AC16:** Processing status overview

---

## Summary of Sprint 15 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-15.1.1 | Transaction Refund Request | 13 | P0 | To Do |
| US-15.2.1 | Automated Refund System | 15 | P0 | To Do |
| US-15.3.1 | Refund Analytics & Reporting | 12 | P1 | To Do |
| **Total** | | **40** | | |

---

## Sprint Velocity Tracking

**Planned Story Points:** 40 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

---

## Dependencies

**External:**
- File storage service (S3/MinIO) for supporting documents
- Email service for notifications

**Internal:**
- Sprint 4: Wallet system
- Sprint 5: Ledger system
- Sprint 8-13: All transaction types
- Sprint 14: Notification service

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-15.1 | Refund fraud/abuse | Medium | High | Velocity checks, fraud scoring |
| RISK-15.2 | SLA breaches | Medium | Medium | Auto-approval, alerts |
| RISK-15.3 | Financial reconciliation errors | Low | Critical | Automated ledger entries, audits |
| RISK-15.4 | Duplicate refunds | Low | High | Transaction locking, idempotency |

---

## Notes & Decisions

**Technical Decisions:**
1. **Refund Window:** 30 days for most transactions
2. **Auto-Approval Threshold:** NGN 50,000 for standard users
3. **SLA:** 24 hours standard, 4 hours for automated
4. **Approval Levels:** 2 levels based on amount
5. **Document Storage:** S3-compatible with 2-year retention

**Open Questions:**
1. ❓ Chargeback integration? **Decision: Sprint 16**
2. ❓ Refund to different payment method? **Decision: Wallet only for now**
3. ❓ Cryptocurrency refunds? **Decision: Phase 2**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Enable comprehensive refund request and processing system with automation
