# Sprint 26: Refunds - Mock Services

```typescript
export class RefundServiceMock {
  private refunds = new Map<string, Refund>();
  private readonly REFUND_SUCCESS_RATE = 0.99;

  async requestRefund(transactionId: string, dto: RefundRequestDto): Promise<Refund> {
    const refund: Refund = {
      id: crypto.randomUUID(),
      transactionId,
      amount: dto.amount,
      reason: dto.reason,
      status: 'PENDING',
      initiatedAt: new Date(),
    };

    this.refunds.set(refund.id, refund);
    console.log(`[Refund] ✓ Requested: ${dto.amount}`);
    return refund;
  }

  async processRefund(refundId: string): Promise<boolean> {
    const refund = this.refunds.get(refundId);
    if (!refund) return false;

    const success = Math.random() < this.REFUND_SUCCESS_RATE;
    refund.status = success ? 'COMPLETED' : 'FAILED';
    refund.completedAt = new Date();

    console.log(`[Refund] ${success ? '✓' : '✗'} Processed`);
    return success;
  }
}
```

**Metrics:**
- Refund processing: <24-48 hours
- Success rate: 99%
- Notification: Immediate
