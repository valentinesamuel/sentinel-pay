# Sprint 38 Backlog - Personal Finance Management (PFM) & Insights

**Sprint:** Sprint 38
**Duration:** 2 weeks (Week 76-77)
**Sprint Goal:** Implement comprehensive personal finance management system with spending analytics, budgeting tools, and financial insights
**Story Points Committed:** 30
**Team Capacity:** 30 SP (Solo developer, 8 hours/day × 10 days = 80 hours)
**Velocity:** Average of previous sprints = 32.5 SP, committed 30 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 38, we will have:
1. Automatic transaction categorization system
2. Budget creation and tracking with real-time monitoring
3. Savings goals management with progress tracking
4. AI-driven financial insights and recommendations
5. Income tracking and cash flow forecasting
6. Financial health score calculation
7. Comprehensive spending analytics and reporting
8. Data export functionality (CSV, PDF, Excel)
9. Financial health dashboard with trends

**Definition of Done (Sprint Level):**
- [ ] All user stories marked as done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (85% coverage)
- [ ] Integration tests passing
- [ ] Analytics calculation tests passing
- [ ] Category classification tests passing
- [ ] API documentation updated (Swagger)
- [ ] PFM dashboard UI functional
- [ ] Code reviewed and merged to main branch
- [ ] Sprint demo completed
- [ ] Sprint retrospective completed

---

## Sprint Backlog Items

---

# EPIC-15: Personal Finance Management & Insights

## FEATURE-15.1: Spending Categorization

### 📘 User Story: US-38.1.1 - Spending Categorization & Classification

**Story ID:** US-38.1.1
**Feature:** FEATURE-15.1 (Spending Categorization)
**Epic:** EPIC-15 (Personal Finance Management & Insights)

**Story Points:** 7
**Priority:** P0 (Critical)
**Sprint:** Sprint 38
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want my transactions to be automatically categorized
So that I can quickly understand my spending patterns across different categories
```

---

#### Business Value

**Value Statement:**
Automatic transaction categorization is foundational to personal finance management. It enables users to understand spending patterns, set budgets, and make informed financial decisions without manual effort.

**Impact:**
- **Critical:** Foundation for budgeting and insights
- **User Experience:** Automatic categorization saves time
- **Data Quality:** Accurate categorization enables reliable analytics
- **Personalization:** Enables tailored financial recommendations

**Success Criteria:**
- 95% categorization accuracy
- Real-time categorization on transaction creation
- Support for 50+ transaction categories
- User override capability with learning
- Custom categories support

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Auto-categorize transactions on creation (rule-based)
- [ ] **AC2:** Support 50+ predefined transaction categories
- [ ] **AC3:** Categorize by Essential (housing, utilities, food, transport)
- [ ] **AC4:** Categorize by Discretionary (entertainment, dining, shopping, subscriptions)
- [ ] **AC5:** Categorize by Financial (savings, investments, debt payments)
- [ ] **AC6:** Categorize by Charity & giving
- [ ] **AC7:** Categorize by Health & wellness
- [ ] **AC8:** Support merchant identification and classification
- [ ] **AC9:** Allow user to override category for a transaction
- [ ] **AC10:** Support custom user-defined categories
- [ ] **AC11:** Support subcategories (e.g., Food → Groceries vs. Dining Out)
- [ ] **AC12:** Support transaction tagging with multiple tags
- [ ] **AC13:** Recategorize similar transactions based on merchant and amount
- [ ] **AC14:** View all transactions in a category
- [ ] **AC15:** Bulk reclassify transactions
- [ ] **AC16:** Category rules engine with if-then logic
- [ ] **AC17:** ML-based categorization (optional for future sprints)
- [ ] **AC18:** Notification when category overridden by user (learning)
- [ ] **AC19:** Export categorization rules for backup
- [ ] **AC20:** Import categorization rules (batch update)

**Analytics:**
- [ ] **AC21:** Track category spending trends over time
- [ ] **AC22:** Identify top spending categories
- [ ] **AC23:** Month-over-month category spending changes
- [ ] **AC24:** Category distribution as percentage of total spending

**Non-Functional:**
- [ ] **AC25:** Categorization < 100ms per transaction
- [ ] **AC26:** Support 1M+ transactions in system
- [ ] **AC27:** Category lookup cached in-memory for performance
- [ ] **AC28:** Concurrent categorization processing
- [ ] **AC29:** No impact on transaction creation latency

---

#### Technical Specifications

**Spending Category Entity:**

```typescript
@Entity('spending_categories')
export class SpendingCategory extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column('varchar')
  category_name: string;  // e.g., "Groceries", "Dining Out"

  @Column('varchar')
  parent_category: string;  // e.g., "Food"

  @Column({ type: 'enum', enum: CategoryType, default: 'custom' })
  category_type: CategoryType;  // 'essential', 'discretionary', 'financial', 'charity', 'health', 'custom'

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar', { nullable: true })
  icon_url: string;

  @Column({ type: 'jsonb' })
  classification_rules: {
    keywords: string[];
    merchants: string[];
    amount_range?: { min: number; max: number };
    payment_methods?: string[];
    recurring?: boolean;
  };

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  monthly_average: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  budget_limit: number;

  @Column({ type: 'enum', enum: CategoryStatus, default: 'active' })
  status: CategoryStatus;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  updated_at: Date;

  @OneToMany(() => Transaction, t => t.spending_category)
  transactions: Transaction[];

  @OneToMany(() => CategoryRule, cr => cr.category)
  rules: CategoryRule[];
}
```

**Category Rule Entity:**

```typescript
@Entity('category_rules')
export class CategoryRule extends BaseEntity {
  @Column('uuid')
  category_id: string;

  @Column('uuid')
  user_id: string;

  @Column('varchar')
  rule_name: string;

  @Column('text')
  rule_condition: string;  // JSON representation of if-then logic

  @Column('integer')
  priority: number;  // Lower number = higher priority

  @Column({ type: 'enum', enum: RuleStatus, default: 'active' })
  status: RuleStatus;

  @Column('integer', { default: 0 })
  match_count: number;  // How many transactions matched this rule

  @Column('timestamp with time zone')
  created_at: Date;

  @ManyToOne(() => SpendingCategory)
  @JoinColumn({ name: 'category_id' })
  category: SpendingCategory;
}
```

**Category Classification Service:**

```typescript
@Injectable()
export class CategoryClassificationService {
  private categoryCache: Map<string, SpendingCategory[]> = new Map();

