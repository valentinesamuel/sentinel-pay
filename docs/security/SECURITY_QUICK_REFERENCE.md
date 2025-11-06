# 🔒 Security Implementation Quick Reference

Quick pseudo-code reference for remaining security features (7-17).

---

## 7. Query Protection

```typescript
// PSEUDO CODE

// Interceptor to validate query parameters
class QueryProtectionInterceptor {
  function intercept(context, next) {
    request = context.switchToHttp().getRequest()

    // 1. Limit pagination
    if (request.query.limit) {
      limit = parseInt(request.query.limit)
      if (limit > 100) {
        throw Error('Limit cannot exceed 100')
      }
    }

    // 2. Validate date ranges
    if (request.query.startDate && request.query.endDate) {
      start = new Date(request.query.startDate)
      end = new Date(request.query.endDate)
      daysDiff = (end - start) / (1000 * 60 * 60 * 24)

      if (daysDiff > 90) {
        throw Error('Date range cannot exceed 90 days')
      }
    }

    // 3. Prevent expensive sorts
    if (request.query.sortBy) {
      allowedSortFields = ['createdAt', 'amount', 'status']
      if (!allowedSortFields.includes(request.query.sortBy)) {
        throw Error('Invalid sort field')
      }
    }

    return next.handle()
  }
}

// Repository with timeout
class TransactionRepository {
  async function findWithTimeout(query) {
    // Set statement timeout (5 seconds)
    await db.query('SET statement_timeout = 5000')

    try {
      results = await query.getMany()
      return results
    } finally {
      await db.query('SET statement_timeout = 0')
    }
  }
}
```

---

## 8. Memory & Resource Limits

```typescript
// PSEUDO CODE

// main.ts
async function bootstrap() {
  app = createApp()

  // Request size limits
  app.use(bodyParser.json({limit: '1mb'}))
  app.use(bodyParser.urlencoded({extended: true, limit: '1mb'}))

  // Request timeout
  app.use(timeout('30s'))

  // Query string size limit
  app.use((req, res, next) => {
    if (req.url.length > 2048) {
      return res.status(414).json({error: 'URI too long'})
    }
    next()
  })

  await app.listen(3000)
}
```

```yaml
# docker-compose.yml
services:
  payment-api:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

## 9. Webhook Signature Verification

```typescript
// PSEUDO CODE

// Guard to verify webhook signatures
class WebhookSignatureGuard {
  function canActivate(context) {
    request = context.switchToHttp().getRequest()

    // Get signature from header
    signature = request.headers['x-webhook-signature']
    if (!signature) {
      throw Error('Missing webhook signature')
    }

    // Get provider
    provider = request.headers['x-webhook-provider']
    secret = getWebhookSecret(provider)

    // Compute expected signature
    payload = JSON.stringify(request.body)
    expectedSignature = hmacSHA256(payload, secret)

    // Constant-time comparison (prevent timing attacks)
    if (!timingSafeEqual(signature, expectedSignature)) {
      throw Error('Invalid webhook signature')
    }

    // Verify timestamp (prevent replay attacks)
    timestamp = request.headers['x-webhook-timestamp']
    age = Date.now() - parseInt(timestamp)

    if (age > 5 * 60 * 1000) {  // 5 minutes
      throw Error('Webhook too old')
    }

    return true
  }
}

// Sending webhooks with signature
class WebhookSender {
  async function sendWebhook(url, event, secret) {
    payload = JSON.stringify(event)
    timestamp = Date.now().toString()

    // Generate signature
    signature = hmacSHA256(payload + timestamp, secret)

    await httpPost(url, event, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': timestamp,
        'X-Webhook-Event': event.type
      }
    })
  }
}
```

---

## 10. Transaction Signing

```typescript
// PSEUDO CODE

