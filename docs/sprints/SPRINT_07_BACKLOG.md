# Sprint 7 Backlog - Notifications, Webhooks & Fraud Detection

**Sprint:** Sprint 7
**Duration:** 2 weeks (Week 15-16)
**Sprint Goal:** Implement comprehensive notification system, webhook management for merchants, and fraud detection mechanisms
**Story Points Committed:** 42
**Team Capacity:** 42 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1-6 (45, 42, 38, 45, 48, 45) = 43.8 SP, committed 42 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 7, we will have:
1. Multi-channel notification system (email, SMS, push, in-app)
2. Webhook management for merchant integrations
3. Real-time fraud detection and alerts
4. Transaction velocity checks
5. Automated risk scoring
6. Merchant API key management
7. Webhook signature generation and verification
8. Notification preferences and templates
9. Fraud rule engine

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Webhook delivery tests passing
- [ ] Fraud detection tests passing
- [ ] Email/SMS provider tests passing
- [ ] API documentation updated (Swagger)
- [ ] Postman collection updated
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-8: Notifications & Communications

## FEATURE-8.1: Multi-Channel Notification System

### 📘 User Story: US-7.1.1 - Email & SMS Notifications

**Story ID:** US-7.1.1
**Feature:** FEATURE-8.1 (Multi-Channel Notifications)
**Epic:** EPIC-8 (Notifications & Communications)

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 7
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to receive email and SMS notifications for important events
So that I stay informed about my account activities
```

---

#### Business Value

**Value Statement:**
Notifications are critical for user engagement, security, and trust. Users need to be informed of transactions, security events, and account changes in real-time.

**Impact:**
- **High:** Improves user trust and engagement
- **Security:** Alerts users to suspicious activities
- **Compliance:** Required for transaction confirmations
- **Retention:** Keeps users engaged with the platform

**Success Criteria:**
- 99.9% notification delivery rate
- < 5 seconds email delivery time
- < 10 seconds SMS delivery time
- Zero spam complaints
- Proper unsubscribe mechanism

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Email notifications for all transaction types
- [ ] **AC2:** SMS notifications for critical events (login, withdrawals, large payments)
- [ ] **AC3:** Notification templates for each event type
- [ ] **AC4:** Dynamic content population (user name, amounts, dates)
- [ ] **AC5:** HTML email templates with proper styling
- [ ] **AC6:** Plain text fallback for emails
- [ ] **AC7:** SMS character limit optimization (160 chars)
- [ ] **AC8:** Notification queue for reliability
- [ ] **AC9:** Retry mechanism for failed deliveries (3 attempts)
- [ ] **AC10:** User preference management (opt in/out)
- [ ] **AC11:** Unsubscribe links in emails
- [ ] **AC12:** Notification history tracking
- [ ] **AC13:** Rate limiting per user (prevent spam)
- [ ] **AC14:** Template variables validation

**Non-Functional:**
- [ ] **AC15:** Email delivery < 5 seconds (p95)
- [ ] **AC16:** SMS delivery < 10 seconds (p95)
- [ ] **AC17:** Queue processing < 1 second per notification
- [ ] **AC18:** Support for 10,000+ notifications per minute
- [ ] **AC19:** Proper error handling and logging
- [ ] **AC20:** Dead letter queue for failed notifications

---

#### Technical Specifications

**Notification Events:**

```typescript
enum NotificationEvent {
  // Authentication
  USER_REGISTERED = 'user.registered',
  EMAIL_VERIFIED = 'email.verified',
  LOGIN_SUCCESS = 'login.success',
  LOGIN_FAILED = 'login.failed',
  PASSWORD_RESET = 'password.reset',
  MFA_ENABLED = 'mfa.enabled',

  // Transactions
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',
  TRANSFER_SENT = 'transfer.sent',
  TRANSFER_RECEIVED = 'transfer.received',
  WITHDRAWAL_INITIATED = 'withdrawal.initiated',
  WITHDRAWAL_COMPLETED = 'withdrawal.completed',
  WITHDRAWAL_FAILED = 'withdrawal.failed',

  // Bills
  BILL_PAYMENT_SUCCESS = 'bill.payment.success',
  BILL_PAYMENT_FAILED = 'bill.payment.failed',

  // Account
  BANK_ACCOUNT_ADDED = 'bank_account.added',
  CARD_ADDED = 'card.added',

