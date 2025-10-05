import {
  VaultBalance,
  YieldStrategy,
  Transaction,
  VaultDepositParams,
  VaultWithdrawParams,
  ApiResponse,
} from '@/types';

// Mock vault service for demonstration
// In production, this would connect to actual blockchain services
class VaultService {
  private mockData = {
    balance: {
      total: 0.52500000,
      principal: 0.50000000,
      yield: 0.02500000,
      apr: 8.5,
      totalYield: 0.02500000,
      yieldStrategies: [
        {
          id: '1',
          name: 'Troves Lending',
          allocation: 40,
          apr: 8.5,
          description: 'Lend Bitcoin through Troves protocol',
          risk: 'medium' as const,
        },
        {
          id: '2',
          name: 'Vesu Borrowing',
          allocation: 35,
          apr: 9.2,
          description: 'Provide liquidity through Vesu',
          risk: 'high' as const,
        },
        {
          id: '3',
          name: 'Lido Staking',
          allocation: 25,
          apr: 6.8,
          description: 'Stake wrapped Bitcoin derivatives',
          risk: 'low' as const,
        },
      ],
    },
    strategies: [
      {
        id: '1',
        name: 'Troves Lending',
        allocation: 40,
        apr: 8.5,
        description: 'Lend Bitcoin through Troves protocol',
        risk: 'medium' as const,
      },
      {
        id: '2',
        name: 'Vesu Borrowing',
        allocation: 35,
        apr: 9.2,
        description: 'Provide liquidity through Vesu',
        risk: 'high' as const,
      },
      {
        id: '3',
        name: 'Lido Staking',
        allocation: 25,
        apr: 6.8,
        description: 'Stake wrapped Bitcoin derivatives',
        risk: 'low' as const,
      },
    ],
    transactions: [
      {
        id: '1',
        type: 'deposit' as const,
        amount: 0.10000000,
        timestamp: new Date('2024-01-15'),
        status: 'completed' as const,
        description: 'Initial deposit',
        txHash: '0x1234...5678',
      },
      {
        id: '2',
        type: 'yield' as const,
        amount: 0.00123456,
        timestamp: new Date('2024-01-14'),
        status: 'completed' as const,
        description: 'Daily yield payment',
        txHash: '0xabcd...efgh',
      },
      {
        id: '3',
        type: 'deposit' as const,
        amount: 0.40000000,
        timestamp: new Date('2024-01-10'),
        status: 'completed' as const,
        description: 'Additional deposit',
        txHash: '0x9876...5432',
      },
    ],
  };

  async getBalance(vaultId?: string): Promise<VaultBalance> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production, this would fetch actual vault data from blockchain
    return {
      ...this.mockData.balance,
      total: this.mockData.balance.total + Math.random() * 0.00001, // Small variation
      yield: this.mockData.balance.yield + Math.random() * 0.00001,
    };
  }

  async getStrategies(vaultId?: string): Promise<YieldStrategy[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return this.mockData.strategies;
  }

  async getTransactions(vaultId?: string): Promise<Transaction[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return this.mockData.transactions;
  }

  async deposit(params: VaultDepositParams): Promise<{ amount: number; txHash: string }> {
    // Simulate blockchain interaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate random failure for demo
    if (Math.random() < 0.1) {
      throw new Error('Transaction failed: Insufficient gas');
    }

    const txHash = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`;

    // Update mock data
    this.mockData.balance.total += params.amount;
    this.mockData.balance.principal += params.amount;

    this.mockData.transactions.unshift({
      id: Date.now().toString(),
      type: 'deposit',
      amount: params.amount,
      timestamp: new Date(),
      status: 'completed',
      description: `${params.method} deposit`,
      txHash,
    });

    return {
      amount: params.amount,
      txHash,
    };
  }

  async withdraw(params: VaultWithdrawParams): Promise<{ amount: number; txHash: string }> {
    // Simulate blockchain interaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check balance
    if (params.amount > this.mockData.balance.total) {
      throw new Error('Insufficient balance');
    }

    // Simulate random failure for demo
    if (Math.random() < 0.1) {
      throw new Error('Transaction failed: Network congestion');
    }

    const txHash = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`;

    // Update mock data
    this.mockData.balance.total -= params.amount;
    this.mockData.balance.principal -= params.amount;

    this.mockData.transactions.unshift({
      id: Date.now().toString(),
      type: 'withdraw',
      amount: -params.amount,
      timestamp: new Date(),
      status: 'completed',
      description: `${params.method} withdrawal`,
      txHash,
    });

    return {
      amount: params.amount,
      txHash,
    };
  }

  async claimYield(vaultId?: string): Promise<{ amount: number; txHash: string }> {
    // Simulate blockchain interaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const yieldAmount = this.mockData.balance.yield;

    if (yieldAmount <= 0) {
      throw new Error('No yield available to claim');
    }

    const txHash = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`;

    // Update mock data
    this.mockData.balance.principal += yieldAmount;
    this.mockData.balance.yield = 0;
    this.mockData.balance.totalYield += yieldAmount;

    this.mockData.transactions.unshift({
      id: Date.now().toString(),
      type: 'yield',
      amount: yieldAmount,
      timestamp: new Date(),
      status: 'completed',
      description: 'Yield claimed',
      txHash,
    });

    return {
      amount: yieldAmount,
      txHash,
    };
  }

  async switchStrategy(vaultId?: string, strategyId?: string): Promise<void> {
    // Simulate blockchain interaction delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate random failure for demo
    if (Math.random() < 0.05) {
      throw new Error('Strategy switch failed: Contract error');
    }

    // In production, this would call the smart contract to switch strategies
    // For now, we just simulate success
  }

  async getVaultStats(vaultId?: string): Promise<{
    totalDeposits: number;
    totalYield: number;
    activeUsers: number;
    averageAPR: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      totalDeposits: 1250.75,
      totalYield: 87.32,
      activeUsers: 342,
      averageAPR: 8.2,
    };
  }
}

export const vaultService = new VaultService();