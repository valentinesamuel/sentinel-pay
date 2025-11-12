# Sprint 35 Backlog - Referral & Rewards Program

**Sprint:** Sprint 35
**Duration:** 2 weeks (Week 70-71)
**Sprint Goal:** Implement comprehensive referral and rewards program to drive viral user acquisition
**Story Points Committed:** 28
**Team Capacity:** 28 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 27-34 (35, 30, 28, 32, 28, 30, 35, 30) = 30.75 SP, committed 28 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 35, we will have:
1. Referral code generation and tracking system
2. Referral attribution and conversion tracking
3. Multi-tier rewards structure with gamification
4. Leaderboard and achievement system
5. Promotional campaigns and targeting
6. Automated reward distribution
7. Fraud prevention and anti-gaming mechanisms
8. Comprehensive referral analytics
9. User interface for referral sharing
10. Integration with wallet and KYC systems

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Referral tracking tests passing
- [ ] Leaderboard calculation tests passing
- [ ] API documentation updated (Swagger)
- [ ] Referral UI components functional
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC: Customer Experience & Growth - Referral Program

## FEATURE-1: Referral Code Generation & Tracking

### 📘 User Story: US-35.1.1 - Referral Code Management

**Story ID:** US-35.1.1
**Feature:** FEATURE-1 (Referral Code Generation & Tracking)
**Epic:** Customer Experience & Growth

**Story Points:** 6
**Priority:** P0 (Critical)
**Sprint:** Sprint 35
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to have a unique referral code and sharable referral link
So that I can invite friends and earn rewards for successful referrals
```

---

#### Business Value

**Value Statement:**
Referral codes are the foundation of viral growth. Easy-to-share, trackable referral codes enable users to invite friends without friction. Multiple sharing formats (QR code, short link, social share) maximize engagement.

**Impact:**
- **Critical:** Foundation of viral acquisition strategy
- **Growth:** Viral coefficient target 1.3 (each user brings 1.3 new users)
- **Engagement:** Users actively share referral codes
- **Retention:** Referrals have 40% higher retention

**Success Criteria:**
- 80% of active users generate referral code within first 30 days
- Generate referral code in < 100ms
- Support multiple share formats (link, QR, social)
- Track all referral clicks and conversions
- Real-time leaderboard updates

---

#### Acceptance Criteria

**Referral Code Generation:**
- [ ] **AC1:** Auto-generate unique referral code for each user on signup
- [ ] **AC2:** Referral code format: alphanumeric, 6-8 characters, URL-safe
- [ ] **AC3:** Ensure uniqueness (no collisions with existing codes)
- [ ] **AC4:** Support custom vanity codes (@john, @smithjohnson)
- [ ] **AC5:** Vanity code uniqueness check and reservation
- [ ] **AC6:** Regenerate lost/compromised codes
- [ ] **AC7:** View own referral code in dashboard
- [ ] **AC8:** View referral code usage statistics
- [ ] **AC9:** Deactivate referral code (stop earning rewards)
- [ ] **AC10:** Referral code history (view all past codes)

**Referral Link Generation:**
- [ ] **AC11:** Dynamic referral links (ubiquitous-tribble.app?ref=xyz123)
- [ ] **AC12:** Short link generation (bit.ly style: ref.ubiquitous-tribble.com/abc123)
- [ ] **AC13:** Short link redirect to signup with referrer attribution
- [ ] **AC14:** QR code generation for referral link
- [ ] **AC15:** QR code with embedded company branding
- [ ] **AC16:** QR code download as PNG/SVG

**Referral Code Tracking:**
- [ ] **AC17:** Track referral link clicks (record click timestamp, source)
- [ ] **AC18:** Track referral source (direct link, QR code, social share)
- [ ] **AC19:** Track device/IP to detect multiple accounts
- [ ] **AC20:** Track signup conversion (click → signup)
- [ ] **AC21:** Track KYC completion by referee
- [ ] **AC22:** Track first transaction by referee
- [ ] **AC23:** Store referral attribution window (30 days default)
- [ ] **AC24:** Prevent code reuse in attribution (first click wins)

**Referral Status Management:**
- [ ] **AC25:** Status: PENDING (signup within 30 days)
- [ ] **AC26:** Status: CLAIMED (KYC completed by referee)
- [ ] **AC27:** Status: REWARDED (first transaction completed)
- [ ] **AC28:** Status: EXPIRED (> 30 days without claim)
- [ ] **AC29:** View referral status per referrer
- [ ] **AC30:** Bulk view all referrals with filters

**Non-Functional:**
- [ ] **AC31:** Generate referral code: < 100ms
- [ ] **AC32:** Referral link tracking: < 50ms per click
- [ ] **AC33:** Support 1M+ referral codes
- [ ] **AC34:** Track 100K+ referral events per day

---

#### Technical Specifications

**Referral Code Entity Schema:**

```typescript
@Entity('referral_codes')
export class ReferralCode extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column('varchar', { unique: true })
  code: string;  // e.g., 'abc123'

  @Column('varchar', { unique: true, nullable: true })
  custom_code: string;  // e.g., '@john'

  @Column('varchar', { unique: true })
  referral_link: string;  // e.g., 'ubiquitous-tribble.app?ref=abc123'

  @Column('varchar', { unique: true, nullable: true })
  short_link: string;  // e.g., 'ref.ubiquitous-tribble.com/xyz123'

  @Column('varchar', { nullable: true })
  qr_code_url: string;  // S3 URL to QR code image

  @Column({ type: 'enum', enum: ReferralCodeStatus, default: 'active' })
  status: ReferralCodeStatus;  // active, inactive, suspended

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

  // Relationships
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
  source: string;  // direct_link, qr_code, social_share

  @Column('varchar', { nullable: true })
  device_fingerprint: string;

  @Column('varchar', { nullable: true })
  ip_address: string;

  @Column('varchar', { nullable: true })
  user_agent: string;

  @Column('timestamp with time zone')
  clicked_at: Date;

  @Column('uuid', { nullable: true })
  converted_user_id: string;  // If clicked user signs up

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
  source: string;  // direct_link, qr_code, social_share

  @Column('timestamp with time zone')
  signup_date: Date;

  @Column('timestamp with time zone', { nullable: true })
  kyc_completion_date: Date;

  @Column('timestamp with time zone', { nullable: true })
  first_transaction_date: Date;

  @Column({ type: 'enum', enum: ReferralStatus, default: 'pending' })
  status: ReferralStatus;  // pending, claimed, rewarded, expired

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  expires_at: Date;  // 30 days from signup

  // Relationships
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

