import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export interface Investment {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  type: 'stock' | 'mutual_fund' | 'etf' | 'bond' | 'crypto';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  lastUpdated: Date;
  exchange?: string;
  sector?: string;
  isActive: boolean;
}

export interface Portfolio {
  id: string;
  userId: string;
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
  investments: Investment[];
  lastUpdated: Date;
}

export interface MarketData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercentage: number;
  volume: number;
  high52Week: number;
  low52Week: number;
  marketCap?: number;
  pe?: number;
  lastUpdated: Date;
}

export interface InvestmentTransaction {
  id: string;
  userId: string;
  investmentId: string;
  type: 'buy' | 'sell' | 'dividend';
  symbol: string;
  quantity: number;
  price: number;
  amount: number;
  charges: number;
  netAmount: number;
  date: Date;
  broker?: string;
  reference?: string;
}

export class InvestmentPortfolioService {
  private priceUpdateInterval?: NodeJS.Timeout;
  private isTrackingPrices = false;

  // Popular Indian stocks for simulation
  private popularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Oil & Gas', basePrice: 2450 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', basePrice: 3800 },
    { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT', basePrice: 1650 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', basePrice: 1580 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG', basePrice: 2650 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking', basePrice: 980 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', basePrice: 1050 },
    { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', basePrice: 820 },
    { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT', basePrice: 580 },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Automobile', basePrice: 10500 }
  ];

  private popularMutualFunds = [
    { symbol: 'SBI_BLUECHIP', name: 'SBI Blue Chip Fund', type: 'Large Cap', nav: 58.5 },
    { symbol: 'HDFC_TOP100', name: 'HDFC Top 100 Fund', type: 'Large Cap', nav: 765.2 },
    { symbol: 'ICICI_FOCUSED', name: 'ICICI Pru Focused Blue Chip Fund', type: 'Large Cap', nav: 45.8 },
    { symbol: 'AXIS_MIDCAP', name: 'Axis Midcap Fund', type: 'Mid Cap', nav: 68.9 },
    { symbol: 'MIRAE_LARGECAP', name: 'Mirae Asset Large Cap Fund', type: 'Large Cap', nav: 89.7 }
  ];

  // Create a sample portfolio for new users
  async createSamplePortfolio(userId: string): Promise<Portfolio> {
    console.log('📊 Creating sample investment portfolio...');

    const sampleInvestments: Investment[] = [];
    
    // Add some stocks
    const selectedStocks = this.popularStocks.slice(0, 4);
    for (const stock of selectedStocks) {
      const investment = await this.createInvestment(userId, {
        symbol: stock.symbol,
        name: stock.name,
        type: 'stock',
        quantity: Math.floor(Math.random() * 20) + 5,
        averagePrice: stock.basePrice * (0.9 + Math.random() * 0.2), // ±10% variation
        sector: stock.sector
      });
      sampleInvestments.push(investment);
    }

    // Add some mutual funds
    const selectedMFs = this.popularMutualFunds.slice(0, 2);
    for (const mf of selectedMFs) {
      const investment = await this.createInvestment(userId, {
        symbol: mf.symbol,
        name: mf.name,
        type: 'mutual_fund',
        quantity: Math.floor(Math.random() * 500) + 100,
        averagePrice: mf.nav * (0.95 + Math.random() * 0.1), // ±5% variation
      });
      sampleInvestments.push(investment);
    }

    // Calculate portfolio totals
    const portfolio = this.calculatePortfolioMetrics(userId, sampleInvestments);
    
    console.log(`✅ Created sample portfolio with ${sampleInvestments.length} investments`);
    return portfolio;
  }

  // Create a new investment
  private async createInvestment(userId: string, data: {
    symbol: string;
    name: string;
    type: Investment['type'];
    quantity: number;
    averagePrice: number;
    sector?: string;
  }): Promise<Investment> {
    
    const currentPrice = await this.getCurrentPrice(data.symbol, data.type);
    const totalInvested = data.quantity * data.averagePrice;
    const currentValue = data.quantity * currentPrice;
    const gainLoss = currentValue - totalInvested;
    const gainLossPercentage = (gainLoss / totalInvested) * 100;

    const investment: Investment = {
      id: uuidv4(),
      userId,
      symbol: data.symbol,
      name: data.name,
      type: data.type,
      quantity: data.quantity,
      averagePrice: data.averagePrice,
      currentPrice,
      totalInvested,
      currentValue,
      gainLoss,
      gainLossPercentage,
      lastUpdated: new Date(),
      sector: data.sector,
      isActive: true
    };

    // Store in Firebase
    await addDoc(collection(db, 'investments'), {
      ...investment,
      lastUpdated: Timestamp.fromDate(investment.lastUpdated)
    });

    return investment;
  }

  // Start real-time price tracking
  startPriceTracking(userId: string): void {
    if (this.isTrackingPrices) {
      console.log('📈 Price tracking is already active');
      return;
    }

    console.log('📈 Starting real-time price tracking...');
    this.isTrackingPrices = true;

    const updatePrices = async () => {
      if (!this.isTrackingPrices) return;

      try {
        await this.updateAllPrices(userId);
        console.log('✅ Price tracking cycle completed');
      } catch (error) {
        console.error('❌ Price tracking error:', error);
      }
    };

    // Initial update
    updatePrices();

    // Update prices every 2 minutes during market hours
    this.priceUpdateInterval = setInterval(updatePrices, 2 * 60 * 1000);
  }

  stopPriceTracking(): void {
    console.log('⏹️ Stopping price tracking...');
    this.isTrackingPrices = false;
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
  }

  // Update all investment prices
  private async updateAllPrices(userId: string): Promise<void> {
    const investments = await this.getUserInvestments(userId);

    for (const investment of investments) {
      const newPrice = await this.getCurrentPrice(investment.symbol, investment.type);
      
      if (newPrice !== investment.currentPrice) {
        const currentValue = investment.quantity * newPrice;
        const gainLoss = currentValue - investment.totalInvested;
        const gainLossPercentage = (gainLoss / investment.totalInvested) * 100;

        await updateDoc(doc(db, 'investments', investment.id), {
          currentPrice: newPrice,
          currentValue,
          gainLoss,
          gainLossPercentage,
          lastUpdated: Timestamp.fromDate(new Date())
        });
      }
    }
  }

  // Simulate real-time price data
  private async getCurrentPrice(symbol: string, type: Investment['type']): Promise<number> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    if (type === 'stock') {
      const stock = this.popularStocks.find(s => s.symbol === symbol);
      if (stock) {
        // Simulate price movement (±2% from base price)
        const volatility = 0.02;
        const randomChange = (Math.random() - 0.5) * 2 * volatility;
        return Math.round(stock.basePrice * (1 + randomChange) * 100) / 100;
      }
    } else if (type === 'mutual_fund') {
      const mf = this.popularMutualFunds.find(m => m.symbol === symbol);
      if (mf) {
        // Mutual funds have lower volatility (±0.5%)
        const volatility = 0.005;
        const randomChange = (Math.random() - 0.5) * 2 * volatility;
        return Math.round(mf.nav * (1 + randomChange) * 100) / 100;
      }
    }

    // Default random price
    return Math.round((Math.random() * 1000 + 100) * 100) / 100;
  }

  // Get user's investments
  private async getUserInvestments(userId: string): Promise<Investment[]> {
    const investmentsQuery = query(
      collection(db, 'investments'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('totalInvested', 'desc')
    );

    const querySnapshot = await getDocs(investmentsQuery);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      lastUpdated: doc.data().lastUpdated.toDate()
    } as Investment));
  }

  // Calculate portfolio metrics
  private calculatePortfolioMetrics(userId: string, investments: Investment[]): Portfolio {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
    const currentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalGainLoss = currentValue - totalInvested;
    const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    // Simulate day change (random ±1%)
    const dayChangePercentage = (Math.random() - 0.5) * 2;
    const dayChange = (currentValue * dayChangePercentage) / 100;

    return {
      id: uuidv4(),
      userId,
      totalInvested,
      currentValue,
      totalGainLoss,
      totalGainLossPercentage,
      dayChange,
      dayChangePercentage,
      investments,
      lastUpdated: new Date()
    };
  }

  // Get portfolio summary
  async getPortfolioSummary(userId: string): Promise<Portfolio> {
    const investments = await this.getUserInvestments(userId);
    return this.calculatePortfolioMetrics(userId, investments);
  }

  // Add investment to portfolio
  async addInvestment(userId: string, data: {
    symbol: string;
    name: string;
    type: Investment['type'];
    quantity: number;
    price: number;
    charges?: number;
  }): Promise<Investment> {
    console.log(`📈 Adding ${data.symbol} to portfolio...`);

    const netAmount = (data.quantity * data.price) + (data.charges || 0);
    
    // Create investment transaction
    const transaction: InvestmentTransaction = {
      id: uuidv4(),
      userId,
      investmentId: '',
      type: 'buy',
      symbol: data.symbol,
      quantity: data.quantity,
      price: data.price,
      amount: data.quantity * data.price,
      charges: data.charges || 0,
      netAmount,
      date: new Date()
    };

    // Store transaction
    await addDoc(collection(db, 'investmentTransactions'), {
      ...transaction,
      date: Timestamp.fromDate(transaction.date)
    });

    // Create or update investment
    const investment = await this.createInvestment(userId, {
      symbol: data.symbol,
      name: data.name,
      type: data.type,
      quantity: data.quantity,
      averagePrice: data.price
    });

    console.log(`✅ Added ${data.quantity} units of ${data.symbol}`);
    return investment;
  }

  // Get investment analytics
  async getInvestmentAnalytics(userId: string): Promise<{
    topPerformer: Investment | null;
    worstPerformer: Investment | null;
    sectorAllocation: Array<{ sector: string; value: number; percentage: number }>;
    typeAllocation: Array<{ type: string; value: number; percentage: number }>;
    monthlyReturns: Array<{ month: string; returns: number }>;
  }> {
    const investments = await this.getUserInvestments(userId);
    
    if (investments.length === 0) {
      return {
        topPerformer: null,
        worstPerformer: null,
        sectorAllocation: [],
        typeAllocation: [],
        monthlyReturns: []
      };
    }

    // Top and worst performers
    const sortedByGain = [...investments].sort((a, b) => b.gainLossPercentage - a.gainLossPercentage);
    const topPerformer = sortedByGain[0];
    const worstPerformer = sortedByGain[sortedByGain.length - 1];

    // Sector allocation
    const sectorMap: { [sector: string]: number } = {};
    investments.forEach(inv => {
      const sector = inv.sector || 'Other';
      sectorMap[sector] = (sectorMap[sector] || 0) + inv.currentValue;
    });

    const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const sectorAllocation = Object.entries(sectorMap).map(([sector, value]) => ({
      sector,
      value,
      percentage: (value / totalValue) * 100
    }));

    // Type allocation
    const typeMap: { [type: string]: number } = {};
    investments.forEach(inv => {
      typeMap[inv.type] = (typeMap[inv.type] || 0) + inv.currentValue;
    });

    const typeAllocation = Object.entries(typeMap).map(([type, value]) => ({
      type,
      value,
      percentage: (value / totalValue) * 100
    }));

    // Simulate monthly returns
    const monthlyReturns = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      return {
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        returns: (Math.random() - 0.3) * 15 // -4.5% to +10.5% range
      };
    }).reverse();

    return {
      topPerformer,
      worstPerformer,
      sectorAllocation,
      typeAllocation,
      monthlyReturns
    };
  }

  // Get market trends and recommendations
  async getMarketInsights(): Promise<{
    marketTrend: 'bullish' | 'bearish' | 'neutral';
    topGainers: Array<{ symbol: string; name: string; change: number }>;
    recommendations: string[];
    marketNews: Array<{ title: string; summary: string; impact: 'positive' | 'negative' | 'neutral' }>;
  }> {
    console.log('📊 Generating market insights...');

    // Simulate market data
    const trends = ['bullish', 'bearish', 'neutral'] as const;
    const marketTrend = trends[Math.floor(Math.random() * trends.length)];

    const topGainers = this.popularStocks.slice(0, 5).map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      change: Math.random() * 8 + 2 // 2-10% gains
    }));

    const recommendations = [
      'Consider diversifying your portfolio across different sectors',
      'SIP investments in mutual funds show consistent long-term growth',
      'Technology stocks are showing strong momentum this quarter',
      'Banking sector may face headwinds due to regulatory changes',
      'Consider booking profits in overvalued positions'
    ];

    const marketNews = [
      {
        title: 'RBI Monetary Policy Decision',
        summary: 'Reserve Bank maintains repo rate, positive for banking stocks',
        impact: 'positive' as const
      },
      {
        title: 'Q3 Results Season',
        summary: 'IT companies reporting strong growth in international markets',
        impact: 'positive' as const
      },
      {
        title: 'Global Market Volatility',
        summary: 'International tensions affecting emerging market flows',
        impact: 'negative' as const
      }
    ];

    return {
      marketTrend,
      topGainers,
      recommendations,
      marketNews
    };
  }
}

export const investmentPortfolioService = new InvestmentPortfolioService();