import { Transaction, User } from '../types';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string; // Masked: **1234
  accountType: 'savings' | 'current' | 'credit_card';
  balance: number;
  isLinked: boolean;
  lastSyncTime: Date;
  isActive: boolean;
}

export interface UPIApp {
  id: string;
  userId: string;
  appName: 'PhonePe' | 'GooglePay' | 'Paytm' | 'BHIM' | 'AmazonPay';
  upiId: string;
  isLinked: boolean;
  lastSyncTime: Date;
  transactionCount: number;
}

export class BankIntegrationService {
  private syncInterval?: NodeJS.Timeout;
  private isAutoSyncEnabled = false;

  // Simulate bank account linking (in real app, would use bank APIs or account aggregators)
  async linkBankAccount(userId: string, bankName: string, accountNumber: string): Promise<BankAccount> {
    console.log(`🏦 Linking ${bankName} account ending with ${accountNumber.slice(-4)}...`);
    
    // Simulate account verification process
    await this.simulateAccountVerification();
    
    const bankAccount: BankAccount = {
      id: uuidv4(),
      userId,
      bankName,
      accountNumber: `**${accountNumber.slice(-4)}`,
      accountType: 'savings',
      balance: Math.floor(Math.random() * 100000) + 50000,
      isLinked: true,
      lastSyncTime: new Date(),
      isActive: true
    };

    // Store in Firebase
    await addDoc(collection(db, 'bankAccounts'), {
      ...bankAccount,
      lastSyncTime: Timestamp.fromDate(bankAccount.lastSyncTime)
    });

    console.log('✅ Bank account linked successfully!');
    return bankAccount;
  }

  // Link UPI applications
  async linkUPIApp(userId: string, appName: UPIApp['appName'], upiId: string): Promise<UPIApp> {
    console.log(`📱 Linking ${appName} with UPI ID: ${upiId}...`);

    const upiApp: UPIApp = {
      id: uuidv4(),
      userId,
      appName,
      upiId,
      isLinked: true,
      lastSyncTime: new Date(),
      transactionCount: Math.floor(Math.random() * 100) + 50
    };

    // Store in Firebase
    await addDoc(collection(db, 'upiApps'), {
      ...upiApp,
      lastSyncTime: Timestamp.fromDate(upiApp.lastSyncTime)
    });

    console.log('✅ UPI app linked successfully!');
    return upiApp;
  }

