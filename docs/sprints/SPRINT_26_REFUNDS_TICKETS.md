# Sprint 26: Refunds - Implementation Tickets

## TICKET-26-001: Refund Service Core (4 SP)

```typescript
@Injectable()
export class RefundService {
  async requestRefund(
    transactionId: string,
    dto: RefundRequestDto,
  ): Promise<Refund> {
    const transaction = await this.transactionRepository.findOne(transactionId);
    
    // Validate: within refund window
    const daysSince = Math.floor((Date.now() - transaction.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 30) throw new BadRequestException('Refund window closed');

    // Validate: amount <= transaction amount
    if (dto.amount > transaction.amount) {
      throw new BadRequestException('Refund amount exceeds transaction');
    }

    // Create refund
    const refund = this.refundRepository.create({
      transactionId,
      amount: dto.amount,
      reason: dto.reason,
      status: 'PENDING',
      initiatedAt: new Date(),
    });

    await this.refundRepository.save(refund);

    // Process refund (async)
    await this.refundQueue.add('process-refund', { refundId: refund.id });

    return refund;
  }

  async processRefund(refundId: string): Promise<void> {
    const refund = await this.refundRepository.findOne(refundId);
    
    try {
      // Issue refund via payment gateway
      await this.paystackService.refund({
        transactionId: refund.transactionId,
        amount: refund.amount,
      });

      refund.status = 'COMPLETED';
      refund.completedAt = new Date();

      // Notify customer
      await this.notificationService.sendRefundConfirmation(refund);
    } catch (error) {
      refund.status = 'FAILED';
      refund.failureReason = error.message;
    }

    await this.refundRepository.save(refund);
  }
}
```

## TICKET-26-002: Refund Policies (2 SP)
## TICKET-26-003: Reconciliation & Reporting (2 SP)
## TICKET-26-004: Integration Tests (1 SP)

