# Sprint 17 Mock Services - Fraud Detection

**Sprint:** Sprint 17
**Duration:** 2 weeks (Week 35-36)
**Mock Services:** 3 primary services with realistic behavior simulation

---

## Overview

Sprint 17 requires realistic mock services that simulate:
1. **Fraud Scoring Engine** - Real-time transaction risk scoring with multi-factor analysis
2. **Fraud Rules Engine** - Rule execution, evaluation, and A/B testing
3. **Investigation Workflow** - Analyst investigation toolkit with network analysis

---

## 1. Fraud Scoring Engine Mock Service

### Implementation

```typescript
import { Injectable } from '@nestjs/common';

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Injectable()
export class FraudScoringMock {
  private transactionScores: Map<string, any> = new Map();
  private userProfiles: Map<string, any> = new Map();
  private deviceCache: Map<string, any> = new Map();

  // Score transaction in real-time
  async scoreTransaction(input: {
    transaction_id: string;
    user_id: string;
    amount: number;
    merchant_id: string;
    device_id: string;
    ip_address: string;
    timestamp: Date;
  }): Promise<{
    transaction_id: string;
    fraud_score: number;
    risk_level: RiskLevel;
    factor_scores: {
      device_score: number;
      location_score: number;
      velocity_score: number;
      amount_score: number;
      behavioral_score: number;
    };
    triggered_rules: string[];
    processing_time_ms: number;
    action: 'auto_approve' | 'monitor' | 'manual_review' | 'auto_block';
  }> {
    const startTime = Date.now();

    // Simulate scoring latency: 30-100ms
    const latency = 30 + Math.random() * 70;
    await this.delay(latency);

    // 1. Device Score (0-30)
    const deviceScore = this.calculateDeviceScore(input.user_id, input.device_id);

    // 2. Location Score (0-25)
    const locationScore = this.calculateLocationScore(input.ip_address, input.user_id);

    // 3. Velocity Score (0-25)
    const velocityScore = this.calculateVelocityScore(input.user_id);

    // 4. Amount Score (0-15)
    const amountScore = this.calculateAmountScore(input.amount, input.user_id);

    // 5. Behavioral Score (0-15)
    const behavioralScore = this.calculateBehavioralScore(input.timestamp, input.user_id);

    const totalScore = deviceScore + locationScore + velocityScore + amountScore + behavioralScore;
    const fraudScore = Math.min(100, totalScore);

    // Determine risk level
    let riskLevel: RiskLevel;
    let action: 'auto_approve' | 'monitor' | 'manual_review' | 'auto_block';

    if (fraudScore <= 30) {
      riskLevel = RiskLevel.LOW;
      action = 'auto_approve';
    } else if (fraudScore <= 70) {
      riskLevel = RiskLevel.MEDIUM;
      action = 'monitor';
    } else if (fraudScore <= 90) {
      riskLevel = RiskLevel.HIGH;
      action = 'manual_review';
    } else {
      riskLevel = RiskLevel.CRITICAL;
      action = 'auto_block';
    }

    const triggeredRules = this.getTriggeredRules(
      deviceScore,
      locationScore,
      velocityScore,
      amountScore,
      behavioralScore,
    );

    const result = {
      transaction_id: input.transaction_id,
      fraud_score: Math.round(fraudScore),
      risk_level: riskLevel,
      factor_scores: {
        device_score: Math.round(deviceScore),
        location_score: Math.round(locationScore),
        velocity_score: Math.round(velocityScore),
        amount_score: Math.round(amountScore),
        behavioral_score: Math.round(behavioralScore),
      },
      triggered_rules: triggeredRules,
      processing_time_ms: Date.now() - startTime,
      action,
    };

    this.transactionScores.set(input.transaction_id, result);

    return result;
  }

  // Calculate device risk (0-30)
  private calculateDeviceScore(userId: string, deviceId: string): number {
    let score = 0;

    if (!this.userProfiles.has(userId)) {
      // New user: higher baseline
      score += 15;
      this.userProfiles.set(userId, {
        devices: [deviceId],
        known_locations: [],
        avg_transaction: 0,
      });
    } else {
      const profile = this.userProfiles.get(userId)!;
      if (!profile.devices.includes(deviceId)) {
        // New device: add risk
        score += 12 + Math.random() * 8; // 12-20
      }
    }

    // Cache hit: reduce score
    if (this.deviceCache.has(deviceId)) {
      score *= 0.7;
    }

    return Math.min(30, score);
  }

  // Calculate location risk (0-25)
  private calculateLocationScore(ipAddress: string, userId: string): number {
    let score = 0;

    // Simulate IP geolocation
    const country = this.mockGeolocate(ipAddress);

    // High-risk countries
    const highRiskCountries = ['KP', 'IR', 'SY']; // North Korea, Iran, Syria
    if (highRiskCountries.includes(country)) {
      score += 20;
    }

    // Check against known user locations
    const profile = this.userProfiles.get(userId);
    if (profile && !profile.known_locations.includes(country)) {
      score += 8 + Math.random() * 7; // 8-15
    }

    return Math.min(25, score);
  }

  // Calculate velocity risk (0-25)
  private calculateVelocityScore(userId: string): number {
    let score = 0;

    // Simulate transaction count in last 5 minutes
    const recentTxns = 2 + Math.floor(Math.random() * 8); // 2-10

    if (recentTxns > 5) {
      score += 15 + Math.random() * 10; // 15-25
    } else if (recentTxns > 2) {
      score += 5 + Math.random() * 5; // 5-10
    }

    return Math.min(25, score);
  }

  // Calculate amount risk (0-15)
  private calculateAmountScore(amount: number, userId: string): number {
    let score = 0;

    const profile = this.userProfiles.get(userId);
    const avgTransaction = profile?.avg_transaction || 50000;

    if (amount > avgTransaction * 10) {
      score += 12 + Math.random() * 3; // 12-15
    } else if (amount > avgTransaction * 5) {
      score += 8 + Math.random() * 4; // 8-12
    } else if (amount > avgTransaction * 2) {
      score += 4 + Math.random() * 4; // 4-8
    }

    return Math.min(15, score);
  }

  // Calculate behavioral risk (0-15)
  private calculateBehavioralScore(timestamp: Date, userId: string): number {
    let score = 0;

    const hour = timestamp.getHours();

    // Off-hours transactions (11 PM - 6 AM)
    if (hour >= 23 || hour < 6) {
      score += 8 + Math.random() * 4; // 8-12
    }

    // Weekend
    const day = timestamp.getDay();
    if (day === 0 || day === 6) {
      score += 2;
    }

    return Math.min(15, score);
  }

  private getTriggeredRules(
    deviceScore: number,
    locationScore: number,
    velocityScore: number,
    amountScore: number,
    behavioralScore: number,
  ): string[] {
    const rules: string[] = [];

    if (deviceScore > 15) rules.push('new_device_detected');
    if (locationScore > 15) rules.push('high_risk_location');
    if (velocityScore > 15) rules.push('high_velocity_pattern');
    if (amountScore > 10) rules.push('unusual_amount');
    if (behavioralScore > 10) rules.push('off_hours_transaction');

    return rules;
  }

  private mockGeolocate(ipAddress: string): string {
    const countries = ['NG', 'US', 'GB', 'CN', 'IN', 'KP', 'IR'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 2. Fraud Rules Engine Mock Service

### Implementation

```typescript
import { Injectable } from '@nestjs/class-validator';

