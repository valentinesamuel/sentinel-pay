# Sprint 13 Backlog - Bill Payments & Utilities

**Sprint:** Sprint 13
**Duration:** 2 weeks (Week 27-28)
**Sprint Goal:** Implement comprehensive bill payment system for airtime, data bundles, utilities (electricity, water), and cable TV subscriptions with provider integration and commission tracking
**Story Points Committed:** 35
**Team Capacity:** 35 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1-12 (45, 42, 38, 45, 48, 45, 42, 45, 45, 45, 45, 45) = 44.2 SP, committed 35 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 13, we will have:
1. Airtime purchase system for all Nigerian networks (MTN, Glo, Airtel, 9mobile)
2. Data bundle purchase functionality
3. Electricity bill payment system (IBEDC, EKEDC, AEDC, etc.)
4. Cable TV subscription payments (DSTV, GOtv, Startimes)
5. Water bill payment functionality
6. Bill inquiry and validation system
7. Mock provider service integration
8. Commission and margin tracking
9. Bill payment history and receipts
10. Transaction reconciliation for bill payments

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Bill payment processing tests passing
- [ ] Provider integration tests passing
- [ ] Commission calculation tests passing
- [ ] API documentation updated (Swagger)
- [ ] Transaction reconciliation working
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-8: Bill Payments

## FEATURE-8.1: Airtime & Data Purchase

### 📘 User Story: US-13.1.1 - Airtime & Data Purchase

**Story ID:** US-13.1.1
**Feature:** FEATURE-8.1 (Airtime & Data Purchase)
**Epic:** EPIC-8 (Bill Payments)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 13
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to purchase airtime and data bundles for any Nigerian network
So that I can top up my phone or gift airtime to others conveniently
```

---

#### Business Value

**Value Statement:**
Airtime and data purchases are the highest volume bill payment transactions in fintech platforms, accounting for 60-70% of bill payment revenue. Low friction, instant delivery, and competitive pricing drive user adoption and engagement.

**Impact:**
- **Critical:** Primary revenue driver for bill payments
- **Volume:** 100+ transactions per user per month
- **Retention:** Daily use case increases app engagement
- **Revenue:** 2-5% commission per transaction
- **Network Effect:** Users refer others for airtime gifting

**Success Criteria:**
- 90% of active users purchase airtime monthly
- Average transaction value: NGN 500-2,000
- Success rate > 98%
- Transaction completion < 10 seconds
- 30% of users purchase data bundles weekly

---

#### Acceptance Criteria

**Airtime Purchase:**
- [ ] **AC1:** Support all Nigerian networks (MTN, Glo, Airtel, 9mobile)
- [ ] **AC2:** Purchase for self or other numbers
- [ ] **AC3:** Amount range: NGN 50 - NGN 50,000
- [ ] **AC4:** Validate phone number format (11 digits, starting with 0)
- [ ] **AC5:** Auto-detect network from phone number
- [ ] **AC6:** Deduct amount from user wallet
- [ ] **AC7:** Instant airtime delivery (< 10 seconds)
- [ ] **AC8:** Transaction confirmation SMS/email
- [ ] **AC9:** Save beneficiary for repeat purchases
- [ ] **AC10:** Transaction receipt generation

**Data Bundle Purchase:**
- [ ] **AC11:** Display available data plans per network
- [ ] **AC12:** MTN data plans (500MB, 1GB, 2GB, 5GB, 10GB, 20GB)
- [ ] **AC13:** Glo data plans (1GB, 2.5GB, 5GB, 10GB)
- [ ] **AC14:** Airtel data plans (750MB, 1.5GB, 3GB, 6GB, 11GB)
- [ ] **AC15:** 9mobile data plans (1GB, 2GB, 4.5GB, 11GB)
- [ ] **AC16:** Show plan validity period (daily, weekly, monthly)
- [ ] **AC17:** Instant data bundle activation
- [ ] **AC18:** Confirmation notification

**Payment Processing:**
- [ ] **AC19:** Pay from wallet balance
- [ ] **AC20:** Validate sufficient balance
- [ ] **AC21:** Create ledger entries
- [ ] **AC22:** Handle payment failures gracefully
- [ ] **AC23:** Automatic retry on provider timeout
- [ ] **AC24:** Refund on failed delivery

**Commission & Pricing:**
- [ ] **AC25:** Configure commission per network
- [ ] **AC26:** Apply dynamic pricing
- [ ] **AC27:** Track commission earned
- [ ] **AC28:** Merchant commission sharing

**Transaction Management:**
- [ ] **AC29:** Transaction history with filters
- [ ] **AC30:** Receipt download (PDF)
- [ ] **AC31:** Recharge same number easily
- [ ] **AC32:** Transaction status tracking
- [ ] **AC33:** Customer support reference

---

#### Technical Specifications

**Airtime Transaction Schema:**

```typescript
@Entity('airtime_transactions')
export class AirtimeTransaction extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 15 })
  phone_number: string; // 08012345678

  @Column({
    type: 'enum',
    enum: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'],
  })
  network: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  transaction_reference: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider_reference: string; // From VTU provider

  @Column({ type: 'bigint' })
  commission: number; // Platform commission

  @Column({ type: 'bigint' })
  cost_price: number; // What we pay provider

  @Column({ type: 'varchar', length: 255, nullable: true })
  beneficiary_name: string;

  @Column({ type: 'boolean', default: false })
  is_saved_beneficiary: boolean;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'integer', default: 0 })
  retry_count: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@Entity('data_transactions')
