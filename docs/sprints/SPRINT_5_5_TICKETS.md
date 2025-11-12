# Sprint 5.5: Card Tokenization - Implementation Tickets

---

## TICKET-5.5-001: TokenizedCardService Implementation

**Story:** US-5.5.1, US-5.5.2
**Points:** 5 SP
**Priority:** CRITICAL

**Implementation:**

```typescript
// src/modules/payment-methods/tokenized-card.service.ts

@Injectable()
export class TokenizedCardService {
  private readonly logger = new Logger(TokenizedCardService.name);

  constructor(
    @InjectRepository(TokenizedCard)
    private readonly repository: Repository<TokenizedCard>,
    private readonly paystackService: PaystackService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Tokenize a new card
   */
  async tokenizeCard(
    userId: string,
    cardData: CardData,
    options: { saveForFuture?: boolean; recurring?: boolean },
  ): Promise<TokenizedCard> {
    // Check for duplicate (same card already saved)
    const duplicate = await this.findDuplicateCard(userId, cardData);
    if (duplicate) {
      throw new BadRequestException('This card is already saved');
    }

    // Send to Paystack for tokenization
    const paystackToken = await this.paystackService.tokenizeCard(cardData);

    // Encrypt token before storage
    const encryptedToken = this.encryptionService.encrypt(paystackToken);

    // Generate user-visible token
    const userToken = this.generateUserToken();

    // Extract card details from tokenization
    const cardDetails = await this.paystackService.getCardDetails(paystackToken);

    // Store tokenized card
    const tokenized = this.repository.create({
      userId,
      paystackToken: encryptedToken,
      userVisibleToken: userToken,
      brand: cardDetails.brand,
      lastFourDigits: cardDetails.lastFourDigits,
      expiryMonth: cardDetails.expiryMonth,
      expiryYear: cardDetails.expiryYear,
      status: 'active',
      expiresAt: this.calculateExpiryDate(
        cardDetails.expiryMonth,
        cardDetails.expiryYear,
      ),
    });

    await this.repository.save(tokenized);

    this.logger.log(
      `Card tokenized for user ${userId}: ${cardDetails.brand} ****${cardDetails.lastFourDigits}`,
    );

    return tokenized;
  }

  /**
   * Get saved cards for user
   */
  async getUserCards(userId: string): Promise<TokenizedCard[]> {
    return this.repository.find({
      where: { userId, status: In(['active', 'expiring']) },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get card by ID
   */
  async getCardById(cardId: string, userId: string): Promise<TokenizedCard> {
    const card = await this.repository.findOne({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card;
  }

  /**
   * Revoke/delete tokenized card
   */
  async revokeCard(cardId: string, userId: string, reason?: string): Promise<void> {
    const card = await this.getCardById(cardId, userId);

    card.status = 'revoked';
    card.revokedAt = new Date();
    card.revokedReason = reason;

    await this.repository.save(card);

    this.logger.log(`Card ${cardId} revoked for user ${userId}`);
  }

  /**
   * Update card metadata (alias, default)
   */
  async updateCard(
    cardId: string,
    userId: string,
    updates: { alias?: string; default?: boolean },
  ): Promise<TokenizedCard> {
    const card = await this.getCardById(cardId, userId);

    if (updates.alias) {
      card.alias = updates.alias;
    }

    if (updates.default) {
      // Unset previous default
      await this.repository.update({ userId, default: true }, { default: false });
      card.default = true;
    }

    return this.repository.save(card);
  }

  /**
   * Get decrypted token for payment processing
   */
  async getDecryptedToken(cardId: string, userId: string): Promise<string> {
    const card = await this.getCardById(cardId, userId);

    if (card.status === 'revoked') {
      throw new BadRequestException('Card has been revoked');
    }

    if (card.status === 'expired') {
      throw new BadRequestException('Card has expired');
    }

    // Decrypt token (only in memory, never logged)
    return this.encryptionService.decrypt(card.paystackToken);
  }

  /**
   * Check for duplicate card
   */
  private async findDuplicateCard(
    userId: string,
    cardData: CardData,
  ): Promise<TokenizedCard | null> {
    // Hash card data to compare
    const cardHash = this.hashCardData(cardData);

    // In production, would query by card hash
    // For now, simple lookup by last 4 digits + expiry
    return this.repository.findOne({
      where: {
        userId,
        lastFourDigits: cardData.cardNumber.slice(-4),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
      },
    });
  }

  private generateUserToken(): string {
    return `card_${crypto.randomBytes(16).toString('hex')}`;
  }

  private calculateExpiryDate(month: number, year: number): Date {
    return new Date(year, month, 0); // Last day of expiry month
  }

  private hashCardData(cardData: CardData): string {
    const data = `${cardData.cardNumber}${cardData.expiryMonth}${cardData.expiryYear}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
