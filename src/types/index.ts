export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: TransactionCategory;
  date: Date;
  type: 'debit' | 'credit';
  merchant?: string;
  method: PaymentMethod;
  rawMessage?: string;
}

export type TransactionCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Entertainment' 
  | 'Bills' 
  | 'Transfer'
  | 'Other';

export type PaymentMethod = 
  | 'UPI' 
  | 'Card' 
  | 'Net Banking' 
  | 'Cash' 
  | 'Wallet';

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  createdAt: Date;
}

export interface CategorySpending {
  category: TransactionCategory;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyInsight {
  month: string;
  totalSpent: number;
  totalIncome: number;
  topCategory: TransactionCategory;
  trend: 'increasing' | 'decreasing' | 'stable';
  comparedToLastMonth: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'savings' | 'budget' | 'investment';
  priority: 'high' | 'medium' | 'low';
  category?: TransactionCategory;
}

export interface SMSPattern {
  bank: string;
  patterns: RegExp[];
  extractors: {
    amount: (text: string) => number | null;
    merchant: (text: string) => string | null;
    type: (text: string) => 'debit' | 'credit';
    method: (text: string) => PaymentMethod;
    date?: (text: string) => Date;
  };
}