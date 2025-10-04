import React, { useMemo, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Info,
  Lightbulb,
  MonetizationOn,
  Category as CategoryIcon,
  Psychology,
  Insights
} from '@mui/icons-material';
import { Transaction, CategorySpending, Recommendation } from '../types';
import { subDays, format, startOfMonth, endOfMonth } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { MLCategorizationEngine } from '../utils/mlCategorizationEngine';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SpendingInsightsProps {
  transactions: Transaction[];
  categorySpending: CategorySpending[];
}

const SpendingInsights: React.FC<SpendingInsightsProps> = ({
  transactions,
  categorySpending
}) => {
  // Initialize ML engine with transaction data
  useEffect(() => {
    if (transactions.length > 0) {
      transactions.forEach(transaction => {
        if (transaction.type === 'debit' && transaction.category && transaction.merchant) {
          // The ML engine learns automatically during categorization
          MLCategorizationEngine.categorizeTransaction(
            transaction.description || '',
            transaction.merchant,
            transaction.amount,
            transaction.category
          );
        }
      });
    }
  }, [transactions]);

  const insights = useMemo(() => {
    const now = new Date();
    const currentMonth = format(now, 'MMMM');
    const lastMonth = format(subDays(now, 30), 'MMMM');
    
    // Current month transactions
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const currentMonthTransactions = transactions.filter(t => 
      t.type === 'debit' && 
      t.date >= currentMonthStart && 
      t.date <= currentMonthEnd
    );
    
    // Last month transactions
    const lastMonthStart = startOfMonth(subDays(now, 30));
    const lastMonthEnd = endOfMonth(subDays(now, 30));
    const lastMonthTransactions = transactions.filter(t => 
      t.type === 'debit' && 
      t.date >= lastMonthStart && 
      t.date <= lastMonthEnd
    );

    const currentMonthSpending = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const lastMonthSpending = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const spendingChange = lastMonthSpending > 0 
      ? ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100
      : 0;

    // Top spending category
    const topCategory = categorySpending[0];
    
    // Average daily spending
    const daysInMonth = currentMonthTransactions.length > 0 
      ? Math.max(1, (now.getTime() - currentMonthStart.getTime()) / (1000 * 60 * 60 * 24))
      : 1;
    const avgDailySpending = currentMonthSpending / daysInMonth;

    // Frequent merchants
    const merchantCounts: { [key: string]: { count: number; amount: number } } = {};
    currentMonthTransactions.forEach(t => {
      if (t.merchant) {
        if (!merchantCounts[t.merchant]) {
          merchantCounts[t.merchant] = { count: 0, amount: 0 };
        }
        merchantCounts[t.merchant].count++;
        merchantCounts[t.merchant].amount += t.amount;
      }
    });

    const topMerchant = Object.entries(merchantCounts)
      .sort(([,a], [,b]) => b.amount - a.amount)[0];

    return {
      currentMonth,
      lastMonth,
      currentMonthSpending,
      lastMonthSpending,
      spendingChange,
      topCategory,
      avgDailySpending,
      topMerchant,
      totalTransactions: currentMonthTransactions.length
    };
  }, [transactions, categorySpending]);

  const recommendations = useMemo((): Recommendation[] => {
    const recs: Recommendation[] = [];

    // High spending alert
    if (insights.spendingChange > 20) {
      recs.push({
        id: 'high-spending',
        title: 'Spending Alert',
        description: `Your spending increased by ${insights.spendingChange.toFixed(1)}% compared to last month. Consider reviewing your expenses.`,
        type: 'budget',
        priority: 'high'
      });
    }

    // Category-specific recommendations
    if (insights.topCategory && insights.topCategory.percentage > 40) {
      recs.push({
        id: 'category-dominance',
        title: 'Category Focus',
        description: `${insights.topCategory.category} accounts for ${insights.topCategory.percentage.toFixed(1)}% of your spending. Consider budgeting for this category.`,
        type: 'budget',
        priority: 'medium',
        category: insights.topCategory.category
      });
    }

    // Food spending recommendation
    const foodCategory = categorySpending.find(c => c.category === 'Food');
    if (foodCategory && foodCategory.percentage > 30) {
      recs.push({
        id: 'food-spending',
        title: 'Food Budget Tip',
        description: 'You\'re spending a lot on food. Try meal planning or cooking at home to save money.',
        type: 'savings',
        priority: 'medium',
        category: 'Food'
      });
    }

    // Transport optimization
    const transportCategory = categorySpending.find(c => c.category === 'Transport');
    if (transportCategory && transportCategory.count > 30) {
      recs.push({
        id: 'transport-optimization',
        title: 'Transportation Savings',
        description: 'Consider monthly passes or carpooling to reduce frequent ride-sharing costs.',
        type: 'savings',
        priority: 'low',
        category: 'Transport'
      });
    }

    // Positive feedback
    if (insights.spendingChange < -10) {
      recs.push({
        id: 'good-spending',
        title: 'Great Job!',
        description: `You've reduced your spending by ${Math.abs(insights.spendingChange).toFixed(1)}% this month. Keep it up!`,
        type: 'savings',
        priority: 'low'
      });
    }

    return recs.slice(0, 4); // Limit to 4 recommendations
  }, [insights, categorySpending]);

  // Chart data for category spending
  const pieChartData = useMemo(() => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];

    return {
      labels: categorySpending.map(c => c.category),
      datasets: [{
        data: categorySpending.map(c => c.amount),
        backgroundColor: colors.slice(0, categorySpending.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }, [categorySpending]);

  // Chart data for spending trend (last 7 days)
  const trendChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date,
        label: format(date, 'MMM dd'),
        spending: transactions
          .filter(t => 
            t.type === 'debit' && 
            format(t.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          )
          .reduce((sum, t) => sum + t.amount, 0)
      };
    });

    return {
      labels: last7Days.map(d => d.label),
      datasets: [{
        label: 'Daily Spending',
        data: last7Days.map(d => d.spending),
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4ECDC4',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5
      }]
    };
  }, [transactions]);

  // AI-powered insights using ML engine
  const aiInsights = useMemo(() => {
    const spendingPatterns = MLCategorizationEngine.analyzeSpendingPatterns(transactions);
    const aiRecommendations: string[] = [...spendingPatterns.recommendations];
    
    // Add custom insights based on spending patterns
    if (spendingPatterns.frequentMerchants.length > 0) {
      aiRecommendations.push(
        `You frequently shop at ${spendingPatterns.frequentMerchants[0]}. Consider checking for loyalty programs or discounts.`
      );
    }

    if (spendingPatterns.unusualCategories.length > 0) {
      aiRecommendations.push(
        `High spending detected in ${spendingPatterns.unusualCategories[0]}. Consider setting a budget for this category.`
      );
    }

    // High spending velocity
    const recentTransactions = transactions.filter(t => 
      t.type === 'debit' && 
      t.date >= subDays(new Date(), 3)
    );
    
    if (recentTransactions.length > 10) {
      aiRecommendations.push(
        'High transaction frequency detected in the last 3 days. Consider reviewing recent purchases.'
      );
    }

    return aiRecommendations.slice(0, 4);
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Warning />;
      case 'medium': return <Info />;
      case 'low': return <CheckCircle />;
      default: return <Lightbulb />;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h6" gutterBottom>
          <Box display="flex" alignItems="center" gap={1}>
            <Insights color="primary" />
            Enhanced Financial Analytics
          </Box>
        </Typography>
      </Box>

      <Box sx={{ px: 3, flex: 1, overflow: 'auto' }}>
        {/* Charts Section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Spending Categories Pie Chart */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: 250 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <CategoryIcon sx={{ mr: 1, fontSize: 16 }} />
                  Spending by Category
                </Typography>
                <Box sx={{ height: 180, position: 'relative' }}>
                  {categorySpending.length > 0 ? (
                    <Pie data={pieChartData} options={chartOptions} />
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                      <Typography variant="body2" color="text.secondary">
                        No spending data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Spending Trend Line Chart */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: 250 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <TrendingUp sx={{ mr: 1, fontSize: 16 }} />
                  7-Day Spending Trend
                </Typography>
                <Box sx={{ height: 180, position: 'relative' }}>
                  <Line data={trendChartData} options={lineChartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Monthly Comparison */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Monthly Spending Comparison
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              {insights.spendingChange > 0 ? (
                <TrendingUp color="error" />
              ) : (
                <TrendingDown color="success" />
              )}
              <Typography variant="body1">
                {insights.spendingChange > 0 ? '+' : ''}
                {insights.spendingChange.toFixed(1)}% vs last month
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {insights.currentMonth}: {formatCurrency(insights.currentMonthSpending)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {insights.lastMonth}: {formatCurrency(insights.lastMonthSpending)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* AI-Powered Insights */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <Box display="flex" alignItems="center" gap={1}>
                <Psychology color="primary" />
                AI-Powered Insights
              </Box>
            </Typography>
            {aiInsights.length > 0 ? (
              <List dense sx={{ pt: 0 }}>
                {aiInsights.map((insight, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Lightbulb color="primary" sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.primary">
                          {insight}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Keep tracking your expenses to get AI insights!
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Traditional Recommendations */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Smart Recommendations
            </Typography>
            {recommendations.length > 0 ? (
              <List dense sx={{ pt: 0 }}>
                {recommendations.map((rec) => (
                  <ListItem key={rec.id} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {getPriorityIcon(rec.priority)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="medium">
                            {rec.title}
                          </Typography>
                          <Chip
                            label={rec.priority}
                            size="small"
                            color={getPriorityColor(rec.priority) as any}
                            sx={{ height: 16, fontSize: '0.6rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {rec.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Keep tracking your expenses to get personalized insights!
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="primary">
                  {formatCurrency(insights.avgDailySpending)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Daily Average
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" color="primary">
                  {insights.totalTransactions}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Transactions
                </Typography>
              </Box>
            </Box>
            {insights.topMerchant && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="medium">
                  Most Frequent: {insights.topMerchant[0]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(insights.topMerchant[1].amount)} spent
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
};

export default SpendingInsights;