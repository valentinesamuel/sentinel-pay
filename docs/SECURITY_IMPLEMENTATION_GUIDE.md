# Security Implementation Guide
**Platform:** Ubiquitous Tribble Payment Platform
**Last Updated:** 2025-11-08

---

## Overview

This guide provides step-by-step instructions for implementing the four critical security components:
1. Penetration Testing
2. Vulnerability Scanning
3. WAF/DDoS Protection
4. SIEM Monitoring

Each section includes both **free/DIY options** and **professional paid services**.

---

## 1. Penetration Testing

### What It Is
Security experts attempt to hack your system to find vulnerabilities before real attackers do.

### Option A: Professional Pentest Services (RECOMMENDED)
**Best for:** Production systems, compliance requirements

#### Recommended Providers

**1. Nigerian/African Providers:**
```yaml
NovaGuard Security (Nigeria):
  - Website: novaguardsecurity.com
  - Cost: ₦2M - ₦5M (~$2,500 - $6,000)
  - Services: Web app, API, infrastructure testing
  - Turnaround: 2-3 weeks
  - Deliverable: Detailed report + remediation guidance

CyberSafe Foundation (Nigeria):
  - Focus: Nigerian companies
  - Cost: ₦1.5M - ₦4M (~$1,800 - $5,000)

Layer 3 Security (South Africa):
  - Regional expertise
  - Cost: $3,000 - $8,000
```

**2. International Providers:**
```yaml
Cobalt.io:
  - Modern pentest platform
  - Cost: $15,000 - $30,000
  - Features: Pentest-as-a-Service (PTaaS)
  - Platform: cobalt.io
  - Best for: Continuous testing

Synack:
  - Crowdsourced security testing
  - Cost: $10,000 - $25,000
  - Vetted researchers

Bishop Fox:
  - Enterprise-grade
  - Cost: $20,000 - $50,000
  - Best for: Comprehensive assessment
```

**3. Budget-Friendly Options:**
```yaml
Bugcrowd (Bug Bounty):
  - Pay only for valid bugs found
  - Setup: $5,000 - $10,000
  - Rewards: $100 - $10,000 per bug
  - Platform: bugcrowd.com

HackerOne:
  - Similar to Bugcrowd
  - Start with private program
  - Cost: Based on findings
```

#### How to Engage a Pentest Provider

**Step 1: Define Scope**
```markdown
Example Scope Document:
- Target: api.ubiquitous-tribble.com
- Environment: Staging (pre-production)
- In scope:
  * Authentication/authorization
  * Payment processing APIs
  * Wallet management
  * Admin dashboard
  * Database interactions
- Out of scope:
  * Production environment
  * Social engineering
  * Physical security
  * DoS attacks
- Testing type: Black box, gray box, white box
- Timeline: 2-3 weeks
- Budget: $15,000
```

**Step 2: Get Quotes**
```bash
# Contact 3-5 providers with your scope document
# Compare:
- Cost
- Timeline
- Methodology (OWASP, PTES, etc.)
- Deliverables (report format, remediation support)
- Certifications (OSCP, CEH, etc.)
```

**Step 3: Legal & NDA**
```yaml
Requirements:
  - Non-Disclosure Agreement (NDA)
  - Rules of Engagement document
  - Testing authorization letter
  - Emergency contact procedures
```

**Step 4: Remediation**
```yaml
After receiving report:
  1. Prioritize findings (Critical > High > Medium > Low)
  2. Fix critical vulnerabilities first
  3. Request retest for critical issues
  4. Document fixes
  5. Update security practices
```

---

### Option B: DIY/Free Pentest Tools
**Best for:** Pre-production testing, continuous security

#### Tools You Can Use Now (FREE)

**1. OWASP ZAP (Zed Attack Proxy)**
```bash
# Installation
docker pull zaproxy/zap-stable

# Run automated scan
docker run -t zaproxy/zap-stable zap-baseline.py \
  -t https://staging-api.ubiquitous-tribble.com

# Full scan with authentication
docker run -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable \
  zap-full-scan.py -t https://staging-api.ubiquitous-tribble.com \
  -J zap-report.json
```

