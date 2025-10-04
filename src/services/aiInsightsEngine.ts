import { Transaction } from '../types';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export interface SpendingPrediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
}

export interface AnomalyDetection {
  id: string;
  userId: string;
  type: 'unusual_spending' | 'suspicious_transaction' | 'budget_deviation' | 'merchant_anomaly';
  severity: 'low' | 'medium' | 'high';
  description: string;
  transactionId?: string;
  category?: string;
  amount?: number;
  confidence: number;
  detectedAt: Date;
  isResolved: boolean;
  recommendation: string;
}

export interface PersonalizedRecommendation {
  id: string;
  userId: string;
  type: 'saving' | 'investment' | 'budgeting' | 'spending' | 'financial_goal';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings?: number;
  actionItems: string[];
  confidence: number;
  createdAt: Date;
  isImplemented: boolean;
}

export interface FinancialInsight {
  id: string;
  userId: string;
  type: 'spending_pattern' | 'income_analysis' | 'savings_opportunity' | 'investment_advice';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  actionable: boolean;
  generatedAt: Date;
}

export interface AIAnalysisResult {
  predictions: SpendingPrediction[];
  anomalies: AnomalyDetection[];
  recommendations: PersonalizedRecommendation[];
  insights: FinancialInsight[];
  riskScore: number;
  savingsOpportunity: number;
}

export class AIInsightsEngine {
  private analysisInterval?: NodeJS.Timeout;
  private isAnalyzing = false;

  // Start continuous AI analysis
  startAIAnalysis(userId: string): void {
    if (this.isAnalyzing) {
      console.log('🤖 AI analysis is already running');
      return;
    }

    console.log('🤖 Starting AI-powered financial analysis...');
    this.isAnalyzing = true;

    const runAnalysis = async () => {
      if (!this.isAnalyzing) return;

      try {
        const result = await this.performAIAnalysis(userId);
        await this.storeAnalysisResults(userId, result);
        console.log('✅ AI analysis cycle completed');
      } catch (error) {
        console.error('❌ AI analysis error:', error);
      }
    };

    // Initial analysis
    runAnalysis();

    // Run analysis every 30 minutes
    this.analysisInterval = setInterval(runAnalysis, 30 * 60 * 1000);
  }

  stopAIAnalysis(): void {
    console.log('⏹️ Stopping AI analysis...');
    this.isAnalyzing = false;
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
  }

  // Perform comprehensive AI analysis
  async performAIAnalysis(userId: string): Promise<AIAnalysisResult> {
    console.log('🧠 Running AI financial analysis...');

    // Get transaction history
    const transactions = await this.getTransactionHistory(userId, 90); // Last 3 months
    
    // Run parallel analysis
    const [predictions, anomalies, recommendations, insights] = await Promise.all([
      this.generateSpendingPredictions(transactions),
      this.detectAnomalies(userId, transactions),
      this.generatePersonalizedRecommendations(userId, transactions),
      this.generateFinancialInsights(transactions)
    ]);

    // Calculate risk score and savings opportunity
    const riskScore = this.calculateRiskScore(transactions, anomalies);
    const savingsOpportunity = this.calculateSavingsOpportunity(transactions, recommendations);

    return {
      predictions,
      anomalies,
      recommendations,
      insights,
      riskScore,
      savingsOpportunity
    };
  }

  // Generate spending predictions using AI
  private async generateSpendingPredictions(transactions: Transaction[]): Promise<SpendingPrediction[]> {
    const categorySpending: { [category: string]: number[] } = {};
    
    // Group spending by category and month
    transactions.filter(t => t.type === 'debit').forEach(transaction => {
      const category = transaction.category as string;
      if (!categorySpending[category]) {
        categorySpending[category] = [];
      }
      categorySpending[category].push(transaction.amount);
    });

    const predictions: SpendingPrediction[] = [];

    Object.entries(categorySpending).forEach(([category, amounts]) => {
      if (amounts.length < 3) return; // Need at least 3 data points

      const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const recent = amounts.slice(-10); // Last 10 transactions
      const recentAverage = recent.reduce((sum, amount) => sum + amount, 0) / recent.length;

      // Determine trend
      let trend: SpendingPrediction['trend'] = 'stable';
      const trendRatio = recentAverage / average;
      if (trendRatio > 1.1) trend = 'increasing';
      else if (trendRatio < 0.9) trend = 'decreasing';

      // Calculate prediction with trend factor
      let predictedAmount = average;
      if (trend === 'increasing') predictedAmount *= 1.15;
      else if (trend === 'decreasing') predictedAmount *= 0.85;

      // Calculate confidence based on data consistency
      const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length;
      const standardDeviation = Math.sqrt(variance);
      const coefficientOfVariation = standardDeviation / average;
      const confidence = Math.max(0.3, Math.min(0.95, 1 - coefficientOfVariation));

      const factors = this.getSpendingFactors(category, trend, amounts);

      predictions.push({
        category,
        predictedAmount: Math.round(predictedAmount),
        confidence: Math.round(confidence * 100) / 100,
        trend,
        factors
      });
    });

    return predictions.sort((a, b) => b.predictedAmount - a.predictedAmount);
  }