  // Security
  SUSPICIOUS_ACTIVITY = 'security.suspicious_activity',
  ACCOUNT_LOCKED = 'security.account_locked',

  // KYC
  KYC_SUBMITTED = 'kyc.submitted',
  KYC_APPROVED = 'kyc.approved',
  KYC_REJECTED = 'kyc.rejected',
}
```

**Notification Service Interface:**

```typescript
interface SendNotificationDto {
  user_id: string;
  event: NotificationEvent;
  channel: NotificationChannel[];  // ['email', 'sms', 'push', 'in_app']
  data: Record<string, any>;
  priority: 'high' | 'medium' | 'low';
  schedule_at?: Date;  // For scheduled notifications
}

interface NotificationTemplate {
  event: NotificationEvent;
  channel: NotificationChannel;
  subject?: string;  // For email
  template: string;  // Template with variables
  variables: string[];  // Required variables
}
```

**Email Template Example:**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; }
    .content { padding: 20px; background: #f8f9fa; }
    .footer { padding: 20px; text-align: center; color: #6c757d; }
    .button {
      background: #007bff;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Platform</h1>
    </div>
    <div class="content">
      <h2>Payment Successful</h2>
      <p>Hi {{first_name}},</p>
      <p>Your payment of <strong>{{currency}} {{amount}}</strong> was successful.</p>
      <p>
        <strong>Transaction Details:</strong><br>
        Reference: {{reference}}<br>
        Date: {{date}}<br>
        Status: {{status}}
      </p>
      <p>
        <a href="{{transaction_url}}" class="button">View Transaction</a>
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2024 Payment Platform. All rights reserved.</p>
      <p>
        <a href="{{unsubscribe_url}}">Unsubscribe</a> |
        <a href="{{preferences_url}}">Manage Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
```

**SMS Template Example:**

```
Payment Platform: Your payment of NGN 5,000.00 was successful. Ref: TXN-20240115-A3F5K9. Balance: NGN 45,000.00
```

**Implementation - Notification Service:**

```typescript
@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue('notifications')
    private notificationQueue: Queue,
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushService,
    private templateService: TemplateService,
  ) {}

  async send(dto: SendNotificationDto): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: dto.user_id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check user preferences
    const preferences = await this.getUserPreferences(dto.user_id);
    const allowedChannels = this.filterChannelsByPreferences(
      dto.channel,
      preferences,
      dto.event
    );

    // Create notification record
    const notification = await this.notificationsRepository.save({
      user_id: dto.user_id,
      event: dto.event,
      channels: allowedChannels,
      data: dto.data,
      priority: dto.priority,
      status: 'pending',
      scheduled_at: dto.schedule_at || new Date(),
    });

    // Queue notification for each channel
    for (const channel of allowedChannels) {
      await this.notificationQueue.add(
        `send-${channel}`,
        {
          notification_id: notification.id,
          user_id: dto.user_id,
          channel,
          event: dto.event,
          data: dto.data,
        },
        {
          priority: dto.priority === 'high' ? 1 : dto.priority === 'medium' ? 5 : 10,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          delay: dto.schedule_at ? dto.schedule_at.getTime() - Date.now() : 0,
        }
      );
    }
  }

  @Process('send-email')
  async sendEmail(job: Job): Promise<void> {
    const { notification_id, user_id, event, data } = job.data;

    try {
      const user = await this.usersRepository.findOne({ where: { id: user_id } });
      const template = await this.templateService.getTemplate(event, 'email');

      const subject = this.templateService.render(template.subject, data);
      const html = this.templateService.render(template.template, {
        ...data,
        first_name: user.first_name,
        unsubscribe_url: `${process.env.APP_URL}/notifications/unsubscribe/${user_id}`,
        preferences_url: `${process.env.APP_URL}/settings/notifications`,
      });

      await this.emailService.send({
        to: user.email,
        subject,
        html,
      });

      await this.notificationsRepository.update(
        { id: notification_id },
        { status: 'sent', sent_at: new Date() }
      );

    } catch (error) {
      await this.notificationsRepository.update(
        { id: notification_id },
        {
          status: 'failed',
          error_message: error.message,
          failed_at: new Date(),
        }
      );

      throw error;  // Retry via Bull queue
    }
  }

  @Process('send-sms')
  async sendSms(job: Job): Promise<void> {
    const { notification_id, user_id, event, data } = job.data;

    try {
      const user = await this.usersRepository.findOne({ where: { id: user_id } });

      if (!user.phone_number || !user.phone_verified) {
        throw new Error('Phone number not available or verified');
      }

      const template = await this.templateService.getTemplate(event, 'sms');
      const message = this.templateService.render(template.template, data);

      // Ensure message is within SMS character limit
      const truncatedMessage = message.substring(0, 160);

      await this.smsService.send({
        to: user.phone_number,
        message: truncatedMessage,
      });

      await this.notificationsRepository.update(
        { id: notification_id },
        { status: 'sent', sent_at: new Date() }
      );

    } catch (error) {
      await this.notificationsRepository.update(
        { id: notification_id },
        {
          status: 'failed',
          error_message: error.message,
          failed_at: new Date(),
        }
      );

      throw error;
    }
  }
}
```

