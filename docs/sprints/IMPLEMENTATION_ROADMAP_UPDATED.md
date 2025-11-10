# Updated Comprehensive Implementation Roadmap: Sprints 2.5, 3.5, 5.5, 41, 45, 47, 48

**Document:** Full-stack implementation roadmap with strategic sprint positioning for secure API infrastructure and advanced payment features.

**Created:** November 2024
**Version:** 2.0.0
**Updated:** Added Sprints 2.5, 3.5, 5.5 with optimal flow

---

## Executive Summary

This roadmap outlines the implementation strategy for **7 critical feature sprints (275 story points)** spanning **12 weeks of intensive development**. The plan strategically positions new infrastructure sprints (rate limiting, signing, tokenization) before existing feature sprints to enable seamless development without back-and-forth.

### Key Metrics

| Metric | Value |
|--------|-------|
| **Total Story Points** | 275 SP |
| **Sprints** | 7 (2.5, 3.5, 5.5, 41, 45, 47, 48) |
| **Timeline** | 12 weeks (84 days) |
| **Team Capacity** | 28-55 SP/sprint |
| **Critical Sprints** | 3.5 (signing), 45 (streaming), 47 (compliance) |
| **Infrastructure Sprints** | 2.5 (rate limiting), 3.5 (signing), 5.5 (tokenization) |
| **Integration Points** | 8 major handoffs |
| **Risk Level** | Medium (well-scoped, infrastructure-first approach) |

---

## Strategic Sprint Positioning

### Development Flow (NO Back-and-Forth)

```
PHASE 0: FOUNDATIONAL INFRASTRUCTURE (Week 1-3)
  Sprint 2.5: API Rate Limiting (28 SP)
    ↓ (Blocks: Sprints 5-6)
  Sprint 3.5: Request/Response Signing (35 SP)
    ↓ (Blocks: Sprints 5-6, 40, 45, 48)
  Sprint 5.5: Card Tokenization (32 SP)
    ↓ (Extends Sprint 5, enables Sprints 6, 40)

PHASE 1: BATCH PROCESSING (Week 4-5)
  Sprint 41: Batch Operations & Scheduled Transactions (55 SP)
    ↓

PHASE 2: REAL-TIME STREAMING (Week 6-7)
  Sprint 45: Real-Time Events & Streaming (32 SP)
    ↓

PHASE 3: COMPLIANCE (Week 8-9)
  Sprint 47: GDPR Compliance & Security (38 SP)
    ↓

PHASE 4: MARKET EXPANSION (Week 10-12)
  Sprint 48: Market-Specific Payment Methods (55 SP)

Total Duration: 12 weeks (84 days)
```

### Why This Ordering Works

1. **Sprint 2.5 First**: Rate limiting is infrastructure that affects ALL endpoints
   - Implement once, then enabled for all subsequent payment/batch/real-time APIs
   - No changes needed to Sprints 5-6, 41, 45 after rate limiting deployed

2. **Sprint 3.5 Early**: Request/response signing is foundational security
   - All payment endpoints (Sprints 5-6) will include signing from day 1
   - POS (Sprint 40) requires signing from start
   - Market features (Sprint 48) require signing from start

3. **Sprint 5.5 After Sprint 5**: Card tokenization extends Sprint 5
   - Only works with functioning card payments (Sprint 5)
   - Doesn't block anything; just adds feature layer
   - Enables POS (Sprint 40) and Sprints 6

4. **Sprints 41-48 Unchanged**: Feature sprints benefit from infrastructure
   - Rate limiting already configured
   - Signing already baked into APIs
   - Tokenization available for recurring features

---

## Detailed Sprint Breakdown

### Phase 0: Foundational Infrastructure

#### Sprint 2.5: API Rate Limiting (Week 1-2)

**Duration:** 1 week (7 days)
**Story Points:** 28 SP
**Team:** 2-3 Backend Engineers + 1 DevOps
**Blocks:** Sprints 5-6 (payment APIs need rate limiting), 41 (batch needs limits)

**Deliverables:**
- ✅ RateLimitService with fixed-window, sliding-window, token-bucket algorithms
- ✅ Database schema: rate_limit_tiers, rate_limit_overrides, api_key_limits
- ✅ NestJS RateLimitGuard and @RateLimit() decorator
- ✅ Tier-based limits: anonymous (10/min), free (100/min), premium (2000/min)
- ✅ Prometheus metrics and Grafana dashboards
- ✅ Comprehensive mock services (5-15ms latency)
- ✅ Integration tests for concurrent requests