**Features:**
- Automated vulnerability scanning
- OWASP Top 10 coverage
- API testing support
- Free & open-source
- CI/CD integration

**2. Burp Suite Community Edition**
```yaml
Download: portswigger.net/burp/communitydownload
Cost: FREE (Professional: $449/year)

Features:
  - Intercept HTTP/HTTPS traffic
  - Manual testing tools
  - Vulnerability scanner (Pro only)
  - Great for API testing

Usage:
  1. Configure browser proxy
  2. Intercept requests to your API
  3. Manipulate requests to test security
  4. Check for SQL injection, XSS, etc.
```

**3. Nikto Web Scanner**
```bash
# Installation
apt-get install nikto

# Basic scan
nikto -h https://staging-api.ubiquitous-tribble.com

# Comprehensive scan
nikto -h https://staging-api.ubiquitous-tribble.com \
  -Tuning 123bde -Format html -output nikto-report.html
```

**4. Nuclei (Modern Vulnerability Scanner)**
```bash
# Installation
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

# Run scan with all templates
nuclei -u https://staging-api.ubiquitous-tribble.com

# Specific checks
nuclei -u https://staging-api.ubiquitous-tribble.com \
  -t cves/ -t vulnerabilities/ -severity critical,high
```

**5. SQLMap (SQL Injection Testing)**
```bash
# Installation
apt-get install sqlmap

# Test endpoint for SQL injection
sqlmap -u "https://api.example.com/users?id=1" --batch --risk=3

# Test with authentication
sqlmap -u "https://api.example.com/transactions" \
  --headers="Authorization: Bearer YOUR_TOKEN" \
  --batch
```

#### DIY Pentest Workflow

```yaml
Weekly Automated Scans:
  - Run OWASP ZAP baseline scan
  - Run Nuclei with latest templates
  - Check results and file bugs

Monthly Manual Testing:
  - Use Burp Suite for deep API testing
  - Test authentication/authorization
  - Check business logic flaws
  - Test payment flows

Before Major Releases:
  - Full scan with all tools
  - Manual testing of new features
  - Review findings with team
```

---

## 2. Vulnerability Scanning (Automated)

### What It Is
Continuous automated scanning for known vulnerabilities in code, dependencies, and infrastructure.

### Free/Open Source Solutions ✅ RECOMMENDED

#### A. Dependency Scanning

**1. Snyk (FREE for Open Source)**
```bash
# Installation
npm install -g snyk

# Authenticate
snyk auth

# Scan project
cd /path/to/your/project
snyk test

# Fix vulnerabilities automatically
snyk fix

# Monitor continuously (requires account)
snyk monitor

# CI/CD Integration
# Add to .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Pricing:**
- Free tier: Unlimited tests for open source
- Team: $52/month for private repos
- Business: $189/month (compliance features)

**2. npm audit (Built-in, FREE)**
```bash
# Check for vulnerabilities
npm audit

# Auto-fix
npm audit fix

# Force fix (may break things)
npm audit fix --force

# CI/CD Integration
npm audit --audit-level=high
```

**3. OWASP Dependency-Check (FREE)**
```bash
# Installation
wget https://github.com/jeremylong/DependencyCheck/releases/download/v8.4.0/dependency-check-8.4.0-release.zip
unzip dependency-check-8.4.0-release.zip

# Scan project
./dependency-check/bin/dependency-check.sh \
  --project "Ubiquitous Tribble" \
  --scan /path/to/your/project \
  --format HTML \
  --out reports/

# Docker usage
docker run --rm -v $(pwd):/src owasp/dependency-check:latest \
  --scan /src --format HTML --out /src/reports
```

#### B. Code Quality & Security (SAST)

**1. SonarQube Community (FREE)**
```bash
# Run with Docker
docker run -d --name sonarqube \
  -p 9000:9000 \
  sonarqube:community

# Install scanner
npm install -g sonarqube-scanner

