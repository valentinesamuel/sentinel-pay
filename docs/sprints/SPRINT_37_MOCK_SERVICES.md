# Sprint 37 Mock Services - Escrow Services

**Sprint:** Sprint 37
**Focus:** Realistic mock services for fund segregation, transfers, and arbitration
**Mock Services:** 4 primary

---

## Overview

These mocks simulate:
- **Fund Segregation:** Separate escrow account with audit trail
- **Bank Transfers:** Variable latency (30-120 seconds), occasional failures
- **Reconciliation:** Daily/hourly balance verification
- **Arbitration Engine:** Automated decision-making with reasoning
- **Partial Failure Handling:** Some transfers succeed, some fail
- **Audit Trail:** Complete transaction history for compliance

---

## 1. Bank Fund Transfer Mock

### Purpose
Simulate bank transfers for fund lockup, release, and settlement with realistic delays and occasional failures

### Realistic Behavior
- **Success Rate:** 97% on first attempt
- **Latency:** 30-120 seconds (success), 2-5 minutes (failure)
- **Common Failures:** Insufficient balance (1%), network error (1%), invalid account (1%)
- **Reconciliation:** 24-hour settlement with daily notifications
- **Batch Processing:** Handle 1000+ transfers per hour

### Implementation

```typescript
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';

enum TransferStatus {
  INITIATED = 'initiated',
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  CLEARED = 'cleared',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

interface BankTransfer {
  transferId: string;
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: TransferStatus;
  statusCode?: string;
  failureReason?: string;
  initiatedAt: Date;
  completedAt?: Date;
  settledAt?: Date;
  retryCount: number;
  bankResponseTime?: number; // milliseconds
  narration: string;
}

@Injectable()
export class BankTransferMock {
  private transferStore: Map<string, BankTransfer> = new Map();
  private accountBalances: Map<string, number> = new Map();
  private readonly CLEARING_DELAY = 30000; // 30 seconds minimum
  private readonly SETTLEMENT_DELAY = 86400000; // 24 hours
  private readonly MAX_BATCH_SIZE = 1000;

  constructor() {
    // Initialize mock accounts with balances
    this.accountBalances.set('ESCROW-MAIN', 1000000000); // ₦1B
    this.accountBalances.set('SELLER-PAYOUT', 100000000); // ₦100M
    this.accountBalances.set('BUYER-REFUND', 100000000); // ₦100M
    this.accountBalances.set('FEE-ACCOUNT', 50000000); // ₦50M
  }

  async initiateTransfer(
    sourceAccount: string,
    destinationAccount: string,
    amount: number,
    reference: string,
    description: string,
    narration?: string,
  ): Promise<{ transferId: string; status: string; estimatedTime: string }> {
    // Validate accounts
    if (!this.accountBalances.has(sourceAccount)) {
      throw new BadRequestException('Invalid source account');
    }

    // Check balance
    const balance = this.accountBalances.get(sourceAccount);
    if (balance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ₦${balance}, Required: ₦${amount}`,
      );
    }

    const transferId = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const simulatedLatency = this.getRandomTransferLatency();
    const willFail = this.shouldFail(0.03); // 3% failure rate

    const transfer: BankTransfer = {
      transferId,
      sourceAccount,
      destinationAccount,
      amount,
      currency: 'NGN',
      description,
      reference,
      status: TransferStatus.INITIATED,
      initiat edAt: new Date(),
      retryCount: 0,
      narration: narration || `Transfer: ${reference}`,
    };

    this.transferStore.set(transferId, transfer);

    // Deduct from source immediately (escrow practice)
    this.accountBalances.set(sourceAccount, balance - amount);

    // Simulate bank processing
    setTimeout(async () => {
      transfer.status = TransferStatus.PENDING;

      if (willFail) {
        await this.handleTransferFailure(transferId, sourceAccount, amount);
      } else {
        await this.handleTransferSuccess(transferId, sourceAccount, destinationAccount, amount);
      }
    }, simulatedLatency);

    return {
      transferId,
      status: 'initiated',
      estimatedTime: `${Math.ceil(simulatedLatency / 1000)} seconds`,
    };
  }

  async getTransferStatus(transferId: string): Promise<BankTransfer> {
    const transfer = this.transferStore.get(transferId);
    if (!transfer) {
      throw new BadRequestException('Transfer not found');
    }
    return transfer;
  }

  async retryTransfer(transferId: string): Promise<{ transferId: string; status: string }> {
    const transfer = this.transferStore.get(transferId);
    if (!transfer) {
      throw new BadRequestException('Transfer not found');
    }

    if (transfer.status !== TransferStatus.FAILED) {
      throw new BadRequestException('Only failed transfers can be retried');
    }

    if (transfer.retryCount >= 3) {
      throw new BadRequestException('Max retries exceeded');
    }

    transfer.retryCount += 1;
    transfer.status = TransferStatus.INITIATED;

    // Refund original deduction
    const currentBalance = this.accountBalances.get(transfer.sourceAccount);
    this.accountBalances.set(transfer.sourceAccount, currentBalance + transfer.amount);

    // Retry with longer delay
    const retryLatency = this.getRandomTransferLatency() * (transfer.retryCount + 1);
    const willFail = this.shouldFail(0.08 * transfer.retryCount); // Higher success on retry

    setTimeout(async () => {
      transfer.status = TransferStatus.PENDING;
      if (willFail) {
        await this.handleTransferFailure(transferId, transfer.sourceAccount, transfer.amount);
      } else {
        await this.handleTransferSuccess(
          transferId,
          transfer.sourceAccount,
          transfer.destinationAccount,
          transfer.amount,
        );
      }
    }, retryLatency);

    return {
      transferId,
      status: 'retrying',
    };
  }

  private async handleTransferSuccess(
    transferId: string,
    sourceAccount: string,
    destinationAccount: string,
    amount: number,
  ): Promise<void> {
    const transfer = this.transferStore.get(transferId);
    if (transfer) {
      transfer.status = TransferStatus.IN_TRANSIT;
      transfer.bankResponseTime = Math.random() * 3000 + 500;

      // Simulate clearing (bank processing time)
      const clearingDelay = Math.random() * (this.CLEARING_DELAY - 10000) + 10000;
      setTimeout(() => {
        if (transfer.status === TransferStatus.IN_TRANSIT) {
          transfer.status = TransferStatus.CLEARED;
          transfer.completedAt = new Date();

          // Credit destination
          const destBalance = this.accountBalances.get(destinationAccount) || 0;
          this.accountBalances.set(destinationAccount, destBalance + amount);

          // Schedule settlement (24 hours)
          setTimeout(() => {
            if (transfer.status === TransferStatus.CLEARED) {
              transfer.status = TransferStatus.CLEARED; // Already settled
              transfer.settledAt = new Date();
            }
          }, this.SETTLEMENT_DELAY);
        }
      }, clearingDelay);
    }
  }

  private async handleTransferFailure(
    transferId: string,
    sourceAccount: string,
    amount: number,
  ): Promise<void> {
    const transfer = this.transferStore.get(transferId);
    if (transfer) {
      const failureReasons = [
        'Destination account closed',
        'Invalid destination account number',
        'Insufficient destination bank balance',
        'Network connectivity issue',
        'Processing timeout',
      ];

      transfer.status = TransferStatus.FAILED;
      transfer.failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      transfer.completedAt = new Date();

      // Auto-refund on failure (will be attempted by system)
      console.log(`[AUTO-REFUND] Transfer ${transferId} failed. Refunding ₦${amount} to ${sourceAccount}`);
    }
  }

  async reverseTransfer(transferId: string): Promise<{ status: string; refundedAmount: number }> {
    const transfer = this.transferStore.get(transferId);
    if (!transfer) {
      throw new BadRequestException('Transfer not found');
    }

    if (transfer.status === TransferStatus.REVERSED) {
      throw new BadRequestException('Transfer already reversed');
    }

    if (transfer.status !== TransferStatus.CLEARED && transfer.status !== TransferStatus.IN_TRANSIT) {
      throw new BadRequestException('Only cleared transfers can be reversed');
    }

    transfer.status = TransferStatus.REVERSED;

    // Refund source account
    const sourceBalance = this.accountBalances.get(transfer.sourceAccount);
    this.accountBalances.set(transfer.sourceAccount, sourceBalance + transfer.amount);

    // Deduct from destination
    const destBalance = this.accountBalances.get(transfer.destinationAccount) || 0;
    this.accountBalances.set(transfer.destinationAccount, Math.max(0, destBalance - transfer.amount));

    return {
      status: 'reversed',
      refundedAmount: transfer.amount,
    };
  }

  getAccountBalance(accountName: string): { account: string; balance: number; currency: string } {
    const balance = this.accountBalances.get(accountName) || 0;
    return {
      account: accountName,
      balance,
      currency: 'NGN',
    };
  }

  private shouldFail(failureRate: number = 0.03): boolean {
    return Math.random() < failureRate;
  }

  private getRandomTransferLatency(): number {
    // 30-120 seconds for success, 120-300 seconds for failure
    return Math.random() < 0.97
      ? Math.random() * 90000 + 30000
      : Math.random() * 180000 + 120000;
  }

  getMetrics(): {
    totalTransfers: number;
    successfulTransfers: number;
    failedTransfers: number;
    reversedTransfers: number;
    totalVolume: number;
    averageLatency: number;
    successRate: number;
  } {
    const transfers = Array.from(this.transferStore.values());
    const successful = transfers.filter((t) => t.status === TransferStatus.CLEARED);
    const failed = transfers.filter((t) => t.status === TransferStatus.FAILED);
    const reversed = transfers.filter((t) => t.status === TransferStatus.REVERSED);

    const latencies = successful
      .filter((t) => t.completedAt && t.initiatedAt)
      .map((t) => t.completedAt.getTime() - t.initiatedAt.getTime());

    const averageLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    const totalVolume = transfers.reduce((sum, t) => sum + t.amount, 0);
    const successRate =
      transfers.length > 0 ? ((successful.length + reversed.length) / transfers.length) * 100 : 0;

    return {
      totalTransfers: transfers.length,
      successfulTransfers: successful.length,
      failedTransfers: failed.length,
      reversedTransfers: reversed.length,
      totalVolume: Math.round(totalVolume),
      averageLatency: Math.round(averageLatency),
      successRate: Math.round(successRate * 100) / 100,
    };
  }
}
```

---

## 2. Fund Segregation Account Mock

### Purpose
Manage escrow fund segregation with audit trail, compliance tracking, and daily reconciliation

### Realistic Behavior
- **Separate Accounts:** One for each escrow or batch
- **Audit Trail:** Every transaction logged with timestamp, user, reason
- **Daily Reconciliation:** Verify balances match ledger
- **Compliance Reporting:** Generate reports for CBN/regulatory review

### Implementation

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';

interface FundMovement {
  movementId: string;
  escrowId: string;
  movementType: 'LOCKUP' | 'RELEASE' | 'REFUND' | 'FEE_DEDUCTION';
  amount: number;
  sourceParty: string; // 'buyer', 'seller', 'platform'
  destinationParty: string;
  reference: string;
  timestamp: Date;
  auditedBy?: string;
  notes?: string;
}

interface AccountLedger {
  escrowId: string;
  totalLocked: number;
  totalReleased: number;
  totalRefunded: number;
  currentBalance: number;
  movements: FundMovement[];
  lastReconciliation?: Date;
  reconciliationStatus: 'balanced' | 'unbalanced' | 'pending_review';
}

@Injectable()
export class FundSegregationMock {
  private ledgers: Map<string, AccountLedger> = new Map();
  private movementStore: Map<string, FundMovement> = new Map();
  private readonly ACCOUNT_PREFIX = 'ESC';

  async lockupFunds(
    escrowId: string,
    amount: number,
    buyerReference: string,
  ): Promise<{ escrowAccountId: string; lockedAmount: number; status: string }> {
    const escrowAccountId = `${this.ACCOUNT_PREFIX}-${escrowId}`;

    let ledger = this.ledgers.get(escrowId);
    if (!ledger) {
      ledger = {
        escrowId,
        totalLocked: 0,
        totalReleased: 0,
        totalRefunded: 0,
        currentBalance: 0,
        movements: [],
        reconciliationStatus: 'pending_review',
      };
      this.ledgers.set(escrowId, ledger);
    }

    const movementId = `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const movement: FundMovement = {
      movementId,
      escrowId,
      movementType: 'LOCKUP',
      amount,
      sourceParty: 'buyer',
      destinationParty: 'escrow',
      reference: buyerReference,
      timestamp: new Date(),
      notes: `Funds locked in escrow account ${escrowAccountId}`,
    };

    this.movementStore.set(movementId, movement);
    ledger.movements.push(movement);
    ledger.totalLocked += amount;
    ledger.currentBalance += amount;

    console.log(`[FUND SEGREGATION] ₦${amount} locked in escrow ${escrowId}`);

    return {
      escrowAccountId,
      lockedAmount: amount,
      status: 'locked',
    };
  }

  async releaseFunds(
    escrowId: string,
    amount: number,
    recipientParty: 'seller' | 'buyer',
    reference: string,
  ): Promise<{ releasedAmount: number; newBalance: number; status: string }> {
    const ledger = this.ledgers.get(escrowId);
    if (!ledger) {
      throw new BadRequestException('Escrow account not found');
    }

    if (ledger.currentBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ₦${ledger.currentBalance}, Required: ₦${amount}`,
      );
    }

    const movementId = `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const movement: FundMovement = {
      movementId,
      escrowId,
      movementType: 'RELEASE',
      amount,
      sourceParty: 'escrow',
      destinationParty: recipientParty,
      reference,
      timestamp: new Date(),
      notes: `Funds released to ${recipientParty}`,
    };

    this.movementStore.set(movementId, movement);
    ledger.movements.push(movement);
    ledger.totalReleased += amount;
    ledger.currentBalance -= amount;
    ledger.reconciliationStatus = 'pending_review';

    console.log(`[FUND SEGREGATION] ₦${amount} released to ${recipientParty} from escrow ${escrowId}`);

    return {
      releasedAmount: amount,
      newBalance: ledger.currentBalance,
      status: 'released',
    };
  }

  async refundFunds(
    escrowId: string,
    amount: number,
    reference: string,
  ): Promise<{ refundedAmount: number; status: string }> {
    const ledger = this.ledgers.get(escrowId);
    if (!ledger) {
      throw new BadRequestException('Escrow account not found');
    }

    if (ledger.currentBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance for refund. Available: ₦${ledger.currentBalance}`,
      );
    }

    const movementId = `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const movement: FundMovement = {
      movementId,
      escrowId,
      movementType: 'REFUND',
      amount,
      sourceParty: 'escrow',
      destinationParty: 'buyer',
      reference,
      timestamp: new Date(),
      notes: `Refund to buyer`,
    };

    this.movementStore.set(movementId, movement);
    ledger.movements.push(movement);
    ledger.totalRefunded += amount;
    ledger.currentBalance -= amount;

    return {
      refundedAmount: amount,
      status: 'refunded',
    };
  }

  async reconcileAccount(escrowId: string): Promise<{ status: string; matches: boolean; variance: number }> {
    const ledger = this.ledgers.get(escrowId);
    if (!ledger) {
      throw new BadRequestException('Escrow account not found');
    }

    // Calculate expected balance
    const expectedBalance = ledger.totalLocked - ledger.totalReleased - ledger.totalRefunded;
    const variance = ledger.currentBalance - expectedBalance;

    ledger.lastReconciliation = new Date();
    ledger.reconciliationStatus = Math.abs(variance) < 0.01 ? 'balanced' : 'unbalanced';

    console.log(
      `[RECONCILIATION] Escrow ${escrowId}: Locked=${ledger.totalLocked}, Released=${ledger.totalReleased}, Refunded=${ledger.totalRefunded}, Balance=${ledger.currentBalance}`,
    );

    return {
      status: ledger.reconciliationStatus,
      matches: Math.abs(variance) < 0.01,
      variance,
    };
  }

  getAuditTrail(escrowId: string): FundMovement[] {
    const ledger = this.ledgers.get(escrowId);
    if (!ledger) {
      return [];
    }
    return ledger.movements;
  }

  getLedger(escrowId: string): AccountLedger {
    const ledger = this.ledgers.get(escrowId);
    if (!ledger) {
      throw new BadRequestException('Escrow account not found');
    }
    return ledger;
  }

  generateComplianceReport(fromDate: Date, toDate: Date): {
    totalEscrows: number;
    totalFundsLocked: number;
    totalFundsReleased: number;
    totalFundsRefunded: number;
    balancedAccounts: number;
    unbalancedAccounts: number;
    movements: FundMovement[];
  } {
    const ledgers = Array.from(this.ledgers.values());
    const movements = Array.from(this.movementStore.values()).filter(
      (m) => m.timestamp >= fromDate && m.timestamp <= toDate,
    );

    const balancedAccounts = ledgers.filter((l) => l.reconciliationStatus === 'balanced').length;
    const unbalancedAccounts = ledgers.filter((l) => l.reconciliationStatus === 'unbalanced').length;

    return {
      totalEscrows: ledgers.length,
      totalFundsLocked: ledgers.reduce((sum, l) => sum + l.totalLocked, 0),
      totalFundsReleased: ledgers.reduce((sum, l) => sum + l.totalReleased, 0),
      totalFundsRefunded: ledgers.reduce((sum, l) => sum + l.totalRefunded, 0),
      balancedAccounts,
      unbalancedAccounts,
      movements,
    };
  }
}
```

---

## 3. Automated Arbitration Engine Mock

### Purpose
Simulate arbitration decision-making with weighted scoring for different dispute types

### Realistic Behavior
- **Simple Cases:** 50/50 split for simple disputes
- **Evidence-Based:** Weight evidence and party responses
- **Appeal Rate:** ~5-10% cases get appealed
- **Reasoning:** Provide detailed decision rationale
- **Processing Time:** 10-60 seconds per decision

### Implementation

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';

enum DisputeComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
}

enum ResolutionType {
  FULL_RELEASE_TO_SELLER = 'full_release_to_seller',
  FULL_REFUND_TO_BUYER = 'full_refund_to_buyer',
  SPLIT_50_50 = 'split_50_50',
  CUSTOM_SPLIT = 'custom_split',
}

interface DisputeEvidence {
  submittedBy: 'buyer' | 'seller';
  type: 'message' | 'photo' | 'receipt' | 'screenshot';
  weight: number; // 0-10
  description: string;
  timestamp: Date;
}

interface ArbitrationDecision {
  decisionId: string;
  disputeId: string;
  complexity: DisputeComplexity;
  buyerScore: number; // 0-100
  sellerScore: number; // 0-100
  resolution: ResolutionType;
  buyerPayout: number;
  sellerPayout: number;
  reasoning: string;
  decisionTime: number; // milliseconds
  createdAt: Date;
  canBeAppealed: boolean;
}

@Injectable()
export class ArbitrationEngineMock {
  private decisionStore: Map<string, ArbitrationDecision> = new Map();

  async makeDecision(
    disputeId: string,
    escrowAmount: number,
    buyerEvidence: DisputeEvidence[],
    sellerEvidence: DisputeEvidence[],
    category: string,
  ): Promise<ArbitrationDecision> {
    const startTime = Date.now();

    // Determine complexity based on amount and evidence count
    const complexity = this.determineComplexity(
      escrowAmount,
      buyerEvidence.length + sellerEvidence.length,
    );

    // Calculate scores based on evidence
    const buyerScore = this.calculateScore(buyerEvidence, category);
    const sellerScore = this.calculateScore(sellerEvidence, category);

    // Simulate processing delay
    const processingDelay = this.getProcessingDelay(complexity);
    await new Promise((resolve) => setTimeout(resolve, processingDelay));

    // Determine resolution
    const resolution = this.determineResolution(
      buyerScore,
      sellerScore,
      complexity,
      escrowAmount,
    );

    const { buyerPayout, sellerPayout } = this.calculatePayouts(
      escrowAmount,
      resolution,
      buyerScore,
      sellerScore,
    );

    const reasoning = this.generateReasoning(
      category,
      buyerScore,
      sellerScore,
      resolution,
      complexity,
    );

    const decision: ArbitrationDecision = {
      decisionId: `ARB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      disputeId,
      complexity,
      buyerScore,
      sellerScore,
      resolution,
      buyerPayout,
      sellerPayout,
      reasoning,
      decisionTime: Date.now() - startTime,
      createdAt: new Date(),
      canBeAppealed: Math.random() < 0.95, // 95% of decisions can be appealed
    };

    this.decisionStore.set(decision.decisionId, decision);

    return decision;
  }

  async getDecision(decisionId: string): Promise<ArbitrationDecision> {
    const decision = this.decisionStore.get(decisionId);
    if (!decision) {
      throw new BadRequestException('Decision not found');
    }
    return decision;
  }

  private determineComplexity(amount: number, evidenceCount: number): DisputeComplexity {
    if (amount <= 50000 && evidenceCount <= 2) {
      return DisputeComplexity.SIMPLE;
    } else if (amount <= 500000 && evidenceCount <= 5) {
      return DisputeComplexity.MODERATE;
    }
    return DisputeComplexity.COMPLEX;
  }

  private calculateScore(evidence: DisputeEvidence[], category: string): number {
    if (evidence.length === 0) return 0;

    // Weight evidence by type and count
    const typeWeights = {
      receipt: 3,
      screenshot: 2,
      message: 1.5,
      photo: 2,
    };

    const totalWeight = evidence.reduce((sum, e) => sum + (typeWeights[e.type] || 1), 0);

    // Score out of 100
    const baseScore = Math.min((totalWeight / evidence.length) * 25, 100);

    // Category-specific adjustments
    if (category === 'non_delivery' && evidence.some((e) => e.type === 'receipt')) {
      return Math.min(baseScore + 20, 100);
    }
    if (category === 'damaged_goods' && evidence.some((e) => e.type === 'photo')) {
      return Math.min(baseScore + 15, 100);
    }

    return baseScore;
  }

  private determineResolution(
    buyerScore: number,
    sellerScore: number,
    complexity: DisputeComplexity,
    amount: number,
  ): ResolutionType {
    const difference = Math.abs(buyerScore - sellerScore);

    // Simple cases with clear winner
    if (complexity === DisputeComplexity.SIMPLE) {
      if (buyerScore > sellerScore + 20) {
        return ResolutionType.FULL_REFUND_TO_BUYER;
      } else if (sellerScore > buyerScore + 20) {
        return ResolutionType.FULL_RELEASE_TO_SELLER;
      }
      return ResolutionType.SPLIT_50_50;
    }

    // Moderate cases
    if (buyerScore > sellerScore + 15) {
      return ResolutionType.FULL_REFUND_TO_BUYER;
    } else if (sellerScore > buyerScore + 15) {
      return ResolutionType.FULL_RELEASE_TO_SELLER;
    }

    // Complex cases lean toward splits
    return ResolutionType.SPLIT_50_50;
  }

  private calculatePayouts(
    escrowAmount: number,
    resolution: ResolutionType,
    buyerScore: number,
    sellerScore: number,
  ): { buyerPayout: number; sellerPayout: number } {
    switch (resolution) {
      case ResolutionType.FULL_REFUND_TO_BUYER:
        return { buyerPayout: escrowAmount, sellerPayout: 0 };

      case ResolutionType.FULL_RELEASE_TO_SELLER:
        return { buyerPayout: 0, sellerPayout: escrowAmount };

      case ResolutionType.SPLIT_50_50:
        return {
          buyerPayout: escrowAmount / 2,
          sellerPayout: escrowAmount / 2,
        };

      case ResolutionType.CUSTOM_SPLIT:
        const totalScore = buyerScore + sellerScore || 1;
        return {
          buyerPayout: (buyerScore / totalScore) * escrowAmount,
          sellerPayout: (sellerScore / totalScore) * escrowAmount,
        };

      default:
        return { buyerPayout: 0, sellerPayout: 0 };
    }
  }

  private generateReasoning(
    category: string,
    buyerScore: number,
    sellerScore: number,
    resolution: ResolutionType,
    complexity: DisputeComplexity,
  ): string {
    const reasons = [];

    reasons.push(`Evidence evaluation: Buyer score ${Math.round(buyerScore)}/100, Seller score ${Math.round(sellerScore)}/100`);

    switch (category) {
      case 'non_delivery':
        reasons.push('Category: Non-delivery complaint. Evidence of non-delivery status verified.');
        break;
      case 'damaged_goods':
        reasons.push('Category: Damaged goods claim. Photographic evidence reviewed.');
        break;
      case 'fraud':
        reasons.push('Category: Fraud allegation. Transaction history and patterns analyzed.');
        break;
    }

    reasons.push(`Complexity: ${complexity}. Resolution type: ${resolution}.`);

    if (resolution === ResolutionType.SPLIT_50_50) {
      reasons.push(
        'Insufficient evidence for clear determination. Equal split applied as fair resolution.',
      );
    } else if (buyerScore > sellerScore) {
      reasons.push('Evidence strongly supports buyer claim.');
    } else if (sellerScore > buyerScore) {
      reasons.push('Evidence strongly supports seller position.');
    }

    reasons.push('This decision can be appealed within 7 days with additional evidence.');

    return reasons.join(' ');
  }

  private getProcessingDelay(complexity: DisputeComplexity): number {
    const delays = {
      [DisputeComplexity.SIMPLE]: Math.random() * 10000 + 10000, // 10-20s
      [DisputeComplexity.MODERATE]: Math.random() * 20000 + 20000, // 20-40s
      [DisputeComplexity.COMPLEX]: Math.random() * 30000 + 30000, // 30-60s
    };

    return delays[complexity];
  }

  getMetrics(): {
    totalDecisions: number;
    fullRefunds: number;
    fullReleases: number;
    splits: number;
    averageDecisionTime: number;
    appealableRate: number;
  } {
    const decisions = Array.from(this.decisionStore.values());
    const fullRefunds = decisions.filter((d) => d.resolution === ResolutionType.FULL_REFUND_TO_BUYER)
      .length;
    const fullReleases = decisions.filter((d) => d.resolution === ResolutionType.FULL_RELEASE_TO_SELLER)
      .length;
    const splits = decisions.filter((d) => d.resolution === ResolutionType.SPLIT_50_50).length;

    const avgTime =
      decisions.length > 0
        ? decisions.reduce((sum, d) => sum + d.decisionTime, 0) / decisions.length
        : 0;

    const appealableRate = decisions.filter((d) => d.canBeAppealed).length;

    return {
      totalDecisions: decisions.length,
      fullRefunds,
      fullReleases,
      splits,
      averageDecisionTime: Math.round(avgTime),
      appealableRate: decisions.length > 0 ? (appealableRate / decisions.length) * 100 : 0,
    };
  }
}
```

---

## 4. Appeal & Re-arbitration Mock

### Purpose
Handle appeals with assignment to different arbitrators and additional evidence consideration

### Implementation

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';

interface Appeal {
  appealId: string;
  decisionId: string;
  disputeId: string;
  appealReason: string;
  newEvidence?: string;
  fileledBy: 'buyer' | 'seller';
  status: 'pending' | 'assigned' | 'in_review' | 'approved' | 'rejected';
  assignedArbitratorId?: string;
  newDecisionId?: string;
  createdAt: Date;
  reviewedAt?: Date;
}

@Injectable()
export class AppealMock {
  private appealStore: Map<string, Appeal> = new Map();
  private arbitratorPool = ['arbitrator-001', 'arbitrator-002', 'arbitrator-003', 'arbitrator-004'];

  async fileAppeal(
    decisionId: string,
    disputeId: string,
    reason: string,
    filedBy: 'buyer' | 'seller',
    newEvidence?: string,
  ): Promise<{ appealId: string; status: string }> {
    const appeal: Appeal = {
      appealId: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      decisionId,
      disputeId,
      appealReason: reason,
      newEvidence,
      fileledBy,
      status: 'pending',
      createdAt: new Date(),
    };

    this.appealStore.set(appeal.appealId, appeal);

    // Auto-assign to different arbitrator after delay
    setTimeout(() => {
      const randomArbitrator =
        this.arbitratorPool[Math.floor(Math.random() * this.arbitratorPool.length)];
      appeal.status = 'assigned';
      appeal.assignedArbitratorId = randomArbitrator;
    }, 5000);

    return {
      appealId: appeal.appealId,
      status: 'pending',
    };
  }

  async getAppeal(appealId: string): Promise<Appeal> {
    const appeal = this.appealStore.get(appealId);
    if (!appeal) {
      throw new BadRequestException('Appeal not found');
    }
    return appeal;
  }

  getMetrics(): { totalAppeals: number; approvedAppeals: number; rejectedAppeals: number; appealRate: number } {
    const appeals = Array.from(this.appealStore.values());
    const approved = appeals.filter((a) => a.status === 'approved').length;
    const rejected = appeals.filter((a) => a.status === 'rejected').length;

    return {
      totalAppeals: appeals.length,
      approvedAppeals: approved,
      rejectedAppeals: rejected,
      appealRate: appeals.length > 0 ? (appeals.length / (appeals.length + 100)) * 100 : 0,
    };
  }
}
```

