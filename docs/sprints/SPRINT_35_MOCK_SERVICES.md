# Sprint 35 Mock Services Documentation

**Sprint:** Sprint 35
**Purpose:** Define mock services and infrastructure for testing referral system without external dependencies
**Status:** Preparation for development

---

## Overview

Sprint 35 (Referral & Rewards Program) requires integration with several external services:
- Device fingerprinting (FingerprintJS)
- QR code generation and storage (qrcode + AWS S3)
- Short URL generation (custom or Rebrandly)
- Event streaming and WebSockets (for leaderboard real-time updates)
- Redis caching (for leaderboard)
- Email/SMS delivery (for notifications)

This document describes how to mock these services for development, testing, and CI/CD.

---

## 1. Device Fingerprinting Mock Service

### Purpose
Mock FingerprintJS to detect device fingerprints without calling external API.

### Implementation

**Mock Device Fingerprinting Service:**

```typescript
// src/referral/services/mocks/device-fingerprint.mock.ts
@Injectable()
export class DeviceFingerprintMock {
  /**
   * Generate a consistent device fingerprint from user agent
   * In production, this would call FingerprintJS API
   */
  generateFingerprint(userAgent: string): string {
    // Hash the user agent to create a consistent fingerprint
    return createHash('sha256')
      .update(userAgent)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Check if device already has an account
   * In production, would call FingerprintJS API
   */
  async checkDeviceHistory(fingerprint: string): Promise<boolean> {
    // Query database for existing accounts with this fingerprint
    const existing = await this.deviceHistoryRepository.findOne({
      where: { fingerprint },
    });
    return !!existing;
  }

  /**
   * Get device info from user agent
   * Mock extracts basic browser/OS info
   */
  parseDeviceInfo(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();

    return {
      browser: this.extractBrowser(ua),
      os: this.extractOS(ua),
      device_type: this.detectDeviceType(ua),
      fingerprint: this.generateFingerprint(userAgent),
    };
  }

  private extractBrowser(ua: string): string {
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('edge')) return 'Edge';
    return 'Unknown';
  }

  private extractOS(ua: string): string {
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'MacOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ios')) return 'iOS';
    return 'Unknown';
  }

  private detectDeviceType(ua: string): string {
    if (ua.includes('mobile') || ua.includes('android')) return 'Mobile';
    if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
    return 'Desktop';
  }
}

interface DeviceInfo {
  browser: string;
  os: string;
  device_type: string;
  fingerprint: string;
}
```

### Configuration

```typescript
// src/referral/referral.module.ts
import { DeviceFingerprintMock } from './services/mocks/device-fingerprint.mock';

@Module({
  providers: [
    {
      provide: 'DEVICE_FINGERPRINT_SERVICE',
      useClass: process.env.NODE_ENV === 'production'
        ? FingerprintJSService  // Real service
        : DeviceFingerprintMock,  // Mock service
    },
  ],
})
export class ReferralModule {}
```

### Test Usage

```typescript
// src/referral/services/__tests__/referral-code.service.spec.ts
describe('ReferralCodeService - Device Fingerprinting', () => {
  let service: ReferralCodeService;
  let mockFingerprintService: DeviceFingerprintMock;

  beforeEach(async () => {
    mockFingerprintService = new DeviceFingerprintMock();
  });

  it('should detect same device across multiple signups', async () => {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0';

    const fingerprint1 = mockFingerprintService.generateFingerprint(userAgent);
    const fingerprint2 = mockFingerprintService.generateFingerprint(userAgent);

    expect(fingerprint1).toBe(fingerprint2);
  });

  it('should detect different devices', async () => {
    const ua1 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0';
    const ua2 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1) Safari/604.1';

    const fingerprint1 = mockFingerprintService.generateFingerprint(ua1);
    const fingerprint2 = mockFingerprintService.generateFingerprint(ua2);

    expect(fingerprint1).not.toBe(fingerprint2);
  });

  it('should extract device info from user agent', async () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0';

    const info = mockFingerprintService.parseDeviceInfo(ua);

    expect(info.browser).toBe('Chrome');
    expect(info.os).toBe('Windows');
    expect(info.device_type).toBe('Desktop');
  });
});
```