// Utility to sign transactions
class TransactionSigning {
  function sign(transaction, secret) {
    // Create signature payload
    payload = [
      transaction.id,
      transaction.userId,
      transaction.amount,
      transaction.currency,
      transaction.createdAt.toISOString()
    ].join('|')

    // Generate HMAC signature
    return hmacSHA256(payload, secret)
  }

  function verify(transaction, signature, secret) {
    expectedSignature = this.sign(transaction, secret)

    // Constant-time comparison
    return timingSafeEqual(signature, expectedSignature)
  }
}

// Entity with automatic signing
@Entity()
class Transaction {
  @Column()
  id: string

  @Column()
  amount: number

  @Column()
  signature: string

  @BeforeInsert()
  @BeforeUpdate()
  function generateSignature() {
    this.signature = transactionSigning.sign(this, TRANSACTION_SECRET)
  }

  function verifyIntegrity() {
    return transactionSigning.verify(this, this.signature, TRANSACTION_SECRET)
  }
}

// Middleware to verify transaction integrity
class TransactionIntegrityGuard {
  function canActivate(context) {
    request = context.switchToHttp().getRequest()
    transactionId = request.params.id

    transaction = await findTransaction(transactionId)

    if (!transaction.verifyIntegrity()) {
      logSecurityEvent('TRANSACTION_TAMPERING_DETECTED', {
        transactionId: transaction.id
      })
      throw Error('Transaction integrity violation')
    }

    return true
  }
}
```

---

## 11. Docker Security Hardening

```dockerfile
# PSEUDO CODE

# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS production

# Install dumb-init (proper signal handling)
RUN apk add --no-cache dumb-init

# Security updates
RUN apk upgrade --no-cache

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy files as nodejs user
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main.js"]
```

```yaml
# docker-compose.yml with security options
services:
  payment-api:
    security_opt:
      - no-new-privileges:true  # Prevent privilege escalation
    cap_drop:
      - ALL  # Drop all capabilities
    cap_add:
      - NET_BIND_SERVICE  # Only allow binding to ports
    read_only: true  # Read-only filesystem
    tmpfs:
      - /tmp  # Writable temp directory
    user: "1001:1001"  # Run as non-root
```

---

## 12. Network Isolation

```yaml
# PSEUDO CODE

# docker-compose.yml with network isolation
version: '3.8'

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No internet access
  database:
    driver: bridge
    internal: true  # No internet access

services:
  payment-api:
    networks:
      - frontend  # Accepts external requests
      - backend   # Talks to internal services
      - database  # Accesses database

  postgres:
    networks:
      - database  # Only accessible from database network

  redis:
    networks:
      - backend  # Only accessible from backend network

  mock-providers:
    networks:
      - backend  # Internal only
```

---

## 13. Secrets Rotation

```typescript
// PSEUDO CODE

// Service to manage secret rotation
class SecretsRotationService {
  currentSecrets = new Map()
  previousSecrets = new Map()

  async function rotateSecret(key, newValue) {
    // Keep previous version
    current = this.currentSecrets.get(key)
    if (current) {
      this.previousSecrets.set(key, current)
    }

    // Update to new secret
    this.currentSecrets.set(key, newValue)

    // Schedule cleanup (24 hour grace period)
    setTimeout(() => {
      this.previousSecrets.delete(key)
    }, 24 * 60 * 60 * 1000)

    // Log rotation
    logSecurityEvent('SECRET_ROTATED', {key})
  }

  function get(key) {
    return this.currentSecrets.get(key)
  }

  function getPrevious(key) {
    return this.previousSecrets.get(key)
  }

  async function verify(key, value) {
    current = this.currentSecrets.get(key)
    previous = this.previousSecrets.get(key)

    // Accept both during grace period
    return value === current || value === previous
  }
}

// JWT verification with rotation support
class AuthService {
  async function verifyToken(token) {
    try {
      // Try current secret
      return jwt.verify(token, secretsService.get('JWT_SECRET'))
    } catch (error) {
      // Try previous secret (during rotation)
      try {
        return jwt.verify(token, secretsService.getPrevious('JWT_SECRET'))
      } catch (e) {
        throw new Error('Invalid token')
      }
    }
  }
}

