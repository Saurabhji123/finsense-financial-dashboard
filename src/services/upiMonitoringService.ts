import { Transaction } from '../types';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { CategorizationEngine } from '../utils/categorizationEngine';

export interface UPITransaction {
  id: string;
  upiId: string;
  recipientUpiId?: string;
  merchantName?: string;
  amount: number;
  type: 'sent' | 'received';
  status: 'success' | 'failed' | 'pending';
  referenceId: string;
  appUsed: 'PhonePe' | 'GooglePay' | 'Paytm' | 'BHIM' | 'AmazonPay';
  timestamp: Date;
  description: string;
}

export class UPIMonitoringService {
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  // Start monitoring UPI transactions from popular apps
  startUPIMonitoring(userId: string): void {
    if (this.isMonitoring) {
      console.log('📱 UPI monitoring is already active');
      return;
    }

    console.log('📱 Starting UPI transaction monitoring...');
    this.isMonitoring = true;

    const monitorTransactions = async () => {
      if (!this.isMonitoring) return;

      try {
        // Monitor each UPI app
        const upiApps: Array<UPIPlatform['appName']> = ['PhonePe', 'GooglePay', 'Paytm', 'BHIM', 'AmazonPay'];
        
        for (const app of upiApps) {
          const transactions = await this.simulateUPIAppData(app);
          
          for (const upiTransaction of transactions) {
            const transaction = await this.convertUPIToTransaction(upiTransaction, userId);
            
            // Store in Firebase
            await addDoc(collection(db, 'transactions'), {
              ...transaction,
              userId,
              date: Timestamp.fromDate(transaction.date)
            });
          }
        }

        console.log('📊 UPI monitoring cycle completed');
      } catch (error) {
        console.error('❌ UPI monitoring error:', error);
      }
    };

    // Initial monitoring
    monitorTransactions();

    // Monitor every 30 seconds for real-time updates
    this.monitoringInterval = setInterval(monitorTransactions, 30 * 1000);
  }

