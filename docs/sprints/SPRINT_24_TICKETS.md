# Sprint 24: Dispute Management - Implementation Tickets

## TICKET-24-001: Dispute Service Core (4 SP)

```typescript
@Injectable()
export class DisputeService {
  async createDispute(
    transactionId: string,
    dto: CreateDisputeDto,
  ): Promise<Dispute> {
    const transaction = await this.transactionRepository.findOne(transactionId);
    
    // Check: Transaction within 90 days
    const daysSince = Math.floor((Date.now() - transaction.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 90) throw new BadRequestException('Dispute window closed');

    const dispute = this.disputeRepository.create({
      transactionId,
      reason: dto.reason,
      amount: transaction.amount,
      status: 'OPEN',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    });

    await this.disputeRepository.save(dispute);
    await this.notifyMerchant(dispute);
    return dispute;
  }

  async submitEvidence(disputeId: string, files: Express.Multer.File[]): Promise<void> {
    // Validate file types, encrypt, store
    for (const file of files) {
      const encrypted = await this.encryptionService.encrypt(file.buffer);
      await this.s3Service.upload(`disputes/${disputeId}/${file.originalname}`, encrypted);
    }
  }

  async resolveDispute(
    disputeId: string,
    resolution: 'APPROVED' | 'DENIED' | 'PARTIAL_REFUND',
    amount?: number,
  ): Promise<void> {
    const dispute = await this.disputeRepository.findOne(disputeId);
    
    if (resolution === 'APPROVED') {
      // Issue full refund
      await this.transactionService.createRefund(dispute.transactionId, dispute.amount);
    } else if (resolution === 'PARTIAL_REFUND' && amount) {
      await this.transactionService.createRefund(dispute.transactionId, amount);
    }

    dispute.status = 'RESOLVED';
    dispute.resolution = resolution;
    dispute.resolvedAt = new Date();
    await this.disputeRepository.save(dispute);
  }
}
```

---

## TICKET-24-002: Investigation Workflow (3 SP)
## TICKET-24-003: Chargeback Management (3 SP)
## TICKET-24-004: Evidence Management (2 SP)
## TICKET-24-005: Notifications & Escalation (2 SP)
## TICKET-24-006: Integration Tests (2 SP)

