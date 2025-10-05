/**
 * Troves Lending Strategy Integration
 * Implements Bitcoin lending through Troves protocol
 */

export interface TrovesPosition {
  id: string;
  collateral: number; // BTC amount
  debt: number; // Stablecoin debt
  collateralRatio: number; // Percentage
  interestRate: number; // APR
  status: 'active' | 'liquidating' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface TrovesMarket {
  totalSupply: number;
  totalBorrowed: number;
  supplyRate: number; // APR
  borrowRate: number; // APR
  utilizationRate: number; // Percentage
  collateralFactor: number; // Percentage
  liquidationThreshold: number; // Percentage
}

export interface TrovesTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'borrow' | 'repay' | 'liquidate';
  amount: number;
  asset: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  gasUsed?: number;
  txHash?: string;
}

class TrovesService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_TROVES_API_URL || 'https://api.troves.finance/v1';
    this.apiKey = process.env.NEXT_PUBLIC_TROVES_API_KEY || 'demo_key';
  }

  /**
   * Get market information for BTC lending
   */
  public async getMarketInfo(asset: string = 'BTC'): Promise<TrovesMarket> {
    try {
      const response = await this.makeRequest(`/markets/${asset}`, 'GET');
      return {
        totalSupply: response.totalSupply / 1e8, // Convert from satoshis
        totalBorrowed: response.totalBorrowed / 1e8,
        supplyRate: response.supplyRate / 1e18 * 100, // Convert from wei to percentage
        borrowRate: response.borrowRate / 1e18 * 100,
        utilizationRate: (response.totalBorrowed / response.totalSupply) * 100,
        collateralFactor: response.collateralFactor / 1e2, // Convert basis points
        liquidationThreshold: response.liquidationThreshold / 1e2,
      };
    } catch (error) {
      console.error('Failed to get Troves market info:', error);
      return this.getMockMarketInfo();
    }
  }

  /**
   * Get user positions
   */
  public async getUserPositions(userAddress: string): Promise<TrovesPosition[]> {
    try {
      const response = await this.makeRequest(`/positions/${userAddress}`, 'GET');
      return response.positions.map((pos: any) => ({
        id: pos.id,
        collateral: pos.collateral / 1e8,
        debt: pos.debt / 1e6, // Assuming stablecoin has 6 decimals
        collateralRatio: pos.collateralRatio / 1e2,
        interestRate: pos.interestRate / 1e18 * 100,
        status: pos.status,
        createdAt: new Date(pos.createdAt * 1000),
        updatedAt: new Date(pos.updatedAt * 1000),
      }));
    } catch (error) {
      console.error('Failed to get user positions:', error);
      return this.getMockUserPositions();
    }
  }

  /**
   * Deposit BTC as collateral
   */
  public async depositCollateral(
    userAddress: string,
    amount: number
  ): Promise<TrovesTransaction> {
    try {
      const response = await this.makeRequest('/positions/deposit', 'POST', {
        userAddress,
        asset: 'BTC',
        amount: Math.floor(amount * 1e8), // Convert to satoshis
      });

      return {
        id: response.transactionId,
        type: 'deposit',
        amount,
        asset: 'BTC',
        timestamp: new Date(),
        status: 'pending',
        txHash: response.txHash,
      };
    } catch (error) {
      console.error('Failed to deposit collateral:', error);
      throw new Error(`Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Withdraw collateral
   */
  public async withdrawCollateral(
    userAddress: string,
    amount: number
  ): Promise<TrovesTransaction> {
    try {
      const response = await this.makeRequest('/positions/withdraw', 'POST', {
        userAddress,
        asset: 'BTC',
        amount: Math.floor(amount * 1e8),
      });

      return {
        id: response.transactionId,
        type: 'withdraw',
        amount,
        asset: 'BTC',
        timestamp: new Date(),
        status: 'pending',
        txHash: response.txHash,
      };
    } catch (error) {
      console.error('Failed to withdraw collateral:', error);
      throw new Error(`Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Borrow against collateral
   */
  public async borrow(
    userAddress: string,
    amount: number
  ): Promise<TrovesTransaction> {
    try {
      const response = await this.makeRequest('/positions/borrow', 'POST', {
        userAddress,
        asset: 'USDC', // Assuming USDC as stablecoin
        amount: Math.floor(amount * 1e6), // Assuming 6 decimals
      });

      return {
        id: response.transactionId,
        type: 'borrow',
        amount,
        asset: 'USDC',
        timestamp: new Date(),
        status: 'pending',
        txHash: response.txHash,
      };
    } catch (error) {
      console.error('Failed to borrow:', error);
      throw new Error(`Borrow failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Repay debt
   */
  public async repay(
    userAddress: string,
    amount: number
  ): Promise<TrovesTransaction> {
    try {
      const response = await this.makeRequest('/positions/repay', 'POST', {
        userAddress,
        asset: 'USDC',
        amount: Math.floor(amount * 1e6),
      });

      return {
        id: response.transactionId,
        type: 'repay',
        amount,
        asset: 'USDC',
        timestamp: new Date(),
        status: 'pending',
        txHash: response.txHash,
      };
    } catch (error) {
      console.error('Failed to repay:', error);
      throw new Error(`Repayment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction history
   */
  public async getTransactionHistory(userAddress: string): Promise<TrovesTransaction[]> {
    try {
      const response = await this.makeRequest(`/transactions/${userAddress}`, 'GET');
      return response.transactions.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.asset === 'BTC' ? tx.amount / 1e8 : tx.amount / 1e6,
        asset: tx.asset,
        timestamp: new Date(tx.timestamp * 1000),
        status: tx.status,
        gasUsed: tx.gasUsed,
        txHash: tx.txHash,
      }));
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return this.getMockTransactionHistory();
    }
  }

  /**
   * Calculate expected yield for given amount
   */
  public calculateExpectedYield(
    principal: number,
    marketInfo: TrovesMarket,
    duration: number = 365 // days
  ): number {
    const dailyRate = marketInfo.supplyRate / 100 / 365;
    return principal * dailyRate * duration;
  }

  /**
   * Get position health metrics
   */
  public getPositionHealth(position: TrovesPosition): {
    healthScore: number;
    liquidationRisk: 'low' | 'medium' | 'high' | 'critical';
    canWithdraw: number;
    canBorrow: number;
  } {
    const healthScore = position.collateralRatio;

    let liquidationRisk: 'low' | 'medium' | 'high' | 'critical';
    if (healthScore >= 200) liquidationRisk = 'low';
    else if (healthScore >= 150) liquidationRisk = 'medium';
    else if (healthScore >= 120) liquidationRisk = 'high';
    else liquidationRisk = 'critical';

    // Calculate amounts that can be safely withdrawn/borrowed
    const safeRatio = 150; // Target 150% collateral ratio
    const currentDebtValue = position.debt;
    const currentCollateralValue = position.collateral;

    const maxDebtAtSafeRatio = (currentCollateralValue * 0.75) / (safeRatio / 100);
    const canBorrow = Math.max(0, maxDebtAtSafeRatio - currentDebtValue);

    const maxCollateralAtSafeRatio = (currentDebtValue * safeRatio / 100) / 0.75;
    const canWithdraw = Math.max(0, currentCollateralValue - maxCollateralAtSafeRatio);

    return {
      healthScore,
      liquidationRisk,
      canWithdraw,
      canBorrow,
    };
  }

  /**
   * Make HTTP request to Troves API
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
  private getMockMarketInfo(): TrovesMarket {
    return {
      totalSupply: 1250.75,
      totalBorrowed: 875.25,
      supplyRate: 8.5,
      borrowRate: 10.2,
      utilizationRate: 70,
      collateralFactor: 75,
      liquidationThreshold: 120,
    };
  }

  private getMockUserPositions(): TrovesPosition[] {
    return [
      {
        id: 'position_1',
        collateral: 0.5,
        debt: 300,
        collateralRatio: 175,
        interestRate: 8.5,
        status: 'active',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15'),
      },
    ];
  }

  private getMockTransactionHistory(): TrovesTransaction[] {
    return [
      {
        id: 'tx_1',
        type: 'deposit',
        amount: 0.1,
        asset: 'BTC',
        timestamp: new Date('2024-01-15'),
        status: 'completed',
        txHash: '0xabc...123',
      },
      {
        id: 'tx_2',
        type: 'deposit',
        amount: 0.4,
        asset: 'BTC',
        timestamp: new Date('2024-01-10'),
        status: 'completed',
        txHash: '0xdef...456',
      },
    ];
  }
}

// Create singleton instance
export const trovesService = new TrovesService();