# Sprint 22: Fraud Detection Engine - Implementation Tickets

---

## TICKET-22-001: Fraud Scoring Service Core

**Story:** US-22.1.1
**Points:** 5 SP
**Priority:** CRITICAL

```typescript
// src/modules/fraud-detection/fraud-score.service.ts

@Injectable()
export class FraudScoreService {
  private readonly logger = new Logger(FraudScoreService.name);
  private readonly SCORE_LATENCY_MAX_MS = 500;

  constructor(
    private readonly behavioralProfileService: BehavioralProfileService,
    private readonly deviceFingerprintService: DeviceFingerprintService,
    private readonly ipReputationService: IpReputationService,
    private readonly blacklistService: BlacklistService,
    @Inject('FRAUD_ML_MODEL') private readonly mlModel: FraudMLModel,
  ) {}

  /**
   * Calculate fraud score for transaction in real-time
   */
  async calculateFraudScore(
    transaction: Transaction,
    request: any,
  ): Promise<FraudScoreResult> {
    const startTime = Date.now();

    try {
      const scoreResult = await Promise.race([
        this.computeScore(transaction, request),
        this.timeout(this.SCORE_LATENCY_MAX_MS),
      ]);

      const elapsed = Date.now() - startTime;
      this.logger.debug(`Fraud score calculated in ${elapsed}ms`);

      return scoreResult;
    } catch (error) {
      // Fallback: conservative scoring
      this.logger.error(`Fraud scoring error, using fallback: ${error.message}`);
      return this.getFallbackScore(transaction);
    }
  }

  private async computeScore(
    transaction: Transaction,
    request: any,
  ): Promise<FraudScoreResult> {
    const riskFactors: RiskFactor[] = [];

    // 1. Amount Deviation (15%)
    const amountRisk = await this.assessAmountDeviation(transaction);
    riskFactors.push({ name: 'Amount Deviation', weight: 0.15, score: amountRisk.score, explanation: amountRisk.explanation });

    // 2. Geographic Anomaly (12%)
    const geoRisk = await this.assessGeographicAnomaly(transaction, request);
    riskFactors.push({ name: 'Geographic Anomaly', weight: 0.12, score: geoRisk.score, explanation: geoRisk.explanation });

    // 3. Device Mismatch (10%)
    const deviceRisk = await this.assessDeviceMismatch(transaction, request);
    riskFactors.push({ name: 'Device Mismatch', weight: 0.10, score: deviceRisk.score, explanation: deviceRisk.explanation });

    // 4. Velocity Check (12%)
    const velocityRisk = await this.assessVelocity(transaction);
    riskFactors.push({ name: 'Velocity Check', weight: 0.12, score: velocityRisk.score, explanation: velocityRisk.explanation });

    // 5. Merchant Risk (10%)
    const merchantRisk = await this.assessMerchantRisk(transaction);
    riskFactors.push({ name: 'Merchant Risk', weight: 0.10, score: merchantRisk.score, explanation: merchantRisk.explanation });

    // 6-10. Additional factors...
    // (IP Reputation, Card Status, User History, Email/Phone, Blacklist)

    // Calculate weighted score
    const baseScore = riskFactors.reduce((sum, f) => sum + f.score * f.weight, 0);

    // Apply ML model for confidence adjustment
    const mlPrediction = await this.mlModel.predict({
      riskFactors,
      transactionAmount: transaction.amount,
      userId: transaction.userId,
      merchantId: transaction.merchantId,
    });

    const finalScore = baseScore * mlPrediction.confidence + mlPrediction.score * (1 - mlPrediction.confidence);

    return {
      transactionId: transaction.id,
      riskScore: Math.round(finalScore),
      riskLevel: this.getRiskLevel(finalScore),
      riskFactors,
      recommendedAction: this.getRecommendedAction(finalScore),
      confidence: mlPrediction.confidence,
      calculatedAt: new Date(),
      modelVersion: this.mlModel.version,
    };
  }

  private async assessAmountDeviation(transaction: Transaction): Promise<RiskAssessment> {
    const profile = await this.behavioralProfileService.getProfile(transaction.userId);
    const deviation = transaction.amount / (profile.avgTransactionAmount || 1);

    let score = 0;
    if (deviation > 5) score = 100;
    else if (deviation > 3) score = 75;
    else if (deviation > 2) score = 50;
    else if (deviation > 1.5) score = 25;

    return {
      score,
      explanation: `Transaction ${deviation.toFixed(1)}x user average (avg: ₦${profile.avgTransactionAmount})`,
    };
  }

  private async assessGeographicAnomaly(transaction: Transaction, request: any): Promise<RiskAssessment> {
    const userProfile = await this.behavioralProfileService.getProfile(transaction.userId);
    const txCountry = transaction.merchantCountry;
    const requestGeoIP = request.geoIP;

    // Check if country is in user's frequent countries
    if (userProfile.frequentCountries.includes(txCountry)) {
      return { score: 0, explanation: `Transaction in frequent country: ${txCountry}` };
    }

    // Check for impossible travel (>900 km/hour)
    const lastTransaction = await this.getLastTransaction(transaction.userId);
    if (lastTransaction && this.isImpossibleTravel(lastTransaction, transaction)) {
      return { score: 95, explanation: 'Impossible travel: >900 km/hour detected' };
    }

    return {
      score: 50,
      explanation: `Transaction in new country: ${txCountry}`,
    };
  }

  private getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 30) return 'LOW';
    if (score < 70) return 'MEDIUM';
    if (score < 85) return 'HIGH';
    return 'CRITICAL';
  }

  private getRecommendedAction(score: number): string {
    if (score < 30) return 'ALLOW';
    if (score < 70) return 'REQUIRE_VERIFICATION';
    if (score < 90) return 'HOLD';
    return 'DECLINE';
  }

  private getFallbackScore(transaction: Transaction): FraudScoreResult {
    // Conservative approach when scorer unavailable
    return {
      transactionId: transaction.id,
      riskScore: 40,
      riskLevel: 'MEDIUM',
      riskFactors: [{ name: 'Scoring unavailable', weight: 1, score: 40, explanation: 'Using fallback scoring' }],
      recommendedAction: 'REQUIRE_VERIFICATION',
      confidence: 0.5,
      calculatedAt: new Date(),
      modelVersion: 'fallback',
    };
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Fraud scoring timeout after ${ms}ms`)), ms),
    );
  }
}
```

**Files to Create:**
- `src/modules/fraud-detection/fraud-score.service.ts`
- `src/modules/fraud-detection/dtos/fraud-score-result.dto.ts`
- `tests/fraud-detection/fraud-score.service.spec.ts`

---

## TICKET-22-002: Behavioral Profile Service

**Story:** US-22.1.2
**Points:** 4 SP
**Priority:** HIGH

**Implementation:**
- User baseline pattern learning
- Deviation detection algorithms
- Velocity checking engine
- Profile persistence and updates
- Machine learning integration for profile refinement

**Key Methods:**
```typescript
async getProfile(userId: string): Promise<BehavioralProfile>
async updateProfile(userId: string, transaction: Transaction): Promise<void>
async checkVelocity(userId: string, txCount: number, window: 'minute'|'hour'|'day'): Promise<boolean>
async assessDeviation(userId: string, amount: number, merchant: string): Promise<number>
```

---

## TICKET-22-003: Device Fingerprinting & IP Reputation

**Story:** US-22.1.3
**Points:** 4 SP
**Priority:** HIGH

**Implementation:**
- Device fingerprint generation and storage
- Device trust scoring
- IP reputation lookup and caching
- Impossible travel detection
- VPN/Proxy/Datacenter detection

**Key Services:**
```typescript
class DeviceFingerprintService {
  async generateFingerprint(request: any): Promise<string>
  async isKnownDevice(userId: string, fingerprint: string): Promise<boolean>
  async trustDevice(userId: string, fingerprint: string): Promise<void>
}

