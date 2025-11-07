# Sprint 3 Backlog - Multi-Factor Authentication & Session Management

**Sprint:** Sprint 3
**Duration:** 2 weeks (Week 7-8)
**Sprint Goal:** Implement comprehensive Multi-Factor Authentication (TOTP, SMS, Email) and secure session management
**Story Points Committed:** 38
**Team Capacity:** 38 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1 (45 SP) and Sprint 2 (42 SP) = 43.5 SP, committed 38 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 3, we will have:
1. TOTP-based MFA (Google Authenticator, Authy)
2. SMS-based MFA via Twilio
3. Email-based MFA with 6-digit codes
4. MFA enrollment and verification flows
5. Backup codes generation and validation
6. Device management (trusted devices)
7. Session management with device tracking
8. Force MFA for high-value operations

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] E2E tests for MFA flows passing
- [ ] Security tests passing (TOTP validation, SMS interception prevention)
- [ ] API documentation updated (Swagger)
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-2: User Management & Authentication (Continued)

## FEATURE-2.6: Multi-Factor Authentication

### 📘 User Story: US-3.1.1 - TOTP-Based MFA

**Story ID:** US-3.1.1
**Feature:** FEATURE-2.6 (Multi-Factor Authentication)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 8
**Priority:** P0 (Must Have)
**Sprint:** Sprint 3
**Status:** 🔄 Not Started

---

#### User Story

```
As a security-conscious user
I want to enable TOTP-based MFA using an authenticator app
So that my account has an additional layer of security beyond passwords
```

---

#### Business Value

**Value Statement:**
TOTP (Time-based One-Time Password) MFA significantly reduces account takeover risk by requiring physical possession of a device, protecting user funds and sensitive data.

**Impact:**
- **Critical:** Prevents 99.9% of automated account takeover attempts
- **Compliance:** Required for PCI-DSS, regulatory compliance
- **User Trust:** Increases platform credibility and user confidence

**Success Criteria:**
- 30% of users enable MFA within 30 days
- < 3 seconds MFA verification time
- < 0.01% false rejection rate
- Zero successful account takeovers with MFA enabled

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can enable TOTP MFA
- [ ] **AC2:** QR code generated for authenticator app setup
- [ ] **AC3:** Support for Google Authenticator, Authy, Microsoft Authenticator
- [ ] **AC4:** 6-digit TOTP code with 30-second validity window
- [ ] **AC5:** Allow 1 time step before/after (90-second tolerance window)
- [ ] **AC6:** Secret key displayed as manual entry fallback
- [ ] **AC7:** Verification required before enabling MFA
- [ ] **AC8:** 10 backup codes generated upon MFA activation
- [ ] **AC9:** User must verify TOTP code before finalization
- [ ] **AC10:** MFA status visible in user profile
- [ ] **AC11:** Disable MFA with password + current TOTP code
- [ ] **AC12:** Email notification when MFA enabled/disabled

**Security:**
- [ ] **AC13:** Secret key minimum 128 bits (20 bytes)
- [ ] **AC14:** Rate limiting: 5 MFA attempts per 15 minutes
- [ ] **AC15:** Account lockout after 5 failed MFA attempts
- [ ] **AC16:** Secret key encrypted at rest (AES-256)
- [ ] **AC17:** Secret key never exposed in logs/responses after setup
- [ ] **AC18:** Audit log for MFA enable/disable/attempts
- [ ] **AC19:** Replay attack prevention (used codes invalidated)

**Non-Functional:**
- [ ] **AC20:** TOTP algorithm: HMAC-SHA1 (RFC 6238)
- [ ] **AC21:** Response time < 3 seconds
- [ ] **AC22:** QR code generation < 500ms

---

#### Technical Specifications

**Endpoint 1:** `POST /api/v1/auth/mfa/totp/enable`

**Request:**
```typescript
{
  "password": "UserPassword123!" // Confirm identity
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP", // Base32 encoded secret (show once)
    "qr_code": "data:image/png;base64,iVBORw0KGgo...", // QR code data URL
    "issuer": "Payment Platform",
    "account": "user@example.com",
    "backup_codes": [
      "12345678",
      "23456789",
      // ... 8 more codes
    ],
    "message": "Scan the QR code with your authenticator app, then verify with a code"
  }
}
```

