# Sprint 24 Tickets - Security Hardening & Penetration Testing

**Sprint:** Sprint 24
**Duration:** Week 49-50 (2 weeks)
**Sprint Goal:** Production security readiness through penetration testing and hardening
**Total Story Points:** 45
**Budget:** $25,000-45,000

---

## Sprint Backlog

### 🎯 Epic: EPIC-1 - Core Infrastructure & Security
**Total Points:** 45

---

## 📋 User Story: US-24.1.1 - Professional Penetration Testing (13 SP)

### Tasks

#### TASK-24.1.1.1: Engage Penetration Testing Firm (2 SP)
**Status:** ⚪ To Do
**Assignee:** Platform Owner
**Priority:** P0

**Description:**
Research, evaluate, and engage a reputable penetration testing firm.

**Acceptance Criteria:**
- [ ] Request quotes from 3-5 penetration testing firms
- [ ] Compare pricing, methodology, reputation
- [ ] Review sample reports from previous engagements
- [ ] Negotiate scope and timeline
- [ ] Sign contract and statement of work
- [ ] Schedule test dates (Week 49)
- [ ] Confirm deliverables (report format, retest included)

**Recommended Firms:**
- Coalfire ($30K-50K)
- Rapid7 ($25K-45K)
- Secureworks ($15K-30K)
- Trustwave ($15K-30K)
- Local Nigerian firms ($5K-15K)

**Documents to Provide:**
- Network diagram
- Application architecture
- API documentation
- Scope document
- Rules of engagement

---

#### TASK-24.1.1.2: Prepare Test Environment (2 SP)
**Status:** ⚪ To Do
**Assignee:** DevOps
**Priority:** P0

**Description:**
Set up isolated test environment for penetration testing.

**Acceptance Criteria:**
- [ ] Clone production environment to test environment
- [ ] Create test user accounts (various permission levels)
- [ ] Populate test database with realistic (non-production) data
- [ ] Configure test API keys
- [ ] Set up test payment accounts (Paystack sandbox)
- [ ] Document test credentials in secure vault
- [ ] Provide VPN access to testing team (if needed)
- [ ] Configure firewall rules to allow tester IPs
- [ ] Set up monitoring to track test activities
- [ ] Create rollback plan if tests cause issues

**Test Accounts Needed:**
```yaml
Standard User:
  - Email: pentest-user@tribble.test
  - Role: user
  - KYC Tier: 2
  - Wallet Balance: 1,000,000 NGN

Admin User:
  - Email: pentest-admin@tribble.test
  - Role: admin
  - Full access

Merchant Account:
  - Email: pentest-merchant@tribble.test
  - Role: merchant
  - API keys provisioned

Restricted User:
  - Email: pentest-restricted@tribble.test
  - Role: user
  - KYC Tier: 0
  - Limited access
```

---

#### TASK-24.1.1.3: Define Scope & Rules of Engagement (1 SP)
**Status:** ⚪ To Do
**Assignee:** Security Lead
**Priority:** P0

**Description:**
Document clear scope and rules to guide penetration testing.

**Acceptance Criteria:**
- [ ] Define in-scope systems (web app, APIs, infrastructure)
- [ ] Define out-of-scope systems (production database, third-party services)
- [ ] Specify allowed testing techniques
- [ ] Specify prohibited activities (no DoS, no social engineering)
- [ ] Define testing hours (business hours vs. 24/7)
- [ ] Establish communication channels (Slack, email)
- [ ] Define escalation procedures
- [ ] Sign rules of engagement document
- [ ] Share emergency contacts

**Scope Document Template:**

```markdown
# Penetration Testing Scope

## In-Scope
- Web application (https://app.tribble.test)
- REST APIs (https://api.tribble.test)
- Admin portal (https://admin.tribble.test)
- Infrastructure (AWS/GCP - test environment only)

## Out-of-Scope
- Production environment
- Third-party services (Paystack, AWS S3)
- DoS/DDoS attacks
- Physical security testing
- Social engineering (unless explicitly agreed)

## Allowed Techniques
- OWASP Top 10 testing
- API fuzzing
- Authentication bypass attempts
- Privilege escalation testing
- SQL injection, XSS, CSRF testing

## Testing Schedule
- Dates: Week 49 (Nov 8-15)
- Hours: Monday-Friday, 9am-5pm WAT
- Emergency contact: +234-XXX-XXX-XXXX

## Deliverables
- Detailed penetration test report
- Executive summary
- Remediation guidance
- Retest (after fixes)
```

---

#### TASK-24.1.1.4: Monitor & Support During Penetration Test (3 SP)
**Status:** ⚪ To Do
**Assignee:** Security Lead + DevOps
**Priority:** P0