// Automated rotation (monthly)
@Cron('0 0 1 * *')  // First day of month
async function rotateJWTSecret() {
  newSecret = generateRandomString(64)
  await secretsService.rotateSecret('JWT_SECRET', newSecret)

  logSecurityEvent('JWT_SECRET_ROTATED')
}
```

---

## 14. Geo-Blocking

```typescript
// PSEUDO CODE

// Download MaxMind GeoLite2 database (free)
// https://dev.maxmind.com/geoip/geolite2-free-geolocation-data

class GeoBlockingGuard {
  geoipReader = null

  async function initialize() {
    this.geoipReader = await loadGeoIPDatabase('./data/GeoLite2-Country.mmdb')
  }

  async function canActivate(context) {
    request = context.switchToHttp().getRequest()

    // Get client IP
    ip = getClientIP(request)

    // Check IP blacklist
    if (await isIPBlacklisted(ip)) {
      logSecurityEvent('BLACKLISTED_IP_ACCESS', {ip})
      throw Error('Access denied')
    }

    // Get country from IP
    geoData = this.geoipReader.get(ip)
    country = geoData?.country?.iso_code

    // Blocked countries
    blockedCountries = ['KP', 'IR', 'SY']  // North Korea, Iran, Syria

    if (blockedCountries.includes(country)) {
      logSecurityEvent('BLOCKED_COUNTRY_ACCESS', {country, ip})
      throw Error('Access denied from your location')
    }

    // Optional: Whitelist mode
    allowedCountries = ['NG', 'US', 'GB', 'KE', 'GH']
    if (allowedCountries.length > 0 && !allowedCountries.includes(country)) {
      throw Error('Service not available in your location')
    }

    return true
  }

  function getClientIP(request) {
    // Handle proxies
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress
    )
  }

  async function blacklistIP(ip, durationSeconds) {
    await redis.setex(`ip-blacklist:${ip}`, durationSeconds, 'blocked')
  }

  async function isIPBlacklisted(ip) {
    return await redis.exists(`ip-blacklist:${ip}`)
  }
}
```

---

## 15. Health Checks

```typescript
// PSEUDO CODE

@Controller('health')
class HealthController {

  @Get()
  async function healthCheck() {
    checks = await runHealthChecks([
      // Database
      () => checkDatabase(),

      // Redis
      () => checkRedis(),

      // Memory
      () => checkMemoryUsage(),

      // Disk
      () => checkDiskSpace(),

      // External services
      () => checkMockProviders()
    ])

    allHealthy = checks.every(c => c.status === 'ok')

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: checks
    }
  }

  async function checkDatabase() {
    try {
      await db.query('SELECT 1')
      return {name: 'database', status: 'ok'}
    } catch (error) {
      return {name: 'database', status: 'error', message: error.message}
    }
  }

  async function checkRedis() {
    try {
      await redis.ping()
      return {name: 'redis', status: 'ok'}
    } catch (error) {
      return {name: 'redis', status: 'error', message: error.message}
    }
  }

  async function checkMemoryUsage() {
    memoryUsage = process.memoryUsage()
    heapUsed = memoryUsage.heapUsed
    heapLimit = 150 * 1024 * 1024  // 150MB

    return {
      name: 'memory',
      status: heapUsed < heapLimit ? 'ok' : 'warning',
      heapUsed: heapUsed,
      heapLimit: heapLimit
    }
  }

  async function checkDiskSpace() {
    diskUsage = await getDiskUsage()
    threshold = 0.9  // 90%

    return {
      name: 'disk',
      status: diskUsage < threshold ? 'ok' : 'warning',
      usage: diskUsage
    }
  }

  // Kubernetes readiness probe
  @Get('ready')
  async function readiness() {
    // Check if ready to receive traffic
    databaseReady = await checkDatabase()
    redisReady = await checkRedis()

    if (databaseReady.status === 'ok' && redisReady.status === 'ok') {
      return {status: 'ready'}
    } else {
      throw new ServiceUnavailableException('Not ready')
    }
  }

  // Kubernetes liveness probe
  @Get('live')
  function liveness() {
    // Basic check that process is alive
    return {status: 'alive'}
  }
}
```

---

## 16. Graceful Shutdown

```typescript
// PSEUDO CODE

