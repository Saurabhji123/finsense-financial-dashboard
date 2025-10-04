import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Paper,
  Chip,
  IconButton,
  Button,
  Avatar,
  useTheme,
  alpha,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Fab,
  CircularProgress,
  Fade,
  Tooltip,
  Slide,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Add,
  PieChart,
  ShowChart,
  AccountBalance,
  Timeline,
  BarChart,
  Info,
  Warning,
  CheckCircle,
  Assessment,
  Savings,
  MonetizationOn,
  ArrowUpward,
  ArrowDownward,
  Business
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: 'stocks' | 'mutual_funds' | 'bonds' | 'crypto';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  sector?: string;
  logo?: string;
}

interface MarketData {
  index: string;
  value: number;
  change: number;
  changePercent: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`investment-tabpanel-${index}`}
      aria-labelledby={`investment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InvestmentDashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  // const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock comprehensive investment data
  const [investments] = useState<Investment[]>([
    {
      id: '1',
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      type: 'stocks',
      quantity: 25,
      avgPrice: 2350,
      currentPrice: 2425,
      invested: 58750,
      currentValue: 60625,
      dayChange: 15,
      dayChangePercent: 0.62,
      totalReturn: 1875,
      totalReturnPercent: 3.19,
      sector: 'Energy'
    },
    {
      id: '2',
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      type: 'stocks',
      quantity: 15,
      avgPrice: 3680,
      currentPrice: 3825,
      invested: 55200,
      currentValue: 57375,
      dayChange: -25,
      dayChangePercent: -0.65,
      totalReturn: 2175,
      totalReturnPercent: 3.94,
      sector: 'IT'
    },
    {
      id: '3',
      symbol: 'AXIS_BLUECHIP',
      name: 'Axis Bluechip Fund',
      type: 'mutual_funds',
      quantity: 850,
      avgPrice: 45.2,
      currentPrice: 48.7,
      invested: 38420,
      currentValue: 41395,
      dayChange: 0.3,
      dayChangePercent: 0.62,
      totalReturn: 2975,
      totalReturnPercent: 7.74,
      sector: 'Large Cap'
    },
    {
      id: '4',
      symbol: 'HDFC_SMALLCAP',
      name: 'HDFC Small Cap Fund',
      type: 'mutual_funds',
      quantity: 450,
      avgPrice: 72.8,
      currentPrice: 85.2,
      invested: 32760,
      currentValue: 38340,
      dayChange: 1.2,
      dayChangePercent: 1.43,
      totalReturn: 5580,
      totalReturnPercent: 17.03,
      sector: 'Small Cap'
    },
    {
      id: '5',
      symbol: 'BITCOIN',
      name: 'Bitcoin',
      type: 'crypto',
      quantity: 0.125,
      avgPrice: 3200000,
      currentPrice: 3450000,
      invested: 40000,
      currentValue: 43125,
      dayChange: 25000,
      dayChangePercent: 0.73,
      totalReturn: 3125,
      totalReturnPercent: 7.81,
      sector: 'Cryptocurrency'
    }
  ]);

  const marketData: MarketData[] = [
    { index: 'NIFTY 50', value: 21850.20, change: 125.30, changePercent: 0.58 },
    { index: 'SENSEX', value: 72240.15, change: 285.75, changePercent: 0.40 },
    { index: 'NIFTY BANK', value: 46320.80, change: -145.60, changePercent: -0.31 },
    { index: 'BITCOIN', value: 3450000, change: 25000, changePercent: 0.73 }
  ];

  // Calculate portfolio metrics
  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const totalGainLossPercent = (totalGainLoss / totalInvested) * 100;
  const todayGainLoss = investments.reduce((sum, inv) => sum + (inv.dayChange * inv.quantity), 0);

  // Portfolio allocation data for pie chart
  const allocationData = {
    labels: ['Stocks', 'Mutual Funds', 'Cryptocurrency', 'Bonds'],
    datasets: [{
      data: [
        investments.filter(inv => inv.type === 'stocks').reduce((sum, inv) => sum + inv.currentValue, 0),
        investments.filter(inv => inv.type === 'mutual_funds').reduce((sum, inv) => sum + inv.currentValue, 0),
        investments.filter(inv => inv.type === 'crypto').reduce((sum, inv) => sum + inv.currentValue, 0),
        0 // bonds
      ],
      backgroundColor: [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.warning.main,
        theme.palette.success.main
      ],
      borderWidth: 3,
      borderColor: theme.palette.background.paper,
    }]
  };

  // Performance chart data
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Portfolio Value',
      data: [180000, 185000, 192000, 188000, 195000, totalCurrentValue],
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      tension: 0.4,
      fill: true,
      pointBackgroundColor: theme.palette.primary.main,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
    }]
  };

  // Top gainers/losers data
  const topGainers = investments
    .filter(inv => inv.totalReturnPercent > 0)
    .sort((a, b) => b.totalReturnPercent - a.totalReturnPercent)
    .slice(0, 3);

  // const topLosers = investments
  //   .filter(inv => inv.totalReturnPercent < 0)
  //   .sort((a, b) => a.totalReturnPercent - b.totalReturnPercent)
  //   .slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stocks': return <Timeline />;
      case 'mutual_funds': return <PieChart />;
      case 'crypto': return <MonetizationOn />;
      case 'bonds': return <AccountBalance />;
      default: return <Assessment />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
    setAlertOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column">
          <CircularProgress size={80} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading your investment portfolio...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" sx={{ 
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                Investment Portfolio 📈
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Track and manage your investments in one place
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => {
                  const symbol = prompt('Enter stock symbol (e.g., RELIANCE, TCS):');
                  if (symbol) {
                    const quantity = prompt('Enter quantity:');
                    const price = prompt('Enter purchase price:');
                    if (quantity && price) {
                      alert(`Investment Added!\n\nStock: ${symbol}\nQuantity: ${quantity}\nPrice: ₹${price}\n\nThis would be saved to your portfolio.`);
                    }
                  }
                }}
                sx={{ borderRadius: 3 }}
              >
                Add Investment
              </Button>
            </Stack>
          </Box>
        </Box>
      </Fade>

      {/* Portfolio Summary Cards */}
      <Slide direction="up" in timeout={1000}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Total Portfolio Value */}
          <Box>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: 'white',
              '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Portfolio Value
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(totalCurrentValue)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                      +12.5% this month
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 60, height: 60 }}>
                    <MonetizationOn fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Total Invested */}
          <Box>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
              color: 'white',
              '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Total Invested
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(totalInvested)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      Across {investments.length} holdings
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 60, height: 60 }}>
                    <Savings fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Total Gain/Loss */}
          <Box>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${totalGainLoss >= 0 ? theme.palette.success.main : theme.palette.error.main}, ${totalGainLoss >= 0 ? theme.palette.success.dark : theme.palette.error.dark})`,
              color: 'white',
              '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Total P&L
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}% overall
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 60, height: 60 }}>
                    {totalGainLoss >= 0 ? <TrendingUp fontSize="large" /> : <TrendingDown fontSize="large" />}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Today's Change */}
          <Box>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
              color: 'white',
              '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Today's Change
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {todayGainLoss >= 0 ? '+' : ''}{formatCurrency(todayGainLoss)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      {todayGainLoss >= 0 ? <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} /> : <ArrowDownward sx={{ fontSize: 16, mr: 0.5 }} />}
                      Day's performance
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 60, height: 60 }}>
                    <Timeline fontSize="large" />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Slide>

      {/* Market Overview */}
      <Fade in timeout={1200}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 Market Overview
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
              {marketData.map((market, index) => (
                <Box key={market.index}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      {market.index}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {market.index === 'BITCOIN' ? formatCurrency(market.value) : market.value.toLocaleString()}
                    </Typography>
                    <Chip
                      label={`${market.change >= 0 ? '+' : ''}${market.changePercent.toFixed(2)}%`}
                      color={market.change >= 0 ? 'success' : 'error'}
                      size="small"
                      icon={market.change >= 0 ? <TrendingUp /> : <TrendingDown />}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Tabs for detailed views */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="Holdings" icon={<PieChart />} />
            <Tab label="Analytics" icon={<BarChart />} />
            <Tab label="Market Trends" icon={<ShowChart />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Holdings Tab */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Investment</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Avg Price</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">Invested</TableCell>
                  <TableCell align="right">Current Value</TableCell>
                  <TableCell align="right">P&L</TableCell>
                  <TableCell align="right">Day Change</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          {getTypeIcon(investment.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {investment.symbol}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {investment.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{investment.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(investment.avgPrice)}</TableCell>
                    <TableCell align="right">{formatCurrency(investment.currentPrice)}</TableCell>
                    <TableCell align="right">{formatCurrency(investment.invested)}</TableCell>
                    <TableCell align="right">{formatCurrency(investment.currentValue)}</TableCell>
                    <TableCell align="right">
                      <Typography color={investment.totalReturn >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                        {investment.totalReturn >= 0 ? '+' : ''}{formatCurrency(investment.totalReturn)}
                        <br />
                        <Typography variant="body2" component="span">
                          ({investment.totalReturnPercent >= 0 ? '+' : ''}{investment.totalReturnPercent.toFixed(2)}%)
                        </Typography>
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${investment.dayChangePercent >= 0 ? '+' : ''}${investment.dayChangePercent.toFixed(2)}%`}
                        color={investment.dayChangePercent >= 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Analytics Tab */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>Portfolio Allocation</Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut 
                    data={allocationData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { usePointStyle: true, padding: 15 }
                        }
                      },
                      cutout: '60%'
                    }}
                  />
                </Box>
              </Paper>
            </Box>
            
            <Box>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>Performance Timeline</Typography>
                <Box sx={{ height: 300 }}>
                  <Line 
                    data={performanceData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: {
                          beginAtZero: false,
                          ticks: {
                            callback: function(value) {
                              return '₹' + (value as number / 1000) + 'K';
                            }
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </Paper>
            </Box>

            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="success.main">
                  🚀 Top Performers
                </Typography>
                <List>
                  {topGainers.map((investment) => (
                    <ListItem key={investment.id}>
                      <ListItemIcon>{getTypeIcon(investment.type)}</ListItemIcon>
                      <ListItemText
                        primary={investment.symbol}
                        secondary={investment.name}
                      />
                      <Typography variant="h6" color="success.main" fontWeight="bold">
                        +{investment.totalReturnPercent.toFixed(2)}%
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>

            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📈 Investment Insights
                </Typography>
                <Stack spacing={2}>
                  <Alert severity="success" icon={<CheckCircle />}>
                    <strong>Great diversification!</strong> Your portfolio is well-balanced across different asset classes.
                  </Alert>
                  <Alert severity="info" icon={<Info />}>
                    <strong>Market outlook:</strong> Small cap funds are performing exceptionally well this quarter.
                  </Alert>
                  <Alert severity="warning" icon={<Warning />}>
                    <strong>Rebalancing tip:</strong> Consider booking profits in crypto and increasing equity allocation.
                  </Alert>
                </Stack>
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Market Trends Tab */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>📈 Sector Performance</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 2 }}>
                  {['Technology', 'Banking', 'Energy', 'Healthcare', 'Consumer'].map((sector, index) => {
                    const change = [2.5, -0.8, 1.2, 3.1, -1.5][index];
                    return (
                      <Box key={sector}>
                        <Box sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          bgcolor: alpha(change >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.1),
                          borderRadius: 2,
                          border: 1,
                          borderColor: change >= 0 ? 'success.main' : 'error.main'
                        }}>
                          <Typography variant="subtitle1" fontWeight="bold">{sector}</Typography>
                          <Typography variant="h5" color={change >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                            {change >= 0 ? '+' : ''}{change}%
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
              <Box>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>Market Trend Analysis</Typography>
                <Box sx={{ height: 300 }}>
                  <Line 
                    data={{
                      labels: ['1M', '3M', '6M', '1Y', '2Y', '5Y'],
                      datasets: [
                        {
                          label: 'NIFTY 50',
                          data: [18500, 19200, 20100, 21850, 19800, 15600],
                          borderColor: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                        {
                          label: 'Your Portfolio',
                          data: [165000, 175000, 185000, 200000, 182000, 140000],
                          borderColor: theme.palette.secondary.main,
                          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' }
                      }
                    }}
                  />
                </Box>
              </Paper>
              </Box>

              <Box>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>🔥 Trending Stocks</Typography>
                <List>
                  {[
                    { name: 'ADANIENT', change: 8.5 },
                    { name: 'BAJFINANCE', change: 5.2 },
                    { name: 'TECHM', change: 4.8 },
                    { name: 'WIPRO', change: -2.1 },
                    { name: 'SBIN', change: -1.8 }
                  ].map((stock, index) => (
                    <ListItem key={stock.name}>
                      <ListItemIcon>
                        <Business color={stock.change >= 0 ? 'success' : 'error'} />
                      </ListItemIcon>
                      <ListItemText primary={stock.name} />
                      <Chip
                        label={`${stock.change >= 0 ? '+' : ''}${stock.change}%`}
                        color={stock.change >= 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              </Box>
            </Box>
          </Box>
        </TabPanel>
      </Card>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => {
          const symbol = prompt('🚀 Quick Add Investment\n\nEnter stock symbol (e.g., RELIANCE, TCS, HDFC):');
          if (symbol) {
            const quantity = prompt(`📊 Adding ${symbol.toUpperCase()}\n\nEnter quantity:`);
            if (quantity && !isNaN(Number(quantity))) {
              const price = prompt(`💰 ${symbol.toUpperCase()} - ${quantity} shares\n\nEnter purchase price per share (₹):`);
              if (price && !isNaN(Number(price))) {
                const totalAmount = Number(quantity) * Number(price);
                const confirmed = window.confirm(`✅ Confirm Investment\n\nStock: ${symbol.toUpperCase()}\nQuantity: ${quantity} shares\nPrice: ₹${price} per share\nTotal Investment: ₹${totalAmount.toLocaleString()}\n\nAdd to portfolio?`);
                if (confirmed) {
                  alert(`🎉 Investment Added!\n\n${symbol.toUpperCase()} (${quantity} shares @ ₹${price}) has been added to your portfolio!\n\nTotal investment: ₹${totalAmount.toLocaleString()}`);
                  setAlertOpen(true);
                }
              }
            }
          }
        }}
      >
        <Add />
      </Fab>

      {/* Success Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={() => setAlertOpen(false)}
        message="Investment added successfully! � Your portfolio has been updated."
      />
    </Container>
  );
};

export default InvestmentDashboard;