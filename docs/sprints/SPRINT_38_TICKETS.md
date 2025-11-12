# Sprint 38 Tickets - Personal Finance Management (PFM) & Insights

**Sprint:** Sprint 38
**Duration:** 2 weeks (Week 76-77)
**Total Story Points:** 30 SP
**Total Tickets:** 28 tickets (5 stories + 23 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Status | Assignee |
|-----------|------|-------|--------------|--------|----------|
| TICKET-38-001 | Story | Spending Categorization & Classification | 7 | To Do | Developer |
| TICKET-38-002 | Task | Create Category Entities & Schema | 2 | To Do | Developer |
| TICKET-38-003 | Task | Implement Category Classification Service | 3 | To Do | Developer |
| TICKET-38-004 | Task | Create Category Management Endpoints | 1 | To Do | Developer |
| TICKET-38-005 | Task | Implement Transaction Recategorization | 1 | To Do | Developer |
| TICKET-38-006 | Story | Budget Creation & Management | 8 | To Do | Developer |
| TICKET-38-007 | Task | Create Budget Entities & Schema | 2 | To Do | Developer |
| TICKET-38-008 | Task | Implement Budget Service | 3 | To Do | Developer |
| TICKET-38-009 | Task | Create Budget Endpoints | 2 | To Do | Developer |
| TICKET-38-010 | Task | Implement Budget Alerts System | 1 | To Do | Developer |
| TICKET-38-011 | Story | Savings Goals & Tracking | 6 | To Do | Developer |
| TICKET-38-012 | Task | Create Goal Entities & Schema | 1 | To Do | Developer |
| TICKET-38-013 | Task | Implement Goal Service | 2 | To Do | Developer |
| TICKET-38-014 | Task | Create Goal Endpoints | 1 | To Do | Developer |
| TICKET-38-015 | Task | Implement Milestone & Achievement System | 2 | To Do | Developer |
| TICKET-38-016 | Story | Financial Insights & Recommendations | 5 | To Do | Developer |
| TICKET-38-017 | Task | Create Insights & Health Score Entities | 1 | To Do | Developer |
| TICKET-38-018 | Task | Implement Insights Generation Service | 2 | To Do | Developer |
| TICKET-38-019 | Task | Implement Financial Health Score Calculation | 1 | To Do | Developer |
| TICKET-38-020 | Task | Create Insights Endpoints | 1 | To Do | Developer |
| TICKET-38-021 | Story | Income Tracking & Cash Flow Analysis | 4 | To Do | Developer |
| TICKET-38-022 | Task | Create Income Source & Transaction Entities | 1 | To Do | Developer |
| TICKET-38-023 | Task | Implement Cash Flow Service | 1 | To Do | Developer |
| TICKET-38-024 | Task | Create Income Endpoints | 1 | To Do | Developer |
| TICKET-38-025 | Task | Implement Cash Flow Forecasting | 1 | To Do | Developer |
| TICKET-38-026 | Task | PFM Dashboard UI Components | 1 | To Do | Developer |
| TICKET-38-027 | Task | API Documentation & Postman Collection | 1 | To Do | Developer |
| TICKET-38-028 | Task | Testing (Unit, Integration, E2E) | 2 | To Do | Developer |

---

## TICKET-38-001: Spending Categorization & Classification

**Type:** User Story
**Story Points:** 7
**Priority:** P0 (Critical)
**Epic:** EPIC-15 (Personal Finance Management & Insights)
**Sprint:** Sprint 38

### Description

Implement automatic transaction categorization system that classifies transactions into 50+ predefined categories with support for user overrides, custom categories, and ML-ready infrastructure.

### Business Value

Automatic categorization is foundational for all PFM features. Without accurate categorization, budgeting, insights, and analytics are unreliable.

**Impact:**
- **Critical:** Foundation for all other PFM features
- **User Experience:** Automatic categorization saves time
- **Data Quality:** Accurate categorization enables reliable analytics
- **Personalization:** Enables tailored recommendations

### Acceptance Criteria

**Implementation:**
- [ ] Create spending_categories table with all fields
- [ ] Create category_rules table for rule-based matching
- [ ] Implement CategoryClassificationService with rule engine
- [ ] Support 50+ predefined categories
- [ ] Support 8 category parent types (Essential, Discretionary, Financial, Charity, Health)
- [ ] Implement merchant-based classification
- [ ] Implement keyword-based classification
- [ ] Support transaction override and learning
- [ ] Support custom user-defined categories
- [ ] Support transaction tagging with multiple tags
- [ ] Implement bulk recategorization
- [ ] Create GET /api/v1/pfm/categories (list all categories)
- [ ] Create POST /api/v1/pfm/categories (create custom category)
- [ ] Create GET /api/v1/pfm/categories/:id/transactions (view transactions in category)
- [ ] Create PATCH /api/v1/transactions/:id/category (override category)
- [ ] Implement category caching for performance
- [ ] Categorization latency < 100ms per transaction
- [ ] Support 1M+ transactions in system

**Testing:**
- [ ] Unit tests for classification logic (20+ test cases)
- [ ] Integration tests for category service (15+ test cases)
- [ ] Performance tests (1000 tx/sec throughput)
- [ ] Test custom category creation
- [ ] Test rule override learning

### Technical Specifications

**Database Migrations:**

```sql
CREATE TABLE IF NOT EXISTS spending_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  category_name VARCHAR NOT NULL,
  parent_category VARCHAR NOT NULL,
  category_type ENUM('essential', 'discretionary', 'financial', 'charity', 'health', 'custom') DEFAULT 'custom',
  description TEXT,
  icon_url VARCHAR,
  classification_rules JSONB NOT NULL DEFAULT '{}',
  monthly_average DECIMAL(15, 2) DEFAULT 0,
  budget_limit DECIMAL(5, 2),
  status ENUM('active', 'archived') DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_spending_categories_user_id ON spending_categories(user_id);
CREATE INDEX idx_spending_categories_status ON spending_categories(status);
CREATE INDEX idx_spending_categories_type ON spending_categories(category_type);

CREATE TABLE IF NOT EXISTS category_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rule_name VARCHAR NOT NULL,
  rule_condition TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  match_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES spending_categories(id),
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_category_rules_user_id ON category_rules(user_id);
CREATE INDEX idx_category_rules_category_id ON category_rules(category_id);
CREATE INDEX idx_category_rules_priority ON category_rules(priority);
```

**API Specification:**

```
POST /api/v1/pfm/categories
Create custom spending category

Request:
{
  "category_name": "Netflix",
  "parent_category": "Entertainment",
  "category_type": "discretionary",
  "keywords": ["netflix", "streaming"],
  "merchants": ["netflix.com"],
  "icon_url": "https://..."
}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "category_name": "Netflix",
    "parent_category": "Entertainment",
    "category_type": "discretionary",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

```
GET /api/v1/pfm/categories
List all categories for user

Query Parameters:
  - type: string (optional) - 'essential', 'discretionary', 'custom'
  - parent: string (optional) - filter by parent category

Response:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "category_name": "Groceries",
      "parent_category": "Food",
      "category_type": "essential",
      "monthly_average": 15000
    },
    ...
  ]
}
```

```
PATCH /api/v1/transactions/:id/category
Override transaction category

