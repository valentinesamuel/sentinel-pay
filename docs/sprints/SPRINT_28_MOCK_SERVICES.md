# Sprint 28 Mock Services

```typescript
@Injectable()
export class I18nMock {
  async translateText(text: string, targetLanguage: string): Promise<{ translated: string }> {
    return { translated: `[${targetLanguage}] ${text}` };
  }

  async convertCurrency(amount: number, from: string, to: string): Promise<{ converted: number }> {
    const rates = { USD: 1, NGN: 411, GBP: 0.73, EUR: 0.92 };
    return { converted: Math.round((amount / rates[from]) * rates[to]) };
  }
}
```

**Document Version:** 1.0.0