// main.ts
async function bootstrap() {
  app = await createApp()

  // Enable shutdown hooks
  app.enableShutdownHooks()

  // Handle SIGTERM (from Kubernetes/Docker)
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, starting graceful shutdown...')

    // 1. Stop accepting new requests
    await app.close()

    // 2. Wait for in-flight requests (max 30s)
    await waitForInFlightRequests(30000)

    // 3. Close database connections
    await closeDatabase()

    // 4. Close Redis connections
    await closeRedis()

    // 5. Flush logs
    await flushLogs()

    console.log('Graceful shutdown complete')
    process.exit(0)
  })

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down...')
    await app.close()
    process.exit(0)
  })

  await app.listen(3000)
}

// Service cleanup on shutdown
@Injectable()
class DatabaseService implements OnApplicationShutdown {
  async function onApplicationShutdown(signal) {
    console.log(`Closing database connections... (${signal})`)

    // Close connection pool
    await this.dataSource.destroy()

    console.log('Database connections closed')
  }
}

@Injectable()
class QueueService implements OnApplicationShutdown {
  async function onApplicationShutdown(signal) {
    console.log(`Stopping queue workers... (${signal})`)

    // Stop processing new jobs
    await this.queue.pause()

    // Wait for current jobs to complete (max 30s)
    await this.queue.waitForJobsToComplete(30000)

    // Close queue connection
    await this.queue.close()

    console.log('Queue workers stopped')
  }
}
```

---

## 17. WAF Rules (Mock)

```typescript
// PSEUDO CODE

// Guard to implement WAF-like filtering
class WAFGuard {

  function canActivate(context) {
    request = context.switchToHttp().getRequest()

    // Get all inputs to check
    inputs = [
      request.url,
      JSON.stringify(request.query),
      JSON.stringify(request.body),
      JSON.stringify(request.headers)
    ]

    // Run all checks
    for each input in inputs {
      // 1. SQL Injection
      if (detectSQLInjection(input)) {
        logAndBlock('SQL_INJECTION_ATTEMPT', request)
      }

      // 2. XSS
      if (detectXSS(input)) {
        logAndBlock('XSS_ATTEMPT', request)
      }

      // 3. Path Traversal
      if (detectPathTraversal(input)) {
        logAndBlock('PATH_TRAVERSAL_ATTEMPT', request)
      }

      // 4. Command Injection
      if (detectCommandInjection(input)) {
        logAndBlock('COMMAND_INJECTION_ATTEMPT', request)
      }

      // 5. LDAP Injection
      if (detectLDAPInjection(input)) {
        logAndBlock('LDAP_INJECTION_ATTEMPT', request)
      }
    }

    return true
  }

  function detectSQLInjection(input) {
    sqlPatterns = [
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bSELECT\b.*\bFROM\b)/i,
      /(\bINSERT\b.*\bINTO\b)/i,
      /(\bUPDATE\b.*\bSET\b)/i,
      /(\bDELETE\b.*\bFROM\b)/i,
      /(\bDROP\b.*\bTABLE\b)/i,
      /(;|\-\-|\/\*|\*\/|xp_)/i,
      /(\bOR\b.*=.*)/i,
      /(\bAND\b.*=.*)/i
    ]

