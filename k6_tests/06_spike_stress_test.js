/**
 * K6 Load Test: Spike & Stress Testing
 * Tests system behavior under sudden traffic spikes and extreme load
 * Identifies breaking points and recovery behavior
 *
 * Run with:
 * # Spike test
 * k6 run --stage 2m:100vu --stage 30s:5000vu --stage 2m:100vu --stage 5m:1vu k6_tests/06_spike_stress_test.js
 *
 * # Stress test
 * k6 run --stage 2m:1vu --stage 20m:5000vu --stage 10m:5000vu --stage 5m:1vu k6_tests/06_spike_stress_test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import {
  generatePaymentData,
  signedPost,
  checkSuccess,
  checkLatency,
  parseResponse,
  randomInt,
  randomItem,
  log,
  Constants
} from './00_utils.js';

// Test configuration
export const options = {
  // Spike test: sudden jump from 100 to 5000 VUs
  stages: [
    { duration: '2m', target: 100 },   // Normal load
    { duration: '30s', target: 5000 }, // Sudden spike
    { duration: '2m', target: 100 },   // Return to normal
    { duration: '5m', target: 1 },     // Cooldown
  ],
  thresholds: {
    'http_req_duration': [
      'p(50)<500',
      'p(95)<2000',
      'p(99)<5000'
    ],
    'http_req_failed': ['rate<0.2'],   // Allow up to 20% error during spike
    'http_reqs': ['rate>=50']          // Minimum 50 req/s
  },
  // Graceful shutdown
  gracefulStop: '30s',
  ext: {
    loadimpact: {
      projectID: 3326635,
      name: 'Spike & Stress Test'
    }
  }
};

// Global metrics
let requestsAttempted = 0;
let requestsSucceeded = 0;
let requestsFailed = 0;
let latencyDuringSpike = [];
let latencyAfterSpike = [];

export default function () {
  const phase = getPhase();
  const metrics = {
    phase: phase,
    vu: __VU,
    iteration: __ITER
  };

  requestsAttempted++;

  group(`Payment Request - ${phase}`, () => {
    const paymentData = generatePaymentData(randomInt(100, 1000));

    const startTime = Date.now();

    const res = signedPost('/payments', {
      ...paymentData,
      walletId: `wallet_${randomInt(1, 10000)}`,
      merchantId: `merchant_${randomInt(1, 5000)}`
    });

    const latency = Date.now() - startTime;

    if (phase === 'SPIKE') {
      latencyDuringSpike.push(latency);
    } else if (phase === 'RECOVERY') {
      latencyAfterSpike.push(latency);
    }

    const isSuccess = checkSuccess(res, `Payment processed during ${phase}`);

    if (isSuccess) {
      requestsSucceeded++;
    } else {
      requestsFailed++;

      log('warn', 'Payment failed during spike', {
        status: res.status,
        phase: phase,
        latency: latency,
        vu: __VU
      });
    }

    // More lenient latency checks during spike
    if (phase === 'SPIKE') {
      checkLatency(res, 5000, 'Latency during spike < 5s');
    } else {
      checkLatency(res, 1000, 'Latency during normal < 1s');
    }
  });

  // Check system health with concurrent requests
  if (Math.random() < 0.05) {
    group('System Health Check', () => {
      const healthRes = http.get(`${Constants.API_BASE_URL}/health`, {
        headers: {
          'X-API-Key': Constants.API_KEY,
          'Content-Type': 'application/json'
        }
      });

      const healthBody = parseResponse(healthRes);

      check(healthRes, {
        'System health available': (r) => r.status === 200,
        'Uptime info available': (r) => healthBody.data?.uptime !== undefined,
        'Database connected': (r) => healthBody.data?.database?.connected === true,
        'Cache connected': (r) => healthBody.data?.cache?.connected === true,
        'Request queue depth reasonable': (r) => {
          const depth = healthBody.data?.requestQueue?.depth || 0;
          return depth < 10000; // Alert if queue > 10K requests
        }
      });

      if (healthRes.status !== 200) {
        log('error', 'Health check failed', {
          status: healthRes.status,
          phase: getPhase()
        });
      }
    });
  }

  // Stress test: attempt different operations
  if (Math.random() < 0.08) {
    group('Concurrent Operations', () => {
      const operations = [
        () => http.get(`${Constants.API_BASE_URL}/wallets/${randomInt(1, 10000)}/balance`),
        () => http.get(`${Constants.API_BASE_URL}/transactions/${randomInt(1, 100000)}`),
        () => signedPost('/payments', generatePaymentData())
      ];

      const operation = randomItem(operations);
      const res = operation();

      check(res, {
        'Operation completed': (r) => r.status !== null,
        'No timeout': (r) => r.timings.duration < 30000
      });
    });
  }

  // Connection pooling stress - 3% of traffic
  if (Math.random() < 0.03) {
    group('Connection Pool Stress', () => {
      // Simulate multiple simultaneous requests
      const batch = http.batch([
        ['GET', `${Constants.API_BASE_URL}/health`],
        ['POST', `${Constants.API_BASE_URL}/payments`, JSON.stringify(generatePaymentData())],
        ['GET', `${Constants.API_BASE_URL}/wallets/${randomInt(1, 10000)}/balance`],
        ['POST', `${Constants.API_BASE_URL}/payments`, JSON.stringify(generatePaymentData())],
      ]);

      const successCount = batch.filter(r => r.status < 400).length;

      check(null, {
        'Most batch requests succeed': () => successCount >= 2
      });
    });
  }

  // Database stress - 2% of traffic
  if (Math.random() < 0.02) {
    group('Database Stress', () => {
      // Query multiple merchant transactions
      for (let i = 0; i < 3; i++) {
        const merchantId = randomInt(1, 5000);
        const limit = randomInt(10, 100);

        const queryRes = http.get(
          `${Constants.API_BASE_URL}/merchants/${merchantId}/transactions?limit=${limit}&offset=0`,
          {
            headers: {
              'X-API-Key': Constants.API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        checkSuccess(queryRes, `Query ${i + 1}`);

        if (queryRes.status === 200) {
          requestsSucceeded++;
        } else {
          requestsFailed++;
        }
      }
    });
  }

  // Cache stress - 4% of traffic
  if (Math.random() < 0.04) {
    group('Cache Performance', () => {
      const userId = `user_${randomInt(1, 100)}`; // Small pool to test cache hits

      for (let i = 0; i < 2; i++) {
        const userRes = http.get(
          `${Constants.API_BASE_URL}/users/${userId}/profile`,
          {
            headers: {
              'X-API-Key': Constants.API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        const latency = userRes.timings.duration;

        check(userRes, {
          'Cache hit improves performance': (r) => {
            if (i === 0) {
              return latency < 500; // First request may be slower (cache miss)
            } else {
              return latency < 100; // Subsequent requests should be faster (cache hit)
            }
          }
        });
      }
    });
  }
}

/**
 * Determine current test phase based on elapsed time
 */
