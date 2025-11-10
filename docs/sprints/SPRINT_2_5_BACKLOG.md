# Sprint 2.5: API Rate Limiting & Quota Management

**Sprint Goal:** Implement comprehensive API rate limiting infrastructure to protect against abuse, ensure fair resource allocation, and provide clear quota feedback to consumers.

**Duration:** 1 week (7 days)
**Story Points:** 28 SP
**Team:** 2-3 Backend Engineers + 1 DevOps
**Dependencies:** Sprint 2 (User authentication & API key management)
**Blocks:** Sprints 5-6 (Payment APIs need rate limiting)

---

## User Stories

### US-2.5.1: Fixed-Window Rate Limiting (8 SP)

**Title:** Implement fixed-window rate limiting for authenticated users

**Description:**
Implement a fixed-window rate limiting algorithm that tracks API request counts per user within defined time windows (1 minute, 1 hour, 24 hours). Unauthenticated requests are limited per IP address.

**Acceptance Criteria:**
1. Rate limits enforced at 1-minute, 1-hour, and 24-hour windows
2. Separate limits for authenticated users vs. anonymous requests
3. Authenticated users identified via JWT or API key
4. Anonymous requests identified by IP address (with X-Forwarded-For support for proxies)
5. Limits configurable per endpoint (default: 100/min, 1000/hour, 10000/24h for users)
6. Anonymous limits lower: 10/min, 100/hour, 1000/24h
7. Rate limit tracking stored in Redis with TTL matching window duration
8. Support for distributed rate limiting (shared Redis across multiple instances)
9. No database writes for rate limiting (Redis only, minimal latency)
10. Rate limit counters reset automatically when TTL expires
11. Support for burst handling (allow exceeding limit briefly if within burst quota)
12. HTTP 429 Too Many Requests response when limits exceeded
13. Rate limit info included in response headers (X-RateLimit-*)
14. Warm-up period for new users (first 100 requests exempt from hourly limits)

**Technical Specs:**
```typescript
// Rate limit tiers per endpoint
interface RateLimitConfig {
  endpoint: string;
  authenticated: {
    perMinute: number;
    perHour: number;
    per24Hours: number;
  };
  anonymous: {
    perMinute: number;
    perHour: number;
    per24Hours: number;
  };
  burstAllowance: number; // % over limit allowed temporarily
  warmupPeriodDays: number;
}

// Response headers on success
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1699545660  // Unix timestamp when counter resets

// Response on limit exceeded
HTTP 429 Too Many Requests
{
  "error": "rate_limit_exceeded",
  "message": "You have exceeded the rate limit of 100 requests per minute",
  "retryAfter": 28,  // seconds until next request allowed
  "limits": {
    "minute": { "limit": 100, "remaining": 0, "reset": "2024-11-10T14:31:00Z" },
    "hour": { "limit": 1000, "remaining": 342, "reset": "2024-11-10T15:30:00Z" },
    "day": { "limit": 10000, "remaining": 7234, "reset": "2024-11-11T14:30:00Z" }
  }
}
```

**Database Schema Changes:** None (Redis only)

**Service Layer:**
```
RateLimitService
├── checkRateLimit(userId, endpoint, ipAddress) → Promise<RateLimitResult>
├── incrementCounter(key, windows) → Promise<void>
├── getRemainingQuota(userId, endpoint) → Promise<QuotaInfo>
├── resetUserQuota(userId) → Promise<void> [admin]
├── getGlobalStats() → Promise<GlobalStats>
└── configureEndpointLimit(endpoint, config) → Promise<void> [admin]
```

**Estimated Effort:** 8 SP
- Implementation: 4 SP (Redis integration, window logic, distributed tracing)
- Testing: 2 SP (quota testing, edge cases, distributed scenarios)
- Documentation: 1 SP
- Monitoring setup: 1 SP

---

### US-2.5.2: Sliding-Window Rate Limiting with Token Bucket (8 SP)

**Title:** Implement sliding-window and token bucket algorithms for flexibility

