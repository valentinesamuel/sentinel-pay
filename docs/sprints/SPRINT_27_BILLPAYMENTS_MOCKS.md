# Sprint 27: Bill Payments - Mock Services

```typescript
export class BillPaymentServiceMock {
  private readonly TOPUP_SUCCESS_RATE = 0.98;
  private readonly TOPUP_LATENCY_MS = { min: 1000, max: 5000 };

  async topup(phone: string, provider: string, amount: number): Promise<TopupResult> {
    await this.simulateLatency();

    if (Math.random() < this.TOPUP_SUCCESS_RATE) {
      console.log(`[Topup] ✓ ${provider} ${amount} to ${phone}`);
      return { topupId: crypto.randomUUID(), status: 'SUCCESS', credit: amount };
    } else {
      console.log(`[Topup] ✗ Failed - retry`);
      return { topupId: crypto.randomUUID(), status: 'FAILED' };
    }
  }

  private async simulateLatency(): Promise<void> {
    const latency = this.randomInt(
      this.TOPUP_LATENCY_MS.min,
      this.TOPUP_LATENCY_MS.max,
    );
    await new Promise(resolve => setTimeout(resolve, latency));
  }
}
```

**Metrics:**
- Topup delivery: <5s
- Success rate: 98%+
- Provider latency: 1-5s
