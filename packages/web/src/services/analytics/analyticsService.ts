/**
 * Analytics Service
 * Tracks user behavior, system performance, and business metrics
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export interface UserMetrics {
  userId: string;
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: number;
  yieldEarned: number;
  transactionCount: number;
  lastActive: Date;
  registrationDate: Date;
  acquisitionSource?: string;
}

export interface SystemMetrics {
  timestamp: Date;
  activeUsers: number;
  totalVolume: number;
  totalYieldGenerated: number;
  averageTransactionSize: number;
  gasOptimizationSavings: number;
  errorRate: number;
  responseTime: number;
  uptime: number;
}

export interface PerformanceMetrics {
  timestamp: Date;
  pageLoadTime: number;
  apiResponseTime: number;
  transactionConfirmationTime: number;
  blockchainSyncTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isInitialized: boolean = false;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeService();
  }

  /**
   * Initialize analytics service
   */
  private async initializeService(): Promise<void> {
    try {
      // Load existing session data
      await this.loadSessionData();

      // Start periodic flush
      this.startPeriodicFlush();

      // Track page view
      this.trackEvent('page_view', {
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });

      this.isInitialized = true;
      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Load session data from storage
   */
  private async loadSessionData(): Promise<void> {
    try {
      // Check for existing session
      const storedSessionId = localStorage.getItem('analytics_session_id');
      const storedUserId = localStorage.getItem('analytics_user_id');

      if (storedSessionId) {
        this.sessionId = storedSessionId;
      } else {
        this.sessionId = this.generateSessionId();
        localStorage.setItem('analytics_session_id', this.sessionId);
      }

      if (storedUserId) {
        this.userId = storedUserId;
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track analytics event
   */
  public trackEvent(name: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized, event not tracked:', name);
      return;
    }

    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);

    // Immediately flush high-priority events
    if (this.isHighPriorityEvent(name)) {
      this.flushEvents();
    }
  }

  /**
   * Check if event should be flushed immediately
   */
  private isHighPriorityEvent(eventName: string): boolean {
    const highPriorityEvents = [
      'transaction_completed',
      'transaction_failed',
      'user_registered',
      'security_alert',
      'error_occurred',
    ];
    return highPriorityEvents.includes(eventName);
  }

  /**
   * Track user interaction
   */
  public trackInteraction(action: string, target: string, properties?: Record<string, any>): void {
    this.trackEvent('user_interaction', {
      action,
      target,
      ...properties,
    });
  }

  /**
   * Track transaction
   */
  public trackTransaction(
    type: 'deposit' | 'withdraw' | 'borrow' | 'repay',
    amount: number,
    status: 'pending' | 'completed' | 'failed',
    properties?: Record<string, any>
  ): void {
    this.trackEvent('transaction', {
      type,
      amount,
      status,
      currency: 'BTC',
      ...properties,
    });
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(metrics: Partial<PerformanceMetrics>): void {
    this.trackEvent('performance', {
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track error
   */
  public trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent('error', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Set user identifier
   */
  public setUserId(userId: string): void {
    this.userId = userId;
    localStorage.setItem('analytics_user_id', userId);

    this.trackEvent('user_identified', { userId });
  }

  /**
   * Get current session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get current user ID
   */
  public getUserId(): string | null {
    return this.userId;
  }

  /**
   * Start periodic flush of events
   */
  private startPeriodicFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Flush queued events to server
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEvents(events);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Send events to analytics server
   */
  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    // In a real implementation, this would send to your analytics service
    // For demo purposes, we'll just log and store locally
    console.log('Sending analytics events:', events);

    // Store events locally for demo
    const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    storedEvents.push(...events);

    // Keep only last 1000 events
    if (storedEvents.length > 1000) {
      storedEvents.splice(0, storedEvents.length - 1000);
    }

    localStorage.setItem('analytics_events', JSON.stringify(storedEvents));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Get user metrics
   */
  public async getUserMetrics(userId?: string): Promise<UserMetrics | null> {
    try {
      // In a real implementation, this would fetch from your analytics backend
      // For demo purposes, return mock data
      return {
        userId: userId || this.userId || 'unknown',
        totalDeposits: 1.5,
        totalWithdrawals: 0.5,
        currentBalance: 1.0,
        yieldEarned: 0.025,
        transactionCount: 12,
        lastActive: new Date(),
        registrationDate: new Date('2024-01-01'),
        acquisitionSource: 'organic',
      };
    } catch (error) {
      console.error('Failed to get user metrics:', error);
      return null;
    }
  }

  /**
   * Get system metrics
   */
  public async getSystemMetrics(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<SystemMetrics[]> {
    try {
      // Generate mock data based on time range
      const now = new Date();
      const intervals = this.getTimeIntervals(timeRange);

      return intervals.map((timestamp, index) => ({
        timestamp,
        activeUsers: Math.floor(100 + Math.random() * 50),
        totalVolume: 10 + Math.random() * 5,
        totalYieldGenerated: 0.1 + Math.random() * 0.05,
        averageTransactionSize: 0.1 + Math.random() * 0.05,
        gasOptimizationSavings: Math.random() * 0.01,
        errorRate: Math.random() * 0.02,
        responseTime: 100 + Math.random() * 200,
        uptime: 99.5 + Math.random() * 0.5,
      }));
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      return [];
    }
  }

  /**
   * Get performance metrics
   */
  public async getPerformanceMetrics(timeRange: 'hour' | 'day' = 'hour'): Promise<PerformanceMetrics[]> {
    try {
      const now = new Date();
      const intervals = this.getTimeIntervals(timeRange);

      return intervals.map((timestamp, index) => ({
        timestamp,
        pageLoadTime: 500 + Math.random() * 1000,
        apiResponseTime: 50 + Math.random() * 200,
        transactionConfirmationTime: 30000 + Math.random() * 60000,
        blockchainSyncTime: 5000 + Math.random() * 10000,
        memoryUsage: 50 + Math.random() * 30,
        cpuUsage: 20 + Math.random() * 40,
      }));
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return [];
    }
  }

  /**
   * Get time intervals for metrics
   */
  private getTimeIntervals(timeRange: 'hour' | 'day' | 'week' | 'month'): Date[] {
    const now = new Date();
    const intervals: Date[] = [];

    let points: number;
    let intervalMs: number;

    switch (timeRange) {
      case 'hour':
        points = 60; // One point per minute
        intervalMs = 60 * 1000;
        break;
      case 'day':
        points = 24; // One point per hour
        intervalMs = 60 * 60 * 1000;
        break;
      case 'week':
        points = 7; // One point per day
        intervalMs = 24 * 60 * 60 * 1000;
        break;
      case 'month':
        points = 30; // One point per day
        intervalMs = 24 * 60 * 60 * 1000;
        break;
      default:
        points = 24;
        intervalMs = 60 * 60 * 1000;
    }

    for (let i = points - 1; i >= 0; i--) {
      intervals.push(new Date(now.getTime() - i * intervalMs));
    }

    return intervals;
  }

  /**
   * Create funnel analysis
   */
  public async createFunnelAnalysis(steps: string[]): Promise<Array<{
    step: string;
    users: number;
    conversionRate: number;
  }>> {
    try {
      // Mock funnel data
      const baseUsers = 1000;
      return steps.map((step, index) => {
        const dropoffRate = 0.1 + Math.random() * 0.3;
        const users = index === 0 ? baseUsers : Math.floor(baseUsers * Math.pow(1 - dropoffRate, index));
        const conversionRate = (users / baseUsers) * 100;

        return {
          step,
          users,
          conversionRate,
        };
      });
    } catch (error) {
      console.error('Failed to create funnel analysis:', error);
      return [];
    }
  }

  /**
   * Export analytics data
   */
  public async exportData(
    dataType: 'events' | 'users' | 'system' | 'performance',
    format: 'json' | 'csv' = 'json'
  ): Promise<Blob> {
    try {
      let data: any;

      switch (dataType) {
        case 'events':
          data = JSON.parse(localStorage.getItem('analytics_events') || '[]');
          break;
        case 'users':
          data = await this.getUserMetrics();
          break;
        case 'system':
          data = await this.getSystemMetrics();
          break;
        case 'performance':
          data = await this.getPerformanceMetrics();
          break;
        default:
          throw new Error('Unknown data type');
      }

      if (format === 'csv') {
        const csv = this.convertToCSV(data);
        return new Blob([csv], { type: 'text/csv' });
      } else {
        const json = JSON.stringify(data, null, 2);
        return new Blob([json], { type: 'application/json' });
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Cleanup service
   */
  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Flush remaining events
    this.flushEvents();
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();