**Description:**
Implement alternative rate limiting algorithms (sliding window and token bucket) to handle burst traffic more gracefully and provide fairer resource allocation compared to fixed windows.

**Acceptance Criteria:**
1. Sliding-window algorithm using sorted sets in Redis
2. Token bucket algorithm for smooth rate limiting over time
3. Per-endpoint configuration to choose algorithm type
4. Token bucket support for burst allowance (bucket size > per-second rate)
5. Tokens regenerate at configured rate (e.g., 100 tokens/min = 1.67/sec)
6. Sliding window calculation using request timestamps
7. Atomic increment/decrement operations (Lua scripts in Redis)
8. Support for different refill rates per time period
9. Burst capacity configurable (2x, 3x, 5x normal rate)
10. Efficient cleanup of expired window data
11. Algorithm selection per endpoint (fixed window vs. sliding vs. token bucket)
12. Ability to switch algorithms without losing quota state
13. Test with various traffic patterns (constant, bursty, uneven)
14. Document algorithm choice guidance for endpoint owners

**Technical Specs:**
```typescript
// Sliding window tracking
// Store: SORTED_SET(userId:endpoint:window) with score = timestamp
// Size of set = request count within window
// Cleanup: Remove entries older than window duration

// Token bucket implementation
interface TokenBucket {
  capacity: number;           // max tokens
  currentTokens: number;      // tokens available
  refillRate: number;         // tokens/second
  lastRefillTime: number;     // Unix timestamp
}

// Example: 100 req/min = 1.67 tokens/sec, capacity 250 (2.5x burst)
// User with 50 tokens can make 50 requests immediately
// After 30 seconds: 50 + (30 * 1.67) = ~100 tokens available
```

**Estimated Effort:** 8 SP
- Algorithm implementation: 3 SP (sliding window, token bucket, Lua scripts)
- Testing: 3 SP (burst scenarios, fairness, edge cases)
- Comparison testing: 2 SP (vs. fixed window, performance)

---

### US-2.5.3: Rate Limit Tiers & Premium Access (7 SP)

**Title:** Support different rate limit tiers based on user subscription/plan

**Description:**
Allow different users to have different rate limits based on their subscription tier (free, standard, premium, enterprise). Enterprise users with custom limits get individual configuration.

**Acceptance Criteria:**
1. Map user subscription tier to rate limit tier
2. Free tier: 100/min, 1000/hour, 10k/day
3. Standard tier: 500/min, 5000/hour, 50k/day
4. Premium tier: 2000/min, 20000/hour, 200k/day
5. Enterprise tier: Custom configurable limits per customer
6. API key-based rate limits (separate from user limits)
7. API keys inherit user tier limits or have custom limits
8. Tier change takes effect immediately (pro-rata quota reset)
9. Downgrade applies new limits after 24-hour grace period
10. Upgrade applies new limits immediately
11. Track tier usage statistics (how many requests per tier)
12. Support for tiered pricing based on API usage
13. Rate limit override capability for specific users (whitelist)
14. Beta feature flag: elevated limits for beta testers
15. Grace period before hard limit (can go 10% over temporarily)

**Database Schema Changes:**
```sql
ALTER TABLE users ADD COLUMN rate_limit_tier VARCHAR(50) DEFAULT 'free';

CREATE TABLE rate_limit_tiers (
  id UUID PRIMARY KEY,
  tier_name VARCHAR(100) NOT NULL UNIQUE,
  requests_per_minute INT NOT NULL,
  requests_per_hour INT NOT NULL,
  requests_per_day INT NOT NULL,
  burst_allowance_percent INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rate_limit_overrides (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  tier_override VARCHAR(100),
  custom_limits JSONB,  -- { "perMinute": 1000, "perHour": 10000 }
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP,
  reason VARCHAR(255),
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_key_limits (
  id UUID PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES api_keys(id),
  user_id UUID NOT NULL,
  custom_limits JSONB,  -- null = inherit from user tier
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rate_limit_overrides_user_valid ON rate_limit_overrides(user_id, valid_from, valid_until);
CREATE INDEX idx_api_key_limits_api_key ON api_key_limits(api_key_id);
```