**Email Service Integration (Mailgun/SendGrid):**

```typescript
@Injectable()
export class EmailService {
  private readonly client: any;

  constructor(private configService: ConfigService) {
    // Using Mailgun
    this.client = mailgun({
      apiKey: this.configService.get('MAILGUN_API_KEY'),
      domain: this.configService.get('MAILGUN_DOMAIN'),
    });
  }

  async send(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<void> {
    await this.client.messages().send({
      from: options.from || 'Payment Platform <noreply@paymentplatform.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}
```

**SMS Service Integration (Twilio/Termii):**

```typescript
@Injectable()
export class SmsService {
  private readonly client: Twilio;

  constructor(private configService: ConfigService) {
    this.client = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN')
    );
  }

  async send(options: {
    to: string;
    message: string;
  }): Promise<void> {
    await this.client.messages.create({
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
      to: options.to,
      body: options.message,
    });
  }
}
```

---

#### Testing Requirements

**Unit Tests (15 tests):**
- Send notification to queue
- Filter channels by preferences
- Render email template
- Render SMS template
- Email service send
- SMS service send
- Handle failed delivery
- Retry mechanism
- Unsubscribe handling
- Preference checking
- Template variable validation
- Character limit for SMS
- Dead letter queue
- Priority handling
- Scheduled notifications

**Integration Tests (8 tests):**
- Full email delivery flow
- Full SMS delivery flow
- Queue processing
- Failed delivery retry
- User preference filtering
- Template rendering with real data
- Unsubscribe workflow
- Multiple channel delivery

**E2E Tests (3 tests):**
- Complete notification journey (transaction → email/SMS)
- Preference management
- Unsubscribe flow

---

## FEATURE-8.2: Webhook Management for Merchants

### 📘 User Story: US-7.2.1 - Merchant Webhook System

**Story ID:** US-7.2.1
**Feature:** FEATURE-8.2 (Webhook Management)
**Epic:** EPIC-9 (Merchant API)

**Story Points:** 13
**Priority:** P1 (High)
**Sprint:** Sprint 7
**Status:** 🔄 Not Started

---

#### User Story

```
As a merchant/developer
I want to receive webhooks for transaction events
So that I can integrate the payment platform with my application
```

---

#### Business Value

**Value Statement:**
Webhooks enable real-time event notifications to merchant applications, allowing seamless integration and automation. Critical for B2B revenue and platform adoption.

**Impact:**
- **Critical:** Enables merchant integrations
- **Revenue:** B2B subscription revenue
- **Adoption:** More merchants = more transactions
- **Automation:** Reduces manual reconciliation

**Success Criteria:**
- 99.9% webhook delivery success rate
- < 5 seconds webhook delivery time
- Support for 1,000+ webhooks per second
- Retry mechanism for failed deliveries
- Comprehensive event coverage

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Merchant can register webhook URLs
- [ ] **AC2:** Merchant can subscribe to specific events
- [ ] **AC3:** Webhook signature generation (HMAC SHA256)
- [ ] **AC4:** Webhook payload includes event data
- [ ] **AC5:** Automatic retry for failed webhooks (5 attempts)
- [ ] **AC6:** Exponential backoff between retries
- [ ] **AC7:** Webhook delivery logs
- [ ] **AC8:** Manual webhook replay
- [ ] **AC9:** Webhook testing endpoint
- [ ] **AC10:** Multiple webhook URLs per merchant
- [ ] **AC11:** Active/inactive webhook toggle
- [ ] **AC12:** Webhook secret rotation
- [ ] **AC13:** Event filtering
- [ ] **AC14:** Webhook delivery status tracking

