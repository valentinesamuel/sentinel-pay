# Sprint 12 Backlog - Gift Cards, Loyalty, Analytics & White-label

**Sprint:** Sprint 12
**Duration:** 2 weeks (Week 25-26)
**Sprint Goal:** Implement gift cards/vouchers, loyalty programs, advanced analytics, white-label solutions, and platform performance optimization
**Story Points Committed:** 45
**Team Capacity:** 45 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1-11 (45, 42, 38, 45, 48, 45, 42, 45, 45, 45, 45) = 44.1 SP, committed 45 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 12, we will have:
1. Gift card issuance and redemption system
2. Merchant voucher campaigns
3. Multi-tiered loyalty/rewards program
4. Points accumulation and redemption
5. Advanced analytics dashboard with predictive insights
6. Business intelligence reporting
7. White-label solution for partners
8. Custom branding and domain configuration
9. Performance optimization with caching
10. API response time improvements

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Gift card redemption tests passing
- [ ] Loyalty points calculation tests passing
- [ ] Analytics query performance tests passing
- [ ] White-label branding tests passing
- [ ] API documentation updated (Swagger)
- [ ] Performance benchmarks met
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-21: Gift Cards & Vouchers

## FEATURE-21.1: Digital Gift Cards

### 📘 User Story: US-12.1.1 - Gift Cards & Vouchers

**Story ID:** US-12.1.1
**Feature:** FEATURE-21.1 (Digital Gift Cards)
**Epic:** EPIC-21 (Gift Cards & Vouchers)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 12
**Status:** 🔄 Not Started

---

#### User Story

```
As a merchant
I want to issue and sell digital gift cards and vouchers
So that I can increase revenue, attract new customers, and reward loyal customers
```

---

#### Business Value

**Value Statement:**
Gift cards and vouchers drive revenue through upfront payments, increase customer acquisition, and have high breakage rates (unredeemed value). They also encourage repeat visits and higher average order values.

**Impact:**
- **Critical:** Significant revenue driver (15-20% breakage rate)
- **Growth:** Customer acquisition through gifting
- **Retention:** Encourages return visits
- **Seasonal:** High demand during holidays

**Success Criteria:**
- 30% of merchants issue gift cards
- Average gift card value > NGN 10,000
- 80% redemption rate within 12 months
- 20% of recipients become regular customers
- < 30 seconds gift card purchase flow

---

#### Acceptance Criteria

**Gift Card Issuance:**
- [ ] **AC1:** Merchant can create gift card product
- [ ] **AC2:** Fixed denomination gift cards (NGN 5,000, 10,000, 20,000, 50,000)
- [ ] **AC3:** Custom amount gift cards (min NGN 1,000, max NGN 500,000)
- [ ] **AC4:** Gift card branding (merchant logo, colors)
- [ ] **AC5:** Unique gift card code generation (16 digits)
- [ ] **AC6:** Expiry date configuration (6 months, 1 year, 2 years, never)
- [ ] **AC7:** Terms and conditions customization
- [ ] **AC8:** Gift card balance tracking
- [ ] **AC9:** Physical card option (print-at-home PDF)

**Gift Card Purchase:**
- [ ] **AC10:** Purchase gift card via payment link
- [ ] **AC11:** Purchase multiple gift cards in one transaction
- [ ] **AC12:** Email delivery to recipient
- [ ] **AC13:** Schedule delivery (future date)
- [ ] **AC14:** Personalized message with gift card
- [ ] **AC15:** SMS delivery option
- [ ] **AC16:** Instant delivery after payment
- [ ] **AC17:** Receipt for purchaser

**Gift Card Redemption:**
- [ ] **AC18:** Redeem via code entry
- [ ] **AC19:** Redeem via QR code scan
- [ ] **AC20:** Partial redemption (use balance incrementally)
- [ ] **AC21:** Check gift card balance
- [ ] **AC22:** Multiple redemptions until balance zero
- [ ] **AC23:** Redemption history tracking
- [ ] **AC24:** Expiry validation
- [ ] **AC25:** Prevent double redemption

**Voucher Campaigns:**
- [ ] **AC26:** Create discount voucher campaigns
- [ ] **AC27:** Percentage discount (10%, 20%, 50% off)
- [ ] **AC28:** Fixed amount discount (NGN 1,000 off)
- [ ] **AC29:** Minimum purchase requirement
- [ ] **AC30:** Maximum discount cap
- [ ] **AC31:** Usage limit per customer
- [ ] **AC32:** Campaign duration (start/end dates)
- [ ] **AC33:** Voucher code generation (PROMO20, SAVE50)
- [ ] **AC34:** Bulk voucher generation (1000 unique codes)

