/**
 * K6 Load Test: Authentication & Setup
 * Tests user registration, authentication, and account setup flows
 *
 * Run with:
 * k6 run --vus 50 --duration 10m k6_tests/01_auth_setup.js
 */

import http from 'k6/http';
import { check, group } from 'k6';
import {
  generateUserData,
  generateMerchantData,
  signedPost,
  authPost,
  checkSuccess,
  checkLatency,
  parseResponse,
  addThinkTime,
  log,
  Constants
} from './00_utils.js';

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 1 },    // Warmup
    { duration: '5m', target: 50 },   // Ramp up
    { duration: '10m', target: 100 }, // Sustain
    { duration: '5m', target: 50 },   // Ramp down
    { duration: '3m', target: 1 },    // Cooldown
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000', 'p(99)<3000'],
    'http_req_failed': ['rate<0.05'],
    'auth_success_rate': ['value>0.95'],
    'registration_success_rate': ['value>0.95']
  },
  ext: {
    loadimpact: {
      projectID: 3326635,
      name: 'Auth & Setup Load Test'
    }
  }
};

// Track metrics
let successCount = 0;
let failureCount = 0;
let registrationSuccess = 0;
let registrationFailure = 0;

export default function () {
  group('User Registration Flow', () => {
    const userData = generateUserData();

    // Register new user
    const registerRes = signedPost('/auth/register', {
      email: userData.email,
      phone: userData.phone,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password,
      country: userData.country,
      timezone: userData.timezone
    });

    checkSuccess(registerRes, 'User registration successful');
    checkLatency(registerRes, 2000, 'Registration latency < 2s');

    if (registerRes.status === 201) {
      registrationSuccess++;
      const body = parseResponse(registerRes);
      const userId = body.data?.userId || body.userId;

      if (!userId) {
        log('error', 'Failed to extract userId from registration response');
        registrationFailure++;
        return;
      }

      addThinkTime();

      // Login after registration
      group('User Login', () => {
        const loginRes = signedPost('/auth/login', {
          email: userData.email,
          password: userData.password
        });

        checkSuccess(loginRes, 'Login successful');
        checkLatency(loginRes, 1500, 'Login latency < 1.5s');

        if (loginRes.status === 200) {
          const loginBody = parseResponse(loginRes);
          const token = loginBody.data?.token || loginBody.token;

          if (!token) {
            log('error', 'Failed to extract token from login response');
            return;
          }

          successCount++;
          addThinkTime();

          // Email verification (mock)
          group('Email Verification', () => {
            const verifyRes = authPost('/auth/verify-email', token, {
              code: '123456'
            });

            checkSuccess(verifyRes, 'Email verification successful');
            checkLatency(verifyRes, 1000, 'Email verification < 1s');
          });

          addThinkTime();

          // Fetch user profile
          group('Get User Profile', () => {
            const profileRes = http.get(`${Constants.API_BASE_URL}/users/${userId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            checkSuccess(profileRes, 'Get profile successful');
            checkLatency(profileRes, 800, 'Get profile latency < 800ms');
          });

          addThinkTime();

          // Create wallet
          group('Create Wallet', () => {
            const walletRes = authPost('/wallets', token, {
              currency: 'USD',
              walletType: 'primary'
            });

            checkSuccess(walletRes, 'Wallet creation successful');
            checkLatency(walletRes, 1500, 'Wallet creation < 1.5s');

            if (walletRes.status === 201) {
              const walletBody = parseResponse(walletRes);
              const walletId = walletBody.data?.walletId || walletBody.walletId;

              if (!walletId) {
                log('warn', 'Failed to extract walletId');
                return;
              }

              addThinkTime();

              // Add payment method
              group('Add Payment Method', () => {
                const paymentRes = authPost('/payment-methods', token, {
                  type: 'card',
                  cardNumber: '4532015112830366',
                  expiryMonth: 12,
                  expiryYear: 2026,
                  cvv: '123',
                  holderName: `${userData.firstName} ${userData.lastName}`,
                  isDefault: true
                });

                checkSuccess(paymentRes, 'Payment method added');
                checkLatency(paymentRes, 2000, 'Payment method < 2s');
              });
            }
          });
        } else {
          failureCount++;
        }
      });
    } else {
      registrationFailure++;
    }
  });

  group('Merchant Onboarding Flow', () => {
    const merchantData = generateMerchantData();

    // Register merchant
    const merchantRes = signedPost('/merchants/register', {
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

    checkSuccess(merchantRes, 'Merchant registration successful');
    checkLatency(merchantRes, 2500, 'Merchant registration < 2.5s');

    if (merchantRes.status === 201) {
      const body = parseResponse(merchantRes);
      const merchantId = body.data?.merchantId || body.merchantId;

      if (!merchantId) {
        log('error', 'Failed to extract merchantId');
        return;
      }

      addThinkTime();

      // Merchant login
      group('Merchant Login', () => {
        const loginRes = signedPost('/auth/login', {
          email: merchantData.businessEmail,
          password: 'DefaultPassword123!@#'
        });

        if (loginRes.status === 200) {
          const token = parseResponse(loginRes).data?.token;

          if (token) {
            addThinkTime();

            // Submit KYC
            group('Submit KYC', () => {
              const kycRes = authPost('/merchants/kyc/submit', token, {
                businessRegistration: 'CERT123456',
                ownerIdType: 'passport',
                ownerId: 'P12345678',
                businessProof: 'PROOF789',
                bankStatementUrl: 'https://example.com/statement.pdf'
              });

              checkSuccess(kycRes, 'KYC submitted');
              checkLatency(kycRes, 2000, 'KYC submission < 2s');
            });

            addThinkTime();

            // Configure settlement
            group('Configure Settlement', () => {
              const settlementRes = authPost('/merchants/settlement/configure', token, {
                settlementSchedule: 'weekly',
                settlementDay: 'Friday',
                settlementCurrency: 'USD',
                minimumBalance: 100,
                maximumHold: 7,
                bankAccount: {
                  accountNumber: merchantData.settlementAccount.accountNumber,
                  bankName: merchantData.settlementAccount.bankName,
                  accountName: merchantData.settlementAccount.accountName,
                  routingNumber: merchantData.settlementAccount.routingNumber
                },
                feeStructure: {
                  transactionFee: 0.029,
                  fixedFee: 0.30,
                  chargebackFee: 15
                }
              });

              checkSuccess(settlementRes, 'Settlement configured');
              checkLatency(settlementRes, 1500, 'Settlement config < 1.5s');
            });

            addThinkTime();

            // Generate API keys
            group('Generate API Keys', () => {
              const keysRes = authPost(`/merchants/${merchantId}/api-keys`, token, {
                name: 'Production Key',
                description: 'Main production API key'
              });

              checkSuccess(keysRes, 'API keys generated');
              checkLatency(keysRes, 1000, 'API key generation < 1s');

              if (keysRes.status === 201) {
                const keysBody = parseResponse(keysRes);
                const apiKey = keysBody.data?.apiKey;
                const apiSecret = keysBody.data?.apiSecret;

                if (apiKey && apiSecret) {
                  log('info', 'API credentials generated', {
                    merchantId,
                    hasApiKey: !!apiKey,
                    hasApiSecret: !!apiSecret
                  });
                }
              }
            });

            addThinkTime();

            // Fetch merchant dashboard data
            group('Get Merchant Dashboard', () => {
              const dashRes = http.get(
                `${Constants.API_BASE_URL}/merchants/${merchantId}/dashboard`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );

              checkSuccess(dashRes, 'Dashboard loaded');
              checkLatency(dashRes, 1200, 'Dashboard load < 1.2s');
            });
          }
        }
      });
    }
  });

  // Summary metrics
  const successRate = successCount / (successCount + failureCount || 1) * 100;
  const regSuccessRate = registrationSuccess / (registrationSuccess + registrationFailure || 1) * 100;

  group('Metrics Summary', () => {
    check(null, {
      'Auth success rate > 95%': () => successRate > 95,
      'Registration success rate > 95%': () => regSuccessRate > 95
    });
  });
}

export function teardown(data) {
  log('info', 'Test completed', {
    totalSuccess: successCount,
    totalFailure: failureCount,
    registrationSuccess,
    registrationFailure,
    successRate: (successCount / (successCount + failureCount || 1) * 100).toFixed(2) + '%'
  });
}