**Security:**
- [ ] **AC15:** HMAC SHA256 signature
- [ ] **AC16:** HTTPS required for webhook URLs
- [ ] **AC17:** Signature verification instructions
- [ ] **AC18:** Secret key secure storage
- [ ] **AC19:** API key authentication for management

**Non-Functional:**
- [ ] **AC20:** Webhook delivery < 5 seconds (p95)
- [ ] **AC21:** Support 1,000+ webhooks/second
- [ ] **AC22:** Retry backoff: 1s, 5s, 30s, 2m, 10m
- [ ] **AC23:** Queue-based delivery
- [ ] **AC24:** Comprehensive logging

---

#### Technical Specifications

**Webhook Events:**

```typescript
enum WebhookEvent {
  // Transactions
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_COMPLETED = 'transaction.completed',
  TRANSACTION_FAILED = 'transaction.failed',
  TRANSACTION_REVERSED = 'transaction.reversed',

  // Payments
  PAYMENT_INITIALIZED = 'payment.initialized',
  PAYMENT_SUCCESS = 'payment.success',
  PAYMENT_FAILED = 'payment.failed',

  // Transfers
  TRANSFER_INITIATED = 'transfer.initiated',
  TRANSFER_COMPLETED = 'transfer.completed',
  TRANSFER_FAILED = 'transfer.failed',

  // Withdrawals
  WITHDRAWAL_INITIATED = 'withdrawal.initiated',
  WITHDRAWAL_COMPLETED = 'withdrawal.completed',
  WITHDRAWAL_FAILED = 'withdrawal.failed',

  // Refunds
  REFUND_INITIATED = 'refund.initiated',
  REFUND_COMPLETED = 'refund.completed',
  REFUND_FAILED = 'refund.failed',

  // Disputes
  DISPUTE_CREATED = 'dispute.created',
  DISPUTE_RESOLVED = 'dispute.resolved',

  // Users
  USER_CREATED = 'user.created',
  USER_VERIFIED = 'user.verified',
}
```

**Webhook Payload Structure:**

```typescript
interface WebhookPayload {
  event: WebhookEvent;
  data: Record<string, any>;
  timestamp: string;  // ISO 8601
  webhook_id: string;
  merchant_id: string;
  signature: string;  // HMAC SHA256
}
```

**Example Webhook Payload:**

```json
{
  "event": "payment.success",
  "data": {
    "transaction": {
      "id": "uuid",
      "reference": "TXN-20240115103045-A3F5K9",
      "amount": 50000,
      "currency": "NGN",
      "status": "completed",
      "user": {
        "id": "uuid",
        "email": "user@example.com"
      },
      "metadata": {
        "order_id": "ORD-12345"
      },
      "created_at": "2024-01-15T10:30:45Z",
      "completed_at": "2024-01-15T10:31:00Z"
    }
  },
  "timestamp": "2024-01-15T10:31:01Z",
  "webhook_id": "wh_abc123xyz",
  "merchant_id": "mch_xyz789",
  "signature": "sha256=abc123..."
}
```

**Signature Generation:**

```typescript
function generateWebhookSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

// Usage
const payloadString = JSON.stringify(webhookPayload);
const signature = generateWebhookSignature(payloadString, merchantSecret);
```

**Signature Verification (Merchant Side):**

```typescript
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**Webhook Service Implementation:**

```typescript
@Injectable()
export class WebhookService {
  constructor(
    @InjectQueue('webhooks')
    private webhookQueue: Queue,
    @InjectRepository(Webhook)
    private webhooksRepository: Repository<Webhook>,
    @InjectRepository(WebhookDelivery)
    private webhookDeliveriesRepository: Repository<WebhookDelivery>,
  ) {}

  async sendWebhook(
    event: WebhookEvent,
    data: Record<string, any>,
    merchantId?: string
  ): Promise<void> {
    // Get all active webhooks subscribed to this event
    const query = this.webhooksRepository
      .createQueryBuilder('webhook')
      .where('webhook.active = :active', { active: true })
      .andWhere(':event = ANY(webhook.events)', { event });

    if (merchantId) {
      query.andWhere('webhook.merchant_id = :merchantId', { merchantId });
    }

    const webhooks = await query.getMany();

    for (const webhook of webhooks) {
      await this.queueWebhookDelivery(webhook, event, data);
    }
  }

