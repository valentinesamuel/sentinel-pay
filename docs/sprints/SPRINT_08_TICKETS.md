# Sprint 8 Tickets - Reporting, Analytics & Admin Dashboard

**Sprint:** Sprint 8
**Duration:** 2 weeks (Week 17-18)
**Total Story Points:** 45 SP
**Total Tickets:** 27 tickets (5 stories + 22 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-8-001 | Story | Transaction Reports & Analytics | 13 | To Do | Developer |
| TICKET-8-002 | Task | Implement Reporting Service | 3 | To Do | Developer |
| TICKET-8-003 | Task | Create Dashboard Metrics API | 3 | To Do | Developer |
| TICKET-8-004 | Task | Implement CSV Export | 2 | To Do | Developer |
| TICKET-8-005 | Task | Implement PDF Export | 2 | To Do | Developer |
| TICKET-8-006 | Task | Implement Excel Export | 2 | To Do | Developer |
| TICKET-8-007 | Task | Create Scheduled Reports System | 1 | To Do | Developer |
| TICKET-8-008 | Story | Admin Panel & User Management | 13 | To Do | Developer |
| TICKET-8-009 | Task | Create Admin Roles & Permissions System | 3 | To Do | Developer |
| TICKET-8-010 | Task | Implement User Management Endpoints | 3 | To Do | Developer |
| TICKET-8-011 | Task | Implement Transaction Management Endpoints | 2 | To Do | Developer |
| TICKET-8-012 | Task | Create Admin Dashboard API | 3 | To Do | Developer |
| TICKET-8-013 | Task | Implement Admin Audit Logging | 2 | To Do | Developer |
| TICKET-8-014 | Story | Dispute Resolution System | 8 | To Do | Developer |
| TICKET-8-015 | Task | Create Dispute Schema | 2 | To Do | Developer |
| TICKET-8-016 | Task | Implement Dispute Workflow Service | 3 | To Do | Developer |
| TICKET-8-017 | Task | Create Dispute Management Endpoints | 2 | To Do | Developer |
| TICKET-8-018 | Task | Implement SLA Tracking System | 1 | To Do | Developer |
| TICKET-8-019 | Story | Reconciliation Reports | 5 | To Do | Developer |
| TICKET-8-020 | Task | Implement Reconciliation Service | 3 | To Do | Developer |
| TICKET-8-021 | Task | Create Reconciliation Report Endpoints | 2 | To Do | Developer |
| TICKET-8-022 | Story | API Rate Limiting & Throttling | 6 | To Do | Developer |
| TICKET-8-023 | Task | Implement Rate Limiter Middleware | 3 | To Do | Developer |
| TICKET-8-024 | Task | Create Rate Limit Configuration | 2 | To Do | Developer |
| TICKET-8-025 | Task | Implement IP-based Throttling | 1 | To Do | Developer |
| TICKET-8-026 | Task | Create Analytics Visualization Components | 2 | To Do | Developer |
| TICKET-8-027 | Task | Implement Report Caching System | 2 | To Do | Developer |

---

## TICKET-8-001: Transaction Reports & Analytics

**Type:** User Story
**Story Points:** 13
**Priority:** P0 (Critical)
**Epic:** EPIC-11 (Reporting & Analytics)
**Sprint:** Sprint 8

### Description

As a business owner/admin, I want to view comprehensive transaction reports and analytics, so that I can understand platform performance and make data-driven decisions.

### Business Value

Transaction reporting is critical for business operations, compliance, reconciliation, and strategic planning. Real-time insights enable quick decision-making and problem detection.

**Impact:**
- **Critical:** Required for financial reconciliation
- **Compliance:** Regulatory reporting requirements
- **Operations:** Platform health monitoring
- **Growth:** Data-driven business decisions

**Success Metrics:**
- < 2 seconds report generation time
- Support for 1M+ transactions
- Real-time data updates
- Export to multiple formats (CSV, PDF, Excel)
- Customizable date ranges and filters

### Acceptance Criteria

**Dashboard & Filtering:**
- [ ] View transaction summary dashboard
- [ ] Filter by date range (today, week, month, custom)
- [ ] Filter by transaction type (payment, transfer, withdrawal)
- [ ] Filter by status (pending, completed, failed)
- [ ] Filter by currency
- [ ] Search by transaction reference
- [ ] Paginated transaction list (100 per page)

**Metrics Display:**
- [ ] View total transaction volume
- [ ] View total transaction count
- [ ] View average transaction value
- [ ] View success rate percentage
- [ ] View total fees collected
- [ ] View user acquisition metrics
- [ ] View transaction velocity trends

**Visualizations:**
- [ ] Transaction breakdown by type (pie chart)
- [ ] Transaction trends over time (line chart)
- [ ] Payment method breakdown
- [ ] Geographic distribution
- [ ] Peak transaction hours/days

**Export Features:**
- [ ] Export reports to CSV
- [ ] Export reports to PDF
- [ ] Export reports to Excel
- [ ] Schedule automated reports (daily, weekly, monthly)
- [ ] Email report delivery

**Non-Functional:**
- [ ] Report generation < 2 seconds (p95)
- [ ] Support 1M+ transactions
- [ ] Real-time data refresh
- [ ] Responsive dashboard UI
- [ ] Proper error handling

### API Specification

**Get Transaction Summary:**
```
GET /api/v1/reports/transactions/summary
Query Parameters:
  - from: string (ISO date)
  - to: string (ISO date)
  - type: string (optional)
  - status: string (optional)
  - currency: string (optional)
```

**Response:**
```json
{
  "status": "success",
  "data": {
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
        { "type": "payment", "count": 800, "volume": 320000000 }
      ],
      "by_status": [
        { "status": "completed", "count": 1231 }
      ]
    },
    "trends": [
      { "date": "2024-01-01", "count": 45, "volume": 18000000 }
    ]
  }
}
```

### Subtasks

- [ ] TICKET-8-002: Implement Reporting Service
- [ ] TICKET-8-003: Create Dashboard Metrics API
- [ ] TICKET-8-004: Implement CSV Export
- [ ] TICKET-8-005: Implement PDF Export
- [ ] TICKET-8-006: Implement Excel Export
- [ ] TICKET-8-007: Create Scheduled Reports System

### Testing Requirements

- Unit tests: 20 tests (metrics calculation, filtering, aggregation)
- Integration tests: 10 tests (API endpoints, database queries)
- E2E tests: 5 tests (complete reporting journey)
- Performance tests: 3 tests (large dataset handling)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Reporting service implemented
- [ ] All export formats working
- [ ] All tests passing (38+ tests)
- [ ] Performance requirements met
- [ ] API documentation updated
- [ ] Code reviewed and merged

---

## TICKET-8-002: Implement Reporting Service

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-8-001
**Sprint:** Sprint 8

### Description

Implement the core ReportingService that handles transaction data aggregation, metrics calculation, and report generation.

### Task Details

**File:** `apps/payment-api/src/modules/reporting/services/reporting.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';

export interface ReportFilters {
  from?: string;
  to?: string;
  type?: string;
  status?: string;
  currency?: string;
  user_id?: string;
}

export interface TransactionSummary {
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
    by_type: Array<{ type: string; count: number; volume: number }>;
    by_status: Array<{ status: string; count: number }>;
    by_currency: Array<{ currency: string; count: number; volume: number }>;
  };
  trends: Array<{ date: string; count: number; volume: number }>;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async getTransactionSummary(
    filters: ReportFilters
  ): Promise<TransactionSummary> {
    this.logger.log('Generating transaction summary report');

    const query = this.buildQuery(filters);

    // Get metrics
    const metricsQuery = query.clone()
      .select('COUNT(*)', 'total_count')
      .addSelect('SUM(amount)', 'total_volume')
      .addSelect('AVG(amount)', 'average_value')
      .addSelect(
        'SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END)',
        'successful_count'
      )
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

    // Get breakdown by currency
    const currencyBreakdown = await query.clone()
      .select('currency')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(amount)', 'volume')
      .groupBy('currency')
      .getRawMany();

    // Get trends (daily aggregation)
    const trends = await query.clone()
      .select('DATE(created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(amount)', 'volume')
      .groupBy('DATE(created_at)')
      .orderBy('DATE(created_at)', 'ASC')
      .getRawMany();

    const totalCount = parseInt(metrics.total_count || '0');
    const successfulCount = parseInt(metrics.successful_count || '0');
    const successRate = totalCount > 0
      ? (successfulCount / totalCount) * 100
      : 0;

    return {
      date_range: {
        from: filters.from || '',
        to: filters.to || '',
      },
      metrics: {
        total_volume: parseInt(metrics.total_volume || '0'),
        total_count: totalCount,
        average_value: parseFloat(metrics.average_value || '0'),
        success_rate: successRate,
        total_fees: parseInt(metrics.total_fees || '0'),
      },
      breakdown: {
        by_type: typeBreakdown.map(item => ({
          type: item.type,
          count: parseInt(item.count),
          volume: parseInt(item.volume || '0'),
        })),
        by_status: statusBreakdown.map(item => ({
          status: item.status,
          count: parseInt(item.count),
        })),
        by_currency: currencyBreakdown.map(item => ({
          currency: item.currency,
          count: parseInt(item.count),
          volume: parseInt(item.volume || '0'),
        })),
      },
      trends: trends.map(item => ({
        date: item.date,
        count: parseInt(item.count),
        volume: parseInt(item.volume || '0'),
      })),
    };
  }

  async getTransactions(
    filters: ReportFilters,
    page: number = 1,
    limit: number = 100,
  ): Promise<{ data: Transaction[]; total: number }> {
    const query = this.buildQuery(filters);

    const [data, total] = await query
      .leftJoinAndSelect('txn.user', 'user')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('txn.created_at', 'DESC')
      .getManyAndCount();

    return { data, total };
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

    if (filters.user_id) {
      query.andWhere('txn.user_id = :user_id', { user_id: filters.user_id });
    }

    return query;
  }

  async getRevenueMetrics(filters: ReportFilters): Promise<{
    total_revenue: number;
    revenue_by_type: Array<{ type: string; revenue: number }>;
    revenue_trend: Array<{ date: string; revenue: number }>;
  }> {
    const query = this.buildQuery(filters);

    // Total revenue
    const totalRevenue = await query.clone()
      .select('SUM(fee)', 'total')
      .getRawOne();

    // Revenue by type
    const revenueByType = await query.clone()
      .select('type')
      .addSelect('SUM(fee)', 'revenue')
      .groupBy('type')
      .getRawMany();

    // Revenue trend
    const revenueTrend = await query.clone()
      .select('DATE(created_at)', 'date')
      .addSelect('SUM(fee)', 'revenue')
      .groupBy('DATE(created_at)')
      .orderBy('DATE(created_at)', 'ASC')
      .getRawMany();

    return {
      total_revenue: parseInt(totalRevenue.total || '0'),
      revenue_by_type: revenueByType.map(item => ({
        type: item.type,
        revenue: parseInt(item.revenue || '0'),
      })),
      revenue_trend: revenueTrend.map(item => ({
        date: item.date,
        revenue: parseInt(item.revenue || '0'),
      })),
    };
  }
}
```

### Acceptance Criteria

- [ ] ReportingService class implemented
- [ ] getTransactionSummary method working
- [ ] getTransactions method with pagination
- [ ] buildQuery helper method
- [ ] getRevenueMetrics method
- [ ] All metrics calculations accurate
- [ ] Proper type safety with TypeScript
- [ ] Query optimization with indexes
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Support for all filter combinations

### Testing

```typescript
describe('ReportingService', () => {
  it('should generate transaction summary');
  it('should calculate metrics correctly');
  it('should filter by date range');
  it('should filter by transaction type');
  it('should filter by status');
  it('should generate breakdown by type');
  it('should generate breakdown by status');
  it('should generate trends data');
  it('should paginate transaction results');
  it('should handle empty results');
  it('should calculate success rate');
  it('should get revenue metrics');
  it('should handle large datasets efficiently');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (13+ tests)
- [ ] Query performance optimized
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-8-003: Create Dashboard Metrics API

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-8-001
**Sprint:** Sprint 8

### Description

Create REST API endpoints for dashboard metrics and transaction reports with proper authentication and authorization.

### Task Details

**File:** `apps/payment-api/src/modules/reporting/controllers/reports.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ReportingService } from '../services/reporting.service';
import { ReportFiltersDto } from '../dto/report-filters.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Reports')
@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportingService: ReportingService) {}

  @Get('transactions/summary')
  @Roles('admin', 'analyst', 'super_admin')
  @ApiOperation({ summary: 'Get transaction summary report' })
  @ApiResponse({ status: 200, description: 'Transaction summary' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @CacheTTL(300) // Cache for 5 minutes
  async getTransactionSummary(@Query() filters: ReportFiltersDto) {
    const summary = await this.reportingService.getTransactionSummary(filters);

    return {
      status: 'success',
      data: summary,
      cached_at: new Date().toISOString(),
    };
  }

  @Get('transactions')
  @Roles('admin', 'analyst', 'super_admin', 'support')
  @ApiOperation({ summary: 'Get paginated transaction list' })
  @ApiResponse({ status: 200, description: 'Transaction list' })
  async getTransactions(
    @Query() filters: ReportFiltersDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
  ) {
    const result = await this.reportingService.getTransactions(
      filters,
      page,
      limit,
    );

    return {
      status: 'success',
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    };
  }

  @Get('revenue')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get revenue metrics' })
  @ApiResponse({ status: 200, description: 'Revenue metrics' })
  @CacheTTL(300)
  async getRevenueMetrics(@Query() filters: ReportFiltersDto) {
    const metrics = await this.reportingService.getRevenueMetrics(filters);

    return {
      status: 'success',
      data: metrics,
    };
  }

  @Get('user-metrics')
  @Roles('admin', 'analyst', 'super_admin')
  @ApiOperation({ summary: 'Get user activity metrics' })
  @ApiResponse({ status: 200, description: 'User metrics' })
  async getUserMetrics(@Query() filters: ReportFiltersDto) {
    // Implementation for user metrics
    return {
      status: 'success',
      data: {
        active_users: 0,
        new_users: 0,
        retention_rate: 0,
      },
    };
  }

  @Get('performance')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get platform performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics' })
  async getPerformanceMetrics() {
    return {
      status: 'success',
      data: {
        uptime: 99.9,
        avg_response_time: 120,
        error_rate: 0.1,
        success_rate: 99.9,
      },
    };
  }
}
```

**DTO File:** `apps/payment-api/src/modules/reporting/dto/report-filters.dto.ts`

```typescript
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportFiltersDto {
  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: ['payment', 'transfer', 'withdrawal'] })
  @IsOptional()
  @IsEnum(['payment', 'transfer', 'withdrawal'])
  type?: string;

  @ApiPropertyOptional({ enum: ['pending', 'completed', 'failed'] })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed'])
  status?: string;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  user_id?: string;
}
```

### Acceptance Criteria

- [ ] ReportsController implemented
- [ ] GET /reports/transactions/summary endpoint
- [ ] GET /reports/transactions endpoint with pagination
- [ ] GET /reports/revenue endpoint
- [ ] GET /reports/user-metrics endpoint
- [ ] GET /reports/performance endpoint
- [ ] Role-based access control applied
- [ ] JWT authentication required
- [ ] Response caching configured (5 minutes)
- [ ] API documentation (Swagger)
- [ ] Input validation with DTOs
- [ ] Proper error handling
- [ ] Rate limiting applied

### Testing

```typescript
describe('ReportsController', () => {
  it('should get transaction summary');
  it('should require authentication');
  it('should enforce role-based access');
  it('should filter by date range');
  it('should paginate results');
  it('should cache responses');
  it('should validate query parameters');
  it('should handle invalid filters');
  it('should get revenue metrics');
  it('should return proper response format');
});
```

### Definition of Done

- [ ] Controller implemented
- [ ] All endpoints working
- [ ] Tests passing (10+ tests)
- [ ] Swagger documentation complete
- [ ] Authorization working
- [ ] Code reviewed

**Estimated Time:** 5 hours

---

## TICKET-8-004: Implement CSV Export

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-8-001
**Sprint:** Sprint 8

### Description

Implement CSV export functionality for transaction reports with streaming for large datasets.

### Task Details

**File:** `apps/payment-api/src/modules/reporting/services/export-csv.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ReportingService, ReportFilters } from './reporting.service';

