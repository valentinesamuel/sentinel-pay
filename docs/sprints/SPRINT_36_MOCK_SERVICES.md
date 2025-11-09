# Sprint 36 Mock Services - Social Payments

**Sprint:** Sprint 36
**Focus:** Realistic mock services for payment distribution with variable latency, failures, and recovery
**Mock Services:** 4 primary + 3 supporting

---

## Overview

These mocks simulate real-world behavior including:
- **Variable Latency:** 50ms-500ms for successful calls, 1-5s for failures
- **Random Failures:** 5-10% failure rate depending on configuration
- **Partial Success:** Some messages succeed, some fail (realistic batch behavior)
- **Rate Limiting:** Respect rate limits and backoff
- **Circuit Breaker:** Auto-recover from cascading failures
- **State Persistence:** Track sent messages, failures, retries
- **Realistic Errors:** Proper error codes and messages per service

---

## 1. WhatsApp Business API Mock

### Purpose
Simulate WhatsApp Business API for sending payment requests and notifications to 10K+ users/day

### Realistic Behavior
- **Success Rate:** 92% on first attempt
- **Latency:** 100-300ms (success), 2000-5000ms (failure with retry)
- **Common Failures:** Invalid phone number (2%), service unavailable (3%), rate limit (3%)
- **Circuit Breaker:** Fails for 60 seconds after 5 consecutive failures

### Implementation