  constructor(
    @InjectRepository(SpendingCategory)
    private categoryRepository: Repository<SpendingCategory>,
    @InjectRepository(CategoryRule)
    private ruleRepository: Repository<CategoryRule>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {
    this.initializeCache();
  }

  async classifyTransaction(
    transaction: Transaction,
    userId: string,
  ): Promise<SpendingCategory> {
    // Try rule-based matching first
    let category = await this.matchByRules(transaction, userId);

    if (!category) {
      // Try merchant-based matching
      category = await this.matchByMerchant(transaction, userId);
    }

    if (!category) {
      // Try keyword-based matching
      category = await this.matchByKeywords(transaction, userId);
    }

    if (!category) {
      // Default to "Other" category
      category = await this.getOtherCategory(userId);
    }

    return category;
  }

  private async matchByRules(
    transaction: Transaction,
    userId: string,
  ): Promise<SpendingCategory | null> {
    const rules = await this.ruleRepository.find({
      where: { user_id: userId, status: 'active' },
      order: { priority: 'ASC' },
    });

    for (const rule of rules) {
      if (this.evaluateRuleCondition(rule.rule_condition, transaction)) {
        rule.match_count += 1;
        await this.ruleRepository.save(rule);

        return await this.categoryRepository.findOne({
          where: { id: rule.category_id },
        });
      }
    }

    return null;
  }

  private async matchByMerchant(
    transaction: Transaction,
    userId: string,
  ): Promise<SpendingCategory | null> {
    const categories = await this.categoryRepository.find({
      where: { user_id: userId },
    });

    for (const category of categories) {
      const rules = category.classification_rules;
      if (rules.merchants && rules.merchants.includes(transaction.merchant)) {
        return category;
      }
    }

    return null;
  }

  private async matchByKeywords(
    transaction: Transaction,
    userId: string,
  ): Promise<SpendingCategory | null> {
    const description = (transaction.description || '').toLowerCase();
    const categories = await this.categoryRepository.find({
      where: { user_id: userId },
    });

    for (const category of categories) {
      const rules = category.classification_rules;
      if (rules.keywords) {
        for (const keyword of rules.keywords) {
          if (description.includes(keyword.toLowerCase())) {
            return category;
          }
        }
      }
    }

    return null;
  }

  private evaluateRuleCondition(condition: string, transaction: Transaction): boolean {
    // Parse and evaluate JSON condition
    // Example: { operator: 'AND', conditions: [...] }
    try {
      const parsed = JSON.parse(condition);
      return this.evaluateConditionObject(parsed, transaction);
    } catch (error) {
      return false;
    }
  }

  private evaluateConditionObject(condition: any, transaction: Transaction): boolean {
    if (condition.operator === 'AND') {
      return condition.conditions.every(c => this.evaluateConditionObject(c, transaction));
    }

    if (condition.operator === 'OR') {
      return condition.conditions.some(c => this.evaluateConditionObject(c, transaction));
    }

    // Single condition: { field, operator, value }
    const { field, operator, value } = condition;
    const transactionValue = this.getTransactionField(transaction, field);

    switch (operator) {
      case 'equals':
        return transactionValue === value;
      case 'contains':
        return String(transactionValue).includes(value);
      case 'gt':
        return Number(transactionValue) > value;
      case 'gte':
        return Number(transactionValue) >= value;
      case 'lt':
        return Number(transactionValue) < value;
      case 'lte':
        return Number(transactionValue) <= value;
      case 'in':
        return Array.isArray(value) && value.includes(transactionValue);
      default:
        return false;
    }
  }

  private getTransactionField(transaction: Transaction, field: string): any {
    const fields = field.split('.');
    let value: any = transaction;

    for (const f of fields) {
      value = value?.[f];
    }

    return value;
  }

  async createCustomCategory(
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<SpendingCategory> {
    const category = this.categoryRepository.create({
      user_id: userId,
      category_name: dto.category_name,
      category_type: 'custom',
      classification_rules: {
        keywords: dto.keywords || [],
        merchants: dto.merchants || [],
      },
    });

    return await this.categoryRepository.save(category);
  }

  async updateCategoryRule(
    categoryId: string,
    ruleId: string,
    dto: UpdateRuleDto,
  ): Promise<CategoryRule> {
    const rule = await this.ruleRepository.findOne({
      where: { id: ruleId, category_id: categoryId },
    });

    if (!rule) {
      throw new NotFoundException('Rule not found');
    }

    rule.rule_condition = JSON.stringify(dto.rule_condition);
    rule.priority = dto.priority;

    return await this.ruleRepository.save(rule);
  }

  async reclassifyTransactions(
    userId: string,
    filters: ReclassifyFiltersDto,
  ): Promise<number> {
    const transactions = await this.transactionRepository.find({
      where: {
        user_id: userId,
        created_at: Between(filters.from_date, filters.to_date),
      },
    });

    let reclassifiedCount = 0;

    for (const transaction of transactions) {
      const category = await this.classifyTransaction(transaction, userId);
      if (category.id !== transaction.spending_category_id) {
        transaction.spending_category_id = category.id;
        await this.transactionRepository.save(transaction);
        reclassifiedCount += 1;
      }
    }

    return reclassifiedCount;
  }

  private async initializeCache(): Promise<void> {
    // Load system categories into cache on startup
    const systemCategories = await this.categoryRepository.find({
      where: { category_type: In(['essential', 'discretionary', 'financial']) },
    });

    systemCategories.forEach(cat => {
      this.categoryCache.set(cat.id, [cat]);
    });
  }
}
```

---

## FEATURE-15.2: Budget Management

### 📘 User Story: US-38.2.1 - Budget Creation & Management

**Story ID:** US-38.2.1
**Feature:** FEATURE-15.2 (Budget Management)
**Epic:** EPIC-15 (Personal Finance Management & Insights)

**Story Points:** 8
**Priority:** P0 (Critical)
**Sprint:** Sprint 38
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to create and manage monthly budgets for different spending categories
So that I can control my spending and achieve my financial goals
```

---

#### Business Value

**Value Statement:**
Budget management is critical for financial discipline. It allows users to set spending limits, monitor progress in real-time, and receive alerts before exceeding their budgets.

**Impact:**
- **Financial Control:** Users can manage spending limits per category
- **Awareness:** Real-time budget utilization tracking
- **Alerts:** Proactive notifications prevent overspending
- **Flexibility:** Shared budgets and custom thresholds

**Success Criteria:**
- Create budgets in < 1 second
- Real-time budget tracking accuracy
- Budget utilization calculated instantly
- Support for shared budgets (couples, families)
- Customizable alert thresholds

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Create monthly budget for a category
- [ ] **AC2:** Set budget amount and category
- [ ] **AC3:** View current budget utilization (e.g., 45% spent)
- [ ] **AC4:** View budget vs. actual spending
- [ ] **AC5:** Update budget amount mid-month
- [ ] **AC6:** Delete or archive budget
- [ ] **AC7:** Create multiple budgets (one per category)
- [ ] **AC8:** Support weekly budget tracking (see progress each week)
- [ ] **AC9:** Support quarterly budgets (3-month cycles)
- [ ] **AC10:** Support annual budgets
- [ ] **AC11:** Zero-based budgeting (allocate every naira of income)
- [ ] **AC12:** Budget templates (recommended budgets by income level)
- [ ] **AC13:** Create shared budget with multiple users
- [ ] **AC14:** View budget variance (expected vs. actual)
- [ ] **AC15:** Identify over-budget categories
- [ ] **AC16:** Carry-over unused budget to next month (rollover)
- [ ] **AC17:** Create spending limits per budget
- [ ] **AC18:** Support budget rollback and recovery
- [ ] **AC19:** Historical budget tracking (compare budgets across months)
- [ ] **AC20:** Export budget data (CSV, PDF)

**Alerts & Monitoring:**
- [ ] **AC21:** Alert at 75% of budget spent (warning)
- [ ] **AC22:** Alert at 90% of budget spent (serious warning)
- [ ] **AC23:** Alert at 100% of budget spent (exceeded)
- [ ] **AC24:** Real-time notifications (SMS, email, in-app)
- [ ] **AC25:** Customizable alert thresholds (user can set own)
- [ ] **AC26:** Mute alerts for specific categories
- [ ] **AC27:** Snooze alerts temporarily

**Non-Functional:**
- [ ] **AC28:** Budget creation/update < 500ms
- [ ] **AC29:** Budget calculation accuracy to ₦0.01
- [ ] **AC30:** Support 100+ budgets per user
- [ ] **AC31:** Real-time budget updates on transaction creation
- [ ] **AC32:** Concurrent budget updates handled correctly

---

#### Technical Specifications

**Budget Entity:**

```typescript
@Entity('budgets')
export class Budget extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column('uuid', { nullable: true })
  shared_with_user_id: string;  // For shared budgets

  @Column('uuid')
  category_id: string;

  @Column('varchar')
  budget_name: string;

  @Column('decimal', { precision: 15, scale: 2 })
  budget_amount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  spent_amount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  percent_used: number;

  @Column({ type: 'enum', enum: BudgetPeriod, default: 'monthly' })
  budget_period: BudgetPeriod;  // 'weekly', 'monthly', 'quarterly', 'annual'

  @Column('date')
  period_start: Date;

  @Column('date')
  period_end: Date;

  @Column({ type: 'enum', enum: BudgetStatus, default: 'active' })
  status: BudgetStatus;

  @Column({ type: 'jsonb' })
  alert_settings: {
    alert_at_75_percent: boolean;
    alert_at_90_percent: boolean;
    alert_at_100_percent: boolean;
    custom_thresholds?: number[];
    notification_channels: ('sms' | 'email' | 'in_app')[];
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    rollover_enabled: boolean;
    rollover_amount?: number;
    notes?: string;
    tags?: string[];
  };

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  carried_over_amount: number;

  @Column('timestamp with time zone')
  created_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  updated_at: Date;

  @ManyToOne(() => SpendingCategory)
  @JoinColumn({ name: 'category_id' })
  category: SpendingCategory;

  @OneToMany(() => BudgetAlert, ba => ba.budget)
  alerts: BudgetAlert[];

  @OneToMany(() => BudgetHistory, bh => bh.budget)
  history: BudgetHistory[];
}
```

**Budget Alert Entity:**

```typescript
@Entity('budget_alerts')
export class BudgetAlert extends BaseEntity {
  @Column('uuid')
  budget_id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'enum', enum: AlertType })
  alert_type: AlertType;  // '75_percent', '90_percent', '100_percent'

  @Column('decimal', { precision: 5, scale: 2 })
  threshold_reached: number;

  @Column('timestamp with time zone')
  alert_sent_at: Date;

  @Column('varchar', { nullable: true })
  notification_id: string;

  @Column({ type: 'enum', enum: AlertStatus, default: 'active' })
  status: AlertStatus;

  @Column('timestamp with time zone', { nullable: true })
  dismissed_at: Date;

  @ManyToOne(() => Budget)
  @JoinColumn({ name: 'budget_id' })
  budget: Budget;
}
```

**Budget Service:**

```typescript
@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(BudgetAlert)
    private alertRepository: Repository<BudgetAlert>,
    @InjectRepository(BudgetHistory)
    private historyRepository: Repository<BudgetHistory>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private notificationService: NotificationService,
  ) {}

  async createBudget(userId: string, dto: CreateBudgetDto): Promise<Budget> {
    const { period_start, budget_period } = dto;
    const period_end = this.calculatePeriodEnd(period_start, budget_period);

    const budget = this.budgetRepository.create({
      user_id: userId,
      category_id: dto.category_id,
      budget_amount: dto.budget_amount,
      budget_period,
      period_start,
      period_end,
      alert_settings: dto.alert_settings || {
        alert_at_75_percent: true,
        alert_at_90_percent: true,
        alert_at_100_percent: true,
        notification_channels: ['in_app', 'email'],
      },
      status: 'active',
    });

    return await this.budgetRepository.save(budget);
  }

  async updateBudgetAmount(
    userId: string,
    budgetId: string,
    newAmount: number,
  ): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId, user_id: userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const oldAmount = budget.budget_amount;
    budget.budget_amount = newAmount;
    budget.updated_at = new Date();

    await this.budgetRepository.save(budget);

    // Log change in history
    await this.historyRepository.save({
      budget_id: budgetId,
      change_type: 'amount_updated',
      old_value: oldAmount,
      new_value: newAmount,
      changed_at: new Date(),
    });

    return budget;
  }

  async calculateBudgetUtilization(budgetId: string): Promise<number> {
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const spent = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.category_id = :categoryId', {
        categoryId: budget.category_id,
      })
      .andWhere('transaction.created_at BETWEEN :start AND :end', {
        start: budget.period_start,
        end: budget.period_end,
      })
      .select('SUM(transaction.amount)', 'total')
      .getRawOne();

    const spentAmount = Number(spent.total || 0);
    const percentUsed = (spentAmount / budget.budget_amount) * 100;

    // Update budget
    budget.spent_amount = spentAmount;
    budget.percent_used = Number(percentUsed.toFixed(2));
    await this.budgetRepository.save(budget);

    return percentUsed;
  }

  async checkBudgetAlerts(budgetId: string): Promise<void> {
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const percentUsed = await this.calculateBudgetUtilization(budgetId);

    // Check 75% threshold
    if (percentUsed >= 75 && percentUsed < 90 && budget.alert_settings.alert_at_75_percent) {
      await this.createAlert(budgetId, budget.user_id, '75_percent', percentUsed);
    }

    // Check 90% threshold
    if (percentUsed >= 90 && percentUsed < 100 && budget.alert_settings.alert_at_90_percent) {
      await this.createAlert(budgetId, budget.user_id, '90_percent', percentUsed);
    }

    // Check 100% threshold
    if (percentUsed >= 100 && budget.alert_settings.alert_at_100_percent) {
      await this.createAlert(budgetId, budget.user_id, '100_percent', percentUsed);
    }
  }

  private async createAlert(
    budgetId: string,
    userId: string,
    alertType: AlertType,
    percentageReached: number,
  ): Promise<void> {
    // Check if alert already sent for this threshold
    const existing = await this.alertRepository.findOne({
      where: {
        budget_id: budgetId,
        alert_type: alertType,
        status: 'active',
      },
    });

    if (existing) {
      return;  // Alert already sent
    }

    const alert = this.alertRepository.create({
      budget_id: budgetId,
      user_id: userId,
      alert_type: alertType,
      threshold_reached: percentageReached,
      alert_sent_at: new Date(),
      status: 'active',
    });

    await this.alertRepository.save(alert);

    // Send notification
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId },
      relations: ['category'],
    });

    const message = this.formatAlertMessage(budget, alertType, percentageReached);
    await this.notificationService.sendNotification(
      userId,
      budget.alert_settings.notification_channels,
      {
        title: 'Budget Alert',
        message,
        type: 'budget_alert',
      },
    );
  }

  private formatAlertMessage(budget: Budget, alertType: AlertType, percentUsed: number): string {
    const categoryName = budget.category.category_name;

    switch (alertType) {
      case '75_percent':
        return `You've used 75% of your ${categoryName} budget (₦${budget.budget_amount.toLocaleString()})`;
      case '90_percent':
        return `You've used 90% of your ${categoryName} budget. Only ₦${(budget.budget_amount - budget.spent_amount).toLocaleString()} remaining`;
      case '100_percent':
        return `You've exceeded your ${categoryName} budget by ₦${(budget.spent_amount - budget.budget_amount).toLocaleString()}`;
      default:
        return 'Budget threshold reached';
    }
  }

  private calculatePeriodEnd(startDate: Date, period: BudgetPeriod): Date {
    const end = new Date(startDate);

    switch (period) {
      case 'weekly':
        end.setDate(end.getDate() + 6);
        break;
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);  // Last day of month
        break;
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        end.setDate(0);
        break;
      case 'annual':
        end.setFullYear(end.getFullYear() + 1);
        end.setDate(0);
        break;
    }

    return end;
  }

  async getBudgetHistory(
    userId: string,
    budgetId: string,
    limit: number = 12,
  ): Promise<BudgetHistory[]> {
    return await this.historyRepository.find({
      where: {
        budget_id: budgetId,
      },
      order: { changed_at: 'DESC' },
      take: limit,
    });
  }

  async rolloverUnusedBudget(budgetId: string): Promise<number> {
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId },
    });

    if (!budget || !budget.metadata?.rollover_enabled) {
      return 0;
    }

    const unused = budget.budget_amount - budget.spent_amount;
    if (unused <= 0) {
      return 0;
    }

    budget.carried_over_amount = unused;
    budget.metadata.rollover_amount = unused;

    await this.budgetRepository.save(budget);

    return unused;
  }
}
```

---

## FEATURE-15.3: Savings Goals

### 📘 User Story: US-38.3.1 - Savings Goals & Tracking

**Story ID:** US-38.3.1
**Feature:** FEATURE-15.3 (Savings Goals)
**Epic:** EPIC-15 (Personal Finance Management & Insights)

**Story Points:** 6
**Priority:** P0 (Critical)
**Sprint:** Sprint 38
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to set and track financial goals with progress monitoring
So that I can work toward achieving my financial milestones
```

