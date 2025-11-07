# Sprint 10 Backlog - Merchant Accounts, Subscriptions & Virtual Cards

**Sprint:** Sprint 10
**Duration:** 2 weeks (Week 21-22)
**Sprint Goal:** Implement merchant/business accounts with invoicing, recurring payment subscriptions, virtual cards, transaction controls, and compliance/AML features
**Story Points Committed:** 45
**Team Capacity:** 45 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of Sprint 1-9 (45, 42, 38, 45, 48, 45, 42, 45, 45) = 43.9 SP, committed 45 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 10, we will have:
1. Merchant/business account types with invoicing
2. Invoice generation and payment links
3. Recurring payment subscriptions with auto-charging
4. Subscription management (pause, cancel, upgrade)
5. Virtual debit cards for online payments
6. Card controls (spending limits, merchant blocking)
7. Transaction velocity controls and spending limits
8. AML (Anti-Money Laundering) screening integration
9. Suspicious activity monitoring and reporting
10. Compliance reporting for regulatory requirements

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Subscription billing tests passing
- [ ] Virtual card issuance tests passing
- [ ] AML screening tests passing
- [ ] API documentation updated (Swagger)
- [ ] Compliance documentation updated
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-17: Merchant & Business Accounts

## FEATURE-17.1: Merchant Accounts & Invoicing

### 📘 User Story: US-10.1.1 - Merchant Accounts & Invoice Management

**Story ID:** US-10.1.1
**Feature:** FEATURE-17.1 (Merchant Accounts & Invoicing)
**Epic:** EPIC-17 (Merchant & Business Accounts)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 10
**Status:** 🔄 Not Started

---

#### User Story

```
As a business owner
I want to create a merchant account and send invoices to customers
So that I can accept payments professionally and manage my business finances
```

---

#### Business Value

**Value Statement:**
Merchant accounts enable B2B and B2C commerce on the platform, significantly expanding the user base and transaction volume. Invoicing provides professional payment collection and improves cash flow for businesses.

**Impact:**
- **Critical:** Opens B2B market segment
- **Revenue:** Merchant fees (1.5-3% per transaction)
- **Growth:** Attracts business users and SMEs
- **Volume:** Higher average transaction values

**Success Criteria:**
- 20% of users create merchant accounts
- Average invoice value > NGN 100,000
- 90% invoice payment rate
- < 2 minutes invoice creation time
- Professional invoice templates

---

#### Acceptance Criteria

**Merchant Account:**
- [ ] **AC1:** User can upgrade to merchant/business account
- [ ] **AC2:** Merchant account requires business KYC (CAC registration, Tax ID)
- [ ] **AC3:** Business name, logo, address configuration
- [ ] **AC4:** Merchant receives unique payment link (e.g., pay.platform.com/merchant-name)
- [ ] **AC5:** Custom business profile page
- [ ] **AC6:** Transaction fees: 1.5% (capped at NGN 2,000)
- [ ] **AC7:** Settlement schedule: T+1 (next business day)
- [ ] **AC8:** Merchant dashboard with sales analytics
- [ ] **AC9:** Multiple team members/sub-accounts

**Invoice Management:**
- [ ] **AC10:** Create invoice with line items
- [ ] **AC11:** Invoice fields: customer details, due date, items, tax, discount
- [ ] **AC12:** Invoice statuses: draft, sent, paid, overdue, cancelled
- [ ] **AC13:** Automatic invoice numbering (INV-2024-0001)
- [ ] **AC14:** Invoice templates (professional design)
- [ ] **AC15:** PDF generation for invoices
- [ ] **AC16:** Email invoice to customer
- [ ] **AC17:** Payment link embedded in invoice
- [ ] **AC18:** Partial payments allowed
- [ ] **AC19:** Payment reminders (auto-send 3 days before due date)
- [ ] **AC20:** Overdue notifications