export class DataTransaction extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 15 })
  phone_number: string;

  @Column({
    type: 'enum',
    enum: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'],
  })
  network: string;

  @Column('uuid')
  data_plan_id: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  transaction_reference: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider_reference: string;

  @Column({ type: 'bigint' })
  commission: number;

  @Column({ type: 'bigint' })
  cost_price: number;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DataPlan)
  @JoinColumn({ name: 'data_plan_id' })
  data_plan: DataPlan;
}

@Entity('data_plans')
export class DataPlan extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'],
  })
  network: string;

  @Column({ type: 'varchar', length: 100 })
  plan_name: string; // e.g., "1GB Monthly"

  @Column({ type: 'varchar', length: 50 })
  plan_code: string; // Provider plan code

  @Column({ type: 'bigint' })
  data_amount_mb: number; // Data in MB

  @Column({ type: 'bigint' })
  price: number;

  @Column({ type: 'integer' })
  validity_days: number; // 1, 7, 30, etc.

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly', 'custom'],
  })
  validity_type: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'integer', default: 0 })
  sort_order: number; // For display ordering
}

@Entity('beneficiaries')
export class Beneficiary extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({
    type: 'enum',
    enum: ['airtime', 'data', 'electricity', 'cable_tv', 'water'],
  })
  service_type: string;

  @Column({ type: 'varchar', length: 100 })
  nickname: string; // "Mom's Phone", "Office Line"

  @Column({ type: 'varchar', length: 50 })
  account_number: string; // Phone number, meter number, etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider: string; // MTN, DSTV, IBEDC, etc.

  @Column({ type: 'integer', default: 0 })
  usage_count: number; // Times used

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_used_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

**Airtime Service:**