  // Fetch transactions from linked accounts automatically
  async fetchTransactionsFromBanks(userId: string): Promise<Transaction[]> {
    console.log('🔄 Fetching transactions from linked bank accounts...');

    // Get linked accounts
    const accounts = await this.getLinkedAccounts(userId);
    const allTransactions: Transaction[] = [];

    for (const account of accounts) {
      const transactions = await this.simulateBankAPICall(account);
      allTransactions.push(...transactions);
    }

    // Store new transactions in Firebase
    for (const transaction of allTransactions) {
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        userId,
        date: Timestamp.fromDate(transaction.date)
      });
    }

    console.log(`✅ Fetched ${allTransactions.length} new transactions`);
    return allTransactions;
  }

  // Start automatic sync every 5 minutes
  startAutoSync(userId: string): void {
    console.log('🔄 Starting automatic transaction sync...');
    this.isAutoSyncEnabled = true;

    const syncTransactions = async () => {
      if (!this.isAutoSyncEnabled) return;
      
      try {
        await this.fetchTransactionsFromBanks(userId);
        console.log('📊 Auto-sync completed successfully');
      } catch (error) {
        console.error('❌ Auto-sync failed:', error);
      }
    };

    // Initial sync
    syncTransactions();

    // Schedule recurring sync every 5 minutes
    this.syncInterval = setInterval(syncTransactions, 5 * 60 * 1000);
  }

  stopAutoSync(): void {
    console.log('⏹️ Stopping automatic transaction sync...');
    this.isAutoSyncEnabled = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  // Get all linked accounts for a user
  private async getLinkedAccounts(userId: string): Promise<BankAccount[]> {
    const accountsQuery = query(
      collection(db, 'bankAccounts'),
      where('userId', '==', userId),
      where('isLinked', '==', true)
    );

    const querySnapshot = await getDocs(accountsQuery);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      lastSyncTime: doc.data().lastSyncTime.toDate()
    } as BankAccount));
  }

  // Simulate bank API call for fetching transactions
  private async simulateBankAPICall(account: BankAccount): Promise<Transaction[]> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const transactions: Transaction[] = [];
    const transactionCount = Math.floor(Math.random() * 5) + 1; // 1-5 new transactions

    const merchants = [
      'Amazon India', 'Flipkart', 'Swiggy', 'Zomato', 'Uber', 'Ola',
      'Big Bazaar', 'Reliance Digital', 'BookMyShow', 'Netflix',
      'Electricity Board', 'Mobile Recharge', 'DTH Recharge',
      'Medical Store', 'Grocery Store', 'Petrol Pump'
    ];

    for (let i = 0; i < transactionCount; i++) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const amount = Math.floor(Math.random() * 3000) + 100;
      const isDebit = Math.random() > 0.1; // 90% debit, 10% credit

      transactions.push({
        id: uuidv4(),
        amount,
        description: `${merchant} - ${account.bankName}`,
        category: this.categorizeByMerchant(merchant),
        date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Last 24 hours
        type: isDebit ? 'debit' : 'credit',
        merchant,
        method: Math.random() > 0.5 ? 'UPI' : 'Card',
        rawMessage: this.generateBankSMS(account.bankName, merchant, amount, isDebit)
      });
    }

    return transactions;
  }

  private categorizeByMerchant(merchant: string): any {
    const merchantLower = merchant.toLowerCase();
    
    if (merchantLower.includes('swiggy') || merchantLower.includes('zomato')) return 'Food';
    if (merchantLower.includes('uber') || merchantLower.includes('ola') || merchantLower.includes('petrol')) return 'Transport';
    if (merchantLower.includes('amazon') || merchantLower.includes('flipkart') || merchantLower.includes('bazaar')) return 'Shopping';
    if (merchantLower.includes('bookmyshow') || merchantLower.includes('netflix')) return 'Entertainment';
    if (merchantLower.includes('electricity') || merchantLower.includes('recharge') || merchantLower.includes('dth')) return 'Bills';
    if (merchantLower.includes('medical') || merchantLower.includes('grocery')) return 'Other';
    
    return 'Shopping';
  }

  private generateBankSMS(bankName: string, merchant: string, amount: number, isDebit: boolean): string {
    const action = isDebit ? 'debited from' : 'credited to';
    const account = Math.floor(Math.random() * 9000) + 1000;
    const balance = Math.floor(Math.random() * 50000) + 10000;
    const ref = Math.random().toString(36).substring(2, 12).toUpperCase();
    const date = new Date().toLocaleDateString('en-IN');
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });

    return `Rs ${amount} ${action} A/c **${account} on ${date} ${time} for transaction at ${merchant}. Ref: ${ref}. Avl Bal: Rs ${balance}. ${bankName} Bank.`;
  }

  private async simulateAccountVerification(): Promise<void> {
    // Simulate account verification with OTP, etc.
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('✅ Account verification completed');
        resolve();
      }, 2000);
    });
  }

  // Detect and link accounts automatically from SMS patterns
  async autoDetectBankAccounts(userId: string, smsMessages: string[]): Promise<BankAccount[]> {
    console.log('🔍 Auto-detecting bank accounts from SMS patterns...');
    
    const detectedBanks = new Set<string>();
    const bankPatterns = [
      { name: 'HDFC Bank', patterns: ['HDFC', 'hdfc'] },
      { name: 'SBI', patterns: ['SBI', 'State Bank'] },
      { name: 'ICICI Bank', patterns: ['ICICI', 'icici'] },
      { name: 'Axis Bank', patterns: ['AXIS', 'axis'] },
      { name: 'Kotak Bank', patterns: ['KOTAK', 'kotak'] }
    ];

    // Analyze SMS messages for bank patterns
    smsMessages.forEach(sms => {
      bankPatterns.forEach(bank => {
        bank.patterns.forEach(pattern => {
          if (sms.includes(pattern)) {
            detectedBanks.add(bank.name);
          }
        });
      });
    });

    // Auto-link detected banks
    const linkedAccounts: BankAccount[] = [];
    const detectedBankArray = Array.from(detectedBanks);
    for (const bankName of detectedBankArray) {
      const account = await this.linkBankAccount(userId, bankName, '1234567890');
      linkedAccounts.push(account);
    }

    return linkedAccounts;
  }
}

export const bankIntegrationService = new BankIntegrationService();