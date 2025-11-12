# Sprint 2.5: API Rate Limiting - Implementation Tickets

---

## TICKET-2.5-001: Redis Rate Limit Key Schema & Utilities

**Story:** US-2.5.1
**Points:** 3 SP
**Priority:** CRITICAL
**Assignee:** Backend Engineer 1

**Description:**
Create Redis key schema utilities and helper functions for consistent key generation, TTL management, and atomic operations.

**Acceptance Criteria:**
- [ ] RateLimitKeyBuilder service generates consistent keys
- [ ] Support for all window types (minute, hour, day)
- [ ] TTL values correctly set per window (60s, 3600s, 86400s)
- [ ] Helper for user ID → user-level keys
- [ ] Helper for IP address → IP-level keys
- [ ] Helper for API key → key-level limits
- [ ] Lua scripts for atomic Redis operations
- [ ] Test with various userId formats (UUID, email, API key)

**Implementation:**

```typescript
// src/modules/rate-limiting/rate-limit-keys.util.ts

export class RateLimitKeyBuilder {
  private readonly prefix = 'rate_limit';

  /**
   * Generate Redis key for rate limit counter
   * Pattern: rate_limit:{algorithm}:{identifier}:{endpoint}:{window}
   */
  buildKey(
    algorithm: 'fixed' | 'sliding' | 'token',
    identifier: string,  // userId, ipAddress, or apiKeyId
    endpoint: string,    // e.g., 'POST_/api/v1/auth/login'
    window: 'minute' | 'hour' | 'day'
  ): string {
    return `${this.prefix}:${algorithm}:${identifier}:${endpoint}:${window}`;
  }

  buildUserKey(userId: string, endpoint: string, window: 'minute' | 'hour' | 'day'): string {
    return this.buildKey('fixed', `user_${userId}`, endpoint, window);
  }

  buildIpKey(ipAddress: string, endpoint: string, window: 'minute' | 'hour' | 'day'): string {
    const normalizedIp = ipAddress.replace(/[^0-9a-f:.]/g, '');
    return this.buildKey('fixed', `ip_${normalizedIp}`, endpoint, window);
  }

  buildApiKeyKey(apiKeyId: string, endpoint: string, window: 'minute' | 'hour' | 'day'): string {
    return this.buildKey('fixed', `key_${apiKeyId}`, endpoint, window);
  }

  /**
   * Get TTL in seconds for window type
   */
  getTTL(window: 'minute' | 'hour' | 'day'): number {
    const ttls = { minute: 60, hour: 3600, day: 86400 };
    return ttls[window];
  }

  /**
   * Generate endpoint key from HTTP method and path
   * POST /api/v1/auth/login → POST_/api/v1/auth/login
   */
  encodeEndpoint(method: string, path: string): string {
    return `${method}_${path}`;
  }

  /**
   * Get pattern for cleanup (all windows for a user/endpoint)
   */
  getCleanupPattern(identifier: string, endpoint: string): string {
    return `${this.prefix}:*:${identifier}:${endpoint}:*`;
  }
}

/**
 * Lua script for atomic increment + TTL
 * Returns [newCount, ttl]
 */
export const RATE_LIMIT_INCREMENT_SCRIPT = `
redis.call('incr', KEYS[1])
redis.call('expire', KEYS[1], ARGV[1])
return redis.call('ttl', KEYS[1])
`;

/**
 * Lua script for atomic check (get count without incrementing)
 * Returns count or -1 if key doesn't exist
 */
export const RATE_LIMIT_CHECK_SCRIPT = `
return redis.call('get', KEYS[1]) or 0
`;
```

**Files to Create:**
- `src/modules/rate-limiting/utils/rate-limit-keys.util.ts`
- `src/modules/rate-limiting/utils/redis-scripts.ts`
- `tests/rate-limiting/rate-limit-keys.util.spec.ts`

