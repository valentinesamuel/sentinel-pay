# Sprint 32 Mock Services

**Sprint:** Sprint 32

---

## Third-Party Service Mocks

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeIntegrationMock {
  async processPayment(amount: number): Promise<{ success: boolean; transaction_id: string }> {
    const success = Math.random() > 0.02; // 98% success rate
    return {
      success,
      transaction_id: `stripe_${Date.now()}`,
    };
  }
}

@Injectable()
export class CBNNIPMock {
  async verifyAccount(accountNumber: string): Promise<{ valid: boolean; account_name: string }> {
    return {
      valid: accountNumber.length === 10,
      account_name: 'John Doe',
    };
  }
}

@Injectable()
export class LivenessMock {
  async detectLiveness(imageBuffer: Buffer): Promise<{ is_live: boolean; score: number }> {
    const score = 70 + Math.random() * 30; // 70-100
    return {
      is_live: score > 80,
      score: Math.round(score),
    };
  }
}
```

---

**Document Version:** 1.0.0
