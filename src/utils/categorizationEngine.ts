import { TransactionCategory } from '../types';

interface CategoryKeywords {
  [key: string]: string[];
}

// Comprehensive keyword mapping for transaction categorization
const categoryKeywords: CategoryKeywords = {
  Food: [
    // Food delivery apps
    'swiggy', 'zomato', 'uber eats', 'foodpanda', 'dunzo',
    
    // Restaurants & Fast Food
    'mcdonald', 'kfc', 'domino', 'pizza hut', 'burger king', 'subway',
    'cafe coffee day', 'ccd', 'starbucks', 'costa coffee', 'barista',
    
    // Local food terms
    'restaurant', 'cafe', 'dhaba', 'mess', 'canteen', 'food court',
    'bakery', 'sweet shop', 'haldiram', 'bikanervala',
    
    // Food-related keywords
    'food', 'meal', 'lunch', 'dinner', 'breakfast', 'snacks',
    'grocery', 'vegetables', 'fruits', 'meat', 'fish'
  ],

  Transport: [
    // Ride sharing
    'uber', 'ola', 'rapido', 'meru', 'mega cabs',
    
    // Public transport
    'metro', 'bus', 'train', 'railway', 'irctc', 'ticket',
    'auto', 'rickshaw', 'taxi', 'cab',
    
    // Fuel & Vehicle
    'petrol', 'diesel', 'fuel', 'gas station', 'hp petrol', 'bharat petroleum',
    'indian oil', 'shell', 'essar',
    
    // Parking & Tolls
    'parking', 'toll', 'fastag', 'highway',
    
    // Vehicle maintenance
    'service', 'repair', 'garage', 'mechanic'
  ],

  Shopping: [
    // E-commerce
    'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'snapdeal',
    'paytm mall', 'shopclues', 'jabong', 'koovs',
    
    // Retail stores
    'big bazaar', 'reliance', 'more', 'spencer', 'dmart',
    'lifestyle', 'westside', 'shoppers stop', 'pantaloons',
    'max fashion', 'brand factory',
    
    // Categories
    'clothing', 'electronics', 'mobile', 'laptop', 'accessories',
    'shoes', 'bags', 'cosmetics', 'books', 'gifts',
    
    // General shopping terms
    'shopping', 'store', 'mall', 'market', 'purchase', 'buy'
  ],

  Entertainment: [
    // Movie & Shows
    'bookmyshow', 'pvr', 'inox', 'cinema', 'movie', 'ticket',
    'multiplex', 'theatre',
    
    // Streaming services
    'netflix', 'amazon prime', 'disney', 'hotstar', 'zee5',
    'sony liv', 'voot', 'alt balaji', 'youtube premium',
    
    // Music
    'spotify', 'apple music', 'gaana', 'jiosaavn', 'wynk',
    
    // Gaming
    'steam', 'playstation', 'xbox', 'nintendo', 'gaming',
    'game', 'pubg', 'mobile game',
    
    // Events & Activities
    'concert', 'show', 'event', 'party', 'club', 'bar',
    'amusement park', 'adventure', 'sports'
  ],

  Bills: [
    // Utilities
    'electricity', 'water', 'gas', 'utility', 'power',
    'bescom', 'kseb', 'mseb', 'tneb', 'delhi electricity',
    
    // Telecom
    'mobile', 'recharge', 'airtel', 'jio', 'vi', 'vodafone',
    'idea', 'bsnl', 'postpaid', 'prepaid',
    
    // Internet & Cable
    'internet', 'broadband', 'wifi', 'fiber', 'dth',
    'tata sky', 'dish tv', 'airtel digital', 'den networks',
    
    // Insurance & Financial
    'insurance', 'premium', 'policy', 'lic', 'hdfc life',
    'icici prudential', 'sbi life', 'mutual fund', 'sip',
    
    // Loans & EMI
    'emi', 'loan', 'mortgage', 'home loan', 'car loan',
    'personal loan', 'credit card', 'payment',
    
    // Government & Services
    'tax', 'challan', 'fine', 'government', 'municipal',
    'registration', 'renewal'
  ],

  Transfer: [
    // Banking
    'transfer', 'bank', 'deposit', 'withdrawal', 'atm',
    'neft', 'rtgs', 'imps', 'upi',
    
    // Person to person
    'friend', 'family', 'colleague', 'relative',
    'split', 'share', 'contribution', 'gift',
    
    // Wallets
    'paytm', 'phonepe', 'googlepay', 'mobikwik', 'freecharge',
    'amazon pay', 'wallet'
  ]
};