---

#### Business Value

**Value Statement:**
Financial goal tracking provides motivation and structure for savings. Users can set targets for different goals (emergency fund, car, house) and monitor progress with visual indicators and milestones.

**Impact:**
- **Motivation:** Goal tracking encourages savings behavior
- **Clarity:** Clear targets help users stay focused
- **Flexibility:** Support various goal types (short, medium, long-term)
- **Accountability:** Progress tracking creates accountability

**Success Criteria:**
- Create goals in < 500ms
- Real-time progress calculation
- Support multiple goal types
- Visual progress tracking
- Milestone celebration

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Create financial goal (Buy iPhone: ₦500K)
- [ ] **AC2:** Set goal amount and target date
- [ ] **AC3:** Support short-term goals (1-6 months)
- [ ] **AC4:** Support medium-term goals (6-24 months)
- [ ] **AC5:** Support long-term goals (2+ years)
- [ ] **AC6:** View goal progress as percentage
- [ ] **AC7:** View progress bar visualization
- [ ] **AC8:** Calculate savings rate to reach goal
- [ ] **AC9:** View time remaining to reach goal
- [ ] **AC10:** Set auto-allocation (₦5K/month to goal)
- [ ] **AC11:** Track recurring savings to goal
- [ ] **AC12:** View milestone progress (halfway, 3/4 done, etc.)
- [ ] **AC13:** Unlock achievement badges on milestones
- [ ] **AC14:** View goal completion celebration
- [ ] **AC15:** Edit goal amount or target date
- [ ] **AC16:** Pause or resume goal tracking
- [ ] **AC17:** Archive completed goals
- [ ] **AC18:** Share goals with accountability partner
- [ ] **AC19:** View goal history and adjustments
- [ ] **AC20:** Export goal tracking data