```typescript
@Injectable()
export class AirtimeService {
  constructor(
    @InjectRepository(AirtimeTransaction)
    private airtimeRepository: Repository<AirtimeTransaction>,
    @InjectRepository(Beneficiary)
    private beneficiaryRepository: Repository<Beneficiary>,
    private walletService: WalletService,
    private ledgerService: LedgerService,
    private vtuProviderService: VtuProviderService,
    private notificationService: NotificationService,
  ) {}

  async purchaseAirtime(
    userId: string,
    dto: PurchaseAirtimeDto,
  ): Promise<AirtimeTransaction> {
    // Validate phone number
    this.validatePhoneNumber(dto.phone_number);

    // Detect network
    const network = this.detectNetwork(dto.phone_number);

    // Validate amount
    if (dto.amount < 50_00 || dto.amount > 50000_00) {
      throw new BadRequestException('Amount must be between NGN 50 and NGN 50,000');
    }

    // Get pricing
    const pricing = await this.getPricing(network, dto.amount);

    // Check wallet balance
    const wallet = await this.walletService.getWallet(userId, 'NGN');
    if (wallet.available_balance < pricing.total_amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Create transaction
    const transaction = this.airtimeRepository.create({
      user_id: userId,
      phone_number: dto.phone_number,
      network,
      amount: dto.amount,
      currency: 'NGN',
      transaction_reference: await this.generateReference(),
      status: 'pending',
      commission: pricing.commission,
      cost_price: pricing.cost_price,
      beneficiary_name: dto.beneficiary_name,
      is_saved_beneficiary: dto.save_beneficiary,
    });

    await this.airtimeRepository.save(transaction);

    try {
      // Debit wallet
      await this.walletService.debit({
        user_id: userId,
        amount: pricing.total_amount,
        currency: 'NGN',
        description: `Airtime purchase for ${dto.phone_number}`,
        reference: transaction.transaction_reference,
      });

      // Update transaction status
      transaction.status = 'processing';
      await this.airtimeRepository.save(transaction);

      // Call VTU provider
      const providerResult = await this.vtuProviderService.purchaseAirtime({
        network,
        phone_number: dto.phone_number,
        amount: dto.amount,
        reference: transaction.transaction_reference,
      });

      if (providerResult.status === 'success') {
        transaction.status = 'success';
        transaction.provider_reference = providerResult.provider_reference;
        transaction.completed_at = new Date();
        await this.airtimeRepository.save(transaction);

        // Create ledger entries
        await this.createLedgerEntries(transaction);

        // Send notification
        await this.notificationService.send({
          user_id: userId,
          type: 'airtime_purchase_success',
          title: 'Airtime Purchase Successful',
          message: `NGN ${this.formatAmount(dto.amount)} airtime sent to ${dto.phone_number}`,
          channels: ['push', 'email'],
        });

        // Save beneficiary if requested
        if (dto.save_beneficiary && dto.beneficiary_name) {
          await this.saveBeneficiary(userId, dto);
        }
      } else {
        // Handle failure
        transaction.status = 'failed';
        transaction.failure_reason = providerResult.error_message;
        await this.airtimeRepository.save(transaction);

        // Refund wallet
        await this.walletService.credit({
          user_id: userId,
          amount: pricing.total_amount,
          currency: 'NGN',
          description: `Refund for failed airtime purchase ${transaction.transaction_reference}`,
          reference: `REFUND-${transaction.transaction_reference}`,
        });

        throw new BadRequestException(providerResult.error_message);
      }
    } catch (error) {
      // Handle errors
      transaction.status = 'failed';
      transaction.failure_reason = error.message;
      transaction.retry_count += 1;
      await this.airtimeRepository.save(transaction);

      throw error;
    }

    return transaction;
  }

  private validatePhoneNumber(phoneNumber: string): void {
    const phoneRegex = /^0[7-9][0-1]\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new BadRequestException('Invalid Nigerian phone number format');
    }
  }

  private detectNetwork(phoneNumber: string): string {
    const prefix = phoneNumber.substring(0, 4);

    const mtnPrefixes = ['0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913'];
    const gloPrefixes = ['0805', '0807', '0811', '0815', '0905', '0915'];
    const airtelPrefixes = ['0802', '0808', '0812', '0901', '0902', '0904', '0907', '0912'];
    const nineMobilePrefixes = ['0809', '0817', '0818', '0909', '0908'];

    if (mtnPrefixes.includes(prefix)) return 'MTN';
    if (gloPrefixes.includes(prefix)) return 'GLO';
    if (airtelPrefixes.includes(prefix)) return 'AIRTEL';
    if (nineMobilePrefixes.includes(prefix)) return '9MOBILE';

    throw new BadRequestException('Unable to detect network');
  }

  private async getPricing(
    network: string,
    amount: number,
  ): Promise<{
    total_amount: number;
    commission: number;
    cost_price: number;
  }> {
    // Get commission rate from config (2-5%)
    const commissionRate = 0.03; // 3%
    const commission = Math.floor(amount * commissionRate);
    const cost_price = amount - commission;

    return {
      total_amount: amount,
      commission,
      cost_price,
    };
  }

  private async createLedgerEntries(
    transaction: AirtimeTransaction,
  ): Promise<void> {
    // Debit: User wallet
    await this.ledgerService.createEntry({
      account_id: transaction.user_id,
      account_type: 'wallet',
      entry_type: 'debit',
      amount: transaction.amount,
      currency: 'NGN',
      description: `Airtime purchase - ${transaction.phone_number}`,
      reference: transaction.transaction_reference,
    });

    // Credit: Revenue account (commission)
    await this.ledgerService.createEntry({
      account_id: 'SYSTEM_REVENUE',
      account_type: 'revenue',
      entry_type: 'credit',
      amount: transaction.commission,
      currency: 'NGN',
      description: `Airtime commission - ${transaction.transaction_reference}`,
      reference: transaction.transaction_reference,
    });

    // Credit: Provider payable account
    await this.ledgerService.createEntry({
      account_id: 'VTU_PROVIDER',
      account_type: 'payable',
      entry_type: 'credit',
      amount: transaction.cost_price,
      currency: 'NGN',
      description: `VTU provider payment - ${transaction.transaction_reference}`,
      reference: transaction.transaction_reference,
    });
  }

  private async saveBeneficiary(
    userId: string,
    dto: PurchaseAirtimeDto,
  ): Promise<void> {
    const existing = await this.beneficiaryRepository.findOne({
      where: {
        user_id: userId,
        service_type: 'airtime',
        account_number: dto.phone_number,
      },
    });

    if (!existing) {
      await this.beneficiaryRepository.save({
        user_id: userId,
        service_type: 'airtime',
        nickname: dto.beneficiary_name,
        account_number: dto.phone_number,
        provider: this.detectNetwork(dto.phone_number),
        usage_count: 1,
        last_used_at: new Date(),
      });
    } else {
      existing.usage_count += 1;
      existing.last_used_at = new Date();
      await this.beneficiaryRepository.save(existing);
    }
  }

  async getBeneficiaries(userId: string): Promise<Beneficiary[]> {
    return this.beneficiaryRepository.find({
      where: { user_id: userId, service_type: 'airtime' },
      order: { last_used_at: 'DESC' },
    });
  }

  async getTransactionHistory(
    userId: string,
    filters?: {
      start_date?: Date;
      end_date?: Date;
      status?: string;
      network?: string;
    },
  ): Promise<AirtimeTransaction[]> {
    const query = this.airtimeRepository
      .createQueryBuilder('txn')
      .where('txn.user_id = :userId', { userId });

    if (filters?.start_date) {
      query.andWhere('txn.created_at >= :start_date', {
        start_date: filters.start_date,
      });
    }

    if (filters?.end_date) {
      query.andWhere('txn.created_at <= :end_date', {
        end_date: filters.end_date,
      });
    }

    if (filters?.status) {
      query.andWhere('txn.status = :status', { status: filters.status });
    }

    if (filters?.network) {
      query.andWhere('txn.network = :network', { network: filters.network });
    }

    return query.orderBy('txn.created_at', 'DESC').getMany();
  }

  private async generateReference(): Promise<string> {
    return `AIRTIME-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private formatAmount(amount: number): string {
    return (amount / 100).toFixed(2);
  }
}
```

**API Endpoints:**

```typescript
// Purchase Airtime
POST /api/v1/bills/airtime
Authorization: Bearer {token}
Body:
{
  "phone_number": "08012345678",
  "amount": 100000, // NGN 1,000 in kobo
  "beneficiary_name": "Mom's Phone",
  "save_beneficiary": true
}

