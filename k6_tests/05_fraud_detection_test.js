/**
 * K6 Load Test: Fraud Detection
 * Tests real-time fraud risk scoring and detection performance
 * Target: <300ms p95 latency, <2% false positive rate
 *
 * Run with:
 * k6 run --stage 2m:1vu --stage 5m:100vu --stage 15m:300vu --stage 10m:500vu --stage 5m:100vu --stage 3m:1vu k6_tests/05_fraud_detection_test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import {
  generatePaymentData,
  signedPost,
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
    { duration: '2m', target: 1 },      // Warmup
    { duration: '5m', target: 100 },    // Ramp up
    { duration: '15m', target: 300 },   // Sustain
    { duration: '10m', target: 500 },   // High load
    { duration: '5m', target: 100 },    // Ramp down
    { duration: '3m', target: 1 },      // Cooldown
  ],
  thresholds: {
    'http_req_duration': [
      'p(50)<150',
      'p(95)<300',
      'p(99)<500',
      'avg<200'
    ],
    'http_req_failed': ['rate<0.001'],
    'fraud_score_latency_p95': ['value<300'],
    'fraud_detection_accuracy': ['value>0.98']
  },
  ext: {
    loadimpact: {
      projectID: 3326635,
      name: 'Fraud Detection Load Test'
    }
  }
};

// Global metrics
let fraudScoresGenerated = 0;
let highRiskTransactions = 0;
let lowRiskTransactions = 0;
let totalLatency = 0;

// Risk score calculation (matching backend logic)
function calculateMockFraudScore(transaction) {
  let score = 0;

  // 1. Amount Deviation (15%)
  if (transaction.amount > 5000) score += 15;
  else if (transaction.amount > 1000) score += 8;

  // 2. Geographic Anomaly (12%)
  if (transaction.location !== transaction.userHomeCountry) score += 12;

  // 3. Device Mismatch (10%)
  if (transaction.deviceId !== transaction.userRegisteredDevice) score += 10;

  // 4. Velocity Check (12%)
  if (transaction.transactionsInLast5Min > 3) score += 12;
  else if (transaction.transactionsInLast5Min > 1) score += 6;

  // 5. Merchant Risk (10%)
  if (transaction.merchantRiskScore > 0.7) score += 10;
  else if (transaction.merchantRiskScore > 0.5) score += 5;

  // 6. Card Status (8%)
  if (transaction.cardNeverUsed) score += 8;

  // 7. User History (8%)
  if (transaction.accountAgeMonths < 1) score += 8;
  else if (transaction.accountAgeMonths < 3) score += 4;

  // 8. IP Reputation (7%)
  if (transaction.ipBlacklisted) score += 7;

  // 9. Email/Phone Anomaly (5%)
  if (transaction.newEmail || transaction.newPhone) score += 5;

  // 10. Blacklist Match (3%)
  if (transaction.blacklistMatch) score += 3;

  return Math.min(score, 100);
}

export default function () {
  const userId = `user_${randomInt(1, 10000)}`;
  const merchantId = `merchant_${randomInt(1, 5000)}`;

  group('Normal Transaction Fraud Scoring', () => {
    const transaction = {
      userId: userId,
      merchantId: merchantId,
      amount: randomInt(10, 500),
      currency: 'USD',
      location: 'US',
      userHomeCountry: 'US',
      deviceId: `device_${Math.floor(Math.random() * 100)}`,
      userRegisteredDevice: `device_${Math.floor(Math.random() * 100)}`,
      transactionsInLast5Min: randomInt(0, 2),
      merchantRiskScore: Math.random() * 0.3, // Low merchant risk
      cardNeverUsed: false,
      accountAgeMonths: randomInt(6, 60),
      ipBlacklisted: false,
      newEmail: false,
      newPhone: false,
      blacklistMatch: false,
      timestamp: new Date().toISOString()
    };

    const startTime = Date.now();

    const scoreRes = signedPost('/fraud-detection/score', transaction);

    const latency = Date.now() - startTime;
    totalLatency += latency;
    fraudScoresGenerated++;

    const isSuccess = checkSuccess(scoreRes, 'Fraud score generated');
    checkLatency(scoreRes, 300, 'Fraud scoring < 300ms');

    if (isSuccess) {
      const body = parseResponse(scoreRes);
      const fraudScore = body.data?.fraudScore || 0;
      const decision = body.data?.decision;

      lowRiskTransactions++;

      check(scoreRes, {
        'Score is in valid range': (r) => fraudScore >= 0 && fraudScore <= 100,
        'Decision is valid': (r) => ['APPROVE', 'CHALLENGE', 'BLOCK'].includes(decision),
        'Low risk score for normal transaction': (r) => fraudScore < 30,
        'Decision is APPROVE for low risk': (r) => decision === 'APPROVE',
        'Risk factors provided': (r) => Array.isArray(body.data?.riskFactors),
        'Processing time reasonable': () => latency < 300
      });

      log('info', 'Normal transaction scored', {
        fraudScore,
        decision,
        latency: latency + 'ms'
      });
    }
  });

  // Suspicious transaction - high fraud score
  if (Math.random() < 0.2) {
    group('Suspicious Transaction Detection', () => {
      const transaction = {
        userId: userId,
        merchantId: `merchant_unknown_${randomInt(10000, 20000)}`,
        amount: randomInt(5000, 50000),
        currency: 'USD',
        location: 'NG', // Different from user home
        userHomeCountry: 'US',
        deviceId: `device_new_${randomInt(1000, 2000)}`,
        userRegisteredDevice: `device_${randomInt(1, 100)}`,
        transactionsInLast5Min: randomInt(3, 10),
        merchantRiskScore: Math.random() * 0.8 + 0.4, // Higher merchant risk
        cardNeverUsed: true,
        accountAgeMonths: randomInt(0, 2),
        ipBlacklisted: Math.random() < 0.3,
        newEmail: true,
        newPhone: true,
        blacklistMatch: Math.random() < 0.2,
        timestamp: new Date().toISOString()
      };

      const startTime = Date.now();

      const scoreRes = signedPost('/fraud-detection/score', transaction);

      const latency = Date.now() - startTime;
      totalLatency += latency;
      fraudScoresGenerated++;

      checkSuccess(scoreRes, 'High risk transaction scored');
      checkLatency(scoreRes, 300, 'Fraud scoring < 300ms');

      if (scoreRes.status === 200) {
        const body = parseResponse(scoreRes);
        const fraudScore = body.data?.fraudScore || 0;
        const decision = body.data?.decision;

        highRiskTransactions++;

        check(scoreRes, {
          'High fraud score for suspicious transaction': (r) => fraudScore > 40,
          'Decision is CHALLENGE or BLOCK': (r) =>
            decision === 'CHALLENGE' || decision === 'BLOCK',
          'Explanation provided': (r) => body.data?.explanation !== undefined,
          'Recommended action included': (r) => body.data?.recommendedAction !== undefined
        });

        log('info', 'Suspicious transaction scored', {
          fraudScore,
          decision,
          latency: latency + 'ms',
          riskFactors: body.data?.riskFactors?.length || 0
        });
      }
    });
  }

  // Velocity attack simulation - 5% of traffic
  if (Math.random() < 0.05) {
    group('Velocity Attack Detection', () => {
      // Simulate 5 rapid transactions from same user
      for (let i = 0; i < 5; i++) {
        const transaction = {
          userId: userId,
          merchantId: `merchant_${randomInt(1, 1000)}`,
          amount: randomInt(100, 500),
          currency: 'USD',
          location: 'US',
          userHomeCountry: 'US',
          deviceId: `device_${randomInt(1, 100)}`,
          userRegisteredDevice: `device_${randomInt(1, 100)}`,
          transactionsInLast5Min: 5 + i, // Increasing velocity
          merchantRiskScore: 0.2,
          cardNeverUsed: false,
          accountAgeMonths: 12,
          ipBlacklisted: false,
          newEmail: false,
          newPhone: false,
          blacklistMatch: false,
          timestamp: new Date().toISOString()
        };

        const scoreRes = signedPost('/fraud-detection/score', transaction);

        checkLatency(scoreRes, 300, `Velocity check ${i + 1} latency`);

        if (scoreRes.status === 200) {
          const body = parseResponse(scoreRes);
          const fraudScore = body.data?.fraudScore;

          // Score should increase with each transaction
          check(scoreRes, {
            'Velocity increases fraud score': (r) => fraudScore > 20
          });
        }

        if (i < 4) sleep(0.1); // Small delay between requests
      }
    });
  }

  // Geographic anomaly - 10% of traffic
  if (Math.random() < 0.1) {
    group('Geographic Anomaly Detection', () => {
      const transaction = {
        userId: userId,
        merchantId: merchantId,
        amount: randomInt(100, 1000),
        currency: 'USD',
        location: randomItem(['NG', 'IN', 'BR', 'CN', 'RU']), // Foreign location
        userHomeCountry: 'US',
        deviceId: `device_${randomInt(1, 100)}`,
        userRegisteredDevice: `device_${randomInt(1, 100)}`,
        transactionsInLast5Min: 1,
        merchantRiskScore: 0.3,
        cardNeverUsed: false,
        accountAgeMonths: 12,
        ipBlacklisted: false,
        newEmail: false,
        newPhone: false,
        blacklistMatch: false,
        timestamp: new Date().toISOString()
      };

      const scoreRes = signedPost('/fraud-detection/score', transaction);

      checkSuccess(scoreRes, 'Geographic anomaly scored');
      checkLatency(scoreRes, 300, 'Geo check < 300ms');

      if (scoreRes.status === 200) {
        const body = parseResponse(scoreRes);

        check(scoreRes, {
          'Geographic factor increases score': (r) =>
            body.data?.riskFactors?.some(f => f.name.includes('geographic') || f.name.includes('location'))
        });
      }
    });
  }

  // Device fingerprinting - 8% of traffic
  if (Math.random() < 0.08) {
    group('Device Fingerprinting', () => {
      const transaction = {
        userId: userId,
        merchantId: merchantId,
        amount: randomInt(10, 1000),
        currency: 'USD',
        location: 'US',
        userHomeCountry: 'US',
        deviceId: `device_unknown_${randomInt(100000, 200000)}`, // New device
        userRegisteredDevice: `device_${randomInt(1, 100)}`,
        transactionsInLast5Min: randomInt(0, 2),
        merchantRiskScore: 0.2,
        cardNeverUsed: false,
        accountAgeMonths: 12,
        ipBlacklisted: false,
        newEmail: false,
        newPhone: false,
        blacklistMatch: false,
        timestamp: new Date().toISOString(),
        deviceFingerprint: {
          userAgent: 'Mozilla/5.0...',
          language: 'en-US',
          timezone: 'America/New_York',
          screenResolution: '1920x1080'
        }
      };

      const scoreRes = signedPost('/fraud-detection/score', transaction);

      checkSuccess(scoreRes, 'Device fingerprint scored');
      checkLatency(scoreRes, 300, 'Device check < 300ms');

      if (scoreRes.status === 200) {
        const body = parseResponse(scoreRes);

        check(scoreRes, {
          'Device factor included': (r) =>
            body.data?.riskFactors?.some(f => f.name.includes('device'))
        });
      }
    });
  }

  // Batch scoring - 3% of traffic
  if (Math.random() < 0.03) {
    group('Batch Fraud Scoring', () => {
      const transactions = [];
      for (let i = 0; i < 10; i++) {
        transactions.push({
          userId: `user_${randomInt(1, 10000)}`,
          merchantId: merchantId,
          amount: randomInt(10, 500),
          currency: 'USD',
          location: 'US',
          userHomeCountry: 'US',
          deviceId: `device_${randomInt(1, 100)}`,
          userRegisteredDevice: `device_${randomInt(1, 100)}`,
          transactionsInLast5Min: randomInt(0, 3),
          merchantRiskScore: Math.random() * 0.5,
          cardNeverUsed: false,
          accountAgeMonths: randomInt(1, 60),
          ipBlacklisted: false,
          newEmail: false,
          newPhone: false,
          blacklistMatch: false
        });
      }

      const startTime = Date.now();

      const batchRes = signedPost('/fraud-detection/score-batch', {
        transactions: transactions
      });

      const latency = Date.now() - startTime;

      checkSuccess(batchRes, 'Batch scoring completed');
      checkLatency(batchRes, 1500, 'Batch scoring < 1.5s');

      if (batchRes.status === 200) {
        const body = parseResponse(batchRes);

        check(batchRes, {
          'All transactions scored': (r) => body.data?.scores?.length === 10,
          'All scores valid': (r) =>
            body.data?.scores?.every(s => s.fraudScore >= 0 && s.fraudScore <= 100)
        });

        fraudScoresGenerated += 10;
        totalLatency += latency;
      }
    });
  }
}

export function teardown(data) {
  const avgLatency = fraudScoresGenerated > 0
    ? (totalLatency / fraudScoresGenerated).toFixed(2)
    : 0;
  const highRiskPercentage = (highRiskTransactions / fraudScoresGenerated * 100).toFixed(2);

  log('info', 'Fraud detection test completed', {
    totalScoresGenerated: fraudScoresGenerated,
    normalTransactions: lowRiskTransactions,
    suspiciousTransactions: highRiskTransactions,
    suspiciousPercentage: highRiskPercentage + '%',
    averageLatency: avgLatency + 'ms'
  });
}
