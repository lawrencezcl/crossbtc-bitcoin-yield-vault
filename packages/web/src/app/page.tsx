'use client'

import { useState } from 'react'
import { VaultBalanceCard } from '@/components/vault/VaultBalanceCard'
import { YieldOverview } from '@/components/vault/YieldOverview'
import { DepositModal } from '@/components/vault/DepositModal'
import { TransactionHistory } from '@/components/vault/TransactionHistory'
import { ErrorBoundary, SdkErrorFallback } from '@/components/ui/error-boundary'
import { useVault } from '@/hooks/useVault'
import { Bitcoin, TrendingUp, Activity, Settings, Wifi, WifiOff } from 'lucide-react'

export default function HomePage() {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  // Mock user ID - in production, this would come from authentication
  const userId = 'user-123'

  const {
  vault,
  transactions,
  loading,
  error,
  sdkStatus,
  bitcoinAddress,
  lightningInvoice,
  deposit,
  withdraw,
  claimYield,
  refetch,
  refreshTransactions
} = useVault(userId, {
  enableRealData: true,
  autoRefresh: true
})

  const handleDeposit = (amount: number, method: 'bitcoin' | 'lightning') => {
    deposit({ amount, method, userId })
      .then(() => {
        setShowDepositModal(false)
      })
      .catch(console.error)
  }

  const handleWithdraw = (amount: number, method: 'bitcoin' | 'lightning', destination: string) => {
    withdraw({ amount, method, destination, userId })
      .then(() => {
        setShowWithdrawModal(false)
      })
      .catch(console.error)
  }

  return (
    <ErrorBoundary fallback={SdkErrorFallback}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bitcoin-100 rounded-lg">
                  <Bitcoin className="h-6 w-6 text-bitcoin-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">CrossBTC</h1>
                  <p className="text-sm text-muted-foreground">Bitcoin Yield Vault</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* SDK Status Indicator */}
                <div className="flex items-center gap-2">
                  {sdkStatus === 'ready' ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Wifi className="h-4 w-4" />
                      <span className="text-xs font-medium">Live Data</span>
                    </div>
                  ) : sdkStatus === 'loading' ? (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                      <span className="text-xs font-medium">Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <WifiOff className="h-4 w-4" />
                      <span className="text-xs font-medium">Demo Mode</span>
                    </div>
                  )}
                </div>

                <nav className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-sm font-medium hover:text-bitcoin-600">
                    <TrendingUp className="h-4 w-4" />
                    Dashboard
                  </button>
                  <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    <Activity className="h-4 w-4" />
                    Activity
                  </button>
                  <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Vault Balance Card */}
          <div className="lg:col-span-1">
            <VaultBalanceCard
              vault={vault}
              loading={loading}
              onDeposit={() => setShowDepositModal(true)}
              onWithdraw={() => setShowWithdrawModal(true)}
            />
          </div>

          {/* Yield Overview */}
          <div className="lg:col-span-2">
            <YieldOverview
              vault={vault}
              loading={loading}
            />
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-8">
          <TransactionHistory
            transactions={transactions}
            loading={loading}
            onRefresh={refreshTransactions}
            autoRefresh={true}
            refreshInterval={30000}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={refetch}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* SDK Status Messages */}
        {sdkStatus === 'loading' && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              Initializing blockchain services... This may take a moment.
            </p>
          </div>
        )}

        {sdkStatus === 'error' && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Some blockchain services are unavailable. The app will continue with demo data.
            </p>
          </div>
        )}
      </main>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
        loading={loading}
        bitcoinAddress={bitcoinAddress}
        sdkStatus={sdkStatus}
      />
    </div>
    </ErrorBoundary>
  )
}