**Service Layer Enhancement:**
```
RateLimitService (additions)
├── getUserLimitTier(userId) → RateLimitTier
├── getApiKeyLimits(apiKeyId) → RateLimitTier
├── applyRateLimitOverride(userId, override) → Promise<void> [admin]
├── removeRateLimitOverride(userId) → Promise<void> [admin]
├── handleTierUpgrade(userId, newTier) → Promise<void>
├── handleTierDowngrade(userId, newTier, gracePeriod) → Promise<void>
├── getTierStats() → Promise<TierUsageStats>
└── resetOverrideQuota(userId, reason) → Promise<void> [support]
```

**Estimated Effort:** 7 SP
- Schema & migrations: 1 SP
- Tier lookup logic: 1.5 SP
- Override management: 1.5 SP
- Testing & validation: 2 SP
- Documentation: 1 SP

---

### US-2.5.4: Rate Limit Observability & Analytics (5 SP)

**Title:** Monitor rate limiting metrics and provide usage analytics

**Description:**
Track rate limiting metrics to identify abuse patterns, monitor system health, and provide visibility into API usage across the platform.

**Acceptance Criteria:**
1. Track total requests, rate-limited requests, and abuse patterns
2. Prometheus metrics for Grafana dashboards
3. Alerts for sudden spike in rate limit rejections (>20% of traffic)
4. Per-endpoint rate limit violation metrics
5. Per-tier usage statistics (free tier abuse detection)
6. IP-based attack detection (same IP hitting rate limit repeatedly)
7. User-based abuse detection (single user hitting limits excessively)
8. Geographic distribution of rate-limited requests
9. Rate limit metrics available via admin API
10. Time-series data stored (daily aggregates for 90 days)
11. Real-time dashboard showing top rate-limited IPs/users
12. Alerting integration (Slack, PagerDuty)
13. Auto-temporary ban for IPs with >1000 violations/hour
14. Manual ban capability for IPs/users

**Metrics to Track:**
```
api_requests_total{endpoint, user_id, tier, status}
api_rate_limit_exceeded_total{endpoint, tier, reason}
api_rate_limit_remaining{endpoint, user_id}
api_request_latency_seconds{endpoint, percentile}
```

**Estimated Effort:** 5 SP
- Prometheus integration: 1.5 SP
- Metric collection: 1 SP
- Dashboard setup: 1 SP
- Alerting & detection: 1.5 SP

---

## Implementation Notes

### Algorithm Selection Guidance

**Fixed-Window (Best for):**
- Simple, predictable limits
- Most endpoints
- Easy to understand for users
- Lower computational overhead

**Sliding-Window (Best for):**
- Critical endpoints (payments)
- When fairness across time is important
- Prevents end-of-window burst attacks

**Token-Bucket (Best for):**
- Burst-friendly endpoints
- File uploads, batch operations
- When you want to reward "good citizens"

### Configuration Example

```yaml
# config/rate-limits.yml
endpoints:
  POST /api/v1/auth/login:
    algorithm: fixed-window
    authenticated:
      perMinute: 100
      perHour: 1000
      per24Hours: 10000
    anonymous:
      perMinute: 5
      perHour: 50
      per24Hours: 500

  POST /api/v1/payments/card/initialize:
    algorithm: sliding-window  # Fairness for payments
    authenticated:
      perMinute: 50
      perHour: 500
    anonymous: disabled  # Require authentication

  POST /api/v1/transfers/batch:
    algorithm: token-bucket  # Allow bursts
    burstCapacity: 2.5x
    tokensPerSecond: 10
```

### Redis Key Design

```
rate_limit:{algorithm}:{userId|ipAddress}:{endpoint}:{window}
  - Reduces collisions
  - Easy to expire by window
  - Supports pattern-based cleanup

Example keys:
  rate_limit:fixed:user_123:POST_/api/v1/auth/login:minute
  rate_limit:sliding:ip_192.168.1.1:POST_/api/v1/payments:window
  rate_limit:token:user_123:POST_/api/v1/transfers/batch
```

