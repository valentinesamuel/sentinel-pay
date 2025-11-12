# Sprint 30 Backlog - Compliance Automation: CBN & Tax

**Sprint:** Sprint 30
**Duration:** 2 weeks (Week 60-61)
**Sprint Goal:** Implement regulatory reporting and tax calculation automation for legal compliance
**Story Points Committed:** 30
**Team Capacity:** 30 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of previous sprints = 42 SP, committed 30 SP (lighter sprint for complex compliance work)

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 30, we will have:
1. ✅ CBN (Central Bank of Nigeria) monthly regulatory reporting
2. ✅ Automated tax calculation (VAT, WHT)
3. ✅ Sanctions screening (OFAC, UN, EU lists)
4. ✅ Regulatory filing automation
5. ✅ Compliance dashboard for monitoring
6. ✅ Audit trail enhancements for regulators
7. ✅ AML (Anti-Money Laundering) transaction monitoring
8. ✅ Suspicious Activity Report (SAR) generation
9. ✅ Customer Due Diligence (CDD) tracking
10. ✅ Transaction threshold monitoring

**Why This Sprint is CRITICAL:**
- **Legal Requirement:** CBN mandates monthly regulatory reports for payment service providers
- **Tax Compliance:** Nigeria requires VAT (7.5%) and WHT (5-10%) on financial transactions
- **AML/CFT:** Money laundering prevention is mandatory under EFCC regulations
- **Sanctions:** Global sanctions compliance required for international transfers
- **Penalties:** Non-compliance can result in:
  - License suspension or revocation
  - ₦10 million+ fines
  - Criminal prosecution
  - Reputational damage

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (90% coverage)
- [ ] Integration tests passing
- [ ] Regulatory report templates validated
- [ ] Tax calculations verified with accountant
- [ ] Sanctions screening tested
- [ ] Compliance documentation complete
- [ ] Code reviewed and merged
- [ ] Sprint demo to compliance officer

---

## Sprint Backlog Items

---

# EPIC-13: KYC & Compliance

## FEATURE-13.4: Regulatory Reporting

### 📘 User Story: US-30.1.1 - CBN Monthly Regulatory Reporting

**Story ID:** US-30.1.1
**Feature:** FEATURE-13.4 (Regulatory Reporting)
**Epic:** EPIC-13 (KYC & Compliance)

**Story Points:** 8
**Priority:** P0 (Critical - Legal Requirement)
**Sprint:** Sprint 30
**Status:** 🔄 Not Started

---

#### User Story

```
As a compliance officer
I want automated CBN monthly regulatory reports
So that we meet Central Bank of Nigeria compliance requirements and avoid penalties
```

---

#### Business Value

**Value Statement:**
CBN regulatory reporting is a legal obligation for all Nigerian payment service providers. Failure to submit accurate monthly reports can result in license suspension, heavy fines (₦10M+), and criminal prosecution.

**Impact:**
- **Critical:** Legal requirement - cannot operate without compliance
- **Risk Mitigation:** Prevents license revocation
- **Efficiency:** Saves 20+ hours/month vs. manual reporting
- **Accuracy:** Eliminates human error in calculations

**Success Criteria:**
- 100% accurate transaction data
- Reports submitted by 5th of each month
- Zero CBN audit findings
- < 2 hours to generate and review report
- Automatic validation before submission

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Generate CBN Monthly Statistical Return (MSR) report
- [ ] **AC2:** Include all required fields per CBN circular
- [ ] **AC3:** Report total transaction volume (by type: deposit, withdrawal, transfer)
- [ ] **AC4:** Report total transaction value in Naira
- [ ] **AC5:** Report number of active users
- [ ] **AC6:** Report number of new registrations
- [ ] **AC7:** Report KYC tier distribution (Tier 0-3)
- [ ] **AC8:** Report transaction failure rate and reasons
- [ ] **AC9:** Report daily average transactions
- [ ] **AC10:** Report peak transaction volume (date/time)
- [ ] **AC11:** Report total fees collected
- [ ] **AC12:** Report outstanding balance (user wallets)
- [ ] **AC13:** Report foreign exchange transactions (if applicable)
- [ ] **AC14:** Report interbank transfers
- [ ] **AC15:** Report bill payment volumes by category
- [ ] **AC16:** Export report in CBN-specified format (Excel template)
- [ ] **AC17:** Generate supporting documentation (transaction logs)
- [ ] **AC18:** Digital signature for report authenticity
- [ ] **AC19:** Automatic validation against CBN rules
- [ ] **AC20:** Error detection with detailed messages
- [ ] **AC21:** Historical reports accessible (7 years retention)
- [ ] **AC22:** Schedule automatic generation (1st of month)
- [ ] **AC23:** Email notification when report ready
- [ ] **AC24:** Compliance officer approval workflow
- [ ] **AC25:** Audit trail for report generation and submission

**Security:**
- [ ] **AC26:** Access restricted to compliance officers only
- [ ] **AC27:** Encryption for report files
- [ ] **AC28:** Secure transmission to CBN portal
- [ ] **AC29:** Audit log for all report access
- [ ] **AC30:** Data anonymization for sensitive information

**Non-Functional:**
- [ ] **AC31:** Report generation < 5 minutes (for 1M transactions)
- [ ] **AC32:** Support for concurrent report generation
- [ ] **AC33:** 99.9% calculation accuracy
- [ ] **AC34:** Handle up to 10M transactions per month

---

#### Technical Specifications

**CBN Monthly Statistical Return (MSR) Format:**

```typescript
interface CBNMonthlyStatisticalReturn {
  // Report Metadata
  reporting_period: {
    month: number;              // 1-12
    year: number;               // 2024
    start_date: Date;           // First day of month
    end_date: Date;             // Last day of month
  };

  institution_details: {
    institution_name: string;   // "Ubiquitous Tribble Payment Platform"
    institution_code: string;   // Assigned by CBN
    license_number: string;     // PSP license number
    contact_person: string;
    contact_email: string;
    contact_phone: string;
  };

  // Section A: Transaction Volume
  transaction_volume: {
    // By Transaction Type
    deposits: {
      count: number;
      value: number;             // In kobo
      average_value: number;
    };
    withdrawals: {
      count: number;
      value: number;
      average_value: number;
    };
    transfers: {
      count: number;
      value: number;
      average_value: number;
    };
    bill_payments: {
      count: number;
      value: number;
      average_value: number;
    };
    card_transactions: {
      count: number;
      value: number;
      average_value: number;
    };

    // Totals
    total_transactions: number;
    total_value: number;
    daily_average: number;
    peak_day: {
      date: Date;
      transactions: number;
    };
  };

  // Section B: User Statistics
  user_statistics: {
    total_active_users: number;
    new_registrations: number;
    dormant_accounts: number;   // No activity for 90 days
    closed_accounts: number;

    // KYC Distribution
    kyc_tier_0: number;         // Unverified
    kyc_tier_1: number;         // Basic (BVN)
    kyc_tier_2: number;         // Medium (NIN + docs)
    kyc_tier_3: number;         // Full (Business/enhanced)

    // Demographics
    individual_accounts: number;
    business_accounts: number;
    corporate_accounts: number;
  };

  // Section C: Financial Position
  financial_position: {
    total_wallet_balance: number;    // Sum of all user wallets
    total_fees_collected: number;    // Platform revenue
    total_commissions: number;       // Partner commissions
    outstanding_settlements: number; // Pending to banks/merchants
  };

  // Section D: Transaction Failures
  transaction_failures: {
    failed_transactions: number;
    failure_rate: number;           // Percentage
    failure_reasons: {
      insufficient_funds: number;
      invalid_account: number;
      network_error: number;
      fraud_detected: number;
      other: number;
    };
  };

  // Section E: Compliance Metrics
  compliance_metrics: {
    aml_alerts: number;
    suspicious_activities: number;
    sars_filed: number;             // Suspicious Activity Reports
    frozen_accounts: number;
    regulatory_holds: number;
  };

  // Section F: Channel Distribution
  channel_distribution: {
    web: number;
    mobile_app: number;
    api: number;
    ussd: number;
    pos: number;
  };

  // Certification
  certification: {
    prepared_by: string;
    prepared_date: Date;
    reviewed_by: string;
    reviewed_date: Date;
    approved_by: string;
    approved_date: Date;
    digital_signature: string;
  };
}
```

**Database Query for Report Generation:**