# Configure sonar-project.properties
cat > sonar-project.properties <<EOF
sonar.projectKey=ubiquitous-tribble
sonar.projectName=Ubiquitous Tribble
sonar.sources=src
sonar.host.url=http://localhost:9000
sonar.login=YOUR_TOKEN
EOF

# Run scan
sonar-scanner

# View results at http://localhost:9000
```

**Features:**
- Code smells detection
- Security hotspots
- Code coverage
- Duplicate code detection
- Technical debt tracking

**2. ESLint Security Plugin (FREE)**
```bash
# Installation
npm install --save-dev eslint-plugin-security

# Add to .eslintrc.js
module.exports = {
  plugins: ['security'],
  extends: ['plugin:security/recommended'],
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
  },
};

# Run
npm run lint
```

#### C. Container Scanning

**1. Trivy (FREE)**
```bash
# Installation
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Scan Docker image
trivy image your-image:tag

# Scan filesystem
trivy fs /path/to/project

# CI/CD Integration
trivy image --severity HIGH,CRITICAL your-image:tag
```

**2. Docker Scan (FREE)**
```bash
# Built into Docker Desktop
docker scan your-image:tag

# Or use Snyk integration
docker scan --dependency-tree your-image:tag
```

#### D. Complete CI/CD Pipeline

```yaml
# .github/workflows/security-scan.yml
name: Security Scans

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: npm audit
        run: npm audit --audit-level=moderate

      - name: Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

      - name: ESLint Security
        run: |
          npm ci
          npm run lint

  container-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build image
        run: docker build -t ubiquitous-tribble:${{ github.sha }} .

      - name: Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ubiquitous-tribble:${{ github.sha }}
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

  sast-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: auto
```

**Cost:** $0 (all tools are free)

---

## 3. WAF & DDoS Protection

### What It Is
Web Application Firewall filters malicious traffic. DDoS protection handles large-scale attacks.

### Option A: Cloudflare (RECOMMENDED - Best Value)

**Cloudflare Pricing:**
```yaml
Free Plan: $0/month
  - Basic DDoS protection (L3/L4)
  - CDN (caching)
  - SSL/TLS encryption
  - Limited rate limiting
  - Good for: Development/early stage

Pro Plan: $20/month
  - Enhanced DDoS protection
  - Web Application Firewall (WAF)
  - Advanced caching
  - Image optimization
  - Good for: Small production

Business Plan: $200/month
  - Advanced WAF rules
  - Custom SSL certificates
  - 100% uptime SLA
  - Priority support
  - Good for: Growing business

Enterprise: Custom pricing ($5,000+/month)
  - Full DDoS protection (all layers)
  - Custom WAF rules
  - Dedicated support
  - Advanced analytics
  - Good for: Large-scale operations
```

#### Setup Guide (Cloudflare)

**Step 1: Create Account**
```bash
# Sign up at cloudflare.com
# Add your domain: ubiquitous-tribble.com
```

**Step 2: Update DNS**
```yaml
# Cloudflare will provide nameservers like:
nameserver1: amos.ns.cloudflare.com
nameserver2: faith.ns.cloudflare.com

# Update at your domain registrar (e.g., Namecheap, GoDaddy)
# Wait 24-48 hours for propagation
```

**Step 3: Configure WAF Rules**
```yaml
# In Cloudflare dashboard: Security > WAF

Managed Rules:
  - Enable "Cloudflare Managed Ruleset"
  - Enable "Cloudflare OWASP Core Ruleset"
  - Enable "Cloudflare Exposed Credentials Check"

Custom Rules (examples):
  1. Block bad bots:
     Expression: (cf.client.bot)
     Action: Block

  2. Rate limit API:
     Expression: (http.request.uri.path contains "/api/")
     Action: Rate Limit (10 requests/second)

  3. Geographic restrictions (if needed):
     Expression: (ip.geoip.country ne "NG" and ip.geoip.country ne "US")
     Action: Challenge (CAPTCHA)

  4. Block SQL injection attempts:
     Expression: (http.request.uri contains "union" or http.request.uri contains "select")
     Action: Block
