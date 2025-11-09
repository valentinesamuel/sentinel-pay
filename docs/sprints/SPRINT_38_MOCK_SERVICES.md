# Sprint 38 Mock Services - Personal Finance Management

**Sprint:** Sprint 38
**Focus:** ML-based categorization and AI-driven insights generation
**Mock Services:** 2 primary

---

## Overview

These mocks simulate:
- **Transaction Categorizer:** ML model for category classification with confidence scores
- **Insight Generator:** AI-driven financial recommendations based on spending patterns
- **Realistic Behavior:** Variable accuracy (90-95%), confidence scores, edge cases
- **Performance:** Processing time 100-500ms per transaction
- **Partial Failures:** Some categorizations uncertain, fallback to default

---

## 1. Transaction Categorizer ML Mock

### Purpose
Simulate machine learning-based transaction categorization with confidence scores

### Realistic Behavior
- **Accuracy:** 92-95% on standard categories
- **Confidence Scores:** 0-100 range, lower for ambiguous transactions
- **Latency:** 50-200ms per transaction, 100-300ms for batch
- **Uncertainty:** Some transactions marked as low confidence requiring manual review
- **Learning:** Improve confidence after user corrections

### Implementation

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';

interface CategoryPrediction {
  predictionId: string;
  transactionId: string;
  description: string;
  amount: number;
  merchant: string;
  predictedCategory: string;
  predictedSubcategory: string;
  confidence: number; // 0-100
  alternativeCategories: Array<{ category: string; probability: number }>;
  features: {
    keywords: string[];
    merchant_type: string;
    amount_range: string;
    time_of_day: string;
    is_recurring: boolean;
  };
  requiresReview: boolean;
  predictionTime: number; // milliseconds
  createdAt: Date;
}

@Injectable()
export class TransactionCategorizerMock {
  private predictionStore: Map<string, CategoryPrediction> = new Map();
  private merchantPatterns: Map<string, string> = new Map();
  private userFeedback: Map<string, number> = new Map(); // Track correction rate
  private readonly MODEL_ACCURACY = 0.93; // 93% base accuracy

  private readonly CATEGORY_KEYWORDS = {
    groceries: [
      'tesco',
      'sainsburys',
      'asda',
      'waitrose',
      'jumia',
      'markets',
      'supermarket',
      'food',
    ],
    dining: [
      'restaurant',
      'pizza',
      'burger',
      'cafe',
      'coffee',
      'food delivery',
      'uber eats',
      'glovo',
    ],
    transport: [
      'uber',
      'bolt',
      'taxi',
      'fuel',
      'petrol',
      'parking',
      'transport',
      'tfl',
    ],
    utilities: [
      'electricity',
      'water',
      'gas',
      'internet',
      'phone',
      'dstv',
      'gotv',
      'startimes',
    ],
    entertainment: [
      'cinema',
      'netflix',
      'spotify',
      'gaming',
      'concert',
      'theater',
      'youtube',
      'disney',
    ],
    shopping: [
      'amazon',
      'ebay',
      'zara',
      'hm',
      'fashion',
      'clothes',
      'mall',
      'boutique',
    ],
    health: [
      'pharmacy',
      'hospital',
      'doctor',
      'clinic',
      'medical',
      'healthcare',
      'wellness',
    ],
    fitness: [
      'gym',
      'fitness',
      'yoga',
      'sports',
      'training',
      'workout',
      'sports',
    ],
    subscriptions: [
      'subscription',
      'membership',
      'recurring',
      'monthly',
      'annual',
    ],
  };