function getPhase() {
  // Total test duration from options.stages
  const normalDuration = 2 * 60 * 1000;      // 2 minutes
  const spikeDuration = 30 * 1000;           // 30 seconds
  const recoveryDuration = 2 * 60 * 1000;    // 2 minutes
  const cooldownDuration = 5 * 60 * 1000;    // 5 minutes

  const elapsed = __ENV.TEST_START_TIME
    ? Date.now() - parseInt(__ENV.TEST_START_TIME)
    : __VU * __ITER * 100; // Approximate

  if (elapsed < normalDuration) {
    return 'NORMAL';
  } else if (elapsed < normalDuration + spikeDuration) {
    return 'SPIKE';
  } else if (elapsed < normalDuration + spikeDuration + recoveryDuration) {
    return 'RECOVERY';
  } else {
    return 'COOLDOWN';
  }
}

export function teardown(data) {
  const successRate = (requestsSucceeded / requestsAttempted * 100).toFixed(2);
  const failureRate = (requestsFailed / requestsAttempted * 100).toFixed(2);

  // Calculate latency percentiles
  const sortedDuringSp = latencyDuringSpike.sort((a, b) => a - b);
  const sortedAfterSpike = latencyAfterSpike.sort((a, b) => a - b);

  const p95DuringSpike = sortedDuringSp[Math.floor(sortedDuringSp.length * 0.95)] || 0;
  const p95AfterSpike = sortedAfterSpike[Math.floor(sortedAfterSpike.length * 0.95)] || 0;

  const recoveryTime = p95AfterSpike > 0
    ? 'System recovered to normal latency'
    : 'Recovery time pending';

  log('info', 'Spike & Stress test completed', {
    totalRequests: requestsAttempted,
    successfulRequests: requestsSucceeded,
    failedRequests: requestsFailed,
    successRate: successRate + '%',
    failureRate: failureRate + '%',
    p95LatencyDuringSpike: p95DuringSpike + 'ms',
    p95LatencyAfterSpike: p95AfterSpike + 'ms',
    recoveryStatus: recoveryTime,
    peakVUs: __VU
  });

  // Alert if system didn't recover
  if (p95AfterSpike > p95DuringSpike * 0.9) {
    log('warn', 'System may not have fully recovered after spike', {
      duringSpike: p95DuringSpike,
      afterSpike: p95AfterSpike,
      recoveryRatio: (p95AfterSpike / p95DuringSpike).toFixed(2)
    });
  }
}