**Analytics:**
- [ ] **AC21:** Track savings rate (amount/month toward goal)
- [ ] **AC22:** Identify on-track vs. off-track goals
- [ ] **AC23:** Compare actual savings to target rate
- [ ] **AC24:** Project completion date based on current rate

**Non-Functional:**
- [ ] **AC25:** Goal creation < 500ms
- [ ] **AC26:** Progress calculation < 100ms
- [ ] **AC27:** Support 50+ goals per user
- [ ] **AC28:** Real-time progress updates
- [ ] **AC29:** Accuracy to ₦0.01

---

#### Technical Specifications

**Savings Goal Entity:**

```typescript
@Entity('savings_goals')
export class SavingsGoal extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column('varchar')
  goal_name: string;

  @Column('text', { nullable: true })
  goal_description: string;

  @Column('varchar', { nullable: true })
  goal_icon_url: string;

  @Column('decimal', { precision: 15, scale: 2 })
  target_amount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  current_amount: number;

  @Column('date')
  target_date: Date;

  @Column({ type: 'enum', enum: GoalType })
  goal_type: GoalType;  // 'short_term', 'medium_term', 'long_term'

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  monthly_savings_target: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  monthly_allocation: number;

  @Column({ type: 'enum', enum: GoalStatus, default: 'active' })
  status: GoalStatus;

  @Column('integer', { default: 0 })
  percent_complete: number;

  @Column({ type: 'jsonb' })
  milestones: Array<{
    amount: number;
    percentage: number;
    unlocked: boolean;
    unlocked_at?: Date;
    badge_id?: string;
  }>;

  @Column('boolean', { default: false })
  auto_allocation_enabled: boolean;

  @Column('timestamp with time zone', { nullable: true })
  completed_at: Date;

  @Column('timestamp with time zone')
  created_at: Date;

  @OneToMany(() => GoalContribution, gc => gc.goal)
  contributions: GoalContribution[];

  @OneToMany(() => GoalMilestone, gm => gm.goal)
  goal_milestones: GoalMilestone[];
}
```

**Goal Milestone Entity:**

```typescript
@Entity('goal_milestones')
export class GoalMilestone extends BaseEntity {
  @Column('uuid')
  goal_id: string;

  @Column('varchar')
  milestone_name: string;

  @Column('decimal', { precision: 5, scale: 2 })
  percentage: number;  // 25%, 50%, 75%, 100%

  @Column('boolean', { default: false })
  unlocked: boolean;

  @Column('varchar', { nullable: true })
  achievement_badge_id: string;

  @Column('text', { nullable: true })
  celebration_message: string;

  @Column('timestamp with time zone', { nullable: true })
  unlocked_at: Date;

  @ManyToOne(() => SavingsGoal)
  @JoinColumn({ name: 'goal_id' })
  goal: SavingsGoal;
}
```

**Savings Goal Service:**