  private async queueWebhookDelivery(
    webhook: Webhook,
    event: WebhookEvent,
    data: Record<string, any>
  ): Promise<void> {
    const webhookId = `wh_${nanoid()}`;

    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      webhook_id: webhookId,
      merchant_id: webhook.merchant_id,
      signature: '',  // Will be set before delivery
    };

    const delivery = await this.webhookDeliveriesRepository.save({
      webhook_id: webhook.id,
      event,
      payload,
      status: 'pending',
      attempts: 0,
    });

    await this.webhookQueue.add(
      'deliver',
      {
        delivery_id: delivery.id,
        webhook_id: webhook.id,
        url: webhook.url,
        secret: webhook.secret,
        payload,
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,  // 1s, 2s, 4s, 8s, 16s
        },
      }
    );
  }

  @Process('deliver')
  async deliverWebhook(job: Job): Promise<void> {
    const { delivery_id, url, secret, payload } = job.data;

    try {
      // Generate signature
      const payloadString = JSON.stringify(payload);
      const signature = this.generateSignature(payloadString, secret);

      // Update payload with signature
      payload.signature = signature;

      // Increment attempt count
      await this.webhookDeliveriesRepository.update(
        { id: delivery_id },
        { attempts: () => 'attempts + 1' }
      );

      // Send webhook
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-ID': payload.webhook_id,
          'User-Agent': 'PaymentPlatform-Webhooks/1.0',
        },
        timeout: 30000,  // 30 seconds
      });

      // Check response status
      if (response.status >= 200 && response.status < 300) {
        await this.webhookDeliveriesRepository.update(
          { id: delivery_id },
          {
            status: 'delivered',
            delivered_at: new Date(),
            response_status: response.status,
            response_body: JSON.stringify(response.data),
          }
        );
      } else {
        throw new Error(`Webhook returned status ${response.status}`);
      }

    } catch (error) {
      await this.webhookDeliveriesRepository.update(
        { id: delivery_id },
        {
          status: 'failed',
          error_message: error.message,
          last_attempt_at: new Date(),
        }
      );

      // If max attempts reached, mark as permanently failed
      const delivery = await this.webhookDeliveriesRepository.findOne({
        where: { id: delivery_id }
      });

      if (delivery.attempts >= 5) {
        await this.webhookDeliveriesRepository.update(
          { id: delivery_id },
          { status: 'failed_permanently' }
        );
      }

      throw error;  // Retry via Bull queue
    }
  }

  private generateSignature(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  }

  async replayWebhook(deliveryId: string): Promise<void> {
    const delivery = await this.webhookDeliveriesRepository.findOne({
      where: { id: deliveryId },
      relations: ['webhook'],
    });

    if (!delivery) {
      throw new NotFoundException('Webhook delivery not found');
    }

    // Reset status and queue for redelivery
    await this.webhookDeliveriesRepository.update(
      { id: deliveryId },
      { status: 'pending', attempts: 0 }
    );

    await this.webhookQueue.add('deliver', {
      delivery_id: deliveryId,
      webhook_id: delivery.webhook.id,
      url: delivery.webhook.url,
      secret: delivery.webhook.secret,
      payload: delivery.payload,
    });
  }
}
```

---

## FEATURE-8.3: Fraud Detection & Prevention

### 📘 User Story: US-7.3.1 - Transaction Fraud Detection

**Story ID:** US-7.3.1
**Feature:** FEATURE-8.3 (Fraud Detection)
**Epic:** EPIC-10 (Security & Fraud Prevention)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 7
**Status:** 🔄 Not Started

---

#### User Story

```
As a platform operator
I want to automatically detect and prevent fraudulent transactions
So that I can protect users and reduce financial losses
```

---

#### Business Value

**Value Statement:**
Fraud detection is critical for platform sustainability. Automated fraud prevention reduces losses, protects users, and maintains platform reputation.

**Impact:**
- **Critical:** Prevents financial losses
- **Trust:** Users feel safe on platform
- **Compliance:** Required for payment license
- **Cost Savings:** Reduces manual review costs

**Success Criteria:**
- 95% fraud detection accuracy
- < 100ms fraud check latency
- < 1% false positive rate
- Zero tolerance for known fraud patterns

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Real-time fraud scoring for all transactions
- [ ] **AC2:** Velocity checks (transactions per hour/day)
- [ ] **AC3:** Amount threshold checks
- [ ] **AC4:** Geographic anomaly detection
- [ ] **AC5:** Device fingerprinting
- [ ] **AC6:** IP address tracking and blacklist
- [ ] **AC7:** Email/phone verification status check
- [ ] **AC8:** Transaction pattern analysis
- [ ] **AC9:** Duplicate transaction detection
- [ ] **AC10:** Suspicious timing detection (e.g., 2am withdrawals)
- [ ] **AC11:** Multiple failed attempts tracking
- [ ] **AC12:** Automatic transaction blocking (high risk)
- [ ] **AC13:** Manual review queue (medium risk)
- [ ] **AC14:** Fraud alert notifications
- [ ] **AC15:** Whitelisting trusted users
- [ ] **AC16:** Rule engine for custom fraud rules

**Non-Functional:**
- [ ] **AC17:** Fraud check < 100ms
- [ ] **AC18:** Real-time processing
- [ ] **AC19:** Scalable to 10,000+ TPS
- [ ] **AC20:** Machine learning model updates

---

#### Fraud Detection Rules

**Velocity Rules:**
```typescript
const velocityRules = {
  transactions_per_hour: {
    tier_0: 5,    // Max 5 transactions per hour
    tier_1: 20,
    tier_2: 50,
    tier_3: 100,
  },
  transactions_per_day: {
    tier_0: 10,
    tier_1: 50,
    tier_2: 200,
    tier_3: 500,
  },
  amount_per_day: {
    NGN: {
      tier_0: 10000000,   // NGN 100,000
      tier_1: 50000000,   // NGN 500,000
      tier_2: 200000000,  // NGN 2,000,000
      tier_3: 1000000000, // NGN 10,000,000
    },
  },
};
```

**Risk Scoring:**

```typescript
interface FraudScore {
  score: number;  // 0-100 (0 = safe, 100 = definitely fraud)
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  factors: FraudFactor[];
  action: 'allow' | 'review' | 'block';
}

