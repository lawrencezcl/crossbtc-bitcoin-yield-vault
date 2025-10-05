/**
 * Health Monitor Service
 * Monitors system health, performance, and availability
 */

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  errorMessage?: string;
  details?: Record<string, any>;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  score: number; // 0-100
  checks: HealthCheck[];
  uptime: number; // percentage
  lastUpdate: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  threshold: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  cooldownPeriod: number; // seconds
}

export interface HealthAlert {
  id: string;
  ruleId: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

class HealthMonitor {
  private checks: Map<string, () => Promise<HealthCheck>> = new Map();
  private alertRules: AlertRule[] = [];
  private activeAlerts: Map<string, HealthAlert> = new Map();
  private alertCooldowns: Map<string, Date> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private startTime: Date = new Date();

  constructor() {
    this.initializeHealthChecks();
    this.initializeAlertRules();
    this.startMonitoring();
  }

  /**
   * Initialize default health checks
   */
  private initializeHealthChecks(): void {
    // API health check
    this.addHealthCheck('api', async () => {
      const start = Date.now();
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });

        const responseTime = Date.now() - start;

        if (response.ok) {
          const data = await response.json();
          return {
            name: 'API',
            status: 'healthy',
            lastCheck: new Date(),
            responseTime,
            details: data,
          };
        } else {
          return {
            name: 'API',
            status: 'unhealthy',
            lastCheck: new Date(),
            responseTime,
            errorMessage: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
      } catch (error) {
        return {
          name: 'API',
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: Date.now() - start,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    // Blockchain connectivity check
    this.addHealthCheck('blockchain', async () => {
      const start = Date.now();
      try {
        // Simulate blockchain RPC call
        await this.simulateBlockchainCall();
        const responseTime = Date.now() - start;

        return {
          name: 'Blockchain',
          status: 'healthy',
          lastCheck: new Date(),
          responseTime,
          details: { network: 'mainnet', blockHeight: 825000 },
        };
      } catch (error) {
        return {
          name: 'Blockchain',
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: Date.now() - start,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    // Database connectivity check
    this.addHealthCheck('database', async () => {
      const start = Date.now();
      try {
        // Simulate database connectivity check
        await this.simulateDatabaseCall();
        const responseTime = Date.now() - start;

        return {
          name: 'Database',
          status: 'healthy',
          lastCheck: new Date(),
          responseTime,
          details: { connections: 5, queryTime: 25 },
        };
      } catch (error) {
        return {
          name: 'Database',
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: Date.now() - start,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    // External services check (Troves, Vesu)
    this.addHealthCheck('external_services', async () => {
      const start = Date.now();
      try {
        // Simulate external service checks
        const results = await Promise.allSettled([
          this.simulateServiceCall('troves'),
          this.simulateServiceCall('vesu'),
        ]);

        const failed = results.filter(r => r.status === 'rejected').length;
        const responseTime = Date.now() - start;

        let status: 'healthy' | 'degraded' | 'unhealthy';
        if (failed === 0) status = 'healthy';
        else if (failed === 1) status = 'degraded';
        else status = 'unhealthy';

        return {
          name: 'External Services',
          status,
          lastCheck: new Date(),
          responseTime,
          details: {
            troves: results[0].status === 'fulfilled',
            vesu: results[1].status === 'fulfilled',
            failed,
          },
        };
      } catch (error) {
        return {
          name: 'External Services',
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: Date.now() - start,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    // System resources check
    this.addHealthCheck('system_resources', async () => {
      const start = Date.now();
      try {
        // Simulate system resource monitoring
        const resources = await this.getSystemResources();
        const responseTime = Date.now() - start;

        let status: 'healthy' | 'degraded' | 'unhealthy';
        if (resources.cpu < 80 && resources.memory < 80) status = 'healthy';
        else if (resources.cpu < 95 && resources.memory < 95) status = 'degraded';
        else status = 'unhealthy';

        return {
          name: 'System Resources',
          status,
          lastCheck: new Date(),
          responseTime,
          details: resources,
        };
      } catch (error) {
        return {
          name: 'System Resources',
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: Date.now() - start,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });
  }

  /**
   * Initialize default alert rules
   */
  private initializeAlertRules(): void {
    this.alertRules = [
      {
        id: 'api_response_time',
        name: 'API Response Time',
        metric: 'api_response_time',
        operator: '>',
        threshold: 1000, // 1 second
        severity: 'warning',
        enabled: true,
        cooldownPeriod: 300, // 5 minutes
      },
      {
        id: 'error_rate',
        name: 'Error Rate',
        metric: 'error_rate',
        operator: '>',
        threshold: 5, // 5%
        severity: 'error',
        enabled: true,
        cooldownPeriod: 600, // 10 minutes
      },
      {
        id: 'memory_usage',
        name: 'Memory Usage',
        metric: 'memory_usage',
        operator: '>',
        threshold: 90, // 90%
        severity: 'critical',
        enabled: true,
        cooldownPeriod: 300, // 5 minutes
      },
      {
        id: 'uptime',
        name: 'System Uptime',
        metric: 'uptime',
        operator: '<',
        threshold: 99, // 99%
        severity: 'warning',
        enabled: true,
        cooldownPeriod: 1800, // 30 minutes
      },
    ];
  }

  /**
   * Start continuous monitoring
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 30000); // Check every 30 seconds

    // Initial health check
    this.performHealthChecks();
  }

  /**
   * Perform all health checks
   */
  private async performHealthChecks(): Promise<void> {
    const checkPromises = Array.from(this.checks.entries()).map(async ([name, checkFn]) => {
      try {
        return await checkFn();
      } catch (error) {
        return {
          name,
          status: 'unhealthy' as const,
          lastCheck: new Date(),
          responseTime: 0,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.allSettled(checkPromises);
    const checks: HealthCheck[] = results.map(result =>
      result.status === 'fulfilled' ? result.value : result.reason
    );

    // Evaluate alert rules
    this.evaluateAlertRules(checks);

    // Update system health
    this.updateSystemHealth(checks);
  }

  /**
   * Evaluate alert rules against health check results
   */
  private evaluateAlertRules(checks: HealthCheck[]): void {
    this.alertRules.forEach(rule => {
      if (!rule.enabled) return;

      // Check cooldown period
      const cooldownEnd = this.alertCooldowns.get(rule.id);
      if (cooldownEnd && cooldownEnd > new Date()) {
        return;
      }

      const value = this.getMetricValue(rule.metric, checks);
      if (value === null) return;

      const triggered = this.evaluateCondition(value, rule.operator, rule.threshold);

      if (triggered && !this.activeAlerts.has(rule.id)) {
        this.createAlert(rule, value);
      } else if (!triggered && this.activeAlerts.has(rule.id)) {
        this.resolveAlert(rule.id);
      }
    });
  }

  /**
   * Get metric value from health checks
   */
  private getMetricValue(metric: string, checks: HealthCheck[]): number | null {
    switch (metric) {
      case 'api_response_time':
        const apiCheck = checks.find(c => c.name === 'API');
        return apiCheck ? apiCheck.responseTime : null;

      case 'error_rate':
        const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
        return checks.length > 0 ? (unhealthyCount / checks.length) * 100 : null;

      case 'memory_usage':
        const systemCheck = checks.find(c => c.name === 'System Resources');
        return systemCheck?.details?.memoryUsage || null;

      case 'uptime':
        // Calculate uptime based on service start time
        const now = new Date();
        const uptimeMs = now.getTime() - this.startTime.getTime();
        const expectedUptimeMs = uptimeMs + (24 * 60 * 60 * 1000); // Assume 24h period
        return (uptimeMs / expectedUptimeMs) * 100;

      default:
        return null;
    }
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '=': return value === threshold;
      default: return false;
    }
  }

  /**
   * Create health alert
   */
  private createAlert(rule: AlertRule, value: number): void {
    const alert: HealthAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      message: `${rule.name}: ${value} ${rule.operator} ${rule.threshold}`,
      severity: rule.severity,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.activeAlerts.set(rule.id, alert);

    // Set cooldown
    const cooldownEnd = new Date(Date.now() + rule.cooldownPeriod * 1000);
    this.alertCooldowns.set(rule.id, cooldownEnd);

    // Log alert
    console.warn('Health alert created:', alert);

    // In a real implementation, this would send notifications
    this.sendNotification(alert);
  }

  /**
   * Resolve alert
   */
  private resolveAlert(ruleId: string): void {
    const alert = this.activeAlerts.get(ruleId);
    if (alert) {
      alert.resolvedAt = new Date();
      console.log('Health alert resolved:', alert);
      this.activeAlerts.delete(ruleId);
    }
  }

  /**
   * Send notification for alert
   */
  private sendNotification(alert: HealthAlert): void {
    // In a real implementation, this would send to various channels
    // For demo purposes, we'll just log it
    console.log(`ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
  }

  /**
   * Update system health status
   */
  private updateSystemHealth(checks: HealthCheck[]): void {
    // Calculate overall health score
    const statusScores = {
      healthy: 100,
      degraded: 50,
      unhealthy: 0,
    };

    const totalScore = checks.reduce((sum, check) => sum + statusScores[check.status], 0);
    const averageScore = checks.length > 0 ? totalScore / checks.length : 0;

    // Determine overall status
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (averageScore >= 80) overall = 'healthy';
    else if (averageScore >= 50) overall = 'degraded';
    else overall = 'unhealthy';

    const systemHealth: SystemHealth = {
      overall,
      score: averageScore,
      checks,
      uptime: this.getMetricValue('uptime', checks) || 100,
      lastUpdate: new Date(),
    };

    // Store for access via API
    localStorage.setItem('system_health', JSON.stringify(systemHealth));
  }

  /**
   * Add custom health check
   */
  public addHealthCheck(name: string, checkFn: () => Promise<HealthCheck>): void {
    this.checks.set(name, checkFn);
  }

  /**
   * Remove health check
   */
  public removeHealthCheck(name: string): void {
    this.checks.delete(name);
  }

  /**
   * Get current system health
   */
  public getSystemHealth(): SystemHealth | null {
    try {
      const stored = localStorage.getItem('system_health');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): HealthAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string): void {
    const alert = Array.from(this.activeAlerts.values()).find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Add custom alert rule
   */
  public addAlertRule(rule: Omit<AlertRule, 'id'>): void {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    this.alertRules.push(newRule);
  }

  /**
   * Update alert rule
   */
  public updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
    }
  }

  /**
   * Get all alert rules
   */
  public getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  /**
   * Simulate helper functions (for demo)
   */
  private async simulateBlockchainCall(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    if (Math.random() < 0.05) throw new Error('Blockchain connection failed');
  }

  private async simulateDatabaseCall(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    if (Math.random() < 0.02) throw new Error('Database connection failed');
  }

  private async simulateServiceCall(service: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    if (Math.random() < 0.1) throw new Error(`${service} service unavailable`);
  }

  private async getSystemResources(): Promise<{ cpu: number; memory: number; disk: number }> {
    // Simulate system resource monitoring
    return {
      cpu: 30 + Math.random() * 40,
      memory: 40 + Math.random() * 30,
      disk: 60 + Math.random() * 20,
    };
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Destroy monitor
   */
  public destroy(): void {
    this.stopMonitoring();
    this.checks.clear();
    this.alertRules = [];
    this.activeAlerts.clear();
    this.alertCooldowns.clear();
  }
}

// Create singleton instance
export const healthMonitor = new HealthMonitor();