# Sprint 27 Backlog - Batch Payments & Mobile Money Mocks

**Sprint:** Sprint 27
**Duration:** 2 weeks (Week 55-56)
**Sprint Goal:** Implement bulk payment processing and mobile money integration preparation
**Story Points Committed:** 35
**Team Capacity:** 35 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of previous sprints = 42 SP, committed 35 SP (focus on quality over quantity)

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 27, we will have:
1. ✅ CSV/Excel batch payment upload and validation
2. ✅ Batch approval workflow with maker-checker controls
3. ✅ Scheduled batch processing with cron jobs
4. ✅ Payout batching for efficient fund disbursement
5. ✅ Mock MTN Mobile Money (MoMo) service
6. ✅ Mock Airtel Money service
7. ✅ Mock M-Pesa service
8. ✅ Mobile money deposit/withdrawal simulation
9. ✅ Provider abstraction layer for future real integrations

**Why This Sprint is VALUABLE:**
- **Efficiency:** Batch processing reduces manual work by 90%+ for bulk payments
- **Cost Savings:** Mock mobile money services save $5K-15K in integration fees during development
- **Market Reach:** Mobile money covers 60%+ of African financial transactions
- **Scalability:** Handle 10K+ payments per batch vs. manual one-by-one processing
- **User Experience:** Businesses can pay salaries, vendor payments in bulk

**Business Impact:**
- **Salary Disbursements:** Enable companies to pay 1000+ employees in one batch
- **Vendor Payments:** Bulk pay suppliers, contractors efficiently
- **Agent Commissions:** Batch calculate and distribute commissions
- **Mobile Money Access:** 70%+ of Nigerians use mobile money (MTN, Airtel, etc.)
- **Financial Inclusion:** Reach unbanked/underbanked populations

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (90% coverage)
- [ ] Integration tests passing
- [ ] Batch processing tested with 10K+ records
- [ ] Mobile money mock services operational
- [ ] API documentation complete
- [ ] Code reviewed and merged
- [ ] Sprint demo to product owner

---

## Sprint Backlog Items

---

# EPIC-19: Batch Processing

## FEATURE-19.1: Batch Payment Upload & Validation

### 📘 User Story: US-27.1.1 - Batch Payment Upload & Validation

**Story ID:** US-27.1.1
**Feature:** FEATURE-19.1 (Batch Payment Upload & Validation)
**Epic:** EPIC-19 (Batch Processing)

**Story Points:** 10
**Priority:** P1 (High - Business Efficiency)
**Sprint:** Sprint 27
**Status:** 🔄 Not Started

---

#### User Story

```
As a business owner
I want to upload bulk payments via CSV/Excel file
So that I can pay multiple recipients (employees, vendors) efficiently in one operation
```

---

#### Business Value

**Value Statement:**
Batch payment upload eliminates manual entry for bulk payments. A business paying 500 employees manually would take 8+ hours; with batch upload, it takes 5 minutes. This feature is critical for payroll, vendor payments, and commission distribution.

**Impact:**
- **Time Savings:** 95%+ reduction in payment processing time
- **Error Reduction:** Eliminate manual entry errors
- **Scalability:** Handle 10K+ payments per batch
- **User Satisfaction:** #1 requested feature by business customers

**Success Criteria:**
- Upload and validate 10,000 payments in < 30 seconds
- Detect and report validation errors clearly
- Support CSV and Excel (.xlsx) formats
- Provide downloadable error report
- 100% data integrity (no data loss during upload)

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Upload CSV file with payment data
- [ ] **AC2:** Upload Excel (.xlsx) file with payment data
- [ ] **AC3:** Parse and validate file format (headers, columns)
- [ ] **AC4:** Support batch size up to 10,000 records
- [ ] **AC5:** Validate recipient account numbers (10 digits)
- [ ] **AC6:** Validate payment amounts (> 0, <= user balance)
- [ ] **AC7:** Validate payment descriptions (max 255 chars)
- [ ] **AC8:** Validate bank codes for bank transfers
- [ ] **AC9:** Validate mobile money numbers for MoMo transfers
- [ ] **AC10:** Check total batch amount <= user wallet balance
- [ ] **AC11:** Detect duplicate recipients in same batch
- [ ] **AC12:** Flag invalid account numbers
- [ ] **AC13:** Flag invalid amounts (negative, zero, > limit)
- [ ] **AC14:** Return detailed validation errors per row
- [ ] **AC15:** Generate error report (CSV) for failed records
- [ ] **AC16:** Store batch metadata (file name, upload time, user)
- [ ] **AC17:** Generate unique batch reference ID
- [ ] **AC18:** Preview first 10 rows before processing
- [ ] **AC19:** Display batch summary (total amount, count, fees)
- [ ] **AC20:** Support payment types: bank transfer, mobile money, wallet

**Security:**
- [ ] **AC21:** Validate file size (max 5MB)
- [ ] **AC22:** Validate file type (CSV, XLSX only)
- [ ] **AC23:** Scan for malicious content
- [ ] **AC24:** Rate limit: 5 uploads per hour per user
- [ ] **AC25:** Require authentication for upload
- [ ] **AC26:** Audit log all upload attempts

**Non-Functional:**
- [ ] **AC27:** Upload + validation < 30 seconds (10K records)
- [ ] **AC28:** Support concurrent uploads (100 users)
- [ ] **AC29:** Store uploaded files for 30 days
- [ ] **AC30:** Handle UTF-8 encoding for international names

---

#### Technical Specifications

**CSV/Excel Format:**

```csv
recipient_name,recipient_account,recipient_bank,amount,description,payment_type
John Doe,0123456789,GTB,50000,Salary January 2025,bank_transfer
Jane Smith,0234567890,ACCESS,75000,Salary January 2025,bank_transfer
MTN User,2348012345678,MTN,10000,Commission Payment,mobile_money
```

**Required Columns:**
- `recipient_name` (string, max 100 chars)
- `recipient_account` (string, 10-15 digits for bank, 11-13 for mobile)
- `recipient_bank` (string, bank code or "MTN", "AIRTEL", "MPESA")
- `amount` (number, in kobo/cents)
- `description` (string, max 255 chars)
- `payment_type` (enum: bank_transfer, mobile_money, wallet)

**Batch Upload Service:**

