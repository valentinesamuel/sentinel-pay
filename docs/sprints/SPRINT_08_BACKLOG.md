# Sprint 8 Backlog - Reporting, Analytics & Admin Dashboard

**Sprint:** Sprint 8
**Duration:** 2 weeks (Week 17-18)
**Sprint Goal:** Implement reporting system, analytics dashboard, admin panel, and dispute management
**Story Points Committed:** 45
**Team Capacity:** 45 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1-7 (45, 42, 38, 45, 48, 45, 42) = 43.6 SP, committed 45 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 8, we will have:
1. Transaction reporting and analytics dashboard
2. Admin panel for platform management
3. Dispute management system
4. Export functionality (CSV, PDF, Excel)
5. Real-time transaction monitoring
6. User management interface
7. Financial reconciliation reports
8. Compliance reporting
9. Performance metrics dashboard

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Report generation tests passing
- [ ] Admin authorization tests passing
- [ ] API documentation updated (Swagger)
- [ ] Admin panel UI functional
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-11: Reporting & Analytics

## FEATURE-11.1: Transaction Reporting

### 📘 User Story: US-8.1.1 - Transaction Reports & Analytics

**Story ID:** US-8.1.1
**Feature:** FEATURE-11.1 (Transaction Reporting)
**Epic:** EPIC-11 (Reporting & Analytics)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 8
**Status:** 🔄 Not Started

---

#### User Story

```
As a business owner/admin
I want to view comprehensive transaction reports and analytics
So that I can understand platform performance and make data-driven decisions
```

---

#### Business Value

**Value Statement:**
Transaction reporting is critical for business operations, compliance, reconciliation, and strategic planning. Real-time insights enable quick decision-making and problem detection.

**Impact:**
- **Critical:** Required for financial reconciliation
- **Compliance:** Regulatory reporting requirements
- **Operations:** Platform health monitoring
- **Growth:** Data-driven business decisions

**Success Criteria:**
- < 2 seconds report generation time
- Support for 1M+ transactions
- Real-time data updates
- Export to multiple formats (CSV, PDF, Excel)
- Customizable date ranges and filters

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** View transaction summary dashboard
- [ ] **AC2:** Filter by date range (today, week, month, custom)
- [ ] **AC3:** Filter by transaction type (payment, transfer, withdrawal)
- [ ] **AC4:** Filter by status (pending, completed, failed)
- [ ] **AC5:** Filter by currency
- [ ] **AC6:** Search by transaction reference
- [ ] **AC7:** View total transaction volume
- [ ] **AC8:** View total transaction count
- [ ] **AC9:** View average transaction value
- [ ] **AC10:** View success rate percentage
- [ ] **AC11:** View transaction breakdown by type (pie chart)
- [ ] **AC12:** View transaction trends over time (line chart)
- [ ] **AC13:** Export reports to CSV
- [ ] **AC14:** Export reports to PDF
- [ ] **AC15:** Export reports to Excel
- [ ] **AC16:** Schedule automated reports (daily, weekly, monthly)
- [ ] **AC17:** Email report delivery
- [ ] **AC18:** Paginated transaction list (100 per page)

**Analytics:**
- [ ] **AC19:** Revenue metrics (fees collected)
- [ ] **AC20:** User acquisition metrics
- [ ] **AC21:** Transaction velocity trends
- [ ] **AC22:** Payment method breakdown
- [ ] **AC23:** Geographic distribution
- [ ] **AC24:** Peak transaction hours/days

**Non-Functional:**
- [ ] **AC25:** Report generation < 2 seconds (p95)
- [ ] **AC26:** Support 1M+ transactions
- [ ] **AC27:** Real-time data refresh
- [ ] **AC28:** Responsive dashboard UI

---

#### Technical Specifications

**Dashboard Metrics:**

```typescript
interface TransactionSummary {
  date_range: {
    from: string;
    to: string;
  };
  metrics: {
    total_volume: number;
    total_count: number;
    average_value: number;
    success_rate: number;
    total_fees: number;
  };
  breakdown: {
    by_type: { type: string; count: number; volume: number }[];
    by_status: { status: string; count: number }[];
    by_currency: { currency: string; count: number; volume: number }[];
  };
  trends: {
    date: string;
    count: number;
    volume: number;
  }[];
}
```

**Example API Response:**

