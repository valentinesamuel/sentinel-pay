/**
 * K6 Load Test: Payment Processing
 * Tests concurrent payment transaction processing at scale
 * Target: 1000+ TPS, <500ms p95 latency
 *
 * Run with:
 * k6 run --stage 2m:1vu --stage 5m:100vu --stage 15m:200vu --stage 5m:100vu --stage 3m:1vu k6_tests/02_payment_load_test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import {
  generatePaymentData,
  signedPost,
  authGet,
  checkSuccess,
  checkLatency,
  parseResponse,
  addThinkTime,
  randomInt,
  randomItem,
  log,
  Constants
} from './00_utils.js';

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 1 },     // Warmup
    { duration: '5m', target: 100 },   // Ramp up to 100 VUs
    { duration: '15m', target: 200 },  // Ramp up to 200 VUs
    { duration: '5m', target: 100 },   // Ramp down
    { duration: '3m', target: 1 },     // Cooldown
  ],
  thresholds: {
    'http_req_duration': [
      'p(50)<200',
      'p(95)<500',
      'p(99)<1000',
      'avg<300'
    ],
    'http_req_failed': ['rate<0.01'],  // <1% error rate
    'payment_success_rate': ['value>0.99'],
    'payment_latency_p95': ['value<500'],
    'http_reqs': ['rate>=100']          // Minimum 100 req/s
  },
  ext: {
    loadimpact: {
      projectID: 3326635,
      name: 'Payment Processing Load Test'
    }
  }
};

// Global metrics
let paymentSuccess = 0;
let paymentFailure = 0;
let totalPaymentAmount = 0;

export default function () {
  const testData = {
    userId: `user_${randomInt(1, 10000)}`,
    walletId: `wallet_${randomInt(1, 10000)}`,
    merchantId: `merchant_${randomInt(1, 5000)}`
  };

  group('Single Payment Transaction', () => {
    const paymentData = generatePaymentData();

    // Process payment
    const paymentRes = signedPost('/payments', {
      ...paymentData,
      walletId: testData.walletId,
      merchantId: testData.merchantId
    });

    const isSuccess = checkSuccess(paymentRes, 'Payment successful');
    checkLatency(paymentRes, 500, 'Payment latency < 500ms');

    if (isSuccess) {
      paymentSuccess++;
      totalPaymentAmount += paymentData.amount;

      const body = parseResponse(paymentRes);
      const transactionId = body.data?.transactionId || body.transactionId;

      if (transactionId) {
        // Small delay to simulate processing
        sleep(0.1);

        // Verify transaction status
        group('Verify Transaction Status', () => {
          const statusRes = http.get(
            `${Constants.API_BASE_URL}/transactions/${transactionId}`,
            {
              headers: {
                'X-API-Key': Constants.API_KEY,
                'Content-Type': 'application/json'
              }
            }
          );

          checkSuccess(statusRes, 'Get transaction status');
          checkLatency(statusRes, 300, 'Status check < 300ms');

          const statusBody = parseResponse(statusRes);
          check(statusRes, {
            'Transaction state is valid': (r) => {
              const state = statusBody.data?.state;
              return ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'].includes(state);
            }
          });
        });
      }
    } else {
      paymentFailure++;
    }
  });

  // Idempotency test - 5% of traffic retries with same idempotency key
  if (Math.random() < 0.05) {
    group('Idempotency Key Retry', () => {
      const idempotencyKey = `idempotent-${randomInt(1, 1000)}`;
      const paymentData = generatePaymentData(100); // Fixed amount

      // First request
      const firstRes = signedPost('/payments', {
        ...paymentData,
        idempotency_key: idempotencyKey,
        walletId: testData.walletId,
        merchantId: testData.merchantId
      });

      checkSuccess(firstRes, 'First payment attempt');

      if (firstRes.status === 201) {
        sleep(0.2);

        // Retry with same key - should return same transaction
        const retryRes = signedPost('/payments', {
          ...paymentData,
          idempotency_key: idempotencyKey,
          walletId: testData.walletId,
          merchantId: testData.merchantId
        });

        check(retryRes, {
          'Retry returns 200 or 409': (r) => r.status === 200 || r.status === 409,
          'Idempotency key prevents duplicate': (r) => r.status !== 201
        });
      }
    });
  }

  // Check wallet balance - 10% of traffic
  if (Math.random() < 0.1) {
    group('Check Wallet Balance', () => {
      const balanceRes = http.get(
        `${Constants.API_BASE_URL}/wallets/${testData.walletId}/balance`,
        {
          headers: {
            'X-API-Key': Constants.API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      checkSuccess(balanceRes, 'Get wallet balance');
      checkLatency(balanceRes, 200, 'Balance check < 200ms');

      const balanceBody = parseResponse(balanceRes);
      check(balanceRes, {
        'Balance is number': (r) => typeof balanceBody.data?.balance === 'number',
        'Currency present': (r) => balanceBody.data?.currency !== undefined
      });
    });
  }

  // Large payment - 5% of traffic processes large transactions
  if (Math.random() < 0.05) {
    group('Large Payment Transaction', () => {
      const largePayment = generatePaymentData(randomInt(10000, 50000));

      const largeRes = signedPost('/payments', {
        ...largePayment,
        walletId: testData.walletId,
        merchantId: testData.merchantId,
        requiresApproval: true
      });

      checkSuccess(largeRes, 'Large payment processed');
      checkLatency(largeRes, 800, 'Large payment < 800ms');
    });
  }

  // Payment cancellation - 2% of traffic
  if (Math.random() < 0.02) {
    group('Cancel Pending Payment', () => {
      const paymentData = generatePaymentData();

      const paymentRes = signedPost('/payments', {
        ...paymentData,
        walletId: testData.walletId,
        merchantId: testData.merchantId
      });

      if (paymentRes.status === 201) {
        const body = parseResponse(paymentRes);
        const transactionId = body.data?.transactionId;

        if (transactionId && body.data?.state === 'PENDING') {
          sleep(0.1);

          // Cancel the payment
          const cancelRes = signedPost(`/payments/${transactionId}/cancel`, {
            reason: 'USER_REQUESTED'
          });

          checkSuccess(cancelRes, 'Payment cancelled');
        }
      }
    });
  }
}

export function teardown(data) {
  const successRate = (paymentSuccess / (paymentSuccess + paymentFailure || 1) * 100).toFixed(2);
  const avgTransaction = paymentSuccess > 0 ? (totalPaymentAmount / paymentSuccess).toFixed(2) : 0;

  log('info', 'Payment test completed', {
    totalPayments: paymentSuccess + paymentFailure,
    successfulPayments: paymentSuccess,
    failedPayments: paymentFailure,
    successRate: successRate + '%',
    totalAmount: totalPaymentAmount,
    averageTransaction: avgTransaction
  });
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// Helper for summary output
function textSummary(data, options) {
  const { indent = '', enableColors = false } = options;
  let summary = '\n';

  summary += `${indent}Payment Processing Test Summary\n`;
  summary += `${indent}================================\n`;
  summary += `${indent}Total Payments: ${paymentSuccess + paymentFailure}\n`;
  summary += `${indent}Successful: ${paymentSuccess}\n`;
  summary += `${indent}Failed: ${paymentFailure}\n`;
  summary += `${indent}Success Rate: ${((paymentSuccess / (paymentSuccess + paymentFailure || 1)) * 100).toFixed(2)}%\n`;
  summary += `${indent}Total Amount Processed: $${totalPaymentAmount.toFixed(2)}\n`;

  return summary;
}
