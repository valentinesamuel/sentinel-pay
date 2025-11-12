# Sprint 28: Subscription Management - Implementation Tickets

## TICKET-28-001: Subscription Plan Service (4 SP)

**Story:** US-28.1.1 - Subscription Plan Creation & Management
**Priority:** CRITICAL
**Depends On:** Sprint 5 (Transactions)

**Implementation:**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface CreateSubscriptionPlanDto {
  merchantId: string;
  planName: string;
  planDescription?: string;
  billingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  billingInterval?: number;
  amount: number;
  currency?: string;
  trialPeriodDays?: number;
  trialAmount?: number;
  setupFee?: number;
  maxCharges?: number;
  billingAnchorDay?: number;
  planType?: 'fixed' | 'usage_based' | 'tiered';
  metadata?: Record<string, any>;
}

@Injectable()
export class SubscriptionPlanService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(SubscriptionPlanTier)
    private tierRepo: Repository<SubscriptionPlanTier>,
    private auditService: AuditService,
  ) {}

  async createPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    // 1. Validate merchant exists and is active
    const merchant = await this.merchantService.getOrFail(dto.merchantId);
    if (!merchant.isActive) {
      throw new BadRequestException('Merchant account is inactive');
    }

    // 2. Validate plan data
    this.validatePlanData(dto);

    // 3. Check for duplicate plan names
    const existing = await this.planRepo.findOne({
      where: { merchantId: dto.merchantId, planName: dto.planName },
    });
    if (existing && existing.status !== 'ARCHIVED') {
      throw new ConflictException('Plan name already exists for this merchant');
    }

    // 4. Create plan
    const plan = this.planRepo.create({
      merchantId: dto.merchantId,
      planName: dto.planName,
      planDescription: dto.planDescription,
      billingFrequency: dto.billingFrequency,
      billingInterval: dto.billingInterval || 1,
      amount: dto.amount,
      currency: dto.currency || 'NGN',
      trialPeriodDays: dto.trialPeriodDays || 0,
      trialAmount: dto.trialAmount,
      setupFee: dto.setupFee || 0,
      maxCharges: dto.maxCharges,
      billingAnchorDay: dto.billingAnchorDay,
      planType: dto.planType || 'fixed',
      status: 'ACTIVE',
      isActive: true,
      planVersion: 1,
      metadata: dto.metadata,
    });

    await this.planRepo.save(plan);

    // 5. Audit log
    await this.auditService.log({
      entityType: 'subscription_plan',
      entityId: plan.id,
      action: 'created',
      userId: merchant.userId,
      changes: { plan: dto },
    });

    return plan;
  }

  async updatePlan(planId: string, updates: Partial<CreateSubscriptionPlanDto>): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOneOrFail(planId);

    // Cannot update billing frequency of active plan if subscriptions exist
    const hasActiveSubscriptions = await this.subscriptionRepo.count({
      where: { planId, status: 'ACTIVE' },
    });
    if (hasActiveSubscriptions && updates.billingFrequency) {
      throw new BadRequestException(
        'Cannot change billing frequency of plan with active subscriptions'
      );
    }

    // Store old values for audit
    const oldPlan = { ...plan };
    
    Object.assign(plan, updates);
    plan.updatedAt = new Date();

    await this.planRepo.save(plan);

    await this.auditService.log({
      entityType: 'subscription_plan',
      entityId: planId,
      action: 'updated',
      userId: plan.merchantId,
      changes: { before: oldPlan, after: plan },
    });

    return plan;
  }

  async archivePlan(planId: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOneOrFail(planId);
    
    plan.status = 'ARCHIVED';
    plan.isActive = false;
    plan.archivedAt = new Date();
    plan.updatedAt = new Date();

    await this.planRepo.save(plan);

    // Notify customers if they have active subscriptions
    const activeSubscriptions = await this.subscriptionRepo.find({
      where: { planId, status: 'ACTIVE' },
    });

    for (const sub of activeSubscriptions) {
      await this.notificationService.sendToCustomer(sub.customerId, {
        type: 'PLAN_ARCHIVED',
        title: 'Subscription Plan Discontinued',
        message: `The "${plan.planName}" plan has been archived. Your subscription will continue until cancellation.`,
      });
    }

    return plan;
  }

  async versionPlan(planId: string, newPlanData: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const oldPlan = await this.planRepo.findOneOrFail(planId);
    
    // Create new version
    const newPlan = this.planRepo.create({
      ...oldPlan,
      id: undefined,
      planVersion: oldPlan.planVersion + 1,
      status: 'ACTIVE',
      isActive: true,
      createdAt: new Date(),
      ...newPlanData,
    });

    await this.planRepo.save(newPlan);

    // Archive old version
    oldPlan.status = 'ARCHIVED';
    oldPlan.isActive = false;
    await this.planRepo.save(oldPlan);

    return newPlan;
  }

  async getPlan(planId: string): Promise<SubscriptionPlan> {
    return this.planRepo.findOneOrFail(planId);
  }

  async listMerchantPlans(merchantId: string, filters?: {
    status?: string;
    isActive?: boolean;
  }): Promise<SubscriptionPlan[]> {
    return this.planRepo.find({
      where: {
        merchantId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      order: { createdAt: 'DESC' },
    });
  }

  private validatePlanData(dto: CreateSubscriptionPlanDto) {
    if (!dto.planName || dto.planName.trim().length === 0) {
      throw new BadRequestException('Plan name is required');
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    if (dto.trialPeriodDays && (dto.trialPeriodDays < 0 || dto.trialPeriodDays > 90)) {
      throw new BadRequestException('Trial period must be between 0-90 days');
    }

    const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'annual'];
    if (!validFrequencies.includes(dto.billingFrequency)) {
      throw new BadRequestException('Invalid billing frequency');
    }
  }
}
```

**Key Methods:**
- `createPlan()` - Create new subscription plan with validation
- `updatePlan()` - Update plan (with active subscription constraints)
- `archivePlan()` - Archive plan and notify customers
- `versionPlan()` - Create new plan version
- `getPlan()` - Retrieve plan by ID
- `listMerchantPlans()` - List all plans for merchant

**Files to Create:**
- `src/modules/subscriptions/services/subscription-plan.service.ts`
- `src/modules/subscriptions/entities/subscription-plan.entity.ts`
- `src/modules/subscriptions/dto/create-plan.dto.ts`

**Acceptance Criteria Checklist:**
- [ ] Plan creation with all billing frequencies
- [ ] Trial period configuration
- [ ] Setup fee support
- [ ] Plan versioning
- [ ] Plan archival with customer notifications
- [ ] Duplicate name prevention per merchant
- [ ] Full CRUD operations

---

## TICKET-28-002: Subscription Enrollment Service (3 SP)

**Story:** US-28.1.2 - Subscription Enrollment & Lifecycle
**Priority:** CRITICAL
**Depends On:** TICKET-28-001, Sprint 5.5 (Card Tokenization)

**Implementation:**

```typescript
interface SubscribeDto {
  customerId: string;
  planId: string;
  paymentMethodId: string;
  startDate?: Date;
  customAmount?: number;
}