```typescript
@Injectable()
export class CBNReportingService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
  ) {}

  async generateMonthlyReport(
    month: number,
    year: number
  ): Promise<CBNMonthlyStatisticalReturn> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Section A: Transaction Volume
    const transactionStats = await this.getTransactionStatistics(startDate, endDate);

    // Section B: User Statistics
    const userStats = await this.getUserStatistics(startDate, endDate);

    // Section C: Financial Position
    const financialPosition = await this.getFinancialPosition(endDate);

    // Section D: Transaction Failures
    const failureStats = await this.getFailureStatistics(startDate, endDate);

    // Section E: Compliance Metrics
    const complianceMetrics = await this.getComplianceMetrics(startDate, endDate);

    // Section F: Channel Distribution
    const channelStats = await this.getChannelDistribution(startDate, endDate);

    return {
      reporting_period: {
        month,
        year,
        start_date: startDate,
        end_date: endDate,
      },
      institution_details: {
        institution_name: process.env.INSTITUTION_NAME,
        institution_code: process.env.CBN_INSTITUTION_CODE,
        license_number: process.env.CBN_LICENSE_NUMBER,
        contact_person: process.env.COMPLIANCE_OFFICER_NAME,
        contact_email: process.env.COMPLIANCE_EMAIL,
        contact_phone: process.env.COMPLIANCE_PHONE,
      },
      transaction_volume: transactionStats,
      user_statistics: userStats,
      financial_position: financialPosition,
      transaction_failures: failureStats,
      compliance_metrics: complianceMetrics,
      channel_distribution: channelStats,
      certification: {
        prepared_by: 'System Auto-Generated',
        prepared_date: new Date(),
        reviewed_by: null,
        reviewed_date: null,
        approved_by: null,
        approved_date: null,
        digital_signature: null,
      },
    };
  }

  private async getTransactionStatistics(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Deposits
    const deposits = await this.transactionsRepository
      .createQueryBuilder('txn')
      .select('COUNT(*)::int', 'count')
      .addSelect('COALESCE(SUM(txn.amount), 0)::bigint', 'value')
      .addSelect('COALESCE(AVG(txn.amount), 0)::bigint', 'average_value')
      .where('txn.type = :type', { type: TransactionType.DEPOSIT })
      .andWhere('txn.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('txn.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    // Withdrawals
    const withdrawals = await this.transactionsRepository
      .createQueryBuilder('txn')
      .select('COUNT(*)::int', 'count')
      .addSelect('COALESCE(SUM(txn.amount), 0)::bigint', 'value')
      .addSelect('COALESCE(AVG(txn.amount), 0)::bigint', 'average_value')
      .where('txn.type = :type', { type: TransactionType.WITHDRAWAL })
      .andWhere('txn.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('txn.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    // Transfers
    const transfers = await this.transactionsRepository
      .createQueryBuilder('txn')
      .select('COUNT(*)::int', 'count')
      .addSelect('COALESCE(SUM(txn.amount), 0)::bigint', 'value')
      .addSelect('COALESCE(AVG(txn.amount), 0)::bigint', 'average_value')
      .where('txn.type = :type', { type: TransactionType.TRANSFER })
      .andWhere('txn.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('txn.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    // Bill Payments
    const billPayments = await this.transactionsRepository
      .createQueryBuilder('txn')
      .select('COUNT(*)::int', 'count')
      .addSelect('COALESCE(SUM(txn.amount), 0)::bigint', 'value')
      .addSelect('COALESCE(AVG(txn.amount), 0)::bigint', 'average_value')
      .where('txn.type = :type', { type: TransactionType.BILL_PAYMENT })
      .andWhere('txn.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('txn.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    // Peak Day Analysis
    const peakDay = await this.transactionsRepository
      .createQueryBuilder('txn')
      .select('DATE(txn.created_at)', 'date')
      .addSelect('COUNT(*)', 'transactions')
      .where('txn.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('DATE(txn.created_at)')
      .orderBy('transactions', 'DESC')
      .limit(1)
      .getRawOne();

    const totalTransactions =
      deposits.count +
      withdrawals.count +
      transfers.count +
      billPayments.count;

    const totalValue =
      BigInt(deposits.value) +
      BigInt(withdrawals.value) +
      BigInt(transfers.value) +
      BigInt(billPayments.value);

    // Calculate days in reporting period
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      deposits,
      withdrawals,
      transfers,
      bill_payments: billPayments,
      card_transactions: { count: 0, value: 0, average_value: 0 }, // TODO: Implement
      total_transactions: totalTransactions,
      total_value: totalValue.toString(),
      daily_average: Math.round(totalTransactions / days),
      peak_day: {
        date: peakDay?.date || null,
        transactions: peakDay?.transactions || 0,
      },
    };
  }

  private async getUserStatistics(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Total active users (had at least 1 transaction in period)
    const activeUsers = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin(
        'transactions',
        'txn',
        'txn.user_id = user.id AND txn.created_at BETWEEN :start AND :end',
        { start: startDate, end: endDate }
      )
      .select('COUNT(DISTINCT user.id)', 'count')
      .getRawOne();

    // New registrations in period
    const newRegistrations = await this.usersRepository
      .count({
        where: {
          created_at: Between(startDate, endDate),
        },
      });

    // Dormant accounts (no activity for 90 days before period end)
    const dormantDate = new Date(endDate);
    dormantDate.setDate(dormantDate.getDate() - 90);

    const dormantAccounts = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin(
        'transactions',
        'txn',
        'txn.user_id = user.id AND txn.created_at > :dormantDate',
        { dormantDate }
      )
      .where('user.created_at < :dormantDate', { dormantDate })
      .andWhere('txn.id IS NULL')
      .select('COUNT(user.id)', 'count')
      .getRawOne();

    // KYC tier distribution
    const kycDistribution = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.kyc_tier', 'tier')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.kyc_tier')
      .getRawMany();

    const kycTiers = {
      kyc_tier_0: 0,
      kyc_tier_1: 0,
      kyc_tier_2: 0,
      kyc_tier_3: 0,
    };

    kycDistribution.forEach((row) => {
      kycTiers[`kyc_tier_${row.tier}`] = parseInt(row.count);
    });

    // Account types
    const accountTypes = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.account_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.account_type')
      .getRawMany();

    return {
      total_active_users: parseInt(activeUsers.count),
      new_registrations: newRegistrations,
      dormant_accounts: parseInt(dormantAccounts.count),
      closed_accounts: 0, // TODO: Implement account closure tracking
      ...kycTiers,
      individual_accounts: parseInt(
        accountTypes.find((t) => t.type === 'INDIVIDUAL')?.count || '0'
      ),
      business_accounts: parseInt(
        accountTypes.find((t) => t.type === 'BUSINESS')?.count || '0'
      ),
      corporate_accounts: parseInt(
        accountTypes.find((t) => t.type === 'CORPORATE')?.count || '0'
      ),
    };
  }

  private async getFinancialPosition(endDate: Date): Promise<any> {
    // Total wallet balance at end of period
    const walletBalance = await this.walletsRepository
      .createQueryBuilder('wallet')
      .select('COALESCE(SUM(wallet.ledger_balance), 0)::bigint', 'total')
      .getRawOne();

    // Total fees collected in period
    const feesCollected = await this.transactionsRepository
      .createQueryBuilder('txn')
      .select('COALESCE(SUM(txn.fee), 0)::bigint', 'total')
      .where('txn.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('txn.created_at <= :endDate', { endDate })
      .getRawOne();

    return {
      total_wallet_balance: walletBalance.total,
      total_fees_collected: feesCollected.total,
      total_commissions: 0, // TODO: Implement commission tracking
      outstanding_settlements: 0, // TODO: Implement settlement tracking
    };
  }

  private async getFailureStatistics(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // Failed transactions
    const failedTxns = await this.transactionsRepository
      .count({
        where: {
          status: TransactionStatus.FAILED,
          created_at: Between(startDate, endDate),
        },
      });

    // Total transactions
    const totalTxns = await this.transactionsRepository
      .count({
        where: {
          created_at: Between(startDate, endDate),
        },
      });

    // Failure reasons
    const failureReasons = await this.transactionsRepository
      .createQueryBuilder('txn')
      .select('txn.failure_reason', 'reason')
      .addSelect('COUNT(*)', 'count')
      .where('txn.status = :status', { status: TransactionStatus.FAILED })
      .andWhere('txn.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('txn.failure_reason')
      .getRawMany();

    const reasons = {
      insufficient_funds: 0,
      invalid_account: 0,
      network_error: 0,
      fraud_detected: 0,
      other: 0,
    };

    failureReasons.forEach((row) => {
      const reason = row.reason?.toLowerCase() || 'other';
      if (reasons.hasOwnProperty(reason)) {
        reasons[reason] = parseInt(row.count);
      } else {
        reasons.other += parseInt(row.count);
      }
    });

    return {
      failed_transactions: failedTxns,
      failure_rate: totalTxns > 0 ? ((failedTxns / totalTxns) * 100).toFixed(2) : 0,
      failure_reasons: reasons,
    };
  }

  private async getComplianceMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // TODO: Implement actual compliance tracking
    return {
      aml_alerts: 0,
      suspicious_activities: 0,
      sars_filed: 0,
      frozen_accounts: 0,
      regulatory_holds: 0,
    };
  }

  private async getChannelDistribution(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const channels = await this.transactionsRepository
      .createQueryBuilder('txn')
      .select('txn.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .where('txn.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .groupBy('txn.channel')
      .getRawMany();

    return {
      web: parseInt(channels.find((c) => c.channel === 'WEB')?.count || '0'),
      mobile_app: parseInt(
        channels.find((c) => c.channel === 'MOBILE')?.count || '0'
      ),
      api: parseInt(channels.find((c) => c.channel === 'API')?.count || '0'),
      ussd: parseInt(channels.find((c) => c.channel === 'USSD')?.count || '0'),
      pos: parseInt(channels.find((c) => c.channel === 'POS')?.count || '0'),
    };
  }
}
```

**Excel Export Service:**