**Endpoint 2:** `POST /api/v1/auth/mfa/totp/verify-enable`

**Request:**
```typescript
{
  "totp_code": "123456"
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "mfa_enabled": true,
    "message": "TOTP MFA enabled successfully"
  }
}
```

**Endpoint 3:** `POST /api/v1/auth/mfa/totp/verify` (during login)

**Request:**
```typescript
{
  "user_id": "uuid",
  "totp_code": "123456"
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "message": "MFA verification successful"
  }
}
```

**Endpoint 4:** `POST /api/v1/auth/mfa/totp/disable`

**Request:**
```typescript
{
  "password": "UserPassword123!",
  "totp_code": "123456"
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "mfa_enabled": false,
    "message": "TOTP MFA disabled successfully"
  }
}
```

---

#### Database Changes

**New Table: `mfa_secrets`**
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

**New Table: `backup_codes`**
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

**Update `users` table:**
```sql
ALTER TABLE users
ADD COLUMN mfa_enabled BOOLEAN DEFAULT false,
ADD COLUMN mfa_type VARCHAR(20), -- 'totp', 'sms', 'email', 'multi'
ADD COLUMN failed_mfa_attempts INTEGER DEFAULT 0,
ADD COLUMN mfa_locked_until TIMESTAMP WITH TIME ZONE;
```

---

#### Implementation Details