**Description:**
Actively monitor testing activities and provide support to testing team.

**Acceptance Criteria:**
- [ ] Daily standup with penetration testing team
- [ ] Monitor test environment logs in real-time
- [ ] Track findings as they are discovered
- [ ] Answer questions from testers (API docs, architecture)
- [ ] Create Jira/GitHub issues for each finding
- [ ] Begin fixing critical issues immediately
- [ ] Keep stakeholders informed of progress
- [ ] Document lessons learned

**Communication Plan:**
- Daily standup: 9am WAT via Zoom
- Slack channel: #security-pentest
- Email: security@tribble.com
- Emergency hotline: Available 24/7

---

#### TASK-24.1.1.5: Remediate Critical & High Vulnerabilities (5 SP)
**Status:** ⚪ To Do
**Assignee:** Development Team
**Priority:** P0

**Description:**
Fix all critical and high-severity vulnerabilities identified by pentest.

**Acceptance Criteria:**
- [ ] Review penetration test report
- [ ] Prioritize findings by severity (CVSS score)
- [ ] Create remediation tickets for each finding
- [ ] Assign tickets to developers
- [ ] Fix all critical vulnerabilities (CVSS 9.0-10.0)
- [ ] Fix all high vulnerabilities (CVSS 7.0-8.9)
- [ ] Document fixes in ticket
- [ ] Unit tests for each fix
- [ ] Code review for security fixes
- [ ] Deploy fixes to test environment
- [ ] Request retest from penetration testing firm

**Vulnerability Tracking:**

```typescript
interface Vulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvss_score: number;
  description: string;
  affected_component: string;
  remediation_steps: string[];
  status: 'open' | 'in_progress' | 'fixed' | 'verified';
  assigned_to: string;
  due_date: Date;
}

// Example vulnerability
const example: Vulnerability = {
  id: 'PENTEST-001',
  title: 'SQL Injection in /api/v1/users endpoint',
  severity: 'critical',
  cvss_score: 9.8,
  description: 'User input not sanitized in search parameter',
  affected_component: 'User Service - search endpoint',
  remediation_steps: [
    'Use parameterized queries',
    'Validate and sanitize all user inputs',
    'Implement input length restrictions',
    'Add WAF rules to block SQL injection patterns',
  ],
  status: 'in_progress',
  assigned_to: 'john@tribble.com',
  due_date: new Date('2025-11-10'),
};
```

---

#### Subtotal: US-24.1.1 = 13 SP

---

## 📋 User Story: US-24.1.2 - SIEM Implementation (13 SP)

### Tasks

#### TASK-24.1.2.1: Deploy Wazuh Manager (3 SP)
**Status:** ⚪ To Do
**Assignee:** DevOps
**Priority:** P0

**Description:**
Deploy Wazuh manager server for centralized log management.

**Acceptance Criteria:**
- [ ] Provision server (4 vCPU, 8 GB RAM, 500 GB SSD)
- [ ] Install Wazuh manager (latest stable version)
- [ ] Install Elasticsearch for log storage
- [ ] Install Kibana for visualization
- [ ] Configure firewall rules (port 1514, 1515, 55000)
- [ ] Set up SSL/TLS for secure communication
- [ ] Configure admin user and authentication
- [ ] Test manager accessibility (web UI)
- [ ] Document deployment steps
- [ ] Create backup plan

**Installation Commands:**

```bash
# Install Wazuh manager on Ubuntu 22.04
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -
echo "deb https://packages.wazuh.com/4.x/apt/ stable main" > /etc/apt/sources.list.d/wazuh.list
apt-get update
apt-get install wazuh-manager

# Install Elasticsearch
curl -s https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" > /etc/apt/sources.list.d/elastic-7.x.list
apt-get update
apt-get install elasticsearch

# Install Kibana
apt-get install kibana

# Start services
systemctl start wazuh-manager
systemctl start elasticsearch
systemctl start kibana
systemctl enable wazuh-manager elasticsearch kibana

# Verify
systemctl status wazuh-manager
```

**Server Specs:**
- Instance: AWS t3.xlarge or equivalent
- OS: Ubuntu 22.04 LTS
- Storage: 500 GB SSD (expandable)
- Network: VPC with private subnet

---

#### TASK-24.1.2.2: Install Wazuh Agents on All Servers (2 SP)
**Status:** ⚪ To Do
**Assignee:** DevOps
**Priority:** P0

**Description:**
Deploy Wazuh agents to all application servers and containers.

**Acceptance Criteria:**
- [ ] Install Wazuh agent on API gateway servers
- [ ] Install agent on wallet service servers
- [ ] Install agent on payment service servers
- [ ] Install agent on database servers
- [ ] Install agent in Docker containers (sidecar pattern)
- [ ] Configure agents to connect to manager
- [ ] Verify agent connectivity
- [ ] Configure log collection paths
- [ ] Enable file integrity monitoring
- [ ] Test log forwarding