```typescript
import * as ExcelJS from 'exceljs';

@Injectable()
export class CBNExcelExportService {
  async exportToExcel(report: CBNMonthlyStatisticalReturn): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Metadata
    workbook.creator = 'Ubiquitous Tribble Payment Platform';
    workbook.created = new Date();

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');
    this.addSummarySheet(summarySheet, report);

    // Sheet 2: Transaction Details
    const txnSheet = workbook.addWorksheet('Transaction Volume');
    this.addTransactionSheet(txnSheet, report);

    // Sheet 3: User Statistics
    const userSheet = workbook.addWorksheet('User Statistics');
    this.addUserSheet(userSheet, report);

    // Sheet 4: Compliance
    const complianceSheet = workbook.addWorksheet('Compliance');
    this.addComplianceSheet(complianceSheet, report);

    // Generate buffer
    return await workbook.xlsx.writeBuffer() as Buffer;
  }

  private addSummarySheet(sheet: ExcelJS.Worksheet, report: CBNMonthlyStatisticalReturn) {
    // Header
    sheet.addRow(['CENTRAL BANK OF NIGERIA']);
    sheet.addRow(['MONTHLY STATISTICAL RETURN - PAYMENT SERVICE PROVIDERS']);
    sheet.addRow([]);

    // Institution Details
    sheet.addRow(['Institution Name:', report.institution_details.institution_name]);
    sheet.addRow(['Institution Code:', report.institution_details.institution_code]);
    sheet.addRow(['License Number:', report.institution_details.license_number]);
    sheet.addRow([]);

    // Reporting Period
    sheet.addRow([
      'Reporting Period:',
      `${report.reporting_period.month}/${report.reporting_period.year}`,
    ]);
    sheet.addRow([
      'Start Date:',
      report.reporting_period.start_date.toISOString().split('T')[0],
    ]);
    sheet.addRow([
      'End Date:',
      report.reporting_period.end_date.toISOString().split('T')[0],
    ]);
    sheet.addRow([]);

    // Key Metrics
    sheet.addRow(['KEY METRICS']);
    sheet.addRow([
      'Total Transactions:',
      report.transaction_volume.total_transactions.toLocaleString(),
    ]);
    sheet.addRow([
      'Total Value (NGN):',
      (Number(report.transaction_volume.total_value) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }),
    ]);
    sheet.addRow([
      'Active Users:',
      report.user_statistics.total_active_users.toLocaleString(),
    ]);
    sheet.addRow([
      'Failure Rate:',
      `${report.transaction_failures.failure_rate}%`,
    ]);

    // Styling
    sheet.getCell('A1').font = { size: 14, bold: true };
    sheet.getCell('A2').font = { size: 12, bold: true };
  }

  private addTransactionSheet(
    sheet: ExcelJS.Worksheet,
    report: CBNMonthlyStatisticalReturn
  ) {
    // Headers
    sheet.addRow(['Transaction Type', 'Count', 'Total Value (NGN)', 'Average (NGN)']);

    // Data
    const tvol = report.transaction_volume;
    sheet.addRow([
      'Deposits',
      tvol.deposits.count,
      tvol.deposits.value / 100,
      tvol.deposits.average_value / 100,
    ]);
    sheet.addRow([
      'Withdrawals',
      tvol.withdrawals.count,
      tvol.withdrawals.value / 100,
      tvol.withdrawals.average_value / 100,
    ]);
    sheet.addRow([
      'Transfers',
      tvol.transfers.count,
      tvol.transfers.value / 100,
      tvol.transfers.average_value / 100,
    ]);
    sheet.addRow([
      'Bill Payments',
      tvol.bill_payments.count,
      tvol.bill_payments.value / 100,
      tvol.bill_payments.average_value / 100,
    ]);

    // Styling
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    // Format currency columns
    sheet.getColumn(3).numFmt = '₦#,##0.00';
    sheet.getColumn(4).numFmt = '₦#,##0.00';
  }

  private addUserSheet(sheet: ExcelJS.Worksheet, report: CBNMonthlyStatisticalReturn) {
    sheet.addRow(['USER STATISTICS']);
    sheet.addRow([]);

    const stats = report.user_statistics;

    sheet.addRow(['Metric', 'Value']);
    sheet.addRow(['Total Active Users', stats.total_active_users]);
    sheet.addRow(['New Registrations', stats.new_registrations]);
    sheet.addRow(['Dormant Accounts', stats.dormant_accounts]);
    sheet.addRow([]);

    sheet.addRow(['KYC DISTRIBUTION']);
    sheet.addRow(['Tier 0 (Unverified)', stats.kyc_tier_0]);
    sheet.addRow(['Tier 1 (Basic)', stats.kyc_tier_1]);
    sheet.addRow(['Tier 2 (Medium)', stats.kyc_tier_2]);
    sheet.addRow(['Tier 3 (Full)', stats.kyc_tier_3]);
    sheet.addRow([]);

    sheet.addRow(['ACCOUNT TYPES']);
    sheet.addRow(['Individual Accounts', stats.individual_accounts]);
    sheet.addRow(['Business Accounts', stats.business_accounts]);
    sheet.addRow(['Corporate Accounts', stats.corporate_accounts]);
  }

  private addComplianceSheet(
    sheet: ExcelJS.Worksheet,
    report: CBNMonthlyStatisticalReturn
  ) {
    sheet.addRow(['COMPLIANCE METRICS']);
    sheet.addRow([]);

    const metrics = report.compliance_metrics;

    sheet.addRow(['Metric', 'Count']);
    sheet.addRow(['AML Alerts', metrics.aml_alerts]);
    sheet.addRow(['Suspicious Activities', metrics.suspicious_activities]);
    sheet.addRow(['SARs Filed', metrics.sars_filed]);
    sheet.addRow(['Frozen Accounts', metrics.frozen_accounts]);
    sheet.addRow(['Regulatory Holds', metrics.regulatory_holds]);
    sheet.addRow([]);

    sheet.addRow(['TRANSACTION FAILURES']);
    const failures = report.transaction_failures;
    sheet.addRow(['Total Failed Transactions', failures.failed_transactions]);
    sheet.addRow(['Failure Rate', `${failures.failure_rate}%`]);
    sheet.addRow([]);

    sheet.addRow(['Failure Reason', 'Count']);
    sheet.addRow(['Insufficient Funds', failures.failure_reasons.insufficient_funds]);
    sheet.addRow(['Invalid Account', failures.failure_reasons.invalid_account]);
    sheet.addRow(['Network Error', failures.failure_reasons.network_error]);
    sheet.addRow(['Fraud Detected', failures.failure_reasons.fraud_detected]);
    sheet.addRow(['Other', failures.failure_reasons.other]);
  }
}
```

**API Endpoint:**

```typescript
@Controller('api/v1/compliance/cbn')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('compliance_officer', 'admin')
export class CBNReportingController {
  constructor(
    private cbnReportingService: CBNReportingService,
    private cbnExcelService: CBNExcelExportService,
  ) {}

  @Get('monthly-report/:year/:month')
  async getMonthlyReport(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<CBNMonthlyStatisticalReturn> {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }

    if (year < 2020 || year > new Date().getFullYear()) {
      throw new BadRequestException('Invalid year');
    }

    return await this.cbnReportingService.generateMonthlyReport(month, year);
  }

  @Get('monthly-report/:year/:month/excel')
  async downloadMonthlyReportExcel(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Res() res: Response,
  ): Promise<void> {
    const report = await this.cbnReportingService.generateMonthlyReport(month, year);
    const excel = await this.cbnExcelService.exportToExcel(report);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=CBN_MSR_${year}_${month.toString().padStart(2, '0')}.xlsx`
    );

    res.send(excel);
  }

  @Post('monthly-report/:year/:month/submit')
  async submitMonthlyReport(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() body: { reviewed_by: string; approved_by: string; signature: string },
  ): Promise<{ success: boolean; submission_id: string }> {
    // TODO: Implement CBN portal submission API
    // This would integrate with CBN's official reporting portal

    return {
      success: true,
      submission_id: `CBN-SUB-${year}${month}-${Date.now()}`,
    };
  }
}
```

---

#### Testing Requirements

**Unit Tests (20 tests):**
- Generate monthly report for valid period
- Calculate transaction volumes correctly
- Calculate user statistics correctly
- Calculate financial position correctly
- Calculate failure statistics correctly
- Handle empty reporting period (no transactions)
- Handle partial month reporting
- Validate month range (1-12)
- Validate year range
- KYC tier distribution calculation
- Account type distribution calculation
- Channel distribution calculation
- Peak day calculation
- Daily average calculation
- Failure rate percentage calculation
- Excel export generates valid file
- Excel export includes all sheets
- Report validation catches missing data
- Report validation catches inconsistencies
- Digital signature generation

**Integration Tests (10 tests):**
- Full report generation flow (query → calculation → export)
- Report generation with 1M+ transactions
- Report generation for multiple months
- Excel download endpoint
- Report submission endpoint
- Concurrent report generation
- Historical report retrieval
- Report caching
- Report validation workflow
- Approval workflow

**E2E Tests (5 tests):**
- Generate and download January 2025 report
- Generate report → review → approve → submit workflow
- Historical report access (past 12 months)
- Report validation error handling
- Compliance officer access control

---

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] CBN report format matches official template
- [ ] All calculations verified for accuracy
- [ ] Excel export tested with real data
- [ ] All tests passing (35+ tests)
- [ ] API documentation complete
- [ ] Compliance officer training completed
- [ ] Code reviewed and merged

---

### 📘 User Story: US-30.1.2 - Tax Calculation & Withholding

**Story ID:** US-30.1.2
**Feature:** FEATURE-13.4 (Regulatory Reporting)
**Epic:** EPIC-13 (KYC & Compliance)

**Story Points:** 8
**Priority:** P0 (Critical - Legal Requirement)
**Sprint:** Sprint 30
**Status:** 🔄 Not Started

---

#### User Story

```
As a finance manager
I want automated tax calculation (VAT, WHT) on all transactions
So that we comply with FIRS tax regulations and avoid penalties
```

---

#### Business Value

**Value Statement:**
Nigeria requires VAT (7.5%) and WHT (5-10%) on financial services. Automated tax calculation ensures compliance, prevents errors, and simplifies tax filing with FIRS (Federal Inland Revenue Service).

**Impact:**
- **Critical:** Legal requirement - must remit taxes monthly
- **Accuracy:** Eliminates manual calculation errors
- **Efficiency:** Saves 15+ hours/month vs. manual calculation
- **Audit Trail:** Complete tax records for FIRS audits

**Success Criteria:**
- 100% accurate tax calculations
- Real-time tax computation on all transactions
- Monthly tax reports generated automatically
- Zero FIRS audit findings
- < 1 second tax calculation per transaction

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Calculate VAT (7.5%) on applicable transactions
- [ ] **AC2:** Calculate WHT (5-10%) based on transaction type
- [ ] **AC3:** Apply tax to platform fees
- [ ] **AC4:** Apply tax to merchant commissions
- [ ] **AC5:** Exempt tax for certain transaction types (P2P transfers)
- [ ] **AC6:** Track total VAT collected per period
- [ ] **AC7:** Track total WHT collected per period
- [ ] **AC8:** Generate monthly VAT return (FIRS format)
- [ ] **AC9:** Generate monthly WHT return (FIRS format)
- [ ] **AC10:** Store tax invoices for each transaction
- [ ] **AC11:** Generate TIN (Tax Identification Number) invoices
- [ ] **AC12:** Track tax remittance status
- [ ] **AC13:** Calculate tax penalties for late filing
- [ ] **AC14:** Support tax rate changes (configurable)
- [ ] **AC15:** Tax exemption handling (government entities)
- [ ] **AC16:** Tax breakdown in transaction receipts
- [ ] **AC17:** Reconcile collected vs. remitted tax
- [ ] **AC18:** Export tax data to accounting software
- [ ] **AC19:** Tax audit trail (who, what, when)
- [ ] **AC20:** Historical tax records (7 years retention)

**Security:**
- [ ] **AC21:** Tax data encrypted at rest
- [ ] **AC22:** Access restricted to finance officers
- [ ] **AC23:** Audit log for tax calculations
- [ ] **AC24:** Prevent tax rate manipulation

**Non-Functional:**
- [ ] **AC25:** Tax calculation < 100ms per transaction
- [ ] **AC26:** Support 100,000+ tax calculations per day
- [ ] **AC27:** 99.99% calculation accuracy
- [ ] **AC28:** Handle tax rate changes without downtime

---

#### Technical Specifications

**Tax Configuration:**

```typescript
interface TaxConfiguration {
  vat: {
    rate: number;                     // 7.5% = 0.075
    applicable_to: TransactionType[]; // Types that incur VAT
    exempt_entities: string[];        // Government, NGOs, etc.
  };

