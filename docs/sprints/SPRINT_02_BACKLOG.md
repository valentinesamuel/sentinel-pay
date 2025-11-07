# Sprint 2 Backlog - User Authentication & Authorization

**Sprint:** Sprint 2
**Duration:** 2 weeks (Week 5-6)
**Sprint Goal:** Implement complete user authentication system with registration, login, JWT tokens, password management, and role-based access control
**Story Points Committed:** 42
**Team Capacity:** 42 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** 40 SP (from Sprint 0), 45 SP (from Sprint 1) → Average: 42.5 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 2, we will have:
1. User registration with email verification
2. Secure login with JWT tokens
3. Password reset functionality
4. Role-based access control (RBAC)
5. Session management with refresh tokens
6. Account lockout after failed attempts
7. Logout functionality
8. User profile management

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests for auth flows passing
- [ ] Security tests passing (SQL injection, XSS, brute force)
- [ ] API documentation updated (Swagger)
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-2: User Management & Authentication

## FEATURE-2.1: User Registration

### 📘 User Story: US-2.1.1 - User Registration

**Story ID:** US-2.1.1
**Feature:** FEATURE-2.1 (User Registration)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 8
**Priority:** P0 (Must Have)
**Sprint:** Sprint 2
**Status:** 🔄 Not Started

---

#### User Story

```
As a new user
I want to register for an account using my email and password
So that I can access the payment platform
```

---

#### Business Value

**Value Statement:**
User registration is the entry point to the platform. Without it, no users can access services. This is critical for user acquisition and platform growth.

**Impact:**
- **High:** Blocks all user-dependent features
- **Critical Path:** Yes - Required for all subsequent user features
- **Business Metric:** Enables user onboarding and growth tracking

**Success Criteria:**
- 90% of valid registration attempts succeed
- < 3 seconds average registration time
- Email verification sent within 1 second
- Zero security vulnerabilities in registration flow

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can register with email, password, first name, last name, phone number, country
- [ ] **AC2:** Email must be unique (duplicate check)
- [ ] **AC3:** Password must meet complexity requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&*)
- [ ] **AC4:** Phone number must be unique (if provided)
- [ ] **AC5:** Email verification email sent automatically after registration
- [ ] **AC6:** User account created with status 'active' but email_verified = false
- [ ] **AC7:** KYC tier set to 0 (unverified) by default
- [ ] **AC8:** Unique referral code generated automatically (format: USER-{6 random alphanumeric})
- [ ] **AC9:** If referral code provided, associate with referring user
- [ ] **AC10:** NGN wallet created automatically for new user
- [ ] **AC11:** User object returned in response (without password)
- [ ] **AC12:** Proper error messages for validation failures
- [ ] **AC13:** Rate limiting: 3 registration attempts per hour per IP

**Non-Functional:**
- [ ] **AC14:** Password hashed with bcrypt (12 rounds)
- [ ] **AC15:** Response time < 3 seconds (p95)
- [ ] **AC16:** Input validation prevents SQL injection
- [ ] **AC17:** Input sanitization prevents XSS attacks
- [ ] **AC18:** HTTPS required (no plaintext passwords)
- [ ] **AC19:** Audit log entry created for registration
- [ ] **AC20:** Email validation regex compliant with RFC 5322

---

#### Technical Specifications

**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```typescript
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+2348012345678",  // Optional
  "country_code": "NG",               // ISO 3166-1 alpha-2
  "referral_code": "USER-ABC123"      // Optional
}
```

**Response (201 Created):**
```typescript
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+2348012345678",
      "country_code": "NG",
      "email_verified": false,
      "phone_verified": false,
      "kyc_tier": 0,
      "kyc_status": "pending",
      "status": "active",
      "referral_code": "USER-XYZ789",
      "created_at": "2024-01-15T10:00:00Z"
    },
    "message": "Registration successful. Please check your email to verify your account."
  }
}
```

**Error Response (400 Bad Request - Duplicate Email):**
```typescript
{
  "status": "error",
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Email already registered",
    "details": {
      "field": "email",
      "value": "user@example.com"
    }
  }
}
```

**Error Response (400 Bad Request - Weak Password):**
```typescript
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "password",
        "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      }
    ]
  }
}
```

**Error Response (429 Too Many Requests):**
```typescript
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many registration attempts. Please try again later.",
    "retry_after": 3600
  }
}
```

---

#### Database Changes

**Tables Modified:**
- `users` - INSERT new user record
- `wallets` - INSERT default NGN wallet
- `audit_logs` - INSERT registration event

**User Record:**
```sql
INSERT INTO users (
  id, email, password_hash, first_name, last_name,
  phone_number, country_code, status, email_verified,
  phone_verified, kyc_tier, kyc_status, referral_code,
  referred_by_id, created_at, updated_at
) VALUES (
  uuid_generate_v4(),
  'user@example.com',
  '$2b$12$...', -- bcrypt hash
  'John',
  'Doe',
  '+2348012345678',
  'NG',
  'active',
  false,
  false,
  0,
  'pending',
  'USER-XYZ789',
  NULL, -- or referring user ID
  NOW(),
  NOW()
);
```

**Default Wallet:**
```sql
INSERT INTO wallets (
  id, user_id, currency, available_balance,
  ledger_balance, pending_balance, status, is_primary
) VALUES (
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440000', -- user ID
  'NGN',
  0,
  0,
  0,
  'active',
  true
);
```

---

#### Implementation Details

**DTO (Data Transfer Object):**
```typescript
// dto/register-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  MaxLength,
  IsAlpha
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address (must be unique)'
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password (min 8 chars, must contain uppercase, lowercase, number, special char)'
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, number, and special character' }
  )
  password: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  last_name: string;

  @ApiProperty({
    example: '+2348012345678',
    description: 'Phone number in E.164 format',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Invalid phone number format (use E.164: +2348012345678)' })
  phone_number?: string;

  @ApiProperty({
    example: 'NG',
    description: 'Country code (ISO 3166-1 alpha-2)'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  @Matches(/^[A-Z]{2}$/, { message: 'Country code must be 2 uppercase letters (ISO 3166-1)' })
  country_code: string;

  @ApiProperty({
    example: 'USER-ABC123',
    description: 'Referral code from existing user (optional)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^USER-[A-Z0-9]{6}$/, { message: 'Invalid referral code format' })
  referral_code?: string;
}
```