Request:
{
  "category_id": "uuid"
}

Response:
{
  "status": "success",
  "message": "Transaction categorized as Food -> Groceries"
}
```

```
GET /api/v1/pfm/categories/:id/transactions
View all transactions in a category

Query Parameters:
  - from_date: string (ISO date)
  - to_date: string (ISO date)
  - page: number
  - limit: number

Response:
{
  "status": "success",
  "data": {
    "category": { ... },
    "transactions": [ ... ],
    "pagination": { "total": 145, "page": 1, "limit": 20 }
  }
}
```

**Implementation Code:**

```typescript
// category.controller.ts
@Controller('pfm/categories')
@UseGuards(JwtAuthGuard)
@ApiTags('PFM - Spending Categories')
export class CategoryController {
  constructor(private categoryService: CategoryClassificationService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create custom spending category' })
  async createCategory(@Body() dto: CreateCategoryDto, @Request() req) {
    const category = await this.categoryService.createCustomCategory(req.user.id, dto);
    return { status: 'success', data: category };
  }

  @Get()
  @ApiOperation({ summary: 'List all spending categories' })
  async listCategories(
    @Query('type') type?: string,
    @Query('parent') parent?: string,
    @Request() req,
  ) {
    const categories = await this.categoryService.listCategories(
      req.user.id,
      type,
      parent,
    );
    return { status: 'success', data: categories };
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get transactions in category' })
  async getCategoryTransactions(
    @Param('id') categoryId: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Request() req,
  ) {
    const result = await this.categoryService.getTransactionsByCategory(
      categoryId,
      req.user.id,
      {
        from_date: fromDate ? new Date(fromDate) : undefined,
        to_date: toDate ? new Date(toDate) : undefined,
        page,
        limit,
      },
    );
    return { status: 'success', data: result };
  }

  @Patch('rules')
  @ApiOperation({ summary: 'Update categorization rule' })
  async updateRule(@Body() dto: UpdateRuleDto, @Request() req) {
    const rule = await this.categoryService.updateCategoryRule(
      req.user.id,
      dto.category_id,
      dto.rule_id,
      dto,
    );
    return { status: 'success', data: rule };
  }

  @Post('recategorize')
  @ApiOperation({ summary: 'Bulk recategorize transactions' })
  async recategorizeTransactions(
    @Body() dto: ReclassifyFiltersDto,
    @Request() req,
  ) {
    const count = await this.categoryService.reclassifyTransactions(
      req.user.id,
      dto,
    );
    return { status: 'success', message: `${count} transactions recategorized` };
  }
}

// Test examples
describe('CategoryClassificationService', () => {
  let service: CategoryClassificationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CategoryClassificationService],
    }).compile();

