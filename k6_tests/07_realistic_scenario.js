/**
 * K6 Load Test: Realistic End-to-End Scenarios
 * Simulates complete user workflows combining multiple operations
 * Target: 95%+ end-to-end success rate
 *
 * Run with:
 * k6 run --stage 2m:1vu --stage 5m:100vu --stage 15m:200vu --stage 5m:150vu --stage 3m:1vu k6_tests/07_realistic_scenario.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import {
  generateUserData,
  generateMerchantData,
  generatePaymentData,
  generateSubscriptionData,
  generateDisputeData,
  generateRefundData,
  signedPost,
  authPost,
  authGet,
  checkSuccess,
  checkLatency,
  parseResponse,
  addContextualThinkTime,
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
    { duration: '15m', target: 200 },  // Sustain
    { duration: '5m', target: 150 },   // High load
    { duration: '3m', target: 1 },     // Cooldown
  ],
  thresholds: {
    'http_req_duration': [
      'p(50)<300',
      'p(95)<1500',
      'p(99)<3000'
    ],
    'http_req_failed': ['rate<0.05'],
    'workflow_success_rate': ['value>0.95'],
    'workflow_completion_time': ['p(95)<30000'] // 30 seconds per workflow
  },
  ext: {
    loadimpact: {
      projectID: 3326635,
      name: 'Realistic Scenario Load Test'
    }
  }
};

// Global metrics
let workflowsCompleted = 0;
let workflowsSucceeded = 0;
let workflowsFailed = 0;

export default function () {
  const workflowType = randomItem([
    'user_payment_workflow',
    'merchant_onboarding_workflow',
    'dispute_resolution_workflow',
    'subscription_lifecycle_workflow'
  ]);

  switch (workflowType) {
    case 'user_payment_workflow':
      runUserPaymentWorkflow();
      break;
    case 'merchant_onboarding_workflow':
      runMerchantOnboardingWorkflow();
      break;
    case 'dispute_resolution_workflow':
      runDisputeResolutionWorkflow();
      break;
    case 'subscription_lifecycle_workflow':
      runSubscriptionLifecycleWorkflow();
      break;
  }

  workflowsCompleted++;
}

/**
 * Workflow 1: User Payment Lifecycle
 * Register → Create wallet → Add payment method → Make payment → Check status → Get receipt
 */
