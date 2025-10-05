'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bitcoin, TrendingUp, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface VaultBalanceCardProps {
  vault: {
    id: string
    balance: number
    yieldEarned: number
    apr: number
    change24h: number
  } | null
  loading?: boolean
  onDeposit?: () => void
  onWithdraw?: () => void
}

export function VaultBalanceCard({
  vault,
  loading = false,
  onDeposit,
  onWithdraw
}: VaultBalanceCardProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!vault) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-bitcoin-500" />
            Bitcoin Yield Vault
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">No vault found. Create your first vault to start earning yield.</p>
          <Button
            onClick={onDeposit}
            className="w-full bitcoin-glow"
          >
            Create Vault
          </Button>
        </CardContent>
      </Card>
    )
  }

  const totalValue = vault.balance + vault.yieldEarned
  const isPositive = vault.change24h >= 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-bitcoin-500" />
            Bitcoin Yield Vault
          </CardTitle>
          <Badge
            variant={isPositive ? "success" : "destructive"}
            className="text-xs"
          >
            {isPositive ? '+' : ''}{formatPercentage(vault.change24h)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Balance */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <div className="text-3xl font-bold">
            {formatCurrency(totalValue)}
          </div>
        </div>

        {/* Balance Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Principal</p>
            <p className="text-lg font-semibold">
              {formatCurrency(vault.balance)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Yield Earned</p>
            <p className="text-lg font-semibold text-green-600">
              +{formatCurrency(vault.yieldEarned)}
            </p>
          </div>
        </div>

        {/* APR Indicator */}
        <div className="flex items-center justify-between p-3 bg-bitcoin-50 rounded-lg border border-bitcoin-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-bitcoin-600" />
            <span className="text-sm font-medium">Current APR</span>
          </div>
          <span className="text-lg font-bold text-bitcoin-600">
            {formatPercentage(vault.apr)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onDeposit}
            className="flex-1 bitcoin-glow"
          >
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Deposit
          </Button>
          <Button
            onClick={onWithdraw}
            variant="outline"
            className="flex-1"
          >
            <ArrowUpFromLine className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}