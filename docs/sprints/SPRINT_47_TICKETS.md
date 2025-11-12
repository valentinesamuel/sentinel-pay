# Sprint 47 Tickets - GDPR Compliance & Security Hardening

**Sprint:** 47
**Total Story Points:** 38 SP
**Total Tickets:** 14 tickets (4 stories + 10 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Dependencies |
|-----------|------|-------|--------------|--------------|
| TICKET-47-001 | Story | User Data Deletion (Right-to-Be-Forgotten) | 14 | Sprint 5, 8 |
| TICKET-47-002 | Task | Create Account Deletion Schema & Workflow | 3 | TICKET-47-001 |
| TICKET-47-003 | Task | Implement Data Deletion Service | 3 | TICKET-47-001 |
| TICKET-47-004 | Task | Implement Anonymization Engine | 2 | TICKET-47-001 |
| TICKET-47-005 | Task | Create Deletion Request Endpoints | 1 | TICKET-47-001 |
| TICKET-47-006 | Task | Implement Deletion Verification & Testing | 2 | TICKET-47-001 |
| TICKET-47-007 | Story | Data Portability Export | 10 | Sprint 5 |
| TICKET-47-008 | Task | Create Data Export Service | 3 | TICKET-47-007 |
| TICKET-47-009 | Task | Implement Export Encryption & Signing | 2 | TICKET-47-007 |
| TICKET-47-010 | Task | Create Export Download Endpoints | 1 | TICKET-47-007 |
| TICKET-47-011 | Story | Immutable Audit Logging | 10 | Sprint 8 |
| TICKET-47-012 | Task | Create Immutable Audit Log Schema | 2 | TICKET-47-011 |
| TICKET-47-013 | Task | Implement Cryptographic Signing & Verification | 3 | TICKET-47-011 |
| TICKET-47-014 | Story | Request/Response Signing | 8 | Sprint 5 |

---

## TICKET-47-001: User Data Deletion (Right-to-Be-Forgotten)

**Type:** User Story
**Story Points:** 14
**Priority:** P0 (Critical)

### API Specifications

#### 1. Request Account Deletion

```
POST /api/v1/account/deletion-request

Headers:
  Authorization: Bearer {JWT_TOKEN}
  Content-Type: application/json

Request:
{
  "password": "user_password",
  "confirmToken": "from_2FA_app",
  "reason": "Leaving the platform"
}

Response (202 Accepted):
{
  "deletionRequestId": "DEL-550e8400e29b41d4",
  "status": "PENDING_CONFIRMATION",
  "confirmationToken": "confirm_ABC123XYZ789",
  "confirmationUrl": "https://app.example.com/confirm-deletion/confirm_ABC123XYZ789",
  "confirmationExpiresAt": "2024-11-11T14:30:00Z",  // 48 hours
  "scheduledDeletionAt": "2024-11-19T14:30:00Z",  // 30 days
  "message": "Account deletion scheduled. Confirm via email link to proceed immediately.",
  "cancellationWindow": "48 hours"
}
```

#### 2. Confirm Deletion (Email Link)

```
GET /api/v1/account/deletion-request/confirm?token=confirm_ABC123XYZ789

Response (200 OK):
{
  "deletionRequestId": "DEL-550e8400e29b41d4",
  "status": "CONFIRMED",
  "deletionScheduledAt": "2024-11-09T14:30:00Z",
  "expectedCompletionAt": "2024-11-09T14:35:00Z",
  "message": "Account deletion confirmed. Process starting immediately."
}
```

#### 3. Cancel Deletion

```
DELETE /api/v1/account/deletion-request/{deletionRequestId}

Headers:
  Authorization: Bearer {JWT_TOKEN}

Request:
{
  "password": "user_password"
}

Response (200 OK):
{
  "deletionRequestId": "DEL-550e8400e29b41d4",
  "status": "CANCELLED",
  "cancelledAt": "2024-11-09T14:30:00Z",
  "message": "Account deletion cancelled. Your account is active again."
}
```

#### 4. Get Deletion Status

```
GET /api/v1/account/deletion-request/{deletionRequestId}

Response (200 OK):
{
  "deletionRequestId": "DEL-550e8400e29b41d4",
  "status": "IN_PROGRESS",
  "requestedAt": "2024-11-09T13:30:00Z",
  "confirmedAt": "2024-11-09T13:31:00Z",
  "startedAt": "2024-11-09T13:32:00Z",
  "progress": {
    "stage": "DELETING_PERSONAL_INFO",
    "percentComplete": 45,
    "itemsProcessed": 250,
    "totalItems": 550
  },
  "estimatedCompletionAt": "2024-11-09T13:35:00Z"
}
```

### Database Schema

```sql
CREATE TABLE account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  deletion_request_id VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING_CONFIRMATION',
  password_hash VARCHAR(255) NOT NULL,
  confirmation_token VARCHAR(255) UNIQUE,
  confirmation_token_expires_at TIMESTAMP,
  scheduled_deletion_at TIMESTAMP NOT NULL,
  confirmed_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account_deletions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deletion_request_id VARCHAR(50) NOT NULL REFERENCES account_deletion_requests(deletion_request_id),
  stage VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  items_processed INTEGER,
  total_items INTEGER,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE deleted_user_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id UUID NOT NULL,
  deletion_request_id VARCHAR(50) NOT NULL,
  data_category VARCHAR(50) NOT NULL,  -- personal_info, auth, wallet, transactions, documents
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verification_hash VARCHAR(255)  -- SHA256 of deleted data for audit
);

CREATE INDEX idx_deletion_requests_user_id ON account_deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON account_deletion_requests(status);
CREATE INDEX idx_deletion_requests_scheduled_at ON account_deletion_requests(scheduled_deletion_at);
```

### Implementation

```typescript
@Injectable()
export class AccountDeletionService {
  constructor(
    @InjectRepository(AccountDeletionRequest)
    private deletionRepository: Repository<AccountDeletionRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private emailService: EmailService,
    private queue: Queue,
    private logger: Logger,
  ) {}

  async requestDeletion(userId: string, dto: DeleteAccountDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Verify password
    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid) throw new BadRequestException('Invalid password');

    // Verify 2FA
    if (user.mfa_enabled) {
      const mfaValid = this.verify2FA(user.id, dto.confirmToken);
      if (!mfaValid) throw new BadRequestException('Invalid 2FA token');
    }

    // Create deletion request
    const confirmationToken = this.generateSecureToken();
    const deletionRequest = await this.deletionRepository.save({
      user_id: userId,
      deletion_request_id: this.generateDeleteRequestId(),
      status: 'PENDING_CONFIRMATION',
      password_hash: user.password_hash,
      confirmation_token: confirmationToken,
      confirmation_token_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
      scheduled_deletion_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      reason: dto.reason,
    });

    // Send confirmation email
    const confirmationUrl = `${process.env.APP_URL}/confirm-deletion/${confirmationToken}`;
    await this.emailService.sendDeletionConfirmationEmail(
      user.email,
      {
        confirmationUrl,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        cancelUrl: `${process.env.APP_URL}/cancel-deletion/${deletionRequest.deletion_request_id}`,
      }
    );

    return {
      deletionRequestId: deletionRequest.deletion_request_id,
      status: 'PENDING_CONFIRMATION',
      confirmationToken,
      scheduledDeletionAt: deletionRequest.scheduled_deletion_at,
    };
  }

  async confirmDeletion(token: string): Promise<any> {
    const deletionRequest = await this.deletionRepository.findOne({
      where: { confirmation_token: token },
    });

    if (!deletionRequest) throw new NotFoundException('Invalid confirmation token');
    if (deletionRequest.confirmation_token_expires_at < new Date()) {
      throw new BadRequestException('Confirmation token expired');
    }

    // Mark as confirmed and queue for deletion
    deletionRequest.status = 'CONFIRMED';
    deletionRequest.confirmed_at = new Date();
    await this.deletionRepository.save(deletionRequest);

    // Queue deletion job
    await this.queue.add(
      'delete-user-data',
      { deletionRequestId: deletionRequest.deletion_request_id, userId: deletionRequest.user_id },
      { priority: 10, delay: 0 }
    );

    return {
      deletionRequestId: deletionRequest.deletion_request_id,
      status: 'CONFIRMED',
      message: 'Deletion process starting',
    };
  }

  async executeUserDeletion(deletionRequestId: string, userId: string): Promise<void> {
    const txn = await this.database.transaction();

    try {
      const deletionRequest = await this.deletionRepository.findOne({
        where: { deletion_request_id: deletionRequestId },
      });

      deletionRequest.status = 'IN_PROGRESS';
      deletionRequest.started_at = new Date();
      await this.deletionRepository.save(deletionRequest);

      // Stage 1: Anonymize transactions
      await this.anonymizeTransactions(userId, txn);
      await this.logDeletionStage(deletionRequestId, 'ANONYMIZE_TRANSACTIONS', 'COMPLETED');

      // Stage 2: Delete personal information
      await this.deletePersonalInfo(userId, txn);
      await this.logDeletionStage(deletionRequestId, 'DELETE_PERSONAL_INFO', 'COMPLETED');

      // Stage 3: Delete authentication data
      await this.deleteAuthData(userId, txn);
      await this.logDeletionStage(deletionRequestId, 'DELETE_AUTH_DATA', 'COMPLETED');

      // Stage 4: Delete wallet data
      await this.deleteWalletData(userId, txn);
      await this.logDeletionStage(deletionRequestId, 'DELETE_WALLET_DATA', 'COMPLETED');

      // Stage 5: Delete documents
      await this.deleteDocuments(userId, txn);
      await this.logDeletionStage(deletionRequestId, 'DELETE_DOCUMENTS', 'COMPLETED');

      // Stage 6: Soft delete user account
      await txn.execute(
        `UPDATE users SET deleted_at = NOW(), email = concat('deleted-', id) WHERE id = $1`,
        [userId]
      );
      await this.logDeletionStage(deletionRequestId, 'SOFT_DELETE_ACCOUNT', 'COMPLETED');

      deletionRequest.status = 'COMPLETED';
      deletionRequest.completed_at = new Date();
      await this.deletionRepository.save(deletionRequest);

      await txn.commit();
    } catch (error) {
      await txn.rollback();
      throw error;
    }
  }

  private async anonymizeTransactions(userId: string, txn: any): Promise<void> {
    await txn.execute(
      `UPDATE transactions SET
        sender_name = NULL,
        recipient_name = NULL,
        sender_phone = NULL,
        recipient_phone = NULL,
        metadata = jsonb_set(metadata, '{anonymized}', 'true'),
        metadata = jsonb_set(metadata, '{anonymized_at}', to_jsonb(NOW()))
       WHERE user_id = $1 OR counterparty_user_id = $1`,
      [userId]
    );
  }

  private async deletePersonalInfo(userId: string, txn: any): Promise<void> {
    await txn.execute(`DELETE FROM user_profiles WHERE user_id = $1`, [userId]);
    await txn.execute(`DELETE FROM user_addresses WHERE user_id = $1`, [userId]);
    await txn.execute(`DELETE FROM kyc_documents WHERE user_id = $1`, [userId]);
  }

  private async deleteAuthData(userId: string, txn: any): Promise<void> {
    await txn.execute(`DELETE FROM user_passwords WHERE user_id = $1`, [userId]);
    await txn.execute(`DELETE FROM mfa_secrets WHERE user_id = $1`, [userId]);
    await txn.execute(`DELETE FROM backup_codes WHERE user_id = $1`, [userId]);
    await txn.execute(`DELETE FROM device_tokens WHERE user_id = $1`, [userId]);
  }

  private async deleteWalletData(userId: string, txn: any): Promise<void> {
    await txn.execute(`DELETE FROM wallets WHERE user_id = $1`, [userId]);
    await txn.execute(`DELETE FROM saved_cards WHERE user_id = $1`, [userId]);
    await txn.execute(`DELETE FROM bank_accounts WHERE user_id = $1`, [userId]);
  }

  private async deleteDocuments(userId: string, txn: any): Promise<void> {
    const documents = await txn.query(
      `SELECT file_path FROM uploaded_documents WHERE user_id = $1`,
      [userId]
    );

    // Delete files from S3
    for (const doc of documents) {
      await this.s3Service.deleteObject(doc.file_path);
    }

    await txn.execute(`DELETE FROM uploaded_documents WHERE user_id = $1`, [userId]);
  }

  private async logDeletionStage(
    deletionRequestId: string,
    stage: string,
    status: string,
  ): Promise<void> {
    // Log stage completion
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateDeleteRequestId(): string {
    return `DEL-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }
}
```

---

## TICKET-47-007: Data Portability Export

**Type:** User Story
**Story Points:** 10
**Priority:** P0 (Critical)

### API Specifications

#### 1. Request Data Export

```
POST /api/v1/account/data-export