```typescript
@Injectable()
export class SavingsGoalService {
  constructor(
    @InjectRepository(SavingsGoal)
    private goalRepository: Repository<SavingsGoal>,
    @InjectRepository(GoalContribution)
    private contributionRepository: Repository<GoalContribution>,
    @InjectRepository(GoalMilestone)
    private milestoneRepository: Repository<GoalMilestone>,
  ) {}

  async createGoal(userId: string, dto: CreateGoalDto): Promise<SavingsGoal> {
    const milestones = [
      { amount: 0, percentage: 25, unlocked: false },
      { amount: 0, percentage: 50, unlocked: false },
      { amount: 0, percentage: 75, unlocked: false },
      { amount: 0, percentage: 100, unlocked: false },
    ];

    const monthsDiff = this.calculateMonthsDifference(new Date(), dto.target_date);
    const monthlySavingsTarget = dto.target_amount / monthsDiff;

    const goal = this.goalRepository.create({
      user_id: userId,
      goal_name: dto.goal_name,
      goal_description: dto.goal_description,
      target_amount: dto.target_amount,
      target_date: dto.target_date,
      goal_type: this.classifyGoalType(monthsDiff),
      monthly_savings_target: monthlySavingsTarget,
      milestones,
      status: 'active',
    });

    return await this.goalRepository.save(goal);
  }

  async contributeToGoal(
    userId: string,
    goalId: string,
    amount: number,
  ): Promise<GoalContribution> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, user_id: userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.status === 'completed') {
      throw new BadRequestException('Goal is already completed');
    }

    const contribution = this.contributionRepository.create({
      goal_id: goalId,
      user_id: userId,
      amount,
      contributed_at: new Date(),
    });

    await this.contributionRepository.save(contribution);

    // Update goal progress
    goal.current_amount += amount;
    goal.percent_complete = Math.min(
      Math.round((goal.current_amount / goal.target_amount) * 100),
      100,
    );

    // Check for milestone unlocking
    await this.checkMilestones(goal);

    // Check if goal completed
    if (goal.current_amount >= goal.target_amount) {
      goal.status = 'completed';
      goal.completed_at = new Date();
      goal.percent_complete = 100;
    }

    await this.goalRepository.save(goal);

    return contribution;
  }

  async getGoalProgress(userId: string, goalId: string): Promise<GoalProgress> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, user_id: userId },
      relations: ['goal_milestones'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const remainingAmount = Math.max(goal.target_amount - goal.current_amount, 0);
    const monthsRemaining = this.calculateMonthsDifference(new Date(), goal.target_date);
    const monthlySavingsRequired = monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0;

    return {
      goal_id: goal.id,
      goal_name: goal.goal_name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      remaining_amount: remainingAmount,
      percent_complete: goal.percent_complete,
      target_date: goal.target_date,
      months_remaining: Math.max(monthsRemaining, 0),
      monthly_savings_required: Number(monthlySavingsRequired.toFixed(2)),
      monthly_savings_actual: await this.getActualMonthlySavings(goalId),
      on_track: monthlySavingsRequired <= (await this.getActualMonthlySavings(goalId)),
      projected_completion_date: this.calculateProjectedCompletion(
        goal.current_amount,
        await this.getActualMonthlySavings(goalId),
        goal.target_amount,
      ),
      status: goal.status,
      milestones: goal.goal_milestones.map(m => ({
        percentage: m.percentage,
        unlocked: m.unlocked,
        unlocked_at: m.unlocked_at,
      })),
    };
  }

  private async checkMilestones(goal: SavingsGoal): Promise<void> {
    const milestones = await this.milestoneRepository.find({
      where: { goal_id: goal.id },
    });

    for (const milestone of milestones) {
      const percentageReached = (goal.current_amount / goal.target_amount) * 100;

      if (!milestone.unlocked && percentageReached >= milestone.percentage) {
        milestone.unlocked = true;
        milestone.unlocked_at = new Date();
        await this.milestoneRepository.save(milestone);

        // Create achievement badge notification
        await this.createMilestoneNotification(goal.id, goal.user_id, milestone);
      }
    }
  }

  private async createMilestoneNotification(
    goalId: string,
    userId: string,
    milestone: GoalMilestone,
  ): Promise<void> {
    const messages = {
      25: 'You\'re 25% of the way there! Keep going! 🎉',
      50: 'Halfway there! You\'re doing great! 🌟',
      75: 'Almost at the finish line! 💪',
      100: 'Goal completed! You did it! 🎊',
    };

    // Send notification (implementation depends on notification service)
    console.log(`[Goal Milestone] ${messages[milestone.percentage]} (Goal: ${goalId})`);
  }

  private async getActualMonthlySavings(goalId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const contributions = await this.contributionRepository
      .createQueryBuilder('contrib')
      .select('SUM(contrib.amount)', 'total')
      .where('contrib.goal_id = :goalId', { goalId })
      .andWhere('contrib.contributed_at >= :date', { date: thirtyDaysAgo })
      .getRawOne();

    return Number(contributions.total || 0);
  }

  private calculateProjectedCompletion(
    currentAmount: number,
    monthlySavings: number,
    targetAmount: number,
  ): Date | null {
    if (monthlySavings <= 0) {
      return null;
    }

    const remainingAmount = targetAmount - currentAmount;
    const monthsNeeded = remainingAmount / monthlySavings;
    const projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded);

    return projectedDate;
  }

  private calculateMonthsDifference(startDate: Date, endDate: Date): number {
    return (
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      endDate.getMonth() -
      startDate.getMonth()
    );
  }

  private classifyGoalType(months: number): GoalType {
    if (months <= 6) return 'short_term';
    if (months <= 24) return 'medium_term';
    return 'long_term';
  }
}
```

---

## FEATURE-15.4: Financial Insights

### 📘 User Story: US-38.4.1 - Financial Insights & Recommendations

**Story ID:** US-38.4.1
**Feature:** FEATURE-15.4 (Financial Insights)
**Epic:** EPIC-15 (Personal Finance Management & Insights)

**Story Points:** 5
**Priority:** P1 (High)
**Sprint:** Sprint 38
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to receive AI-driven financial insights and recommendations
So that I can make better financial decisions and improve my financial health
```

---

#### Business Value

**Value Statement:**
Personalized financial insights drive user engagement and help users improve financial habits. Recommendations based on spending patterns, goals, and benchmarks provide actionable guidance.

**Impact:**
- **Engagement:** Regular insights keep users engaged
- **Financial Health:** Recommendations improve user outcomes
- **Personalization:** AI-driven recommendations feel tailored
- **Learning:** Educational content helps users learn financial best practices

**Success Criteria:**
- Generate insights in < 2 seconds
- 70% relevance score for recommendations
- Support 20+ insight types
- Daily/weekly insight generation
- Actionable recommendations

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Generate spending comparison insights (month-over-month)
- [ ] **AC2:** Identify spending pattern anomalies
- [ ] **AC3:** Highlight top spending categories
- [ ] **AC4:** Identify cost reduction opportunities
- [ ] **AC5:** Track subscription costs and suggest cancellations
- [ ] **AC6:** Analyze coffee/dining patterns (₦1000/month suggestion)
- [ ] **AC7:** Compare spending to neighborhood average
- [ ] **AC8:** Calculate financial health score (0-100)
- [ ] **AC9:** Benchmarking against similar demographics
- [ ] **AC10:** Generate savings opportunity insights
- [ ] **AC11:** Identify unusual transactions
- [ ] **AC12:** Goal-based progress insights
- [ ] **AC13:** Budget adherence feedback
- [ ] **AC14:** Income vs. expense analysis
- [ ] **AC15:** Seasonal spending pattern detection
- [ ] **AC16:** Tax optimization suggestions
- [ ] **AC17:** Emergency fund gap analysis
- [ ] **AC18:** Debt repayment progress tracking
- [ ] **AC19:** Personalized financial tips & tricks
- [ ] **AC20:** Risk assessment (living paycheck-to-paycheck)

**Analytics:**
- [ ] **AC21:** Track insight engagement rate
- [ ] **AC22:** Measure impact of recommendations
- [ ] **AC23:** A/B test insight messages
- [ ] **AC24:** Monitor insight relevance

**Non-Functional:**
- [ ] **AC25:** Insight generation < 2 seconds
- [ ] **AC26:** Support 1M+ user profiles
- [ ] **AC27:** Batch processing for off-peak generation
- [ ] **AC28:** Cache frequently generated insights

---

#### Technical Specifications

**Financial Insight Entity:**

```typescript
@Entity('financial_insights')
export class FinancialInsight extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column({ type: 'enum', enum: InsightType })
  insight_type: InsightType;  // 'spending_comparison', 'anomaly', 'opportunity', etc.

  @Column('varchar')
  insight_title: string;

  @Column('text')
  insight_message: string;

  @Column('integer')
  relevance_score: number;  // 0-100

  @Column({ type: 'jsonb' })
  insight_data: {
    metrics: any;
    comparison?: any;
    recommendations?: string[];
    impact?: {
      potential_savings?: number;
      impact_level: 'low' | 'medium' | 'high';
    };
  };

  @Column('integer', { default: 0 })
  view_count: number;

  @Column('integer', { default: 0 })
  action_count: number;

  @Column('timestamp with time zone')
  generated_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  dismissed_at: Date;

  @Column('timestamp with time zone', { nullable: true })
  acted_on_at: Date;
}
```

**Financial Health Score Entity:**

```typescript
@Entity('financial_health_scores')
export class FinancialHealthScore extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column('integer')
  overall_score: number;  // 0-100

  @Column({ type: 'jsonb' })
  scores: {
    savings_rate_score: number;  // % of income saved
    debt_to_income_score: number;  // Debt/annual income
    emergency_fund_score: number;  // Months of expenses covered
    budget_adherence_score: number;  // How well they stick to budget
    goal_progress_score: number;  // Progress toward goals
  };

  @Column({ type: 'jsonb' })
  trend: {
    previous_score: number;
    score_change: number;
    trend_direction: 'improving' | 'declining' | 'stable';
  };

  @Column('decimal', { precision: 5, scale: 2 })
  savings_rate: number;  // % of income

  @Column('decimal', { precision: 5, scale: 2 })
  debt_to_income_ratio: number;

  @Column('decimal', { precision: 5, scale: 2 })
  emergency_fund_coverage: number;  // Months of expenses

  @Column('timestamp with time zone')
  calculated_at: Date;
}
```

**Insights Service:**

```typescript
@Injectable()
export class InsightsService {
  constructor(
    @InjectRepository(FinancialInsight)
    private insightRepository: Repository<FinancialInsight>,
    @InjectRepository(FinancialHealthScore)
    private healthScoreRepository: Repository<FinancialHealthScore>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(SavingsGoal)
    private goalRepository: Repository<SavingsGoal>,
  ) {}