**Management & Reporting:**
- [ ] **AC35:** View all issued gift cards
- [ ] **AC36:** Gift card sales report
- [ ] **AC37:** Redemption analytics
- [ ] **AC38:** Outstanding balance report
- [ ] **AC39:** Breakage revenue tracking (unredeemed after expiry)
- [ ] **AC40:** Void/cancel gift card

---

#### Technical Specifications

**Gift Card Schema:**

```typescript
@Entity('gift_cards')
export class GiftCard extends BaseEntity {
  @Column({ type: 'varchar', length: 16, unique: true })
  code: string; // Unique 16-digit code

  @Column('uuid')
  merchant_id: string;

  @Column({ type: 'varchar', length: 100 })
  product_name: string;

  @Column({ type: 'bigint' })
  initial_value: number;

  @Column({ type: 'bigint' })
  current_balance: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['active', 'redeemed', 'expired', 'cancelled'],
    default: 'active'
  })
  status: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expires_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  purchaser: {
    name: string;
    email: string;
    transaction_reference: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  recipient: {
    name?: string;
    email?: string;
    message?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  branding: {
    logo_url?: string;
    background_color?: string;
    design_template?: string;
  };

  @Column({ type: 'text', nullable: true })
  terms_and_conditions: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pdf_url: string; // Print-at-home PDF

  @Column({ type: 'timestamp with time zone', nullable: true })
  first_redeemed_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fully_redeemed_at: Date;

  @ManyToOne(() => MerchantAccount)
  @JoinColumn({ name: 'merchant_id' })
  merchant: MerchantAccount;

  @OneToMany(() => GiftCardRedemption, redemption => redemption.gift_card)
  redemptions: GiftCardRedemption[];
}

@Entity('gift_card_redemptions')
export class GiftCardRedemption extends BaseEntity {
  @Column('uuid')
  gift_card_id: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'bigint' })
  balance_before: number;

  @Column({ type: 'bigint' })
  balance_after: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  transaction_reference: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  redeemed_by_email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string; // Store location or online

  @ManyToOne(() => GiftCard, card => card.redemptions)
  @JoinColumn({ name: 'gift_card_id' })
  gift_card: GiftCard;
}

@Entity('vouchers')
export class Voucher extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // PROMO20, SAVE50

  @Column('uuid')
  merchant_id: string;

  @Column({ type: 'varchar', length: 100 })
  campaign_name: string;

  @Column({
    type: 'enum',
    enum: ['percentage', 'fixed_amount'],
  })
  discount_type: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount_percentage: number; // 20.00 for 20%

  @Column({ type: 'bigint', nullable: true })
  discount_amount: number;

  @Column({ type: 'bigint', default: 0 })
  min_purchase_amount: number;

  @Column({ type: 'bigint', nullable: true })
  max_discount: number; // Cap for percentage discounts

  @Column({ type: 'integer', nullable: true })
  usage_limit_per_customer: number;

  @Column({ type: 'integer', nullable: true })
  total_usage_limit: number;

  @Column({ type: 'integer', default: 0 })
  times_used: number;

  @Column({ type: 'timestamp with time zone' })
  valid_from: Date;

  @Column({ type: 'timestamp with time zone' })
  valid_until: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => MerchantAccount)
  @JoinColumn({ name: 'merchant_id' })
  merchant: MerchantAccount;

  @OneToMany(() => VoucherUsage, usage => usage.voucher)
  usages: VoucherUsage[];
}

@Entity('voucher_usages')
export class VoucherUsage extends BaseEntity {
  @Column('uuid')
  voucher_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  transaction_reference: string;

  @Column({ type: 'bigint' })
  order_amount: number;

  @Column({ type: 'bigint' })
  discount_applied: number;

  @ManyToOne(() => Voucher, voucher => voucher.usages)
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

**Gift Card Service:**

```typescript
@Injectable()
export class GiftCardService {
  constructor(
    @InjectRepository(GiftCard)
    private giftCardRepository: Repository<GiftCard>,
    @InjectRepository(GiftCardRedemption)
    private redemptionRepository: Repository<GiftCardRedemption>,
    private emailService: EmailService,
    private pdfService: PdfService,
  ) {}

