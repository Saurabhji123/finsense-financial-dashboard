import { Transaction } from '../types';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  alertThreshold: number; // Percentage (e.g., 80 for 80%)
  isAutoCreated: boolean; // Created by AI analysis
  createdAt: Date;
}

export interface BudgetAlert {
  id: string;
  userId: string;
  budgetId: string;
  type: 'warning' | 'exceeded' | 'approaching';
  message: string;
  percentage: number;
  timestamp: Date;
  isRead: boolean;
}

export interface SpendingPattern {
  category: string;
  averageMonthly: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  variability: number;
  prediction: number; // Predicted next month spending
}

export class SmartBudgetService {
  private budgetCheckInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  // Analyze spending patterns and create smart budgets
  async createSmartBudgets(userId: string): Promise<Budget[]> {
    console.log('🧠 Analyzing spending patterns to create smart budgets...');

    // Get transaction history for analysis
    const transactions = await this.getRecentTransactions(userId, 90); // Last 3 months
    const patterns = this.analyzeSpendingPatterns(transactions);
    
    const smartBudgets: Budget[] = [];

    for (const pattern of patterns) {
      // Create budget with 10% buffer above average spending
      const recommendedLimit = Math.ceil(pattern.prediction * 1.1);
      
      const budget: Budget = {
        id: uuidv4(),
        userId,
        category: pattern.category,
        limit: recommendedLimit,
        spent: 0,
        period: 'monthly',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        isActive: true,
        alertThreshold: this.getAlertThreshold(pattern),
        isAutoCreated: true,
        createdAt: new Date()
      };

      // Store in Firebase
      await addDoc(collection(db, 'budgets'), {
        ...budget,
        startDate: Timestamp.fromDate(budget.startDate),
        endDate: Timestamp.fromDate(budget.endDate),
        createdAt: Timestamp.fromDate(budget.createdAt)
      });

      smartBudgets.push(budget);
      console.log(`💡 Created smart budget for ${pattern.category}: ₹${recommendedLimit}/month`);
    }

    return smartBudgets;
  }

  // Start real-time budget monitoring
  startBudgetMonitoring(userId: string): void {
    if (this.isMonitoring) {
      console.log('📊 Budget monitoring is already active');
      return;
    }

    console.log('📊 Starting smart budget monitoring...');
    this.isMonitoring = true;

    const monitorBudgets = async () => {
      if (!this.isMonitoring) return;

      try {
        await this.checkBudgetStatus(userId);
        await this.updateBudgetSpending(userId);
        console.log('✅ Budget monitoring cycle completed');
      } catch (error) {
        console.error('❌ Budget monitoring error:', error);
      }
    };

    // Initial check
    monitorBudgets();

    // Check every 10 minutes
    this.budgetCheckInterval = setInterval(monitorBudgets, 10 * 60 * 1000);
  }

  stopBudgetMonitoring(): void {
    console.log('⏹️ Stopping budget monitoring...');
    this.isMonitoring = false;
    if (this.budgetCheckInterval) {
      clearInterval(this.budgetCheckInterval);
    }
  }

  // Check all budgets and create alerts if necessary
  private async checkBudgetStatus(userId: string): Promise<void> {
    const budgets = await this.getActiveBudgets(userId);

    for (const budget of budgets) {
      const percentage = (budget.spent / budget.limit) * 100;

      let alertType: BudgetAlert['type'] | null = null;
      let message = '';

      if (percentage >= 100) {
        alertType = 'exceeded';
        message = `🚨 Budget exceeded! You've spent ₹${budget.spent} out of ₹${budget.limit} for ${budget.category}`;
      } else if (percentage >= budget.alertThreshold) {
        alertType = 'warning';
        message = `⚠️ Budget alert: You've spent ${Math.round(percentage)}% of your ${budget.category} budget (₹${budget.spent}/₹${budget.limit})`;
      } else if (percentage >= budget.alertThreshold - 10) {
        alertType = 'approaching';
        message = `📈 Approaching budget limit: ${Math.round(percentage)}% spent on ${budget.category}`;
      }

      if (alertType) {
        await this.createBudgetAlert(userId, budget.id, alertType, message, percentage);
      }
    }
  }

  // Update budget spending based on recent transactions
  private async updateBudgetSpending(userId: string): Promise<void> {
    const budgets = await this.getActiveBudgets(userId);

    for (const budget of budgets) {
      const spending = await this.calculateCategorySpending(
        userId, 
        budget.category, 
        budget.startDate, 
        budget.endDate
      );

      if (spending !== budget.spent) {
        await updateDoc(doc(db, 'budgets', budget.id), {
          spent: spending
        });
      }
    }
  }

