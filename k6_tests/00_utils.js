/**
 * K6 Testing Utilities
 * Shared helper functions for all load tests
 */

import crypto from 'k6/crypto';
import encoding from 'k6/encoding';
import http from 'k6/http';
import { check } from 'k6';

const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';
const API_KEY = __ENV.API_KEY || 'test_key_12345';
const API_SECRET = __ENV.API_SECRET || 'test_secret_67890';

/**
 * Generate a unique UUID-like nonce
 * @returns {string} Unique nonce value
 */
export function generateNonce() {
  return crypto.sha256(`${Date.now()}-${Math.random()}`);
}

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
export function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Create HMAC-SHA256 signature for request signing
 * @param {string} payload - Request body/payload
 * @param {string} nonce - Unique request identifier
 * @param {string} timestamp - Request timestamp
 * @param {string} secret - API secret key
 * @returns {string} Hex-encoded HMAC-SHA256 signature
 */
export function createSignature(payload, nonce, timestamp, secret = API_SECRET) {
  const message = `${payload}${nonce}${timestamp}`;
  return crypto.hmac('sha256', secret, message, 'hex');
}

/**
 * Prepare signed request headers
 * @param {Object} requestBody - Request body object
 * @param {string} apiKey - API key (default from env)
 * @param {string} apiSecret - API secret (default from env)
 * @returns {Object} Headers object with signature
 */
export function getSignedHeaders(requestBody, apiKey = API_KEY, apiSecret = API_SECRET) {
  const nonce = generateNonce();
  const timestamp = getTimestamp();
  const body = JSON.stringify(requestBody);
  const signature = createSignature(body, nonce, timestamp, apiSecret);

  return {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    'X-Request-Signature': signature,
    'X-Request-Nonce': nonce,
    'X-Request-Timestamp': timestamp,
    'User-Agent': 'k6-load-test/1.0'
  };
}

/**
 * Make a signed POST request
 * @param {string} endpoint - API endpoint path
 * @param {Object} payload - Request body
 * @param {Object} params - Additional k6 params (tags, auth, etc)
 * @returns {Object} HTTP response object
 */
export function signedPost(endpoint, payload, params = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getSignedHeaders(payload);

  return http.post(url, JSON.stringify(payload), {
    headers,
    ...params,
    tags: { ...params.tags, type: 'signed_post' }
  });
}

/**
 * Make a signed GET request
 * @param {string} endpoint - API endpoint path
 * @param {Object} params - Additional k6 params
 * @returns {Object} HTTP response object
 */
export function signedGet(endpoint, params = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const nonce = generateNonce();
  const timestamp = getTimestamp();
  const signature = createSignature('', nonce, timestamp);

  const headers = {
    'X-API-Key': API_KEY,
    'X-Request-Signature': signature,
    'X-Request-Nonce': nonce,
    'X-Request-Timestamp': timestamp,
    'User-Agent': 'k6-load-test/1.0',
    ...params.headers
  };

  return http.get(url, {
    headers,
    ...params,
    tags: { ...params.tags, type: 'signed_get' }
  });
}

/**
 * Extract JWT token from response
 * @param {Object} response - HTTP response with auth token
 * @returns {string} JWT token
 */
export function extractToken(response) {
  try {
    const body = JSON.parse(response.body);
    return body.data?.token || body.token;
  } catch (e) {
    console.error('Failed to extract token:', e);
    return null;
  }
}

/**
 * Get bearer token headers for authenticated requests
 * @param {string} token - JWT token
 * @returns {Object} Headers with Authorization
 */
export function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'k6-load-test/1.0'
  };
}

/**
 * Make an authenticated GET request
 * @param {string} endpoint - API endpoint
 * @param {string} token - JWT token
 * @param {Object} params - Additional params
 * @returns {Object} HTTP response
 */
export function authGet(endpoint, token, params = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  return http.get(url, {
    headers: getAuthHeaders(token),
    ...params,
    tags: { ...params.tags, type: 'auth_get' }
  });
}

/**
 * Make an authenticated POST request
 * @param {string} endpoint - API endpoint
 * @param {string} token - JWT token
 * @param {Object} payload - Request body
 * @param {Object} params - Additional params
 * @returns {Object} HTTP response
 */
export function authPost(endpoint, token, payload, params = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  return http.post(url, JSON.stringify(payload), {
    headers: getAuthHeaders(token),
    ...params,
    tags: { ...params.tags, type: 'auth_post' }
  });
}

/**
 * Generate test user data
 * @returns {Object} User registration payload
 */