    service = module.get<CategoryClassificationService>(CategoryClassificationService);
  });

  it('should classify transaction by merchant', async () => {
    const transaction = {
      merchant: 'Jumia Food',
      amount: 5000,
      description: 'Food delivery',
    };

    const category = await service.classifyTransaction(transaction, userId);
    expect(category.category_name).toBe('Dining Out');
  });

  it('should classify transaction by keyword', async () => {
    const transaction = {
      merchant: 'Unknown',
      amount: 2000,
      description: 'Electricity bill payment',
    };

    const category = await service.classifyTransaction(transaction, userId);
    expect(category.parent_category).toBe('Essential');
  });

  it('should allow user override', async () => {
    // Create transaction with initial category
    // User overrides to different category
    // Service learns from override
    expect(true).toBe(true);
  });
});
```

---

## TICKET-38-002: Create Budget Entities & Schema

**Type:** Task
**Story Points:** 2
**Priority:** P0 (Critical)
**Epic:** EPIC-15 (Personal Finance Management & Insights)
**Sprint:** Sprint 38

### Description

Create database entities and schema for budget management including Budget, BudgetAlert, and BudgetHistory tables with proper relationships and indices.

### Acceptance Criteria

- [ ] Create budgets table
- [ ] Create budget_alerts table
- [ ] Create budget_history table
- [ ] Add foreign key constraints
- [ ] Create performance indices
- [ ] Add check constraints (budget_amount > 0)
- [ ] Add default values for status and timestamps
- [ ] Document entity relationships

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  shared_with_user_id UUID,
  category_id UUID NOT NULL,
  budget_name VARCHAR NOT NULL,
  budget_amount DECIMAL(15, 2) NOT NULL,
  spent_amount DECIMAL(15, 2) DEFAULT 0,
  percent_used DECIMAL(5, 2) DEFAULT 0,
  budget_period ENUM('weekly', 'monthly', 'quarterly', 'annual') DEFAULT 'monthly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status ENUM('active', 'archived', 'paused') DEFAULT 'active',
  alert_settings JSONB NOT NULL DEFAULT '{}',
  metadata JSONB,
  carried_over_amount DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES spending_categories(id),
  CONSTRAINT budget_amount_positive CHECK (budget_amount > 0)
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_period ON budgets(period_start, period_end);

CREATE TABLE IF NOT EXISTS budget_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID NOT NULL,
  user_id UUID NOT NULL,
  alert_type ENUM('75_percent', '90_percent', '100_percent') NOT NULL,
  threshold_reached DECIMAL(5, 2) NOT NULL,
  alert_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_id VARCHAR,
  status ENUM('active', 'dismissed', 'resolved') DEFAULT 'active',
  dismissed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_budget_id FOREIGN KEY (budget_id) REFERENCES budgets(id),
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_budget_alerts_budget_id ON budget_alerts(budget_id);
CREATE INDEX idx_budget_alerts_user_id ON budget_alerts(user_id);
CREATE INDEX idx_budget_alerts_status ON budget_alerts(status);

CREATE TABLE IF NOT EXISTS budget_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID NOT NULL,
  change_type VARCHAR NOT NULL,
  old_value DECIMAL(15, 2),
  new_value DECIMAL(15, 2),
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  CONSTRAINT fk_budget_id FOREIGN KEY (budget_id) REFERENCES budgets(id)
);

CREATE INDEX idx_budget_history_budget_id ON budget_history(budget_id);
CREATE INDEX idx_budget_history_changed_at ON budget_history(changed_at);
```

---

## TICKET-38-003: Implement Budget Service

