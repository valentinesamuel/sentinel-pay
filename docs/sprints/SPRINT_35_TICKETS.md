# Sprint 35 Tickets - Referral & Rewards Program

**Sprint:** Sprint 35
**Duration:** 2 weeks (Week 70-71)
**Total Story Points:** 28 SP
**Total Tickets:** 22 tickets (7 stories + 15 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-35-001 | Story | Referral Code Management | 6 | To Do | Developer |
| TICKET-35-002 | Task | Create Referral Code Entity & Schema | 2 | To Do | Developer |
| TICKET-35-003 | Task | Implement Referral Code Service | 2 | To Do | Developer |
| TICKET-35-004 | Task | Implement Referral Code Endpoints | 2 | To Do | Developer |
| TICKET-35-005 | Story | Attribution & Conversion Tracking | 6 | To Do | Developer |
| TICKET-35-006 | Task | Implement Attribution Service | 2 | To Do | Developer |
| TICKET-35-007 | Task | Implement Conversion Tracking | 2 | To Do | Developer |
| TICKET-35-008 | Task | Create Referral Funnel Analytics | 2 | To Do | Developer |
| TICKET-35-009 | Story | Tiered Rewards System | 5 | To Do | Developer |
| TICKET-35-010 | Task | Create Reward Tier Entities & Schema | 2 | To Do | Developer |
| TICKET-35-011 | Task | Implement Tier Management Service | 2 | To Do | Developer |
| TICKET-35-012 | Task | Implement Reward Distribution | 1 | To Do | Developer |
| TICKET-35-013 | Story | Leaderboard & Gamification | 4 | To Do | Developer |
| TICKET-35-014 | Task | Implement Leaderboard Service (Redis) | 2 | To Do | Developer |
| TICKET-35-015 | Task | Create Leaderboard Endpoints | 1 | To Do | Developer |
| TICKET-35-016 | Task | Implement Badge/Achievement System | 1 | To Do | Developer |
| TICKET-35-017 | Story | Fraud Detection & Prevention | 4 | To Do | Developer |
| TICKET-35-018 | Task | Implement Device Fingerprinting | 2 | To Do | Developer |
| TICKET-35-019 | Task | Implement Fraud Scoring Service | 2 | To Do | Developer |
| TICKET-35-020 | Task | Analytics, Reporting & Tests | 2 | To Do | Developer |
| TICKET-35-021 | Task | API Documentation & Postman | 1 | To Do | Developer |
| TICKET-35-022 | Task | UI Components & Integration | 1 | To Do | Developer |

---

## TICKET-35-001: Referral Code Management

**Type:** User Story
**Story Points:** 6
**Priority:** P0 (Critical)
**Epic:** Customer Experience & Growth - Referral Program
**Sprint:** Sprint 35

### Description

As a user, I want to have a unique referral code and sharable referral link so that I can invite friends and earn rewards for successful referrals.

### Business Value

Referral codes are the foundation of viral growth. Easy-to-share, trackable referral codes enable users to invite friends without friction. Multiple sharing formats (QR code, short link, social share) maximize engagement.

**Impact:**
- **Critical:** Foundation of viral acquisition strategy
- **Growth:** Viral coefficient target 1.3
- **Engagement:** 80% of active users share code within 30 days
- **Retention:** Referrals have 40% higher retention

**Success Metrics:**
- Generate referral code in < 100ms
- Support multiple share formats
- Track all referral clicks
- Real-time code statistics

### Acceptance Criteria

**Core Functionality:**
- [ ] Auto-generate unique referral code on signup
- [ ] Support custom vanity codes (@username format)
- [ ] Generate shareable referral links (short + long formats)
- [ ] Generate QR codes for referral links
- [ ] Track referral link clicks with source attribution
- [ ] Prevent duplicate/compromised codes (regenerate option)

**Tracking:**
- [ ] Track referral link clicks (timestamp, source, device)
- [ ] Track sign-up conversions from clicks
- [ ] Store conversion attribution (first-click wins)
- [ ] Real-time code usage statistics

**User Experience:**
- [ ] View own referral code in dashboard
- [ ] One-click copy referral link
- [ ] Download QR code (PNG/SVG)
- [ ] Share to social media (WhatsApp, Twitter, Email)
- [ ] View referral code statistics (clicks, conversions)

**Non-Functional:**
- [ ] Generate code: < 100ms
- [ ] Track click: < 50ms
- [ ] Support 1M+ referral codes
- [ ] Handle 100K+ clicks/day

### API Specifications

#### Generate Referral Code

```
POST /api/v1/referral/codes/generate
Authorization: Bearer <token>

Request: (empty body or reuse existing)

Response: 201 Created
{
  "status": "success",
  "data": {
    "code": "abc123",
    "referral_link": "ubiquitous-tribble.app?ref=abc123",
    "short_link": "ref.ubiquitous-tribble.com/xyz123",
    "qr_code_url": "https://s3.amazonaws.com/qr-codes/abc123.png",
    "status": "active",
    "click_count": 0,
    "signup_count": 0,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Get My Referral Code

```
GET /api/v1/referral/codes/my-code
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "success",
  "data": {
    "code": "abc123",
    "custom_code": "@john",
    "referral_link": "ubiquitous-tribble.app?ref=abc123",
    "short_link": "ref.ubiquitous-tribble.com/xyz123",
    "qr_code_url": "https://s3.amazonaws.com/qr-codes/abc123.png",
    "status": "active",
    "click_count": 12,
    "signup_count": 3,
    "kyc_count": 2,
    "transaction_count": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "last_used_at": "2024-01-20T15:45:00Z"
  }
}
```

#### Set Custom Vanity Code

```
POST /api/v1/referral/codes/custom-code
Authorization: Bearer <token>