**Dependencies:**
- Redis client library (ioredis)
- NestJS

**Testing Strategy:**
- Unit tests for all key format variations
- Test with special characters in URLs
- Test TTL precision
- Test Lua script atomicity with concurrent requests

---

## TICKET-2.5-002: RateLimitService Core Implementation

**Story:** US-2.5.1, US-2.5.2
**Points:** 5 SP
**Priority:** CRITICAL
**Assignee:** Backend Engineer 1

**Description:**
Implement core RateLimitService with fixed-window and sliding-window algorithms, Redis integration, and quota tracking.

**Acceptance Criteria:**
- [ ] checkRateLimit() returns detailed quota info
- [ ] Fixed-window algorithm correctly counts requests per window
- [ ] Sliding-window algorithm prevents end-of-window spikes
- [ ] Redis operations are atomic and distributed-safe
- [ ] Rate limit info returned in response object
- [ ] Support for multiple windows (minute, hour, day) in parallel
- [ ] Handles user tier lookup and applies correct limits
- [ ] Handles API key lookup and applies correct limits
- [ ] IP address extraction with X-Forwarded-For support
- [ ] Test with 1000+ concurrent requests

**Implementation:**

```typescript
// src/modules/rate-limiting/rate-limit.service.ts

export interface RateLimitInfo {
  allowed: boolean;
  remaining: Record<'minute' | 'hour' | 'day', number>;
  limits: Record<'minute' | 'hour' | 'day', number>;
  resetTimes: Record<'minute' | 'hour' | 'day', Date>;
  retryAfter?: number; // seconds
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(
    private readonly redis: Redis,
    private readonly userService: UserService,
    private readonly apiKeyService: ApiKeyService,
    private readonly keyBuilder: RateLimitKeyBuilder,
    @Inject('RATE_LIMIT_CONFIG') private config: RateLimitConfig,
  ) {}

  /**
   * Main rate limit check - returns whether request is allowed
   */
  async checkRateLimit(
    identifier: { userId?: string; apiKeyId?: string; ipAddress?: string },
    endpoint: string,
    method: string,
  ): Promise<RateLimitInfo> {
    const endpointKey = this.keyBuilder.encodeEndpoint(method, endpoint);
    const limits = await this.getLimitsForIdentifier(identifier);

    const windows: Array<'minute' | 'hour' | 'day'> = ['minute', 'hour', 'day'];
    const info: RateLimitInfo = {
      allowed: true,
      remaining: {} as any,
      limits: {} as any,
      resetTimes: {} as any,
    };

    for (const window of windows) {
      const { key, limit, ttl } = this.buildRateLimitKey(identifier, endpointKey, window, limits);

      const count = await this.incrementAndGetCount(key, ttl);
      const remaining = Math.max(0, limit - count);

      info.remaining[window] = remaining;
      info.limits[window] = limit;
      info.resetTimes[window] = new Date(Date.now() + ttl * 1000);

      if (count > limit) {
        info.allowed = false;
        info.retryAfter = ttl; // Conservative estimate
      }
    }

    // Log rate limit violations
    if (!info.allowed) {
      this.logger.warn(
        `Rate limit exceeded: ${JSON.stringify(identifier)} on ${endpoint}`,
        { info, endpoint },
      );
    }

    return info;
  }

  /**
   * Get rate limit tier for a user/API key
   */
  private async getLimitsForIdentifier(
    identifier: { userId?: string; apiKeyId?: string; ipAddress?: string },
  ): Promise<RateLimitTier> {
    // Check for API key limits first (most specific)
    if (identifier.apiKeyId) {
      const keyLimits = await this.apiKeyService.getRateLimitTier(identifier.apiKeyId);
      if (keyLimits) return keyLimits;
    }

    // Check for user tier
    if (identifier.userId) {
      // Check for overrides first
      const override = await this.getUserRateLimitOverride(identifier.userId);
      if (override) return override;

      const user = await this.userService.findById(identifier.userId);
      return this.config.tiers[user.rateLimitTier] || this.config.tiers['free'];
    }

    // Default to anonymous tier (IP-based)
    return this.config.tiers['anonymous'];
  }

  /**
   * Increment counter atomically and return new count
   */
  private async incrementAndGetCount(key: string, ttl: number): Promise<number> {
    const script = `
      redis.call('incr', KEYS[1])
      redis.call('expire', KEYS[1], ARGV[1])
      return tonumber(redis.call('get', KEYS[1]))
    `;

    const result = await this.redis.eval(script, 1, key, ttl);
    return result as number;
  }

  /**
   * Get remaining quota without incrementing
   */
  async getRemainingQuota(
    identifier: { userId?: string; apiKeyId?: string; ipAddress?: string },
    endpoint: string,
  ): Promise<RateLimitInfo> {
    const limits = await this.getLimitsForIdentifier(identifier);
    const windows: Array<'minute' | 'hour' | 'day'> = ['minute', 'hour', 'day'];
    const info: RateLimitInfo = {
      allowed: true,
      remaining: {} as any,
      limits: {} as any,
      resetTimes: {} as any,
    };

    for (const window of windows) {
      const { key, limit, ttl } = this.buildRateLimitKey(identifier, endpoint, window, limits);
      const count = await this.redis.get(key);
      const remaining = Math.max(0, limit - (parseInt(count) || 0));

      info.remaining[window] = remaining;
      info.limits[window] = limit;
      info.resetTimes[window] = new Date(Date.now() + ttl * 1000);
    }

    return info;
  }

  /**
   * Reset user's rate limit quota (admin/support action)
   */
  async resetUserQuota(userId: string): Promise<void> {
    const pattern = this.keyBuilder.getCleanupPattern(`user_${userId}`, '*');
    const keys = await this.redis.keys(pattern);

    if (keys.length > 0) {
      await this.redis.del(...keys);
      this.logger.log(`Reset quota for user ${userId} (${keys.length} keys deleted)`);
    }
  }

  /**
   * Build rate limit key with tier-specific limits
   */
  private buildRateLimitKey(
    identifier: any,
    endpoint: string,
    window: 'minute' | 'hour' | 'day',
    limits: RateLimitTier,
  ): { key: string; limit: number; ttl: number } {
    const identifierKey = this.getIdentifierKey(identifier);
    const key = this.keyBuilder.buildKey('fixed', identifierKey, endpoint, window);
    const limit = limits[`requestsPer${this.capitalize(window)}`];
    const ttl = this.keyBuilder.getTTL(window);

    return { key, limit, ttl };
  }

  private getIdentifierKey(identifier: any): string {
    if (identifier.apiKeyId) return `key_${identifier.apiKeyId}`;
    if (identifier.userId) return `user_${identifier.userId}`;
    return `ip_${identifier.ipAddress}`;
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /**
   * Get rate limit override for user (if any)
   */
  private async getUserRateLimitOverride(userId: string): Promise<RateLimitTier | null> {
    // This would be cached with short TTL (5 minutes)
    return await this.redis.getex(`override:${userId}`, 'EX', 300);
  }
}
```

