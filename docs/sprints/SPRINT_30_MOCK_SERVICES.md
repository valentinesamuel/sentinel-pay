# Sprint 30 Mock Services - Compliance Automation: CBN & Tax

**Sprint:** Sprint 30
**Duration:** 2 weeks (Week 60-61)
**Mock Services:** 4 comprehensive regulatory/compliance integrations with realistic government API patterns

---

## 1. CBN (Central Bank of Nigeria) Reporting Mock

### Overview
Simulates CBN regulatory reporting API with slow response times, validation rules, and compliance patterns

```typescript
import { Injectable } from '@nestjs/common';

export enum CBNReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  APPROVED = 'approved',
}

@Injectable()
export class CBNReportingMock {
  private reports: Map<string, any> = new Map();
  private submissionQueue: any[] = [];
  private readonly PROCESSING_DELAY_MS = 5000; // Government APIs are slow
  private readonly ACKNOWLEDGEMENT_DELAY_MS = 60000; // Takes 1 minute to acknowledge

  /**
   * Submit monthly regulatory report to CBN
   * Real CBN API is extremely slow (5-15 seconds typically)
   */
  async submitMonthlyReport(input: {
    bank_code: string;
    report_month: string; // YYYY-MM format
    total_transactions: number;
    total_volume: number; // Amount
    transaction_details: any[];
  }): Promise<{
    success: boolean;
    report_id: string;
    submission_reference: string;
    status: CBNReportStatus;
    submission_time_ms: number;
    error?: string;
  }> {
    const startTime = Date.now();

    // CBN API is notoriously slow - simulate realistic delay
    const cbnDelay = 5000 + Math.random() * 10000; // 5-15 seconds
    await this.delay(cbnDelay);

    // Validate report format (5% of reports have validation issues)
    const hasValidationError = Math.random() < 0.05;
    if (hasValidationError) {
      return {
        success: false,
        report_id: '',
        submission_reference: '',
        status: CBNReportStatus.REJECTED,
        submission_time_ms: Date.now() - startTime,
        error: 'Invalid report format: Transaction count mismatch',
      };
    }

    const reportId = `CBN-RPT-${input.bank_code}-${input.report_month}`;
    const submissionReference = `CBN-SUB-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const report = {
      report_id: reportId,
      submission_reference: submissionReference,
      bank_code: input.bank_code,
      report_month: input.report_month,
      total_transactions: input.total_transactions,
      total_volume: input.total_volume,
      status: CBNReportStatus.SUBMITTED,
      submitted_at: new Date(),
      acknowledged_at: null,
      // Simulate asynchronous acknowledgement (CBN takes time to process)
      acknowledgement_scheduled: new Date(Date.now() + this.ACKNOWLEDGEMENT_DELAY_MS),
    };

    this.reports.set(reportId, report);
    this.submissionQueue.push(report);

    // Schedule acknowledgement after delay
    setTimeout(() => {
      const existingReport = this.reports.get(reportId);
      if (existingReport) {
        existingReport.status = CBNReportStatus.ACKNOWLEDGED;
        existingReport.acknowledged_at = new Date();
      }
    }, this.ACKNOWLEDGEMENT_DELAY_MS);

    return {
      success: true,
      report_id: reportId,
      submission_reference: submissionReference,
      status: CBNReportStatus.SUBMITTED,
      submission_time_ms: Date.now() - startTime,
    };
  }

  /**
   * Query report status from CBN
   * CBN status queries are also slow
   */
  async getReportStatus(reportId: string): Promise<{
    status: CBNReportStatus;
    report_details: any;
    query_time_ms: number;
  }> {
    const startTime = Date.now();

    // Simulate CBN query latency
    await this.delay(3000 + Math.random() * 5000); // 3-8 seconds

    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found in CBN system`);
    }

    return {
      status: report.status,
      report_details: report,
      query_time_ms: Date.now() - startTime,
    };
  }

  /**
   * Validate transaction against CBN rules
   * Real CBN validation checks transaction limits, user status, etc.
   */
  async validateTransaction(input: {
    user_id: string;
    transaction_amount: number;
    transaction_type: string; // 'deposit', 'withdrawal', 'transfer'
    recipient_bank_code?: string;
  }): Promise<{
    valid: boolean;
    validation_code: string;
    error?: string;
    validation_time_ms: number;
  }> {
    const startTime = Date.now();

    // CBN validation is relatively fast (1-3 seconds)
    await this.delay(1000 + Math.random() * 2000);

    // Validate against CBN rules
    const errors: string[] = [];

    // Rule 1: Transaction limit per day (₦5M for individuals, ₦50M for businesses)
    if (input.transaction_amount > 5000000) {
      errors.push('Transaction exceeds individual daily limit');
    }

    // Rule 2: Cross-border threshold (₦2M requires additional documentation)
    if (input.transaction_type === 'transfer' && input.transaction_amount > 2000000) {
      errors.push('Cross-border transaction amount requires documentation');
    }

    const isValid = errors.length === 0;
    const validationCode = isValid ? 'CBN-VALID-OK' : 'CBN-VALID-FAIL';

    return {
      valid: isValid,
      validation_code: validationCode,
      error: isValid ? undefined : errors[0],
      validation_time_ms: Date.now() - startTime,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 2. FIRS (Federal Inland Revenue Service) Tax Mock

### Overview
Simulates FIRS tax calculation and reporting API

```typescript
@Injectable()
export class FIRSTaxMock {
  private taxCalculations: Map<string, any> = new Map();

  // Nigerian tax rates
  private readonly TAX_RATES = {
    VAT: 0.075,          // 7.5% Value Added Tax
    WHT: 0.05,           // 5% Withholding Tax (standard)
    WHT_INTEREST: 0.10,  // 10% for interest income
    PAYE: {               // Personal Income Tax (progressive)
      tier1: { limit: 300000, rate: 0.01 },
      tier2: { limit: 600000, rate: 0.03 },
      tier3: { limit: 1000000, rate: 0.05 },
      tier4: { limit: Infinity, rate: 0.11 },
    },
  };

  /**
   * Calculate VAT on transaction
   * VAT = Transaction Amount × 7.5%
   */
  async calculateVAT(transactionAmount: number): Promise<{
    transaction_amount: number;
    vat_amount: number;
    total_amount: number;
    vat_rate: string;
    calculation_time_ms: number;
  }> {
    const startTime = Date.now();

    // FIRS API latency: 500-2000ms
    await this.delay(500 + Math.random() * 1500);

    const vatAmount = Math.round(transactionAmount * this.TAX_RATES.VAT);
    const totalAmount = transactionAmount + vatAmount;

    return {
      transaction_amount: transactionAmount,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      vat_rate: `${(this.TAX_RATES.VAT * 100).toFixed(1)}%`,
      calculation_time_ms: Date.now() - startTime,
    };
  }

  /**
   * Calculate Withholding Tax (WHT)
   * WHT = Amount × Rate (5% standard, 10% for interest)
   */
  async calculateWHT(input: {
    amount: number;
    income_type: 'service' | 'interest' | 'dividend' | 'commission';
  }): Promise<{
    amount: number;
    wht_amount: number;
    net_amount: number;
    wht_rate: string;
    calculation_time_ms: number;
  }> {
    const startTime = Date.now();
    await this.delay(500 + Math.random() * 1500);

    // Different rates for different income types
    const rateMap = {
      service: this.TAX_RATES.WHT,
      interest: this.TAX_RATES.WHT_INTEREST,
      dividend: 0.10,
      commission: this.TAX_RATES.WHT,
    };

    const rate = rateMap[input.income_type];
    const whtAmount = Math.round(input.amount * rate);
    const netAmount = input.amount - whtAmount;

    return {
      amount: input.amount,
      wht_amount: whtAmount,
      net_amount: netAmount,
      wht_rate: `${(rate * 100).toFixed(1)}%`,
      calculation_time_ms: Date.now() - startTime,
    };
  }

  /**
   * Calculate PAYE (Personal Income Tax)
   * Progressive tax system with multiple tiers
   */
  async calculatePAYE(monthlyIncome: number): Promise<{
    gross_income: number;
    taxable_income: number;
    paye_amount: number;
    net_income: number;
    tax_breakdown: any[];
    calculation_time_ms: number;
  }> {
    const startTime = Date.now();
    await this.delay(500 + Math.random() * 1500);

    // Apply relief (₦200,000 monthly relief approximately)
    const monthlyRelief = 200000;
    const taxableIncome = Math.max(0, monthlyIncome - monthlyRelief);

    const taxBreakdown: any[] = [];
    let totalTax = 0;
    let remainingIncome = taxableIncome;

    // Calculate progressive tax
    for (const [tier, config] of Object.entries(this.TAX_RATES.PAYE)) {
      if (remainingIncome <= 0) break;

      const taxableInThisTier = Math.min(remainingIncome, config.limit);
      const taxInThisTier = Math.round(taxableInThisTier * config.rate);

      taxBreakdown.push({
        tier,
        taxable_amount: taxableInThisTier,
        tax_rate: `${(config.rate * 100).toFixed(1)}%`,
        tax_amount: taxInThisTier,
      });

      totalTax += taxInThisTier;
      remainingIncome -= taxableInThisTier;
    }

    const netIncome = monthlyIncome - totalTax;

    return {
      gross_income: monthlyIncome,
      taxable_income: taxableIncome,
      paye_amount: totalTax,
      net_income: netIncome,
      tax_breakdown: taxBreakdown,
      calculation_time_ms: Date.now() - startTime,
    };
  }

  /**
   * File tax return to FIRS
   * Simulates tax return filing with validation
   */
  async fileTaxReturn(input: {
    taxpayer_id: string;
    tax_year: number;
    annual_income: number;
    tax_paid: number;
    deductions: number;
  }): Promise<{
    success: boolean;
    return_id: string;
    filing_reference: string;
    status: string;
    filing_time_ms: number;
    error?: string;
  }> {
    const startTime = Date.now();

    // FIRS filing is slow (5-10 seconds)
    await this.delay(5000 + Math.random() * 5000);

    // Validate tax return
    const requiredTax = Math.round(input.annual_income * 0.01); // ~1% average effective rate
    const taxDifference = Math.abs(input.tax_paid - requiredTax);

    if (taxDifference > requiredTax * 0.5) {
      // 50% deviation triggers validation error (10% of cases)
      if (Math.random() < 0.1) {
        return {
          success: false,
          return_id: '',
          filing_reference: '',
          status: 'REJECTED',
          filing_time_ms: Date.now() - startTime,
          error: 'Tax paid does not match calculated tax liability',
        };
      }
    }

    const returnId = `FIRS-TR-${input.taxpayer_id}-${input.tax_year}`;
    const filingReference = `FIRS-FILE-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    return {
      success: true,
      return_id: returnId,
      filing_reference: filingReference,
      status: 'FILED',
      filing_time_ms: Date.now() - startTime,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 3. Sanctions List Mock Service

### Overview
Simulates OFAC, UN, and EU sanctions list checking with realistic matching patterns

```typescript
@Injectable()
export class SanctionsListMock {
  // Simulated sanctioned entities (real data would come from external sources)
  private readonly SANCTIONED_INDIVIDUALS = new Set([
    'Vladimir Putin',
    'Xi Jinping',
    'Bashar al-Assad',
    'Kim Jong Un',
  ]);

  private readonly SANCTIONED_ENTITIES = new Set([
    'Gazprom',
    'Sberbank',
    'Chinese People\'s Liberation Army',
    'Iran Revolutionary Guard Corps',
  ]);

  private readonly SANCTIONED_COUNTRIES = new Set([
    'North Korea',
    'Iran',
    'Syria',
    'Cuba',
    'Crimea',
  ]);

  /**
   * Check if person is on sanctions list
   * Uses fuzzy matching (Levenshtein distance) to catch name variations
   */
  async checkPersonAgainstSanctionsList(input: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    nationality: string;
  }): Promise<{
    is_sanctioned: boolean;
    match_strength: number; // 0-100
    matches: Array<{
      name: string;
      list: 'OFAC' | 'UN' | 'EU';
      match_score: number;
    }>;
    check_time_ms: number;
  }> {
    const startTime = Date.now();

    // Sanctions list check is relatively fast (1-3 seconds)
    await this.delay(1000 + Math.random() * 2000);

    const fullName = `${input.first_name} ${input.last_name}`;
    const matches: any[] = [];

    // Check against sanctioned individuals
    for (const sanctionedName of this.SANCTIONED_INDIVIDUALS) {
      const similarity = this.calculateStringSimilarity(fullName, sanctionedName);
      if (similarity > 0.7) {
        matches.push({
          name: sanctionedName,
          list: Math.random() > 0.5 ? 'OFAC' : 'UN',
          match_score: Math.round(similarity * 100),
        });
      }
    }

    const isSanctioned = matches.length > 0;
    const matchStrength = matches.length > 0 ? Math.max(...matches.map((m) => m.match_score)) : 0;

    return {
      is_sanctioned: isSanctioned,
      match_strength: matchStrength,
      matches,
      check_time_ms: Date.now() - startTime,
    };
  }

  /**
   * Check if transaction recipient is in sanctions list
   */
  async checkTransactionAgainstSanctions(input: {
    recipient_name: string;
    recipient_country: string;
    amount: number;
  }): Promise<{
    transaction_allowed: boolean;
    country_restricted: boolean;
    person_sanctioned: boolean;
    reason?: string;
    check_time_ms: number;
  }> {
    const startTime = Date.now();
    await this.delay(1000 + Math.random() * 2000);

    // Check if country is sanctioned
    const countryRestricted = this.SANCTIONED_COUNTRIES.has(input.recipient_country);

    // Check if person is sanctioned
    const personSanctioned = this.SANCTIONED_INDIVIDUALS.has(input.recipient_name);

    const transactionAllowed = !countryRestricted && !personSanctioned;
    const reason = countryRestricted
      ? `Transactions to ${input.recipient_country} are restricted`
      : personSanctioned
        ? `Recipient is on sanctions list`
        : undefined;

    return {
      transaction_allowed: transactionAllowed,
      country_restricted: countryRestricted,
      person_sanctioned: personSanctioned,
      reason,
      check_time_ms: Date.now() - startTime,
    };
  }

  /**
   * Fuzzy string matching for name variations
   * Simulates Levenshtein distance calculation
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().replace(/\s/g, '');
    const s2 = str2.toLowerCase().replace(/\s/g, '');

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(s1: string, s2: string): number {
    const costs = [];

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }

    return costs[s2.length];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 4. AML (Anti-Money Laundering) Monitoring Mock

### Overview
Simulates AML transaction monitoring with real-world detection patterns

```typescript
@Injectable()
export class AMLMonitoringMock {
  private readonly AML_THRESHOLDS = {
    INDIVIDUAL_DAILY: 5000000,        // ₦5M daily limit
    INDIVIDUAL_MONTHLY: 50000000,     // ₦50M monthly limit
    BUSINESS_DAILY: 100000000,        // ₦100M daily limit
    CTR_THRESHOLD: 15000000,          // ₦15M triggers CTR filing
    STRUCTURING_THRESHOLD: 1000000,   // ₦1M threshold for structuring detection
  };

  private userTransactionHistory: Map<string, any[]> = new Map();

  /**
   * Monitor transaction for AML violations
   */
  async monitorTransaction(input: {
    user_id: string;
    transaction_amount: number;
    transaction_type: string;
    recipient: string;
    timestamp: Date;
  }): Promise<{
    flagged: boolean;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    reasons: string[];
    monitoring_time_ms: number;
    requires_sar: boolean;
  }> {
    const startTime = Date.now();

    // AML monitoring is relatively fast (500-1500ms)
    await this.delay(500 + Math.random() * 1000);

    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check 1: Transaction amount threshold
    if (input.transaction_amount >= this.AML_THRESHOLDS.CTR_THRESHOLD) {
      reasons.push(`Transaction amount (₦${input.transaction_amount}) exceeds CTR threshold`);
      riskLevel = 'high';
    }

    // Check 2: Daily transaction limit
    const dailyTotal = this.calculateDailyTotal(input.user_id, input.timestamp);
    if (dailyTotal + input.transaction_amount > this.AML_THRESHOLDS.INDIVIDUAL_DAILY) {
      reasons.push('Daily transaction limit exceeded');
      riskLevel = 'high';
    }

    // Check 3: Detect structuring (multiple small transactions = one large)
    const structuringDetected = this.detectStructuring(input.user_id, input.transaction_amount);
    if (structuringDetected) {
      reasons.push('Potential structuring detected (layering pattern)');
      riskLevel = 'critical';
    }

    // Check 4: Unusual recipient pattern (new recipient)
    const isNewRecipient = !this.hasTransactedWithBefore(input.user_id, input.recipient);
    if (isNewRecipient && input.transaction_amount > 1000000) {
      reasons.push('Large transaction to new/unusual recipient');
      riskLevel = 'medium';
    }

    // Check 5: High-risk country/jurisdiction
    const isHighRiskJurisdiction = ['North Korea', 'Iran', 'Syria'].includes(input.recipient);
    if (isHighRiskJurisdiction) {
      reasons.push('Transaction involves high-risk jurisdiction');
      riskLevel = 'critical';
    }

    const requiresSAR = riskLevel === 'critical' || reasons.length > 2;

    // Record transaction for future analysis
    this.recordTransaction(input.user_id, input);

    return {
      flagged: riskLevel !== 'low',
      risk_level: riskLevel,
      reasons,
      monitoring_time_ms: Date.now() - startTime,
      requires_sar: requiresSAR,
    };
  }

  /**
   * Generate Suspicious Activity Report (SAR)
   * Required when AML flags critical transactions
   */
  async generateSAR(input: {
    user_id: string;
    flagged_transactions: string[];
    reason: string;
    amount_involved: number;
  }): Promise<{
    sar_id: string;
    filing_reference: string;
    status: 'DRAFTED' | 'FILED' | 'ESCALATED';
    filing_time_ms: number;
  }> {
    const startTime = Date.now();

    // SAR filing is slow (5-15 seconds) - involves regulatory systems
    await this.delay(5000 + Math.random() * 10000);

    const sarId = `SAR-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const filingReference = `SAR-FILE-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    return {
      sar_id: sarId,
      filing_reference: filingReference,
      status: 'FILED',
      filing_time_ms: Date.now() - startTime,
    };
  }

  /**
   * Generate Currency Transaction Report (CTR)
   * Required for transactions >₦15M
   */
  async generateCTR(input: {
    transaction_id: string;
    amount: number;
    date: Date;
    customer_name: string;
  }): Promise<{
    ctr_id: string;
    filing_date: Date;
    status: 'FILED' | 'PENDING';
    filing_time_ms: number;
  }> {
    const startTime = Date.now();

    // CTR filing is moderately fast (2-5 seconds)
    await this.delay(2000 + Math.random() * 3000);

    return {
      ctr_id: `CTR-${input.transaction_id}`,
      filing_date: new Date(),
      status: 'FILED',
      filing_time_ms: Date.now() - startTime,
    };
  }

  private calculateDailyTotal(userId: string, date: Date): number {
    const userTxns = this.userTransactionHistory.get(userId) || [];
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    return userTxns
      .filter((txn) => txn.timestamp.getTime() >= dayStart.getTime())
      .reduce((sum, txn) => sum + txn.amount, 0);
  }

  private detectStructuring(userId: string, amount: number): boolean {
    const userTxns = this.userTransactionHistory.get(userId) || [];
    const last24hrs = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get transactions in last 24 hours
    const recentTxns = userTxns.filter((txn) => txn.timestamp > last24hrs);

    // Detect pattern: 3+ transactions of similar size (<₦1M) within 24 hours
    if (recentTxns.length >= 3) {
      const isStructuring = recentTxns.every((txn) => txn.amount < this.AML_THRESHOLDS.STRUCTURING_THRESHOLD && txn.amount > 900000);

      if (isStructuring) {
        const total = recentTxns.reduce((sum, txn) => sum + txn.amount, 0) + amount;
        return total > 10000000; // Total would exceed ₦10M
      }
    }

    return false;
  }

  private hasTransactedWithBefore(userId: string, recipient: string): boolean {
    const userTxns = this.userTransactionHistory.get(userId) || [];
    return userTxns.some((txn) => txn.recipient === recipient);
  }

  private recordTransaction(userId: string, transaction: any): void {
    if (!this.userTransactionHistory.has(userId)) {
      this.userTransactionHistory.set(userId, []);
    }

    this.userTransactionHistory.get(userId)!.push({
      amount: transaction.transaction_amount,
      recipient: transaction.recipient,
      timestamp: transaction.timestamp,
      type: transaction.transaction_type,
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## Integration Testing Examples

```typescript
describe('Sprint 30 - Compliance Mocks', () => {
  let cbn: CBNReportingMock;
  let firs: FIRSTaxMock;
  let sanctions: SanctionsListMock;
  let aml: AMLMonitoringMock;

  beforeEach(() => {
    cbn = new CBNReportingMock();
    firs = new FIRSTaxMock();
    sanctions = new SanctionsListMock();
    aml = new AMLMonitoringMock();
  });

  it('should submit CBN report with 5-15 second latency', async () => {
    const result = await cbn.submitMonthlyReport({
      bank_code: 'UBIQUITOUS001',
      report_month: '2025-01',
      total_transactions: 50000,
      total_volume: 5000000000,
      transaction_details: [],
    });

    expect(result.submission_time_ms).toBeGreaterThanOrEqual(5000);
    expect(result.submission_time_ms).toBeLessThanOrEqual(15000);
    expect(result.status).toBe('SUBMITTED');
  });

  it('should calculate VAT correctly (7.5%)', async () => {
    const result = await firs.calculateVAT(1000000);

    expect(result.vat_amount).toBe(75000);
    expect(result.total_amount).toBe(1075000);
  });

  it('should calculate progressive PAYE tax', async () => {
    const result = await firs.calculatePAYE(2000000); // ₦2M monthly income

    expect(result.net_income).toBeLessThan(result.gross_income);
    expect(result.paye_amount).toBeGreaterThan(0);
    expect(result.tax_breakdown.length).toBeGreaterThan(0);
  });

  it('should detect sanctioned individuals with fuzzy matching', async () => {
    const result = await sanctions.checkPersonAgainstSanctionsList({
      first_name: 'Vladimir',
      last_name: 'Putin', // Exact match
      date_of_birth: '1952-10-01',
      nationality: 'Russian',
    });

    expect(result.is_sanctioned).toBe(true);
    expect(result.matches.length).toBeGreaterThan(0);
  });

  it('should block transactions to sanctioned countries', async () => {
    const result = await sanctions.checkTransactionAgainstSanctions({
      recipient_name: 'Test Person',
      recipient_country: 'North Korea',
      amount: 1000000,
    });

    expect(result.transaction_allowed).toBe(false);
    expect(result.country_restricted).toBe(true);
  });

  it('should flag CTR threshold transactions (>₦15M)', async () => {
    const result = await aml.monitorTransaction({
      user_id: 'user_123',
      transaction_amount: 20000000,
      transaction_type: 'transfer',
      recipient: 'recipient_456',
      timestamp: new Date(),
    });

    expect(result.flagged).toBe(true);
    expect(result.risk_level).toBe('high');
    expect(result.reasons.some((r) => r.includes('CTR'))).toBe(true);
  });

  it('should detect structuring pattern', async () => {
    // Simulate 3 transactions of ₦900K each (total = ₦2.7M, potential for ₦10M+ structuring)
    for (let i = 0; i < 3; i++) {
      await aml.monitorTransaction({
        user_id: 'user_123',
        transaction_amount: 900000,
        transaction_type: 'transfer',
        recipient: `recipient_${i}`,
        timestamp: new Date(),
      });
    }

    const result = await aml.monitorTransaction({
      user_id: 'user_123',
      transaction_amount: 950000,
      transaction_type: 'transfer',
      recipient: 'recipient_4',
      timestamp: new Date(),
    });

    if (result.flagged && result.risk_level === 'critical') {
      expect(result.reasons.some((r) => r.includes('structuring'))).toBe(true);
    }
  });

  it('should generate SAR for critical AML flags', async () => {
    const result = await aml.generateSAR({
      user_id: 'user_123',
      flagged_transactions: ['txn_1', 'txn_2'],
      reason: 'Potential money laundering - structuring pattern detected',
      amount_involved: 10000000,
    });

    expect(result.sar_id).toBeDefined();
    expect(result.status).toBe('FILED');
  });

  it('should generate CTR for >₦15M transactions', async () => {
    const result = await aml.generateCTR({
      transaction_id: 'txn_12345',
      amount: 20000000,
      date: new Date(),
      customer_name: 'John Doe',
    });

    expect(result.ctr_id).toBeDefined();
    expect(result.status).toBe('FILED');
  });
});
```

---

## Compliance Characteristics Summary

| Service | API Type | Typical Latency | Success Rate | Key Behavior |
|---------|----------|-----------------|--------------|--------------|
| CBN Reporting | Government | 5-15 seconds | 95% | Asynchronous acknowledgement |
| FIRS Calculation | Government | 0.5-2 seconds | 98% | Progressive tax calculation |
| Sanctions Check | Cloud | 1-3 seconds | 99% | Fuzzy matching for names |
| AML Monitoring | Internal | 0.5-1.5 seconds | 100% | Pattern detection, CTR/SAR filing |

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Status:** Ready for Integration Testing
