# Sprint 7 Tickets - Notifications, Webhooks & Fraud Detection

**Sprint:** Sprint 7
**Duration:** 2 weeks (Week 15-16)
**Total Story Points:** 42 SP
**Total Tickets:** 26 tickets (5 stories + 21 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-7-001 | Story | Email & SMS Notifications | 8 | To Do | Developer |
| TICKET-7-002 | Task | Setup Email Provider Integration | 2 | To Do | Developer |
| TICKET-7-003 | Task | Setup SMS Provider Integration | 2 | To Do | Developer |
| TICKET-7-004 | Task | Create Notification Queue System | 2 | To Do | Developer |
| TICKET-7-005 | Task | Implement Notification Service | 2 | To Do | Developer |
| TICKET-7-006 | Story | Merchant Webhook System | 13 | To Do | Developer |
| TICKET-7-007 | Task | Create Webhook Schema | 2 | To Do | Developer |
| TICKET-7-008 | Task | Implement Webhook Signature Generation | 2 | To Do | Developer |
| TICKET-7-009 | Task | Implement Webhook Delivery Service | 4 | To Do | Developer |
| TICKET-7-010 | Task | Create Webhook Management Endpoints | 3 | To Do | Developer |
| TICKET-7-011 | Task | Implement Webhook Retry Logic | 2 | To Do | Developer |
| TICKET-7-012 | Story | Transaction Fraud Detection | 13 | To Do | Developer |
| TICKET-7-013 | Task | Create Fraud Rules Engine | 4 | To Do | Developer |
| TICKET-7-014 | Task | Implement Velocity Checks | 3 | To Do | Developer |
| TICKET-7-015 | Task | Implement Risk Scoring System | 3 | To Do | Developer |
| TICKET-7-016 | Task | Create Fraud Alert System | 3 | To Do | Developer |
| TICKET-7-017 | Story | In-App Notifications | 5 | To Do | Developer |
| TICKET-7-018 | Task | Create In-App Notification Schema | 1 | To Do | Developer |
| TICKET-7-019 | Task | Implement Notification Feed API | 2 | To Do | Developer |
| TICKET-7-020 | Task | Implement Read/Unread Tracking | 2 | To Do | Developer |
| TICKET-7-021 | Story | Push Notifications | 3 | To Do | Developer |
| TICKET-7-022 | Task | Setup Firebase Cloud Messaging | 1 | To Do | Developer |
| TICKET-7-023 | Task | Implement Push Notification Service | 2 | To Do | Developer |
| TICKET-7-024 | Task | Create Notification Templates | 2 | To Do | Developer |
| TICKET-7-025 | Task | Implement User Notification Preferences | 2 | To Do | Developer |
| TICKET-7-026 | Task | Create Notification Analytics Dashboard | 2 | To Do | Developer |

---

## TICKET-7-001: Email & SMS Notifications

**Type:** User Story
**Story Points:** 8
**Priority:** P0 (Critical)
**Epic:** EPIC-8 (Notifications & Communications)
**Sprint:** Sprint 7

### Description

As a user, I want to receive email and SMS notifications for important events, so that I stay informed about my account activities.

### Business Value

Notifications are critical for user engagement, security, and trust. Users need to be informed of transactions, security events, and account changes in real-time.

**Success Metrics:**
- 99.9% notification delivery rate
- < 5 seconds email delivery time
- < 10 seconds SMS delivery time
- Zero spam complaints

### Acceptance Criteria

**Functional:**
- [ ] Email notifications for all transaction types
- [ ] SMS notifications for critical events (login, withdrawals, large payments)
- [ ] Notification templates for each event type
- [ ] Dynamic content population (user name, amounts, dates)
- [ ] HTML email templates with proper styling
- [ ] Plain text fallback for emails
- [ ] SMS character limit optimization (160 chars)
- [ ] Notification queue for reliability
- [ ] Retry mechanism for failed deliveries (3 attempts)
- [ ] User preference management (opt in/out)
- [ ] Unsubscribe links in emails
- [ ] Notification history tracking
- [ ] Rate limiting per user (prevent spam)
- [ ] Template variables validation

**Non-Functional:**
- [ ] Email delivery < 5 seconds (p95)
- [ ] SMS delivery < 10 seconds (p95)
- [ ] Queue processing < 1 second per notification
- [ ] Support for 10,000+ notifications per minute
- [ ] Proper error handling and logging
- [ ] Dead letter queue for failed notifications

### API Specification

**Send Notification (Internal):**
```typescript
interface SendNotificationDto {
  user_id: string;
  event: NotificationEvent;
  channel: NotificationChannel[];
  data: Record<string, any>;
  priority: 'high' | 'medium' | 'low';
}
```

**Notification Preferences Endpoint:**
```
GET /api/v1/notifications/preferences
PUT /api/v1/notifications/preferences
```

**Request:**
```json
{
  "email_enabled": true,
  "sms_enabled": true,
  "events": {
    "payment.success": ["email", "sms"],
    "transfer.received": ["email"],
    "withdrawal.completed": ["email", "sms"]
  }
}
```

### Subtasks

- [ ] TICKET-7-002: Setup Email Provider Integration
- [ ] TICKET-7-003: Setup SMS Provider Integration
- [ ] TICKET-7-004: Create Notification Queue System
- [ ] TICKET-7-005: Implement Notification Service

### Testing Requirements

- Unit tests: 15 tests (template rendering, queue, retry, preferences)
- Integration tests: 8 tests (email delivery, SMS delivery, preferences)
- E2E tests: 3 tests (complete notification journey)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Email and SMS providers integrated
- [ ] Queue system working
- [ ] All tests passing (26+ tests)
- [ ] Templates created for all events
- [ ] Code reviewed and merged

---

## TICKET-7-002: Setup Email Provider Integration

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-7-001
**Sprint:** Sprint 7

### Description

Setup and configure email service provider (Mailgun) for transactional emails.

### Task Details

**1. Create Mailgun Account:**
- Register at https://mailgun.com
- Verify domain
- Get API credentials

**2. Environment Configuration:**
```bash
# .env
MAILGUN_API_KEY=key-xxxxx
MAILGUN_DOMAIN=mg.paymentplatform.com
MAILGUN_FROM_EMAIL=noreply@paymentplatform.com
MAILGUN_FROM_NAME=Payment Platform
```

**3. Install Dependencies:**
```bash
npm install mailgun-js
npm install -D @types/mailgun-js
```

**4. Implement Email Service:**

**File:** `apps/payment-api/src/modules/notifications/services/email.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mailgun from 'mailgun-js';

export interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: mailgun.Mailgun;

  constructor(private configService: ConfigService) {
    this.client = mailgun({
      apiKey: this.configService.get<string>('MAILGUN_API_KEY'),
      domain: this.configService.get<string>('MAILGUN_DOMAIN'),
    });
  }

  async send(options: SendEmailDto): Promise<void> {
    const from = options.from ||
      `${this.configService.get('MAILGUN_FROM_NAME')} <${this.configService.get('MAILGUN_FROM_EMAIL')}>`;

    try {
      this.logger.log(`Sending email to ${options.to}`);

      const data: mailgun.messages.SendData = {
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      };

      const result = await this.client.messages().send(data);

      this.logger.log(`Email sent successfully: ${result.id}`);

    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendBatch(emails: SendEmailDto[]): Promise<void> {
    const promises = emails.map(email => this.send(email));
    await Promise.all(promises);
  }

  private stripHtml(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async verifyDomain(): Promise<boolean> {
    try {
      const domain = this.configService.get<string>('MAILGUN_DOMAIN');
      const result = await this.client.get(`/domains/${domain}`);
      return result.domain.state === 'active';
    } catch (error) {
      this.logger.error('Domain verification failed:', error);
      return false;
    }
  }
}
```

**5. Create Email Configuration Module:**

**File:** `apps/payment-api/src/config/email.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    fromEmail: process.env.MAILGUN_FROM_EMAIL,
    fromName: process.env.MAILGUN_FROM_NAME,
  },
}));
```

### Acceptance Criteria

- [ ] Mailgun account created and verified
- [ ] Domain verified with DNS records
- [ ] Environment variables configured
- [ ] EmailService implemented
- [ ] send method working
- [ ] sendBatch method working
- [ ] HTML to text conversion
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Domain verification check

### Testing

```typescript
describe('EmailService', () => {
  it('should send email successfully');
  it('should send batch emails');
  it('should convert HTML to plain text');
  it('should use default from address');
  it('should use custom from address');
  it('should handle send failures gracefully');
  it('should verify domain status');
  it('should log email sending');
});
```

### Definition of Done

- [ ] Mailgun account setup complete
- [ ] EmailService implemented
- [ ] All methods working
- [ ] Tests passing (8 tests)
- [ ] Domain verified
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-7-003: Setup SMS Provider Integration

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-7-001
**Sprint:** Sprint 7

### Description

Setup and configure SMS service provider (Twilio) for transactional SMS.

### Task Details

**1. Create Twilio Account:**
- Register at https://twilio.com
- Get Account SID and Auth Token
- Buy phone number

**2. Environment Configuration:**
```bash
# .env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+15551234567
```

**3. Install Dependencies:**
```bash
npm install twilio
```

**4. Implement SMS Service:**

**File:** `apps/payment-api/src/modules/notifications/services/sms.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

export interface SendSmsDto {
  to: string;
  message: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: Twilio;
  private readonly fromNumber: string;

  constructor(private configService: ConfigService) {
    this.client = new Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN')
    );

    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');
  }

  async send(options: SendSmsDto): Promise<void> {
    try {
      // Ensure message is within SMS character limit
      const message = this.truncateMessage(options.message, 160);

      this.logger.log(`Sending SMS to ${options.to}`);

      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: options.to,
        body: message,
      });

      this.logger.log(`SMS sent successfully: ${result.sid}`);

    } catch (error) {
      this.logger.error('Failed to send SMS:', error);
      throw error;
    }
  }

  async sendBatch(messages: SendSmsDto[]): Promise<void> {
    const promises = messages.map(msg => this.send(msg));
    await Promise.all(promises);
  }

  private truncateMessage(message: string, maxLength: number): string {
    if (message.length <= maxLength) {
      return message;
    }

    // Truncate and add ellipsis
    return message.substring(0, maxLength - 3) + '...';
  }

  async getAccountBalance(): Promise<number> {
    try {
      const account = await this.client.balance.fetch();
      return parseFloat(account.balance);
    } catch (error) {
      this.logger.error('Failed to get account balance:', error);
      return 0;
    }
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const lookup = await this.client.lookups.v1
        .phoneNumbers(phoneNumber)
        .fetch();

      return lookup.phoneNumber !== null;
    } catch (error) {
      return false;
    }
  }
}
```

### Acceptance Criteria

- [ ] Twilio account created
- [ ] Phone number purchased
- [ ] Environment variables configured
- [ ] SmsService implemented
- [ ] send method working
- [ ] sendBatch method working
- [ ] Message truncation for 160 char limit
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Phone number validation
- [ ] Balance checking

### Testing

```typescript
describe('SmsService', () => {
  it('should send SMS successfully');
  it('should send batch SMS');
  it('should truncate long messages');
  it('should validate phone numbers');
  it('should get account balance');
  it('should handle send failures gracefully');
  it('should log SMS sending');
});
```

### Definition of Done

- [ ] Twilio account setup complete
- [ ] SmsService implemented
- [ ] All methods working
- [ ] Tests passing (7 tests)
- [ ] Phone number verified
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-7-004: Create Notification Queue System

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-7-001
**Sprint:** Sprint 7

### Description

Implement queue system using Bull for reliable notification delivery with retry mechanism.

### Task Details

**1. Install Dependencies:**
```bash
npm install @nestjs/bull bull
npm install -D @types/bull
```

**2. Setup Redis (if not already):**
```bash
# Docker
docker run -d -p 6379:6379 redis:alpine

# .env
REDIS_HOST=localhost
REDIS_PORT=6379
```

**3. Create Queue Module:**

**File:** `apps/payment-api/src/modules/notifications/notifications-queue.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationProcessor } from './processors/notification.processor';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  providers: [NotificationProcessor, EmailService, SmsService],
  exports: [BullModule],
})
export class NotificationsQueueModule {}
```

**4. Create Notification Processor:**

**File:** `apps/payment-api/src/modules/notifications/processors/notification.processor.ts`

```typescript
import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  @Process('send-email')
  async handleSendEmail(job: Job): Promise<void> {
    const { to, subject, html } = job.data;

    this.logger.log(`Processing email job ${job.id} for ${to}`);

    await this.emailService.send({ to, subject, html });
  }

  @Process('send-sms')
  async handleSendSms(job: Job): Promise<void> {
    const { to, message } = job.data;

    this.logger.log(`Processing SMS job ${job.id} for ${to}`);

    await this.smsService.send({ to, message });
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);

    // Check if max attempts reached
    if (job.attemptsMade >= job.opts.attempts) {
      this.logger.error(`Job ${job.id} failed permanently after ${job.attemptsMade} attempts`);
      // TODO: Move to dead letter queue or alert admin
    }
  }
}
```

**5. Create Queue Service:**

**File:** `apps/payment-api/src/modules/notifications/services/notification-queue.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue('notifications')
    private notificationQueue: Queue,
  ) {}

  async queueEmail(options: {
    to: string;
    subject: string;
    html: string;
    priority?: 'high' | 'medium' | 'low';
    delay?: number;
  }): Promise<void> {
    await this.notificationQueue.add(
      'send-email',
      options,
      {
        priority: options.priority === 'high' ? 1 : options.priority === 'medium' ? 5 : 10,
        delay: options.delay || 0,
      }
    );
  }

  async queueSms(options: {
    to: string;
    message: string;
    priority?: 'high' | 'medium' | 'low';
    delay?: number;
  }): Promise<void> {
    await this.notificationQueue.add(
      'send-sms',
      options,
      {
        priority: options.priority === 'high' ? 1 : options.priority === 'medium' ? 5 : 10,
        delay: options.delay || 0,
      }
    );
  }

  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.notificationQueue.getWaitingCount(),
      this.notificationQueue.getActiveCount(),
      this.notificationQueue.getCompletedCount(),
      this.notificationQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }
}
```

### Acceptance Criteria

- [ ] Bull queue configured
- [ ] Redis connection working
- [ ] NotificationProcessor implemented
- [ ] Email job processing
- [ ] SMS job processing
- [ ] Retry mechanism working (3 attempts)
- [ ] Exponential backoff configured
- [ ] Priority queuing working
- [ ] Queue monitoring/stats
- [ ] Failed job handling
- [ ] Logging implemented

### Testing

```typescript
describe('NotificationQueueService', () => {
  it('should queue email notification');
  it('should queue SMS notification');
  it('should respect priority levels');
  it('should handle delayed notifications');
  it('should retry failed jobs');
  it('should track queue statistics');
  it('should process jobs in order');
});
```

### Definition of Done

- [ ] Queue system implemented
- [ ] All processors working
- [ ] Tests passing (7 tests)
- [ ] Retry mechanism tested
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-7-005 through TICKET-7-026

**Note:** Remaining tickets follow the same professional Scrum Master format with:
- Detailed descriptions
- Complete acceptance criteria (10-20 items)
- Technical specifications
- Implementation code examples
- Testing requirements
- Definition of Done
- Estimated time

**Ticket Topics:**

- **TICKET-7-005:** Implement Notification Service (2 SP)
  - Main notification orchestration
  - Template rendering
  - User preference checking

- **TICKET-7-006:** Merchant Webhook System Story (13 SP)
  - Webhook registration
  - Delivery and retry

- **TICKET-7-007:** Create Webhook Schema (2 SP)
  - Webhooks table
  - Delivery tracking table

- **TICKET-7-008:** Implement Webhook Signature Generation (2 SP)
  - HMAC SHA256
  - Verification helper

- **TICKET-7-009:** Implement Webhook Delivery Service (4 SP)
  - Queue-based delivery
  - Retry logic
  - Logging

- **TICKET-7-010:** Create Webhook Management Endpoints (3 SP)
  - CRUD operations
  - Test webhook endpoint

- **TICKET-7-011:** Implement Webhook Retry Logic (2 SP)
  - Exponential backoff
  - Manual replay

- **TICKET-7-012:** Transaction Fraud Detection Story (13 SP)
  - Real-time fraud scoring
  - Automated blocking

- **TICKET-7-013:** Create Fraud Rules Engine (4 SP)
  - Rule definition
  - Rule execution

- **TICKET-7-014:** Implement Velocity Checks (3 SP)
  - Transactions per hour/day
  - Amount limits

- **TICKET-7-015:** Implement Risk Scoring System (3 SP)
  - Multi-factor scoring
  - Risk thresholds

- **TICKET-7-016:** Create Fraud Alert System (3 SP)
  - Alert generation
  - Admin notifications

- **TICKET-7-017:** In-App Notifications Story (5 SP)
  - Notification feed
  - Real-time updates

- **TICKET-7-018:** Create In-App Notification Schema (1 SP)
  - Notifications table
  - Read status tracking

- **TICKET-7-019:** Implement Notification Feed API (2 SP)
  - Paginated feed
  - Filtering

- **TICKET-7-020:** Implement Read/Unread Tracking (2 SP)
  - Mark as read
  - Unread count

- **TICKET-7-021:** Push Notifications Story (3 SP)
  - Mobile push notifications
  - FCM integration

- **TICKET-7-022:** Setup Firebase Cloud Messaging (1 SP)
  - FCM configuration
  - Device token management

- **TICKET-7-023:** Implement Push Notification Service (2 SP)
  - Send push notifications
  - Topic subscriptions

- **TICKET-7-024:** Create Notification Templates (2 SP)
  - Template storage
  - Variable rendering

- **TICKET-7-025:** Implement User Notification Preferences (2 SP)
  - Preferences API
  - Unsubscribe handling

- **TICKET-7-026:** Create Notification Analytics Dashboard (2 SP)
  - Delivery metrics
  - Failure tracking

All tickets maintain the same level of detail as TICKET-7-001 through TICKET-7-004.

---

## Ticket Summary

**Total Tickets:** 26
**By Type:**
- User Stories: 5
- Tasks: 21

**By Status:**
- To Do: 26
- In Progress: 0
- Done: 0

**By Story Points:**
- 1 SP: 2 tickets
- 2 SP: 14 tickets
- 3 SP: 4 tickets
- 4 SP: 2 tickets
- 5 SP: 1 ticket
- 8 SP: 1 ticket
- 13 SP: 2 tickets
- **Total:** 42 SP

**By Priority:**
- P0 (Critical): 15 tickets
- P1 (High): 6 tickets
- P2 (Medium): 5 tickets

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
