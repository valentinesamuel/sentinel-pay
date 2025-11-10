# Sprint 22: Advanced Fraud Detection Engine

**Sprint Goal:** Implement comprehensive real-time fraud detection using rule-based scoring, behavioral analysis, and machine learning to protect against fraud, money laundering, and account compromise.

**Duration:** 2 weeks (14 days)
**Story Points:** 45 SP
**Team:** 2 Backend Engineers + 1 Data Scientist + 1 Security Engineer
**Dependencies:** Sprint 5 (Transactions working), Sprint 7 (User profiles), Sprint 30 (Basic AML/OFAC)
**Enables:** Sprints 41, 45, 48 (all leverage fraud scoring)

---

## User Stories

### US-22.1.1: Real-Time Fraud Risk Scoring (13 SP)

**Title:** Calculate fraud risk scores for all transactions in real-time

**Risk Factors (Weighted):**
```
1. Amount Deviation (15%): vs user average/typical patterns
2. Geographic Anomaly (12%): impossible travel times
3. Device Mismatch (10%): new/unexpected device
4. Velocity Check (12%): transactions per minute/hour/day
5. Merchant Risk (10%): known high-risk merchant category
6. Card Status (8%): new card, expired card alerts
7. User History (8%): account age, previous fraud
8. IP Reputation (7%): known VPN/proxy, datacenter IPs
9. Email/Phone Anomaly (5%): new contact method
10. Blacklist Match (3%): if in blacklist, immediate escalation
```

**Technical Specs:**
```typescript
interface FraudScoreResult {
  transactionId: string;
  riskScore: number;           // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: {
    name: string;
    weight: number;             // 0-1
    score: number;              // 0-100
    explanation: string;
  }[];
  recommendedAction: 'ALLOW' | 'REQUIRE_VERIFICATION' | 'HOLD' | 'DECLINE';
  confidence: number;           // 0-1 (ML model confidence)
  calculatedAt: Date;
  modelVersion: string;
}

// Thresholds
THRESHOLD_LOW = 30;
THRESHOLD_MEDIUM = 70;
THRESHOLD_HIGH = 85;
THRESHOLD_CRITICAL = 90;
```

**Acceptance Criteria:**
1. Calculate fraud score in <500ms (synchronous path)
2. Score based on 10+ risk factors
3. Risk levels: LOW (0-30), MEDIUM (30-70), HIGH (70-85), CRITICAL (85+)
4. Automatic transaction hold for CRITICAL risk
5. Automatic decline for CRITICAL + previous fraud flag
6. Whitelist/blacklist override support
7. Manual risk score adjustment by fraud team (audit logged)
8. A/B testing for scoring model improvements
9. Score explanation: show which factors contributed
10. Confidence score from ML model (0-1)
11. Transaction-level fraud audit log
12. Batched scoring for bulk operations
13. Merchant-specific risk profiles
14. Integration with customer notifications
15. Performance monitoring dashboard

**Estimated Effort:** 13 SP

---

### US-22.1.2: Behavioral Analysis & Velocity Checks (10 SP)

**Title:** Detect unusual user behavior patterns and velocity anomalies

**Behavioral Profiles:**
```typescript
interface UserBehavioralProfile {
  userId: string;

  // Transaction patterns
  avgTransactionAmount: number;
  maxTransactionAmount: number;
  frequentMerchants: string[];        // Top 10 merchants
  frequentCountries: string[];        // Countries user transacts in
  typicalTransactionTimes: TimeRange[]; // e.g., 9am-5pm

  // Spending patterns
  dailySpendAverage: number;
  weeklySpendAverage: number;
  monthlySpendAverage: number;
  peakSpendingDays: DayOfWeek[];

  // Device patterns
  knownDevices: Set<string>;
  knownIPs: Set<string>;

  // Velocity baseline
  transactionsPerHourNormal: number;
  transactionsPerDayNormal: number;

  // Profile confidence
  dataPoints: number;        // How many transactions used
  lastUpdated: Date;
}
```

**Velocity Limits by KYC Tier:**
```
Tier 0 (Unverified):
  - Max ₦50,000/day
  - Max 10 transactions/day
  - 3 transactions/minute max

Tier 1 (Basic KYC):
  - Max ₦500,000/day
  - Max 50 transactions/day
  - 5 transactions/minute max

Tier 2 (Full KYC):
  - Max ₦5,000,000/day
  - Max 200 transactions/day
  - 10 transactions/minute max

Tier 3 (Enterprise):
  - Max ₦50,000,000/day
  - Unlimited transactions (within API rate limits)
  - 20 transactions/minute max
```

