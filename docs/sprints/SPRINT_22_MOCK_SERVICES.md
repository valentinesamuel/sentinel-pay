# Sprint 22 Mock Services - Performance Optimization

**Sprint:** Sprint 22

---

## Load Testing Mock

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoadTestingMock {
  async simulateNormalLoad(): Promise<{ response_time_ms: number; success: boolean }> {
    const latency = 100 + Math.random() * 100; // 100-200ms
    return { response_time_ms: Math.round(latency), success: true };
  }

  async simulatePeakLoad(): Promise<{ response_time_ms: number; success: boolean }> {
    const latency = 150 + Math.random() * 150; // 150-300ms
    return { response_time_ms: Math.round(latency), success: Math.random() > 0.05 };
  }

  async simulateStressLoad(): Promise<{ response_time_ms: number; success: boolean }> {
    const latency = 300 + Math.random() * 500; // 300-800ms
    return { response_time_ms: Math.round(latency), success: Math.random() > 0.2 };
  }
}
```

---

**Document Version:** 1.0.0
