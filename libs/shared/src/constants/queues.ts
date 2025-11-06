/**
 * Queue names for BullMQ
 */
export const QUEUES = {
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  RECONCILIATION: 'reconciliation',
  WEBHOOKS: 'webhooks',
  LEDGER: 'ledger',
  FRAUD_ANALYSIS: 'fraud-analysis',
  REFUNDS: 'refunds',
  REPORTS: 'reports',
  TRANSFERS: 'transfers',
  BILLS: 'bills',
} as const;

/**
 * Event names for queue processing and event emitters
 */
export const EVENTS = {
  // Authentication events
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  PASSWORD_RESET_REQUESTED: 'password.reset.requested',
  PASSWORD_RESET_COMPLETED: 'password.reset.completed',

  // Payment events
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_PROCESSING: 'payment.processing',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_CANCELLED: 'payment.cancelled',
  PAYMENT_REFUNDED: 'payment.refunded',

  // Transfer events
  TRANSFER_INITIATED: 'transfer.initiated',
  TRANSFER_PROCESSING: 'transfer.processing',
  TRANSFER_COMPLETED: 'transfer.completed',
  TRANSFER_FAILED: 'transfer.failed',
  TRANSFER_REVERSED: 'transfer.reversed',

  // Wallet events
  WALLET_CREATED: 'wallet.created',
  WALLET_DEBITED: 'wallet.debited',
  WALLET_CREDITED: 'wallet.credited',
  WALLET_FROZEN: 'wallet.frozen',
  WALLET_UNFROZEN: 'wallet.unfrozen',

  // Notification events
  SEND_SMS: 'notification.sms',
  SEND_EMAIL: 'notification.email',
  SEND_PUSH: 'notification.push',

  // Reconciliation events
  RECONCILIATION_STARTED: 'reconciliation.started',
  RECONCILIATION_COMPLETED: 'reconciliation.completed',
  RECONCILIATION_FAILED: 'reconciliation.failed',
  DISCREPANCY_FOUND: 'reconciliation.discrepancy',

  // Webhook events
  WEBHOOK_DELIVERY: 'webhook.delivery',
  WEBHOOK_FAILED: 'webhook.failed',

  // Fraud events
  FRAUD_DETECTED: 'fraud.detected',
  FRAUD_REVIEW_REQUIRED: 'fraud.review.required',
  FRAUD_APPROVED: 'fraud.approved',
  FRAUD_REJECTED: 'fraud.rejected',

  // KYC events
  KYC_SUBMITTED: 'kyc.submitted',
  KYC_APPROVED: 'kyc.approved',
  KYC_REJECTED: 'kyc.rejected',
  KYC_DOCUMENT_UPLOADED: 'kyc.document.uploaded',

  // Card events
  CARD_ADDED: 'card.added',
  CARD_REMOVED: 'card.removed',
  CARD_CHARGED: 'card.charged',

  // Dispute events
  DISPUTE_CREATED: 'dispute.created',
  DISPUTE_UPDATED: 'dispute.updated',
  DISPUTE_RESOLVED: 'dispute.resolved',

  // Bill payment events
  BILL_PAYMENT_INITIATED: 'bill.payment.initiated',
  BILL_PAYMENT_COMPLETED: 'bill.payment.completed',
  BILL_PAYMENT_FAILED: 'bill.payment.failed',

  // Security events
  SUSPICIOUS_ACTIVITY: 'security.suspicious',
  ACCOUNT_LOCKED: 'security.account.locked',
  DEVICE_ADDED: 'security.device.added',
  LOGIN_FAILED: 'security.login.failed',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
