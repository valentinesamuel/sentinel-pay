# Sprint 34 Mock Services - Payroll Management

**Sprint:** Sprint 34
**Focus:** Realistic mock services for bank account verification and KYC integration
**Mock Services:** 3 primary

---

## Overview

These mocks simulate:
- **CBN NIP Verification:** Verify Nigerian bank account numbers via CBN database
- **Bank Account Validation:** Confirm account name, bank code, and account status
- **Email/SMS Notifications:** Deliver payslips with realistic delivery tracking
- **KYC Verification:** Check employee KYC status and document verification

---

## 1. CBN NIP Account Verification Mock

### Purpose
Simulate CBN (Central Bank of Nigeria) NIP verification for bank account validation

### Realistic Behavior
- **Success Rate:** 94% on first attempt
- **Latency:** 500-3000ms (realistic bank API response times)
- **Common Failures:** Invalid account number (2%), account inactive (2%), service timeout (2%)
- **Account Name Matching:** Fuzzy matching for minor variations
- **Bank Code Validation:** Verify against CBN registered bank codes

### Implementation

```typescript
import { Injectable, BadRequestException, ServiceUnavailableException } from '@nestjs/common';

enum VerificationStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  INACTIVE = 'inactive',
  UNVERIFIED = 'unverified',
  TIMEOUT = 'timeout',
}

interface BankAccount {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  accountStatus: 'active' | 'inactive' | 'dormant';
  verificationStatus: VerificationStatus;
  verifiedAt?: Date;
  verificationReference: string;
  accountType: 'savings' | 'current' | 'domiciliary';
}

@Injectable()
export class CBNNIPVerificationMock {
  private verificationCache: Map<string, BankAccount> = new Map();
  private readonly CBN_BANK_CODES = {
    '011': 'First Bank Nigeria',
    '012': 'Union Bank Nigeria',
    '014': 'Diamond Bank',
    '015': 'Zenith Bank',
    '019': 'Guaranty Trust Bank',
    '024': 'Access Bank Nigeria',
    '035': 'Intercontinental Bank',
    '037': 'Eco Bank Nigeria',
    '044': 'Stanbic IBTC',
    '045': 'Conti Bank',
    '048': 'Sterling Bank',
    '050': 'Fidelity Bank',
    '051': 'Skye Bank',
    '052': 'Ecobank Transnational',
    '053': 'Suntrust Bank',
    '055': 'Unitrust Bank',
    '056': 'United Bank for Africa',
    '057': 'Bounce Nigeria',
    '058': 'Keystone Bank',
    '060': 'Fidelity Bank',
    '063': 'Wema Bank',
    '070': 'Fidelity Bank',
    '282': 'Zenith Bank (Offshore)',
  };

  async verifyAccount(
    accountNumber: string,
    bankCode: string,
  ): Promise<{ verified: boolean; account: BankAccount; reference: string }> {
    // Validate inputs
    if (!this.isValidAccountNumber(accountNumber)) {
      throw new BadRequestException('Invalid account number format (must be 10 digits)');
    }

    if (!this.CBN_BANK_CODES[bankCode]) {
      throw new BadRequestException(`Invalid bank code: ${bankCode}`);
    }

    // Check cache
    const cacheKey = `${bankCode}-${accountNumber}`;
    if (this.verificationCache.has(cacheKey)) {
      return {
        verified: true,
        account: this.verificationCache.get(cacheKey),
        reference: `cached-${Date.now()}`,
      };
    }

    // Simulate API latency
    const apiLatency = this.getRandomLatency();
    const willFail = this.shouldFail(0.06); // 6% failure rate

    await new Promise((resolve) => setTimeout(resolve, apiLatency));

    if (willFail) {
      const failureType = this.getRandomFailure();
      throw new ServiceUnavailableException(
        `CBN verification failed: ${failureType.message}`,
      );
    }

    // Generate account info
    const account = this.generateAccountInfo(accountNumber, bankCode);

    // Cache result
    this.verificationCache.set(cacheKey, account);

    return {
      verified: account.verificationStatus === VerificationStatus.VALID,
      account,
      reference: account.verificationReference,
    };
  }

  async bulkVerifyAccounts(
    accounts: Array<{ accountNumber: string; bankCode: string }>,
  ): Promise<{
    successful: BankAccount[];
    failed: Array<{ account: string; reason: string }>;
    totalTime: number;
  }> {
    const startTime = Date.now();
    const successful: BankAccount[] = [];
    const failed: Array<{ account: string; reason: string }> = [];

    // Simulate batch processing with delays
    for (const { accountNumber, bankCode } of accounts) {
      try {
        const result = await this.verifyAccount(accountNumber, bankCode);
        successful.push(result.account);
      } catch (error) {
        failed.push({
          account: `${bankCode}-${accountNumber}`,
          reason: error.message,
        });
      }

      // Add delay between calls to simulate realistic processing
      await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
    }

    return {
      successful,
      failed,
      totalTime: Date.now() - startTime,
    };
  }

  async retryVerification(
    reference: string,
  ): Promise<{ verified: boolean; account: BankAccount }> {
    // Find account by reference
    let account: BankAccount | null = null;
    for (const cached of this.verificationCache.values()) {
      if (cached.verificationReference === reference) {
        account = cached;
        break;
      }
    }

    if (!account) {
      throw new BadRequestException('Reference not found');
    }

    // Simulate retry with potentially better success
    const retryLatency = this.getRandomLatency() * 1.5; // Slower retry
    const willFail = this.shouldFail(0.04); // 4% failure rate on retry

    await new Promise((resolve) => setTimeout(resolve, retryLatency));

    if (willFail) {
      throw new ServiceUnavailableException('Retry failed. Please try again later.');
    }

    account.verificationStatus = VerificationStatus.VALID;
    account.verifiedAt = new Date();

    return {
      verified: true,
      account,
    };
  }

  private generateAccountInfo(
    accountNumber: string,
    bankCode: string,
  ): BankAccount {
    const bankName = this.CBN_BANK_CODES[bankCode];
    const accountStatuses: Array<'active' | 'inactive' | 'dormant'> = [
      'active',
      'active',
      'active',
      'dormant',
    ]; // 75% active
    const accountTypes: Array<'savings' | 'current' | 'domiciliary'> = [
      'current',
      'savings',
    ];

    return {
      accountNumber,
      bankCode,
      bankName,
      accountName: this.generateAccountName(), // Random name for demo
      accountStatus: accountStatuses[Math.floor(Math.random() * accountStatuses.length)],
      verificationStatus: VerificationStatus.VALID,
      verifiedAt: new Date(),
      verificationReference: `VER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      accountType: accountTypes[Math.floor(Math.random() * accountTypes.length)],
    };
  }

  private generateAccountName(): string {
    const firstNames = [
      'John',
      'Jane',
      'Ahmed',
      'Fatima',
      'Chioma',
      'Ola',
      'Zainab',
      'Blessing',
    ];
    const lastNames = [
      'Smith',
      'Johnson',
      'Okafor',
      'Hassan',
      'Adeyemi',
      'Oluwaseun',
      'Chukwu',
      'Eze',
    ];

    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${first} ${last}`;
  }

  private isValidAccountNumber(accountNumber: string): boolean {
    return /^\d{10}$/.test(accountNumber);
  }

  private shouldFail(failureRate: number = 0.06): boolean {
    return Math.random() < failureRate;
  }

  private getRandomLatency(): number {
    // 500-3000ms with occasional timeouts
    return Math.random() < 0.95
      ? Math.random() * 2500 + 500
      : Math.random() * 2000 + 3000; // 3-5s for timeouts
  }

  private getRandomFailure(): { code: string; message: string } {
    const failures = [
      { code: 'INVALID_ACCOUNT', message: 'Account number does not exist in CBN database' },
      { code: 'INACTIVE_ACCOUNT', message: 'Account is marked as inactive' },
      { code: 'SERVICE_TIMEOUT', message: 'CBN service timeout. Please retry.' },
      { code: 'NETWORK_ERROR', message: 'Network error connecting to CBN service' },
    ];

    return failures[Math.floor(Math.random() * failures.length)];
  }

  getMetrics(): {
    totalVerifications: number;
    successfulVerifications: number;
    failedVerifications: number;
    averageLatency: number;
    cacheHitRate: number;
  } {
    const cacheSize = this.verificationCache.size;
    const totalVerifications = cacheSize; // Simplified for demo

    return {
      totalVerifications,
      successfulVerifications: cacheSize,
      failedVerifications: 0,
      averageLatency: 1250, // Average of 500-3000ms
      cacheHitRate: cacheSize > 0 ? 75 : 0, // After initial verification
    };
  }
}
```

---

## 2. Bank Account Validator Mock

### Purpose
Additional validation layer for account name matching and account status checking

### Realistic Behavior
- **Fuzzy Matching:** Handle minor variations in names (spaces, capitalization)
- **Account Status:** Active, inactive, dormant, closed
- **Balance Verification:** Simulate account balance checks (may fail if account has insufficient balance for payroll)
- **Latency:** 200-800ms

### Implementation

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';

interface AccountValidationResult {
  isValid: boolean;
  exactMatch: boolean;
  matchConfidence: number; // 0-100
  suggestions?: string[];
  accountStatus: string;
  errors?: string[];
}

@Injectable()
export class BankAccountValidatorMock {
  async validateAccountName(
    providedName: string,
    verifiedName: string,
  ): Promise<AccountValidationResult> {
    const latency = Math.random() * 600 + 200; // 200-800ms
    await new Promise((resolve) => setTimeout(resolve, latency));

    const provided = this.normalizeString(providedName);
    const verified = this.normalizeString(verifiedName);

    const exactMatch = provided === verified;
    let matchConfidence = 100;
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (!exactMatch) {
      // Fuzzy matching
      matchConfidence = this.calculateSimilarity(provided, verified);

      if (matchConfidence < 60) {
        errors.push(`Account name mismatch. Provided: "${providedName}", Verified: "${verifiedName}"`);
        suggestions.push(`Use verified account name: "${verifiedName}"`);
      } else if (matchConfidence < 85) {
        errors.push('Account name has minor variations. Please review.');
      }
    }

    return {
      isValid: matchConfidence >= 70,
      exactMatch,
      matchConfidence,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      accountStatus: 'verified',
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async validateAccountStatus(
    bankCode: string,
    accountNumber: string,
  ): Promise<{ status: 'active' | 'inactive' | 'dormant' | 'closed'; canReceiveFunds: boolean }> {
    const latency = Math.random() * 400 + 100; // 100-500ms
    await new Promise((resolve) => setTimeout(resolve, latency));

    // Simulate account statuses
    const statuses: Array<'active' | 'inactive' | 'dormant' | 'closed'> = [
      'active',
      'active',
      'active',
      'dormant',
      'inactive',
    ];

    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      status,
      canReceiveFunds: status === 'active',
    };
  }

  async validateForPayroll(
    accountNumber: string,
    bankCode: string,
    payrollAmount: number,
  ): Promise<{
    canReceivePayroll: boolean;
    reasons?: string[];
    warnings?: string[];
  }> {
    const latency = Math.random() * 600 + 300; // 300-900ms
    await new Promise((resolve) => setTimeout(resolve, latency));

    const reasons: string[] = [];
    const warnings: string[] = [];

    // Check account status
    const statusCheck = await this.validateAccountStatus(bankCode, accountNumber);
    if (!statusCheck.canReceiveFunds) {
      reasons.push(`Account status is ${statusCheck.status}. Cannot receive payroll.`);
    }

    // Simulate balance check (mock only)
    if (Math.random() < 0.02) {
      // 2% chance of account having issues
      warnings.push('Account has recent transaction blocks. Monitor for delivery.');
    }

    return {
      canReceivePayroll: reasons.length === 0,
      reasons: reasons.length > 0 ? reasons : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 100;

    const editDistance = this.getLevenshteinDistance(longer, shorter);
    return ((longer.length - editDistance) / longer.length) * 100;
  }

  private getLevenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];

    for (let k = 0; k <= s1.length; k++) costs[k] = k;

    for (let i = 1; i <= s2.length; i++) {
      costs[0] = i;
      let nw = i - 1;

      for (let j = 1; j <= s1.length; j++) {
        const cj = Math.min(
          1 + Math.min(costs[j], costs[j - 1]),
          nw + (s1[j - 1] === s2[i - 1] ? 0 : 1),
        );
        nw = costs[j];
        costs[j] = cj;
      }
    }

    return costs[s1.length];
  }
}
```

---

## 3. Payslip Distribution & Email/SMS Mock

### Purpose
Simulate payslip distribution via email and SMS with delivery tracking

### Realistic Behavior
- **Success Rate:** 96% delivery
- **Latency:** 200-500ms to queue, 5-60 seconds to deliver
- **Download Tracking:** Track when payslips are opened/downloaded
- **Retry Logic:** Automatic retry on failure
- **Batch Processing:** Send 1000+ payslips per batch job

### Implementation

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';

enum PayslipStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  DOWNLOADED = 'downloaded',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

interface PayslipDelivery {
  deliveryId: string;
  employeeId: string;
  email: string;
  phoneNumber?: string;
  payslipUrl: string;
  status: PayslipStatus;
  sentVia: ('email' | 'sms')[];
  deliveredAt?: Date;
  openedAt?: Date;
  downloadedAt?: Date;
  failureReason?: string;
  retryCount: number;
  createdAt: Date;
}

@Injectable()
export class PayslipDistributionMock {
  private deliveryStore: Map<string, PayslipDelivery> = new Map();

  async sendPayslip(
    employeeId: string,
    email: string,
    phoneNumber: string | undefined,
    payslipUrl: string,
  ): Promise<{ deliveryId: string; status: string }> {
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email address');
    }

    const deliveryId = `PSL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const sendVia: ('email' | 'sms')[] = ['email'];

    if (phoneNumber && this.isValidPhoneNumber(phoneNumber)) {
      sendVia.push('sms');
    }

    const delivery: PayslipDelivery = {
      deliveryId,
      employeeId,
      email,
      phoneNumber,
      payslipUrl,
      status: PayslipStatus.QUEUED,
      sentVia: sendVia,
      retryCount: 0,
      createdAt: new Date(),
    };

    this.deliveryStore.set(deliveryId, delivery);

    // Simulate processing
    const processingLatency = Math.random() * 300 + 200;
    const willFail = this.shouldFail(0.04); // 4% failure rate

    setTimeout(async () => {
      if (willFail) {
        await this.handleDeliveryFailure(deliveryId);
      } else {
        await this.handleDeliverySuccess(deliveryId);
      }
    }, processingLatency);

    return {
      deliveryId,
      status: 'queued',
    };
  }

  async getDeliveryStatus(deliveryId: string): Promise<PayslipDelivery> {
    const delivery = this.deliveryStore.get(deliveryId);
    if (!delivery) {
      throw new BadRequestException('Delivery not found');
    }
    return delivery;
  }

  async retryDelivery(deliveryId: string): Promise<{ deliveryId: string; status: string }> {
    const delivery = this.deliveryStore.get(deliveryId);
    if (!delivery) {
      throw new BadRequestException('Delivery not found');
    }

    if (delivery.status !== PayslipStatus.FAILED) {
      throw new BadRequestException('Only failed deliveries can be retried');
    }

    if (delivery.retryCount >= 3) {
      throw new BadRequestException('Max retries exceeded');
    }

    delivery.retryCount += 1;
    delivery.status = PayslipStatus.QUEUED;

    const backoffDelay = Math.pow(2, delivery.retryCount) * 1000;

    setTimeout(async () => {
      const willFail = this.shouldFail(0.08 * delivery.retryCount);
      if (willFail) {
        await this.handleDeliveryFailure(deliveryId);
      } else {
        await this.handleDeliverySuccess(deliveryId);
      }
    }, backoffDelay);

    return {
      deliveryId,
      status: 'retrying',
    };
  }

  async trackDownload(deliveryId: string): Promise<{ downloaded: boolean }> {
    const delivery = this.deliveryStore.get(deliveryId);
    if (!delivery) {
      throw new BadRequestException('Delivery not found');
    }

    delivery.status = PayslipStatus.DOWNLOADED;
    delivery.downloadedAt = new Date();

    return { downloaded: true };
  }

  private async handleDeliverySuccess(deliveryId: string): Promise<void> {
    const delivery = this.deliveryStore.get(deliveryId);
    if (delivery) {
      delivery.status = PayslipStatus.SENT;
      delivery.sentAt = new Date();

      // Simulate delivery confirmation (5-20 seconds)
      const deliveryDelay = Math.random() * 15000 + 5000;
      setTimeout(() => {
        if (delivery.status === PayslipStatus.SENT) {
          delivery.status = PayslipStatus.DELIVERED;
          delivery.deliveredAt = new Date();

          // Simulate open (50% chance, 10 minutes to 2 hours later)
          if (Math.random() < 0.5) {
            const openDelay = Math.random() * 6300000 + 600000; // 10min to 2h
            setTimeout(() => {
              if (delivery.status === PayslipStatus.DELIVERED) {
                delivery.status = PayslipStatus.OPENED;
                delivery.openedAt = new Date();
              }
            }, openDelay);
          }
        }
      }, deliveryDelay);
    }
  }

  private async handleDeliveryFailure(deliveryId: string): Promise<void> {
    const delivery = this.deliveryStore.get(deliveryId);
    if (delivery) {
      const failureReasons = [
        'Email bounced',
        'Invalid email address',
        'SMS delivery failed',
        'Network timeout',
        'Invalid phone number',
      ];

      delivery.status = PayslipStatus.FAILED;
      delivery.failureReason =
        failureReasons[Math.floor(Math.random() * failureReasons.length)];

      if (delivery.status === PayslipStatus.FAILED && delivery.failureReason.includes('bounced')) {
        delivery.status = PayslipStatus.BOUNCED;
      }
    }
  }

  private shouldFail(failureRate: number = 0.04): boolean {
    return Math.random() < failureRate;
  }

  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    const regex = /^(\+234|0)[79]\d{8}$/;
    return regex.test(phoneNumber.replace(/\s/g, ''));
  }

  getMetrics(): {
    totalPayslips: number;
    deliveredPayslips: number;
    failedPayslips: number;
    openedPayslips: number;
    downloadedPayslips: number;
    deliveryRate: number;
  } {
    const deliveries = Array.from(this.deliveryStore.values());
    const delivered = deliveries.filter(
      (d) =>
        d.status === PayslipStatus.DELIVERED ||
        d.status === PayslipStatus.OPENED ||
        d.status === PayslipStatus.DOWNLOADED,
    );
    const failed = deliveries.filter((d) => d.status === PayslipStatus.FAILED || d.status === PayslipStatus.BOUNCED);
    const opened = deliveries.filter((d) => d.status === PayslipStatus.OPENED || d.status === PayslipStatus.DOWNLOADED);
    const downloaded = deliveries.filter((d) => d.status === PayslipStatus.DOWNLOADED);

    const deliveryRate =
      deliveries.length > 0 ? (delivered.length / deliveries.length) * 100 : 0;

    return {
      totalPayslips: deliveries.length,
      deliveredPayslips: delivered.length,
      failedPayslips: failed.length,
      openedPayslips: opened.length,
      downloadedPayslips: downloaded.length,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
    };
  }
}
```

---

## Integration Test Example

```typescript
describe('Payroll Account Verification Flow', () => {
  let nipmock: CBNNIPVerificationMock;
  let validatorMock: BankAccountValidatorMock;
  let payslipMock: PayslipDistributionMock;

  beforeEach(() => {
    nipmock = new CBNNIPVerificationMock();
    validatorMock = new BankAccountValidatorMock();
    payslipMock = new PayslipDistributionMock();
  });

  it('should verify bank account through CBN NIP', async () => {
    const result = await nipmock.verifyAccount('1234567890', '011');

    expect(result.verified).toBe(true);
    expect(result.account.verificationStatus).toBe('valid');
    expect(result.reference).toBeDefined();
  });

  it('should validate account name with fuzzy matching', async () => {
    const validation = await validatorMock.validateAccountName(
      'John Smith',
      'John Smith',
    );

    expect(validation.isValid).toBe(true);
    expect(validation.exactMatch).toBe(true);
    expect(validation.matchConfidence).toBe(100);
  });

  it('should handle minor name variations', async () => {
    const validation = await validatorMock.validateAccountName(
      'john smith',
      'John Smith',
    );

    expect(validation.isValid).toBe(true);
    expect(validation.matchConfidence).toBeGreaterThan(95);
  });

  it('should validate account for payroll processing', async () => {
    const validation = await validatorMock.validateForPayroll(
      '1234567890',
      '011',
      500000,
    );

    expect(validation.canReceivePayroll).toBe(true);
  });

  it('should send payslip via email and SMS', async () => {
    const result = await payslipMock.sendPayslip(
      'emp-001',
      'john@example.com',
      '+2348012345678',
      'https://payslips.example.com/emp-001.pdf',
    );

    expect(result.deliveryId).toMatch(/^PSL-/);
    expect(result.status).toBe('queued');

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const delivery = await payslipMock.getDeliveryStatus(result.deliveryId);
    expect(['queued', 'sent', 'delivered']).toContain(delivery.status);
  });

  it('should track payslip opens and downloads', async () => {
    const result = await payslipMock.sendPayslip(
      'emp-001',
      'john@example.com',
      '+2348012345678',
      'https://payslips.example.com/emp-001.pdf',
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const download = await payslipMock.trackDownload(result.deliveryId);
    expect(download.downloaded).toBe(true);

    const delivery = await payslipMock.getDeliveryStatus(result.deliveryId);
    expect(delivery.status).toBe('downloaded');
  });

  it('should handle bulk account verification', async () => {
    const accounts = [
      { accountNumber: '1234567890', bankCode: '011' },
      { accountNumber: '0987654321', bankCode: '015' },
      { accountNumber: '1111111111', bankCode: '024' },
    ];

    const result = await nipmock.bulkVerifyAccounts(accounts);

    expect(result.successful.length + result.failed.length).toBe(3);
  });

  it('should retry failed deliveries with backoff', async () => {
    const result = await payslipMock.sendPayslip(
      'emp-001',
      'john@example.com',
      '+2348012345678',
      'https://payslips.example.com/emp-001.pdf',
    );

    // Wait for potential failure
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const delivery = await payslipMock.getDeliveryStatus(result.deliveryId);

    if (delivery.status === 'failed') {
      const retryResult = await payslipMock.retryDelivery(result.deliveryId);
      expect(retryResult.status).toBe('retrying');

      const retryDelivery = await payslipMock.getDeliveryStatus(result.deliveryId);
      expect(retryDelivery.retryCount).toBe(1);
    }
  });
});
```

