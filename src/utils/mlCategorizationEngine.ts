import { TransactionCategory } from '../types';

interface CategoryPattern {
  category: TransactionCategory;
  keywords: string[];
  patterns: RegExp[];
  weight: number;
  merchantPatterns: RegExp[];
  contextKeywords: string[];
}

interface LearningData {
  merchant: string;
  category: TransactionCategory;
  confidence: number;
  frequency: number;
}

export class MLCategorizationEngine {
  private static learningData: Map<string, LearningData> = new Map();
  private static categoryPatterns: CategoryPattern[] = [
    {
      category: 'Food',
      weight: 1.0,
      keywords: [
        'swiggy', 'zomato', 'uber eats', 'foodpanda', 'dunzo', 'food delivery',
        'mcdonald', 'kfc', 'domino', 'pizza hut', 'burger king', 'subway',
        'cafe coffee day', 'ccd', 'starbucks', 'costa coffee', 'barista',
        'restaurant', 'cafe', 'dhaba', 'mess', 'canteen', 'food court',
        'bakery', 'sweet shop', 'haldiram', 'bikanervala', 'food', 'meal',
        'lunch', 'dinner', 'breakfast', 'snacks', 'grocery', 'vegetables'
      ],
      patterns: [
        /food|meal|restaurant|cafe|dining/i,
        /swiggy|zomato|foodpanda/i,
        /pizza|burger|sandwich/i
      ],
      merchantPatterns: [
        /.*food.*|.*restaurant.*|.*cafe.*/i,
        /swiggy|zomato|uber.*eats/i
      ],
      contextKeywords: ['delivery', 'order', 'food', 'meal', 'eat']
    },
    {
      category: 'Transport',
      weight: 1.0,
      keywords: [
        'uber', 'ola', 'rapido', 'meru', 'mega cabs', 'taxi', 'cab',
        'metro', 'bus', 'train', 'railway', 'irctc', 'ticket', 'travel',
        'petrol', 'diesel', 'fuel', 'gas', 'bp', 'hp', 'ioc', 'bharat petroleum',
        'parking', 'toll', 'fastag', 'transport', 'vehicle'
      ],
      patterns: [
        /uber|ola|taxi|cab/i,
        /metro|bus|train|railway/i,
        /petrol|diesel|fuel/i,
        /parking|toll/i
      ],
      merchantPatterns: [
        /uber|ola|rapido/i,
        /.*metro.*|.*bus.*|.*railway.*/i,
        /.*petrol.*|.*fuel.*|.*gas.*/i
      ],
      contextKeywords: ['ride', 'trip', 'booking', 'fuel', 'travel']
    },
    {
      category: 'Shopping',
      weight: 1.0,
      keywords: [
        'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'snapdeal',
        'big bazaar', 'dmart', 'reliance', 'more', 'easy day', 'star bazaar',
        'shopping', 'mall', 'store', 'market', 'purchase', 'buy',
        'clothes', 'fashion', 'electronics', 'mobile', 'laptop'
      ],
      patterns: [
        /amazon|flipkart|myntra|ajio/i,
        /shopping|mall|store/i,
        /clothes|fashion|electronics/i
      ],
      merchantPatterns: [
        /amazon|flipkart|myntra|ajio|nykaa/i,
        /.*mall.*|.*store.*|.*market.*/i
      ],
      contextKeywords: ['purchase', 'buy', 'order', 'shopping', 'product']
    },
    {
      category: 'Entertainment',
      weight: 1.0,
      keywords: [
        'bookmyshow', 'paytm movies', 'netflix', 'amazon prime', 'disney',
        'hotstar', 'sony liv', 'zee5', 'voot', 'alt balaji',
        'spotify', 'gaana', 'wynk', 'jio saavn', 'youtube music',
        'movie', 'cinema', 'theater', 'entertainment', 'games', 'gaming'
      ],
      patterns: [
        /netflix|prime|disney|hotstar/i,
        /spotify|music|songs/i,
        /movie|cinema|theater/i,
        /games|gaming/i
      ],
      merchantPatterns: [
        /netflix|prime|disney|hotstar/i,
        /bookmyshow|.*cinema.*|.*theater.*/i,
        /spotify|gaana|wynk/i
      ],
      contextKeywords: ['subscription', 'movie', 'music', 'entertainment', 'streaming']
    },
    {
      category: 'Bills',
      weight: 1.0,
      keywords: [
        'electricity', 'electric', 'power', 'energy', 'wapcos', 'kseb',
        'gas', 'lpg', 'cylinder', 'indane', 'hp gas', 'bharat gas',
        'water', 'sewage', 'municipal', 'corporation',
        'internet', 'broadband', 'wifi', 'jio fiber', 'airtel', 'bsnl',
        'mobile', 'phone', 'recharge', 'prepaid', 'postpaid', 'bill',
        'utility', 'services'
      ],
      patterns: [
        /electricity|electric|power/i,
        /gas|lpg|cylinder/i,
        /water|sewage/i,
        /internet|broadband|wifi/i,
        /mobile|phone|recharge/i
      ],
      merchantPatterns: [
        /.*electric.*|.*power.*|.*energy.*/i,
        /.*gas.*|.*lpg.*/i,
        /.*water.*|.*municipal.*/i,
        /jio|airtel|bsnl|vodafone|vi/i
      ],
      contextKeywords: ['bill', 'payment', 'utility', 'recharge', 'service']
    },
    {
      category: 'Other',
      weight: 0.9,
      keywords: [
        'hospital', 'clinic', 'doctor', 'medical', 'medicine', 'pharmacy',
        'apollo', 'max', 'fortis', 'manipal', 'columbia asia',
        'health', 'treatment', 'checkup', 'consultation', 'surgery',
        'medplus', 'pharmeasy', 'netmeds', '1mg'
      ],
      patterns: [
        /hospital|clinic|doctor|medical/i,
        /pharmacy|medicine|drug/i,
        /health|treatment/i
      ],
      merchantPatterns: [
        /.*hospital.*|.*clinic.*|.*medical.*/i,
        /.*pharmacy.*|.*medical.*|.*drug.*/i,
        /apollo|max|fortis|manipal/i
      ],
      contextKeywords: ['medical', 'health', 'treatment', 'medicine', 'doctor']
    },
    {
      category: 'Transfer',
      weight: 0.8,
      keywords: [
        'transfer', 'send', 'sent', 'received', 'friend', 'family',
        'person', 'individual', 'upi', 'imps', 'neft', 'rtgs'
      ],
      patterns: [
        /transfer|sent|received/i,
        /friend|family|person/i,
        /upi|imps|neft|rtgs/i
      ],
      merchantPatterns: [
        /.*@.*|.*upi.*/i // UPI handles
      ],
      contextKeywords: ['transfer', 'send', 'receive', 'friend', 'family']
    },
    {
      category: 'Other',
      weight: 0.5,
      keywords: ['other', 'miscellaneous', 'unknown'],
      patterns: [/.*/i],
      merchantPatterns: [/.*/i],
      contextKeywords: []
    }
  ];