**Agent Installation:**

```bash
# Install Wazuh agent on Ubuntu
curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | apt-key add -
echo "deb https://packages.wazuh.com/4.x/apt/ stable main" > /etc/apt/sources.list.d/wazuh.list
apt-get update
apt-get install wazuh-agent

# Configure manager address
echo "WAZUH_MANAGER='wazuh-manager.tribble.internal'" >> /var/ossec/etc/ossec.conf

# Start agent
systemctl start wazuh-agent
systemctl enable wazuh-agent

# Verify connection
/var/ossec/bin/agent_control -lc
```

**Docker Sidecar Pattern:**

```yaml
# docker-compose.yml
services:
  api-service:
    image: tribble/api-service:latest
    volumes:
      - ./logs:/app/logs

  wazuh-agent:
    image: wazuh/wazuh-agent:latest
    environment:
      - WAZUH_MANAGER=wazuh-manager.tribble.internal
    volumes:
      - ./logs:/logs:ro  # Read-only access to app logs
```

---

#### TASK-24.1.2.3: Configure Application Log Forwarding (3 SP)
**Status:** ⚪ To Do
**Assignee:** Backend Developer
**Priority:** P0

**Description:**
Configure NestJS applications to send structured logs to Wazuh.

**Acceptance Criteria:**
- [ ] Configure Winston logger to write to syslog
- [ ] Add structured logging (JSON format)
- [ ] Include security-relevant fields (user_id, ip_address, action)
- [ ] Configure log levels (debug, info, warn, error)
- [ ] Add correlation IDs to trace requests
- [ ] Log authentication events
- [ ] Log transaction events
- [ ] Log security events (failed access, privilege escalation)
- [ ] Test log forwarding end-to-end
- [ ] Verify logs appear in Kibana

**Winston Configuration:**

```typescript
// logger.config.ts
import * as winston from 'winston';
import 'winston-syslog';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    // Console transport (for development)
    new winston.transports.Console(),

    // Syslog transport (for Wazuh)
    new winston.transports.Syslog({
      host: 'wazuh-manager.tribble.internal',
      port: 514,
      protocol: 'udp4',
      facility: 'local0',
      app_name: 'tribble-api',
    }),

    // File transport (backup)
    new winston.transports.File({
      filename: '/var/log/tribble/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: '/var/log/tribble/combined.log',
    }),
  ],
});

// Example security log
logger.warn('Failed login attempt', {
  event: 'authentication_failed',
  user_id: 'user-123',
  ip_address: '192.168.1.100',
  user_agent: 'Mozilla/5.0...',
  timestamp: new Date().toISOString(),
});
```

---

#### TASK-24.1.2.4: Create Security Alert Rules (3 SP)
**Status:** ⚪ To Do
**Assignee:** Security Engineer
**Priority:** P0

**Description:**
Configure Wazuh rules to detect security events and trigger alerts.

**Acceptance Criteria:**
- [ ] Create rules for failed login detection (5+ attempts)
- [ ] Create rules for privilege escalation attempts
- [ ] Create rules for large transactions (> threshold)
- [ ] Create rules for suspicious velocity patterns
- [ ] Create rules for database connection failures
- [ ] Create rules for KYC verification failures
- [ ] Configure alert thresholds
- [ ] Set up email notifications
- [ ] Set up Slack notifications
- [ ] Test each alert rule

**Wazuh Alert Rules:**

```xml
<!-- /var/ossec/etc/rules/local_rules.xml -->

<!-- Rule: Multiple failed login attempts (brute force) -->
<rule id="100001" level="10" frequency="5" timeframe="300">
  <if_matched_sid>authentication_failed</if_matched_sid>
  <same_source_ip />
  <description>Multiple failed login attempts from same IP</description>
  <group>authentication_failures,pci_dss_10.2.4,pci_dss_10.2.5,</group>
</rule>

<!-- Rule: Privilege escalation attempt -->
<rule id="100002" level="12">
  <if_sid>authentication</if_sid>
  <match>unauthorized_access</match>
  <description>Unauthorized admin action attempted</description>
  <group>privilege_escalation,pci_dss_10.2.2,</group>
</rule>

<!-- Rule: Large transaction -->
<rule id="100003" level="7">
  <if_sid>transaction</if_sid>
  <match>transaction_amount > 1000000</match>
  <description>Large transaction detected (> NGN 10,000)</description>
  <group>large_transaction,aml_monitoring,</group>
</rule>

<!-- Rule: Velocity anomaly -->
<rule id="100004" level="9" frequency="20" timeframe="3600">
  <if_matched_sid>transaction_completed</if_matched_sid>
  <same_field>user_id</same_field>
  <description>Velocity anomaly: > 20 transactions per hour</description>
  <group>velocity_check,fraud_detection,</group>
</rule>

<!-- Rule: Database connection failure -->
<rule id="100005" level="8" frequency="3" timeframe="60">
  <if_sid>database</if_sid>
  <match>connection_failed</match>
  <description>Multiple database connection failures</description>
  <group>availability,system_error,</group>
</rule>
```

