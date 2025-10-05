/**
 * Security Manager
 * Handles security measures, risk assessment, and protection mechanisms
 */

export interface SecurityRisk {
  id: string;
  type: 'smart_contract' | 'market' | 'liquidation' | 'counterparty' | 'operational';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  mitigation: string;
  detectedAt: Date;
  resolvedAt?: Date;
}

export interface SecurityMetrics {
  overallScore: number; // 0-100, higher is more secure
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  smartContractRisk: number;
  marketRisk: number;
  liquidationRisk: number;
  counterpartyRisk: number;
  operationalRisk: number;
  lastAssessment: Date;
}

export interface SecurityAlert {
  id: string;
  type: 'unusual_activity' | 'price_volatility' | 'liquidation_risk' | 'security_breach';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  data?: any;
  createdAt: Date;
  acknowledged: boolean;
}

export interface SecurityConfig {
  maxDailyWithdrawal: number; // BTC
  maxSingleTransaction: number; // BTC
  requireMultiSig: boolean;
  autoPauseOnRisk: boolean;
  monitoringEnabled: boolean;
  alertsEnabled: boolean;
}

class SecurityManager {
  private risks: SecurityRisk[] = [];
  private alerts: SecurityAlert[] = [];
  private config: SecurityConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      maxDailyWithdrawal: 1.0, // 1 BTC per day
      maxSingleTransaction: 0.5, // 0.5 BTC per transaction
      requireMultiSig: true,
      autoPauseOnRisk: true,
      monitoringEnabled: true,
      alertsEnabled: true,
    };

    this.initializeSecurity();
  }

  /**
   * Initialize security systems
   */
  private async initializeSecurity(): Promise<void> {
    // Load stored risks and alerts
    await this.loadStoredData();

    // Start monitoring if enabled
    if (this.config.monitoringEnabled) {
      this.startMonitoring();
    }

    // Run initial security assessment
    await this.runSecurityAssessment();
  }

  /**
   * Load stored security data
   */
  private async loadStoredData(): Promise<void> {
    try {
      // In a real implementation, this would load from secure storage
      const storedRisks = localStorage.getItem('security_risks');
      const storedAlerts = localStorage.getItem('security_alerts');

      if (storedRisks) {
        this.risks = JSON.parse(storedRisks);
      }

      if (storedAlerts) {
        this.alerts = JSON.parse(storedAlerts);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  }

  /**
   * Start continuous security monitoring
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.performSecurityChecks();
    }, 60000); // Check every minute
  }

  /**
   * Perform comprehensive security checks
   */
  private async performSecurityChecks(): Promise<void> {
    try {
      // Check for unusual activity
      await this.checkUnusualActivity();

      // Check market volatility
      await this.checkMarketVolatility();

      // Check liquidation risks
      await this.checkLiquidationRisks();

      // Check smart contract risks
      await this.checkSmartContractRisks();

      // Update security metrics
      await this.updateSecurityMetrics();
    } catch (error) {
      console.error('Security check failed:', error);
      this.createAlert({
        type: 'operational',
        severity: 'warning',
        title: 'Security Check Failed',
        message: `Unable to complete security monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Check for unusual activity patterns
   */
  private async checkUnusualActivity(): Promise<void> {
    // This would analyze transaction patterns, login locations, etc.
    // For demo purposes, we'll simulate detection

    const hasUnusualActivity = Math.random() < 0.05; // 5% chance

    if (hasUnusualActivity) {
      this.createAlert({
        type: 'unusual_activity',
        severity: 'warning',
        title: 'Unusual Activity Detected',
        message: 'Unusual transaction pattern detected. Please review recent activity.',
      });
    }
  }

  /**
   * Check market volatility
   */
  private async checkMarketVolatility(): Promise<void> {
    try {
      // In a real implementation, this would fetch market data
      const mockPriceChange = (Math.random() - 0.5) * 10; // -5% to +5%

      if (Math.abs(mockPriceChange) > 5) {
        this.createAlert({
          type: 'price_volatility',
          severity: Math.abs(mockPriceChange) > 8 ? 'error' : 'warning',
          title: 'High Market Volatility',
          message: `Bitcoin price changed by ${mockPriceChange.toFixed(2)}%. Consider adjusting positions.`,
          data: { priceChange: mockPriceChange },
        });
      }
    } catch (error) {
      console.error('Market volatility check failed:', error);
    }
  }

  /**
   * Check liquidation risks
   */
  private async checkLiquidationRisks(): Promise<void> {
    // This would check positions in Troves and Vesu
    // For demo purposes, we'll simulate risk detection

    const hasLiquidationRisk = Math.random() < 0.1; // 10% chance

    if (hasLiquidationRisk) {
      this.createAlert({
        type: 'liquidation_risk',
        severity: 'error',
        title: 'Liquidation Risk Detected',
        message: 'One or more positions are at risk of liquidation. Consider adding collateral.',
      });
    }
  }

  /**
   * Check smart contract risks
   */
  private async checkSmartContractRisks(): Promise<void> {
    // This would check contract security, audit status, etc.
    // For demo purposes, we'll use mock data

    const contractRisks = [
      {
        contract: 'Troves Protocol',
        risk: 0.15,
        lastAudit: new Date('2024-01-01'),
        issuesFound: 0,
      },
      {
        contract: 'Vesu Protocol',
        risk: 0.08,
        lastAudit: new Date('2024-01-15'),
        issuesFound: 0,
      },
    ];

    contractRisks.forEach(risk => {
      if (risk.risk > 0.1) {
        this.createRisk({
          type: 'smart_contract',
          severity: 'medium',
          title: `${risk.contract} Risk Assessment`,
          description: `Contract has a risk score of ${(risk.risk * 100).toFixed(1)}%`,
          mitigation: 'Regular monitoring and audits recommended',
        });
      }
    });
  }

  /**
   * Run comprehensive security assessment
   */
  public async runSecurityAssessment(): Promise<SecurityMetrics> {
    const risks = await this.assessAllRisks();

    const metrics: SecurityMetrics = {
      overallScore: this.calculateOverallScore(risks),
      riskLevel: this.calculateRiskLevel(risks),
      smartContractRisk: risks.smartContract,
      marketRisk: risks.market,
      liquidationRisk: risks.liquidation,
      counterpartyRisk: risks.counterparty,
      operationalRisk: risks.operational,
      lastAssessment: new Date(),
    };

    // Store assessment results
    localStorage.setItem('security_metrics', JSON.stringify(metrics));

    return metrics;
  }

  /**
   * Assess all risk categories
   */
  private async assessAllRisks(): Promise<{
    smartContract: number;
    market: number;
    liquidation: number;
    counterparty: number;
    operational: number;
  }> {
    // In a real implementation, these would be calculated based on actual data
    return {
      smartContract: 15, // 15% risk
      market: 25, // 25% risk
      liquidation: 30, // 30% risk
      counterparty: 10, // 10% risk
      operational: 5, // 5% risk
    };
  }

  /**
   * Calculate overall security score
   */
  private calculateOverallScore(risks: any): number {
    const totalRisk = risks.smartContract + risks.market + risks.liquidation +
                     risks.counterparty + risks.operational;
    return Math.max(0, Math.min(100, 100 - totalRisk));
  }

  /**
   * Determine risk level
   */
  private calculateRiskLevel(risks: any): 'low' | 'medium' | 'high' | 'critical' {
    const maxRisk = Math.max(risks.smartContract, risks.market, risks.liquidation,
                           risks.counterparty, risks.operational);

    if (maxRisk >= 40) return 'critical';
    if (maxRisk >= 25) return 'high';
    if (maxRisk >= 15) return 'medium';
    return 'low';
  }

  /**
   * Create security risk
   */
  private createRisk(risk: Omit<SecurityRisk, 'id' | 'detectedAt'>): void {
    const newRisk: SecurityRisk = {
      id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      detectedAt: new Date(),
      ...risk,
    };

    this.risks.push(newRisk);
    this.saveRisks();

    // Create corresponding alert for high severity risks
    if (risk.severity === 'high' || risk.severity === 'critical') {
      this.createAlert({
        type: 'security_breach',
        severity: risk.severity === 'critical' ? 'critical' : 'error',
        title: `Security Risk: ${risk.title}`,
        message: risk.description,
      });
    }
  }

  /**
   * Create security alert
   */
  private createAlert(alert: Omit<SecurityAlert, 'id' | 'createdAt' | 'acknowledged'>): void {
    const newAlert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      acknowledged: false,
      ...alert,
    };

    this.alerts.push(newAlert);
    this.saveAlerts();

    // Auto-pause operations for critical alerts if configured
    if (alert.severity === 'critical' && this.config.autoPauseOnRisk) {
      this.emergencyPause();
    }
  }

  /**
   * Emergency pause operations
   */
  private emergencyPause(): void {
    console.warn('EMERGENCY PAUSE ACTIVATED - Security risk detected');

    // In a real implementation, this would:
    // 1. Pause all outgoing transactions
    // 2. Notify administrators
    // 3. Enable additional authentication
    // 4. Log the event for audit

    localStorage.setItem('emergency_pause', JSON.stringify({
      activated: true,
      timestamp: new Date(),
      reason: 'Critical security risk detected',
    }));
  }

  /**
   * Validate transaction before execution
   */
  public validateTransaction(
    amount: number,
    type: 'deposit' | 'withdraw' | 'borrow' | 'repay'
  ): { valid: boolean; reason?: string } {
    // Check single transaction limit
    if (amount > this.config.maxSingleTransaction) {
      return {
        valid: false,
        reason: `Transaction amount exceeds maximum limit of ${this.config.maxSingleTransaction} BTC`,
      };
    }

    // Check daily withdrawal limit for withdrawals
    if (type === 'withdraw') {
      const todayWithdrawn = this.getTodayWithdrawnAmount();
      if (todayWithdrawn + amount > this.config.maxDailyWithdrawal) {
        return {
          valid: false,
          reason: `Daily withdrawal limit would be exceeded. Remaining: ${(this.config.maxDailyWithdrawal - todayWithdrawn).toFixed(8)} BTC`,
        };
      }
    }

    // Check if emergency pause is active
    const emergencyPause = localStorage.getItem('emergency_pause');
    if (emergencyPause) {
      const pauseData = JSON.parse(emergencyPause);
      if (pauseData.activated) {
        return {
          valid: false,
          reason: 'Emergency pause is active. Please contact support.',
        };
      }
    }

    return { valid: true };
  }

  /**
   * Get today's withdrawn amount
   */
  private getTodayWithdrawnAmount(): number {
    // In a real implementation, this would query transaction history
    // For demo purposes, return a mock value
    return Math.random() * 0.5;
  }

  /**
   * Acknowledge alert
   */
  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.saveAlerts();
    }
  }

  /**
   * Resolve risk
   */
  public resolveRisk(riskId: string): void {
    const risk = this.risks.find(r => r.id === riskId);
    if (risk) {
      risk.resolvedAt = new Date();
      this.saveRisks();
    }
  }

  /**
   * Update security configuration
   */
  public updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('security_config', JSON.stringify(this.config));

    // Restart monitoring if settings changed
    if (newConfig.monitoringEnabled !== undefined) {
      if (newConfig.monitoringEnabled) {
        this.startMonitoring();
      } else if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }
    }
  }

  /**
   * Get current security metrics
   */
  public getMetrics(): SecurityMetrics | null {
    try {
      const stored = localStorage.getItem('security_metrics');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get active risks
   */
  public getActiveRisks(): SecurityRisk[] {
    return this.risks.filter(risk => !risk.resolvedAt);
  }

  /**
   * Get unacknowledged alerts
   */
  public getUnacknowledgedAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  /**
   * Get configuration
   */
  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Save risks to storage
   */
  private saveRisks(): void {
    try {
      localStorage.setItem('security_risks', JSON.stringify(this.risks));
    } catch (error) {
      console.error('Failed to save risks:', error);
    }
  }

  /**
   * Save alerts to storage
   */
  private saveAlerts(): void {
    try {
      localStorage.setItem('security_alerts', JSON.stringify(this.alerts));
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  }

  /**
   * Update security metrics
   */
  private async updateSecurityMetrics(): Promise<void> {
    await this.runSecurityAssessment();
  }

  /**
   * Cleanup on destroy
   */
  public destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// Create singleton instance
export const securityManager = new SecurityManager();