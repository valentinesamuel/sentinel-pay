# Sprint 18 Backlog - Reconciliation Service

**Sprint:** Sprint 18 | **Duration:** Week 37-38 | **Story Points:** 48 SP

## Sprint Goal
Build automated reconciliation engine for transaction matching, settlement reconciliation, and discrepancy resolution.

## User Stories

### US-18.1.1 - Transaction Reconciliation (18 SP)
**As a finance team, I want automated transaction reconciliation**

**Acceptance Criteria:**
- Automated daily reconciliation
- Multi-source matching (internal DB, provider statements, bank statements)
- Tolerance-based matching (amount, date, reference)
- Discrepancy detection and flagging
- Reconciliation reports
- Audit trail

**Features:**
- Three-way matching (transaction, ledger, provider)
- Fuzzy matching algorithms
- Batch reconciliation
- Real-time reconciliation for critical transactions
- Reconciliation status tracking
- Historical reconciliation data

### US-18.2.1 - Settlement Reconciliation (15 SP)
**As a finance team, I want to reconcile settlements with providers**

**Features:**
- Provider settlement file import (CSV, XML, JSON)
- Settlement amount validation
- Fee reconciliation
- Settlement timing validation
- Discrepancy investigation
- Auto-resolution for minor differences (<0.1%)

### US-18.3.1 - Reconciliation Reporting (15 SP)
**As a CFO, I want comprehensive reconciliation reports**

**Reports:**
- Daily reconciliation summary
- Unmatched transactions report
- Discrepancy analysis
- Settlement accuracy metrics
- Provider-wise reconciliation
- Trend analysis

## Technical Specifications

```typescript
@Entity('reconciliation_batches')
export class ReconciliationBatch extends BaseEntity {
  @Column({ type: 'varchar', length: 50 }) batch_reference: string;
  @Column({ type: 'date' }) reconciliation_date: Date;
  @Column({ type: 'enum', enum: ['transaction', 'settlement', 'manual'] })
  batch_type: string;
  @Column({ type: 'integer' }) total_records: number;
  @Column({ type: 'integer' }) matched_records: number;
  @Column({ type: 'integer' }) unmatched_records: number;
  @Column({ type: 'integer' }) discrepancy_count: number;
  @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed'] })
  status: string;
}

@Entity('reconciliation_matches')
export class ReconciliationMatch extends BaseEntity {
  @Column('uuid') batch_id: string;
  @Column('uuid') transaction_id: string;
  @Column({ type: 'varchar', length: 100 }) external_reference: string;
  @Column({ type: 'enum', enum: ['exact', 'fuzzy', 'manual', 'unmatched'] })
  match_type: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) match_confidence: number;
  @Column({ type: 'bigint', nullable: true }) amount_difference: number;
  @Column({ type: 'boolean', default: false }) has_discrepancy: boolean;
}
```

## Dependencies
- All transaction types
- Provider APIs
- Bank statement formats
- Ledger system (Sprint 5)

---
**Total:** 48 SP across 3 stories
