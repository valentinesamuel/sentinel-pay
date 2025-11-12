# Sprint 19 Mock Services - KYC & Compliance

**Sprint:** Sprint 19
**Mock Services:** 2 primary services

---

## 1. KYC Verification Mock

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class KycVerificationMock {
  async verifyUser(input: { userId: string; tier: number }): Promise<{
    verified: boolean;
    tier: number;
    approval_time_ms: number;
    reason?: string;
  }> {
    const startTime = Date.now();

    // Simulate approval latency
    const latency = input.tier === 1 ? 200 : 5000 + Math.random() * 10000;
    await this.delay(latency);

    // Tier 1: 99% auto-approval
    // Tier 2: 95% auto-approval
    // Tier 3: 85% auto-approval
    const approvalRates = [0.99, 0.95, 0.85];
    const approved = Math.random() < approvalRates[input.tier - 1];

    return {
      verified: approved,
      tier: input.tier,
      approval_time_ms: Date.now() - startTime,
      reason: approved ? undefined : 'Manual review required',
    };
  }

  async checkLiveness(imageQuality: number): Promise<{ liveness_score: number }> {
    // Simulate liveness detection (0-100 score)
    const baseScore = 70 + Math.random() * 25;
    const qualityAdjustment = (imageQuality / 100) * 10;
    const score = Math.min(100, baseScore + qualityAdjustment);

    return { liveness_score: Math.round(score) };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 2. Compliance Monitoring Mock

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class ComplianceMonitoringMock {
  async checkAML(amount: number): Promise<{ flagged: boolean; risk_level: string }> {
    let risk_level = 'low';
    let flagged = false;

    if (amount > 5000000) {
      risk_level = 'high';
      flagged = Math.random() < 0.1; // 10% flag rate for large transactions
    }

    return { flagged, risk_level };
  }

  async checkSanctionsList(userName: string): Promise<{ sanctioned: boolean }> {
    // Simulate 0.1% match rate (rare)
    return { sanctioned: Math.random() < 0.001 };
  }

  async checkPEP(userName: string): Promise<{ is_pep: boolean; risk_score: number }> {
    // Simulate 0.5% PEP match rate
    const isPep = Math.random() < 0.005;
    const riskScore = isPep ? 60 + Math.random() * 40 : Math.random() * 20;

    return {
      is_pep: isPep,
      risk_score: Math.round(riskScore),
    };
  }
}
```

---

**Document Version:** 1.0.0