  wht: {
    rates: {
      [key: string]: number;          // WHT rates by transaction type
    };
    applicable_to: TransactionType[];
    exempt_entities: string[];
  };

  tax_authority: {
    name: string;                     // "Federal Inland Revenue Service"
    tin: string;                      // Platform's TIN
    filing_frequency: string;         // "monthly"
    remittance_deadline: number;      // Day of month (21st)
  };
}

const TAX_CONFIG: TaxConfiguration = {
  vat: {
    rate: 0.075,  // 7.5%
    applicable_to: [
      TransactionType.PAYMENT,
      TransactionType.BILL_PAYMENT,
      TransactionType.CARD_TRANSACTION,
    ],
    exempt_entities: ['GOVERNMENT', 'NGO', 'RELIGIOUS'],
  },

  wht: {
    rates: {
      payment_fees: 0.05,             // 5% on payment fees
      merchant_commission: 0.10,      // 10% on merchant commissions
      interest_income: 0.10,          // 10% on interest
    },
    applicable_to: [
      TransactionType.FEE,
      TransactionType.COMMISSION,
    ],
    exempt_entities: [],
  },

  tax_authority: {
    name: 'Federal Inland Revenue Service (FIRS)',
    tin: 'PSP-12345678-0001',
    filing_frequency: 'monthly',
    remittance_deadline: 21,  // 21st of following month
  },
};
```

**Tax Calculation Service:**

```typescript
@Injectable()
export class TaxCalculationService {
  constructor(
    @InjectRepository(Tax)
    private taxRepository: Repository<Tax>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  /**
   * Calculate tax for a transaction
   */
  async calculateTax(
    transaction: Transaction
  ): Promise<{ vat: number; wht: number; total: number }> {
    let vat = 0;
    let wht = 0;

    // Check if user is tax-exempt
    const isExempt = await this.isUserTaxExempt(transaction.user_id);
    if (isExempt) {
      return { vat: 0, wht: 0, total: 0 };
    }

    // Calculate VAT
    if (this.isVATApplicable(transaction.type)) {
      vat = Math.round(transaction.fee * TAX_CONFIG.vat.rate);
    }

    // Calculate WHT
    if (this.isWHTApplicable(transaction.type)) {
      const whtRate = this.getWHTRate(transaction.type);
      wht = Math.round(transaction.fee * whtRate);
    }

    const total = vat + wht;

    // Store tax record
    await this.taxRepository.save({
      transaction_id: transaction.id,
      user_id: transaction.user_id,
      tax_type: 'VAT_WHT',
      vat_amount: vat,
      wht_amount: wht,
      total_tax: total,
      tax_period: this.getTaxPeriod(transaction.created_at),
      status: 'COLLECTED',
      collected_at: new Date(),
    });

    return { vat, wht, total };
  }

  /**
   * Check if VAT is applicable to transaction type
   */
  private isVATApplicable(type: TransactionType): boolean {
    return TAX_CONFIG.vat.applicable_to.includes(type);
  }

  /**
   * Check if WHT is applicable to transaction type
   */
  private isWHTApplicable(type: TransactionType): boolean {
    return TAX_CONFIG.wht.applicable_to.includes(type);
  }

  /**
   * Get WHT rate for transaction type
   */
  private getWHTRate(type: TransactionType): number {
    return TAX_CONFIG.wht.rates[type] || 0;
  }

  /**
   * Check if user is tax-exempt
   */
  private async isUserTaxExempt(userId: string): Promise<boolean> {
    // TODO: Check user entity type
    // Government entities, NGOs, religious organizations may be exempt
    return false;
  }

  /**
   * Get tax period (YYYY-MM format)
   */
  private getTaxPeriod(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Generate monthly VAT return
   */
  async generateVATReturn(
    year: number,
    month: number
  ): Promise<VATReturn> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const vatData = await this.taxRepository
      .createQueryBuilder('tax')
      .select('SUM(tax.vat_amount)', 'total_vat')
      .addSelect('COUNT(*)', 'transaction_count')
      .where('tax.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    return {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      start_date: startDate,
      end_date: endDate,
      total_vat_collected: parseInt(vatData.total_vat || '0'),
      transaction_count: parseInt(vatData.transaction_count || '0'),
      vat_rate: TAX_CONFIG.vat.rate,
      tin: TAX_CONFIG.tax_authority.tin,
      due_date: this.getVATDueDate(year, month),
      status: 'PENDING',
    };
  }

  /**
   * Generate monthly WHT return
   */
  async generateWHTReturn(
    year: number,
    month: number
  ): Promise<WHTReturn> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const whtData = await this.taxRepository
      .createQueryBuilder('tax')
      .select('SUM(tax.wht_amount)', 'total_wht')
      .addSelect('COUNT(*)', 'transaction_count')
      .where('tax.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    return {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      start_date: startDate,
      end_date: endDate,
      total_wht_collected: parseInt(whtData.total_wht || '0'),
      transaction_count: parseInt(whtData.transaction_count || '0'),
      tin: TAX_CONFIG.tax_authority.tin,
      due_date: this.getWHTDueDate(year, month),
      status: 'PENDING',
    };
  }

  /**
   * Get VAT remittance due date (21st of following month)
   */
  private getVATDueDate(year: number, month: number): Date {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return new Date(nextYear, nextMonth - 1, 21);
  }

  /**
   * Get WHT remittance due date (21st of following month)
   */
  private getWHTDueDate(year: number, month: number): Date {
    return this.getVATDueDate(year, month);
  }
}
```

**Database Schema:**

```sql
-- Tax records table
CREATE TABLE taxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Tax details
  tax_type VARCHAR(50) NOT NULL,       -- VAT, WHT, VAT_WHT
  vat_amount BIGINT NOT NULL DEFAULT 0,
  wht_amount BIGINT NOT NULL DEFAULT 0,
  total_tax BIGINT NOT NULL,

  -- Tax period (YYYY-MM)
  tax_period VARCHAR(7) NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL,         -- COLLECTED, REMITTED, REFUNDED
  collected_at TIMESTAMP,
  remitted_at TIMESTAMP,

  -- Metadata
  tax_invoice_number VARCHAR(100),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_taxes_transaction_id (transaction_id),
  INDEX idx_taxes_user_id (user_id),
  INDEX idx_taxes_tax_period (tax_period),
  INDEX idx_taxes_status (status),
  INDEX idx_taxes_created_at (created_at)
);

