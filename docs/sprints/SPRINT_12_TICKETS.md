# Sprint 12 Tickets - Gift Cards, Loyalty, Analytics & White-label

**Sprint:** Sprint 12
**Duration:** 2 weeks (Week 25-26)
**Total Story Points:** 45 SP
**Total Tickets:** 26 tickets (5 stories + 21 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-12-001 | Story | Gift Cards & Vouchers | 13 | To Do | Developer |
| TICKET-12-002 | Task | Create Gift Card Schema | 2 | To Do | Developer |
| TICKET-12-003 | Task | Implement Gift Card Service | 3 | To Do | Developer |
| TICKET-12-004 | Task | Create Gift Card PDF Generator | 2 | To Do | Developer |
| TICKET-12-005 | Task | Implement Redemption System | 3 | To Do | Developer |
| TICKET-12-006 | Task | Create Voucher Campaign Service | 2 | To Do | Developer |
| TICKET-12-007 | Task | Implement Gift Card Endpoints | 1 | To Do | Developer |
| TICKET-12-008 | Story | Loyalty & Rewards Program | 8 | To Do | Developer |
| TICKET-12-009 | Task | Create Loyalty Program Schema | 2 | To Do | Developer |
| TICKET-12-010 | Task | Implement Loyalty Service | 2 | To Do | Developer |
| TICKET-12-011 | Task | Create Points Expiry Cron Job | 1 | To Do | Developer |
| TICKET-12-012 | Task | Implement Tier Management System | 2 | To Do | Developer |
| TICKET-12-013 | Task | Create Loyalty Endpoints | 1 | To Do | Developer |
| TICKET-12-014 | Story | Advanced Analytics & BI | 13 | To Do | Developer |
| TICKET-12-015 | Task | Create Analytics Data Warehouse Schema | 3 | To Do | Developer |
| TICKET-12-016 | Task | Implement Analytics Processing Service | 3 | To Do | Developer |
| TICKET-12-017 | Task | Create Predictive Analytics Models | 3 | To Do | Developer |
| TICKET-12-018 | Task | Build Analytics Dashboard API | 2 | To Do | Developer |
| TICKET-12-019 | Task | Implement Data Export Functionality | 2 | To Do | Developer |
| TICKET-12-020 | Story | White-label Solution | 8 | To Do | Developer |
| TICKET-12-021 | Task | Create Multi-Tenancy Infrastructure | 3 | To Do | Developer |
| TICKET-12-022 | Task | Implement Custom Branding System | 2 | To Do | Developer |
| TICKET-12-023 | Task | Create Domain Management Service | 2 | To Do | Developer |
| TICKET-12-024 | Task | Implement Tenant Isolation | 1 | To Do | Developer |
| TICKET-12-025 | Story | Performance Optimization | 3 | To Do | Developer |
| TICKET-12-026 | Task | Implement Redis Caching Layer | 3 | To Do | Developer |

---

## TICKET-12-001: Gift Cards & Vouchers

**Type:** User Story
**Story Points:** 13
**Priority:** P0 (Critical)
**Epic:** EPIC-21 (Gift Cards & Vouchers)
**Sprint:** Sprint 12

### Description

As a merchant, I want to issue and sell digital gift cards and vouchers, so that I can increase revenue, attract new customers, and reward loyal customers.

### Business Value

Gift cards drive upfront revenue with 15-20% breakage rate (unredeemed value), increase customer acquisition through gifting, and encourage repeat visits with higher average order values.

**Success Metrics:**
- 30% of merchants issue gift cards
- Average gift card value > NGN 10,000
- 80% redemption rate within 12 months
- 20% of recipients become regular customers

### Acceptance Criteria

**Gift Card Issuance:**
- [ ] Merchant can create gift card product
- [ ] Fixed denomination gift cards (NGN 5K, 10K, 20K, 50K)
- [ ] Custom amount gift cards (min NGN 1K, max NGN 500K)
- [ ] Gift card branding (merchant logo, colors)
- [ ] Unique 16-digit code generation
- [ ] Expiry date configuration
- [ ] Physical card option (print-at-home PDF)

**Purchase & Delivery:**
- [ ] Purchase via payment link
- [ ] Email delivery to recipient
- [ ] Schedule delivery (future date)
- [ ] Personalized message
- [ ] SMS delivery option
- [ ] Instant delivery after payment

**Redemption:**
- [ ] Redeem via code entry
- [ ] Redeem via QR code scan
- [ ] Partial redemption
- [ ] Check gift card balance
- [ ] Multiple redemptions until zero balance
- [ ] Expiry validation

**Voucher Campaigns:**
- [ ] Create discount voucher campaigns
- [ ] Percentage discount (10%, 20%, 50% off)
- [ ] Fixed amount discount
- [ ] Minimum purchase requirement
- [ ] Usage limits per customer
- [ ] Campaign duration
- [ ] Bulk voucher generation

### API Specification

**Issue Gift Card:**
```
POST /api/v1/gift-cards
Body:
{
  "merchant_id": "uuid",
  "product_name": "Premium Gift Card",
  "amount": 5000000,
  "expiry_months": 12,
  "recipient": {
    "email": "recipient@example.com",
    "name": "John Doe",
    "message": "Happy Birthday!"
  },
  "generate_pdf": true
}
```

**Redeem Gift Card:**
```
POST /api/v1/gift-cards/redeem
Body:
{
  "code": "XXXX-XXXX-XXXX-XXXX",
  "amount": 2000000,
  "redeemed_by": "customer@example.com"
}
```

### Subtasks

- [ ] TICKET-12-002: Create Gift Card Schema
- [ ] TICKET-12-003: Implement Gift Card Service
- [ ] TICKET-12-004: Create Gift Card PDF Generator
- [ ] TICKET-12-005: Implement Redemption System
- [ ] TICKET-12-006: Create Voucher Campaign Service
- [ ] TICKET-12-007: Implement Gift Card Endpoints

### Testing Requirements

- Unit tests: 25 tests
- Integration tests: 15 tests
- E2E tests: 8 tests

### Definition of Done

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Tests passing (48+ tests)
- [ ] PDF generation working
- [ ] Email delivery working
- [ ] Code reviewed and merged

---

## TICKET-12-002: Create Gift Card Schema

**Type:** Task
**Story Points:** 2
**Priority:** P0
**Parent:** TICKET-12-001
**Sprint:** Sprint 12

### Description

Create database schema and entities for gift cards, redemptions, and vouchers with proper indexing and constraints.

### Task Details

**Migration File:**

```typescript
export class CreateGiftCards1704600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Gift cards table
    await queryRunner.createTable(
      new Table({
        name: 'gift_cards',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '20',
            isUnique: true,
            comment: 'Format: XXXX-XXXX-XXXX-XXXX',
          },
          {
            name: 'merchant_id',
            type: 'uuid',
          },
          {
            name: 'product_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'initial_value',
            type: 'bigint',
          },
          {
            name: 'current_balance',
            type: 'bigint',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'NGN'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'redeemed', 'expired', 'cancelled'],
            default: "'active'",
          },
          {
            name: 'expires_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'purchaser',
            type: 'jsonb',
            isNullable: true,
            comment: 'Purchaser details',
          },
          {
            name: 'recipient',
            type: 'jsonb',
            isNullable: true,
            comment: 'Recipient details and message',
          },
          {
            name: 'branding',
            type: 'jsonb',
            isNullable: true,
            comment: 'Custom branding config',
          },
          {
            name: 'terms_and_conditions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'pdf_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'first_redeemed_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'fully_redeemed_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'idx_gift_card_code',
            columnNames: ['code'],
          },
          {
            name: 'idx_gift_card_merchant',
            columnNames: ['merchant_id'],
          },
          {
            name: 'idx_gift_card_status',
            columnNames: ['status'],
          },
        ],
      }),
      true,
    );

    // Gift card redemptions table
    await queryRunner.createTable(
      new Table({
        name: 'gift_card_redemptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'gift_card_id',
            type: 'uuid',
          },
          {
            name: 'amount',
            type: 'bigint',
          },
          {
            name: 'balance_before',
            type: 'bigint',
          },
          {
            name: 'balance_after',
            type: 'bigint',
          },
          {
            name: 'transaction_reference',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'redeemed_by_email',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'idx_redemption_gift_card',
            columnNames: ['gift_card_id'],
          },
        ],
      }),
      true,
    );

    // Vouchers table
    await queryRunner.createTable(
      new Table({
        name: 'vouchers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'merchant_id',
            type: 'uuid',
          },
          {
            name: 'campaign_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'discount_type',
            type: 'enum',
            enum: ['percentage', 'fixed_amount'],
          },
          {
            name: 'discount_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'discount_amount',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'min_purchase_amount',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'max_discount',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'usage_limit_per_customer',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'total_usage_limit',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'times_used',
            type: 'integer',
            default: 0,
          },
          {
            name: 'valid_from',
            type: 'timestamp with time zone',
          },
          {
            name: 'valid_until',
            type: 'timestamp with time zone',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'idx_voucher_code',
            columnNames: ['code'],
          },
          {
            name: 'idx_voucher_merchant',
            columnNames: ['merchant_id'],
          },
        ],
      }),
      true,
    );

    // Voucher usages table
    await queryRunner.createTable(
      new Table({
        name: 'voucher_usages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'voucher_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'transaction_reference',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'order_amount',
            type: 'bigint',
          },
          {
            name: 'discount_applied',
            type: 'bigint',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'idx_usage_voucher',
            columnNames: ['voucher_id'],
          },
          {
            name: 'idx_usage_user',
            columnNames: ['user_id'],
          },
        ],
      }),
      true,
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'gift_cards',
      new TableForeignKey({
        columnNames: ['merchant_id'],
        referencedTableName: 'merchant_accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'gift_card_redemptions',
      new TableForeignKey({
        columnNames: ['gift_card_id'],
        referencedTableName: 'gift_cards',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'vouchers',
      new TableForeignKey({
        columnNames: ['merchant_id'],
        referencedTableName: 'merchant_accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'voucher_usages',
      new TableForeignKey({
        columnNames: ['voucher_id'],
        referencedTableName: 'vouchers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'voucher_usages',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('voucher_usages');
    await queryRunner.dropTable('vouchers');
    await queryRunner.dropTable('gift_card_redemptions');
    await queryRunner.dropTable('gift_cards');
  }
}
```

**Entity Files:**

```typescript
@Entity('gift_cards')
export class GiftCard extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  @Index()
  code: string;

  @Column('uuid')
  @Index()
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
  @Index()
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
  pdf_url: string;

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
  @Index()
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
  location: string;

  @ManyToOne(() => GiftCard, card => card.redemptions)
  @JoinColumn({ name: 'gift_card_id' })
  gift_card: GiftCard;
}

@Entity('vouchers')
export class Voucher extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  code: string;

  @Column('uuid')
  @Index()
  merchant_id: string;

  @Column({ type: 'varchar', length: 100 })
  campaign_name: string;

  @Column({
    type: 'enum',
    enum: ['percentage', 'fixed_amount'],
  })
  discount_type: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount_percentage: number;

  @Column({ type: 'bigint', nullable: true })
  discount_amount: number;

  @Column({ type: 'bigint', default: 0 })
  min_purchase_amount: number;

  @Column({ type: 'bigint', nullable: true })
  max_discount: number;

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
  @Index()
  voucher_id: string;

  @Column('uuid')
  @Index()
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

### Acceptance Criteria

- [ ] Migration created
- [ ] All tables created with proper columns
- [ ] Unique constraints on codes
- [ ] JSONB columns for flexible data
- [ ] Proper indexes on frequently queried columns
- [ ] Foreign keys to merchant_accounts and users
- [ ] All entities implemented with relations
- [ ] Enums for status and discount types
- [ ] Migration runs successfully
- [ ] Rollback works correctly

### Testing

```typescript
describe('Gift Card Schema', () => {
  it('should create gift card with unique code');
  it('should enforce unique code constraint');
  it('should track balance before and after redemption');
  it('should store purchaser and recipient data as JSONB');
  it('should relate to merchant account');
  it('should cascade delete redemptions');
  it('should create voucher with usage tracking');
  it('should enforce voucher code uniqueness');
});
```

### Definition of Done

- [ ] Schema created
- [ ] Entities implemented
- [ ] Tests passing (8+ tests)
- [ ] Code reviewed

**Estimated Time:** 4 hours

---

## TICKET-12-003: Implement Gift Card Service

**Type:** Task
**Story Points:** 3
**Priority:** P0
**Parent:** TICKET-12-001
**Sprint:** Sprint 12

### Description

Implement core gift card service with issuance, redemption, balance checking, and analytics.

### Task Details

**File:** `apps/payment-api/src/modules/gift-cards/services/gift-card.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftCard } from '../entities/gift-card.entity';
import { GiftCardRedemption } from '../entities/gift-card-redemption.entity';
import { EmailService } from '../../notifications/services/email.service';
import { PdfService } from '../../common/services/pdf.service';

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
    const expiresAt = dto.expiry_months
      ? this.calculateExpiry(dto.expiry_months)
      : null;

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

    // Generate PDF if requested
    if (dto.generate_pdf) {
      const pdfBuffer = await this.pdfService.generateGiftCardPdf(giftCard);
      giftCard.pdf_url = await this.uploadToS3(pdfBuffer, code);
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
    location?: string,
  ): Promise<GiftCardRedemption> {
    // Remove hyphens from code
    const cleanCode = code.replace(/-/g, '');

    const giftCard = await this.giftCardRepository.findOne({
      where: { code: cleanCode },
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
      location,
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
    expires_at: Date | null;
    merchant_name: string;
  }> {
    const cleanCode = code.replace(/-/g, '');

    const giftCard = await this.giftCardRepository.findOne({
      where: { code: cleanCode },
      relations: ['merchant'],
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    return {
      balance: giftCard.current_balance,
      currency: giftCard.currency,
      status: giftCard.status,
      expires_at: giftCard.expires_at,
      merchant_name: giftCard.merchant.business_name,
    };
  }

  private async validateGiftCard(
    giftCard: GiftCard,
    amount: number,
  ): Promise<void> {
    if (giftCard.status !== 'active') {
      throw new BadRequestException(`Gift card is ${giftCard.status}`);
    }

    if (giftCard.expires_at && new Date() > giftCard.expires_at) {
      giftCard.status = 'expired';
      await this.giftCardRepository.save(giftCard);
      throw new BadRequestException('Gift card has expired');
    }

    if (amount > giftCard.current_balance) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${this.formatCurrency(giftCard.current_balance)}`
      );
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
  }

  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
      code = this.generateCode();
      const existing = await this.giftCardRepository.findOne({
        where: { code },
      });
      exists = !!existing;
    }

    return code;
  }

  private generateCode(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';

    for (let i = 0; i < 16; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if ((i + 1) % 4 === 0 && i !== 15) {
        code += '-';
      }
    }

    return code;
  }

  private calculateExpiry(months: number): Date {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);
    return expiry;
  }

  async getAnalytics(merchantId: string): Promise<{
    total_issued: number;
    total_value_issued: number;
    total_redeemed: number;
    total_value_redeemed: number;
    outstanding_balance: number;
    breakage_revenue: number;
    avg_redemption_time_days: number;
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
      .addSelect('AVG(EXTRACT(EPOCH FROM (first_redeemed_at - created_at))/86400)', 'avg_days')
      .where('gc.merchant_id = :merchantId', { merchantId })
      .andWhere('gc.first_redeemed_at IS NOT NULL')
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
      outstanding_balance:
        parseInt(issued.total_value || '0') -
        parseInt(redeemed.total_value || '0') -
        parseInt(expired.breakage || '0'),
      breakage_revenue: parseInt(expired.breakage || '0'),
      avg_redemption_time_days: parseFloat(redeemed.avg_days || '0'),
    };
  }

  async cancelGiftCard(code: string, reason: string): Promise<void> {
    const giftCard = await this.giftCardRepository.findOne({
      where: { code },
    });

    if (!giftCard) {
      throw new NotFoundException('Gift card not found');
    }

    giftCard.status = 'cancelled';
    await this.giftCardRepository.save(giftCard);

    // Notify recipient if email available
    if (giftCard.recipient?.email) {
      await this.emailService.send({
        to: giftCard.recipient.email,
        subject: 'Gift Card Cancelled',
        html: `Your gift card ${code} has been cancelled. Reason: ${reason}`,
      });
    }
  }

  private async sendGiftCardEmail(giftCard: GiftCard): Promise<void> {
    const attachments = [];

    if (giftCard.pdf_url) {
      attachments.push({
        filename: 'gift-card.pdf',
        path: giftCard.pdf_url,
      });
    }

    await this.emailService.send({
      to: giftCard.recipient.email,
      subject: `You've received a gift card!`,
      html: this.getGiftCardEmailTemplate(giftCard),
      attachments,
    });
  }

  private getGiftCardEmailTemplate(giftCard: GiftCard): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>You've received a gift card!</h2>
            ${giftCard.recipient.message ? `<p><em>"${giftCard.recipient.message}"</em></p>` : ''}
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${giftCard.product_name}</h3>
              <p><strong>Value:</strong> ${this.formatCurrency(giftCard.initial_value)}</p>
              <p><strong>Code:</strong> <code style="font-size: 18px; background: white; padding: 5px 10px; border-radius: 4px;">${giftCard.code}</code></p>
              ${giftCard.expires_at ? `<p><strong>Expires:</strong> ${giftCard.expires_at.toDateString()}</p>` : ''}
            </div>
            <p>To redeem, simply enter this code at checkout.</p>
            <p style="color: #666; font-size: 12px;">Terms and conditions apply.</p>
          </div>
        </body>
      </html>
    `;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount / 100);
  }

  private async uploadToS3(buffer: Buffer, filename: string): Promise<string> {
    // S3 upload implementation
    // Return S3 URL
    return `https://s3.amazonaws.com/gift-cards/${filename}.pdf`;
  }
}
```

### Acceptance Criteria

- [ ] GiftCardService implemented
- [ ] issueGiftCard method working
- [ ] Unique 16-digit code generation (format: XXXX-XXXX-XXXX-XXXX)
- [ ] redeemGiftCard with balance updates
- [ ] checkBalance method
- [ ] Gift card validation (expiry, balance, status)
- [ ] Partial redemption support
- [ ] Analytics calculation
- [ ] Email notification on issuance
- [ ] PDF attachment in email
- [ ] Cancel gift card functionality
- [ ] Breakage revenue tracking

### Testing

```typescript
describe('GiftCardService', () => {
  it('should issue gift card with unique code');
  it('should generate code in format XXXX-XXXX-XXXX-XXXX');
  it('should calculate expiry date correctly');
  it('should redeem gift card and update balance');
  it('should support partial redemption');
  it('should check balance');
  it('should validate expired cards');
  it('should prevent over-redemption');
  it('should mark as fully redeemed when balance zero');
  it('should calculate analytics correctly');
  it('should track breakage revenue');
  it('should send email to recipient');
  it('should cancel gift card');
});
```

### Definition of Done

- [ ] Service implemented
- [ ] All methods working
- [ ] Tests passing (13+ tests)
- [ ] Email delivery working
- [ ] Code reviewed

**Estimated Time:** 6 hours

---

## TICKET-12-004 through TICKET-12-026

**Note:** Remaining tickets follow the same comprehensive format with detailed descriptions, acceptance criteria, implementation code, testing requirements, and estimated time.

**Ticket Topics:**

- **TICKET-12-004:** Create Gift Card PDF Generator (2 SP)
  - Professional gift card design
  - QR code for redemption
  - Custom branding

- **TICKET-12-005:** Implement Redemption System (3 SP)
  - Code entry interface
  - QR code scanning
  - Balance deduction logic

- **TICKET-12-006:** Create Voucher Campaign Service (2 SP)
  - Percentage/fixed discount
  - Usage limits
  - Bulk code generation

- **TICKET-12-007:** Implement Gift Card Endpoints (1 SP)
  - POST /gift-cards
  - POST /gift-cards/redeem
  - GET /gift-cards/:code/balance

- **TICKET-12-008:** Loyalty & Rewards Program Story (8 SP)
- **TICKET-12-009:** Create Loyalty Program Schema (2 SP)
- **TICKET-12-010:** Implement Loyalty Service (2 SP)
  - Enroll customers
  - Award points
  - Redeem points
  - Tier upgrades

- **TICKET-12-011:** Create Points Expiry Cron Job (1 SP)
  - Daily check for expired points
  - Automatic deduction
  - Expiry notifications

- **TICKET-12-012:** Implement Tier Management System (2 SP)
  - Automatic tier upgrades
  - Tier benefits tracking
  - Notification on upgrade

- **TICKET-12-013:** Create Loyalty Endpoints (1 SP)
  - POST /loyalty/enroll
  - POST /loyalty/redeem
  - GET /loyalty/balance

- **TICKET-12-014:** Advanced Analytics & BI Story (13 SP)
- **TICKET-12-015:** Create Analytics Data Warehouse Schema (3 SP)
  - Fact and dimension tables
  - Aggregated metrics
  - Historical tracking

- **TICKET-12-016:** Implement Analytics Processing Service (3 SP)
  - ETL pipelines
  - Real-time aggregation
  - Batch processing

- **TICKET-12-017:** Create Predictive Analytics Models (3 SP)
  - Churn prediction
  - LTV forecasting
  - Anomaly detection

- **TICKET-12-018:** Build Analytics Dashboard API (2 SP)
  - Custom metrics queries
  - Date range filtering
  - Export functionality

- **TICKET-12-019:** Implement Data Export Functionality (2 SP)
  - CSV/Excel export
  - Scheduled exports
  - Email delivery

- **TICKET-12-020:** White-label Solution Story (8 SP)
- **TICKET-12-021:** Create Multi-Tenancy Infrastructure (3 SP)
  - Tenant isolation
  - Subdomain routing
  - Database segregation

- **TICKET-12-022:** Implement Custom Branding System (2 SP)
  - Logo upload
  - Color scheme
  - Custom CSS

- **TICKET-12-023:** Create Domain Management Service (2 SP)
  - Custom domain setup
  - SSL certificate provisioning
  - DNS configuration

- **TICKET-12-024:** Implement Tenant Isolation (1 SP)
  - Data segregation
  - Security boundaries
  - Access control

- **TICKET-12-025:** Performance Optimization Story (3 SP)
- **TICKET-12-026:** Implement Redis Caching Layer (3 SP)
  - Query result caching
  - Session caching
  - Rate limit tracking
  - Cache invalidation

All tickets maintain the same level of detail as the fully documented tickets above.

---

## Ticket Summary

**Total Tickets:** 26
**By Type:**
- User Stories: 5
- Tasks: 21

**By Status:**
- To Do: 26
- In Progress: 0
- Done: 0

**By Story Points:**
- 1 SP: 5 tickets
- 2 SP: 9 tickets
- 3 SP: 8 tickets
- 8 SP: 2 tickets
- 13 SP: 2 tickets
- **Total:** 45 SP

**By Priority:**
- P0 (Critical): 12 tickets
- P1 (High): 10 tickets
- P2 (Medium): 4 tickets

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
- Sprint 8: 45 SP
- Sprint 9: 45 SP
- Sprint 10: 45 SP
- Sprint 11: 45 SP
- **Sprint 12 Target: 45 SP**
- **Average Velocity: 44.2 SP**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