**Notification Configuration:**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <email_notification>
    <email_to>security@tribble.com</email_to>
    <email_from>wazuh@tribble.com</email_from>
    <smtp_server>smtp.gmail.com</smtp_server>
    <smtp_port>587</smtp_port>
    <email_maxperhour>50</email_maxperhour>
    <email_alert_level>7</email_alert_level>
  </email_notification>

  <integration>
    <name>slack</name>
    <hook_url>https://hooks.slack.com/services/YOUR/WEBHOOK/URL</hook_url>
    <alert_level>10</alert_level>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

---

#### TASK-24.1.2.5: Create Security Dashboards in Kibana (2 SP)
**Status:** ⚪ To Do
**Assignee:** Security Engineer
**Priority:** P1

**Description:**
Build Kibana dashboards for security monitoring and incident response.

**Acceptance Criteria:**
- [ ] Create "Security Overview" dashboard
- [ ] Create "Authentication Events" dashboard
- [ ] Create "Transaction Monitoring" dashboard
- [ ] Create "System Health" dashboard
- [ ] Add visualizations (graphs, tables, maps)
- [ ] Configure auto-refresh (30 seconds)
- [ ] Set up saved searches for common queries
- [ ] Share dashboards with team
- [ ] Document dashboard usage
- [ ] Export dashboard definitions (version control)

**Dashboard Widgets:**

```yaml
Security Overview Dashboard:
  - Total alerts (last 24 hours)
  - Alert severity distribution (pie chart)
  - Top 10 alert types (bar chart)
  - Failed login attempts (timeline)
  - Blocked IPs (table)
  - Geographic heat map of login attempts

Authentication Events Dashboard:
  - Login attempts (success vs. failed)
  - Failed logins by user (top 10)
  - Failed logins by IP (top 10)
  - MFA adoption rate (gauge)
  - Password reset requests (timeline)
  - Session hijacking attempts (counter)

Transaction Monitoring Dashboard:
  - Transaction volume (timeline)
  - Large transactions (> threshold)
  - Failed transactions (reasons)
  - Fraud alerts (real-time)
  - Velocity anomalies (table)
  - Chargeback rate (gauge)

System Health Dashboard:
  - Service uptime (percentage)
  - Error rate (timeline)
  - Database connection status
  - API response times (percentiles)
  - Disk usage (gauge)
  - Memory usage (gauge)
```

---

#### Subtotal: US-24.1.2 = 13 SP

---

## 📋 User Story: US-24.1.3 - WAF & DDoS Protection (8 SP)

### Tasks

#### TASK-24.1.3.1: Set Up Cloudflare Account & DNS (2 SP)
**Status:** ⚪ To Do
**Assignee:** DevOps
**Priority:** P0

**Description:**
Configure Cloudflare as CDN and WAF for the platform.

**Acceptance Criteria:**
- [ ] Sign up for Cloudflare Business plan ($200/month)
- [ ] Add domain to Cloudflare
- [ ] Update DNS nameservers to Cloudflare
- [ ] Configure DNS records (A, AAAA, CNAME)
- [ ] Enable Cloudflare proxy (orange cloud)
- [ ] Configure page rules
- [ ] Set up custom SSL certificate
- [ ] Verify DNS propagation
- [ ] Test site accessibility

**Cloudflare DNS Configuration:**

```yaml
DNS Records:
  - Type: A
    Name: api.tribble.com
    Value: 203.0.113.10
    Proxy: Enabled (orange cloud)

  - Type: A
    Name: www.tribble.com
    Value: 203.0.113.10
    Proxy: Enabled

  - Type: CNAME
    Name: admin
    Value: api.tribble.com
    Proxy: Enabled

  - Type: TXT
    Name: _dmarc
    Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@tribble.com"
    Proxy: DNS only
```

---

#### TASK-24.1.3.2: Configure WAF Rules (3 SP)
**Status:** ⚪ To Do
**Assignee:** Security Engineer
**Priority:** P0

**Description:**
Configure Cloudflare WAF rules to block common attacks.