**Impact on Later Sprints:**
```
Sprint 5 (Payments):
  - Payment endpoints automatically rate limited
  - No changes needed: guard applies limits to all endpoints

Sprint 6 (Withdrawals):
  - Withdrawal endpoints automatically rate limited

Sprint 41 (Batch):
  - Batch submission endpoints rate limited
  - Prevents abuse of batch operations

Sprint 45 (Real-time):
  - WebSocket connections rate limited
  - Prevents connection spam
```

**Success Criteria:**
- Rate limit check latency: <5ms (p99)
- Accurate counting with 1000+ concurrent requests
- Tier-based limits enforced correctly
- 0 race conditions in distributed setup

---

#### Sprint 3.5: Request/Response Signing (Week 2-3)

**Duration:** 1 week (7 days)
**Story Points:** 35 SP
**Team:** 2-3 Backend Engineers + 1 Security Engineer
**Dependencies:** Sprint 2 (Auth), Sprint 2.5 (Rate limiting)
**Blocks:** Sprints 5-6 (payment APIs), 40 (POS), 48 (market features)

**Deliverables:**
- ✅ RequestSigningService with HMAC-SHA256 signature generation/verification
- ✅ ResponseSigningService with optional AES-256-GCM encryption
- ✅ WebhookSigningValidator for inbound webhook validation
- ✅ SigningKeyService with key rotation and 30-day grace period
- ✅ Database schema: api_key_signing_keys, request_nonces, signature_verification_log
- ✅ NestJS SigningGuard for automatic request/response signing
- ✅ Comprehensive mock services (3-12ms latency)

**Impact on Later Sprints:**
```
Sprint 5 (Payments):
  - All payment endpoints automatically require request signatures
  - Response signatures on all payment responses
  - No custom implementation needed per endpoint

Sprint 6 (Withdrawals):
  - Withdrawal endpoints protected with signatures
  - Sensitive data (tokens) encrypted in responses

Sprint 40 (POS):
  - POS requests must be signed
  - Response signatures verify POS came from trusted terminal

Sprint 48 (Market Features):
  - USSD, Mobile Money, Wire Transfer all use signing
  - No additional security implementation needed
```

**Security Benefits:**
- 100% data integrity verification
- Replay attack prevention (nonce tracking)
- Request-response binding (echo nonce in response)
- Key rotation without service disruption

---

#### Sprint 5.5: Card Tokenization (Week 3-4)

**Duration:** 1 week (7 days)
**Story Points:** 32 SP
**Team:** 2 Backend Engineers + 1 Security Engineer
**Dependencies:** Sprint 5 (Card payments working), Sprint 3.5 (Signing for token transmission)
**Enables:** Recurring billing (Sprint 41), POS (Sprint 40), Subscription features

**Deliverables:**
- ✅ TokenizedCardService for secure card tokenization via Paystack
- ✅ Recurring charge scheduling and processing (Bull queue)
- ✅ Payment method management APIs (list, update, delete, set-default)
- ✅ Database schema: tokenized_cards, tokenized_card_usage, recurring_charges
- ✅ PCI compliance: zero raw card data in our system
- ✅ Duplicate card detection (prevent saving same card twice)
- ✅ Comprehensive mock services (1-2s tokenization, 95% recurring success)

**Impact on Later Sprints:**
```
Sprint 6 (Withdrawals):
  - Can use saved payment method instead of re-entering card
  - Faster checkout experience

Sprint 40 (POS):
  - Can charge pre-tokenized customer cards
  - No card re-entry at terminal
  - Faster transaction processing

Sprint 41 (Batch):
  - Batch can charge multiple cards for same customer
  - Uses tokenized cards, not raw card data
```

**PCI Compliance:**
- Zero raw card data stored in our database
- All cards tokenized via Paystack
- Tokens encrypted with AES-256
- No card data in logs
- Full audit trail of token usage

---

### Phase 1: Batch Processing (Week 4-5)

#### Sprint 41: Batch Operations & Scheduled Transactions (55 SP)

**Timeline:** Week 4-5
**Dependencies:** Sprints 2.5 (Rate limiting) ✅, 3.5 (Signing) ✅, 5.5 (Tokenization) ✅
**Blocks:** Sprints 45, 47, 48

**Key Points:**
- Rate limiting already configured (from Sprint 2.5)
- Request signing already built in (from Sprint 3.5)
- Can use tokenized cards for recurring batch charges
- No security re-work needed; all handled by infrastructure