**Acceptance Criteria:**
1. Learn user baseline patterns over 30 days
2. Detect deviations: amount >3x average, new merchants
3. Velocity checks: max transactions per time window
4. Progressive tightening during suspicious periods
5. Cumulative spend limits per day/week/month by KYC tier
6. Network analysis: flag if multiple accounts from same IP/device
7. Time-of-day patterns (flag unusual hours)
8. Whitelist exceptions for regular transactions
9. ML model to improve baseline detection
10. Behavioral risk decay (recent activity weighted more)
11. Account velocity (account age = lower risk)
12. Merchant category analysis
13. Payment method velocity
14. Geographic velocity
15. Bulk API behavior detection

**Estimated Effort:** 10 SP

---

### US-22.1.3: Device Fingerprinting & IP Reputation (8 SP)

**Title:** Identify devices and assess IP reputation for risk

**Device Fingerprint Components:**
```
1. User-Agent (25%)
2. IP Address (20%)
3. Device ID (if available - 20%)
4. TLS Certificate fingerprint (15%)
5. Browser/App version (10%)
6. Timezone/Locale (5%)
7. Screen resolution (if web - 5%)
```

**IP Reputation Sources:**
```
- VPN/Proxy Detection
- Datacenter IP Detection
- IP Geolocation accuracy
- Previous fraud from IP
- Tor exit node detection
- Residential vs. Commercial IP
```

**Acceptance Criteria:**
1. Fingerprint devices from: User-Agent, IP, device ID, TLS signature
2. Store fingerprints encrypted in database
3. Flag transactions from new/unknown devices
4. Differentiate: new device vs. compromised account
5. IP reputation scoring (VPN/proxy detection, datacenter IPs)
6. GeoIP validation (device location vs. transaction location)
7. Impossible travel detection (>900 km/hour)
8. Device trust scoring (older device = more trusted)
9. Whitelist known devices
10. Device binding (user confirms trusted device)
11. Multiple concurrent device detection
12. Foreign IP login detection
13. Rapid device switching detection
14. Device history per user
15. Cross-user device detection (shared device)

**Estimated Effort:** 8 SP

---

### US-22.1.4: Fraud Alerts & Escalation (7 SP)

**Title:** Alert and escalate high-risk transactions to fraud team

**Fraud Case States:**
```
CREATED → UNDER_REVIEW → NEEDS_INFO → INVESTIGATING → RESOLVED
              ↓
         ESCALATED (after 2h no response)
              ↓
         MANAGER_REVIEW → RESOLVED/SUSPENDED
```

**Acceptance Criteria:**
1. Create fraud case for CRITICAL risk transactions
2. Auto-hold transaction pending review (customer notified)
3. Alert channels: Slack, email, SMS to fraud team
4. Escalation after 2 hours of no review
5. Dashboard showing all open fraud cases
6. Case investigation workflow: review evidence, approve/deny
7. Resolution: approve transaction, decline, request verification
8. Integration with user account suspension
9. Bulk investigation: find related accounts/transactions
10. Audit trail: log all actions on fraud case
11. Case notes and collaboration
12. Evidence attachment and review
13. Case prioritization (high-risk first)
14. SLA tracking (2h response, 4h resolution)
15. Case analytics and patterns

**Estimated Effort:** 7 SP

---

### US-22.1.5: Integration with Transaction Processing (7 SP)

**Title:** Apply fraud scoring to all transaction types

**Acceptance Criteria:**
1. Synchronous scoring path (<500ms, required for transaction)
2. Asynchronous feedback path (post-transaction enrichment)
3. Support all transaction types: card, transfer, withdrawal, batch
4. Score available in transaction record
5. Decision applied: allow, hold, or decline
6. Customer notification on holds (SMS + in-app)
7. Easy resolution for held transactions (1-click approve)
8. Integration with webhook notifications
9. Fallback: if scorer unavailable, apply conservative defaults
10. Performance monitoring: fraud check latency dashboard
11. Bulk transaction scoring (batches)
12. Recurring transaction fraud scoring
13. Refund fraud protection
14. Chargeback prediction
15. Velocity-aware scoring adjustments

**Estimated Effort:** 7 SP

---

## Success Criteria

- [ ] Fraud detection latency: <500ms for synchronous path
- [ ] False positive rate: <5% (minimal legitimate transactions blocked)
- [ ] False negative rate: <10% (catch 90%+ of actual fraud)
- [ ] Fraud case resolution: <4 hours average time
- [ ] Device fingerprinting accuracy: >95%
- [ ] Velocity check accuracy: 100% (no bypass)
- [ ] ML model accuracy: >85% precision and recall
- [ ] System availability: 99.95%
- [ ] Audit trail: 100% complete for all cases
- [ ] Customer satisfaction: >85% can resolve holds in <5 min

---

## Dependencies & Blockers

**Depends On:**
- ✅ Sprint 5: Transaction processing
- ✅ Sprint 7: User profiles
- ✅ Sprint 30: Basic AML/OFAC

**Enables:**
- Sprint 41: Batch operations fraud check
- Sprint 45: Real-time fraud alerts on WebSocket
- Sprint 48: Market features fraud scoring