```typescript
interface BatchPaymentRow {
  row_number: number;
  recipient_name: string;
  recipient_account: string;
  recipient_bank: string;
  amount: number;  // In kobo
  description: string;
  payment_type: 'bank_transfer' | 'mobile_money' | 'wallet';
}

interface BatchUploadResult {
  batch_id: string;
  file_name: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  total_amount: number;
  validation_errors: ValidationError[];
  batch_summary: {
    bank_transfers: number;
    mobile_money: number;
    wallet_transfers: number;
  };
  status: 'PENDING_APPROVAL' | 'VALIDATION_FAILED';
}

interface ValidationError {
  row_number: number;
  field: string;
  error_code: string;
  error_message: string;
  provided_value: string;
}

@Injectable()
export class BatchUploadService {
  constructor(
    @InjectRepository(BatchPayment)
    private batchRepository: Repository<BatchPayment>,
    @InjectRepository(BatchPaymentItem)
    private batchItemRepository: Repository<BatchPaymentItem>,
    private walletService: WalletService,
  ) {}

  /**
   * Upload and validate batch payment file
   */
  async uploadBatchFile(
    userId: string,
    file: Express.Multer.File,
    fileType: 'csv' | 'xlsx'
  ): Promise<BatchUploadResult> {
    // Parse file
    const rows = await this.parseFile(file, fileType);

    // Validate rows
    const { validRows, invalidRows, errors } = await this.validateRows(rows, userId);

    // Calculate totals
    const totalAmount = validRows.reduce((sum, row) => sum + row.amount, 0);

    // Check user balance
    const userWallet = await this.walletService.getWallet(userId, 'NGN');
    if (totalAmount > userWallet.available_balance) {
      throw new BadRequestException(
        `Insufficient balance. Required: ₦${totalAmount / 100}, Available: ₦${userWallet.available_balance / 100}`
      );
    }

    // Create batch record
    const batch = await this.batchRepository.save({
      user_id: userId,
      batch_id: `BATCH-${Date.now()}-${uuidv4().substring(0, 8)}`,
      file_name: file.originalname,
      file_size: file.size,
      total_rows: rows.length,
      valid_rows: validRows.length,
      invalid_rows: invalidRows.length,
      total_amount: totalAmount,
      status: invalidRows.length > 0 ? 'VALIDATION_FAILED' : 'PENDING_APPROVAL',
      uploaded_at: new Date(),
    });

    // Save valid items
    for (const row of validRows) {
      await this.batchItemRepository.save({
        batch_id: batch.id,
        row_number: row.row_number,
        recipient_name: row.recipient_name,
        recipient_account: row.recipient_account,
        recipient_bank: row.recipient_bank,
        amount: row.amount,
        description: row.description,
        payment_type: row.payment_type,
        status: 'PENDING',
      });
    }

    return {
      batch_id: batch.batch_id,
      file_name: file.originalname,
      total_rows: rows.length,
      valid_rows: validRows.length,
      invalid_rows: invalidRows.length,
      total_amount: totalAmount,
      validation_errors: errors,
      batch_summary: {
        bank_transfers: validRows.filter(r => r.payment_type === 'bank_transfer').length,
        mobile_money: validRows.filter(r => r.payment_type === 'mobile_money').length,
        wallet_transfers: validRows.filter(r => r.payment_type === 'wallet').length,
      },
      status: invalidRows.length > 0 ? 'VALIDATION_FAILED' : 'PENDING_APPROVAL',
    };
  }

  /**
   * Parse CSV/Excel file
   */
  private async parseFile(
    file: Express.Multer.File,
    fileType: 'csv' | 'xlsx'
  ): Promise<BatchPaymentRow[]> {
    if (fileType === 'csv') {
      return this.parseCSV(file.buffer);
    } else {
      return this.parseExcel(file.buffer);
    }
  }

  /**
   * Parse CSV file
   */
  private async parseCSV(buffer: Buffer): Promise<BatchPaymentRow[]> {
    const csv = require('csv-parser');
    const { Readable } = require('stream');

    const rows: BatchPaymentRow[] = [];
    let rowNumber = 1;

    return new Promise((resolve, reject) => {
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (data: any) => {
          rowNumber++;
          rows.push({
            row_number: rowNumber,
            recipient_name: data.recipient_name?.trim(),
            recipient_account: data.recipient_account?.trim(),
            recipient_bank: data.recipient_bank?.trim(),
            amount: parseFloat(data.amount),
            description: data.description?.trim(),
            payment_type: data.payment_type?.trim(),
          });
        })
        .on('end', () => resolve(rows))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Parse Excel file
   */
  private async parseExcel(buffer: Buffer): Promise<BatchPaymentRow[]> {
    const xlsx = require('xlsx');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = xlsx.utils.sheet_to_json(sheet);

    return jsonData.map((row: any, index: number) => ({
      row_number: index + 2, // +2 because row 1 is headers, arrays are 0-indexed
      recipient_name: row.recipient_name?.toString().trim(),
      recipient_account: row.recipient_account?.toString().trim(),
      recipient_bank: row.recipient_bank?.toString().trim(),
      amount: parseFloat(row.amount),
      description: row.description?.toString().trim(),
      payment_type: row.payment_type?.toString().trim(),
    }));
  }

  /**
   * Validate rows
   */
  private async validateRows(
    rows: BatchPaymentRow[],
    userId: string
  ): Promise<{
    validRows: BatchPaymentRow[];
    invalidRows: BatchPaymentRow[];
    errors: ValidationError[];
  }> {
    const validRows: BatchPaymentRow[] = [];
    const invalidRows: BatchPaymentRow[] = [];
    const errors: ValidationError[] = [];

    // Check for duplicate accounts in batch
    const accountsSeen = new Set<string>();

    for (const row of rows) {
      const rowErrors: ValidationError[] = [];

      // Validate recipient_name
      if (!row.recipient_name || row.recipient_name.length === 0) {
        rowErrors.push({
          row_number: row.row_number,
          field: 'recipient_name',
          error_code: 'REQUIRED',
          error_message: 'Recipient name is required',
          provided_value: row.recipient_name,
        });
      } else if (row.recipient_name.length > 100) {
        rowErrors.push({
          row_number: row.row_number,
          field: 'recipient_name',
          error_code: 'TOO_LONG',
          error_message: 'Recipient name must be <= 100 characters',
          provided_value: row.recipient_name,
        });
      }

      // Validate recipient_account
      if (!row.recipient_account || row.recipient_account.length === 0) {
        rowErrors.push({
          row_number: row.row_number,
          field: 'recipient_account',
          error_code: 'REQUIRED',
          error_message: 'Recipient account is required',
          provided_value: row.recipient_account,
        });
      } else if (!/^\d{10,15}$/.test(row.recipient_account)) {
        rowErrors.push({
          row_number: row.row_number,
          field: 'recipient_account',
          error_code: 'INVALID_FORMAT',
          error_message: 'Account must be 10-15 digits',
          provided_value: row.recipient_account,
        });
      }

      // Validate amount
      if (!row.amount || isNaN(row.amount)) {
        rowErrors.push({
          row_number: row.row_number,
          field: 'amount',
          error_code: 'INVALID_NUMBER',
          error_message: 'Amount must be a valid number',
          provided_value: row.amount?.toString(),
        });
      } else if (row.amount <= 0) {
        rowErrors.push({
          row_number: row.row_number,
          field: 'amount',
          error_code: 'INVALID_AMOUNT',
          error_message: 'Amount must be greater than 0',
          provided_value: row.amount.toString(),
        });
      } else if (row.amount > 1000000000) {
        // Max ₦10,000 per transaction
        rowErrors.push({
          row_number: row.row_number,
          field: 'amount',
          error_code: 'EXCEEDS_LIMIT',
          error_message: 'Amount exceeds maximum (₦10,000)',
          provided_value: row.amount.toString(),
        });
      }

      // Validate payment_type
      if (!['bank_transfer', 'mobile_money', 'wallet'].includes(row.payment_type)) {
        rowErrors.push({
          row_number: row.row_number,
          field: 'payment_type',
          error_code: 'INVALID_TYPE',
          error_message: 'Payment type must be: bank_transfer, mobile_money, or wallet',
          provided_value: row.payment_type,
        });
      }

      // Check for duplicates
      const accountKey = `${row.recipient_account}-${row.recipient_bank}`;
      if (accountsSeen.has(accountKey)) {
        rowErrors.push({
          row_number: row.row_number,
          field: 'recipient_account',
          error_code: 'DUPLICATE',
          error_message: 'Duplicate recipient in batch',
          provided_value: row.recipient_account,
        });
      } else {
        accountsSeen.add(accountKey);
      }

      // Categorize row
      if (rowErrors.length > 0) {
        invalidRows.push(row);
        errors.push(...rowErrors);
      } else {
        validRows.push(row);
      }
    }

    return { validRows, invalidRows, errors };
  }
}
```

**Database Schema:**

```sql
-- Batch payments table
CREATE TABLE batch_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  batch_id VARCHAR(100) UNIQUE NOT NULL,

  -- File details
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,  -- In bytes

  -- Batch statistics
  total_rows INTEGER NOT NULL,
  valid_rows INTEGER NOT NULL,
  invalid_rows INTEGER NOT NULL,
  processed_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  total_amount BIGINT NOT NULL,  -- In kobo

  -- Status
  status VARCHAR(30) NOT NULL,  -- PENDING_APPROVAL, APPROVED, PROCESSING, COMPLETED, FAILED
  uploaded_at TIMESTAMP NOT NULL,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Metadata
  rejection_reason TEXT,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_batch_payments_user_id (user_id),
  INDEX idx_batch_payments_batch_id (batch_id),
  INDEX idx_batch_payments_status (status),
  INDEX idx_batch_payments_uploaded_at (uploaded_at)
);

-- Batch payment items table
CREATE TABLE batch_payment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batch_payments(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,

  -- Recipient details
  recipient_name VARCHAR(100) NOT NULL,
  recipient_account VARCHAR(20) NOT NULL,
  recipient_bank VARCHAR(50) NOT NULL,
  amount BIGINT NOT NULL,  -- In kobo
  description VARCHAR(255),
  payment_type VARCHAR(20) NOT NULL,  -- bank_transfer, mobile_money, wallet

  -- Processing
  status VARCHAR(20) NOT NULL,  -- PENDING, PROCESSING, COMPLETED, FAILED
  transaction_id UUID REFERENCES transactions(id),
  processed_at TIMESTAMP,
  failure_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_batch_items_batch_id (batch_id),
  INDEX idx_batch_items_status (status),
  INDEX idx_batch_items_transaction_id (transaction_id)
);
```