    return sqlPatterns.some(pattern => pattern.test(input))
  }

  function detectXSS(input) {
    xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,  // Event handlers
      /<iframe/i,
      /<embed/i,
      /<object/i,
      /eval\(/i,
      /expression\(/i
    ]

    return xssPatterns.some(pattern => pattern.test(input))
  }

  function detectPathTraversal(input) {
    pathPatterns = [
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e%2f/i,
      /%2e%2e\\/i,
      /\.\.%2f/i
    ]

    return pathPatterns.some(pattern => pattern.test(input))
  }

  function detectCommandInjection(input) {
    commandPatterns = [
      /;|\||&|`|\$\(/,
      /\bwget\b|\bcurl\b/i,
      /\bcat\b|\bls\b/i,
      />/,  // Redirection
    ]

    return commandPatterns.some(pattern => pattern.test(input))
  }

  function detectLDAPInjection(input) {
    ldapPatterns = [
      /\*\)/,
      /\|\|/,
      /&&/
    ]

    return ldapPatterns.some(pattern => pattern.test(input))
  }

  function logAndBlock(attackType, request) {
    logSecurityEvent(attackType, {
      ip: getClientIP(request),
      userAgent: request.headers['user-agent'],
      url: request.url,
      method: request.method,
      body: request.body
    })

    // Auto-blacklist IP
    blacklistIP(getClientIP(request), 86400)  // 24 hours

    throw new ForbiddenException('Malicious request detected')
  }
}

// Apply globally
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: WAFGuard
    }
  ]
})
class AppModule {}
```

---

## Security Testing Checklist

```typescript
// PSEUDO CODE

// Comprehensive security test suite
describe('Security Test Suite', () => {

  // 1. Encryption
  test('sensitive fields are encrypted in database')
  test('database connection uses SSL')
  test('Redis connection uses password')
  test('files are encrypted at rest')

  // 2. Access Control
  test('RLS prevents unauthorized data access')
  test('users cannot access others transactions')
  test('signed URLs expire correctly')
  test('webhook signatures are verified')

  // 3. Input Validation
  test('SQL injection is blocked')
  test('XSS attempts are blocked')
  test('malicious files are rejected')
  test('oversized requests are rejected')
  test('path traversal is prevented')

  // 4. Resource Protection
  test('query timeouts are enforced')
  test('connection pool limits work')
  test('memory limits are enforced')
  test('request size limits work')

  // 5. Authentication
  test('weak passwords are rejected')
  test('brute force is prevented')
  test('sessions expire correctly')
  test('tokens are validated')

  // 6. Monitoring
  test('security events are logged')
  test('failed attempts are tracked')
  test('suspicious patterns trigger alerts')

  // 7. Infrastructure
  test('containers run as non-root')
  test('network isolation works')
  test('health checks respond')
  test('graceful shutdown works')
})
```

---

## Quick Implementation Priority

### Week 1: Critical Security (Must Have)
1. Field-level encryption
2. Database SSL
3. Redis password
4. File upload validation
5. Webhook signatures

### Week 2: High Priority
6. Transaction signing
7. Row-level security
8. Query protection
9. Docker hardening
10. Health checks

### Week 3: Medium Priority
11. Memory limits
12. Network isolation
13. Graceful shutdown
14. WAF rules

### Week 4: Nice to Have
15. Geo-blocking
16. Secrets rotation
17. Advanced monitoring

---

## Common Pitfalls to Avoid

1. ❌ **Don't store secrets in code**
   - ✅ Use environment variables
   - ✅ Use secrets manager in production

2. ❌ **Don't trust client input**
   - ✅ Validate everything server-side
   - ✅ Sanitize all inputs

3. ❌ **Don't log sensitive data**
   - ✅ Mask passwords, tokens, card numbers
   - ✅ Hash PII before logging

4. ❌ **Don't use weak encryption**
   - ✅ Use AES-256-GCM
   - ✅ Use bcrypt for passwords (12+ rounds)

5. ❌ **Don't forget error handling**
   - ✅ Catch all errors
   - ✅ Return generic error messages

6. ❌ **Don't skip security updates**
   - ✅ Run `npm audit` regularly
   - ✅ Update dependencies monthly

---

**End of Quick Reference Guide**
