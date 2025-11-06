/**
 * User account status
 */
export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
  PENDING_VERIFICATION = 'pending_verification',
}

/**
 * KYC verification status
 */
export enum KYCStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

/**
 * KYC levels/tiers
 */
export enum KYCLevel {
  TIER_0 = 0, // No KYC
  TIER_1 = 1, // Basic info (email, phone)
  TIER_2 = 2, // BVN verification
  TIER_3 = 3, // Full KYC (documents)
}

/**
 * Transaction/Payment status
 */
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  REQUIRES_ACTION = 'requires_action',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed',
  REFUNDED = 'refunded',
}

/**
 * Wallet status
 */
export enum WalletStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  CLOSED = 'closed',
}

/**
 * Payment method types
 */
export enum PaymentMethodType {
  CARD = 'card',
  BANK_ACCOUNT = 'bank_account',
  WALLET = 'wallet',
  CASH = 'cash',
}

/**
 * Card brands
 */
export enum CardBrand {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  VERVE = 'verve',
  AMEX = 'amex',
  DISCOVER = 'discover',
}

/**
 * Card types
 */
export enum CardType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  PREPAID = 'prepaid',
}

/**
 * Transfer types
 */
export enum TransferType {
  P2P = 'p2p',
  BANK_TRANSFER = 'bank_transfer',
  INTERNATIONAL = 'international',
  INTERNAL = 'internal',
}

/**
 * Bank transfer methods
 */
export enum BankTransferMethod {
  NIP = 'nip', // NIBSS Instant Payment
  NIBSS = 'nibss', // NIBSS
  SWIFT = 'swift', // International
  WISE = 'wise', // International
}

/**
 * Dispute types
 */
export enum DisputeType {
  UNAUTHORIZED = 'unauthorized',
  FRAUD = 'fraud',
  NOT_RECEIVED = 'not_received',
  DEFECTIVE = 'defective',
  DUPLICATE = 'duplicate',
  AMOUNT_MISMATCH = 'amount_mismatch',
  OTHER = 'other',
}

/**
 * Dispute status
 */
export enum DisputeStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  WON = 'won',
  LOST = 'lost',
}

/**
 * Refund status
 */
export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Notification types
 */
export enum NotificationType {
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
  IN_APP = 'in_app',
}

/**
 * Notification status
 */
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

/**
 * Reconciliation status
 */
export enum ReconciliationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Reconciliation match status
 */
export enum ReconciliationMatchStatus {
  MATCHED = 'matched',
  UNMATCHED = 'unmatched',
  DISCREPANCY = 'discrepancy',
}

/**
 * Fraud decision
 */
export enum FraudDecision {
  ALLOWED = 'allowed',
  BLOCKED = 'blocked',
  REQUIRES_VERIFICATION = 'requires_verification',
}

/**
 * Document types
 */
export enum DocumentType {
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  NATIONAL_ID = 'national_id',
  PROOF_OF_ADDRESS = 'proof_of_address',
  SELFIE = 'selfie',
  BVN = 'bvn',
  NIN = 'nin',
}

/**
 * Ledger entry types
 */
export enum LedgerEntryType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

/**
 * Account types (Chart of Accounts)
 */
export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}