**Success Criteria:**
- Process 10,000 items in <2 minutes
- 99% webhook delivery rate
- 0 duplicate processing
- Batch API responses: <200ms at p95

---

### Phase 2: Real-Time Streaming (Week 6-7)

#### Sprint 45: Real-Time Events & Streaming (32 SP)

**Timeline:** Week 6-7
**Dependencies:** Sprints 41 ✅, 2.5 (Rate limiting) ✅, 3.5 (Signing) ✅
**Blocks:** Sprint 47, 48

**Key Points:**
- WebSocket connections rate limited (from Sprint 2.5)
- Event responses signed (from Sprint 3.5)
- Real-time status for batch operations (from Sprint 41)
- No rate limiting re-work; already configured globally

---

### Phase 3: Compliance (Week 8-9)

#### Sprint 47: GDPR Compliance & Security (38 SP)

**Timeline:** Week 8-9
**Dependencies:** Sprints 45 ✅, 2.5 ✅, 3.5 ✅
**Blocks:** Sprint 48

**Key Points:**
- Audit logs include all signed requests (from Sprint 3.5)
- Data deletion respects tokenization (tokens revoked, not stored)
- Rate limit history for compliance reporting
- Signing keys managed with proper lifecycle (rotation, expiration)

---

### Phase 4: Market Expansion (Week 10-12)

#### Sprint 48: Market-Specific Payment Methods (55 SP)

**Timeline:** Week 10-12
**Dependencies:** Sprints 47 ✅, 2.5 ✅, 3.5 ✅, 5.5 ✅ (optional, for saved methods)

**Key Points:**
- USSD payments rate limited (100/min per user)
- Mobile money transfers signed (request/response)
- Wire transfers require signing + encryption
- Can use tokenized cards for recurring wire payments
- All market features benefit from infrastructure

---

## Critical Path Analysis

### Dependency Graph

```
Sprint 2.5 (Rate Limiting) - CRITICAL PATH START
├── No internal dependencies
├── Blocks: 5-6, 41, 45, 48
└── Day 1-7: Implementation + Testing

Sprint 3.5 (Request/Response Signing) - CRITICAL PATH
├── Depends on: 2 (Auth), 2.5 (Rate limiting)
├── Blocks: 5-6, 40, 41, 45, 48
└── Day 8-14: Implementation + Testing

Sprint 5.5 (Card Tokenization)
├── Depends on: 5 (existing), 3.5 (Signing)
├── Enables: 6, 40, 41
└── Day 15-21: Implementation + Testing

Sprint 41 (Batch Operations) - FEATURE CRITICAL PATH
├── Depends on: 2.5 ✅, 3.5 ✅, 5.5 ✅
├── Blocks: 45, 47, 48
└── Day 22-35: Implementation + Testing

Sprint 45 (Real-Time Streaming)
├── Depends on: 41 ✅
├── Blocks: 47, 48
└── Day 36-49: Implementation + Testing

Sprint 47 (GDPR Compliance)
├── Depends on: 45 ✅
├── GATE: Legal review (CRITICAL)
└── Day 50-63: Implementation + Testing

Sprint 48 (Market Features)
├── Depends on: 47 ✅
├── GATE: Regulatory approval (CRITICAL)
└── Day 64-84: Implementation + Testing
```

### Critical Path: Infrastructure First (Days 1-21)

```
Day 1-7:   Sprint 2.5 ████████
Day 8-14:  Sprint 3.5 ████████
Day 15-21: Sprint 5.5 ████████
────────────────────────────
21 days of infrastructure enables all feature sprints
```

**Why This Works:**
- 21 days of infrastructure work (3 weeks)
- Then 5 weeks of features that work with infrastructure
- No features need to be refactored for security/rate-limiting
- All payment APIs (Sprints 5-6, 40, 41, 48) automatically secured
- Zero technical debt from security/infrastructure

---

## Team Resource Allocation

### Overall Team Composition

```
Total: 9-10 FTE across all sprints
├── Backend Engineers: 4 FTE (core development)
├── Security Engineer: 1 FTE (cryptography, signing, tokenization)
├── DevOps/Infrastructure: 1 FTE (rate limiting, monitoring)
├── QA/Testing: 1 FTE (distributed across sprints)
├── Payment Specialist: 0.5 FTE (tokenization, recurring)
├── Tech Lead: 0.5 FTE (oversight)
└── Legal/Compliance: 0.25 FTE (Sprint 47)
```

### Sprint-by-Sprint Allocation