**Referral Code API Endpoints:**

```typescript
@Controller('referral/codes')
@UseGuards(JwtAuthGuard)
@ApiTags('Referral - Codes')
export class ReferralCodeController {
  constructor(private referralCodeService: ReferralCodeService) {}

  @Get('my-code')
  @ApiOperation({ summary: 'Get my referral code' })
  async getMyCode(@Request() req) {
    const code = await this.referralCodeService.getMyCode(req.user.id);
    return { status: 'success', data: code };
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate new referral code' })
  async generateCode(@Request() req) {
    const code = await this.referralCodeService.generateCode(req.user.id);
    return { status: 'success', data: code };
  }

  @Post('custom-code')
  @ApiOperation({ summary: 'Set custom vanity code' })
  async setCustomCode(
    @Body() dto: SetCustomCodeDto,
    @Request() req
  ) {
    await this.referralCodeService.setCustomCode(req.user.id, dto.custom_code);
    return { status: 'success', message: 'Custom code set' };
  }

  @Post('qr-code')
  @ApiOperation({ summary: 'Generate QR code' })
  async generateQRCode(@Request() req) {
    const qrCode = await this.referralCodeService.generateQRCode(req.user.id);
    return { status: 'success', data: { qr_code_url: qrCode } };
  }

  @Post('track-click/:code')
  @Public()
  @ApiOperation({ summary: 'Track referral link click' })
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
    return { status: 'success', data: { click_id: clickId } };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get referral code statistics' })
  async getStatistics(@Request() req) {
    const stats = await this.referralCodeService.getStatistics(req.user.id);
    return { status: 'success', data: stats };
  }
}
```