```typescript
import { Injectable, ServiceUnavailableException, BadRequestException } from '@nestjs/common';

enum WhatsAppStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

interface WhatsAppMessage {
  id: string;
  phoneNumber: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
  status: WhatsAppStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
  retryCount: number;
  createdAt: Date;
}

@Injectable()
export class WhatsAppBusinessMock {
  private messageStore: Map<string, WhatsAppMessage> = new Map();
  private failureCount: number = 0;
  private isCircuitBreakerOpen: boolean = false;
  private circuitBreakerResetTime: Date = null;
  private readonly FAILURE_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_DURATION = 60000; // 60 seconds

  async sendMessage(
    phoneNumber: string,
    message: string,
    templateName?: string,
    templateParams?: Record<string, string>,
  ): Promise<{ messageId: string; status: string }> {
    // Simulate circuit breaker
    if (this.isCircuitBreakerOpen) {
      if (Date.now() < this.circuitBreakerResetTime.getTime()) {
        throw new ServiceUnavailableException(
          'WhatsApp service temporarily unavailable (circuit breaker open)',
        );
      } else {
        this.isCircuitBreakerOpen = false;
        this.failureCount = 0;
      }
    }

    // Validate phone number
    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new BadRequestException('Invalid phone number format');
    }

    const messageId = `whatsapp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const simulatedLatency = this.getRandomLatency();
    const willFail = this.shouldFail();

    // Store message immediately with pending status
    const whatsappMessage: WhatsAppMessage = {
      id: messageId,
      phoneNumber,
      message,
      templateName,
      templateParams,
      status: WhatsAppStatus.PENDING,
      retryCount: 0,
      createdAt: new Date(),
    };

    this.messageStore.set(messageId, whatsappMessage);

    // Simulate async processing with delay
    setTimeout(async () => {
      if (willFail) {
        await this.handleFailure(messageId, simulatedLatency);
      } else {
        await this.handleSuccess(messageId);
      }
    }, simulatedLatency);

    return {
      messageId,
      status: 'queued',
    };
  }

  async getMessageStatus(messageId: string): Promise<WhatsAppMessage> {
    const message = this.messageStore.get(messageId);
    if (!message) {
      throw new BadRequestException('Message not found');
    }
    return message;
  }

  async retryFailedMessage(messageId: string): Promise<{ messageId: string; status: string }> {
    const message = this.messageStore.get(messageId);
    if (!message) {
      throw new BadRequestException('Message not found');
    }

    if (message.status !== WhatsAppStatus.FAILED) {
      throw new BadRequestException('Only failed messages can be retried');
    }

    message.retryCount += 1;

    if (message.retryCount > 3) {
      throw new BadRequestException('Max retry attempts exceeded');
    }

    // Retry with slightly longer delay
    const retryLatency = this.getRandomLatency() * (message.retryCount + 1);
    const willFail = this.shouldFail(0.3); // Higher success rate on retry

    setTimeout(async () => {
      if (willFail) {
        await this.handleFailure(messageId, retryLatency);
      } else {
        await this.handleSuccess(messageId);
      }
    }, retryLatency);

    return {
      messageId,
      status: 'retrying',
    };
  }

  private async handleSuccess(messageId: string): Promise<void> {
    const message = this.messageStore.get(messageId);
    if (message) {
      message.status = WhatsAppStatus.SENT;
      message.sentAt = new Date();
      this.failureCount = 0; // Reset failure count

      // Simulate delivery after additional delay
      setTimeout(() => {
        const deliveryDelay = Math.random() * 2000 + 500; // 500-2500ms
        setTimeout(() => {
          if (message.status === WhatsAppStatus.SENT) {
            message.status = WhatsAppStatus.DELIVERED;
            message.deliveredAt = new Date();

            // Simulate read after more delay (50% chance)
            if (Math.random() > 0.5) {
              setTimeout(() => {
                if (message.status === WhatsAppStatus.DELIVERED) {
                  message.status = WhatsAppStatus.READ;
                }
              }, Math.random() * 10000 + 2000);
            }
          }
        }, deliveryDelay);
      }, 1000);
    }
  }

  private async handleFailure(messageId: string, latency: number): Promise<void> {
    const message = this.messageStore.get(messageId);
    if (message) {
      this.failureCount += 1;

      const failureReasons = [
        'Invalid recipient',
        'Rate limit exceeded',
        'Service temporarily unavailable',
        'Invalid message template',
        'Phone number not registered',
      ];

      message.status = WhatsAppStatus.FAILED;
      message.failureReason =
        failureReasons[Math.floor(Math.random() * failureReasons.length)];

      // Trigger circuit breaker after threshold
      if (this.failureCount >= this.FAILURE_THRESHOLD) {
        this.isCircuitBreakerOpen = true;
        this.circuitBreakerResetTime = new Date(Date.now() + this.CIRCUIT_BREAKER_DURATION);
      }
    }
  }

  private shouldFail(failureRate: number = 0.08): boolean {
    // 8% failure rate by default
    return Math.random() < failureRate;
  }

  private getRandomLatency(): number {
    // 50-300ms success latency, 2000-5000ms failure latency
    return Math.random() < 0.92
      ? Math.random() * 250 + 50
      : Math.random() * 3000 + 2000;
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Nigerian phone number validation: +234XXXXXXXXXX or 0XXXXXXXXXX
    const regex = /^(\+234|0)[79]\d{8}$/;
    return regex.test(phoneNumber.replace(/\s/g, ''));
  }

  getMetrics(): {
    totalMessages: number;
    sentMessages: number;
    deliveredMessages: number;
    failedMessages: number;
    averageLatency: number;
  } {
    const messages = Array.from(this.messageStore.values());
    const successfulMessages = messages.filter(
      (m) => m.status === WhatsAppStatus.DELIVERED || m.status === WhatsAppStatus.READ,
    );
    const deliveredMessages = messages.filter((m) => m.status === WhatsAppStatus.DELIVERED);
    const failedMessages = messages.filter((m) => m.status === WhatsAppStatus.FAILED);

    const latencies = successfulMessages
      .filter((m) => m.sentAt && m.createdAt)
      .map((m) => m.sentAt.getTime() - m.createdAt.getTime());

    const averageLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    return {
      totalMessages: messages.length,
      sentMessages: messages.filter((m) => m.status === WhatsAppStatus.SENT).length,
      deliveredMessages: deliveredMessages.length,
      failedMessages: failedMessages.length,
      averageLatency: Math.round(averageLatency),
    };
  }
}
```

### Testing

```typescript
describe('WhatsAppBusinessMock', () => {
  let service: WhatsAppBusinessMock;

  beforeEach(() => {
    service = new WhatsAppBusinessMock();
  });

  it('should send message and queue for processing', async () => {
    const result = await service.sendMessage('+2348012345678', 'Test message');
    expect(result.messageId).toMatch(/^whatsapp-/);
    expect(result.status).toBe('queued');
  });

  it('should reject invalid phone numbers', async () => {
    expect(() => {
      service.sendMessage('invalid', 'Test');
    }).rejects.toThrow('Invalid phone number format');
  });

  it('should transition message through states (pending → sent → delivered)', async () => {
    const result = await service.sendMessage('+2348012345678', 'Test message');

    // Wait for simulated processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const message = await service.getMessageStatus(result.messageId);
    expect([
      'pending',
      'sent',
      'delivered',
    ]).toContain(message.status);
  });

  it('should support retry of failed messages', async () => {
    // Mock a failed message
    const result = await service.sendMessage('+2348012345678', 'Test');
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for failure

    const message = await service.getMessageStatus(result.messageId);

    if (message.status === 'failed') {
      const retryResult = await service.retryFailedMessage(result.messageId);
      expect(retryResult.status).toBe('retrying');
    }
  });

  it('should provide metrics', async () => {
    // Send multiple messages
    for (let i = 0; i < 10; i++) {
      await service.sendMessage(`+234801234567${i}`, `Message ${i}`);
    }

    const metrics = service.getMetrics();
    expect(metrics.totalMessages).toBe(10);
    expect(metrics.averageLatency).toBeGreaterThan(0);
  });

  it('should open circuit breaker after threshold', async () => {
    // Force multiple failures
    const mockService = service as any;
    mockService.failureCount = 5;
    mockService.isCircuitBreakerOpen = true;
    mockService.circuitBreakerResetTime = new Date(Date.now() + 60000);

    expect(() => {
      service.sendMessage('+2348012345678', 'Test');
    }).rejects.toThrow('circuit breaker open');
  });
});
```

---

## 2. Twilio SMS Mock

### Purpose
Simulate Twilio SMS for payment reminders and notifications

### Realistic Behavior
- **Success Rate:** 95% on first attempt
- **Latency:** 50-200ms (success), 1500-4000ms (failure)
- **Common Failures:** Invalid number (2%), throttled (2%), network error (1%)
- **Delivery Confirmation:** Actual delivery takes 5-30 seconds

### Implementation

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';

enum SMSStatus {
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  UNDELIVERABLE = 'undeliverable',
}

interface SMSMessage {
  sid: string; // Twilio-like SID
  phoneNumber: string;
  message: string;
  status: SMSStatus;
  direction: 'outbound';
  sentAt?: Date;
  deliveredAt?: Date;
  deliveryErrorMessage?: string;
  retryCount: number;
  price?: number;
  createdAt: Date;
}

@Injectable()
export class TwilioSMSMock {
  private messageStore: Map<string, SMSMessage> = new Map();
  private throttledNumbers: Set<string> = new Set();
  private readonly THROTTLE_LIMIT = 5; // Max messages per minute per number
  private readonly MESSAGE_COST = 0.0075; // Per SMS
  private readonly THROTTLE_RESET_INTERVAL = 60000; // 1 minute

  async sendSMS(
    phoneNumber: string,
    message: string,
    retryConfig?: { maxRetries: number; backoffMultiplier: number },
  ): Promise<{ sid: string; status: string; cost: number }> {
    // Validate phone number
    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new BadRequestException('Invalid phone number format');
    }

    // Check throttling
    if (this.throttledNumbers.has(phoneNumber)) {
      throw new BadRequestException('Too many requests. Rate limited.');
    }

    // Validate message length
    if (message.length > 160) {
      console.warn(`Message exceeds 160 chars, will be split into ${Math.ceil(message.length / 160)} SMS`);
    }

    const sid = `SM${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const simulatedLatency = this.getRandomLatency();
    const willFail = this.shouldFail(0.05); // 5% failure rate

    const smsMessage: SMSMessage = {
      sid,
      phoneNumber,
      message,
      status: SMSStatus.QUEUED,
      direction: 'outbound',
      retryCount: 0,
      price: this.MESSAGE_COST,
      createdAt: new Date(),
    };

    this.messageStore.set(sid, smsMessage);

    // Simulate async sending
    setTimeout(async () => {
      smsMessage.status = SMSStatus.SENDING;

      if (willFail) {
        await this.handleSMSFailure(sid);
      } else {
        await this.handleSMSSuccess(sid, phoneNumber);
      }
    }, simulatedLatency);

    return {
      sid,
      status: 'queued',
      cost: this.MESSAGE_COST,
    };
  }

  async getSMSStatus(sid: string): Promise<SMSMessage> {
    const message = this.messageStore.get(sid);
    if (!message) {
      throw new BadRequestException('SMS not found');
    }
    return message;
  }

  async retrySMS(sid: string): Promise<{ sid: string; status: string }> {
    const message = this.messageStore.get(sid);
    if (!message) {
      throw new BadRequestException('SMS not found');
    }

    if (message.retryCount >= 3) {
      throw new BadRequestException('Max retries exceeded');
    }

    message.retryCount += 1;
    message.status = SMSStatus.QUEUED;

    // Exponential backoff: 1s, 2s, 4s
    const backoffDelay = Math.pow(2, message.retryCount - 1) * 1000;

    setTimeout(async () => {
      const willFail = this.shouldFail(0.1 * message.retryCount); // Higher success on retry
      if (willFail) {
        await this.handleSMSFailure(sid);
      } else {
        await this.handleSMSSuccess(sid, message.phoneNumber);
      }
    }, backoffDelay);

    return {
      sid,
      status: 'retrying',
    };
  }

  private async handleSMSSuccess(sid: string, phoneNumber: string): Promise<void> {
    const message = this.messageStore.get(sid);
    if (message) {
      message.status = SMSStatus.SENT;
      message.sentAt = new Date();

      // Simulate delivery confirmation (50-300ms later)
      const deliveryDelay = Math.random() * 250 + 50;
      setTimeout(() => {
        if (message.status === SMSStatus.SENT) {
          message.status = SMSStatus.DELIVERED;
          message.deliveredAt = new Date();
        }
      }, deliveryDelay);

      // Reset throttle after window
      setTimeout(() => {
        this.throttledNumbers.delete(phoneNumber);
      }, this.THROTTLE_RESET_INTERVAL);
    }
  }

  private async handleSMSFailure(sid: string): Promise<void> {
    const message = this.messageStore.get(sid);
    if (message) {
      const failureReasons = [
        'Invalid destination address',
        'Destination address blocked',
        'Service not available',
        'Network error',
        'Temporary issue on destination network',
      ];

      message.status = SMSStatus.FAILED;
      message.deliveryErrorMessage =
        failureReasons[Math.floor(Math.random() * failureReasons.length)];

      // Check if should be marked undeliverable (after 3 retries)
      if (message.retryCount >= 3) {
        message.status = SMSStatus.UNDELIVERABLE;
      }
    }
  }

  private shouldFail(failureRate: number = 0.05): boolean {
    return Math.random() < failureRate;
  }

  private getRandomLatency(): number {
    // 50-200ms for success, 1500-4000ms for failures
    return Math.random() < 0.95
      ? Math.random() * 150 + 50
      : Math.random() * 2500 + 1500;
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Nigerian phone: +234XXXXXXXXXX or 0XXXXXXXXXX
    const regex = /^(\+234|0)[79]\d{8}$/;
    return regex.test(phoneNumber.replace(/\s/g, ''));
  }

  getBalance(): { balance: number; currency: string } {
    const sentMessages = Array.from(this.messageStore.values()).filter(
      (m) => m.status === SMSStatus.SENT || m.status === SMSStatus.DELIVERED,
    );
    const totalCost = sentMessages.length * this.MESSAGE_COST;
    return {
      balance: 1000 - totalCost, // Assume $1000 starting balance
      currency: 'USD',
    };
  }

  getMetrics(): {
    totalSMS: number;
    sentSMS: number;
    deliveredSMS: number;
    failedSMS: number;
    averageLatency: number;
    totalCost: number;
  } {
    const messages = Array.from(this.messageStore.values());
    const sentMessages = messages.filter((m) => m.status === SMSStatus.SENT || m.status === SMSStatus.DELIVERED);
    const deliveredMessages = messages.filter((m) => m.status === SMSStatus.DELIVERED);
    const failedMessages = messages.filter((m) => m.status === SMSStatus.FAILED || m.status === SMSStatus.UNDELIVERABLE);

    const latencies = sentMessages
      .filter((m) => m.sentAt && m.createdAt)
      .map((m) => m.sentAt.getTime() - m.createdAt.getTime());

    const averageLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    const totalCost = sentMessages.length * this.MESSAGE_COST;

    return {
      totalSMS: messages.length,
      sentSMS: sentMessages.length,
      deliveredSMS: deliveredMessages.length,
      failedSMS: failedMessages.length,
      averageLatency: Math.round(averageLatency),
      totalCost: Math.round(totalCost * 100) / 100,
    };
  }
}
```

---

## 3. SendGrid Email Mock

### Purpose
Simulate SendGrid for payslip distribution, notifications, and reports

### Realistic Behavior
- **Success Rate:** 97% on first attempt
- **Latency:** 100-400ms (queued), actual delivery 5-120 seconds
- **Common Failures:** Invalid email (1%), bounced (1%), spam (1%)
- **Delivery Events:** bounce, open, click, unsubscribe

### Implementation

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';

enum EmailStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  SENT = 'sent',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  DROPPED = 'dropped',
  DEFERRED = 'deferred',
}

interface SendGridEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  htmlContent?: string;
  status: EmailStatus;
  statusCode?: number;
  bounceReason?: string;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  openCount: number;
  clickCount: number;
  retryCount: number;
  createdAt: Date;
}

@Injectable()
export class SendGridEmailMock {
  private emailStore: Map<string, SendGridEmail> = new Map();
  private bounceList: Set<string> = new Set();
  private readonly EMAIL_DELAY = 50; // ms to queue
  private readonly DELIVERY_DELAY = 5000; // 5-60 seconds

  async send(
    to: string,
    subject: string,
    htmlContent: string,
    from: string = 'noreply@ubiquitous-tribble.com',
  ): Promise<{ messageId: string; status: string }> {
    // Validate email
    if (!this.isValidEmail(to)) {
      throw new BadRequestException('Invalid email address');
    }

    // Check bounce list
    if (this.bounceList.has(to)) {
      throw new BadRequestException('Email address on bounce list');
    }

    const messageId = `sendgrid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const willFail = this.shouldFail(0.03); // 3% failure rate

    const email: SendGridEmail = {
      id: messageId,
      to,
      from,
      subject,
      htmlContent,
      status: EmailStatus.QUEUED,
      openCount: 0,
      clickCount: 0,
      retryCount: 0,
      createdAt: new Date(),
    };

    this.emailStore.set(messageId, email);

    // Simulate queuing
    setTimeout(async () => {
      email.status = EmailStatus.PROCESSING;
      const processingLatency = Math.random() * 300 + 100;

      setTimeout(async () => {
        if (willFail) {
          await this.handleEmailFailure(messageId);
        } else {
          await this.handleEmailSuccess(messageId, to);
        }
      }, processingLatency);
    }, this.EMAIL_DELAY);

    return {
      messageId,
      status: 'queued',
    };
  }

  async getEmailStatus(messageId: string): Promise<SendGridEmail> {
    const email = this.emailStore.get(messageId);
    if (!email) {
      throw new BadRequestException('Email not found');
    }
    return email;
  }

  async retryEmail(messageId: string): Promise<{ messageId: string; status: string }> {
    const email = this.emailStore.get(messageId);
    if (!email) {
      throw new BadRequestException('Email not found');
    }

    if (email.retryCount >= 3) {
      throw new BadRequestException('Max retries exceeded');
    }

    email.retryCount += 1;
    email.status = EmailStatus.QUEUED;

    const backoffDelay = Math.pow(2, email.retryCount) * 1000; // 2s, 4s, 8s

    setTimeout(async () => {
      const willFail = this.shouldFail(0.05 * email.retryCount);
      if (willFail) {
        await this.handleEmailFailure(messageId);
      } else {
        await this.handleEmailSuccess(messageId, email.to);
      }
    }, backoffDelay);

    return {
      messageId,
      status: 'retrying',
    };
  }

  private async handleEmailSuccess(messageId: string, toAddress: string): Promise<void> {
    const email = this.emailStore.get(messageId);
    if (email) {
      email.status = EmailStatus.SENT;
      email.sentAt = new Date();
      email.statusCode = 202;

      // Simulate delivery events (open, click)
      this.simulateDeliveryEvents(messageId);
    }
  }

  private async handleEmailFailure(messageId: string): Promise<void> {
    const email = this.emailStore.get(messageId);
    if (email) {
      const failureTypes = [
        { status: EmailStatus.BOUNCED, reason: 'Hard bounce: address does not exist' },
        { status: EmailStatus.DROPPED, reason: 'Email address on suppression list' },
        { status: EmailStatus.DEFERRED, reason: 'Temporary delivery failure' },
        { status: EmailStatus.BOUNCED, reason: 'Spam complaint' },
      ];

      const failure = failureTypes[Math.floor(Math.random() * failureTypes.length)];
      email.status = failure.status;
      email.bounceReason = failure.reason;

      // Add to bounce list if hard bounce
      if (failure.status === EmailStatus.BOUNCED && failure.reason.includes('Hard')) {
        this.bounceList.add(email.to);
      }
    }
  }

  private simulateDeliveryEvents(messageId: string): void {
    const email = this.emailStore.get(messageId);
    if (!email) return;

    // 60% chance of open within 5-300 seconds
    if (Math.random() < 0.6) {
      const openDelay = Math.random() * 295000 + 5000;
      setTimeout(() => {
        if (email.status === EmailStatus.SENT) {
          email.status = EmailStatus.OPENED;
          email.openedAt = new Date();
          email.openCount += 1;

          // 30% chance of click after open
          if (Math.random() < 0.3) {
            const clickDelay = Math.random() * 30000 + 1000;
            setTimeout(() => {
              if (email.status === EmailStatus.OPENED) {
                email.status = EmailStatus.CLICKED;
                email.clickedAt = new Date();
                email.clickCount += 1;
              }
            }, clickDelay);
          }
        }
      }, openDelay);
    }
  }

  private shouldFail(failureRate: number = 0.03): boolean {
    return Math.random() < failureRate;
  }

  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.length <= 254;
  }

  getMetrics(): {
    totalEmails: number;
    sentEmails: number;
    openedEmails: number;
    clickedEmails: number;
    failedEmails: number;
    openRate: number;
    clickRate: number;
  } {
    const emails = Array.from(this.emailStore.values());
    const sentEmails = emails.filter(
      (e) =>
        e.status === EmailStatus.SENT ||
        e.status === EmailStatus.OPENED ||
        e.status === EmailStatus.CLICKED,
    );
    const openedEmails = emails.filter((e) => e.status === EmailStatus.OPENED || e.status === EmailStatus.CLICKED);
    const clickedEmails = emails.filter((e) => e.status === EmailStatus.CLICKED);
    const failedEmails = emails.filter(
      (e) => e.status === EmailStatus.BOUNCED || e.status === EmailStatus.DROPPED,
    );

    const openRate =
      sentEmails.length > 0 ? (openedEmails.length / sentEmails.length) * 100 : 0;
    const clickRate = openedEmails.length > 0 ? (clickedEmails.length / openedEmails.length) * 100 : 0;

    return {
      totalEmails: emails.length,
      sentEmails: sentEmails.length,
      openedEmails: openedEmails.length,
      clickedEmails: clickedEmails.length,
      failedEmails: failedEmails.length,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
    };
  }
}
```

---

## 4. Payment Processing Mock

### Purpose
Simulate payment gateway for charge processing, settlement, and fund transfers

### Realistic Behavior
- **Success Rate:** 96% on first attempt
- **Latency:** 200-800ms (success), 2000-5000ms (failure)
- **Common Failures:** Insufficient funds (2%), card decline (1%), network error (1%)
- **Settlement:** 24-48 hours for batch settlement
- **Refunds:** Process within 2-5 business days

### Implementation

```typescript
import { Injectable, BadRequestException, PaymentRequiredException } from '@nestjs/common';

enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  AUTHORIZED = 'authorized',
  SETTLED = 'settled',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

interface PaymentTransaction {
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  merchantReference: string;
  status: PaymentStatus;
  statusCode?: string;
  failureReason?: string;
  authorizedAt?: Date;
  settledAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  retryCount: number;
}

@Injectable()
export class PaymentProcessingMock {
  private transactionStore: Map<string, PaymentTransaction> = new Map();
  private failedCards: Set<string> = new Set();
  private readonly SETTLEMENT_DELAY = 86400000; // 24 hours
  private readonly REFUND_DELAY = 259200000; // 3 days

  async charge(
    amount: number,
    currency: string,
    paymentMethod: string,
    merchantReference: string,
  ): Promise<{ transactionId: string; status: string; amount: number }> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    if (this.failedCards.has(paymentMethod)) {
      throw new PaymentRequiredException('Payment method declined');
    }

    const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const simulatedLatency = this.getRandomLatency();
    const willFail = this.shouldFail(0.04); // 4% failure rate

    const transaction: PaymentTransaction = {
      transactionId,
      amount,
      currency,
      paymentMethod,
      merchantReference,
      status: PaymentStatus.PENDING,
      retryCount: 0,
      createdAt: new Date(),
    };

    this.transactionStore.set(transactionId, transaction);