```json
{
  "status": "success",
  "data": {
    "summary": {
      "date_range": {
        "from": "2024-01-01",
        "to": "2024-01-31"
      },
      "metrics": {
        "total_volume": 500000000,
        "total_count": 1250,
        "average_value": 400000,
        "success_rate": 98.5,
        "total_fees": 5000000
      },
      "breakdown": {
        "by_type": [
          { "type": "payment", "count": 800, "volume": 320000000 },
          { "type": "transfer", "count": 350, "volume": 140000000 },
          { "type": "withdrawal", "count": 100, "volume": 40000000 }
        ],
        "by_status": [
          { "status": "completed", "count": 1231 },
          { "status": "pending", "count": 10 },
          { "status": "failed", "count": 9 }
        ]
      },
      "trends": [
        { "date": "2024-01-01", "count": 45, "volume": 18000000 },
        { "date": "2024-01-02", "count": 52, "volume": 20800000 }
      ]
    }
  }
}
```

**Reporting Service Implementation:**

```typescript
@Injectable()
export class ReportingService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async getTransactionSummary(
    filters: ReportFilters
  ): Promise<TransactionSummary> {
    const query = this.buildQuery(filters);

    // Get metrics
    const metricsQuery = query.clone()
      .select('COUNT(*)', 'total_count')
      .addSelect('SUM(amount)', 'total_volume')
      .addSelect('AVG(amount)', 'average_value')
      .addSelect('SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END)', 'successful_count')
      .addSelect('SUM(fee)', 'total_fees');

    const metrics = await metricsQuery.getRawOne();

    // Get breakdown by type
    const typeBreakdown = await query.clone()
      .select('type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(amount)', 'volume')
      .groupBy('type')
      .getRawMany();

    // Get breakdown by status
    const statusBreakdown = await query.clone()
      .select('status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('status')
      .getRawMany();

    // Get trends (daily aggregation)
    const trends = await query.clone()
      .select('DATE(created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(amount)', 'volume')
      .groupBy('DATE(created_at)')
      .orderBy('DATE(created_at)', 'ASC')
      .getRawMany();

    return {
      date_range: {
        from: filters.from,
        to: filters.to,
      },
      metrics: {
        total_volume: parseInt(metrics.total_volume || '0'),
        total_count: parseInt(metrics.total_count || '0'),
        average_value: parseFloat(metrics.average_value || '0'),
        success_rate: (parseInt(metrics.successful_count || '0') / parseInt(metrics.total_count || '1')) * 100,
        total_fees: parseInt(metrics.total_fees || '0'),
      },
      breakdown: {
        by_type: typeBreakdown,
        by_status: statusBreakdown,
        by_currency: [],  // Similar query for currency
      },
      trends,
    };
  }

  async exportToCSV(filters: ReportFilters): Promise<string> {
    const transactions = await this.getTransactions(filters);

    const headers = [
      'Reference',
      'Date',
      'Type',
      'Amount',
      'Currency',
      'Status',
      'User Email',
      'Fee',
    ];

    const rows = transactions.map(txn => [
      txn.reference,
      txn.created_at.toISOString(),
      txn.type,
      txn.amount,
      txn.currency,
      txn.status,
      txn.user?.email || '',
      txn.fee,
    ]);

    return this.convertToCSV(headers, rows);
  }

  async exportToPDF(filters: ReportFilters): Promise<Buffer> {
    const summary = await this.getTransactionSummary(filters);

    // Use PDFKit or similar library
    const pdfDoc = new PDFDocument();
    const buffers: Buffer[] = [];

    pdfDoc.on('data', buffers.push.bind(buffers));

    // Add content
    pdfDoc.fontSize(20).text('Transaction Report', { align: 'center' });
    pdfDoc.moveDown();
    pdfDoc.fontSize(12).text(`Date Range: ${summary.date_range.from} to ${summary.date_range.to}`);
    pdfDoc.moveDown();
    pdfDoc.fontSize(14).text('Summary');
    pdfDoc.fontSize(10).text(`Total Volume: ${this.formatCurrency(summary.metrics.total_volume)}`);
    pdfDoc.text(`Total Transactions: ${summary.metrics.total_count}`);
    pdfDoc.text(`Success Rate: ${summary.metrics.success_rate.toFixed(2)}%`);

    pdfDoc.end();

    return Buffer.concat(buffers);
  }

  private buildQuery(filters: ReportFilters): SelectQueryBuilder<Transaction> {
    const query = this.transactionsRepository.createQueryBuilder('txn');

    if (filters.from) {
      query.andWhere('txn.created_at >= :from', { from: filters.from });
    }

    if (filters.to) {
      query.andWhere('txn.created_at <= :to', { to: filters.to });
    }

    if (filters.type) {
      query.andWhere('txn.type = :type', { type: filters.type });
    }

    if (filters.status) {
      query.andWhere('txn.status = :status', { status: filters.status });
    }

    if (filters.currency) {
      query.andWhere('txn.currency = :currency', { currency: filters.currency });
    }

    return query;
  }
}
```