**Generate Referral Code Response:**

```json
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

---

## FEATURE-2: Referral Attribution & Conversion Tracking

### 📘 User Story: US-35.2.1 - Attribution Tracking

**Story ID:** US-35.2.1
**Feature:** FEATURE-2 (Referral Attribution & Conversion Tracking)
**Epic:** Customer Experience & Growth

**Story Points:** 6
**Priority:** P0 (Critical)
**Sprint:** Sprint 35
**Status:** 🔄 Not Started

---

#### User Story

```
As a growth manager
I want to track referral conversions through the entire funnel (signup → KYC → first transaction)
So that I can measure referral effectiveness and optimize rewards
```

---

#### Business Value

**Value Statement:**
Attribution tracking enables understanding of referral quality and effectiveness. Measuring which referrals convert to active, paying users guides reward strategy optimization.

**Impact:**
- **Critical:** Measure referral program ROI
- **Analytics:** Identify best-performing referrers
- **Optimization:** Data-driven reward adjustments
- **Compliance:** Track rewards eligibility

**Success Criteria:**
- Track all referral events (click, signup, KYC, transaction)
- Attribution window: 30 days from signup
- Multi-level referral detection
- Churn analysis of referred users
- Real-time conversion funnel visibility

---

#### Acceptance Criteria

**Referral Attribution:**
- [ ] **AC1:** Attribute signup to referrer via referral code
- [ ] **AC2:** Store referral source (direct link, QR, social)
- [ ] **AC3:** Store attribution timestamp
- [ ] **AC4:** Attribution window: 30 days from signup
- [ ] **AC5:** First-click attribution (first referrer wins)
- [ ] **AC6:** Prevent multi-device exploitation (device fingerprinting)
- [ ] **AC7:** Prevent IP-based fraud (same IP different users blocked)
- [ ] **AC8:** Multi-level referral detection (track chains)
- [ ] **AC9:** View referral history by referee
- [ ] **AC10:** View conversion status per referral

**Conversion Tracking:**
- [ ] **AC11:** Track KYC completion date
- [ ] **AC12:** Track first transaction date
- [ ] **AC13:** Track transaction amount
- [ ] **AC14:** Update referral status: PENDING → CLAIMED → REWARDED
- [ ] **AC15:** Emit events for referral conversions
- [ ] **AC16:** Trigger reward distribution on conversion
- [ ] **AC17:** Track time-to-conversion metrics
- [ ] **AC18:** Retry logic for failed conversions

**Referral Quality Metrics:**
- [ ] **AC19:** Calculate signup-to-KYC rate
- [ ] **AC20:** Calculate KYC-to-transaction rate
- [ ] **AC21:** Calculate average referral value
- [ ] **AC22:** Calculate referral retention rate (7-day, 30-day)
- [ ] **AC23:** Identify low-quality referrals (drop off)
- [ ] **AC24:** Flag suspicious referral patterns

**Non-Functional:**
- [ ] **AC25:** Attribution assignment: < 100ms
- [ ] **AC26:** Conversion event processing: < 500ms
- [ ] **AC27:** Support 100K+ referrals per day
- [ ] **AC28:** Audit trail for all attributions

---

#### Technical Specifications

**Referral Attribution Service:**

```typescript
@Injectable()
export class ReferralAttributionService {
  constructor(
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectRepository(ReferralClick)
    private clickRepository: Repository<ReferralClick>,
    private eventEmitter: EventEmitter2,
  ) {}