**Acceptance Criteria:**
- [ ] Enable OWASP Core Ruleset
- [ ] Enable Cloudflare Managed Ruleset
- [ ] Create custom rules for fintech attacks
- [ ] Configure SQL injection blocking
- [ ] Configure XSS blocking
- [ ] Configure path traversal blocking
- [ ] Configure command injection blocking
- [ ] Test rules with attack simulations
- [ ] Tune rules to reduce false positives
- [ ] Document WAF configuration

**WAF Rules:**

```javascript
// Cloudflare WAF custom rules

// Rule 1: Block SQL injection attempts
(http.request.uri.path contains "UNION" or
 http.request.uri.path contains "SELECT" or
 http.request.uri.query contains "1=1" or
 http.request.uri.query contains "' OR '1'='1")

Action: Block

// Rule 2: Block XSS attempts
(http.request.uri.query contains "<script>" or
 http.request.body contains "<script>" or
 http.request.uri.query contains "javascript:" or
 http.request.uri.query contains "onerror=")

Action: Block

// Rule 3: Rate limit API endpoints
(http.request.uri.path eq "/api/v1/auth/login" and
 rate(1m) > 5)

Action: Challenge (CAPTCHA)

// Rule 4: Block requests without valid User-Agent
(not http.user_agent contains "Mozilla" and
 not http.user_agent contains "okhttp" and
 not http.user_agent contains "axios" and
 not http.user_agent contains "Dart" and
 http.request.uri.path contains "/api/")

Action: Challenge

// Rule 5: Challenge traffic from high-risk countries
(ip.geoip.country in {"CN" "RU" "KP" "IR"} and
 not cf.bot_management.verified_bot)

Action: Challenge

// Rule 6: Block known malicious IPs
(ip.src in {203.0.113.0/24})

Action: Block
```

---

#### TASK-24.1.3.3: Enable DDoS Protection & Rate Limiting (2 SP)
**Status:** ⚪ To Do
**Assignee:** DevOps
**Priority:** P0

**Description:**
Configure DDoS protection and rate limiting rules.

**Acceptance Criteria:**
- [ ] Enable automatic DDoS protection
- [ ] Configure rate limiting for API endpoints
- [ ] Set global rate limit (10,000 requests/10 seconds per IP)
- [ ] Set login rate limit (5 attempts/minute per IP)
- [ ] Set payment rate limit (20 requests/minute per user)
- [ ] Configure CAPTCHA challenges for suspicious traffic
- [ ] Test rate limiting with load testing tools
- [ ] Monitor false positives
- [ ] Document rate limit thresholds

**Rate Limiting Rules:**

```yaml
# Cloudflare Rate Limiting Rules

Global API Rate Limit:
  Match: http.request.uri.path starts_with "/api/"
  Threshold: 10,000 requests per 10 seconds
  Action: Block for 1 hour
  Response: 429 Too Many Requests

Login Endpoint Rate Limit:
  Match: http.request.uri.path eq "/api/v1/auth/login"
  Threshold: 5 requests per 1 minute
  Action: Challenge (CAPTCHA)
  Response: 429 Too Many Requests

Payment Endpoint Rate Limit:
  Match: http.request.uri.path starts_with "/api/v1/payments"
  Threshold: 20 requests per 1 minute
  Group by: User ID (from JWT token)
  Action: Block for 5 minutes
  Response: 429 Too Many Requests

Signup Endpoint Rate Limit:
  Match: http.request.uri.path eq "/api/v1/auth/register"
  Threshold: 3 requests per 1 hour
  Action: Block for 24 hours
  Response: 429 Too Many Requests
```

---

#### TASK-24.1.3.4: Test WAF & DDoS Protection (1 SP)
**Status:** ⚪ To Do
**Assignee:** Security Engineer
**Priority:** P1

**Description:**
Simulate attacks to verify WAF and DDoS protection effectiveness.

**Acceptance Criteria:**
- [ ] Test SQL injection blocking (using sqlmap)
- [ ] Test XSS blocking (using burp suite)
- [ ] Test rate limiting (using Apache Bench)
- [ ] Test DDoS protection (using LOIC simulator - authorized test only)
- [ ] Verify legitimate traffic not blocked
- [ ] Check Cloudflare analytics for blocked requests
- [ ] Document test results
- [ ] Adjust rules based on test findings

**Testing Commands:**

```bash
# Test SQL injection blocking
sqlmap -u "https://api.tribble.com/api/v1/users?search=test" --batch
# Expected: Blocked by WAF

# Test rate limiting
ab -n 1000 -c 100 https://api.tribble.com/api/v1/auth/login
# Expected: Requests blocked after threshold

# Test XSS blocking
curl "https://api.tribble.com/api/v1/search?q=<script>alert(1)</script>"
# Expected: Blocked by WAF

# Test legitimate traffic
curl https://api.tribble.com/api/v1/health
# Expected: 200 OK
```