class IpReputationService {
  async getReputation(ipAddress: string): Promise<IpReputation>
  async isVPN(ipAddress: string): Promise<boolean>
  async isDatacenter(ipAddress: string): Promise<boolean>
}
```

---

## TICKET-22-004: Fraud Case Management & Alerts

**Story:** US-22.1.4
**Points:** 4 SP
**Priority:** HIGH

**Implementation:**
- Fraud case creation and lifecycle
- Alert generation (Slack, email, SMS)
- Investigation workflow
- Case resolution and approval
- SLA tracking

**Fraud Case Workflow:**
```
CRITICAL fraud score → Create case → Alert fraud team → 
UNDER_REVIEW (2h SLA) → Manager review → RESOLVED (4h SLA)
```

---

## TICKET-22-005: Transaction Integration

**Story:** US-22.1.5
**Points:** 3 SP
**Priority:** CRITICAL

**Integration Points:**
- Pre-authorization fraud check (synchronous)
- Post-transaction enrichment (asynchronous)
- Hold management and customer notification
- Decision enforcement (allow/hold/decline)

```typescript
// In payment.service.ts
async chargeCard(dto: CardPaymentDto): Promise<Transaction> {
  // 1. Check fraud score
  const fraudScore = await this.fraudScoreService.calculateFraudScore(transaction, request);
  
  // 2. Enforce decision
  if (fraudScore.recommendedAction === 'DECLINE') {
    throw new BadRequestException('Transaction declined due to fraud risk');
  }
  
  if (fraudScore.recommendedAction === 'HOLD') {
    transaction.status = 'ON_HOLD';
    await this.notifyCustomer('Transaction on hold for verification');
  }
  
  // 3. Store fraud score
  await this.fraudScoreRepository.save({
    transactionId: transaction.id,
    ...fraudScore,
  });
  
  return transaction;
}
```

---

## TICKET-22-006: ML Model Training & Integration

**Story:** US-22.1.1
**Points:** 4 SP
**Priority:** HIGH

**Implementation:**
- ML model training pipeline (nightly)
- Fraud detection accuracy measurement
- Model versioning and A/B testing
- Retraining based on fraud feedback

**Model Features:**
```
- Transaction amount
- Merchant category
- Time of day
- Day of week
- Account age
- Previous fraud history
- Geographic location
- Device type
- IP reputation
- Velocity metrics
```

---

## TICKET-22-007: Fraud Detection Dashboard & Monitoring

**Story:** All stories
**Points:** 3 SP
**Priority:** HIGH

**Dashboards:**
1. Real-time fraud alerts
2. Fraud cases under investigation
3. Model accuracy metrics
4. False positive/negative rates
5. Fraud team performance (SLA compliance)
6. Fraud trend analysis

---

## TICKET-22-008: Blacklist & Whitelist Management

**Story:** US-22.1.1
**Points:** 2 SP
**Priority:** MEDIUM

**Implementation:**
- User/card/IP/email/device blacklist
- Auto-decline for blacklisted items
- Whitelist for trusted transactions
- Bulk import/export capabilities
- Expiration and audit logging

---

## TICKET-22-009: Comprehensive Testing

**Story:** All stories
**Points:** 4 SP
**Priority:** HIGH

**Test Coverage:**
- Fraud score calculation accuracy
- Behavioral profile updates
- Velocity enforcement
- Device fingerprinting
- IP reputation accuracy
- Case management workflow
- Integration tests with transaction processing
- Load testing: 1000+ fraud checks/second

---

## Acceptance Criteria Checklist

- [ ] Fraud detection latency <500ms (p99)
- [ ] False positive rate <5%
- [ ] False negative rate <10%
- [ ] Velocity checks 100% accurate
- [ ] Case resolution <4 hours average
- [ ] System availability 99.95%
- [ ] ML model accuracy >85%
- [ ] Audit trail 100% complete
- [ ] Customer satisfaction >85%