**Service Implementation:**
```typescript
// users.service.ts
import * as bcrypt from 'bcrypt';
import { ConflictException, BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    private auditLogService: AuditLogService,
    private emailService: EmailService,
    private dataSource: DataSource
  ) {}

  async register(dto: RegisterUserDto): Promise<User> {
    // 1. Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // 2. Check if phone number already exists (if provided)
    if (dto.phone_number) {
      const existingPhone = await this.usersRepository.findOne({
        where: { phone_number: dto.phone_number }
      });

      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // 3. Validate referral code (if provided)
    let referrerId: string | null = null;
    if (dto.referral_code) {
      const referrer = await this.usersRepository.findOne({
        where: { referral_code: dto.referral_code }
      });

      if (!referrer) {
        throw new BadRequestException('Invalid referral code');
      }

      referrerId = referrer.id;
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // 5. Generate referral code
    const referralCode = this.generateReferralCode();

    // 6. Create user and wallet in transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user
      const user = this.usersRepository.create({
        email: dto.email,
        password_hash: passwordHash,
        first_name: dto.first_name,
        last_name: dto.last_name,
        phone_number: dto.phone_number,
        country_code: dto.country_code,
        referral_code: referralCode,
        referred_by_id: referrerId,
        status: UserStatus.ACTIVE,
        email_verified: false,
        phone_verified: false,
        kyc_tier: 0,
        kyc_status: KYCStatus.PENDING,
      });

      const savedUser = await queryRunner.manager.save(user);

      // Create default NGN wallet
      const wallet = this.walletsRepository.create({
        user_id: savedUser.id,
        currency: 'NGN',
        available_balance: 0,
        ledger_balance: 0,
        pending_balance: 0,
        status: WalletStatus.ACTIVE,
        is_primary: true,
      });

      await queryRunner.manager.save(wallet);

      // Commit transaction
      await queryRunner.commitTransaction();

      // 7. Create audit log
      await this.auditLogService.log({
        user_id: savedUser.id,
        action: 'USER_REGISTERED',
        resource: 'User',
        resource_id: savedUser.id,
        new_value: {
          email: savedUser.email,
          kyc_tier: savedUser.kyc_tier,
        },
      });

      // 8. Send verification email (async)
      this.emailService.sendVerificationEmail(savedUser.email, savedUser.id)
        .catch(err => {
          // Log error but don't fail registration
          console.error('Failed to send verification email:', err);
        });

      // 9. Remove sensitive data before returning
      delete savedUser.password_hash;

      return savedUser;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'USER-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
```

**Controller Implementation:**
```typescript
// auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Ip, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private auditLogService: AuditLogService
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle(3, 3600) // 3 attempts per hour
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email or phone already registered' })
  @ApiResponse({ status: 429, description: 'Too many registration attempts' })
  async register(
    @Body() dto: RegisterUserDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string
  ) {
    const user = await this.usersService.register(dto);

    // Log registration with context
    await this.auditLogService.log({
      user_id: user.id,
      action: 'USER_REGISTERED',
      resource: 'User',
      resource_id: user.id,
      ip_address: ip,
      user_agent: userAgent,
    });

    return {
      status: 'success',
      data: {
        user,
        message: 'Registration successful. Please check your email to verify your account.',
      },
    };
  }
}
```

---

#### Testing Checklist

**Unit Tests:**
- [ ] Test successful registration with all fields
- [ ] Test successful registration with optional fields omitted
- [ ] Test duplicate email rejection
- [ ] Test duplicate phone number rejection
- [ ] Test invalid email format rejection
- [ ] Test weak password rejection
- [ ] Test invalid phone number format rejection
- [ ] Test invalid country code rejection
- [ ] Test invalid referral code rejection
- [ ] Test password hashing (bcrypt with 12 rounds)
- [ ] Test referral code generation (correct format)
- [ ] Test default wallet creation
- [ ] Test transaction rollback on error

**Integration Tests:**
- [ ] Test full registration flow (user + wallet created)
- [ ] Test database constraints enforced (unique email, phone)
- [ ] Test audit log created
- [ ] Test verification email sent
- [ ] Test rate limiting (3 attempts per hour)

**Security Tests:**
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention (input sanitization)
- [ ] Test password not returned in response
- [ ] Test password not logged
- [ ] Test HTTPS enforcement
- [ ] Test rate limiting bypass attempts

**E2E Tests:**
- [ ] Test complete user registration journey
- [ ] Test registration with referral code
- [ ] Test registration error handling
- [ ] Test concurrent registration attempts (same email)

---

#### Definition of Done

- [ ] DTO created with all validation decorators
- [ ] Service method implemented with bcrypt hashing
- [ ] Controller endpoint created with proper decorators
- [ ] Transaction handling for user + wallet creation
- [ ] Audit logging implemented
- [ ] Email verification sending (async)
- [ ] Rate limiting applied (3 per hour)
- [ ] All unit tests passing (100% coverage)
- [ ] All integration tests passing
- [ ] All security tests passing
- [ ] Swagger documentation complete
- [ ] Code reviewed
- [ ] Merged to develop branch

---

### Tasks Breakdown

---

### Task: TASK-2.1.1.1 - Create Registration DTO

**Task ID:** TASK-2.1.1.1
**Parent Story:** US-2.1.1
**Story Points:** 1
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create Data Transfer Object for user registration with complete validation rules.

**File Location:**
`apps/payment-api/src/modules/auth/dto/register-user.dto.ts`

**Implementation:**
See "DTO (Data Transfer Object)" section above

**Acceptance Criteria:**
- [ ] All fields defined with types
- [ ] Validation decorators applied
- [ ] Transform decorators for sanitization
- [ ] Swagger API property decorators
- [ ] Error messages clear and helpful
- [ ] Phone number validation (E.164 format)
- [ ] Password complexity validation
- [ ] Email lowercase transformation
- [ ] Trim whitespace from strings

**Testing:**
- [ ] Test each validation rule
- [ ] Test transformation (lowercase, trim)
- [ ] Test optional fields
- [ ] Test error messages

---

### Task: TASK-2.1.1.2 - Implement Registration Service Method

**Task ID:** TASK-2.1.1.2
**Parent Story:** US-2.1.1
**Story Points:** 3
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Implement the core registration logic in UsersService.

**File Location:**
`apps/payment-api/src/modules/users/users.service.ts`

**Implementation:**
See "Service Implementation" section above

**Business Logic:**
1. Check email uniqueness
2. Check phone uniqueness (if provided)
3. Validate referral code (if provided)
4. Hash password with bcrypt (12 rounds)
5. Generate referral code
6. Create user record
7. Create default NGN wallet
8. Use database transaction
9. Create audit log
10. Send verification email (async, non-blocking)

**Acceptance Criteria:**
- [ ] Duplicate email check
- [ ] Duplicate phone check
- [ ] Referral code validation
- [ ] Password hashed with bcrypt (12 rounds)
- [ ] Referral code generated (USER-{6 chars})
- [ ] Database transaction used
- [ ] User and wallet created atomically
- [ ] Transaction rollback on error
- [ ] Audit log created
- [ ] Verification email sent
- [ ] Password not returned in response

**Error Handling:**
- [ ] ConflictException for duplicate email
- [ ] ConflictException for duplicate phone
- [ ] BadRequestException for invalid referral code
- [ ] Transaction rollback on any error
- [ ] Email error logged but not thrown

**Testing:**
- [ ] Test successful registration
- [ ] Test duplicate email
- [ ] Test duplicate phone
- [ ] Test invalid referral code
- [ ] Test transaction rollback
- [ ] Test wallet creation
- [ ] Test audit log creation

---

### Task: TASK-2.1.1.3 - Create Registration Controller Endpoint

**Task ID:** TASK-2.1.1.3
**Parent Story:** US-2.1.1
**Story Points:** 2
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create POST /api/v1/auth/register endpoint with proper decorators and rate limiting.

**File Location:**
`apps/payment-api/src/modules/auth/auth.controller.ts`

**Implementation:**
See "Controller Implementation" section above

**Acceptance Criteria:**
- [ ] POST endpoint at /api/v1/auth/register
- [ ] @Throttle decorator (3 per hour)
- [ ] Swagger decorators complete
- [ ] HTTP 201 status code on success
- [ ] IP address captured
- [ ] User agent captured
- [ ] Audit log with context
- [ ] Proper error handling
- [ ] Response format matches spec

