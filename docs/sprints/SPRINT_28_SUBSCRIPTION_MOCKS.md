# Sprint 28: Subscription Management - Mock Services

## Overview

Mock services simulate realistic subscription and billing behaviors with accurate latency profiles, failure rates, and state management for comprehensive testing without real payment processor integration.

---

## SubscriptionPlanServiceMock

Simulates plan creation, retrieval, and management with realistic behavior.

```typescript
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

interface MockSubscriptionPlan {
  id: string;
  merchantId: string;
  planName: string;
  amount: number;
  billingFrequency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SubscriptionPlanServiceMock {
  private plans: Map<string, MockSubscriptionPlan> = new Map();
  private planVersions: Map<string, string[]> = new Map(); // planId -> versionIds

  async createPlan(dto: any): Promise<MockSubscriptionPlan> {
    // Simulate OCR validation latency: 200-400ms
    await this.simulateLatency(200, 400);

    // Validate inputs
    if (!dto.planName || dto.amount <= 0) {
      throw new Error('Invalid plan data');
    }

    const planId = uuid();
    const plan: MockSubscriptionPlan = {
      id: planId,
      merchantId: dto.merchantId,
      planName: dto.planName,
      amount: dto.amount,
      billingFrequency: dto.billingFrequency,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.plans.set(planId, plan);
    this.planVersions.set(planId, [planId]);

    return plan;
  }

  async getPlan(planId: string): Promise<MockSubscriptionPlan> {
    // Simulate database lookup: 10-50ms
    await this.simulateLatency(10, 50);

    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    return plan;
  }

  async listMerchantPlans(merchantId: string): Promise<MockSubscriptionPlan[]> {
    // Simulate list query: 50-150ms
    await this.simulateLatency(50, 150);

    return Array.from(this.plans.values()).filter(p => p.merchantId === merchantId);
  }

  async updatePlan(planId: string, updates: any): Promise<MockSubscriptionPlan> {
    // Simulate update latency: 100-300ms
    await this.simulateLatency(100, 300);

    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    Object.assign(plan, updates);
    plan.updatedAt = new Date();
    this.plans.set(planId, plan);

    return plan;
  }

  async archivePlan(planId: string): Promise<MockSubscriptionPlan> {
    // Simulate archive latency: 100-200ms
    await this.simulateLatency(100, 200);

    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} not found`);
    }

    plan.status = 'ARCHIVED';
    plan.updatedAt = new Date();

    return plan;
  }

  private async simulateLatency(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

---

## SubscriptionEnrollmentServiceMock

Simulates subscription enrollment with realistic success/failure patterns.

```typescript
@Injectable()
export class SubscriptionEnrollmentServiceMock {
  private subscriptions: Map<string, any> = new Map();
  private enrollmentSuccessRate = 0.95; // 95% success rate

  async enrollCustomer(dto: any): Promise<any> {
    // Simulate enrollment processing: 300-800ms
    await this.simulateLatency(300, 800);

    // Simulate payment method validation: 5% failure
    if (Math.random() > this.enrollmentSuccessRate) {
      throw new Error('Payment method validation failed');
    }

    const subscriptionId = uuid();
    const subscription = {
      id: subscriptionId,
      customerId: dto.customerId,
      planId: dto.planId,
      status: 'ACTIVE',
      nextChargeDate: this.calculateNextChargeDate(new Date()),
      trialEndDate: null,
      chargeCount: 0,
      createdAt: new Date(),
    };

    this.subscriptions.set(subscriptionId, subscription);

    return subscription;
  }

  async pauseSubscription(subscriptionId: string): Promise<any> {
    // Simulate pause latency: 100-300ms
    await this.simulateLatency(100, 300);

    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) throw new Error('Subscription not found');

    sub.status = 'PAUSED';
    sub.pausedAt = new Date();

    return sub;
  }

  async resumeSubscription(subscriptionId: string): Promise<any> {
    // Simulate resume latency: 100-300ms
    await this.simulateLatency(100, 300);

    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) throw new Error('Subscription not found');

    sub.status = 'ACTIVE';
    sub.resumedAt = new Date();
    sub.nextChargeDate = this.calculateNextChargeDate(new Date());

    return sub;
  }

  async cancelSubscription(subscriptionId: string, reason: string): Promise<any> {
    // Simulate cancel latency: 150-400ms
    await this.simulateLatency(150, 400);

    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) throw new Error('Subscription not found');

    sub.status = 'CANCELLED';
    sub.cancelledAt = new Date();
    sub.cancelledReason = reason;

    return sub;
  }

  private calculateNextChargeDate(baseDate: Date): Date {
    const nextDate = new Date(baseDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate;
  }

  private async simulateLatency(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

---

## SubscriptionChargeProcessorMock

Simulates charge processing with realistic success/failure rates and retry behavior.

```typescript
@Injectable()
export class SubscriptionChargeProcessorMock {
  private charges: Map<string, any> = new Map();
  private chargeSuccessRate = 0.98; // 98% success on first attempt
  private retryRecoveryRate = 0.80; // 80% of retried charges succeed

  async processScheduledCharges(): Promise<{ processed: number; succeeded: number; failed: number }> {
    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    // Simulate processing 1000 subscriptions
    for (let i = 0; i < 1000; i++) {
      const result = await this.chargeSubscription();
      processed++;

      if (result.success) {
        succeeded++;
      } else {
        failed++;
      }

      // Rate limit: 100 charges/second
      if (i % 100 === 0) {
        await this.simulateLatency(10, 50);
      }
    }

    return { processed, succeeded, failed };
  }

  async chargeSubscription(): Promise<{ success: boolean; chargeId: string }> {
    const chargeId = uuid();
    const shouldSucceed = Math.random() < this.chargeSuccessRate;

    // Simulate payment processor latency: 1-3 seconds
    await this.simulateLatency(1000, 3000);

    const charge = {
      id: chargeId,
      status: shouldSucceed ? 'SUCCEEDED' : 'FAILED',
      amount: 10000,
      currency: 'NGN',
      chargedAt: new Date(),
      failureCode: shouldSucceed ? null : this.randomFailureCode(),
      retryCount: 0,
    };

    this.charges.set(chargeId, charge);

    return { success: shouldSucceed, chargeId };
  }

  async retryCharge(chargeId: string): Promise<{ success: boolean; retryCount: number }> {
    const charge = this.charges.get(chargeId);
    if (!charge) throw new Error('Charge not found');

    // Simulate retry latency: 500-2000ms
    await this.simulateLatency(500, 2000);

    charge.retryCount++;

    // Determine retry success based on failure code
    let shouldRecover = false;

    if (charge.retryCount === 1) {
      shouldRecover = Math.random() < this.retryRecoveryRate;
    } else if (charge.retryCount === 2) {
      shouldRecover = Math.random() < (this.retryRecoveryRate * 0.9);
    } else {
      shouldRecover = Math.random() < (this.retryRecoveryRate * 0.5);
    }

    if (shouldRecover) {
      charge.status = 'SUCCEEDED';
      charge.recoveredAt = new Date();
    }

    return { success: shouldRecover, retryCount: charge.retryCount };
  }

  getChargeStats(): {
    totalCharges: number;
    succeeded: number;
    failed: number;
    successRate: number;
  } {
    const charges = Array.from(this.charges.values());
    const succeeded = charges.filter(c => c.status === 'SUCCEEDED').length;
    const failed = charges.filter(c => c.status === 'FAILED').length;

    return {
      totalCharges: charges.length,
      succeeded,
      failed,
      successRate: charges.length > 0 ? (succeeded / charges.length) * 100 : 0,
    };
  }

  private randomFailureCode(): string {
    const codes = [
      'card_declined',
      'insufficient_funds',
      'card_expired',
      'network_error',
      'processor_error',
      'timeout',
    ];
    return codes[Math.floor(Math.random() * codes.length)];
  }

  private async simulateLatency(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

---

## SubscriptionAnalyticsServiceMock

Simulates metric calculation and analytics.

```typescript
@Injectable()
export class SubscriptionAnalyticsServiceMock {
  private metrics: Map<string, any> = new Map();

  async calculateMerchantMetrics(merchantId: string, date: Date): Promise<void> {
    // Simulate metric calculation: 500-1500ms
    await this.simulateLatency(500, 1500);

    const metrics = {
      merchantId,
      date,
      mrr: Math.random() * 1000000, // ₦0-₦1M
      arr: Math.random() * 12000000, // ₦0-₦12M
      activeSubscriptions: Math.floor(Math.random() * 10000),
      churnRate: Math.random() * 10, // 0-10%
      newSubscriptions: Math.floor(Math.random() * 100),
      trialConversions: Math.floor(Math.random() * 50),
      recoveryRate: Math.random() * 100, // 0-100%
      calculatedAt: new Date(),
    };

    this.metrics.set(`${merchantId}-${date.toISOString()}`, metrics);
  }

  async getMerchantMetrics(merchantId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // Simulate metrics query: 100-500ms
    await this.simulateLatency(100, 500);

    return Array.from(this.metrics.values()).filter(
      m => m.merchantId === merchantId &&
           m.date >= startDate &&
           m.date <= endDate
    );
  }

  async getCohortAnalysis(merchantId: string): Promise<any[]> {
    // Simulate cohort analysis: 1-3 seconds
    await this.simulateLatency(1000, 3000);

    const cohorts = [];
    for (let i = 0; i < 12; i++) {
      cohorts.push({
        merchantId,
        cohortMonth: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
        cohortSize: Math.floor(Math.random() * 500),
        month0Revenue: Math.random() * 500000,
        month3Revenue: Math.random() * 400000,
        month6Revenue: Math.random() * 300000,
        month12Revenue: Math.random() * 200000,
      });
    }

    return cohorts;
  }

  private async simulateLatency(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

---

## Performance Metrics & SLA

### Latency Profiles

| Operation | Min (ms) | Max (ms) | P95 (ms) |
|-----------|----------|----------|----------|
| Create Plan | 200 | 400 | 350 |
| Get Plan | 10 | 50 | 40 |
| Enroll Customer | 300 | 800 | 700 |
| Process Charge | 1000 | 3000 | 2500 |
| Retry Charge | 500 | 2000 | 1500 |
| Calculate Metrics | 500 | 1500 | 1200 |
| Cohort Analysis | 1000 | 3000 | 2500 |

### Success Rates

| Operation | Success Rate | Notes |
|-----------|--------------|-------|
| Plan Creation | 100% | Validates input |
| Enrollment | 95% | 5% payment method validation failures |
| First Charge | 98% | Realistic payment processor success |
| Charge Retry (1st) | 80% | Recovers temporary failures |
| Charge Retry (2nd) | 72% | 90% of retry rate |
| Charge Retry (3rd) | 40% | 50% of retry rate |

---

## Test Scenarios

### Scenario 1: Happy Path - New Merchant & Plan

```typescript
describe('Subscription Happy Path', () => {
  it('should create plan, enroll customer, and process charges', async () => {
    // 1. Merchant creates plan
    const plan = await planMock.createPlan({
      merchantId: 'merchant-123',
      planName: 'Premium',
      amount: 50000,
      billingFrequency: 'monthly',
    });
    expect(plan.status).toBe('ACTIVE');

    // 2. Customer enrolls
    const subscription = await enrollmentMock.enrollCustomer({
      customerId: 'customer-456',
      planId: plan.id,
      paymentMethodId: 'card-789',
    });
    expect(subscription.status).toBe('ACTIVE');

    // 3. Process scheduled charges
    const chargeResult = await chargeMock.chargeSubscription();
    expect(chargeResult.success).toBe(true);

    // 4. Verify metrics
    const stats = chargeMock.getChargeStats();
    expect(stats.successRate).toBeGreaterThan(95);
  });
});
```

### Scenario 2: Charge Failure & Retry Recovery

```typescript
describe('Failed Charge Recovery', () => {
  it('should retry failed charges and recover with exponential backoff', async () => {
    const chargeId = (await chargeMock.chargeSubscription()).chargeId;
    const charge = chargeMock.charges.get(chargeId);

    // Simulate first charge failure
    if (charge.status === 'FAILED') {
      // Retry after 24 hours
      await sleep(1000); // Simulate delay
      
      const retry1 = await chargeMock.retryCharge(chargeId);
      expect(retry1.retryCount).toBe(1);

      if (!retry1.success) {
        // Second retry after 48 hours
        const retry2 = await chargeMock.retryCharge(chargeId);
        expect(retry2.retryCount).toBe(2);
      }
    }
  });
});
```

### Scenario 3: Bulk Charge Processing (1000+ subscriptions)

```typescript
describe('Bulk Charge Processing', () => {
  it('should process 1000+ subscriptions in <10 seconds with 98% success rate', async () => {
    const startTime = Date.now();

    const result = await chargeMock.processScheduledCharges();

    const elapsedSeconds = (Date.now() - startTime) / 1000;

    expect(result.processed).toBe(1000);
    expect(elapsedSeconds).toBeLessThan(10);
    expect((result.succeeded / result.processed) * 100).toBeGreaterThan(95);
  });
});
```

### Scenario 4: Plan Upgrade with Pro-ration

```typescript
describe('Plan Upgrade with Pro-ration', () => {
  it('should upgrade plan and calculate pro-ration credit', async () => {
    // Existing subscription on Basic plan (₦20k/month)
    const subscription = await enrollmentMock.subscriptions.get('sub-123');

    // Upgrade to Premium plan (₦50k/month) mid-cycle
    const upgraded = await enrollmentMock.upgradeSubscription(
      'sub-123',
      'plan-premium'
    );

    expect(upgraded.status).toBe('ACTIVE');
    // Pro-ration credit should be applied to next charge
  });
});
```

### Scenario 5: Subscription Pause/Resume

```typescript
describe('Subscription Lifecycle', () => {
  it('should pause subscription and resume without charge gaps', async () => {
    const subId = 'sub-456';

    // Pause subscription
    let subscription = await enrollmentMock.pauseSubscription(subId);
    expect(subscription.status).toBe('PAUSED');

    // Resume subscription
    subscription = await enrollmentMock.resumeSubscription(subId);
    expect(subscription.status).toBe('ACTIVE');
    expect(subscription.nextChargeDate).toBeDefined();
  });
});
```

---

## Success Criteria Validation

- [ ] Plan creation latency: <400ms (P95)
- [ ] Enrollment success rate: >95%
- [ ] Charge processing throughput: 1000+ subscriptions/minute
- [ ] Charge success rate: >98% on first attempt
- [ ] Retry recovery rate: >80% for first retry
- [ ] Max retry attempts: 3 with exponential backoff (24h, 48h, 72h)
- [ ] No duplicate charges: 100% idempotency via idempotency keys
- [ ] Metrics calculation: <3 seconds for 10k subscriptions
- [ ] Trial conversion tracking: Accurate cohort analysis
- [ ] Dunning notifications: Sent before each retry attempt