  async generateDailyInsights(userId: string): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    // Generate spending comparison insight
    insights.push(await this.generateSpendingComparisonInsight(userId));

    // Generate anomaly detection
    const anomalies = await this.generateAnomalyInsight(userId);
    if (anomalies) insights.push(anomalies);

    // Generate savings opportunity
    insights.push(await this.generateSavingsOpportunityInsight(userId));

    // Generate budget feedback
    insights.push(await this.generateBudgetFeedbackInsight(userId));

    // Save all insights
    for (const insight of insights) {
      await this.insightRepository.save(insight);
    }

    return insights;
  }

  private async generateSpendingComparisonInsight(userId: string): Promise<FinancialInsight> {
    const thisMonthSpending = await this.getMonthlySpending(userId, 0);
    const lastMonthSpending = await this.getMonthlySpending(userId, 1);

    const change = thisMonthSpending - lastMonthSpending;
    const changePercent = ((change / lastMonthSpending) * 100).toFixed(2);

    const direction = change > 0 ? 'increased' : 'decreased';
    const message =
      change > 0
        ? `You spent ${changePercent}% more on ${this.getTopCategory(userId)} this month vs. last month. Consider reducing by ₦${Math.abs(change)} to stay on track.`
        : `Great job! Your spending ${direction} by ${Math.abs(changePercent)}% this month.`;

    return this.insightRepository.create({
      user_id: userId,
      insight_type: 'spending_comparison',
      insight_title: 'Monthly Spending Comparison',
      insight_message: message,
      relevance_score: 85,
      insight_data: {
        metrics: {
          this_month: thisMonthSpending,
          last_month: lastMonthSpending,
          change,
          change_percent: changePercent,
        },
      },
      generated_at: new Date(),
    });
  }

  private async generateAnomalyInsight(userId: string): Promise<FinancialInsight | null> {
    // Find unusual transactions (2x normal spending in category)
    const anomalies = await this.detectAnomalies(userId);

    if (anomalies.length === 0) {
      return null;
    }

    const message = `We detected unusual spending: ${anomalies[0].description}. Is this expected?`;

    return this.insightRepository.create({
      user_id: userId,
      insight_type: 'anomaly_detection',
      insight_title: 'Unusual Spending Alert',
      insight_message: message,
      relevance_score: 75,
      insight_data: {
        anomalies,
      },
      generated_at: new Date(),
    });
  }

  private async generateSavingsOpportunityInsight(userId: string): Promise<FinancialInsight> {
    // Identify subscriptions and recurring charges
    const subscriptions = await this.identifySubscriptions(userId);
    const totalSubscriptions = subscriptions.reduce((sum, s) => sum + s.monthly_cost, 0);

    const message =
      subscriptions.length > 0
        ? `Your subscription costs are ₦${totalSubscriptions}/month. Consider canceling unused services to save ₦${Math.round(totalSubscriptions * 0.2)}/month.`
        : `No major savings opportunities detected. Keep up the good financial habits!`;

    return this.insightRepository.create({
      user_id: userId,
      insight_type: 'savings_opportunity',
      insight_title: 'Cost Reduction Opportunities',
      insight_message: message,
      relevance_score: 80,
      insight_data: {
        metrics: {
          subscription_count: subscriptions.length,
          total_subscription_cost: totalSubscriptions,
          potential_savings: Math.round(totalSubscriptions * 0.2),
        },
        recommendations: subscriptions.map(s => `Consider canceling ${s.merchant}`),
      },
      generated_at: new Date(),
    });
  }

  private async generateBudgetFeedbackInsight(userId: string): Promise<FinancialInsight> {
    const budgets = await this.budgetRepository.find({
      where: { user_id: userId, status: 'active' },
    });

    let message = 'You are within budget for all categories. Good job! 💪';
    let relevance = 70;

    const overBudgetCategories = budgets.filter(b => b.percent_used > 100);

    if (overBudgetCategories.length > 0) {
      const category = overBudgetCategories[0];
      message = `You've exceeded your ${category.category.category_name} budget by ₦${(category.spent_amount - category.budget_amount).toLocaleString()}. Consider reviewing your spending in this category.`;
      relevance = 90;
    }

    return this.insightRepository.create({
      user_id: userId,
      insight_type: 'budget_feedback',
      insight_title: 'Budget Status Update',
      insight_message: message,
      relevance_score: relevance,
      insight_data: {
        metrics: {
          on_budget_count: budgets.filter(b => b.percent_used <= 100).length,
          over_budget_count: overBudgetCategories.length,
        },
      },
      generated_at: new Date(),
    });
  }

  async calculateFinancialHealthScore(userId: string): Promise<FinancialHealthScore> {
    // Calculate component scores
    const savingsRateScore = await this.calculateSavingsRateScore(userId);
    const debtToIncomeScore = await this.calculateDebtToIncomeScore(userId);
    const emergencyFundScore = await this.calculateEmergencyFundScore(userId);
    const budgetAdherenceScore = await this.calculateBudgetAdherenceScore(userId);
    const goalProgressScore = await this.calculateGoalProgressScore(userId);

    // Weighted average
    const overallScore = Math.round(
      savingsRateScore * 0.25 +
      debtToIncomeScore * 0.2 +
      emergencyFundScore * 0.2 +
      budgetAdherenceScore * 0.2 +
      goalProgressScore * 0.15,
    );

    const previousScore = await this.getLastHealthScore(userId);
    const scoreTrend = overallScore - (previousScore?.overall_score || 0);

    const healthScore = this.healthScoreRepository.create({
      user_id: userId,
      overall_score: overallScore,
      scores: {
        savings_rate_score: savingsRateScore,
        debt_to_income_score: debtToIncomeScore,
        emergency_fund_score: emergencyFundScore,
        budget_adherence_score: budgetAdherenceScore,
        goal_progress_score: goalProgressScore,
      },
      trend: {
        previous_score: previousScore?.overall_score || overallScore,
        score_change: scoreTrend,
        trend_direction:
          scoreTrend > 5 ? 'improving' : scoreTrend < -5 ? 'declining' : 'stable',
      },
      calculated_at: new Date(),
    });

    return await this.healthScoreRepository.save(healthScore);
  }

  private async detectAnomalies(userId: string): Promise<any[]> {
    // Implementation for anomaly detection
    // Returns transactions that are 2x normal spending in their category
    return [];
  }

  private async identifySubscriptions(userId: string): Promise<any[]> {
    // Implementation for identifying recurring subscriptions
    return [];
  }

  private async getMonthlySpending(userId: string, monthOffset: number): Promise<number> {
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);

    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM transaction.created_at) = :month', {
        month: date.getMonth() + 1,
      })
      .andWhere('EXTRACT(YEAR FROM transaction.created_at) = :year', {
        year: date.getFullYear(),
      })
      .select('SUM(transaction.amount)', 'total')
      .getRawOne();

    return Number(result.total || 0);
  }

  private getTopCategory(userId: string): string {
    // Implement to return top spending category
    return 'Dining';
  }

  private async calculateSavingsRateScore(userId: string): Promise<number> {
    // Calculate (savings / income) * 100, map to 0-100 score
    return 70;
  }

  private async calculateDebtToIncomeScore(userId: string): Promise<number> {
    // Calculate debt-to-income ratio and score
    return 80;
  }

  private async calculateEmergencyFundScore(userId: string): Promise<number> {
    // Calculate months of emergency fund coverage
    return 60;
  }

  private async calculateBudgetAdherenceScore(userId: string): Promise<number> {
    // Calculate how well user adheres to budgets
    return 75;
  }

  private async calculateGoalProgressScore(userId: string): Promise<number> {
    // Calculate progress toward financial goals
    return 70;
  }

  private async getLastHealthScore(userId: string): Promise<FinancialHealthScore | null> {
    return await this.healthScoreRepository.findOne({
      where: { user_id: userId },
      order: { calculated_at: 'DESC' },
    });
  }
}
```

---

## FEATURE-15.5: Income & Cash Flow Tracking

### 📘 User Story: US-38.5.1 - Income Tracking & Cash Flow Analysis

**Story ID:** US-38.5.1
**Feature:** FEATURE-15.5 (Income & Cash Flow Tracking)
**Epic:** EPIC-15 (Personal Finance Management & Insights)

**Story Points:** 4
**Priority:** P1 (High)
**Sprint:** Sprint 38
**Status:** 🔄 Not Started

---

#### User Story

```
As a user
I want to track my income sources and analyze my cash flow
So that I can understand my financial position and plan for the future
```

---

#### Business Value

**Value Statement:**
Income tracking and cash flow analysis are essential for financial planning. Users with variable income (freelancers, business owners) need to forecast cash flow and identify potential gaps.

**Impact:**
- **Planning:** Cash flow forecasting enables better planning
- **Awareness:** Income tracking provides financial clarity
- **Forecasting:** Identify cash flow gaps in advance
- **Optimization:** Better financial decision-making

**Success Criteria:**
- Track multiple income sources
- Real-time income vs. expense comparison
- Monthly/quarterly/annual cash flow forecasting
- Seasonal pattern identification
- Income volatility analysis

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Track multiple income sources
- [ ] **AC2:** Record salary income
- [ ] **AC3:** Record freelance/gig income
- [ ] **AC4:** Record business income
- [ ] **AC5:** Record investment income
- [ ] **AC6:** View monthly income dashboard
- [ ] **AC7:** Compare income vs. expenses
- [ ] **AC8:** Calculate savings rate (income - expenses / income)
- [ ] **AC9:** Track income growth year-over-year
- [ ] **AC10:** Upload pay slips for verification
- [ ] **AC11:** Forecast next month's cash flow
- [ ] **AC12:** Identify months with cash flow gaps
- [ ] **AC13:** Detect seasonal spending patterns
- [ ] **AC14:** Track income volatility (for freelancers)
- [ ] **AC15:** Project annual income
- [ ] **AC16:** Income breakdown by source
- [ ] **AC17:** View income trends (chart)
- [ ] **AC18:** Export income report
- [ ] **AC19:** Set income goals
- [ ] **AC20:** Compare income to budget assumptions

**Analytics:**
- [ ] **AC21:** Monthly income consistency
- [ ] **AC22:** Income growth metrics
- [ ] **AC23:** Income distribution by source
- [ ] **AC24:** Forecast accuracy tracking

**Non-Functional:**
- [ ] **AC25:** Income entry < 500ms
- [ ] **AC26:** Forecasting < 1 second
- [ ] **AC27:** Support variable income patterns
- [ ] **AC28:** Accuracy to ₦0.01

---

#### Technical Specifications

**Income Source Entity:**

```typescript
@Entity('income_sources')
export class IncomeSource extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column('varchar')
  source_name: string;

  @Column({ type: 'enum', enum: IncomeSourceType })
  income_type: IncomeSourceType;  // 'salary', 'freelance', 'business', 'investment', 'other'

  @Column('decimal', { precision: 15, scale: 2 })
  monthly_amount: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  expected_growth_rate: number;

  @Column({ type: 'enum', enum: IncomeFrequency })
  frequency: IncomeFrequency;  // 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual'

  @Column('date', { nullable: true })
  start_date: Date;

  @Column('date', { nullable: true })
  end_date: Date;

  @Column({ type: 'enum', enum: IncomeStatus, default: 'active' })
  status: IncomeStatus;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  volatility_index: number;  // 0-100 (0 = stable, 100 = highly variable)

  @Column('timestamp with time zone')
  created_at: Date;

  @OneToMany(() => IncomeTransaction, it => it.source)
  transactions: IncomeTransaction[];
}
```

**Income Transaction Entity:**

```typescript
@Entity('income_transactions')
export class IncomeTransaction extends BaseEntity {
  @Column('uuid')
  user_id: string;