  // Detect spending anomalies
  private async detectAnomalies(userId: string, transactions: Transaction[]): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];

    // Detect unusual spending amounts
    const categoryStats: { [category: string]: { mean: number; stdDev: number; amounts: number[] } } = {};
    
    transactions.filter(t => t.type === 'debit').forEach(transaction => {
      const category = transaction.category as string;
      if (!categoryStats[category]) {
        categoryStats[category] = { mean: 0, stdDev: 0, amounts: [] };
      }
      categoryStats[category].amounts.push(transaction.amount);
    });

    // Calculate statistics for each category
    Object.entries(categoryStats).forEach(([category, stats]) => {
      if (stats.amounts.length < 5) return; // Need sufficient data

      const mean = stats.amounts.reduce((sum, amount) => sum + amount, 0) / stats.amounts.length;
      const variance = stats.amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / stats.amounts.length;
      const stdDev = Math.sqrt(variance);

      stats.mean = mean;
      stats.stdDev = stdDev;

      // Find outliers (amounts > 2 standard deviations from mean)
      transactions.filter(t => t.type === 'debit' && t.category === category).forEach(transaction => {
        const zScore = Math.abs(transaction.amount - mean) / stdDev;
        
        if (zScore > 2 && transaction.amount > mean * 1.5) { // Unusually high spending
          let severity: AnomalyDetection['severity'] = 'low';
          if (zScore > 3) severity = 'high';
          else if (zScore > 2.5) severity = 'medium';

          anomalies.push({
            id: uuidv4(),
            userId,
            type: 'unusual_spending',
            severity,
            description: `Unusually high ${category} spending: ₹${transaction.amount} (${Math.round(zScore * 10) / 10}x above normal)`,
            transactionId: transaction.id,
            category,
            amount: transaction.amount,
            confidence: Math.min(0.95, zScore / 4),
            detectedAt: new Date(),
            isResolved: false,
            recommendation: `Review this ${category} transaction. Consider if this was necessary or if you can reduce similar expenses.`
          });
        }
      });
    });

    // Detect suspicious merchant patterns
    const merchantFrequency: { [merchant: string]: number } = {};
    transactions.forEach(transaction => {
      if (transaction.merchant) {
        merchantFrequency[transaction.merchant] = (merchantFrequency[transaction.merchant] || 0) + 1;
      }
    });

    // Flag merchants with unusual frequency
    Object.entries(merchantFrequency).forEach(([merchant, frequency]) => {
      if (frequency > 20) { // More than 20 transactions with same merchant
        anomalies.push({
          id: uuidv4(),
          userId,
          type: 'merchant_anomaly',
          severity: 'medium',
          description: `Frequent transactions with ${merchant}: ${frequency} times`,
          confidence: 0.7,
          detectedAt: new Date(),
          isResolved: false,
          recommendation: 'Review if these frequent transactions are necessary. Consider setting up alerts for this merchant.'
        });
      }
    });

    return anomalies.sort((a, b) => b.confidence - a.confidence);
  }

  // Generate personalized recommendations
  private async generatePersonalizedRecommendations(userId: string, transactions: Transaction[]): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];

    // Analyze spending patterns
    const categorySpending: { [category: string]: number } = {};
    const totalSpending = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

    transactions.filter(t => t.type === 'debit').forEach(transaction => {
      categorySpending[transaction.category as string] = (categorySpending[transaction.category as string] || 0) + transaction.amount;
    });

    // Generate category-specific recommendations
    Object.entries(categorySpending).forEach(([category, amount]) => {
      const percentage = (amount / totalSpending) * 100;

      if (category === 'Food' && percentage > 25) {
        recommendations.push({
          id: uuidv4(),
          userId,
          type: 'spending',
          priority: 'high',
          title: 'Optimize Food Expenses',
          description: `Food spending is ${Math.round(percentage)}% of your total expenses. Consider meal planning and cooking at home.`,
          potentialSavings: Math.round(amount * 0.2),
          actionItems: [
            'Plan weekly meals in advance',
            'Cook at home more frequently',
            'Use grocery coupons and offers',
            'Avoid impulse food orders'
          ],
          confidence: 0.85,
          createdAt: new Date(),
          isImplemented: false
        });
      }

      if (category === 'Transport' && percentage > 20) {
        recommendations.push({
          id: uuidv4(),
          userId,
          type: 'spending',
          priority: 'medium',
          title: 'Reduce Transportation Costs',
          description: `Transportation is ${Math.round(percentage)}% of expenses. Consider public transport or carpooling.`,
          potentialSavings: Math.round(amount * 0.15),
          actionItems: [
            'Use public transportation when possible',
            'Consider carpooling for regular routes',
            'Walk or cycle for short distances',
            'Plan trips to reduce fuel consumption'
          ],
          confidence: 0.75,
          createdAt: new Date(),
          isImplemented: false
        });
      }

      if (category === 'Entertainment' && percentage > 15) {
        recommendations.push({
          id: uuidv4(),
          userId,
          type: 'spending',
          priority: 'low',
          title: 'Optimize Entertainment Spending',
          description: `Entertainment expenses are ${Math.round(percentage)}% of total spending. Look for budget-friendly alternatives.`,
          potentialSavings: Math.round(amount * 0.25),
          actionItems: [
            'Look for free entertainment options',
            'Use subscription services efficiently',
            'Take advantage of discounts and offers',
            'Consider group activities to split costs'
          ],
          confidence: 0.7,
          createdAt: new Date(),
          isImplemented: false
        });
      }
    });

    // Investment recommendations
    const income = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = Math.max(0, (income - totalSpending) / income);

    if (savingsRate < 0.2) {
      recommendations.push({
        id: uuidv4(),
        userId,
        type: 'saving',
        priority: 'high',
        title: 'Improve Savings Rate',
        description: `Your savings rate is ${Math.round(savingsRate * 100)}%. Aim for at least 20% to build financial security.`,
        actionItems: [
          'Create a monthly budget and stick to it',
          'Automate savings transfers',
          'Reduce unnecessary subscriptions',
          'Look for additional income sources'
        ],
        confidence: 0.9,
        createdAt: new Date(),
        isImplemented: false
      });
    }

    if (savingsRate > 0.3) {
      recommendations.push({
        id: uuidv4(),
        userId,
        type: 'investment',
        priority: 'high',
        title: 'Start Investing Your Savings',
        description: `You have good savings habits! Consider investing ${Math.round((savingsRate - 0.2) * 100)}% of income for wealth building.`,
        actionItems: [
          'Start SIP in mutual funds',
          'Consider investing in index funds',
          'Learn about stock market basics',
          'Diversify across asset classes'
        ],
        confidence: 0.8,
        createdAt: new Date(),
        isImplemented: false
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Generate financial insights
  private async generateFinancialInsights(transactions: Transaction[]): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    // Spending pattern analysis
    const monthlySpending: { [month: string]: number } = {};
    transactions.filter(t => t.type === 'debit').forEach(transaction => {
      const month = transaction.date.toISOString().substr(0, 7); // YYYY-MM
      monthlySpending[month] = (monthlySpending[month] || 0) + transaction.amount;
    });

    const months = Object.keys(monthlySpending).sort();
    if (months.length >= 2) {
      const currentMonth = monthlySpending[months[months.length - 1]];
      const previousMonth = monthlySpending[months[months.length - 2]];
      const change = ((currentMonth - previousMonth) / previousMonth) * 100;

      if (Math.abs(change) > 15) {
        insights.push({
          id: uuidv4(),
          userId: '',
          type: 'spending_pattern',
          title: `Monthly Spending ${change > 0 ? 'Increase' : 'Decrease'}`,
          description: `Your spending ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(Math.round(change))}% this month compared to last month.`,
          impact: change > 0 ? 'negative' : 'positive',
          actionable: true,
          generatedAt: new Date()
        });
      }
    }

    // Weekend vs weekday spending
    const weekendSpending = transactions.filter(t => {
      const day = t.date.getDay();
      return t.type === 'debit' && (day === 0 || day === 6);
    }).reduce((sum, t) => sum + t.amount, 0);

    const weekdaySpending = transactions.filter(t => {
      const day = t.date.getDay();
      return t.type === 'debit' && day >= 1 && day <= 5;
    }).reduce((sum, t) => sum + t.amount, 0);

    if (weekendSpending > weekdaySpending * 0.4) {
      insights.push({
        id: uuidv4(),
        userId: '',
        type: 'spending_pattern',
        title: 'High Weekend Spending',
        description: 'You tend to spend significantly more on weekends. This could be an opportunity to save.',
        impact: 'neutral',
        actionable: true,
        generatedAt: new Date()
      });
    }

    return insights;
  }

  // Calculate risk score (0-100)
  private calculateRiskScore(transactions: Transaction[], anomalies: AnomalyDetection[]): number {
    let riskScore = 0;

    // Base risk from anomalies
    anomalies.forEach(anomaly => {
      switch (anomaly.severity) {
        case 'high': riskScore += 15; break;
        case 'medium': riskScore += 8; break;
        case 'low': riskScore += 3; break;
      }
    });

    // Risk from spending patterns
    const totalSpending = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    
    if (totalIncome > 0) {
      const spendingRatio = totalSpending / totalIncome;
      if (spendingRatio > 0.9) riskScore += 20;
      else if (spendingRatio > 0.8) riskScore += 10;
    }

    return Math.min(100, riskScore);
  }

  // Calculate potential savings opportunity
  private calculateSavingsOpportunity(transactions: Transaction[], recommendations: PersonalizedRecommendation[]): number {
    return recommendations.reduce((total, rec) => total + (rec.potentialSavings || 0), 0);
  }

  // Get spending factors for predictions
  private getSpendingFactors(category: string, trend: string, amounts: number[]): string[] {
    const factors: string[] = [];

    if (trend === 'increasing') {
      factors.push('Recent spending trend is upward');
      if (category === 'Food') factors.push('Possible increase in dining out or food delivery');
      if (category === 'Transport') factors.push('May indicate more travel or higher fuel costs');
    } else if (trend === 'decreasing') {
      factors.push('Recent spending trend is downward');
      factors.push('Good cost control in this category');
    }

    const latest = amounts.slice(-5);
    const variance = latest.reduce((sum, amount) => {
      const mean = latest.reduce((s, a) => s + a, 0) / latest.length;
      return sum + Math.pow(amount - mean, 2);
    }, 0) / latest.length;

    if (variance > 10000) {
      factors.push('High spending variability in recent transactions');
    } else {
      factors.push('Consistent spending pattern');
    }

    return factors;
  }

  // Store analysis results in Firebase
  private async storeAnalysisResults(userId: string, result: AIAnalysisResult): Promise<void> {
    // Store anomalies
    for (const anomaly of result.anomalies) {
      await addDoc(collection(db, 'anomalies'), {
        ...anomaly,
        detectedAt: Timestamp.fromDate(anomaly.detectedAt)
      });
    }

    // Store recommendations
    for (const recommendation of result.recommendations) {
      await addDoc(collection(db, 'recommendations'), {
        ...recommendation,
        createdAt: Timestamp.fromDate(recommendation.createdAt)
      });
    }

    // Store insights
    for (const insight of result.insights) {
      insight.userId = userId;
      await addDoc(collection(db, 'insights'), {
        ...insight,
        generatedAt: Timestamp.fromDate(insight.generatedAt)
      });
    }
  }

  // Get transaction history for analysis
  private async getTransactionHistory(userId: string, days: number): Promise<Transaction[]> {
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

  // Get latest analysis results
  async getLatestAnalysis(userId: string): Promise<Partial<AIAnalysisResult>> {
    try {
      // Get recent anomalies
      const anomaliesQuery = query(
        collection(db, 'anomalies'),
        where('userId', '==', userId),
        where('isResolved', '==', false),
        orderBy('detectedAt', 'desc'),
        // limit(10)
      );

      // Get recent recommendations
      const recommendationsQuery = query(
        collection(db, 'recommendations'),
        where('userId', '==', userId),
        where('isImplemented', '==', false),
        orderBy('createdAt', 'desc'),
        // limit(5)
      );

      const [anomaliesSnapshot, recommendationsSnapshot] = await Promise.all([
        getDocs(anomaliesQuery),
        getDocs(recommendationsQuery)
      ]);

      const anomalies = anomaliesSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        detectedAt: doc.data().detectedAt.toDate()
      } as AnomalyDetection));

      const recommendations = recommendationsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate()
      } as PersonalizedRecommendation));

      return {
        anomalies,
        recommendations,
        riskScore: Math.floor(Math.random() * 30) + 10, // Simulated risk score
        savingsOpportunity: recommendations.reduce((sum, rec) => sum + (rec.potentialSavings || 0), 0)
      };
    } catch (error) {
      console.error('Error fetching analysis results:', error);
      return {};
    }
  }
}

export const aiInsightsEngine = new AIInsightsEngine();