**Export Endpoints:**

```typescript
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'analyst')
export class ReportsController {
  constructor(private reportingService: ReportingService) {}

  @Get('transactions/summary')
  @ApiOperation({ summary: 'Get transaction summary' })
  async getTransactionSummary(@Query() filters: ReportFiltersDto) {
    const summary = await this.reportingService.getTransactionSummary(filters);
    return { status: 'success', data: summary };
  }

  @Get('transactions/export/csv')
  @ApiOperation({ summary: 'Export transactions to CSV' })
  async exportCSV(@Query() filters: ReportFiltersDto, @Res() res: Response) {
    const csv = await this.reportingService.exportToCSV(filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  }

  @Get('transactions/export/pdf')
  @ApiOperation({ summary: 'Export transactions to PDF' })
  async exportPDF(@Query() filters: ReportFiltersDto, @Res() res: Response) {
    const pdf = await this.reportingService.exportToPDF(filters);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
    res.send(pdf);
  }

  @Get('transactions/export/excel')
  @ApiOperation({ summary: 'Export transactions to Excel' })
  async exportExcel(@Query() filters: ReportFiltersDto, @Res() res: Response) {
    const excel = await this.reportingService.exportToExcel(filters);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');
    res.send(excel);
  }
}
```

---

## FEATURE-11.2: Admin Dashboard

### 📘 User Story: US-8.2.1 - Admin Panel & User Management

**Story ID:** US-8.2.1
**Feature:** FEATURE-11.2 (Admin Dashboard)
**Epic:** EPIC-12 (Admin & Management)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 8
**Status:** 🔄 Not Started

---

#### User Story

```
As a platform administrator
I want an admin panel to manage users, transactions, and system settings
So that I can efficiently operate and monitor the platform
```

---

#### Business Value

**Value Statement:**
Admin panel is essential for day-to-day platform operations, user support, compliance monitoring, and system configuration. Streamlines administrative tasks and reduces operational overhead.

**Impact:**
- **Critical:** Core operational tool
- **Efficiency:** Reduces manual work by 80%
- **Support:** Faster customer issue resolution
- **Control:** Centralized platform management

**Success Criteria:**
- < 1 second page load time
- All CRUD operations functional
- Role-based access control
- Comprehensive audit logging
- Real-time data updates

---

#### Acceptance Criteria

**User Management:**
- [ ] **AC1:** View all users with pagination
- [ ] **AC2:** Search users by email, phone, name
- [ ] **AC3:** Filter users by KYC tier, status, registration date
- [ ] **AC4:** View user details (profile, wallets, transactions)
- [ ] **AC5:** Update user status (active, suspended, banned)
- [ ] **AC6:** Manually verify/reject KYC
- [ ] **AC7:** Reset user password
- [ ] **AC8:** Unlock locked accounts
- [ ] **AC9:** View user activity logs
- [ ] **AC10:** Impersonate user (for support)

**Transaction Management:**
- [ ] **AC11:** View all transactions (real-time)
- [ ] **AC12:** Filter transactions by status, type, date
- [ ] **AC13:** View transaction details
- [ ] **AC14:** Manually process pending transactions
- [ ] **AC15:** Reverse/refund transactions
- [ ] **AC16:** Add transaction notes
- [ ] **AC17:** Flag suspicious transactions
- [ ] **AC18:** View transaction timeline/events

**System Settings:**
- [ ] **AC19:** Configure fee structures
- [ ] **AC20:** Set transaction limits per KYC tier
- [ ] **AC21:** Manage payment providers
- [ ] **AC22:** Configure notification settings
- [ ] **AC23:** Manage webhook endpoints
- [ ] **AC24:** View system health metrics

**Security:**
- [ ] **AC25:** Multi-factor authentication for admin
- [ ] **AC26:** Role-based permissions (super_admin, admin, analyst, support)
- [ ] **AC27:** Audit log for all admin actions
- [ ] **AC28:** IP whitelisting for admin access

---

#### Technical Specifications

**Admin Roles & Permissions:**

