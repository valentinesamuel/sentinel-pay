# Sprint 25: Receipts - Implementation Tickets

## TICKET-25-001: Receipt Generator Service (4 SP)

```typescript
@Injectable()
export class ReceiptGeneratorService {
  async generateReceipt(
    transactionId: string,
    format: 'pdf' | 'sms' | 'email' | 'json' | 'print',
  ): Promise<Receipt> {
    const transaction = await this.transactionRepository.findOne(transactionId);
    
    let receiptContent: string;
    
    if (format === 'pdf') {
      receiptContent = await this.generatePdfReceipt(transaction);
      // Upload to S3, encrypt
      const s3Url = await this.s3Service.upload(`receipts/${transactionId}.pdf`, receiptContent);
      
      // Sign digitally
      const signature = this.signReceipt(receiptContent);
      
      const receipt = this.receiptRepository.create({
        transactionId,
        formats: ['pdf'],
        s3Url,
        digitalSignature: signature,
      });
      
      return await this.receiptRepository.save(receipt);
    } else if (format === 'sms') {
      receiptContent = this.generateSmsReceipt(transaction);
      // Send SMS...
    } else if (format === 'email') {
      receiptContent = this.generateEmailReceipt(transaction);
      // Send email...
    }
    
    return receipt;
  }

  private generatePdfReceipt(transaction: Transaction): string {
    // Use PDFKit or similar
    // Generate PDF with all transaction details
    // Include QR code linking to receipt
    // Include digital signature
    return pdfContent;
  }
}
```

## TICKET-25-002: Receipt Encryption & Storage (2 SP)
## TICKET-25-003: Receipt Retrieval APIs (2 SP)
## TICKET-25-004: Template Management (1 SP)