export class CategorizationEngine {
  private static normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static calculateCategoryScore(text: string, keywords: string[]): number {
    const normalizedText = this.normalizeText(text);
    let score = 0;
    
    for (const keyword of keywords) {
      const normalizedKeyword = this.normalizeText(keyword);
      
      // Exact match gets highest score
      if (normalizedText.includes(normalizedKeyword)) {
        score += normalizedKeyword.length; // Longer matches get higher scores
      }
      
      // Partial word matches
      const words = normalizedText.split(' ');
      for (const word of words) {
        if (word.includes(normalizedKeyword) || normalizedKeyword.includes(word)) {
          score += Math.min(word.length, normalizedKeyword.length) / 2;
        }
      }
    }
    
    return score;
  }

  static categorizeTransaction(description: string, merchant?: string): TransactionCategory {
    const textToAnalyze = `${description} ${merchant || ''}`.toLowerCase();
    
    let bestCategory: TransactionCategory = 'Other';
    let bestScore = 0;
    
    // Calculate scores for each category
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = this.calculateCategoryScore(textToAnalyze, keywords);
      
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category as TransactionCategory;
      }
    }
    
    // If no good match found, try some heuristics
    if (bestScore === 0) {
      bestCategory = this.applyHeuristics(textToAnalyze);
    }
    
    return bestCategory;
  }

  private static applyHeuristics(text: string): TransactionCategory {
    // Amount-based heuristics
    const amountMatch = text.match(/(\d+(?:,\d+)*(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    
    // Very small amounts are likely food/transport
    if (amount > 0 && amount < 100) {
      return Math.random() > 0.5 ? 'Food' : 'Transport';
    }
    
    // Large amounts are likely shopping or bills
    if (amount > 2000) {
      return Math.random() > 0.5 ? 'Shopping' : 'Bills';
    }
    
    // Time-based heuristics (if timestamp is available)
    const now = new Date();
    const hour = now.getHours();
    
    // Morning transactions are likely transport/food
    if (hour >= 6 && hour <= 10) {
      return Math.random() > 0.5 ? 'Transport' : 'Food';
    }
    
    // Lunch time is likely food
    if (hour >= 12 && hour <= 14) {
      return 'Food';
    }
    
    // Evening transactions could be entertainment/food
    if (hour >= 18 && hour <= 23) {
      const random = Math.random();
      if (random < 0.4) return 'Food';
      if (random < 0.7) return 'Entertainment';
      return 'Shopping';
    }
    
    return 'Other';
  }

  static getCategoryKeywords(category: TransactionCategory): string[] {
    return categoryKeywords[category] || [];
  }

  static addCustomKeyword(category: TransactionCategory, keyword: string): void {
    if (!categoryKeywords[category]) {
      categoryKeywords[category] = [];
    }
    
    const normalizedKeyword = keyword.toLowerCase().trim();
    if (!categoryKeywords[category].includes(normalizedKeyword)) {
      categoryKeywords[category].push(normalizedKeyword);
    }
  }

  static removeCustomKeyword(category: TransactionCategory, keyword: string): void {
    if (categoryKeywords[category]) {
      const normalizedKeyword = keyword.toLowerCase().trim();
      categoryKeywords[category] = categoryKeywords[category].filter(
        k => k !== normalizedKeyword
      );
    }
  }

  static getTopKeywordsForText(text: string, limit: number = 5): Array<{keyword: string, category: TransactionCategory, score: number}> {
    const results: Array<{keyword: string, category: TransactionCategory, score: number}> = [];
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        const score = this.calculateCategoryScore(text, [keyword]);
        if (score > 0) {
          results.push({
            keyword,
            category: category as TransactionCategory,
            score
          });
        }
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}