Request:
{
  "custom_code": "@john"
}

Response: 200 OK
{
  "status": "success",
  "message": "Custom code set successfully"
}

Error Responses:
- 409 Conflict: Custom code already taken
- 400 Bad Request: Invalid format (must be @username)
```

#### Generate QR Code

```
POST /api/v1/referral/codes/qr-code
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "success",
  "data": {
    "qr_code_url": "https://s3.amazonaws.com/qr-codes/abc123.png",
    "qr_code_svg": "<svg>...</svg>",
    "download_urls": {
      "png": "https://s3.amazonaws.com/qr-codes/abc123.png",
      "svg": "https://s3.amazonaws.com/qr-codes/abc123.svg"
    }
  }
}
```

#### Track Referral Click

```
POST /api/v1/referral/track-click/:code?source=direct_link
Public endpoint (no auth required)

Request Query:
- code: referral code (e.g., abc123)
- source: direct_link | qr_code | social_share

Response: 200 OK
{
  "status": "success",
  "data": {
    "click_id": "click-uuid-123",
    "code": "abc123",
    "source": "direct_link",
    "session_id": "session-uuid",
    "tracked_at": "2024-01-20T15:45:00Z"
  }
}
```

#### Get Referral Statistics

```
GET /api/v1/referral/codes/statistics
Authorization: Bearer <token>