Headers:
  Authorization: Bearer {JWT_TOKEN}
  Content-Type: application/json

Request:
{
  "includeTransactions": true,
  "includeDocuments": true,
  "password": "user_password",
  "encryptionPassword": "export_password"
}

Response (202 Accepted):
{
  "exportRequestId": "EXP-550e8400e29b41d4",
  "status": "PROCESSING",
  "estimatedCompletionAt": "2024-11-09T14:35:00Z",
  "statusUrl": "/api/v1/account/data-export/EXP-550e8400e29b41d4"
}
```

#### 2. Get Export Status

```
GET /api/v1/account/data-export/{exportRequestId}

Response (200 OK):
{
  "exportRequestId": "EXP-550e8400e29b41d4",
  "status": "COMPLETED",
  "filename": "user_data_export_20241109.zip",
  "downloadUrl": "https://api.example.com/exports/user_data_20241109.zip",
  "expiresAt": "2024-11-16T14:30:00Z",
  "fileSize": 45000000,
  "contents": {
    "account": { "format": "JSON", "records": 1 },
    "transactions": { "format": "CSV", "records": 512 },
    "wallets": { "format": "JSON", "records": 3 },
    "documents": { "format": "ZIP", "records": 8 }
  }
}
```

### Implementation

```typescript
@Injectable()
export class DataExportService {
  async requestDataExport(userId: string, dto: ExportRequestDto): Promise<any> {
    // Verify password
    // Queue export job
    // Return export request ID
  }