```

**Files to Create:**
- `src/modules/payment-methods/tokenized-card.service.ts`
- `src/modules/payment-methods/entities/tokenized-card.entity.ts`
- `src/database/migrations/create-tokenized-card-tables.ts`

---

## TICKET-5.5-002: Payment Methods API Endpoints

**Story:** US-5.5.2
**Points:** 3 SP
**Priority:** HIGH

**Implementation:**

```typescript
// src/modules/payment-methods/payment-method.controller.ts

@Controller('api/v1/payment-methods')
@UseGuards(JwtAuthGuard, SigningGuard)
export class PaymentMethodController {
  constructor(private readonly tokenizedCardService: TokenizedCardService) {}

  @Get()
  async listPaymentMethods(@Req() req: any): Promise<TokenizedCardDto[]> {
    const cards = await this.tokenizedCardService.getUserCards(req.user.id);
    return cards.map(card => this.toDto(card));
  }

  @Get(':id')
  async getPaymentMethod(
    @Param('id') cardId: string,
    @Req() req: any,
  ): Promise<TokenizedCardDto> {
    const card = await this.tokenizedCardService.getCardById(cardId, req.user.id);
    return this.toDto(card);
  }

  @Patch(':id')
  async updatePaymentMethod(
    @Param('id') cardId: string,
    @Body() dto: UpdatePaymentMethodDto,
    @Req() req: any,
  ): Promise<TokenizedCardDto> {
    const card = await this.tokenizedCardService.updateCard(cardId, req.user.id, dto);
    return this.toDto(card);
  }

  @Delete(':id')
  async deletePaymentMethod(
    @Param('id') cardId: string,
    @Req() req: any,
  ): Promise<{ success: boolean; message: string }> {
    await this.tokenizedCardService.revokeCard(cardId, req.user.id, 'User requested deletion');
    return { success: true, message: 'Payment method removed' };
  }

  @Get(':id/usage')
  async getPaymentMethodUsage(
    @Param('id') cardId: string,
    @Req() req: any,
  ): Promise<TokenizedCardUsageDto[]> {
    // Implementation to fetch usage history
  }

  @Post(':id/set-default')
  async setDefaultPaymentMethod(
    @Param('id') cardId: string,
    @Req() req: any,
  ): Promise<{ success: boolean }> {
    await this.tokenizedCardService.updateCard(cardId, req.user.id, { default: true });
    return { success: true };
  }

  private toDto(card: TokenizedCard): TokenizedCardDto {
    return {
      id: card.id,
      brand: card.brand,
      lastFourDigits: card.lastFourDigits,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      status: card.status,
      default: card.default,
      createdAt: card.createdAt,
      alias: card.alias,
      usageCount: card.usageCount,
      lastUsedAt: card.lastUsedAt,
    };
  }
}
```

**Files to Create:**
- `src/modules/payment-methods/payment-method.controller.ts`
- `src/modules/payment-methods/dtos/tokenized-card.dto.ts`

---

## TICKET-5.5-003: Recurring Charge Service

**Story:** US-5.5.3
**Points:** 3 SP
**Priority:** HIGH

**Implementation:**

```typescript
// src/modules/payment-methods/recurring-charge.service.ts

