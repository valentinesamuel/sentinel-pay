/**
 * K6 Load Test: Subscription Processing
 * Tests batch subscription charging, retry logic, and lifecycle management
 * Target: 1000+/minute throughput, 97% success rate
 *
 * Run with:
 * k6 run --stage 2m:1vu --stage 5m:100vu --stage 15m:250vu --stage 5m:100vu --stage 3m:1vu k6_tests/04_subscription_load_test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import {
  generateSubscriptionData,
  generatePaymentData,
  signedPost,
  authPost,
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
    { duration: '5m', target: 100 },   // Ramp up
    { duration: '15m', target: 250 },  // Sustain
    { duration: '5m', target: 100 },   // Ramp down
    { duration: '3m', target: 1 },     // Cooldown
  ],
  thresholds: {
    'http_req_duration': [
      'p(50)<300',
      'p(95)<800',
      'p(99)<2000',
      'avg<500'
    ],
    'http_req_failed': ['rate<0.03'],  // <3% error rate (allowing retries)
    'subscription_success_rate': ['value>0.97'],
    'charge_success_rate': ['value>0.97'],
    'batch_throughput': ['value>1000']
  },
  ext: {
    loadimpact: {
      projectID: 3326635,
      name: 'Subscription Processing Load Test'
    }
  }
};

// Global metrics
let plansCreated = 0;
let subscriptionsEnrolled = 0;
let chargesProcessed = 0;
let chargesSucceeded = 0;
let chargesFailed = 0;
let retriesAttempted = 0;
let retriesSucceeded = 0;

export default function () {
  const merchantId = `merchant_${randomInt(1, 1000)}`;
  const userId = `user_${randomInt(1, 10000)}`;

  group('Create Subscription Plan', () => {
    const planData = generateSubscriptionData();

    const planRes = signedPost('/subscriptions/plans', {
      ...planData,
      merchantId: merchantId
    });

    const isSuccess = checkSuccess(planRes, 'Plan created successfully');
    checkLatency(planRes, 1500, 'Plan creation < 1.5s');

    if (isSuccess) {
      plansCreated++;
      const body = parseResponse(planRes);
      const planId = body.data?.planId || body.planId;

      if (planId) {
        addThinkTime();

        // Enroll user to subscription
        group('Enroll User to Plan', () => {
          const enrollRes = signedPost('/subscriptions/enroll', {
            planId: planId,
            userId: userId,
            merchantId: merchantId,
            billingCycle: 'monthly',
            startDate: new Date().toISOString()
          });

          checkSuccess(enrollRes, 'User enrolled successfully');
          checkLatency(enrollRes, 1200, 'Enrollment < 1.2s');

          if (enrollRes.status === 201) {
            subscriptionsEnrolled++;
            const enrollBody = parseResponse(enrollRes);
            const subscriptionId = enrollBody.data?.subscriptionId;

            if (subscriptionId) {
              addThinkTime();

              // Get subscription details
              group('Fetch Subscription Details', () => {
                const detailsRes = http.get(
                  `${Constants.API_BASE_URL}/subscriptions/${subscriptionId}`,
                  {
                    headers: {
                      'X-API-Key': Constants.API_KEY,
                      'Content-Type': 'application/json'
                    }
                  }
                );

                checkSuccess(detailsRes, 'Get subscription details');
                checkLatency(detailsRes, 800, 'Details fetch < 800ms');

                const detailsBody = parseResponse(detailsRes);
                check(detailsRes, {
                  'Subscription status is active': (r) =>
                    ['ACTIVE', 'ENROLLED', 'PENDING'].includes(detailsBody.data?.status),
                  'Subscription has valid amount': (r) =>
                    detailsBody.data?.amount > 0
                });
              });

              addThinkTime();

              // Trigger immediate charge
              group('Process Subscription Charge', () => {
                const chargeRes = signedPost(`/subscriptions/${subscriptionId}/charge`, {
                  amount: planData.amount,
                  currency: planData.currency,
                  description: `Subscription charge for ${planData.planName}`
                });

                const chargeSuccess = checkSuccess(chargeRes, 'Charge processed');
                checkLatency(chargeRes, 1000, 'Charge < 1s');

                chargesProcessed++;

                if (chargeSuccess) {
                  chargesSucceeded++;
                  const chargeBody = parseResponse(chargeRes);
                  const chargeId = chargeBody.data?.chargeId;

                  check(chargeRes, {
                    'Charge has transaction ID': (r) => chargeId !== undefined,
                    'Charge status is valid': (r) => {
                      const status = chargeBody.data?.status;
                      return ['PENDING', 'COMPLETED', 'PROCESSING'].includes(status);
                    }
                  });
                } else {
                  chargesFailed++;

                  // 50% of failed charges should be retried
                  if (Math.random() < 0.5) {
                    sleep(0.5);

                    group('Retry Failed Charge', () => {
                      const retryRes = signedPost(
                        `/subscriptions/${subscriptionId}/charge/retry`,
                        {
                          reason: 'INSUFFICIENT_FUNDS',
                          attemptNumber: 1
                        }
                      );

                      retriesAttempted++;

                      if (checkSuccess(retryRes, 'Charge retry succeeded')) {
                        retriesSucceeded++;
                      }

                      checkLatency(retryRes, 1200, 'Retry < 1.2s');
                    });
                  }
                }
              });

              addThinkTime();

              // Get subscription history
              group('Fetch Subscription History', () => {
                const historyRes = http.get(
                  `${Constants.API_BASE_URL}/subscriptions/${subscriptionId}/history?limit=10`,
                  {
                    headers: {
                      'X-API-Key': Constants.API_KEY,
                      'Content-Type': 'application/json'
                    }
                  }
                );

                checkSuccess(historyRes, 'Get subscription history');
                checkLatency(historyRes, 600, 'History fetch < 600ms');

                const historyBody = parseResponse(historyRes);
                check(historyRes, {
                  'History is an array': (r) => Array.isArray(historyBody.data),
                  'History has charges': (r) => historyBody.data?.length > 0
                });
              });
            }
          }
        });

        // Random cancel 2% of subscriptions
        if (Math.random() < 0.02) {
          const cancelRes = signedPost(`/subscriptions/${planId}/cancel`, {
            userId: userId,
            reason: 'TEST_CANCELLATION'
          });

          checkSuccess(cancelRes, 'Subscription cancelled');
        }
      }
    }
  });

  // Batch charge processing - simulates scheduled job
  if (Math.random() < 0.15) {
    group('Batch Subscription Charging', () => {
      const batchRes = signedPost('/subscriptions/process-batch-charges', {
        batchSize: 100,
        merchantId: merchantId,
        processNow: true
      });

      checkSuccess(batchRes, 'Batch processing initiated');
      checkLatency(batchRes, 2000, 'Batch processing < 2s');

      if (batchRes.status === 200 || batchRes.status === 202) {
        const body = parseResponse(batchRes);
        const batchId = body.data?.batchId;

        if (batchId) {
          sleep(1);

          // Poll for batch status
          group('Check Batch Processing Status', () => {
            const statusRes = http.get(
              `${Constants.API_BASE_URL}/subscriptions/batch/${batchId}/status`,
              {
                headers: {
                  'X-API-Key': Constants.API_KEY,
                  'Content-Type': 'application/json'
                }
              }
            );

            checkSuccess(statusRes, 'Get batch status');
            checkLatency(statusRes, 500, 'Status check < 500ms');

            const statusBody = parseResponse(statusRes);
            check(statusRes, {
              'Batch has valid status': (r) => {
                const status = statusBody.data?.status;
                return ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(status);
              },
              'Batch has processing metrics': (r) =>
                statusBody.data?.processed >= 0 &&
                statusBody.data?.succeeded >= 0 &&
                statusBody.data?.failed >= 0
            });
          });
        }
      }
    });
  }

  // Dunning workflow - retry declined subscriptions
  if (Math.random() < 0.1) {
    group('Dunning Workflow', () => {
      const subscriptionId = `sub_${randomInt(1, 100000)}`;

      // Send dunning notification
      const notificationRes = signedPost(
        `/subscriptions/${subscriptionId}/dunning/notify`,
        {
          attemptNumber: 1,
          nextRetryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          reason: 'CHARGE_DECLINED'
        }
      );

      checkSuccess(notificationRes, 'Dunning notification sent');
      checkLatency(notificationRes, 800, 'Notification < 800ms');
    });
  }

  // Subscription analytics - 5% of traffic
  if (Math.random() < 0.05) {
    group('Subscription Analytics', () => {
      const analyticsRes = http.get(
        `${Constants.API_BASE_URL}/subscriptions/analytics?merchantId=${merchantId}&period=monthly`,
        {
          headers: {
            'X-API-Key': Constants.API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      checkSuccess(analyticsRes, 'Analytics retrieved');
      checkLatency(analyticsRes, 1500, 'Analytics fetch < 1.5s');

      const analyticsBody = parseResponse(analyticsRes);
      check(analyticsRes, {
        'Analytics has MRR': (r) => analyticsBody.data?.mrr !== undefined,
        'Analytics has churn rate': (r) => analyticsBody.data?.churnRate !== undefined,
        'Analytics has active subscriptions': (r) =>
          analyticsBody.data?.activeSubscriptions >= 0
      });
    });
  }
}

export function teardown(data) {
  const chargeSuccessRate = (chargesSucceeded / chargesProcessed * 100).toFixed(2);
  const retrySuccessRate = retriesAttempted > 0
    ? (retriesSucceeded / retriesAttempted * 100).toFixed(2)
    : 'N/A';

  log('info', 'Subscription test completed', {
    plansCreated,
    subscriptionsEnrolled,
    chargesProcessed,
    chargesSucceeded,
    chargesFailed,
    chargeSuccessRate: chargeSuccessRate + '%',
    retriesAttempted,
    retriesSucceeded,
    retrySuccessRate: retrySuccessRate + '%'
  });
}