**Files to Create:**
- `src/modules/rate-limiting/rate-limit.service.ts`
- `tests/rate-limiting/rate-limit.service.spec.ts`

**Dependencies:**
- TICKET-2.5-001 (completed)
- UserService (from Sprint 2)
- ApiKeyService (from Sprint 2)

**Testing Strategy:**
- Unit tests for each window (minute, hour, day)
- Concurrent request simulation (1000+ requests)
- Tier lookup verification
- Override application
- TTL expiration behavior

---

## TICKET-2.5-003: NestJS Rate Limit Guard & Decorator

**Story:** US-2.5.1
**Points:** 4 SP
**Priority:** CRITICAL
**Assignee:** Backend Engineer 1

**Description:**
Create NestJS guard for automatic rate limiting and decorator for per-endpoint configuration. Implement middleware for response header injection.

**Acceptance Criteria:**
- [ ] @RateLimit() decorator configures limits per endpoint
- [ ] RateLimitGuard enforces limits before handler execution
- [ ] 429 response with correct headers and body
- [ ] X-RateLimit-* headers added to all responses (success and failure)
- [ ] Retry-After header calculated correctly
- [ ] IP address extraction works with proxies (X-Forwarded-For)
- [ ] Works with JWT and API key authentication
- [ ] Global guard applies default limits to all endpoints
- [ ] Can override default limits per endpoint
- [ ] Test with mixed authenticated/anonymous traffic