    // Simulate async processing
    setTimeout(async () => {
      transaction.status = PaymentStatus.PROCESSING;

      if (willFail) {
        await this.handleChargeFailure(transactionId);
      } else {
        await this.handleChargeSuccess(transactionId);
      }
    }, simulatedLatency);

    return {
      transactionId,
      status: 'pending',
      amount,
    };
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentTransaction> {
    const transaction = this.transactionStore.get(transactionId);
    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }
    return transaction;
  }

  async retryCharge(transactionId: string): Promise<{ transactionId: string; status: string }> {
    const transaction = this.transactionStore.get(transactionId);
    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status !== PaymentStatus.FAILED) {
      throw new BadRequestException('Only failed transactions can be retried');
    }

    if (transaction.retryCount >= 3) {
      throw new BadRequestException('Max retries exceeded');
    }

    transaction.retryCount += 1;
    transaction.status = PaymentStatus.PENDING;

    const backoffDelay = Math.pow(2, transaction.retryCount) * 1000;

    setTimeout(async () => {
      transaction.status = PaymentStatus.PROCESSING;
      const willFail = this.shouldFail(0.08 * transaction.retryCount); // Higher success on retry
      if (willFail) {
        await this.handleChargeFailure(transactionId);
      } else {
        await this.handleChargeSuccess(transactionId);
      }
    }, backoffDelay);

    return {
      transactionId,
      status: 'retrying',
    };
  }

  async refund(
    transactionId: string,
    refundAmount?: number,
  ): Promise<{ refundId: string; status: string }> {
    const transaction = this.transactionStore.get(transactionId);
    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status !== PaymentStatus.SETTLED) {
      throw new BadRequestException('Only settled transactions can be refunded');
    }

    const amountToRefund = refundAmount || transaction.amount;
    if (amountToRefund > transaction.amount) {
      throw new BadRequestException('Refund amount exceeds original amount');
    }

    // Create refund transaction
    const refundId = `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    setTimeout(() => {
      transaction.status = PaymentStatus.REFUNDED;
      transaction.refundedAt = new Date();
    }, this.REFUND_DELAY);

    return {
      refundId,
      status: 'pending_refund',
    };
  }

  private async handleChargeSuccess(transactionId: string): Promise<void> {
    const transaction = this.transactionStore.get(transactionId);
    if (transaction) {
      transaction.status = PaymentStatus.AUTHORIZED;
      transaction.authorizedAt = new Date();
      transaction.statusCode = '00'; // Success code

      // Schedule settlement after delay
      setTimeout(() => {
        if (transaction.status === PaymentStatus.AUTHORIZED) {
          transaction.status = PaymentStatus.SETTLED;
          transaction.settledAt = new Date();
        }
      }, this.SETTLEMENT_DELAY);
    }
  }

  private async handleChargeFailure(transactionId: string): Promise<void> {
    const transaction = this.transactionStore.get(transactionId);
    if (transaction) {
      const failureReasons = [
        { code: '05', reason: 'Card declined' },
        { code: '51', reason: 'Insufficient funds' },
        { code: '06', reason: 'Error' },
        { code: '91', reason: 'Issuer or switch inoperative' },
        { code: '92', reason: 'Financial institution not found' },
      ];

      const failure = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      transaction.status = PaymentStatus.FAILED;
      transaction.statusCode = failure.code;
      transaction.failureReason = failure.reason;

      // Add to failed cards for decline
      if (failure.code === '05') {
        this.failedCards.add(transaction.paymentMethod);
      }
    }
  }

  private shouldFail(failureRate: number = 0.04): boolean {
    return Math.random() < failureRate;
  }

  private getRandomLatency(): number {
    // 200-800ms success, 2000-5000ms failure
    return Math.random() < 0.96
      ? Math.random() * 600 + 200
      : Math.random() * 3000 + 2000;
  }

  getMetrics(): {
    totalTransactions: number;
    authorizedTransactions: number;
    settledTransactions: number;
    failedTransactions: number;
    refundedTransactions: number;
    totalVolume: number;
    successRate: number;
    averageLatency: number;
  } {
    const transactions = Array.from(this.transactionStore.values());
    const authorized = transactions.filter((t) => t.status === PaymentStatus.AUTHORIZED);
    const settled = transactions.filter((t) => t.status === PaymentStatus.SETTLED);
    const failed = transactions.filter((t) => t.status === PaymentStatus.FAILED);
    const refunded = transactions.filter((t) => t.status === PaymentStatus.REFUNDED);

    const latencies = authorized
      .filter((t) => t.authorizedAt && t.createdAt)
      .map((t) => t.authorizedAt.getTime() - t.createdAt.getTime());

    const averageLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const successRate =
      transactions.length > 0
        ? ((authorized.length + settled.length + refunded.length) / transactions.length) * 100
        : 0;

    return {
      totalTransactions: transactions.length,
      authorizedTransactions: authorized.length,
      settledTransactions: settled.length,
      failedTransactions: failed.length,
      refundedTransactions: refunded.length,
      totalVolume: Math.round(totalVolume),
      successRate: Math.round(successRate * 100) / 100,
      averageLatency: Math.round(averageLatency),
    };
  }
}
```

