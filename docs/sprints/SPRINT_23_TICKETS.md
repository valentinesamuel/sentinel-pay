# Sprint 23: Merchant Onboarding - Implementation Tickets

## TICKET-23-001: Merchant Registration Service (5 SP)

**Story:** US-23.1.1
**Implementation:**

```typescript
@Injectable()
export class MerchantRegistrationService {
  async registerMerchant(dto: MerchantRegistrationDto): Promise<Merchant> {
    // 1. Validate business entity
    await this.validateBusinessEntity(dto);
    
    // 2. Check for duplicates (tax ID, business registration)
    const existing = await this.merchantRepository.findOne({
      where: [
        { taxId: dto.taxId },
        { registrationNumber: dto.registrationNumber }
      ]
    });
    if (existing) throw new ConflictException('Merchant already registered');
    
    // 3. Create merchant record (KYC status: PENDING)
    const merchant = this.merchantRepository.create({
      userId: dto.userId,
      businessName: dto.businessName,
      entityType: dto.entityType,
      taxId: this.encryptTaxId(dto.taxId),
      industry: dto.industry,
      kycStatus: 'PENDING',
      riskLevel: this.assessInitialRisk(dto)
    });
    
    await this.merchantRepository.save(merchant);
    
    // 4. Create KYC case
    await this.createKycCase(merchant);
    
    return merchant;
  }

  async submitKycDocuments(merchantId: string, documents: KycDocument[]): Promise<void> {
    const merchant = await this.merchantRepository.findOne(merchantId);
    
    // 1. OCR validation on each document
    for (const doc of documents) {
      const ocrData = await this.ocrService.extractText(doc.file);
      
      // 2. Cross-check extracted data with submission
      await this.validateDocumentData(ocrData, merchant.entityType);
      
      // 3. Store document (encrypted)
      await this.storeKycDocument(merchantId, doc, ocrData);
    }
    
    // 4. Update KYC status
    merchant.kycStatus = 'SUBMITTED';
    merchant.kycSubmittedAt = new Date();
    await this.merchantRepository.save(merchant);
    
    // 5. Add to review queue
    await this.addToReviewQueue(merchant);
  }

  async reviewMerchantKyc(merchantId: string, decision: 'APPROVED' | 'REJECTED', reason?: string): Promise<void> {
    const merchant = await this.merchantRepository.findOne(merchantId);
    
    if (decision === 'APPROVED') {
      merchant.kycStatus = 'APPROVED';
      merchant.kycApprovedAt = new Date();
      merchant.isActive = true;
      
      // Send activation email
      await this.emailService.sendMerchantApproval(merchant);
    } else {
      merchant.kycStatus = 'REJECTED';
      merchant.kycRejectedReason = reason;
      
      // Send rejection email with appeal instructions
      await this.emailService.sendMerchantRejection(merchant, reason);
    }
    
    await this.merchantRepository.save(merchant);
  }

  private assessInitialRisk(dto: MerchantRegistrationDto): string {
    // High-risk industries: gambling, crypto, adult content
    const highRiskIndustries = ['gambling', 'crypto', 'adult'];
    if (highRiskIndustries.some(cat => dto.industry?.includes(cat))) {
      return 'HIGH';
    }
    return 'MEDIUM';
  }
}
```

**Files to Create:**
- `src/modules/merchants/merchant-registration.service.ts`
- `src/modules/merchants/dtos/merchant-registration.dto.ts`
- `tests/merchants/merchant-registration.spec.ts`

---

## TICKET-23-002: KYC Review & Compliance Queue (4 SP)

**Story:** US-23.1.1
**Implementation:** Manual review dashboard, compliance officer workflows, automated checks

---

## TICKET-23-003: Settlement Configuration Service (4 SP)

**Story:** US-23.1.2
**Implementation:** Settlement schedule management, payout calculation, reconciliation

---

## TICKET-23-004: Payout Processing Engine (4 SP)

**Story:** US-23.1.2
**Implementation:** Scheduled payout execution, bank transfer integration, failure handling, retry logic

---

## TICKET-23-005: Merchant Dashboard APIs (3 SP)

**Story:** US-23.1.3
**Implementation:**
```
GET    /api/v1/merchant/dashboard/overview
       Response: { totalRevenue, transactionCount, settlementStatus, nextPayout }

GET    /api/v1/merchant/dashboard/transactions
       Query: { startDate, endDate, status, merchantId }
       Response: [ { txnId, amount, status, timestamp } ]

GET    /api/v1/merchant/dashboard/payouts
       Response: [ { payoutId, amount, status, date } ]

GET    /api/v1/merchant/dashboard/metrics
       Response: { successRate, chargebackRate, avgValue, volume }
```

---

## TICKET-23-006: Team Member Management (3 SP)

**Story:** US-23.1.4
**Implementation:** Role-based access control, permission enforcement, team management

---

## TICKET-23-007: Merchant Audit Logging (2 SP)

**Story:** All stories
**Implementation:** Comprehensive audit trail for all merchant actions

---

## TICKET-23-008: KYC Appeal Workflow (2 SP)

**Story:** US-23.1.1
**Implementation:** Appeal submission, supporting documents, re-review process

---

## TICKET-23-009: Integration Tests (2 SP)

**Story:** All stories
**Implementation:** End-to-end merchant onboarding tests, KYC workflows, payout scenarios

---

## Acceptance Criteria Checklist

- [ ] Registration flow: <10 minutes, mobile-friendly
- [ ] KYC approval: 2-3 business days
- [ ] Settlement payout: >99% success rate
- [ ] Dashboard load: <2 seconds
- [ ] Permission system: Zero bypass vulnerabilities
- [ ] Audit logging: 100% complete
- [ ] Team management: Smooth user experience