---

#### Subtotal: US-24.1.3 = 8 SP

---

## 📋 User Story: US-24.1.4 - Vulnerability Scanning in CI/CD (8 SP)

### Tasks

#### TASK-24.1.4.1: Integrate Trivy Scanner (3 SP)
**Status:** ⚪ To Do
**Assignee:** DevOps
**Priority:** P1

**Description:**
Add Trivy vulnerability scanner to GitHub Actions CI/CD pipeline.

**Acceptance Criteria:**
- [ ] Create GitHub Actions workflow for Trivy
- [ ] Scan npm dependencies
- [ ] Scan Docker images
- [ ] Scan infrastructure as code (Terraform/CloudFormation)
- [ ] Configure severity thresholds (fail on CRITICAL/HIGH)
- [ ] Upload scan results to GitHub Security
- [ ] Run on every pull request
- [ ] Run daily on main branch
- [ ] Send notifications to Slack on failures
- [ ] Document scan results review process

**GitHub Actions Workflow:**

```yaml
# .github/workflows/trivy-scan.yml
name: Trivy Security Scan

on:
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:  # Manual trigger

jobs:
  scan-dependencies:
    name: Scan NPM Dependencies
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run Trivy vulnerability scanner (filesystem)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-fs-results.sarif'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'  # Fail build on vulnerabilities

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-fs-results.sarif'

  scan-docker-images:
    name: Scan Docker Images
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api-gateway, wallet-service, payment-service]
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t tribble/${{ matrix.service }}:${{ github.sha }} ./apps/${{ matrix.service }}

      - name: Run Trivy vulnerability scanner (image)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'image'
          image-ref: 'tribble/${{ matrix.service }}:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-${{ matrix.service }}-results.sarif'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-${{ matrix.service }}-results.sarif'

  notify-slack:
    name: Notify Slack on Failure
    runs-on: ubuntu-latest
    needs: [scan-dependencies, scan-docker-images]
    if: failure()
    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "🚨 Security scan failed in ${{ github.repository }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Security Vulnerabilities Detected*\n\nRepository: ${{ github.repository }}\nBranch: ${{ github.ref }}\n\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Details>"
                  }
                }
              ]
            }
```

---

#### TASK-24.1.4.2: Integrate Snyk (Optional) (2 SP)
**Status:** ⚪ To Do
**Assignee:** DevOps
**Priority:** P2

**Description:**
Add Snyk for enhanced dependency scanning (optional, paid).

**Acceptance Criteria:**
- [ ] Sign up for Snyk account (free tier or team plan)
- [ ] Install Snyk CLI
- [ ] Integrate with GitHub repository
- [ ] Run Snyk test on dependencies
- [ ] Configure Snyk to monitor repository
- [ ] Set up automatic pull requests for fixes
- [ ] Enable Snyk security checks on PRs
- [ ] Configure Snyk severity threshold
- [ ] Review Snyk vulnerability dashboard
- [ ] Compare Snyk vs. Trivy results

**Snyk Integration:**

```yaml
# .github/workflows/snyk-scan.yml
name: Snyk Security Scan

on:
  pull_request:
  schedule:
    - cron: '0 0 * * *'

jobs:
  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --fail-on=all

      - name: Upload Snyk report
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: snyk.sarif
```

**Cost:**
- Free tier: Limited tests
- Team plan: $98/month (recommended)

---

#### TASK-24.1.4.3: Configure Dependabot (1 SP)
**Status:** ⚪ To Do
**Assignee:** DevOps
**Priority:** P1

**Description:**
Enable GitHub Dependabot for automatic dependency updates.

**Acceptance Criteria:**
- [ ] Enable Dependabot security updates
- [ ] Enable Dependabot version updates
- [ ] Configure dependabot.yml
- [ ] Set update frequency (weekly)
- [ ] Group dependency updates
- [ ] Review and merge Dependabot PRs
- [ ] Configure auto-merge for minor updates (optional)
- [ ] Monitor Dependabot activity

**Dependabot Configuration:**

```yaml
# .github/dependabot.yml
version: 2
updates:
  # NPM dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    reviewers:
      - "devops-team"
    labels:
      - "dependencies"
      - "security"
    commit-message:
      prefix: "chore"
      include: "scope"

  # Docker images
  - package-ecosystem: "docker"
    directory: "/apps/api-gateway"
    schedule:
      interval: "weekly"

  - package-ecosystem: "docker"
    directory: "/apps/wallet-service"
    schedule:
      interval: "weekly"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
```

---