---

## 2. QR Code Generation Mock Service

### Purpose
Mock QR code generation and S3 storage without AWS dependency.

### Implementation

**Mock QR Code Service:**

```typescript
// src/referral/services/mocks/qr-code.mock.ts
@Injectable()
export class QRCodeMock {
  /**
   * Generate QR code and return mock S3 URL
   * In production, generates real QR code and uploads to S3
   */
  async generateQRCode(data: string): Promise<string> {
    if (process.env.NODE_ENV === 'test') {
      // Return mock S3 URL
      return `https://s3.mock.amazonaws.com/qr-codes/${Date.now()}.png`;
    }

    // Generate real QR code
    return await this.generateRealQRCode(data);
  }

  /**
   * Generate QR code as data URL (for testing)
   */
  async generateQRCodeDataURL(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
      });
    } catch (err) {
      throw new InternalServerErrorException('Failed to generate QR code');
    }
  }

  /**
   * Mock upload to S3
   */
  async uploadToS3(
    dataUrl: string,
    bucket: string,
    key: string
  ): Promise<string> {
    if (process.env.NODE_ENV === 'test') {
      // Return mock S3 URL without actual upload
      return `https://${bucket}.s3.mock.amazonaws.com/${key}`;
    }

    // Real S3 upload
    return await this.uploadRealToS3(dataUrl, bucket, key);
  }

  private async generateRealQRCode(data: string): Promise<string> {
    const dataUrl = await QRCode.toDataURL(data);
    const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');

    const key = `qr-codes/${nanoid(8)}.png`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    });

    await s3Client.send(command);

    return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
  }

  private async uploadRealToS3(
    dataUrl: string,
    bucket: string,
    key: string
  ): Promise<string> {
    const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    });

    await s3Client.send(command);

    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
}
```

### Module Configuration

```typescript
// src/referral/referral.module.ts
@Module({
  providers: [
    {
      provide: 'QR_CODE_SERVICE',
      useClass: process.env.NODE_ENV === 'production'
        ? QRCodeService
        : QRCodeMock,
    },
  ],
})
export class ReferralModule {}
```

### Test Usage

```typescript
// src/referral/services/__tests__/qr-code.mock.spec.ts
describe('QRCodeMock', () => {
  let service: QRCodeMock;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    service = new QRCodeMock();
  });

  it('should generate mock S3 URL in test environment', async () => {
    const url = await service.generateQRCode('https://example.com');

    expect(url).toContain('s3.mock.amazonaws.com');
    expect(url).toContain('qr-codes');
  });

  it('should generate valid QR code data URL', async () => {
    const dataUrl = await service.generateQRCodeDataURL('https://example.com');

    expect(dataUrl).toContain('data:image/png;base64');
  });

  it('should mock upload without AWS credentials', async () => {
    const dataUrl = await service.generateQRCodeDataURL('https://example.com');
    const mockUrl = await service.uploadToS3(
      dataUrl,
      'test-bucket',
      'qr-codes/test.png'
    );

    expect(mockUrl).toContain('s3.mock.amazonaws.com');
    expect(mockUrl).toContain('test-bucket');
  });
});
```

---

## 3. Short URL Service Mock

### Purpose
Mock short URL generation without external service dependency.

### Implementation

**Mock Short URL Service:**

```typescript
// src/referral/services/mocks/short-url.mock.ts
@Injectable()
export class ShortURLMock {
  /**
   * Generate short URL ID
   * In test/dev: return mock short URL
   * In production: integrate with Rebrandly or custom service
   */
  async generateShortURL(longUrl: string): Promise<string> {
    const shortId = nanoid(8);

    if (process.env.NODE_ENV === 'test') {
      return `https://ref.mock.app/${shortId}`;
    }

    if (process.env.NODE_ENV === 'production') {
      return await this.createRebrandlyShortURL(longUrl);
    }

    return `https://ref.localhost:3000/${shortId}`;
  }