  async attributeReferral(userId: string, referralCodeId: string): Promise<void> {
    // Check if attribution window is still valid
    const click = await this.clickRepository.findOne({
      where: { converted_user_id: userId },
      order: { clicked_at: 'DESC' },
    });

    if (!click) {
      throw new NotFoundException('No referral click found');
    }

    const referralCode = await this.getReferralCode(referralCodeId);

    if (new Date().getTime() - click.clicked_at.getTime() > 30 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException('Attribution window expired');
    }

    // Create referral record
    const referral = this.referralRepository.create({
      referrer_id: referralCode.user_id,
      referee_id: userId,
      referral_code_id: referralCodeId,
      source: click.source,
      signup_date: new Date(),
      status: 'pending',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await this.referralRepository.save(referral);

    // Emit event for potential reward
    this.eventEmitter.emit('referral.created', { referral });
  }

  async markKYCCompleted(userId: string): Promise<void> {
    const referral = await this.referralRepository.findOne({
      where: { referee_id: userId, status: 'pending' },
    });

    if (referral) {
      referral.kyc_completion_date = new Date();
      referral.status = 'claimed';
      await this.referralRepository.save(referral);

      this.eventEmitter.emit('referral.kyc_completed', { referral });
    }
  }

  async markFirstTransaction(userId: string, amount: number): Promise<void> {
    const referral = await this.referralRepository.findOne({
      where: { referee_id: userId, status: 'claimed' },
    });

    if (referral) {
      referral.first_transaction_date = new Date();
      referral.status = 'rewarded';
      await this.referralRepository.save(referral);

      this.eventEmitter.emit('referral.rewarded', { referral, amount });
    }
  }

  async getConversionFunnel(referrerId: string): Promise<any> {
    const referrals = await this.referralRepository.find({
      where: { referrer_id: referrerId },
    });

    const stats = {
      total_referrals: referrals.length,
      signup_count: referrals.filter(r => r.status !== 'expired').length,
      kyc_count: referrals.filter(r => r.kyc_completion_date).length,
      transaction_count: referrals.filter(r => r.first_transaction_date).length,
      conversion_rates: {
        signup_to_kyc: 0,
        kyc_to_transaction: 0,
      },
    };

    stats.conversion_rates.signup_to_kyc = (stats.kyc_count / stats.signup_count) * 100;
    stats.conversion_rates.kyc_to_transaction = (stats.transaction_count / stats.kyc_count) * 100;

    return stats;
  }
}
```

---

## FEATURE-3: Rewards Structure & Tiers

### 📘 User Story: US-35.3.1 - Tiered Rewards System

**Story ID:** US-35.3.1
**Feature:** FEATURE-3 (Rewards Structure & Tiers)
**Epic:** Customer Experience & Growth

**Story Points:** 5
**Priority:** P0 (Critical)
**Sprint:** Sprint 35
**Status:** 🔄 Not Started

---

#### User Story

```
As a growth manager
I want to configure multi-tier reward structures with bonuses and seasonal promotions
So that I can incentivize high-performing referrers and control acquisition costs
```

---

#### Business Value

**Value Statement:**
Tiered rewards incentivize top referrers while controlling overall acquisition costs. Seasonal promotions can drive spikes in acquisition during growth phases.

**Impact:**
- **Critical:** Primary driver of referral program engagement
- **Cost Control:** Tiered structure controls CAC
- **Motivation:** Clear rewards path encourages action
- **Flexibility:** Seasonal adjustments optimize timing

**Success Criteria:**
- 4+ reward tiers based on referral volume
- Milestone bonuses (10th, 25th, 50th referral)
- Seasonal promotions (2x rewards during campaigns)
- Conditional rewards (bonus if referee reaches KYC Tier 2)
- Real-time reward calculation

---

#### Acceptance Criteria

**Reward Tiers:**
- [ ] **AC1:** Tier 1 (1-5 referrals): ₦500 per referral
- [ ] **AC2:** Tier 2 (6-20 referrals): ₦700 per referral
- [ ] **AC3:** Tier 3 (21-50 referrals): ₦1,000 per referral
- [ ] **AC4:** Tier 4 (51+ referrals): ₦1,500 per referral
- [ ] **AC5:** Show current tier and progress to next tier
- [ ] **AC6:** Tier eligibility checks (must reach thresholds)
- [ ] **AC7:** Retroactive tier upgrades (unlock better rates for past referrals)

**Milestone Bonuses:**
- [ ] **AC8:** Bonus on 10th referral: ₦5,000
- [ ] **AC9:** Bonus on 25th referral: ₦10,000
- [ ] **AC10:** Bonus on 50th referral: ₦25,000
- [ ] **AC11:** Custom milestone bonuses per campaign
- [ ] **AC12:** Only once per user per milestone
- [ ] **AC13:** Notification on milestone bonus earned

**Conditional Rewards:**
- [ ] **AC14:** Bonus if referee reaches KYC Tier 2: ₦1,000
- [ ] **AC15:** Bonus if referee completes first transaction: ₦500
- [ ] **AC16:** Bonus if referee's first transaction > ₦10K: +₦500
- [ ] **AC17:** Bonus if referee's account survives 30 days (low churn): ₦1,000

**Seasonal Promotions:**
- [ ] **AC18:** Create time-limited campaigns (start/end date)
- [ ] **AC19:** Override reward amounts (2x rewards during campaign)
- [ ] **AC20:** Target specific user segments
- [ ] **AC21:** Track campaign performance (attribution, ROI)
- [ ] **AC22:** Campaign notifications to eligible users

**Reward Expiry:**
- [ ] **AC23:** Rewards must be claimed within 90 days
- [ ] **AC24:** Unclaimed rewards auto-expire
- [ ] **AC25:** Expiry notifications (30 days, 7 days, 1 day before)

**Non-Functional:**
- [ ] **AC26:** Tier calculation: < 100ms
- [ ] **AC27:** Reward calculation: < 200ms
- [ ] **AC28:** Support 1M+ reward records

---

#### Technical Specifications

**Reward & Tier Entities:**

```typescript
@Entity('reward_tiers')
export class RewardTier extends BaseEntity {
  @Column('varchar')
  tier_name: string;  // Bronze, Silver, Gold, Platinum

  @Column('integer')
  min_referrals: number;  // Min referrals to reach tier

  @Column('integer')
  max_referrals: number;  // Max referrals in tier (or Infinity)

  @Column('decimal', { precision: 10, scale: 2 })
  reward_amount: number;  // ₦ per referral

  @Column('integer', { default: 1 })
  tier_level: number;  // 1, 2, 3, 4

  @Column('timestamp with time zone')
  created_at: Date;

  @OneToMany(() => ReferrerTier, rt => rt.tier)
  referrer_tiers: ReferrerTier[];
}

@Entity('referrer_tiers')
export class ReferrerTier extends BaseEntity {
  @Column('uuid')
  referrer_id: string;

  @Column('uuid')
  tier_id: string;

  @Column('integer')
  referral_count: number;

  @Column('timestamp with time zone')
  achieved_at: Date;

  @Column('boolean', { default: false })
  is_current: boolean;

  @ManyToOne(() => RewardTier)
  @JoinColumn({ name: 'tier_id' })
  tier: RewardTier;
}

@Entity('milestone_bonuses')
export class MilestoneBonus extends BaseEntity {
  @Column('integer')
  referral_count: number;  // 10, 25, 50, etc.

  @Column('decimal', { precision: 10, scale: 2 })
  bonus_amount: number;

  @Column('varchar', { nullable: true })
  description: string;

  @Column('timestamp with time zone')
  created_at: Date;
}

@Entity('rewards')
export class Reward extends BaseEntity {
  @Column('uuid')
  referrer_id: string;

  @Column('uuid', { nullable: true })
  referral_id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  reward_amount: number;

  @Column('varchar')
  reward_type: string;  // base_reward, milestone_bonus, conditional_bonus, seasonal_bonus

  @Column('varchar', { nullable: true })
  campaign_id: string;

  @Column({ type: 'enum', enum: RewardStatus, default: 'pending' })
  status: RewardStatus;  // pending, earned, claimed, credited, expired

  @Column('timestamp with time zone')
  earned_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  claimed_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  credited_at: Date;

  @Column('timestamp with time zone')
  expires_at: Date;  // 90 days from earned_at

  @Column('varchar', { nullable: true })
  claim_method: string;  // wallet_credit, bank_transfer, airtime, mobile_money

  @Column('timestamp with time zone')
  created_at: Date;

  @ManyToOne(() => Referral, { nullable: true })
  @JoinColumn({ name: 'referral_id' })
  referral: Referral;
}

@Entity('promotional_campaigns')
export class PromotionalCampaign extends BaseEntity {
  @Column('varchar')
  campaign_name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 3, scale: 2 })
  reward_multiplier: number;  // 1.5 = 1.5x rewards, 2.0 = 2x rewards