Response (201):
{
  "status": "success",
  "message": "Airtime purchase successful",
  "data": {
    "transaction_reference": "AIRTIME-1704600000000-XYZ123",
    "phone_number": "08012345678",
    "network": "MTN",
    "amount": 100000,
    "status": "success",
    "completed_at": "2024-01-07T10:30:00Z"
  }
}

// Get Data Plans
GET /api/v1/bills/data/plans?network=MTN
Authorization: Bearer {token}

Response (200):
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "network": "MTN",
      "plan_name": "1GB Monthly",
      "data_amount_mb": 1024,
      "price": 50000,
      "validity_days": 30,
      "validity_type": "monthly"
    },
    {
      "id": "uuid",
      "network": "MTN",
      "plan_name": "2GB Monthly",
      "data_amount_mb": 2048,
      "price": 100000,
      "validity_days": 30,
      "validity_type": "monthly"
    }
  ]
}

// Purchase Data Bundle
POST /api/v1/bills/data
Authorization: Bearer {token}
Body:
{
  "phone_number": "08012345678",
  "data_plan_id": "uuid",
  "beneficiary_name": "My Phone",
  "save_beneficiary": true
}

Response (201):
{
  "status": "success",
  "message": "Data bundle purchase successful",
  "data": {
    "transaction_reference": "DATA-1704600000000-ABC456",
    "phone_number": "08012345678",
    "network": "MTN",
    "plan_name": "1GB Monthly",
    "amount": 50000,
    "status": "success",
    "completed_at": "2024-01-07T10:35:00Z"
  }
}

