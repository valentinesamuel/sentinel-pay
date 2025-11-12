# Sprint 18 Mock Services - Reconciliation Service

**Sprint:** Sprint 18
**Mock Services:** 2 primary services

---

## 1. Transaction Reconciliation Mock

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionReconciliationMock {
  private reconciliationBatches: Map<string, any> = new Map();

  async reconcileTransactions(input: {
    provider: 'stripe' | 'paystack' | 'bank';
    transaction_count: number;
  }): Promise<{
    batch_id: string;
    total_transactions: number;
    matched: number;
    unmatched: number;
    match_rate: number;
    discrepancies: number;
    processing_time_ms: number;
  }> {
    const startTime = Date.now();
    const batchId = `batch_${Date.now()}`;

    // Simulate 95-98% match rate
    const matched = Math.floor(input.transaction_count * (0.95 + Math.random() * 0.03));
    const unmatched = input.transaction_count - matched;
    const discrepancies = Math.floor(unmatched * 0.6);

    const reconciliation = {
      batch_id: batchId,
      provider: input.provider,
      status: 'completed',
      total_transactions: input.transaction_count,
      matched,
      unmatched,
      discrepancies,
      completed_at: new Date(),
    };

    this.reconciliationBatches.set(batchId, reconciliation);

    return {
      batch_id: batchId,
      total_transactions: input.transaction_count,
      matched,
      unmatched,
      match_rate: Math.round((matched / input.transaction_count) * 100),
      discrepancies,
      processing_time_ms: Date.now() - startTime,
    };
  }

  async getDiscrepancies(batchId: string): Promise<Array<{
    type: string;
    count: number;
    examples: string[];
  }>> {
    const types = [
      { type: 'amount_mismatch', probability: 0.4 },
      { type: 'missing_transaction', probability: 0.3 },
      { type: 'orphan_transaction', probability: 0.2 },
      { type: 'timing_mismatch', probability: 0.1 },
    ];

    return types.map(t => ({
      type: t.type,
      count: Math.floor(Math.random() * 100 * t.probability),
      examples: Array.from({ length: 3 }, () => `txn_${Math.random().toString(36).substring(7)}`),
    }));
  }
}
```

---

## 2. Settlement Reconciliation Mock

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class SettlementReconciliationMock {
  async reconcileSettlement(input: {
    settlement_id: string;
    expected_amount: number;
    received_amount: number;
  }): Promise<{
    settlement_id: string;
    status: 'matched' | 'discrepancy' | 'resolved';
    variance: number;
    variance_percent: number;
    action: string;
  }> {
    const variance = input.received_amount - input.expected_amount;
    const variancePercent = (Math.abs(variance) / input.expected_amount) * 100;

    let status: 'matched' | 'discrepancy' | 'resolved' = 'matched';
    let action = 'approved';

    if (Math.abs(variancePercent) > 0.01) {
      if (Math.abs(variancePercent) < 0.1) {
        status = 'resolved';
        action = 'auto_resolved';
      } else {
        status = 'discrepancy';
        action = 'manual_review_required';
      }
    }

    return {
      settlement_id: input.settlement_id,
      status,
      variance: Math.round(variance),
      variance_percent: Math.round(variancePercent * 100) / 100,
      action,
    };
  }
}
```

---

**Document Version:** 1.0.0
