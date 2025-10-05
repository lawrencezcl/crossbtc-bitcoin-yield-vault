'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Clock, Target, Zap } from 'lucide-react'
import { formatCurrency, formatPercentage, timeAgo } from '@/lib/utils'

interface YieldOverviewProps {
  vault: {
    apr: number
    yieldEarned: number
    yieldRate: number
    lastYieldDistribution: Date | null
    projectedAnnualYield: number
    riskLevel: 'low' | 'medium' | 'high'
  } | null
  loading?: boolean
}

export function YieldOverview({ vault, loading = false }: YieldOverviewProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!vault) {
    return null
  }

  const getRiskVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'success'
      case 'medium': return 'warning'
      case 'high': return 'destructive'
      default: return 'secondary'
    }
  }

  const progressPercentage = Math.min(vault.yieldRate * 100, 100)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Yield Overview
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Yield Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Yield Rate</span>
            <span className="text-sm text-muted-foreground">
              {formatPercentage(vault.yieldRate)}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Yield Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Yield Earned */}
          <div className="space-y-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">Total Earned</span>
            </div>
            <p className="text-lg font-bold text-green-700">
              {formatCurrency(vault.yieldEarned)}
            </p>
          </div>

          {/* Projected Annual Yield */}
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Projected Annual</span>
            </div>
            <p className="text-lg font-bold text-blue-700">
              {formatCurrency(vault.projectedAnnualYield)}
            </p>
          </div>
        </div>

        {/* APR and Risk Level */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">APR</span>
            </div>
            <p className="text-2xl font-bold text-bitcoin-600">
              {formatPercentage(vault.apr)}
            </p>
          </div>
          <div className="text-right space-y-1">
            <span className="text-sm text-muted-foreground">Risk Level</span>
            <div>
              <Badge variant={getRiskVariant(vault.riskLevel)}>
                {vault.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Last Yield Distribution */}
        {vault.lastYieldDistribution && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-muted-foreground">Last Distribution</span>
            </div>
            <span className="text-sm font-medium">
              {timeAgo(vault.lastYieldDistribution)}
            </span>
          </div>
        )}

        {/* Yield Strategies Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Active Yield Strategies</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-bitcoin-500 rounded-full"></div>
                <span className="text-sm">Troves Yield</span>
              </div>
              <span className="text-sm font-medium">60%</span>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Vesu Lending</span>
              </div>
              <span className="text-sm font-medium">40%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}