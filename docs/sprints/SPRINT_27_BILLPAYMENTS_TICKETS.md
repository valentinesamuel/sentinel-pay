# Sprint 27: Bill Payments - Implementation Tickets

## TICKET-27-001: Airtime Topup Service (5 SP)

```typescript
@Injectable()
export class AirtimeService {
  async getProviders(): Promise<AirtimeProvider[]> {
    return [
      { name: 'MTN', plans: [...], rates: [...] },
      { name: 'Airtel', plans: [...], rates: [...] },
      // ...
    ];
  }

  async topup(phone: string, provider: string, amount: number): Promise<TopupResult> {
    // 1. Validate phone number
    // 2. Check provider availability
    // 3. Execute topup via provider API (mocked)
    // 4. Verify credit added
    // 5. Create transaction record
    // 6. Send SMS confirmation
    
    return { topupId, status: 'SUCCESS', credit: balance };
  }
}
```

## TICKET-27-002: Bill Payment Service (4 SP)
## TICKET-27-003: Provider Integrations (3 SP)
## TICKET-27-004: Webhooks & Notifications (2 SP)
## TICKET-27-005: Integration Tests (2 SP)