  @Column('timestamp with time zone')
  start_date: Date;

  @Column('timestamp with time zone')
  end_date: Date;

  @Column('varchar', { nullable: true })
  target_segment: string;  // user_segment for targeting

  @Column('integer', { default: 0 })
  budget_limit: number;  // Total budget for campaign

  @Column('integer', { default: 0 })
  spend_to_date: number;  // Current spend

  @Column('boolean', { default: true })
  is_active: boolean;

  @Column('timestamp with time zone')
  created_at: Date;

  @OneToMany(() => Reward, r => r.campaign_id, { nullable: true })
  rewards: Reward[];
}
```

**Tier Management Service:**

```typescript
@Injectable()
export class RewardTierService {
  constructor(
    @InjectRepository(RewardTier)
    private tierRepository: Repository<RewardTier>,
    @InjectRepository(ReferrerTier)
    private referrerTierRepository: Repository<ReferrerTier>,
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
  ) {}

  async calculateTierForReferrer(referrerId: string): Promise<RewardTier> {
    const referralCount = await this.getReferralCount(referrerId);

    const tier = await this.tierRepository.findOne({
      where: {
        min_referrals: LessThanOrEqual(referralCount),
        max_referrals: MoreThanOrEqual(referralCount),
      },
      order: { tier_level: 'DESC' },
    });

    return tier;
  }

