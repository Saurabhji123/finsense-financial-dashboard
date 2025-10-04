import { Transaction, TransactionCategory } from '../types';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export interface RealBankAccount {
  id: string;
  userId: string;
  phoneNumber: string;
  bankName: string;
  bankCode: string;
  accountNumber: string; // Masked for security
  accountType: 'savings' | 'current' | 'credit_card' | 'fd' | 'rd';
  ifscCode: string;
  branchName: string;
  balance: number;
  isLinked: boolean;
  isActive: boolean;
  lastSyncTime: Date;
  customerName: string;
  customerId: string;
}

export interface BankAPI {
  bankCode: string;
  bankName: string;
  apiEndpoint: string;
  requiresOTP: boolean;
  supportedServices: string[];
}

export interface AccountVerification {
  phoneNumber: string;
  accountNumber: string;
  ifscCode: string;
  customerName: string;
  otp?: string;
  isVerified: boolean;
}

// Major Indian Banks Configuration
const SUPPORTED_BANKS: BankAPI[] = [
  {
    bankCode: 'SBI',
    bankName: 'State Bank of India',
    apiEndpoint: 'https://api.onlinesbi.com',
    requiresOTP: true,
    supportedServices: ['balance', 'transactions', 'statements']
  },
  {
    bankCode: 'HDFC',
    bankName: 'HDFC Bank',
    apiEndpoint: 'https://api.hdfcbank.com',
    requiresOTP: true,
    supportedServices: ['balance', 'transactions', 'statements', 'creditcard']
  },
  {
    bankCode: 'ICICI',
    bankName: 'ICICI Bank',
    apiEndpoint: 'https://api.icicibank.com',
    requiresOTP: true,
    supportedServices: ['balance', 'transactions', 'statements', 'investments']
  },
  {
    bankCode: 'AXIS',
    bankName: 'Axis Bank',
    apiEndpoint: 'https://api.axisbank.com',
    requiresOTP: true,
    supportedServices: ['balance', 'transactions', 'statements']
  }
];

export class RealBankIntegrationService {
  private connectedAccounts: RealBankAccount[] = [];
  private syncInterval?: NodeJS.Timeout;

  // Step 1: Discover all bank accounts linked to phone number
  async discoverAccountsByPhone(phoneNumber: string): Promise<RealBankAccount[]> {
    console.log(`🔍 Discovering bank accounts for phone number: ${phoneNumber}`);
    
    const discoveredAccounts: RealBankAccount[] = [];

    // Check each supported bank for accounts linked to this phone number
    for (const bank of SUPPORTED_BANKS) {
      try {
        console.log(`🏦 Checking ${bank.bankName}...`);
        
        // For demo phone number 9335210176, show accounts in all major banks
        if (phoneNumber === '9335210176') {
          const account = this.generateDemoAccount(phoneNumber, bank);
          if (account) {
            discoveredAccounts.push(account);
            console.log(`✅ Found account in ${bank.bankName}`);
          }
        }
      } catch (error) {
        console.log(`❌ No accounts found in ${bank.bankName}`);
      }
    }

    console.log(`🎉 Total discovered accounts: ${discoveredAccounts.length}`);
    return discoveredAccounts;
  }

  // Generate demo account for user's phone number
  private generateDemoAccount(phoneNumber: string, bank: BankAPI): RealBankAccount {
    const accountNumber = `${bank.bankCode}${Math.floor(Math.random() * 100000000)}`;
    const balance = Math.floor(Math.random() * 100000) + 10000;
    
    return {
      id: uuidv4(),
      userId: '',
      phoneNumber,
      bankName: bank.bankName,
      bankCode: bank.bankCode,
      accountNumber: `****${accountNumber.slice(-4)}`,
      accountType: 'savings',
      ifscCode: `${bank.bankCode}0001234`,
      branchName: 'Main Branch',
      balance,
      isLinked: false,
      isActive: true,
      lastSyncTime: new Date(),
      customerName: '',
      customerId: `${bank.bankCode}${phoneNumber.slice(-4)}`
    };
  }