@Injectable()
export class RecurringChargeService {
  private readonly logger = new Logger(RecurringChargeService.name);

  constructor(
    @InjectQueue('recurring-charges') private readonly chargeQueue: Queue,
    private readonly tokenizedCardService: TokenizedCardService,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Setup recurring charge for tokenized card
   */
  async setupRecurringCharge(
    userId: string,
    cardId: string,
    chargeConfig: RecurringChargeConfig,
  ): Promise<RecurringCharge> {
    // Verify card exists and is active
    const card = await this.tokenizedCardService.getCardById(cardId, userId);
    if (card.status !== 'active') {
      throw new BadRequestException('Card is not active');
    }

    // Create recurring charge record
    const recurringCharge = new RecurringCharge();
    recurringCharge.userId = userId;
    recurringCharge.cardId = cardId;
    recurringCharge.amount = chargeConfig.amount;
    recurringCharge.frequency = chargeConfig.frequency; // daily, weekly, monthly, yearly
    recurringCharge.description = chargeConfig.description;
    recurringCharge.status = 'active';
    recurringCharge.nextChargeDate = this.calculateNextChargeDate(chargeConfig.frequency);

    // Schedule first charge
    await this.scheduleCharge(recurringCharge);

    this.logger.log(
      `Recurring charge setup for user ${userId}, card ${cardId}: ${recurringCharge.amount}/${chargeConfig.frequency}`,
    );

    return recurringCharge;
  }

  /**
   * Process a recurring charge
   */
  async processRecurringCharge(recurringChargeId: string): Promise<void> {
    const charge = await this.getRecurringCharge(recurringChargeId);

    if (charge.status !== 'active') {
      return;
    }

    // Get decrypted token
    const token = await this.tokenizedCardService.getDecryptedToken(
      charge.cardId,
      charge.userId,
    );

    try {
      // Process charge via Paystack
      const transaction = await this.transactionService.chargeCard(
        charge.userId,
        token,
        {
          amount: charge.amount,
          description: charge.description,
          metadata: { recurringChargeId },
        },
      );

      // Update charge status
      charge.lastChargeDate = new Date();
      charge.chargeStatus = 'succeeded';
      charge.nextChargeDate = this.calculateNextChargeDate(charge.frequency);
      charge.retryCount = 0;

      await this.save(charge);

      this.logger.log(`Recurring charge ${recurringChargeId} processed successfully`);

      // Schedule next charge
      await this.scheduleCharge(charge);
    } catch (error) {
      // Handle failed charge
      await this.handleFailedCharge(charge, error);
    }
  }

  /**
   * Handle failed recurring charge with retry logic
   */
  private async handleFailedCharge(
    charge: RecurringCharge,
    error: any,
  ): Promise<void> {
    charge.retryCount = (charge.retryCount || 0) + 1;

    if (charge.retryCount >= 3) {
      // Give up after 3 retries
      charge.status = 'failed';
      charge.chargeStatus = 'permanently_failed';

      // Notify user
      await this.notifyPaymentMethodRequired(charge);
    } else {
      // Schedule retry (exponential backoff: 1 day, 2 days, 3 days)
      const retryDelay = charge.retryCount * 24 * 60 * 60 * 1000;
      charge.nextChargeDate = new Date(Date.now() + retryDelay);
      await this.scheduleCharge(charge);
    }

    await this.save(charge);
  }

  /**
   * Pause recurring charge
   */
  async pauseRecurringCharge(recurringChargeId: string): Promise<void> {
    const charge = await this.getRecurringCharge(recurringChargeId);
    charge.status = 'paused';
    await this.save(charge);
  }

  /**
   * Resume recurring charge
   */
  async resumeRecurringCharge(recurringChargeId: string): Promise<void> {
    const charge = await this.getRecurringCharge(recurringChargeId);
    charge.status = 'active';
    charge.nextChargeDate = new Date(); // Charge immediately on resume
    await this.scheduleCharge(charge);
    await this.save(charge);
  }

  /**
   * Cancel recurring charge
   */
  async cancelRecurringCharge(recurringChargeId: string, reason?: string): Promise<void> {
    const charge = await this.getRecurringCharge(recurringChargeId);
    charge.status = 'cancelled';
    charge.cancelledAt = new Date();
    charge.cancelledReason = reason;
    await this.save(charge);
  }

  private async scheduleCharge(charge: RecurringCharge): Promise<void> {
    const delayMs = charge.nextChargeDate.getTime() - Date.now();
    if (delayMs > 0) {
      await this.chargeQueue.add(
        'process-recurring',
        { recurringChargeId: charge.id },
        { delay: delayMs },
      );
    }
  }

  private calculateNextChargeDate(frequency: string): Date {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      case 'yearly':
        const nextYear = new Date(now);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        return nextYear;
      default:
        throw new BadRequestException('Invalid frequency');
    }
  }