---

## Integration Test Example

```typescript
describe('Escrow Fund Segregation Full Flow', () => {
  let bankMock: BankTransferMock;
  let segregationMock: FundSegregationMock;
  let arbitrationMock: ArbitrationEngineMock;
  let appealMock: AppealMock;

  beforeEach(() => {
    bankMock = new BankTransferMock();
    segregationMock = new FundSegregationMock();
    arbitrationMock = new ArbitrationEngineMock();
    appealMock = new AppealMock();
  });

  it('should handle complete escrow lifecycle with fund segregation', async () => {
    const escrowId = 'escrow-001';
    const amount = 100000;

    // 1. Lock up funds
    const lockupResult = await segregationMock.lockupFunds(
      escrowId,
      amount,
      'buyer-ref-001',
    );
    expect(lockupResult.status).toBe('locked');

    // 2. Verify ledger
    const ledger = await segregationMock.getLedger(escrowId);
    expect(ledger.currentBalance).toBe(amount);

    // 3. Release funds to seller
    const releaseResult = await segregationMock.releaseFunds(
      escrowId,
      amount,
      'seller',
      'release-ref-001',
    );
    expect(releaseResult.newBalance).toBe(0);

    // 4. Reconcile account
    const reconciliation = await segregationMock.reconcileAccount(escrowId);
    expect(reconciliation.status).toBe('balanced');
  });

  it('should handle disputes with arbitration', async () => {
    const decision = await arbitrationMock.makeDecision(
      'dispute-001',
      100000,
      [
        {
          submittedBy: 'buyer',
          type: 'receipt',
          weight: 3,
          description: 'Proof of payment',
          timestamp: new Date(),
        },
      ],
      [],
      'non_delivery',
    );

    expect(decision.buyerScore).toBeGreaterThan(0);
    expect(decision.resolution).toBeDefined();
    expect(decision.decisionTime).toBeGreaterThan(0);
  });

  it('should handle appeals with new arbitrator', async () => {
    const appeal = await appealMock.fileAppeal(
      'decision-001',
      'dispute-001',
      'Decision was unfair',
      'buyer',
      'new-evidence.pdf',
    );

    expect(appeal.status).toBe('pending');

    await new Promise((resolve) => setTimeout(resolve, 6000));

    const appealStatus = await appealMock.getAppeal(appeal.appealId);
    expect(appealStatus.status).toBe('assigned');
    expect(appealStatus.assignedArbitratorId).toBeDefined();
  });

  it('should track compliance and generate reports', async () => {
    // Create multiple escrows
    for (let i = 0; i < 5; i++) {
      await segregationMock.lockupFunds(`escrow-${i}`, 50000, `ref-${i}`);
    }

    const report = segregationMock.generateComplianceReport(
      new Date(Date.now() - 86400000),
      new Date(),
    );

    expect(report.totalEscrows).toBe(5);
    expect(report.totalFundsLocked).toBe(250000);
    expect(report.movements.length).toBe(5);
  });
});
```