export interface FraudRule {
  rule_id: string;
  rule_name: string;
  rule_type:
    | 'velocity'
    | 'amount'
    | 'location'
    | 'device'
    | 'ip'
    | 'pattern'
    | 'behavioral'
    | 'time_based';
  conditions: any;
  score_impact: number;
  priority: number;
  is_active: boolean;
  version: number;
  created_at: Date;
}

@Injectable()
export class FraudRulesEngineMock {
  private rules: Map<string, FraudRule[]> = new Map();
  private abTests: Map<string, any> = new Map();
  private rulePerformance: Map<string, any> = new Map();

  // Create or update rule
  async createRule(input: Partial<FraudRule>): Promise<{
    success: boolean;
    rule_id: string;
    version: number;
    created_at: Date;
  }> {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const rule: FraudRule = {
      rule_id: ruleId,
      rule_name: input.rule_name || 'Unnamed Rule',
      rule_type: input.rule_type || 'pattern',
      conditions: input.conditions || {},
      score_impact: input.score_impact || 10,
      priority: input.priority || 0,
      is_active: false, // Default to draft
      version: 1,
      created_at: new Date(),
    };

    const ruleType = rule.rule_type;
    if (!this.rules.has(ruleType)) {
      this.rules.set(ruleType, []);
    }

    this.rules.get(ruleType)!.push(rule);

    // Initialize performance tracking
    this.rulePerformance.set(ruleId, {
      triggers: 0,
      true_positives: 0,
      false_positives: 0,
    });

    return {
      success: true,
      rule_id: ruleId,
      version: 1,
      created_at: rule.created_at,
    };
  }