  // Analyze spending patterns from transaction history
  private analyzeSpendingPatterns(transactions: Transaction[]): SpendingPattern[] {
    const categorySpending: { [category: string]: number[] } = {};

    // Group spending by category and month
    transactions.forEach(transaction => {
      if (transaction.type === 'debit') {
        const category = transaction.category as string;
        if (!categorySpending[category]) {
          categorySpending[category] = [];
        }
        categorySpending[category].push(transaction.amount);
      }
    });

    // Analyze patterns for each category
    const patterns: SpendingPattern[] = [];

    Object.entries(categorySpending).forEach(([category, amounts]) => {
      const total = amounts.reduce((sum, amount) => sum + amount, 0);
      const averageMonthly = total / 3; // 3 months of data
      const variability = this.calculateVariability(amounts);
      
      // Simple trend analysis (compare last month vs previous months)
      const lastMonthTotal = amounts.slice(-30).reduce((sum, amount) => sum + amount, 0);
      const previousMonthsAvg = amounts.slice(0, -30).reduce((sum, amount) => sum + amount, 0) / 2;
      
      let trend: SpendingPattern['trend'] = 'stable';
      if (lastMonthTotal > previousMonthsAvg * 1.1) trend = 'increasing';
      else if (lastMonthTotal < previousMonthsAvg * 0.9) trend = 'decreasing';

      // Predict next month spending based on trend
      let prediction = averageMonthly;
      if (trend === 'increasing') prediction *= 1.15;
      else if (trend === 'decreasing') prediction *= 0.85;

      patterns.push({
        category,
        averageMonthly,
        trend,
        variability,
        prediction
      });
    });

    return patterns.filter(pattern => pattern.averageMonthly > 100); // Only categories with meaningful spending
  }

  // Calculate variability (standard deviation) of spending
  private calculateVariability(amounts: number[]): number {
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const squaredDifferences = amounts.map(amount => Math.pow(amount - mean, 2));
    const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / amounts.length;
    return Math.sqrt(variance);
  }

  // Get appropriate alert threshold based on spending pattern
  private getAlertThreshold(pattern: SpendingPattern): number {
    // More volatile spending patterns get earlier alerts
    if (pattern.variability > pattern.averageMonthly * 0.5) return 70; // High variability
    if (pattern.variability > pattern.averageMonthly * 0.3) return 75; // Medium variability
    return 80; // Low variability
  }

  // Get recent transactions for analysis
  private async getRecentTransactions(userId: string, days: number): Promise<Transaction[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(transactionsQuery);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: doc.data().date.toDate()
    } as Transaction));
  }

  // Get active budgets for a user
  private async getActiveBudgets(userId: string): Promise<Budget[]> {
    const budgetsQuery = query(
      collection(db, 'budgets'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(budgetsQuery);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
      createdAt: doc.data().createdAt.toDate()
    } as Budget));
  }

  // Calculate spending for a specific category in a time period
  private async calculateCategorySpending(
    userId: string, 
    category: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('category', '==', category),
      where('type', '==', 'debit'),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate))
    );

    const querySnapshot = await getDocs(transactionsQuery);
    return querySnapshot.docs.reduce((total, doc) => {
      return total + (doc.data().amount || 0);
    }, 0);
  }

  // Create budget alert
  private async createBudgetAlert(
    userId: string, 
    budgetId: string, 
    type: BudgetAlert['type'], 
    message: string, 
    percentage: number
  ): Promise<void> {
    const alert: BudgetAlert = {
      id: uuidv4(),
      userId,
      budgetId,
      type,
      message,
      percentage,
      timestamp: new Date(),
      isRead: false
    };

    await addDoc(collection(db, 'budgetAlerts'), {
      ...alert,
      timestamp: Timestamp.fromDate(alert.timestamp)
    });

    console.log(`🔔 ${alert.message}`);
  }

  // Get budget insights and recommendations
  async getBudgetInsights(userId: string): Promise<{
    totalBudgets: number;
    budgetsOnTrack: number;
    budgetsExceeded: number;
    monthlySavings: number;
    recommendations: string[];
  }> {
    const budgets = await this.getActiveBudgets(userId);
    
    let budgetsOnTrack = 0;
    let budgetsExceeded = 0;
    let totalBudgeted = 0;
    let totalSpent = 0;

    budgets.forEach(budget => {
      totalBudgeted += budget.limit;
      totalSpent += budget.spent;

      const percentage = (budget.spent / budget.limit) * 100;
      if (percentage >= 100) budgetsExceeded++;
      else if (percentage <= 80) budgetsOnTrack++;
    });

    const monthlySavings = Math.max(0, totalBudgeted - totalSpent);

    const recommendations = this.generateRecommendations(budgets);

    return {
      totalBudgets: budgets.length,
      budgetsOnTrack,
      budgetsExceeded,
      monthlySavings,
      recommendations
    };
  }

  // Generate personalized budget recommendations
  private generateRecommendations(budgets: Budget[]): string[] {
    const recommendations: string[] = [];

    budgets.forEach(budget => {
      const percentage = (budget.spent / budget.limit) * 100;

      if (percentage >= 100) {
        recommendations.push(`Consider reducing ${budget.category} spending by ₹${Math.ceil((budget.spent - budget.limit) / 2)} next month`);
      } else if (percentage <= 50) {
        recommendations.push(`Great job! You're spending only ${Math.round(percentage)}% of your ${budget.category} budget. Consider saving the extra ₹${budget.limit - budget.spent}`);
      } else if (percentage >= 90) {
        recommendations.push(`You're close to exceeding your ${budget.category} budget. Try to limit spending for the rest of the month`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Your budgets look good! Keep up the great spending habits.');
    }

    return recommendations;
  }
}

export const smartBudgetService = new SmartBudgetService();