Response: 200 OK
{
  "status": "success",
  "data": {
    "click_count": 12,
    "signup_count": 3,
    "kyc_count": 2,
    "transaction_count": 1,
    "conversion_rates": {
      "click_to_signup": 25.0,
      "signup_to_kyc": 66.7,
      "kyc_to_transaction": 50.0
    },
    "recent_conversions": [
      {
        "type": "signup",
        "user_name": "John Doe",
        "date": "2024-01-20T15:45:00Z"
      }
    ]
  }
}
```

### Subtasks

- [ ] TICKET-35-002: Create Referral Code Entity & Schema
- [ ] TICKET-35-003: Implement Referral Code Service
- [ ] TICKET-35-004: Implement Referral Code Endpoints

### Testing Requirements

- Unit tests: 20 tests (code generation, validation, uniqueness)
- Integration tests: 10 tests (API endpoints, database operations)
- E2E tests: 5 tests (complete referral flow)
- Performance tests: 3 tests (code generation, click tracking)

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Referral code schema created
- [ ] CRUD operations working
- [ ] Click tracking working
- [ ] QR code generation working
- [ ] All tests passing (38+ tests)
- [ ] API documentation updated
- [ ] Code reviewed and merged

---

## TICKET-35-002: Create Referral Code Entity & Schema

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-35-001
**Sprint:** Sprint 35

### Description

Create the ReferralCode, ReferralClick, Referral, and related database entities and migrations needed for the referral system.

### Task Details

**Entities to Create:**

```typescript
// src/referral/entities/referral-code.entity.ts
@Entity('referral_codes')
export class ReferralCode extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column('varchar', { unique: true })
  code: string;  // e.g., 'abc123'

  @Column('varchar', { unique: true, nullable: true })
  custom_code: string;  // e.g., '@john'

  @Column('varchar', { unique: true })
  referral_link: string;

  @Column('varchar', { unique: true, nullable: true })
  short_link: string;

  @Column('varchar', { nullable: true })
  qr_code_url: string;

  @Column({ type: 'enum', enum: ReferralCodeStatus, default: 'active' })
  status: ReferralCodeStatus;

  @Column('integer', { default: 0 })
  click_count: number;

  @Column('integer', { default: 0 })
  signup_count: number;

  @Column('integer', { default: 0 })
  kyc_count: number;

  @Column('integer', { default: 0 })
  transaction_count: number;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  last_used_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  suspended_at: Date;

  @Column('varchar', { nullable: true })
  suspension_reason: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Referral, ref => ref.referral_code)
  referrals: Referral[];
}

@Entity('referral_clicks')
export class ReferralClick extends BaseEntity {
  @Column('uuid')
  referral_code_id: string;

  @Column('varchar', { nullable: true })
  session_id: string;

  @Column('varchar')
  source: string;

  @Column('varchar', { nullable: true })
  device_fingerprint: string;

  @Column('varchar', { nullable: true })
  ip_address: string;

  @Column('varchar', { nullable: true })
  user_agent: string;

  @Column('timestamp with time zone')
  clicked_at: Date;

  @Column('uuid', { nullable: true })
  converted_user_id: string;

  @Column('timestamp with time zone', { nullable: true })
  converted_at: Date;

  @ManyToOne(() => ReferralCode)
  @JoinColumn({ name: 'referral_code_id' })
  referral_code: ReferralCode;
}

@Entity('referrals')
export class Referral extends BaseEntity {
  @Column('uuid')
  referrer_id: string;

  @Column('uuid')
  referee_id: string;

  @Column('uuid')
  referral_code_id: string;

  @Column('varchar')
  source: string;

  @Column('timestamp with time zone')
  signup_date: Date;

  @Column('timestamp with time zone', { nullable: true })
  kyc_completion_date: Date;

  @Column('timestamp with time zone', { nullable: true })
  first_transaction_date: Date;

  @Column({ type: 'enum', enum: ReferralStatus, default: 'pending' })
  status: ReferralStatus;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  expires_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referrer_id' })
  referrer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referee_id' })
  referee: User;

  @ManyToOne(() => ReferralCode)
  @JoinColumn({ name: 'referral_code_id' })
  referral_code: ReferralCode;