#### TASK-24.1.4.4: Create Vulnerability Remediation Process (2 SP)
**Status:** ⚪ To Do
**Assignee:** Security Lead
**Priority:** P1

**Description:**
Document process for handling discovered vulnerabilities.

**Acceptance Criteria:**
- [ ] Create vulnerability remediation playbook
- [ ] Define SLAs for each severity level
- [ ] Assign roles and responsibilities
- [ ] Create vulnerability tracking template
- [ ] Define escalation procedures
- [ ] Document communication plan
- [ ] Train team on process
- [ ] Add to onboarding documentation

**Vulnerability Remediation SLAs:**

```yaml
Critical Vulnerabilities (CVSS 9.0-10.0):
  SLA: 24 hours
  Process:
    1. Immediate notification (email + Slack + PagerDuty)
    2. Emergency team meeting
    3. Hotfix development
    4. Emergency deployment
    5. Post-incident review

High Vulnerabilities (CVSS 7.0-8.9):
  SLA: 7 days
  Process:
    1. Slack notification
    2. Create GitHub issue
    3. Assign to developer
    4. Develop fix
    5. Include in next release

Medium Vulnerabilities (CVSS 4.0-6.9):
  SLA: 30 days
  Process:
    1. Create GitHub issue
    2. Add to sprint backlog
    3. Fix in regular sprint

Low Vulnerabilities (CVSS 0.1-3.9):
  SLA: 90 days or next major version
  Process:
    1. Create GitHub issue
    2. Add to technical debt backlog
    3. Fix when convenient
```

---

#### Subtotal: US-24.1.4 = 8 SP

---

## 📋 User Story: US-24.1.5 - SSL/TLS Hardening (3 SP)

### Tasks

#### TASK-24.1.5.1: Configure Nginx SSL/TLS (2 SP)
**Status:** ⚪ To Do
**Assignee:** DevOps
**Priority:** P1

**Description:**
Harden SSL/TLS configuration to achieve A+ rating on SSL Labs.

**Acceptance Criteria:**
- [ ] Enable TLS 1.3
- [ ] Disable TLS 1.0, 1.1
- [ ] Configure strong cipher suites
- [ ] Enable HSTS with preload
- [ ] Enable OCSP stapling
- [ ] Generate strong DH parameters
- [ ] Add security headers
- [ ] Test with SSL Labs (achieve A+)
- [ ] Document configuration
- [ ] Monitor certificate expiry

**Nginx SSL Configuration:**

```nginx
# /etc/nginx/conf.d/ssl.conf

# SSL protocols (TLS 1.2 and 1.3 only)
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;

# Strong cipher suites
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';

# SSL session cache
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.tribble.com" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Certificate paths (Let's Encrypt)
ssl_certificate /etc/letsencrypt/live/api.tribble.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/api.tribble.com/privkey.pem;
ssl_trusted_certificate /etc/letsencrypt/live/api.tribble.com/chain.pem;

# Diffie-Hellman parameter
ssl_dhparam /etc/nginx/dhparam.pem;
```

**Generate DH Parameters:**

```bash
# Generate 4096-bit DH parameters (takes 5-30 minutes)
openssl dhparam -out /etc/nginx/dhparam.pem 4096
```

---

#### TASK-24.1.5.2: Automate Certificate Management (1 SP)
**Status:** ⚪ To Do
**Assignee:** DevOps
**Priority:** P1

**Description:**
Set up automatic SSL certificate renewal with Let's Encrypt.

**Acceptance Criteria:**
- [ ] Install Certbot
- [ ] Obtain SSL certificates for all domains
- [ ] Configure automatic renewal
- [ ] Test renewal process
- [ ] Set up expiry monitoring
- [ ] Configure renewal alerts (30 days before expiry)
- [ ] Document certificate management process
- [ ] Create backup/restore procedure

**Certbot Setup:**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.tribble.com -d www.tribble.com -d admin.tribble.com

# Automatic renewal (certbot.timer runs twice daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run

# Manual renewal (if needed)
sudo certbot renew

# Check certificate expiry
echo | openssl s_client -servername api.tribble.com -connect api.tribble.com:443 2>/dev/null | openssl x509 -noout -dates
```

**Certificate Monitoring:**

```bash
# Add certificate expiry check to monitoring
# /usr/local/bin/check-cert-expiry.sh

#!/bin/bash
DOMAIN="api.tribble.com"
DAYS_UNTIL_EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -checkend 0 -enddate | grep -o "[0-9]*")

if [ "$DAYS_UNTIL_EXPIRY" -lt 30 ]; then
  echo "⚠️ SSL certificate expiring in $DAYS_UNTIL_EXPIRY days!"
  # Send alert to Slack/email
