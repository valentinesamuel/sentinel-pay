# Sprint 23: Merchant Onboarding - Mock Services

## MerchantRegistrationServiceMock

```typescript
export class MerchantRegistrationServiceMock {
  private merchants = new Map<string, Merchant>();
  private readonly KYC_REVIEW_LATENCY_MS = { min: 100, max: 500 };
  private readonly KYC_APPROVAL_RATE = 0.85;  // 85% approval rate

  async registerMerchant(dto: MerchantRegistrationDto): Promise<Merchant> {
    await this.simulateLatency();

    const merchant: Merchant = {
      id: crypto.randomUUID(),
      userId: dto.userId,
      businessName: dto.businessName,
      entityType: dto.entityType,
      taxId: dto.taxId,
      industry: dto.industry,
      kycStatus: 'PENDING',
      isActive: false,
      createdAt: new Date(),
    };

    this.merchants.set(merchant.id, merchant);
    console.log(`[Merchant] ✓ Registered: ${merchant.businessName}`);
    return merchant;
  }

  async submitKycDocuments(merchantId: string, documents: KycDocument[]): Promise<void> {
    const merchant = this.merchants.get(merchantId);
    if (!merchant) throw new NotFoundException('Merchant not found');

    merchant.kycStatus = 'SUBMITTED';
    merchant.kycSubmittedAt = new Date();
    console.log(`[Merchant KYC] ✓ Submitted ${documents.length} documents`);
  }

  async approveKyc(merchantId: string): Promise<void> {
    const merchant = this.merchants.get(merchantId);
    if (!merchant) throw new NotFoundException('Merchant not found');

    await this.simulateLatency();

    if (Math.random() < this.KYC_APPROVAL_RATE) {
      merchant.kycStatus = 'APPROVED';
      merchant.kycApprovedAt = new Date();
      merchant.isActive = true;
      console.log(`[Merchant KYC] ✓ APPROVED: ${merchant.businessName}`);
    } else {
      merchant.kycStatus = 'REJECTED';
      merchant.kycRejectedReason = 'Document verification failed';
      console.log(`[Merchant KYC] ✗ REJECTED: ${merchant.businessName}`);
    }
  }

  private async simulateLatency(): Promise<void> {
    const latency = this.randomInt(
      this.KYC_REVIEW_LATENCY_MS.min,
      this.KYC_REVIEW_LATENCY_MS.max,
    );
    await new Promise(resolve => setTimeout(resolve, latency));
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export class PayoutServiceMock {
  private payouts = new Map<string, Payout>();
  private readonly PAYOUT_SUCCESS_RATE = 0.99;

  async schedulePayout(merchantId: string, amount: number): Promise<Payout> {
    const payout: Payout = {
      id: crypto.randomUUID(),
      merchantId,
      amount,
      status: 'SCHEDULED',
      scheduledDate: new Date(),
    };

    this.payouts.set(payout.id, payout);
    console.log(`[Payout] ✓ Scheduled: ${amount} for merchant ${merchantId}`);
    return payout;
  }

  async processPayout(payoutId: string): Promise<boolean> {
    const payout = this.payouts.get(payoutId);
    if (!payout) return false;

    const success = Math.random() < this.PAYOUT_SUCCESS_RATE;
    payout.status = success ? 'COMPLETED' : 'FAILED';
    payout.processedAt = new Date();

    console.log(`[Payout] ${success ? '✓' : '✗'} Processed: ${payout.id}`);
    return success;
  }
}
```

---

## Test Scenarios

```typescript
describe('Merchant Onboarding', () => {
  it('should register merchant successfully', async () => {
    const mock = new MerchantRegistrationServiceMock();
    const merchant = await mock.registerMerchant({
      userId: 'user_123',
      businessName: 'ABC Trading',
      entityType: 'LLC',
      taxId: 'TIN-12345',
      industry: 'retail'
    });

    expect(merchant.kycStatus).toBe('PENDING');
    expect(merchant.isActive).toBe(false);
  });

  it('should submit KYC documents and change status', async () => {
    const mock = new MerchantRegistrationServiceMock();
    const merchant = await mock.registerMerchant({...});
    
    await mock.submitKycDocuments(merchant.id, [
      { type: 'registration', file: '...' },
      { type: 'tax_cert', file: '...' }
    ]);

    // Note: in mock, status changes immediately
    expect(merchant.kycStatus).toBe('SUBMITTED');
  });

  it('should approve/reject KYC with realistic rates', async () => {
    const mock = new MerchantRegistrationServiceMock();
    let approvals = 0;

    for (let i = 0; i < 100; i++) {
      const merchant = await mock.registerMerchant({...});
      await mock.submitKycDocuments(merchant.id, [...]);
      await mock.approveKyc(merchant.id);

      if (merchant.kycStatus === 'APPROVED') approvals++;
    }

    // Should be approximately 85%
    expect(approvals).toBeGreaterThan(75);
    expect(approvals).toBeLessThan(95);
  });
});
```

**Performance Metrics:**
- KYC review latency: 100-500ms
- Payout success rate: 99%
- Registration speed: <1s
- Approval rate: 85%