  @OneToMany(() => Reward, r => r.referral)
  rewards: Reward[];
}
```

**Database Migrations:**

```typescript
// src/migrations/1704931300000-CreateReferralTables.ts
export class CreateReferralTables1704931300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'referral_codes',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'code', type: 'varchar', isUnique: true },
          { name: 'custom_code', type: 'varchar', isUnique: true, isNullable: true },
          { name: 'referral_link', type: 'varchar', isUnique: true },
          { name: 'short_link', type: 'varchar', isUnique: true, isNullable: true },
          { name: 'qr_code_url', type: 'varchar', isNullable: true },
          { name: 'status', type: 'enum', enum: ['active', 'inactive', 'suspended'] },
          { name: 'click_count', type: 'integer', default: 0 },
          { name: 'signup_count', type: 'integer', default: 0 },
          { name: 'kyc_count', type: 'integer', default: 0 },
          { name: 'transaction_count', type: 'integer', default: 0 },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'last_used_at', type: 'timestamp with time zone', isNullable: true },
          { name: 'suspended_at', type: 'timestamp with time zone', isNullable: true },
          { name: 'suspension_reason', type: 'varchar', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          },
        ],
        indices: [
          { columnNames: ['user_id'] },
          { columnNames: ['code'] },
          { columnNames: ['status'] },
          { columnNames: ['created_at'] },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'referral_clicks',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'referral_code_id', type: 'uuid' },
          { name: 'session_id', type: 'varchar', isNullable: true },
          { name: 'source', type: 'varchar' },
          { name: 'device_fingerprint', type: 'varchar', isNullable: true },
          { name: 'ip_address', type: 'varchar', isNullable: true },
          { name: 'user_agent', type: 'varchar', isNullable: true },
          { name: 'clicked_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'converted_user_id', type: 'uuid', isNullable: true },
          { name: 'converted_at', type: 'timestamp with time zone', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['referral_code_id'],
            referencedTableName: 'referral_codes',
            referencedColumnNames: ['id'],
          },
        ],
        indices: [
          { columnNames: ['referral_code_id'] },
          { columnNames: ['clicked_at'] },
          { columnNames: ['ip_address'] },
          { columnNames: ['device_fingerprint'] },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'referrals',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'referrer_id', type: 'uuid' },
          { name: 'referee_id', type: 'uuid' },
          { name: 'referral_code_id', type: 'uuid' },
          { name: 'source', type: 'varchar' },
          { name: 'signup_date', type: 'timestamp with time zone' },
          { name: 'kyc_completion_date', type: 'timestamp with time zone', isNullable: true },
          { name: 'first_transaction_date', type: 'timestamp with time zone', isNullable: true },
          { name: 'status', type: 'enum', enum: ['pending', 'claimed', 'rewarded', 'expired'] },
          { name: 'created_at', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'expires_at', type: 'timestamp with time zone', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['referrer_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          },
          {
            columnNames: ['referee_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          },
          {
            columnNames: ['referral_code_id'],
            referencedTableName: 'referral_codes',
            referencedColumnNames: ['id'],
          },
        ],
        indices: [
          { columnNames: ['referrer_id'] },
          { columnNames: ['referee_id'] },
          { columnNames: ['status'] },
          { columnNames: ['created_at'] },
          { columnNames: ['expires_at'] },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('referrals');
    await queryRunner.dropTable('referral_clicks');
    await queryRunner.dropTable('referral_codes');
  }
}
```

**Enums:**

```typescript
// src/referral/enums/referral-code-status.enum.ts
export enum ReferralCodeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// src/referral/enums/referral-status.enum.ts
export enum ReferralStatus {
  PENDING = 'pending',
  CLAIMED = 'claimed',
  REWARDED = 'rewarded',
  EXPIRED = 'expired',
}
```

**Checklist:**
- [ ] ReferralCode entity created
- [ ] ReferralClick entity created
- [ ] Referral entity created
- [ ] Database migrations created
- [ ] DTOs created (CreateReferralCodeDto, SetCustomCodeDto)
- [ ] Enums created (ReferralCodeStatus, ReferralStatus)

---

## TICKET-35-003: Implement Referral Code Service

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-35-001
**Sprint:** Sprint 35

### Description

Implement the ReferralCodeService with core functionality for generating codes, tracking clicks, managing custom codes, and generating QR codes.

### Implementation Details

```typescript
// src/referral/services/referral-code.service.ts
@Injectable()
export class ReferralCodeService {
  constructor(
    @InjectRepository(ReferralCode)
    private codeRepository: Repository<ReferralCode>,
    @InjectRepository(ReferralClick)
    private clickRepository: Repository<ReferralClick>,
    private logger: Logger,
  ) {}

  async generateCode(userId: string): Promise<ReferralCode> {
    const code = this.generateUniqueCode();
    const shortLink = await this.generateShortLink(code);
    const referralLink = `https://ubiquitous-tribble.app?ref=${code}`;

    const referralCode = this.codeRepository.create({
      user_id: userId,
      code,
      referral_link: referralLink,
      short_link: shortLink,
      status: 'active',
    });

    return await this.codeRepository.save(referralCode);
  }

  async setCustomCode(userId: string, customCode: string): Promise<void> {
    // Validate format (@username)
    if (!/^@[a-zA-Z0-9_]{3,20}$/.test(customCode)) {
      throw new BadRequestException('Invalid custom code format');
    }

    // Check uniqueness
    const existing = await this.codeRepository.findOne({
      where: { custom_code: customCode },
    });

    if (existing) {
      throw new ConflictException('Custom code already taken');
    }

    // Update user's code
    await this.codeRepository.update(
      { user_id: userId },
      { custom_code: customCode }
    );
  }

  async generateQRCode(userId: string): Promise<string> {
    const referralCode = await this.getMyCode(userId);

    if (!referralCode) {
      throw new NotFoundException('Referral code not found');
    }

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(referralCode.referral_link);

    // Upload to S3
    const s3Url = await this.uploadToS3(qrCodeDataUrl, userId, referralCode.code);

    // Save URL to database
    referralCode.qr_code_url = s3Url;
    await this.codeRepository.save(referralCode);

    return s3Url;
  }

  async trackClick(
    code: string,
    source: string,
    ipAddress: string,
    userAgent: string,
    sessionId?: string,
  ): Promise<string> {
    const referralCode = await this.codeRepository.findOne({
      where: { code },
    });

    if (!referralCode) {
      throw new NotFoundException('Referral code not found');
    }

    const deviceFingerprint = this.generateDeviceFingerprint(userAgent);

    const click = this.clickRepository.create({
      referral_code_id: referralCode.id,
      source,
      ip_address: ipAddress,
      user_agent: userAgent,
      device_fingerprint: deviceFingerprint,
      session_id: sessionId,
      clicked_at: new Date(),
    });

    await this.clickRepository.save(click);

    // Update click count
    referralCode.click_count += 1;
    referralCode.last_used_at = new Date();
    await this.codeRepository.save(referralCode);

    return click.id;
  }

  async getMyCode(userId: string): Promise<ReferralCode> {
    const code = await this.codeRepository.findOne({
      where: { user_id: userId, status: 'active' },
    });

    if (!code) {
      // Auto-generate code on first access
      return await this.generateCode(userId);
    }

    return code;
  }

  async getStatistics(userId: string): Promise<any> {
    const code = await this.getMyCode(userId);

    return {
      click_count: code.click_count,
      signup_count: code.signup_count,
      kyc_count: code.kyc_count,
      transaction_count: code.transaction_count,
      conversion_rates: {
        click_to_signup: code.click_count > 0 ? (code.signup_count / code.click_count) * 100 : 0,
        signup_to_kyc: code.signup_count > 0 ? (code.kyc_count / code.signup_count) * 100 : 0,
        kyc_to_transaction: code.kyc_count > 0 ? (code.transaction_count / code.kyc_count) * 100 : 0,
      },
    };
  }

  private generateUniqueCode(): string {
    let code: string;
    let exists = true;

    while (exists) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = this.codeRepository.findOne({
        where: { code },
      });
      exists = !!existing;
    }

    return code;
  }

  private generateDeviceFingerprint(userAgent: string): string {
    // Parse user agent
    // In production, use FingerprintJS library
    return createHash('sha256').update(userAgent).digest('hex');
  }

  private async generateShortLink(code: string): Promise<string> {
    // Use short URL service (custom implementation or Rebrandly API)
    // For now, simple format: ref.ubiquitous-tribble.com/{randomId}
    const shortId = nanoid(8);
    return `ref.ubiquitous-tribble.com/${shortId}`;
  }

  private async uploadToS3(dataUrl: string, userId: string, code: string): Promise<string> {
    // Convert data URL to buffer
    const buffer = Buffer.from(dataUrl.split(',')[1], 'base64');

    // Upload to S3
    const key = `qr-codes/${userId}/${code}.png`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    });

    await s3Client.send(command);

    return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
  }
}
```

**Checklist:**
- [ ] Code generation with uniqueness check
- [ ] Custom code management
- [ ] QR code generation and S3 upload
- [ ] Click tracking and attribution
- [ ] Statistics calculation
- [ ] Error handling and validation

---

## TICKET-35-004: Implement Referral Code Endpoints

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-35-001
**Sprint:** Sprint 35

### Description

Implement NestJS controller endpoints for referral code management with proper authorization, validation, and error handling.

### Implementation Details

```typescript
// src/referral/controllers/referral-code.controller.ts
@Controller('referral/codes')
@UseGuards(JwtAuthGuard)
@ApiTags('Referral - Codes')
export class ReferralCodeController {
  constructor(private referralCodeService: ReferralCodeService) {}