  private async notifyPaymentMethodRequired(charge: RecurringCharge): Promise<void> {
    // Send notification to user that payment method update is required
    this.logger.log(
      `Notifying user ${charge.userId} that payment method update is required for recurring charge`,
    );
  }
}
```

**Files to Create:**
- `src/modules/payment-methods/recurring-charge.service.ts`
- `src/modules/payment-methods/entities/recurring-charge.entity.ts`

---

## TICKET-5.5-004: Integration with Payment Processing

**Story:** US-5.5.1, US-5.5.2
**Points:** 2 SP
**Priority:** HIGH

**Update PaymentService to support tokenized cards:**

```typescript
// In payment.service.ts - add new method

async chargeTokenizedCard(
  userId: string,
  cardId: string,
  dto: ChargeTokenizedCardDto,
): Promise<TransactionDto> {
  // Get and validate card
  const card = await this.tokenizedCardService.getCardById(cardId, userId);

  // Get decrypted token
  const token = await this.tokenizedCardService.getDecryptedToken(cardId, userId);

  // Process charge via Paystack
  const paystackResponse = await this.paystackService.chargeCard(token, {
    amount: dto.amount,
    email: userEmail,
    description: dto.description,
  });

  // Create transaction record
  const transaction = await this.createTransaction({
    userId,
    type: 'payment',
    amount: dto.amount,
    paymentMethod: 'tokenized_card',
    externalTransactionId: paystackResponse.reference,
    metadata: { cardId, tokenUsed: true },
  });

  // Update card usage stats
  card.usageCount++;
  card.lastUsedAt = new Date();
  await this.tokenizedCardService.save(card);

  return this.toTransactionDto(transaction);
}
```

---

## TICKET-5.5-005: Comprehensive Integration Testing

**Story:** All US-5.5.* stories
**Points:** 2 SP
**Priority:** HIGH

**Test scenarios:**
- Tokenize valid card
- Tokenize duplicate card (should reject)
- Charge with tokenized card
- Update card metadata
- Delete saved card
- List saved cards
- Setup recurring charge
- Process recurring charge
- Handle failed recurring charge
- Pause/resume recurring charge
- Token expiration handling

**Files to Create:**
- `tests/payment-methods/tokenized-card.integration.spec.ts`
- `tests/payment-methods/recurring-charge.integration.spec.ts`

---

## Acceptance Criteria Checklist

- [ ] Tokenization success rate: >99%
- [ ] Tokenization latency: <2 seconds
- [ ] Payment with saved card latency: <500ms vs full card entry
- [ ] Token encryption: AES-256, all tokens encrypted at rest
- [ ] PCI compliance: 0 raw card data in logs
- [ ] Duplicate detection: 100% accurate
- [ ] Recurring charge success: 95%+ on first attempt
- [ ] Failed charge recovery: 3 retries over 3 days
- [ ] Card expiration handling: Automatic, with user notification
- [ ] Audit trail: 100% complete for all operations