**Testing:**
- [ ] Test successful registration
- [ ] Test rate limiting (4th attempt fails)
- [ ] Test validation errors
- [ ] Test conflict errors
- [ ] Test response format
- [ ] Test Swagger documentation

---

### Task: TASK-2.1.1.4 - Create Email Verification Service

**Task ID:** TASK-2.1.1.4
**Parent Story:** US-2.1.1
**Story Points:** 2
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create service to send email verification emails with token.

**File Location:**
`apps/payment-api/src/modules/notifications/email.service.ts`

**Implementation:**
```typescript
// email.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(email: string, userId: string): Promise<void> {
    // Generate verification token (6-digit code or JWT)
    const verificationToken = this.generateVerificationToken();

    // Store token in Redis with 24-hour expiry
    await this.redis.setex(
      `email-verification:${userId}`,
      86400,
      verificationToken
    );

    // Send email
    await this.transporter.sendMail({
      from: '"Payment Platform" <noreply@paymentplatform.com>',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Welcome to Payment Platform!</h1>
        <p>Your verification code is: <strong>${verificationToken}</strong></p>
        <p>This code expires in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
    });
  }

  private generateVerificationToken(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
```

**Acceptance Criteria:**
- [ ] Nodemailer configured
- [ ] 6-digit verification code generated
- [ ] Token stored in Redis (24-hour TTL)
- [ ] Email template created
- [ ] Email sent successfully
- [ ] Errors logged but not thrown
- [ ] Non-blocking (async)

**Testing:**
- [ ] Test email sending (MailHog)
- [ ] Test token generation (6 digits)
- [ ] Test token storage in Redis
- [ ] Test token expiry (24 hours)
- [ ] Test error handling

---

## Summary of Tasks for US-2.1.1

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-2.1.1.1 | Create Registration DTO | 1 | 🔄 To Do |
| TASK-2.1.1.2 | Implement Registration Service | 3 | 🔄 To Do |
| TASK-2.1.1.3 | Create Registration Endpoint | 2 | 🔄 To Do |
| TASK-2.1.1.4 | Create Email Verification Service | 2 | 🔄 To Do |
| **Total** | | **8** | |

---

### 📘 User Story: US-2.1.2 - Email Verification

**Story ID:** US-2.1.2
**Feature:** FEATURE-2.1 (User Registration)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 5
**Priority:** P0 (Must Have)
**Sprint:** Sprint 2
**Status:** 🔄 Not Started

---

#### User Story

```
As a registered user
I want to verify my email address with a code sent to me
So that I can activate my account and ensure my email is valid
```

---

#### Business Value

**Value Statement:**
Email verification ensures users have access to their registered email, reduces spam accounts, and enables password recovery. Required for KYC compliance.

**Impact:**
- **High:** Required for account security and KYC compliance
- **Critical Path:** Yes - Blocks higher KYC tiers
- **Business Metric:** Reduces fraudulent accounts by 80%+

**Success Criteria:**
- 95% of users verify email within 24 hours
- < 500ms verification time
- Zero false positives/negatives
- 24-hour code expiry reduces replay attacks

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can verify email with 6-digit code
- [ ] **AC2:** Code valid for 24 hours
- [ ] **AC3:** Maximum 3 verification attempts per code
- [ ] **AC4:** Code case-insensitive
- [ ] **AC5:** User.email_verified set to true on success
- [ ] **AC6:** Invalid code returns clear error with attempts remaining
- [ ] **AC7:** Expired code returns specific error
- [ ] **AC8:** Successful verification triggers welcome email
- [ ] **AC9:** Resend verification email endpoint available
- [ ] **AC10:** Resend limited to 3 times per 24 hours
- [ ] **AC11:** Old codes invalidated when new code sent

**Non-Functional:**
- [ ] **AC12:** Rate limiting: 5 verification attempts per hour per IP
- [ ] **AC13:** Response time < 500ms
- [ ] **AC14:** Code stored securely in Redis (encrypted)
- [ ] **AC15:** Audit log for verification attempts
- [ ] **AC16:** Idempotent (multiple verifications with same code = same result)

---

#### Technical Specifications

**Endpoint 1:** `POST /api/v1/auth/verify-email`

**Request:**
```typescript
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "verification_code": "123456"
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "message": "Email verified successfully",
    "email_verified": true
  }
}
```

**Error Response (400 Bad Request - Invalid Code):**
```typescript
{
  "status": "error",
  "error": {
    "code": "INVALID_VERIFICATION_CODE",
    "message": "Invalid verification code",
    "attempts_remaining": 2
  }
}
```

**Error Response (410 Gone - Expired Code):**
```typescript
{
  "status": "error",
  "error": {
    "code": "VERIFICATION_CODE_EXPIRED",
    "message": "Verification code has expired. Please request a new code.",
    "can_resend": true
  }
}
```

**Endpoint 2:** `POST /api/v1/auth/resend-verification`

**Request:**
```typescript
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "message": "Verification email sent. Please check your inbox.",
    "email": "user@example.com",
    "expires_in": 86400
  }
}
```

---

#### Database Changes

**Tables Modified:**
- `users` - UPDATE email_verified = true
- `audit_logs` - INSERT verification event

**Update Query:**
```sql
UPDATE users
SET email_verified = true,
    updated_at = NOW(),
    version = version + 1
WHERE id = $1
  AND email_verified = false;
```

---

#### Implementation Details

**Service Method:**
```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private redis: RedisService,
    private emailService: EmailService,
    private auditLogService: AuditLogService,
  ) {}

  async verifyEmail(userId: string, code: string): Promise<void> {
    // 1. Get user
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Check if already verified
    if (user.email_verified) {
      return; // Idempotent
    }

    // 3. Get stored code from Redis
    const redisKey = `email-verification:${userId}`;
    const storedCode = await this.redis.get(redisKey);

    if (!storedCode) {
      throw new GoneException('Verification code expired. Please request a new code.');
    }

    // 4. Check attempts
    const attemptsKey = `email-verification-attempts:${userId}`;
    const attempts = parseInt(await this.redis.get(attemptsKey) || '0');

    if (attempts >= 3) {
      throw new BadRequestException('Maximum verification attempts exceeded. Please request a new code.');
    }

    // 5. Validate code
    if (code.toLowerCase() !== storedCode.toLowerCase()) {
      // Increment attempts
      await this.redis.incr(attemptsKey);
      await this.redis.expire(attemptsKey, 3600); // 1 hour

      const remaining = 3 - (attempts + 1);
      throw new BadRequestException({
        code: 'INVALID_VERIFICATION_CODE',
        message: 'Invalid verification code',
        attempts_remaining: remaining,
      });
    }

    // 6. Update user
    await this.usersRepository.update(
      { id: userId },
      { email_verified: true }
    );

    // 7. Delete codes from Redis
    await this.redis.del(redisKey);
    await this.redis.del(attemptsKey);

    // 8. Audit log
    await this.auditLogService.log({
      user_id: userId,
      action: 'EMAIL_VERIFIED',
      resource: 'User',
      resource_id: userId,
    });

    // 9. Send welcome email (async)
    this.emailService.sendWelcomeEmail(user.email, user.first_name)
      .catch(err => console.error('Failed to send welcome email:', err));
  }

  async resendVerificationEmail(userId: string): Promise<string> {
    // 1. Get user
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email_verified) {
      throw new BadRequestException('Email already verified');
    }

    // 2. Check resend limit
    const resendKey = `email-resend-count:${userId}`;
    const resendCount = parseInt(await this.redis.get(resendKey) || '0');

    if (resendCount >= 3) {
      throw new BadRequestException('Maximum resend attempts exceeded. Please try again in 24 hours.');
    }

    // 3. Invalidate old codes
    await this.redis.del(`email-verification:${userId}`);
    await this.redis.del(`email-verification-attempts:${userId}`);

    // 4. Send new code
    await this.emailService.sendVerificationEmail(user.email, user.id);

    // 5. Increment resend counter
    await this.redis.incr(resendKey);
    await this.redis.expire(resendKey, 86400); // 24 hours

    return user.email;
  }
}
```

