/**
 * Yield Strategies Component
 * Displays and manages yield generation strategies
 */
import { useState } from 'react';
import { Card, Button, Progress } from '@/components/ui';
import { useYieldStrategies } from '@/hooks/useYieldStrategies';
import { BitcoinIcon, TrendingUpIcon, ShieldIcon } from '@/components/icons';

export const YieldStrategies: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const {
    allocations,
    yieldMetrics,
    trovesMarket,
    vesuPools,
    recommendations,
    isLoading,
    isOperating,
    vesuSupply,
    trovesDeposit,
    updateAllocation,
    claimRewards,
  } = useYieldStrategies();

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const formatBtc = (value: number) => `${value.toFixed(8)} BTC`;

  const handleQuickDeposit = async (strategy: 'troves' | 'vesu', amount: number) => {
    try {
      if (strategy === 'troves') {
        await trovesDeposit(amount);
      } else {
        // Use first available Vesu pool
        const poolId = vesuPools?.[0]?.id;
        if (poolId) {
          await vesuSupply({ poolId, amount });
        }
      }
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleRebalance = (recommendation: any) => {
    if (recommendation.action) {
      recommendation.action();
    }
  };

  return (
    <div className="space-y-6">
      {/* Yield Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUpIcon className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Yield Strategies</h3>
              <p className="text-sm text-gray-600">Optimize your Bitcoin earnings</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Deposited</p>
            <p className="text-lg font-semibold text-orange-600">
              {formatBtc(yieldMetrics.totalDeposited)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Current APR</p>
            <p className="text-lg font-semibold text-green-600">
              {formatPercentage(yieldMetrics.currentYieldRate)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Monthly Yield</p>
            <p className="text-lg font-semibold">
              {formatBtc(yieldMetrics.monthlyYield)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Risk Score</p>
            <p className={`text-lg font-semibold ${
              yieldMetrics.riskScore < 30 ? 'text-green-600' :
              yieldMetrics.riskScore < 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {yieldMetrics.riskScore}/100
            </p>
          </div>
        </div>

        {/* Strategy Allocations */}
        <div className="space-y-4">
          <h4 className="font-medium">Strategy Allocation</h4>
          {allocations.map((allocation) => (
            <div key={allocation.strategy} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    allocation.strategy === 'troves' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <span className="font-medium capitalize">{allocation.strategy}</span>
                  {allocation.active && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {allocation.percentage}%
                    {allocation.strategy === 'troves' && trovesMarket && (
                      <span className="text-gray-500 ml-1">
                        @ {formatPercentage(trovesMarket.supplyRate)}
                      </span>
                    )}
                    {allocation.strategy === 'vesu' && vesuPools && vesuPools.length > 0 && (
                      <span className="text-gray-500 ml-1">
                        @ {formatPercentage(vesuPools[0].supplyRate)}
                      </span>
                    )}
                  </span>
                  {allocation.autoOptimize && (
                    <ShieldIcon className="h-4 w-4 text-blue-500" title="Auto-optimization enabled" />
                  )}
                </div>
              </div>
              <Progress value={allocation.percentage} className="h-2" />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-4 mt-6">
          {allocations.map((allocation) => (
            <Button
              key={allocation.strategy}
              onClick={() => handleQuickDeposit(allocation.strategy, 0.01)}
              disabled={!allocation.active || isOperating.trovesDeposit || isOperating.vesuSupply}
              className="flex-1"
            >
              {isOperating.trovesDeposit || isOperating.vesuSupply
                ? 'Processing...'
                : `Deposit to ${allocation.strategy.charAt(0).toUpperCase() + allocation.strategy.slice(1)}`
              }
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => claimRewards()}
            disabled={isOperating.claimRewards}
          >
            {isOperating.claimRewards ? 'Claiming...' : 'Claim Rewards'}
          </Button>
        </div>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <h4 className="font-medium mb-4">Recommendations</h4>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  rec.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className={`text-sm ${
                    rec.severity === 'high' ? 'text-red-800' : 'text-blue-800'
                  }`}>
                    {rec.message}
                  </p>
                  {rec.action && (
                    <Button
                      size="sm"
                      onClick={() => handleRebalance(rec)}
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Detailed Strategy Information */}
      {showDetails && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Troves Details */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BitcoinIcon className="h-6 w-6 text-blue-500" />
              <h4 className="font-medium">Troves Lending</h4>
            </div>

            {trovesMarket ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Supply Rate:</span>
                  <span className="text-sm font-medium">
                    {formatPercentage(trovesMarket.supplyRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Utilization:</span>
                  <span className="text-sm font-medium">
                    {formatPercentage(trovesMarket.utilizationRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Collateral Factor:</span>
                  <span className="text-sm font-medium">
                    {formatPercentage(trovesMarket.collateralFactor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Supply:</span>
                  <span className="text-sm font-medium">
                    {formatBtc(trovesMarket.totalSupply)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Loading market data...</p>
            )}
          </Card>

          {/* Vesu Details */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldIcon className="h-6 w-6 text-purple-500" />
              <h4 className="font-medium">Vesu Borrowing</h4>
            </div>

            {vesuPools && vesuPools.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Supply Rate:</span>
                  <span className="text-sm font-medium">
                    {formatPercentage(vesuPools[0].supplyRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Variable Borrow Rate:</span>
                  <span className="text-sm font-medium">
                    {formatPercentage(vesuPools[0].variableBorrowRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Utilization:</span>
                  <span className="text-sm font-medium">
                    {formatPercentage(vesuPools[0].utilizationRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Liquidity:</span>
                  <span className="text-sm font-medium">
                    {formatBtc(vesuPools[0].totalLiquidity)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Loading pool data...</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};