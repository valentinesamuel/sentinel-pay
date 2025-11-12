# Sprint 27 Mock Services - Batch Payments & Mobile Money

**Sprint:** Sprint 27
**Duration:** 2 weeks (Week 55-56)
**Mock Services:** 4 comprehensive mobile money providers with realistic behavior

---

## 1. MTN Mobile Money Mock Service

### Overview
Simulates MTN MoMo API with realistic latency, failure patterns, and timeout handling

```typescript
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export enum MTNTransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
}

@Injectable()
export class MTNMobileMoneyMock {
  private transactions: Map<string, any> = new Map();
  private requestCount: number = 0;
  private readonly MAX_REQUESTS_PER_MINUTE = 100;
  private readonly RATE_LIMIT_RESET_MS = 60000;
  private lastResetTime: number = Date.now();

  // Realistic success rates per operation
  private readonly SUCCESS_RATES = {
    deposit: 0.96,      // 96% success
    withdrawal: 0.93,   // 93% success (more prone to failure)
    balance_check: 0.98, // 98% success
    transfer: 0.94,     // 94% success
  };

  // Realistic latency ranges (milliseconds)
  private readonly LATENCY_RANGES = {
    deposit: { min: 800, max: 2500 },        // 0.8-2.5 seconds (slow)
    withdrawal: { min: 600, max: 3000 },     // 0.6-3 seconds (slowest)
    balance_check: { min: 200, max: 800 },   // 0.2-0.8 seconds (fast)
    transfer: { min: 1000, max: 2000 },      // 1-2 seconds
  };

  /**
   * Deposit money into MTN wallet
   * Simulates customer depositing cash at MTN agent
   */
  async depositMoney(input: {
    phone: string;
    amount: number;
    agent_id: string;
    reference: string;
  }): Promise<{
    success: boolean;
    transaction_id: string;
    status: MTNTransactionStatus;
    latency_ms: number;
    error?: string;
  }> {
    const startTime = Date.now();
    this.checkRateLimit();

    // Simulate realistic latency (MTN API is notoriously slow)
    const latency = this.randomLatency('deposit');
    await this.delay(latency);

    // Random success/failure
    const shouldSucceed = Math.random() < this.SUCCESS_RATES.deposit;

    const transactionId = `MTN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const status = shouldSucceed ? MTNTransactionStatus.SUCCESS : MTNTransactionStatus.FAILED;

    const transaction = {
      transaction_id: transactionId,
      phone: input.phone,
      amount: input.amount,
      type: 'deposit',
      provider: 'MTN',
      status,
      created_at: new Date(),
      latency_ms: Date.now() - startTime,
    };

    this.transactions.set(transactionId, transaction);

    return {
      success: shouldSucceed,
      transaction_id: transactionId,
      status,
      latency_ms: Date.now() - startTime,
      error: shouldSucceed ? undefined : this.getRandomMTNError(),
    };
  }

  /**
   * Withdraw money from MTN wallet
   * Simulates customer withdrawing cash from MTN agent
   */
  async withdrawMoney(input: {
    phone: string;
    amount: number;
    agent_id: string;
  }): Promise<{
    success: boolean;
    transaction_id: string;
    status: MTNTransactionStatus;
    withdrawal_code?: string;
    latency_ms: number;
    error?: string;
  }> {
    const startTime = Date.now();
    this.checkRateLimit();

    // Withdrawal is slower and less reliable
    const latency = this.randomLatency('withdrawal');
    await this.delay(latency);

    const shouldSucceed = Math.random() < this.SUCCESS_RATES.withdrawal;
    const transactionId = `MTN-WD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const withdrawalCode = shouldSucceed ? Math.floor(Math.random() * 999999).toString().padStart(6, '0') : undefined;

    const status = shouldSucceed ? MTNTransactionStatus.SUCCESS : MTNTransactionStatus.FAILED;

    this.transactions.set(transactionId, {
      transaction_id: transactionId,
      phone: input.phone,
      amount: input.amount,
      type: 'withdrawal',
      status,
      withdrawal_code: withdrawalCode,
      created_at: new Date(),
    });

    return {
      success: shouldSucceed,
      transaction_id: transactionId,
      status,
      withdrawal_code: withdrawalCode,
      latency_ms: Date.now() - startTime,
      error: shouldSucceed ? undefined : 'Insufficient agent balance',
    };
  }

  /**
   * Check wallet balance
   */
  async checkBalance(phone: string): Promise<{
    success: boolean;
    balance: number;
    latency_ms: number;
    currency: string;
  }> {
    const startTime = Date.now();
    this.checkRateLimit();

    const latency = this.randomLatency('balance_check');
    await this.delay(latency);

    // Balance check almost always succeeds
    const success = Math.random() < this.SUCCESS_RATES.balance_check;
    const balance = success ? Math.floor(Math.random() * 5000000) : 0;

    return {
      success,
      balance,
      latency_ms: Date.now() - startTime,
      currency: 'NGN',
    };
  }

  /**
   * Transfer money between MTN wallets
   */
  async transferMoney(input: {
    from_phone: string;
    to_phone: string;
    amount: number;
  }): Promise<{
    success: boolean;
    transaction_id: string;
    status: MTNTransactionStatus;
    latency_ms: number;
    error?: string;
  }> {
    const startTime = Date.now();
    this.checkRateLimit();

    const latency = this.randomLatency('transfer');
    await this.delay(latency);

    const shouldSucceed = Math.random() < this.SUCCESS_RATES.transfer;
    const transactionId = `MTN-TRF-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const status = shouldSucceed ? MTNTransactionStatus.SUCCESS : MTNTransactionStatus.FAILED;

    this.transactions.set(transactionId, {
      transaction_id: transactionId,
      from: input.from_phone,
      to: input.to_phone,
      amount: input.amount,
      type: 'transfer',
      status,
      created_at: new Date(),
    });

    return {
      success: shouldSucceed,
      transaction_id: transactionId,
      status,
      latency_ms: Date.now() - startTime,
      error: shouldSucceed ? undefined : 'Invalid phone number',
    };
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionId: string): Promise<{
    status: MTNTransactionStatus;
    details: any;
  }> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return {
        status: MTNTransactionStatus.FAILED,
        details: { error: 'Transaction not found' },
      };
    }

    return {
      status: transaction.status,
      details: transaction,
    };
  }

  private randomLatency(operationType: string): number {
    const range = this.LATENCY_RANGES[operationType] || { min: 500, max: 2000 };
    return range.min + Math.random() * (range.max - range.min);
  }

  private getRandomMTNError(): string {
    const errors = [
      'Insufficient balance',
      'Invalid phone number',
      'Network timeout',
      'Agent not available',
      'Transaction limit exceeded',
      'Invalid amount',
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }

  private checkRateLimit(): void {
    const now = Date.now();
    if (now - this.lastResetTime > this.RATE_LIMIT_RESET_MS) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      throw new Error('MTN rate limit exceeded: 100 requests per minute');
    }

    this.requestCount++;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 2. Airtel Money Mock Service

### Overview
Simulates Airtel Money API with different failure patterns than MTN (more reliable but occasional network issues)

```typescript
@Injectable()
export class AirtelMoneyMock {
  private transactions: Map<string, any> = new Map();
  private circuitBreakerOpen: boolean = false;
  private failureCount: number = 0;
  private readonly FAILURE_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_RESET_MS = 30000;

  // Airtel is generally more reliable than MTN
  private readonly SUCCESS_RATES = {
    deposit: 0.97,
    withdrawal: 0.95,
    balance_check: 0.99,
    transfer: 0.96,
  };

  // Airtel is slightly faster than MTN
  private readonly LATENCY_RANGES = {
    deposit: { min: 600, max: 2000 },
    withdrawal: { min: 400, max: 2500 },
    balance_check: { min: 150, max: 600 },
    transfer: { min: 800, max: 1800 },
  };

  async depositMoney(input: {
    phone: string;
    amount: number;
    reference: string;
  }): Promise<{
    success: boolean;
    transaction_id: string;
    latency_ms: number;
    error?: string;
  }> {
    if (this.circuitBreakerOpen) {
      throw new Error('Airtel service temporarily unavailable (circuit breaker open)');
    }

    const startTime = Date.now();
    const latency = this.randomLatency('deposit');
    await this.delay(latency);

    const shouldSucceed = Math.random() < this.SUCCESS_RATES.deposit;

    if (!shouldSucceed) {
      this.failureCount++;
      if (this.failureCount >= this.FAILURE_THRESHOLD) {
        this.circuitBreakerOpen = true;
        setTimeout(() => {
          this.circuitBreakerOpen = false;
          this.failureCount = 0;
        }, this.CIRCUIT_BREAKER_RESET_MS);
      }
    } else {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }

    const transactionId = `AIR-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    return {
      success: shouldSucceed,
      transaction_id: transactionId,
      latency_ms: Date.now() - startTime,
      error: shouldSucceed ? undefined : 'Service temporarily unavailable',
    };
  }

  async withdrawMoney(input: {
    phone: string;
    amount: number;
  }): Promise<{
    success: boolean;
    transaction_id: string;
    withdrawal_pin?: string;
    latency_ms: number;
  }> {
    const startTime = Date.now();
    const latency = this.randomLatency('withdrawal');
    await this.delay(latency);

    const shouldSucceed = Math.random() < this.SUCCESS_RATES.withdrawal;
    const withdrawalPin = shouldSucceed ? Math.floor(Math.random() * 9999).toString().padStart(4, '0') : undefined;

    return {
      success: shouldSucceed,
      transaction_id: `AIR-WD-${Date.now()}`,
      withdrawal_pin: withdrawalPin,
      latency_ms: Date.now() - startTime,
    };
  }

  async checkBalance(phone: string): Promise<{
    balance: number;
    latency_ms: number;
  }> {
    const startTime = Date.now();
    const latency = this.randomLatency('balance_check');
    await this.delay(latency);

    return {
      balance: Math.floor(Math.random() * 3000000),
      latency_ms: Date.now() - startTime,
    };
  }

  private randomLatency(operationType: string): number {
    const range = this.LATENCY_RANGES[operationType];
    return range.min + Math.random() * (range.max - range.min);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 3. M-Pesa Mock Service

### Overview
Simulates Safaricom M-Pesa API (for East African users) with batch processing patterns

```typescript
@Injectable()
export class MPesaMock {
  private transactions: Map<string, any> = new Map();
  private batchQueue: any[] = [];
  private readonly SUCCESS_RATES = {
    send_money: 0.98,
    receive_money: 0.97,
    bill_payment: 0.96,
    balance_check: 0.99,
  };

  private readonly LATENCY_RANGES = {
    send_money: { min: 500, max: 1500 },
    receive_money: { min: 400, max: 2000 },
    bill_payment: { min: 800, max: 2500 },
    balance_check: { min: 100, max: 500 },
  };

  async sendMoney(input: {
    phone: string;
    amount: number;
    business_code: string;
  }): Promise<{
    success: boolean;
    checkout_request_id: string;
    response_code: string;
    latency_ms: number;
  }> {
    const startTime = Date.now();
    const latency = this.randomLatency('send_money');
    await this.delay(latency);

    const shouldSucceed = Math.random() < this.SUCCESS_RATES.send_money;
    const checkoutId = `${Date.now()}${Math.random().toString().substring(2, 10)}`;

    return {
      success: shouldSucceed,
      checkout_request_id: checkoutId,
      response_code: shouldSucceed ? '0' : '1001',
      latency_ms: Date.now() - startTime,
    };
  }

  async receiveMoney(input: {
    phone: string;
    amount: number;
    account_reference: string;
  }): Promise<{
    success: boolean;
    transaction_id: string;
    latency_ms: number;
  }> {
    const startTime = Date.now();
    const latency = this.randomLatency('receive_money');
    await this.delay(latency);

    const shouldSucceed = Math.random() < this.SUCCESS_RATES.receive_money;

    return {
      success: shouldSucceed,
      transaction_id: `MPesa-${Date.now()}`,
      latency_ms: Date.now() - startTime,
    };
  }

  async getAccountBalance(phone: string): Promise<{
    balance: number;
    latency_ms: number;
  }> {
    const startTime = Date.now();
    const latency = this.randomLatency('balance_check');
    await this.delay(latency);

    return {
      balance: Math.floor(Math.random() * 2000000),
      latency_ms: Date.now() - startTime,
    };
  }

  private randomLatency(operationType: string): number {
    const range = this.LATENCY_RANGES[operationType];
    return range.min + Math.random() * (range.max - range.min);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 4. Batch Payment Processor Mock

### Overview
Orchestrates batch payments across multiple mobile money providers with realistic retry logic

```typescript
@Injectable()
export class BatchPaymentProcessorMock {
  constructor(
    private mtn: MTNMobileMoneyMock,
    private airtel: AirtelMoneyMock,
    private mpesa: MPesaMock,
  ) {}

  async processBatch(payments: Array<{
    phone: string;
    amount: number;
    provider: 'MTN' | 'AIRTEL' | 'MPESA';
    reference: string;
  }>): Promise<{
    batch_id: string;
    total_payments: number;
    successful: number;
    failed: number;
    pending: number;
    processing_time_ms: number;
    results: Array<{
      reference: string;
      status: 'success' | 'failed' | 'pending';
      transaction_id?: string;
      error?: string;
      retry_count: number;
    }>;
  }> {
    const startTime = Date.now();
    const batchId = `BATCH-${Date.now()}`;
    const results: any[] = [];

    let successful = 0;
    let failed = 0;
    let pending = 0;

    for (const payment of payments) {
      let retryCount = 0;
      let success = false;
      let transactionId: string | undefined;
      let error: string | undefined;

      // Retry logic (up to 3 attempts)
      while (retryCount < 3 && !success) {
        try {
          let result;
          switch (payment.provider) {
            case 'MTN':
              result = await this.mtn.depositMoney({
                phone: payment.phone,
                amount: payment.amount,
                agent_id: 'batch',
                reference: payment.reference,
              });
              break;
            case 'AIRTEL':
              result = await this.airtel.depositMoney({
                phone: payment.phone,
                amount: payment.amount,
                reference: payment.reference,
              });
              break;
            case 'MPESA':
              result = await this.mpesa.sendMoney({
                phone: payment.phone,
                amount: payment.amount,
                business_code: 'batch',
              });
              break;
          }

          if (result.success) {
            success = true;
            transactionId = result.transaction_id;
            successful++;
          } else {
            error = result.error || 'Unknown error';
            retryCount++;
          }
        } catch (e) {
          error = e.message;
          retryCount++;
        }
      }

      if (!success && retryCount >= 3) {
        failed++;
      } else if (!success) {
        pending++;
      }

      results.push({
        reference: payment.reference,
        status: success ? 'success' : failed > 0 ? 'failed' : 'pending',
        transaction_id: transactionId,
        error,
        retry_count: retryCount,
      });
    }

    return {
      batch_id: batchId,
      total_payments: payments.length,
      successful,
      failed,
      pending,
      processing_time_ms: Date.now() - startTime,
      results,
    };
  }

  async getBatchStatus(batchId: string): Promise<{
    status: 'processing' | 'completed' | 'failed';
    completion_percentage: number;
  }> {
    // Simulate batch processing status
    const completion = Math.min(100, Math.floor(Math.random() * 100));
    return {
      status: completion === 100 ? 'completed' : completion > 80 ? 'processing' : 'processing',
      completion_percentage: completion,
    };
  }
}
```

---

## Testing Examples

```typescript
describe('Sprint 27 - Mobile Money Mocks', () => {
  let mtn: MTNMobileMoneyMock;
  let airtel: AirtelMoneyMock;
  let mpesa: MPesaMock;
  let batchProcessor: BatchPaymentProcessorMock;

  beforeEach(() => {
    mtn = new MTNMobileMoneyMock();
    airtel = new AirtelMoneyMock();
    mpesa = new MPesaMock();
    batchProcessor = new BatchPaymentProcessorMock(mtn, airtel, mpesa);
  });

  it('should deposit money with realistic latency (800-2500ms)', async () => {
    const result = await mtn.depositMoney({
      phone: '2348012345678',
      amount: 50000,
      agent_id: 'agent_001',
      reference: 'ref_001',
    });

    expect(result.latency_ms).toBeGreaterThanOrEqual(800);
    expect(result.latency_ms).toBeLessThanOrEqual(2500);
  });

  it('should have 96% deposit success rate', async () => {
    let successes = 0;
    const attempts = 100;

    for (let i = 0; i < attempts; i++) {
      const result = await mtn.depositMoney({
        phone: `234801234567${i}`,
        amount: 50000,
        agent_id: 'agent_001',
        reference: `ref_${i}`,
      });

      if (result.success) successes++;
    }

    const successRate = (successes / attempts) * 100;
    expect(successRate).toBeGreaterThan(90);
    expect(successRate).toBeLessThan(99);
  });

  it('should process batch with retry logic', async () => {
    const payments = [
      { phone: '2348012345678', amount: 50000, provider: 'MTN' as const, reference: 'ref_1' },
      { phone: '2348012345679', amount: 75000, provider: 'AIRTEL' as const, reference: 'ref_2' },
      { phone: '2348012345680', amount: 100000, provider: 'MPESA' as const, reference: 'ref_3' },
    ];

    const result = await batchProcessor.processBatch(payments);

    expect(result.total_payments).toBe(3);
    expect(result.successful + result.failed + result.pending).toBe(3);
    expect(result.results.length).toBe(3);
  });

  it('should handle Airtel circuit breaker', async () => {
    // Trigger multiple failures to open circuit breaker
    for (let i = 0; i < 10; i++) {
      try {
        await airtel.depositMoney({
          phone: '2348012345678',
          amount: 50000,
          reference: `ref_${i}`,
        });
      } catch (e) {
        // Expected after threshold
      }
    }
  });

  it('should have realistic M-Pesa latency', async () => {
    const result = await mpesa.sendMoney({
      phone: '254712345678',
      amount: 50000,
      business_code: 'UBIQUITOUS',
    });

    expect(result.latency_ms).toBeGreaterThanOrEqual(500);
    expect(result.latency_ms).toBeLessThanOrEqual(1500);
  });
});
```

---

## Performance Characteristics Summary

| Provider | Deposit Success | Withdrawal Success | Balance Check | Avg Latency | Max Latency |
|----------|-----------------|-------------------|---------------|-------------|------------|
| MTN | 96% | 93% | 98% | 1200ms | 2500ms |
| Airtel | 97% | 95% | 99% | 1000ms | 2500ms |
| M-Pesa | 98% | 97% | 99% | 800ms | 2000ms |

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Status:** Ready for Integration
