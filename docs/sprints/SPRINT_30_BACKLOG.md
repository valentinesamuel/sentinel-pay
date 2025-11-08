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

Due to character limits, I'll continue with the rest of Sprint 30 in the next response. This shows the level of detail needed - each user story needs this depth!

Would you like me to continue with the remaining user stories for Sprint 30, then move to other critical sprints (27, 31)?