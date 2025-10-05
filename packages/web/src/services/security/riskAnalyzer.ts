/**
 * Risk Analyzer
 * Analyzes and quantifies various risk factors in the vault system
 */

export interface RiskFactor {
  id: string;
  name: string;
  category: 'market' | 'credit' | 'liquidity' | 'operational' | 'smart_contract';
  weight: number; // 0-1, importance in overall risk calculation
  currentValue: number; // 0-1, current risk level
  threshold: number; // 0-1, level at which risk becomes concerning
  trend: 'improving' | 'stable' | 'deteriorating';
  lastUpdated: Date;
}

export interface RiskAssessment {
  overallRiskScore: number; // 0-1
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  factors: RiskFactor[];
  recommendations: RiskRecommendation[];
  lastAssessment: Date;
}

export interface RiskRecommendation {
  id: string;
  type: 'mitigation' | 'monitoring' | 'diversification' | 'rebalancing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  expectedImpact: number; // 0-1, expected reduction in risk
  implementationCost: 'low' | 'medium' | 'high';
  estimatedTimeframe: string;
}

export interface VaRCalculation {
  timeHorizon: number; // days
  confidenceLevel: number; // percentage
  portfolioValue: number; // BTC
  varAmount: number; // BTC
  expectedShortfall: number; // BTC
  methodology: 'historical' | 'parametric' | 'monte_carlo';
}

class RiskAnalyzer {
  private riskFactors: RiskFactor[] = [];
  private historicalData: Array<{ date: Date; value: number; volatility: number }> = [];

  constructor() {
    this.initializeRiskFactors();
    this.loadHistoricalData();
  }

  /**
   * Initialize default risk factors
   */
  private initializeRiskFactors(): void {
    this.riskFactors = [
      {
        id: 'btc_volatility',
        name: 'Bitcoin Price Volatility',
        category: 'market',
        weight: 0.25,
        currentValue: 0.3,
        threshold: 0.5,
        trend: 'stable',
        lastUpdated: new Date(),
      },
      {
        id: 'protocol_risk',
        name: 'Smart Contract Risk',
        category: 'smart_contract',
        weight: 0.2,
        currentValue: 0.15,
        threshold: 0.3,
        trend: 'improving',
        lastUpdated: new Date(),
      },
      {
        id: 'liquidation_risk',
        name: 'Liquidation Risk',
        category: 'credit',
        weight: 0.2,
        currentValue: 0.25,
        threshold: 0.4,
        trend: 'stable',
        lastUpdated: new Date(),
      },
      {
        id: 'counterparty_risk',
        name: 'Counterparty Risk',
        category: 'credit',
        weight: 0.15,
        currentValue: 0.1,
        threshold: 0.25,
        trend: 'stable',
        lastUpdated: new Date(),
      },
      {
        id: 'liquidity_risk',
        name: 'Liquidity Risk',
        category: 'liquidity',
        weight: 0.1,
        currentValue: 0.2,
        threshold: 0.35,
        trend: 'deteriorating',
        lastUpdated: new Date(),
      },
      {
        id: 'operational_risk',
        name: 'Operational Risk',
        category: 'operational',
        weight: 0.1,
        currentValue: 0.05,
        threshold: 0.2,
        trend: 'improving',
        lastUpdated: new Date(),
      },
    ];
  }

