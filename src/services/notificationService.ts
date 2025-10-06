export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'budget' | 'investment' | 'security' | 'insight';
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  investmentAlerts: boolean;
  budgetAlerts: boolean;
  securityAlerts: boolean;
}

class NotificationService {
  private notifications: AppNotification[] = [];
  private subscribers: ((notifications: AppNotification[]) => void)[] = [];
  private settings: NotificationSettings;

  constructor() {
    this.settings = this.loadSettings();
    this.loadNotifications();
    this.startRealTimeMonitoring();
  }

  private loadSettings(): NotificationSettings {
    const saved = localStorage.getItem('notification-settings');
    return saved ? JSON.parse(saved) : {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      weeklyReports: true,
      investmentAlerts: true,
      budgetAlerts: true,
      securityAlerts: true
    };
  }

  private saveSettings(): void {
    localStorage.setItem('notification-settings', JSON.stringify(this.settings));
  }

  private loadNotifications(): void {
    const saved = localStorage.getItem('app-notifications');
    if (saved) {
      this.notifications = JSON.parse(saved).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
  }

  private saveNotifications(): void {
    localStorage.setItem('app-notifications', JSON.stringify(this.notifications));
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.notifications));
  }

  public addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead' | 'priority'>): void {
    const newNotification: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      isRead: false,
      priority: this.determinePriority(notification.type)
    };

    this.notifications.unshift(newNotification);
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveNotifications();
    this.notifySubscribers();

    // Show browser notification if enabled and permitted
    if (this.settings.pushNotifications && this.getPermissionStatus() === 'granted') {
      this.showBrowserNotification(newNotification);
    }
  }

  private determinePriority(type: AppNotification['type']): 'low' | 'medium' | 'high' {
    switch (type) {
      case 'security': return 'high';
      case 'budget': return 'high';
      case 'investment': return 'medium';
      case 'transaction': return 'medium';
      case 'insight': return 'low';
      default: return 'medium';
    }
  }

  private showBrowserNotification(notification: AppNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high'
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      if (notification.priority !== 'high') {
        setTimeout(() => {
          browserNotification.close();
        }, 8000);
      }
    }
  }

  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveNotifications();
      this.notifySubscribers();
    }
  }

  public markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.saveNotifications();
    this.notifySubscribers();
  }

  public deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifySubscribers();
  }

  public subscribe(callback: (notifications: AppNotification[]) => void): () => void {
    this.subscribers.push(callback);
    callback(this.notifications);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  public updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  public getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public startRealTimeMonitoring(): void {
    // Simulate real-time transaction monitoring
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        this.simulateTransactionNotification();
      }
    }, 30000);
  }

  private simulateTransactionNotification(): void {
    const transactions = [
      { merchant: 'Swiggy', amount: 450, category: 'Food' },
      { merchant: 'Uber', amount: 180, category: 'Transport' },
      { merchant: 'Amazon', amount: 1200, category: 'Shopping' },
      { merchant: 'Netflix', amount: 799, category: 'Entertainment' }
    ];

    const transaction = transactions[Math.floor(Math.random() * transactions.length)];
    
    this.addNotification({
      title: `💳 Transaction Alert`,
      message: `₹${transaction.amount} spent at ${transaction.merchant} (${transaction.category})`,
      type: 'transaction'
    });
  }

  public sendInvestmentAlert(stock: string, change: number): void {
    if (this.settings.investmentAlerts) {
      const emoji = change > 0 ? '📈' : '📉';
      const direction = change > 0 ? 'gained' : 'lost';
      
      this.addNotification({
        title: `${emoji} Investment Update`,
        message: `${stock} has ${direction} ${Math.abs(change).toFixed(2)}% today`,
        type: 'investment'
      });
    }
  }

  public sendBudgetInsight(insight: string): void {
    this.addNotification({
      title: '💡 Smart Budget Insight',
      message: insight,
      type: 'insight'
    });
  }
}

export const notificationService = new NotificationService();