```typescript
enum AdminRole {
  SUPER_ADMIN = 'super_admin',  // Full access
  ADMIN = 'admin',               // Most operations
  ANALYST = 'analyst',           // Read-only + reports
  SUPPORT = 'support',           // User support operations
}

const permissions = {
  super_admin: ['*'],  // All permissions
  admin: [
    'users.read',
    'users.update',
    'users.suspend',
    'transactions.read',
    'transactions.reverse',
    'reports.read',
    'settings.update',
  ],
  analyst: [
    'users.read',
    'transactions.read',
    'reports.read',
  ],
  support: [
    'users.read',
    'users.update',
    'transactions.read',
    'users.unlock',
  ],
};
```

**User Management Endpoints:**

```typescript
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class AdminUsersController {
  @Get()
  @RequirePermission('users.read')
  async getUsers(@Query() filters: UserFiltersDto) {
    const users = await this.adminService.getUsers(filters);
    return { status: 'success', data: users };
  }

  @Get(':id')
  @RequirePermission('users.read')
  async getUserDetails(@Param('id') userId: string) {
    const user = await this.adminService.getUserDetails(userId);
    return { status: 'success', data: user };
  }

  @Patch(':id/status')
  @RequirePermission('users.update')
  @AuditLog('USER_STATUS_UPDATED')
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
    @Request() req
  ) {
    await this.adminService.updateUserStatus(userId, dto.status, req.user.id);
    return { status: 'success', message: 'User status updated' };
  }

  @Post(':id/suspend')
  @RequirePermission('users.suspend')
  @AuditLog('USER_SUSPENDED')
  async suspendUser(
    @Param('id') userId: string,
    @Body() dto: SuspendUserDto,
    @Request() req
  ) {
    await this.adminService.suspendUser(userId, dto.reason, req.user.id);
    return { status: 'success', message: 'User suspended' };
  }

  @Post(':id/kyc/approve')
  @RequirePermission('users.kyc.approve')
  @AuditLog('KYC_APPROVED')
  async approveKYC(
    @Param('id') userId: string,
    @Body() dto: ApproveKYCDto,
    @Request() req
  ) {
    await this.adminService.approveKYC(userId, dto.tier, req.user.id);
    return { status: 'success', message: 'KYC approved' };
  }
}
```

**Dashboard API:**

```typescript
@Get('admin/dashboard')
@RequirePermission('dashboard.read')
async getDashboard(@Query('period') period: string) {
  return {
    status: 'success',
    data: {
      metrics: {
        total_users: 15420,
        active_users_today: 1250,
        total_transactions_today: 3840,
        total_volume_today: 195000000,  // NGN 1,950,000
        success_rate: 98.7,
        pending_kyc: 45,
        pending_disputes: 3,
        active_sessions: 892,
      },
      charts: {
        transactions_trend: [
          { date: '2024-01-01', count: 3200, volume: 160000000 },
          { date: '2024-01-02', count: 3840, volume: 195000000 },
        ],
        user_growth: [
          { date: '2024-01-01', count: 15200 },
          { date: '2024-01-02', count: 15420 },
        ],
        revenue: {
          today: 1950000,
          week: 12500000,
          month: 48000000,
        },
      },
      alerts: [
        {
          type: 'high_risk_transaction',
          message: 'Transaction TXN-12345 flagged for review',
          timestamp: '2024-01-02T10:30:00Z',
        },
      ],
    },
  };
}
```

---

## FEATURE-11.3: Dispute Management

### 📘 User Story: US-8.3.1 - Dispute Resolution System

**Story ID:** US-8.3.1
**Feature:** FEATURE-11.3 (Dispute Management)
**Epic:** EPIC-13 (Dispute & Support)

