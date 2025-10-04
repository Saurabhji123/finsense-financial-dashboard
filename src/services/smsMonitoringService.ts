import { Transaction, PaymentMethod, TransactionCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { CategorizationEngine } from '../utils/categorizationEngine';

// Real-time SMS monitoring service for web browsers
export class SMSMonitoringService {
  private listeners: ((transaction: Transaction) => void)[] = [];
  private isMonitoring = false;
  private simulationTimer?: NodeJS.Timeout;

  // Since browsers can't access SMS directly, we'll simulate real-time SMS monitoring
  // In a real mobile app, this would use SMS permission APIs
  startMonitoring(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('🔄 Starting SMS monitoring service...');
      this.isMonitoring = true;
      
      // Simulate real-time SMS monitoring with periodic new transactions
      this.simulateRealTimeSMS();
      
      resolve(true);
    });
  }

  stopMonitoring(): void {
    console.log('⏹️ Stopping SMS monitoring service...');
    this.isMonitoring = false;
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
    }
  }

  // Subscribe to new transaction notifications
  onNewTransaction(callback: (transaction: Transaction) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private simulateRealTimeSMS(): void {
    // Simulate receiving SMS every 30-120 seconds
    const scheduleNext = () => {
      if (!this.isMonitoring) return;
      
      const delay = Math.random() * 90000 + 30000; // 30-120 seconds
      this.simulationTimer = setTimeout(() => {
        this.processNewSMS();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  private processNewSMS(): void {
    // Generate realistic SMS messages
    const smsTemplates = [
      {
        bank: 'HDFC',
        message: `Rs {amount} debited from A/c **{account} on {date} {time} for UPI txn to {merchant}. UPI Ref {ref}. Avl Bal Rs {balance}. Not you? Call HDFC Bank.`,
        merchants: ['Swiggy', 'Zomato', 'Amazon', 'Flipkart', 'Metro Station', 'Uber']
      },
      {
        bank: 'SBI',
        message: `Dear Customer, Rs {amount} debited from A/c **{account} on {date} {time} at {merchant}. Avl Bal: Rs {balance}. For support call SBI.`,
        merchants: ['BigBazaar', 'Reliance Digital', 'Cafe Coffee Day', 'BookMyShow', 'PVR Cinemas']
      },
      {
        bank: 'PhonePe',
        message: `Hi! Rs {amount} sent to {merchant} on {date} {time}. UPI transaction ID: {ref}. Thanks for using PhonePe!`,
        merchants: ['Local Restaurant', 'Medical Store', 'Grocery Store', 'Petrol Pump', 'Auto Driver']
      },
      {
        bank: 'GooglePay',
        message: `You sent ₹{amount} to {merchant} using Google Pay on {date} {time}. UPI transaction ID: {ref}`,
        merchants: ['Electricity Bill', 'Mobile Recharge', 'DTH Recharge', 'Friend Transfer']
      }
    ];

    const template = smsTemplates[Math.floor(Math.random() * smsTemplates.length)];
    const merchant = template.merchants[Math.floor(Math.random() * template.merchants.length)];
    const amount = Math.floor(Math.random() * 2000) + 50;
    const account = Math.floor(Math.random() * 9000) + 1000;
    const balance = Math.floor(Math.random() * 50000) + 10000;
    const ref = Math.random().toString(36).substring(2, 12).toUpperCase();
    const now = new Date();
    
    const smsMessage = template.message
      .replace('{amount}', amount.toString())
      .replace('{merchant}', merchant)
      .replace('{account}', account.toString())
      .replace('{balance}', balance.toString())
      .replace('{ref}', ref)
      .replace('{date}', now.toLocaleDateString('en-IN'))
      .replace('{time}', now.toLocaleTimeString('en-IN', { hour12: false }));

    // Parse the SMS and create transaction
    const transaction = this.parseSMSToTransaction(smsMessage, merchant, amount);
    
    if (transaction) {
      console.log('📱 New SMS transaction detected:', transaction);
      // Notify all listeners
      this.listeners.forEach(listener => listener(transaction));
    }
  }

  private parseSMSToTransaction(smsMessage: string, merchant: string, amount: number): Transaction {
    const category = CategorizationEngine.categorizeTransaction(merchant, merchant);
    
    return {
      id: uuidv4(),
      amount,
      description: `${merchant} - Auto detected from SMS`,
      category,
      date: new Date(),
      type: 'debit',
      merchant,
      method: this.detectPaymentMethod(smsMessage),
      rawMessage: smsMessage
    };
  }

  private detectPaymentMethod(smsMessage: string): PaymentMethod {
    const message = smsMessage.toLowerCase();
    
    if (message.includes('upi') || message.includes('phonepe') || message.includes('googlepay')) {
      return 'UPI';
    } else if (message.includes('card')) {
      return 'Card';
    } else if (message.includes('netbanking') || message.includes('net banking')) {
      return 'Net Banking';
    } else {
      return 'UPI'; // Default for most modern transactions
    }
  }
}

// Singleton instance
export const smsMonitoringService = new SMSMonitoringService();