-- Tax returns table
CREATE TABLE tax_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Period
  tax_period VARCHAR(7) NOT NULL,      -- YYYY-MM
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Return details
  return_type VARCHAR(20) NOT NULL,    -- VAT, WHT
  total_tax_collected BIGINT NOT NULL,
  transaction_count INTEGER NOT NULL,

  -- Filing
  due_date DATE NOT NULL,
  filed_date DATE,
  status VARCHAR(20) NOT NULL,         -- PENDING, FILED, PAID

  -- Payment
  payment_reference VARCHAR(100),
  paid_date DATE,

  -- Metadata
  tin VARCHAR(50) NOT NULL,
  filed_by VARCHAR(100),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_tax_returns_period (tax_period),
  INDEX idx_tax_returns_type (return_type),
  INDEX idx_tax_returns_status (status),
  UNIQUE (tax_period, return_type)
);
```

---

#### Testing Requirements

**Unit Tests (18 tests):**
- Calculate VAT correctly (7.5%)
- Calculate WHT correctly (5-10%)
- Tax exemption for government entities
- Tax exemption for NGOs
- VAT applicable to payment transactions
- WHT applicable to fee transactions
- Tax calculation for zero-fee transactions
- Tax rounding to nearest kobo
- Tax period calculation
- Generate VAT return for valid period
- Generate WHT return for valid period
- VAT due date calculation
- WHT due date calculation
- Tax invoice number generation
- Tax record storage
- Tax audit trail
- Handle tax rate changes
- Multiple tax calculations concurrently

**Integration Tests (8 tests):**
- Full transaction flow with tax calculation
- Monthly tax return generation
- Tax return filing workflow
- Tax reconciliation (collected vs. remitted)
- Tax export to accounting software
- Historical tax data retrieval
- Tax dashboard with real data
- Concurrent tax calculations

**E2E Tests (5 tests):**
- Process payment → calculate tax → generate receipt
- Generate monthly VAT return → review → file
- Generate monthly WHT return → review → file
- Tax audit report for FIRS
- Tax exemption workflow

---

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] Tax calculations verified with accountant
- [ ] VAT and WHT rates configurable
- [ ] All tests passing (31+ tests)
- [ ] Tax records stored for 7 years
- [ ] Finance officer training completed
- [ ] FIRS filing format validated
- [ ] Code reviewed and merged

---

### 📘 User Story: US-30.1.3 - Sanctions Screening Integration

**Story ID:** US-30.1.3
**Feature:** FEATURE-13.4 (Regulatory Reporting)
**Epic:** EPIC-13 (KYC & Compliance)

**Story Points:** 7
**Priority:** P0 (Critical - Legal Requirement)
**Sprint:** Sprint 30
**Status:** 🔄 Not Started

---

#### User Story

```
As a compliance officer
I want automated sanctions screening against OFAC, UN, and EU lists
So that we comply with international sanctions and prevent illegal transactions
```

---

#### Business Value

**Value Statement:**
Sanctions screening is mandatory for financial institutions operating internationally. Failure to screen against OFAC (US Office of Foreign Assets Control), UN, and EU sanctions lists can result in severe penalties, license revocation, and criminal prosecution.

**Impact:**
- **Critical:** Legal requirement for international transfers
- **Risk Mitigation:** Prevents transactions with sanctioned entities
- **Reputation:** Protects brand from sanctions violations
- **Penalties:** Avoid $10M+ fines and criminal liability

**Success Criteria:**
- 100% of users screened before account activation
- 100% of transactions screened in real-time
- < 2 seconds screening time per check
- Zero false negatives (all sanctioned entities caught)
- < 5% false positives (legitimate users flagged)
- Sanctions list updated daily

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Screen users against OFAC SDN list
- [ ] **AC2:** Screen users against UN sanctions list
- [ ] **AC3:** Screen users against EU sanctions list
- [ ] **AC4:** Screen at user registration
- [ ] **AC5:** Screen at KYC verification
- [ ] **AC6:** Re-screen existing users daily
- [ ] **AC7:** Screen transaction counterparties
- [ ] **AC8:** Fuzzy name matching (handles typos, aliases)
- [ ] **AC9:** Match on full name, DOB, nationality, passport
- [ ] **AC10:** Block transactions to sanctioned entities
- [ ] **AC11:** Freeze accounts of sanctioned users
- [ ] **AC12:** Alert compliance officer on match
- [ ] **AC13:** Manual review workflow for potential matches
- [ ] **AC14:** Whitelist false positives
- [ ] **AC15:** Update sanctions lists automatically (daily)
- [ ] **AC16:** Audit trail for all screenings
- [ ] **AC17:** Screening result stored permanently
- [ ] **AC18:** Export screening results for audits
- [ ] **AC19:** Dashboard showing screening statistics
- [ ] **AC20:** Sanctions list version tracking

**Security:**
- [ ] **AC21:** Sanctions data encrypted at rest
- [ ] **AC22:** Access restricted to compliance officers
- [ ] **AC23:** Audit log for all matches
- [ ] **AC24:** Alert on repeated screening attempts
- [ ] **AC25:** Prevent sanctions list tampering

**Non-Functional:**
- [ ] **AC26:** Screening < 2 seconds per check
- [ ] **AC27:** Support 10,000+ screenings per day
- [ ] **AC28:** 99.9% uptime for screening service
- [ ] **AC29:** Handle sanctions list updates without downtime

---

#### Technical Specifications

**Sanctions Screening Service:**

```typescript
interface SanctionsList {
  list_name: string;           // "OFAC SDN", "UN", "EU"
  list_version: string;         // Version/date
  total_entries: number;
  last_updated: Date;
}

interface SanctionsMatch {
  match_score: number;          // 0-100 (confidence)
  list_name: string;            // Which list matched
  list_entry: {
    name: string;
    aliases: string[];
    dob: string;
    nationality: string;
    passport_numbers: string[];
    address: string;
    sanctions_reason: string;
  };
  user_data: {
    name: string;
    dob: string;
    nationality: string;
    passport: string;
  };
}

interface SanctionsScreeningResult {
  screening_id: string;
  user_id: string;
  screening_type: 'REGISTRATION' | 'KYC' | 'TRANSACTION' | 'PERIODIC';
  status: 'CLEAR' | 'POTENTIAL_MATCH' | 'CONFIRMED_MATCH';
  matches: SanctionsMatch[];
  screened_at: Date;
  reviewed_by?: string;
  review_notes?: string;
}

@Injectable()
export class SanctionsScreeningService {
  constructor(
    @InjectRepository(SanctionsScreening)
    private screeningRepository: Repository<SanctionsScreening>,
    @InjectRepository(SanctionsList)
    private sanctionsListRepository: Repository<SanctionsList>,
    private httpService: HttpService,
  ) {}

  /**
   * Screen user against all sanctions lists
   */
  async screenUser(
    userId: string,
    screeningType: 'REGISTRATION' | 'KYC' | 'TRANSACTION' | 'PERIODIC'
  ): Promise<SanctionsScreeningResult> {
    const user = await this.getUserDetails(userId);

    // Screen against all lists
    const ofacMatches = await this.screenAgainstOFAC(user);
    const unMatches = await this.screenAgainstUN(user);
    const euMatches = await this.screenAgainstEU(user);

    const allMatches = [...ofacMatches, ...unMatches, ...euMatches];

    // Determine status
    let status: 'CLEAR' | 'POTENTIAL_MATCH' | 'CONFIRMED_MATCH' = 'CLEAR';

    if (allMatches.length > 0) {
      const highConfidenceMatch = allMatches.some(m => m.match_score >= 90);
      status = highConfidenceMatch ? 'CONFIRMED_MATCH' : 'POTENTIAL_MATCH';
    }

    // Store screening result
    const result: SanctionsScreeningResult = {
      screening_id: uuidv4(),
      user_id: userId,
      screening_type: screeningType,
      status,
      matches: allMatches,
      screened_at: new Date(),
    };

    await this.screeningRepository.save(result);

    // Alert compliance if match found
    if (status !== 'CLEAR') {
      await this.alertCompliance(result);
    }

    // Block user if confirmed match
    if (status === 'CONFIRMED_MATCH') {
      await this.freezeUserAccount(userId, 'SANCTIONS_MATCH');
    }

    return result;
  }

  /**
   * Screen against OFAC SDN list
   */
  private async screenAgainstOFAC(user: any): Promise<SanctionsMatch[]> {
    // Load OFAC SDN list (cached in database)
    const ofacList = await this.sanctionsListRepository.findOne({
      where: { list_name: 'OFAC_SDN' }
    });

    const matches: SanctionsMatch[] = [];

    // Fuzzy name matching
    for (const entry of ofacList.entries) {
      const nameScore = this.calculateNameMatchScore(user.full_name, entry.name);

      // Check aliases
      let maxAliasScore = 0;
      for (const alias of entry.aliases || []) {
        const aliasScore = this.calculateNameMatchScore(user.full_name, alias);
        maxAliasScore = Math.max(maxAliasScore, aliasScore);
      }

      const finalScore = Math.max(nameScore, maxAliasScore);

      // Additional checks (DOB, nationality)
      let adjustedScore = finalScore;
      if (user.dob === entry.dob) adjustedScore += 10;
      if (user.nationality === entry.nationality) adjustedScore += 5;

      // Threshold: 75+ is potential match
      if (adjustedScore >= 75) {
        matches.push({
          match_score: Math.min(adjustedScore, 100),
          list_name: 'OFAC SDN',
          list_entry: entry,
          user_data: {
            name: user.full_name,
            dob: user.dob,
            nationality: user.nationality,
            passport: user.passport_number,
          },
        });
      }
    }

    return matches;
  }

  /**
   * Screen against UN sanctions list
   */
  private async screenAgainstUN(user: any): Promise<SanctionsMatch[]> {
    // Similar implementation to OFAC
    return [];
  }