```

**Step 4: Enable DDoS Protection**
```yaml
# Security > DDoS

Settings:
  - HTTP DDoS Attack Protection: Enabled
  - Network-layer DDoS Attack Protection: Enabled
  - Sensitivity Level: High
  - Rule Override: Custom rules as needed
```

**Step 5: Rate Limiting**
```yaml
# Security > WAF > Rate limiting rules

Rule 1 - General API:
  If: (http.request.uri.path contains "/api/")
  Requests: 100 requests per 1 minute
  Action: Block for 10 minutes

Rule 2 - Authentication:
  If: (http.request.uri.path eq "/api/auth/login")
  Requests: 5 requests per 5 minutes
  Action: Block for 15 minutes

Rule 3 - Payment Processing:
  If: (http.request.uri.path contains "/api/payments/")
  Requests: 20 requests per 1 minute
  Action: Block for 10 minutes
```

**Step 6: SSL/TLS Configuration**
```yaml
# SSL/TLS > Overview
Mode: Full (Strict)

# SSL/TLS > Edge Certificates
- Automatic HTTPS Rewrites: ON
- Always Use HTTPS: ON
- Minimum TLS Version: TLS 1.2
- Opportunistic Encryption: ON
- TLS 1.3: ON
```

---

### Option B: AWS WAF + Shield

**Pricing:**
```yaml
AWS WAF:
  - $5/month per web ACL
  - $1/month per rule
  - $0.60 per 1 million requests

  Example cost:
  - 1 web ACL: $5
  - 10 rules: $10
  - 10M requests/month: $6
  Total: ~$21/month

AWS Shield Standard:
  - FREE (included with AWS)
  - Basic DDoS protection

AWS Shield Advanced:
  - $3,000/month
  - Advanced DDoS protection
  - 24/7 DDoS response team
  - Cost protection
```

**Setup (Basic):**
```bash
# Install AWS CLI
pip install awscli

# Create Web ACL
aws wafv2 create-web-acl \
  --name ubiquitous-tribble-waf \
  --scope REGIONAL \
  --default-action Block={} \
  --rules file://waf-rules.json \
  --region us-east-1

# Associate with API Gateway or ALB
aws wafv2 associate-web-acl \
  --web-acl-arn arn:aws:wafv2:region:account:regional/webacl/name/id \
  --resource-arn arn:aws:apigateway:region::/restapis/api-id/stages/prod
```

---

### Option C: Nginx + ModSecurity (FREE, Self-Hosted)

**For:** Complete control, zero cost, requires expertise

```bash
# Install ModSecurity
apt-get install libapache2-mod-security2

# For Nginx
apt-get install libnginx-mod-security

# Download OWASP Core Rule Set
git clone https://github.com/coreruleset/coreruleset /usr/local/modsecurity-crs

# Configure Nginx
cat > /etc/nginx/modsecurity.conf <<'EOF'
SecRuleEngine On
SecRequestBodyAccess On
SecRule REQUEST_HEADERS:Content-Type "text/xml" \
  "id:'200000',phase:1,t:none,t:lowercase,pass,nolog,ctl:requestBodyProcessor=XML"