**Implementation:**

```typescript
// src/modules/rate-limiting/rate-limit.guard.ts

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get endpoint identifier
    const method = request.method;
    const endpoint = request.path;

    // Get user/API key/IP identifier
    const identifier = this.extractIdentifier(request);

    // Check rate limit
    const rateLimitInfo = await this.rateLimitService.checkRateLimit(identifier, endpoint, method);

    // Add rate limit headers to response
    this.addRateLimitHeaders(response, rateLimitInfo);

    if (!rateLimitInfo.allowed) {
      throw new TooManyRequestsException({
        error: 'rate_limit_exceeded',
        message: `You have exceeded your rate limit for ${endpoint}`,
        retryAfter: rateLimitInfo.retryAfter,
        limits: {
          minute: { limit: rateLimitInfo.limits.minute, remaining: rateLimitInfo.remaining.minute },
          hour: { limit: rateLimitInfo.limits.hour, remaining: rateLimitInfo.remaining.hour },
          day: { limit: rateLimitInfo.limits.day, remaining: rateLimitInfo.remaining.day },
        },
      });
    }

    return true;
  }

  /**
   * Extract identifier (user, API key, or IP address)
   */
  private extractIdentifier(request: any): { userId?: string; apiKeyId?: string; ipAddress?: string } {
    // User from JWT
    if (request.user?.id) {
      return { userId: request.user.id };
    }

    // API key from header
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      return { apiKeyId: apiKey };
    }

    // IP address (with proxy support)
    const ipAddress = request.headers['x-forwarded-for']?.split(',')[0] || request.ip;
    return { ipAddress };
  }

  /**
   * Add rate limit info to response headers
   */
  private addRateLimitHeaders(response: any, info: RateLimitInfo): void {
    response.setHeader('X-RateLimit-Limit', info.limits.minute);
    response.setHeader('X-RateLimit-Remaining', info.remaining.minute);
    response.setHeader('X-RateLimit-Reset', Math.floor(info.resetTimes.minute.getTime() / 1000));

    if (info.retryAfter) {
      response.setHeader('Retry-After', info.retryAfter);
    }
  }
}

// src/modules/rate-limiting/rate-limit.decorator.ts

export interface RateLimitOptions {
  windowMs?: number;
  max?: number; // requests per window
  message?: string;
  statusCode?: number;
  skip?: (req: any) => boolean;
}

export function RateLimit(options: RateLimitOptions = {}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('rateLimit:options', options, descriptor.value);
    return descriptor;
  };
}
```

**Files to Create:**
- `src/modules/rate-limiting/rate-limit.guard.ts`
- `src/modules/rate-limiting/rate-limit.decorator.ts`
- `tests/rate-limiting/rate-limit.guard.spec.ts`

**Dependencies:**
- TICKET-2.5-002 (RateLimitService)
- NestJS common exceptions

**Testing Strategy:**
- Test with JWT authentication
- Test with API key
- Test with IP address
- Test header generation
- Test 429 response format

---

## TICKET-2.5-004: Rate Limit Tiers & Configuration Management

**Story:** US-2.5.3
**Points:** 3 SP
**Priority:** HIGH
**Assignee:** Backend Engineer 2

