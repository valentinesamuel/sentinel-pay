# Sprint 25 Mock Services

```typescript
@Injectable()
export class MerchantAnalyticsMock {
  async getRevenueTrends(): Promise<{ revenue: number; trend: number }> {
    return { revenue: 5000000 + Math.random() * 5000000, trend: 5 + Math.random() * 10 };
  }

  async getTopCustomers(): Promise<any[]> {
    return Array.from({ length: 10 }, (_, i) => ({
      customer_id: `cust_${i}`,
      revenue: 50000 * (10 - i),
    }));
  }
}
```

**Document Version:** 1.0.0
