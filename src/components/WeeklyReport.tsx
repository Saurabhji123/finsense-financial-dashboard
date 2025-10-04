import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  Paper,
  Alert
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShoppingBag,
  Receipt,
  Restaurant,
  DirectionsCar,
  Email,
  Download,
  Share,
  CalendarMonth
} from '@mui/icons-material';

interface WeeklyReportProps {
  onClose?: () => void;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ onClose }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Generate weekly report data
  useEffect(() => {
    const generateReport = () => {
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const report = {
        weekRange: `${weekDates[0]} to ${weekDates[6]}`,
        totalSpending: 28450,
        totalIncome: 75000,
        savingsRate: 62.06,
        topCategories: [
          { category: 'Food', amount: 8900, percentage: 31.3, icon: Restaurant, color: '#ff5722' },
          { category: 'Shopping', amount: 7200, percentage: 25.3, icon: ShoppingBag, color: '#4ecdc4' },
          { category: 'Bills', amount: 5800, percentage: 20.4, icon: Receipt, color: '#2196f3' },
          { category: 'Transport', amount: 3200, percentage: 11.2, icon: DirectionsCar, color: '#ff9800' },
          { category: 'Others', amount: 3350, percentage: 11.8, icon: AccountBalance, color: '#9c27b0' }
        ],
        dailySpending: [
          { day: 'Mon', amount: 3200, budget: 5000 },
          { day: 'Tue', amount: 4800, budget: 5000 },
          { day: 'Wed', amount: 2900, budget: 5000 },
          { day: 'Thu', amount: 5200, budget: 5000 },
          { day: 'Fri', amount: 6800, budget: 5000 },
          { day: 'Sat', amount: 3200, budget: 5000 },
          { day: 'Sun', amount: 2350, budget: 5000 }
        ],
        insights: [
          'Your weekend spending was 23% lower than weekdays',
          'Food expenses increased by 15% compared to last week',
          'You saved ₹18,550 more than your target this week',
          'Transport costs decreased due to work from home'
        ],
        achievements: [
          'Met savings goal for 5th consecutive week',
          'Stayed within budget for 4 out of 7 days',
          'Reduced dining out expenses by 20%'
        ],
        recommendations: [
          'Consider cooking at home on weekends to reduce food costs',
          'Set up automated savings for surplus income',
          'Review and optimize subscription services'
        ]
      };

      setReportData(report);
      setLoading(false);
    };

    // Simulate API call
    setTimeout(generateReport, 1000);
  }, []);

  const handleEmailReport = () => {
    alert('Weekly report has been sent to your email address!');
  };

  const handleDownloadReport = () => {
    alert('Downloading PDF report...');
  };

  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Weekly Financial Report',
        text: `I saved ₹${reportData?.totalIncome - reportData?.totalSpending} this week with ${reportData?.savingsRate}% savings rate!`,
        url: window.location.href
      });
    } else {
      alert('Sharing your weekly achievements...');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Assessment color="primary" />
              <Typography variant="h5" fontWeight="bold">
                Generating Weekly Report...
              </Typography>
            </Box>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Analyzing your transactions and spending patterns
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!reportData) return null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Weekly Financial Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {reportData.weekRange}
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            startIcon={<Email />}
            onClick={handleEmailReport}
          >
            Email Report
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Download />}
            onClick={handleDownloadReport}
          >
            Download PDF
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Share />}
            onClick={handleShareReport}
          >
            Share
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card sx={{ bgcolor: '#f44336', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <TrendingDown sx={{ mr: 1 }} />
              <Typography variant="body2">Total Spending</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              ₹{reportData.totalSpending.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              ↓ 12% vs last week
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ bgcolor: '#4caf50', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <TrendingUp sx={{ mr: 1 }} />
              <Typography variant="body2">Total Income</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              ₹{reportData.totalIncome.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Same as last week
              </Typography>
            </CardContent>
          </Card>
        
        <Card sx={{ bgcolor: '#2196f3', color: 'white' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <AccountBalance sx={{ mr: 1 }} />
              <Typography variant="body2">Savings Rate</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {reportData.savingsRate.toFixed(1)}%
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              ↑ 8% vs last week
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Top Categories */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Top Spending Categories
          </Typography>
          
          {reportData.topCategories.map((category: any, index: number) => (
            <Box key={category.category} sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: category.color, mr: 2 }}>
                    <category.icon fontSize="small" />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {category.category}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h6" fontWeight="bold">
                    ₹{category.amount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.percentage}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={category.percentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: category.color,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Daily Spending Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Daily Spending vs Budget
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            {reportData.dailySpending.map((day: any, index: number) => (
              <Box key={day.day} sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">{day.day}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ₹{day.amount.toLocaleString()} / ₹{day.budget.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(day.amount / day.budget) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: day.amount > day.budget ? '#f44336' : '#4caf50',
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Insights & Achievements */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 Key Insights
            </Typography>
            <List>
              {reportData.insights.map((insight: string, index: number) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Chip label={index + 1} size="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={insight} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🏆 Achievements
            </Typography>
            <List>
              {reportData.achievements.map((achievement: string, index: number) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Chip label="✓" size="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary={achievement} />
                </ListItem>
              ))}
              </List>
            </CardContent>
          </Card>
      </Box>

      {/* Recommendations */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            💡 Smart Recommendations
          </Typography>
          
          {reportData.recommendations.map((recommendation: string, index: number) => (
            <Alert key={index} severity="info" sx={{ mb: 2 }}>
              {recommendation}
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Great job this week! 🎉
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          You saved ₹{(reportData.totalIncome - reportData.totalSpending).toLocaleString()} and maintained a {reportData.savingsRate.toFixed(1)}% savings rate.
        </Typography>
        
        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button variant="contained" startIcon={<CalendarMonth />}>
            Schedule Next Week's Budget
          </Button>
          {onClose && (
            <Button variant="outlined" onClick={onClose}>
              Close Report
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default WeeklyReport;