/**
 * Vesu Borrowing Strategy Integration
 * Implements optimized borrowing strategies through Vesu protocol
 */

export interface VesuPool {
  id: string;
  asset: string;
  totalLiquidity: number;
  totalBorrowed: number;
  supplyRate: number; // APR
  variableBorrowRate: number; // APR
  stableBorrowRate: number; // APR
  utilizationRate: number; // Percentage
  collateralFactor: number; // Percentage
  reserveFactor: number; // Percentage
  lastUpdateTimestamp: number;
}

export interface VesuPosition {
  id: string;
  userAddress: string;
  poolId: string;
  supplied: number;
  borrowed: number;
  borrowRateMode: 'variable' | 'stable';
  healthFactor: number; // Wei
  accruedRewards: number;
  createdAt: Date;
  lastInteraction: Date;
}

export interface VesuStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  expectedApy: number; // Percentage
  minCollateralRatio: number; // Percentage
  maxLeverage: number; // Multiplier
  recommendedPoolIds: string[];
  parameters: {
    targetUtilization: number; // Percentage
    rebalanceThreshold: number; // Percentage
    rewardCompoundFrequency: number; // Hours
  };
}

export interface VesuOperation {
  id: string;
  type: 'supply' | 'withdraw' | 'borrow' | 'repay' | 'switchRateMode' | 'claimRewards';
  asset: string;
  amount: number;
  userAddress: string;
  poolId: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  gasUsed?: number;
  txHash?: string;
  rewards?: number;
}