---

#### Testing Checklist

**Unit Tests:**
- [ ] Test successful email verification
- [ ] Test invalid code rejection
- [ ] Test expired code rejection
- [ ] Test already verified (idempotent)
- [ ] Test max attempts exceeded
- [ ] Test attempts counter incremented
- [ ] Test attempts remaining calculated correctly
- [ ] Test case-insensitive code matching
- [ ] Test successful resend
- [ ] Test resend limit enforcement
- [ ] Test old code invalidation on resend

**Integration Tests:**
- [ ] Test full verification flow
- [ ] Test Redis code storage and retrieval
- [ ] Test database update
- [ ] Test audit log creation
- [ ] Test welcome email sent

**E2E Tests:**
- [ ] Test registration + verification flow
- [ ] Test verification with wrong code, then correct code
- [ ] Test resend verification flow

---

#### Definition of Done

- [ ] Verify email endpoint implemented
- [ ] Resend email endpoint implemented
- [ ] Redis code storage working
- [ ] Attempts tracking working
- [ ] User verification status updated
- [ ] Audit logging implemented
- [ ] Rate limiting applied
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Swagger documentation complete
- [ ] Code reviewed and merged

---

### Tasks Breakdown

---

### Task: TASK-2.1.2.1 - Create Verification DTO

**Task ID:** TASK-2.1.2.1
**Parent Story:** US-2.1.2
**Story Points:** 1
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create DTOs for email verification and resend verification.

**File Location:**
- `apps/payment-api/src/modules/auth/dto/verify-email.dto.ts`
- `apps/payment-api/src/modules/auth/dto/resend-verification.dto.ts`

**Implementation:**
```typescript
// verify-email.dto.ts
export class VerifyEmailDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID('4')
  user_id: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'Verification code must be 6 digits' })
  verification_code: string;
}

// resend-verification.dto.ts
export class ResendVerificationDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID('4')
  user_id: string;
}
```

**Acceptance Criteria:**
- [ ] VerifyEmailDto created
- [ ] ResendVerificationDto created
- [ ] Validation rules applied
- [ ] Swagger decorators added

---

### Task: TASK-2.1.2.2 - Implement Verification Logic

**Task ID:** TASK-2.1.2.2
**Parent Story:** US-2.1.2
**Story Points:** 2
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Implement email verification logic in AuthService.

**File Location:**
`apps/payment-api/src/modules/auth/auth.service.ts`

**Implementation:**
See "Service Method" section above

**Acceptance Criteria:**
- [ ] verifyEmail method implemented
- [ ] resendVerificationEmail method implemented
- [ ] Redis code validation
- [ ] Attempts tracking (max 3)
- [ ] User update on success
- [ ] Old code invalidation
- [ ] Idempotent behavior
- [ ] Welcome email sent

---

### Task: TASK-2.1.2.3 - Create Verification Endpoints

**Task ID:** TASK-2.1.2.3
**Parent Story:** US-2.1.2
**Story Points:** 2
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create verification and resend endpoints in AuthController.

**File Location:**
`apps/payment-api/src/modules/auth/auth.controller.ts`

**Implementation:**
```typescript
@Post('verify-email')
@HttpCode(HttpStatus.OK)
@Throttle(5, 3600) // 5 per hour
@ApiOperation({ summary: 'Verify email address' })
async verifyEmail(@Body() dto: VerifyEmailDto) {
  await this.authService.verifyEmail(dto.user_id, dto.verification_code);
  return {
    status: 'success',
    data: {
      message: 'Email verified successfully',
      email_verified: true,
    },
  };
}

@Post('resend-verification')
@HttpCode(HttpStatus.OK)
@Throttle(3, 3600) // 3 per hour
@ApiOperation({ summary: 'Resend verification email' })
async resendVerification(@Body() dto: ResendVerificationDto) {
  const email = await this.authService.resendVerificationEmail(dto.user_id);
  return {
    status: 'success',
    data: {
      message: 'Verification email sent. Please check your inbox.',
      email,
      expires_in: 86400,
    },
  };
}
```

**Acceptance Criteria:**
- [ ] POST /verify-email endpoint
- [ ] POST /resend-verification endpoint
- [ ] Rate limiting applied
- [ ] Proper HTTP status codes
- [ ] Swagger documentation

---

## Summary of Tasks for US-2.1.2

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-2.1.2.1 | Create Verification DTOs | 1 | 🔄 To Do |
| TASK-2.1.2.2 | Implement Verification Logic | 2 | 🔄 To Do |
| TASK-2.1.2.3 | Create Verification Endpoints | 2 | 🔄 To Do |
| **Total** | | **5** | |

---

## FEATURE-2.2: Authentication

### 📘 User Story: US-2.2.1 - User Login

**Story ID:** US-2.2.1
**Feature:** FEATURE-2.2 (Authentication)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 8
**Priority:** P0 (Must Have)
**Sprint:** Sprint 2
**Status:** 🔄 Not Started

---

#### User Story

```
As a registered user
I want to log in with my email and password
So that I can access my account and use platform services
```

---

#### Business Value

**Value Statement:**
Login is the primary method for users to access their accounts. Secure authentication is critical for protecting user funds and data.

**Impact:**
- **Critical:** Required for all authenticated operations
- **Security:** Implements defense against brute force attacks
- **Business Metric:** < 1 second login time improves UX

**Success Metrics:**
- 95% of valid login attempts succeed
- < 1 second login time (p95)
- Zero unauthorized access attempts succeed
- 99.9% uptime for authentication service

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can login with email + password
- [ ] **AC2:** Case-insensitive email matching
- [ ] **AC3:** Password verified with bcrypt.compare
- [ ] **AC4:** JWT access token issued (1 hour expiry)
- [ ] **AC5:** JWT refresh token issued (7 day expiry)
- [ ] **AC6:** Both tokens use RS256 (asymmetric encryption)
- [ ] **AC7:** JWT payload includes: user_id, email, role, kyc_tier
- [ ] **AC8:** last_login_at timestamp updated
- [ ] **AC9:** last_login_ip recorded
- [ ] **AC10:** failed_login_attempts reset to 0 on success
- [ ] **AC11:** Returns user object (without password)
- [ ] **AC12:** Device ID tracking (optional)