**API Endpoints:**

```typescript
@Controller('api/v1/batch-payments')
@UseGuards(JwtAuthGuard)
export class BatchPaymentsController {
  constructor(private batchUploadService: BatchUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBatch(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ): Promise<BatchUploadResult> {
    const userId = req.user.id;

    // Detect file type
    const fileType = file.originalname.endsWith('.csv') ? 'csv' : 'xlsx';

    return await this.batchUploadService.uploadBatchFile(userId, file, fileType);
  }

  @Get(':batchId')
  async getBatchDetails(
    @Param('batchId') batchId: string,
    @Req() req: any
  ): Promise<any> {
    // Get batch details with items
    return await this.batchUploadService.getBatchDetails(batchId, req.user.id);
  }

  @Get(':batchId/errors')
  async downloadErrorReport(
    @Param('batchId') batchId: string,
    @Res() res: Response
  ): Promise<void> {
    const csv = await this.batchUploadService.generateErrorReport(batchId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=batch-errors-${batchId}.csv`);
    res.send(csv);
  }
}
```

---

#### Testing Requirements

**Unit Tests (20 tests):**
- Parse CSV file correctly
- Parse Excel file correctly
- Validate recipient name (required, max length)
- Validate recipient account (format, length)
- Validate amount (positive, within limit)
- Validate payment type (enum)
- Detect duplicate recipients
- Calculate batch totals
- Check user balance sufficiency
- Handle empty file
- Handle malformed CSV
- Handle missing columns
- Handle invalid data types
- Generate validation errors
- Create batch record
- Save batch items
- Generate error report CSV
- Handle file size limits
- UTF-8 encoding support
- Concurrent upload handling

**Integration Tests (10 tests):**
- Full upload workflow (CSV → validation → storage)
- Full upload workflow (Excel → validation → storage)
- Upload with validation errors
- Upload exceeding user balance
- Download error report
- Retrieve batch details
- Multiple concurrent uploads
- Large file upload (10K records)
- Rate limiting enforcement
- Authentication requirement

**E2E Tests (5 tests):**
- Upload valid batch → approve → process
- Upload batch with errors → fix → re-upload
- Upload batch → reject
- View batch details and items
- Download error report

---

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] CSV and Excel parsing working
- [ ] Validation logic comprehensive (30+ validation rules)
- [ ] All tests passing (35+ tests)
- [ ] Error reporting clear and actionable
- [ ] API documentation complete
- [ ] Handles 10K+ records in < 30 seconds
- [ ] Code reviewed and merged

---

### 📘 User Story: US-27.1.2 - Batch Approval Workflow & Maker-Checker

**Story ID:** US-27.1.2
**Feature:** FEATURE-19.1 (Batch Payment Upload & Validation)
**Epic:** EPIC-19 (Batch Processing)

**Story Points:** 8
**Priority:** P1 (High - Risk Management)
**Sprint:** Sprint 27
**Status:** 🔄 Not Started

---

#### User Story

```
As a finance manager
I want maker-checker approval for batch payments
So that we prevent unauthorized or fraudulent bulk payments
```

---

#### Business Value

**Value Statement:**
Maker-checker (dual control) is a critical financial control requiring two people to approve high-value transactions. This prevents fraud, errors, and unauthorized payments. Required by most corporate finance policies and regulatory frameworks.

**Impact:**
- **Fraud Prevention:** Requires collusion (2+ people) to commit fraud
- **Error Reduction:** Second pair of eyes catches mistakes
- **Compliance:** Meets SOX, internal audit requirements
- **Risk Management:** Protects company from unauthorized payments

**Success Criteria:**
- Maker cannot approve own batch
- Clear approval trail (who, when, why)
- Support multi-level approval (amount-based)
- Allow rejection with reason
- Notify stakeholders on approval/rejection

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Batch creator (maker) cannot approve own batch
- [ ] **AC2:** Assign batch to approver (checker)
- [ ] **AC3:** Approver can view batch details and items
- [ ] **AC4:** Approver can approve batch
- [ ] **AC5:** Approver can reject batch with reason
- [ ] **AC6:** Amount-based approval rules (e.g., > ₦1M requires 2 approvers)
- [ ] **AC7:** Email notification to approver on batch submission
- [ ] **AC8:** Email notification to maker on approval
- [ ] **AC9:** Email notification to maker on rejection
- [ ] **AC10:** Display pending batches for approver
- [ ] **AC11:** Filter batches by status (pending, approved, rejected)
- [ ] **AC12:** Approval history log (who approved, when)
- [ ] **AC13:** Rejection history log (who rejected, reason)
- [ ] **AC14:** Bulk approve multiple batches (if < threshold)
- [ ] **AC15:** Export approval report (PDF)
- [ ] **AC16:** Set approval expiry (e.g., auto-reject after 24 hours)
- [ ] **AC17:** Dashboard showing pending approvals count
- [ ] **AC18:** Mobile push notification for pending approvals
- [ ] **AC19:** Approval delegation (approver assigns to another)
- [ ] **AC20:** Role-based access (only finance managers can approve)

**Security:**
- [ ] **AC21:** Verify approver has sufficient permissions
- [ ] **AC22:** Prevent maker from impersonating approver
- [ ] **AC23:** Audit log all approval/rejection actions
- [ ] **AC24:** Require 2FA for approval > ₦5M
- [ ] **AC25:** Session timeout for approval page (15 minutes)

**Non-Functional:**
- [ ] **AC26:** Approval action < 2 seconds
- [ ] **AC27:** Support 100+ pending batches per approver
- [ ] **AC28:** Email notifications sent < 5 seconds
- [ ] **AC29:** Approval history retained for 7 years

---

#### Technical Specifications

**Approval Workflow Service:**

```typescript
interface ApprovalRule {
  min_amount: number;  // Minimum batch amount for this rule
  max_amount: number;  // Maximum batch amount
  required_approvers: number;  // Number of approvers needed
  approver_roles: string[];  // Roles that can approve
}

const APPROVAL_RULES: ApprovalRule[] = [
  {
    min_amount: 0,
    max_amount: 100000000,  // Up to ₦1M
    required_approvers: 1,
    approver_roles: ['finance_manager', 'admin'],
  },
  {
    min_amount: 100000000,  // ₦1M - ₦5M
    max_amount: 500000000,
    required_approvers: 2,
    approver_roles: ['finance_manager', 'admin'],
  },
  {
    min_amount: 500000000,  // > ₦5M
    max_amount: Infinity,
    required_approvers: 3,
    approver_roles: ['finance_director', 'ceo', 'admin'],
  },
];

interface ApprovalAction {
  batch_id: string;
  approver_id: string;
  approver_name: string;
  action: 'APPROVE' | 'REJECT';
  reason?: string;
  approved_at: Date;
}

@Injectable()
export class BatchApprovalService {
  constructor(
    @InjectRepository(BatchPayment)
    private batchRepository: Repository<BatchPayment>,
    @InjectRepository(BatchApproval)
    private approvalRepository: Repository<BatchApproval>,
    private notificationService: NotificationService,
  ) {}

  /**
   * Submit batch for approval
   */
  async submitForApproval(
    batchId: string,
    userId: string
  ): Promise<{ success: boolean; required_approvers: number }> {
    const batch = await this.batchRepository.findOne({ where: { batch_id: batchId, user_id: userId } });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Batch is not in pending approval state');
    }

    // Determine approval requirements
    const approvalRule = this.getApprovalRule(batch.total_amount);

    batch.status = 'AWAITING_APPROVAL';
    batch.updated_at = new Date();
    await this.batchRepository.save(batch);

    // Create approval records
    for (let i = 0; i < approvalRule.required_approvers; i++) {
      await this.approvalRepository.save({
        batch_id: batch.id,
        approval_level: i + 1,
        required_role: approvalRule.approver_roles[i % approvalRule.approver_roles.length],
        status: 'PENDING',
      });
    }

    // Notify approvers
    await this.notificationService.notifyApprovers(batch, approvalRule);