**Sprint 2.5 (Rate Limiting): 28 SP**
```
Backend Engineers:  2 FTE × 14 SP
DevOps/Infra:       1 FTE × 12 SP
QA/Testing:         1 FTE × 5 SP (shared)
Total: 31 SP allocated
```

**Sprint 3.5 (Signing): 35 SP**
```
Backend Engineers:  2 FTE × 17.5 SP
Security Engineer:  1 FTE × 12 SP
QA/Testing:         1 FTE × 5.5 SP (shared)
Total: 35 SP allocated
```

**Sprint 5.5 (Tokenization): 32 SP**
```
Backend Engineers:  2 FTE × 16 SP
Security Engineer:  1 FTE × 8 SP
Payment Specialist: 0.5 FTE × 6 SP
QA/Testing:         1 FTE × 5 SP (shared)
Total: 35 SP allocated
```

**Sprint 41 (Batch): 55 SP**
```
Backend Engineers:  3 FTE × 18.3 SP
QA/Testing:         1 FTE × 10 SP
DevOps:             1 FTE × 9 SP
Total: 55 SP allocated
```

**Sprint 45 (Real-time): 32 SP**
```
Backend Engineers:  2 FTE × 16 SP
DevOps/Infra:       1 FTE × 8 SP
QA/Testing:         1 FTE × 5 SP
Total: 32 SP allocated
```

**Sprint 47 (Compliance): 38 SP**
```
Backend Engineers:  2 FTE × 19 SP
Security Engineer:  1 FTE × 12 SP
QA/Testing:         1 FTE × 7 SP
Total: 38 SP allocated
```

**Sprint 48 (Market): 55 SP**
```
Backend Engineers:  3 FTE × 18.3 SP
Payment Specialist: 1 FTE × 15 SP
QA/Testing:         1 FTE × 6.7 SP
Total: 55 SP allocated
```

---

## Implementation Timeline (Gantt Chart)

```
Week 1-2:   Sprint 2.5 ████████ Rate Limiting
            (Prep 3.5 in parallel)

Week 2-3:   Sprint 3.5 ████████ Request/Response Signing
            (5.5 prep continues)

Week 3-4:   Sprint 5.5 ████████ Card Tokenization
            (41 prep, testing framework)

Week 4-5:   Sprint 41 ████████ Batch Operations
            (45 prep in parallel)

Week 5-7:   Sprint 45 ████████ Real-Time Streaming
            (47 prep, legal review starts)

Week 7-9:   Sprint 47 ████████ GDPR & Compliance
            [GATE: Legal approval required]
            (48 prep, regulatory review starts)

Week 9-12:  Sprint 48 ████████ Market Features
            [GATE: Regulatory approval required]

Total: 12 weeks (84 days)
```

---

## Success Criteria & KPIs

### Performance Metrics

| Sprint | Metric | Target |
|--------|--------|--------|
| 2.5 | Rate limit check latency | <5ms p99 |
| 2.5 | Concurrent connections | 1000+ accurate |
| 3.5 | Signature verification latency | <5ms p99 |
| 3.5 | Signature accuracy | 100% |
| 5.5 | Tokenization latency | <2 seconds |
| 5.5 | Recurring charge success | 95% initial |
| 41 | Batch processing time (10k items) | <2 minutes |
| 45 | Event delivery latency | <100ms p50 |
| 47 | Data deletion completion | <30 days |
| 48 | USSD flow completion | <15 seconds |

### Quality Gates

**Sprint 2.5:**
- [ ] All endpoints rate limited
- [ ] Load test: 1000 concurrent passes
- [ ] No race conditions detected

**Sprint 3.5:**
- [ ] All sensitive endpoints signed
- [ ] No raw signatures in logs
- [ ] Key rotation tested and working

**Sprint 5.5:**
- [ ] 0 raw card data in system
- [ ] PCI compliance verified
- [ ] 99% tokenization success rate

**Sprint 41:**
- [ ] Process 10,000 items in <2 min
- [ ] 99% webhook delivery success
- [ ] 0 duplicate transactions

**Sprint 45:**
- [ ] 1000+ concurrent connections
- [ ] <100ms p50 latency
- [ ] 95%+ ACK delivery rate

**Sprint 47:**
- [ ] GDPR legal review approved
- [ ] Compliance team sign-off
- [ ] Security audit passed

**Sprint 48:**
- [ ] Regulatory approval per market
- [ ] All payment methods working
- [ ] Success rates >90%

---

## Budget & Resource Estimation