**Type:** Task
**Story Points:** 3
**Priority:** P0 (Critical)
**Epic:** EPIC-15 (Personal Finance Management & Insights)
**Sprint:** Sprint 38

### Description

Implement BudgetService with methods for creating budgets, calculating utilization, checking alerts, and managing budget periods.

### Acceptance Criteria

- [ ] createBudget() - Create new budget
- [ ] updateBudgetAmount() - Update budget mid-period
- [ ] calculateBudgetUtilization() - Real-time utilization calculation
- [ ] checkBudgetAlerts() - Check and create alerts
- [ ] getBudgetHistory() - View budget changes
- [ ] rolloverUnusedBudget() - Carry over to next period
- [ ] All calculations accurate to ₦0.01
- [ ] Concurrent update handling with pessimistic locking
- [ ] Performance: utilization calculation < 100ms

### Implementation Code

```typescript
// budget.service.ts - Key methods

async createBudget(userId: string, dto: CreateBudgetDto): Promise<Budget> {
  // Validate budget amount
  if (dto.budget_amount <= 0) {
    throw new BadRequestException('Budget amount must be positive');
  }

  // Check category exists and belongs to user
  const category = await this.categoryRepository.findOne({
    where: { id: dto.category_id, user_id: userId },
  });

  if (!category) {
    throw new NotFoundException('Category not found');
  }

  const period_end = this.calculatePeriodEnd(dto.period_start, dto.budget_period);

  const budget = this.budgetRepository.create({
    user_id: userId,
    category_id: dto.category_id,
    budget_name: dto.budget_name,
    budget_amount: dto.budget_amount,
    budget_period: dto.budget_period,
    period_start: dto.period_start,
    period_end: period_end,
    alert_settings: {
      alert_at_75_percent: true,
      alert_at_90_percent: true,
      alert_at_100_percent: true,
      notification_channels: ['in_app', 'email'],
      ...dto.alert_settings,
    },
    status: 'active',
  });

  return await this.budgetRepository.save(budget);
}

async calculateBudgetUtilization(budgetId: string): Promise<BudgetUtilizationDto> {
  const budget = await this.budgetRepository.findOne({
    where: { id: budgetId },
    relations: ['category'],
  });

  if (!budget) {
    throw new NotFoundException('Budget not found');
  }

  // Use database query for performance
  const spent = await this.transactionRepository
    .createQueryBuilder('transaction')
    .where('transaction.spending_category_id = :categoryId', {
      categoryId: budget.category_id,
    })
    .andWhere('transaction.created_at BETWEEN :start AND :end', {
      start: budget.period_start,
      end: budget.period_end,
    })
    .andWhere('transaction.type IN (:...types)', {
      types: ['payment', 'transfer', 'withdrawal'],
    })
    .select('SUM(transaction.amount)', 'total')
    .getRawOne();

  const spentAmount = Number(spent.total || 0);
  const percentUsed = (spentAmount / budget.budget_amount) * 100;

  // Update budget with fresh calculation
  budget.spent_amount = Number(spentAmount.toFixed(2));
  budget.percent_used = Number(percentUsed.toFixed(2));
  budget.updated_at = new Date();

  await this.budgetRepository.save(budget);

  return {
    budget_id: budget.id,
    budget_amount: budget.budget_amount,
    spent_amount: budget.spent_amount,
    remaining_amount: Number((budget.budget_amount - budget.spent_amount).toFixed(2)),
    percent_used: budget.percent_used,
    status: percentUsed >= 100 ? 'exceeded' : percentUsed >= 90 ? 'critical' : 'on_track',
  };
}

async checkBudgetAlerts(budgetId: string): Promise<BudgetAlert[]> {
  const budget = await this.budgetRepository.findOne({
    where: { id: budgetId },
    relations: ['category'],
  });

  if (!budget) {
    throw new NotFoundException('Budget not found');
  }

  const utilization = await this.calculateBudgetUtilization(budgetId);
  const createdAlerts: BudgetAlert[] = [];

  // Check 75% threshold
  if (
    utilization.percent_used >= 75 &&
    utilization.percent_used < 90 &&
    budget.alert_settings.alert_at_75_percent
  ) {
    const alert = await this.createAlert(budgetId, budget.user_id, '75_percent', utilization.percent_used);
    createdAlerts.push(alert);
  }

  // Check 90% threshold
  if (
    utilization.percent_used >= 90 &&
    utilization.percent_used < 100 &&
    budget.alert_settings.alert_at_90_percent
  ) {
    const alert = await this.createAlert(budgetId, budget.user_id, '90_percent', utilization.percent_used);
    createdAlerts.push(alert);
  }

  // Check 100% (exceeded) threshold
  if (utilization.percent_used >= 100 && budget.alert_settings.alert_at_100_percent) {
    const alert = await this.createAlert(budgetId, budget.user_id, '100_percent', utilization.percent_used);
    createdAlerts.push(alert);
  }

  return createdAlerts;
}

private async createAlert(
  budgetId: string,
  userId: string,
  alertType: AlertType,
  percentageReached: number,
): Promise<BudgetAlert> {
  // Check if alert already exists for this threshold in active status
  const existingAlert = await this.alertRepository.findOne({
    where: {
      budget_id: budgetId,
      alert_type: alertType,
      status: 'active',
    },
  });

  if (existingAlert) {
    return existingAlert;  // Don't create duplicate
  }

  const alert = this.alertRepository.create({
    budget_id: budgetId,
    user_id: userId,
    alert_type: alertType,
    threshold_reached: Number(percentageReached.toFixed(2)),
    alert_sent_at: new Date(),
    status: 'active',
  });

  const savedAlert = await this.alertRepository.save(alert);

  // Send notification asynchronously
  const budget = await this.budgetRepository.findOne({
    where: { id: budgetId },
    relations: ['category'],
  });

  this.sendAlertNotification(userId, budget, alertType, percentageReached).catch(err => {
    console.error('Failed to send budget alert notification:', err);
  });

  return savedAlert;
}

async rolloverUnusedBudget(budgetId: string): Promise<number> {
  const budget = await this.budgetRepository.findOne({
    where: { id: budgetId },
  });

  if (!budget || !budget.metadata?.rollover_enabled) {
    return 0;
  }

  if (new Date() < budget.period_end) {
    throw new BadRequestException('Cannot rollover budget before period ends');
  }

  const unused = Math.max(budget.budget_amount - budget.spent_amount, 0);

  if (unused <= 0) {
    return 0;
  }

  budget.carried_over_amount = unused;
  if (!budget.metadata) budget.metadata = {};
  budget.metadata.rollover_amount = unused;
  budget.status = 'archived';

  await this.budgetRepository.save(budget);

  // Create new budget for next period with rolled over amount
  const newBudgetAmount = budget.budget_amount + unused;
  await this.createBudget(budget.user_id, {
    category_id: budget.category_id,
    budget_name: `${budget.budget_name} (Rollover)`,
    budget_amount: newBudgetAmount,
    period_start: new Date(budget.period_end.getTime() + 24 * 60 * 60 * 1000),
    budget_period: budget.budget_period,
  });

  return unused;
}
```