function runUserPaymentWorkflow() {
  const startTime = Date.now();
  let success = true;

  group('Workflow: User Payment Lifecycle', () => {
    const userData = generateUserData();
    let userId, walletId, token;

    // Step 1: Register user
    addContextualThinkTime('decision');

    group('Step 1: User Registration', () => {
      const registerRes = signedPost('/auth/register', {
        email: userData.email,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        country: userData.country,
        timezone: userData.timezone
      });

      if (!checkSuccess(registerRes, 'Registration successful')) {
        success = false;
        log('error', 'Registration failed');
        return;
      }

      const body = parseResponse(registerRes);
      userId = body.data?.userId;

      if (!userId) {
        success = false;
        log('error', 'Failed to extract userId');
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('normal');

    // Step 2: Login
    group('Step 2: User Login', () => {
      const loginRes = signedPost('/auth/login', {
        email: userData.email,
        password: userData.password
      });

      if (!checkSuccess(loginRes, 'Login successful')) {
        success = false;
        return;
      }

      const body = parseResponse(loginRes);
      token = body.data?.token;

      if (!token) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('normal');

    // Step 3: Create wallet
    group('Step 3: Create Wallet', () => {
      const walletRes = authPost('/wallets', token, {
        currency: 'USD',
        walletType: 'primary'
      });

      if (!checkSuccess(walletRes, 'Wallet created')) {
        success = false;
        return;
      }

      const body = parseResponse(walletRes);
      walletId = body.data?.walletId;

      if (!walletId) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('normal');

    // Step 4: Add payment method
    group('Step 4: Add Payment Method', () => {
      const paymentRes = authPost('/payment-methods', token, {
        type: 'card',
        cardNumber: '4532015112830366',
        expiryMonth: 12,
        expiryYear: 2026,
        cvv: '123',
        holderName: `${userData.firstName} ${userData.lastName}`,
        isDefault: true
      });

      if (!checkSuccess(paymentRes, 'Payment method added')) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('decision'); // User takes time to enter payment details

    // Step 5: Make payment
    group('Step 5: Process Payment', () => {
      const paymentData = generatePaymentData();

      const payRes = authPost('/payments', token, {
        ...paymentData,
        walletId: walletId
      });

      if (!checkSuccess(payRes, 'Payment processed')) {
        success = false;
        return;
      }

      const body = parseResponse(payRes);
      const transactionId = body.data?.transactionId;

      if (!transactionId) {
        success = false;
        return;
      }

      addContextualThinkTime('quick'); // Brief wait for processing

      // Step 6: Check transaction status
      group('Step 6: Verify Transaction', () => {
        const statusRes = authGet(`/transactions/${transactionId}`, token);

        if (!checkSuccess(statusRes, 'Transaction status retrieved')) {
          success = false;
          return;
        }

        const statusBody = parseResponse(statusRes);
        check(statusRes, {
          'Transaction is in valid state': (r) =>
            ['PENDING', 'PROCESSING', 'SUCCESS'].includes(statusBody.data?.state)
        });
      });

      addContextualThinkTime('quick');

      // Step 7: Get receipt
      group('Step 7: Download Receipt', () => {
        const receiptRes = authGet(`/receipts/${transactionId}`, token);

        if (!checkSuccess(receiptRes, 'Receipt generated')) {
          success = false;
          return;
        }

        check(receiptRes, {
          'Receipt contains required fields': (r) => {
            const body = parseResponse(receiptRes);
            return body.data?.receiptId !== undefined &&
              body.data?.amount !== undefined;
          }
        });
      });
    });
  });

  if (success) {
    workflowsSucceeded++;
  } else {
    workflowsFailed++;
  }

  logWorkflowMetrics('user_payment', startTime, success);
}

/**
 * Workflow 2: Merchant Onboarding
 * Register → Submit KYC → Configure settlement → Generate API keys
 */
function runMerchantOnboardingWorkflow() {
  const startTime = Date.now();
  let success = true;

  group('Workflow: Merchant Onboarding', () => {
    const merchantData = generateMerchantData();
    let merchantId, token;

    // Step 1: Register merchant
    addContextualThinkTime('decision');

    group('Step 1: Merchant Registration', () => {
      const registerRes = signedPost('/merchants/register', {
        businessName: merchantData.businessName,
        businessEmail: merchantData.businessEmail,
        businessPhone: merchantData.businessPhone,
        businessType: merchantData.businessType,
        registrationNumber: merchantData.registrationNumber,
        businessAddress: merchantData.businessAddress,
        ownerName: merchantData.ownerName,
        ownerEmail: merchantData.ownerEmail,
        ownerPhone: merchantData.ownerPhone
      });

      if (!checkSuccess(registerRes, 'Merchant registration')) {
        success = false;
        return;
      }

      const body = parseResponse(registerRes);
      merchantId = body.data?.merchantId;

      if (!merchantId) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('normal');

    // Step 2: Login as merchant
    group('Step 2: Merchant Login', () => {
      const loginRes = signedPost('/auth/login', {
        email: merchantData.businessEmail,
        password: 'DefaultPassword123!@#'
      });

      if (!checkSuccess(loginRes, 'Login successful')) {
        success = false;
        return;
      }

      const body = parseResponse(loginRes);
      token = body.data?.token;

      if (!token) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('decision');

    // Step 3: Submit KYC
    group('Step 3: Submit KYC Documents', () => {
      const kycRes = authPost('/merchants/kyc/submit', token, {
        businessRegistration: 'CERT123456',
        ownerIdType: 'passport',
        ownerId: 'P12345678',
        businessProof: 'PROOF789'
      });

      if (!checkSuccess(kycRes, 'KYC submitted')) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('decision');

    // Step 4: Configure settlement
    group('Step 4: Configure Settlement', () => {
      const settlementRes = authPost('/merchants/settlement/configure', token, {
        settlementSchedule: 'weekly',
        settlementDay: 'Friday',
        settlementCurrency: 'USD',
        bankAccount: {
          accountNumber: merchantData.settlementAccount.accountNumber,
          bankName: merchantData.settlementAccount.bankName,
          accountName: merchantData.settlementAccount.accountName,
          routingNumber: merchantData.settlementAccount.routingNumber
        }
      });

      if (!checkSuccess(settlementRes, 'Settlement configured')) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('normal');

    // Step 5: Generate API keys
    group('Step 5: Generate API Credentials', () => {
      const keysRes = authPost(`/merchants/${merchantId}/api-keys`, token, {
        name: 'Production Key',
        description: 'Main production API key'
      });

      if (!checkSuccess(keysRes, 'API keys generated')) {
        success = false;
        return;
      }

      const body = parseResponse(keysRes);
      check(keysRes, {
        'API key present': (r) => body.data?.apiKey !== undefined,
        'API secret present': (r) => body.data?.apiSecret !== undefined
      });
    });
  });

  if (success) {
    workflowsSucceeded++;
  } else {
    workflowsFailed++;
  }

  logWorkflowMetrics('merchant_onboarding', startTime, success);
}

/**
 * Workflow 3: Dispute Resolution
 * File dispute → Submit evidence → Wait investigation → Receive resolution
 */
function runDisputeResolutionWorkflow() {
  const startTime = Date.now();
  let success = true;

  group('Workflow: Dispute Resolution', () => {
    const transactionId = `txn_${randomInt(1, 100000)}`;
    const token = 'mock_token_' + randomInt(1, 10000);
    const disputeData = generateDisputeData();
    let disputeId;

    // Step 1: File dispute
    addContextualThinkTime('decision');

    group('Step 1: File Dispute', () => {
      const disputeRes = signedPost(`/disputes/create`, {
        transactionId: transactionId,
        reason: disputeData.reason,
        description: disputeData.description,
        amount: disputeData.amount
      });

      if (!checkSuccess(disputeRes, 'Dispute created')) {
        success = false;
        return;
      }

      const body = parseResponse(disputeRes);
      disputeId = body.data?.disputeId;

      if (!disputeId) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('decision');

    // Step 2: Submit evidence
    group('Step 2: Submit Evidence', () => {
      const evidenceRes = authPost(`/disputes/${disputeId}/evidence`, token, {
        type: 'email',
        description: 'Email proof of communication',
        documentUrl: 'https://example.com/evidence.pdf',
        uploadedAt: new Date().toISOString()
      });

      if (!checkSuccess(evidenceRes, 'Evidence submitted')) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('normal');

    // Step 3: Simulate investigation (short wait)
    sleep(1);

    // Step 4: Get dispute status
    group('Step 3: Get Dispute Status', () => {
      const statusRes = authGet(`/disputes/${disputeId}`, token);

      if (!checkSuccess(statusRes, 'Dispute status retrieved')) {
        success = false;
        return;
      }

      const body = parseResponse(statusRes);
      check(statusRes, {
        'Dispute status is valid': (r) =>
          ['FILED', 'UNDER_REVIEW', 'AWAITING_EVIDENCE', 'RESOLVED'].includes(body.data?.status)
      });
    });

    if (!success) return;
    addContextualThinkTime('quick');

    // Step 5: Get resolution (if complete)
    group('Step 4: Get Resolution', () => {
      const resolutionRes = authGet(`/disputes/${disputeId}/resolution`, token);

      // May not have resolution yet, but request should succeed
      if (resolutionRes.status === 200) {
        const body = parseResponse(resolutionRes);
        check(resolutionRes, {
          'Resolution has status': (r) => body.data?.resolution !== undefined
        });
      } else if (resolutionRes.status === 404) {
        // Not yet resolved - acceptable
        check(resolutionRes, {
          'Dispute still pending': () => true
        });
      } else {
        success = false;
      }
    });
  });

  if (success) {
    workflowsSucceeded++;
  } else {
    workflowsFailed++;
  }

  logWorkflowMetrics('dispute_resolution', startTime, success);
}

/**
 * Workflow 4: Subscription Lifecycle
 * Create plan → Enroll user → Process charge → Check status → Cancel
 */
function runSubscriptionLifecycleWorkflow() {
  const startTime = Date.now();
  let success = true;

  group('Workflow: Subscription Lifecycle', () => {
    const subscriptionData = generateSubscriptionData();
    const userId = `user_${randomInt(1, 10000)}`;
    const merchantId = `merchant_${randomInt(1, 5000)}`;
    let planId, subscriptionId;

    // Step 1: Create plan
    addContextualThinkTime('normal');

    group('Step 1: Create Subscription Plan', () => {
      const planRes = signedPost('/subscriptions/plans', {
        ...subscriptionData,
        merchantId: merchantId
      });

      if (!checkSuccess(planRes, 'Plan created')) {
        success = false;
        return;
      }

      const body = parseResponse(planRes);
      planId = body.data?.planId;

      if (!planId) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('decision');

    // Step 2: Enroll user
    group('Step 2: Enroll User to Plan', () => {
      const enrollRes = signedPost('/subscriptions/enroll', {
        planId: planId,
        userId: userId,
        merchantId: merchantId,
        billingCycle: 'monthly'
      });

      if (!checkSuccess(enrollRes, 'User enrolled')) {
        success = false;
        return;
      }

      const body = parseResponse(enrollRes);
      subscriptionId = body.data?.subscriptionId;

      if (!subscriptionId) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('quick');

    // Step 3: Process charge
    group('Step 3: Process Initial Charge', () => {
      const chargeRes = signedPost(`/subscriptions/${subscriptionId}/charge`, {
        amount: subscriptionData.amount,
        currency: subscriptionData.currency
      });

      if (!checkSuccess(chargeRes, 'Charge processed')) {
        success = false;
        return;
      }
    });

    if (!success) return;
    addContextualThinkTime('quick');

    // Step 4: Get subscription status
    group('Step 4: Verify Subscription Status', () => {
      const statusRes = http.get(
        `${Constants.API_BASE_URL}/subscriptions/${subscriptionId}`,
        {
          headers: {
            'X-API-Key': Constants.API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!checkSuccess(statusRes, 'Subscription status retrieved')) {
        success = false;
        return;
      }

      const body = parseResponse(statusRes);
      check(statusRes, {
        'Subscription is active': (r) =>
          ['ACTIVE', 'ENROLLED', 'PENDING'].includes(body.data?.status)
      });
    });

    if (!success) return;
    addContextualThinkTime('normal');

    // Step 5: Cancel subscription (20% of workflows)
    if (Math.random() < 0.2) {
      group('Step 5: Cancel Subscription', () => {
        const cancelRes = signedPost(`/subscriptions/${subscriptionId}/cancel`, {
          reason: 'USER_INITIATED'
        });

        if (!checkSuccess(cancelRes, 'Subscription cancelled')) {
          success = false;
          return;
        }
      });
    }
  });

  if (success) {
    workflowsSucceeded++;
  } else {
    workflowsFailed++;
  }

  logWorkflowMetrics('subscription_lifecycle', startTime, success);
}

/**
 * Helper: Log workflow metrics
 */
function logWorkflowMetrics(workflowType, startTime, success) {
  const duration = Date.now() - startTime;

  check(null, {
    'Workflow completed successfully': () => success,
    'Workflow completed in reasonable time': () => duration < 30000
  });

  log('info', `${workflowType} workflow completed`, {
    success,
    duration: duration + 'ms',
    iteration: __ITER
  });
}

export function teardown(data) {
  const successRate = (workflowsSucceeded / workflowsCompleted * 100).toFixed(2);

  log('info', 'Realistic scenario test completed', {
    totalWorkflows: workflowsCompleted,
    successfulWorkflows: workflowsSucceeded,
    failedWorkflows: workflowsFailed,
    successRate: successRate + '%'
  });
}
