import { Transaction, TransactionCategory, MonthlyInsight, Recommendation, CategorySpending } from '../types';
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  format, 
  differenceInDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval
} from 'date-fns';

export interface SpendingPattern {
  category: TransactionCategory;
  averageAmount: number;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: 'high' | 'medium' | 'low';
}

export interface BudgetSuggestion {
  category: TransactionCategory;
  suggestedBudget: number;
  currentSpending: number;
  confidence: number;
  reasoning: string;
}

export class InsightsEngine {
  static analyzeSpendingPatterns(transactions: Transaction[]): SpendingPattern[] {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    
    // Filter transactions from last 6 months
    const recentTransactions = transactions.filter(t => 
      t.type === 'debit' && t.date >= sixMonthsAgo
    );

    // Group by category and month
    const categoryMonthlyData: { [category: string]: { [month: string]: number } } = {};
    
    recentTransactions.forEach(transaction => {
      const category = transaction.category;
      const month = format(transaction.date, 'yyyy-MM');
      
      if (!categoryMonthlyData[category]) {
        categoryMonthlyData[category] = {};
      }
      if (!categoryMonthlyData[category][month]) {
        categoryMonthlyData[category][month] = 0;
      }
      categoryMonthlyData[category][month] += transaction.amount;
    });

    return Object.entries(categoryMonthlyData).map(([category, monthlyData]) => {
      const amounts = Object.values(monthlyData);
      const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const frequency = amounts.length;

      // Calculate trend
      const sortedMonths = Object.keys(monthlyData).sort();
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      
      if (sortedMonths.length >= 3) {
        const recentAmount = monthlyData[sortedMonths[sortedMonths.length - 1]];
        const olderAmount = monthlyData[sortedMonths[0]];
        const changePercent = ((recentAmount - olderAmount) / olderAmount) * 100;
        
        if (changePercent > 15) trend = 'increasing';
        else if (changePercent < -15) trend = 'decreasing';
      }

      // Calculate seasonality (simplified)
      const variance = amounts.reduce((sum, amount) => 
        sum + Math.pow(amount - averageAmount, 2), 0) / amounts.length;
      const coefficient = Math.sqrt(variance) / averageAmount;
      
      let seasonality: 'high' | 'medium' | 'low' = 'low';
      if (coefficient > 0.5) seasonality = 'high';
      else if (coefficient > 0.3) seasonality = 'medium';

      return {
        category: category as TransactionCategory,
        averageAmount,
        frequency,
        trend,
        seasonality
      };
    });
  }

  static generateMonthlyInsights(transactions: Transaction[]): MonthlyInsight[] {
    const insights: MonthlyInsight[] = [];
    
    for (let i = 0; i < 6; i++) {
      const targetDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(targetDate);
      const monthEnd = endOfMonth(targetDate);
      
      const monthTransactions = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );

      const expenses = monthTransactions.filter(t => t.type === 'debit');
      const income = monthTransactions.filter(t => t.type === 'credit');
      
      const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

      // Find top category
      const categoryTotals: { [key: string]: number } = {};
      expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
      
      const topCategory = Object.entries(categoryTotals)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as TransactionCategory || 'Other';

      // Calculate trend compared to previous month
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      let comparedToLastMonth = 0;
      
      if (i < 5) {
        const prevMonthStart = startOfMonth(subMonths(targetDate, 1));
        const prevMonthEnd = endOfMonth(subMonths(targetDate, 1));
        const prevMonthExpenses = transactions.filter(t => 
          t.type === 'debit' && t.date >= prevMonthStart && t.date <= prevMonthEnd
        );
        const prevMonthTotal = prevMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
        
        if (prevMonthTotal > 0) {
          comparedToLastMonth = ((totalSpent - prevMonthTotal) / prevMonthTotal) * 100;
          if (comparedToLastMonth > 10) trend = 'increasing';
          else if (comparedToLastMonth < -10) trend = 'decreasing';
        }
      }

      insights.push({
        month: format(targetDate, 'MMMM yyyy'),
        totalSpent,
        totalIncome,
        topCategory,
        trend,
        comparedToLastMonth
      });
    }