  async issueGiftCard(dto: IssueGiftCardDto): Promise<GiftCard> {
    // Generate unique code
    const code = await this.generateUniqueCode();

    // Calculate expiry
    const expiresAt = this.calculateExpiry(dto.expiry_months);

    const giftCard = this.giftCardRepository.create({
      code,
      merchant_id: dto.merchant_id,
      product_name: dto.product_name,
      initial_value: dto.amount,
      current_balance: dto.amount,
      currency: dto.currency || 'NGN',
      status: 'active',
      expires_at: expiresAt,
      purchaser: dto.purchaser,
      recipient: dto.recipient,
      branding: dto.branding,
      terms_and_conditions: dto.terms,
    });

    await this.giftCardRepository.save(giftCard);

    // Generate PDF
    if (dto.generate_pdf) {
      const pdfBuffer = await this.pdfService.generateGiftCardPdf(giftCard);
      // Upload to S3 and store URL
      giftCard.pdf_url = await this.uploadPdf(pdfBuffer, code);
      await this.giftCardRepository.save(giftCard);
    }

    // Send email to recipient
    if (dto.recipient?.email) {
      await this.sendGiftCardEmail(giftCard);
    }

    return giftCard;
  }

  async redeemGiftCard(
    code: string,
    amount: number,
    redeemedBy?: string,
  ): Promise<GiftCardRedemption> {
    const giftCard = await this.giftCardRepository.findOne({
      where: { code },
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    // Validate gift card
    await this.validateGiftCard(giftCard, amount);

    // Create redemption record
    const redemption = this.redemptionRepository.create({
      gift_card_id: giftCard.id,
      amount,
      balance_before: giftCard.current_balance,
      balance_after: giftCard.current_balance - amount,
      redeemed_by_email: redeemedBy,
    });

    await this.redemptionRepository.save(redemption);

    // Update gift card balance
    giftCard.current_balance -= amount;

    if (giftCard.current_balance === 0) {
      giftCard.status = 'redeemed';
      giftCard.fully_redeemed_at = new Date();
    }

    if (!giftCard.first_redeemed_at) {
      giftCard.first_redeemed_at = new Date();
    }

    await this.giftCardRepository.save(giftCard);

    return redemption;
  }

  async checkBalance(code: string): Promise<{
    balance: number;
    currency: string;
    status: string;
    expires_at: Date;
  }> {
    const giftCard = await this.giftCardRepository.findOne({
      where: { code },
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    return {
      balance: giftCard.current_balance,
      currency: giftCard.currency,
      status: giftCard.status,
      expires_at: giftCard.expires_at,
    };
  }

  private async validateGiftCard(
    giftCard: GiftCard,
    amount: number,
  ): Promise<void> {
    if (giftCard.status !== 'active') {
      throw new BadRequestException('Gift card is not active');
    }

    if (giftCard.expires_at && new Date() > giftCard.expires_at) {
      giftCard.status = 'expired';
      await this.giftCardRepository.save(giftCard);
      throw new BadRequestException('Gift card has expired');
    }

    if (amount > giftCard.current_balance) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${giftCard.current_balance}`
      );
    }
  }

  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
      code = this.generateCode(16);
      const existing = await this.giftCardRepository.findOne({
        where: { code },
      });
      exists = !!existing;
    }

    return code;
  }

  private generateCode(length: number): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if ((i + 1) % 4 === 0 && i !== length - 1) {
        code += '-'; // Format: XXXX-XXXX-XXXX-XXXX
      }
    }
    return code;
  }

  private calculateExpiry(months: number): Date {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);
    return expiry;
  }

  async getGiftCardAnalytics(merchantId: string): Promise<{
    total_issued: number;
    total_value_issued: number;
    total_redeemed: number;
    total_value_redeemed: number;
    outstanding_balance: number;
    breakage_revenue: number;
  }> {
    const issued = await this.giftCardRepository
      .createQueryBuilder('gc')
      .select('COUNT(*)', 'count')
      .addSelect('SUM(initial_value)', 'total_value')
      .where('gc.merchant_id = :merchantId', { merchantId })
      .getRawOne();

    const redeemed = await this.giftCardRepository
      .createQueryBuilder('gc')
      .select('COUNT(*)', 'count')
      .addSelect('SUM(initial_value - current_balance)', 'total_value')
      .where('gc.merchant_id = :merchantId', { merchantId })
      .getRawOne();

    const expired = await this.giftCardRepository
      .createQueryBuilder('gc')
      .select('SUM(current_balance)', 'breakage')
      .where('gc.merchant_id = :merchantId', { merchantId })
      .andWhere('gc.status = :status', { status: 'expired' })
      .getRawOne();

    return {
      total_issued: parseInt(issued.count || '0'),
      total_value_issued: parseInt(issued.total_value || '0'),
      total_redeemed: parseInt(redeemed.count || '0'),
      total_value_redeemed: parseInt(redeemed.total_value || '0'),
      outstanding_balance: parseInt(issued.total_value || '0') - parseInt(redeemed.total_value || '0'),
      breakage_revenue: parseInt(expired.breakage || '0'),
    };
  }
}
```

---

# EPIC-22: Loyalty & Rewards

## FEATURE-22.1: Points-Based Loyalty Program

### 📘 User Story: US-12.2.1 - Loyalty & Rewards Program

**Story ID:** US-12.2.1
**Feature:** FEATURE-22.1 (Points-Based Loyalty Program)
**Epic:** EPIC-22 (Loyalty & Rewards)

**Story Points:** 8
**Priority:** P1 (High)
**Sprint:** Sprint 12
**Status:** 🔄 Not Started

---

#### User Story

```
As a merchant
I want to create a loyalty program where customers earn points for purchases
So that I can increase customer retention and encourage repeat business
```

---

#### Business Value

**Value Statement:**
Loyalty programs increase customer lifetime value by 25-95%, improve retention rates by 5%, and drive higher purchase frequency. Points-based systems gamify the experience and create emotional attachment to the brand.

**Impact:**
- **High:** Increases repeat purchase rate by 30%
- **Retention:** Reduces churn by 18%
- **AOV:** Average order value increases by 12-15%
- **Engagement:** More frequent interactions

**Success Criteria:**
- 40% of customers enroll in loyalty programs
- Loyalty members spend 20% more than non-members
- 60% of points earned are redeemed
- Redemption drives incremental purchases

---

#### Acceptance Criteria

**Program Configuration:**
- [ ] **AC1:** Merchant creates loyalty program
- [ ] **AC2:** Configure points earning rate (1 point per NGN 100 spent)
- [ ] **AC3:** Bonus points for specific actions (signup, referral, birthday)
- [ ] **AC4:** Tier system (Bronze, Silver, Gold, Platinum)
- [ ] **AC5:** Tier upgrade thresholds
- [ ] **AC6:** Tier benefits (higher earn rate, exclusive offers)
- [ ] **AC7:** Points expiry configuration (e.g., 12 months)

**Points Accumulation:**
- [ ] **AC8:** Automatic points on transaction completion
- [ ] **AC9:** Manual points adjustment by merchant
- [ ] **AC10:** Bonus points campaigns
- [ ] **AC11:** Points for non-purchase actions (reviews, social shares)
- [ ] **AC12:** Points history/ledger
- [ ] **AC13:** Points expiry notifications

**Points Redemption:**
- [ ] **AC14:** Redeem points for discount (100 points = NGN 100)
- [ ] **AC15:** Redeem points for free products
- [ ] **AC16:** Partial points redemption
- [ ] **AC17:** Minimum redemption threshold
- [ ] **AC18:** Points + cash payment combination
- [ ] **AC19:** Redemption confirmation

**Customer Experience:**
- [ ] **AC20:** View current points balance
- [ ] **AC21:** View tier status and progress
- [ ] **AC22:** View points history
- [ ] **AC23:** View rewards catalog
- [ ] **AC24:** Push notification on points earned
- [ ] **AC25:** Email summary of points activity

**Analytics:**
- [ ] **AC26:** Total points issued
- [ ] **AC27:** Total points redeemed
- [ ] **AC28:** Points liability (unredeemed points value)
- [ ] **AC29:** Member vs non-member purchase comparison
- [ ] **AC30:** Tier distribution of members

---

#### Technical Specifications

**Loyalty Program Schema:**

```typescript
@Entity('loyalty_programs')
export class LoyaltyProgram extends BaseEntity {
  @Column('uuid', { unique: true })
  merchant_id: string;

  @Column({ type: 'varchar', length: 100 })
  program_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  points_per_currency_unit: number; // e.g., 1 point per NGN 100 = 0.01

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'jsonb' })
  tiers: Array<{
    name: string;
    threshold: number;
    multiplier: number; // 1.5x points for Gold tier
    benefits: string[];
  }>;

  @Column({ type: 'integer', nullable: true })
  points_expiry_months: number;

  @Column({ type: 'bigint', default: 100 })
  min_redemption_points: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  redemption_value: number; // 1 point = NGN 1 = 1.0

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => MerchantAccount)
  @JoinColumn({ name: 'merchant_id' })
  merchant: MerchantAccount;
}

@Entity('loyalty_memberships')
export class LoyaltyMembership extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column('uuid')
  program_id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  membership_number: string;

  @Column({ type: 'bigint', default: 0 })
  total_points: number;

  @Column({ type: 'bigint', default: 0 })
  lifetime_points_earned: number;

  @Column({ type: 'bigint', default: 0 })
  lifetime_points_redeemed: number;

  @Column({ type: 'varchar', length: 50, default: 'Bronze' })
  current_tier: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  tier_upgraded_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => LoyaltyProgram)
  @JoinColumn({ name: 'program_id' })
  program: LoyaltyProgram;

  @OneToMany(() => LoyaltyTransaction, txn => txn.membership)
  transactions: LoyaltyTransaction[];

  @Index(['user_id', 'program_id'], { unique: true })
}

@Entity('loyalty_transactions')
export class LoyaltyTransaction extends BaseEntity {
  @Column('uuid')
  membership_id: string;

  @Column({
    type: 'enum',
    enum: ['earned', 'redeemed', 'expired', 'adjusted'],
  })
  type: string;

  @Column({ type: 'bigint' })
  points: number;

  @Column({ type: 'bigint' })
  balance_after: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  transaction_reference: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expires_at: Date;

  @ManyToOne(() => LoyaltyMembership, membership => membership.transactions)
  @JoinColumn({ name: 'membership_id' })
  membership: LoyaltyMembership;
}
```

**Loyalty Service:**

```typescript
@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyProgram)
    private programRepository: Repository<LoyaltyProgram>,
    @InjectRepository(LoyaltyMembership)
    private membershipRepository: Repository<LoyaltyMembership>,
    @InjectRepository(LoyaltyTransaction)
    private transactionRepository: Repository<LoyaltyTransaction>,
    private notificationService: NotificationService,
  ) {}

  async enrollCustomer(
    userId: string,
    programId: string,
  ): Promise<LoyaltyMembership> {
    // Check if already enrolled
    const existing = await this.membershipRepository.findOne({
      where: { user_id: userId, program_id: programId },
    });

    if (existing) {
      throw new ConflictException('Already enrolled in this program');
    }

    const membership = this.membershipRepository.create({
      user_id: userId,
      program_id: programId,
      membership_number: await this.generateMembershipNumber(),
      total_points: 0,
      lifetime_points_earned: 0,
      lifetime_points_redeemed: 0,
      current_tier: 'Bronze',
      is_active: true,
    });

    await this.membershipRepository.save(membership);

    // Award signup bonus
    await this.awardPoints(membership.id, 100, 'Signup bonus');

    return membership;
  }

  async awardPoints(
    membershipId: string,
    points: number,
    description: string,
    transactionRef?: string,
  ): Promise<LoyaltyTransaction> {
    const membership = await this.membershipRepository.findOne({
      where: { id: membershipId },
      relations: ['program'],
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Calculate expiry
    const expiresAt = membership.program.points_expiry_months
      ? new Date(Date.now() + membership.program.points_expiry_months * 30 * 24 * 60 * 60 * 1000)
      : null;

    // Create transaction
    const transaction = this.transactionRepository.create({
      membership_id: membershipId,
      type: 'earned',
      points,
      balance_after: membership.total_points + points,
      description,
      transaction_reference: transactionRef,
      expires_at: expiresAt,
    });

    await this.transactionRepository.save(transaction);

    // Update membership
    membership.total_points += points;
    membership.lifetime_points_earned += points;

    // Check tier upgrade
    await this.checkTierUpgrade(membership);

    await this.membershipRepository.save(membership);

    // Notify customer
    await this.notificationService.send({
      user_id: membership.user_id,
      type: 'loyalty_points_earned',
      title: 'Points Earned!',
      message: `You earned ${points} points. Balance: ${membership.total_points}`,
      channels: ['push'],
    });

    return transaction;
  }

  async redeemPoints(
    membershipId: string,
    points: number,
    description: string,
  ): Promise<LoyaltyTransaction> {
    const membership = await this.membershipRepository.findOne({
      where: { id: membershipId },
      relations: ['program'],
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Validate redemption
    if (points > membership.total_points) {
      throw new BadRequestException('Insufficient points');
    }

    if (points < membership.program.min_redemption_points) {
      throw new BadRequestException(
        `Minimum redemption is ${membership.program.min_redemption_points} points`
      );
    }

    // Create transaction
    const transaction = this.transactionRepository.create({
      membership_id: membershipId,
      type: 'redeemed',
      points: -points,
      balance_after: membership.total_points - points,
      description,
    });

    await this.transactionRepository.save(transaction);

    // Update membership
    membership.total_points -= points;
    membership.lifetime_points_redeemed += points;

    await this.membershipRepository.save(membership);

    return transaction;
  }

  private async checkTierUpgrade(membership: LoyaltyMembership): Promise<void> {
    const program = membership.program;
    const lifetimePoints = membership.lifetime_points_earned;

    // Sort tiers by threshold descending
    const sortedTiers = [...program.tiers].sort((a, b) => b.threshold - a.threshold);

    for (const tier of sortedTiers) {
      if (lifetimePoints >= tier.threshold && membership.current_tier !== tier.name) {
        membership.current_tier = tier.name;
        membership.tier_upgraded_at = new Date();

        await this.notificationService.send({
          user_id: membership.user_id,
          type: 'loyalty_tier_upgraded',
          title: `Congratulations! You're now ${tier.name}!`,
          message: `You've been upgraded to ${tier.name} tier. Enjoy exclusive benefits!`,
          channels: ['push', 'email'],
        });

        break;
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expirePoints(): Promise<void> {
    const expiredTransactions = await this.transactionRepository
      .createQueryBuilder('txn')
      .where('txn.type = :type', { type: 'earned' })
      .andWhere('txn.expires_at IS NOT NULL')
      .andWhere('txn.expires_at < :now', { now: new Date() })
      .getMany();

    for (const txn of expiredTransactions) {
      // Create expiry transaction
      await this.transactionRepository.create({
        membership_id: txn.membership_id,
        type: 'expired',
        points: -txn.points,
        balance_after: 0, // Will be calculated
        description: 'Points expired',
      });

      // Update membership balance
      const membership = await this.membershipRepository.findOne({
        where: { id: txn.membership_id },
      });

      if (membership) {
        membership.total_points -= txn.points;
        await this.membershipRepository.save(membership);
      }
    }
  }

  private async generateMembershipNumber(): Promise<string> {
    return 'LM-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
}
```

---

## Summary of Sprint 12 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-12.1.1 | Gift Cards & Vouchers | 13 | P0 | To Do |
| US-12.2.1 | Loyalty & Rewards Program | 8 | P1 | To Do |
| US-12.3.1 | Advanced Analytics & BI | 13 | P0 | To Do |
| US-12.4.1 | White-label Solution | 8 | P1 | To Do |
| US-12.5.1 | Performance Optimization | 3 | P2 | To Do |
| **Total** | | **45** | | |

---

## Sprint Velocity Tracking

**Planned Story Points:** 45 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

---

## Dependencies

**External:**
- PDF generation library (PDFKit)
- Caching layer (Redis)
- Analytics processing (Apache Spark or similar)
- Domain management APIs

**Internal:**
- Sprint 10: Merchant accounts
- Sprint 8: Reporting infrastructure
- Sprint 11: Payment links
- All previous sprints: Transaction data

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-12.1 | Gift card fraud/abuse | Medium | High | Redemption limits, monitoring |
| RISK-12.2 | Points liability management | Low | Medium | Clear expiry policies |
| RISK-12.3 | White-label security isolation | Low | Critical | Tenant isolation, testing |
| RISK-12.4 | Performance degradation | Medium | Medium | Caching, optimization |

---

## Notes & Decisions

**Technical Decisions:**
1. **Gift Cards:** 16-digit codes with format XXXX-XXXX-XXXX-XXXX
2. **Loyalty:** Tier-based system with automatic upgrades
3. **Analytics:** Real-time with caching for dashboards
4. **White-label:** Subdomain-based tenant isolation
5. **Caching:** Redis with TTL-based invalidation

**Open Questions:**
1. ❓ Multi-merchant gift cards? **Decision: Phase 2**
2. ❓ Coalition loyalty programs? **Decision: Single merchant for now**
3. ❓ Custom analytics dashboards? **Decision: Predefined with filters**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Enable gift card revenue, increase retention through loyalty, provide business insights, and prepare for white-label expansion