  async generateDataExport(userId: string, exportRequestId: string): Promise<Buffer> {
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Add account.json
    const account = await this.getUserData(userId);
    archive.append(JSON.stringify(account, null, 2), { name: 'account.json' });

    // Add transactions.csv
    const transactions = await this.getTransactionsCsv(userId);
    archive.append(transactions, { name: 'transactions.csv' });

    // Add wallets.json
    const wallets = await this.getWalletsData(userId);
    archive.append(JSON.stringify(wallets, null, 2), { name: 'wallets.json' });

    // Add documents.zip
    const documentsZip = await this.getDocumentsZip(userId);
    archive.append(documentsZip, { name: 'documents.zip' });

    // Finalize and encrypt
    const buffer = await archive.finalize();
    const encrypted = await this.encryptBuffer(buffer, dto.encryptionPassword);

    return encrypted;
  }

  async encryptBuffer(buffer: Buffer, password: string): Promise<Buffer> {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return Buffer.concat([salt, iv, encrypted]);
  }
}
```

---

## TICKET-47-011: Immutable Audit Logging

**Type:** User Story
**Story Points:** 10
**Priority:** P0 (Critical)

### Database Schema

```sql
CREATE TABLE audit_logs_immutable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_number BIGSERIAL UNIQUE NOT NULL,
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  signature VARCHAR(512) NOT NULL,
  previous_hash VARCHAR(256),  -- Hash of previous entry
  current_hash VARCHAR(256) GENERATED ALWAYS AS (
    sha256(concat(sequence_number, user_id, action, resource_type, resource_id, timestamp))
  ) STORED,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  signed_at TIMESTAMP,
  verified_at TIMESTAMP
);