interface FraudFactor {
  type: string;
  score: number;
  description: string;
}

const riskThresholds = {
  low: { min: 0, max: 30, action: 'allow' },
  medium: { min: 31, max: 60, action: 'review' },
  high: { min: 61, max: 80, action: 'review' },
  critical: { min: 81, max: 100, action: 'block' },
};
```

**Fraud Detection Service:**

```typescript
@Injectable()
export class FraudDetectionService {
  async checkTransaction(
    userId: string,
    transaction: {
      amount: number;
      type: TransactionType;
      ip_address: string;
      device_id?: string;
    }
  ): Promise<FraudScore> {
    const factors: FraudFactor[] = [];
    let totalScore = 0;

    // 1. Velocity checks
    const velocityScore = await this.checkVelocity(userId);
    factors.push(...velocityScore.factors);
    totalScore += velocityScore.score;

    // 2. Amount checks
    const amountScore = this.checkAmount(transaction.amount);
    factors.push(amountScore);
    totalScore += amountScore.score;

    // 3. IP address checks
    const ipScore = await this.checkIpAddress(transaction.ip_address);
    factors.push(ipScore);
    totalScore += ipScore.score;

    // 4. Device checks
    if (transaction.device_id) {
      const deviceScore = await this.checkDevice(userId, transaction.device_id);
      factors.push(deviceScore);
      totalScore += deviceScore.score;
    }

    // 5. User behavior
    const behaviorScore = await this.checkBehavior(userId);
    factors.push(...behaviorScore.factors);
    totalScore += behaviorScore.score;

    // 6. Time-based checks
    const timeScore = this.checkTiming();
    factors.push(timeScore);
    totalScore += timeScore.score;

    // Calculate final risk level
    const riskLevel = this.getRiskLevel(totalScore);
    const action = riskThresholds[riskLevel].action;

    return {
      score: totalScore,
      risk_level: riskLevel,
      factors,
      action,
    };
  }