**Story Points:** 8
**Priority:** P1 (High)
**Sprint:** Sprint 8
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to raise disputes for failed/incorrect transactions
So that I can get my issues resolved and funds recovered
```

---

#### Business Value

**Value Statement:**
Dispute management system builds user trust by providing a formal resolution process. Reduces support burden through structured workflow and documentation.

**Impact:**
- **High:** Improves user satisfaction
- **Support:** Reduces support ticket volume
- **Compliance:** Required for payment license
- **Trust:** Shows commitment to customer protection

**Success Criteria:**
- < 5 minutes to raise dispute
- 24-hour first response time
- 7-day average resolution time
- 90% user satisfaction with resolution

---

#### Acceptance Criteria

**User Features:**
- [ ] **AC1:** User can raise dispute for transaction
- [ ] **AC2:** Select dispute reason (unauthorized, wrong amount, not received, etc.)
- [ ] **AC3:** Upload evidence (screenshots, receipts)
- [ ] **AC4:** Add description
- [ ] **AC5:** View dispute status
- [ ] **AC6:** Receive notifications on status updates
- [ ] **AC7:** Add comments to dispute
- [ ] **AC8:** Accept/reject resolution
- [ ] **AC9:** View dispute history

**Admin Features:**
- [ ] **AC10:** View all disputes with filters
- [ ] **AC11:** Assign disputes to agents
- [ ] **AC12:** Update dispute status
- [ ] **AC13:** Add internal notes
- [ ] **AC14:** Request additional evidence
- [ ] **AC15:** Approve refunds
- [ ] **AC16:** Close disputes with resolution
- [ ] **AC17:** View dispute timeline
- [ ] **AC18:** Escalate to higher authority

**Workflow:**
- [ ] **AC19:** Auto-assign based on rules
- [ ] **AC20:** SLA tracking (24h response, 7d resolution)
- [ ] **AC21:** Automated status updates
- [ ] **AC22:** Email notifications at each stage

---

#### Dispute Statuses & Workflow

```typescript
enum DisputeStatus {
  PENDING = 'pending',              // Just raised
  UNDER_REVIEW = 'under_review',   // Admin reviewing
  INFO_REQUESTED = 'info_requested', // Need more info from user
  RESOLVED = 'resolved',             // Resolved in favor
  REJECTED = 'rejected',             // Resolved against
  CLOSED = 'closed',                 // User accepted resolution
}

enum DisputeReason {
  UNAUTHORIZED = 'unauthorized',           // Transaction not authorized
  WRONG_AMOUNT = 'wrong_amount',           // Incorrect amount charged
  NOT_RECEIVED = 'not_received',           // Service/product not received
  DUPLICATE = 'duplicate',                 // Duplicate charge
  FRAUD = 'fraud',                         // Fraudulent transaction
  TECHNICAL_ERROR = 'technical_error',     // System error
  OTHER = 'other',
}
```

**Dispute Schema:**

```typescript
@Entity('disputes')
export class Dispute extends BaseEntity {
  @Column('uuid')
  transaction_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.PENDING })
  status: DisputeStatus;

  @Column({ type: 'enum', enum: DisputeReason })
  reason: DisputeReason;

  @Column('text')
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  evidence: {
    files: string[];  // S3 URLs
    screenshots: string[];
  };

  @Column('uuid', { nullable: true })
  assigned_to: string;  // Admin user ID

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  resolved_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  closed_at: Date;

  // Relationships
  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => DisputeComment, comment => comment.dispute)
  comments: DisputeComment[];
}
```

---

## Summary of Sprint 8 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-8.1.1 | Transaction Reports & Analytics | 13 | P0 | To Do |
| US-8.2.1 | Admin Panel & User Management | 13 | P0 | To Do |
| US-8.3.1 | Dispute Resolution System | 8 | P1 | To Do |
| US-8.4.1 | Reconciliation Reports | 5 | P1 | To Do |
| US-8.5.1 | API Rate Limiting & Throttling | 6 | P2 | To Do |
| **Total** | | **45** | | |

---

## Sprint Velocity Tracking

**Planned Story Points:** 45 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

---

## Dependencies

**External:**
- Charting library (Chart.js, Recharts)
- PDF generation library (PDFKit)
- Excel export library (ExcelJS)
- Admin UI framework (React Admin, Ant Design)

**Internal:**
- Sprint 1: Authentication, authorization
- Sprint 5: Transaction system
- Sprint 7: Notification system
- All previous sprints: Data to report on

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-8.1 | Report generation performance issues | Medium | High | Database indexing, caching, pagination |
| RISK-8.2 | Admin panel security vulnerabilities | Low | Critical | MFA, IP whitelisting, audit logging |
| RISK-8.3 | Large export file generation timeout | Medium | Medium | Background job processing, chunking |
| RISK-8.4 | Dispute resolution SLA breaches | Medium | Medium | Auto-assignment, escalation rules |

---

## Notes & Decisions

**Technical Decisions:**
1. **PDF generation:** PDFKit for flexibility
2. **Excel export:** ExcelJS for better formatting
3. **Charts:** Chart.js for simplicity
4. **Admin UI:** Custom React + Ant Design
5. **Report caching:** Redis with 5-minute TTL

**Open Questions:**
1. ❓ Admin panel: Separate app or same codebase? **Decision: Same codebase, different route prefix**
2. ❓ Real-time dashboard: WebSockets or polling? **Decision: Server-Sent Events (SSE)**
3. ❓ Report storage: Keep or delete after download? **Decision: Keep for 7 days**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Enable comprehensive reporting and efficient platform administration
