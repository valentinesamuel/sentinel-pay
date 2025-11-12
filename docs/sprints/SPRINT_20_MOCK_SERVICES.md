# Sprint 20 Mock Services - Notifications & Webhooks

**Sprint:** Sprint 20
**Mock Services:** 2 services

---

## 1. Notification Sender Mock

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationSenderMock {
  async sendEmail(to: string, template: string): Promise<{ success: boolean; delivery_time_ms: number }> {
    const start = Date.now();
    await this.delay(100 + Math.random() * 200); // 100-300ms
    return { success: Math.random() > 0.01, delivery_time_ms: Date.now() - start };
  }

  async sendSMS(phone: string, message: string): Promise<{ success: boolean; sms_id: string }> {
    const start = Date.now();
    await this.delay(50 + Math.random() * 150); // 50-200ms
    return { success: Math.random() > 0.02, sms_id: `sms_${Date.now()}` };
  }

  async sendPush(userId: string, message: string): Promise<{ success: boolean }> {
    return { success: Math.random() > 0.03 };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 2. Webhook Delivery Mock

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookDeliveryMock {
  async deliverWebhook(webhookUrl: string, event: any): Promise<{
    delivered: boolean;
    http_code: number;
    attempt: number;
  }> {
    // Simulate 97% delivery success rate
    const success = Math.random() < 0.97;
    let attempts = 1;

    // Retry logic
    if (!success && Math.random() < 0.6) {
      attempts = 2; // Retry once
    }

    return {
      delivered: success,
      http_code: success ? 200 : 500,
      attempt: attempts,
    };
  }
}
```

---

**Document Version:** 1.0.0
