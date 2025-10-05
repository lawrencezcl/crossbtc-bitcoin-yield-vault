import { useState } from 'react'
import { VaultBalanceCard } from '@/components/vault/VaultBalanceCard'
import { YieldOverview } from '@/components/vault/YieldOverview'
import { DepositModal } from '@/components/vault/DepositModal'
import { useVault } from '@/hooks/useVault'
import { Bitcoin, TrendingUp, Activity, Settings } from 'lucide-react'

export default function HomePage() {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  // Mock user ID - in production, this would come from authentication
  const userId = 'user-123'

  const { vault, transactions, loading, error, deposit, withdraw, claimYield } = useVault(userId)

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

        {/* Recent Activity */}
        {transactions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="bg-card rounded-lg border">
              <div className="divide-y">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-500' :
                        transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.timestamp.toLocaleDateString()} {transaction.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'deposit' || transaction.type === 'yield' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'yield' ? '+' : '-'}
                        {transaction.amount.toFixed(8)} BTC
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </main>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
        loading={loading}
      />
    </div>
  )
}