### Implementation Middleware

Rate limiting should be implemented as:
1. Guard decorator (NestJS) for individual endpoints
2. Global middleware for blanket limits
3. Custom decorators for endpoint-specific limits
4. Integration with API Gateway for pre-filtering

---

## Success Criteria

- [ ] All fixed-window endpoints return correct X-RateLimit-* headers
- [ ] Sliding-window prevents end-of-window burst attacks
- [ ] Token bucket allows legitimate bursts without abuse
- [ ] Rate limit rejections: <1% of legitimate traffic
- [ ] False positives for abuse detection: <0.5%
- [ ] Rate limit check latency: <5ms (p99)
- [ ] Supports 1000+ concurrent users with accurate counting
- [ ] Tier-based limits correctly applied per subscription
- [ ] Monitoring alerts trigger within 2 minutes of abuse pattern
- [ ] Documentation complete with examples and guidelines

---

## Dependencies & Blockers

**Depends On:**
- ✅ Sprint 2: User authentication & API keys
- ✅ Sprint 1: Redis infrastructure

**Blocks:**
- Sprint 5: Payment APIs (need rate limiting configured)
- Sprint 6: Withdrawal APIs (need rate limiting configured)
- Sprint 7: Webhook APIs (need rate limiting configured)
- Sprint 40: POS APIs (need rate limiting configured)

**External Dependencies:**
- Redis cluster (shared, minimal latency required)
- Prometheus (metrics collection)
- Slack/PagerDuty (alerting)

---

## Technical Architecture

### Request Flow with Rate Limiting

```
1. HTTP Request arrives
2. Extract user ID (from JWT) OR IP address
3. Look up user's rate limit tier (cached)
4. Apply rate limiting check (Redis)
   - Increment counter for 1-min, 1-hour, 24-hour windows
   - Check if any window exceeded
5. If exceeded:
   - Return 429 with Retry-After header
   - Log for abuse detection
6. If allowed:
   - Add X-RateLimit-* headers to response
   - Continue to endpoint handler
7. On response, update metrics (Prometheus)
```

### Rate Limit State Machine

```
State: ALLOWED
├─ Remaining quota in current window
└─ X-RateLimit-Remaining: N > 0

State: WARNING (80% of limit)
├─ Still allow requests
└─ X-RateLimit-Remaining: N < 0.2 * Limit

State: RATE_LIMITED
├─ Reject request with 429
├─ Provide Retry-After header
└─ Return current quota info
```

---

## Files to Create

1. `src/modules/rate-limiting/rate-limit.service.ts` - Core service
2. `src/modules/rate-limiting/rate-limit.guard.ts` - NestJS guard
3. `src/modules/rate-limiting/rate-limit.decorator.ts` - Decorators
4. `src/modules/rate-limiting/algorithms/` - Algorithm implementations
5. `src/modules/rate-limiting/config/rate-limits.yml` - Configuration
6. `src/modules/rate-limiting/monitoring/` - Metrics & alerts
7. `src/database/migrations/` - Database schema updates
8. `tests/rate-limiting/` - Comprehensive test suite

---

## Rollout Strategy

**Phase 1 (Day 1-2):** Fixed-window for all endpoints
**Phase 2 (Day 3-4):** Sliding-window for payment endpoints
**Phase 3 (Day 5):** Token bucket for batch operations
**Phase 4 (Day 6-7):** Monitoring & alerting, tier-based limits

---

## Appendix: Rate Limit Reference

| Tier | Per Minute | Per Hour | Per Day | Burst |
|------|-----------|---------|---------|-------|
| Anonymous | 10 | 100 | 1,000 | 1.1x |
| Free | 100 | 1,000 | 10,000 | 1.2x |
| Standard | 500 | 5,000 | 50,000 | 1.5x |
| Premium | 2,000 | 20,000 | 200,000 | 2.0x |
| Enterprise | Custom | Custom | Custom | Custom |