**Security:**
- [ ] **AC13:** Rate limiting: 5 attempts per 15 minutes per IP
- [ ] **AC14:** Account lockout after 5 failed attempts
- [ ] **AC15:** Lockout duration: 30 minutes
- [ ] **AC16:** failed_login_attempts counter incremented
- [ ] **AC17:** locked_until timestamp set on lockout
- [ ] **AC18:** Clear error for locked account
- [ ] **AC19:** Generic error for invalid credentials (don't reveal if email exists)
- [ ] **AC20:** Audit log for all login attempts (success and failure)
- [ ] **AC21:** Password not logged anywhere

**Non-Functional:**
- [ ] **AC22:** Response time < 1 second (p95)
- [ ] **AC23:** JWT tokens cryptographically secure
- [ ] **AC24:** HTTPS required
- [ ] **AC25:** Constant-time comparison (timing attack resistant)

---

#### Technical Specifications

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```typescript
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "device_id": "550e8400-e29b-41d4-a716-446655440000" // Optional
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJreWNfdGllciI6MSwiaWF0IjoxNzA1MzE1MjAwLCJleHAiOjE3MDUzMTg4MDB9...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3MDUzMTUyMDAsImV4cCI6MTcwNTkyMDAwMH0...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "email_verified": true,
      "kyc_tier": 1,
      "status": "active",
      "last_login_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

**Error Response (401 Unauthorized):**
```typescript
{
  "status": "error",
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid email or password"
  }
}
```

**Error Response (403 Forbidden - Account Locked):**
```typescript
{
  "status": "error",
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account locked due to multiple failed login attempts. Please try again later.",
    "locked_until": "2024-01-15T11:00:00Z",
    "retry_after": 1800
  }
}
```

**Error Response (403 Forbidden - Email Not Verified):**
```typescript
{
  "status": "error",
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email address before logging in",
    "can_resend": true
  }
}
```

---

#### JWT Token Structure

**Access Token Payload:**
```typescript
{
  "sub": "550e8400-e29b-41d4-a716-446655440000", // User ID
  "email": "user@example.com",
  "role": "user",
  "kyc_tier": 1,
  "iat": 1705315200,
  "exp": 1705318800, // 1 hour from iat
  "jti": "access-token-uuid"
}
```

**Refresh Token Payload:**
```typescript
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "type": "refresh",
  "iat": 1705315200,
  "exp": 1705920000, // 7 days from iat
  "jti": "refresh-token-uuid"
}
```

**Token Signing:**
- Algorithm: RS256 (RSA Signature with SHA-256)
- Private key: 2048-bit RSA key
- Public key: For verification
- Key rotation: Every 90 days

---

#### Database Changes

**Tables Modified:**
- `users` - UPDATE last_login_at, last_login_ip, failed_login_attempts, locked_until
- `refresh_tokens` - INSERT new refresh token record (for token rotation)
- `audit_logs` - INSERT login event

**Update Query (Success):**
```sql
UPDATE users
SET last_login_at = NOW(),
    last_login_ip = $2,
    failed_login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW(),
    version = version + 1
WHERE id = $1;
```

**Update Query (Failed Attempt):**
```sql
UPDATE users
SET failed_login_attempts = failed_login_attempts + 1,
    locked_until = CASE
      WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
      ELSE NULL
    END,
    updated_at = NOW(),
    version = version + 1
WHERE email = $1;
```

---

#### Implementation Details

**JWT Service:**
```typescript
// jwt.service.ts
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private privateKey: Buffer;
  private publicKey: Buffer;

  constructor(private configService: ConfigService) {
    this.privateKey = fs.readFileSync(
      this.configService.get('JWT_PRIVATE_KEY_PATH')
    );
    this.publicKey = fs.readFileSync(
      this.configService.get('JWT_PUBLIC_KEY_PATH')
    );
  }

  generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role || 'user',
      kyc_tier: user.kyc_tier,
      jti: uuidv4(),
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
    });
  }

  generateRefreshToken(userId: string): string {
    const payload = {
      sub: userId,
      type: 'refresh',
      jti: uuidv4(),
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '7d',
    });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

**Auth Service Login Method:**
```typescript
// auth.service.ts
async login(dto: LoginDto, ip: string): Promise<LoginResponse> {
  // 1. Find user by email (case-insensitive)
  const user = await this.usersRepository.findOne({
    where: { email: dto.email.toLowerCase() },
  });

  // 2. Check if user exists (use generic error)
  if (!user) {
    await this.auditLogService.log({
      action: 'LOGIN_FAILED',
      resource: 'Auth',
      ip_address: ip,
      metadata: { reason: 'user_not_found', email: dto.email },
    });
    throw new UnauthorizedException('Invalid email or password');
  }

  // 3. Check if account is locked
  if (user.locked_until && user.locked_until > new Date()) {
    throw new ForbiddenException({
      code: 'ACCOUNT_LOCKED',
      message: 'Account locked due to multiple failed login attempts',
      locked_until: user.locked_until,
      retry_after: Math.ceil((user.locked_until.getTime() - Date.now()) / 1000),
    });
  }

  // 4. Check if email is verified
  if (!user.email_verified) {
    throw new ForbiddenException({
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email address before logging in',
      can_resend: true,
    });
  }

  // 5. Verify password
  const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);

  if (!isPasswordValid) {
    // Increment failed attempts
    await this.handleFailedLogin(user);

    await this.auditLogService.log({
      user_id: user.id,
      action: 'LOGIN_FAILED',
      resource: 'Auth',
      ip_address: ip,
      metadata: { reason: 'invalid_password' },
    });

    throw new UnauthorizedException('Invalid email or password');
  }

  // 6. Reset failed attempts and update last login
  await this.usersRepository.update(
    { id: user.id },
    {
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date(),
      last_login_ip: ip,
    }
  );

  // 7. Generate JWT tokens
  const accessToken = this.jwtService.generateAccessToken(user);
  const refreshToken = this.jwtService.generateRefreshToken(user.id);

  // 8. Store refresh token in database
  await this.refreshTokensRepository.save({
    user_id: user.id,
    token_hash: await bcrypt.hash(refreshToken, 10),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    device_id: dto.device_id,
  });

  // 9. Audit log
  await this.auditLogService.log({
    user_id: user.id,
    action: 'LOGIN_SUCCESS',
    resource: 'Auth',
    ip_address: ip,
    metadata: { device_id: dto.device_id },
  });

  // 10. Remove password from response
  delete user.password_hash;

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: 3600,
    user,
  };
}

private async handleFailedLogin(user: User): Promise<void> {
  const newFailedAttempts = user.failed_login_attempts + 1;
  const updateData: any = {
    failed_login_attempts: newFailedAttempts,
  };

  // Lock account after 5 failed attempts
  if (newFailedAttempts >= 5) {
    updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }

  await this.usersRepository.update({ id: user.id }, updateData);
}
```

---

#### Testing Checklist

