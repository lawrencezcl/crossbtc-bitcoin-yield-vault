export interface Vault {
  id: string
  userId: string
  balance: number
  yieldEarned: number
  apr: number
  change24h: number
  yieldRate: number
  lastYieldDistribution: Date | null
  projectedAnnualYield: number
  riskLevel: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}

export interface VaultStats {
  totalDeposited: number
  totalWithdrawn: number
  currentYieldRate: number
  lifetimeYield: number
  apr: number
  yieldHistory: YieldHistoryEntry[]
}

export interface YieldHistoryEntry {
  date: Date
  amount: number
  apr: number
  source: string
}

export interface DepositRequest {
  amount: number
  method: 'bitcoin' | 'lightning'
  userId: string
}

export interface WithdrawalRequest {
  amount: number
  method: 'bitcoin' | 'lightning'
  destination: string
  userId: string
}

export interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'yield'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  txHash?: string
  timestamp: Date
  fees?: number
  description?: string
}

export interface LightningInvoice {
  paymentHash: string
  bolt11: string
  amount: number
  timestamp: Date
  expiry: Date
  memo: string
  status: 'pending' | 'paid' | 'expired'
}

export interface PaymentResult {
  success: boolean
  paymentHash: string
  amount: number
  fee: number
  timestamp: Date
  preimage?: string
}

export interface BridgeTransaction {
  id: string
  fromChain: 'bitcoin' | 'starknet'
  toChain: 'bitcoin' | 'starknet'
  amount: number
  status: 'pending' | 'confirming' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  txHash?: string
  fees: {
    bridge: number
    network: number
  }
}