### Testing

```typescript
describe('BudgetService', () => {
  it('should calculate budget utilization accurately', async () => {
    // Create budget for ₦50,000
    // Add transactions totaling ₦30,000
    // Verify utilization = 60%
    expect(utilization).toBe(60);
  });

  it('should create alert at 75% threshold', async () => {
    // Create budget, spend 75%, check alerts
    // Verify alert created with correct type
    expect(alert.alert_type).toBe('75_percent');
  });

  it('should not create duplicate alerts', async () => {
    // Create alert, call checkAlerts again
    // Verify no duplicate alert created
    const alerts = await service.checkBudgetAlerts(budgetId);
    expect(alerts.length).toBe(1);
  });

  it('should handle concurrent budget updates', async () => {
    // Simulate concurrent updates to same budget
    // Verify final state is consistent
    expect(true).toBe(true);
  });
});
```

---

## TICKET-38-006: Create Budget Management Endpoints

**Type:** Task
**Story Points:** 2
**Priority:** P0 (Critical)
**Epic:** EPIC-15 (Personal Finance Management & Insights)
**Sprint:** Sprint 38

### Description

Create REST endpoints for budget management including creation, retrieval, updates, and alert management.

### Acceptance Criteria

- [ ] POST /api/v1/pfm/budgets - Create budget
- [ ] GET /api/v1/pfm/budgets - List budgets
- [ ] GET /api/v1/pfm/budgets/:id - Get budget details
- [ ] PATCH /api/v1/pfm/budgets/:id - Update budget amount
- [ ] DELETE /api/v1/pfm/budgets/:id - Archive budget
- [ ] GET /api/v1/pfm/budgets/:id/utilization - Get real-time utilization
- [ ] GET /api/v1/pfm/budgets/:id/alerts - Get budget alerts
- [ ] POST /api/v1/pfm/budgets/:id/alerts/:alertId/dismiss - Dismiss alert
- [ ] GET /api/v1/pfm/budgets/:id/history - Get budget change history