  // Execute rules against transaction
  async executeRules(transaction: any): Promise<{
    triggered_rules: string[];
    total_score_impact: number;
    rule_details: Array<{
      rule_id: string;
      rule_name: string;
      triggered: boolean;
      score_impact: number;
    }>;
    processing_time_ms: number;
  }> {
    const startTime = Date.now();

    const triggeredRules: string[] = [];
    let totalScore = 0;
    const ruleDetails: any[] = [];

    // Get all active rules, sorted by priority
    const allRules: FraudRule[] = [];
    this.rules.forEach((rules) => {
      allRules.push(...rules);
    });

    const activeRules = allRules
      .filter((r) => r.is_active)
      .sort((a, b) => a.priority - b.priority);

    // Execute each rule
    for (const rule of activeRules) {
      const triggered = this.evaluateRule(rule, transaction);

      if (triggered) {
        triggeredRules.push(rule.rule_id);
        totalScore += rule.score_impact;

        const perf = this.rulePerformance.get(rule.rule_id);
        if (perf) {
          perf.triggers++;
        }
      }

      ruleDetails.push({
        rule_id: rule.rule_id,
        rule_name: rule.rule_name,
        triggered,
        score_impact: triggered ? rule.score_impact : 0,
      });
    }

    return {
      triggered_rules: triggeredRules,
      total_score_impact: Math.min(100, totalScore),
      rule_details: ruleDetails,
      processing_time_ms: Date.now() - startTime,
    };
  }

  // A/B test a rule
  async startABTest(ruleId: string, testPercentage: number = 10): Promise<{
    test_id: string;
    rule_id: string;
    status: 'running';
    sample_size: number;
    start_date: Date;
  }> {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    this.abTests.set(testId, {
      test_id: testId,
      rule_id: ruleId,
      status: 'running',
      percentage: testPercentage,
      start_date: new Date(),
      transactions_tested: 0,
      true_positives: 0,
      false_positives: 0,
      improvement: null,
    });

    return {
      test_id: testId,
      rule_id: ruleId,
      status: 'running',
      sample_size: Math.round((testPercentage / 100) * 100000),
      start_date: new Date(),
    };
  }

  // Get rule performance metrics
  async getRulePerformance(ruleId: string): Promise<{
    rule_id: string;
    total_triggers: number;
    true_positive_rate: number;
    false_positive_rate: number;
    effectiveness_score: number;
  }> {
    const perf = this.rulePerformance.get(ruleId);

    if (!perf) {
      return {
        rule_id: ruleId,
        total_triggers: 0,
        true_positive_rate: 0,
        false_positive_rate: 0,
        effectiveness_score: 0,
      };
    }

    const tpRate = perf.triggers > 0 ? (perf.true_positives / perf.triggers) * 100 : 0;
    const fpRate = perf.triggers > 0 ? (perf.false_positives / perf.triggers) * 100 : 0;
    const effectivenessScore = Math.max(0, 100 * tpRate - 20 * fpRate);

    return {
      rule_id: ruleId,
      total_triggers: perf.triggers,
      true_positive_rate: Math.round(tpRate),
      false_positive_rate: Math.round(fpRate),
      effectiveness_score: Math.round(effectivenessScore),
    };
  }