// Get Beneficiaries
GET /api/v1/bills/beneficiaries?service_type=airtime
Authorization: Bearer {token}

Response (200):
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "service_type": "airtime",
      "nickname": "Mom's Phone",
      "account_number": "08012345678",
      "provider": "MTN",
      "usage_count": 15,
      "last_used_at": "2024-01-07T10:30:00Z"
    }
  ]
}

// Get Transaction History
GET /api/v1/bills/airtime/history?start_date=2024-01-01&end_date=2024-01-31&status=success
Authorization: Bearer {token}

Response (200):
{
  "status": "success",
  "data": [
    {
      "transaction_reference": "AIRTIME-1704600000000-XYZ123",
      "phone_number": "08012345678",
      "network": "MTN",
      "amount": 100000,
      "status": "success",
      "created_at": "2024-01-07T10:30:00Z",
      "completed_at": "2024-01-07T10:30:05Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "per_page": 20
  }
}
```

---

## FEATURE-8.2: Utility Bill Payments

### 📘 User Story: US-13.2.1 - Electricity Bill Payment

**Story ID:** US-13.2.1
**Feature:** FEATURE-8.2 (Utility Bill Payments)
**Epic:** EPIC-8 (Bill Payments)

**Story Points:** 10
**Priority:** P1 (High)
**Sprint:** Sprint 13
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to pay electricity bills for any Nigerian distribution company
So that I can conveniently purchase power tokens without visiting the office
```

---

#### Business Value

**Value Statement:**
Electricity bill payment is a critical utility service with high transaction values (average NGN 5,000-20,000) and monthly recurrence. It drives user retention and provides steady revenue through commissions.

**Impact:**
- **High:** Essential monthly expense for all users
- **Value:** Higher average transaction value than airtime
- **Frequency:** Monthly recurring revenue
- **Commission:** 1-2% commission rate
- **Retention:** Sticky use case

**Success Criteria:**
- 60% of users pay electricity bills through platform
- Average transaction value: NGN 10,000
- Success rate > 95%
- Token delivery < 30 seconds
- 40% of users set up auto-payment

---

#### Acceptance Criteria

**Provider Support:**
- [ ] **AC1:** Support all Nigerian DISCOs (IBEDC, EKEDC, AEDC, PHED, etc.)
- [ ] **AC2:** Prepaid meter token purchase
- [ ] **AC3:** Postpaid bill payment
- [ ] **AC4:** Meter number validation
- [ ] **AC5:** Customer name verification

**Meter Validation:**
- [ ] **AC6:** Validate meter number format
- [ ] **AC7:** Verify meter exists
- [ ] **AC8:** Display customer name and address
- [ ] **AC9:** Show outstanding balance (postpaid)
- [ ] **AC10:** Confirm meter type (prepaid/postpaid)

**Payment Processing:**
- [ ] **AC11:** Purchase amount: NGN 500 - NGN 500,000
- [ ] **AC12:** Deduct from wallet
- [ ] **AC13:** Generate token (prepaid)
- [ ] **AC14:** Instant token delivery via SMS/email
- [ ] **AC15:** Receipt with token and instructions
- [ ] **AC16:** Save meter as beneficiary

**Transaction Management:**
- [ ] **AC17:** Transaction history
- [ ] **AC18:** Token retrieval (resend)
- [ ] **AC19:** Payment receipts
- [ ] **AC20:** Failed payment refunds

---

#### Technical Specifications

**Electricity Transaction Schema:**

```typescript
@Entity('electricity_transactions')
export class ElectricityTransaction extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  disco: string; // IBEDC, EKEDC, etc.

  @Column({ type: 'varchar', length: 50 })
  meter_number: string;

  @Column({
    type: 'enum',
    enum: ['prepaid', 'postpaid'],
  })
  meter_type: string;

  @Column({ type: 'varchar', length: 200 })
  customer_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customer_address: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  transaction_reference: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider_reference: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  token: string; // For prepaid meters

  @Column({ type: 'bigint', nullable: true })
  units: number; // kWh units purchased

  @Column({ type: 'bigint' })
  commission: number;

  @Column({ type: 'bigint' })
  cost_price: number;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'jsonb', nullable: true })
  charges_breakdown: {
    energy_charge: number;
    vat: number;
    service_charge: number;
    debt_recovery?: number;
  };

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@Entity('disco_providers')
export class DiscoProvider extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // IBEDC, EKEDC

  @Column({ type: 'varchar', length: 200 })
  name: string; // Ibadan Electricity Distribution Company

  @Column({ type: 'varchar', length: 10 })
  short_name: string; // IBEDC

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  commission_rate: number; // 1.5%

  @Column({ type: 'jsonb', nullable: true })
  service_charge: {
    min_amount: number;
    max_amount: number;
    percentage: number;
    fixed_amount: number;
  };
}
```

---

### 📘 User Story: US-13.3.1 - Cable TV Subscription

**Story ID:** US-13.3.1
**Feature:** FEATURE-8.3 (Cable TV Payments)
**Epic:** EPIC-8 (Bill Payments)

**Story Points:** 8
**Priority:** P1 (High)
**Sprint:** Sprint 13
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to pay for cable TV subscriptions (DSTV, GOtv, Startimes)
So that I can renew my subscription without visiting payment centers
```

---

#### Acceptance Criteria

**Provider Support:**
- [ ] **AC1:** Support DSTV, GOtv, Startimes
- [ ] **AC2:** Validate smartcard/IUC number
- [ ] **AC3:** Display customer name
- [ ] **AC4:** Show current subscription status
- [ ] **AC5:** List available bouquets/packages

**Payment Processing:**
- [ ] **AC6:** Purchase subscription
- [ ] **AC7:** Addon services (PVR, extra view)
- [ ] **AC8:** Multi-month payment
- [ ] **AC9:** Instant activation
- [ ] **AC10:** Payment confirmation

---

#### Technical Specifications

**Cable TV Transaction Schema:**

```typescript
@Entity('cable_tv_transactions')
export class CableTvTransaction extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({
    type: 'enum',
    enum: ['DSTV', 'GOTV', 'STARTIMES'],
  })
  provider: string;

  @Column({ type: 'varchar', length: 50 })
  smartcard_number: string;

  @Column({ type: 'varchar', length: 200 })
  customer_name: string;

  @Column('uuid')
  bouquet_id: string;

  @Column({ type: 'integer', default: 1 })
  months: number; // Multi-month payment

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  transaction_reference: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'success', 'failed', 'refunded'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider_reference: string;

  @Column({ type: 'bigint' })
  commission: number;

  @Column({ type: 'bigint' })
  cost_price: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  subscription_expires_at: Date;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CableTvBouquet)
  @JoinColumn({ name: 'bouquet_id' })
  bouquet: CableTvBouquet;
}