  async predictCategory(
    transactionId: string,
    description: string,
    amount: number,
    merchant: string,
  ): Promise<CategoryPrediction> {
    const startTime = Date.now();

    // Simulate processing latency
    const latency = Math.random() * 150 + 50; // 50-200ms
    await new Promise((resolve) => setTimeout(resolve, latency));

    // Extract features
    const features = this.extractFeatures(description, merchant, amount);

    // Get cached pattern if exists
    let cachedCategory = this.merchantPatterns.get(merchant.toLowerCase());

    // Predict category
    let predictedCategory = cachedCategory || this.predictCategory_(description, features);
    let confidence = this.calculateConfidence(description, merchant, predictedCategory);

    // Apply user correction history
    const correctionRate = this.userFeedback.get(`${merchant}-${predictedCategory}`) || 0;
    confidence = Math.max(confidence * (1 - correctionRate * 0.1), 20); // Reduce confidence if user frequently corrects

    // Get alternatives
    const alternatives = this.getAlternativeCategories(description, predictedCategory);

    // Determine if requires review (low confidence or ambiguous)
    const requiresReview = confidence < 70 || this.isAmbiguous(description);

    const prediction: CategoryPrediction = {
      predictionId: `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      transactionId,
      description,
      amount,
      merchant,
      predictedCategory,
      predictedSubcategory: this.getSubcategory(predictedCategory, description),
      confidence: Math.round(confidence),
      alternativeCategories: alternatives,
      features,
      requiresReview,
      predictionTime: Date.now() - startTime,
      createdAt: new Date(),
    };

    this.predictionStore.set(prediction.predictionId, prediction);

    // Cache merchant-category mapping
    this.merchantPatterns.set(merchant.toLowerCase(), predictedCategory);

    return prediction;
  }

  async batchCategorize(
    transactions: Array<{ id: string; description: string; amount: number; merchant: string }>,
  ): Promise<{
    predictions: CategoryPrediction[];
    totalTime: number;
    accuracy: number;
  }> {
    const startTime = Date.now();
    const predictions: CategoryPrediction[] = [];
    const batchLatency = Math.random() * 200 + 100; // 100-300ms total

    // Simulate batch processing
    await new Promise((resolve) => setTimeout(resolve, batchLatency));

    for (const txn of transactions) {
      const prediction = await this.predictCategory(txn.id, txn.description, txn.amount, txn.merchant);
      predictions.push(prediction);
    }

    const avgConfidence =
      predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

    return {
      predictions,
      totalTime: Date.now() - startTime,
      accuracy: Math.round(avgConfidence),
    };
  }

  async provideFeedback(
    predictionId: string,
    correctCategory: string,
  ): Promise<{ updated: boolean; newConfidence: number }> {
    const prediction = this.predictionStore.get(predictionId);
    if (!prediction) {
      throw new BadRequestException('Prediction not found');
    }

    const was Correct = prediction.predictedCategory === correctCategory;

    // Track feedback for learning
    const key = `${prediction.merchant}-${prediction.predictedCategory}`;
    const currentRate = this.userFeedback.get(key) || 0;
    this.userFeedback.set(key, wasCorrect ? Math.max(currentRate - 0.05, 0) : Math.min(currentRate + 0.1, 0.5));

    // Improve confidence on future predictions for this merchant
    if (wasCorrect) {
      // Boost merchant pattern confidence
      this.merchantPatterns.set(prediction.merchant.toLowerCase(), correctCategory);
    } else {
      // Remove pattern if incorrect
      this.merchantPatterns.delete(prediction.merchant.toLowerCase());
    }

    const newConfidence = Math.min(prediction.confidence + 10, 100);

    return {
      updated: true,
      newConfidence,
    };
  }

  private predictCategory_(description: string, features: any): string {
    const desc = description.toLowerCase();

    // Rule-based matching
    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      for (const keyword of keywords as string[]) {
        if (desc.includes(keyword)) {
          return category;
        }
      }
    }

    // Default to shopping if amount indicates purchase
    if (features.amount_range === 'medium' || features.amount_range === 'large') {
      return 'shopping';
    }

    return 'other';
  }

  private calculateConfidence(description: string, merchant: string, category: string): number {
    let confidence = 50 + Math.random() * 40; // Base: 50-90

    // Boost confidence for known patterns
    if (this.merchantPatterns.has(merchant.toLowerCase())) {
      confidence += 15;
    }

    // Boost for clear keywords
    const desc = description.toLowerCase();
    if (this.CATEGORY_KEYWORDS[category]) {
      const matchCount = (this.CATEGORY_KEYWORDS[category] as string[]).filter((k) =>
        desc.includes(k),
      ).length;
      confidence += matchCount * 5;
    }

    // Reduce for ambiguous descriptions
    if (description.length < 10) {
      confidence -= 15;
    }

    return Math.min(Math.max(confidence, 10), 99); // Clamp 10-99
  }

  private getAlternativeCategories(
    description: string,
    primaryCategory: string,
  ): Array<{ category: string; probability: number }> {
    const alternatives: Array<{ category: string; probability: number }> = [];
    const desc = description.toLowerCase();

    // Generate alternatives based on partial matches
    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      if (category === primaryCategory) continue;

      const matchCount = (keywords as string[]).filter((k) => desc.includes(k)).length;
      if (matchCount > 0) {
        alternatives.push({
          category,
          probability: Math.round((matchCount / (keywords as string[]).length) * 100),
        });
      }
    }

    // Sort by probability and return top 3
    return alternatives
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
  }

  private extractFeatures(description: string, merchant: string, amount: number): any {
    const keywords = description.toLowerCase().split(/\s+/);
    const timeOfDay = this.getTimeOfDay();
    const amountRange = this.getAmountRange(amount);

    return {
      keywords,
      merchant_type: merchant,
      amount_range: amountRange,
      time_of_day: timeOfDay,
      is_recurring: this.checkIfRecurring(description),
    };
  }

  private getSubcategory(category: string, description: string): string {
    const desc = description.toLowerCase();

    const subcategoryMap = {
      groceries: {
        'whole foods': 'organic',
        'markets': 'farmers market',
        'tesco': 'supermarket',
      },
      dining: {
        'pizza': 'italian',
        'burger': 'fast food',
        'cafe': 'coffee',
      },
      shopping: {
        'amazon': 'online',
        'mall': 'retail',
        'zara': 'fashion',
      },
    };

    if (subcategoryMap[category]) {
      for (const [keyword, subcategory] of Object.entries(subcategoryMap[category])) {
        if (desc.includes(keyword)) {
          return subcategory;
        }
      }
    }

    return category;
  }

  private isAmbiguous(description: string): boolean {
    // Very generic descriptions are ambiguous
    const ambiguousKeywords = ['transfer', 'payment', 'charge', 'debit', 'generic'];
    return ambiguousKeywords.some((k) => description.toLowerCase().includes(k));
  }

  private checkIfRecurring(description: string): boolean {
    const recurringKeywords = ['subscription', 'monthly', 'annual', 'recurring', 'membership'];
    return recurringKeywords.some((k) => description.toLowerCase().includes(k));
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private getAmountRange(amount: number): string {
    if (amount < 5000) return 'small';
    if (amount < 50000) return 'medium';
    if (amount < 200000) return 'large';
    return 'very_large';
  }

  getMetrics(): {
    totalPredictions: number;
    averageConfidence: number;
    lowConfidenceCount: number;
    requiresReviewCount: number;
    averagePredictionTime: number;
  } {
    const predictions = Array.from(this.predictionStore.values());
    const avgConfidence =
      predictions.length > 0
        ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
        : 0;
    const lowConfidence = predictions.filter((p) => p.confidence < 70).length;
    const requiresReview = predictions.filter((p) => p.requiresReview).length;
    const avgTime =
      predictions.length > 0
        ? predictions.reduce((sum, p) => sum + p.predictionTime, 0) / predictions.length
        : 0;

    return {
      totalPredictions: predictions.length,
      averageConfidence: Math.round(avgConfidence),
      lowConfidenceCount: lowConfidence,
      requiresReviewCount: requiresReview,
      averagePredictionTime: Math.round(avgTime),
    };
  }
}
```

---

## 2. Financial Insights Generator Mock

### Purpose
Simulate AI-driven financial insight generation with personalized recommendations

### Realistic Behavior
- **Insight Accuracy:** 85-95% relevance
- **Latency:** 200-600ms per insight batch
- **Relevance Scoring:** 0-100 range
- **Personalization:** Based on spending patterns and goals
- **Confidence:** Some insights marked as low confidence

### Implementation

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';

interface FinancialInsight {
  insightId: string;
  userId: string;
  insightType: string;
  title: string;
  message: string;
  category: string;
  relevance: number; // 0-100
  estimatedSavings?: number;
  actionItems?: string[];
  supportingData: any;
  confidence: number;
  requiredData: string[]; // What data this insight is based on
  createdAt: Date;
}

@Injectable()
export class InsightGeneratorMock {
  private insightStore: Map<string, FinancialInsight> = new Map();

  async generateInsights(
    userId: string,
    spendingData: {
      totalSpending: number;
      categoryBreakdown: Record<string, number>;
      lastMonthSpending: number;
      thisMonthSpending: number;
      savingsGoals: any[];
      budget: Record<string, number>;
      transactions: any[];
    },
  ): Promise<FinancialInsight[]> {
    const startTime = Date.now();
    const insights: FinancialInsight[] = [];

    // Simulate AI processing latency
    const processingLatency = Math.random() * 400 + 200; // 200-600ms
    await new Promise((resolve) => setTimeout(resolve, processingLatency));

    // Generate spending comparison insight
    if (spendingData.thisMonthSpending && spendingData.lastMonthSpending) {
      insights.push(this.generateSpendingComparisonInsight(userId, spendingData));
    }

    // Generate savings opportunity insight
    const savingsInsight = this.generateSavingsOpportunityInsight(userId, spendingData);
    if (savingsInsight) {
      insights.push(savingsInsight);
    }

    // Generate budget feedback
    insights.push(this.generateBudgetFeedbackInsight(userId, spendingData));

    // Generate goal progress insight
    if (spendingData.savingsGoals && spendingData.savingsGoals.length > 0) {
      insights.push(this.generateGoalProgressInsight(userId, spendingData));
    }

    // Generate personalized recommendation
    const recommendation = this.generatePersonalizedRecommendation(userId, spendingData);
    if (recommendation) {
      insights.push(recommendation);
    }

    // Store insights
    for (const insight of insights) {
      this.insightStore.set(insight.insightId, insight);
    }

    return insights;
  }

  private generateSpendingComparisonInsight(
    userId: string,
    spendingData: any,
  ): FinancialInsight {
    const change = spendingData.thisMonthSpending - spendingData.lastMonthSpending;
    const changePercent = ((change / spendingData.lastMonthSpending) * 100).toFixed(1);
    const direction = change > 0 ? 'increased' : 'decreased';

    const relevance = Math.abs(change) > spendingData.lastMonthSpending * 0.2 ? 90 : 70;

    const insight: FinancialInsight = {
      insightId: `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      insightType: 'spending_comparison',
      title: 'Monthly Spending Change',
      message:
        change > 0
          ? `Your spending ${direction} by ${changePercent}% this month (₦${Math.abs(change).toLocaleString()}). Consider reviewing discretionary expenses.`
          : `Great! Your spending ${direction} by ${changePercent}% this month (₦${Math.abs(change).toLocaleString()}) compared to last month.`,
      category: 'spending_analysis',
      relevance,
      estimatedSavings: change > 0 ? change : undefined,
      supportingData: {
        thisMonth: spendingData.thisMonthSpending,
        lastMonth: spendingData.lastMonthSpending,
        change,
        changePercent,
      },
      confidence: 95,
      requiredData: ['last month spending', 'this month spending'],
      createdAt: new Date(),
    };

    return insight;
  }

  private generateSavingsOpportunityInsight(
    userId: string,
    spendingData: any,
  ): FinancialInsight | null {
    // Check for subscriptions
    const subscriptions = spendingData.transactions?.filter(
      (t) =>
        t.description.toLowerCase().includes('subscription') ||
        t.description.toLowerCase().includes('membership'),
    ) || [];

    if (subscriptions.length === 0) {
      return null;
    }

    const monthlySubscriptionCost = subscriptions.reduce((sum, s) => sum + s.amount, 0);
    const potentialSavings = Math.round(monthlySubscriptionCost * 0.2); // Assume 20% can be cut

    const insight: FinancialInsight = {
      insightId: `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      insightType: 'savings_opportunity',
      title: 'Subscription Cost Reduction',
      message: `You have ${subscriptions.length} active subscriptions costing ₦${monthlySubscriptionCost.toLocaleString()}/month. Review unused services to save up to ₦${potentialSavings.toLocaleString()}/month.`,
      category: 'cost_optimization',
      relevance: 85,
      estimatedSavings: potentialSavings,
      actionItems: ['Review active subscriptions', 'Cancel unused services', 'Compare pricing'],
      supportingData: {
        subscriptionCount: subscriptions.length,
        monthlyCost: monthlySubscriptionCost,
        potentialSavings,
      },
      confidence: 82,
      requiredData: ['subscription transactions'],
      createdAt: new Date(),
    };

    return insight;
  }

  private generateBudgetFeedbackInsight(userId: string, spendingData: any): FinancialInsight {
    const budgetCategories = Object.entries(spendingData.budget || {});
    const overBudget = budgetCategories.filter(
      ([category, limit]) => (spendingData.categoryBreakdown[category] || 0) > (limit as number),
    );

    let message = 'You are within budget for all categories. Excellent financial discipline!';
    let title = 'Budget Status: On Track';
    let relevance = 70;

    if (overBudget.length > 0) {
      const overCategory = overBudget[0][0];
      const exceeded = (spendingData.categoryBreakdown[overCategory] || 0) - (overBudget[0][1] as number);
      message = `Your ${overCategory} spending exceeded budget by ₦${exceeded.toLocaleString()}. Consider adjusting your budget or reducing expenses.`;
      title = 'Budget Alert: Over Budget';
      relevance = 90;
    }

    const insight: FinancialInsight = {
      insightId: `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      insightType: 'budget_feedback',
      title,
      message,
      category: 'budget_management',
      relevance,
      supportingData: {
        overBudgetCategories: overBudget.map(([cat, limit]) => ({
          category: cat,
          limit,
          actual: spendingData.categoryBreakdown[cat],
        })),
      },
      confidence: 92,
      requiredData: ['budget data', 'category spending'],
      createdAt: new Date(),
    };

    return insight;
  }

  private generateGoalProgressInsight(userId: string, spendingData: any): FinancialInsight {
    const goal = spendingData.savingsGoals[0]; // Use first goal
    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
    const monthsRemaining = goal.monthsToGoal || 12;

    const insight: FinancialInsight = {
      insightId: `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      insightType: 'goal_progress',
      title: `Progress: ${goal.goalName}`,
      message:
        progressPercent >= 50
          ? `You're ${progressPercent.toFixed(0)}% towards your ${goal.goalName} goal. At your current savings rate, you'll reach it in ${monthsRemaining} months!`
          : `You've saved ₦${goal.currentAmount.toLocaleString()} towards your ${goal.goalName} goal (₦${goal.targetAmount.toLocaleString()}). Keep saving!`,
      category: 'goal_tracking',
      relevance: 88,
      supportingData: {
        goalName: goal.goalName,
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
        progressPercent: progressPercent.toFixed(1),
        monthsToGoal: monthsRemaining,
      },
      confidence: 85,
      requiredData: ['savings goals', 'contribution history'],
      createdAt: new Date(),
    };

    return insight;
  }

  private generatePersonalizedRecommendation(
    userId: string,
    spendingData: any,
  ): FinancialInsight | null {
    // Analyze spending patterns for recommendations
    const categoryBreakdown = spendingData.categoryBreakdown || {};
    const diningSpending = categoryBreakdown.dining || 0;
    const totalSpending = spendingData.thisMonthSpending || 1;

    if ((diningSpending / totalSpending) * 100 > 20) {
      // More than 20% on dining
      const savingsPotential = diningSpending * 0.2;

      const insight: FinancialInsight = {
        insightId: `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        userId,
        insightType: 'personalized_recommendation',
        title: 'Dining Expense Optimization',
        message: `You've spent ₦${diningSpending.toLocaleString()} on dining this month (${((diningSpending / totalSpending) * 100).toFixed(0)}% of budget). Cooking at home more could save ₦${savingsPotential.toLocaleString()}/month.`,
        category: 'spending_optimization',
        relevance: 80,
        estimatedSavings: Math.round(savingsPotential),
        actionItems: ['Plan meals ahead', 'Cook at home', 'Pack lunch to work'],
        supportingData: {
          diningSpending,
          percentageOfTotal: ((diningSpending / totalSpending) * 100).toFixed(1),
          savingsPotential: Math.round(savingsPotential),
        },
        confidence: 78,
        requiredData: ['dining transaction history'],
        createdAt: new Date(),
      };

      return insight;
    }

    return null;
  }

  async getInsight(insightId: string): Promise<FinancialInsight> {
    const insight = this.insightStore.get(insightId);
    if (!insight) {
      throw new BadRequestException('Insight not found');
    }
    return insight;
  }

  getMetrics(): {
    totalInsights: number;
    averageRelevance: number;
    averageConfidence: number;
    insightTypeDistribution: Record<string, number>;
  } {
    const insights = Array.from(this.insightStore.values());

    const avgRelevance =
      insights.length > 0 ? insights.reduce((sum, i) => sum + i.relevance, 0) / insights.length : 0;

    const avgConfidence =
      insights.length > 0 ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length : 0;

    const distribution: Record<string, number> = {};
    insights.forEach((i) => {
      distribution[i.insightType] = (distribution[i.insightType] || 0) + 1;
    });

    return {
      totalInsights: insights.length,
      averageRelevance: Math.round(avgRelevance),
      averageConfidence: Math.round(avgConfidence),
      insightTypeDistribution: distribution,
    };
  }
}
```

---

## Integration Test Example

```typescript
describe('PFM ML and Insights', () => {
  let categorizerMock: TransactionCategorizerMock;
  let insightsGeneratorMock: InsightGeneratorMock;

  beforeEach(() => {
    categorizerMock = new TransactionCategorizerMock();
    insightsGeneratorMock = new InsightGeneratorMock();
  });

  it('should categorize transaction with confidence score', async () => {
    const prediction = await categorizerMock.predictCategory(
      'txn-001',
      'Tesco Grocery Store',
      5000,
      'Tesco',
    );

    expect(prediction.predictedCategory).toBe('groceries');
    expect(prediction.confidence).toBeGreaterThan(70);
    expect(prediction.confidence).toBeLessThanOrEqual(100);
  });

  it('should identify ambiguous transactions', async () => {
    const prediction = await categorizerMock.predictCategory(
      'txn-002',
      'Generic Transfer',
      1000,
      'Bank Transfer',
    );

    expect(prediction.requiresReview).toBe(true);
    expect(prediction.confidence).toBeLessThan(70);
  });

  it('should provide alternatives for uncertain categorization', async () => {
    const prediction = await categorizerMock.predictCategory(
      'txn-003',
      'Coffee and Books',
      2500,
      'Cafe',
    );

    expect(prediction.alternativeCategories.length).toBeGreaterThan(0);
    expect(prediction.alternativeCategories[0]).toHaveProperty('category');
    expect(prediction.alternativeCategories[0]).toHaveProperty('probability');
  });

  it('should improve confidence with user feedback', async () => {
    const prediction = await categorizerMock.predictCategory(
      'txn-004',
      'Unknown Store',
      3000,
      'Store XYZ',
    );

    const initialConfidence = prediction.confidence;

    // Provide feedback
    await categorizerMock.provideFeedback(prediction.predictionId, 'shopping');

    // Next categorization should have higher confidence
    const secondPrediction = await categorizerMock.predictCategory(
      'txn-005',
      'Store XYZ Purchase',
      2500,
      'Store XYZ',
    );

    expect(secondPrediction.confidence).toBeGreaterThanOrEqual(initialConfidence);
  });

  it('should batch categorize transactions efficiently', async () => {
    const transactions = [
      {
        id: 'txn-1',
        description: 'Tesco Supermarket',
        amount: 5000,
        merchant: 'Tesco',
      },
      { id: 'txn-2', description: 'Pizza Hut Restaurant', amount: 3000, merchant: 'Pizza Hut' },
      { id: 'txn-3', description: 'Uber Taxi', amount: 2000, merchant: 'Uber' },
      { id: 'txn-4', description: 'Netflix Subscription', amount: 1500, merchant: 'Netflix' },
    ];

    const result = await categorizerMock.batchCategorize(transactions);

    expect(result.predictions.length).toBe(4);
    expect(result.accuracy).toBeGreaterThan(70);
    expect(result.totalTime).toBeGreaterThan(0);
  });

  it('should generate relevant insights from spending data', async () => {
    const spendingData = {
      totalSpending: 50000,
      categoryBreakdown: {
        dining: 15000,
        groceries: 10000,
        transport: 5000,
        shopping: 20000,
      },
      lastMonthSpending: 45000,
      thisMonthSpending: 50000,
      savingsGoals: [
        {
          goalName: 'Emergency Fund',
          currentAmount: 100000,
          targetAmount: 500000,
          monthsToGoal: 40,
        },
      ],
      budget: { dining: 10000, groceries: 15000, shopping: 20000 },
      transactions: [
        { description: 'Netflix Subscription', amount: 1500 },
        { description: 'Spotify Membership', amount: 500 },
      ],
    };

    const insights = await insightsGeneratorMock.generateInsights('user-001', spendingData);

    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0]).toHaveProperty('title');
    expect(insights[0]).toHaveProperty('relevance');
    expect(insights[0]).toHaveProperty('confidence');
    expect(insights[0].confidence).toBeGreaterThan(70);
  });

  it('should identify savings opportunities from spending patterns', async () => {
    const spendingData = {
      totalSpending: 80000,
      categoryBreakdown: {
        subscriptions: 10000,
        dining: 30000,
        shopping: 40000,
      },
      lastMonthSpending: 70000,
      thisMonthSpending: 80000,
      savingsGoals: [],
      budget: {},
      transactions: [
        { description: 'Netflix Subscription', amount: 1500 },
        { description: 'Spotify Membership', amount: 500 },
        { description: 'gym membership', amount: 2000 },
      ],
    };

    const insights = await insightsGeneratorMock.generateInsights('user-002', spendingData);

    const savingsInsight = insights.find((i) => i.insightType === 'savings_opportunity');
    expect(savingsInsight).toBeDefined();
    expect(savingsInsight.estimatedSavings).toBeGreaterThan(0);
  });
});
```

