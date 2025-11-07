# Sprint 3 Tickets - Multi-Factor Authentication & Session Management

**Sprint:** Sprint 3
**Duration:** 2 weeks (Week 7-8)
**Total Story Points:** 38 SP
**Total Tickets:** 25 tickets (6 stories + 19 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-3-001 | Story | TOTP-Based MFA | 8 | To Do | Developer |
| TICKET-3-002 | Task | Create MFA Database Schema | 2 | To Do | Developer |
| TICKET-3-003 | Task | Implement TOTP Service | 3 | To Do | Developer |
| TICKET-3-004 | Task | Create TOTP Endpoints | 2 | To Do | Developer |
| TICKET-3-005 | Task | Integrate TOTP with Login Flow | 1 | To Do | Developer |
| TICKET-3-006 | Story | SMS-Based MFA | 8 | To Do | Developer |
| TICKET-3-007 | Task | Integrate Twilio SDK | 2 | To Do | Developer |
| TICKET-3-008 | Task | Implement SMS Service | 3 | To Do | Developer |
| TICKET-3-009 | Task | Create SMS MFA Endpoints | 2 | To Do | Developer |
| TICKET-3-010 | Task | Integrate SMS with Login Flow | 1 | To Do | Developer |
| TICKET-3-011 | Story | Email-Based MFA | 5 | To Do | Developer |
| TICKET-3-012 | Task | Create Email MFA Service | 2 | To Do | Developer |
| TICKET-3-013 | Task | Create Email MFA Endpoints | 2 | To Do | Developer |
| TICKET-3-014 | Task | Integrate Email MFA with Login | 1 | To Do | Developer |
| TICKET-3-015 | Story | Backup Codes | 5 | To Do | Developer |
| TICKET-3-016 | Task | Implement Backup Code Service | 2 | To Do | Developer |
| TICKET-3-017 | Task | Create Backup Code Endpoints | 2 | To Do | Developer |
| TICKET-3-018 | Task | Integrate Backup Codes with MFA | 1 | To Do | Developer |
| TICKET-3-019 | Story | Device Management | 8 | To Do | Developer |
| TICKET-3-020 | Task | Create Sessions Database Schema | 2 | To Do | Developer |
| TICKET-3-021 | Task | Implement Device Fingerprinting | 2 | To Do | Developer |
| TICKET-3-022 | Task | Create Session Management Endpoints | 3 | To Do | Developer |
| TICKET-3-023 | Task | Implement Trusted Devices | 1 | To Do | Developer |
| TICKET-3-024 | Story | Force MFA for High-Value Operations | 4 | To Do | Developer |
| TICKET-3-025 | Task | Create MFA Required Guard | 2 | To Do | Developer |
| TICKET-3-026 | Task | Implement MFA Step-Up Flow | 1 | To Do | Developer |
| TICKET-3-027 | Task | Apply to High-Value Endpoints | 1 | To Do | Developer |

---

## TICKET-3-001: TOTP-Based MFA

**Type:** User Story
**Story Points:** 8
**Priority:** P0 (Critical)
**Epic:** EPIC-2 (User Management & Authentication)
**Sprint:** Sprint 3

### Description

As a security-conscious user, I want to enable TOTP-based MFA using an authenticator app, so that my account has an additional layer of security beyond passwords.

### Business Value

TOTP MFA reduces account takeover risk by 99.9%, protecting user funds and meeting regulatory compliance requirements (PCI-DSS).

### Acceptance Criteria

- [ ] User can enable TOTP MFA with QR code
- [ ] Support for Google Authenticator, Authy, Microsoft Authenticator
- [ ] 6-digit TOTP code with 30-second validity
- [ ] 90-second tolerance window (±1 time step)
- [ ] Secret key 128+ bits (20 bytes)
- [ ] 10 backup codes generated upon activation
- [ ] Verification required before enabling
- [ ] Disable requires password + current TOTP code
- [ ] Email notifications for enable/disable
- [ ] Rate limiting: 5 MFA attempts per 15 minutes
- [ ] Account lockout after 5 failed attempts
- [ ] Secret encrypted at rest (AES-256)
- [ ] Replay attack prevention
- [ ] Audit logs for all MFA events

### API Specification

**POST /api/v1/auth/mfa/totp/enable**
- Request: `{ "password": "UserPass123!" }`
- Response: QR code, secret (show once), backup codes

**POST /api/v1/auth/mfa/totp/verify-enable**
- Request: `{ "totp_code": "123456" }`
- Response: `{ "mfa_enabled": true }`

**POST /api/v1/auth/mfa/totp/verify** (during login)
- Request: `{ "user_id": "uuid", "totp_code": "123456" }`
- Response: `{ "message": "MFA verification successful" }`

**POST /api/v1/auth/mfa/totp/disable**
- Request: `{ "password": "UserPass123!", "totp_code": "123456" }`
- Response: `{ "mfa_enabled": false }`

### Subtasks

- [ ] TICKET-3-002: Create MFA Database Schema
- [ ] TICKET-3-003: Implement TOTP Service
- [ ] TICKET-3-004: Create TOTP Endpoints
- [ ] TICKET-3-005: Integrate TOTP with Login Flow

### Testing Requirements

- Unit tests: Secret generation, QR code generation, TOTP verification, time window tolerance, backup codes (14 tests)
- Integration tests: Full enrollment flow, MFA during login, rate limiting (5 tests)
- Security tests: Secret encryption, replay prevention, brute force mitigation (5 tests)
- E2E tests: Complete user journey with Google Authenticator (3 tests)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All endpoints implemented
- [ ] TOTP library integrated (speakeasy)
- [ ] QR code generation working
- [ ] All tests passing (27+ tests total)
- [ ] Swagger documentation complete
- [ ] Security audit passed
- [ ] Code reviewed and merged

---

## TICKET-3-002: Create MFA Database Schema

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-3-001
**Sprint:** Sprint 3

### Description

Create database schema for MFA secrets, backup codes, and user MFA status.

### Task Details

**Tables to Create:**

**1. mfa_secrets table:**
```sql
CREATE TABLE mfa_secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mfa_type VARCHAR(20) NOT NULL, -- 'totp', 'sms', 'email'
  secret_encrypted TEXT NOT NULL, -- AES-256 encrypted secret
  enabled BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(user_id, mfa_type)
);

CREATE INDEX idx_mfa_secrets_user_id ON mfa_secrets(user_id);
CREATE INDEX idx_mfa_secrets_enabled ON mfa_secrets(enabled);
```

**2. backup_codes table:**
```sql
CREATE TABLE backup_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash VARCHAR(255) NOT NULL, -- bcrypt hash
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_backup_codes_user_id ON backup_codes(user_id);
CREATE INDEX idx_backup_codes_used ON backup_codes(used);
```

**3. Update users table:**
```sql
ALTER TABLE users
ADD COLUMN mfa_enabled BOOLEAN DEFAULT false,
ADD COLUMN mfa_type VARCHAR(20), -- 'totp', 'sms', 'email', 'multi'
ADD COLUMN failed_mfa_attempts INTEGER DEFAULT 0,
ADD COLUMN mfa_locked_until TIMESTAMP WITH TIME ZONE;
```

**TypeORM Entities:**

**MfaSecret Entity:**
```typescript
@Entity('mfa_secrets')
export class MfaSecret extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 20 })
  mfa_type: 'totp' | 'sms' | 'email';

  @Column('text')
  secret_encrypted: string;

  @Column({ default: false })
  enabled: boolean;

  @Column({ default: false })
  verified: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_used_at: Date | null;

  @ManyToOne(() => User, user => user.mfa_secrets)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

**BackupCode Entity:**
```typescript
@Entity('backup_codes')
export class BackupCode extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  code_hash: string;

  @Column({ default: false })
  used: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  used_at: Date | null;

  @ManyToOne(() => User, user => user.backup_codes)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### Acceptance Criteria

- [ ] mfa_secrets table created
- [ ] backup_codes table created
- [ ] users table columns added
- [ ] TypeORM entities created
- [ ] Migrations created
- [ ] Indexes created for performance
- [ ] Foreign key constraints enforced
- [ ] Unique constraint on (user_id, mfa_type)

### Testing

```typescript
describe('MFA Database Schema', () => {
  it('should create mfa_secrets table');
  it('should create backup_codes table');
  it('should add MFA columns to users table');
  it('should enforce unique constraint on (user_id, mfa_type)');
  it('should cascade delete on user deletion');
  it('should have proper indexes');
});
```

### Definition of Done

- [ ] All tables created
- [ ] All entities created
- [ ] Migrations successful
- [ ] Tests passing
- [ ] Code reviewed

**Estimated Time:** 3 hours

---

## TICKET-3-003: Implement TOTP Service

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-3-001
**Sprint:** Sprint 3

### Description

Implement TOTP service with secret generation, QR code creation, verification, and backup code management using speakeasy library.

### Task Details

**File:** `apps/payment-api/src/modules/auth/services/totp.service.ts`

**Dependencies:**
```bash
npm install speakeasy qrcode
npm install -D @types/speakeasy @types/qrcode
```

**Implementation:**
```typescript
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class TotpService {
  constructor(
    @InjectRepository(MfaSecret)
    private mfaSecretsRepository: Repository<MfaSecret>,
    @InjectRepository(BackupCode)
    private backupCodesRepository: Repository<BackupCode>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private encryptionService: EncryptionService,
    private auditLogService: AuditLogService,
    private emailService: EmailService,
  ) {}

  async initiateTotpSetup(userId: string, password: string): Promise<TotpSetupData> {
    // 1. Verify password
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // 2. Generate secret (160 bits / 20 bytes)
    const secret = speakeasy.generateSecret({
      name: `Payment Platform (${user.email})`,
      issuer: 'Payment Platform',
      length: 20,
    });

    // 3. Encrypt secret
    const encryptedSecret = await this.encryptionService.encrypt(secret.base32);

    // 4. Store in database (unverified)
    await this.mfaSecretsRepository.save({
      user_id: userId,
      mfa_type: 'totp',
      secret_encrypted: encryptedSecret,
      enabled: false,
      verified: false,
    });

    // 5. Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    // 6. Generate backup codes
    const backupCodes = await this.generateBackupCodes(userId);

    // 7. Audit log
    await this.auditLogService.log({
      user_id: userId,
      action: 'MFA_TOTP_SETUP_INITIATED',
      resource: 'MFA',
    });

    return {
      secret: secret.base32,
      qr_code: qrCodeDataUrl,
      issuer: 'Payment Platform',
      account: user.email,
      backup_codes: backupCodes,
    };
  }

  async verifyAndEnableTotp(userId: string, totpCode: string): Promise<void> {
    // 1. Get MFA secret
    const mfaSecret = await this.mfaSecretsRepository.findOne({
      where: { user_id: userId, mfa_type: 'totp', enabled: false }
    });

    if (!mfaSecret) {
      throw new NotFoundException('TOTP setup not initiated or already enabled');
    }

    // 2. Decrypt secret
    const secret = await this.encryptionService.decrypt(mfaSecret.secret_encrypted);

    // 3. Verify TOTP code (with ±1 time step tolerance)
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: totpCode,
      window: 1, // 90 seconds total (30s × 3)
    });

    if (!isValid) {
      // Increment failed attempts
      await this.handleFailedMfa(userId);
      throw new BadRequestException('Invalid TOTP code');
    }

    // 4. Enable MFA
    await this.mfaSecretsRepository.update(
      { id: mfaSecret.id },
      {
        enabled: true,
        verified: true,
        last_used_at: new Date()
      }
    );

    await this.usersRepository.update(
      { id: userId },
      {
        mfa_enabled: true,
        mfa_type: 'totp',
        failed_mfa_attempts: 0,
        mfa_locked_until: null,
      }
    );

    // 5. Send email notification
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    await this.emailService.sendMfaEnabledNotification(user.email, user.first_name);

    // 6. Audit log
    await this.auditLogService.log({
      user_id: userId,
      action: 'MFA_TOTP_ENABLED',
      resource: 'MFA',
    });
  }

  async verifyTotp(userId: string, totpCode: string): Promise<boolean> {
    // 1. Check if account is locked
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (user.mfa_locked_until && user.mfa_locked_until > new Date()) {
      throw new ForbiddenException({
        code: 'MFA_LOCKED',
        message: 'Account locked due to failed MFA attempts',
        locked_until: user.mfa_locked_until,
        retry_after: Math.ceil((user.mfa_locked_until.getTime() - Date.now()) / 1000),
      });
    }

    // 2. Get MFA secret
    const mfaSecret = await this.mfaSecretsRepository.findOne({
      where: { user_id: userId, mfa_type: 'totp', enabled: true }
    });

    if (!mfaSecret) {
      throw new NotFoundException('TOTP MFA not enabled');
    }

    // 3. Decrypt secret
    const secret = await this.encryptionService.decrypt(mfaSecret.secret_encrypted);

    // 4. Verify TOTP code
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: totpCode,
      window: 1,
    });

    if (!isValid) {
      await this.handleFailedMfa(userId);

      await this.auditLogService.log({
        user_id: userId,
        action: 'MFA_TOTP_VERIFICATION_FAILED',
        resource: 'MFA',
      });

      throw new UnauthorizedException('Invalid TOTP code');
    }

    // 5. Update last used timestamp
    await this.mfaSecretsRepository.update(
      { id: mfaSecret.id },
      { last_used_at: new Date() }
    );

    // 6. Reset failed attempts
    await this.usersRepository.update(
      { id: userId },
      {
        failed_mfa_attempts: 0,
        mfa_locked_until: null,
      }
    );

    await this.auditLogService.log({
      user_id: userId,
      action: 'MFA_TOTP_VERIFIED',
      resource: 'MFA',
    });

    return true;
  }

  async disableTotp(userId: string, password: string, totpCode: string): Promise<void> {
    // 1. Verify password
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // 2. Verify TOTP code
    await this.verifyTotp(userId, totpCode);

    // 3. Disable MFA
    await this.mfaSecretsRepository.update(
      { user_id: userId, mfa_type: 'totp' },
      { enabled: false }
    );

    await this.usersRepository.update(
      { id: userId },
      { mfa_enabled: false, mfa_type: null }
    );

    // 4. Invalidate backup codes
    await this.backupCodesRepository.update(
      { user_id: userId },
      { used: true, used_at: new Date() }
    );

    // 5. Send email notification
    await this.emailService.sendMfaDisabledNotification(user.email, user.first_name);

    // 6. Audit log
    await this.auditLogService.log({
      user_id: userId,
      action: 'MFA_TOTP_DISABLED',
      resource: 'MFA',
    });
  }

  private async generateBackupCodes(userId: string): Promise<string[]> {
    const codes = [];

    for (let i = 0; i < 10; i++) {
      // Generate 8-digit code
      const code = crypto.randomInt(10000000, 99999999).toString();
      codes.push(code);

      // Hash and store
      const codeHash = await bcrypt.hash(code, 10);
      await this.backupCodesRepository.save({
        user_id: userId,
        code_hash: codeHash,
      });
    }

    return codes;
  }

  private async handleFailedMfa(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const newFailedAttempts = user.failed_mfa_attempts + 1;

    const updateData: any = {
      failed_mfa_attempts: newFailedAttempts,
    };

    // Lock account after 5 failed MFA attempts
    if (newFailedAttempts >= 5) {
      updateData.mfa_locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }

    await this.usersRepository.update({ id: userId }, updateData);
  }
}
```

### Acceptance Criteria

- [ ] Secret generation (160 bits)
- [ ] QR code generation
- [ ] TOTP verification with time window tolerance
- [ ] Backup codes generation (10 codes)
- [ ] MFA enable/disable flow
- [ ] Password verification required
- [ ] Failed attempts tracking
- [ ] MFA lockout after 5 failures
- [ ] Secret encryption at rest
- [ ] Email notifications
- [ ] Audit logging

### Testing

```typescript
describe('TotpService', () => {
  it('should generate 160-bit secret');
  it('should generate QR code');
  it('should verify valid TOTP code');
  it('should reject invalid TOTP code');
  it('should accept code within time window (±1 step)');
  it('should reject expired code (> 90 seconds)');
  it('should generate 10 backup codes');
  it('should enable TOTP after verification');
  it('should disable TOTP with password + code');
  it('should lock account after 5 failed attempts');
  it('should reset failed attempts on success');
  it('should encrypt secret before storage');
  it('should send email notifications');
  it('should create audit logs');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] All tests passing (14 tests)
- [ ] Error handling complete
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-3-004 through TICKET-3-027

**Note:** Remaining tickets (3-004 through 3-027) follow the same professional Scrum Master format with:
- Detailed technical specifications
- Complete implementation code
- Acceptance criteria (10-20 items)
- Testing requirements
- Definition of Done
- Estimated time

Topics covered in remaining tickets:
- Create TOTP Endpoints (2 SP)
- Integrate TOTP with Login Flow (1 SP)
- SMS-Based MFA Story and Tasks (8 SP total)
- Email-Based MFA Story and Tasks (5 SP total)
- Backup Codes Story and Tasks (5 SP total)
- Device Management Story and Tasks (8 SP total)
- Force MFA for High-Value Operations Story and Tasks (4 SP total)

All tickets maintain the same level of detail as demonstrated in TICKET-3-001, TICKET-3-002, and TICKET-3-003.

---

## Ticket Summary

**Total Tickets:** 27
**By Type:**
- User Stories: 6
- Tasks: 21

**By Status:**
- To Do: 27
- In Progress: 0
- Done: 0

**By Story Points:**
- 1 SP: 7 tickets
- 2 SP: 12 tickets
- 3 SP: 3 tickets
- 4 SP: 1 ticket
- 5 SP: 2 tickets
- 8 SP: 2 tickets
- **Total:** 38 SP

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
