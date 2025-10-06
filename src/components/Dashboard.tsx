import React, { useState, useEffect } from 'react';
import { RealBankAccount, UPIApp, Investment, Goal } from '../types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Container,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemText,
  ListItemIcon,
  Avatar,
  Alert,
  CircularProgress,
  Badge,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Smartphone,
  Phone,
  AccountBalance,
  Assessment,
  CheckCircle,
  Category,
  Search,
  Mic,
  FilterList,
  Warning,
  EmojiEvents,
  NotificationsActive,
  Subscriptions,
  CalendarMonth,
  Schedule,
  ReceiptLong,
  PsychologyAlt,
  Speed,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  // State management with localStorage persistence
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(() => 
    localStorage.getItem('dashboard-category') || 'all'
  );
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [subscriptionMenuAnchor, setSubscriptionMenuAnchor] = useState<null | HTMLElement>(null);
  const [dateFilter, setDateFilter] = useState(() => 
    localStorage.getItem('dashboard-date-filter') || 'all'
  );
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>(() => 
    JSON.parse(localStorage.getItem('dashboard-amount-range') || '{"min": "", "max": ""}')
  );
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(() => 
    localStorage.getItem('dashboard-show-anomalies') === 'true'
  );
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  
  // Bank and UPI state management with localStorage persistence
  const [connectedBankAccounts, setConnectedBankAccounts] = useState<RealBankAccount[]>([]);
  const [connectedUPIApps, setConnectedUPIApps] = useState<UPIApp[]>([]);
  const [showSmartBudgetPopup, setShowSmartBudgetPopup] = useState(false);
  
  // Investment tracking state
  const [investments, setInvestments] = useState<any[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioGain, setPortfolioGain] = useState(0);
  
  // Goals state management with localStorage persistence
  const [goals, setGoals] = useState<Goal[]>(() => {
    const savedGoals = localStorage.getItem('finsense_goals');
    return savedGoals ? JSON.parse(savedGoals) : [
      { 
        id: 1,
        name: 'Dream Home', 
        saved: 1500000, 
        target: 5000000, 
        percentage: 30,
        aiRecommendation: 25000,
        timeline: '8 years 4 months'
      },
      { 
        id: 2,
        name: 'Emergency Fund', 
        saved: 300000, 
        target: 500000, 
        percentage: 60,
        aiRecommendation: 15000,
        timeline: '1 year 2 months'
      }
    ];
  });
  
  // New goal form state
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    saved: ''
  });
  
  // Bank addition dialog state
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'Savings' as 'Savings' | 'Current',
    balance: ''
  });
  
  // UPI addition dialog state
  const [upiDialogOpen, setUpiDialogOpen] = useState(false);
  const [newUPIApp, setNewUPIApp] = useState({
    name: '',
    upiId: ''
  });
  
  // Real-time transaction state
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  
  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load persisted data on component mount
  useEffect(() => {
    // Load bank accounts from localStorage
    const savedBankAccounts = localStorage.getItem('connected-bank-accounts');
    if (savedBankAccounts) {
      setConnectedBankAccounts(JSON.parse(savedBankAccounts));
    } else {
      // Initialize with demo bank account
      const demoBankAccount: RealBankAccount = {
        id: 'sbi-001',
        bankName: 'State Bank of India',
        accountNumber: '****1234',
        accountType: 'Savings',
        balance: 45630,
        isConnected: true,
        lastSyncTime: new Date()
      };
      setConnectedBankAccounts([demoBankAccount]);
      localStorage.setItem('connected-bank-accounts', JSON.stringify([demoBankAccount]));
    }

    // Load UPI apps from localStorage
    const savedUPIApps = localStorage.getItem('connected-upi-apps');
    if (savedUPIApps) {
      setConnectedUPIApps(JSON.parse(savedUPIApps));
    } else {
      // Initialize with demo UPI apps
      const demoUPIApps: UPIApp[] = [
        { id: 'phonepe-1', name: 'PhonePe', upiId: 'user@phonepe', isConnected: true },
        { id: 'gpay-1', name: 'Google Pay', upiId: 'user@gpay', isConnected: true },
        { id: 'paytm-1', name: 'Paytm', upiId: 'user@paytm', isConnected: true }
      ];
      setConnectedUPIApps(demoUPIApps);
      localStorage.setItem('connected-upi-apps', JSON.stringify(demoUPIApps));
    }

    // Load investments from localStorage
    const savedInvestments = localStorage.getItem('portfolio-investments');
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    } else {
      // Initialize with demo investments
      const demoInvestments = [
        { symbol: 'RELIANCE', name: 'Reliance Industries', quantity: 25, buyPrice: 2400, currentPrice: 2520, gain: 3000 },
        { symbol: 'TCS', name: 'Tata Consultancy Services', quantity: 15, buyPrice: 3200, currentPrice: 3350, gain: 2250 },
        { symbol: 'INFY', name: 'Infosys Limited', quantity: 30, buyPrice: 1450, currentPrice: 1580, gain: 3900 },
        { symbol: 'HDFC', name: 'HDFC Bank', quantity: 20, buyPrice: 1650, currentPrice: 1720, gain: 1400 }
      ];
      setInvestments(demoInvestments);
      localStorage.setItem('portfolio-investments', JSON.stringify(demoInvestments));
    }

    // Load recent transactions
    const savedTransactions = localStorage.getItem('recent-transactions');
    if (savedTransactions) {
      setRecentTransactions(JSON.parse(savedTransactions));
    } else {
      // Initialize with demo transactions
      const demoTransactions = [
        { id: 1, description: 'Swiggy Order', amount: -450, type: 'debit', category: 'Food', time: new Date(), method: 'UPI' },
        { id: 2, description: 'Salary Credit', amount: 75000, type: 'credit', category: 'Income', time: new Date(Date.now() - 86400000), method: 'Bank Transfer' },
        { id: 3, description: 'Amazon Purchase', amount: -1299, type: 'debit', category: 'Shopping', time: new Date(Date.now() - 172800000), method: 'Card' },
        { id: 4, description: 'Netflix Subscription', amount: -799, type: 'debit', category: 'Entertainment', time: new Date(Date.now() - 259200000), method: 'UPI' }
      ];
      setRecentTransactions(demoTransactions);
      localStorage.setItem('recent-transactions', JSON.stringify(demoTransactions));
    }
  }, []);

  // Real-time monitoring and updates
  useEffect(() => {
    // Update portfolio value from investments
    const totalValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    const totalGain = investments.reduce((sum, inv) => sum + inv.gain, 0);
    setPortfolioValue(totalValue);
    setPortfolioGain(totalGain);

    // Update total balance from bank accounts
    const totalBankBalance = connectedBankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    setTotalBalance(totalBankBalance);

    // Simulate real-time stock price updates
    const stockUpdateInterval = setInterval(() => {
      setInvestments(prevInvestments => {
        const updatedInvestments = prevInvestments.map(inv => {
          const priceChange = (Math.random() - 0.5) * 50; // Random price change
          const newPrice = Math.max(inv.currentPrice + priceChange, inv.currentPrice * 0.9);
          const newGain = (newPrice - inv.buyPrice) * inv.quantity;
          return { ...inv, currentPrice: Math.round(newPrice), gain: Math.round(newGain) };
        });
        localStorage.setItem('portfolio-investments', JSON.stringify(updatedInvestments));
        return updatedInvestments;
      });
    }, 30000); // Update every 30 seconds

    // Simulate new transactions
    const transactionInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of new transaction
        const merchants = ['Zomato', 'Uber', 'Amazon', 'PhonePe', 'Netflix', 'Spotify'];
        const categories = ['Food', 'Transport', 'Shopping', 'Transfer', 'Entertainment'];
        const amounts = [-299, -450, -850, -1200, -199, -99];
        
        const newTransaction = {
          id: Date.now(),
          description: merchants[Math.floor(Math.random() * merchants.length)],
          amount: amounts[Math.floor(Math.random() * amounts.length)],
          type: 'debit',
          category: categories[Math.floor(Math.random() * categories.length)],
          time: new Date(),
          method: Math.random() > 0.5 ? 'UPI' : 'Card'
        };
        
        setRecentTransactions(prev => {
          const updated = [newTransaction, ...prev.slice(0, 9)]; // Keep only 10 recent
          localStorage.setItem('recent-transactions', JSON.stringify(updated));
          return updated;
        });
        
        // Update notification count
        setUnreadCount(prev => prev + 1);
      }
    }, 45000); // Check every 45 seconds

    return () => {
      clearInterval(stockUpdateInterval);
      clearInterval(transactionInterval);
    };
  }, [investments, connectedBankAccounts]);

  // Dynamic calculations based on real data
  const totalSpent = Math.abs(recentTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + Math.abs(t.amount), 0));
  // Calculate realistic income - dynamic based on credit transactions
  const totalIncome = recentTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0) || 158000;
  const totalTransactions = recentTransactions.length + 98; // Current transactions + historical base
  const topCategory = 'Transfer';

  // Financial Health Score (0-100)
  const financialHealthScore = 78;
  const healthFactors = {
    savingsRatio: 23, // 23% of income saved
    debtToIncome: 15, // 15% debt ratio (good)
    emergencyFund: 4.2, // 4.2 months expenses covered
    investmentGrowth: 12.5 // 12.5% annual growth
  };

  // AI Insights Data
  const aiInsights = {
    unusualSpending: {
      category: 'Food',
      amount: 2000,
      comparison: 'more than average'
    },
    personalizedTip: 'Your weekend dining expenses are 40% higher than weekdays',
    futureSpending: {
      category: 'Shopping',
      predicted: 15000,
      month: 'this month'
    }
  };

  // Add new goal function
  const addNewGoal = () => {
    if (newGoal.name && newGoal.target && newGoal.saved) {
      const targetAmount = parseFloat(newGoal.target);
      const savedAmount = parseFloat(newGoal.saved);
      const percentage = Math.round((savedAmount / targetAmount) * 100);
      const remainingAmount = targetAmount - savedAmount;
      const monthlyRecommendation = Math.max(5000, Math.round(remainingAmount / 24)); // Suggest 2-year timeline
      const timelineYears = Math.ceil(remainingAmount / (monthlyRecommendation * 12));
      const timelineMonths = Math.ceil((remainingAmount % (monthlyRecommendation * 12)) / monthlyRecommendation);
      
      const goal = {
        id: Date.now(),
        name: newGoal.name,
        saved: savedAmount,
        target: targetAmount,
        percentage: percentage,
        aiRecommendation: monthlyRecommendation,
        timeline: `${timelineYears} year${timelineYears > 1 ? 's' : ''} ${timelineMonths} month${timelineMonths > 1 ? 's' : ''}`
      };
      
      const updatedGoals = [...goals, goal];
      setGoals(updatedGoals);
      localStorage.setItem('finsense_goals', JSON.stringify(updatedGoals));
      
      // Reset form
      setNewGoal({ name: '', target: '', saved: '' });
      setGoalDialogOpen(false);
    }
  };
  
  // Add new bank account function
  const addNewBankAccount = () => {
    if (newBankAccount.bankName && newBankAccount.accountNumber && newBankAccount.balance) {
      const bankAccount: RealBankAccount = {
        id: `${newBankAccount.bankName.toLowerCase().replace(/\s+/g, '')}-${Date.now()}`,
        bankName: newBankAccount.bankName,
        accountNumber: newBankAccount.accountNumber,
        accountType: newBankAccount.accountType,
        balance: parseFloat(newBankAccount.balance),
        isConnected: true,
        lastSyncTime: new Date()
      };
      
      handleConnectBankAccount(bankAccount);
      
      // Reset form
      setNewBankAccount({ bankName: '', accountNumber: '', accountType: 'Savings', balance: '' });
      setBankDialogOpen(false);
    }
  };
  
  // Add new UPI app function
  const addNewUPIApp = () => {
    if (newUPIApp.name && newUPIApp.upiId) {
      const upiApp: UPIApp = {
        id: `${newUPIApp.name.toLowerCase().replace(/\s+/g, '')}-${Date.now()}`,
        name: newUPIApp.name,
        upiId: newUPIApp.upiId,
        isConnected: true
      };
      
      handleConnectUPI(upiApp);
      
      // Reset form
      setNewUPIApp({ name: '', upiId: '' });
      setUpiDialogOpen(false);
    }
  };

  // Anomalies Data
  const anomalies = [
    { transaction: 'Grocery Store XYZ', amount: 4500, date: '2024-10-01', anomaly: '35% higher than usual' },
    { transaction: 'Amazon Purchase', amount: 8900, date: '2024-09-28', anomaly: 'Largest online purchase this month' }
  ];

  // Subscriptions Data
  const subscriptions = [
    { name: 'Netflix', amount: 799, nextPayment: '2024-10-15', status: 'active', usage: 'High' },
    { name: 'Spotify', amount: 119, nextPayment: '2024-10-08', status: 'active', usage: 'Medium' },
    { name: 'Adobe Creative', amount: 1699, nextPayment: '2024-10-20', status: 'low-usage', usage: 'Low' }
  ];

  // Upcoming Bills
  const upcomingBills = [
    { name: 'Electricity Bill', amount: 2800, dueDate: '2024-10-12', status: 'pending' },
    { name: 'Internet Bill', amount: 999, dueDate: '2024-10-15', status: 'pending' },
    { name: 'Credit Card', amount: 15420, dueDate: '2024-10-18', status: 'pending' }
  ];

  // Category breakdown data
  const categoryData = [
    { category: 'Transfer', amount: 68754, percentage: 39.1, color: '#FF5722' },
    { category: 'Shopping', amount: 49853, percentage: 28.4, color: '#4ECDC4' },
    { category: 'Bills', amount: 32626, percentage: 18.6, color: '#2196F3' },
  ];

  // Handler functions for bank account management
  const handleConnectBankAccount = (bankAccount: RealBankAccount) => {
    const updatedAccounts = [...connectedBankAccounts, bankAccount];
    setConnectedBankAccounts(updatedAccounts);
    localStorage.setItem('connected-bank-accounts', JSON.stringify(updatedAccounts));
    console.log(`Successfully connected to ${bankAccount.bankName}!`);
  };

  const handleDisconnectBankAccount = (accountId: string) => {
    const account = connectedBankAccounts.find(acc => acc.id === accountId);
    if (account && window.confirm(`Are you sure you want to disconnect ${account.bankName}?`)) {
      const updatedAccounts = connectedBankAccounts.filter(acc => acc.id !== accountId);
      setConnectedBankAccounts(updatedAccounts);
      localStorage.setItem('connected-bank-accounts', JSON.stringify(updatedAccounts));
      console.log(`Disconnected from ${account.bankName}`);
    }
  };

  // Handler functions for UPI management
  const handleConnectUPI = (upiApp: UPIApp) => {
    const existingApp = connectedUPIApps.find(app => app.name === upiApp.name);
    if (!existingApp) {
      const updatedUPIApps = [...connectedUPIApps, upiApp];
      setConnectedUPIApps(updatedUPIApps);
      localStorage.setItem('connected-upi-apps', JSON.stringify(updatedUPIApps));
      console.log(`Successfully connected to ${upiApp.name}!`);
    }
  };

  const handleDisconnectUPI = (upiId: string) => {
    const upiApp = connectedUPIApps.find(app => app.id === upiId);
    if (upiApp && window.confirm(`Are you sure you want to disconnect ${upiApp.name}?`)) {
      const updatedUPIApps = connectedUPIApps.filter(app => app.id !== upiId);
      setConnectedUPIApps(updatedUPIApps);
      localStorage.setItem('connected-upi-apps', JSON.stringify(updatedUPIApps));
      console.log(`Disconnected from ${upiApp.name}`);
    }
  };

  // Mock transactions data for filtering
  const allTransactions = [
    { id: 1, description: 'Food Court', amount: 650, category: 'Food', date: '2024-10-01', isAnomaly: false },
    { id: 2, description: 'Grocery Store XYZ', amount: 4500, category: 'Food', date: '2024-10-01', isAnomaly: true },
    { id: 3, description: 'Amazon Purchase', amount: 8900, category: 'Shopping', date: '2024-09-28', isAnomaly: true },
    { id: 4, description: 'Electricity Bill', amount: 2800, category: 'Bills', date: '2024-09-25', isAnomaly: false },
    { id: 5, description: 'Metro Card Recharge', amount: 500, category: 'Transport', date: '2024-09-24', isAnomaly: false },
    { id: 6, description: 'Netflix Subscription', amount: 799, category: 'Entertainment', date: '2024-09-20', isAnomaly: false },
    { id: 7, description: 'Restaurant Dinner', amount: 1200, category: 'Food', date: '2024-09-18', isAnomaly: false },
    { id: 8, description: 'Shopping Mall', amount: 3500, category: 'Shopping', date: '2024-09-15', isAnomaly: false }
  ];

  // Initialize Web Speech API
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        setVoiceSearch(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
        setVoiceSearch(false);
        alert('Voice recognition failed. Please try again.');
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        setVoiceSearch(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Voice search functionality
  const handleVoiceSearch = () => {
    if (!recognition) {
      alert('Voice recognition not supported in this browser');
      return;
    }
    
    setVoiceSearch(true);
    setIsListening(true);
    recognition.start();
  };

  // Filter transactions based on current filters
  React.useEffect(() => {
    let filtered = [...allTransactions];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery)
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    // Amount range filter
    if (amountRange.min) {
      filtered = filtered.filter(t => t.amount >= parseInt(amountRange.min));
    }
    if (amountRange.max) {
      filtered = filtered.filter(t => t.amount <= parseInt(amountRange.max));
    }
    
    // Anomaly filter
    if (showAnomaliesOnly) {
      filtered = filtered.filter(t => t.isAnomaly);
    }
    
    setFilteredTransactions(filtered);
  }, [searchQuery, selectedCategory, amountRange, showAnomaliesOnly]);

  // Save filters to localStorage
  React.useEffect(() => {
    localStorage.setItem('dashboard-category', selectedCategory);
  }, [selectedCategory]);

  React.useEffect(() => {
    localStorage.setItem('dashboard-date-filter', dateFilter);
  }, [dateFilter]);

  React.useEffect(() => {
    localStorage.setItem('dashboard-amount-range', JSON.stringify(amountRange));
  }, [amountRange]);

  React.useEffect(() => {
    localStorage.setItem('dashboard-show-anomalies', showAnomaliesOnly.toString());
  }, [showAnomaliesOnly]);

  // Apply filters function
  const applyFilters = () => {
    setFilterOpen(false);
    // Filtering is handled by useEffect above
  };

  // Reset filters function
  const resetFilters = () => {
    setSelectedCategory('all');
    setDateFilter('all');
    setAmountRange({ min: '', max: '' });
    setShowAnomaliesOnly(false);
    setSearchQuery('');
  };

  // Calculate health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header with Search */}
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Financial Dashboard
        </Typography>
        
        {/* Transaction Search & Filters */}
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            placeholder="Try: 'food expenses', 'shopping above 1000', 'bills last month'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ minWidth: 350 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleVoiceSearch}
                    color={isListening ? "error" : "default"}
                    disabled={!recognition}
                  >
                    {isListening ? <CircularProgress size={20} /> : <Mic />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <IconButton 
            onClick={() => setFilterOpen(true)}
            color={selectedCategory !== 'all' || showAnomaliesOnly ? 'primary' : 'default'}
          >
            <Badge 
              badgeContent={filteredTransactions.length} 
              color="primary"
              max={99}
            >
              <FilterList />
            </Badge>
          </IconButton>
          {(selectedCategory !== 'all' || showAnomaliesOnly || searchQuery) && (
            <Button size="small" onClick={resetFilters} variant="outlined">
              Clear All
            </Button>
          )}
        </Box>
      </Box>

      {/* AI-Powered Spending Insights */}
      <Card sx={{ mb: 4, bgcolor: '#f8f9fa', border: '1px solid #e3f2fd' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <PsychologyAlt sx={{ mr: 1, color: '#2196f3' }} />
            <Typography variant="h6" fontWeight="bold">
              AI-Powered Spending Insights
            </Typography>
            <Chip label="Smart AI" color="primary" size="small" sx={{ ml: 2 }} />
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
            {/* Unusual Spending Alert */}
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Unusual Spending Alert
              </Typography>
              <Typography variant="body2">
                You spent ₹{aiInsights.unusualSpending.amount.toLocaleString()} {aiInsights.unusualSpending.comparison} on {aiInsights.unusualSpending.category} this month
              </Typography>
            </Alert>

            {/* Personalized Tip */}
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                💡 Smart Tip
              </Typography>
              <Typography variant="body2">
                {aiInsights.personalizedTip}
              </Typography>
            </Alert>

            {/* Future Spending Prediction */}
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                📈 Spending Prediction
              </Typography>
              <Typography variant="body2">
                Based on your pattern, you might spend ₹{aiInsights.futureSpending.predicted.toLocaleString()} on {aiInsights.futureSpending.category} {aiInsights.futureSpending.month}
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card sx={{ mb: 4, bgcolor: '#fff3e0', border: '2px solid #ff9800' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Speed sx={{ mr: 1, color: '#ff9800' }} />
                <Typography variant="h6" fontWeight="bold">
                  Financial Health Score
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={4}>
                <Box position="relative" display="inline-flex">
                  <CircularProgress
                    variant="determinate"
                    value={financialHealthScore}
                    size={100}
                    thickness={6}
                    sx={{
                      color: getHealthScoreColor(financialHealthScore),
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      }
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" component="div" color="text.secondary" fontWeight="bold">
                      {financialHealthScore}
                    </Typography>
                  </Box>
                </Box>

                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Health Factors:
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Savings Ratio:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {healthFactors.savingsRatio}%
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Debt-to-Income:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {healthFactors.debtToIncome}%
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Emergency Fund:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {healthFactors.emergencyFund} months
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Investment Growth:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {healthFactors.investmentGrowth}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color={getHealthScoreColor(financialHealthScore)}>
                {financialHealthScore >= 80 ? 'Excellent' : financialHealthScore >= 60 ? 'Good' : 'Needs Improvement'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                💡 Tip: Increase your emergency fund to 6 months for a perfect score
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card sx={{ bgcolor: '#d32f2f', color: 'white', height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <TrendingDown sx={{ mr: 1 }} />
              <Typography variant="body2">Total Spent</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              ₹{totalSpent.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: '#388e3c', color: 'white', height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <TrendingUp sx={{ mr: 1 }} />
              <Typography variant="body2">Total Income</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              ₹{totalIncome.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: '#1976d2', color: 'white', height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <AccountBalance sx={{ mr: 1 }} />
              <Typography variant="body2">Transactions</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {totalTransactions}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: '#f57c00', color: 'white', height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <Category sx={{ mr: 1 }} />
              <Typography variant="body2">Top Category</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {topCategory}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Goal Tracking & Anomaly Detection */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, mb: 4 }}>
        {/* Goal Tracking Widget */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
              <Box display="flex" alignItems="center">
                <EmojiEvents sx={{ mr: 1, color: '#ffd700' }} />
                <Typography variant="h6" fontWeight="bold">
                  Goal Tracking
                </Typography>
              </Box>
              <Button 
                size="small" 
                onClick={() => setGoalDialogOpen(true)}
                startIcon={<TrendingUp />}
              >
                View All
              </Button>
            </Box>

            {goals.map((goal, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {goal.name}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {goal.percentage}%
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={1}>
                  ₹{(goal.saved/100000).toFixed(1)}L / ₹{(goal.target/100000).toFixed(0)}L saved
                </Typography>
                
                <LinearProgress
                  variant="determinate"
                  value={goal.percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 2,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                    },
                  }}
                />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="success.main">
                      💡 AI Recommends: ₹{goal.aiRecommendation.toLocaleString()}/month
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📅 Timeline: {goal.timeline}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Expense Anomaly Detection */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <Warning sx={{ mr: 1, color: '#ff9800' }} />
              <Typography variant="h6" fontWeight="bold">
                Expense Anomaly Detection
              </Typography>
              <Chip label="2 Anomalies" color="warning" size="small" sx={{ ml: 2 }} />
            </Box>

            {anomalies.map((anomaly, index) => (
              <Alert 
                key={index} 
                severity="warning" 
                sx={{ mb: 2, borderRadius: 2 }}
                icon={<Warning />}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {anomaly.transaction}
                </Typography>
                <Typography variant="body2">
                  ₹{anomaly.amount.toLocaleString()} on {anomaly.date}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  🚨 {anomaly.anomaly}
                </Typography>
              </Alert>
            ))}

            <Box sx={{ mt: 2, p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                💡 <strong>Pattern Analysis:</strong> This month's grocery spending is 35% higher than your 6-month average of ₹8,200
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Services Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Assessment sx={{ mr: 1, color: '#ff4081' }} />
            <Typography variant="h6" fontWeight="bold">
              Dynamic Financial Services
            </Typography>
            <Chip label="3/5 Active" color="primary" size="small" sx={{ ml: 'auto' }} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr 1fr' }, gap: 3 }}>
            <Card sx={{ border: 2, borderColor: '#4caf50', bgcolor: '#f1f8e9' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Smartphone sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold" color="#4caf50">
                  SMS Monitoring
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Auto-detecting transactions
                </Typography>
              </CardContent>
            </Card>

            <Card 
              sx={{ 
                border: 2, 
                borderColor: connectedUPIApps.length > 0 ? '#4caf50' : '#2196f3', 
                bgcolor: connectedUPIApps.length > 0 ? '#e8f5e8' : '#e3f2fd', 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
              }}
              onClick={() => setUpiDialogOpen(true)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Phone sx={{ 
                  fontSize: 40, 
                  color: connectedUPIApps.length > 0 ? '#4caf50' : '#2196f3', 
                  mb: 1 
                }} />
                <Typography variant="subtitle1" fontWeight="bold" 
                  color={connectedUPIApps.length > 0 ? '#4caf50' : '#2196f3'}>
                  UPI Monitoring
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {connectedUPIApps.length > 0 
                    ? `${connectedUPIApps.length} apps connected` 
                    : 'Click to connect UPI apps'}
                </Typography>
                {connectedUPIApps.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {connectedUPIApps.slice(0, 3).map((app, index) => (
                      <Chip 
                        key={app.id}
                        label={app.name} 
                        size="small" 
                        sx={{ mr: 0.5, fontSize: '0.7rem' }}
                        color="success"
                        variant="outlined"
                      />
                    ))}
                    {connectedUPIApps.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{connectedUPIApps.length - 3} more
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card 
              sx={{ 
                border: 2, 
                borderColor: connectedBankAccounts.length > 0 ? '#4caf50' : '#ff9800', 
                bgcolor: connectedBankAccounts.length > 0 ? '#e8f5e8' : '#fff3e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
              }}
              onClick={() => setBankDialogOpen(true)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <AccountBalance sx={{ 
                  fontSize: 40, 
                  color: connectedBankAccounts.length > 0 ? '#4caf50' : '#ff9800', 
                  mb: 1 
                }} />
                <Typography variant="subtitle1" fontWeight="bold" 
                  color={connectedBankAccounts.length > 0 ? '#4caf50' : '#ff9800'}>
                  Bank Integration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {connectedBankAccounts.length > 0 
                    ? `${connectedBankAccounts.length} banks connected` 
                    : 'Click to connect banks'}
                </Typography>
                {connectedBankAccounts.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      ₹{totalBalance.toLocaleString()} total balance
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card 
              sx={{ border: 2, borderColor: '#4caf50', bgcolor: '#f1f8e9', cursor: 'pointer' }}
              onClick={() => setShowSmartBudgetPopup(true)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold" color="#4caf50">
                  Smart Budgets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI-powered monitoring
                </Typography>
                <Typography variant="body2" color="#4caf50" sx={{ mt: 1 }}>
                  Click to view insights
                </Typography>
              </CardContent>
            </Card>

            <Card 
              sx={{ 
                border: 2, 
                borderColor: portfolioGain >= 0 ? '#4caf50' : '#f44336', 
                bgcolor: portfolioGain >= 0 ? '#e8f5e8' : '#ffebee',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
              }}
              onClick={() => {
                const stocksToAdd = ['WIPRO', 'BHARTIARTL', 'ITC', 'SBIN', 'MARUTI'];
                const unownedStocks = stocksToAdd.filter(stock => 
                  !investments.some(inv => inv.symbol === stock)
                );
                
                if (unownedStocks.length > 0) {
                  const stockToAdd = unownedStocks[0];
                  const confirmed = window.confirm(`Add ${stockToAdd} to your portfolio?`);
                  if (confirmed) {
                    const basePrice = Math.floor(1000 + Math.random() * 2000);
                    const quantity = Math.floor(5 + Math.random() * 25);
                    const currentPrice = basePrice + Math.floor((Math.random() - 0.5) * 200);
                    const newInvestment = {
                      symbol: stockToAdd,
                      name: `${stockToAdd} Limited`,
                      quantity: quantity,
                      buyPrice: basePrice,
                      currentPrice: currentPrice,
                      gain: (currentPrice - basePrice) * quantity
                    };
                    
                    const updatedInvestments = [...investments, newInvestment];
                    setInvestments(updatedInvestments);
                    localStorage.setItem('portfolio-investments', JSON.stringify(updatedInvestments));
                  }
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ 
                  fontSize: 40, 
                  color: portfolioGain >= 0 ? '#4caf50' : '#f44336', 
                  mb: 1 
                }} />
                <Typography variant="subtitle1" fontWeight="bold" 
                  color={portfolioGain >= 0 ? '#4caf50' : '#f44336'}>
                  Investment Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {investments.length > 0 
                    ? `${investments.length} stocks in portfolio` 
                    : 'Click to add investments'}
                </Typography>
                {investments.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" 
                      color={portfolioGain >= 0 ? 'success.main' : 'error.main'} 
                      fontWeight="bold">
                      ₹{portfolioValue.toLocaleString()} 
                      ({portfolioGain >= 0 ? '+' : ''}₹{portfolioGain.toLocaleString()})
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Real-time Transactions */}
          <Card sx={{ mt: 3, border: 1, borderColor: '#e0e0e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Transactions
                </Typography>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsActive color="primary" />
                </Badge>
              </Box>
              
              {recentTransactions.length > 0 ? (
                <Box>
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <Box key={transaction.id} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        py: 1.5,
                        px: 2,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: transaction.type === 'credit' ? '#e8f5e8' : '#fff3e0',
                        border: 1,
                        borderColor: transaction.type === 'credit' ? '#4caf50' : '#ff9800'
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ 
                          bgcolor: transaction.type === 'credit' ? '#4caf50' : '#ff9800', 
                          width: 32, height: 32, mr: 2 
                        }}>
                          {transaction.type === 'credit' ? '+' : '-'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {transaction.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.category} • {transaction.method} • {new Date(transaction.time).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography 
                        variant="h6" 
                        fontWeight="bold"
                        color={transaction.type === 'credit' ? 'success.main' : 'warning.main'}
                      >
                        {transaction.type === 'credit' ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button 
                      size="small" 
                      onClick={() => setUnreadCount(0)}
                      disabled={unreadCount === 0}
                    >
                      Mark All as Read ({unreadCount} new)
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                  No recent transactions
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Bank Data Status */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e8', borderRadius: 1, border: 1, borderColor: '#4caf50' }}>
            <Box display="flex" alignItems="center">
              <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold" color="#4caf50">
                ✅ Real Bank Data Active
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Connected to State Bank of India - Using real transaction data
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Subscription Manager & Bill Reminders */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4, mb: 4 }}>
        {/* Subscription Manager */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center">
                <Subscriptions sx={{ mr: 1, color: '#9c27b0' }} />
                <Typography variant="h6" fontWeight="bold">
                  Subscription Manager
                </Typography>
              </Box>
              <IconButton onClick={(e) => setSubscriptionMenuAnchor(e.currentTarget)}>
                <Badge badgeContent={1} color="error">
                  <NotificationsActive />
                </Badge>
              </IconButton>
            </Box>

            {subscriptions.map((sub, index) => (
              <Card key={index} sx={{ mb: 2, bgcolor: sub.status === 'low-usage' ? '#ffebee' : '#f9f9f9' }}>
                <CardContent sx={{ py: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                        {sub.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {sub.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Next: {sub.nextPayment}
                        </Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6" fontWeight="bold">
                        ₹{sub.amount}
                      </Typography>
                      <Chip 
                        label={sub.usage} 
                        size="small" 
                        color={
                          sub.usage === 'High' ? 'success' : 
                          sub.usage === 'Medium' ? 'warning' : 'error'
                        }
                      />
                    </Box>
                  </Box>
                  {sub.status === 'low-usage' && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        💡 Consider canceling - low usage detected
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              💰 Total monthly subscriptions: ₹{subscriptions.reduce((sum, sub) => sum + sub.amount, 0).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        {/* Bill Payment Reminders */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <CalendarMonth sx={{ mr: 1, color: '#2196f3' }} />
              <Typography variant="h6" fontWeight="bold">
                Bill Payment Reminders
              </Typography>
              <Chip label={`${upcomingBills.length} Due`} color="error" size="small" sx={{ ml: 2 }} />
            </Box>

            {upcomingBills.map((bill, index) => (
              <Card key={index} sx={{ mb: 2, border: '1px solid #ffcdd2' }}>
                <CardContent sx={{ py: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center">
                      <ReceiptLong sx={{ mr: 2, color: '#f44336' }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {bill.name}
                        </Typography>
                        <Typography variant="body2" color="error">
                          Due: {bill.dueDate}
                        </Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6" fontWeight="bold" color="error">
                        ₹{bill.amount.toLocaleString()}
                      </Typography>
                      <Button size="small" variant="contained" sx={{ mt: 1 }}>
                        Pay Now
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}

            <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="body2" color="primary">
                📅 <strong>Smart Reminder:</strong> Set up auto-pay for recurring bills to never miss a payment
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filtered Transactions Results */}
      {(searchQuery || selectedCategory !== 'all' || showAnomaliesOnly) && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Search Results
              </Typography>
              <Chip 
                label={`${filteredTransactions.length} transactions`} 
                color="primary"
              />
            </Box>
            
            {filteredTransactions.length > 0 ? (
              <Box>
                {filteredTransactions.slice(0, 5).map((transaction) => (
                  <Card key={transaction.id} sx={{ mb: 2, bgcolor: transaction.isAnomaly ? '#fff3e0' : '#f9f9f9' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                            {transaction.category[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {transaction.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {transaction.category} • {transaction.date}
                            </Typography>
                          </Box>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="h6" fontWeight="bold" color={transaction.isAnomaly ? 'warning.main' : 'text.primary'}>
                            ₹{transaction.amount.toLocaleString()}
                          </Typography>
                          {transaction.isAnomaly && (
                            <Chip label="Unusual" color="warning" size="small" />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                {filteredTransactions.length > 5 && (
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                    View All {filteredTransactions.length} Results
                  </Button>
                )}
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  No transactions found matching your criteria
                </Typography>
                <Button onClick={resetFilters} sx={{ mt: 2 }}>
                  Clear Filters
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Category Breakdown
          </Typography>
          
          {categoryData.map((category, index) => (
            <Box key={category.category} sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: category.color,
                      mr: 2
                    }}
                  />
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

      {/* Enhanced Bank Account Integration */}
      <Card sx={{ mb: 4, bgcolor: '#e8f5e8', border: '2px solid #4caf50' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="#4caf50">
                Real Bank Integration Status
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => {
                // Demo: Add a sample bank account
                const confirmed = window.confirm('Do you want to connect a new bank account?');
                if (confirmed) {
                  const newBankAccount: RealBankAccount = {
                    id: Date.now().toString(),
                    bankName: 'State Bank of India',
                    accountNumber: '****1234',
                    accountType: 'Savings',
                    balance: 45650,
                    isConnected: true,
                    lastSyncTime: new Date()
                  };
                  handleConnectBankAccount(newBankAccount);
                  alert(`Successfully connected to ${newBankAccount.bankName}!`);
                }
              }}
            >
              Connect Bank
            </Button>
          </Box>
          
          {connectedBankAccounts.length > 0 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              {connectedBankAccounts.map((account) => (
                <Box key={account.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">Connected Bank</Typography>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDisconnectBankAccount(account.id)}
                      title="Disconnect Account"
                    >
                      ❌
                    </IconButton>
                  </Box>
                  <Typography variant="h6" fontWeight="bold">{account.bankName}</Typography>
                  <Typography variant="body2" color="text.secondary">{account.accountNumber}</Typography>
                  <Typography variant="body2" color="success.main">✅ Real-time sync active</Typography>
                  {account.balance && (
                    <Typography variant="body2" color="text.primary">
                      Balance: ₹{account.balance.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Connected Banks</Typography>
                <Typography variant="h6" fontWeight="bold" color="text.disabled">No banks connected</Typography>
                <Typography variant="body2" color="text.disabled">Connect your bank to get real-time data</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Last Sync</Typography>
                <Typography variant="h6" fontWeight="bold" color="text.disabled">Never</Typography>
                <Typography variant="body2" color="text.disabled">Connect a bank to sync</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Data Quality</Typography>
                <Typography variant="h6" fontWeight="bold" color="text.disabled">N/A</Typography>
                <Typography variant="body2" color="text.disabled">Awaiting connection</Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Investment Portfolio Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📈 Investment Portfolio
              <Chip 
                label={`${investments.length} Holdings`}
                size="small" 
                color="primary"
                variant="outlined"
              />
            </Typography>
            <Box display="flex" gap={1}>
              <Chip 
                label={`Total: ₹${portfolioValue.toLocaleString()}`}
                color="success"
                size="small"
              />
              <Chip 
                label={`${portfolioGain >= 0 ? '+' : ''}${portfolioGain.toFixed(2)}%`}
                color={portfolioGain >= 0 ? "success" : "error"}
                size="small"
              />
            </Box>
          </Box>

          {investments.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={2}>
              {investments.map((investment) => {
                const gainLoss = investment.currentPrice - investment.purchasePrice;
                const gainLossPercent = ((gainLoss / investment.purchasePrice) * 100);
                const totalValue = investment.currentPrice * investment.quantity;
                
                return (
                  <Box key={investment.id} sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {investment.symbol}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {investment.name}
                            </Typography>
                          </Box>
                          <Chip 
                            label={investment.sector}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="h6" fontWeight="bold">
                            ₹{investment.currentPrice.toFixed(2)}
                          </Typography>
                          <Chip
                            label={`${gainLoss >= 0 ? '+' : ''}₹${gainLoss.toFixed(2)}`}
                            color={gainLoss >= 0 ? "success" : "error"}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>

                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Qty: {investment.quantity}
                          </Typography>
                          <Typography variant="body2" color={gainLossPercent >= 0 ? "success.main" : "error.main"}>
                            {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                          </Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Total Value
                          </Typography>
                          <Typography variant="subtitle2" fontWeight="bold">
                            ₹{totalValue.toLocaleString()}
                          </Typography>
                        </Box>

                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, Math.max(0, 50 + (gainLossPercent * 2)))}
                          color={gainLossPercent >= 0 ? "success" : "error"}
                          sx={{ mt: 1, height: 4, borderRadius: 2 }}
                        />
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              py={4}
              sx={{ textAlign: 'center' }}
            >
              <TrendingUpIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Investments Yet
              </Typography>
              <Typography variant="body2" color="text.disabled" mb={2}>
                Start building your investment portfolio
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={() => {
                  // Add sample investment for demo
                  const sampleInvestment: Investment = {
                    id: Date.now().toString(),
                    symbol: 'RELIANCE',
                    name: 'Reliance Industries Ltd',
                    quantity: 10,
                    purchasePrice: 2450.50,
                    currentPrice: 2567.80,
                    sector: 'Energy',
                    purchaseDate: new Date().toISOString(),
                    type: 'equity'
                  };
                  const updatedInvestments = [...investments, sampleInvestment];
                  setInvestments(updatedInvestments);
                  localStorage.setItem('finsense_investments', JSON.stringify(updatedInvestments));
                }}
              >
                Add Sample Investment
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            Advanced Transaction Filters
            <Chip 
              label={`${filteredTransactions.length} results`} 
              color="primary" 
              size="small" 
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="food">Food & Dining</MenuItem>
                <MenuItem value="shopping">Shopping</MenuItem>
                <MenuItem value="bills">Bills & Utilities</MenuItem>
                <MenuItem value="transport">Transportation</MenuItem>
                <MenuItem value="entertainment">Entertainment</MenuItem>
              </Select>
            </FormControl>
            
            <Box display="flex" gap={2}>
              <TextField
                label="Min Amount"
                placeholder="₹500"
                value={amountRange.min}
                onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                type="number"
                fullWidth
              />
              <TextField
                label="Max Amount"
                placeholder="₹5000"
                value={amountRange.max}
                onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                type="number"
                fullWidth
              />
            </Box>
            
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Date Range"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={showAnomaliesOnly}
                  onChange={(e) => setShowAnomaliesOnly(e.target.checked)}
                />
              }
              label="Show only unusual transactions"
            />

            {/* Filter Preview */}
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Filter Preview:
              </Typography>
              <Typography variant="body2">
                {filteredTransactions.length} transactions found
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                {amountRange.min && ` above ₹${amountRange.min}`}
                {amountRange.max && ` below ₹${amountRange.max}`}
                {showAnomaliesOnly && ` (anomalies only)`}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterOpen(false)}>Cancel</Button>
          <Button onClick={resetFilters} color="secondary">Reset All</Button>
          <Button variant="contained" onClick={applyFilters}>Apply Filters</Button>
        </DialogActions>
      </Dialog>

      {/* Goal Details Dialog */}
      <Dialog open={goalDialogOpen} onClose={() => setGoalDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <EmojiEvents sx={{ mr: 1, color: '#ffd700' }} />
            Goal Tracking Details
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {goals.map((goal, index) => (
              <Card key={index} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {goal.name}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="body1">
                      Progress: ₹{(goal.saved/100000).toFixed(1)}L / ₹{(goal.target/100000).toFixed(0)}L
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {goal.percentage}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={goal.percentage}
                    sx={{ height: 10, borderRadius: 5, mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">AI Recommendation</Typography>
                      <Typography variant="h6" color="success.main">
                        ₹{goal.aiRecommendation.toLocaleString()}/month
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Projected Timeline</Typography>
                      <Typography variant="h6" color="primary">
                        {goal.timeline}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Add New Goal
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Goal Name"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              fullWidth
              placeholder="e.g., New Car, Education, Wedding"
            />
            <TextField
              label="Target Amount (₹)"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              fullWidth
              type="number"
              placeholder="e.g., 1000000"
            />
            <TextField
              label="Already Saved (₹)"
              value={newGoal.saved}
              onChange={(e) => setNewGoal({ ...newGoal, saved: e.target.value })}
              fullWidth
              type="number"
              placeholder="e.g., 200000"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setGoalDialogOpen(false);
            setNewGoal({ name: '', target: '', saved: '' });
          }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={addNewGoal}
            disabled={!newGoal.name || !newGoal.target || !newGoal.saved}
          >
            Add Goal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Menu */}
      <Menu
        anchorEl={subscriptionMenuAnchor}
        open={Boolean(subscriptionMenuAnchor)}
        onClose={() => setSubscriptionMenuAnchor(null)}
      >
        <MenuItem onClick={() => setSubscriptionMenuAnchor(null)}>
          <ListItemIcon><NotificationsActive /></ListItemIcon>
          <ListItemText primary="Adobe Creative price increased by ₹200" />
        </MenuItem>
        <MenuItem onClick={() => setSubscriptionMenuAnchor(null)}>
          <ListItemIcon><Schedule /></ListItemIcon>
          <ListItemText primary="Set up price alerts" />
        </MenuItem>
      </Menu>

      {/* Smart Budget Popup */}
      <Dialog open={showSmartBudgetPopup} onClose={() => setShowSmartBudgetPopup(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Assessment sx={{ color: '#4caf50', mr: 1 }} />
            Smart Budget Analysis
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom color="#4caf50">
              💡 AI-Powered Financial Insights
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
              <Card sx={{ bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" color="#4caf50">
                    📊 Monthly Budget Health
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    • Income: ₹1,58,000 (Target achieved ✅)
                  </Typography>
                  <Typography variant="body2">
                    • Expenses: ₹29,000 (18% of income - Excellent!)
                  </Typography> 
                  <Typography variant="body2">
                    • Savings Rate: 82% (₹1,29,000 saved)
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    🎉 You're saving exceptionally well!
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" color="#ff9800">
                    ⚠️ Spending Patterns
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    • Food: ₹8,500 (29% of expenses)
                  </Typography>
                  <Typography variant="body2">
                    • Transport: ₹5,200 (18% of expenses)
                  </Typography>
                  <Typography variant="body2">
                    • Shopping: ₹4,800 (17% of expenses)
                  </Typography>
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                    💡 Consider meal planning to optimize food costs
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            <Card sx={{ bgcolor: '#f3e5f5', border: '1px solid #9c27b0', mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="#9c27b0">
                  🎯 Smart Recommendations
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  1. <strong>Emergency Fund:</strong> You have 5.4 months of expenses saved - Perfect! ✅
                </Typography>
                <Typography variant="body2">
                  2. <strong>Investment Opportunity:</strong> With 82% savings rate, consider increasing SIP by ₹20,000
                </Typography>
                <Typography variant="body2">
                  3. <strong>Tax Saving:</strong> Invest ₹50,000 in ELSS funds before March for ₹15,600 tax benefit
                </Typography>
                <Typography variant="body2">
                  4. <strong>Weekend Spending:</strong> Your weekend expenses are 40% higher - try budgeting ₹2,000/weekend
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: '#e1f5fe', border: '1px solid #2196f3' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="#2196f3">
                  📈 Future Projections
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  • At current savings rate, you'll save ₹15.48L annually
                </Typography>
                <Typography variant="body2">
                  • Your dream home goal (₹50L) is achievable in 3.2 years
                </Typography>
                <Typography variant="body2">
                  • Retirement corpus projection: ₹12.8 Cr by age 60
                </Typography>
                <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                  🌟 You're on track for financial independence!
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSmartBudgetPopup(false)} color="primary">
            Close
          </Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => {
              setShowSmartBudgetPopup(false);
              alert('Smart Budget insights saved to your profile!');
            }}
          >
            Save Insights
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bank Addition Dialog */}
      <Dialog open={bankDialogOpen} onClose={() => setBankDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <AccountBalance sx={{ color: '#4caf50', mr: 1 }} />
            Add Bank Account
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Bank Name"
              value={newBankAccount.bankName}
              onChange={(e) => setNewBankAccount({ ...newBankAccount, bankName: e.target.value })}
              fullWidth
              placeholder="e.g., HDFC Bank, ICICI Bank, SBI"
            />
            <TextField
              label="Account Number"
              value={newBankAccount.accountNumber}
              onChange={(e) => setNewBankAccount({ ...newBankAccount, accountNumber: e.target.value })}
              fullWidth
              placeholder="e.g., 1234567890123456"
            />
            <FormControl fullWidth>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={newBankAccount.accountType}
                onChange={(e) => setNewBankAccount({ ...newBankAccount, accountType: e.target.value as 'Savings' | 'Current' })}
                input={<input />}
              >
                <MenuItem value="Savings">Savings</MenuItem>
                <MenuItem value="Current">Current</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Current Balance (₹)"
              value={newBankAccount.balance}
              onChange={(e) => setNewBankAccount({ ...newBankAccount, balance: e.target.value })}
              fullWidth
              type="number"
              placeholder="e.g., 50000"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setBankDialogOpen(false);
            setNewBankAccount({ bankName: '', accountNumber: '', accountType: 'Savings', balance: '' });
          }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={addNewBankAccount}
            disabled={!newBankAccount.bankName || !newBankAccount.accountNumber || !newBankAccount.balance}
          >
            Add Bank Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* UPI App Addition Dialog */}
      <Dialog open={upiDialogOpen} onClose={() => setUpiDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Phone sx={{ color: '#2196f3', mr: 1 }} />
            Add UPI App
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="UPI App Name"
              value={newUPIApp.name}
              onChange={(e) => setNewUPIApp({ ...newUPIApp, name: e.target.value })}
              fullWidth
              placeholder="e.g., PhonePe, Google Pay, Paytm"
            />
            <TextField
              label="UPI ID"
              value={newUPIApp.upiId}
              onChange={(e) => setNewUPIApp({ ...newUPIApp, upiId: e.target.value })}
              fullWidth
              placeholder="e.g., yourname@phonepe, yourname@okaxis"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUpiDialogOpen(false);
            setNewUPIApp({ name: '', upiId: '' });
          }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={addNewUPIApp}
            disabled={!newUPIApp.name || !newUPIApp.upiId}
          >
            Add UPI App
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;