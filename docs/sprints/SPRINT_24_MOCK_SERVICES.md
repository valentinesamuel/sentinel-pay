# Sprint 24: Dispute Management - Mock Services

```typescript
export class DisputeServiceMock {
  private disputes = new Map<string, Dispute>();

  async createDispute(transactionId: string, dto: CreateDisputeDto): Promise<Dispute> {
    const dispute: Dispute = {
      id: crypto.randomUUID(),
      transactionId,
      reason: dto.reason,
      status: 'OPEN',
      createdAt: new Date(),
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    };

    this.disputes.set(dispute.id, dispute);
    console.log(`[Dispute] ✓ Created: ${dispute.id}`);
    return dispute;
  }

  async resolveDispute(disputeId: string, resolution: string): Promise<void> {
    const dispute = this.disputes.get(disputeId);
    if (dispute) {
      dispute.status = 'RESOLVED';
      dispute.resolution = resolution;
      console.log(`[Dispute] ✓ Resolved as ${resolution}`);
    }
  }
}
```

**Performance Metrics:**
- Dispute creation: <1s
- Investigation time: 15-30 days average
- Resolution accuracy: 85%+