@Injectable()
export class SubscriptionEnrollmentService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private planRepo: Repository<SubscriptionPlan>,
    private planService: SubscriptionPlanService,
    private notificationService: NotificationService,
    private auditService: AuditService,
  ) {}

  async enrollCustomer(dto: SubscribeDto): Promise<Subscription> {
    // 1. Validate plan exists and is active
    const plan = await this.planRepo.findOneOrFail(dto.planId);
    if (!plan.isActive || plan.status === 'ARCHIVED') {
      throw new BadRequestException('This plan is no longer available');
    }

    // 2. Validate customer exists
    const customer = await this.userService.getOrFail(dto.customerId);

    // 3. Validate payment method
    const paymentMethod = await this.paymentMethodService.getOrFail(
      dto.paymentMethodId,
      dto.customerId
    );
    if (!paymentMethod.isActive) {
      throw new BadRequestException('Payment method is not active');
    }

    // 4. Check for existing active subscription to same plan (prevent duplicates)
    const existing = await this.subscriptionRepo.findOne({
      where: {
        customerId: dto.customerId,
        planId: dto.planId,
        status: In(['ACTIVE', 'PAUSED']),
      },
    });
    if (existing) {
      throw new ConflictException('You already have an active subscription to this plan');
    }

    // 5. Calculate next charge date
    const nextChargeDate = this.calculateNextChargeDate(plan, dto.startDate);

    // 6. Create subscription
    const subscription = this.subscriptionRepo.create({
      customerId: dto.customerId,
      merchantId: plan.merchantId,
      planId: dto.planId,
      paymentMethodId: dto.paymentMethodId,
      status: 'PENDING',
      autoRenew: true,
      nextChargeDate,
      trialEndDate: plan.trialPeriodDays > 0 
        ? addDays(new Date(), plan.trialPeriodDays)
        : null,
      customAmount: dto.customAmount || plan.amount,
      maxCharges: plan.maxCharges,
    });

    await this.subscriptionRepo.save(subscription);

    // 7. Log subscription event
    await this.createSubscriptionEvent(subscription.id, 'enrolled', null);

    // 8. Activate subscription immediately
    subscription.status = 'ACTIVE';
    await this.subscriptionRepo.save(subscription);
    await this.createSubscriptionEvent(subscription.id, 'activated', null);

    // 9. Send notification
    await this.notificationService.sendToCustomer(dto.customerId, {
      type: 'SUBSCRIPTION_ACTIVATED',
      title: 'Subscription Activated',
      message: `Your subscription to "${plan.planName}" is now active. Next charge: ${format(nextChargeDate, 'MMM d, yyyy')}`,
      data: { subscriptionId: subscription.id, planId: plan.id },
    });

    // 10. Audit log
    await this.auditService.log({
      entityType: 'subscription',
      entityId: subscription.id,
      action: 'enrolled',
      userId: dto.customerId,
      changes: { plan: plan.planName, merchant: plan.merchantId },
    });

    return subscription;
  }

  async pauseSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOneOrFail(subscriptionId);
    
    if (subscription.status !== 'ACTIVE') {
      throw new BadRequestException('Only active subscriptions can be paused');
    }

    subscription.status = 'PAUSED';
    subscription.pausedAt = new Date();
    await this.subscriptionRepo.save(subscription);

    await this.createSubscriptionEvent(subscriptionId, 'paused', null);
    
    const plan = await this.planRepo.findOne(subscription.planId);
    await this.notificationService.sendToCustomer(subscription.customerId, {
      type: 'SUBSCRIPTION_PAUSED',
      title: 'Subscription Paused',
      message: `Your "${plan.planName}" subscription is paused.`,
    });

    return subscription;
  }

  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOneOrFail(subscriptionId);
    
    if (subscription.status !== 'PAUSED') {
      throw new BadRequestException('Only paused subscriptions can be resumed');
    }

    subscription.status = 'ACTIVE';
    subscription.resumedAt = new Date();
    
    // Recalculate next charge date from today
    const plan = await this.planRepo.findOne(subscription.planId);
    subscription.nextChargeDate = this.calculateNextChargeDate(plan);
    
    await this.subscriptionRepo.save(subscription);
    await this.createSubscriptionEvent(subscriptionId, 'resumed', null);

    return subscription;
  }

  async cancelSubscription(
    subscriptionId: string,
    reason: string
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOneOrFail(subscriptionId);
    
    if (['CANCELLED', 'EXPIRED'].includes(subscription.status)) {
      throw new BadRequestException('Subscription is already terminated');
    }

    subscription.status = 'CANCELLED';
    subscription.cancelledAt = new Date();
    subscription.cancelledReason = reason;
    await this.subscriptionRepo.save(subscription);

    await this.createSubscriptionEvent(subscriptionId, 'cancelled', null, { reason });

    return subscription;
  }

  async upgradeSubscription(
    subscriptionId: string,
    newPlanId: string
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOneOrFail(subscriptionId);
    const oldPlan = await this.planRepo.findOne(subscription.planId);
    const newPlan = await this.planRepo.findOne(newPlanId);

    if (subscription.status !== 'ACTIVE') {
      throw new BadRequestException('Only active subscriptions can be upgraded');
    }

    // Calculate pro-ration credit
    const daysPassed = differenceInDays(new Date(), subscription.lastChargeDate);
    const totalDaysInBillingCycle = this.getDaysInBillingCycle(oldPlan);
    const daysRemaining = totalDaysInBillingCycle - daysPassed;
    
    const creditAmount = (oldPlan.amount / totalDaysInBillingCycle) * daysRemaining;
    const chargeAmount = (newPlan.amount / this.getDaysInBillingCycle(newPlan)) * daysRemaining;
    
    const proration = {
      credit: creditAmount,
      charge: chargeAmount,
      net: chargeAmount - creditAmount,
    };

    // Update subscription
    subscription.planId = newPlanId;
    subscription.customAmount = newPlan.amount;
    subscription.updatedAt = new Date();
    await this.subscriptionRepo.save(subscription);

    await this.createSubscriptionEvent(subscriptionId, 'upgraded', null, { 
      oldPlan: oldPlan.id, 
      newPlan: newPlanId,
      proration 
    });

    return subscription;
  }

  private calculateNextChargeDate(plan: SubscriptionPlan, startDate?: Date): Date {
    const baseDate = startDate || new Date();

    switch (plan.billingFrequency) {
      case 'daily':
        return addDays(baseDate, plan.billingInterval || 1);
      case 'weekly':
        return addWeeks(baseDate, plan.billingInterval || 1);
      case 'monthly':
        if (plan.billingAnchorDay) {
          return this.calculateAnchorDate(baseDate, plan.billingAnchorDay);
        }
        return addMonths(baseDate, plan.billingInterval || 1);
      case 'quarterly':
        return addMonths(baseDate, (plan.billingInterval || 1) * 3);
      case 'annual':
        return addYears(baseDate, plan.billingInterval || 1);
      default:
        return addMonths(baseDate, 1);
    }
  }

  private calculateAnchorDate(date: Date, anchorDay: number): Date {
    const nextMonth = addMonths(date, 1);
    return set(nextMonth, { date: Math.min(anchorDay, getDaysInMonth(nextMonth)) });
  }

  private async createSubscriptionEvent(
    subscriptionId: string,
    eventType: string,
    amount?: number,
    metadata?: Record<string, any>
  ) {
    await this.subscriptionEventRepo.save({
      subscriptionId,
      eventType,
      amount,
      notes: JSON.stringify(metadata),
      createdAt: new Date(),
    });
  }

  private getDaysInBillingCycle(plan: SubscriptionPlan): number {
    switch (plan.billingFrequency) {
      case 'daily': return plan.billingInterval || 1;
      case 'weekly': return (plan.billingInterval || 1) * 7;
      case 'monthly': return 30;
      case 'quarterly': return 90;
      case 'annual': return 365;
      default: return 30;
    }
  }
}
```

**Key Methods:**
- `enrollCustomer()` - Create new subscription with activation
- `pauseSubscription()` - Pause active subscription
- `resumeSubscription()` - Resume paused subscription
- `cancelSubscription()` - Permanently cancel subscription
- `upgradeSubscription()` - Upgrade to new plan with pro-ration

**Acceptance Criteria Checklist:**
- [ ] Customer enrollment with payment method validation
- [ ] Trial period activation
- [ ] Subscription state management
- [ ] Pause/resume functionality
- [ ] Cancellation with reason tracking
- [ ] Plan upgrade with pro-ration
- [ ] Notifications for all lifecycle events

---

## TICKET-28-003: Subscription Charge Processor (5 SP)

**Story:** US-28.1.3 - Recurring Charge Processing & Retry Logic
**Priority:** CRITICAL
**Depends On:** TICKET-28-002, Sprint 5 (Transactions)

**Implementation:**

```typescript
@Injectable()
export class SubscriptionChargeProcessor {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionCharge)
    private chargeRepo: Repository<SubscriptionCharge>,
    @InjectRepository(SubscriptionChargeAttempt)
    private attemptRepo: Repository<SubscriptionChargeAttempt>,
    @InjectRepository(DunningEvent)
    private dunningRepo: Repository<DunningEvent>,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private logger: Logger,
  ) {}

  /**
   * Main charge processor - runs daily for all subscriptions due
   * Processes in batches with rate limiting
   */
  @Cron('0 0 * * *') // Daily at midnight
  async processScheduledCharges() {
    this.logger.log('Starting daily subscription charge processing');

    const dueDate = new Date();
    dueDate.setHours(0, 0, 0, 0);

    // Fetch subscriptions due for charging
    const subscriptionsDue = await this.subscriptionRepo.find({
      where: {
        status: 'ACTIVE',
        nextChargeDate: LessThanOrEqual(dueDate),
        autoRenew: true,
      },
      relations: ['plan', 'paymentMethod'],
    });

    this.logger.log(`Found ${subscriptionsDue.length} subscriptions due for charging`);

    // Process in batches to avoid overwhelming payment processor
    const BATCH_SIZE = 100;
    for (let i = 0; i < subscriptionsDue.length; i += BATCH_SIZE) {
      const batch = subscriptionsDue.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(sub => this.chargeSubscription(sub)));
      
      // Rate limit: wait 1 second between batches
      await sleep(1000);
    }

    this.logger.log('Completed daily subscription charge processing');
  }

  /**
   * Charge a single subscription
   */
  private async chargeSubscription(subscription: Subscription): Promise<void> {
    try {
      // 1. Generate idempotency key to prevent duplicate charges
      const idempotencyKey = `${subscription.id}-${subscription.chargeCount + 1}-${subscription.nextChargeDate.toISOString()}`;

      // 2. Check if charge already exists (idempotency)
      const existingCharge = await this.chargeRepo.findOne({
        where: { chargeIdempotencyKey: idempotencyKey },
      });
      if (existingCharge) {
        this.logger.debug(`Charge already exists: ${idempotencyKey}`);
        return;
      }

      // 3. Create charge record
      const amount = subscription.customAmount || subscription.plan.amount;
      const charge = this.chargeRepo.create({
        subscriptionId: subscription.id,
        amount,
        currency: subscription.plan.currency,
        status: 'PENDING',
        chargeIdempotencyKey: idempotencyKey,
        scheduledDate: subscription.nextChargeDate,
        paymentProcessor: 'paystack', // Default processor
        shouldRetry: true,
      });

      await this.chargeRepo.save(charge);

      // 4. Attempt charge
      const result = await this.attemptCharge(subscription, charge);

      if (result.success) {
        // Update subscription with successful charge
        subscription.chargeCount++;
        subscription.lastChargeDate = new Date();
        subscription.lastChargeAmount = amount;

        // Calculate next charge date
        subscription.nextChargeDate = this.calculateNextChargeDate(
          subscription.plan,
          subscription.nextChargeDate
        );

        // Check if subscription expired (max charges reached)
        if (
          subscription.maxCharges &&
          subscription.chargeCount >= subscription.maxCharges
        ) {
          subscription.status = 'EXPIRED';
          await this.notificationService.sendToCustomer(subscription.customerId, {
            type: 'SUBSCRIPTION_EXPIRED',
            title: 'Subscription Expired',
            message: 'Your subscription has ended after reaching the maximum number of charges.',
          });
        }

        await this.subscriptionRepo.save(subscription);
      } else {
        // Handle failed charge
        await this.handleFailedCharge(subscription, charge, result);
      }
    } catch (error) {
      this.logger.error(
        `Error processing charge for subscription ${subscription.id}`,
        error
      );
    }
  }

  /**
   * Attempt to charge subscription
   */
  private async attemptCharge(
    subscription: Subscription,
    charge: SubscriptionCharge
  ): Promise<{ success: boolean; error?: string; code?: string }> {
    const attempt = this.attemptRepo.create({
      chargeId: charge.id,
      attemptNumber: (charge.retryCount || 0) + 1,
      status: 'initiated',
    });

    try {
      // Call payment service to charge
      const paymentResult = await this.paymentService.chargeCard({
        amount: charge.amount,
        currency: charge.currency,
        customerId: subscription.customerId,
        paymentMethodId: subscription.paymentMethodId,
        idempotencyKey: charge.chargeIdempotencyKey,
        metadata: {
          subscriptionId: subscription.id,
          planId: subscription.planId,
        },
      });

      attempt.status = 'succeeded';
      attempt.processorResponse = paymentResult;

      charge.status = 'SUCCEEDED';
      charge.actualChargeDate = new Date();
      charge.processorChargeId = paymentResult.chargeId;

      await this.attemptRepo.save(attempt);
      await this.chargeRepo.save(charge);

      return { success: true };
    } catch (error) {
      attempt.status = 'failed';
      attempt.errorMessage = error.message;
      attempt.errorCode = error.code;
      attempt.processorResponse = error.response;

      await this.attemptRepo.save(attempt);

      // Determine if should retry
      const shouldRetry = this.shouldRetryCharge(error.code);

      charge.status = 'FAILED';
      charge.failureReason = error.message;
      charge.failureCode = error.code;
      charge.shouldRetry = shouldRetry;

      if (shouldRetry) {
        charge.status = 'RETRYING';
        charge.retryCount = (charge.retryCount || 0) + 1;
        
        if (charge.retryCount <= 3) {
          // Exponential backoff: 24h, 48h, 72h
          const hoursToWait = charge.retryCount * 24;
          charge.nextRetryDate = addHours(new Date(), hoursToWait);
        } else {
          charge.status = 'FAILED';
          charge.requiresReview = true;
        }
      } else {
        charge.requiresReview = true;
      }

      await this.chargeRepo.save(charge);

      return { success: false, error: error.message, code: error.code };
    }
  }

  /**
   * Handle failed charge with dunning workflow
   */
  private async handleFailedCharge(
    subscription: Subscription,
    charge: SubscriptionCharge,
    result: { success: boolean; error?: string; code?: string }
  ): Promise<void> {
    // Create dunning event
    const dunningEvent = this.dunningRepo.create({
      subscriptionId: subscription.id,
      chargeId: charge.id,
      eventType: 'first_attempt_failed',
      customerNotified: false,
    });

    // Send dunning notification
    if (charge.shouldRetry && charge.retryCount < 3) {
      dunningEvent.eventType = 'retry_scheduled';
      const daysUntilRetry = differenceInDays(charge.nextRetryDate, new Date());
      
      await this.notificationService.sendToCustomer(subscription.customerId, {
        type: 'SUBSCRIPTION_CHARGE_FAILED',
        title: 'Payment Failed',
        message: `Your ${subscription.plan.planName} subscription payment failed. We'll retry in ${daysUntilRetry} days. Please update your payment method if needed.`,
        data: { subscriptionId: subscription.id, retryDate: charge.nextRetryDate },
      });
      
      dunningEvent.customerNotified = true;
    } else {
      dunningEvent.eventType = 'final_attempt';
      
      await this.notificationService.sendToCustomer(subscription.customerId, {
        type: 'SUBSCRIPTION_SUSPENDED',
        title: 'Subscription Suspended',
        message: `Your ${subscription.plan.planName} subscription has been suspended due to repeated payment failures. Update your payment method to reactivate.`,
        data: { subscriptionId: subscription.id },
      });
      
      dunningEvent.customerNotified = true;
      subscription.status = 'PAUSED';
      await this.subscriptionRepo.save(subscription);
    }

    dunningEvent.notificationSentAt = new Date();
    await this.dunningRepo.save(dunningEvent);
  }

  /**
   * Retry failed charge (manual or automatic)
   */
  async retryCharge(chargeId: string): Promise<SubscriptionCharge> {
    const charge = await this.chargeRepo.findOneOrFail(chargeId);
    const subscription = await this.subscriptionRepo.findOne(charge.subscriptionId);

    if (charge.status === 'SUCCEEDED') {
      throw new BadRequestException('Cannot retry a successful charge');
    }

    if (charge.retryCount >= 3) {
      throw new BadRequestException('Maximum retry attempts exceeded');
    }

    // Attempt charge again
    const result = await this.attemptCharge(subscription, charge);

    if (!result.success) {
      await this.handleFailedCharge(subscription, charge, result);
    }

    return charge;
  }

  /**
   * Determine if error code is retryable
   */
  private shouldRetryCharge(errorCode: string): boolean {
    // Only retry specific, temporary failures
    const retryableErrors = [
      'network_error',
      'timeout',
      'temporary_decline',
      'processor_unavailable',
      'rate_limited',
    ];

    return retryableErrors.includes(errorCode);
  }

  private calculateNextChargeDate(plan: SubscriptionPlan, currentDate: Date): Date {
    switch (plan.billingFrequency) {
      case 'daily':
        return addDays(currentDate, plan.billingInterval || 1);
      case 'weekly':
        return addWeeks(currentDate, plan.billingInterval || 1);
      case 'monthly':
        return addMonths(currentDate, plan.billingInterval || 1);
      case 'quarterly':
        return addMonths(currentDate, (plan.billingInterval || 1) * 3);
      case 'annual':
        return addYears(currentDate, plan.billingInterval || 1);
      default:
        return addMonths(currentDate, 1);
    }
  }
}
```

**Key Methods:**
- `processScheduledCharges()` - Daily cron to process all due subscriptions
- `chargeSubscription()` - Charge individual subscription with idempotency
- `attemptCharge()` - Execute payment with detailed tracking
- `handleFailedCharge()` - Manage failed charge with dunning workflow
- `retryCharge()` - Manual retry for failed charges

**Acceptance Criteria Checklist:**
- [ ] Scheduled charge processing (daily cron)
- [ ] Idempotency guarantee (no duplicate charges)
- [ ] Batch processing with rate limiting (100s/second)
- [ ] Retry logic with exponential backoff (24h, 48h, 72h)
- [ ] Dunning notifications at each stage
- [ ] Charge attempt audit trail
- [ ] Max 3 retry attempts per charge
- [ ] Subscription state transitions (ACTIVE → PAUSED on suspension)

---

## TICKET-28-004: Subscription Analytics Service (2 SP)

**Story:** US-28.1.4 - Subscription Analytics & Reporting
**Priority:** HIGH
**Depends On:** TICKET-28-001, TICKET-28-003

**Implementation:**

```typescript
@Injectable()
export class SubscriptionAnalyticsService {
  constructor(
    @InjectRepository(SubscriptionMetrics)
    private metricsRepo: Repository<SubscriptionMetrics>,
    @InjectRepository(SubscriptionCohort)
    private cohortRepo: Repository<SubscriptionCohort>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionCharge)
    private chargeRepo: Repository<SubscriptionCharge>,
    private cache: CacheService,
  ) {}

  /**
   * Calculate daily subscription metrics
   * Runs nightly to aggregate metrics
   */
  @Cron('0 1 * * *') // 1 AM daily
  async calculateDailyMetrics() {
    const merchants = await this.merchantRepo.find({ where: { isActive: true } });

    for (const merchant of merchants) {
      await this.calculateMerchantMetrics(merchant.id, new Date());
    }
  }

  /**
   * Get subscription metrics for date range
   */
  async getMerchantMetrics(
    merchantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SubscriptionMetrics[]> {
    return this.metricsRepo.find({
      where: {
        merchantId,
        metricDate: Between(startDate, endDate),
      },
      order: { metricDate: 'DESC' },
    });
  }

  /**
   * Calculate MRR, ARR, churn, and other metrics for merchant
   */
  private async calculateMerchantMetrics(merchantId: string, date: Date) {
    const metricDate = new Date(date);
    metricDate.setHours(0, 0, 0, 0);

    // Get active subscriptions as of date
    const activeSubscriptions = await this.subscriptionRepo.find({
      where: {
        merchantId,
        status: 'ACTIVE',
        createdAt: LessThanOrEqual(metricDate),
      },
    });

    // Calculate MRR (sum of monthly recurring amounts)
    const mrrAmount = activeSubscriptions.reduce((sum, sub) => {
      const monthlyAmount = this.normalizeToMonthly(sub.plan);
      return sum + monthlyAmount;
    }, 0);

    // Calculate ARR
    const arr = mrrAmount * 12;

    // New subscriptions this month
    const monthStart = startOfMonth(metricDate);
    const monthEnd = endOfMonth(metricDate);
    
    const newCount = await this.subscriptionRepo.count({
      where: {
        merchantId,
        createdAt: Between(monthStart, monthEnd),
      },
    });

    // Cancelled subscriptions this month
    const cancelledCount = await this.subscriptionRepo.count({
      where: {
        merchantId,
        status: 'CANCELLED',
        cancelledAt: Between(monthStart, monthEnd),
      },
    });

    // Churn rate
    const churnRate = activeSubscriptions.length > 0
      ? (cancelledCount / activeSubscriptions.length) * 100
      : 0;

    // Trial conversions
    const trialConversions = await this.subscriptionRepo.count({
      where: {
        merchantId,
        trialEndDate: Between(monthStart, monthEnd),
        status: 'ACTIVE',
      },
    });

    // Failed charges this month
    const failedCharges = await this.chargeRepo.count({
      where: {
        status: 'FAILED',
        createdAt: Between(monthStart, monthEnd),
      },
    });

    // Recovered charges (succeeded after retry)
    const recoveredCharges = await this.chargeRepo.count({
      where: {
        status: 'SUCCEEDED',
        retryCount: GreaterThan(0),
        createdAt: Between(monthStart, monthEnd),
      },
    });

    const recoveryRate = failedCharges > 0
      ? (recoveredCharges / failedCharges) * 100
      : 0;

    // Expansion vs contraction
    const upgrades = await this.subscriptionRepo.find({
      where: {
        merchantId,
        updatedAt: Between(monthStart, monthEnd),
      },
    });

    let expansionMrr = 0, contractionMrr = 0;

    for (const sub of upgrades) {
      const oldPlanAmount = sub.customAmount || sub.plan.amount;
      const newPlanAmount = sub.plan.amount; // Simplified

      if (newPlanAmount > oldPlanAmount) {
        expansionMrr += (newPlanAmount - oldPlanAmount) / 12;
      } else if (newPlanAmount < oldPlanAmount) {
        contractionMrr += (oldPlanAmount - newPlanAmount) / 12;
      }
    }

    // Save metrics
    const metrics = this.metricsRepo.create({
      merchantId,
      metricDate,
      mrr: mrrAmount,
      arr,
      activeSubscriptions: activeSubscriptions.length,
      newSubscriptions: newCount,
      cancelledSubscriptions: cancelledCount,
      churnRate,
      trialConversions,
      failedCharges,
      recoveredCharges,
      recoveryRate,
      expansionMrr,
      contractionMrr,
    });

    await this.metricsRepo.save(metrics);
  }

  /**
   * Get cohort analysis for merchant
   */
  async getCohortAnalysis(merchantId: string): Promise<SubscriptionCohort[]> {
    return this.cohortRepo.find({
      where: { merchantId },
      order: { cohortMonth: 'DESC' },
    });
  }

  /**
   * Normalize subscription amount to monthly value
   */
  private normalizeToMonthly(plan: SubscriptionPlan): number {
    const { amount, billingFrequency, billingInterval } = plan;

    switch (billingFrequency) {
      case 'daily':
        return amount * 30 / (billingInterval || 1);
      case 'weekly':
        return amount * 4.33 / (billingInterval || 1);
      case 'monthly':
        return amount / (billingInterval || 1);
      case 'quarterly':
        return amount / 3 / (billingInterval || 1);
      case 'annual':
        return amount / 12 / (billingInterval || 1);
      default:
        return amount;
    }
  }
}
```

**Key Methods:**
- `calculateDailyMetrics()` - Nightly cron to compute metrics
- `getMerchantMetrics()` - Retrieve metrics for date range
- `getCohortAnalysis()` - Get cohort analysis trends

**Acceptance Criteria Checklist:**
- [ ] MRR/ARR calculation
- [ ] Churn rate computation
- [ ] Trial conversion tracking
- [ ] Failed charge recovery rate
- [ ] Expansion/contraction MRR
- [ ] Cohort analysis
- [ ] Daily metric aggregation via cron
- [ ] Merchant export capability

---

## Additional Implementation Tickets

**TICKET-28-005:** Subscription API Controller & REST Endpoints (2 SP)
- CRUD endpoints for plans, subscriptions, charges
- Query filtering and pagination
- Error handling and validation

**TICKET-28-006:** Subscription Webhooks & Event Publishing (2 SP)
- Publish subscription events to merchant webhooks
- Retry logic for failed webhook deliveries
- Event types: charged, failed, activated, cancelled

**TICKET-28-007:** Subscription Management Admin Dashboard (2 SP)
- Dashboard for viewing subscriptions, charges, metrics
- Manual charge retry interface
- Dispute/chargeback handling

**TICKET-28-008:** Integration Tests & Charge Simulation (2 SP)
- Mock payment processor for testing
- End-to-end subscription lifecycle tests
- Charge retry scenario tests