class VesuService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_VESU_API_URL || 'https://api.vesu.finance/v1';
    this.apiKey = process.env.NEXT_PUBLIC_VESU_API_KEY || 'demo_key';
  }

  /**
   * Get all available pools
   */
  public async getPools(): Promise<VesuPool[]> {
    try {
      const response = await this.makeRequest('/pools', 'GET');
      return response.pools.map((pool: any) => ({
        id: pool.id,
        asset: pool.asset,
        totalLiquidity: pool.totalLiquidity / 1e8, // Convert from satoshis for BTC
        totalBorrowed: pool.totalBorrowed / 1e8,
        supplyRate: pool.supplyRate / 1e18 * 100, // Convert from wei to percentage
        variableBorrowRate: pool.variableBorrowRate / 1e18 * 100,
        stableBorrowRate: pool.stableBorrowRate / 1e18 * 100,
        utilizationRate: (pool.totalBorrowed / pool.totalLiquidity) * 100,
        collateralFactor: pool.collateralFactor / 1e2, // Convert basis points
        reserveFactor: pool.reserveFactor / 1e2,
        lastUpdateTimestamp: pool.lastUpdateTimestamp,
      }));
    } catch (error) {
      console.error('Failed to get Vesu pools:', error);
      return this.getMockPools();
    }
  }

  /**
   * Get user positions across all pools
   */
  public async getUserPositions(userAddress: string): Promise<VesuPosition[]> {
    try {
      const response = await this.makeRequest(`/positions/${userAddress}`, 'GET');
      return response.positions.map((pos: any) => ({
        id: pos.id,
        userAddress: pos.userAddress,
        poolId: pos.poolId,
        supplied: pos.supplied / 1e8,
        borrowed: pos.borrowed / 1e8,
        borrowRateMode: pos.borrowRateMode,
        healthFactor: pos.healthFactor / 1e18,
        accruedRewards: pos.accruedRewards / 1e18,
        createdAt: new Date(pos.createdAt * 1000),
        lastInteraction: new Date(pos.lastInteraction * 1000),
      }));
    } catch (error) {
      console.error('Failed to get user positions:', error);
      return this.getMockUserPositions();
    }
  }

  /**
   * Get available strategies
   */
  public async getStrategies(): Promise<VesuStrategy[]> {
    try {
      const response = await this.makeRequest('/strategies', 'GET');
      return response.strategies;
    } catch (error) {
      console.error('Failed to get strategies:', error);
      return this.getMockStrategies();
    }
  }

  /**
   * Supply assets to pool
   */
  public async supply(
    userAddress: string,
    poolId: string,
    amount: number
  ): Promise<VesuOperation> {
    try {
      const response = await this.makeRequest('/operations/supply', 'POST', {
        userAddress,
        poolId,
        amount: Math.floor(amount * 1e8), // Convert to satoshis
      });

      return {
        id: response.operationId,
        type: 'supply',
        asset: 'BTC',
        amount,
        userAddress,
        poolId,
        status: 'pending',
        timestamp: new Date(),
        txHash: response.txHash,
      };
    } catch (error) {
      console.error('Failed to supply:', error);
      throw new Error(`Supply failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Withdraw from pool
   */
  public async withdraw(
    userAddress: string,
    poolId: string,
    amount: number
  ): Promise<VesuOperation> {
    try {
      const response = await this.makeRequest('/operations/withdraw', 'POST', {
        userAddress,
        poolId,
        amount: Math.floor(amount * 1e8),
      });

      return {
        id: response.operationId,
        type: 'withdraw',
        asset: 'BTC',
        amount,
        userAddress,
        poolId,
        status: 'pending',
        timestamp: new Date(),
        txHash: response.txHash,
      };
    } catch (error) {
      console.error('Failed to withdraw:', error);
      throw new Error(`Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Borrow from pool
   */
  public async borrow(
    userAddress: string,
    poolId: string,
    amount: number,
    rateMode: 'variable' | 'stable' = 'variable'
  ): Promise<VesuOperation> {
    try {
      const response = await this.makeRequest('/operations/borrow', 'POST', {
        userAddress,
        poolId,
        amount: Math.floor(amount * 1e8),
        rateMode,
      });

      return {
        id: response.operationId,
        type: 'borrow',
        asset: 'BTC',
        amount,
        userAddress,
        poolId,
        status: 'pending',
        timestamp: new Date(),
        txHash: response.txHash,
      };
    } catch (error) {
      console.error('Failed to borrow:', error);
      throw new Error(`Borrow failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Repay borrowed amount
   */
  public async repay(
    userAddress: string,
    poolId: string,
    amount: number
  ): Promise<VesuOperation> {
    try {
      const response = await this.makeRequest('/operations/repay', 'POST', {
        userAddress,
        poolId,
        amount: Math.floor(amount * 1e8),
      });

      return {
        id: response.operationId,
        type: 'repay',
        asset: 'BTC',
        amount,
        userAddress,
        poolId,
        status: 'pending',
        timestamp: new Date(),
        txHash: response.txHash,
      };
    } catch (error) {
      console.error('Failed to repay:', error);
      throw new Error(`Repayment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Claim accumulated rewards
   */
  public async claimRewards(userAddress: string): Promise<VesuOperation> {
    try {
      const response = await this.makeRequest('/operations/claim', 'POST', {
        userAddress,
      });

      return {
        id: response.operationId,
        type: 'claimRewards',
        asset: 'VESU', // Assuming VESU token
        amount: response.amount / 1e18,
        userAddress,
        poolId: 'all',
        status: 'pending',
        timestamp: new Date(),
        txHash: response.txHash,
        rewards: response.amount / 1e18,
      };
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      throw new Error(`Reward claim failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get operation history
   */
  public async getOperationHistory(userAddress: string): Promise<VesuOperation[]> {
    try {
      const response = await this.makeRequest(`/operations/${userAddress}`, 'GET');
      return response.operations.map((op: any) => ({
        id: op.id,
        type: op.type,
        asset: op.asset,
        amount: op.asset === 'BTC' ? op.amount / 1e8 : op.amount / 1e18,
        userAddress: op.userAddress,
        poolId: op.poolId,
        status: op.status,
        timestamp: new Date(op.timestamp * 1000),
        gasUsed: op.gasUsed,
        txHash: op.txHash,
        rewards: op.rewards ? op.rewards / 1e18 : undefined,
      }));
    } catch (error) {
      console.error('Failed to get operation history:', error);
      return this.getMockOperationHistory();
    }
  }

  /**
   * Optimize strategy based on current market conditions
   */
  public async optimizeStrategy(
    userAddress: string,
    strategyId: string
  ): Promise<{
    recommendations: Array<{
      type: string;
      amount: number;
      reason: string;
      expectedImprovement: number;
    }>;
    currentApy: number;
    projectedApy: number;
  }> {
    try {
      const response = await this.makeRequest('/optimize', 'POST', {
        userAddress,
        strategyId,
      });

      return {
        recommendations: response.recommendations.map((rec: any) => ({
          type: rec.type,
          amount: rec.amount / 1e8,
          reason: rec.reason,
          expectedImprovement: rec.expectedImprovement / 1e2, // Convert basis points
        })),
        currentApy: response.currentApy / 1e2,
        projectedApy: response.projectedApy / 1e2,
      };
    } catch (error) {
      console.error('Failed to optimize strategy:', error);
      return this.getMockOptimizationResult();
    }
  }

  /**
   * Calculate portfolio metrics
   */
  public calculatePortfolioMetrics(
    positions: VesuPosition[],
    pools: VesuPool[]
  ): {
    totalSupplied: number;
    totalBorrowed: number;
    netExposure: number;
    weightedApy: number;
    healthFactor: number;
    riskScore: number;
  } {
    const totalSupplied = positions.reduce((sum, pos) => sum + pos.supplied, 0);
    const totalBorrowed = positions.reduce((sum, pos) => sum + pos.borrowed, 0);
    const netExposure = totalSupplied - totalBorrowed;

    // Calculate weighted APY
    let weightedApy = 0;
    positions.forEach(pos => {
      const pool = pools.find(p => p.id === pos.poolId);
      if (pool && pos.supplied > 0) {
        weightedApy += (pos.supplied / totalSupplied) * pool.supplyRate;
      }
    });

    // Calculate overall health factor (minimum across positions)
    const healthFactor = Math.min(
      ...positions.map(pos => pos.healthFactor),
      Infinity
    );

    // Calculate risk score (0-100, higher is riskier)
    let riskScore = 0;
    if (healthFactor < 1.1) riskScore += 40;
    else if (healthFactor < 1.2) riskScore += 25;
    else if (healthFactor < 1.5) riskScore += 10;

    const utilizationRate = totalBorrowed / totalSupplied;
    if (utilizationRate > 0.8) riskScore += 30;
    else if (utilizationRate > 0.6) riskScore += 15;

    return {
      totalSupplied,
      totalBorrowed,
      netExposure,
      weightedApy,
      healthFactor,
      riskScore,
    };
  }

  /**
   * Make HTTP request to Vesu API
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Mock data for demo purposes
   */
  private getMockPools(): VesuPool[] {
    return [
      {
        id: 'btc_pool',
        asset: 'BTC',
        totalLiquidity: 2500.0,
        totalBorrowed: 1500.0,
        supplyRate: 9.2,
        variableBorrowRate: 11.5,
        stableBorrowRate: 10.8,
        utilizationRate: 60,
        collateralFactor: 80,
        reserveFactor: 10,
        lastUpdateTimestamp: Date.now() / 1000,
      },
    ];
  }

  private getMockUserPositions(): VesuPosition[] {
    return [
      {
        id: 'position_1',
        userAddress: '0x123...',
        poolId: 'btc_pool',
        supplied: 0.5,
        borrowed: 0.3,
        borrowRateMode: 'variable',
        healthFactor: 1.75,
        accruedRewards: 150.5,
        createdAt: new Date('2024-01-10'),
        lastInteraction: new Date('2024-01-15'),
      },
    ];
  }

  private getMockStrategies(): VesuStrategy[] {
    return [
      {
        id: 'conservative_yield',
        name: 'Conservative Yield',
        description: 'Low-risk strategy focusing on stable returns',
        riskLevel: 'conservative',
        expectedApy: 7.5,
        minCollateralRatio: 200,
        maxLeverage: 1.5,
        recommendedPoolIds: ['btc_pool'],
        parameters: {
          targetUtilization: 50,
          rebalanceThreshold: 10,
          rewardCompoundFrequency: 24,
        },
      },
      {
        id: 'balanced_growth',
        name: 'Balanced Growth',
        description: 'Moderate risk with optimized returns',
        riskLevel: 'moderate',
        expectedApy: 12.5,
        minCollateralRatio: 150,
        maxLeverage: 2.5,
        recommendedPoolIds: ['btc_pool'],
        parameters: {
          targetUtilization: 70,
          rebalanceThreshold: 15,
          rewardCompoundFrequency: 12,
        },
      },
      {
        id: 'aggressive_leverage',
        name: 'Aggressive Leverage',
        description: 'High-risk strategy with maximum returns',
        riskLevel: 'aggressive',
        expectedApy: 18.0,
        minCollateralRatio: 120,
        maxLeverage: 4.0,
        recommendedPoolIds: ['btc_pool'],
        parameters: {
          targetUtilization: 85,
          rebalanceThreshold: 20,
          rewardCompoundFrequency: 6,
        },
      },
    ];
  }

  private getMockOperationHistory(): VesuOperation[] {
    return [
      {
        id: 'op_1',
        type: 'supply',
        amount: 0.5,
        asset: 'BTC',
        userAddress: '0x123...',
        poolId: 'btc_pool',
        status: 'completed',
        timestamp: new Date('2024-01-10'),
        txHash: '0xabc...123',
      },
      {
        id: 'op_2',
        type: 'borrow',
        amount: 0.3,
        asset: 'BTC',
        userAddress: '0x123...',
        poolId: 'btc_pool',
        status: 'completed',
        timestamp: new Date('2024-01-11'),
        txHash: '0xdef...456',
      },
    ];
  }

  private getMockOptimizationResult() {
    return {
      recommendations: [
        {
          type: 'increase_collateral',
          amount: 0.1,
          reason: 'Current health factor is below optimal range',
          expectedImprovement: 0.5,
        },
      ],
      currentApy: 11.2,
      projectedApy: 11.7,
    };
  }
}

// Create singleton instance
export const vesuService = new VesuService();