/**
 * Yield Strategies Hook
 * Manages yield generation through Troves and Vesu protocols
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from './useWallet';
import {
  trovesService,
  TrovesPosition,
  TrovesMarket,
  vesuService,
  VesuPosition,
  VesuStrategy,
  VesuPool,
} from '@/services/strategies';

export interface StrategyAllocation {
  strategy: 'troves' | 'vesu';
  percentage: number;
  active: boolean;
  autoOptimize: boolean;
}

export interface YieldMetrics {
  totalDeposited: number;
  currentYieldRate: number; // APR percentage
  dailyYield: number;
  monthlyYield: number;
  annualProjectedYield: number;
  riskScore: number; // 0-100
  diversificationScore: number; // 0-100
}

export const useYieldStrategies = () => {
  const queryClient = useQueryClient();
  const { state } = useWallet();
  const [allocations, setAllocations] = useState<StrategyAllocation[]>([
    { strategy: 'troves', percentage: 60, active: true, autoOptimize: true },
    { strategy: 'vesu', percentage: 40, active: true, autoOptimize: true },
  ]);

  // Get Troves market data
  const { data: trovesMarket, isLoading: isLoadingTrovesMarket } = useQuery({
    queryKey: ['troves-market'],
    queryFn: () => trovesService.getMarketInfo(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Get Vesu pools
  const { data: vesuPools, isLoading: isLoadingVesuPools } = useQuery({
    queryKey: ['vesu-pools'],
    queryFn: () => vesuService.getPools(),
    refetchInterval: 60000,
  });

  // Get Vesu strategies
  const { data: vesuStrategies, isLoading: isLoadingVesuStrategies } = useQuery({
    queryKey: ['vesu-strategies'],
    queryFn: () => vesuService.getStrategies(),
  });

  // Get user Troves positions
  const { data: trovesPositions, isLoading: isLoadingTrovesPositions } = useQuery({
    queryKey: ['troves-positions', state.xverseAccount?.address],
    queryFn: () => trovesService.getUserPositions(state.xverseAccount?.address || ''),
    enabled: !!state.xverseAccount?.address,
  });

  // Get user Vesu positions
  const { data: vesuPositions, isLoading: isLoadingVesuPositions } = useQuery({
    queryKey: ['vesu-positions', state.xverseAccount?.address],
    queryFn: () => vesuService.getUserPositions(state.xverseAccount?.address || ''),
    enabled: !!state.xverseAccount?.address,
  });

  // Calculate overall yield metrics
  const yieldMetrics: YieldMetrics = {
    totalDeposited: (trovesPositions?.reduce((sum, pos) => sum + pos.collateral, 0) || 0) +
                     (vesuPositions?.reduce((sum, pos) => sum + pos.supplied, 0) || 0),

    currentYieldRate: allocations.reduce((rate, alloc) => {
      if (!alloc.active) return rate;
      if (alloc.strategy === 'troves' && trovesMarket) {
        return rate + (alloc.percentage / 100) * trovesMarket.supplyRate;
      } else if (alloc.strategy === 'vesu' && vesuPools && vesuPools.length > 0) {
        return rate + (alloc.percentage / 100) * vesuPools[0].supplyRate;
      }
      return rate;
    }, 0),

    dailyYield: 0, // Calculated in real-time
    monthlyYield: 0, // Calculated in real-time
    annualProjectedYield: 0, // Calculated in real-time
    riskScore: calculateRiskScore(trovesPositions, vesuPositions, allocations),
    diversificationScore: calculateDiversificationScore(allocations),
  };

  // Calculate time-based yields
  useEffect(() => {
    const totalPrincipal = yieldMetrics.totalDeposited;
    const dailyRate = yieldMetrics.currentYieldRate / 100 / 365;

    yieldMetrics.dailyYield = totalPrincipal * dailyRate;
    yieldMetrics.monthlyYield = totalPrincipal * dailyRate * 30;
    yieldMetrics.annualProjectedYield = totalPrincipal * dailyRate * 365;
  }, [yieldMetrics.totalDeposited, yieldMetrics.currentYieldRate]);

  // Troves operations
  const trovesDeposit = useMutation({
    mutationFn: async (amount: number) => {
      if (!state.xverseAccount?.address) {
        throw new Error('Wallet not connected');
      }
      return await trovesService.depositCollateral(state.xverseAccount.address, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['troves-positions'] });
      queryClient.invalidateQueries({ queryKey: ['troves-market'] });
    },
  });

  const trovesWithdraw = useMutation({
    mutationFn: async (amount: number) => {
      if (!state.xverseAccount?.address) {
        throw new Error('Wallet not connected');
      }
      return await trovesService.withdrawCollateral(state.xverseAccount.address, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['troves-positions'] });
      queryClient.invalidateQueries({ queryKey: ['troves-market'] });
    },
  });

  // Vesu operations
  const vesuSupply = useMutation({
    mutationFn: async (params: { poolId: string; amount: number }) => {
      if (!state.xverseAccount?.address) {
        throw new Error('Wallet not connected');
      }
      return await vesuService.supply(state.xverseAccount.address, params.poolId, params.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vesu-positions'] });
      queryClient.invalidateQueries({ queryKey: ['vesu-pools'] });
    },
  });

  const vesuWithdraw = useMutation({
    mutationFn: async (params: { poolId: string; amount: number }) => {
      if (!state.xverseAccount?.address) {
        throw new Error('Wallet not connected');
      }
      return await vesuService.withdraw(state.xverseAccount.address, params.poolId, params.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vesu-positions'] });
      queryClient.invalidateQueries({ queryKey: ['vesu-pools'] });
    },
  });

  const vesuBorrow = useMutation({
    mutationFn: async (params: { poolId: string; amount: number; rateMode?: 'variable' | 'stable' }) => {
      if (!state.xverseAccount?.address) {
        throw new Error('Wallet not connected');
      }
      return await vesuService.borrow(
        state.xverseAccount.address,
        params.poolId,
        params.amount,
        params.rateMode
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vesu-positions'] });
    },
  });

  const vesuRepay = useMutation({
    mutationFn: async (params: { poolId: string; amount: number }) => {
      if (!state.xverseAccount?.address) {
        throw new Error('Wallet not connected');
      }
      return await vesuService.repay(state.xverseAccount.address, params.poolId, params.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vesu-positions'] });
    },
  });

  const claimRewards = useMutation({
    mutationFn: async () => {
      if (!state.xverseAccount?.address) {
        throw new Error('Wallet not connected');
      }
      return await vesuService.claimRewards(state.xverseAccount.address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vesu-positions'] });
    },
  });

  // Strategy optimization
  const optimizeStrategy = useMutation({
    mutationFn: async (strategyId: string) => {
      if (!state.xverseAccount?.address) {
        throw new Error('Wallet not connected');
      }
      return await vesuService.optimizeStrategy(state.xverseAccount.address, strategyId);
    },
  });

  // Allocation management
  const updateAllocation = (newAllocations: StrategyAllocation[]) => {
    const total = newAllocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
    if (total !== 100) {
      throw new Error('Total allocation must equal 100%');
    }
    setAllocations(newAllocations);
  };

  const getRecommendations = () => {
    const recommendations = [];

    // Check if reallocation is needed based on market conditions
    if (trovesMarket && vesuPools && vesuPools.length > 0) {
      const trovesRate = trovesMarket.supplyRate;
      const vesuRate = vesuPools[0].supplyRate;

      if (trovesRate > vesuRate + 2) {
        recommendations.push({
          type: 'rebalance',
          message: 'Troves is offering significantly higher yields. Consider increasing allocation.',
          action: () => updateAllocation([
            { strategy: 'troves', percentage: 75, active: true, autoOptimize: true },
            { strategy: 'vesu', percentage: 25, active: true, autoOptimize: true },
          ]),
        });
      } else if (vesuRate > trovesRate + 2) {
        recommendations.push({
          type: 'rebalance',
          message: 'Vesu is offering significantly higher yields. Consider increasing allocation.',
          action: () => updateAllocation([
            { strategy: 'troves', percentage: 40, active: true, autoOptimize: true },
            { strategy: 'vesu', percentage: 60, active: true, autoOptimize: true },
          ]),
        });
      }
    }

    // Check health factors
    if (trovesPositions) {
      trovesPositions.forEach(position => {
        const health = trovesService.getPositionHealth(position);
        if (health.liquidationRisk === 'high' || health.liquidationRisk === 'critical') {
          recommendations.push({
            type: 'risk_warning',
            message: `Troves position ${position.id} has ${health.liquidationRisk} liquidation risk. Consider adding collateral.`,
            severity: 'high',
          });
        }
      });
    }

    if (vesuPositions) {
      vesuPositions.forEach(position => {
        if (position.healthFactor < 1.2) {
          recommendations.push({
            type: 'risk_warning',
            message: `Vesu position has low health factor. Consider reducing borrowing or adding collateral.`,
            severity: 'high',
          });
        }
      });
    }

    return recommendations;
  };

  return {
    // Data
    allocations,
    yieldMetrics,
    trovesMarket,
    trovesPositions,
    vesuPools,
    vesuPositions,
    vesuStrategies,
    recommendations: getRecommendations(),

    // Loading states
    isLoading: {
      trovesMarket: isLoadingTrovesMarket,
      vesuPools: isLoadingVesuPools,
      vesuStrategies: isLoadingVesuStrategies,
      trovesPositions: isLoadingTrovesPositions,
      vesuPositions: isLoadingVesuPositions,
    },

    // Operations
    trovesDeposit: trovesDeposit.mutateAsync,
    trovesWithdraw: trovesWithdraw.mutateAsync,
    vesuSupply: vesuSupply.mutateAsync,
    vesuWithdraw: vesuWithdraw.mutateAsync,
    vesuBorrow: vesuBorrow.mutateAsync,
    vesuRepay: vesuRepay.mutateAsync,
    claimRewards: claimRewards.mutateAsync,
    optimizeStrategy: optimizeStrategy.mutateAsync,

    // Mutation states
    isOperating: {
      trovesDeposit: trovesDeposit.isPending,
      trovesWithdraw: trovesWithdraw.isPending,
      vesuSupply: vesuSupply.isPending,
      vesuWithdraw: vesuWithdraw.isPending,
      vesuBorrow: vesuBorrow.isPending,
      vesuRepay: vesuRepay.isPending,
      claimRewards: claimRewards.isPending,
      optimizeStrategy: optimizeStrategy.isPending,
    },

    // Management
    updateAllocation,
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ['troves-market'] });
      queryClient.invalidateQueries({ queryKey: ['vesu-pools'] });
      queryClient.invalidateQueries({ queryKey: ['troves-positions'] });
      queryClient.invalidateQueries({ queryKey: ['vesu-positions'] });
    },
  };
};

// Helper functions
function calculateRiskScore(
  trovesPositions?: TrovesPosition[],
  vesuPositions?: VesuPosition[],
  allocations?: StrategyAllocation[]
): number {
  let score = 0;

  // Calculate risk from positions
  if (trovesPositions) {
    trovesPositions.forEach(position => {
      const health = trovesService.getPositionHealth(position);
      if (health.liquidationRisk === 'critical') score += 30;
      else if (health.liquidationRisk === 'high') score += 20;
      else if (health.liquidationRisk === 'medium') score += 10;
    });
  }

  if (vesuPositions) {
    vesuPositions.forEach(position => {
      if (position.healthFactor < 1.1) score += 30;
      else if (position.healthFactor < 1.2) score += 20;
      else if (position.healthFactor < 1.5) score += 10;
    });
  }

  // Add diversification risk
  if (allocations) {
    const activeStrategies = allocations.filter(a => a.active).length;
    if (activeStrategies === 1) score += 20;
    else if (activeStrategies === 2) score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

function calculateDiversificationScore(allocations?: StrategyAllocation[]): number {
  if (!allocations || allocations.length === 0) return 0;

  const activeStrategies = allocations.filter(a => a.active);
  if (activeStrategies.length === 1) return 0;
  if (activeStrategies.length === 2) return 50;

  // Calculate allocation balance (more balanced = higher score)
  const percentages = activeStrategies.map(a => a.percentage);
  const maxPercentage = Math.max(...percentages);
  const minPercentage = Math.min(...percentages);
  const balance = 1 - (maxPercentage - minPercentage) / 100;

  return Math.round(50 + balance * 50); // 50-100 range for 2+ strategies
}