-- Make immutable at database level
CREATE RULE audit_logs_immutable_no_delete AS
  ON DELETE TO audit_logs_immutable
  DO INSTEAD NOTHING;

CREATE RULE audit_logs_immutable_no_update AS
  ON UPDATE TO audit_logs_immutable
  DO INSTEAD NOTHING;

CREATE INDEX idx_audit_logs_user_id ON audit_logs_immutable(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs_immutable(timestamp);
CREATE INDEX idx_audit_logs_sequence ON audit_logs_immutable(sequence_number);
```

### Implementation

```typescript
@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogImmutable)
    private auditRepository: Repository<AuditLogImmutable>,
  ) {}

  async logAction(auditLog: CreateAuditLogDto): Promise<void> {
    const lastLog = await this.auditRepository
      .createQueryBuilder()
      .orderBy('sequence_number', 'DESC')
      .take(1)
      .getOne();

    const previousHash = lastLog?.current_hash;
    const signature = this.signLogEntry(auditLog, previousHash);

    await this.auditRepository.save({
      ...auditLog,
      signature,
      previous_hash: previousHash,
      signed_at: new Date(),
    });
  }

  private signLogEntry(logEntry: any, previousHash?: string): string {
    const hmac = crypto.createHmac('sha256', process.env.AUDIT_LOG_KEY);
    const content = JSON.stringify({ ...logEntry, previousHash });
    return hmac.update(content).digest('hex');
  }

  async verifyAuditLog(logId: string): Promise<boolean> {
    const log = await this.auditRepository.findOne({ where: { id: logId } });
    if (!log) return false;

    const hmac = crypto.createHmac('sha256', process.env.AUDIT_LOG_KEY);
    const content = JSON.stringify({
      sequence_number: log.sequence_number,
      user_id: log.user_id,
      action: log.action,
      previous_hash: log.previous_hash,
    });

    const expectedSignature = hmac.update(content).digest('hex');
    return expectedSignature === log.signature;
  }
}
```

---

## Testing Strategy

### Unit Tests (30+ test cases)

- Account deletion workflow (request, confirm, execute)
- Data anonymization (transactions, personal info)
- Data export encryption and signing
- Audit log signing and verification
- Token generation and validation

### Integration Tests

- End-to-end deletion flow with database state verification
- Data export with encryption/decryption
- Audit log immutability (prevent deletion/modification)
- Compliance verification

---

**Document Version:** 1.0.0