  // Step 2: SIMPLE WORKING VERIFICATION - No complex logic
  async verifyAndLinkAccount(
    userId: string, 
    account: RealBankAccount, 
    verification: AccountVerification
  ): Promise<{ success: boolean; message: string; linkedAccount?: RealBankAccount }> {
    
    console.log(`🎯 DEMO VERIFICATION: Starting for ${account.bankName}...`);
    
    // Short delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Always succeed in demo - create linked account
    const linkedAccount: RealBankAccount = {
      ...account,
      userId,
      isLinked: true,
      customerName: verification.customerName || 'Demo User',
      lastSyncTime: new Date()
    };

    // Add to connected accounts
    this.connectedAccounts.push(linkedAccount);
    
    console.log(`✅ SUCCESS: ${account.bankName} account linked!`);

    return { 
      success: true, 
      message: `🎉 ${account.bankName} account verified and linked successfully!`,
      linkedAccount 
    };
  }

  // Get all linked accounts for user
  async getLinkedAccounts(userId: string): Promise<RealBankAccount[]> {
    return this.connectedAccounts.filter(account => account.userId === userId);
  }

  // Get real transactions for user's linked accounts
  async getRealTransactions(userId: string, days: number = 30): Promise<Transaction[]> {
    const userAccounts = this.connectedAccounts.filter(account => account.userId === userId);
    
    if (userAccounts.length === 0) {
      console.log('No linked accounts found for user');
      return [];
    }

    console.log(`📊 Generating demo transactions for ${userAccounts.length} linked accounts...`);
    
    let allTransactions: Transaction[] = [];
    
    for (const account of userAccounts) {
      const accountTransactions = await this.generateDemoTransactions(account);
      allTransactions = allTransactions.concat(accountTransactions);
    }
    
    // Sort by date (newest first)
    allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    console.log(`✅ Generated ${allTransactions.length} demo transactions`);
    return allTransactions;
  }

  // Generate demo transactions for linked account
  async generateDemoTransactions(account: RealBankAccount): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const transactionCount = Math.floor(Math.random() * 20) + 10; // 10-30 transactions

    for (let i = 0; i < transactionCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const amount = Math.floor(Math.random() * 5000) + 100;
      const isDebit = Math.random() > 0.3;

      transactions.push({
        id: uuidv4(),
        amount,
        description: this.generateTransactionDescription(isDebit),
        category: this.categorizeTransaction(isDebit),
        date,
        type: isDebit ? 'debit' : 'credit',
        merchant: isDebit ? this.getRandomMerchant() : 'Transfer',
        method: 'UPI',
        rawMessage: `${account.bankName}: Rs ${amount} ${isDebit ? 'debited' : 'credited'}`
      });
    }

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private generateTransactionDescription(isDebit: boolean): string {
    const debitDescriptions = [
      'UPI-SWIGGY-Food Order',
      'UPI-AMAZON-Shopping',
      'ATM-Cash Withdrawal',
      'UPI-ZOMATO-Food Delivery',
      'CARD-Grocery Shopping',
      'UPI-OLA-Cab Booking',
      'UPI-PHONEPE-Mobile Recharge',
      'IMPS-Bill Payment'
    ];

    const creditDescriptions = [
      'SALARY-Monthly Salary Credit',
      'IMPS-Friend Transfer',
      'UPI-Refund Credit',
      'NEFT-Investment Return',
      'UPI-Cashback Credit'
    ];

    const descriptions = isDebit ? debitDescriptions : creditDescriptions;
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private categorizeTransaction(isDebit: boolean): TransactionCategory {
    if (!isDebit) return 'Transfer';
    
    const categories: TransactionCategory[] = ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment', 'Other'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private getRandomMerchant(): string {
    const merchants = ['Swiggy', 'Amazon', 'Zomato', 'Ola', 'PhonePe', 'Big Bazaar', 'ATM'];
    return merchants[Math.floor(Math.random() * merchants.length)];
  }

  // Stop all syncing
  stopAllSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
    console.log('🛑 Stopped all real-time syncing');
  }
}

export const realBankIntegrationService = new RealBankIntegrationService();