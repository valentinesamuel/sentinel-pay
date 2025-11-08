# Sprint 16 Backlog - Refunds & Disputes Part 2

**Sprint:** Sprint 16
**Duration:** 2 weeks (Week 33-34)
**Sprint Goal:** Build comprehensive dispute management system with evidence handling, investigation workflow, mediation, and chargeback support
**Story Points Committed:** 42
**Team Capacity:** 42 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1-15 = 43.0 SP, committed 42 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 16, we will have:
1. Transaction dispute creation and submission
2. Evidence upload and management system
3. Multi-party dispute investigation workflow
4. Merchant response and counter-evidence system
5. Internal mediation and arbitration process
6. Dispute resolution with outcomes tracking
7. Chargeback handling and representation
8. Dispute analytics and reporting
9. SLA-based dispute processing timelines
10. Integration with payment providers for chargebacks

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Dispute workflow tests passing
- [ ] Evidence handling verified
- [ ] API documentation updated (Swagger)
- [ ] Dispute notifications working
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-10: Refunds & Disputes

## FEATURE-10.4: Dispute Management System

### 📘 User Story: US-16.1.1 - Transaction Dispute Creation

**Story ID:** US-16.1.1
**Story Points:** 15
**Priority:** P0 (Critical)
**Sprint:** Sprint 16

#### User Story
```
As a user
I want to raise a dispute for a transaction I'm not satisfied with
So that I can seek resolution when refunds are rejected or issues persist
```

#### Acceptance Criteria

**Dispute Creation:**
- [ ] Create dispute for any completed transaction
- [ ] Select dispute category (unauthorized, goods not received, defective, etc.)
- [ ] Provide detailed description
- [ ] Upload evidence (receipts, photos, emails, up to 10 files)
- [ ] Set desired resolution amount
- [ ] Dispute reference number generation

**Dispute Categories:**
- [ ] Unauthorized transaction
- [ ] Goods/services not received
- [ ] Goods/services defective
- [ ] Amount charged differs from agreed
- [ ] Duplicate charge
- [ ] Fraud/scam
- [ ] Quality not as described
- [ ] Other

**Evidence Management:**
- [ ] Support multiple file formats (JPG, PNG, PDF, DOC)
- [ ] Maximum 5MB per file, 10 files total
- [ ] Evidence description for each file
- [ ] Timestamp tracking
- [ ] Secure storage with encryption

---

### 📘 User Story: US-16.2.1 - Dispute Investigation & Resolution

**Story ID:** US-16.2.1
**Story Points:** 15
**Priority:** P0 (Critical)
**Sprint:** Sprint 16

#### User Story
```
As a support agent
I want to investigate and resolve disputes fairly
So that customer satisfaction is maintained while protecting merchant interests
```

#### Acceptance Criteria

**Investigation Workflow:**
- [ ] Assign disputes to investigators
- [ ] Request additional evidence from parties
- [ ] Contact merchant for response
- [ ] Internal notes and communication tracking
- [ ] Set investigation deadlines
- [ ] Escalation for complex cases

**Merchant Response:**
- [ ] Notify merchant of dispute
- [ ] 7-day response window
- [ ] Upload counter-evidence
- [ ] Provide explanation
- [ ] Offer resolution proposals
- [ ] Accept or reject customer claims

**Resolution Options:**
- [ ] Favor customer (full refund)
- [ ] Favor merchant (no refund)
- [ ] Partial resolution (split amount)
- [ ] Mediation required
- [ ] Insufficient evidence (dismiss)

---

### 📘 User Story: US-16.3.1 - Chargeback Management

**Story ID:** US-16.3.1
**Story Points:** 12
**Priority:** P1 (High)
**Sprint:** Sprint 16

#### User Story
```
As a platform
I want to handle chargebacks from payment providers
So that we can represent merchants and minimize financial losses
```

#### Acceptance Criteria

**Chargeback Handling:**
- [ ] Receive chargeback notifications from providers
- [ ] Link chargebacks to original transactions
- [ ] Auto-create disputes for chargebacks
- [ ] Notify merchant immediately
- [ ] Collect evidence for representation
- [ ] Submit response to payment provider
- [ ] Track chargeback outcomes

**Chargeback Types:**
- [ ] Fraudulent transaction
- [ ] Authorization issues
- [ ] Processing errors
- [ ] Consumer disputes
- [ ] Credit not processed

---

## Summary of Sprint 16 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-16.1.1 | Transaction Dispute Creation | 15 | P0 | To Do |
| US-16.2.1 | Dispute Investigation & Resolution | 15 | P0 | To Do |
| US-16.3.1 | Chargeback Management | 12 | P1 | To Do |
| **Total** | | **42** | | |

---

## Technical Specifications

### Dispute Schema

```typescript
@Entity('disputes')
export class Dispute extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  dispute_reference: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  transaction_id: string;

  @Column({
    type: 'enum',
    enum: ['unauthorized', 'not_received', 'defective', 'amount_differs', 'duplicate', 'fraud', 'quality_issue', 'other'],
  })
  category: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'bigint' })
  disputed_amount: number;

  @Column({ type: 'bigint', nullable: true })
  resolution_amount: number;

  @Column({
    type: 'enum',
    enum: ['submitted', 'under_investigation', 'awaiting_merchant', 'under_review', 'mediation', 'resolved', 'closed'],
    default: 'submitted',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['favor_customer', 'favor_merchant', 'partial_resolution', 'dismissed', 'withdrawn'],
    nullable: true,
  })
  resolution: string;

  @Column({ type: 'jsonb', nullable: true })
  evidence: Array<{
    file_name: string;
    file_url: string;
    description: string;
    uploaded_at: Date;
  }>;

  @Column({ type: 'uuid', nullable: true })
  assigned_to: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  merchant_notified_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  merchant_response_deadline: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  resolved_at: Date;
}
```

---

## Dependencies

**Internal:**
- Sprint 15: Refund system
- Sprint 4: Wallet system
- Sprint 5: Ledger system
- All transaction types (Sprints 8-14)

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-16.1 | Unfair resolutions | Medium | High | Clear guidelines, training |
| RISK-16.2 | Chargeback losses | Medium | High | Strong representation, evidence |
| RISK-16.3 | SLA breaches | Medium | Medium | Auto-assignment, alerts |

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