  @Get('my-code')
  @ApiOperation({ summary: 'Get my referral code' })
  @ApiResponse({ status: 200, description: 'Referral code retrieved' })
  async getMyCode(@Request() req) {
    const code = await this.referralCodeService.getMyCode(req.user.id);
    return {
      status: 'success',
      data: {
        code: code.code,
        custom_code: code.custom_code,
        referral_link: code.referral_link,
        short_link: code.short_link,
        qr_code_url: code.qr_code_url,
        status: code.status,
        click_count: code.click_count,
        signup_count: code.signup_count,
        kyc_count: code.kyc_count,
        transaction_count: code.transaction_count,
        created_at: code.created_at,
        last_used_at: code.last_used_at,
      },
    };
  }

  @Post('generate')
  @HttpCode(201)
  @ApiOperation({ summary: 'Generate new referral code' })
  @ApiResponse({ status: 201, description: 'Code generated' })
  async generateCode(@Request() req) {
    const code = await this.referralCodeService.generateCode(req.user.id);
    return { status: 'success', data: code };
  }

  @Post('custom-code')
  @ApiOperation({ summary: 'Set custom vanity code' })
  @ApiResponse({ status: 200, description: 'Custom code set' })
  async setCustomCode(
    @Body() dto: SetCustomCodeDto,
    @Request() req
  ) {
    await this.referralCodeService.setCustomCode(req.user.id, dto.custom_code);
    return { status: 'success', message: 'Custom code set successfully' };
  }