### Development Costs (9.5 FTE × 12 weeks)

```
Backend Engineers (4 FTE):     4 × $100k/year × 3 months = $100k
Security Engineer (1 FTE):     1 × $120k/year × 3 months = $30k
DevOps (1 FTE):                1 × $110k/year × 3 months = $27.5k
QA Engineer (1 FTE):           1 × $80k/year × 3 months = $20k
Payment Specialist (0.5 FTE):  0.5 × $90k/year × 3 months = $11.25k
Tech Lead (0.5 FTE):           0.5 × $130k/year × 3 months = $16.25k
Legal/Compliance (0.25 FTE):   0.25 × $150k/year × 3 months = $11.25k
────────────────────────────────────────────────────────────
Subtotal Personnel:                                        $216.25k
```

### Infrastructure Costs (12 weeks)

```
Database (PostgreSQL cluster):  $800/month × 3 = $2,400
Cache (Redis cluster):          $200/month × 3 = $600
Message Queue (Bull/RabbitMQ):  $200/month × 3 = $600
Monitoring (Prometheus/Grafana),$300/month × 3 = $900
Load Testing Service:           $500/month × 3 = $1,500
Reporting/Analytics:            $200/month × 3 = $600
────────────────────────────────────────────────────────
Subtotal Infrastructure:                         $6,600
```

### Total Estimated Budget: ~$223k

---

## Risk Management

### Critical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Rate limiting causes API regression | Low | High | Comprehensive load testing before deployment |
| Signing key rotation breaks APIs | Low | Critical | 30-day grace period, thorough testing |
| Tokenization failure rate high | Medium | High | 99% success target, retry logic |
| Batch processing memory issues | Medium | High | Chunked processing, monitoring |
| WebSocket connections leak memory | Medium | High | Connection cleanup, heap monitoring |
| GDPR compliance gaps found late | Medium | Critical | Legal review before implementation |
| Market regulatory delays | Low | Medium | Parallel regulatory review |

### Mitigation Strategy

1. **Comprehensive Testing**: Load test each sprint at 2x expected load
2. **Staged Rollout**: Deploy infrastructure to staging first, then production
3. **Monitoring**: Prometheus dashboards for all critical metrics
4. **Rollback Plan**: All infrastructure changes reversible
5. **Legal Review**: GDPR review starts Week 7, not Week 8
6. **Regulatory**: Parallel regulatory review for market features

---

## Go/No-Go Decision Gates

### Gate 1: After Sprint 2.5 (End of Week 2)
**Decision Point:** Proceed with Signing infrastructure?
**Criteria:**
- ✅ Rate limiting verified working at 1000+ concurrent
- ✅ 0 false rate limit rejections detected
- ✅ Load test passes 5000 req/sec

### Gate 2: After Sprint 3.5 (End of Week 3)
**Decision Point:** Proceed with Tokenization?
**Criteria:**
- ✅ Signatures verified correct on 100% of requests
- ✅ Key rotation works without service disruption
- ✅ Security audit passed

### Gate 3: After Sprint 5.5 (End of Week 4)
**Decision Point:** Proceed with Feature Sprints?
**Criteria:**
- ✅ Tokenization success rate >99%
- ✅ PCI compliance verified
- ✅ Card data zero found in logs

### Gate 4: After Sprint 47 (End of Week 9)
**Decision Point:** Deploy to Production?
**Criteria:**
- ✅ Legal team: GDPR approval
- ✅ Compliance team: Full sign-off
- ✅ Security audit: All findings resolved

### Gate 5: Before Sprint 48 (Week 10)
**Decision Point:** Market Feature Rollout?
**Criteria:**
- ✅ Regulatory approval per country
- ✅ Market-specific compliance verified
- ✅ Merchant agreement terms aligned

---

## Conclusion

This strategic sprint ordering ensures:

1. **Infrastructure First**: Rate limiting, signing, tokenization all deployed before features
2. **No Backtracking**: Features don't need security/infrastructure refactoring
3. **Smooth Development**: Clear dependencies, minimal blocking
4. **Production Ready**: All components thoroughly tested before deployment
5. **Risk Managed**: Legal/regulatory review happens in parallel, not sequential

**Critical Success Factor**: Completing Sprints 2.5, 3.5, 5.5 on schedule (first 3 weeks) enables smooth execution of all feature sprints without infrastructure rework.

---

**Document Version:** 2.0.0
**Last Updated:** November 2024
**Next Review:** After Sprint 2.5 completion