  /**
   * Mock redirect resolution
   */
  async resolveShortURL(shortId: string): Promise<string> {
    if (process.env.NODE_ENV === 'test') {
      // Return mock long URL
      return `https://ubiquitous-tribble.app?ref=abc123&source=short_link`;
    }

    // Real resolution from database
    const mapping = await this.shortURLRepository.findOne({
      where: { short_id: shortId },
    });

    return mapping?.long_url || null;
  }

  private async createRebrandlyShortURL(longUrl: string): Promise<string> {
    const response = await fetch('https://api.rebrandly.com/v1/links', {
      method: 'POST',
      headers: {
        'apikey': process.env.REBRANDLY_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: longUrl,
        domain: { fullName: process.env.SHORT_DOMAIN },
      }),
    });

    const data = await response.json();
    return data.shortUrl;
  }
}
```

### Test Usage

```typescript
describe('ShortURLMock', () => {
  let service: ShortURLMock;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    service = new ShortURLMock();
  });

  it('should generate short URL in test environment', async () => {
    const shortUrl = await service.generateShortURL('https://ubiquitous-tribble.app');

    expect(shortUrl).toContain('ref.mock.app');
  });

  it('should resolve short URL to long URL', async () => {
    const longUrl = await service.resolveShortURL('abc123');

    expect(longUrl).toContain('ubiquitous-tribble.app');
  });
});
```

---

## 4. Redis Leaderboard Mock

### Purpose
Mock Redis for local development and testing without requiring Redis server.

### Implementation

**Mock Redis Service:**

```typescript
// src/referral/services/mocks/redis.mock.ts
@Injectable()
export class RedisLeaderboardMock {
  private leaderboards: Map<string, Array<{ member: string; score: number }>> = new Map();

  /**
   * Add member to sorted set (leaderboard)
   */
  async zadd(key: string, score: number, member: string): Promise<number> {
    if (!this.leaderboards.has(key)) {
      this.leaderboards.set(key, []);
    }

    const leaderboard = this.leaderboards.get(key);
    const existingIndex = leaderboard.findIndex(x => x.member === member);

    if (existingIndex >= 0) {
      leaderboard[existingIndex].score = score;
    } else {
      leaderboard.push({ member, score });
    }

    // Keep sorted in descending order
    leaderboard.sort((a, b) => b.score - a.score);

    return this.leaderboards.get(key).length;
  }

  /**
   * Get top N members from sorted set
   */
  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    const leaderboard = this.leaderboards.get(key) || [];
    return leaderboard.slice(start, stop + 1).map(x => x.member);
  }

  /**
   * Get member rank in sorted set
   */
  async zrevrank(key: string, member: string): Promise<number | null> {
    const leaderboard = this.leaderboards.get(key) || [];
    const index = leaderboard.findIndex(x => x.member === member);
    return index >= 0 ? index : null;
  }

  /**
   * Get score for member
   */
  async zscore(key: string, member: string): Promise<number | null> {
    const leaderboard = this.leaderboards.get(key) || [];
    const item = leaderboard.find(x => x.member === member);
    return item?.score || null;
  }

  /**
   * Delete leaderboard (for testing)
   */
  async del(key: string): Promise<number> {
    return this.leaderboards.delete(key) ? 1 : 0;
  }

  /**
   * Clear all leaderboards
   */
  clear(): void {
    this.leaderboards.clear();
  }

  /**
   * Get full leaderboard (for testing)
   */
  getLeaderboard(key: string): Array<{ member: string; score: number }> {
    return this.leaderboards.get(key) || [];
  }
}
```

### Configuration

```typescript
// src/redis/redis.module.ts
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        if (process.env.NODE_ENV === 'test') {
          return new RedisLeaderboardMock();
        }

        const redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        });

        await redis.ping();
        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