  async updateReferrerTier(referrerId: string): Promise<void> {
    const newTier = await this.calculateTierForReferrer(referrerId);
    const currentTier = await this.referrerTierRepository.findOne({
      where: { referrer_id: referrerId, is_current: true },
    });

    if (currentTier?.tier_id !== newTier.id) {
      // Deactivate current tier
      if (currentTier) {
        currentTier.is_current = false;
        await this.referrerTierRepository.save(currentTier);
      }

      // Create new tier record
      const tierRecord = this.referrerTierRepository.create({
        referrer_id: referrerId,
        tier_id: newTier.id,
        referral_count: await this.getReferralCount(referrerId),
        achieved_at: new Date(),
        is_current: true,
      });

      await this.referrerTierRepository.save(tierRecord);
    }
  }

  async calculateRewardAmount(referrerId: string, referralCount: number = 1): Promise<number> {
    const tier = await this.calculateTierForReferrer(referrerId);
    return tier.reward_amount * referralCount;
  }

  private async getReferralCount(referrerId: string): Promise<number> {
    // Count successful referrals
    const count = await this.rewardRepository.count({
      where: { referrer_id: referrerId, status: 'earned' },
    });
    return count;
  }
}
```

---

## FEATURE-4: Leaderboard & Gamification

### 📘 User Story: US-35.4.1 - Referral Leaderboard

**Story ID:** US-35.4.1
**Feature:** FEATURE-4 (Leaderboard & Gamification)
**Epic:** Customer Experience & Growth

**Story Points:** 4
**Priority:** P1 (High)
**Sprint:** Sprint 35
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to see a leaderboard of top referrers and earn badges/achievements
So that I'm motivated to compete and earn more referrals
```

---

#### Business Value

**Value Statement:**
Gamification drives engagement and motivation. Leaderboards create healthy competition among top referrers. Badges provide recognition and social proof.

**Impact:**
- **High:** Increases engagement and motivation
- **Social:** Users share achievements on social media
- **Retention:** Gamification increases 30-day retention by 40%