@Entity('cable_tv_bouquets')
export class CableTvBouquet extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ['DSTV', 'GOTV', 'STARTIMES'],
  })
  provider: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // DSTV Premium, GOtv Max, Startimes Nova

  @Column({ type: 'varchar', length: 50 })
  code: string; // Provider bouquet code

  @Column({ type: 'bigint' })
  price: number;

  @Column({ type: 'integer', default: 30 })
  validity_days: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'integer', default: 0 })
  sort_order: number;
}
```

---

### 📘 User Story: US-13.4.1 - Water Bill Payment

**Story ID:** US-13.4.1
**Feature:** FEATURE-8.4 (Water Bill Payments)
**Epic:** EPIC-8 (Bill Payments)

**Story Points:** 4
**Priority:** P2 (Medium)
**Sprint:** Sprint 13
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to pay water bills for my account
So that I can conveniently pay without visiting the water board office
```

---

#### Acceptance Criteria

**Provider Support:**
- [ ] **AC1:** Support major water boards (Lagos, Abuja, etc.)
- [ ] **AC2:** Validate account number
- [ ] **AC3:** Display customer details
- [ ] **AC4:** Show outstanding balance

**Payment Processing:**
- [ ] **AC5:** Pay full or partial amount
- [ ] **AC6:** Instant payment confirmation
- [ ] **AC7:** Receipt generation
- [ ] **AC8:** Transaction history