  @Post('qr-code')
  @ApiOperation({ summary: 'Generate QR code' })
  @ApiResponse({ status: 200, description: 'QR code generated' })
  async generateQRCode(@Request() req) {
    const qrCodeUrl = await this.referralCodeService.generateQRCode(req.user.id);
    return {
      status: 'success',
      data: { qr_code_url: qrCodeUrl },
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get referral statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics(@Request() req) {
    const stats = await this.referralCodeService.getStatistics(req.user.id);
    return { status: 'success', data: stats };
  }
}

// Public endpoint for tracking clicks
@Controller('referral')
@ApiTags('Referral - Public')
export class ReferralPublicController {
  constructor(private referralCodeService: ReferralCodeService) {}

  @Post('track-click/:code')
  @Public()
  @ApiOperation({ summary: 'Track referral click' })
  @ApiQuery({ name: 'source', required: true })
  async trackClick(
    @Param('code') code: string,
    @Query('source') source: string,
    @Request() req
  ) {
    const clickId = await this.referralCodeService.trackClick(
      code,
      source,
      req.ip,
      req.headers['user-agent']
    );
    return {
      status: 'success',
      data: { click_id: clickId },
    };
  }
}
```

**DTOs:**

```typescript
// src/referral/dto/set-custom-code.dto.ts
export class SetCustomCodeDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^@[a-zA-Z0-9_]{3,20}$/, {
    message: 'Custom code must be @username format'
  })
  custom_code: string;
}
```

**Checklist:**
- [ ] All controller methods implemented
- [ ] Request/response validation
- [ ] Error handling (404, 409, 400)
- [ ] Authorization checks
- [ ] API documentation complete

---

## TICKET-35-005: Attribution & Conversion Tracking

**Type:** Story
**Story Points:** 6
**Priority:** P0
**Epic:** Customer Experience & Growth
**Sprint:** Sprint 35

### Description

Track referral conversions through the entire funnel (signup → KYC → first transaction) and measure referral effectiveness.

### Subtasks

- [ ] TICKET-35-006: Implement Attribution Service
- [ ] TICKET-35-007: Implement Conversion Tracking
- [ ] TICKET-35-008: Create Referral Funnel Analytics

### Acceptance Criteria

- [ ] Track all referral events (click, signup, KYC, transaction)
- [ ] Attribution window: 30 days from signup
- [ ] Multi-level referral detection
- [ ] Churn analysis of referred users
- [ ] Real-time conversion funnel visibility

---

## TICKET-35-009 through TICKET-35-022 Summary

**Remaining Major Tickets:**

| Ticket | Title | SP | Key Implementations |
|--------|-------|----|----|
| TICKET-35-006 | Attribution Service | 2 | Handle KYC/transaction completion, update referral status |
| TICKET-35-007 | Conversion Tracking | 2 | Event listeners for KYC completion & first transaction |
| TICKET-35-008 | Funnel Analytics | 2 | Calculate conversion rates, funnel visualization |
| TICKET-35-010 | Reward Tier Entities | 2 | Create tier, milestone, reward, campaign entities |
| TICKET-35-011 | Tier Management Service | 2 | Calculate tiers, update retroactively, manage campaigns |
| TICKET-35-012 | Reward Distribution | 1 | Distribute rewards, handle expiry, claim/credit |
| TICKET-35-014 | Leaderboard Service | 2 | Redis sorted sets, real-time updates, caching |
| TICKET-35-015 | Leaderboard Endpoints | 1 | GET /leaderboard (weekly, monthly, all-time) |
| TICKET-35-016 | Badge System | 1 | Achievement tracking, badge display, notifications |
| TICKET-35-018 | Device Fingerprinting | 2 | FingerprintJS integration, multi-account detection |
| TICKET-35-019 | Fraud Scoring | 2 | Device, IP, velocity, email validation checks |
| TICKET-35-020 | Analytics & Tests | 2 | Reports, dashboards, 85%+ test coverage |
| TICKET-35-021 | API Documentation | 1 | Swagger docs, Postman collection |
| TICKET-35-022 | UI Components | 1 | Referral dashboard, share buttons, leaderboard UI |

---

## Testing Strategy

**Unit Tests (45+ tests):**
- Code generation and uniqueness
- Custom code validation
- Click tracking
- Attribution logic
- Tier calculations
- Reward calculations
- Fraud scoring
- Validation logic

**Integration Tests (25+ tests):**
- API endpoints
- Click tracking flow
- Attribution workflow
- Conversion tracking
- Reward distribution
- Leaderboard updates

**E2E Tests (8+ tests):**
- Complete referral flow (code → click → signup → KYC → transaction)
- Reward earning and claiming
- Fraud detection workflow
- Leaderboard updates

**Performance Tests:**
- Code generation: < 100ms
- Click tracking: < 50ms
- Leaderboard updates: < 500ms
- Fraud scoring: < 100ms

---

## Database Migrations Needed

1. **referral_codes** table (with indices, constraints)
2. **referral_clicks** table
3. **referrals** table
4. **reward_tiers** table
5. **referrer_tiers** table
6. **milestone_bonuses** table
7. **rewards** table
8. **promotional_campaigns** table

---

## External Dependencies

- **FingerprintJS:** Device fingerprinting (fraud detection)
- **qrcode npm:** QR code generation
- **nanoid:** Short URL ID generation
- **redis:** Leaderboard caching
- **AWS S3:** QR code storage
- **EventEmitter2:** Event-driven architecture

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Total Tickets:** 22
**Total Story Points:** 28
**Sprint Status:** Not Started
