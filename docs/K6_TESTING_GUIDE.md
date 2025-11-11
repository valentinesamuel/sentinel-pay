# K6 Load Testing Guide - Ubiquitous Tribble Fintech Platform

## Table of Contents
1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Architecture & Test Structure](#architecture--test-structure)
4. [Running Tests](#running-tests)
5. [Test Scenarios](#test-scenarios)
6. [Performance Thresholds](#performance-thresholds)
7. [Reporting & Analysis](#reporting--analysis)
8. [Best Practices](#best-practices)

---

## Overview

This guide provides comprehensive load testing strategies for the Ubiquitous Tribble fintech platform using k6, a modern load testing tool designed for performance and scalability testing.

### Why k6?

- **JavaScript-based**: Write tests using familiar JavaScript syntax
- **Fast & Scalable**: Distributed testing across multiple machines
- **Rich Metrics**: Built-in support for various metrics (latency, throughput, errors)
- **Real-time Analysis**: Live feedback during test execution
- **Multiple Stages**: Support for ramping, sustaining, and stress testing
- **Easy Integration**: CI/CD pipeline integration with minimal setup

### Key Testing Scenarios

| Scenario | Purpose | VUs | Duration | Key Metrics |
|----------|---------|-----|----------|------------|
| Load Testing | Sustained normal traffic | 100-500 | 10-30min | p95/p99 latency, throughput |
| Stress Testing | Identify breaking point | 500-5000 | 20-40min | Error rates, timeout limits |
| Spike Testing | Sudden traffic surges | 100→5000 | 5-10min | Recovery time, error rates |
| Soak Testing | Long-term stability | 50-200 | 2-8 hours | Memory leaks, gradual degradation |
| Smoke Testing | Basic sanity checks | 1-10 | 1-5min | Script validation, API health |

---

## Installation & Setup

### Prerequisites

- Node.js 14+ (for script utilities)
- Docker (optional, for containerized k6)
- curl or Postman (for API testing)
- InfluxDB 1.8+ (optional, for metrics storage)
- Grafana 7+ (optional, for visualization)

### Installing k6

#### macOS (Homebrew)
```bash
brew install k6
```

#### Linux (Debian/Ubuntu)
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

#### Docker
```bash
docker pull grafana/k6:latest
docker run --rm -i grafana/k6:latest run --vus 10 --duration 30s - < script.js
```

#### Windows (Chocolatey)
```bash
choco install k6
```

### Verify Installation
```bash
k6 version
```

### Environment Setup

Create `.env` file in project root:
```bash
# API Configuration
API_BASE_URL=http://localhost:3000
API_KEY=test_key_12345
API_SECRET=test_secret_67890

# Test Configuration
TEST_ENV=staging
TEST_TIMEOUT=30000

# Load Testing Parameters
VU_RAMP_UP=100
VU_SUSTAIN=200
VU_STRESS=1000

# InfluxDB Configuration (optional)
INFLUXDB_URL=http://localhost:8086
INFLUXDB_DB=k6
```

---

## Architecture & Test Structure

### Directory Structure
```
k6_tests/
├── 00_utils.js                    # Shared utilities and helpers
├── 01_auth_setup.js              # Authentication and account setup
├── 02_payment_load_test.js       # Payment processing load testing
├── 03_request_signing_test.js    # API request signing verification
├── 04_subscription_load_test.js  # Subscription batch processing
├── 05_fraud_detection_test.js    # Fraud detection performance
├── 06_spike_stress_test.js       # Spike and stress testing
├── 07_realistic_scenario.js      # End-to-end workflow simulation
├── config/
│   ├── thresholds.js             # Performance thresholds
│   ├── stages.js                 # Test stage configurations
│   └── test_data.js              # Test data generators
└── reports/
    ├── summary.html              # HTML report output
    └── metrics.json              # Raw metrics export
```

### Shared Utilities (00_utils.js)

The utils file provides helper functions used across all tests:

```javascript
// Key Functions:
- createAuthToken()              // Generate JWT tokens
- signApiRequest()               // Create HMAC-SHA256 signatures
- decryptResponse()              // Decrypt AES-256-GCM responses
- generateTestData()             // Create realistic test payloads
- getRandomMerchant()            // Select random merchant
- validateResponseSignature()    // Verify response authenticity
- parseMetrics()                 // Extract and format metrics
- retryWithBackoff()             // Exponential backoff retry logic
```

### Test Stage Configurations

#### Smoke Test (5 minutes, 1-10 VUs)
```
Stage 1: 1 VU for 1 minute (warmup)
Stage 2: 10 VUs for 3 minutes (main)
Stage 3: 1 VU for 1 minute (cooldown)
```

#### Load Test (30 minutes, 100-500 VUs)
```
Stage 1: 1 VU for 2 minutes (warmup)
Stage 2: 50 VUs over 5 minutes (ramp-up)
Stage 3: 200 VUs for 15 minutes (sustain)
Stage 4: 50 VUs over 5 minutes (ramp-down)
Stage 5: 1 VU for 3 minutes (cooldown)
```

#### Stress Test (40 minutes, 500-5000 VUs)
```
Stage 1: 1 VU for 2 minutes (warmup)
Stage 2: 500 VUs over 5 minutes (ramp-up)
Stage 3: 2000 VUs over 10 minutes (stress)
Stage 4: 5000 VUs for 10 minutes (peak)
Stage 5: 500 VUs over 8 minutes (ramp-down)
Stage 6: 1 VU for 5 minutes (cooldown)
```

#### Soak Test (4 hours, 50-200 VUs)
```
Stage 1: 1 VU for 5 minutes (warmup)
Stage 2: 50 VUs over 10 minutes (ramp-up)
Stage 3: 150 VUs for 3h 30m (sustain)
Stage 4: 50 VUs over 10 minutes (ramp-down)
Stage 5: 1 VU for 5 minutes (cooldown)
```

---

## Running Tests

### Basic Command Structure
```bash
k6 run [options] <script.js>
```

### Common Options
```bash
--vus N              # Number of virtual users
--duration 30s       # Test duration (e.g., 30s, 5m, 1h)
--ramp-up 30s       # Ramp-up duration
--stage duration,vus # Multiple test stages
--out json=file.json # Export metrics to JSON
--out csv=file.csv   # Export metrics to CSV
-e KEY=VALUE        # Set environment variables
```

### Running Individual Tests

#### 1. Smoke Test (Quick Validation)
```bash
k6 run \
  --vus 5 \
  --duration 1m \
  -e API_BASE_URL=http://localhost:3000 \
  k6_tests/01_auth_setup.js
```

#### 2. Load Test (Payment Processing)
```bash
k6 run \
  --stage 2m:1vu \
  --stage 5m:100vu \
  --stage 15m:200vu \
  --stage 5m:100vu \
  --stage 3m:1vu \
  -e API_BASE_URL=http://localhost:3000 \
  k6_tests/02_payment_load_test.js
```

#### 3. Stress Test (Breaking Point)
```bash
k6 run \
  --stage 2m:1vu \
  --stage 5m:500vu \
  --stage 10m:2000vu \
  --stage 10m:5000vu \
  --stage 8m:500vu \
  --stage 5m:1vu \
  -e API_BASE_URL=http://localhost:3000 \
  k6_tests/06_spike_stress_test.js
```

#### 4. Soak Test (Long-term Stability)
```bash
k6 run \
  --stage 5m:1vu \
  --stage 10m:50vu \
  --stage 3h30m:150vu \
  --stage 10m:50vu \
  --stage 5m:1vu \
  -e API_BASE_URL=http://localhost:3000 \
  k6_tests/01_auth_setup.js
```

### Running All Tests Suite
```bash
./run_all_tests.sh
```

### Running with InfluxDB + Grafana

#### Start InfluxDB
```bash
docker run -d -p 8086:8086 -e INFLUXDB_DB=k6 influxdb:1.8
```

#### Start Grafana
```bash
docker run -d -p 3000:3000 grafana/grafana:latest
```

#### Run Tests with InfluxDB Output
```bash
k6 run \
  --out influxdb=http://localhost:8086/k6 \
  k6_tests/02_payment_load_test.js
```

#### View Results in Grafana
1. Navigate to http://localhost:3000
2. Add InfluxDB data source: http://localhost:8086
3. Import k6 dashboard or create custom dashboards

### Running Tests with Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3'
services:
  influxdb:
    image: influxdb:1.8
    ports:
      - "8086:8086"
    environment:
      - INFLUXDB_DB=k6

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    depends_on:
      - influxdb

  k6:
    image: grafana/k6:latest
    volumes:
      - ./k6_tests:/scripts
    command: run --out influxdb=http://influxdb:8086/k6 /scripts/02_payment_load_test.js
    depends_on:
      - influxdb
```

Run with:
```bash
docker-compose up
```

---

## Test Scenarios

### 1. Authentication & Setup Test (01_auth_setup.js)

**Purpose**: Validate authentication flow and account setup under load

**What it tests**:
- User registration with realistic data
- Email/phone verification
- JWT token generation
- Merchant KYC submission
- Settlement configuration
- API key generation

**Configuration**:
- **VUs**: 50-100 (sequential user creation)
- **Duration**: 10-15 minutes
- **Success Rate Target**: 95%+
- **P95 Latency Target**: <1000ms per operation

**Key Metrics**:
- Registration success rate
- Email verification latency
- Token generation time
- KYC submission success rate
- API key creation time

**Commands**:
```bash
# Smoke test
k6 run --vus 10 --duration 2m k6_tests/01_auth_setup.js

# Load test
k6 run --stage 2m:1vu --stage 5m:50vu --stage 10m:100vu --stage 5m:1vu k6_tests/01_auth_setup.js
```

---

### 2. Payment Load Test (02_payment_load_test.js)

**Purpose**: Test concurrent payment processing at scale

**What it tests**:
- Individual payment transactions
- Concurrent payment processing (1000+/minute target)
- Idempotency key handling
- Transaction status checks
- Payment reversal/cancellation
- Wallet balance updates

**Configuration**:
- **VUs**: 100-500 (parallel transactions)
- **Duration**: 30 minutes
- **Success Rate Target**: 99%+
- **P95 Latency Target**: <500ms
- **P99 Latency Target**: <1000ms
- **Throughput Target**: 1000+ TPS

**Key Metrics**:
- Transaction success rate
- Payment processing latency (p50, p95, p99)
- Idempotency effectiveness
- Concurrent transaction limits
- Failed transaction error distribution

**Test Scenarios**:
```javascript
// Small payments (90% of traffic)
POST /payments {amount: 100-500, currency: "USD"}

// Large payments (5% of traffic)
POST /payments {amount: 5000-50000, currency: "USD"}

// Retries with idempotency key (5% of traffic)
POST /payments {idempotency_key: uuid()}

// Transaction status checks
GET /transactions/{transactionId}

// Balance inquiries
GET /wallets/{walletId}/balance
```

**Commands**:
```bash
# Load test - 200 concurrent payments
k6 run \
  --stage 2m:1vu \
  --stage 5m:100vu \
  --stage 15m:200vu \
  --stage 5m:100vu \
  --stage 3m:1vu \
  k6_tests/02_payment_load_test.js

# Stress test - up to 500 concurrent payments
k6 run \
  --stage 2m:1vu \
  --stage 5m:200vu \
  --stage 10m:350vu \
  --stage 10m:500vu \
  --stage 8m:200vu \
  --stage 5m:1vu \
  k6_tests/02_payment_load_test.js
```

---

### 3. Request Signing Test (03_request_signing_test.js)

**Purpose**: Verify API request signing mechanism under load

**What it tests**:
- HMAC-SHA256 signature generation
- Signature verification on server
- Nonce uniqueness and TTL
- Timestamp validation (±5 minute window)
- Response signature verification
- AES-256-GCM decryption performance

**Configuration**:
- **VUs**: 50-200
- **Duration**: 15 minutes
- **Success Rate Target**: 100% (cryptographic operations must not fail)
- **P95 Latency Target**: <300ms (signature generation overhead)

**Key Metrics**:
- Signature generation time
- Signature verification success rate
- Nonce collision rate (should be 0)
- Timestamp validation accuracy
- Response decryption latency
- Cryptographic operation overhead

**Test Scenarios**:
```javascript
// Valid signatures
POST /api/endpoint with valid HMAC-SHA256 signature

// Invalid signatures (error rate testing)
- Tampered request body
- Tampered signature
- Stale timestamp
- Reused nonce

// Response verification
- Valid response signature
- Tampered response
- Decryption performance
```

**Commands**:
```bash
k6 run \
  --stage 2m:1vu \
  --stage 5m:50vu \
  --stage 10m:150vu \
  --stage 5m:50vu \
  --stage 3m:1vu \
  k6_tests/03_request_signing_test.js
```

---

### 4. Subscription Load Test (04_subscription_load_test.js)

**Purpose**: Test batch subscription charging at scale

**What it tests**:
- Subscription plan creation
- User subscription enrollment
- Recurring charge processing
- Batch charging (1000+ subscriptions/minute)
- Retry logic with exponential backoff
- Failed payment handling
- Dunning notifications
- Subscription status transitions

**Configuration**:
- **VUs**: 100-300 (simulating batch job)
- **Duration**: 20 minutes
- **Success Rate Target**: 97%+ (allowing for intentional failures in mock)
- **P95 Latency Target**: <800ms per charge
- **Batch Throughput**: 1000+/minute

**Key Metrics**:
- Subscription creation rate
- Charge processing latency
- Batch processing efficiency
- Retry success rate
- Failed charge rate
- Dunning notification delivery

**Test Scenarios**:
```javascript
// Create subscription plans
POST /subscriptions/plans {name, amount, interval: "monthly"}

// Enroll users
POST /subscriptions/enroll {planId, userId}

// Trigger batch charging
POST /subscriptions/process-charges

// Check subscription status
GET /subscriptions/{subscriptionId}

// Handle failures
POST /subscriptions/{subscriptionId}/retry-charge
```

**Commands**:
```bash
k6 run \
  --stage 2m:1vu \
  --stage 5m:100vu \
  --stage 15m:250vu \
  --stage 5m:100vu \
  --stage 3m:1vu \
  k6_tests/04_subscription_load_test.js
```

---

### 5. Fraud Detection Test (05_fraud_detection_test.js)

**Purpose**: Test fraud detection engine performance and accuracy

**What it tests**:
- Real-time fraud risk scoring (<500ms requirement)
- 10 weighted risk factor calculations
- Device fingerprinting
- Geographic anomaly detection
- Velocity checks
- Behavioral profiling
- Blacklist matching
- Risk threshold evaluation

**Configuration**:
- **VUs**: 200-500
- **Duration**: 25 minutes
- **Success Rate Target**: 100% (scoring must complete)
- **P95 Latency Target**: <300ms
- **P99 Latency Target**: <500ms
- **Detection Accuracy**: <2% false positive rate

**Key Metrics**:
- Fraud score calculation latency (p50, p95, p99)
- Risk factor evaluation time
- Device fingerprint matching latency
- Geographic check latency
- Blacklist query latency
- Overall scoring accuracy

**Test Scenarios**:
```javascript
// Normal transaction (low fraud score)
{amount: 100, merchant: "known", location: "home_country"}

// Suspicious transaction (high fraud score)
{amount: 10000, merchant: "unknown", location: "foreign"}

// Velocity attack (multiple rapid transactions)
Multiple transactions within 60 seconds

// Geographic anomaly (impossible travel)
Transaction in UK, then transaction in Japan 5 minutes later

// Device mismatch (new device, known location)
New device fingerprint, known merchant
```

**Commands**:
```bash
k6 run \
  --stage 2m:1vu \
  --stage 5m:100vu \
  --stage 15m:300vu \
  --stage 10m:500vu \
  --stage 5m:100vu \
  --stage 3m:1vu \
  k6_tests/05_fraud_detection_test.js
```

---

### 6. Spike & Stress Test (06_spike_stress_test.js)

**Purpose**: Identify system breaking point and recovery behavior

**What it tests**:
- System behavior under sudden traffic spikes
- Resource exhaustion handling
- Error rate degradation
- Recovery after spike subsides
- Queue/buffer handling
- Connection pooling limits
- Rate limiting effectiveness

**Configuration**:
- **Spike Test**: 100 VUs → 5000 VUs in 30 seconds
- **Stress Test**: Gradual increase to 5000 VUs over 20 minutes
- **Duration**: 40 minutes
- **Success Rate Target**: >80% (degradation expected)
- **Error Recovery**: System recovers within 5 minutes after spike

**Key Metrics**:
- Error rate increase during spike
- Latency degradation curve
- Recovery time after spike
- Queue/buffer depth during peak
- Timeout rate during stress
- Resource utilization patterns

**Test Scenarios**:
```javascript
// Spike scenario
- 100 VUs for 2 minutes
- Sudden jump to 5000 VUs for 2 minutes
- Drop back to 100 VUs
- Monitor recovery

// Stress scenario
- Gradual increase from 500 to 5000 VUs over 20 minutes
- Sustain at 5000 VUs for 10 minutes
- Monitor breaking point
- Graceful degradation
```

**Commands**:
```bash
# Spike test
k6 run \
  --stage 2m:100vu \
  --stage 30s:5000vu \
  --stage 2m:100vu \
  --stage 5m:1vu \
  k6_tests/06_spike_stress_test.js

# Stress test
k6 run \
  --stage 2m:1vu \
  --stage 20m:5000vu \
  --stage 10m:5000vu \
  --stage 5m:1vu \
  k6_tests/06_spike_stress_test.js
```

---

### 7. Realistic Scenario Test (07_realistic_scenario.js)

**Purpose**: End-to-end simulation of real user workflows

**What it tests**:
- User registration → setup → payment flow
- Merchant onboarding → transaction settlement
- Dispute filing → investigation → resolution
- Subscription enrollment → recurring charges → cancellation
- Refund requests → approval → payout
- Analytics queries and reporting

**Configuration**:
- **VUs**: 150-300
- **Duration**: 30 minutes
- **Think Time**: 1-3 seconds between API calls (realistic user behavior)
- **Success Rate Target**: 95%+
- **End-to-End Latency Target**: <5 seconds per workflow

**Key Metrics**:
- Complete workflow success rate
- Individual step latency
- Workflow completion time
- Error distribution by step
- State transition accuracy

**Test Scenarios**:
```javascript
// Workflow 1: User Payment
1. Register user → 2. Create wallet → 3. Add payment method →
4. Make payment → 5. Verify transaction → 6. Get receipt

// Workflow 2: Merchant Settlement
1. Register merchant → 2. Configure settlement →
3. Process transactions → 4. Check settlement schedule

// Workflow 3: Dispute Resolution
1. Create dispute → 2. Submit evidence → 3. Await investigation →
4. Receive resolution → 5. Process refund

// Workflow 4: Subscription Lifecycle
1. Create plan → 2. Enroll user → 3. Process charge →
4. View history → 5. Cancel subscription
```

**Commands**:
```bash
k6 run \
  --stage 2m:1vu \
  --stage 5m:100vu \
  --stage 15m:200vu \
  --stage 5m:150vu \
  --stage 3m:1vu \
  k6_tests/07_realistic_scenario.js
```

---

## Performance Thresholds

### Global Thresholds (All Tests)

```javascript
export const options = {
  thresholds: {
    // HTTP Status Code Distribution
    'http_req_failed': ['rate<0.05'],           // <5% error rate
    'http_reqs': ['count>1000'],                // >1000 requests minimum

    // Latency Thresholds (ms)
    'http_req_duration': [
      'p(95)<1000',    // 95th percentile <1s
      'p(99)<2000',    // 99th percentile <2s
      'avg<500'        // Average <500ms
    ],

    // Connection & TLS
    'http_req_connecting': ['p(95)<100'],       // Connection establishment <100ms
    'http_req_tls_handshaking': ['p(95)<200'],  // TLS handshake <200ms

    // Throughput
    'http_reqs': ['rate>=100'],                 // Minimum 100 req/s

    // Custom Metrics
    'signup_duration': ['p(95)<2000'],          // Signup <2 seconds
    'payment_duration': ['p(95)<1000'],         // Payment <1 second
    'fraud_check_duration': ['p(95)<500']       // Fraud check <500ms
  }
};
```

### Test-Specific Thresholds

#### Payment Load Test
```javascript
{
  'http_req_failed': ['rate<0.01'],           // <1% error rate (critical)
  'http_req_duration': [
    'p(50)<200',
    'p(95)<500',
    'p(99)<1000',
    'avg<300'
  ],
  'payment_success_rate': ['value>0.99']      // >99% success rate
}
```

#### Fraud Detection Test
```javascript
{
  'http_req_failed': ['rate<0.001'],          // <0.1% error rate
  'fraud_check_duration': [
    'p(50)<200',
    'p(95)<300',
    'p(99)<500',
    'avg<250'
  ],
  'fraud_score_accuracy': ['value>0.98']      // >98% accuracy
}
```

#### Subscription Batch Processing
```javascript
{
  'http_req_failed': ['rate<0.03'],           // <3% error rate (allowing retries)
  'batch_processing_duration': [
    'p(95)<2000',
    'p(99)<5000',
    'avg<1000'
  ],
  'batch_throughput': ['value>1000']          // >1000 items/minute
}
```

---

## Reporting & Analysis

### Live Metrics During Test

K6 provides real-time metrics output:
```
     data_received..................: 12 MB  3.2 kB/s
     data_sent.......................: 2.1 MB  564 B/s
     http_req_blocked................: avg=23ms   p(95)=45ms  p(99)=89ms
     http_req_connecting.............: avg=12ms   p(95)=23ms  p(99)=45ms
     http_req_duration...............: avg=521ms  p(95)=892ms p(99)=1.2s
     http_req_failed.................: 0.23%
     http_req_receiving..............: avg=34ms   p(95)=67ms   p(99)=123ms
     http_req_sending................: avg=12ms   p(95)=23ms   p(99)=45ms
     http_req_tls_handshaking........: avg=45ms   p(95)=78ms   p(99)=156ms
     http_req_waiting................: avg=435ms  p(95)=812ms  p(99)=1.1s
     http_reqs........................: 12345   3.3 req/s
     iteration_duration..............: avg=5.2s   p(95)=8.1s   p(99)=12.3s
     iterations.......................: 2345    0.6 iterations/s
     vus.............................: 100
     vus_max..........................: 100
```

### Exporting Metrics

#### JSON Export
```bash
k6 run --out json=results.json k6_tests/02_payment_load_test.js
```

#### CSV Export
```bash
k6 run --out csv=results.csv k6_tests/02_payment_load_test.js
```

#### Multiple Outputs
```bash
k6 run \
  --out json=results.json \
  --out csv=results.csv \
  --out influxdb=http://localhost:8086/k6 \
  k6_tests/02_payment_load_test.js
```

### Analyzing JSON Results

Parse and visualize results:
```javascript
// Extract key metrics from JSON output
const results = JSON.parse(fs.readFileSync('results.json', 'utf8'));

// Calculate aggregate metrics
const httpMetrics = results.metrics['http_req_duration'];
const p95 = httpMetrics.values.p_95;
const p99 = httpMetrics.values.p_99;
const avg = httpMetrics.values.avg;

// Identify outliers
const slowRequests = results.samples.filter(s => 
  s.data.value > 5000 && s.metric === 'http_req_duration'
);
```

### HTML Reports

Generate custom HTML reports:
```bash
# Using k6 HTML plugin
k6 run --out html=report.html k6_tests/02_payment_load_test.js
```

### Grafana Dashboard

Pre-built dashboard includes:
- Request rate (RPS) over time
- Latency distribution (p50, p95, p99)
- Error rate trends
- Virtual user ramp-up
- Memory/CPU utilization
- Custom metric tracking

**Access**: http://localhost:3000 → Dashboards → k6

---

## Best Practices

### 1. Test Data Management

```javascript
// Use realistic, randomized data
const testData = {
  amounts: [10, 50, 100, 500, 1000, 5000],  // Varied payment amounts
  currencies: ['USD', 'EUR', 'GBP', 'NGN'], // Multiple currencies
  merchants: [/* 100+ merchant IDs */],      // Large merchant pool
  users: [/* 1000+ user IDs */]              // Large user pool
};

// Avoid hotspots
const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
```

### 2. Think Times

Simulate realistic user behavior:
```javascript
// Add think time between requests
client.sleep(Math.random() * 2); // 0-2 second pause

// Vary think time based on action
if (action === 'checkout') {
  client.sleep(2 + Math.random() * 3); // 2-5 seconds for decision
}
```

### 3. Error Handling

Handle and track errors:
```javascript
const response = http.post(url, payload);

// Check for specific error conditions
if (response.status === 429) {
  console.log('Rate limited');
} else if (response.status === 5xx) {
  console.log('Server error');
}

// Use thresholds to track error rates
check(response, {
  'status is 200': (r) => r.status === 200,
  'response time < 1s': (r) => r.timings.duration < 1000,
});
```

### 4. Virtual User Ramp-up

Gradually increase load to identify bottlenecks:
```javascript
export const options = {
  stages: [
    { duration: '1m', target: 10 },    // Ramp up
    { duration: '3m', target: 50 },    // Ramp up
    { duration: '5m', target: 100 },   // Sustain
    { duration: '2m', target: 0 },     // Ramp down
  ]
};
```

### 5. Idempotency & Retries

Ensure idempotent requests:
```javascript
const response = http.post(url, {
  idempotency_key: `${userId}-${timestamp}-${Math.random()}`,
  amount: 100,
  currency: 'USD'
});

// Safe to retry on transient failures
if (response.status === 502 || response.status === 503) {
  client.sleep(1);
  http.post(url, /* same payload with same idempotency_key */);
}
```

### 6. Test Isolation

Keep tests independent:
```javascript
// Each test should create its own test data
function setup() {
  const user = createTestUser();
  const wallet = createWallet(user.id);
  return { userId: user.id, walletId: wallet.id };
}

export default function(data) {
  // Use data created in setup
  const response = http.get(`/wallets/${data.walletId}`);
}
```

### 7. Monitoring & Alerting

Set up alerts for threshold violations:
```javascript
// Alert when error rate exceeds threshold
if (errorRate > 0.05) {
  console.error(`ALERT: Error rate ${errorRate} exceeds 5%`);
}

// Alert when latency degrades
if (p95Latency > 1000) {
  console.error(`ALERT: p95 latency ${p95Latency}ms exceeds 1s`);
}
```

### 8. Post-Test Analysis

Generate insights:
```bash
# View summary
cat results.json | jq '.metrics'

# Extract specific metric
cat results.json | jq '.metrics."http_req_duration".values'

# Count errors by type
cat results.json | jq '.samples[] | select(.metric == "http_req_failed") | .data.error_code' | sort | uniq -c
```

### 9. CI/CD Integration

Integrate tests into CI pipeline:
```bash
#!/bin/bash
# run_k6_tests.sh

set -e

# Run tests with thresholds
k6 run \
  --vus 100 \
  --duration 5m \
  -e API_BASE_URL=$API_URL \
  k6_tests/02_payment_load_test.js

# Check exit code (k6 exits with 1 if thresholds fail)
if [ $? -ne 0 ]; then
  echo "Performance thresholds failed"
  exit 1
fi
```

### 10. Baseline & Regression Testing

Establish performance baselines:
```javascript
// Store baseline metrics
const baseline = {
  p95_latency: 850,
  p99_latency: 1200,
  error_rate: 0.001,
  throughput: 1500
};

// Compare against baseline in new tests
export default function() {
  const response = http.post(...);
  
  check(response, {
    'p95 latency within 10% of baseline': (r) => 
      r.timings.duration < baseline.p95_latency * 1.1
  });
}
```

---

## Troubleshooting

### High Error Rates

**Symptoms**: Error rate > 5%, many 500/502/503 responses

**Causes**:
- Backend service overloaded
- Database connection pool exhausted
- Memory leaks in service
- Cascading failures from upstream dependencies

**Solutions**:
1. Reduce VU count and re-run
2. Check backend service logs
3. Monitor CPU/memory usage
4. Verify database connection limits
5. Enable request logging to see error patterns

### High Latency

**Symptoms**: p95/p99 latency > 2s, degrading over time

**Causes**:
- Backend processing bottleneck
- I/O bound operations (database queries)
- Garbage collection pauses
- Network saturation

**Solutions**:
1. Profile backend to identify slow operations
2. Optimize slow database queries
3. Increase connection pool size
4. Check network bandwidth usage
5. Examine garbage collection logs

### Memory/Resource Exhaustion

**Symptoms**: Test stops responding, connection timeouts

**Causes**:
- Too many open connections
- Memory leak in service
- File descriptor limits exceeded
- Disk space exhausted

**Solutions**:
1. Increase system limits: `ulimit -n 65536`
2. Use load balancer to distribute connections
3. Profile backend memory usage
4. Check disk space: `df -h`
5. Restart backend service

### Inconsistent Results

**Symptoms**: Same test produces different results each run

**Causes**:
- Cache warming effects
- Random variations in test data
- External service latency variability
- System load variations

**Solutions**:
1. Increase test duration for better averages
2. Run multiple test iterations
3. Use consistent test data where appropriate
4. Run on dedicated testing infrastructure
5. Disable system background processes

---

## Additional Resources

- [k6 Official Documentation](https://k6.io/docs/)
- [k6 GitHub Repository](https://github.com/grafana/k6)
- [k6 Community Forum](https://community.k6.io/)
- [Performance Testing Handbook](https://k6.io/handbook/)
- [Load Testing Best Practices](https://www.loadimpact.com/blog/)

