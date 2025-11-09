# Sprint 29 Mock Services

```typescript
@Injectable()
export class RecurringPaymentsMock {
  async schedulePayment(date: Date, amount: number): Promise<{ scheduled_id: string }> {
    return { scheduled_id: `scheduled_${Date.now()}` };
  }

  async createRecurring(frequency: string): Promise<{ subscription_id: string }> {
    return { subscription_id: `sub_${Date.now()}` };
  }
}

@Injectable()
export class RecommendationsMock {
  async generateRecommendations(): Promise<{ recommendations: any[] }> {
    return {
      recommendations: [
        { type: 'savings', message: 'Save more on groceries' },
        { type: 'investment', message: 'Consider investing extra income' },
      ],
    };
  }
}
```

**Document Version:** 1.0.0