fi
```

---

#### Subtotal: US-24.1.5 = 3 SP

---

## Sprint Summary

| Story ID | Story Name | Story Points | Status |
|----------|-----------|--------------|--------|
| US-24.1.1 | Professional Penetration Testing | 13 | To Do |
| US-24.1.2 | SIEM Implementation & Log Aggregation | 13 | To Do |
| US-24.1.3 | WAF & DDoS Protection | 8 | To Do |
| US-24.1.4 | Vulnerability Scanning in CI/CD | 8 | To Do |
| US-24.1.5 | SSL/TLS Hardening & Configuration | 3 | To Do |
| **Total** | | **45 SP** | |

---

## Task Progress Tracker

### Week 1 (Day 1-5): Penetration Testing & SIEM

**Day 1:**
- [ ] TASK-24.1.1.1: Engage penetration testing firm
- [ ] TASK-24.1.2.1: Deploy Wazuh manager

**Day 2:**
- [ ] TASK-24.1.1.2: Prepare test environment
- [ ] TASK-24.1.2.2: Install Wazuh agents

**Day 3:**
- [ ] TASK-24.1.1.3: Define scope & rules of engagement
- [ ] TASK-24.1.2.3: Configure application log forwarding

**Day 4-5:**
- [ ] TASK-24.1.1.4: Monitor & support during pentest (ongoing)
- [ ] TASK-24.1.2.4: Create security alert rules

### Week 2 (Day 6-10): WAF, Vulnerability Scanning, Remediation

**Day 6:**
- [ ] TASK-24.1.3.1: Set up Cloudflare account & DNS
- [ ] TASK-24.1.4.1: Integrate Trivy scanner

**Day 7:**
- [ ] TASK-24.1.3.2: Configure WAF rules
- [ ] TASK-24.1.4.3: Configure Dependabot

**Day 8:**
- [ ] TASK-24.1.3.3: Enable DDoS protection & rate limiting
- [ ] TASK-24.1.5.1: Configure Nginx SSL/TLS

**Day 9:**
- [ ] TASK-24.1.1.5: Remediate critical & high vulnerabilities (priority)
- [ ] TASK-24.1.2.5: Create security dashboards

**Day 10:**
- [ ] TASK-24.1.3.4: Test WAF & DDoS protection
- [ ] TASK-24.1.4.4: Create vulnerability remediation process
- [ ] TASK-24.1.5.2: Automate certificate management
- [ ] Sprint review and demo

---

## Burndown Chart (To Be Updated Daily)

| Day | Planned Remaining | Actual Remaining | Completed Today |
|-----|-------------------|------------------|-----------------|
| 1   | 45                |                  |                 |
| 2   | 40                |                  |                 |
| 3   | 35                |                  |                 |
| 4   | 30                |                  |                 |
| 5   | 25                |                  |                 |
| 6   | 20                |                  |                 |
| 7   | 15                |                  |                 |
| 8   | 10                |                  |                 |
| 9   | 5                 |                  |                 |
| 10  | 0                 |                  |                 |

---

## Budget Breakdown

| Item | Vendor | Cost | Frequency |
|------|--------|------|-----------|
| **Penetration Testing** | TBD (Tier 1/2 firm) | $25,000-45,000 | One-time + annual retest |
| **Cloudflare Business** | Cloudflare | $200/month | Monthly |
| **SIEM Infrastructure** | AWS/GCP | $300-500/month | Monthly |
| **Trivy** | Open source | $0 | Free |
| **Snyk (Optional)** | Snyk | $0-98/month | Monthly (optional) |
| **SSL Certificates** | Let's Encrypt | $0 | Free |
| **PagerDuty (Optional)** | PagerDuty | $0-240/month | Monthly (optional) |
| **TOTAL (First Month)** | | **$25,500-45,998** | |
| **TOTAL (Ongoing/Month)** | | **$500-1,038** | |

---

## Dependencies

**External:**
- Penetration testing firm availability
- Budget approval ($25K-45K)
- Cloudflare account setup
- Domain DNS access

**Internal:**
- All Sprint 1-23 features deployed to test environment
- Test data prepared
- Team availability for remediation

---

## Blockers

| ID | Description | Raised Date | Owner | Status | Resolution |
|----|-------------|-------------|-------|--------|------------|
| - | No blockers currently | - | - | - | - |

---

## Notes

**Daily Standups:**
- Time: 9:00 AM WAT
- Duration: 15 minutes
- Format: What did I do? What will I do? Any blockers?

**Penetration Test Coordination:**
- Daily sync with testing team (9:30 AM)
- Slack channel: #security-pentest
- Emergency escalation: security@tribble.com

**Documentation:**
- All security configurations version-controlled
- Security runbook updated
- Incident response playbook finalized

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Ready to Start