    return {
      success: true,
      required_approvers: approvalRule.required_approvers,
    };
  }

  /**
   * Approve batch
   */
  async approveBatch(
    batchId: string,
    approverId: string,
    approverRole: string
  ): Promise<{ success: boolean; status: string }> {
    const batch = await this.batchRepository.findOne({ where: { batch_id: batchId } });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    // Prevent maker from approving own batch
    if (batch.user_id === approverId) {
      throw new ForbiddenException('You cannot approve your own batch');
    }

    // Find pending approval for this user's role
    const pendingApproval = await this.approvalRepository.findOne({
      where: {
        batch_id: batch.id,
        status: 'PENDING',
        required_role: approverRole,
      },
    });

    if (!pendingApproval) {
      throw new ForbiddenException('No pending approval found for your role');
    }

    // Mark approval as approved
    pendingApproval.status = 'APPROVED';
    pendingApproval.approved_by = approverId;
    pendingApproval.approved_at = new Date();
    await this.approvalRepository.save(pendingApproval);

    // Check if all approvals are complete
    const allApprovals = await this.approvalRepository.find({
      where: { batch_id: batch.id },
    });

    const allApproved = allApprovals.every(a => a.status === 'APPROVED');

    if (allApproved) {
      batch.status = 'APPROVED';
      batch.approved_at = new Date();
      batch.approved_by = approverId;
      await this.batchRepository.save(batch);

      // Notify maker
      await this.notificationService.notifyMaker(batch, 'APPROVED');

      return { success: true, status: 'APPROVED' };
    } else {
      return { success: true, status: 'PARTIALLY_APPROVED' };
    }
  }

  /**
   * Reject batch
   */
  async rejectBatch(
    batchId: string,
    approverId: string,
    reason: string
  ): Promise<{ success: boolean }> {
    const batch = await this.batchRepository.findOne({ where: { batch_id: batchId } });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    // Update batch status
    batch.status = 'REJECTED';
    batch.rejection_reason = reason;
    batch.updated_at = new Date();
    await this.batchRepository.save(batch);

    // Mark all approvals as rejected
    await this.approvalRepository.update(
      { batch_id: batch.id, status: 'PENDING' },
      { status: 'REJECTED', approved_by: approverId, approved_at: new Date() }
    );

    // Notify maker
    await this.notificationService.notifyMaker(batch, 'REJECTED', reason);

    return { success: true };
  }

  /**
   * Get approval rule for amount
   */
  private getApprovalRule(amount: number): ApprovalRule {
    for (const rule of APPROVAL_RULES) {
      if (amount >= rule.min_amount && amount < rule.max_amount) {
        return rule;
      }
    }

    // Default to highest rule
    return APPROVAL_RULES[APPROVAL_RULES.length - 1];
  }

  /**
   * Get pending batches for approver
   */
  async getPendingBatches(approverId: string, approverRole: string): Promise<BatchPayment[]> {
    // Find batches with pending approvals for this role
    const pendingApprovals = await this.approvalRepository.find({
      where: {
        status: 'PENDING',
        required_role: approverRole,
      },
      relations: ['batch'],
    });

    return pendingApprovals.map(a => a.batch);
  }
}
```

**Database Schema:**

```sql
-- Batch approvals table
CREATE TABLE batch_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batch_payments(id) ON DELETE CASCADE,

  -- Approval details
  approval_level INTEGER NOT NULL,  -- 1 = first approver, 2 = second, etc.
  required_role VARCHAR(50) NOT NULL,  -- finance_manager, finance_director, ceo
  status VARCHAR(20) NOT NULL,  -- PENDING, APPROVED, REJECTED

  -- Approver
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_batch_approvals_batch_id (batch_id),
  INDEX idx_batch_approvals_status (status),
  INDEX idx_batch_approvals_role (required_role)
);
```

---

#### Testing Requirements

**Unit Tests (15 tests):**
- Submit batch for approval
- Determine approval rule based on amount
- Prevent maker from approving own batch
- Approve batch (single approver)
- Approve batch (multi-level approval)
- Reject batch with reason
- Get pending batches for approver
- Check all approvals complete
- Partial approval state
- Approval delegation
- Expired approval (auto-reject)
- Role-based approval permissions
- 2FA requirement for high amounts
- Notification triggers
- Approval history log

**Integration Tests (8 tests):**
- Full approval workflow (submit → approve → approved)
- Multi-level approval workflow
- Rejection workflow
- Maker attempts to approve own batch (forbidden)
- Concurrent approvals
- Approval expiry
- Notification delivery
- Approval report generation

**E2E Tests (5 tests):**
- Submit batch → approver notified → approves → maker notified
- Submit batch → approver rejects → maker notified with reason
- Multi-level approval (₦5M batch requires 3 approvers)
- View pending approvals dashboard
- Approval delegation workflow

---

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] Maker-checker enforcement working
- [ ] Multi-level approval rules implemented
- [ ] All tests passing (28+ tests)
- [ ] Notification system integrated
- [ ] Approval history audit trail
- [ ] Code reviewed and merged

---

## FEATURE-19.2: Batch Execution & Scheduling

### 📘 User Story: US-27.2.1 - Scheduled Batch Execution & Payout Batching

**Story ID:** US-27.2.1
**Feature:** FEATURE-19.2 (Batch Execution & Scheduling)
**Epic:** EPIC-19 (Batch Processing)

**Story Points:** 8
**Priority:** P1 (High - Operational Efficiency)
**Sprint:** Sprint 27
**Status:** 🔄 Not Started

---

#### User Story

```
As a payroll administrator
I want to schedule batch payments for future execution
So that I can prepare payroll in advance and execute on payday automatically
```

---

#### Business Value

**Value Statement:**
Scheduled batch execution allows businesses to prepare payments in advance and execute automatically at specified time (e.g., salary on 25th of month). This reduces manual intervention, ensures timely payments, and improves operational efficiency.

**Impact:**
- **Time Savings:** Set and forget - no manual execution needed
- **Accuracy:** Payments execute exactly on time (midnight on payday)
- **Reliability:** No human errors from manual execution
- **Peace of Mind:** Payroll prepared days in advance

**Success Criteria:**
- Schedule batch for future date/time
- Execute batch automatically via cron job
- Process 10K+ payments in < 5 minutes
- Retry failed payments automatically
- Email confirmation on completion

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Schedule batch for future execution (date + time)
- [ ] **AC2:** Validate scheduled time is in future
- [ ] **AC3:** Support recurring schedules (weekly, monthly)
- [ ] **AC4:** Cron job checks for scheduled batches every minute
- [ ] **AC5:** Execute batch at scheduled time (±1 minute accuracy)
- [ ] **AC6:** Deduct total amount from user wallet before processing
- [ ] **AC7:** Process batch items sequentially (prevent race conditions)
- [ ] **AC8:** Update item status (PROCESSING → COMPLETED/FAILED)
- [ ] **AC9:** Retry failed items (max 3 attempts)
- [ ] **AC10:** Handle insufficient balance gracefully
- [ ] **AC11:** Handle individual payment failures
- [ ] **AC12:** Generate batch completion report
- [ ] **AC13:** Email user on batch start
- [ ] **AC14:** Email user on batch completion
- [ ] **AC15:** Email user on batch failure
- [ ] **AC16:** Cancel scheduled batch before execution
- [ ] **AC17:** Reschedule batch to different time
- [ ] **AC18:** View scheduled batches (upcoming)
- [ ] **AC19:** Dashboard showing batch execution history
- [ ] **AC20:** Export execution report (CSV, PDF)

**Security:**
- [ ] **AC21:** Verify user balance before execution
- [ ] **AC22:** Lock wallet during batch processing
- [ ] **AC23:** Audit log all executions
- [ ] **AC24:** Alert on execution failures
- [ ] **AC25:** Prevent duplicate execution

**Non-Functional:**
- [ ] **AC26:** Process 10,000 payments in < 5 minutes
- [ ] **AC27:** Cron job reliability 99.9%+
- [ ] **AC28:** Support 1000+ concurrent batches
- [ ] **AC29:** Transaction atomicity (all-or-nothing option)

---

#### Technical Specifications

**Batch Execution Service:**

```typescript
interface BatchExecutionResult {
  batch_id: string;
  total_items: number;
  successful: number;
  failed: number;
  execution_time_ms: number;
  failed_items: {
    row_number: number;
    recipient: string;
    amount: number;
    error: string;
  }[];
}