**Payment Collection:**
- [ ] **AC21:** Customer can pay via payment link (card, bank transfer)
- [ ] **AC22:** No customer account required to pay invoice
- [ ] **AC23:** Payment confirmation email to both parties
- [ ] **AC24:** Invoice marked as paid automatically
- [ ] **AC25:** Receipt generation after payment
- [ ] **AC26:** Refund capability for invoices

**Reporting:**
- [ ] **AC27:** Invoice list with filters (status, date, customer)
- [ ] **AC28:** Revenue reports by period
- [ ] **AC29:** Outstanding invoices report
- [ ] **AC30:** Customer payment history

---

#### Technical Specifications

**Merchant Account Schema:**

```typescript
@Entity('merchant_accounts')
export class MerchantAccount extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  business_name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  merchant_code: string; // URL slug

  @Column({ type: 'varchar', length: 20, nullable: true })
  cac_number: string; // Corporate Affairs Commission

  @Column({ type: 'varchar', length: 20, nullable: true })
  tax_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  business_logo_url: string;

  @Column({ type: 'text', nullable: true })
  business_description: string;

  @Column({ type: 'jsonb', nullable: true })
  business_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  support_email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  support_phone: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.015 })
  transaction_fee_rate: number; // 1.5%

  @Column({ type: 'bigint', default: 200000 })
  fee_cap: number; // NGN 2,000 in kobo

  @Column({
    type: 'enum',
    enum: ['pending_verification', 'active', 'suspended', 'closed'],
    default: 'pending_verification'
  })
  status: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  verified_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

**Invoice Schema:**

```typescript
@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ type: 'varchar', length: 30, unique: true })
  invoice_number: string; // INV-2024-0001

  @Column('uuid')
  merchant_id: string;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'jsonb' })
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };

  @Column({ type: 'jsonb' })
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;

  @Column({ type: 'bigint' })
  subtotal: number;

  @Column({ type: 'bigint', default: 0 })
  tax: number; // VAT or sales tax

  @Column({ type: 'bigint', default: 0 })
  discount: number;

  @Column({ type: 'bigint' })
  total: number;

  @Column({ type: 'bigint', default: 0 })
  amount_paid: number;

  @Column({ type: 'bigint', default: 0 })
  amount_due: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'],
    default: 'draft'
  })
  status: string;

  @Column({ type: 'date' })
  issue_date: Date;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_link: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  sent_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  paid_at: Date;

  @ManyToOne(() => MerchantAccount)
  @JoinColumn({ name: 'merchant_id' })
  merchant: MerchantAccount;

  @OneToMany(() => InvoicePayment, payment => payment.invoice)
  payments: InvoicePayment[];
}

@Entity('invoice_payments')
export class InvoicePayment extends BaseEntity {
  @Column('uuid')
  invoice_id: string;

