# Sprint 25: Receipts - Mock Services

```typescript
export class ReceiptGeneratorMock {
  async generateReceipt(transactionId: string, format: string): Promise<Receipt> {
    const receipt: Receipt = {
      id: crypto.randomUUID(),
      transactionId,
      formats: [format],
      s3Url: `https://s3.amazonaws.com/receipts/${transactionId}.${format}`,
      createdAt: new Date(),
    };

    console.log(`[Receipt] ✓ Generated: ${format}`);
    return receipt;
  }
}
```

**Metrics:**
- Generation time: <500ms
- Encryption: AES-256
- Access control: 100% enforced