**TOTP Service:**
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
    private encryptionService: EncryptionService,
    private auditLogService: AuditLogService,
  ) {}

  async enableTotp(userId: string): Promise<TotpSetupData> {
    // 1. Generate secret (160 bits)
    const secret = speakeasy.generateSecret({
      name: `Payment Platform (${user.email})`,
      issuer: 'Payment Platform',
      length: 20, // 20 bytes = 160 bits
    });

    // 2. Encrypt secret before storing
    const encryptedSecret = await this.encryptionService.encrypt(secret.base32);

    // 3. Store in database (unverified)
    await this.mfaSecretsRepository.save({
      user_id: userId,
      mfa_type: 'totp',
      secret_encrypted: encryptedSecret,
      enabled: false,
      verified: false,
    });

    // 4. Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    // 5. Generate 10 backup codes
    const backupCodes = await this.generateBackupCodes(userId);

    // 6. Audit log
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

  async verifyAndEnableTotp(userId: string, totpCode: string): Promise<boolean> {
    // 1. Get MFA secret
    const mfaSecret = await this.mfaSecretsRepository.findOne({
      where: { user_id: userId, mfa_type: 'totp' }
    });

    if (!mfaSecret) {
      throw new NotFoundException('TOTP not initiated');
    }

    // 2. Decrypt secret
    const secret = await this.encryptionService.decrypt(mfaSecret.secret_encrypted);

    // 3. Verify TOTP code (with time step tolerance)
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: totpCode,
      window: 1, // Allow 1 step before/after (90 seconds total)
    });

    if (!isValid) {
      throw new BadRequestException('Invalid TOTP code');
    }

    // 4. Enable MFA
    await this.mfaSecretsRepository.update(
      { id: mfaSecret.id },
      { enabled: true, verified: true, last_used_at: new Date() }
    );

    await this.usersRepository.update(
      { id: userId },
      { mfa_enabled: true, mfa_type: 'totp' }
    );

    // 5. Audit log
    await this.auditLogService.log({
      user_id: userId,
      action: 'MFA_TOTP_ENABLED',
      resource: 'MFA',
    });

    return true;
  }

  async verifyTotp(userId: string, totpCode: string): Promise<boolean> {
    // 1. Get MFA secret
    const mfaSecret = await this.mfaSecretsRepository.findOne({
      where: { user_id: userId, mfa_type: 'totp', enabled: true }
    });

    if (!mfaSecret) {
      throw new NotFoundException('TOTP MFA not enabled');
    }

    // 2. Decrypt secret
    const secret = await this.encryptionService.decrypt(mfaSecret.secret_encrypted);

    // 3. Verify TOTP code
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: totpCode,
      window: 1,
    });

    if (isValid) {
      // Update last used
      await this.mfaSecretsRepository.update(
        { id: mfaSecret.id },
        { last_used_at: new Date() }
      );

      // Reset failed attempts
      await this.usersRepository.update(
        { id: userId },
        { failed_mfa_attempts: 0, mfa_locked_until: null }
      );

      await this.auditLogService.log({
        user_id: userId,
        action: 'MFA_TOTP_VERIFIED',
        resource: 'MFA',
      });

      return true;
    }

    // Increment failed attempts
    await this.handleFailedMfa(userId);

    throw new UnauthorizedException('Invalid TOTP code');
  }

  private async generateBackupCodes(userId: string): Promise<string[]> {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomInt(10000000, 99999999).toString();
      codes.push(code);

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
      updateData.mfa_locked_until = new Date(Date.now() + 30 * 60 * 1000);
    }

    await this.usersRepository.update({ id: userId }, updateData);

    await this.auditLogService.log({
      user_id: userId,
      action: 'MFA_VERIFICATION_FAILED',
      resource: 'MFA',
      metadata: { attempts: newFailedAttempts },
    });
  }
}
```

---

#### Testing Checklist

**Unit Tests:**
- [ ] Test secret generation (160 bits)
- [ ] Test QR code generation
- [ ] Test TOTP code verification (valid)
- [ ] Test TOTP code verification (invalid)
- [ ] Test TOTP code verification (expired)
- [ ] Test time step tolerance (window = 1)
- [ ] Test backup codes generation (10 codes)
- [ ] Test backup codes uniqueness
- [ ] Test MFA enable flow
- [ ] Test MFA disable flow
- [ ] Test failed MFA attempts tracking
- [ ] Test MFA lockout after 5 failures
- [ ] Test secret encryption
- [ ] Test audit logging

**Integration Tests:**
- [ ] Test full MFA enrollment flow
- [ ] Test MFA verification during login
- [ ] Test backup code usage
- [ ] Test rate limiting
- [ ] Test database constraints

**Security Tests:**
- [ ] Test secret never exposed after setup
- [ ] Test replay attack prevention
- [ ] Test brute force mitigation
- [ ] Test lockout mechanism
- [ ] Test encryption at rest

**E2E Tests:**
- [ ] Test user enables TOTP MFA with Google Authenticator
- [ ] Test user logs in with MFA enabled
- [ ] Test user disables MFA

---

#### Definition of Done

- [ ] All endpoints implemented
- [ ] TOTP library integrated (speakeasy)
- [ ] QR code generation working
- [ ] Backup codes generation working
- [ ] Secret encryption working
- [ ] MFA lockout logic working
- [ ] All unit tests passing (14+ tests)
- [ ] All integration tests passing (5+ tests)
- [ ] All security tests passing (5+ tests)
- [ ] E2E tests passing (3+ tests)
- [ ] Swagger documentation complete
- [ ] Code reviewed and merged

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-3.1.1.1 | Create MFA Database Schema | 2 | 🔄 To Do |
| TASK-3.1.1.2 | Implement TOTP Service | 3 | 🔄 To Do |
| TASK-3.1.1.3 | Create TOTP Endpoints | 2 | 🔄 To Do |
| TASK-3.1.1.4 | Integrate with Login Flow | 1 | 🔄 To Do |
| **Total** | | **8** | |

---

### 📘 User Story: US-3.1.2 - SMS-Based MFA

**Story ID:** US-3.1.2
**Feature:** FEATURE-2.6 (Multi-Factor Authentication)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 8
**Priority:** P0 (Must Have)
**Sprint:** Sprint 3
**Status:** 🔄 Not Started

---

#### User Story

```
As a user without an authenticator app
I want to enable SMS-based MFA
So that I can secure my account using my mobile phone
```

---

#### Business Value

**Value Statement:**
SMS MFA provides accessible 2FA for users without authenticator apps, balancing security and user experience.

**Impact:**
- **High:** Increases MFA adoption by 50% (users without authenticator apps)
- **Accessibility:** Lower barrier to entry than TOTP
- **Compliance:** Meets basic 2FA requirements

**Success Criteria:**
- 20% of users enable SMS MFA
- < 10 seconds SMS delivery time (p95)
- 99% SMS delivery success rate
- < $0.05 cost per SMS

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can enable SMS MFA
- [ ] **AC2:** 6-digit SMS code sent to verified phone number
- [ ] **AC3:** Code valid for 10 minutes
- [ ] **AC4:** Phone number must be verified before enabling SMS MFA
- [ ] **AC5:** Phone number change triggers MFA re-verification
- [ ] **AC6:** User can resend SMS code (rate limited)
- [ ] **AC7:** SMS template professional and branded
- [ ] **AC8:** International SMS support (E.164 format)
- [ ] **AC9:** Backup codes generated upon SMS MFA activation

**Security:**
- [ ] **AC10:** Rate limiting: 3 SMS requests per hour
- [ ] **AC11:** Rate limiting: 5 verification attempts per 15 minutes
- [ ] **AC12:** SIM swap detection warnings
- [ ] **AC13:** SMS code cannot be reused
- [ ] **AC14:** Code invalidated after successful verification
- [ ] **AC15:** Audit log for SMS sending and verification

**Non-Functional:**
- [ ] **AC16:** SMS delivery < 10 seconds (p95)
- [ ] **AC17:** Twilio integration (primary)
- [ ] **AC18:** Fallback provider for redundancy
- [ ] **AC19:** Cost optimization (cached codes for retries)

---

#### Technical Specifications

**Endpoint:** `POST /api/v1/auth/mfa/sms/send`

**Request:**
```typescript
{
  "phone_number": "+2348012345678" // Optional, uses registered phone if not provided
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "message": "SMS code sent to +234801****678",
    "expires_in": 600,
    "can_resend_after": 60
  }
}
```

**SMS Template:**
```
Payment Platform: Your verification code is 123456. Valid for 10 minutes. Never share this code.
```

**Twilio Integration:**
```typescript
@Injectable()
export class SmsService {
  private twilioClient: Twilio;