  @Column({ type: 'varchar', length: 50 })
  transaction_reference: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 50 })
  payment_method: string; // card, bank_transfer

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  paid_at: Date;

  @ManyToOne(() => Invoice, invoice => invoice.payments)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;
}
```

**Invoice Service:**

```typescript
@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(MerchantAccount)
    private merchantRepository: Repository<MerchantAccount>,
    private emailService: EmailService,
    private pdfService: PdfService,
  ) {}

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: dto.merchant_id },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant account not found');
    }

    // Calculate totals
    const subtotal = dto.line_items.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal + (dto.tax || 0) - (dto.discount || 0);

    const invoice = this.invoiceRepository.create({
      invoice_number: await this.generateInvoiceNumber(merchant.id),
      merchant_id: dto.merchant_id,
      currency: dto.currency || 'NGN',
      customer: dto.customer,
      line_items: dto.line_items,
      subtotal,
      tax: dto.tax || 0,
      discount: dto.discount || 0,
      total,
      amount_due: total,
      amount_paid: 0,
      status: 'draft',
      issue_date: new Date(),
      due_date: dto.due_date,
      notes: dto.notes,
      terms: dto.terms,
    });

    await this.invoiceRepository.save(invoice);

    // Generate payment link
    invoice.payment_link = this.generatePaymentLink(invoice.invoice_number);
    await this.invoiceRepository.save(invoice);

    return invoice;
  }

  async sendInvoice(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['merchant'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Generate PDF
    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);

    // Send email
    await this.emailService.send({
      to: invoice.customer.email,
      subject: `Invoice ${invoice.invoice_number} from ${invoice.merchant.business_name}`,
      html: this.getInvoiceEmailTemplate(invoice),
      attachments: [
        {
          filename: `invoice-${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    invoice.status = 'sent';
    invoice.sent_at = new Date();
    await this.invoiceRepository.save(invoice);
  }

  async recordPayment(
    invoiceNumber: string,
    transactionReference: string,
    amount: number,
  ): Promise<void> {
    const invoice = await this.invoiceRepository.findOne({
      where: { invoice_number: invoiceNumber },
      relations: ['payments'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Create payment record
    const payment = new InvoicePayment();
    payment.invoice_id = invoice.id;
    payment.transaction_reference = transactionReference;
    payment.amount = amount;
    payment.payment_method = 'card'; // Or detect from transaction

    invoice.payments.push(payment);
    invoice.amount_paid += amount;
    invoice.amount_due = invoice.total - invoice.amount_paid;

    // Update status
    if (invoice.amount_due === 0) {
      invoice.status = 'paid';
      invoice.paid_at = new Date();
    } else if (invoice.amount_paid > 0) {
      invoice.status = 'partial';
    }

    await this.invoiceRepository.save(invoice);

    // Send confirmation emails
    await this.sendPaymentConfirmation(invoice);
  }

  private async generateInvoiceNumber(merchantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.invoiceRepository.count({
      where: {
        merchant_id: merchantId,
        created_at: MoreThanOrEqual(new Date(`${year}-01-01`)),
      },
    });

    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private generatePaymentLink(invoiceNumber: string): string {
    return `${process.env.PAYMENT_LINK_BASE_URL}/invoice/${invoiceNumber}/pay`;
  }

  private getInvoiceEmailTemplate(invoice: Invoice): string {
    return `
      <html>
        <body>
          <h2>Invoice from ${invoice.merchant.business_name}</h2>
          <p>Dear ${invoice.customer.name},</p>
          <p>Please find attached invoice ${invoice.invoice_number} for your review.</p>
          <p><strong>Amount Due:</strong> ${this.formatCurrency(invoice.total)}</p>
          <p><strong>Due Date:</strong> ${invoice.due_date.toDateString()}</p>
          <p>
            <a href="${invoice.payment_link}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Pay Invoice
            </a>
          </p>
          <p>Best regards,<br/>${invoice.merchant.business_name}</p>
        </body>
      </html>
    `;
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendPaymentReminders(): Promise<void> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const invoices = await this.invoiceRepository.find({
      where: {
        status: In(['sent', 'partial']),
        due_date: LessThanOrEqual(threeDaysFromNow),
      },
      relations: ['merchant'],
    });

    for (const invoice of invoices) {
      await this.sendPaymentReminder(invoice);
    }
  }
}
```

---

# EPIC-18: Recurring Payments & Subscriptions

## FEATURE-18.1: Subscription Management

### 📘 User Story: US-10.2.1 - Recurring Payments & Subscription Billing

**Story ID:** US-10.2.1
**Feature:** FEATURE-18.1 (Subscription Management)
**Epic:** EPIC-18 (Recurring Payments & Subscriptions)

**Story Points:** 13
**Priority:** P0 (Critical)
**Sprint:** Sprint 10
**Status:** 🔄 Not Started

---

#### User Story

```
As a merchant
I want to create subscription plans and automatically charge customers
So that I can have predictable recurring revenue
```

---

#### Business Value

**Value Statement:**
Subscriptions provide predictable recurring revenue for merchants and convenience for customers. Automated billing reduces manual work and improves cash flow predictability.

**Impact:**
- **Critical:** Enables SaaS and subscription businesses
- **Revenue:** Recurring transaction fees
- **Retention:** Higher customer lifetime value
- **Automation:** Reduces manual billing work

**Success Criteria:**
- Support daily, weekly, monthly, yearly billing cycles
- 95% successful auto-charge rate
- Dunning management for failed payments
- < 1% involuntary churn from payment failures
- Self-service subscription management for customers

---

#### Acceptance Criteria

**Subscription Plans:**
- [ ] **AC1:** Merchant can create subscription plans
- [ ] **AC2:** Plan attributes: name, amount, billing cycle, trial period
- [ ] **AC3:** Billing cycles: daily, weekly, monthly, quarterly, yearly
- [ ] **AC4:** Free trial period support (7, 14, 30 days)
- [ ] **AC5:** Setup fee option
- [ ] **AC6:** Plan tiers (Basic, Pro, Enterprise)
- [ ] **AC7:** Plan can be active/inactive
- [ ] **AC8:** Metered billing option (usage-based)

**Customer Subscriptions:**
- [ ] **AC9:** Customer can subscribe to a plan
- [ ] **AC10:** Payment method required for subscription
- [ ] **AC11:** Subscription statuses: trial, active, past_due, cancelled, expired
- [ ] **AC12:** Start date and next billing date tracking
- [ ] **AC13:** Auto-charge on billing date
- [ ] **AC14:** Prorated charges for mid-cycle upgrades
- [ ] **AC15:** Immediate cancellation or end-of-period cancellation

**Billing & Payments:**
- [ ] **AC16:** Automatic charge attempt on billing date
- [ ] **AC17:** Retry failed payments (3 attempts over 7 days)
- [ ] **AC18:** Dunning emails for failed payments
- [ ] **AC19:** Grace period before suspension (7 days)
- [ ] **AC20:** Receipt generation for each billing
- [ ] **AC21:** Refund capability for subscription payments

**Customer Management:**
- [ ] **AC22:** Customer can view subscription details
- [ ] **AC23:** Customer can update payment method
- [ ] **AC24:** Customer can upgrade/downgrade plan
- [ ] **AC25:** Customer can cancel subscription
- [ ] **AC26:** Billing history access
- [ ] **AC27:** Pause/resume subscription (if allowed by merchant)

**Merchant Features:**
- [ ] **AC28:** View all active subscriptions
- [ ] **AC29:** Subscription analytics (MRR, churn rate)
- [ ] **AC30:** Subscription lifecycle events (webhooks)

---

#### Technical Specifications

**Subscription Plan Schema:**

```typescript
@Entity('subscription_plans')
export class SubscriptionPlan extends BaseEntity {
  @Column('uuid')
  merchant_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'bigint' })
  amount: number; // In smallest currency unit

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
  })
  billing_cycle: string;

  @Column({ type: 'integer', default: 0 })
  trial_period_days: number;

  @Column({ type: 'bigint', default: 0 })
  setup_fee: number;

  @Column({ type: 'boolean', default: false })
  is_metered: boolean; // Usage-based billing

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    features?: string[];
    limits?: Record<string, number>;
  };

  @ManyToOne(() => MerchantAccount)
  @JoinColumn({ name: 'merchant_id' })
  merchant: MerchantAccount;

  @OneToMany(() => Subscription, subscription => subscription.plan)
  subscriptions: Subscription[];
}
```

**Subscription Schema:**

```typescript
@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @Column({ type: 'varchar', length: 30, unique: true })
  subscription_id: string; // SUB-20240101-0001

  @Column('uuid')
  customer_user_id: string;

  @Column('uuid')
  plan_id: string;

  @Column('uuid')
  merchant_id: string;

  @Column({
    type: 'enum',
    enum: ['trial', 'active', 'past_due', 'cancelled', 'expired'],
    default: 'trial'
  })
  status: string;

  @Column({ type: 'timestamp with time zone' })
  current_period_start: Date;

  @Column({ type: 'timestamp with time zone' })
  current_period_end: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  trial_end: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  cancelled_at: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  ended_at: Date;

  @Column({ type: 'boolean', default: false })
  cancel_at_period_end: boolean;

  @Column({ type: 'integer', default: 0 })
  failed_payment_attempts: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_payment_attempt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    payment_method_id?: string;
    customer_email?: string;
  };

  @ManyToOne(() => SubscriptionPlan, plan => plan.subscriptions)
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_user_id' })
  customer: User;

  @OneToMany(() => SubscriptionInvoice, invoice => invoice.subscription)
  invoices: SubscriptionInvoice[];
}

@Entity('subscription_invoices')
export class SubscriptionInvoice extends BaseEntity {
  @Column('uuid')
  subscription_id: string;

  @Column({ type: 'varchar', length: 50 })
  invoice_number: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  })
  status: string;

  @Column({ type: 'timestamp with time zone' })
  billing_date: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  paid_at: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  transaction_reference: string;

  @Column({ type: 'integer', default: 0 })
  attempt_count: number;

  @ManyToOne(() => Subscription, subscription => subscription.invoices)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;
}
```

**Subscription Service:**

```typescript
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(SubscriptionInvoice)
    private invoiceRepository: Repository<SubscriptionInvoice>,
    private paymentService: PaymentService,
    private emailService: EmailService,
  ) {}

  async createSubscription(dto: CreateSubscriptionDto): Promise<Subscription> {
    const plan = await this.planRepository.findOne({
      where: { id: dto.plan_id },
    });

    if (!plan || !plan.is_active) {
      throw new BadRequestException('Plan not available');
    }

    const now = new Date();
    const trialEnd = plan.trial_period_days > 0
      ? new Date(now.getTime() + plan.trial_period_days * 24 * 60 * 60 * 1000)
      : null;

    const currentPeriodEnd = this.calculateNextBillingDate(
      trialEnd || now,
      plan.billing_cycle
    );

    const subscription = this.subscriptionRepository.create({
      subscription_id: await this.generateSubscriptionId(),
      customer_user_id: dto.customer_user_id,
      plan_id: dto.plan_id,
      merchant_id: plan.merchant_id,
      status: plan.trial_period_days > 0 ? 'trial' : 'active',
      current_period_start: now,
      current_period_end: currentPeriodEnd,
      trial_end: trialEnd,
      metadata: {
        payment_method_id: dto.payment_method_id,
        customer_email: dto.customer_email,
      },
    });

    await this.subscriptionRepository.save(subscription);

    // Charge setup fee if any
    if (plan.setup_fee > 0) {
      await this.chargeSetupFee(subscription, plan);
    }

    return subscription;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processBillingCycles(): Promise<void> {
    this.logger.log('Processing subscription billing cycles');

    const now = new Date();

    // Find subscriptions due for billing
    const subscriptions = await this.subscriptionRepository.find({
      where: {
        status: In(['trial', 'active']),
        current_period_end: LessThanOrEqual(now),
      },
      relations: ['plan', 'customer'],
    });

    for (const subscription of subscriptions) {
      try {
        await this.processSubscriptionBilling(subscription);
      } catch (error) {
        this.logger.error(
          `Failed to bill subscription ${subscription.subscription_id}`,
          error
        );
      }
    }
  }

  private async processSubscriptionBilling(
    subscription: Subscription
  ): Promise<void> {
    // Create invoice
    const invoice = this.invoiceRepository.create({
      subscription_id: subscription.id,
      invoice_number: `SINV-${Date.now()}`,
      amount: subscription.plan.amount,
      status: 'pending',
      billing_date: new Date(),
      attempt_count: 0,
    });

    await this.invoiceRepository.save(invoice);

    // Attempt payment
    const success = await this.attemptPayment(subscription, invoice);

    if (success) {
      // Update subscription for next period
      const nextPeriodEnd = this.calculateNextBillingDate(
        subscription.current_period_end,
        subscription.plan.billing_cycle
      );

      subscription.current_period_start = subscription.current_period_end;
      subscription.current_period_end = nextPeriodEnd;
      subscription.status = 'active';
      subscription.trial_end = null;
      subscription.failed_payment_attempts = 0;

      await this.subscriptionRepository.save(subscription);
    } else {
      // Payment failed - start dunning process
      subscription.failed_payment_attempts += 1;
      subscription.last_payment_attempt = new Date();

      if (subscription.failed_payment_attempts >= 3) {
        subscription.status = 'past_due';
      }

      await this.subscriptionRepository.save(subscription);
      await this.sendDunningEmail(subscription, invoice);
    }
  }

  private async attemptPayment(
    subscription: Subscription,
    invoice: SubscriptionInvoice
  ): Promise<boolean> {
    try {
      invoice.attempt_count += 1;

      const payment = await this.paymentService.chargePaymentMethod({
        user_id: subscription.customer_user_id,
        payment_method_id: subscription.metadata.payment_method_id,
        amount: invoice.amount,
        currency: subscription.plan.currency,
        description: `Subscription: ${subscription.plan.name}`,
      });

      invoice.status = 'paid';
      invoice.paid_at = new Date();
      invoice.transaction_reference = payment.reference;

      await this.invoiceRepository.save(invoice);

      // Send receipt
      await this.sendSubscriptionReceipt(subscription, invoice);

      return true;
    } catch (error) {
      invoice.status = 'failed';
      await this.invoiceRepository.save(invoice);

      return false;
    }
  }

  private calculateNextBillingDate(from: Date, cycle: string): Date {
    const next = new Date(from);

    switch (cycle) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  }

  async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { subscription_id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (immediately) {
      subscription.status = 'cancelled';
      subscription.cancelled_at = new Date();
      subscription.ended_at = new Date();
    } else {
      subscription.cancel_at_period_end = true;
      subscription.cancelled_at = new Date();
    }

    return await this.subscriptionRepository.save(subscription);
  }
}
```

---

## Summary of Sprint 10 Stories

| Story ID | Story Name | Story Points | Priority | Status |
|----------|-----------|--------------|----------|--------|
| US-10.1.1 | Merchant Accounts & Invoice Management | 13 | P0 | To Do |
| US-10.2.1 | Recurring Payments & Subscription Billing | 13 | P0 | To Do |
| US-10.3.1 | Virtual Debit Cards | 8 | P1 | To Do |
| US-10.4.1 | Transaction Limits & Controls | 5 | P1 | To Do |
| US-10.5.1 | Compliance & AML Screening | 6 | P2 | To Do |
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
- Virtual card issuing provider (e.g., Sudo/Flutterwave)
- AML screening service (e.g., ComplyAdvantage)
- Email service for invoice delivery

**Internal:**
- Sprint 1: Authentication, authorization
- Sprint 5: Payment processing
- Sprint 7: Notification system
- Sprint 8: Admin panel, reporting

---

## Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| RISK-10.1 | Subscription billing failures causing churn | Medium | High | Robust retry logic, dunning management |
| RISK-10.2 | Virtual card provider integration complexity | Medium | Medium | Thorough testing, fallback plans |
| RISK-10.3 | AML false positives blocking legitimate users | Low | High | Manual review process, clear communication |
| RISK-10.4 | Invoice payment disputes | Medium | Medium | Clear terms, easy refund process |

---

## Notes & Decisions

**Technical Decisions:**
1. **Invoice Generation:** PDFKit for flexibility
2. **Subscription Billing:** Cron-based hourly processing
3. **Virtual Cards:** Integration with Sudo or Flutterwave
4. **AML Screening:** ComplyAdvantage API
5. **Dunning:** 3 retry attempts over 7 days

**Open Questions:**
1. ❓ Support cryptocurrency payments for invoices? **Decision: Phase 2**
2. ❓ Custom invoice templates for merchants? **Decision: Yes, with predefined themes**
3. ❓ Multi-currency subscriptions? **Decision: Yes, leverage Sprint 9 multi-currency**

---

**Document Version:** 1.0.0
**Last Updated:** January 2025
**Sprint Status:** Not Started
**Sprint Goal:** Enable merchant/business capabilities, recurring revenue models, and strengthen compliance
