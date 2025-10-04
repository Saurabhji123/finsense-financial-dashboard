import { Transaction, PaymentMethod, SMSPattern } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Enhanced SMS patterns for major Indian banks and UPI services
export const smsPatterns: SMSPattern[] = [
  // PhonePe UPI Transactions
  {
    bank: 'PhonePe',
    patterns: [
      /PhonePe.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*.*?to\s+(.+?)\s*(?:on|UPI)/i,
      /You.*?paid\s*Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*to\s+(.+?)\s*via\s*PhonePe/i,
      /PhonePe.*?(\d+(?:,\d+)*(?:\.\d{2})?)\s*debited.*?to\s+(.+)/i
    ],
    extractors: {
      amount: (text: string) => {
        const match = text.match(/Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
        if (match) {
          return parseFloat(match[1].replace(/,/g, ''));
        }
        return null;
      },
      merchant: (text: string) => {
        const match = text.match(/to\s+([^@]+?)(?:\s*@|\s*UPI|\s*on|\s*via|\s*$)/i);
        return match ? match[1].trim() : 'Unknown Merchant';
      },
      type: () => 'debit',
      method: () => 'UPI',
      date: (text: string) => {
        const match = text.match(/on\s+(\d{1,2}-\d{1,2}-\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i);
        return match ? new Date(match[1]) : new Date();
      }
    }
  },
  // Google Pay UPI Transactions  
  {
    bank: 'GooglePay',
    patterns: [
      /Google\s*Pay.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*.*?to\s+(.+?)(?:\s*on|\s*UPI)/i,
      /You\s*sent\s*Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*to\s+(.+?)\s*via\s*Google\s*Pay/i,
      /GPay.*?(\d+(?:,\d+)*(?:\.\d{2})?)\s*paid.*?to\s+(.+)/i
    ],
    extractors: {
      amount: (text: string) => {
        const match = text.match(/Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
        return match ? parseFloat(match[1].replace(/,/g, '')) : null;
      },
      merchant: (text: string) => {
        const match = text.match(/to\s+([^@]+?)(?:\s*@|\s*UPI|\s*on|\s*via|\s*$)/i);
        return match ? match[1].trim() : 'Unknown Merchant';
      },
      type: () => 'debit',
      method: () => 'UPI',
      date: (text: string) => new Date()
    }
  },
  // Paytm UPI Transactions
  {
    bank: 'Paytm',
    patterns: [
      /Paytm.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*.*?to\s+(.+?)(?:\s*on|\s*UPI)/i,
      /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*paid.*?via\s*Paytm.*?to\s+(.+)/i
    ],
    extractors: {
      amount: (text: string) => {
        const match = text.match(/Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
        return match ? parseFloat(match[1].replace(/,/g, '')) : null;
      },
      merchant: (text: string) => {
        const match = text.match(/to\s+([^@]+?)(?:\s*@|\s*UPI|\s*on|\s*via|\s*$)/i);
        return match ? match[1].trim() : 'Unknown Merchant';
      },
      type: () => 'debit',
      method: () => 'UPI',
      date: (text: string) => new Date()
    }
  },
  // HDFC Bank - Enhanced patterns
  {
    bank: 'HDFC',
    patterns: [
      /Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*debited.*?from.*?(\*\*\d+).*?to\s+(.+?)\s+on/i,
      /INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*debited.*?(\*\*\d+).*?(\w+)/i,
      /UPI.*?Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*debited.*?to\s+(.+?)\s*via/i
    ],
    extractors: {
      amount: (text: string) => {
        const match = text.match(/Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)|INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
        if (match) {
          const amountStr = (match[1] || match[2]).replace(/,/g, '');
          return parseFloat(amountStr);
        }
        return null;
      },
      merchant: (text: string) => {
        const match = text.match(/to\s+(.+?)\s+on|at\s+(.+?)\s+on/i);
        return match ? (match[1] || match[2]).trim() : null;
      },
      type: (text: string) => text.toLowerCase().includes('debited') ? 'debit' : 'credit',
      method: (text: string) => {
        if (text.toLowerCase().includes('upi')) return 'UPI';
        if (text.toLowerCase().includes('card')) return 'Card';
        return 'Net Banking';
      }
    }
  },
  // SBI Bank
  {
    bank: 'SBI',
    patterns: [
      /Rs\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*debited.*?A\/c\s*(\*\*\d+).*?(\w+)/i,
      /INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*spent.*?(\w+)/i
    ],
    extractors: {
      amount: (text: string) => {
        const match = text.match(/Rs\s*(\d+(?:,\d+)*(?:\.\d{2})?)|INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
        if (match) {
          const amountStr = (match[1] || match[2]).replace(/,/g, '');
          return parseFloat(amountStr);
        }
        return null;
      },
      merchant: (text: string) => {
        const match = text.match(/at\s+(.+?)\s+on|spent\s+at\s+(.+)/i);
        return match ? (match[1] || match[2]).trim() : null;
      },
      type: (text: string) => text.toLowerCase().includes('debited') || text.toLowerCase().includes('spent') ? 'debit' : 'credit',
      method: (text: string) => {
        if (text.toLowerCase().includes('upi')) return 'UPI';
        if (text.toLowerCase().includes('card')) return 'Card';
        return 'Net Banking';
      }
    }
  },
  // PhonePe
  {
    bank: 'PhonePe',
    patterns: [
      /Rs\.(\d+(?:,\d+)*(?:\.\d{2})?)\s*sent\s*to\s*(.+?)\s*via/i,
      /Rs\.(\d+(?:,\d+)*(?:\.\d{2})?)\s*paid\s*to\s*(.+?)\s*using/i
    ],
    extractors: {
      amount: (text: string) => {
        const match = text.match(/Rs\.(\d+(?:,\d+)*(?:\.\d{2})?)/i);
        if (match) {
          return parseFloat(match[1].replace(/,/g, ''));
        }
        return null;
      },
      merchant: (text: string) => {
        const match = text.match(/(?:sent\s*to|paid\s*to)\s*(.+?)\s*(?:via|using)/i);
        return match ? match[1].trim() : null;
      },
      type: () => 'debit' as const,
      method: () => 'UPI' as PaymentMethod
    }
  },
  // Google Pay
  {
    bank: 'Google Pay',
    patterns: [
      /You\s*sent\s*₹(\d+(?:,\d+)*(?:\.\d{2})?)\s*to\s*(.+?)\s*using/i,
      /₹(\d+(?:,\d+)*(?:\.\d{2})?)\s*sent\s*to\s*(.+?)\s*via/i
    ],
    extractors: {
      amount: (text: string) => {
        const match = text.match(/₹(\d+(?:,\d+)*(?:\.\d{2})?)/i);
        if (match) {
          return parseFloat(match[1].replace(/,/g, ''));
        }
        return null;
      },
      merchant: (text: string) => {
        const match = text.match(/(?:sent.*?to|to)\s*(.+?)\s*(?:using|via)/i);
        return match ? match[1].trim() : null;
      },
      type: () => 'debit' as const,
      method: () => 'UPI' as PaymentMethod
    }
  }
];

export class SMSParser {
  static parseTransaction(smsText: string): Partial<Transaction> | null {
    for (const pattern of smsPatterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(smsText)) {
          const amount = pattern.extractors.amount(smsText);
          const merchant = pattern.extractors.merchant(smsText);
          const type = pattern.extractors.type(smsText);
          const method = pattern.extractors.method(smsText);

          if (amount) {
            return {
              amount,
              description: merchant || 'Unknown Transaction',
              merchant: merchant || undefined,
              type,
              method,
              rawMessage: smsText,
              date: new Date()
            };
          }
        }
      }
    }
    return null;
  }

  static extractAllTransactions(smsMessages: string[]): Partial<Transaction>[] {
    return smsMessages
      .map(sms => this.parseTransaction(sms))
      .filter(transaction => transaction !== null) as Partial<Transaction>[];
  }
}