**Unit Tests:**
- [ ] Test successful login
- [ ] Test invalid email
- [ ] Test invalid password
- [ ] Test generic error message (don't reveal if email exists)
- [ ] Test account lockout after 5 failures
- [ ] Test locked_until prevents login
- [ ] Test lockout expiry (can login after 30 min)
- [ ] Test failed_login_attempts incremented
- [ ] Test failed_login_attempts reset on success
- [ ] Test last_login_at updated
- [ ] Test last_login_ip recorded
- [ ] Test JWT tokens generated
- [ ] Test JWT payload correct
- [ ] Test password not in response
- [ ] Test email not verified error

**Integration Tests:**
- [ ] Test full login flow
- [ ] Test account lockout flow
- [ ] Test JWT token validation with JwtGuard
- [ ] Test refresh token stored in database
- [ ] Test rate limiting enforcement
- [ ] Test Swagger documentation

**Security Tests:**
- [ ] Test SQL injection prevention
- [ ] Test timing attack resistance (constant-time comparison)
- [ ] Test brute force mitigation (rate limiting + lockout)
- [ ] Test token tampering detection
- [ ] Test password not logged

---

#### Definition of Done

- [ ] Login endpoint implemented
- [ ] JWT service implemented
- [ ] Account lockout logic working
- [ ] Failed attempts tracking working
- [ ] Refresh token storage working
- [ ] Rate limiting applied
- [ ] All unit tests passing (15+ tests)
- [ ] All integration tests passing (6+ tests)
- [ ] All security tests passing (5+ tests)
- [ ] Performance target met (< 1s)
- [ ] Swagger documentation complete
- [ ] Code reviewed and merged

---

### Tasks Breakdown

---

### Task: TASK-2.2.1.1 - Create Login DTO

**Task ID:** TASK-2.2.1.1
**Parent Story:** US-2.2.1
**Story Points:** 1
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create Data Transfer Object for user login.

**File Location:**
`apps/payment-api/src/modules/auth/dto/login.dto.ts`

**Implementation:**
```typescript
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID('4')
  device_id?: string;
}
```

---

### Task: TASK-2.2.1.2 - Implement JWT Service

**Task ID:** TASK-2.2.1.2
**Parent Story:** US-2.2.1
**Story Points:** 3
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Implement JWT token generation and verification service using RS256.

**File Location:**
`apps/payment-api/src/modules/auth/jwt.service.ts`

**Implementation:**
See "JWT Service" section above

**Additional Requirements:**
- Generate RSA key pair (2048-bit)
- Store keys in secure location
- Implement token verification
- Handle token expiration

---

### Task: TASK-2.2.1.3 - Implement Login Logic

**Task ID:** TASK-2.2.1.3
**Parent Story:** US-2.2.1
**Story Points:** 3
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Implement login logic in AuthService with account lockout and failed attempt tracking.

**File Location:**
`apps/payment-api/src/modules/auth/auth.service.ts`

**Implementation:**
See "Auth Service Login Method" section above

---

### Task: TASK-2.2.1.4 - Create Login Endpoint

**Task ID:** TASK-2.2.1.4
**Parent Story:** US-2.2.1
**Story Points:** 1
**Assignee:** [Developer]
**Status:** 🔄 To Do

**Description:**
Create POST /api/v1/auth/login endpoint.

**File Location:**
`apps/payment-api/src/modules/auth/auth.controller.ts`

**Implementation:**
```typescript
@Post('login')
@HttpCode(HttpStatus.OK)
@Throttle(5, 900) // 5 per 15 minutes
@ApiOperation({ summary: 'User login' })
async login(
  @Body() dto: LoginDto,
  @Ip() ip: string
) {
  const result = await this.authService.login(dto, ip);
  return {
    status: 'success',
    data: result,
  };
}
```

---

## Summary of Tasks for US-2.2.1

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-2.2.1.1 | Create Login DTO | 1 | 🔄 To Do |
| TASK-2.2.1.2 | Implement JWT Service | 3 | 🔄 To Do |
| TASK-2.2.1.3 | Implement Login Logic | 3 | 🔄 To Do |
| TASK-2.2.1.4 | Create Login Endpoint | 1 | 🔄 To Do |
| **Total** | | **8** | |

---

### 📘 User Story: US-2.2.2 - Token Refresh

**Story ID:** US-2.2.2
**Feature:** FEATURE-2.2 (Authentication)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 5
**Priority:** P0 (Must Have)
**Sprint:** Sprint 2
**Status:** 🔄 Not Started

---

#### User Story

```
As a logged-in user
I want to refresh my access token using my refresh token
So that I can maintain my authenticated session without re-entering credentials
```

---

#### Business Value

**Value Statement:**
Token refresh provides seamless user experience by preventing frequent re-logins while maintaining security through short-lived access tokens.

**Impact:**
- **High:** Improves UX - users stay logged in
- **Security:** Allows short access token expiry (1 hour) without UX degradation
- **Business Metric:** Reduces login friction, increases engagement

**Success Criteria:**
- < 500ms token refresh time
- Token rotation implemented (one-time use refresh tokens)
- Zero unauthorized token refresh attempts succeed

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can exchange valid refresh token for new access token
- [ ] **AC2:** New access token issued (1 hour expiry)
- [ ] **AC3:** New refresh token issued (7 day expiry)
- [ ] **AC4:** Old refresh token invalidated (token rotation)
- [ ] **AC5:** Refresh token must be valid and not expired
- [ ] **AC6:** Refresh token must exist in database
- [ ] **AC7:** User must still be active (not suspended/deleted)
- [ ] **AC8:** Returns new token pair only (no user object)

**Security:**
- [ ] **AC9:** Rate limiting: 10 refresh requests per hour per user
- [ ] **AC10:** Old refresh token cannot be reused
- [ ] **AC11:** Expired refresh tokens rejected
- [ ] **AC12:** Invalid refresh tokens rejected
- [ ] **AC13:** Refresh token must match database hash
- [ ] **AC14:** Audit log for token refresh
- [ ] **AC15:** Detect token theft (refresh token reuse)

**Non-Functional:**
- [ ] **AC16:** Response time < 500ms
- [ ] **AC17:** HTTPS required

---

#### Technical Specifications

**Endpoint:** `POST /api/v1/auth/refresh`

**Request:**
```typescript
{
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

**Error Response (401 Unauthorized - Invalid Token):**
```typescript
{
  "status": "error",
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Invalid or expired refresh token. Please log in again."
  }
}
```

---

#### Implementation Details

**Auth Service Refresh Method:**
```typescript
async refreshToken(refreshToken: string): Promise<TokenPair> {
  // 1. Verify and decode token
  let payload;
  try {
    payload = this.jwtService.verifyToken(refreshToken);
  } catch {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  // 2. Check token type
  if (payload.type !== 'refresh') {
    throw new UnauthorizedException('Invalid token type');
  }

  // 3. Find token in database
  const storedToken = await this.refreshTokensRepository.findOne({
    where: {
      user_id: payload.sub,
      revoked: false,
    },
  });

  if (!storedToken) {
    throw new UnauthorizedException('Refresh token not found or revoked');
  }

  // 4. Verify token hash
  const isValid = await bcrypt.compare(refreshToken, storedToken.token_hash);
  if (!isValid) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  // 5. Check expiration
  if (storedToken.expires_at < new Date()) {
    throw new UnauthorizedException('Refresh token expired');
  }

  // 6. Get user
  const user = await this.usersRepository.findOne({
    where: { id: payload.sub }
  });

  if (!user || user.status !== 'active') {
    throw new UnauthorizedException('User not found or inactive');
  }

  // 7. Revoke old refresh token (rotation)
  await this.refreshTokensRepository.update(
    { id: storedToken.id },
    { revoked: true, revoked_at: new Date() }
  );

  // 8. Generate new tokens
  const newAccessToken = this.jwtService.generateAccessToken(user);
  const newRefreshToken = this.jwtService.generateRefreshToken(user.id);

  // 9. Store new refresh token
  await this.refreshTokensRepository.save({
    user_id: user.id,
    token_hash: await bcrypt.hash(newRefreshToken, 10),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // 10. Audit log
  await this.auditLogService.log({
    user_id: user.id,
    action: 'TOKEN_REFRESHED',
    resource: 'Auth',
  });

  return {
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    token_type: 'Bearer',
    expires_in: 3600,
  };
}
```

---

#### Testing Checklist

- [ ] Test successful token refresh
- [ ] Test old token invalidated
- [ ] Test expired token rejected
- [ ] Test invalid token rejected
- [ ] Test token reuse detected
- [ ] Test inactive user rejected
- [ ] Test rate limiting
- [ ] Test audit log created

---

#### Definition of Done

- [ ] Refresh endpoint implemented
- [ ] Token rotation working
- [ ] Token validation working
- [ ] Old token revocation working
- [ ] All tests passing
- [ ] Swagger documentation complete
- [ ] Code reviewed and merged

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-2.2.2.1 | Create Refresh DTO | 1 | 🔄 To Do |
| TASK-2.2.2.2 | Implement Refresh Logic | 2 | 🔄 To Do |
| TASK-2.2.2.3 | Create Refresh Endpoint | 2 | 🔄 To Do |
| **Total** | | **5** | |

---

## FEATURE-2.3: Password Management

### 📘 User Story: US-2.3.1 - Password Reset

**Story ID:** US-2.3.1
**Feature:** FEATURE-2.3 (Password Management)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 8
**Priority:** P0 (Must Have)
**Sprint:** Sprint 2
**Status:** 🔄 Not Started

---

#### User Story

```
As a user who forgot my password
I want to reset my password via email
So that I can regain access to my account
```

---

#### Business Value

**Value Statement:**
Password reset is critical for account recovery. Without it, users who forget passwords lose access permanently, leading to churn and support costs.

**Impact:**
- **High:** Prevents account abandonment
- **Support:** Reduces password-related support tickets by 70%
- **Security:** Secure password recovery mechanism

**Success Criteria:**
- 90% of password reset flows complete successfully
- < 5 minutes average time to reset
- Zero unauthorized password resets

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** User can request password reset with email
- [ ] **AC2:** Reset token sent to email
- [ ] **AC3:** Reset token valid for 1 hour
- [ ] **AC4:** User can reset password with valid token
- [ ] **AC5:** New password must meet complexity requirements
- [ ] **AC6:** Password hashed with bcrypt (12 rounds)
- [ ] **AC7:** Reset token single-use (invalidated after use)
- [ ] **AC8:** All sessions terminated after password reset
- [ ] **AC9:** All refresh tokens revoked
- [ ] **AC10:** Confirmation email sent after successful reset

**Security:**
- [ ] **AC11:** Rate limiting: 3 reset requests per hour per email
- [ ] **AC12:** Generic success message (don't reveal if email exists)
- [ ] **AC13:** Reset token cryptographically secure (UUID v4)
- [ ] **AC14:** Token stored as hash in database
- [ ] **AC15:** Audit log for all reset attempts
- [ ] **AC16:** Old password cannot be reused (last 5 passwords)

**Non-Functional:**
- [ ] **AC17:** Response time < 1 second
- [ ] **AC18:** Email delivery < 30 seconds

---

#### Technical Specifications

**Endpoint 1:** `POST /api/v1/auth/forgot-password`

**Request:**
```typescript
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "message": "If an account with that email exists, a password reset link has been sent."
  }
}
```

**Endpoint 2:** `POST /api/v1/auth/reset-password`

**Request:**
```typescript
{
  "reset_token": "550e8400-e29b-41d4-a716-446655440000",
  "new_password": "NewSecurePass123!"
}
```

**Response (200 OK):**
```typescript
{
  "status": "success",
  "data": {
    "message": "Password reset successful. You can now log in with your new password."
  }
}
```

---

#### Implementation Details

**Forgot Password Service:**
```typescript
async forgotPassword(email: string): Promise<void> {
  // 1. Find user (don't reveal if exists)
  const user = await this.usersRepository.findOne({
    where: { email: email.toLowerCase() }
  });

  // Always return success (security best practice)
  if (!user) {
    await this.auditLogService.log({
      action: 'PASSWORD_RESET_REQUESTED',
      metadata: { email, result: 'user_not_found' },
    });
    return;
  }

  // 2. Generate reset token
  const resetToken = uuidv4();
  const tokenHash = await bcrypt.hash(resetToken, 10);

  // 3. Store in Redis (1 hour expiry)
  await this.redis.setex(
    `password-reset:${user.id}`,
    3600,
    tokenHash
  );

  // 4. Send email
  await this.emailService.sendPasswordResetEmail(
    user.email,
    user.first_name,
    resetToken
  );

  // 5. Audit log
  await this.auditLogService.log({
    user_id: user.id,
    action: 'PASSWORD_RESET_REQUESTED',
    resource: 'User',
  });
}

async resetPassword(token: string, newPassword: string): Promise<void> {
  // 1. Hash token
  const tokenHash = await bcrypt.hash(token, 10);

  // 2. Find user with matching token in Redis
  // (Implementation would iterate through Redis keys or use a lookup table)

  // 3. Validate new password
  if (await bcrypt.compare(newPassword, user.password_hash)) {
    throw new BadRequestException('New password must be different from current password');
  }

  // 4. Update password
  await this.usersRepository.update(
    { id: user.id },
    { password_hash: await bcrypt.hash(newPassword, 12) }
  );

  // 5. Invalidate reset token
  await this.redis.del(`password-reset:${user.id}`);

  // 6. Revoke all refresh tokens
  await this.refreshTokensRepository.update(
    { user_id: user.id },
    { revoked: true, revoked_at: new Date() }
  );

  // 7. Send confirmation email
  await this.emailService.sendPasswordChangedEmail(user.email, user.first_name);

  // 8. Audit log
  await this.auditLogService.log({
    user_id: user.id,
    action: 'PASSWORD_RESET_COMPLETED',
    resource: 'User',
  });
}
```

---

#### Testing Checklist

- [ ] Test forgot password request sent
- [ ] Test reset token generation
- [ ] Test reset token expiry (1 hour)
- [ ] Test successful password reset
- [ ] Test token single-use
- [ ] Test sessions terminated
- [ ] Test refresh tokens revoked
- [ ] Test password complexity validation
- [ ] Test generic success message
- [ ] Test rate limiting
- [ ] Test audit logging

---

#### Definition of Done

- [ ] Both endpoints implemented
- [ ] Email sending working
- [ ] Token generation and validation working
- [ ] Session/token revocation working
- [ ] All tests passing
- [ ] Swagger documentation complete
- [ ] Code reviewed and merged

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-2.3.1.1 | Create Password Reset DTOs | 1 | 🔄 To Do |
| TASK-2.3.1.2 | Implement Forgot Password Logic | 2 | 🔄 To Do |
| TASK-2.3.1.3 | Implement Reset Password Logic | 3 | 🔄 To Do |
| TASK-2.3.1.4 | Create Password Reset Endpoints | 2 | 🔄 To Do |
| **Total** | | **8** | |

---

## FEATURE-2.4: Authorization

### 📘 User Story: US-2.4.1 - Role-Based Access Control (RBAC)

**Story ID:** US-2.4.1
**Feature:** FEATURE-2.4 (Authorization)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 5
**Priority:** P0 (Must Have)
**Sprint:** Sprint 2
**Status:** 🔄 Not Started

---

#### User Story

```
As a platform administrator
I want role-based access control implemented
So that different user types have appropriate permissions
```

---

#### Business Value

**Value Statement:**
RBAC ensures users can only access features and data appropriate to their role, protecting sensitive operations and data.

**Impact:**
- **Critical:** Foundation for authorization across platform
- **Security:** Prevents unauthorized access
- **Compliance:** Required for regulatory compliance

**Success Criteria:**
- 100% of protected endpoints enforce role checks
- Zero unauthorized access attempts succeed
- < 1ms overhead per authorization check

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Roles defined: user, merchant, admin, super_admin
- [ ] **AC2:** RolesGuard decorator implemented
- [ ] **AC3:** @Roles() decorator for endpoint protection
- [ ] **AC4:** User role included in JWT payload
- [ ] **AC5:** Guards check JWT role against required roles
- [ ] **AC6:** Multiple roles supported (OR logic)
- [ ] **AC7:** Returns 403 Forbidden for insufficient permissions

**Security:**
- [ ] **AC8:** Default deny (endpoints protected by default)
- [ ] **AC9:** Role validation cannot be bypassed
- [ ] **AC10:** Audit log for authorization failures

**Non-Functional:**
- [ ] **AC11:** Performance overhead < 1ms

---

#### Technical Specifications

**Roles Enum:**
```typescript
export enum UserRole {
  USER = 'user',
  MERCHANT = 'merchant',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
```

**Roles Decorator:**
```typescript
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

**Roles Guard:**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
```

**Usage Example:**
```typescript
@Get('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
async getAllUsers() {
  return this.usersService.findAll();
}
```

---

#### Testing Checklist

- [ ] Test role enforcement
- [ ] Test multiple roles (OR logic)
- [ ] Test 403 for insufficient permissions
- [ ] Test public endpoints (no roles)
- [ ] Test role in JWT payload
- [ ] Test audit logging
- [ ] Test performance

---

#### Definition of Done

- [ ] Roles enum created
- [ ] RolesGuard implemented
- [ ] @Roles decorator created
- [ ] Guards applied to protected endpoints
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Code reviewed and merged

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-2.4.1.1 | Create Roles Enum and Decorator | 1 | 🔄 To Do |
| TASK-2.4.1.2 | Implement RolesGuard | 2 | 🔄 To Do |
| TASK-2.4.1.3 | Apply RBAC to Endpoints | 2 | 🔄 To Do |
| **Total** | | **5** | |

---

## FEATURE-2.5: Account Security

### 📘 User Story: US-2.5.1 - Account Lockout

**Story ID:** US-2.5.1
**Feature:** FEATURE-2.5 (Account Security)
**Epic:** EPIC-2 (User Management & Authentication)

**Story Points:** 3
**Priority:** P0 (Must Have)
**Sprint:** Sprint 2
**Status:** 🔄 Not Started

---

#### User Story

```
As a security-conscious platform
I want to automatically lock accounts after multiple failed login attempts
So that I can prevent brute force attacks
```

---

#### Business Value

**Value Statement:**
Account lockout is a critical security control that prevents automated brute force attacks on user accounts.

**Impact:**
- **Critical:** Prevents brute force attacks
- **Security:** Protects user accounts from unauthorized access
- **Compliance:** Required for PCI-DSS compliance

**Success Criteria:**
- Brute force attacks blocked after 5 attempts
- Legitimate users can unlock accounts within 30 minutes
- < 100ms overhead per login check

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Account locked after 5 failed login attempts
- [ ] **AC2:** Lockout duration: 30 minutes
- [ ] **AC3:** failed_login_attempts counter tracked
- [ ] **AC4:** locked_until timestamp set on lockout
- [ ] **AC5:** Login blocked if current time < locked_until
- [ ] **AC6:** Counter reset to 0 on successful login
- [ ] **AC7:** Counter reset to 0 after lockout expires
- [ ] **AC8:** Clear error message shows lockout status and retry time

**Security:**
- [ ] **AC9:** Lockout cannot be bypassed
- [ ] **AC10:** Audit log for lockout events
- [ ] **AC11:** Email notification on account lockout
- [ ] **AC12:** Admin can manually unlock accounts

**Non-Functional:**
- [ ] **AC13:** Performance overhead < 100ms

---

#### Technical Specifications

**Database Fields (already exist in users table):**
- `failed_login_attempts` (integer)
- `locked_until` (timestamp with time zone, nullable)

**Logic (already implemented in login):**
```typescript
// On failed login
await this.usersRepository.update(
  { id: user.id },
  {
    failed_login_attempts: user.failed_login_attempts + 1,
    locked_until: user.failed_login_attempts + 1 >= 5
      ? new Date(Date.now() + 30 * 60 * 1000)
      : null,
  }
);

// Check lockout before password validation
if (user.locked_until && user.locked_until > new Date()) {
  throw new ForbiddenException({
    code: 'ACCOUNT_LOCKED',
    message: 'Account locked due to multiple failed login attempts',
    locked_until: user.locked_until,
    retry_after: Math.ceil((user.locked_until.getTime() - Date.now()) / 1000),
  });
}
```

**Email Notification:**
```typescript
async sendAccountLockedEmail(email: string, firstName: string, unlockTime: Date) {
  await this.transporter.sendMail({
    to: email,
    subject: 'Account Locked - Security Alert',
    html: `
      <h1>Account Locked</h1>
      <p>Hello ${firstName},</p>
      <p>Your account has been locked due to multiple failed login attempts.</p>
      <p>Your account will automatically unlock at: ${unlockTime.toISOString()}</p>
      <p>If you didn't attempt to log in, please contact support immediately.</p>
    `,
  });
}
```

---

#### Testing Checklist

- [ ] Test lockout after 5 failed attempts
- [ ] Test lockout duration (30 minutes)
- [ ] Test login blocked during lockout
- [ ] Test auto-unlock after 30 minutes
- [ ] Test counter reset on successful login
- [ ] Test email notification sent
- [ ] Test audit logging
- [ ] Test error message includes retry time

---

#### Definition of Done

- [ ] Lockout logic implemented (already done in login)
- [ ] Email notification implemented
- [ ] Counter reset logic working
- [ ] All tests passing
- [ ] Swagger documentation updated
- [ ] Code reviewed and merged

---

### Tasks Breakdown

| Task ID | Task Name | Story Points | Status |
|---------|-----------|--------------|--------|
| TASK-2.5.1.1 | Implement Lockout Email Notification | 1 | 🔄 To Do |
| TASK-2.5.1.2 | Create Unlock Mechanism (Admin) | 1 | 🔄 To Do |
| TASK-2.5.1.3 | Add Lockout Tests | 1 | 🔄 To Do |
| **Total** | | **3** | |

---

## Sprint 2 Summary

### User Stories Completed

| Story ID | Story Name | Story Points | Status |
|----------|------------|--------------|--------|
| US-2.1.1 | User Registration | 8 | 🔄 To Do |
| US-2.1.2 | Email Verification | 5 | 🔄 To Do |
| US-2.2.1 | User Login | 8 | 🔄 To Do |
| US-2.2.2 | Token Refresh | 5 | 🔄 To Do |
| US-2.3.1 | Password Reset | 8 | 🔄 To Do |
| US-2.4.1 | Role-Based Access Control | 5 | 🔄 To Do |
| US-2.5.1 | Account Lockout | 3 | 🔄 To Do |
| **Total** | | **42** | |

---

## Sprint 2 Velocity Tracking

**Planned Story Points:** 42 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

### Burndown Chart (To be updated daily)

| Day | Remaining SP | Completed SP | Notes |
|-----|--------------|--------------|-------|
| Day 1 | 42 | 0 | Sprint kickoff |
| Day 2 | | | |
| Day 3 | | | |
| ... | | | |
| Day 10 | 0 | 42 | Sprint complete (target) |

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