    return insights;
  }

  static generateRecommendations(
    transactions: Transaction[],
    categorySpending: CategorySpending[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const patterns = this.analyzeSpendingPatterns(transactions);
    const now = new Date();
    const currentMonth = startOfMonth(now);
    
    // Current month spending
    const currentMonthTransactions = transactions.filter(t => 
      t.type === 'debit' && t.date >= currentMonth
    );
    const currentMonthSpending = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

    // 1. High spending categories
    categorySpending.forEach((category, index) => {
      if (category.percentage > 35) {
        recommendations.push({
          id: `high-category-${category.category}`,
          title: `${category.category} Spending Alert`,
          description: `${category.category} accounts for ${category.percentage.toFixed(1)}% of your spending. Consider setting a budget limit.`,
          type: 'budget',
          priority: 'high',
          category: category.category
        });
      }
    });

    // 2. Increasing spending trends
    patterns.forEach(pattern => {
      if (pattern.trend === 'increasing') {
        recommendations.push({
          id: `trend-${pattern.category}`,
          title: `Rising ${pattern.category} Costs`,
          description: `Your ${pattern.category} spending is trending upward. Review recent transactions to identify opportunities for savings.`,
          type: 'budget',
          priority: 'medium',
          category: pattern.category
        });
      }
    });

    // 3. Food delivery optimization
    const foodPattern = patterns.find(p => p.category === 'Food');
    if (foodPattern && foodPattern.frequency > 20) {
      recommendations.push({
        id: 'food-delivery-optimization',
        title: 'Food Delivery Savings',
        description: 'You order food frequently. Consider meal prep or cooking at home 2-3 times a week to save ₹3,000-5,000 monthly.',
        type: 'savings',
        priority: 'medium',
        category: 'Food'
      });
    }

    // 4. Transport optimization
    const transportTransactions = currentMonthTransactions.filter(t => t.category === 'Transport');
    const rideShareTransactions = transportTransactions.filter(t => 
      t.merchant?.toLowerCase().includes('uber') || 
      t.merchant?.toLowerCase().includes('ola') ||
      t.merchant?.toLowerCase().includes('rapido')
    );
    
    if (rideShareTransactions.length > 15) {
      recommendations.push({
        id: 'transport-optimization',
        title: 'Transportation Savings',
        description: 'Frequent ride-sharing detected. Consider public transport or monthly passes to save up to 60% on transport costs.',
        type: 'savings',
        priority: 'medium',
        category: 'Transport'
      });
    }

    // 5. Weekend spending patterns
    const weekendTransactions = currentMonthTransactions.filter(t => {
      const day = t.date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });
    const weekendSpending = weekendTransactions.reduce((sum, t) => sum + t.amount, 0);
    const weekendPercentage = (weekendSpending / currentMonthSpending) * 100;

    if (weekendPercentage > 40) {
      recommendations.push({
        id: 'weekend-spending',
        title: 'Weekend Spending Control',
        description: `${weekendPercentage.toFixed(1)}% of your spending happens on weekends. Plan weekend activities within a set budget.`,
        type: 'budget',
        priority: 'low'
      });
    }

    // 6. Subscription optimization
    const billsCategory = categorySpending.find(c => c.category === 'Bills');
    if (billsCategory) {
      const subscriptionKeywords = ['netflix', 'prime', 'spotify', 'hotstar', 'zee5'];
      const subscriptionTransactions = transactions.filter(t => 
        t.category === 'Bills' && 
        subscriptionKeywords.some(keyword => 
          t.description.toLowerCase().includes(keyword) || 
          t.merchant?.toLowerCase().includes(keyword)
        )
      );
      
      if (subscriptionTransactions.length > 5) {
        recommendations.push({
          id: 'subscription-audit',
          title: 'Subscription Audit',
          description: 'You have multiple subscriptions. Review and cancel unused ones to save ₹500-1,500 monthly.',
          type: 'savings',
          priority: 'low',
          category: 'Bills'
        });
      }
    }

    // 7. Positive reinforcement
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const lastMonthTransactions = transactions.filter(t => 
      t.type === 'debit' && t.date >= lastMonthStart && t.date <= lastMonthEnd
    );
    const lastMonthSpending = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    if (lastMonthSpending > 0 && currentMonthSpending < lastMonthSpending * 0.9) {
      recommendations.push({
        id: 'positive-trend',
        title: 'Great Progress!',
        description: `You've reduced spending by ${(((lastMonthSpending - currentMonthSpending) / lastMonthSpending) * 100).toFixed(1)}% this month. Keep up the good work!`,
        type: 'savings',
        priority: 'low'
      });
    }

    // 8. Emergency fund suggestion
    const totalIncome = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    const avgMonthlyIncome = totalIncome / 6; // Assuming 6 months of data
    const avgMonthlySpending = currentMonthSpending;
    const savingsRate = ((avgMonthlyIncome - avgMonthlySpending) / avgMonthlyIncome) * 100;

    if (savingsRate < 20 && savingsRate > 0) {
      recommendations.push({
        id: 'emergency-fund',
        title: 'Build Emergency Fund',
        description: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to save at least 20% of income for emergencies and future goals.`,
        type: 'investment',
        priority: 'medium'
      });
    }

    // Sort by priority and return top 8 recommendations
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return recommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 8);
  }

  static generateBudgetSuggestions(
    transactions: Transaction[],
    patterns: SpendingPattern[]
  ): BudgetSuggestion[] {
    const suggestions: BudgetSuggestion[] = [];
    const now = new Date();
    
    // Calculate average income
    const incomeTransactions = transactions.filter(t => t.type === 'credit');
    const avgMonthlyIncome = incomeTransactions.length > 0 
      ? incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / 6 
      : 50000; // Default assumption

    // 50/30/20 rule as baseline
    const needsBudget = avgMonthlyIncome * 0.5; // Food, Transport, Bills
    const wantsBudget = avgMonthlyIncome * 0.3; // Shopping, Entertainment
    const savingsBudget = avgMonthlyIncome * 0.2; // Savings

    patterns.forEach(pattern => {
      let suggestedBudget = 0;
      let confidence = 0.7;
      let reasoning = '';

      switch (pattern.category) {
        case 'Food':
          suggestedBudget = Math.min(pattern.averageAmount * 1.1, needsBudget * 0.4);
          reasoning = 'Based on your spending pattern with 10% buffer for essentials';
          confidence = pattern.seasonality === 'low' ? 0.9 : 0.7;
          break;
          
        case 'Transport':
          suggestedBudget = Math.min(pattern.averageAmount * 1.15, needsBudget * 0.25);
          reasoning = 'Includes buffer for unexpected trips and fuel price changes';
          confidence = 0.8;
          break;
          
        case 'Bills':
          suggestedBudget = pattern.averageAmount * 1.05; // Bills are usually fixed
          reasoning = 'Based on historical bills with minimal buffer';
          confidence = 0.95;
          break;
          
        case 'Shopping':
          suggestedBudget = Math.min(pattern.averageAmount * 0.9, wantsBudget * 0.6);
          reasoning = 'Reduced from current spending to encourage savings';
          confidence = 0.6;
          break;
          
        case 'Entertainment':
          suggestedBudget = Math.min(pattern.averageAmount * 0.95, wantsBudget * 0.4);
          reasoning = 'Entertainment budget with room for occasional splurges';
          confidence = 0.7;
          break;
          
        default:
          suggestedBudget = pattern.averageAmount;
          reasoning = 'Maintain current spending level';
          confidence = 0.5;
      }

      // Adjust based on trend
      if (pattern.trend === 'increasing') {
        suggestedBudget *= 0.9; // Reduce to control spending
        reasoning += '. Reduced due to increasing trend';
      } else if (pattern.trend === 'decreasing') {
        suggestedBudget *= 1.05; // Allow slight increase
        reasoning += '. Slight increase as spending is decreasing';
      }

      suggestions.push({
        category: pattern.category,
        suggestedBudget: Math.round(suggestedBudget),
        currentSpending: Math.round(pattern.averageAmount),
        confidence,
        reasoning
      });
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  static analyzeSpendingHabits(transactions: Transaction[]): {
    peakSpendingHour: number;
    peakSpendingDay: string;
    averageTransactionAmount: number;
    mostFrequentCategory: TransactionCategory;
    spendingConsistency: 'consistent' | 'sporadic' | 'binge';
  } {
    const expenses = transactions.filter(t => t.type === 'debit');
    
    // Peak spending hour
    const hourCounts: { [hour: number]: number } = {};
    expenses.forEach(t => {
      const hour = t.date.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + t.amount;
    });
    const peakSpendingHour = parseInt(Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '12');

    // Peak spending day
    const dayCounts: { [day: string]: number } = {};
    expenses.forEach(t => {
      const day = format(t.date, 'EEEE');
      dayCounts[day] = (dayCounts[day] || 0) + t.amount;
    });
    const peakSpendingDay = Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Saturday';

    // Average transaction amount
    const averageTransactionAmount = expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length;

    // Most frequent category
    const categoryCounts: { [category: string]: number } = {};
    expenses.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    const mostFrequentCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as TransactionCategory || 'Other';

    // Spending consistency
    const dailySpending: { [date: string]: number } = {};
    expenses.forEach(t => {
      const date = format(t.date, 'yyyy-MM-dd');
      dailySpending[date] = (dailySpending[date] || 0) + t.amount;
    });
    
    const spendingAmounts = Object.values(dailySpending);
    const avgDailySpending = spendingAmounts.reduce((sum, amount) => sum + amount, 0) / spendingAmounts.length;
    const variance = spendingAmounts.reduce((sum, amount) => sum + Math.pow(amount - avgDailySpending, 2), 0) / spendingAmounts.length;
    const coefficient = Math.sqrt(variance) / avgDailySpending;
    
    let spendingConsistency: 'consistent' | 'sporadic' | 'binge' = 'consistent';
    if (coefficient > 1.5) spendingConsistency = 'binge';
    else if (coefficient > 0.8) spendingConsistency = 'sporadic';

    return {
      peakSpendingHour,
      peakSpendingDay,
      averageTransactionAmount,
      mostFrequentCategory,
      spendingConsistency
    };
  }
}