  constructor(
    private configService: ConfigService,
    private redis: RedisService,
  ) {
    this.twilioClient = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN')
    );
  }

  async sendMfaCode(phoneNumber: string, userId: string): Promise<void> {
    // 1. Check rate limit
    const rateLimitKey = `sms-rate-limit:${userId}`;
    const sendCount = await this.redis.get(rateLimitKey);

    if (sendCount && parseInt(sendCount) >= 3) {
      throw new BadRequestException('SMS rate limit exceeded. Try again in 1 hour.');
    }

    // 2. Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();

    // 3. Store in Redis (10 minutes)
    await this.redis.setex(`sms-mfa:${userId}`, 600, code);

    // 4. Send SMS
    await this.twilioClient.messages.create({
      body: `Payment Platform: Your verification code is ${code}. Valid for 10 minutes. Never share this code.`,
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
      to: phoneNumber,
    });

    // 5. Increment rate limit counter
    await this.redis.incr(rateLimitKey);
    await this.redis.expire(rateLimitKey, 3600);

    // 6. Set resend cooldown (60 seconds)
    await this.redis.setex(`sms-resend:${userId}`, 60, '1');
  }

  async verifySmsCode(userId: string, code: string): Promise<boolean> {
    const storedCode = await this.redis.get(`sms-mfa:${userId}`);

    if (!storedCode) {
      throw new GoneException('SMS code expired');
    }

    if (code !== storedCode) {
      throw new BadRequestException('Invalid SMS code');
    }

    // Code valid - delete it (single use)
    await this.redis.del(`sms-mfa:${userId}`);

    return true;
  }
}
```

---

#### Testing Checklist

- [ ] Test SMS code generation
- [ ] Test SMS sending (Twilio)
- [ ] Test SMS verification (valid)
- [ ] Test SMS verification (invalid)
- [ ] Test SMS verification (expired)
- [ ] Test rate limiting (3 per hour)
- [ ] Test resend cooldown (60 seconds)
- [ ] Test code single-use
- [ ] Test international phone numbers
- [ ] Test audit logging

---

#### Definition of Done

- [ ] Twilio integration complete
- [ ] SMS sending working
- [ ] Code generation and validation working
- [ ] Rate limiting implemented
- [ ] All tests passing
- [ ] Swagger documentation complete
- [ ] Code reviewed and merged

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-3.1.2.1 | Integrate Twilio SDK | 2 | 🔄 To Do |
| TASK-3.1.2.2 | Implement SMS Service | 3 | 🔄 To Do |
| TASK-3.1.2.3 | Create SMS MFA Endpoints | 2 | 🔄 To Do |
| TASK-3.1.2.4 | Integrate with Login Flow | 1 | 🔄 To Do |
| **Total** | | **8** | |

---

### 📘 User Story: US-3.1.3 - Email-Based MFA

**Story ID:** US-3.1.3
**Feature:** FEATURE-2.6 (Multi-Factor Authentication)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 5
**Priority:** P1 (Should Have)
**Sprint:** Sprint 3
**Status:** 🔄 Not Started

---

#### User Story

```
As a user without SMS or authenticator app
I want to enable email-based MFA
So that I can secure my account using my email
```

---

#### Business Value

**Value Statement:**
Email MFA provides the lowest barrier to entry for 2FA, ensuring all users can enable MFA regardless of device capabilities.

**Impact:**
- **Medium:** Fallback option for users without phone/authenticator
- **Accessibility:** Works for all users with email
- **Adoption:** Increases overall MFA adoption

**Success Criteria:**
- 10% of users enable email MFA
- < 5 seconds email delivery time
- 99.5% email delivery success rate

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can enable email-based MFA
- [ ] **AC2:** 6-digit code sent to verified email
- [ ] **AC3:** Code valid for 10 minutes
- [ ] **AC4:** HTML email template (professional)
- [ ] **AC5:** Resend code capability (rate limited)
- [ ] **AC6:** Email change triggers MFA re-verification

**Security:**
- [ ] **AC7:** Rate limiting: 3 emails per hour
- [ ] **AC8:** Code single-use
- [ ] **AC9:** Audit log for email MFA

**Non-Functional:**
- [ ] **AC10:** Email delivery < 5 seconds

---

#### Implementation

Similar to email verification (Sprint 2) but for MFA context.

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-3.1.3.1 | Create Email MFA Service | 2 | 🔄 To Do |
| TASK-3.1.3.2 | Create Email MFA Endpoints | 2 | 🔄 To Do |
| TASK-3.1.3.3 | Integrate with Login Flow | 1 | 🔄 To Do |
| **Total** | | **5** | |

---

### 📘 User Story: US-3.2.1 - Backup Codes

**Story ID:** US-3.2.1
**Feature:** FEATURE-2.6 (Multi-Factor Authentication)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 5
**Priority:** P0 (Must Have)
**Sprint:** Sprint 3
**Status:** 🔄 Not Started

---

#### User Story

```
As a user with MFA enabled
I want backup codes for account recovery
So that I can access my account if I lose my MFA device
```

---

#### Business Value

**Value Statement:**
Backup codes prevent account lockouts when MFA devices are lost, reducing support costs and preventing permanent account loss.

**Impact:**
- **Critical:** Prevents account abandonment due to lost MFA devices
- **Support:** Reduces MFA-related support tickets by 80%
- **UX:** Provides safety net for MFA users

**Success Criteria:**
- 95% of MFA users save backup codes
- < 5% of backup codes ever used
- Zero permanent account lockouts

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** 10 backup codes generated when MFA enabled
- [ ] **AC2:** Each code 8 digits (e.g., 12345678)
- [ ] **AC3:** Codes downloadable as text file
- [ ] **AC4:** Codes single-use
- [ ] **AC5:** Used codes marked as consumed
- [ ] **AC6:** User can regenerate backup codes (invalidates old ones)
- [ ] **AC7:** Backup codes can be used in place of MFA code
- [ ] **AC8:** Backup code usage triggers security alert email

**Security:**
- [ ] **AC9:** Codes hashed with bcrypt before storage
- [ ] **AC10:** Codes never stored in plaintext
- [ ] **AC11:** Rate limiting: 5 backup code attempts per hour
- [ ] **AC12:** Audit log for backup code generation and usage

---

#### Implementation

**Backup Code Generation:**
```typescript
async generateBackupCodes(userId: string): Promise<string[]> {
  // 1. Invalidate old backup codes
  await this.backupCodesRepository.update(
    { user_id: userId },
    { used: true, used_at: new Date() }
  );

  // 2. Generate 10 new codes
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomInt(10000000, 99999999).toString();
    codes.push(code);

    const codeHash = await bcrypt.hash(code, 10);
    await this.backupCodesRepository.save({
      user_id: userId,
      code_hash: codeHash,
    });
  }

  // 3. Audit log
  await this.auditLogService.log({
    user_id: userId,
    action: 'BACKUP_CODES_GENERATED',
    resource: 'MFA',
  });

  return codes;
}

