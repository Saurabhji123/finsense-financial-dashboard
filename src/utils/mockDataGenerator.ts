import { Transaction, TransactionCategory, PaymentMethod } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { subDays, subHours, format } from 'date-fns';

// Sample merchants for different categories
const merchantData = {
  Food: [
    'Swiggy', 'Zomato', 'McDonald\'s', 'KFC', 'Domino\'s Pizza', 'Subway',
    'Cafe Coffee Day', 'Starbucks', 'Pizza Hut', 'Burger King',
    'Local Restaurant', 'Street Food Vendor', 'Haldiram\'s'
  ],
  Transport: [
    'Uber', 'Ola', 'Rapido', 'Metro Station', 'Bus Ticket',
    'Auto Rickshaw', 'Petrol Pump', 'Parking Fee', 'Toll Plaza'
  ],
  Shopping: [
    'Amazon', 'Flipkart', 'Big Bazaar', 'Reliance Digital',
    'More Supermarket', 'Spencer\'s', 'Myntra', 'Ajio',
    'Lifestyle', 'Shoppers Stop', 'Local Store'
  ],
  Entertainment: [
    'BookMyShow', 'Netflix', 'Amazon Prime', 'Spotify',
    'PVR Cinemas', 'INOX', 'Gaming Store', 'YouTube Premium'
  ],
  Bills: [
    'Electricity Bill', 'Water Bill', 'Gas Bill', 'Internet Bill',
    'Mobile Recharge', 'DTH Recharge', 'Insurance Premium',
    'Loan EMI', 'Credit Card Payment'
  ],
  Transfer: [
    'Bank Transfer', 'UPI Transfer', 'Wallet Transfer',
    'Friend Transfer', 'Family Transfer'
  ],
  Other: [
    'ATM Withdrawal', 'Bank Charges', 'Medical', 'Education',
    'Miscellaneous'
  ]
};

// Sample SMS templates for different banks/services
const smsTemplates = [
  'Rs.{amount} debited from A/c **{account} to {merchant} on {date} UPI Ref {ref}. Avl Bal Rs.{balance}. Not you? Call HDFC Bank.',
  'INR {amount} debited from A/c **{account} at {merchant} on {date}. Avl Bal: Rs.{balance}. Not you? Call SBI.',
  'Rs.{amount} sent to {merchant} via PhonePe on {date}. UPI Ref: {ref}. Download app: http://phonepe.com/app',
  'You sent ₹{amount} to {merchant} using Google Pay on {date}. UPI transaction ID: {ref}',
  'Rs {amount} spent at {merchant} using SBI Card **{account} on {date}. Avl limit Rs.{balance}.'
];

export class MockDataGenerator {
  private static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static getRandomAmount(category: TransactionCategory): number {
    const ranges = {
      Food: [50, 800],
      Transport: [20, 500],
      Shopping: [200, 5000],
      Entertainment: [100, 1500],
      Bills: [500, 3000],
      Transfer: [100, 10000],
      Other: [50, 2000]
    };
    
    const [min, max] = ranges[category];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static getRandomDate(daysBack: number = 30): Date {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * daysBack);
    const randomHours = Math.floor(Math.random() * 24);
    return subHours(subDays(now, randomDays), randomHours);
  }

  private static generateSMSMessage(transaction: Partial<Transaction>): string {
    const template = this.getRandomElement(smsTemplates);
    const account = Math.floor(Math.random() * 9000) + 1000;
    const balance = Math.floor(Math.random() * 50000) + 10000;
    const ref = Math.random().toString(36).substring(2, 12).toUpperCase();
    
    return template
      .replace('{amount}', transaction.amount?.toString() || '0')
      .replace('{merchant}', transaction.merchant || 'Unknown')
      .replace('{date}', format(transaction.date || new Date(), 'dd-MM-yy'))
      .replace('{account}', account.toString())
      .replace('{balance}', balance.toString())
      .replace('{ref}', ref);
  }

  static generateMockTransaction(category?: TransactionCategory): Transaction {
    const selectedCategory = category || this.getRandomElement(Object.keys(merchantData) as TransactionCategory[]);
    const merchant = this.getRandomElement(merchantData[selectedCategory]);
    const amount = this.getRandomAmount(selectedCategory);
    const date = this.getRandomDate();
    const method = this.getRandomElement(['UPI', 'Card', 'Net Banking'] as PaymentMethod[]);
    
    const baseTransaction: Partial<Transaction> = {
      amount,
      merchant,
      date,
      method
    };

    const smsMessage = this.generateSMSMessage(baseTransaction);

    return {
      id: uuidv4(),
      amount,
      description: `${merchant} - ${selectedCategory}`,
      category: selectedCategory,
      date,
      type: 'debit',
      merchant,
      method,
      rawMessage: smsMessage
    };
  }

  static generateMockTransactions(count: number = 50, daysBack: number = 30): Transaction[] {
    const transactions: Transaction[] = [];
    
    // Generate a realistic distribution of categories
    const categoryWeights = {
      Food: 0.25,
      Transport: 0.15,
      Shopping: 0.20,
      Entertainment: 0.10,
      Bills: 0.15,
      Transfer: 0.10,
      Other: 0.05
    };

    for (let i = 0; i < count; i++) {
      const random = Math.random();
      let cumulativeWeight = 0;
      let selectedCategory: TransactionCategory = 'Other';

      for (const [category, weight] of Object.entries(categoryWeights)) {
        cumulativeWeight += weight;
        if (random <= cumulativeWeight) {
          selectedCategory = category as TransactionCategory;
          break;
        }
      }

      const transaction = this.generateMockTransaction(selectedCategory);
      // Adjust date to be within the specified range
      transaction.date = this.getRandomDate(daysBack);
      transactions.push(transaction);
    }

    // Sort by date (newest first)
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  static generateIncomeTransactions(count: number = 5): Transaction[] {
    const incomeSourcesAndAmounts = [
      { source: 'Salary Credit', amount: [25000, 80000] },
      { source: 'Freelance Payment', amount: [5000, 25000] },
      { source: 'Investment Returns', amount: [1000, 10000] },
      { source: 'Gift/Transfer', amount: [500, 5000] },
      { source: 'Refund', amount: [100, 2000] }
    ];

    return Array.from({ length: count }, () => {
      const source = this.getRandomElement(incomeSourcesAndAmounts);
      const [min, max] = source.amount;
      const amount = Math.floor(Math.random() * (max - min + 1)) + min;

      return {
        id: uuidv4(),
        amount,
        description: source.source,
        category: 'Transfer' as TransactionCategory,
        date: this.getRandomDate(30),
        type: 'credit' as const,
        merchant: source.source,
        method: 'Net Banking' as PaymentMethod,
        rawMessage: `Rs.${amount} credited to your account from ${source.source} on ${format(new Date(), 'dd-MM-yy')}`
      };
    });
  }

  static generateSampleSMSMessages(): string[] {
    const transactions = this.generateMockTransactions(20);
    return transactions.map(t => t.rawMessage || '');
  }
}