**Description:**
Implement database schema for rate limit tiers, overrides, and API key limits. Create management APIs for admin/support operations.

**Acceptance Criteria:**
- [ ] Create rate_limit_tiers table
- [ ] Create rate_limit_overrides table
- [ ] Create api_key_limits table
- [ ] Tier lookup by user works correctly
- [ ] Override lookup returns most specific limit
- [ ] API key limit override works
- [ ] Tier change pro-rata handling
- [ ] Grace period for tier downgrades
- [ ] Test with 1000+ overrides

**Database Schema:**

```sql
-- Rate limit tier definitions
CREATE TABLE rate_limit_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name VARCHAR(100) NOT NULL UNIQUE,
  requests_per_minute INT NOT NULL,
  requests_per_hour INT NOT NULL,
  requests_per_day INT NOT NULL,
  burst_allowance_percent INT DEFAULT 10,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User tier overrides (most specific)
CREATE TABLE rate_limit_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier_override VARCHAR(100),  -- null = use custom limits
  custom_limits JSONB,  -- { "perMinute": 500, "perHour": 5000, "perDay": 50000 }
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP,
  reason VARCHAR(255),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API key specific limits
CREATE TABLE api_key_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  custom_limits JSONB,  -- null = inherit from user tier
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rate limit usage history (time-series for analytics)
CREATE TABLE rate_limit_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  api_key_id UUID REFERENCES api_keys(id),
  ip_address INET,
  endpoint VARCHAR(255),
  requests_count INT,
  limit_exceeded BOOLEAN,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_rate_limit_overrides_user_valid ON rate_limit_overrides(user_id, valid_from, valid_until);
CREATE INDEX idx_rate_limit_overrides_user_active ON rate_limit_overrides(user_id) WHERE valid_until IS NULL;
CREATE INDEX idx_api_key_limits_api_key ON api_key_limits(api_key_id);
CREATE INDEX idx_api_key_limits_user ON api_key_limits(user_id);
CREATE INDEX idx_rate_limit_usage_recorded ON rate_limit_usage(recorded_at DESC);
CREATE INDEX idx_rate_limit_usage_user ON rate_limit_usage(user_id, recorded_at DESC);

-- Insert default tiers
INSERT INTO rate_limit_tiers (tier_name, requests_per_minute, requests_per_hour, requests_per_day, burst_allowance_percent, description)
VALUES
  ('anonymous', 10, 100, 1000, 10, 'Unauthenticated requests'),
  ('free', 100, 1000, 10000, 20, 'Free tier users'),
  ('standard', 500, 5000, 50000, 50, 'Standard subscription users'),
  ('premium', 2000, 20000, 200000, 100, 'Premium subscription users'),
  ('enterprise', 10000, 100000, 1000000, 200, 'Enterprise customers');
```

**Files to Create:**
- `src/database/migrations/create-rate-limit-tables.ts`
- `src/modules/rate-limiting/entities/rate-limit-tier.entity.ts`
- `src/modules/rate-limiting/entities/rate-limit-override.entity.ts`
- `src/modules/rate-limiting/rate-limit-management.service.ts`

**Dependencies:**
- TypeORM
- Database connection

**Testing Strategy:**
- Test tier creation
- Test override creation/update/delete
- Test tier assignment to users
- Test override validity windows
- Test cascading deletes

---

## TICKET-2.5-005: Monitoring, Metrics & Alerting

**Story:** US-2.5.4
**Points:** 4 SP
**Priority:** HIGH
**Assignee:** DevOps Engineer

**Description:**
Set up Prometheus metrics for rate limiting, create Grafana dashboards, and configure alerting for abuse patterns.

