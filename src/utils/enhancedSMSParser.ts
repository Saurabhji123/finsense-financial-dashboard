import { Transaction, PaymentMethod } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Enhanced SMS Pattern Interface
interface EnhancedSMSPattern {
  bank: string;
  patterns: RegExp[];
  extractors: {
    amount: (text: string) => number | null;
    merchant: (text: string) => string | null;
    type: (text: string) => 'debit' | 'credit';
    method: (text: string) => PaymentMethod;
    date?: (text: string) => Date;
    category?: (text: string, merchant: string) => string;
  };
}

export class EnhancedSMSParser {
  private static patterns: EnhancedSMSPattern[] = [
    // PhonePe UPI Transactions - Comprehensive
    {
      bank: 'PhonePe',
      patterns: [
        /PhonePe.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*.*?to\s+(.+?)\s*(?:on|UPI|@)/i,
        /You.*?paid\s*Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*to\s+(.+?)\s*via\s*PhonePe/i,
        /PhonePe.*?(\d+(?:,\d+)*(?:\.\d{2})?)\s*debited.*?to\s+(.+)/i,
        /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*sent\s*to\s*(.+?)\s*via\s*PhonePe/i
      ],
      extractors: {
        amount: (text: string) => {
          const match = text.match(/Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
          return match ? parseFloat(match[1].replace(/,/g, '')) : null;
        },
        merchant: (text: string) => {
          const patterns = [
            /to\s+([^@\n]+?)(?:\s*@|\s*UPI|\s*on|\s*via|\s*using|\s*for|\s*$)/i,
            /paid\s*to\s*([^@\n]+?)(?:\s*@|\s*via|\s*for|\s*$)/i
          ];
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              return EnhancedSMSParser.cleanMerchantName(match[1].trim());
            }
          }
          return 'PhonePe Transaction';
        },
        type: (text: string) => text.toLowerCase().includes('received') ? 'credit' : 'debit',
        method: () => 'UPI',
        date: (text: string) => {
          const match = text.match(/on\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
          return match ? EnhancedSMSParser.parseDate(match[1]) : new Date();
        },
        category: (text: string, merchant: string) => {
          return EnhancedSMSParser.smartCategorize(text, merchant);
        }
      }
    },

    // Google Pay UPI Transactions - Enhanced
    {
      bank: 'Google Pay',
      patterns: [
        /You\s*sent\s*Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*to\s+(.+?)\s*via\s*Google\s*Pay/i,
        /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*sent\s*to\s+(.+?)\s*using\s*Google\s*Pay/i,
        /Google\s*Pay.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*paid\s*to\s*(.+?)(?:\s|$)/i,
        /GPay.*?₹(\d+(?:,\d+)*(?:\.\d{2})?)\s*transferred\s*to\s*(.+)/i,
        /You\s*received\s*Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*from\s*(.+?)\s*via\s*Google\s*Pay/i
      ],
      extractors: {
        amount: (text: string) => {
          const match = text.match(/(?:Rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
          return match ? parseFloat(match[1].replace(/,/g, '')) : null;
        },
        merchant: (text: string) => {
          const patterns = [
            /(?:sent\s*to|paid\s*to|to|from)\s+([^@\n]+?)(?:\s*@|\s*UPI|\s*via|\s*using|\s*on|\s*for|\s*\.|$)/i,
            /transferred\s*to\s*(.+?)(?:\s*on|\s*$)/i
          ];
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              return EnhancedSMSParser.cleanMerchantName(match[1].trim());
            }
          }
          return 'Google Pay Transaction';
        },
        type: (text: string) => text.toLowerCase().includes('received') || text.toLowerCase().includes('from') ? 'credit' : 'debit',
        method: () => 'UPI',
        category: (text: string, merchant: string) => {
          return EnhancedSMSParser.smartCategorize(text, merchant);
        }
      }
    },

    // Paytm UPI Transactions - Comprehensive
    {
      bank: 'Paytm',
      patterns: [
        /Paytm.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*paid\s*to\s*(.+?)(?:\s|$)/i,
        /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*sent\s*via\s*Paytm\s*to\s*(.+)/i,
        /You\s*paid\s*Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*to\s*(.+?)\s*using\s*Paytm/i,
        /Paytm.*?₹(\d+(?:,\d+)*(?:\.\d{2})?)\s*transferred\s*to\s*(.+)/i,
        /You\s*received\s*Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*from\s*(.+?)\s*via\s*Paytm/i
      ],
      extractors: {
        amount: (text: string) => {
          const match = text.match(/(?:Rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
          return match ? parseFloat(match[1].replace(/,/g, '')) : null;
        },
        merchant: (text: string) => {
          const patterns = [
            /(?:paid\s*to|sent.*?to|to|from)\s+(.+?)(?:\s*for|\s*on|\s*via|\s*\.|$)/i,
            /transferred\s*to\s*(.+?)(?:\s*on|\s*$)/i
          ];
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              return EnhancedSMSParser.cleanMerchantName(match[1].trim());
            }
          }
          return 'Paytm Transaction';
        },
        type: (text: string) => text.toLowerCase().includes('received') || text.toLowerCase().includes('from') ? 'credit' : 'debit',
        method: () => 'UPI',
        category: (text: string, merchant: string) => {
          return EnhancedSMSParser.smartCategorize(text, merchant);
        }
      }
    },

    // BHIM UPI Transactions
    {
      bank: 'BHIM',
      patterns: [
        /BHIM.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*sent\s*to\s*(.+)/i,
        /You\s*sent\s*Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*to\s*(.+?)\s*via\s*BHIM/i,
        /BHIM.*?₹(\d+(?:,\d+)*(?:\.\d{2})?)\s*paid\s*to\s*(.+)/i
      ],
      extractors: {
        amount: (text: string) => {
          const match = text.match(/(?:Rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
          return match ? parseFloat(match[1].replace(/,/g, '')) : null;
        },
        merchant: (text: string) => {
          const match = text.match(/(?:sent\s*to|paid\s*to|to)\s+(.+?)(?:\s*@|\s*via|\s*on|\s*$)/i);
          return match ? EnhancedSMSParser.cleanMerchantName(match[1].trim()) : 'BHIM Transaction';
        },
        type: () => 'debit',
        method: () => 'UPI'
      }
    },

    // Credit/Debit Card Transactions - Enhanced
    {
      bank: 'Card Transaction',
      patterns: [
        /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*spent\s*.*?at\s*(.+?)\s*on/i,
        /₹(\d+(?:,\d+)*(?:\.\d{2})?)\s*spent\s*using.*?card.*?at\s*(.+)/i,
        /Card\s*transaction.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*at\s*(.+)/i,
        /Your\s*card.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*spent\s*at\s*(.+)/i
      ],
      extractors: {
        amount: (text: string) => {
          const match = text.match(/(?:Rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
          return match ? parseFloat(match[1].replace(/,/g, '')) : null;
        },
        merchant: (text: string) => {
          const match = text.match(/at\s+(.+?)(?:\s*on|\s*$)/i);
          return match ? EnhancedSMSParser.cleanMerchantName(match[1].trim()) : 'Card Transaction';
        },
        type: (text: string) => text.toLowerCase().includes('spent') ? 'debit' : 'credit',
        method: () => 'Card',
        category: (text: string, merchant: string) => {
          return EnhancedSMSParser.smartCategorize(text, merchant);
        }
      }
    },

    // Net Banking Transactions
    {
      bank: 'Net Banking',
      patterns: [
        /Net\s*banking.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*transferred\s*to\s*(.+)/i,
        /NEFT.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*transferred\s*to\s*(.+)/i,
        /IMPS.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*sent\s*to\s*(.+)/i
      ],
      extractors: {
        amount: (text: string) => {
          const match = text.match(/(?:Rs\.?|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
          return match ? parseFloat(match[1].replace(/,/g, '')) : null;
        },
        merchant: (text: string) => {
          const match = text.match(/(?:transferred\s*to|sent\s*to|to)\s+(.+?)(?:\s*on|\s*$)/i);
          return match ? EnhancedSMSParser.cleanMerchantName(match[1].trim()) : 'Bank Transfer';
        },
        type: () => 'debit',
        method: (text: string) => {
          if (text.toLowerCase().includes('neft')) return 'NEFT' as PaymentMethod;
          if (text.toLowerCase().includes('imps')) return 'IMPS' as PaymentMethod;
          return 'Net Banking' as PaymentMethod;
        }
      }
    }
  ];

  // Enhanced merchant name cleaning
  private static cleanMerchantName(merchant: string): string {
    // Remove common UPI suffixes and clean up
    return merchant
      .replace(/@[a-zA-Z0-9.-]+/g, '') // Remove UPI handles
      .replace(/\s*UPI\s*/gi, '')
      .replace(/\s*VIA\s*/gi, '')
      .replace(/\s*USING\s*/gi, '')
      .replace(/\s*ON\s*/gi, '')
      .replace(/\s*FOR\s*/gi, '')
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
      .substring(0, 30); // Limit length
  }

  // Smart date parsing
  private static parseDate(dateStr: string): Date {
    const formats = [
      /(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/,
      /(\d{1,2})\s+(\w{3})\s+(\d{2,4})/
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let day = parseInt(match[1]);
        let month = parseInt(match[2]) - 1; // JS months are 0-indexed
        let year = parseInt(match[3]);
        
        if (year < 100) year += 2000; // Convert 2-digit year
        
        return new Date(year, month, day);
      }
    }
    
    return new Date(); // Default to current date if parsing fails
  }

  // Advanced categorization based on merchant and context
  private static smartCategorize(text: string, merchant: string): string {
    const textLower = text.toLowerCase();
    const merchantLower = merchant.toLowerCase();

    // Food & Dining
    if (this.matchesKeywords(textLower + ' ' + merchantLower, [
      'swiggy', 'zomato', 'uber eats', 'dominos', 'pizza', 'kfc', 'mcdonald',
      'restaurant', 'cafe', 'food', 'dining', 'barbeque', 'biryani'
    ])) {
      return 'Food & Dining';
    }

    // Transportation
    if (this.matchesKeywords(textLower + ' ' + merchantLower, [
      'uber', 'ola', 'rapido', 'metro', 'bus', 'taxi', 'fuel', 'petrol',
      'diesel', 'parking', 'toll', 'irctc', 'redbus', 'goibibo'
    ])) {
      return 'Transportation';
    }

    // Shopping
    if (this.matchesKeywords(textLower + ' ' + merchantLower, [
      'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'big bazaar',
      'dmart', 'reliance', 'shopping', 'mall', 'store'
    ])) {
      return 'Shopping';
    }

    // Entertainment
    if (this.matchesKeywords(textLower + ' ' + merchantLower, [
      'bookmyshow', 'netflix', 'amazon prime', 'disney', 'spotify',
      'youtube', 'movie', 'cinema', 'entertainment', 'games'
    ])) {
      return 'Entertainment';
    }

    // Bills & Utilities
    if (this.matchesKeywords(textLower + ' ' + merchantLower, [
      'electricity', 'gas', 'water', 'internet', 'mobile', 'recharge',
      'bill', 'utility', 'bsnl', 'airtel', 'jio', 'vi'
    ])) {
      return 'Bills & Utilities';
    }

    // Healthcare
    if (this.matchesKeywords(textLower + ' ' + merchantLower, [
      'hospital', 'doctor', 'medical', 'pharmacy', 'apollo', 'max',
      'fortis', 'medicine', 'health'
    ])) {
      return 'Healthcare';
    }

    // Education
    if (this.matchesKeywords(textLower + ' ' + merchantLower, [
      'school', 'college', 'university', 'course', 'fees', 'byju',
      'unacademy', 'education', 'learning'
    ])) {
      return 'Education';
    }

    // Investment & Savings
    if (this.matchesKeywords(textLower + ' ' + merchantLower, [
      'mutual fund', 'sip', 'investment', 'stock', 'zerodha', 'groww',
      'upstox', 'angel', 'insurance', 'lic'
    ])) {
      return 'Investment';
    }

    return 'Other';
  }

  private static matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  // Main parsing function
  static parseEnhancedSMS(text: string, sender: string): Transaction | null {
    for (const pattern of this.patterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(text)) {
          const amount = pattern.extractors.amount(text);
          if (!amount) continue;

          const merchant = pattern.extractors.merchant(text) || 'Unknown';
          const type = pattern.extractors.type(text);
          const method = pattern.extractors.method(text);
          const date = pattern.extractors.date ? pattern.extractors.date(text) : new Date();
          const category = pattern.extractors.category ? 
            pattern.extractors.category(text, merchant) : 'Other';

          return {
            id: uuidv4(),
            amount,
            description: `${pattern.bank}: ${merchant}`,
            category: category as any,
            date,
            type,
            merchant,
            method,
            rawMessage: text
          };
        }
      }
    }

    return null;
  }

  // Generate demo SMS messages for testing
  static generateDemoSMS(): string[] {
    return [
      "PhonePe: Rs 450 paid to Swiggy via UPI on 02-10-2025. UPI Ref: 327845692",
      "Google Pay: You sent Rs 120 to Metro Card Recharge using Google Pay on 01-10-2025",
      "Paytm: Rs 2500 paid to Amazon Shopping via Paytm UPI on 03-10-2025",
      "You sent Rs 89 to Zomato Order via PhonePe on 02-10-2025",
      "BHIM: Rs 1200 sent to UBER Cab Booking on 01-10-2025",
      "Rs 3500 spent using HDFC Card at Big Bazaar on 02-10-2025",
      "Net banking: Rs 5000 transferred to Mutual Fund SIP on 01-10-2025",
      "Google Pay: You received Rs 1000 from Salary Transfer via Google Pay on 01-10-2025"
    ];
  }
}