@Injectable()
export class BatchExecutionService {
  constructor(
    @InjectRepository(BatchPayment)
    private batchRepository: Repository<BatchPayment>,
    @InjectRepository(BatchPaymentItem)
    private batchItemRepository: Repository<BatchPaymentItem>,
    private transactionService: TransactionService,
    private walletService: WalletService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Schedule batch for future execution
   */
  async scheduleBatch(
    batchId: string,
    scheduledAt: Date,
    recurring?: 'WEEKLY' | 'MONTHLY'
  ): Promise<{ success: boolean }> {
    const batch = await this.batchRepository.findOne({ where: { batch_id: batchId } });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (batch.status !== 'APPROVED') {
      throw new BadRequestException('Only approved batches can be scheduled');
    }

    // Validate scheduled time is in future
    if (scheduledAt <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    batch.scheduled_at = scheduledAt;
    batch.status = 'SCHEDULED';
    batch.updated_at = new Date();

    await this.batchRepository.save(batch);

    return { success: true };
  }

  /**
   * Execute batch (called by cron job)
   */
  async executeBatch(batchId: string): Promise<BatchExecutionResult> {
    const startTime = Date.now();

    const batch = await this.batchRepository.findOne({ where: { batch_id: batchId } });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    // Update status
    batch.status = 'PROCESSING';
    batch.started_at = new Date();
    await this.batchRepository.save(batch);

    // Deduct total amount from user wallet
    try {
      await this.walletService.hold(batch.user_id, 'NGN', batch.total_amount);
    } catch (error) {
      batch.status = 'FAILED';
      batch.completed_at = new Date();
      await this.batchRepository.save(batch);

      throw new BadRequestException('Insufficient balance for batch execution');
    }

    // Get all batch items
    const items = await this.batchItemRepository.find({
      where: { batch_id: batch.id, status: 'PENDING' },
    });

    let successful = 0;
    let failed = 0;
    const failedItems: any[] = [];

    // Process items sequentially
    for (const item of items) {
      try {
        item.status = 'PROCESSING';
        await this.batchItemRepository.save(item);

        // Create transaction
        const transaction = await this.processPaymentItem(batch.user_id, item);

        item.status = 'COMPLETED';
        item.transaction_id = transaction.id;
        item.processed_at = new Date();
        await this.batchItemRepository.save(item);

        successful++;
      } catch (error) {
        item.status = 'FAILED';
        item.failure_reason = error.message;
        item.processed_at = new Date();
        await this.batchItemRepository.save(item);

        failed++;
        failedItems.push({
          row_number: item.row_number,
          recipient: item.recipient_name,
          amount: item.amount,
          error: error.message,
        });
      }
    }

    // Release wallet hold
    await this.walletService.releaseHold(batch.user_id, 'NGN', batch.total_amount);

    // Update batch
    batch.status = failed > 0 ? 'PARTIAL_SUCCESS' : 'COMPLETED';
    batch.processed_rows = successful;
    batch.failed_rows = failed;
    batch.completed_at = new Date();
    await this.batchRepository.save(batch);

    const executionTime = Date.now() - startTime;

    // Send notification
    await this.notificationService.notifyBatchCompletion(batch, successful, failed);

    return {
      batch_id: batchId,
      total_items: items.length,
      successful,
      failed,
      execution_time_ms: executionTime,
      failed_items: failedItems,
    };
  }

  /**
   * Process individual payment item
   */
  private async processPaymentItem(
    userId: string,
    item: BatchPaymentItem
  ): Promise<Transaction> {
    switch (item.payment_type) {
      case 'bank_transfer':
        return await this.transactionService.createBankTransfer({
          user_id: userId,
          recipient_account: item.recipient_account,
          recipient_bank: item.recipient_bank,
          recipient_name: item.recipient_name,
          amount: item.amount,
          description: item.description,
        });

      case 'mobile_money':
        return await this.transactionService.createMobileMoneyTransfer({
          user_id: userId,
          recipient_phone: item.recipient_account,
          provider: item.recipient_bank,  // MTN, AIRTEL, MPESA
          amount: item.amount,
          description: item.description,
        });

      case 'wallet':
        return await this.transactionService.createWalletTransfer({
          from_user_id: userId,
          to_user_id: item.recipient_account,  // User ID for wallet transfers
          amount: item.amount,
          description: item.description,
        });

      default:
        throw new Error(`Unsupported payment type: ${item.payment_type}`);
    }
  }

  /**
   * Cron job to check for scheduled batches
   */
  @Cron('* * * * *')  // Every minute
  async checkScheduledBatches(): Promise<void> {
    const now = new Date();

    // Find batches scheduled for now (±1 minute)
    const scheduledBatches = await this.batchRepository.find({
      where: {
        status: 'SCHEDULED',
        scheduled_at: LessThanOrEqual(now),
      },
    });

    for (const batch of scheduledBatches) {
      try {
        await this.executeBatch(batch.batch_id);
      } catch (error) {
        console.error(`Failed to execute batch ${batch.batch_id}:`, error);

        // Update batch status
        batch.status = 'FAILED';
        batch.completed_at = new Date();
        await this.batchRepository.save(batch);
      }
    }
  }
}
```

**Payout Batching (Optimization):**

```typescript
/**
 * Batch similar payouts to same provider to reduce fees
 * Example: 100 MTN MoMo payments → 1 bulk API call instead of 100
 */
interface PayoutBatch {
  provider: string;  // MTN, AIRTEL, BANK_GTB, etc.
  total_amount: number;
  item_count: number;
  items: BatchPaymentItem[];
}

@Injectable()
export class PayoutBatchingService {
  /**
   * Group payment items by provider for bulk processing
   */
  groupByProvider(items: BatchPaymentItem[]): PayoutBatch[] {
    const groups = new Map<string, BatchPaymentItem[]>();

    for (const item of items) {
      const key = `${item.payment_type}-${item.recipient_bank}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(item);
    }

    const batches: PayoutBatch[] = [];

    for (const [provider, groupItems] of groups.entries()) {
      batches.push({
        provider,
        total_amount: groupItems.reduce((sum, item) => sum + item.amount, 0),
        item_count: groupItems.length,
        items: groupItems,
      });
    }

    return batches;
  }

  /**
   * Execute payout batch (bulk API call)
   */
  async executeBulkPayout(payoutBatch: PayoutBatch): Promise<void> {
    // Call provider bulk API
    // Example: MTN MoMo bulk disbursement API
    // Saves API calls and reduces fees
  }
}
```

---

#### Testing Requirements

**Unit Tests (18 tests):**
- Schedule batch for future
- Validate scheduled time (must be future)
- Execute batch successfully
- Execute batch with insufficient balance
- Process bank transfer item
- Process mobile money item
- Process wallet transfer item
- Handle individual payment failure
- Retry failed payments (max 3 attempts)
- Calculate execution time
- Update batch status correctly
- Send completion notification
- Cancel scheduled batch
- Reschedule batch
- Cron job finds scheduled batches
- Wallet hold/release
- Payout batching (group by provider)
- Bulk API call optimization

**Integration Tests (10 tests):**
- Full scheduled execution (schedule → cron → execute)
- Execute 10K+ payments
- Partial success handling
- Concurrent batch execution
- Wallet locking during execution
- Failed payment retry
- Notification delivery
- Execution report generation
- Recurring batch schedule
- Cancel before execution

**E2E Tests (5 tests):**
- Schedule payroll batch → executes on payday
- Batch execution with mixed success/failure
- View execution history
- Download execution report
- Recurring monthly payroll

---

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] Scheduled execution working
- [ ] Cron job reliable
- [ ] All tests passing (33+ tests)
- [ ] Process 10K payments in < 5 minutes
- [ ] Payout batching optimization implemented
- [ ] Code reviewed and merged

---

# EPIC-20: Mobile Money

## FEATURE-20.1: Mock Mobile Money Providers

### 📘 User Story: US-27.3.1 - Mock MTN Mobile Money (MoMo) Service

**Story ID:** US-27.3.1
**Feature:** FEATURE-20.1 (Mock Mobile Money Providers)
**Epic:** EPIC-20 (Mobile Money)

**Story Points:** 6
**Priority:** P1 (High - Market Reach)
**Sprint:** Sprint 27
**Status:** 🔄 Not Started

---

#### User Story

```
As a developer
I want a mock MTN Mobile Money service
So that I can test mobile money deposits/withdrawals without incurring real provider fees during development
```

---

#### Business Value

**Value Statement:**
Mock MTN MoMo service saves $5K-10K in integration and transaction fees during 12-month development. MTN Mobile Money is the largest mobile money provider in Nigeria (40%+ market share). Mock service enables full feature testing without external dependencies.

**Impact:**
- **Cost Savings:** $5K-10K saved during development
- **Development Speed:** No waiting for provider approvals/integrations
- **Testing Freedom:** Unlimited test transactions
- **Market Reach:** MTN MoMo has 40M+ users in Nigeria

**Success Criteria:**
- Realistic deposit/withdrawal simulation
- Test scenarios: success, insufficient funds, network error
- Transaction history tracking
- Provider swap interface for future real integration
- Performance: < 500ms per transaction

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Deposit from MTN MoMo to platform wallet
- [ ] **AC2:** Withdraw from platform wallet to MTN MoMo
- [ ] **AC3:** Validate MTN phone number format (234801234567)
- [ ] **AC4:** Simulate successful transaction
- [ ] **AC5:** Simulate insufficient balance error
- [ ] **AC6:** Simulate network error
- [ ] **AC7:** Simulate pending transaction (async callback)
- [ ] **AC8:** Generate mock transaction reference
- [ ] **AC9:** Store mock transaction history
- [ ] **AC10:** Query transaction status
- [ ] **AC11:** Test card numbers for scenarios (success, failure)
- [ ] **AC12:** Balance inquiry simulation
- [ ] **AC13:** Transaction limits (₦5K min, ₦200K max per transaction)
- [ ] **AC14:** Daily limit (₦500K cumulative)
- [ ] **AC15:** Account verification (name match)
- [ ] **AC16:** Provider fee calculation (1.5% for MTN)
- [ ] **AC17:** Webhook callbacks for async transactions
- [ ] **AC18:** Transaction receipt generation
- [ ] **AC19:** Refund/reversal simulation
- [ ] **AC20:** Provider abstraction interface

**Security:**
- [ ] **AC21:** Validate phone number ownership (mock)
- [ ] **AC22:** Transaction PIN validation (mock)
- [ ] **AC23:** Rate limiting (prevent abuse)
- [ ] **AC24:** Audit log all transactions
- [ ] **AC25:** Prevent duplicate transactions (idempotency)

**Non-Functional:**
- [ ] **AC26:** Transaction processing < 500ms
- [ ] **AC27:** Support 1000+ concurrent transactions
- [ ] **AC28:** 99.9% uptime
- [ ] **AC29:** Easy swap to real provider (interface pattern)

---

#### Technical Specifications

**MTN MoMo Mock Service:**

```typescript
interface MobileMoneyTransaction {
  transaction_id: string;
  provider: 'MTN' | 'AIRTEL' | 'MPESA';
  phone_number: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  reference: string;
  created_at: Date;
}

interface MobileMoneyProvider {
  deposit(phone: string, amount: number, reference: string): Promise<MobileMoneyTransaction>;
  withdraw(phone: string, amount: number, reference: string): Promise<MobileMoneyTransaction>;
  queryTransaction(transactionId: string): Promise<MobileMoneyTransaction>;
  validateAccount(phone: string): Promise<{ valid: boolean; account_name: string }>;
}

@Injectable()
export class MockMTNMoMoService implements MobileMoneyProvider {
  constructor(
    @InjectRepository(MockMobileMoneyTransaction)
    private transactionRepository: Repository<MockMobileMoneyTransaction>,
  ) {}

  /**
   * Deposit from MTN MoMo to platform wallet
   */
  async deposit(
    phone: string,
    amount: number,
    reference: string
  ): Promise<MobileMoneyTransaction> {
    // Validate phone number
    if (!this.validatePhoneNumber(phone)) {
      throw new BadRequestException('Invalid MTN phone number');
    }

    // Validate amount
    if (amount < 500000) {  // Min ₦5,000
      throw new BadRequestException('Minimum deposit: ₦5,000');
    }

    if (amount > 20000000) {  // Max ₦200,000
      throw new BadRequestException('Maximum deposit: ₦200,000');
    }

    // Check daily limit
    const dailyTotal = await this.getDailyTotal(phone);
    if (dailyTotal + amount > 50000000) {  // ₦500K daily limit
      throw new BadRequestException('Daily limit exceeded');
    }

    // Test scenarios based on phone number
    const scenario = this.getTestScenario(phone);

    const transaction: MobileMoneyTransaction = {
      transaction_id: `MTN-${Date.now()}-${uuidv4().substring(0, 8)}`,
      provider: 'MTN',
      phone_number: phone,
      amount,
      type: 'DEPOSIT',
      status: scenario.status,
      reference,
      created_at: new Date(),
    };

    // Store transaction
    await this.transactionRepository.save(transaction);

    // Simulate async callback for pending transactions
    if (scenario.status === 'PENDING') {
      setTimeout(async () => {
        transaction.status = 'SUCCESSFUL';
        await this.transactionRepository.save(transaction);
        // Trigger webhook callback
      }, 5000);  // 5 seconds delay
    }

    return transaction;
  }

  /**
   * Withdraw from platform wallet to MTN MoMo
   */
  async withdraw(
    phone: string,
    amount: number,
    reference: string
  ): Promise<MobileMoneyTransaction> {
    // Similar to deposit with reversed flow
    const scenario = this.getTestScenario(phone);

    const transaction: MobileMoneyTransaction = {
      transaction_id: `MTN-${Date.now()}-${uuidv4().substring(0, 8)}`,
      provider: 'MTN',
      phone_number: phone,
      amount,
      type: 'WITHDRAWAL',
      status: scenario.status,
      reference,
      created_at: new Date(),
    };

    await this.transactionRepository.save(transaction);

    return transaction;
  }

  /**
   * Query transaction status
   */
  async queryTransaction(transactionId: string): Promise<MobileMoneyTransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { transaction_id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Validate MTN account
   */
  async validateAccount(phone: string): Promise<{ valid: boolean; account_name: string }> {
    if (!this.validatePhoneNumber(phone)) {
      return { valid: false, account_name: null };
    }

    // Mock account names
    const mockNames = [
      'John Doe',
      'Jane Smith',
      'Ahmed Ibrahim',
      'Ngozi Okafor',
      'Tunde Bakare',
    ];

    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];

    return {
      valid: true,
      account_name: randomName,
    };
  }

  /**
   * Validate MTN phone number format
   */
  private validatePhoneNumber(phone: string): boolean {
    // MTN Nigeria: 234803, 234806, 234810, 234813, 234814, 234816, 234903, 234906
    const mtnPrefixes = [
      '234803', '234806', '234810', '234813', '234814',
      '234816', '234903', '234906',
    ];

    return mtnPrefixes.some(prefix => phone.startsWith(prefix)) && phone.length === 13;
  }

  /**
   * Get test scenario based on phone number
   */
  private getTestScenario(phone: string): { status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' } {
    // Test numbers
    const lastDigit = phone.charAt(phone.length - 1);

    switch (lastDigit) {
      case '0':
        return { status: 'SUCCESSFUL' };  // Instant success
      case '1':
        return { status: 'PENDING' };     // Async success (5s delay)
      case '2':
        return { status: 'FAILED' };      // Insufficient balance
      case '3':
        return { status: 'FAILED' };      // Network error
      default:
        return { status: 'SUCCESSFUL' };  // Default success
    }
  }

  /**
   * Get daily transaction total
   */
  private async getDailyTotal(phone: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const result = await this.transactionRepository
      .createQueryBuilder('txn')
      .select('COALESCE(SUM(txn.amount), 0)', 'total')
      .where('txn.phone_number = :phone', { phone })
      .andWhere('txn.created_at >= :start', { start: startOfDay })
      .andWhere('txn.status = :status', { status: 'SUCCESSFUL' })
      .getRawOne();

    return parseInt(result.total || '0');
  }

  /**
   * Calculate provider fee (1.5% for MTN)
   */
  calculateFee(amount: number): number {
    return Math.round(amount * 0.015);  // 1.5%
  }
}
```

**Provider Abstraction Interface:**

```typescript
// Interface for swapping providers
interface MobileMoneyProviderFactory {
  getProvider(providerName: 'MTN' | 'AIRTEL' | 'MPESA'): MobileMoneyProvider;
}

@Injectable()
export class MobileMoneyProviderFactory {
  constructor(
    private mockMTNService: MockMTNMoMoService,
    private mockAirtelService: MockAirtelMoneyService,
    private mockMPesaService: MockMPesaService,
    // Future: real providers
    // private realMTNService: RealMTNMoMoService,
  ) {}

  getProvider(providerName: 'MTN' | 'AIRTEL' | 'MPESA'): MobileMoneyProvider {
    const useMockProviders = process.env.USE_MOCK_MOBILE_MONEY === 'true';

    if (useMockProviders) {
      switch (providerName) {
        case 'MTN':
          return this.mockMTNService;
        case 'AIRTEL':
          return this.mockAirtelService;
        case 'MPESA':
          return this.mockMPesaService;
      }
    } else {
      // Return real providers when ready
      // switch (providerName) {
      //   case 'MTN':
      //     return this.realMTNService;
      // }
    }
  }
}
```

**Database Schema:**

```sql
-- Mock mobile money transactions
CREATE TABLE mock_mobile_money_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id VARCHAR(100) UNIQUE NOT NULL,

  -- Provider details
  provider VARCHAR(20) NOT NULL,  -- MTN, AIRTEL, MPESA
  phone_number VARCHAR(15) NOT NULL,

  -- Transaction details
  amount BIGINT NOT NULL,
  type VARCHAR(20) NOT NULL,  -- DEPOSIT, WITHDRAWAL
  status VARCHAR(20) NOT NULL,  -- PENDING, SUCCESSFUL, FAILED
  reference VARCHAR(100) NOT NULL,
  failure_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_mock_momo_transaction_id (transaction_id),
  INDEX idx_mock_momo_phone (phone_number),
  INDEX idx_mock_momo_status (status),
  INDEX idx_mock_momo_created_at (created_at)
);
```

---

#### Testing Requirements

**Unit Tests (15 tests):**
- Deposit successful
- Deposit insufficient balance
- Deposit network error
- Deposit pending (async)
- Withdraw successful
- Withdraw failed
- Validate phone number format
- Validate amount (min/max)
- Check daily limit
- Calculate provider fee
- Query transaction status
- Account validation
- Test scenarios (phone ending 0-3)
- Idempotency check
- Fee calculation

**Integration Tests (8 tests):**
- Full deposit flow (MTN → platform)
- Full withdrawal flow (platform → MTN)
- Async callback handling
- Daily limit enforcement
- Provider abstraction interface
- Transaction history retrieval
- Concurrent transactions
- Provider swap (mock ↔ real)

**E2E Tests (5 tests):**
- User deposits via MTN MoMo
- User withdraws to MTN MoMo
- Transaction status query
- Account validation before transfer
- Daily limit exceeded error

---

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] MTN MoMo deposit/withdrawal working
- [ ] Test scenarios implemented
- [ ] All tests passing (28+ tests)
- [ ] Provider abstraction interface complete
- [ ] Transaction < 500ms
- [ ] Code reviewed and merged

---

### 📘 User Story: US-27.3.2 - Mock Airtel Money & M-Pesa Services

**Story ID:** US-27.3.2
**Feature:** FEATURE-20.1 (Mock Mobile Money Providers)
**Epic:** EPIC-20 (Mobile Money)

**Story Points:** 3
**Priority:** P1 (High - Market Coverage)
**Sprint:** Sprint 27
**Status:** 🔄 Not Started

---

#### User Story

```
As a developer
I want mock Airtel Money and M-Pesa services
So that users can test with all major mobile money providers in Africa
```

---

#### Business Value

**Value Statement:**
Airtel Money (25% market share) and M-Pesa (15% market share) combined cover 40% of Nigerian mobile money users. Supporting all 3 major providers gives platform access to 80%+ of mobile money market.

**Impact:**
- **Market Coverage:** 80%+ of mobile money users
- **Competitive Advantage:** Multi-provider support
- **User Choice:** Users pick their preferred provider
- **Cost Savings:** $3K-5K saved per provider during development

**Success Criteria:**
- Airtel Money deposit/withdrawal working
- M-Pesa deposit/withdrawal working
- Same test scenarios as MTN
- Provider-specific phone validation
- Consistent interface across providers

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Airtel Money deposit
- [ ] **AC2:** Airtel Money withdrawal
- [ ] **AC3:** M-Pesa deposit
- [ ] **AC4:** M-Pesa withdrawal
- [ ] **AC5:** Validate Airtel phone numbers (234802, 234808, 234812, 234907)
- [ ] **AC6:** Validate M-Pesa phone numbers (234709, 234817)
- [ ] **AC7:** Provider-specific transaction limits
- [ ] **AC8:** Provider-specific fees (Airtel 1.75%, M-Pesa 2%)
- [ ] **AC9:** Test scenarios for both providers
- [ ] **AC10:** Consistent interface with MTN service
- [ ] **AC11:** Transaction history per provider
- [ ] **AC12:** Account validation per provider
- [ ] **AC13:** Daily limit tracking per provider
- [ ] **AC14:** Provider selection in UI
- [ ] **AC15:** Provider logo/branding display

**Security:**
- [ ] **AC16:** Phone number validation per provider
- [ ] **AC17:** Rate limiting per provider
- [ ] **AC18:** Audit logging
- [ ] **AC19:** Duplicate prevention
- [ ] **AC20:** Provider authentication (mock)

**Non-Functional:**
- [ ] **AC21:** Same performance as MTN (< 500ms)
- [ ] **AC22:** Code reuse via inheritance/composition
- [ ] **AC23:** Easy to add new providers
- [ ] **AC24:** Minimal configuration changes

---

#### Technical Specifications

**Airtel Money Mock Service:**

```typescript
@Injectable()
export class MockAirtelMoneyService implements MobileMoneyProvider {
  constructor(
    @InjectRepository(MockMobileMoneyTransaction)
    private transactionRepository: Repository<MockMobileMoneyTransaction>,
  ) {}

  async deposit(phone: string, amount: number, reference: string): Promise<MobileMoneyTransaction> {
    if (!this.validateAirtelPhone(phone)) {
      throw new BadRequestException('Invalid Airtel phone number');
    }

    // Similar logic to MTN with Airtel-specific rules
    const transaction: MobileMoneyTransaction = {
      transaction_id: `AIRTEL-${Date.now()}-${uuidv4().substring(0, 8)}`,
      provider: 'AIRTEL',
      phone_number: phone,
      amount,
      type: 'DEPOSIT',
      status: this.getTestScenario(phone).status,
      reference,
      created_at: new Date(),
    };

    await this.transactionRepository.save(transaction);
    return transaction;
  }

  async withdraw(phone: string, amount: number, reference: string): Promise<MobileMoneyTransaction> {
    // Similar to deposit
    return {} as MobileMoneyTransaction;
  }

  async queryTransaction(transactionId: string): Promise<MobileMoneyTransaction> {
    return await this.transactionRepository.findOne({ where: { transaction_id: transactionId } });
  }

  async validateAccount(phone: string): Promise<{ valid: boolean; account_name: string }> {
    if (!this.validateAirtelPhone(phone)) {
      return { valid: false, account_name: null };
    }

    return { valid: true, account_name: 'Airtel User' };
  }

  private validateAirtelPhone(phone: string): boolean {
    // Airtel Nigeria: 234802, 234808, 234812, 234907
    const airtelPrefixes = ['234802', '234808', '234812', '234907'];
    return airtelPrefixes.some(prefix => phone.startsWith(prefix)) && phone.length === 13;
  }

  private getTestScenario(phone: string): { status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' } {
    const lastDigit = phone.charAt(phone.length - 1);
    return lastDigit === '2' ? { status: 'FAILED' } : { status: 'SUCCESSFUL' };
  }

  calculateFee(amount: number): number {
    return Math.round(amount * 0.0175);  // 1.75% for Airtel
  }
}
```

**M-Pesa Mock Service:**

```typescript
@Injectable()
export class MockMPesaService implements MobileMoneyProvider {
  constructor(
    @InjectRepository(MockMobileMoneyTransaction)
    private transactionRepository: Repository<MockMobileMoneyTransaction>,
  ) {}

  async deposit(phone: string, amount: number, reference: string): Promise<MobileMoneyTransaction> {
    if (!this.validateMPesaPhone(phone)) {
      throw new BadRequestException('Invalid M-Pesa phone number');
    }

    const transaction: MobileMoneyTransaction = {
      transaction_id: `MPESA-${Date.now()}-${uuidv4().substring(0, 8)}`,
      provider: 'MPESA',
      phone_number: phone,
      amount,
      type: 'DEPOSIT',
      status: this.getTestScenario(phone).status,
      reference,
      created_at: new Date(),
    };

    await this.transactionRepository.save(transaction);
    return transaction;
  }

  async withdraw(phone: string, amount: number, reference: string): Promise<MobileMoneyTransaction> {
    // Similar to deposit
    return {} as MobileMoneyTransaction;
  }

  async queryTransaction(transactionId: string): Promise<MobileMoneyTransaction> {
    return await this.transactionRepository.findOne({ where: { transaction_id: transactionId } });
  }

  async validateAccount(phone: string): Promise<{ valid: boolean; account_name: string }> {
    if (!this.validateMPesaPhone(phone)) {
      return { valid: false, account_name: null };
    }

    return { valid: true, account_name: 'M-Pesa User' };
  }

  private validateMPesaPhone(phone: string): boolean {
    // M-Pesa Kenya (used in Nigeria): 234709, 234817
    const mpesaPrefixes = ['234709', '234817'];
    return mpesaPrefixes.some(prefix => phone.startsWith(prefix)) && phone.length === 13;
  }

  private getTestScenario(phone: string): { status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' } {
    const lastDigit = phone.charAt(phone.length - 1);
    return lastDigit === '3' ? { status: 'FAILED' } : { status: 'SUCCESSFUL' };
  }

  calculateFee(amount: number): number {
    return Math.round(amount * 0.02);  // 2% for M-Pesa
  }
}
```

**Provider Comparison Table:**

| Feature | MTN MoMo | Airtel Money | M-Pesa |
|---------|----------|--------------|--------|
| Phone Prefixes | 234803, 234806, 234810, 234813, 234814, 234816, 234903, 234906 | 234802, 234808, 234812, 234907 | 234709, 234817 |
| Min Transaction | ₦5,000 | ₦5,000 | ₦5,000 |
| Max Transaction | ₦200,000 | ₦200,000 | ₦100,000 |
| Daily Limit | ₦500,000 | ₦500,000 | ₦300,000 |
| Fee | 1.5% | 1.75% | 2% |
| Market Share | 40% | 25% | 15% |

---

#### Testing Requirements

**Unit Tests (12 tests):**
- Airtel deposit successful
- Airtel withdrawal successful
- M-Pesa deposit successful
- M-Pesa withdrawal successful
- Validate Airtel phone numbers
- Validate M-Pesa phone numbers
- Calculate Airtel fee (1.75%)
- Calculate M-Pesa fee (2%)
- Test scenarios per provider
- Provider-specific limits
- Account validation per provider
- Consistent interface compliance

**Integration Tests (6 tests):**
- Full Airtel flow
- Full M-Pesa flow
- Switch between providers
- Concurrent transactions (multi-provider)
- Transaction history filtering
- Provider selection UI

**E2E Tests (4 tests):**
- Deposit via Airtel Money
- Withdraw to M-Pesa
- Compare all 3 providers side-by-side
- User selects preferred provider

---

#### Definition of Done

- [ ] All acceptance criteria met
- [ ] Airtel Money working
- [ ] M-Pesa working
- [ ] All tests passing (22+ tests)
- [ ] Provider comparison documented
- [ ] Code reuse maximized
- [ ] Code reviewed and merged

---

## Sprint Summary

### Sprint Backlog Table

| Story ID | Story Name | Story Points | Priority | Status | Assignee |
|----------|-----------|--------------|----------|--------|----------|
| US-27.1.1 | Batch Payment Upload & Validation | 10 | P1 | 🔄 Not Started | Solo Dev |
| US-27.1.2 | Batch Approval Workflow & Maker-Checker | 8 | P1 | 🔄 Not Started | Solo Dev |
| US-27.2.1 | Scheduled Batch Execution & Payout Batching | 8 | P1 | 🔄 Not Started | Solo Dev |
| US-27.3.1 | Mock MTN Mobile Money Service | 6 | P1 | 🔄 Not Started | Solo Dev |
| US-27.3.2 | Mock Airtel Money & M-Pesa Services | 3 | P1 | 🔄 Not Started | Solo Dev |
| **TOTAL** | **5 User Stories** | **35** | - | - | - |

---

### Overall Testing Requirements

**Total Tests:** 131+ tests (20 + 15 + 18 + 15 + 12 = 80 unit tests, 10 + 8 + 10 + 8 + 6 = 42 integration tests, 5 + 5 + 5 + 5 + 4 = 24 E2E tests)

**Coverage Target:** 90%+

**Test Categories:**
- Unit Tests: 80 tests
- Integration Tests: 42 tests
- E2E Tests: 24 tests

**Critical Test Scenarios:**
- 10K+ batch processing in < 5 minutes
- Maker-checker approval enforcement
- Scheduled batch execution reliability
- Mobile money provider simulation
- Provider abstraction interface

---

### Risk Register

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy | Owner |
|---------|-----------------|-------------|--------|---------------------|-------|
| R-27.1 | Batch file parsing errors (malformed CSV/Excel) | Medium | Medium | Comprehensive validation, clear error messages | Solo Dev |
| R-27.2 | Insufficient balance during batch execution | Medium | High | Pre-execution balance check, wallet hold | Solo Dev |
| R-27.3 | Cron job failures | Low | High | Monitoring, alerting, manual fallback | Solo Dev |
| R-27.4 | Individual payment failures in batch | High | Medium | Retry logic, detailed error reporting | Solo Dev |
| R-27.5 | Maker approves own batch (security) | Low | Critical | Strict enforcement, audit logging | Solo Dev |
| R-27.6 | Mobile money provider API changes | Low | Medium | Provider abstraction interface, version control | Solo Dev |
| R-27.7 | Large batch performance (10K+ items) | Medium | High | Payout batching optimization, query optimization | Solo Dev |
| R-27.8 | Concurrent batch execution conflicts | Low | Medium | Database locking, transaction isolation | Solo Dev |
| R-27.9 | Provider fee calculation errors | Medium | Medium | Unit tests, integration with accounting | Solo Dev |
| R-27.10 | Test data pollution (mock services) | Low | Low | Separate test database, data cleanup | Solo Dev |

---

### Dependencies

**External Dependencies:**
- None (all mock services, no external API dependencies)

**Internal Dependencies:**
- Sprint 1-5: User and wallet services operational
- Sprint 4: Transaction service for payment processing
- Sprint 3: Wallet hold/release functionality
- Notification service for approval/completion emails

**Service Dependencies:**
- PostgreSQL for batch storage
- Cron job scheduler (node-cron or similar)
- CSV parser library (csv-parser, papaparse)
- Excel parser library (xlsx)
- Email service for notifications

---

### Notes & Decisions

**Technical Decisions:**
1. **CSV/Excel Support:** Use csv-parser for CSV, xlsx for Excel (industry standard libraries)
2. **Batch Processing:** Sequential processing to prevent race conditions
3. **Approval Workflow:** Amount-based rules (₦1M, ₦5M thresholds)
4. **Cron Schedule:** Every minute (trade-off: accuracy vs. performance)
5. **Mobile Money:** Mock services initially, provider abstraction for future real integration
6. **Provider Fees:** Hardcoded in mock (1.5% MTN, 1.75% Airtel, 2% M-Pesa)

**Business Decisions:**
1. **Maker-Checker Mandatory:** Required for all batches (prevent fraud)
2. **Maximum Batch Size:** 10,000 records (balance between efficiency and usability)
3. **Transaction Limits:** Align with real provider limits (₦5K min, ₦200K max)
4. **Daily Limits:** ₦500K per provider (prevent money laundering)
5. **Test Scenarios:** Phone number-based (easy for developers to remember)

**Cost Estimates:**
- Development: $0 (internal feature)
- Provider integration fees saved: $5K-15K during development
- Real provider integration (future): $5K-10K per provider
- Transaction fees (production): 1.5-2% per transaction

**Success Metrics:**
- Batch upload time < 30 seconds (10K records)
- Batch execution time < 5 minutes (10K payments)
- Maker-checker compliance: 100% (zero self-approvals)
- Mobile money transaction success rate: 99%+
- Developer satisfaction: High (easy to test)

---

## Sprint Retrospective Preparation

**What to Review:**
- Batch file parsing robustness
- Maker-checker workflow usability
- Scheduled execution reliability
- Mobile money provider simulation realism
- Code reuse across providers

**Potential Improvements:**
- Add more mobile money providers (Paga, OPay)
- Machine learning for fraud detection in batch approvals
- Batch payment templates (save/reuse common payrolls)
- Real-time batch progress tracking
- Bulk refund/reversal functionality

---

**End of Sprint 27 Backlog**