async verifyBackupCode(userId: string, code: string): Promise<boolean> {
  const backupCodes = await this.backupCodesRepository.find({
    where: { user_id: userId, used: false }
  });

  for (const backupCode of backupCodes) {
    const isValid = await bcrypt.compare(code, backupCode.code_hash);

    if (isValid) {
      // Mark as used
      await this.backupCodesRepository.update(
        { id: backupCode.id },
        { used: true, used_at: new Date() }
      );

      // Send alert email
      await this.emailService.sendBackupCodeUsedAlert(userId);

      // Audit log
      await this.auditLogService.log({
        user_id: userId,
        action: 'BACKUP_CODE_USED',
        resource: 'MFA',
      });

      return true;
    }
  }

  throw new UnauthorizedException('Invalid backup code');
}
```

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-3.2.1.1 | Implement Backup Code Service | 2 | 🔄 To Do |
| TASK-3.2.1.2 | Create Backup Code Endpoints | 2 | 🔄 To Do |
| TASK-3.2.1.3 | Integrate with MFA Verification | 1 | 🔄 To Do |
| **Total** | | **5** | |

---

### 📘 User Story: US-3.3.1 - Device Management

**Story ID:** US-3.3.1
**Feature:** FEATURE-2.7 (Session Management)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 8
**Priority:** P1 (Should Have)
**Sprint:** Sprint 3
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to manage my logged-in devices
So that I can see where my account is accessed and revoke suspicious sessions
```