  stopUPIMonitoring(): void {
    console.log('⏹️ Stopping UPI transaction monitoring...');
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  // Simulate real-time UPI transaction data from apps
  private async simulateUPIAppData(appName: UPIPlatform['appName']): Promise<UPITransaction[]> {
    // Simulate app API call latency
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const transactions: UPITransaction[] = [];
    
    // 30% chance of new transaction in this monitoring cycle
    if (Math.random() < 0.3) {
      const transactionCount = Math.floor(Math.random() * 3) + 1; // 1-3 transactions

      const merchants = this.getMerchantsForApp(appName);
      const upiIds = [
        'user123@paytm', 'shopkeeper@phonepe', 'restaurant@gpay',
        'friend@upi', 'vendor@bhim', 'store@amazonpay'
      ];

      for (let i = 0; i < transactionCount; i++) {
        const merchant = merchants[Math.floor(Math.random() * merchants.length)];
        const amount = Math.floor(Math.random() * 2000) + 50;
        const isSent = Math.random() > 0.2; // 80% sent, 20% received
        const status = Math.random() > 0.05 ? 'success' : 'failed'; // 95% success rate

        transactions.push({
          id: uuidv4(),
          upiId: 'user@upi',
          recipientUpiId: isSent ? upiIds[Math.floor(Math.random() * upiIds.length)] : undefined,
          merchantName: merchant.name,
          amount,
          type: isSent ? 'sent' : 'received',
          status: status as 'success' | 'failed',
          referenceId: Math.random().toString(36).substring(2, 12).toUpperCase(),
          appUsed: appName,
          timestamp: new Date(),
          description: `${merchant.name} - ${appName} UPI`
        });
      }
    }

    return transactions;
  }

  // Convert UPI transaction to our Transaction format
  private async convertUPIToTransaction(upiTransaction: UPITransaction, userId: string): Promise<Transaction> {
    const category = CategorizationEngine.categorizeTransaction(upiTransaction.description, upiTransaction.merchantName || '');

    return {
      id: upiTransaction.id,
      amount: upiTransaction.amount,
      description: upiTransaction.description,
      category,
      date: upiTransaction.timestamp,
      type: upiTransaction.type === 'sent' ? 'debit' : 'credit',
      merchant: upiTransaction.merchantName || 'Unknown',
      method: 'UPI',
      rawMessage: this.generateUPINotification(upiTransaction)
    };
  }

  // Generate realistic UPI notification message
  private generateUPINotification(transaction: UPITransaction): string {
    const { appUsed, amount, merchantName, referenceId, status, type } = transaction;
    const time = transaction.timestamp.toLocaleTimeString('en-IN', { hour12: true });

    if (status === 'failed') {
      return `${appUsed}: Payment of ₹${amount} to ${merchantName} failed. Ref: ${referenceId}. Money will be refunded within 24 hours.`;
    }

    if (type === 'sent') {
      return `${appUsed}: ₹${amount} sent to ${merchantName} successfully at ${time}. UPI Ref: ${referenceId}. Check your account balance.`;
    } else {
      return `${appUsed}: ₹${amount} received from ${merchantName || 'someone'} at ${time}. UPI Ref: ${referenceId}. Money added to your account.`;
    }
  }

  // Get typical merchants for each UPI app
  private getMerchantsForApp(appName: UPIPlatform['appName']): Array<{ name: string; category: string }> {
    const commonMerchants = [
      { name: 'Swiggy', category: 'Food' },
      { name: 'Zomato', category: 'Food' },
      { name: 'Uber', category: 'Transport' },
      { name: 'Ola Cabs', category: 'Transport' },
      { name: 'BookMyShow', category: 'Entertainment' },
      { name: 'Big Bazaar', category: 'Shopping' },
      { name: 'Reliance Trends', category: 'Shopping' },
      { name: 'Medical Store', category: 'Healthcare' },
      { name: 'Petrol Pump', category: 'Transport' },
      { name: 'Grocery Store', category: 'Food' }
    ];

    const appSpecificMerchants = {
      'PhonePe': [
        { name: 'PhonePe Recharge', category: 'Bills' },
        { name: 'Myntra', category: 'Shopping' },
        { name: 'Dominos Pizza', category: 'Food' }
      ],
      'GooglePay': [
        { name: 'Google Pay Recharge', category: 'Bills' },
        { name: 'YouTube Premium', category: 'Entertainment' },
        { name: 'Google Drive Storage', category: 'Bills' }
      ],
      'Paytm': [
        { name: 'Paytm Mall', category: 'Shopping' },
        { name: 'Paytm Recharge', category: 'Bills' },
        { name: 'Movie Tickets', category: 'Entertainment' }
      ],
      'BHIM': [
        { name: 'Electricity Bill', category: 'Bills' },
        { name: 'Water Bill', category: 'Bills' },
        { name: 'Government Services', category: 'Bills' }
      ],
      'AmazonPay': [
        { name: 'Amazon.in', category: 'Shopping' },
        { name: 'Amazon Prime', category: 'Entertainment' },
        { name: 'Whole Foods', category: 'Food' }
      ]
    };

    return [...commonMerchants, ...appSpecificMerchants[appName]];
  }

  // Monitor specific UPI ID transactions
  async monitorUPIId(upiId: string, userId: string): Promise<UPITransaction[]> {
    console.log(`🔍 Monitoring transactions for UPI ID: ${upiId}`);
    
    // In real implementation, this would connect to UPI service providers
    // For now, we simulate some transactions for this UPI ID
    const transactions: UPITransaction[] = [];
    const transactionCount = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < transactionCount; i++) {
      const amount = Math.floor(Math.random() * 1500) + 100;
      const merchants = this.getMerchantsForApp('PhonePe'); // Default to PhonePe
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];

      transactions.push({
        id: uuidv4(),
        upiId,
        merchantName: merchant.name,
        amount,
        type: Math.random() > 0.3 ? 'sent' : 'received',
        status: 'success',
        referenceId: Math.random().toString(36).substring(2, 12).toUpperCase(),
        appUsed: 'PhonePe',
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        description: `${merchant.name} - UPI Transaction`
      });
    }

    return transactions;
  }

  // Get UPI transaction analytics
  async getUPIAnalytics(userId: string, days: number = 30): Promise<{
    totalTransactions: number;
    totalAmount: number;
    averageAmount: number;
    topApps: Array<{ app: string; count: number; amount: number }>;
    successRate: number;
  }> {
    console.log(`📊 Generating UPI analytics for last ${days} days...`);

    // Simulate analytics data
    const apps: Array<UPIPlatform['appName']> = ['PhonePe', 'GooglePay', 'Paytm', 'BHIM', 'AmazonPay'];
    const totalTransactions = Math.floor(Math.random() * 200) + 100;
    const totalAmount = Math.floor(Math.random() * 50000) + 20000;
    
    const topApps = apps.map(app => ({
      app,
      count: Math.floor(Math.random() * 50) + 10,
      amount: Math.floor(Math.random() * 15000) + 5000
    })).sort((a, b) => b.count - a.count);

    return {
      totalTransactions,
      totalAmount,
      averageAmount: Math.floor(totalAmount / totalTransactions),
      topApps: topApps.slice(0, 3),
      successRate: 95 + Math.random() * 4 // 95-99% success rate
    };
  }
}

// Define UPI platform interface
interface UPIPlatform {
  appName: 'PhonePe' | 'GooglePay' | 'Paytm' | 'BHIM' | 'AmazonPay';
}

export const upiMonitoringService = new UPIMonitoringService();