export function generateUserData() {
  const timestamp = Date.now();
  return {
    email: `user_${timestamp}_${Math.random().toString(36).slice(2)}@test.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    firstName: `TestUser${timestamp}`,
    lastName: `Load${Math.floor(Math.random() * 1000)}`,
    password: 'SecurePass123!@#',
    country: 'US',
    timezone: 'UTC'
  };
}

/**
 * Generate merchant data
 * @returns {Object} Merchant registration payload
 */
export function generateMerchantData() {
  const timestamp = Date.now();
  return {
    businessName: `TestMerchant_${timestamp}`,
    businessEmail: `merchant_${timestamp}@test.com`,
    businessPhone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    businessType: ['retail', 'ecommerce', 'saas', 'services'][Math.floor(Math.random() * 4)],
    registrationNumber: `REG${timestamp}`,
    businessAddress: {
      street: '123 Test Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US'
    },
    ownerName: `Owner ${Math.random().toString(36).slice(2, 8)}`,
    ownerEmail: `owner_${timestamp}@test.com`,
    ownerPhone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    settlementAccount: {
      bankName: 'Test Bank',
      accountNumber: `${Math.random().toString().slice(2, 12)}`,
      accountName: 'Test Account',
      routingNumber: '123456789'
    }
  };
}

/**
 * Generate payment transaction data
 * @param {number} amount - Payment amount (default random 10-1000)
 * @returns {Object} Payment request payload
 */
export function generatePaymentData(amount = null) {
  if (!amount) {
    // 90% small payments, 5% large, 5% medium
    const rand = Math.random();
    if (rand < 0.9) {
      amount = Math.floor(Math.random() * 500 + 10); // 10-500
    } else if (rand < 0.95) {
      amount = Math.floor(Math.random() * 45000 + 5000); // 5000-50000
    } else {
      amount = Math.floor(Math.random() * 4000 + 500); // 500-4500
    }
  }

  return {
    amount: amount,
    currency: ['USD', 'EUR', 'GBP', 'NGN'][Math.floor(Math.random() * 4)],
    description: `Test Payment ${Date.now()}`,
    metadata: {
      orderId: `ORD-${Date.now()}`,
      customerId: `CUST-${Math.random().toString(36).slice(2, 8)}`
    },
    idempotency_key: `payment-${Date.now()}-${Math.random()}`,
    paymentMethod: ['card', 'bank_transfer', 'wallet'][Math.floor(Math.random() * 3)]
  };
}

/**
 * Generate subscription data
 * @returns {Object} Subscription request payload
 */
export function generateSubscriptionData() {
  return {
    planName: `Plan_${Date.now()}`,
    amount: Math.floor(Math.random() * 100 + 5),
    currency: 'USD',
    interval: ['daily', 'weekly', 'monthly'][Math.floor(Math.random() * 3)],
    description: `Test Subscription Plan`,
    metadata: {
      createdAt: new Date().toISOString()
    }
  };
}

/**
 * Generate dispute data
 * @returns {Object} Dispute request payload
 */
export function generateDisputeData() {
  return {
    reason: [
      'UNAUTHORIZED_TRANSACTION',
      'FRAUD',
      'DUPLICATE_CHARGE',
      'INVALID_DESCRIPTION',
      'MERCHANDISE_NOT_RECEIVED'
    ][Math.floor(Math.random() * 5)],
    description: `Test dispute - ${Date.now()}`,
    amount: Math.floor(Math.random() * 5000 + 100),
    evidence: {
      type: 'email',
      content: 'Test evidence documentation',
      uploadedAt: new Date().toISOString()
    }
  };
}

/**
 * Generate refund data
 * @returns {Object} Refund request payload
 */
export function generateRefundData(amount = null) {
  if (!amount) {
    amount = Math.floor(Math.random() * 5000 + 10);
  }

  return {
    amount: amount,
    reason: ['CUSTOMER_REQUEST', 'MERCHANT_REQUEST', 'FRAUD'][Math.floor(Math.random() * 3)],
    description: `Test refund - ${Date.now()}`,
    metadata: {
      refundId: `REF-${Date.now()}`
    }
  };
}

/**
 * Parse JSON response safely
 * @param {Object} response - HTTP response
 * @returns {Object} Parsed JSON or empty object
 */
export function parseResponse(response) {
  try {
    return JSON.parse(response.body);
  } catch (e) {
    console.warn('Failed to parse response:', e);
    return {};
  }
}

/**
 * Verify response is successful
 * @param {Object} response - HTTP response
 * @param {string} name - Check name for reporting
 * @returns {boolean} True if status 200-299
 */
export function checkSuccess(response, name = 'Success') {
  return check(response, {
    [name]: (r) => r.status >= 200 && r.status < 300
  });
}

/**
 * Check response status is exactly expected
 * @param {Object} response - HTTP response
 * @param {number} expectedStatus - Expected status code
 * @param {string} name - Check name
 * @returns {boolean} True if status matches
 */
export function checkStatus(response, expectedStatus, name = `Status ${expectedStatus}`) {
  return check(response, {
    [name]: (r) => r.status === expectedStatus
  });
}

/**
 * Check response latency
 * @param {Object} response - HTTP response
 * @param {number} maxMs - Maximum latency in milliseconds
 * @param {string} name - Check name
 * @returns {boolean} True if latency < maxMs
 */
export function checkLatency(response, maxMs, name = `Latency < ${maxMs}ms`) {
  return check(response, {
    [name]: (r) => r.timings.duration < maxMs
  });
}

/**
 * Check response has expected data field
 * @param {Object} response - HTTP response
 * @param {string} field - Expected field path (dot notation)
 * @param {string} name - Check name
 * @returns {boolean} True if field exists
 */
export function checkField(response, field, name = `Has ${field}`) {
  const body = parseResponse(response);
  const value = getNestedValue(body, field);
  return check(response, {
    [name]: () => value !== undefined && value !== null
  });
}

/**
 * Get nested object value by dot notation path
 * @param {Object} obj - Object to search
 * @param {string} path - Path like "data.user.id"
 * @returns {*} Value or undefined
 */
export function getNestedValue(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
export function sleep(ms) {
  if (typeof __VU !== 'undefined') {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      // Busy wait
    }
  }
}

/**
 * Add realistic think time (1-3 seconds)
 */
export function addThinkTime() {
  const thinkTime = Math.random() * 2000 + 1000; // 1-3 seconds
  sleep(thinkTime);
}

/**
 * Add variable think time based on action type
 * @param {string} action - Action type: 'quick', 'normal', 'decision'
 */
export function addContextualThinkTime(action) {
  let thinkTime;
  switch (action) {
    case 'quick':
      thinkTime = Math.random() * 500; // 0-500ms
      break;
    case 'normal':
      thinkTime = Math.random() * 2000 + 1000; // 1-3s
      break;
    case 'decision':
      thinkTime = Math.random() * 3000 + 2000; // 2-5s
      break;
    default:
      thinkTime = Math.random() * 2000 + 1000;
  }
  sleep(thinkTime);
}

/**
 * Retry request with exponential backoff
 * @param {Function} requestFn - Function that makes the request
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Object} HTTP response from successful attempt
 */
export function retryWithBackoff(requestFn, maxRetries = 3, initialDelay = 1000) {
  let delay = initialDelay;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = requestFn();
      if (response.status < 500) {
        return response; // Return on success or client error
      }
      lastError = response;
    } catch (e) {
      lastError = e;
    }

    if (attempt < maxRetries) {
      sleep(delay);
      delay *= 2; // Exponential backoff
    }
  }

  return lastError;
}

/**
 * Get random item from array
 * @param {Array} arr - Array to select from
 * @returns {*} Random item
 */
export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random integer in range
 * @param {number} min - Minimum (inclusive)
 * @param {number} max - Maximum (inclusive)
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random float in range
 * @param {number} min - Minimum (inclusive)
 * @param {number} max - Maximum (inclusive)
 * @returns {number} Random float
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Log structured message
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 */
export function log(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0
    ? ' | ' + JSON.stringify(context)
    : '';
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`);
}