  // Initialize learning system
  static initialize() {
    // Load any saved learning data from localStorage
    const savedData = localStorage.getItem('ml_categorization_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        this.learningData = new Map(parsed);
      } catch (error) {
        console.log('Failed to load learning data:', error);
      }
    }
  }

  // Advanced categorization with machine learning-like features
  static categorizeTransaction(
    description: string, 
    merchant: string, 
    amount: number,
    previousCategory?: TransactionCategory
  ): TransactionCategory {
    
    // Check learning data first (highest priority)
    const learningResult = this.checkLearningData(merchant);
    if (learningResult) {
      return learningResult;
    }

    // Calculate scores for each category
    const scores = this.calculateCategoryScores(description, merchant, amount);
    
    // Find the category with highest score
    let bestCategory: TransactionCategory = 'Other';
    let maxScore = 0;

    for (const [category, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category as TransactionCategory;
      }
    }

    // Learn from this categorization
    this.learnFromCategorization(merchant, bestCategory, maxScore);

    return bestCategory;
  }

  // Check learning data for merchant
  private static checkLearningData(merchant: string): TransactionCategory | null {
    const merchantKey = merchant.toLowerCase().trim();
    const learning = this.learningData.get(merchantKey);
    
    if (learning && learning.confidence > 0.7 && learning.frequency > 2) {
      return learning.category;
    }
    
    return null;
  }

  // Calculate category scores using multiple factors
  private static calculateCategoryScores(
    description: string, 
    merchant: string, 
    amount: number
  ): Record<string, number> {
    const scores: Record<string, number> = {};
    const text = `${description} ${merchant}`.toLowerCase();

    for (const pattern of this.categoryPatterns) {
      let score = 0;

      // Keyword matching (40% weight)
      const keywordMatches = pattern.keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      ).length;
      score += (keywordMatches / pattern.keywords.length) * 0.4;

      // Pattern matching (30% weight)
      const patternMatches = pattern.patterns.filter(regex => 
        regex.test(text)
      ).length;
      score += (patternMatches / pattern.patterns.length) * 0.3;

      // Merchant pattern matching (20% weight)
      const merchantMatches = pattern.merchantPatterns.filter(regex => 
        regex.test(merchant)
      ).length;
      score += (merchantMatches / pattern.merchantPatterns.length) * 0.2;

      // Context keyword matching (10% weight)
      const contextMatches = pattern.contextKeywords.filter(keyword => 
        text.includes(keyword)
      ).length;
      if (pattern.contextKeywords.length > 0) {
        score += (contextMatches / pattern.contextKeywords.length) * 0.1;
      }

      // Amount-based adjustments
      score += this.getAmountBasedScore(pattern.category, amount);

      // Apply category weight
      scores[pattern.category] = score * pattern.weight;
    }

    return scores;
  }

  // Amount-based scoring adjustments
  private static getAmountBasedScore(category: TransactionCategory, amount: number): number {
    const amountRanges: Record<TransactionCategory, { min: number; max: number; bonus: number }> = {
      'Food': { min: 50, max: 2000, bonus: 0.1 },
      'Transport': { min: 20, max: 1000, bonus: 0.1 },
      'Shopping': { min: 100, max: 50000, bonus: 0.05 },
      'Entertainment': { min: 50, max: 3000, bonus: 0.1 },
      'Bills': { min: 100, max: 10000, bonus: 0.1 },
      'Transfer': { min: 1, max: 100000, bonus: 0.0 },
      'Other': { min: 0, max: 1000000, bonus: 0.0 }
    };

    const range = amountRanges[category];
    if (range && amount >= range.min && amount <= range.max) {
      return range.bonus;
    }

    return 0;
  }

  // Learn from categorization
  private static learnFromCategorization(
    merchant: string, 
    category: TransactionCategory, 
    confidence: number
  ) {
    const merchantKey = merchant.toLowerCase().trim();
    const existing = this.learningData.get(merchantKey);

    if (existing) {
      // Update existing data
      existing.frequency += 1;
      if (existing.category === category) {
        existing.confidence = Math.min(1.0, existing.confidence + 0.1);
      } else {
        existing.confidence = Math.max(0.0, existing.confidence - 0.1);
      }
    } else {
      // Create new learning data
      this.learningData.set(merchantKey, {
        merchant,
        category,
        confidence: Math.max(0.5, confidence),
        frequency: 1
      });
    }

    // Save to localStorage periodically
    if (this.learningData.size % 10 === 0) {
      this.saveLearningData();
    }
  }

  // Save learning data to localStorage
  private static saveLearningData() {
    try {
      const dataArray = Array.from(this.learningData.entries());
      localStorage.setItem('ml_categorization_data', JSON.stringify(dataArray));
    } catch (error) {
      console.log('Failed to save learning data:', error);
    }
  }

  // Manually teach the system (for user feedback)
  static teachCategory(merchant: string, category: TransactionCategory) {
    const merchantKey = merchant.toLowerCase().trim();
    this.learningData.set(merchantKey, {
      merchant,
      category,
      confidence: 1.0,
      frequency: 10 // High frequency for manual teaching
    });
    this.saveLearningData();
  }

  // Get learning statistics
  static getLearningStats() {
    const categoryCount: Record<string, number> = {};
    let totalEntries = 0;

    Array.from(this.learningData.values()).forEach(data => {
      categoryCount[data.category] = (categoryCount[data.category] || 0) + 1;
      totalEntries++;
    });

    return {
      totalMerchants: totalEntries,
      categoryDistribution: categoryCount,
      averageConfidence: Array.from(this.learningData.values())
        .reduce((sum, data) => sum + data.confidence, 0) / totalEntries || 0
    };
  }

  // Analyze spending patterns (ML-like insights)
  static analyzeSpendingPatterns(transactions: any[]): {
    unusualCategories: string[];
    frequentMerchants: string[];
    spendingTrends: Record<string, number>;
    recommendations: string[];
  } {
    const categorySpending: Record<string, number> = {};
    const merchantFrequency: Record<string, number> = {};
    const recommendations: string[] = [];

    // Analyze transactions
    transactions.forEach(transaction => {
      const category = transaction.category;
      const merchant = transaction.merchant;

      categorySpending[category] = (categorySpending[category] || 0) + transaction.amount;
      merchantFrequency[merchant] = (merchantFrequency[merchant] || 0) + 1;
    });

    // Find unusual spending patterns
    const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
    const unusualCategories = Object.entries(categorySpending)
      .filter(([category, amount]) => (amount / totalSpending) > 0.4) // More than 40% in one category
      .map(([category]) => category);

    // Find frequent merchants
    const frequentMerchants = Object.entries(merchantFrequency)
      .filter(([merchant, frequency]) => frequency > 5)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([merchant]) => merchant);

    // Generate recommendations
    if (categorySpending['Food'] > totalSpending * 0.3) {
      recommendations.push('Consider cooking at home more often to reduce food expenses');
    }
    if (categorySpending['Entertainment'] > totalSpending * 0.2) {
      recommendations.push('Look for free entertainment alternatives to reduce spending');
    }
    if (categorySpending['Shopping'] > totalSpending * 0.4) {
      recommendations.push('Create a shopping budget and stick to essential purchases');
    }

    return {
      unusualCategories,
      frequentMerchants,
      spendingTrends: categorySpending,
      recommendations
    };
  }
}

// Initialize the ML system
MLCategorizationEngine.initialize();