**Acceptance Criteria:**
- [ ] Prometheus metrics collect rate limit events
- [ ] Per-endpoint rate limit violation metrics
- [ ] Per-tier usage statistics
- [ ] Geographic distribution tracking (IP-based)
- [ ] Grafana dashboard shows real-time metrics
- [ ] Alert for >20% rate limit rejection rate
- [ ] Alert for IP-based attack patterns (>1000 violations/hour)
- [ ] Alert for tier-based abuse detection
- [ ] Manual ban capability for IPs/users
- [ ] Dashboard updated every 10 seconds

**Metrics to Implement:**

```typescript
// src/modules/rate-limiting/metrics/rate-limit.metrics.ts

@Injectable()
export class RateLimitMetrics {
  private readonly requestsTotal: Counter<string>;
  private readonly rateLimitExceededTotal: Counter<string>;
  private readonly remainingQuota: Gauge<string>;
  private readonly requestLatency: Histogram<string>;

  constructor(private readonly register: Registry) {
    // Total requests by endpoint, tier, status
    this.requestsTotal = new Counter({
      name: 'api_requests_total',
      help: 'Total API requests',
      labelNames: ['method', 'endpoint', 'tier', 'status'],
      registers: [register],
    });

    // Rate limited requests
    this.rateLimitExceededTotal = new Counter({
      name: 'api_rate_limit_exceeded_total',
      help: 'Total rate limit rejections',
      labelNames: ['endpoint', 'tier', 'window'],
      registers: [register],
    });

    // Remaining quota (gauge)
    this.remainingQuota = new Gauge({
      name: 'api_rate_limit_remaining',
      help: 'Remaining requests in current window',
      labelNames: ['user_id', 'endpoint', 'window'],
      registers: [register],
    });

    // Request latency
    this.requestLatency = new Histogram({
      name: 'api_request_duration_seconds',
      help: 'API request latency',
      labelNames: ['method', 'endpoint'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [register],
    });
  }

  recordRequest(method: string, endpoint: string, tier: string, status: number, duration: number): void {
    this.requestsTotal.labels(method, endpoint, tier, status).inc();
    this.requestLatency.labels(method, endpoint).observe(duration / 1000);
  }

  recordRateLimitExceeded(endpoint: string, tier: string, window: string): void {
    this.rateLimitExceededTotal.labels(endpoint, tier, window).inc();
  }

  setRemainingQuota(userId: string, endpoint: string, window: string, remaining: number): void {
    this.remainingQuota.labels(userId, endpoint, window).set(remaining);
  }
}
```

**Grafana Dashboard Panels:**
1. Rate limit rejections over time
2. Requests per tier (pie chart)
3. Top rate-limited endpoints
4. Top rate-limited users/IPs
5. Request latency by endpoint
6. Rate limit tier distribution

**Alerting Rules:**

```yaml
# prometheus-rules.yml
groups:
  - name: rate-limiting
    rules:
      - alert: HighRateLimitRejectionRate
        expr: |
          (increase(api_rate_limit_exceeded_total[5m]) /
           increase(api_requests_total[5m])) > 0.2
        for: 2m
        annotations:
          summary: "High rate limit rejection rate"

      - alert: PossibleDDoSAttack
        expr: |
          increase(api_rate_limit_exceeded_total{tier="anonymous"}[1h]) > 1000
        for: 1m
        annotations:
          summary: "Possible DDoS attack detected"
```

**Files to Create:**
- `src/modules/rate-limiting/metrics/rate-limit.metrics.ts`
- `src/modules/rate-limiting/monitoring/rate-limit.interceptor.ts`
- `dashboards/rate-limiting-dashboard.json`
- `prometheus/rate-limiting-rules.yml`

**Dependencies:**
- prom-client (Prometheus)
- Grafana
- Prometheus server

---

## TICKET-2.5-006: Rate Limit Integration Tests

**Story:** US-2.5.1, US-2.5.2, US-2.5.3, US-2.5.4
**Points:** 4 SP
**Priority:** HIGH
**Assignee:** QA Engineer