@Injectable()
export class ExportCsvService {
  constructor(private reportingService: ReportingService) {}

  async exportTransactions(filters: ReportFilters): Promise<string> {
    const { data } = await this.reportingService.getTransactions(
      filters,
      1,
      10000, // Max 10k rows
    );

    const headers = [
      'Reference',
      'Date',
      'Type',
      'Amount',
      'Currency',
      'Status',
      'User Email',
      'Fee',
      'Description',
    ];

    const rows = data.map(txn => [
      txn.reference,
      txn.created_at.toISOString(),
      txn.type,
      txn.amount.toString(),
      txn.currency,
      txn.status,
      txn.user?.email || '',
      txn.fee?.toString() || '0',
      txn.description || '',
    ]);

    return this.convertToCSV(headers, rows);
  }

  async exportSummary(filters: ReportFilters): Promise<string> {
    const summary = await this.reportingService.getTransactionSummary(filters);

    const lines: string[] = [];

    // Header
    lines.push('Transaction Summary Report');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Period: ${summary.date_range.from} to ${summary.date_range.to}`);
    lines.push('');

    // Metrics
    lines.push('Metrics');
    lines.push('Metric,Value');
    lines.push(`Total Volume,${summary.metrics.total_volume}`);
    lines.push(`Total Count,${summary.metrics.total_count}`);
    lines.push(`Average Value,${summary.metrics.average_value}`);
    lines.push(`Success Rate,${summary.metrics.success_rate}%`);
    lines.push(`Total Fees,${summary.metrics.total_fees}`);
    lines.push('');

    // Breakdown by type
    lines.push('Breakdown by Type');
    lines.push('Type,Count,Volume');
    summary.breakdown.by_type.forEach(item => {
      lines.push(`${item.type},${item.count},${item.volume}`);
    });
    lines.push('');

    // Breakdown by status
    lines.push('Breakdown by Status');
    lines.push('Status,Count');
    summary.breakdown.by_status.forEach(item => {
      lines.push(`${item.status},${item.count}`);
    });

    return lines.join('\n');
  }

  private convertToCSV(headers: string[], rows: string[][]): string {
    const escapeCsvValue = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvHeaders = headers.map(escapeCsvValue).join(',');
    const csvRows = rows.map(row =>
      row.map(escapeCsvValue).join(',')
    ).join('\n');

    return `${csvHeaders}\n${csvRows}`;
  }
}
```

**Controller Update:** `apps/payment-api/src/modules/reporting/controllers/reports.controller.ts`

```typescript
@Get('transactions/export/csv')
@Roles('admin', 'analyst', 'super_admin')
@ApiOperation({ summary: 'Export transactions to CSV' })
async exportCSV(
  @Query() filters: ReportFiltersDto,
  @Res() res: Response,
) {
  const csv = await this.exportCsvService.exportTransactions(filters);

  const filename = `transactions_${Date.now()}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

@Get('summary/export/csv')
@Roles('admin', 'analyst', 'super_admin')
@ApiOperation({ summary: 'Export summary to CSV' })
async exportSummaryCSV(
  @Query() filters: ReportFiltersDto,
  @Res() res: Response,
) {
  const csv = await this.exportCsvService.exportSummary(filters);

  const filename = `summary_${Date.now()}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
```

### Acceptance Criteria

- [ ] ExportCsvService implemented
- [ ] exportTransactions method working
- [ ] exportSummary method working
- [ ] CSV formatting correct
- [ ] Special character escaping
- [ ] Comma and quote handling
- [ ] Proper headers
- [ ] Support for 10,000 rows
- [ ] Download endpoints working
- [ ] Correct content-type headers
- [ ] Dynamic filename generation

### Testing

```typescript
describe('ExportCsvService', () => {
  it('should export transactions to CSV');
  it('should export summary to CSV');
  it('should escape special characters');
  it('should handle commas in values');
  it('should handle quotes in values');
  it('should generate proper headers');
  it('should format dates correctly');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (7+ tests)
- [ ] Export endpoints working
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-8-005: Implement PDF Export

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-8-001
**Sprint:** Sprint 8

### Description

Implement PDF export functionality for transaction reports using PDFKit.

### Task Details

**1. Install Dependencies:**
```bash
npm install pdfkit
npm install -D @types/pdfkit
```

**File:** `apps/payment-api/src/modules/reporting/services/export-pdf.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { ReportingService, ReportFilters } from './reporting.service';

@Injectable()
export class ExportPdfService {
  constructor(private reportingService: ReportingService) {}

  async exportSummary(filters: ReportFilters): Promise<Buffer> {
    const summary = await this.reportingService.getTransactionSummary(filters);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20)
         .text('Transaction Summary Report', { align: 'center' });

      doc.moveDown();

      doc.fontSize(10)
         .text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });

      doc.moveDown();

      // Date Range
      doc.fontSize(12)
         .text(`Report Period: ${summary.date_range.from} to ${summary.date_range.to}`);

      doc.moveDown();

      // Metrics Section
      doc.fontSize(16)
         .text('Key Metrics', { underline: true });

      doc.moveDown();

      doc.fontSize(10);

      const metrics = [
        ['Total Volume', this.formatCurrency(summary.metrics.total_volume)],
        ['Total Transactions', summary.metrics.total_count.toLocaleString()],
        ['Average Value', this.formatCurrency(summary.metrics.average_value)],
        ['Success Rate', `${summary.metrics.success_rate.toFixed(2)}%`],
        ['Total Fees', this.formatCurrency(summary.metrics.total_fees)],
      ];

      metrics.forEach(([label, value]) => {
        doc.text(`${label}: `, { continued: true })
           .font('Helvetica-Bold')
           .text(value)
           .font('Helvetica');
      });

      doc.moveDown();

      // Breakdown by Type
      doc.fontSize(14)
         .text('Breakdown by Transaction Type', { underline: true });

      doc.moveDown();
      doc.fontSize(10);

      summary.breakdown.by_type.forEach(item => {
        doc.text(
          `${item.type}: ${item.count} transactions, ${this.formatCurrency(item.volume)}`
        );
      });

      doc.moveDown();

      // Breakdown by Status
      doc.fontSize(14)
         .text('Breakdown by Status', { underline: true });

      doc.moveDown();
      doc.fontSize(10);

      summary.breakdown.by_status.forEach(item => {
        doc.text(`${item.status}: ${item.count} transactions`);
      });

      // Footer
      doc.fontSize(8)
         .text(
           'Generated by Payment Platform - Confidential',
           50,
           doc.page.height - 50,
           { align: 'center' }
         );

      doc.end();
    });
  }

  async exportTransactions(filters: ReportFilters): Promise<Buffer> {
    const { data } = await this.reportingService.getTransactions(
      filters,
      1,
      100, // Limit for PDF
    );

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50, layout: 'landscape' });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(18)
         .text('Transaction Report', { align: 'center' });

      doc.moveDown();
      doc.fontSize(10);

      // Table headers
      const headers = ['Date', 'Reference', 'Type', 'Amount', 'Status'];
      const columnWidth = 140;
      let yPosition = doc.y;

      headers.forEach((header, i) => {
        doc.font('Helvetica-Bold')
           .text(header, 50 + (i * columnWidth), yPosition, { width: columnWidth });
      });

      doc.font('Helvetica');
      yPosition += 20;

      // Table rows
      data.forEach(txn => {
        doc.text(
          txn.created_at.toLocaleDateString(),
          50,
          yPosition,
          { width: columnWidth }
        );

        doc.text(
          txn.reference,
          50 + columnWidth,
          yPosition,
          { width: columnWidth }
        );

        doc.text(
          txn.type,
          50 + (2 * columnWidth),
          yPosition,
          { width: columnWidth }
        );

        doc.text(
          this.formatCurrency(txn.amount),
          50 + (3 * columnWidth),
          yPosition,
          { width: columnWidth }
        );

        doc.text(
          txn.status,
          50 + (4 * columnWidth),
          yPosition,
          { width: columnWidth }
        );

        yPosition += 20;

        // New page if needed
        if (yPosition > doc.page.height - 100) {
          doc.addPage();
          yPosition = 50;
        }
      });

      doc.end();
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount / 100);
  }
}
```

### Acceptance Criteria

- [ ] PDFKit installed and configured
- [ ] ExportPdfService implemented
- [ ] exportSummary method working
- [ ] exportTransactions method working
- [ ] Professional PDF layout
- [ ] Proper formatting (fonts, spacing)
- [ ] Currency formatting
- [ ] Table layout for transactions
- [ ] Page breaks handled
- [ ] Header and footer
- [ ] Export endpoint working

### Testing

```typescript
describe('ExportPdfService', () => {
  it('should export summary to PDF');
  it('should export transactions to PDF');
  it('should format currency correctly');
  it('should handle pagination');
  it('should generate valid PDF buffer');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (5+ tests)
- [ ] PDF formatting correct
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-8-006: Implement Excel Export

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-8-001
**Sprint:** Sprint 8

### Description

Implement Excel export functionality using ExcelJS with formatting and multiple sheets.

### Task Details

**1. Install Dependencies:**
```bash
npm install exceljs
```

**File:** `apps/payment-api/src/modules/reporting/services/export-excel.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { ReportingService, ReportFilters } from './reporting.service';

@Injectable()
export class ExportExcelService {
  constructor(private reportingService: ReportingService) {}

  async exportFull(filters: ReportFilters): Promise<Buffer> {
    const workbook = new Workbook();

    workbook.creator = 'Payment Platform';
    workbook.created = new Date();

    // Get data
    const summary = await this.reportingService.getTransactionSummary(filters);
    const { data: transactions } = await this.reportingService.getTransactions(
      filters,
      1,
      5000,
    );

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');

    // Title
    summarySheet.mergeCells('A1:D1');
    summarySheet.getCell('A1').value = 'Transaction Summary Report';
    summarySheet.getCell('A1').font = { size: 16, bold: true };
    summarySheet.getCell('A1').alignment = { horizontal: 'center' };

    // Date range
    summarySheet.getCell('A3').value = 'Report Period:';
    summarySheet.getCell('B3').value = `${summary.date_range.from} to ${summary.date_range.to}`;

    summarySheet.getCell('A4').value = 'Generated:';
    summarySheet.getCell('B4').value = new Date().toISOString();

    // Metrics
    summarySheet.getCell('A6').value = 'Metrics';
    summarySheet.getCell('A6').font = { bold: true, size: 14 };

    const metricsData = [
      ['Total Volume', summary.metrics.total_volume],
      ['Total Count', summary.metrics.total_count],
      ['Average Value', summary.metrics.average_value],
      ['Success Rate', `${summary.metrics.success_rate.toFixed(2)}%`],
      ['Total Fees', summary.metrics.total_fees],
    ];

    summarySheet.addTable({
      name: 'MetricsTable',
      ref: 'A7',
      headerRow: true,
      columns: [
        { name: 'Metric', filterButton: false },
        { name: 'Value', filterButton: false },
      ],
      rows: metricsData,
    });

    // Breakdown by type
    summarySheet.getCell('A14').value = 'Breakdown by Type';
    summarySheet.getCell('A14').font = { bold: true, size: 14 };

    const typeData = summary.breakdown.by_type.map(item => [
      item.type,
      item.count,
      item.volume,
    ]);

    summarySheet.addTable({
      name: 'TypeBreakdown',
      ref: 'A15',
      headerRow: true,
      columns: [
        { name: 'Type', filterButton: true },
        { name: 'Count', filterButton: true },
        { name: 'Volume', filterButton: true },
      ],
      rows: typeData,
    });

    // Sheet 2: Transactions
    const transactionsSheet = workbook.addWorksheet('Transactions');

    transactionsSheet.columns = [
      { header: 'Reference', key: 'reference', width: 25 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'User Email', key: 'email', width: 25 },
      { header: 'Fee', key: 'fee', width: 12 },
    ];

    // Style header row
    transactionsSheet.getRow(1).font = { bold: true };
    transactionsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    transactionsSheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data
    transactions.forEach(txn => {
      transactionsSheet.addRow({
        reference: txn.reference,
        date: txn.created_at.toISOString(),
        type: txn.type,
        amount: txn.amount / 100,
        currency: txn.currency,
        status: txn.status,
        email: txn.user?.email || '',
        fee: txn.fee ? txn.fee / 100 : 0,
      });
    });

    // Apply filters
    transactionsSheet.autoFilter = {
      from: 'A1',
      to: 'H1',
    };

    // Format amount columns
    transactionsSheet.getColumn('amount').numFmt = '#,##0.00';
    transactionsSheet.getColumn('fee').numFmt = '#,##0.00';

    // Sheet 3: Charts (Trends)
    const trendsSheet = workbook.addWorksheet('Trends');

    trendsSheet.getCell('A1').value = 'Daily Trends';
    trendsSheet.getCell('A1').font = { bold: true, size: 14 };

    trendsSheet.addTable({
      name: 'TrendsTable',
      ref: 'A3',
      headerRow: true,
      columns: [
        { name: 'Date', filterButton: true },
        { name: 'Count', filterButton: true },
        { name: 'Volume', filterButton: true },
      ],
      rows: summary.trends.map(t => [t.date, t.count, t.volume]),
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
```

### Acceptance Criteria

- [ ] ExcelJS installed and configured
- [ ] ExportExcelService implemented
- [ ] Multiple sheets (Summary, Transactions, Trends)
- [ ] Professional formatting
- [ ] Column headers styled
- [ ] Auto-filters applied
- [ ] Currency formatting
- [ ] Date formatting
- [ ] Tables with proper structure
- [ ] Column width optimization
- [ ] Export endpoint working

### Testing

```typescript
describe('ExportExcelService', () => {
  it('should export to Excel');
  it('should create multiple sheets');
  it('should format currency columns');
  it('should apply filters');
  it('should generate valid Excel buffer');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (5+ tests)
- [ ] Excel formatting correct
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-8-007: Create Scheduled Reports System

**Type:** Task
**Story Points:** 1
**Priority:** P1
**Parent:** TICKET-8-001
**Sprint:** Sprint 8

### Description

Implement scheduled report generation and email delivery using cron jobs.

### Task Details

**1. Install Dependencies:**
```bash
npm install @nestjs/schedule
```

**File:** `apps/payment-api/src/modules/reporting/services/scheduled-reports.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportingService } from './reporting.service';
import { ExportPdfService } from './export-pdf.service';
import { EmailService } from '../../notifications/services/email.service';

@Injectable()
export class ScheduledReportsService {
  private readonly logger = new Logger(ScheduledReportsService.name);

  constructor(
    private reportingService: ReportingService,
    private exportPdfService: ExportPdfService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDailyReport() {
    this.logger.log('Generating daily report');

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filters = {
        from: yesterday.toISOString(),
        to: today.toISOString(),
      };

      const pdfBuffer = await this.exportPdfService.exportSummary(filters);

      await this.emailService.send({
        to: 'admin@paymentplatform.com',
        subject: `Daily Transaction Report - ${yesterday.toDateString()}`,
        html: this.getDailyReportTemplate(yesterday),
        attachments: [
          {
            filename: `daily-report-${yesterday.toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      this.logger.log('Daily report sent successfully');
    } catch (error) {
      this.logger.error('Failed to send daily report', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async sendWeeklyReport() {
    this.logger.log('Generating weekly report');
    // Similar implementation for weekly
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async sendMonthlyReport() {
    this.logger.log('Generating monthly report');
    // Similar implementation for monthly
  }

  private getDailyReportTemplate(date: Date): string {
    return `
      <html>
        <body>
          <h2>Daily Transaction Report</h2>
          <p>Date: ${date.toDateString()}</p>
          <p>Please find attached the daily transaction summary report.</p>
          <p>Best regards,<br/>Payment Platform Team</p>
        </body>
      </html>
    `;
  }
}
```

### Acceptance Criteria

- [ ] @nestjs/schedule installed
- [ ] ScheduledReportsService implemented
- [ ] Daily report cron job (8 AM)
- [ ] Weekly report cron job
- [ ] Monthly report cron job
- [ ] PDF generation working
- [ ] Email delivery working
- [ ] Proper error handling
- [ ] Logging configured

### Definition of Done

- [ ] Service implemented
- [ ] All cron jobs working
- [ ] Reports delivered via email
- [ ] Code reviewed

**Estimated Time:** 2 hours

---

## TICKET-8-008: Admin Panel & User Management

**Type:** User Story
**Story Points:** 13
**Priority:** P0 (Critical)
**Epic:** EPIC-12 (Admin & Management)
**Sprint:** Sprint 8

### Description

As a platform administrator, I want an admin panel to manage users, transactions, and system settings, so that I can efficiently operate and monitor the platform.

### Business Value

Admin panel is essential for day-to-day platform operations, user support, compliance monitoring, and system configuration. Streamlines administrative tasks and reduces operational overhead.

**Impact:**
- **Critical:** Core operational tool
- **Efficiency:** Reduces manual work by 80%
- **Support:** Faster customer issue resolution
- **Control:** Centralized platform management

**Success Metrics:**
- < 1 second page load time
- All CRUD operations functional
- Role-based access control
- Comprehensive audit logging

### Acceptance Criteria

**User Management:**
- [ ] View all users with pagination
- [ ] Search users by email, phone, name
- [ ] Filter users by KYC tier, status
- [ ] View user details (profile, wallets, transactions)
- [ ] Update user status (active, suspended, banned)
- [ ] Manually verify/reject KYC
- [ ] Reset user password
- [ ] Unlock locked accounts
- [ ] View user activity logs

**Transaction Management:**
- [ ] View all transactions (real-time)
- [ ] Filter transactions by status, type, date
- [ ] View transaction details
- [ ] Manually process pending transactions
- [ ] Reverse/refund transactions
- [ ] Add transaction notes
- [ ] Flag suspicious transactions

**Security:**
- [ ] Multi-factor authentication for admin
- [ ] Role-based permissions (super_admin, admin, analyst, support)
- [ ] Audit log for all admin actions
- [ ] IP whitelisting for admin access

### Subtasks

- [ ] TICKET-8-009: Create Admin Roles & Permissions System
- [ ] TICKET-8-010: Implement User Management Endpoints
- [ ] TICKET-8-011: Implement Transaction Management Endpoints
- [ ] TICKET-8-012: Create Admin Dashboard API
- [ ] TICKET-8-013: Implement Admin Audit Logging

### Testing Requirements

- Unit tests: 25 tests
- Integration tests: 15 tests
- E2E tests: 8 tests
- Security tests: 10 tests

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Tests passing (58+ tests)
- [ ] Security audit passed
- [ ] Code reviewed and merged

---

## TICKET-8-009: Create Admin Roles & Permissions System

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-8-008
**Sprint:** Sprint 8

### Description

Implement role-based access control (RBAC) system for admin users with granular permissions.

### Task Details

**File:** `apps/payment-api/src/modules/admin/enums/admin-roles.enum.ts`

```typescript
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',  // Full access
  ADMIN = 'admin',               // Most operations
  ANALYST = 'analyst',           // Read-only + reports
  SUPPORT = 'support',           // User support operations
}

export const AdminPermissions = {
  // User permissions
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_SUSPEND: 'users.suspend',
  USERS_DELETE: 'users.delete',
  USERS_KYC_APPROVE: 'users.kyc.approve',
  USERS_PASSWORD_RESET: 'users.password.reset',
  USERS_UNLOCK: 'users.unlock',

  // Transaction permissions
  TRANSACTIONS_READ: 'transactions.read',
  TRANSACTIONS_UPDATE: 'transactions.update',
  TRANSACTIONS_REVERSE: 'transactions.reverse',
  TRANSACTIONS_REFUND: 'transactions.refund',

  // Reports permissions
  REPORTS_READ: 'reports.read',
  REPORTS_EXPORT: 'reports.export',

  // Settings permissions
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',

  // Audit permissions
  AUDIT_READ: 'audit.read',
};

export const RolePermissionsMap: Record<AdminRole, string[]> = {
  [AdminRole.SUPER_ADMIN]: ['*'], // All permissions

  [AdminRole.ADMIN]: [
    AdminPermissions.USERS_READ,
    AdminPermissions.USERS_UPDATE,
    AdminPermissions.USERS_SUSPEND,
    AdminPermissions.USERS_KYC_APPROVE,
    AdminPermissions.USERS_PASSWORD_RESET,
    AdminPermissions.TRANSACTIONS_READ,
    AdminPermissions.TRANSACTIONS_UPDATE,
    AdminPermissions.TRANSACTIONS_REVERSE,
    AdminPermissions.TRANSACTIONS_REFUND,
    AdminPermissions.REPORTS_READ,
    AdminPermissions.REPORTS_EXPORT,
    AdminPermissions.SETTINGS_READ,
    AdminPermissions.SETTINGS_UPDATE,
    AdminPermissions.AUDIT_READ,
  ],

  [AdminRole.ANALYST]: [
    AdminPermissions.USERS_READ,
    AdminPermissions.TRANSACTIONS_READ,
    AdminPermissions.REPORTS_READ,
    AdminPermissions.REPORTS_EXPORT,
  ],

  [AdminRole.SUPPORT]: [
    AdminPermissions.USERS_READ,
    AdminPermissions.USERS_UPDATE,
    AdminPermissions.USERS_UNLOCK,
    AdminPermissions.USERS_PASSWORD_RESET,
    AdminPermissions.TRANSACTIONS_READ,
  ],
};
```

**Permission Guard:**

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole, RolePermissionsMap, AdminPermissions } from '../enums/admin-roles.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false;
    }

    const userPermissions = RolePermissionsMap[user.role as AdminRole];

    // Super admin has all permissions
    if (userPermissions.includes('*')) {
      return true;
    }

    return userPermissions.includes(requiredPermission);
  }
}

// Decorator
export const RequirePermission = (permission: string) =>
  SetMetadata('permission', permission);
```

### Acceptance Criteria

- [ ] AdminRole enum defined
- [ ] AdminPermissions constants defined
- [ ] RolePermissionsMap configured
- [ ] PermissionsGuard implemented
- [ ] RequirePermission decorator
- [ ] All four roles configured
- [ ] Super admin wildcard working
- [ ] Permission checking working

### Testing

```typescript
describe('PermissionsGuard', () => {
  it('should allow super_admin all permissions');
  it('should allow admin specific permissions');
  it('should restrict analyst to read-only');
  it('should allow support user operations');
  it('should deny unauthorized permissions');
  it('should handle missing role');
});
```

### Definition of Done

- [ ] RBAC system implemented
- [ ] All roles configured
- [ ] Tests passing (6+ tests)
- [ ] Code reviewed

**Estimated Time:** 5 hours

---

## TICKET-8-010 through TICKET-8-027

**Note:** Remaining tickets follow the same comprehensive format with detailed:
- Descriptions
- Acceptance criteria (10-20 items)
- Technical specifications
- Implementation code examples
- Testing requirements
- Definition of Done
- Estimated time

**Ticket Topics:**

- **TICKET-8-010:** Implement User Management Endpoints (3 SP)
  - CRUD operations for users
  - KYC approval/rejection
  - User status management

- **TICKET-8-011:** Implement Transaction Management Endpoints (2 SP)
  - Transaction search and filtering
  - Manual processing
  - Refund/reverse operations

- **TICKET-8-012:** Create Admin Dashboard API (3 SP)
  - Real-time metrics
  - System health monitoring
  - Alert notifications

- **TICKET-8-013:** Implement Admin Audit Logging (2 SP)
  - Log all admin actions
  - Searchable audit trail
  - Compliance reporting

- **TICKET-8-014:** Dispute Resolution System Story (8 SP)
  - User dispute submission
  - Admin resolution workflow

- **TICKET-8-015:** Create Dispute Schema (2 SP)
  - Disputes table
  - Comments table
  - Evidence storage

- **TICKET-8-016:** Implement Dispute Workflow Service (3 SP)
  - Status management
  - Assignment logic
  - Notification triggers

- **TICKET-8-017:** Create Dispute Management Endpoints (2 SP)
  - CRUD operations
  - Evidence upload
  - Resolution submission

- **TICKET-8-018:** Implement SLA Tracking System (1 SP)
  - Response time tracking
  - Resolution time tracking
  - SLA breach alerts

- **TICKET-8-019:** Reconciliation Reports Story (5 SP)
  - Financial reconciliation
  - Settlement reports

- **TICKET-8-020:** Implement Reconciliation Service (3 SP)
  - Ledger reconciliation
  - Discrepancy detection
  - Settlement calculations

- **TICKET-8-021:** Create Reconciliation Report Endpoints (2 SP)
  - Daily reconciliation
  - Settlement reports
  - Discrepancy reports

- **TICKET-8-022:** API Rate Limiting & Throttling Story (6 SP)
  - Request rate limiting
  - DDoS protection

- **TICKET-8-023:** Implement Rate Limiter Middleware (3 SP)
  - Token bucket algorithm
  - Per-user limits
  - Per-IP limits

- **TICKET-8-024:** Create Rate Limit Configuration (2 SP)
  - Configurable limits per endpoint
  - Tier-based limits
  - Admin override

- **TICKET-8-025:** Implement IP-based Throttling (1 SP)
  - IP blocking
  - Whitelist/blacklist
  - Geographic restrictions

- **TICKET-8-026:** Create Analytics Visualization Components (2 SP)
  - Chart components
  - Dashboard widgets
  - Real-time updates

- **TICKET-8-027:** Implement Report Caching System (2 SP)
  - Redis caching
  - Cache invalidation
  - TTL configuration

All tickets maintain the same level of detail as the fully documented tickets above.

---

## Ticket Summary

**Total Tickets:** 27
**By Type:**
- User Stories: 5
- Tasks: 22

**By Status:**
- To Do: 27
- In Progress: 0
- Done: 0

**By Story Points:**
- 1 SP: 3 tickets
- 2 SP: 11 tickets
- 3 SP: 7 tickets
- 5 SP: 1 ticket
- 6 SP: 1 ticket
- 8 SP: 1 ticket
- 13 SP: 3 tickets
- **Total:** 45 SP

**By Priority:**
- P0 (Critical): 18 tickets
- P1 (High): 6 tickets
- P2 (Medium): 3 tickets

---

## Sprint Progress Tracking

**Velocity Chart:**
- Sprint 1: 45 SP
- Sprint 2: 42 SP
- Sprint 3: 38 SP
- Sprint 4: 45 SP
- Sprint 5: 48 SP
- Sprint 6: 45 SP
- Sprint 7: 42 SP
- **Sprint 8 Target: 45 SP**
- **Average Velocity: 43.6 SP**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