---

## Summary of Sprint 13 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-13.1.1 | Airtime & Data Purchase | 13 | P0 | To Do |
| US-13.2.1 | Electricity Bill Payment | 10 | P1 | To Do |
| US-13.3.1 | Cable TV Subscription | 8 | P1 | To Do |
| US-13.4.1 | Water Bill Payment | 4 | P2 | To Do |
| **Total** | | **35** | | |

---

## Sprint Velocity Tracking

**Planned Story Points:** 35 SP
**Completed Story Points:** 0 SP (Sprint not started)
**Sprint Progress:** 0%

---

## Dependencies

**External:**
- VTU provider API (mock service)
- DISCO APIs (mock service)
- Cable TV provider APIs (mock service)
- SMS gateway for token delivery

**Internal:**
- Sprint 4: Wallet system
- Sprint 5: Ledger system
- Sprint 6: Mock provider service
- Sprint 14: Notification service

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-13.1 | Provider API downtime | High | High | Retry mechanism, queue system |
| RISK-13.2 | Token delivery failure | Medium | High | Token resend functionality |
| RISK-13.3 | Meter validation delays | Medium | Medium | Cache validation results |
| RISK-13.4 | Failed payment refunds | Low | High | Automatic refund system |
| RISK-13.5 | Commission calculation errors | Low | Medium | Automated testing, audit logs |

---

## Notes & Decisions

**Technical Decisions:**
1. **Network Detection:** Auto-detect from phone number prefix
2. **Token Delivery:** SMS + Email + In-app notification
3. **Retry Logic:** 3 automatic retries with exponential backoff
4. **Beneficiary Management:** Auto-save on successful transaction
5. **Commission:** Configurable per provider/service type
6. **Refunds:** Automatic refund on failed delivery within 5 minutes

**Open Questions:**
1. ❓ Support international airtime? **Decision: Phase 2**
2. ❓ Bulk airtime purchase for merchants? **Decision: Sprint 14**
3. ❓ Auto-renewal for subscriptions? **Decision: Phase 2**
4. ❓ Bill payment reminders? **Decision: Notification service**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Enable comprehensive bill payment ecosystem for airtime, data, utilities, and entertainment services