  /**
   * Screen against EU sanctions list
   */
  private async screenAgainstEU(user: any): Promise<SanctionsMatch[]> {
    // Similar implementation to OFAC
    return [];
  }

  /**
   * Calculate name match score using Levenshtein distance
   */
  private calculateNameMatchScore(name1: string, name2: string): number {
    // Normalize names
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();

    // Exact match
    if (n1 === n2) return 100;

    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(n1, n2);
    const maxLength = Math.max(n1.length, n2.length);

    // Convert distance to similarity score (0-100)
    const similarity = ((maxLength - distance) / maxLength) * 100;

    return Math.round(similarity);
  }

  /**
   * Levenshtein distance algorithm (fuzzy matching)
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Update sanctions lists (daily cron job)
   */
  @Cron('0 2 * * *')  // 2 AM daily
  async updateSanctionsLists(): Promise<void> {
    // Update OFAC SDN list
    await this.updateOFACList();

    // Update UN sanctions list
    await this.updateUNList();

    // Update EU sanctions list
    await this.updateEUList();

    // Re-screen all active users
    await this.rescreenAllUsers();
  }

  /**
   * Download and update OFAC SDN list
   */
  private async updateOFACList(): Promise<void> {
    // OFAC provides CSV/XML downloads
    const url = 'https://www.treasury.gov/ofac/downloads/sdn.csv';

    const response = await this.httpService.get(url).toPromise();
    const entries = this.parseOFACCSV(response.data);

    await this.sanctionsListRepository.save({
      list_name: 'OFAC_SDN',
      list_version: new Date().toISOString(),
      total_entries: entries.length,
      last_updated: new Date(),
      entries,
    });
  }

  /**
   * Alert compliance officer of match
   */
  private async alertCompliance(result: SanctionsScreeningResult): Promise<void> {
    // Send email, Slack, PagerDuty alert
    // TODO: Implement notification service
  }

  /**
   * Freeze user account
   */
  private async freezeUserAccount(userId: string, reason: string): Promise<void> {
    // TODO: Implement account freeze
  }
}
```

**Database Schema:**

```sql
-- Sanctions screening results
CREATE TABLE sanctions_screenings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  screening_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),

  -- Screening details
  screening_type VARCHAR(20) NOT NULL,  -- REGISTRATION, KYC, TRANSACTION, PERIODIC
  status VARCHAR(20) NOT NULL,          -- CLEAR, POTENTIAL_MATCH, CONFIRMED_MATCH

  -- Matches (JSONB for flexibility)
  matches JSONB,

  -- Review
  reviewed_by VARCHAR(100),
  review_notes TEXT,
  reviewed_at TIMESTAMP,

  -- Timestamps
  screened_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_sanctions_user_id (user_id),
  INDEX idx_sanctions_status (status),
  INDEX idx_sanctions_type (screening_type),
  INDEX idx_sanctions_screened_at (screened_at)
);

-- Sanctions lists (cached)
CREATE TABLE sanctions_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_name VARCHAR(50) NOT NULL,       -- OFAC_SDN, UN, EU
  list_version VARCHAR(50) NOT NULL,
  total_entries INTEGER NOT NULL,

  -- List data (JSONB for large datasets)
  entries JSONB NOT NULL,

  -- Timestamps
  last_updated TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  UNIQUE (list_name, list_version),
  INDEX idx_sanctions_lists_name (list_name),
  INDEX idx_sanctions_lists_updated (last_updated)
);

-- Sanctions whitelist (false positives)
CREATE TABLE sanctions_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Match details
  list_name VARCHAR(50) NOT NULL,
  list_entry_name VARCHAR(255) NOT NULL,
  match_score INTEGER NOT NULL,

  -- Approval
  whitelisted_by VARCHAR(100) NOT NULL,
  whitelisted_at TIMESTAMP NOT NULL,
  reason TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_whitelist_user_id (user_id),
  UNIQUE (user_id, list_name, list_entry_name)
);
```

---

#### Testing Requirements

**Unit Tests (15 tests):**
- Screen user against OFAC list
- Screen user against UN list
- Screen user against EU list
- Fuzzy name matching (exact match)
- Fuzzy name matching (typo)
- Fuzzy name matching (alias)
- DOB match increases score
- Nationality match increases score
- Calculate Levenshtein distance
- Threshold detection (75+ is match)
- Whitelist false positives
- Update sanctions lists
- Parse OFAC CSV format
- Match score calculation
- Handle empty sanctions list

**Integration Tests (8 tests):**
- Full screening workflow (registration → screening → result)
- Daily sanctions list update
- Re-screen all users after list update
- Alert compliance on match
- Freeze account on confirmed match
- Manual review workflow
- Whitelist approval workflow
- Historical screening retrieval

**E2E Tests (5 tests):**
- Register user → sanctions screening → approved
- Register user → sanctions match → account frozen
- KYC verification with sanctions screening
- Transaction to sanctioned country → blocked
- Compliance officer review potential match

---

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] Screening against OFAC, UN, EU lists
- [ ] Fuzzy matching implemented (Levenshtein)
- [ ] All tests passing (28+ tests)
- [ ] Daily sanctions list update working
- [ ] Compliance alert system tested
- [ ] Account freeze workflow tested
- [ ] Code reviewed and merged

---

### 📘 User Story: US-30.1.4 - AML Transaction Monitoring & SAR Generation

**Story ID:** US-30.1.4
**Feature:** FEATURE-13.4 (Regulatory Reporting)
**Epic:** EPIC-13 (KYC & Compliance)

**Story Points:** 7
**Priority:** P0 (Critical - Legal Requirement)
**Sprint:** Sprint 30
**Status:** 🔄 Not Started

---

#### User Story

```
As a compliance officer
I want automated AML transaction monitoring and Suspicious Activity Report (SAR) generation
So that we detect and report money laundering activities as required by EFCC regulations
```

---

#### Business Value

**Value Statement:**
Anti-Money Laundering (AML) monitoring is mandatory under Nigerian EFCC (Economic and Financial Crimes Commission) regulations. Financial institutions must detect suspicious patterns, file SARs, and maintain Customer Due Diligence (CDD) records.

**Impact:**
- **Critical:** Legal requirement - must report suspicious activities
- **Risk Mitigation:** Prevents money laundering through platform
- **Penalties:** Avoid license revocation and criminal prosecution
- **Reputation:** Demonstrates commitment to financial integrity

**Success Criteria:**
- 100% of large transactions monitored (> ₦5M)
- Suspicious patterns detected automatically
- SARs filed within 24 hours of detection
- < 10% false positive rate
- Zero missed suspicious activities (regulatory audits)
- Complete audit trail

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Monitor transactions for suspicious patterns
- [ ] **AC2:** Flag large cash transactions (> ₦5M single, > ₦10M cumulative daily)
- [ ] **AC3:** Flag structuring (multiple transactions just below threshold)
- [ ] **AC4:** Flag rapid movement of funds (in and out within hours)
- [ ] **AC5:** Flag transactions to high-risk countries
- [ ] **AC6:** Flag transactions with unusual velocity (100+ per day)
- [ ] **AC7:** Flag round-number transactions (exact ₦1M, ₦5M)
- [ ] **AC8:** Flag mismatched transaction patterns vs. user profile
- [ ] **AC9:** Track Customer Due Diligence (CDD) status
- [ ] **AC10:** Enhanced Due Diligence (EDD) for high-risk customers
- [ ] **AC11:** Generate Suspicious Activity Report (SAR)
- [ ] **AC12:** SAR includes: who, what, when, why suspicious
- [ ] **AC13:** File SAR with NFIU (Nigerian Financial Intelligence Unit)
- [ ] **AC14:** Alert compliance officer on suspicious activity
- [ ] **AC15:** Manual investigation workflow
- [ ] **AC16:** Close or escalate alerts
- [ ] **AC17:** Dashboard with AML metrics
- [ ] **AC18:** Historical SAR reports
- [ ] **AC19:** AML risk scoring (low, medium, high, critical)
- [ ] **AC20:** Automatic account review triggers

**Security:**
- [ ] **AC21:** AML data encrypted at rest
- [ ] **AC22:** Access restricted to compliance officers
- [ ] **AC23:** Audit trail for all investigations
- [ ] **AC24:** Confidential SAR filing (user not notified)
- [ ] **AC25:** Prevent tipping off suspects

**Non-Functional:**
- [ ] **AC26:** Real-time monitoring (< 5 seconds)
- [ ] **AC27:** Support 1M+ transactions per day
- [ ] **AC28:** 99.9% uptime for monitoring
- [ ] **AC29:** SAR generation < 10 minutes

---

#### Technical Specifications

**AML Monitoring Service:**

```typescript
interface AMLRule {
  rule_id: string;
  rule_name: string;
  description: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threshold: any;
  enabled: boolean;
}

