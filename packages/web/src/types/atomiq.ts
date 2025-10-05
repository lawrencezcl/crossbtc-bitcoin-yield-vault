import { Transaction, LightningInvoice, BridgeTransaction } from './vault'

// Bitcoin Service Types
export interface BitcoinAddress {
  address: string
  publicKey: string
  privateKey?: string
  path: string
}

export interface BitcoinBalance {
  confirmed: number
  unconfirmed: number
  total: number
}

export interface BitcoinTransaction {
  txid: string
  version: number
  locktime: number
  vin: BitcoinInput[]
  vout: BitcoinOutput[]
  size: number
  fee: number
  status: {
    confirmed: boolean
    block_height?: number
    block_hash?: string
    block_time?: number
  }
}

export interface BitcoinInput {
  txid: string
  vout: number
  scriptsig: string
  scriptsig_asm: string
  witness?: string[]
  prevout?: {
    scriptpubkey: string
    scriptpubkey_asm: string
    scriptpubkey_type: string
    value: number
  }
}

export interface BitcoinOutput {
  scriptpubkey: string
  scriptpubkey_asm: string
  scriptpubkey_type: string
  value: number
}

// Lightning Network Types
export interface LightningNodeInfo {
  identity_pubkey: string
  alias: string
  color: string
  num_peers: number
  num_pending_channels: number
  num_active_channels: number
  num_inactive_channels: number
  block_height: number
  block_hash: string
  best_header_timestamp: string
  synced_to_chain: boolean
  testnet: boolean
  chains: Array<{ chain: string; network: string }]
}

export interface LightningChannel {
  active: boolean
  remote_pubkey: string
  channel_point: string
  chan_id: string
  capacity: number
  local_balance: number
  remote_balance: number
  commit_fee: number
  commit_weight: number
  fee_per_kw: number
  unsettled_balance: number
  total_satoshis_sent: number
  total_satoshis_received: number
  num_updates: string
  pending_htlcs: Array<{
    forwarding_channel: string
    amount: number
    expiration_height: number
    hash_lock: string
    incoming: boolean
  }>
}

export interface LightningPayment {
  payment_hash: string
  value: number
  creation_date: string
  fee: number
  payment_preimage: string
  value_sat: number
  value_msat: string
  payment_request: string
  status: 'SUCCEEDED' | 'FAILED' | 'IN_FLIGHT'
  fee_sat: number
  fee_msat: string
  creation_time_ns: string
  htlcs: Array<{
    attempt_time_ns: string
    resolve_time_ns: string
    status: string
    route: {
      total_time_lock: number
      hops: Array<{
        chan_id: string
        chan_capacity: string
        amt_to_forward: string
        fee: string
        expiry: number
        amt_to_forward_msat: string
        fee_msat: string
        pub_key: string
      }]
      total_fees: string
      total_fees_msat: string
      total_amt: string
      total_amt_msat: string
    }
  }]
}

// Starknet Types
export interface StarknetAccount {
  address: string
  publicKey: string
  contractAddress?: string
  deploymentTxHash?: string
  type: 'argent' | 'braavos' | 'openzeppelin'
}

export interface StarknetBalance {
  balance: string
  decimals: number
  symbol: string
  formatted: string
}

export interface StarknetTransaction {
  hash: string
  type: 'INVOKE' | 'DECLARE' | 'DEPLOY' | 'DEPLOY_ACCOUNT'
  contract_address?: string
  entry_point_selector?: string
  calldata?: string[]
  signature?: string[]
  max_fee: string
  version: string
  nonce: string
  status: 'RECEIVED' | 'PENDING' | 'ACCEPTED_ON_L2' | 'ACCEPTED_ON_L1' | 'REJECTED'
  block_number?: number
  block_hash?: string
  transaction_index?: number
  created_at: string
}

// Bridge Service Types
export interface BridgeQuote {
  fromChain: 'bitcoin' | 'starknet'
  toChain: 'bitcoin' | 'starknet'
  amount: number
  outputAmount: number
  fees: {
    bridge: number
    network: number
    total: number
  }
  estimatedTime: number
  rate: number
}

export interface BridgeDeposit {
  id: string
  quote: BridgeQuote
  depositAddress: string
  memo?: string
  expiry: Date
  status: 'pending' | 'confirming' | 'completed' | 'expired'
  createdAt: Date
}

export interface BridgeWithdrawal {
  id: string
  amount: number
  destination: string
  status: 'pending' | 'confirming' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  txHash?: string
  fees: {
    bridge: number
    network: number
  }
}

// SDK Configuration Types
export interface AtomiqConfig {
  apiUrl: string
  apiKey: string
  network: 'mainnet' | 'testnet'
  bitcoin?: {
    rpcUrl: string
    network: 'mainnet' | 'testnet'
  }
  lightning?: {
    rpcUrl: string
    macaroon: string
    cert: string
  }
  starknet?: {
    network: 'mainnet' | 'testnet'
    rpcUrl: string
  }
  bridge?: {
    apiUrl: string
    contractAddress: string
  }
}

// Error Types
export interface AtomiqError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Service Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: AtomiqError
}

// Enhanced Transaction Interface
export interface EnhancedTransaction extends Transaction {
  bitcoinTx?: BitcoinTransaction
  lightningPayment?: LightningPayment
  starknetTx?: StarknetTransaction
  bridgeTx?: BridgeTransaction
  confirmations?: number
  blockHeight?: number
  gasUsed?: number
}

// SDK Service Interface
export interface AtomiqSDK {
  bitcoin: BitcoinService
  lightning: LightningService
  starknet: StarknetService
  bridge: BridgeService
  config: AtomiqConfig
}

export interface BitcoinService {
  generateAddress(): Promise<BitcoinAddress>
  getBalance(address: string): Promise<BitcoinBalance>
  createTransaction(to: string, amount: number, fromAddress?: string): Promise<BitcoinTransaction>
  sendTransaction(transaction: BitcoinTransaction): Promise<string>
  getTransaction(txid: string): Promise<BitcoinTransaction>
  monitorAddress(address: string, callback: (tx: BitcoinTransaction) => void): void
}

export interface LightningService {
  getNodeInfo(): Promise<LightningNodeInfo>
  getBalance(): Promise<{ balance: number; pending_balance: number }>
  createInvoice(amount: number, memo?: string): Promise<LightningInvoice>
  payInvoice(invoice: string): Promise<LightningPayment>
  getInvoice(paymentHash: string): Promise<LightningInvoice>
  getChannels(): Promise<LightningChannel[]>
  listPayments(): Promise<LightningPayment[]>
}

export interface StarknetService {
  getAccount(address: string): Promise<StarknetAccount>
  getBalance(address: string, tokenAddress?: string): Promise<StarknetBalance>
  sendTransaction(tx: any): Promise<string>
  getTransaction(hash: string): Promise<StarknetTransaction>
  waitForTransaction(hash: string): Promise<StarknetTransaction>
}

export interface BridgeService {
  getQuote(fromChain: string, toChain: string, amount: number): Promise<BridgeQuote>
  createDeposit(quote: BridgeQuote): Promise<BridgeDeposit>
  createWithdrawal(amount: number, destination: string): Promise<BridgeWithdrawal>
  getTransaction(id: string): Promise<BridgeTransaction>
  listTransactions(address: string): Promise<BridgeTransaction[]>
}