---

#### Business Value

**Value Statement:**
Device management provides visibility and control over account access, enabling users to detect and prevent unauthorized access.

**Impact:**
- **High:** Enables users to detect unauthorized access
- **Security:** Allows immediate session revocation
- **Transparency:** Builds user trust

**Success Criteria:**
- 40% of users check active sessions monthly
- 5% of users revoke sessions
- < 1% of sessions are unauthorized

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can view all active sessions
- [ ] **AC2:** Session info: device, browser, OS, IP, location, login time
- [ ] **AC3:** Current session clearly marked
- [ ] **AC4:** User can revoke individual sessions
- [ ] **AC5:** User can revoke all sessions except current
- [ ] **AC6:** Trusted device option (skip MFA for 30 days)
- [ ] **AC7:** Email notification when new device logs in
- [ ] **AC8:** Push notification for suspicious login attempts

**Security:**
- [ ] **AC9:** Device fingerprinting
- [ ] **AC10:** Session tied to device + IP
- [ ] **AC11:** Session expiry: 30 days inactive, 90 days absolute
- [ ] **AC12:** Audit log for session creation/revocation

---

#### Implementation

**Sessions Table:**
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_id UUID REFERENCES refresh_tokens(id),
  device_fingerprint VARCHAR(255),
  device_name VARCHAR(255), -- "Chrome on Windows"
  ip_address INET,
  location VARCHAR(255), -- "Lagos, Nigeria"
  user_agent TEXT,
  is_trusted BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-3.3.1.1 | Create Sessions Database Schema | 2 | 🔄 To Do |
| TASK-3.3.1.2 | Implement Device Fingerprinting | 2 | 🔄 To Do |
| TASK-3.3.1.3 | Create Session Management Endpoints | 3 | 🔄 To Do |
| TASK-3.3.1.4 | Implement Trusted Devices | 1 | 🔄 To Do |
| **Total** | | **8** | |