const AML_RULES: AMLRule[] = [
  {
    rule_id: 'AML-001',
    rule_name: 'Large Cash Transaction',
    description: 'Single transaction > ₦5,000,000',
    risk_level: 'HIGH',
    threshold: { amount: 500000000 },  // 5M in kobo
    enabled: true,
  },
  {
    rule_id: 'AML-002',
    rule_name: 'Cumulative Daily Threshold',
    description: 'Daily total > ₦10,000,000',
    risk_level: 'HIGH',
    threshold: { daily_amount: 1000000000 },  // 10M in kobo
    enabled: true,
  },
  {
    rule_id: 'AML-003',
    rule_name: 'Structuring Detection',
    description: 'Multiple transactions just below reporting threshold',
    risk_level: 'CRITICAL',
    threshold: { count: 3, amount_range: [400000000, 499999999] },  // 4M-4.99M
    enabled: true,
  },
  {
    rule_id: 'AML-004',
    rule_name: 'Rapid Fund Movement',
    description: 'Deposit and withdrawal within 2 hours',
    risk_level: 'HIGH',
    threshold: { time_window: 7200 },  // 2 hours in seconds
    enabled: true,
  },
  {
    rule_id: 'AML-005',
    rule_name: 'High-Risk Country',
    description: 'Transaction to FATF high-risk jurisdiction',
    risk_level: 'CRITICAL',
    threshold: { countries: ['IR', 'KP', 'MM'] },  // Iran, North Korea, Myanmar
    enabled: true,
  },
  {
    rule_id: 'AML-006',
    rule_name: 'Transaction Velocity',
    description: '> 100 transactions in single day',
    risk_level: 'MEDIUM',
    threshold: { daily_count: 100 },
    enabled: true,
  },
  {
    rule_id: 'AML-007',
    rule_name: 'Round Number',
    description: 'Exact round numbers (₦1M, ₦5M, ₦10M)',
    risk_level: 'LOW',
    threshold: { round_amounts: [100000000, 500000000, 1000000000] },
    enabled: true,
  },
];

interface AMLAlert {
  alert_id: string;
  user_id: string;
  transaction_id?: string;
  rule_id: string;
  rule_name: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  details: any;
  status: 'OPEN' | 'INVESTIGATING' | 'CLOSED' | 'ESCALATED' | 'SAR_FILED';
  assigned_to?: string;
  created_at: Date;
  closed_at?: Date;
  closure_reason?: string;
}

interface SuspiciousActivityReport {
  sar_id: string;
  user_id: string;
  alert_ids: string[];

  // Subject information
  subject: {
    name: string;
    dob: string;
    address: string;
    phone: string;
    email: string;
    account_number: string;
  };

  // Suspicious activity details
  activity: {
    type: string;              // "Structuring", "Layering", "Unusual Pattern"
    description: string;        // Detailed narrative
    start_date: Date;
    end_date: Date;
    total_amount: number;
    transaction_count: number;
    transactions: string[];     // Transaction IDs
  };

  // Why suspicious
  suspicion_reason: string;

  // Filing details
  filed_by: string;
  filed_date: Date;
  nfiu_reference?: string;

  status: 'DRAFT' | 'FILED' | 'ACKNOWLEDGED';
}

@Injectable()
export class AMLMonitoringService {
  constructor(
    @InjectRepository(AMLAlert)
    private alertRepository: Repository<AMLAlert>,
    @InjectRepository(SAR)
    private sarRepository: Repository<SAR>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Monitor transaction for AML violations
   */
  async monitorTransaction(transaction: Transaction): Promise<AMLAlert[]> {
    const alerts: AMLAlert[] = [];

    for (const rule of AML_RULES) {
      if (!rule.enabled) continue;

      const violation = await this.checkRule(transaction, rule);

      if (violation) {
        const alert = await this.createAlert(transaction, rule, violation);
        alerts.push(alert);

        // Alert compliance for HIGH/CRITICAL
        if (rule.risk_level === 'HIGH' || rule.risk_level === 'CRITICAL') {
          await this.alertCompliance(alert);
        }
      }
    }

    return alerts;
  }

  /**
   * Check if transaction violates AML rule
   */
  private async checkRule(
    transaction: Transaction,
    rule: AMLRule
  ): Promise<any | null> {
    switch (rule.rule_id) {
      case 'AML-001':  // Large cash transaction
        if (transaction.amount >= rule.threshold.amount) {
          return { amount: transaction.amount };
        }
        break;

      case 'AML-002':  // Cumulative daily threshold
        const dailyTotal = await this.getDailyTransactionTotal(
          transaction.user_id,
          transaction.created_at
        );
        if (dailyTotal >= rule.threshold.daily_amount) {
          return { daily_total: dailyTotal };
        }
        break;

      case 'AML-003':  // Structuring detection
        const structuring = await this.detectStructuring(
          transaction.user_id,
          transaction.created_at,
          rule.threshold
        );
        if (structuring) {
          return structuring;
        }
        break;

      case 'AML-004':  // Rapid fund movement
        const rapidMovement = await this.detectRapidMovement(
          transaction.user_id,
          transaction.created_at,
          rule.threshold.time_window
        );
        if (rapidMovement) {
          return rapidMovement;
        }
        break;

      case 'AML-005':  // High-risk country
        if (transaction.destination_country &&
            rule.threshold.countries.includes(transaction.destination_country)) {
          return { country: transaction.destination_country };
        }
        break;

      case 'AML-006':  // Transaction velocity
        const dailyCount = await this.getDailyTransactionCount(
          transaction.user_id,
          transaction.created_at
        );
        if (dailyCount >= rule.threshold.daily_count) {
          return { daily_count: dailyCount };
        }
        break;

      case 'AML-007':  // Round number
        if (rule.threshold.round_amounts.includes(transaction.amount)) {
          return { amount: transaction.amount };
        }
        break;
    }

    return null;
  }

  /**
   * Detect structuring (multiple transactions just below threshold)
   */
  private async detectStructuring(
    userId: string,
    date: Date,
    threshold: any
  ): Promise<any | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await this.transactionRepository.find({
      where: {
        user_id: userId,
        amount: Between(threshold.amount_range[0], threshold.amount_range[1]),
        created_at: Between(startOfDay, endOfDay),
        status: TransactionStatus.COMPLETED,
      },
    });

    if (transactions.length >= threshold.count) {
      return {
        transaction_count: transactions.length,
        total_amount: transactions.reduce((sum, t) => sum + t.amount, 0),
        transaction_ids: transactions.map(t => t.id),
      };
    }

    return null;
  }

  /**
   * Detect rapid fund movement (in and out within hours)
   */
  private async detectRapidMovement(
    userId: string,
    date: Date,
    timeWindow: number
  ): Promise<any | null> {
    const windowStart = new Date(date.getTime() - timeWindow * 1000);
    const windowEnd = date;

    // Find recent deposit
    const deposit = await this.transactionRepository.findOne({
      where: {
        user_id: userId,
        type: TransactionType.DEPOSIT,
        created_at: Between(windowStart, windowEnd),
        status: TransactionStatus.COMPLETED,
      },
      order: { created_at: 'DESC' },
    });

    if (!deposit) return null;

    // Check for withdrawal within time window
    const withdrawal = await this.transactionRepository.findOne({
      where: {
        user_id: userId,
        type: TransactionType.WITHDRAWAL,
        created_at: Between(deposit.created_at, windowEnd),
        status: TransactionStatus.COMPLETED,
      },
    });

    if (withdrawal) {
      const timeDiff = (withdrawal.created_at.getTime() - deposit.created_at.getTime()) / 1000;
      return {
        deposit_id: deposit.id,
        withdrawal_id: withdrawal.id,
        time_difference_seconds: timeDiff,
        deposit_amount: deposit.amount,
        withdrawal_amount: withdrawal.amount,
      };
    }

    return null;
  }

  /**
   * Create AML alert
   */
  private async createAlert(
    transaction: Transaction,
    rule: AMLRule,
    violation: any
  ): Promise<AMLAlert> {
    const alert: AMLAlert = {
      alert_id: `AML-${Date.now()}-${uuidv4().substring(0, 8)}`,
      user_id: transaction.user_id,
      transaction_id: transaction.id,
      rule_id: rule.rule_id,
      rule_name: rule.rule_name,
      risk_level: rule.risk_level,
      description: rule.description,
      details: violation,
      status: 'OPEN',
      created_at: new Date(),
    };

    await this.alertRepository.save(alert);
    return alert;
  }

  /**
   * Generate Suspicious Activity Report (SAR)
   */
  async generateSAR(
    userId: string,
    alertIds: string[],
    suspicionReason: string,
    filedBy: string
  ): Promise<SuspiciousActivityReport> {
    const user = await this.getUserDetails(userId);
    const alerts = await this.alertRepository.findByIds(alertIds);

    // Collect all related transactions
    const transactionIds = alerts
      .filter(a => a.transaction_id)
      .map(a => a.transaction_id);

    const transactions = await this.transactionRepository.findByIds(transactionIds);

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    const sar: SuspiciousActivityReport = {
      sar_id: `SAR-${Date.now()}`,
      user_id: userId,
      alert_ids: alertIds,
      subject: {
        name: user.full_name,
        dob: user.date_of_birth,
        address: user.address,
        phone: user.phone,
        email: user.email,
        account_number: user.account_number,
      },
      activity: {
        type: this.classifySuspiciousActivity(alerts),
        description: suspicionReason,
        start_date: transactions[0]?.created_at,
        end_date: transactions[transactions.length - 1]?.created_at,
        total_amount: totalAmount,
        transaction_count: transactions.length,
        transactions: transactionIds,
      },
      suspicion_reason: suspicionReason,
      filed_by: filedBy,
      filed_date: new Date(),
      status: 'DRAFT',
    };

    await this.sarRepository.save(sar);

    // Mark alerts as SAR filed
    for (const alert of alerts) {
      alert.status = 'SAR_FILED';
      await this.alertRepository.save(alert);
    }

    return sar;
  }