/**
 * Custom metrics tracking
 */
export const customMetrics = {
  authLatency: null,
  paymentLatency: null,
  fraudCheckLatency: null,
  subscriptionLatency: null,
  disputeLatency: null
};

/**
 * Initialize custom metrics
 * @param {Object} metrics - k6 metrics object
 */
export function initCustomMetrics(metrics) {
  if (!customMetrics.authLatency) {
    customMetrics.authLatency = new metrics.Trend('auth_latency', { unit: 'ms' });
    customMetrics.paymentLatency = new metrics.Trend('payment_latency', { unit: 'ms' });
    customMetrics.fraudCheckLatency = new metrics.Trend('fraud_check_latency', { unit: 'ms' });
    customMetrics.subscriptionLatency = new metrics.Trend('subscription_latency', { unit: 'ms' });
    customMetrics.disputeLatency = new metrics.Trend('dispute_latency', { unit: 'ms' });
  }
}

/**
 * Record custom metric
 * @param {string} metricName - Metric name
 * @param {number} value - Metric value
 * @param {Object} tags - Metric tags
 */
export function recordMetric(metricName, value, tags = {}) {
  if (customMetrics[metricName]) {
    customMetrics[metricName].add(value, tags);
  }
}

/**
 * Export utility constants
 */
export const Constants = {
  API_BASE_URL,
  API_KEY,
  API_SECRET,
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_THINK_TIME: 2000,
  MAX_RETRIES: 3,
  RETRY_BACKOFF: 1000
};

export default {
  generateNonce,
  getTimestamp,
  createSignature,
  getSignedHeaders,
  signedPost,
  signedGet,
  extractToken,
  getAuthHeaders,
  authGet,
  authPost,
  generateUserData,
  generateMerchantData,
  generatePaymentData,
  generateSubscriptionData,
  generateDisputeData,
  generateRefundData,
  parseResponse,
  checkSuccess,
  checkStatus,
  checkLatency,
  checkField,
  getNestedValue,
  sleep,
  addThinkTime,
  addContextualThinkTime,
  retryWithBackoff,
  randomItem,
  randomInt,
  randomFloat,
  log,
  customMetrics,
  initCustomMetrics,
  recordMetric,
  Constants
};
