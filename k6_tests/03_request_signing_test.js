/**
 * K6 Load Test: API Request Signing
 * Tests HMAC-SHA256 request signing mechanism and cryptographic operations
 * Target: <300ms p95 latency, 100% success rate (no crypto failures)
 *
 * Run with:
 * k6 run --stage 2m:1vu --stage 5m:50vu --stage 10m:150vu --stage 5m:50vu --stage 3m:1vu k6_tests/03_request_signing_test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import crypto from 'k6/crypto';
import {
  generateNonce,
  getTimestamp,
  createSignature,
  getSignedHeaders,
  checkSuccess,
  checkLatency,
  checkStatus,
  parseResponse,
  randomInt,
  addThinkTime,
  log,
  Constants
} from './00_utils.js';

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 1 },     // Warmup
    { duration: '5m', target: 50 },    // Ramp up
    { duration: '10m', target: 150 },  // Sustain high load
    { duration: '5m', target: 50 },    // Ramp down
    { duration: '3m', target: 1 },     // Cooldown
  ],
  thresholds: {
    'http_req_duration': [
      'p(50)<100',
      'p(95)<300',
      'p(99)<500'
    ],
    'http_req_failed': ['rate<0.001'],  // <0.1% error (crypto must not fail)
    'signature_validation_rate': ['value>0.9999'],
    'nonce_collision_rate': ['value<0.0001']
  },
  ext: {
    loadimpact: {
      projectID: 3326635,
      name: 'Request Signing Load Test'
    }
  }
};

// Global metrics
let validSignatures = 0;
let invalidSignatures = 0;
let nonceCollisions = 0;
const usedNonces = {};

export default function () {
  group('Valid Signature Test', () => {
    const payload = {
      userId: `user_${randomInt(1, 10000)}`,
      action: 'test_request',
      timestamp: new Date().toISOString()
    };

    // Generate signature with valid parameters
    const nonce = generateNonce();
    const timestamp = getTimestamp();
    const headers = getSignedHeaders(payload);

    // Verify nonce is unique (collision detection)
    if (usedNonces[nonce]) {
      nonceCollisions++;
      log('warn', 'Nonce collision detected', { nonce });
    } else {
      usedNonces[nonce] = true;
      if (Object.keys(usedNonces).length > 100000) {
        delete usedNonces[Object.keys(usedNonces)[0]];
      }
    }

    // Make request with valid signature
    const res = http.post(
      `${Constants.API_BASE_URL}/test/verify-signature`,
      JSON.stringify(payload),
      { headers }
    );

    const isValid = checkSuccess(res, 'Valid signature accepted');
    checkLatency(res, 300, 'Signature verification < 300ms');

    if (isValid) {
      validSignatures++;

      // Verify signature components in response
      const body = parseResponse(res);
      check(res, {
        'Response includes verification details': (r) => body.data?.verified === true,
        'Timestamp in valid range': (r) => {
          const timestampDiff = Math.abs(new Date(body.data?.verifiedTimestamp) - new Date(timestamp));
          return timestampDiff < 5000; // Within 5 seconds
        }
      });
    } else {
      invalidSignatures++;
    }
  });

  // Invalid signature test - 10% of traffic
  if (Math.random() < 0.1) {
    group('Invalid Signature Detection', () => {
      const payload = {
        userId: `user_${randomInt(1, 10000)}`,
        action: 'test_request',
        timestamp: new Date().toISOString()
      };

      // Get valid headers
      const validHeaders = getSignedHeaders(payload);

      // Tamper with request body to invalidate signature
      const tamperedPayload = JSON.stringify({
        ...payload,
        amount: 9999  // Modified field
      });

      // Use original (now invalid) signature
      const res = http.post(
        `${Constants.API_BASE_URL}/test/verify-signature`,
        tamperedPayload,
        {
          headers: {
            ...validHeaders,
            'Content-Type': 'application/json'
          }
        }
      );

      checkStatus(res, 401, 'Tampered request rejected with 401');

      const body = parseResponse(res);
      check(res, {
        'Error indicates signature mismatch': (r) => {
          const errorMsg = body.error?.message?.toLowerCase() || '';
          return errorMsg.includes('signature') || errorMsg.includes('invalid');
        }
      });
    });
  }

  // Stale timestamp test - 5% of traffic
  if (Math.random() < 0.05) {
    group('Stale Timestamp Rejection', () => {
      const payload = {
        userId: `user_${randomInt(1, 10000)}`,
        action: 'test_request'
      };

      // Create timestamp 10 minutes in the past
      const staleTime = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const nonce = generateNonce();
      const signature = createSignature(
        JSON.stringify(payload),
        nonce,
        staleTime,
        Constants.API_SECRET
      );

      const res = http.post(
        `${Constants.API_BASE_URL}/test/verify-signature`,
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': Constants.API_KEY,
            'X-Request-Signature': signature,
            'X-Request-Nonce': nonce,
            'X-Request-Timestamp': staleTime
          }
        }
      );

      checkStatus(res, 400, 'Stale timestamp rejected with 400');

      const body = parseResponse(res);
      check(res, {
        'Error indicates timestamp issue': (r) => {
          const errorMsg = body.error?.message?.toLowerCase() || '';
          return errorMsg.includes('timestamp') || errorMsg.includes('stale');
        }
      });
    });
  }

  // Nonce reuse test - 5% of traffic
  if (Math.random() < 0.05) {
    group('Nonce Reuse Detection', () => {
      const payload = {
        userId: `user_${randomInt(1, 10000)}`,
        action: 'test_request'
      };

      const nonce = generateNonce();
      const timestamp = getTimestamp();
      const signature = createSignature(
        JSON.stringify(payload),
        nonce,
        timestamp,
        Constants.API_SECRET
      );

      // First request with new nonce
      const firstRes = http.post(
        `${Constants.API_BASE_URL}/test/verify-signature`,
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': Constants.API_KEY,
            'X-Request-Signature': signature,
            'X-Request-Nonce': nonce,
            'X-Request-Timestamp': timestamp
          }
        }
      );

      checkSuccess(firstRes, 'First request with nonce succeeds');

      sleep(0.5);

      // Retry with same nonce
      const retryRes = http.post(
        `${Constants.API_BASE_URL}/test/verify-signature`,
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': Constants.API_KEY,
            'X-Request-Signature': signature,
            'X-Request-Nonce': nonce,
            'X-Request-Timestamp': timestamp
          }
        }
      );

      checkStatus(retryRes, 400, 'Nonce reuse rejected with 400');
    });
  }

  // Wrong API key test - 5% of traffic
  if (Math.random() < 0.05) {
    group('Invalid API Key Detection', () => {
      const payload = {
        userId: `user_${randomInt(1, 10000)}`,
        action: 'test_request'
      };

      const nonce = generateNonce();
      const timestamp = getTimestamp();
      const signature = createSignature(
        JSON.stringify(payload),
        nonce,
        timestamp,
        Constants.API_SECRET
      );

      const res = http.post(
        `${Constants.API_BASE_URL}/test/verify-signature`,
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'invalid_key_12345',  // Wrong API key
            'X-Request-Signature': signature,
            'X-Request-Nonce': nonce,
            'X-Request-Timestamp': timestamp
          }
        }
      );

      checkStatus(res, 401, 'Invalid API key rejected with 401');
    });
  }

  // Signature algorithm consistency test - 2% of traffic
  if (Math.random() < 0.02) {
    group('Signature Consistency', () => {
      const payload = {
        userId: `user_${randomInt(1, 10000)}`,
        action: 'test_request',
        data: {
          field1: 'value1',
          field2: 123,
          field3: true
        }
      };

      const nonce = generateNonce();
      const timestamp = getTimestamp();
      const body = JSON.stringify(payload);

      // Generate signature twice with same inputs
      const sig1 = createSignature(body, nonce, timestamp, Constants.API_SECRET);
      const sig2 = createSignature(body, nonce, timestamp, Constants.API_SECRET);

      check(null, {
        'Signatures are deterministic': () => sig1 === sig2,
        'Signature is non-empty': () => sig1.length > 0,
        'Signature is hex encoded': () => /^[0-9a-f]+$/i.test(sig1)
      });
    });
  }

  // Multiple concurrent requests with different signatures
  group('Concurrent Request Signing', () => {
    for (let i = 0; i < 3; i++) {
      const payload = {
        requestId: `req_${randomInt(1, 1000000)}_${i}`,
        timestamp: new Date().toISOString()
      };

      const headers = getSignedHeaders(payload);

      const res = http.post(
        `${Constants.API_BASE_URL}/test/verify-signature`,
        JSON.stringify(payload),
        { headers }
      );

      checkSuccess(res, `Concurrent request ${i + 1} signed correctly`);
    }
  });
}

export function teardown(data) {
  const successRate = (validSignatures / (validSignatures + invalidSignatures || 1) * 100).toFixed(2);
  const collisionRate = (nonceCollisions / (validSignatures + invalidSignatures || 1) * 100).toFixed(4);

  log('info', 'Request signing test completed', {
    validSignatures,
    invalidSignatures,
    successRate: successRate + '%',
    nonceCollisions,
    collisionRate: collisionRate + '%',
    totalNoncesGenerated: Object.keys(usedNonces).length
  });
}