  /**
   * File SAR with NFIU (Nigerian Financial Intelligence Unit)
   */
  async fileSARWithNFIU(sarId: string): Promise<void> {
    const sar = await this.sarRepository.findOne({ where: { sar_id: sarId } });

    // TODO: Integrate with NFIU portal API
    // For now, generate PDF and email

    const nfiuReference = `NFIU-${Date.now()}`;
    sar.nfiu_reference = nfiuReference;
    sar.status = 'FILED';
    await this.sarRepository.save(sar);
  }

  /**
   * Classify suspicious activity type
   */
  private classifySuspiciousActivity(alerts: AMLAlert[]): string {
    const ruleIds = alerts.map(a => a.rule_id);

    if (ruleIds.includes('AML-003')) return 'Structuring';
    if (ruleIds.includes('AML-004')) return 'Layering';
    if (ruleIds.includes('AML-005')) return 'High-Risk Jurisdiction';
    if (ruleIds.includes('AML-006')) return 'Unusual Transaction Pattern';

    return 'Suspicious Activity';
  }
}
```

**Database Schema:**

```sql
-- AML alerts
CREATE TABLE aml_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  transaction_id UUID REFERENCES transactions(id),

  -- Rule details
  rule_id VARCHAR(20) NOT NULL,
  rule_name VARCHAR(255) NOT NULL,
  risk_level VARCHAR(20) NOT NULL,      -- LOW, MEDIUM, HIGH, CRITICAL
  description TEXT NOT NULL,
  details JSONB,

  -- Status
  status VARCHAR(20) NOT NULL,          -- OPEN, INVESTIGATING, CLOSED, ESCALATED, SAR_FILED
  assigned_to VARCHAR(100),

  -- Resolution
  closed_at TIMESTAMP,
  closure_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_aml_alerts_user_id (user_id),
  INDEX idx_aml_alerts_status (status),
  INDEX idx_aml_alerts_risk_level (risk_level),
  INDEX idx_aml_alerts_created_at (created_at)
);

-- Suspicious Activity Reports (SARs)
CREATE TABLE sars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sar_id VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  alert_ids JSONB NOT NULL,              -- Array of alert IDs

  -- Subject information
  subject JSONB NOT NULL,

  -- Activity details
  activity JSONB NOT NULL,
  suspicion_reason TEXT NOT NULL,

  -- Filing
  filed_by VARCHAR(100) NOT NULL,
  filed_date TIMESTAMP NOT NULL,
  nfiu_reference VARCHAR(100),

  -- Status
  status VARCHAR(20) NOT NULL,          -- DRAFT, FILED, ACKNOWLEDGED

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_sars_user_id (user_id),
  INDEX idx_sars_status (status),
  INDEX idx_sars_filed_date (filed_date)
);
```

---

#### Testing Requirements

**Unit Tests (18 tests):**
- Large cash transaction rule (> ₦5M)
- Cumulative daily threshold (> ₦10M)
- Structuring detection (3+ transactions 4-4.99M)
- Rapid fund movement (2-hour window)
- High-risk country detection
- Transaction velocity (100+ per day)
- Round number detection
- AML alert creation
- Risk level classification
- SAR generation
- SAR NFIU filing
- Alert status transitions
- Daily transaction total calculation
- Daily transaction count
- Suspicious activity classification
- Alert assignment workflow
- Alert closure
- Historical alert retrieval

**Integration Tests (8 tests):**
- Full AML monitoring workflow
- Generate SAR from multiple alerts
- File SAR with NFIU
- Compliance dashboard with real data
- Alert investigation workflow
- Monthly AML report generation
- Historical SAR retrieval
- Concurrent alert processing

**E2E Tests (5 tests):**
- Large transaction → alert → investigation → closed
- Structuring pattern → alert → SAR generation → NFIU filing
- Rapid movement → alert → escalation
- Compliance officer reviews alerts
- Monthly AML report export

---

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] All 7 AML rules implemented
- [ ] Structuring detection working
- [ ] SAR generation and filing tested
- [ ] All tests passing (31+ tests)
- [ ] Compliance dashboard complete
- [ ] NFIU filing process validated
- [ ] Code reviewed and merged

---

## Sprint Summary

### Sprint Backlog Table

| Story ID | Story Name | Story Points | Priority | Status | Assignee |
|----------|-----------|--------------|----------|--------|----------|
| US-30.1.1 | CBN Monthly Regulatory Reporting | 8 | P0 | 🔄 Not Started | Solo Dev |
| US-30.1.2 | Tax Calculation & Withholding | 8 | P0 | 🔄 Not Started | Solo Dev |
| US-30.1.3 | Sanctions Screening Integration | 7 | P0 | 🔄 Not Started | Solo Dev |
| US-30.1.4 | AML Transaction Monitoring & SAR | 7 | P0 | 🔄 Not Started | Solo Dev |
| **TOTAL** | **4 User Stories** | **30** | - | - | - |

---

### Overall Testing Requirements

**Total Tests:** 82+ tests (35 + 31 + 28 + 31 = 125 tests)

**Coverage Target:** 90%+

**Test Categories:**
- Unit Tests: 71 tests
- Integration Tests: 34 tests
- E2E Tests: 20 tests

**Critical Test Scenarios:**
- CBN report generation with 1M+ transactions
- Tax calculation accuracy (verified by accountant)
- Sanctions screening (zero false negatives)
- AML structuring detection
- SAR generation and NFIU filing

---

### Risk Register

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy | Owner |
|---------|-----------------|-------------|--------|---------------------|-------|
| R-30.1 | CBN report format changes | Medium | High | Monitor CBN circulars, version control report templates | Compliance Officer |
| R-30.2 | Tax rate changes (VAT/WHT) | Medium | High | Configurable tax rates, quick deployment process | Finance Manager |
| R-30.3 | Sanctions list API downtime | Low | Critical | Cache lists locally, update daily, fallback to manual | Tech Lead |
| R-30.4 | False positive sanctions matches | High | Medium | Fuzzy matching threshold tuning, manual review workflow | Compliance Officer |
| R-30.5 | NFIU portal integration unavailable | Medium | High | PDF/email submission as backup, manual filing process | Compliance Officer |
| R-30.6 | Large transaction volume affects performance | Medium | High | Database indexing, query optimization, caching | Tech Lead |
| R-30.7 | AML rule changes (EFCC regulations) | Low | High | Configurable rules engine, regular compliance training | Compliance Officer |
| R-30.8 | Missed suspicious activities (false negatives) | Low | Critical | Multiple overlapping rules, regular rule effectiveness review | Compliance Officer |
| R-30.9 | Data retention requirements (7 years) | Low | Medium | Archive old data to cold storage, backup verification | Tech Lead |
| R-30.10 | Compliance officer availability | Medium | High | Cross-train staff, documented procedures, automated alerts | Admin |

---

### Dependencies

**External Dependencies:**
- CBN report format specification (latest circular)
- FIRS tax filing portal access
- OFAC sanctions list API access (https://www.treasury.gov/ofac/)
- UN sanctions list API access (https://www.un.org/securitycouncil/)
- EU sanctions list API access (https://ec.europa.eu/)
- NFIU portal integration (for SAR filing)

**Internal Dependencies:**
- Sprint 1-5: User and transaction data available
- Sprint 19: KYC tier management complete
- Transaction service must track channel (web, mobile, API)
- User service must store nationality, DOB, passport

**Service Dependencies:**
- PostgreSQL database with transaction history
- Redis cache for sanctions lists
- Excel export library (ExcelJS)
- Email service for compliance alerts
- Cron job scheduler for daily tasks

---

### Notes & Decisions

**Technical Decisions:**
1. **CBN Report Format:** Using ExcelJS for Excel generation (CBN prefers Excel over PDF)
2. **Sanctions Screening:** Levenshtein distance algorithm for fuzzy matching (threshold: 75+)
3. **Tax Calculation:** Real-time calculation during transaction, stored in separate table
4. **AML Rules:** 7 initial rules, designed for easy addition of new rules
5. **SAR Filing:** Manual filing initially, NFIU API integration in future sprint

**Business Decisions:**
1. **Compliance Officer Role:** Dedicated role required before production launch
2. **Tax Verification:** CPA/accountant to verify tax calculations before go-live
3. **Sanctions List Update:** Daily at 2 AM (off-peak hours)
4. **AML Alert Thresholds:** Based on CBN/EFCC guidelines, may need tuning
5. **Data Retention:** 7 years for all compliance records (regulatory requirement)

**Cost Estimates:**
- Sanctions list data feeds: $0-2,000/year (OFAC/UN free, commercial feeds optional)
- Compliance officer salary: $36K-60K/year
- CPA tax verification: $2K-5K one-time
- NFIU integration: TBD (pending CBN requirements)

**Success Metrics:**
- 100% on-time CBN report submission (by 5th of month)
- 100% accurate tax calculations (zero FIRS audit findings)
- < 5% sanctions screening false positive rate
- Zero missed suspicious activities (regulatory audits)
- < 24 hours SAR filing time (from alert to NFIU)

---

## Sprint Retrospective Preparation

**What to Review:**
- CBN report accuracy (validate with sample data)
- Tax calculation verified by accountant
- Sanctions screening performance (< 2 seconds)
- AML rule effectiveness (true positive vs. false positive rate)
- Compliance officer workflow efficiency
- Documentation completeness

**Potential Improvements:**
- Machine learning for AML pattern detection (future enhancement)
- Real-time CBN submission API (if/when available)
- Advanced sanctions screening (photos, addresses)
- Customer risk scoring model
- Automated compliance reporting dashboard

---

**End of Sprint 30 Backlog**