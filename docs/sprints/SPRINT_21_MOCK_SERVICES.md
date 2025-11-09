# Sprint 21 Mock Services - Reporting & Analytics

**Sprint:** Sprint 21

---

## Analytics Report Generator Mock

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsReportMock {
  async generateRevenueDashboard(dateRange: any): Promise<{
    total_revenue: number;
    transaction_count: number;
    daily_average: number;
  }> {
    // Simulate realistic revenue (₦ currency)
    const days = 30;
    const avgDaily = 5000000 + Math.random() * 10000000;
    return {
      total_revenue: Math.floor(avgDaily * days),
      transaction_count: Math.floor(100 + Math.random() * 900),
      daily_average: Math.floor(avgDaily),
    };
  }

  async exportReport(format: 'csv' | 'excel' | 'pdf'): Promise<{ file_url: string; size_mb: number }> {
    return {
      file_url: `https://reports.example.com/export_${Date.now()}.${format}`,
      size_mb: Math.random() * 10 + 1,
    };
  }
}
```

---

**Document Version:** 1.0.0