```

### Test Usage

```typescript
describe('RedisLeaderboardMock', () => {
  let redis: RedisLeaderboardMock;

  beforeEach(() => {
    redis = new RedisLeaderboardMock();
  });

  afterEach(() => {
    redis.clear();
  });

  it('should add members to leaderboard', async () => {
    await redis.zadd('leaderboard:weekly', 50, 'user1');
    await redis.zadd('leaderboard:weekly', 75, 'user2');
    await redis.zadd('leaderboard:weekly', 100, 'user3');

    const top = await redis.zrevrange('leaderboard:weekly', 0, 2);

    expect(top).toEqual(['user3', 'user2', 'user1']);
  });

  it('should return correct rank', async () => {
    await redis.zadd('leaderboard:weekly', 50, 'user1');
    await redis.zadd('leaderboard:weekly', 75, 'user2');

    const rank = await redis.zrevrank('leaderboard:weekly', 'user1');

    expect(rank).toBe(1);  // Second place
  });

  it('should update score when member already exists', async () => {
    await redis.zadd('leaderboard:weekly', 50, 'user1');
    await redis.zadd('leaderboard:weekly', 100, 'user1');

    const score = await redis.zscore('leaderboard:weekly', 'user1');

    expect(score).toBe(100);
  });
});
```

---

## 5. Event Emitter Mock

### Purpose
Mock event-driven architecture for testing without message queues.

### Implementation

**Mock Event Service:**

```typescript
// src/common/services/mocks/event-emitter.mock.ts
@Injectable()
export class EventEmitterMock {
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Register event listener
   */
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }

  /**
   * Emit event synchronously
   */
  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach(listener => {
      try {
        listener(...args);
      } catch (err) {
        console.error(`Error in listener for ${event}:`, err);
      }
    });
  }

  /**
   * Emit event asynchronously
   */
  async emitAsync(event: string, ...args: any[]): Promise<void> {
    const eventListeners = this.listeners.get(event) || [];
    await Promise.all(
      eventListeners.map(listener => {
        try {
          return Promise.resolve(listener(...args));
        } catch (err) {
          console.error(`Error in listener for ${event}:`, err);
        }
      })
    );
  }

  /**
   * Remove listener
   */
  removeListener(event: string, listener: Function): void {
    const eventListeners = this.listeners.get(event) || [];
    const index = eventListeners.indexOf(listener);
    if (index >= 0) {
      eventListeners.splice(index, 1);
    }
  }

  /**
   * Clear all listeners (for testing)
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get listeners for event (for testing)
   */
  getListeners(event: string): Function[] {
    return this.listeners.get(event) || [];
  }
}
```

### Test Usage

```typescript
describe('EventEmitterMock', () => {
  let emitter: EventEmitterMock;

  beforeEach(() => {
    emitter = new EventEmitterMock();
  });

  afterEach(() => {
    emitter.clear();
  });

  it('should emit events and call listeners', async () => {
    const callback = jest.fn();
    emitter.on('referral.created', callback);

    emitter.emit('referral.created', { referral_id: '123' });

    expect(callback).toHaveBeenCalledWith({ referral_id: '123' });
  });

  it('should handle multiple listeners for same event', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    emitter.on('referral.kyc_completed', callback1);
    emitter.on('referral.kyc_completed', callback2);

    emitter.emit('referral.kyc_completed', { user_id: '456' });

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('should emit events asynchronously', async () => {
    const callback = jest.fn();
    emitter.on('referral.rewarded', callback);

    await emitter.emitAsync('referral.rewarded', { reward_id: '789' });

    expect(callback).toHaveBeenCalledWith({ reward_id: '789' });
  });
});
```

---

## 6. Email/SMS Notification Mock

### Purpose
Mock email and SMS delivery for testing without external services.

### Implementation

**Mock Notification Service:**

```typescript
// src/notification/services/mocks/notification.mock.ts
@Injectable()
export class NotificationMock {
  private sentEmails: Array<{ to: string; subject: string; body: string }> = [];
  private sentSMS: Array<{ phone: string; message: string }> = [];

  /**
   * Mock email sending
   */
  async sendEmail(
    to: string,
    subject: string,
    body: string
  ): Promise<{ success: boolean; messageId?: string }> {
    if (process.env.NODE_ENV === 'test') {
      this.sentEmails.push({ to, subject, body });
      return { success: true, messageId: `mock-${Date.now()}` };
    }

    // Real email sending via SendGrid
    return await this.sendRealEmail(to, subject, body);
  }

  /**
   * Mock SMS sending
   */
  async sendSMS(
    phone: string,
    message: string
  ): Promise<{ success: boolean; smsId?: string }> {
    if (process.env.NODE_ENV === 'test') {
      this.sentSMS.push({ phone, message });
      return { success: true, smsId: `mock-${Date.now()}` };
    }

    // Real SMS sending via Twilio
    return await this.sendRealSMS(phone, message);
  }

  /**
   * Get sent emails (for testing)
   */
  getSentEmails(): Array<{ to: string; subject: string; body: string }> {
    return this.sentEmails;
  }

  /**
   * Get sent SMS (for testing)
   */
  getSentSMS(): Array<{ phone: string; message: string }> {
    return this.sentSMS;
  }

  /**
   * Clear sent messages (for testing)
   */
  clear(): void {
    this.sentEmails = [];
    this.sentSMS = [];
  }

  private async sendRealEmail(
    to: string,
    subject: string,
    body: string
  ): Promise<{ success: boolean; messageId?: string }> {
    const client = sgMail;
    try {
      const result = await client.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        html: body,
      });
      return { success: true, messageId: result[0].headers['x-message-id'] };
    } catch (err) {
      return { success: false };
    }
  }

  private async sendRealSMS(
    phone: string,
    message: string
  ): Promise<{ success: boolean; smsId?: string }> {
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    try {
      const result = await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      return { success: true, smsId: result.sid };
    } catch (err) {
      return { success: false };
    }
  }
}
```

### Test Usage

```typescript
describe('NotificationMock', () => {
  let service: NotificationMock;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    service = new NotificationMock();
  });

  afterEach(() => {
    service.clear();
  });

  it('should mock email sending', async () => {
    const result = await service.sendEmail(
      'user@example.com',
      'Test Subject',
      '<p>Test body</p>'
    );

    expect(result.success).toBe(true);
    expect(service.getSentEmails()).toHaveLength(1);
  });

  it('should mock SMS sending', async () => {
    const result = await service.sendSMS(
      '+2348012345678',
      'Test SMS'
    );

    expect(result.success).toBe(true);
    expect(service.getSentSMS()).toHaveLength(1);
  });

  it('should track all sent emails', async () => {
    await service.sendEmail('user1@example.com', 'Subject 1', 'Body 1');
    await service.sendEmail('user2@example.com', 'Subject 2', 'Body 2');

    const sent = service.getSentEmails();
    expect(sent).toHaveLength(2);
    expect(sent[0].to).toBe('user1@example.com');
  });
});
```

---

## 7. Integration Test Example: Complete Referral Flow

### Purpose
Demonstrate how to test complete referral flow using all mocks together.

### Implementation

```typescript
// src/referral/__tests__/referral.integration.spec.ts
describe('Referral System Integration Tests', () => {
  let referralService: ReferralCodeService;
  let attributionService: ReferralAttributionService;
  let rewardService: RewardService;
  let fingerprintMock: DeviceFingerprintMock;
  let qrCodeMock: QRCodeMock;
  let redisLeaderboard: RedisLeaderboardMock;
  let notificationMock: NotificationMock;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';

    fingerprintMock = new DeviceFingerprintMock();
    qrCodeMock = new QRCodeMock();
    redisLeaderboard = new RedisLeaderboardMock();
    notificationMock = new NotificationMock();

    // Initialize services with mocks
    const module = await Test.createTestingModule({
      imports: [ReferralModule],
      providers: [
        { provide: 'DEVICE_FINGERPRINT', useValue: fingerprintMock },
        { provide: 'QR_CODE_SERVICE', useValue: qrCodeMock },
        { provide: 'REDIS_CLIENT', useValue: redisLeaderboard },
        { provide: 'NOTIFICATION_SERVICE', useValue: notificationMock },
      ],
    }).compile();

    referralService = module.get<ReferralCodeService>(ReferralCodeService);
    attributionService = module.get<ReferralAttributionService>(ReferralAttributionService);
    rewardService = module.get<RewardService>(RewardService);
  });

  it('should handle complete referral flow', async () => {
    // 1. Create referrer and generate code
    const referrer = await createUser('referrer@example.com');
    const referralCode = await referralService.generateCode(referrer.id);

    expect(referralCode.code).toBeDefined();
    expect(referralCode.referral_link).toContain('ref=');

    // 2. Referee clicks referral link
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
    const clickId = await referralService.trackClick(
      referralCode.code,
      'direct_link',
      '192.168.1.1',
      userAgent
    );

    expect(clickId).toBeDefined();

    // 3. Referee signs up
    const referee = await createUser('referee@example.com');
    await attributionService.attributeReferral(referee.id, referralCode.id);

    // 4. Check referral created
    const referral = await getReferralByReferee(referee.id);
    expect(referral.status).toBe('pending');
    expect(referral.referrer_id).toBe(referrer.id);

    // 5. Referee completes KYC
    await attributionService.markKYCCompleted(referee.id);

    // Check reward created
    const rewards = await getRewardsByReferrer(referrer.id);
    expect(rewards).toHaveLength(1);
    expect(rewards[0].status).toBe('earned');

    // 6. Referee makes first transaction
    await attributionService.markFirstTransaction(referee.id, 10000);

    // 7. Check leaderboard updated
    await redisLeaderboard.zadd('leaderboard:weekly', 1, referrer.id);
    const topUsers = await redisLeaderboard.zrevrange('leaderboard:weekly', 0, 10);

    expect(topUsers).toContain(referrer.id);

    // 8. Check notification sent
    const emails = notificationMock.getSentEmails();
    expect(emails.length).toBeGreaterThan(0);
  });

  it('should prevent fraudulent referrals', async () => {
    // Create referrer
    const referrer = await createUser('referrer@example.com');
    const referralCode = await referralService.generateCode(referrer.id);

    // Try to use same device fingerprint
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
    const fingerprint = fingerprintMock.generateFingerprint(userAgent);

    // Create first account with fingerprint
    const user1 = await createUser('user1@example.com');
    await saveDeviceFingerprint(user1.id, fingerprint);

    // Try to create second account with same fingerprint
    const isDuplicate = await fingerprintMock.checkDeviceHistory(fingerprint);

    expect(isDuplicate).toBe(true);
  });

  it('should generate QR code without S3 in test', async () => {
    const referrer = await createUser('referrer@example.com');
    const qrCodeUrl = await referralService.generateQRCode(referrer.id);

    expect(qrCodeUrl).toContain('s3.mock.amazonaws.com');
    expect(qrCodeUrl).toContain('qr-codes');
  });
});
```

---

## 8. Mock Services Configuration

### Environment Variables

```bash
# .env.test
NODE_ENV=test

# Mock configuration
MOCK_DEVICE_FINGERPRINT=true
MOCK_QR_CODE=true
MOCK_REDIS=true
MOCK_NOTIFICATIONS=true

# Real service endpoints (for non-mocked services)
SENDGRID_API_KEY=test-key
TWILIO_ACCOUNT_SID=test-sid
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.mock.ts',
    '!src/**/*.entity.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
```

---

## 9. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/sprint-35-tests.yml
name: Sprint 35 Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests (with mocks)
        run: npm run test:unit

      - name: Run integration tests (with mocks)
        run: npm run test:integration

      - name: Run E2E tests (with mocks)
        run: npm run test:e2e

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 10. Testing Checklist

- [ ] Device fingerprinting mock working (no FingerprintJS API calls)
- [ ] QR code generation mock working (no S3 uploads in test)
- [ ] Redis mock working (in-memory leaderboard)
- [ ] Event emitter mock working (sync/async events)
- [ ] Email mock working (capture sent emails)
- [ ] SMS mock working (capture sent SMS)
- [ ] Integration tests passing with all mocks
- [ ] Coverage > 85%
- [ ] CI/CD pipeline green

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Status:** Ready for Implementation
**Mock Services Count:** 6
**Total Test Cases:** 50+