---

### 📘 User Story: US-3.4.1 - Force MFA for High-Value Operations

**Story ID:** US-3.4.1
**Feature:** FEATURE-2.7 (Session Management)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 4
**Priority:** P1 (Should Have)
**Sprint:** Sprint 3
**Status:** 🔄 Not Started

---

#### User Story

```
As a platform
I want to require MFA for high-value operations
So that I can prevent unauthorized transactions even with stolen session tokens
```

---

#### Business Value

**Value Statement:**
Step-up authentication for sensitive operations adds defense-in-depth, protecting against session hijacking and XSS attacks.

**Impact:**
- **Critical:** Prevents unauthorized transactions
- **Compliance:** Required for PCI-DSS
- **Risk Reduction:** Mitigates token theft impact

**Success Criteria:**
- 100% of high-value operations protected
- < 5% user friction (cached for 5 minutes)
- Zero unauthorized high-value operations

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Withdraw funds requires MFA
- [ ] **AC2:** Add bank account requires MFA
- [ ] **AC3:** Add card requires MFA
- [ ] **AC4:** Change password requires MFA
- [ ] **AC5:** Disable MFA requires MFA
- [ ] **AC6:** MFA cached for 5 minutes per operation type
- [ ] **AC7:** Clear MFA cache on logout

**Security:**
- [ ] **AC8:** MFA cache stored in Redis with TTL
- [ ] **AC9:** MFA cache tied to session ID
- [ ] **AC10:** Audit log for step-up authentication

---

#### Implementation

**MFA Guard:**
```typescript
@Injectable()
export class MfaRequiredGuard implements CanActivate {
  constructor(
    private redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user has MFA enabled
    if (!user.mfa_enabled) {
      throw new ForbiddenException('MFA must be enabled for this operation');
    }

    // Check if MFA was recently verified for this operation
    const operationType = this.getOperationType(context);
    const cacheKey = `mfa-stepup:${user.id}:${operationType}`;
    const cachedVerification = await this.redis.get(cacheKey);

    if (cachedVerification) {
      return true; // MFA verified within last 5 minutes
    }

    // Require MFA verification
    throw new ForbiddenException({
      code: 'MFA_REQUIRED',
      message: 'This operation requires MFA verification',
      operation: operationType,
    });
  }

  private getOperationType(context: ExecutionContext): string {
    const handler = context.getHandler();
    return Reflect.getMetadata('operation-type', handler) || 'unknown';
  }
}

// Usage
@Post('withdraw')
@UseGuards(JwtAuthGuard, MfaRequiredGuard)
@SetMetadata('operation-type', 'withdraw')
async withdraw(@Body() dto: WithdrawDto) {
  // ...
}
```

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-3.4.1.1 | Create MFA Required Guard | 2 | 🔄 To Do |
| TASK-3.4.1.2 | Implement MFA Step-Up Flow | 1 | 🔄 To Do |
| TASK-3.4.1.3 | Apply to High-Value Endpoints | 1 | 🔄 To Do |
| **Total** | | **4** | |

---

## Sprint 3 Summary

### User Stories Overview

| Story ID | Story Name | Story Points | Status |
|----------|------------|--------------|--------|
| US-3.1.1 | TOTP-Based MFA | 8 | 🔄 To Do |
| US-3.1.2 | SMS-Based MFA | 8 | 🔄 To Do |
| US-3.1.3 | Email-Based MFA | 5 | 🔄 To Do |
| US-3.2.1 | Backup Codes | 5 | 🔄 To Do |
| US-3.3.1 | Device Management | 8 | 🔄 To Do |
| US-3.4.1 | Force MFA for High-Value Operations | 4 | 🔄 To Do |
| **Total** | | **38** | |

---

## Sprint 3 Velocity Tracking

**Planned Story Points:** 38 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

### Burndown Chart (To be updated daily)

| Day | Remaining SP | Completed SP | Notes |
|-----|--------------|--------------|-------|
| Day 1 | 38 | 0 | Sprint kickoff |
| Day 2 | | | |
| Day 3 | | | |
| ... | | | |
| Day 10 | 0 | 38 | Sprint complete (target) |

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