  private async checkVelocity(userId: string): Promise<{
    score: number;
    factors: FraudFactor[];
  }> {
    const factors: FraudFactor[] = [];
    let score = 0;

    const hourlyCount = await this.getTransactionCount(userId, 'hour');
    const dailyCount = await this.getTransactionCount(userId, 'day');

    if (hourlyCount > 20) {
      score += 30;
      factors.push({
        type: 'high_velocity_hourly',
        score: 30,
        description: `${hourlyCount} transactions in the last hour`,
      });
    }

    if (dailyCount > 50) {
      score += 20;
      factors.push({
        type: 'high_velocity_daily',
        score: 20,
        description: `${dailyCount} transactions today`,
      });
    }

    return { score, factors };
  }

  private checkAmount(amount: number): FraudFactor {
    // Flag large amounts
    if (amount > 100000000) {  // > NGN 1,000,000
      return {
        type: 'large_amount',
        score: 25,
        description: 'Transaction amount unusually high',
      };
    }

    return {
      type: 'normal_amount',
      score: 0,
      description: 'Amount within normal range',
    };
  }

  private async checkIpAddress(ipAddress: string): Promise<FraudFactor> {
    // Check if IP is blacklisted
    const isBlacklisted = await this.isIpBlacklisted(ipAddress);

    if (isBlacklisted) {
      return {
        type: 'blacklisted_ip',
        score: 50,
        description: 'IP address on blacklist',
      };
    }

    // Check if IP is from high-risk country
    const location = await this.getIpLocation(ipAddress);
    if (this.isHighRiskCountry(location.country)) {
      return {
        type: 'high_risk_country',
        score: 20,
        description: `Transaction from high-risk country: ${location.country}`,
      };
    }

    return {
      type: 'trusted_ip',
      score: 0,
      description: 'IP address is trusted',
    };
  }

  private checkTiming(): FraudFactor {
    const hour = new Date().getHours();

    // Flag transactions between 2am - 5am
    if (hour >= 2 && hour < 5) {
      return {
        type: 'unusual_time',
        score: 15,
        description: 'Transaction at unusual time (2am - 5am)',
      };
    }

    return {
      type: 'normal_time',
      score: 0,
      description: 'Transaction time is normal',
    };
  }
}
```

---

## Summary of Sprint 7 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-7.1.1 | Email & SMS Notifications | 8 | P0 | To Do |
| US-7.2.1 | Merchant Webhook System | 13 | P1 | To Do |
| US-7.3.1 | Transaction Fraud Detection | 13 | P0 | To Do |
| US-7.4.1 | In-App Notifications | 5 | P2 | To Do |
| US-7.5.1 | Push Notifications | 3 | P2 | To Do |
| **Total** | | **42** | | |

---

## Sprint Velocity Tracking

**Planned Story Points:** 42 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

---

## Dependencies

**External:**
- Email provider (Mailgun or SendGrid)
- SMS provider (Twilio or Termii)
- Push notification service (Firebase Cloud Messaging)
- Fraud detection service (optional: Sift Science, Stripe Radar)
- IP geolocation service

**Internal:**
- Sprint 1: Database entities, authentication
- Sprint 5: Transaction system
- Sprint 5: Webhook infrastructure

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-7.1 | Email/SMS provider downtime | Medium | High | Multiple provider fallback |
| RISK-7.2 | Webhook delivery failures | Medium | High | Robust retry mechanism, manual replay |
| RISK-7.3 | False positive fraud blocks | Medium | High | Manual review queue, quick unblock process |
| RISK-7.4 | Notification spam | Low | Medium | Rate limiting, user preferences |
| RISK-7.5 | Webhook signature bypass | Low | Critical | Strong signature algorithm, HTTPS enforcement |

---

## Notes & Decisions

**Technical Decisions:**
1. **Mailgun for emails:** Better deliverability than SendGrid
2. **Twilio for SMS:** Most reliable provider
3. **Bull queue:** For reliable notification delivery
4. **HMAC SHA256:** Industry standard for webhook signatures
5. **Rule-based fraud detection:** Start simple, add ML later

**Open Questions:**
1. ❓ Email provider: Mailgun or SendGrid? **Decision: Mailgun**
2. ❓ Fraud threshold for auto-block: 80 or 90? **Decision: 80**
3. ❓ Webhook retry count: 3 or 5? **Decision: 5 attempts**
4. ❓ SMS for all transactions or just critical? **Decision: Just critical**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Enable comprehensive notifications and fraud protection