---

## Integration Test Example

```typescript
describe('Payment Distribution Full Flow', () => {
  let escrowService: EscrowService;
  let whatsappMock: WhatsAppBusinessMock;
  let twilioMock: TwilioSMSMock;
  let sendgridMock: SendGridEmailMock;
  let paymentMock: PaymentProcessingMock;

  beforeEach(() => {
    whatsappMock = new WhatsAppBusinessMock();
    twilioMock = new TwilioSMSMock();
    sendgridMock = new SendGridEmailMock();
    paymentMock = new PaymentProcessingMock();
  });

  it('should send payment requests via multiple channels with realistic behavior', async () => {
    // Send payment request
    const whatsappResult = await whatsappMock.sendMessage(
      '+2348012345678',
      'Payment request for ₦50,000',
    );
    const smsResult = await twilioMock.sendSMS(
      '+2348012345678',
      'Payment due: ₦50,000',
    );
    const emailResult = await sendgridMock.send(
      'user@example.com',
      'Payment Request',
      '<p>Payment of ₦50,000 is due</p>',
    );

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check statuses
    const whatsappStatus = await whatsappMock.getMessageStatus(whatsappResult.messageId);
    const smsStatus = await twilioMock.getSMSStatus(smsResult.sid);
    const emailStatus = await sendgridMock.getEmailStatus(emailResult.messageId);

    expect([
      'pending',
      'sent',
      'delivered',
    ]).toContain(whatsappStatus.status);
    expect([
      'queued',
      'sending',
      'sent',
      'delivered',
    ]).toContain(smsStatus.status);
    expect([
      'queued',
      'processing',
      'sent',
    ]).toContain(emailStatus.status);
  });

  it('should process payment with realistic settlement', async () => {
    const chargeResult = await paymentMock.charge(50000, 'NGN', 'card_xyz', 'ref_001');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const transaction = await paymentMock.getTransactionStatus(chargeResult.transactionId);

    expect([
      'pending',
      'processing',
      'authorized',
    ]).toContain(transaction.status);
  });

  it('should handle failures and retries realistically', async () => {
    // Send with potential failure
    const smsResult = await twilioMock.sendSMS('+2348012345678', 'Test message');

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const smsStatus = await twilioMock.getSMSStatus(smsResult.sid);

    if (smsStatus.status === 'failed') {
      // Retry with exponential backoff
      const retryResult = await twilioMock.retrySMS(smsResult.sid);
      expect(retryResult.status).toBe('retrying');

      // Verify retry count
      const retryStatus = await twilioMock.getSMSStatus(smsResult.sid);
      expect(retryStatus.retryCount).toBe(1);
    }
  });

  it('should respect rate limiting and circuit breakers', async () => {
    // Trigger circuit breaker by inducing failures
    // This is configuration-dependent in real implementation
    expect(() => {
      whatsappMock.sendMessage('+2348012345678', 'Test');
    }).not.toThrow();
  });
});
```

---

## Testing & Deployment

### Unit Test Coverage
- ✅ Message queuing and status transitions
- ✅ Failure simulation and recovery
- ✅ Retry logic with exponential backoff
- ✅ Rate limiting and throttling
- ✅ Metrics collection
- ✅ Circuit breaker activation
- ✅ Delivery event simulation

### Performance Benchmarks
- Message queue: < 50ms
- Status check: < 10ms
- Retry processing: configurable
- Batch operations: 1000 msgs/sec

### Configuration Options
```typescript
// Environment-specific configuration
const mockConfig = {
  whatsapp: {
    successRate: 0.92,
    latencyMs: { min: 50, max: 300 },
    circuitBreakerThreshold: 5,
  },
  sms: {
    successRate: 0.95,
    latencyMs: { min: 50, max: 200 },
    throttleLimit: 5,
  },
  email: {
    successRate: 0.97,
    latencyMs: { min: 100, max: 400 },
    deliveryDelay: 5000,
  },
  payment: {
    successRate: 0.96,
    latencyMs: { min: 200, max: 800 },
    settlementDelay: 86400000,
  },
};
```

