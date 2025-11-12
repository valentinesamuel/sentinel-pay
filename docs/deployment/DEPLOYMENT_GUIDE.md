# Deployment Guide - Payment Platform

**Version:** 1.0.0
**Last Updated:** January 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Deployment Environments](#deployment-environments)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Environment Configuration](#environment-configuration)
5. [Docker Deployment](#docker-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Database Migrations](#database-migrations)
8. [Monitoring & Health Checks](#monitoring--health-checks)
9. [Rollback Procedures](#rollback-procedures)
10. [Production Best Practices](#production-best-practices)

---

## Overview

This guide covers deploying the Payment Platform to various environments using Docker and CI/CD automation.

### Deployment Strategy

- **Development:** Local Docker Compose
- **Staging:** Docker Compose on staging server
- **Production:** Docker Compose (future: Kubernetes)

### Zero-Downtime Deployment

- Health checks ensure readiness
- Rolling updates (future with Kubernetes)
- Database migrations run before deployment
- Feature flags for gradual rollout (future)

---

## Deployment Environments

### Development

**Purpose:** Local development and testing
**Infrastructure:** Docker Compose on local machine
**Database:** PostgreSQL container
**Access:** localhost

```bash
docker-compose up -d
```

### Staging

**Purpose:** Pre-production testing
**Infrastructure:** Docker Compose on staging server
**Database:** PostgreSQL container (or managed service)
**Access:** staging.paymentplatform.com

```bash
docker-compose -f docker-compose.staging.yml up -d
```

### Production

**Purpose:** Live environment
**Infrastructure:** Docker Compose (or Kubernetes)
**Database:** Managed PostgreSQL (AWS RDS, etc.)
**Access:** api.paymentplatform.com

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage ≥ 80%
- [ ] No linter errors
- [ ] No security vulnerabilities (npm audit)
- [ ] Code reviewed and approved
- [ ] Branch merged to main/develop

### Configuration

- [ ] Environment variables configured
- [ ] Secrets encrypted and stored securely
- [ ] Database credentials rotated
- [ ] API keys generated
- [ ] SSL/TLS certificates installed
- [ ] Domain DNS configured

### Infrastructure

- [ ] Servers provisioned and configured
- [ ] Docker installed
- [ ] Network configured
- [ ] Firewall rules set
- [ ] Load balancer configured (if applicable)
- [ ] Monitoring tools installed

### Database

- [ ] Database backup completed
- [ ] Migration scripts tested
- [ ] Rollback plan prepared
- [ ] Connection pool configured
- [ ] Indexes optimized

### Security

- [ ] Security scan completed
- [ ] Penetration testing done (production)
- [ ] Access controls configured
- [ ] Audit logging enabled
- [ ] Encryption at rest enabled
- [ ] Encryption in transit enabled (TLS 1.3)

---

## Environment Configuration

### Production Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database (use managed service credentials)
DB_HOST=production-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=payment_user_prod
DB_PASSWORD=<SECURE_PASSWORD>
DB_DATABASE=payment_db_prod
DB_SSL=true
DB_POOL_MAX=50
DB_POOL_MIN=10

# Redis (use managed service)
REDIS_HOST=production-redis.xxxxx.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=<SECURE_PASSWORD>
REDIS_TLS=true

# JWT
JWT_SECRET=<SECURE_SECRET_MIN_32_CHARS>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=<SECURE_KEY_32_CHARS>

# External Services (Real providers)
PAYSTACK_SECRET_KEY=sk_live_xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxx

# MinIO (or S3)
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_PORT=443
MINIO_ACCESS_KEY=<AWS_ACCESS_KEY>
MINIO_SECRET_KEY=<AWS_SECRET_KEY>
MINIO_USE_SSL=true

# Email (use production SMTP)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=<SENDGRID_API_KEY>

# SMS
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# CORS
CORS_ORIGIN=https://app.paymentplatform.com,https://dashboard.paymentplatform.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### Secrets Management

**Do NOT store secrets in git!**

**Options:**
1. **Environment Variables:** Set on server
2. **Docker Secrets:** For Docker Swarm
3. **Kubernetes Secrets:** For K8s
4. **AWS Secrets Manager:** For AWS deployments
5. **HashiCorp Vault:** Enterprise secret management

**Example: AWS Secrets Manager**
```bash
# Store secret
aws secretsmanager create-secret \
  --name payment-platform/db-password \
  --secret-string "super-secure-password"

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id payment-platform/db-password \
  --query SecretString --output text
```

---

## Docker Deployment

### Production Docker Compose

**File:** `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  payment-api:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.api
      target: production
    image: payment-api:${VERSION:-latest}
    container_name: payment-api
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health/liveness"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - payment-network
    volumes:
      - ./logs:/app/logs
      - ./certs:/app/certs:ro
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  mock-providers:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.mock
      target: production
    image: mock-providers:${VERSION:-latest}
    container_name: mock-providers
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
    env_file:
      - .env.production
    networks:
      - payment-network

  postgres:
    image: postgres:15-alpine
    container_name: postgres-prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=en_US.UTF-8 --lc-ctype=en_US.UTF-8"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./infrastructure/docker/init-scripts:/docker-entrypoint-initdb.d
      - ./backups:/backups
    networks:
      - payment-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: redis-prod
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - payment-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./infrastructure/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - payment-api
    networks:
      - payment-network

networks:
  payment-network:
    driver: bridge

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
```

### Dockerfile (Production-Optimized)

**File:** `infrastructure/docker/Dockerfile.api`

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/payment-api/package*.json ./apps/payment-api/
COPY libs/*/package*.json ./libs/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build:payment-api

# Stage 2: Production
FROM node:20-alpine AS production

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p logs certs && chown -R nodejs:nodejs logs certs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health/liveness', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/apps/payment-api/main.js"]
```

### Build and Deploy

```bash
# 1. Build Docker images
docker-compose -f docker-compose.prod.yml build

# 2. Tag images with version
docker tag payment-api:latest payment-api:1.0.0

# 3. Push to registry (if using)
docker push payment-api:1.0.0

# 4. Deploy on server
ssh user@production-server
cd /opt/payment-platform
git pull origin main
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify deployment
docker-compose -f docker-compose.prod.yml ps
curl -f http://localhost:3000/api/health
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage

      - name: Security audit
        run: npm audit --audit-level=moderate

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Registry
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./infrastructure/docker/Dockerfile.api
          push: true
          tags: |
            payment-api:latest
            payment-api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/payment-platform
            git pull origin main
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker-compose -f docker-compose.prod.yml ps

      - name: Health check
        run: |
          sleep 30
          curl -f https://api.paymentplatform.com/api/health || exit 1

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production deployment completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Database Migrations

### Pre-Deployment Migration

```bash
# 1. Backup database
pg_dump -h production-db -U payment_user payment_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migration on staging
cd apps/payment-api
NODE_ENV=staging npm run migration:run

# 3. If successful, run on production
NODE_ENV=production npm run migration:run

# 4. Verify migration
psql -h production-db -U payment_user -d payment_db -c "\dt"
```

### Migration Best Practices

1. **Always Backup:** Before running migrations
2. **Test on Staging:** Run migrations on staging first
3. **Rollback Plan:** Have rollback scripts ready
4. **Monitor:** Watch application logs during migration
5. **Gradual Rollout:** Use feature flags for schema changes

### Rollback Migration

```bash
# Revert last migration
npm run migration:revert

# Restore from backup
psql -h production-db -U payment_user -d payment_db < backup_20240115_100000.sql
```

---

## Monitoring & Health Checks

### Health Check Endpoints

**Liveness Probe:** Is service alive?
```bash
curl http://localhost:3000/api/health/liveness
```

**Readiness Probe:** Is service ready to accept traffic?
```bash
curl http://localhost:3000/api/health/readiness
```

**Full Health Check:** Detailed health status
```bash
curl http://localhost:3000/api/health
```

### Monitoring Setup

**1. Application Logs**
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f payment-api

# Log aggregation (future)
# - ELK Stack (Elasticsearch, Logstash, Kibana)
# - Graylog
# - Splunk
```

**2. Metrics (Future)**
```yaml
# Prometheus metrics endpoint
GET /api/metrics

# Grafana dashboards for:
# - Request rate
# - Response time
# - Error rate
# - Database queries
# - Queue length
```

**3. Error Tracking**
```typescript
// Sentry integration
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Capture errors
Sentry.captureException(error);
```

**4. Uptime Monitoring**
- UptimeRobot
- Pingdom
- StatusCake

---

## Rollback Procedures

### Rollback Scenarios

#### 1. Application Rollback

```bash
# 1. Stop current version
docker-compose -f docker-compose.prod.yml down

# 2. Checkout previous version
git checkout <previous-commit-hash>

# 3. Build and deploy
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify rollback
curl http://localhost:3000/api/health
```

#### 2. Database Rollback

```bash
# 1. Stop application
docker-compose -f docker-compose.prod.yml stop payment-api

# 2. Revert migration
cd apps/payment-api
npm run migration:revert

# 3. Restart application
docker-compose -f docker-compose.prod.yml start payment-api

# Alternative: Restore from backup
psql -h production-db -U payment_user -d payment_db < backup.sql
```

#### 3. Configuration Rollback

```bash
# 1. Restore previous .env
cp .env.production.backup .env.production

# 2. Restart services
docker-compose -f docker-compose.prod.yml restart
```

---

## Production Best Practices

### Security

1. **Use HTTPS:** SSL/TLS certificates (Let's Encrypt)
2. **Firewall:** Only expose necessary ports
3. **SSH Keys:** Disable password authentication
4. **Regular Updates:** Keep dependencies updated
5. **Security Headers:** helmet middleware
6. **Rate Limiting:** Prevent abuse
7. **Input Validation:** Sanitize all inputs

### Performance

1. **Connection Pooling:** Database and Redis
2. **Caching:** Redis for hot data
3. **CDN:** Static assets (future)
4. **Load Balancing:** Distribute traffic
5. **Horizontal Scaling:** Multiple instances
6. **Database Indexes:** Optimize queries

### Reliability

1. **Health Checks:** Automated monitoring
2. **Graceful Shutdown:** Handle SIGTERM
3. **Circuit Breakers:** Prevent cascading failures
4. **Retry Logic:** Exponential backoff
5. **Backup Strategy:** Automated daily backups
6. **Disaster Recovery:** Documented procedures

### Monitoring

1. **Application Logs:** Structured logging
2. **Error Tracking:** Sentry integration
3. **Metrics:** Prometheus + Grafana
4. **Alerts:** PagerDuty, Opsgenie
5. **Uptime Monitoring:** External checks

---

## Production Deployment Checklist

### Before Deployment

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Database backup completed
- [ ] Migration tested on staging
- [ ] Rollback plan prepared
- [ ] Monitoring configured
- [ ] Team notified

### During Deployment

- [ ] Announce maintenance window (if downtime)
- [ ] Run database migrations
- [ ] Deploy application
- [ ] Verify health checks
- [ ] Smoke test critical paths
- [ ] Monitor error rates
- [ ] Check response times

### After Deployment

- [ ] Full integration test
- [ ] Monitor for 30 minutes
- [ ] Review error logs
- [ ] Verify metrics
- [ ] Update documentation
- [ ] Notify team of completion
- [ ] Post-mortem (if issues)

---

## Emergency Procedures

### Service Down

```bash
# 1. Check service status
docker-compose -f docker-compose.prod.yml ps

# 2. Check logs
docker-compose -f docker-compose.prod.yml logs payment-api

# 3. Restart service
docker-compose -f docker-compose.prod.yml restart payment-api

# 4. If persists, rollback
# Follow rollback procedures above
```

### Database Issues

```bash
# 1. Check connections
psql -h production-db -U payment_user -d payment_db -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Check locks
psql -h production-db -U payment_user -d payment_db -c "SELECT * FROM pg_locks WHERE NOT granted;"

# 3. Restart if needed
docker-compose -f docker-compose.prod.yml restart postgres
```

### High Memory Usage

```bash
# 1. Check memory
docker stats

# 2. Restart service
docker-compose -f docker-compose.prod.yml restart payment-api

# 3. If persists, investigate memory leak
# - Check logs for errors
# - Review recent code changes
# - Profile application
```

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Next Review:** After first production deployment