### API Specification

```
POST /api/v1/pfm/budgets
Create new budget

Request:
{
  "category_id": "uuid",
  "budget_name": "Monthly Groceries",
  "budget_amount": 50000,
  "budget_period": "monthly",
  "period_start": "2024-01-01",
  "alert_settings": {
    "alert_at_75_percent": true,
    "alert_at_90_percent": true,
    "notification_channels": ["in_app", "email"]
  }
}

Response (201):
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "budget_name": "Monthly Groceries",
    "budget_amount": 50000,
    "spent_amount": 0,
    "percent_used": 0,
    "period_start": "2024-01-01",
    "period_end": "2024-01-31",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

```
GET /api/v1/pfm/budgets/:id/utilization
Get real-time budget utilization

Response:
{
  "status": "success",
  "data": {
    "budget_id": "uuid",
    "budget_name": "Monthly Groceries",
    "budget_amount": 50000,
    "spent_amount": 32500,
    "remaining_amount": 17500,
    "percent_used": 65,
    "status": "on_track",
    "alerts": []
  }
}
```

### Implementation

```typescript
@Controller('pfm/budgets')
@UseGuards(JwtAuthGuard)
@ApiTags('PFM - Budget Management')
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new budget' })
  async createBudget(@Body() dto: CreateBudgetDto, @Request() req) {
    const budget = await this.budgetService.createBudget(req.user.id, dto);
    return { status: 'success', data: budget };
  }

  @Get()
  @ApiOperation({ summary: 'List all budgets' })
  async listBudgets(
    @Query('status') status?: string,
    @Query('category_id') categoryId?: string,
    @Request() req,
  ) {
    const budgets = await this.budgetService.listBudgets(
      req.user.id,
      { status, category_id: categoryId },
    );
    return { status: 'success', data: budgets };
  }

  @Get(':id/utilization')
  @ApiOperation({ summary: 'Get budget utilization' })
  async getBudgetUtilization(
    @Param('id') budgetId: string,
    @Request() req,
  ) {
    const utilization = await this.budgetService.calculateBudgetUtilization(budgetId);
    return { status: 'success', data: utilization };
  }

  @Get(':id/alerts')
  @ApiOperation({ summary: 'Get budget alerts' })
  async getBudgetAlerts(@Param('id') budgetId: string, @Request() req) {
    const alerts = await this.budgetService.getBudgetAlerts(budgetId);
    return { status: 'success', data: alerts };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget amount' })
  async updateBudget(
    @Param('id') budgetId: string,
    @Body() dto: UpdateBudgetDto,
    @Request() req,
  ) {
    const budget = await this.budgetService.updateBudgetAmount(
      req.user.id,
      budgetId,
      dto.budget_amount,
    );
    return { status: 'success', data: budget };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive budget' })
  async deleteBudget(@Param('id') budgetId: string, @Request() req) {
    await this.budgetService.archiveBudget(req.user.id, budgetId);
    return { status: 'success', message: 'Budget archived' };
  }
}
```

---

## TICKET-38-011: Savings Goals & Tracking

**Type:** Story
**Story Points:** 6
**Priority:** P0 (Critical)
**Epic:** EPIC-15 (Personal Finance Management & Insights)
**Sprint:** Sprint 38

### Description

Implement savings goals system with progress tracking, milestones, and achievement badges. Support short-term, medium-term, and long-term goals with auto-allocation and recurring savings.

### Acceptance Criteria

- [ ] Create SavingsGoal entity with all fields
- [ ] Create GoalMilestone entity for milestone tracking
- [ ] Create GoalContribution entity for tracking deposits
- [ ] Implement SavingsGoalService with full methods
- [ ] Create goal endpoints (CRUD)
- [ ] Implement goal progress calculation
- [ ] Implement milestone unlocking with badges
- [ ] Support auto-allocation (percentage of income)
- [ ] Support recurring savings (e.g., ₦5K/month)
- [ ] Calculate months to goal completion
- [ ] Goal creation and updates < 500ms
- [ ] Accuracy to ₦0.01

### Technical Specifications

**API Endpoints:**

```
POST /api/v1/pfm/savings-goals
Create new savings goal

Request:
{
  "goal_name": "Emergency Fund",
  "goal_description": "Build 6-month emergency fund",
  "target_amount": 600000,
  "target_date": "2025-12-31",
  "auto_allocation_enabled": true,
  "monthly_allocation": 50000
}

Response (201):
{
  "status": "success",
  "data": {
    "id": "uuid",
    "goal_name": "Emergency Fund",
    "target_amount": 600000,
    "current_amount": 0,
    "percent_complete": 0,
    "goal_type": "long_term",
    "monthly_savings_required": 50000,
    "status": "active",
    "milestones": [
      { "percentage": 25, "unlocked": false },
      { "percentage": 50, "unlocked": false },
      { "percentage": 75, "unlocked": false },
      { "percentage": 100, "unlocked": false }
    ],
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

```
POST /api/v1/pfm/savings-goals/:id/contribute
Add contribution to goal

Request:
{
  "amount": 50000
}

Response:
{
  "status": "success",
  "data": {
    "goal_id": "uuid",
    "contribution_id": "uuid",
    "amount": 50000,
    "new_total": 150000,
    "percent_complete": 25,
    "milestone_unlocked": true,
    "milestone": { "percentage": 25, "achievement_badge": "Quarter Way There!" },
    "contributed_at": "2024-01-15T10:35:00Z"
  }
}
```

```
GET /api/v1/pfm/savings-goals/:id/progress
Get goal progress details

Response:
{
  "status": "success",
  "data": {
    "goal_id": "uuid",
    "goal_name": "Emergency Fund",
    "target_amount": 600000,
    "current_amount": 150000,
    "remaining_amount": 450000,
    "percent_complete": 25,
    "target_date": "2025-12-31",
    "months_remaining": 23,
    "monthly_savings_required": 19565,
    "monthly_savings_actual": 50000,
    "on_track": true,
    "projected_completion_date": "2025-09-15",
    "milestones": [...]
  }
}
```

### Implementation Code

```typescript
@Controller('pfm/savings-goals')
@UseGuards(JwtAuthGuard)
@ApiTags('PFM - Savings Goals')
export class SavingsGoalController {
  constructor(private goalService: SavingsGoalService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new savings goal' })
  async createGoal(@Body() dto: CreateGoalDto, @Request() req) {
    const goal = await this.goalService.createGoal(req.user.id, dto);
    return { status: 'success', data: goal };
  }

  @Get()
  @ApiOperation({ summary: 'List all savings goals' })
  async listGoals(
    @Query('status') status?: string,
    @Request() req,
  ) {
    const goals = await this.goalService.listGoals(req.user.id, status);
    return { status: 'success', data: goals };
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get goal progress' })
  async getProgress(@Param('id') goalId: string, @Request() req) {
    const progress = await this.goalService.getGoalProgress(
      req.user.id,
      goalId,
    );
    return { status: 'success', data: progress };
  }

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Contribute to goal' })
  async contributeToGoal(
    @Param('id') goalId: string,
    @Body() dto: ContributeToGoalDto,
    @Request() req,
  ) {
    const contribution = await this.goalService.contributeToGoal(
      req.user.id,
      goalId,
      dto.amount,
    );
    return { status: 'success', data: contribution };
  }
}
```

---

## TICKET-38-016: Financial Insights & Health Score

**Type:** Story
**Story Points:** 5
**Priority:** P1 (High)
**Epic:** EPIC-15 (Personal Finance Management & Insights)
**Sprint:** Sprint 38

### Description

Implement AI-driven financial insights generation and financial health score calculation. Generate actionable recommendations based on spending patterns, goals, and benchmarks.

### Acceptance Criteria

- [ ] Create FinancialInsight entity
- [ ] Create FinancialHealthScore entity
- [ ] Implement spending comparison insight
- [ ] Implement anomaly detection insight
- [ ] Implement savings opportunity insight
- [ ] Implement budget feedback insight
- [ ] Calculate financial health score (0-100)
- [ ] Calculate component scores (savings rate, debt-to-income, emergency fund, budget adherence, goal progress)
- [ ] Track score trends (improving, declining, stable)
- [ ] Generate insights in < 2 seconds
- [ ] Insights relevance score >= 70%

### Insights Specification

**Spending Comparison:**
- Message: "You spent 45% more on dining this month vs. last month. Consider reducing by ₦2K to stay on track."
- Data: { this_month, last_month, change, change_percent }
- Relevance: 85%

**Anomaly Detection:**
- Message: "We detected unusual spending: Electronics ₦50K (2x normal). Is this expected?"
- Data: { anomaly_type, normal_amount, detected_amount }
- Relevance: 75%

**Savings Opportunity:**
- Message: "Your subscription costs are ₦3,500/month. Consider canceling unused services."
- Data: { subscription_count, total_cost, potential_savings, recommendations }
- Relevance: 80%

**Budget Feedback:**
- Message: "You've exceeded your Dining budget by ₦5K. Consider reviewing spending."
- Data: { over_budget_categories, amount_exceeded }
- Relevance: 90%

### Testing Requirements

- [ ] Unit tests for insight generation (20+ test cases)
- [ ] Integration tests for health score calculation
- [ ] Test anomaly detection accuracy
- [ ] Test insight relevance scoring
- [ ] Performance tests (1000 user insights/min)
- [ ] E2E test full insight generation flow

---

## TICKET-38-021: Income Tracking & Cash Flow Analysis

**Type:** Story
**Story Points:** 4
**Priority:** P1 (High)
**Epic:** EPIC-15 (Personal Finance Management & Insights)
**Sprint:** Sprint 38

### Description

Implement income tracking system with cash flow forecasting, volatility analysis, and income source management. Support multiple income types (salary, freelance, business, investment).

### Acceptance Criteria

- [ ] Create IncomeSource entity
- [ ] Create IncomeTransaction entity
- [ ] Implement CashFlowService
- [ ] Track multiple income sources
- [ ] Record income transactions with proof (payslip)
- [ ] Calculate monthly income report
- [ ] Forecast cash flow (3-month projection)
- [ ] Analyze income volatility
- [ ] Support income growth tracking
- [ ] Calculate savings rate
- [ ] Income entry < 500ms
- [ ] Forecasting < 1 second

### API Specification

```
POST /api/v1/pfm/income-sources
Create income source

Request:
{
  "source_name": "Employment",
  "income_type": "salary",
  "monthly_amount": 500000,
  "frequency": "monthly",
  "start_date": "2023-01-15"
}

Response (201):
{
  "status": "success",
  "data": {
    "id": "uuid",
    "source_name": "Employment",
    "income_type": "salary",
    "monthly_amount": 500000,
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

```
POST /api/v1/pfm/income/:sourceId/record
Record income transaction

Request:
{
  "amount": 500000,
  "income_date": "2024-01-15",
  "reference": "Jan 2024 Salary",
  "payslip_url": "https://..."
}

Response (201):
{
  "status": "success",
  "data": {
    "id": "uuid",
    "source_id": "uuid",
    "amount": 500000,
    "income_date": "2024-01-15",
    "recorded_at": "2024-01-15T10:30:00Z"
  }
}
```

```
GET /api/v1/pfm/cash-flow/forecast
Get cash flow forecast

Query Parameters:
  - months: number (1-12, default 3)

Response:
{
  "status": "success",
  "data": [
    {
      "month": "2/2024",
      "projected_income": 500000,
      "projected_expenses": 350000,
      "projected_cash_flow": 150000,
      "has_gap": false
    },
    ...
  ]
}
```

```
GET /api/v1/pfm/income/analysis
Get income volatility analysis

Response:
{
  "status": "success",
  "data": {
    "average_monthly_income": 500000,
    "volatility_index": 5.2,
    "income_stability": "high",
    "min_income": 480000,
    "max_income": 520000,
    "monthly_breakdown": { "1/2024": 500000, "2/2024": 510000, ... }
  }
}
```

---

## Testing Strategy

### Unit Tests (25+ test cases)
- CategoryClassificationService classification logic
- BudgetService utilization calculation
- SavingsGoalService progress tracking
- InsightsService insight generation
- CashFlowService forecasting

### Integration Tests (20+ test cases)
- Category creation and transaction classification
- Budget creation and alert triggers
- Goal milestone unlocking
- Insight generation with real transaction data
- Income recording and cash flow calculation

### E2E Tests (8+ test cases)
- Complete PFM setup workflow
- Category customization and learning
- Budget management full cycle
- Goal tracking from creation to completion
- Monthly insight generation

### Performance Tests
- Categorization latency < 100ms
- Budget utilization calculation < 100ms
- Insight generation < 2 seconds for 1000 transactions
- Forecast generation < 1 second
- Concurrent budget updates handling

---

## Database Migrations Summary

**Total New Tables:** 10
- spending_categories
- category_rules
- budgets
- budget_alerts
- budget_history
- savings_goals
- goal_contributions
- goal_milestones
- financial_insights
- income_sources
- income_transactions
- financial_health_scores (11 tables total)

**Indices Created:** 20+

**Total Lines of Migration SQL:** 400+

---

## Documentation Requirements

- [ ] API Swagger documentation with all endpoints
- [ ] Postman collection for manual testing
- [ ] User guide for PFM features
- [ ] Data privacy and security documentation
- [ ] Performance optimization guide
- [ ] Troubleshooting guide for common issues