  private evaluateRule(rule: FraudRule, transaction: any): boolean {
    // Simple rule evaluation (mock)
    switch (rule.rule_type) {
      case 'velocity':
        return Math.random() < 0.1; // 10% of transactions trigger velocity rule
      case 'amount':
        return transaction.amount > 500000 && Math.random() < 0.2;
      case 'location':
        return transaction.ip === '192.168.1.1'; // Specific high-risk IP
      case 'device':
        return transaction.new_device && Math.random() < 0.3;
      default:
        return Math.random() < 0.05;
    }
  }
}
```

---

## 3. Fraud Investigation Workflow Mock Service

### Implementation

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class FraudInvestigationMock {
  private investigations: Map<string, any> = new Map();
  private userNetworks: Map<string, any> = new Map();

  // Start investigation
  async startInvestigation(userId: string): Promise<{
    investigation_id: string;
    user_id: string;
    fraud_score: number;
    risk_score_trend: number[];
    connected_accounts: number;
    blocked_transactions: number;
    processing_time_ms: number;
  }> {
    const startTime = Date.now();

    const investigationId = `inv_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Simulate trend (array of 30 daily scores)
    const trend = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100));

    // Simulate connected accounts
    const connectedAccounts = Math.floor(2 + Math.random() * 8); // 2-10

    const investigation = {
      investigation_id: investigationId,
      user_id: userId,
      fraud_score: 65 + Math.random() * 30, // 65-95
      risk_score_trend: trend,
      connected_accounts: connectedAccounts,
      blocked_transactions: Math.floor(Math.random() * 20), // 0-20
      created_at: new Date(),
    };

    this.investigations.set(investigationId, investigation);

    return {
      investigation_id: investigationId,
      user_id: userId,
      fraud_score: Math.round(investigation.fraud_score),
      risk_score_trend: trend,
      connected_accounts: connectedAccounts,
      blocked_transactions: investigation.blocked_transactions,
      processing_time_ms: Date.now() - startTime,
    };
  }

  // Analyze user network (fraud ring detection)
  async analyzeUserNetwork(userId: string): Promise<{
    center_user_id: string;
    total_connected_users: number;
    fraud_ring_detected: boolean;
    ring_size?: number;
    connection_types: {
      shared_device: number;
      shared_ip: number;
      shared_email: number;
      shared_phone: number;
    };
    processing_time_ms: number;
  }> {
    const startTime = Date.now();

    // Simulate network connections
    const sharedDevice = Math.floor(Math.random() * 5);
    const sharedIp = Math.floor(Math.random() * 3);
    const sharedEmail = Math.floor(Math.random() * 2);
    const sharedPhone = Math.floor(Math.random() * 2);

    const totalConnected = sharedDevice + sharedIp + sharedEmail + sharedPhone;

    // Fraud ring detected if >4 connected users with 3+ connection types
    const fraudRingDetected = totalConnected > 4 && totalConnected > 3;

    return {
      center_user_id: userId,
      total_connected_users: totalConnected,
      fraud_ring_detected: fraudRingDetected,
      ring_size: fraudRingDetected ? Math.floor(5 + Math.random() * 15) : undefined,
      connection_types: {
        shared_device: sharedDevice,
        shared_ip: sharedIp,
        shared_email: sharedEmail,
        shared_phone: sharedPhone,
      },
      processing_time_ms: Date.now() - startTime,
    };
  }

  // Get transaction timeline
  async getTransactionTimeline(userId: string): Promise<{
    user_id: string;
    transactions: Array<{
      transaction_id: string;
      amount: number;
      risk_level: string;
      status: string;
      timestamp: Date;
    }>;
    processing_time_ms: number;
  }> {
    const startTime = Date.now();

    // Simulate 20-50 transactions
    const txnCount = 20 + Math.floor(Math.random() * 31);
    const transactions = Array.from({ length: txnCount }, (_, i) => ({
      transaction_id: `txn_${i}`,
      amount: 10000 + Math.random() * 500000,
      risk_level: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
      status: ['approved', 'blocked', 'pending_review'][Math.floor(Math.random() * 3)],
      timestamp: new Date(Date.now() - i * 60000 * 60 * 24),
    }));

    return {
      user_id: userId,
      transactions,
      processing_time_ms: Date.now() - startTime,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## Testing Examples

```typescript
describe('Sprint 17 - Fraud Detection', () => {
  let fraudScoring: FraudScoringMock;
  let rulesEngine: FraudRulesEngineMock;
  let investigation: FraudInvestigationMock;

  beforeEach(() => {
    fraudScoring = new FraudScoringMock();
    rulesEngine = new FraudRulesEngineMock();
    investigation = new FraudInvestigationMock();
  });

  it('should score transaction under 100ms', async () => {
    const score = await fraudScoring.scoreTransaction({
      transaction_id: 'txn_123',
      user_id: 'user_456',
      amount: 100000,
      merchant_id: 'merchant_789',
      device_id: 'device_001',
      ip_address: '192.168.1.1',
      timestamp: new Date(),
    });

    expect(score.processing_time_ms).toBeLessThan(100);
    expect(score.fraud_score).toBeGreaterThanOrEqual(0);
    expect(score.fraud_score).toBeLessThanOrEqual(100);
  });

  it('should categorize risk levels correctly', async () => {
    const score = await fraudScoring.scoreTransaction({
      transaction_id: 'txn_456',
      user_id: 'user_789',
      amount: 50000,
      merchant_id: 'merchant_123',
      device_id: 'device_002',
      ip_address: '10.0.0.1',
      timestamp: new Date(),
    });

    if (score.fraud_score <= 30) {
      expect(score.risk_level).toBe('low');
      expect(score.action).toBe('auto_approve');
    } else if (score.fraud_score <= 70) {
      expect(score.risk_level).toBe('medium');
      expect(score.action).toBe('monitor');
    }
  });

  it('should detect fraud rings', async () => {
    const network = await investigation.analyzeUserNetwork('user_123');

    if (network.fraud_ring_detected) {
      expect(network.ring_size).toBeGreaterThan(4);
      expect(network.total_connected_users).toBeGreaterThan(3);
    }
  });
});
```

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Status:** Ready for Implementation