**Description:**
Comprehensive integration tests for rate limiting across all endpoints, algorithms, and edge cases.

**Acceptance Criteria:**
- [ ] Test fixed-window with various endpoint configurations
- [ ] Test sliding-window prevents burst attacks
- [ ] Test token bucket with legitimate bursts
- [ ] Test tier-based limits for free/standard/premium
- [ ] Test API key specific limits
- [ ] Test IP address extraction with proxies
- [ ] Test concurrent requests (1000+ simultaneous)
- [ ] Test TTL expiration and counter reset
- [ ] Test override application
- [ ] Test rate limit bypass with whitelist
- [ ] Test grace period for tier downgrades
- [ ] Load test with realistic traffic patterns

**Test Scenarios:**

```typescript
// tests/rate-limiting/rate-limiting.integration.spec.ts

describe('Rate Limiting Integration Tests', () => {
  describe('Fixed-Window Algorithm', () => {
    it('should reject requests after limit exceeded', async () => {
      // Make 101 requests to endpoint with limit of 100/min
      for (let i = 0; i < 100; i++) {
        const res = await request(app.getHttpServer()).get('/api/v1/auth/login').expect(200);
        expect(res.headers['x-ratelimit-remaining']).toBe(100 - i - 1);
      }

      const res = await request(app.getHttpServer()).get('/api/v1/auth/login');
      expect(res.status).toBe(429);
      expect(res.body.error).toBe('rate_limit_exceeded');
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle 1000 concurrent requests correctly', async () => {
      const promises = Array(1000).fill(null).map(() =>
        request(app.getHttpServer()).get('/api/v1/auth/login')
      );

      const results = await Promise.all(promises);
      const allowed = results.filter(r => r.status === 200).length;
      const limited = results.filter(r => r.status === 429).length;

      expect(allowed).toBe(100); // limit per minute
      expect(limited).toBe(900);
    });
  });

  describe('Tier-Based Limits', () => {
    it('should apply premium tier limits to premium users', async () => {
      // Premium user has 2000 req/min
      const user = await createPremiumUser();
      const token = await generateToken(user);

      for (let i = 0; i < 2000; i++) {
        await request(app.getHttpServer())
          .get('/api/v1/payments')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      }

      // 2001st request should fail
      await request(app.getHttpServer())
        .get('/api/v1/payments')
        .set('Authorization', `Bearer ${token}`)
        .expect(429);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should return correct rate limit headers', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/health');

      expect(res.headers['x-ratelimit-limit']).toBeDefined();
      expect(res.headers['x-ratelimit-remaining']).toBeDefined();
      expect(res.headers['x-ratelimit-reset']).toBeDefined();
    });
  });
});
```

**Files to Create:**
- `tests/rate-limiting/rate-limiting.integration.spec.ts`
- `tests/rate-limiting/concurrent-requests.spec.ts`
- `tests/rate-limiting/tier-limits.spec.ts`

---

## Additional Implementation Details

### Configuration Example

```yaml
# config/rate-limits.production.yml
defaultLimits:
  authenticated:
    perMinute: 100
    perHour: 1000
    per24Hours: 10000
  anonymous:
    perMinute: 10
    perHour: 100
    per24Hours: 1000

endpoints:
  POST /api/v1/auth/login:
    authenticated:
      perMinute: 10
      perHour: 100
    anonymous:
      perMinute: 5
      perHour: 50

  POST /api/v1/payments/card/initialize:
    authenticated:
      perMinute: 50
      perHour: 500
    anonymous: disabled

  POST /api/v1/transfers/batch:
    algorithm: token-bucket
    perSecond: 10
    burstCapacity: 100
```

### Deployment Checklist

- [ ] Redis cluster configured and tested
- [ ] Prometheus scraping configured
- [ ] Grafana dashboard created
- [ ] Alert channels configured (Slack, PagerDuty)
- [ ] Rate limit configuration deployed
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on alert response