**Success Criteria:**
- Real-time leaderboard updates
- Weekly and monthly leaderboards
- Badge system (10, 25, 50 referral badges)
- Top referrers highlighted
- Seasonal competitions with special rewards

---

#### Acceptance Criteria

**Leaderboard Display:**
- [ ] **AC1:** View top 10 referrers by week
- [ ] **AC2:** View top 10 referrers by month
- [ ] **AC3:** View all-time top 100 referrers
- [ ] **AC4:** Show rank, name, referral count, reward amount
- [ ] **AC5:** Show current user's position
- [ ] **AC6:** Update leaderboard real-time or hourly
- [ ] **AC7:** Filter leaderboard by tier level
- [ ] **AC8:** Export leaderboard data

**Achievements & Badges:**
- [ ] **AC9:** Badge: 10 referrals (Silver)
- [ ] **AC10:** Badge: 25 referrals (Gold)
- [ ] **AC11:** Badge: 50 referrals (Platinum)
- [ ] **AC12:** Badge: 100 referrals (Diamond)
- [ ] **AC13:** Show earned badges on profile
- [ ] **AC14:** Share badge achievement on social media
- [ ] **AC15:** Badge notification on earn

**Seasonal Competitions:**
- [ ] **AC16:** Create themed competitions (New Year New Friends, etc.)
- [ ] **AC17:** Special leaderboards per competition
- [ ] **AC18:** Prize pool (1st: ₦50K, 2nd: ₦30K, 3rd: ₦15K)
- [ ] **AC19:** Auto-distribute prizes at competition end
- [ ] **AC20:** Marketing campaign around competitions

**Rankings & Tiers:**
- [ ] **AC21:** Show tier rank (Rookie, Partner, Ambassador, Champion)
- [ ] **AC22:** Update ranks as users progress
- [ ] **AC23:** Show progress to next rank
- [ ] **AC24:** Permanent rank history

**Non-Functional:**
- [ ] **AC25:** Leaderboard load: < 500ms
- [ ] **AC26:** Real-time updates via WebSocket
- [ ] **AC27:** Cache leaderboard snapshots hourly
- [ ] **AC28:** Support 100K+ users on leaderboard

---

## FEATURE-5: Fraud Prevention & Anti-Gaming

### 📘 User Story: US-35.5.1 - Fraud Detection & Prevention

**Story ID:** US-35.5.1
**Feature:** FEATURE-5 (Fraud Prevention & Anti-Gaming)
**Epic:** Customer Experience & Growth

**Story Points:** 4
**Priority:** P0 (Critical)
**Sprint:** Sprint 35
**Status:** 🔄 Not Started

---

#### User Story

```
As a compliance officer
I want to prevent referral fraud, duplicate accounts, and gaming of the system
So that the referral program maintains integrity and ROI
```

---

#### Business Value

**Value Statement:**
Fraud prevention protects referral program economics. Gaming the system (fake referrals) wastes acquisition budget. Anti-fraud controls ensure only legitimate referrals earn rewards.

**Impact:**
- **Critical:** Protects ₦1.5M-2.5M/month referral budget
- **Compliance:** Prevents fraudulent reward distributions
- **Quality:** Ensures only high-quality referrals

**Success Criteria:**
- Detect 95% of fraud attempts
- < 2% false positives
- Block obvious multi-accounting attempts
- Real-time fraud scoring

---

#### Acceptance Criteria

**Device Fingerprinting:**
- [ ] **AC1:** Detect multiple accounts per device
- [ ] **AC2:** Block signup if device already has active account
- [ ] **AC3:** Flag suspicious device patterns
- [ ] **AC4:** Device fingerprinting (browser, OS, screen, fonts)
- [ ] **AC5:** Update device fingerprint on login

**IP & Location Checks:**
- [ ] **AC6:** Block signup from same IP as referrer
- [ ] **AC7:** Flag suspicious IP patterns (VPN, proxy)
- [ ] **AC8:** Block signups from blocked IP lists
- [ ] **AC9:** Geolocation validation
- [ ] **AC10:** Flag velocity attacks (multiple signups same location)