# Include OWASP CRS
Include /usr/local/modsecurity-crs/crs-setup.conf
Include /usr/local/modsecurity-crs/rules/*.conf
EOF

# Add to nginx.conf
modsecurity on;
modsecurity_rules_file /etc/nginx/modsecurity.conf;
```

**Fail2Ban for DDoS Protection:**
```bash
# Install
apt-get install fail2ban

# Configure /etc/fail2ban/jail.local
[nginx-req-limit]
enabled = true
filter = nginx-req-limit
action = iptables-multiport[name=ReqLimit, port="http,https"]
logpath = /var/log/nginx/error.log
findtime = 60
bantime = 7200
maxretry = 10
```

---

## 4. SIEM Monitoring

### What It Is
Security Information and Event Management - collects, analyzes, and alerts on security events.

### Option A: SigNoz (FREE, Modern) ✅ RECOMMENDED

**Why SigNoz:**
- All-in-one observability (logs + metrics + traces)
- Modern, clean UI
- Built on ClickHouse (faster than Elasticsearch)
- OpenTelemetry native
- Easy setup (single command)
- Low resource usage (~2GB RAM)
- Open-source alternative to DataDog

**Components:**
- **ClickHouse**: Fast columnar database
- **Query Service**: API backend
- **Frontend**: Beautiful dashboards
- **OTel Collector**: Log/metrics/trace collection

#### Setup Guide (SigNoz)

**Step 1: Install with One Command**

```bash
# Clone SigNoz
git clone -b main https://github.com/SigNoz/signoz.git && cd signoz/deploy/

# Start SigNoz
./install.sh

# Access UI at http://localhost:3301
# Default credentials will be shown in terminal
```

**Step 2: Configure for NestJS**

```yaml
# docker-compose.override.yml (add to signoz/deploy/)
version: '3.8'

services:
  otel-collector:
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
```

**Step 3: Integrate with NestJS**

```typescript
// Install dependencies
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http @opentelemetry/instrumentation-winston pino pino-opentelemetry-transport

// src/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'ubiquitous-tribble-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

// src/main.ts
import './tracing'; // Import at the very top

// src/logging/signoz-logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class SigNozLoggerService implements LoggerService {
  private logger;

  constructor() {
    this.logger = pino({
      level: 'info',
      transport: {
        target: 'pino-opentelemetry-transport',
        options: {
          url: 'http://localhost:4318/v1/logs',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      },
    });
  }

  log(message: string, context?: string) {
    this.logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ trace, context }, message);
  }

  warn(message: string, context?: string) {
    this.logger.warn({ context }, message);
  }

  // Security event logging
  logSecurityEvent(eventType: string, data: any) {
    this.logger.warn({
      event_type: eventType,
      security_event: true,
      ...data,
    }, 'Security Event Detected');
  }
}

// Usage
@Injectable()
export class AuthService {
  constructor(private logger: SigNozLoggerService) {}

  async login(email: string, password: string, clientIp: string) {
    try {
      const user = await this.validateUser(email, password);

      this.logger.log('Successful login', {
        user_id: user.id,
        email: user.email,
        client_ip: clientIp,
        event_type: 'successful_login',
      });

      return user;
    } catch (error) {
      this.logger.logSecurityEvent('failed_login', {
        email,
        client_ip: clientIp,
        reason: error.message,
      });

      throw error;
    }
  }
}
```

**Step 4: Create Security Dashboards**

Access SigNoz UI at `http://localhost:3301`

**Dashboard 1: Failed Login Monitoring**
1. Go to "Dashboards" → "New Dashboard"
2. Add panel: "Failed Login Attempts"
3. Query:
```sql
SELECT
  toStartOfInterval(timestamp, INTERVAL 5 MINUTE) as time,
  count() as failed_attempts,
  attributes_string['client_ip'] as ip
FROM signoz_logs.distributed_logs
WHERE attributes_string['event_type'] = 'failed_login'
  AND timestamp >= now() - INTERVAL 24 HOUR
GROUP BY time, ip
HAVING failed_attempts > 5
ORDER BY time DESC
```

**Dashboard 2: Suspicious Transactions**
```sql
SELECT
  timestamp,
  attributes_string['user_id'] as user,
  attributes_number['transaction_amount'] as amount,
  attributes_string['client_ip'] as ip
FROM signoz_logs.distributed_logs
WHERE attributes_string['event_type'] = 'transaction'
  AND attributes_number['transaction_amount'] > 1000000
  AND timestamp >= now() - INTERVAL 1 HOUR
ORDER BY timestamp DESC
```

**Dashboard 3: API Performance**
```sql
SELECT
  toStartOfInterval(timestamp, INTERVAL 1 MINUTE) as time,
  quantile(0.95)(attributes_number['duration']) as p95_latency,
  count() as request_count
FROM signoz_traces.distributed_signoz_index_v2
WHERE service_name = 'ubiquitous-tribble-api'
  AND timestamp >= now() - INTERVAL 1 HOUR
GROUP BY time
ORDER BY time DESC
```

**Step 5: Set Up Alerts**

```yaml
# In SigNoz: Alerts → New Alert

Alert 1 - Multiple Failed Logins:
  Name: "Suspicious Login Activity"
  Query:
    SELECT count() FROM signoz_logs.distributed_logs
    WHERE event_type = 'failed_login'
    AND client_ip = {{ip}}
    AND timestamp >= now() - INTERVAL 5 MINUTE
  Condition: count() > 5
  Notification: Email + Slack

Alert 2 - Large Transaction:
  Name: "High Value Transaction"
  Query:
    SELECT max(transaction_amount) FROM signoz_logs.distributed_logs
    WHERE event_type = 'transaction'
    AND timestamp >= now() - INTERVAL 1 MINUTE
  Condition: max > 1000000
  Notification: Email to compliance

Alert 3 - High Error Rate:
  Name: "API Error Spike"
  Query:
    SELECT count() FROM signoz_traces.distributed_signoz_index_v2
    WHERE status_code >= 500
    AND timestamp >= now() - INTERVAL 5 MINUTE
  Condition: count() > 50
  Notification: Slack + PagerDuty

Alert 4 - API Latency:
  Name: "Slow API Response"
  Query:
    SELECT quantile(0.95)(duration) FROM signoz_traces.distributed_signoz_index_v2
    WHERE service_name = 'ubiquitous-tribble-api'
    AND timestamp >= now() - INTERVAL 5 MINUTE
  Condition: p95 > 1000ms
  Notification: Slack
```

**Cost:** $0 (requires ~2GB RAM, 30GB storage)

---

### Option B: Grafana Stack (FREE, Popular) ✅ ALSO EXCELLENT

**Why Grafana Stack:**
- Industry standard
- Beautiful dashboards
- Huge community
- Perfect for Prometheus metrics
- Loki for logs (like "Prometheus for logs")
- Tempo for distributed tracing

**Components:**
- **Grafana**: Visualization & dashboards
- **Loki**: Log aggregation
- **Prometheus**: Metrics collection
- **Tempo**: Distributed tracing
- **Promtail**: Log shipper

#### Setup Guide (Grafana Stack)

**Step 1: Docker Compose Setup**

```yaml
# docker-compose.yml
version: '3.8'

services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    networks:
      - monitoring

  loki:
    image: grafana/loki:latest
    container_name: loki
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./loki/config.yaml:/etc/loki/local-config.yaml
      - loki-data:/loki
    networks:
      - monitoring

  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    volumes:
      - ./promtail/config.yaml:/etc/promtail/config.yaml
      - /var/log:/var/log
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: -config.file=/etc/promtail/config.yaml
    networks:
      - monitoring
    depends_on:
      - loki

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - monitoring

  tempo:
    image: grafana/tempo:latest
    container_name: tempo
    ports:
      - "3200:3200"   # tempo
      - "4317:4317"   # otlp grpc
      - "4318:4318"   # otlp http
    command: ["-config.file=/etc/tempo.yaml"]
    volumes:
      - ./tempo/tempo.yaml:/etc/tempo.yaml
      - tempo-data:/tmp/tempo
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  grafana-data:
  loki-data:
  prometheus-data:
  tempo-data:
```

**Step 2: Configure Loki**

```yaml
# loki/config.yaml
auth_enabled: false

server:
  http_listen_port: 3100

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

ruler:
  alertmanager_url: http://localhost:9093

# Enable API for security events
limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
```

**Step 3: Configure Promtail**

```yaml
# promtail/config.yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # Docker containers
  - job_name: containers
    static_configs:
      - targets:
          - localhost
        labels:
          job: containerlogs
          __path__: /var/lib/docker/containers/*/*.log

    pipeline_stages:
      - json:
          expressions:
            output: log
            stream: stream
            attrs: attrs
      - labels:
          stream:
      - output:
          source: output

  # Application logs (JSON format)
  - job_name: app_logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: app
          __path__: /var/log/app/*.log

    pipeline_stages:
      - json:
          expressions:
            level: level
            message: message
            user_id: user_id
            event_type: event_type
            client_ip: client_ip
      - labels:
          level:
          event_type:
      - timestamp:
          source: timestamp
          format: RFC3339
```

**Step 4: Configure Prometheus**

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # NestJS app metrics
  - job_name: 'nestjs-app'
    static_configs:
      - targets: ['host.docker.internal:3000']
        labels:
          service: 'ubiquitous-tribble-api'

  # Node exporter (system metrics)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

**Step 5: Integrate with NestJS**

```typescript
// Install dependencies
npm install pino pino-http pino-loki

// src/logging/grafana-logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class GrafanaLoggerService implements LoggerService {
  private logger;

  constructor() {
    this.logger = pino({
      level: 'info',
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
      transport: {
        targets: [
          // Console
          {
            target: 'pino-pretty',
            level: 'info',
            options: {
              colorize: true,
            },
          },
          // Loki
          {
            target: 'pino-loki',
            level: 'info',
            options: {
              batching: true,
              interval: 5,
              host: 'http://loki:3100',
              labels: {
                application: 'ubiquitous-tribble',
                environment: process.env.NODE_ENV || 'development',
              },
            },
          },
        ],
      },
    });
  }

  log(message: string, context?: string) {
    this.logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ trace, context }, message);
  }

  warn(message: string, context?: string) {
    this.logger.warn({ context }, message);
  }

  // Security event logging
  logSecurityEvent(eventType: string, data: any) {
    this.logger.warn({
      event_type: eventType,
      security_event: true,
      ...data,
    }, 'Security Event');
  }
}

// Prometheus metrics
// npm install @willsoto/nestjs-prometheus prom-client

// src/app.module.ts
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
})
export class AppModule {}

// Create custom metrics
// src/metrics/custom-metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class CustomMetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    public requestCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    public requestDuration: Histogram<string>,
    @InjectMetric('failed_login_attempts_total')
    public failedLoginCounter: Counter<string>,
    @InjectMetric('transaction_amount_total')
    public transactionAmount: Counter<string>,
  ) {}

  recordFailedLogin(ip: string) {
    this.failedLoginCounter.inc({ ip });
  }

  recordTransaction(amount: number, currency: string) {
    this.transactionAmount.inc({ currency }, amount);
  }
}
```

**Step 6: Create Grafana Dashboards**

Access Grafana at `http://localhost:3000` (admin/admin)

**Add Data Sources:**
1. Loki: http://loki:3100
2. Prometheus: http://prometheus:9090
3. Tempo: http://tempo:3200

**Dashboard 1: Security Events**

```json
{
  "title": "Security Events",
  "panels": [
    {
      "title": "Failed Login Attempts",
      "targets": [
        {
          "expr": "sum by (client_ip) (count_over_time({job=\"app\", event_type=\"failed_login\"}[5m]))",
          "refId": "A"
        }
      ]
    },
    {
      "title": "Large Transactions",
      "targets": [
        {
          "expr": "{job=\"app\", event_type=\"transaction\"} | json | transaction_amount > 1000000",
          "refId": "B"
        }
      ]
    }
  ]
}
```

**Dashboard 2: API Performance**

```json
{
  "title": "API Performance",
  "panels": [
    {
      "title": "Request Rate",
      "targets": [
        {
          "expr": "rate(http_requests_total[5m])",
          "refId": "A"
        }
      ]
    },
    {
      "title": "Response Time (p95)",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)",
          "refId": "B"
        }
      ]
    },
    {
      "title": "Error Rate",
      "targets": [
        {
          "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
          "refId": "C"
        }
      ]
    }
  ]
}
```

**Step 7: Configure Alerts**

```yaml
# In Grafana: Alerting → Alert rules

Alert 1 - Failed Logins:
  Query: sum by (client_ip) (count_over_time({job="app", event_type="failed_login"}[5m]))
  Condition: > 5
  For: 5 minutes
  Notification: Email + Slack

Alert 2 - High Error Rate:
  Query: rate(http_requests_total{status=~"5.."}[5m])
  Condition: > 0.05 (5%)
  For: 2 minutes
  Notification: Slack

Alert 3 - Slow API:
  Query: histogram_quantile(0.95, http_request_duration_seconds_bucket)
  Condition: > 1 (1 second)
  For: 5 minutes
  Notification: Slack
```

**Cost:** $0 (requires ~3GB RAM, 40GB storage)

---

### Option B: Managed SIEM Services

**1. Datadog Security Monitoring**
```yaml
Pricing:
  - $15/host/month (Infrastructure)
  - $0.10/GB ingested (Logs)
  - Security Monitoring: $0.20/GB

Example:
  - 3 servers: $45
  - 100GB logs/month: $10 + $20 = $30
  Total: $75/month
```

**2. Splunk Cloud**
```yaml
Pricing:
  - $0.15/GB/day

Example:
  - 10GB/day: $1.50/day = $45/month
  - Minimum: Usually $150/month
```

**3. Microsoft Sentinel (Azure)**
```yaml
Pricing:
  - Pay-as-you-go: $2/GB
  - Commitment tier: $100/day for 100GB

Example:
  - 30GB/month: $60/month
```

---

## Summary & Recommendations

### Immediate Setup (FREE)

```yaml
Week 1:
  ✅ Set up vulnerability scanning in CI/CD:
     - npm audit (built-in)
     - Snyk (free tier)
     - ESLint security plugin
     Cost: $0

Week 2:
  ✅ Deploy Cloudflare:
     - Free plan to start
     - Upgrade to Pro ($20/month) when in production
     Cost: $0-20/month

Week 3:
  ✅ Set up SigNoz or Grafana Stack:
     - SigNoz: One-command install (recommended for simplicity)
     - Grafana: Full observability stack (industry standard)
     - Configure security dashboards
     - Set up alerts
     Cost: $0 (infrastructure cost only)

Week 4:
  ✅ DIY Security Testing:
     - OWASP ZAP automated scans
     - Nuclei vulnerability scanning
     - Manual testing with Burp Suite
     Cost: $0

Month 3 (Before Production):
  ✅ Professional Penetration Test:
     - Engage local provider
     - Full API and infrastructure test
     Cost: $2,500-6,000 (one-time)
```

### Monthly Costs Breakdown

```yaml
Starting Out (Months 1-3):
  - Cloudflare Free: $0
  - SigNoz/Grafana (self-hosted): $0
  - Vulnerability scanning: $0
  - Total: $0/month

Production (Months 4+):
  - Cloudflare Pro: $20
  - SigNoz/Grafana (VPS hosting): $20-40
  - Snyk Team (optional): $52
  - Total: $40-112/month

Growing (Year 1+):
  - Cloudflare Business: $200
  - SigNoz/Grafana or managed SIEM: $50-150
  - Snyk Business: $189
  - Annual pentest: $5,000/year = $417/month
  - Total: $650-950/month
```

### Recommended Path

```bash
# Phase 1: Free Tools (NOW)
1. Set up Snyk for dependency scanning
2. Add OWASP ZAP to CI/CD
3. Deploy Cloudflare (Free tier)
4. Install SigNoz (easiest) or Grafana Stack (industry standard)

# Phase 2: Before Launch (Month 3)
1. Upgrade Cloudflare to Pro ($20/month)
2. Professional penetration test ($3,000-6,000)
3. Review and fix all findings

# Phase 3: Production (Ongoing)
1. Monthly automated scans
2. Quarterly manual security reviews
3. Annual professional penetration test
```

---

**Total First Year Security Cost:**
- Tools: $0-1,200 (mostly free)
- Cloudflare: $240-2,400
- Pentest: $3,000-6,000
- **Total: $3,240-9,600** (Much lower than original $25K-90K estimate if you use free tools!)

---

**Next Steps:**
1. Start with free tools this week
2. Set up monitoring and alerting
3. Run DIY security tests monthly
4. Budget for professional pentest before launch