  @Column('uuid')
  income_source_id: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column('date')
  income_date: Date;

  @Column('varchar', { nullable: true })
  reference: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('varchar', { nullable: true })
  payslip_url: string;

  @Column('timestamp with time zone')
  recorded_at: Date;

  @ManyToOne(() => IncomeSource)
  @JoinColumn({ name: 'income_source_id' })
  source: IncomeSource;
}
```

**Cash Flow Service:**

```typescript
@Injectable()
export class CashFlowService {
  constructor(
    @InjectRepository(IncomeSource)
    private incomeSourceRepository: Repository<IncomeSource>,
    @InjectRepository(IncomeTransaction)
    private incomeTransactionRepository: Repository<IncomeTransaction>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async addIncomeSource(userId: string, dto: CreateIncomeSourceDto): Promise<IncomeSource> {
    const source = this.incomeSourceRepository.create({
      user_id: userId,
      ...dto,
    });

    return await this.incomeSourceRepository.save(source);
  }

  async recordIncome(
    userId: string,
    sourceId: string,
    dto: RecordIncomeDto,
  ): Promise<IncomeTransaction> {
    const source = await this.incomeSourceRepository.findOne({
      where: { id: sourceId, user_id: userId },
    });

    if (!source) {
      throw new NotFoundException('Income source not found');
    }

    const transaction = this.incomeTransactionRepository.create({
      user_id: userId,
      income_source_id: sourceId,
      amount: dto.amount,
      income_date: dto.income_date,
      reference: dto.reference,
      notes: dto.notes,
      recorded_at: new Date(),
    });

    return await this.incomeTransactionRepository.save(transaction);
  }

  async getMonthlyIncomeReport(userId: string, month: number, year: number): Promise<any> {
    // Get all income for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const incomes = await this.incomeTransactionRepository.find({
      where: {
        user_id: userId,
        income_date: Between(startDate, endDate),
      },
      relations: ['source'],
    });

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    // Get all expenses for the month
    const expenses = await this.transactionRepository.find({
      where: {
        user_id: userId,
        created_at: Between(startDate, endDate),
      },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const savingsAmount = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

    return {
      period: `${month}/${year}`,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      savings_amount: savingsAmount,
      savings_rate: Number(savingsRate.toFixed(2)),
      income_breakdown: this.groupBySource(incomes),
      expense_breakdown: this.groupByCategory(expenses),
    };
  }

  async forecastCashFlow(userId: string, months: number = 3): Promise<any[]> {
    const forecast: any[] = [];

    for (let i = 1; i <= months; i++) {
      const projectedDate = new Date();
      projectedDate.setMonth(projectedDate.getMonth() + i);

      const month = projectedDate.getMonth() + 1;
      const year = projectedDate.getFullYear();

      // Get historical data for this month
      const historicalMonths: any[] = [];
      for (let y = 1; y <= 3; y++) {
        const histDate = new Date(year - y, month - 1, 1);
        const histEndDate = new Date(year - y, month, 0);

        const income = await this.incomeTransactionRepository
          .createQueryBuilder()
          .where('user_id = :userId', { userId })
          .andWhere('income_date BETWEEN :start AND :end', {
            start: histDate,
            end: histEndDate,
          })
          .select('SUM(amount)', 'total')
          .getRawOne();

        const expenses = await this.transactionRepository
          .createQueryBuilder()
          .where('user_id = :userId', { userId })
          .andWhere('created_at BETWEEN :start AND :end', {
            start: histDate,
            end: histEndDate,
          })
          .select('SUM(amount)', 'total')
          .getRawOne();

        historicalMonths.push({
          income: Number(income.total || 0),
          expenses: Number(expenses.total || 0),
        });
      }

      // Calculate average and forecast
      const avgIncome = historicalMonths.reduce((sum, m) => sum + m.income, 0) / historicalMonths.length;
      const avgExpenses = historicalMonths.reduce((sum, m) => sum + m.expenses, 0) / historicalMonths.length;

      forecast.push({
        month: `${month}/${year}`,
        projected_income: Math.round(avgIncome),
        projected_expenses: Math.round(avgExpenses),
        projected_cash_flow: Math.round(avgIncome - avgExpenses),
        has_gap: avgIncome < avgExpenses,
      });
    }

    return forecast;
  }

  async analyzeIncomeVolatility(userId: string): Promise<any> {
    // Get last 12 months of income
    const twelveMothsAgo = new Date();
    twelveMothsAgo.setMonth(twelveMothsAgo.getMonth() - 12);

    const incomes = await this.incomeTransactionRepository.find({
      where: {
        user_id: userId,
        recorded_at: MoreThan(twelveMothsAgo),
      },
      relations: ['source'],
    });

    // Group by month and calculate volatility
    const monthlyIncomes = this.groupIncomeByMonth(incomes);
    const values = Object.values(monthlyIncomes) as number[];

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const volatilityIndex = (stdDev / mean) * 100;

    return {
      average_monthly_income: Math.round(mean),
      volatility_index: Number(volatilityIndex.toFixed(2)),
      income_stability: volatilityIndex < 10 ? 'high' : volatilityIndex < 30 ? 'medium' : 'low',
      min_income: Math.min(...values),
      max_income: Math.max(...values),
      monthly_breakdown: monthlyIncomes,
    };
  }

  private groupBySource(incomes: IncomeTransaction[]): any[] {
    const grouped: { [key: string]: number } = {};

    incomes.forEach(income => {
      const sourceName = income.source.source_name;
      grouped[sourceName] = (grouped[sourceName] || 0) + income.amount;
    });

    return Object.entries(grouped).map(([source, amount]) => ({
      source,
      amount,
    }));
  }

  private groupByCategory(transactions: Transaction[]): any[] {
    const grouped: { [key: string]: number } = {};

    transactions.forEach(txn => {
      const category = txn.category || 'Other';
      grouped[category] = (grouped[category] || 0) + txn.amount;
    });

    return Object.entries(grouped).map(([category, amount]) => ({
      category,
      amount,
    }));
  }

  private groupIncomeByMonth(incomes: IncomeTransaction[]): { [key: string]: number } {
    const grouped: { [key: string]: number } = {};

    incomes.forEach(income => {
      const monthKey = `${income.income_date.getMonth() + 1}/${income.income_date.getFullYear()}`;
      grouped[monthKey] = (grouped[monthKey] || 0) + income.amount;
    });

    return grouped;
  }
}
```

---

## Sprint Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|-----------|
| RISK-38-001 | Category classification accuracy below 90% | Medium | High | Implement robust rule engine, test with diverse transaction types |
| RISK-38-002 | Budget calculation performance issues at scale | Low | High | Use database aggregation, implement caching for frequently accessed budgets |
| RISK-38-003 | Insights generation too slow for real-time | Low | High | Batch process insights off-peak, cache common calculations |
| RISK-38-004 | User confusion with multiple features | Medium | Medium | Implement guided onboarding, progressive feature disclosure |
| RISK-38-005 | Data accuracy issues with manual income entry | Medium | Medium | Require documentation, implement verification workflow |

---

## Sprint Dependencies

- **Sprint 29** (Transaction Management): Core transaction entities must be stable
- **Sprint 33** (KYC & User Profile): User data and verification status needed for income tracking
- **Sprint 36** (Social Payments): Spending categorization system must handle split transactions

---

## Sprint Notes & Decisions

1. **Categorization Approach:** Implement rule-based categorization first (Sprint 38), with ML-based approach deferred to future sprints for faster MVP delivery
2. **Budget Period Support:** Support monthly budgets as primary use case, with weekly/quarterly/annual as secondary features
3. **Insights Frequency:** Daily insight generation initially, with real-time insights deferred to future optimization
4. **Cash Flow Forecasting:** Use 3-month historical average as initial approach, can be improved with seasonal adjustments in future
5. **Privacy-First Design:** All personal finance data encrypted at rest, user consent required for cross-user benchmarking

---

## Sprint 40 Integration Notes

### Optional: Merchant Accounting Integration

Sprint 38 can optionally integrate with Sprint 40 POS Receipt System for merchants who use PFM for business accounting:

**Use Case:** A merchant who is also a user can:
1. Import POS receipt transactions into their personal finance view
2. Categorize business expenses automatically using Sprint 38 categorization rules
3. Track business income separately from personal income using Sprint 38 Income Tracking
4. Generate business accounting reports using Sprint 38 insights and analytics

**Integration Points:**
- **Transaction Import:** Fetch transactions from Sprint 40 `GET /api/v1/pos/transactions/` endpoint
- **Itemized Details:** Use receipt data from Sprint 40 to populate itemized business expenses
- **Category Mapping:** Apply Sprint 38 category classification to POS transactions
- **Income Tracking:** Record merchant settlement amounts as business income in Sprint 38
- **Business Accounting:** Generate merchant accounting reports from Sprint 38 analytics

**Implementation Notes:**
- This is OPTIONAL and deferred to Phase 2 (post-MVP)
- Requires merchant user context (user has associated merchant account)
- Would be implemented as a new feature in Sprint 38 or future sprint
- API integration would happen at transaction import time
- No changes needed to Sprint 38 core features for Phase 1 MVP