**Account Validation:**
- [ ] **AC11:** Phone number: one account per phone (verified)
- [ ] **AC12:** Email: one account per email (verified)
- [ ] **AC13:** Block temporary email providers
- [ ] **AC14:** Email domain validation (corporate, free, etc.)
- [ ] **AC15:** KYC requirement for reward claim

**Referral Code Security:**
- [ ] **AC16:** Referral codes non-transferable
- [ ] **AC17:** Cannot use own referral code
- [ ] **AC18:** Cannot refer same user twice
- [ ] **AC19:** Prevent share-back fraud (B refers A, A refers B)

**Velocity & Threshold Checks:**
- [ ] **AC20:** Max referrals per day: 100
- [ ] **AC21:** Max referrals per month: 1,000
- [ ] **AC22:** Burst detection: flag if spike > 5x average
- [ ] **AC23:** Minimum account age: 30 days before rewards

**Manual Review & Appeals:**
- [ ] **AC24:** Flag suspicious accounts for manual review
- [ ] **AC25:** Compliance team review queue
- [ ] **AC26:** Appeals process for false flagging
- [ ] **AC27:** Automated restoration of flags after investigation

**Non-Functional:**
- [ ] **AC28:** Fraud scoring: < 100ms per user
- [ ] **AC29:** Real-time fraud detection
- [ ] **AC30:** Audit trail of all fraud decisions

---

## Summary of Sprint 35 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-35.1.1 | Referral Code Management | 6 | P0 | To Do |
| US-35.2.1 | Attribution & Conversion Tracking | 6 | P0 | To Do |
| US-35.3.1 | Tiered Rewards System | 5 | P0 | To Do |
| US-35.4.1 | Leaderboard & Gamification | 4 | P1 | To Do |
| US-35.5.1 | Fraud Detection & Prevention | 4 | P0 | To Do |
| US-35.6.1 | Referral Analytics & Reporting | 2 | P1 | To Do |
| US-35.7.1 | UI/UX & User Experience | 1 | P1 | To Do |
| **Total** | | **28** | | |

---

## Dependencies

**External:**
- Device fingerprinting library (TruValidate, FingerprintJS)
- QR code generation (qrcode npm package)
- Short URL service (custom or Rebrandly API)
- Redis for leaderboard caching
- EventEmitter for real-time updates

**Internal:**
- Wallet system (Sprint 4-5)
- KYC system (Sprint 19)
- User authentication (Sprint 1-3)
- Notification system (Sprint 7)
- Batch payments (Sprint 27)
- Analytics (Sprint 39)

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-35.1 | Fraud/gaming drains referral budget | High | Critical | Multi-layer fraud detection, manual review |
| RISK-35.2 | Low referral conversion rate | Medium | High | Optimize UI/UX, run A/B tests, improve incentives |
| RISK-35.3 | Leaderboard performance issues | Medium | Medium | Redis caching, periodic snapshot updates |
| RISK-35.4 | Attribution window too short | Low | Medium | Extend to 60 days, analyze conversion times |
| RISK-35.5 | Device fingerprinting accuracy | Medium | Medium | Use proven library (FingerprintJS), manual review |

---

## Notes & Decisions

**Technical Decisions:**
1. **Device fingerprinting:** Use FingerprintJS for accuracy
2. **Leaderboard:** Redis sorted sets for real-time updates
3. **Fraud detection:** Multi-factor scoring (device, IP, velocity, etc.)
4. **QR codes:** qrcode npm package with S3 storage
5. **Short links:** Custom shortener or Rebrandly API

**Open Questions:**
1. ❓ Should referrals be tier-locked? **Decision: No, all users can earn all tiers**
2. ❓ How aggressive should fraud detection be? **Decision: Conservative (aim for < 2% false positives)**
3. ❓ Should referral rewards be capped per user? **Decision: Yes, ₦2.5M/month max**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Implement comprehensive referral and rewards system with gamification and fraud prevention