  /**
   * Load historical market data
   */
  private loadHistoricalData(): void {
    // Generate mock historical data for the last 30 days
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const baseValue = 43000; // Base BTC price
      const volatility = 0.03; // 3% daily volatility
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const value = baseValue * (1 + randomChange * Math.sqrt(i / 30)); // Increasing volatility over time

      this.historicalData.push({
        date,
        value,
        volatility: Math.abs(randomChange),
      });
    }
  }

  /**
   * Perform comprehensive risk assessment
   */
  public async performRiskAssessment(): Promise<RiskAssessment> {
    // Update current risk factor values
    await this.updateRiskFactors();

    // Calculate overall risk score
    const overallRiskScore = this.calculateOverallRiskScore();

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overallRiskScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      overallRiskScore,
      riskLevel,
      factors: [...this.riskFactors],
      recommendations,
      lastAssessment: new Date(),
    };
  }

  /**
   * Update risk factor values based on current conditions
   */
  private async updateRiskFactors(): Promise<void> {
    // Update Bitcoin volatility
    const btcVolatility = this.calculateBitcoinVolatility();
    this.updateRiskFactor('btc_volatility', btcVolatility, 'stable');

    // Update liquidation risk (would come from vault positions)
    const liquidationRisk = this.calculateLiquidationRisk();
    this.updateRiskFactor('liquidation_risk', liquidationRisk, 'stable');

    // Update liquidity risk
    const liquidityRisk = this.calculateLiquidityRisk();
    this.updateRiskFactor('liquidity_risk', liquidityRisk, 'deteriorating');

    // Update other factors with simulated data
    this.updateRiskFactor('protocol_risk', 0.12 + Math.random() * 0.1, 'improving');
    this.updateRiskFactor('counterparty_risk', 0.08 + Math.random() * 0.05, 'stable');
    this.updateRiskFactor('operational_risk', 0.03 + Math.random() * 0.04, 'stable');
  }

  /**
   * Calculate Bitcoin price volatility
   */
  private calculateBitcoinVolatility(): number {
    if (this.historicalData.length < 7) return 0.3; // Default value

    const recentData = this.historicalData.slice(-7);
    const returns = [];

    for (let i = 1; i < recentData.length; i++) {
      const returnRate = (recentData[i].value - recentData[i - 1].value) / recentData[i - 1].value;
      returns.push(returnRate);
    }

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    // Normalize to 0-1 scale (assuming 5% daily volatility as max)
    return Math.min(1, volatility / 0.05);
  }

  /**
   * Calculate liquidation risk based on positions
   */
  private calculateLiquidationRisk(): number {
    // This would analyze actual vault positions
    // For demo purposes, return a calculated value based on market conditions
    const volatility = this.calculateBitcoinVolatility();
    const utilizationRate = 0.7; // Mock utilization rate

    // Higher risk with higher volatility and utilization
    return Math.min(1, (volatility * 0.6 + utilizationRate * 0.4));
  }

  /**
   * Calculate liquidity risk
   */
  private calculateLiquidityRisk(): number {
    // This would analyze market depth and available liquidity
    // For demo purposes, use time-based patterns
    const hour = new Date().getHours();

    // Higher risk during off-hours
    const timeMultiplier = (hour >= 20 || hour <= 4) ? 1.5 : 1.0;
    const baseRisk = 0.15;

    return Math.min(1, baseRisk * timeMultiplier + Math.random() * 0.1);
  }

  /**
   * Update a specific risk factor
   */
  private updateRiskFactor(id: string, currentValue: number, trend: 'improving' | 'stable' | 'deteriorating'): void {
    const factor = this.riskFactors.find(f => f.id === id);
    if (factor) {
      factor.currentValue = currentValue;
      factor.trend = trend;
      factor.lastUpdated = new Date();
    }
  }

  /**
   * Calculate overall risk score
   */
  private calculateOverallRiskScore(): number {
    let weightedSum = 0;
    let totalWeight = 0;

    this.riskFactors.forEach(factor => {
      weightedSum += factor.currentValue * factor.weight;
      totalWeight += factor.weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
    if (score < 0.1) return 'very_low';
    if (score < 0.3) return 'low';
    if (score < 0.5) return 'medium';
    if (score < 0.7) return 'high';
    return 'very_high';
  }

  /**
   * Generate risk mitigation recommendations
   */
  private generateRecommendations(): RiskRecommendation[] {
    const recommendations: RiskRecommendation[] = [];

    this.riskFactors.forEach(factor => {
      if (factor.currentValue > factor.threshold) {
        const recommendation = this.createRecommendationForFactor(factor);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    });

    // Sort by priority and impact
    recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || (b.expectedImpact - a.expectedImpact);
    });

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Create recommendation for a specific risk factor
   */
  private createRecommendationForFactor(factor: RiskFactor): RiskRecommendation | null {
    const baseRecommendation = {
      id: `rec_${factor.id}_${Date.now()}`,
      expectedImpact: Math.min(0.3, factor.currentValue * 0.5),
      lastUpdated: new Date(),
    };

    switch (factor.id) {
      case 'btc_volatility':
        return {
          ...baseRecommendation,
          type: 'diversification',
          priority: factor.currentValue > 0.7 ? 'urgent' : 'high',
          title: 'Reduce Bitcoin Volatility Exposure',
          description: 'Consider increasing allocation to stablecoin strategies or reducing leverage',
          implementationCost: 'low',
          estimatedTimeframe: '1-2 days',
        };

      case 'liquidation_risk':
        return {
          ...baseRecommendation,
          type: 'rebalancing',
          priority: factor.currentValue > 0.6 ? 'urgent' : 'high',
          title: 'Reduce Liquidation Risk',
          description: 'Add more collateral or reduce borrowed positions to improve health factors',
          implementationCost: 'medium',
          estimatedTimeframe: '1-3 days',
        };

      case 'liquidity_risk':
        return {
          ...baseRecommendation,
          type: 'diversification',
          priority: 'medium',
          title: 'Improve Liquidity Diversification',
          description: 'Allocate funds across multiple protocols to reduce concentration risk',
          implementationCost: 'low',
          estimatedTimeframe: '2-5 days',
        };

      case 'protocol_risk':
        return {
          ...baseRecommendation,
          type: 'diversification',
          priority: 'medium',
          title: 'Protocol Risk Mitigation',
          description: 'Consider diversifying across multiple DeFi protocols to reduce smart contract risk',
          implementationCost: 'low',
          estimatedTimeframe: '3-7 days',
        };

      default:
        return {
          ...baseRecommendation,
          type: 'monitoring',
          priority: 'medium',
          title: `Monitor ${factor.name}`,
          description: `Increased monitoring recommended for ${factor.name}`,
          implementationCost: 'low',
          estimatedTimeframe: 'Immediate',
        };
    }
  }

  /**
   * Calculate Value at Risk (VaR)
   */
  public calculateVaR(
    portfolioValue: number,
    timeHorizon: number = 1,
    confidenceLevel: number = 95
  ): VaRCalculation {
    const returns = this.calculateHistoricalReturns();
    const sortedReturns = returns.sort((a, b) => a - b);

    // Calculate VaR using historical simulation
    const varIndex = Math.floor((1 - confidenceLevel / 100) * sortedReturns.length);
    const varReturn = sortedReturns[varIndex] || 0;
    const varAmount = Math.abs(portfolioValue * varReturn);

    // Calculate Expected Shortfall (ES)
    const tailReturns = sortedReturns.slice(0, varIndex);
    const expectedShortfall = tailReturns.length > 0
      ? tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length
      : varReturn;

    const expectedShortfallAmount = Math.abs(portfolioValue * expectedShortfall);

    return {
      timeHorizon,
      confidenceLevel,
      portfolioValue,
      varAmount,
      expectedShortfall: expectedShortfallAmount,
      methodology: 'historical',
    };
  }

  /**
   * Calculate historical returns from price data
   */
  private calculateHistoricalReturns(): number[] {
    const returns: number[] = [];

    for (let i = 1; i < this.historicalData.length; i++) {
      const returnRate = (this.historicalData[i].value - this.historicalData[i - 1].value) / this.historicalData[i - 1].value;
      returns.push(returnRate);
    }

    return returns;
  }

  /**
   * Stress test portfolio under various scenarios
   */
  public performStressTest(
    portfolioValue: number,
    scenarios: Array<{ name: string; shock: number; probability: number }>
  ): Array<{ scenario: string; impact: number; probability: number; loss: number }> {
    const results = [];

    for (const scenario of scenarios) {
      const impact = Math.abs(scenario.shock);
      const loss = portfolioValue * impact;

      results.push({
        scenario: scenario.name,
        impact,
        probability: scenario.probability,
        loss,
      });
    }

    return results.sort((a, b) => b.loss - a.loss);
  }

  /**
   * Get correlation matrix for risk factors
   */
  public getCorrelationMatrix(): number[][] {
    // Simplified correlation matrix for demo purposes
    return [
      [1.0, 0.3, 0.6, 0.2, 0.4, 0.1], // btc_volatility
      [0.3, 1.0, 0.2, 0.1, 0.3, 0.2], // protocol_risk
      [0.6, 0.2, 1.0, 0.5, 0.7, 0.3], // liquidation_risk
      [0.2, 0.1, 0.5, 1.0, 0.4, 0.2], // counterparty_risk
      [0.4, 0.3, 0.7, 0.4, 1.0, 0.5], // liquidity_risk
      [0.1, 0.2, 0.3, 0.2, 0.5, 1.0], // operational_risk
    ];
  }

  /**
   * Update risk factor weights based on new information
   */
  public updateRiskFactorWeights(updates: Array<{ id: string; weight: number }>): void {
    updates.forEach(update => {
      const factor = this.riskFactors.find(f => f.id === update.id);
      if (factor) {
        factor.weight = Math.max(0, Math.min(1, update.weight));
      }
    });
  }

  /**
   * Get current risk factors
   */
  public getRiskFactors(): RiskFactor[] {
    return [...this.riskFactors];
  }

  /**
   * Add custom risk factor
   */
  public addRiskFactor(factor: Omit<RiskFactor, 'id' | 'lastUpdated'>): void {
    const newFactor: RiskFactor = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date(),
      ...factor,
    };

    this.riskFactors.push(newFactor);
  }
}

// Create singleton instance
export const riskAnalyzer = new RiskAnalyzer();