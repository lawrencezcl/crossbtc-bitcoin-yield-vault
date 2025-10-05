'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EnhancedTransaction } from '@/types/atomiq'
import { Bitcoin, Zap, ArrowDownUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TransactionHistoryProps {
  transactions: EnhancedTransaction[]
  loading?: boolean
  onRefresh?: () => void
  autoRefresh?: boolean
  refreshInterval?: number
}

export function TransactionHistory({
  transactions,
  loading = false,
  onRefresh,
  autoRefresh = false,
  refreshInterval = 30000
}: TransactionHistoryProps) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return

    const interval = setInterval(() => {
      onRefresh()
      setLastRefresh(new Date())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, onRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownUp className="h-4 w-4 text-green-600" />
      case 'withdrawal':
        return <ArrowDownUp className="h-4 w-4 text-red-600 rotate-180" />
      case 'yield':
        return <Zap className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600'
      case 'withdrawal':
        return 'text-red-600'
      case 'yield':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  const getTransactionDetails = (tx: EnhancedTransaction) => {
    const details = []

    if (tx.bitcoinTx) {
      details.push({
        label: 'Bitcoin Transaction',
        value: tx.bitcoinTx.txid.substring(0, 8) + '...',
        icon: <Bitcoin className="h-3 w-3" />
      })
      if (tx.confirmations !== undefined) {
        details.push({
          label: 'Confirmations',
          value: `${tx.confirmations}`,
          icon: <CheckCircle className="h-3 w-3" />
        })
      }
    }

    if (tx.lightningPayment) {
      details.push({
        label: 'Lightning Payment',
        value: tx.lightningPayment.payment_hash.substring(0, 8) + '...',
        icon: <Zap className="h-3 w-3" />
      })
    }

    if (tx.starknetTx) {
      details.push({
        label: 'Starknet Transaction',
        value: tx.starknetTx.hash.substring(0, 8) + '...',
        icon: <div className="h-3 w-3 rounded-full bg-purple-500" />
      })
    }

    if (tx.bridgeTx) {
      details.push({
        label: 'Bridge Transaction',
        value: `→ ${tx.bridgeTx.toChain}`,
        icon: <ArrowDownUp className="h-3 w-3" />
      })
    }

    if (tx.fees && tx.fees > 0) {
      details.push({
        label: 'Fees',
        value: `${tx.fees.toFixed(8)} BTC`,
        icon: <div className="h-3 w-3 rounded-full bg-orange-500" />
      })
    }

    return details
  }

  if (loading && transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Transaction History
            <Button variant="outline" size="sm" disabled>
              <Clock className="h-4 w-4 mr-2" />
              Loading...
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Transaction History
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <Clock className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Clock className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your transaction history will appear here once you start making deposits and withdrawals.
            </p>
            <div className="text-xs text-gray-400">
              Last refresh: {formatTimestamp(lastRefresh)}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            Transaction History
            {autoRefresh && (
              <Badge variant="secondary" className="text-xs">
                Auto-refresh
              </Badge>
            )}
          </span>
          <div className="flex items-center gap-2">
            {autoRefresh && (
              <div className="text-xs text-muted-foreground">
                Last: {formatTimestamp(lastRefresh)}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <Clock className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Transaction Icon */}
              <div className={`mt-1 ${getTypeColor(tx.type)}`}>
                {getTypeIcon(tx.type)}
              </div>

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {tx.description || `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}`}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${getTypeColor(tx.type)}`}>
                      {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}
                      {tx.amount.toFixed(8)} BTC
                    </span>
                    {getStatusIcon(tx.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(tx.status)} variant="outline">
                      {tx.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(tx.timestamp)}
                    </span>
                  </div>
                  {tx.fees && tx.fees > 0 && (
                    <span className="text-xs text-gray-500">
                      Fee: {tx.fees.toFixed(8)} BTC
                    </span>
                  )}
                </div>

                {/* Additional Transaction Details */}
                {getTransactionDetails(tx).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getTransactionDetails(tx).map((detail, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                      >
                        {detail.icon}
                        <span className="font-medium">{detail.label}:</span>
                        <span>{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Showing {transactions.length} transactions</span>
            {autoRefresh && (
              <span>Auto-refreshing every {refreshInterval / 1000}s</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}