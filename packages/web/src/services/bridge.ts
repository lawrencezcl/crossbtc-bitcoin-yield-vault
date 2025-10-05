import {
  BridgeService,
  BridgeQuote,
  BridgeDeposit,
  BridgeWithdrawal,
  BridgeTransaction,
  AtomiqError
} from '@/types/atomiq'

export class BridgeServiceImplementation implements BridgeService {
  private apiUrl: string
  private contractAddress: string

  constructor(apiUrl: string, contractAddress: string) {
    this.apiUrl = apiUrl
    this.contractAddress = contractAddress
  }

  /**
   * Get a bridge quote for cross-chain transfer
   */
  async getQuote(
    fromChain: 'bitcoin' | 'starknet',
    toChain: 'bitcoin' | 'starknet',
    amount: number
  ): Promise<BridgeQuote> {
    try {
      const response = await this.makeRequest('/quote', 'POST', {
        from_chain: fromChain,
        to_chain: toChain,
        amount: amount * 100000000 // Convert to satoshis for Bitcoin, will be handled by API
      })

      return {
        fromChain: response.from_chain,
        toChain: response.to_chain,
        amount: response.amount / 100000000,
        outputAmount: response.output_amount / 100000000,
        fees: {
          bridge: response.fees.bridge / 100000000,
          network: response.fees.network / 100000000,
          total: (response.fees.bridge + response.fees.network) / 100000000
        },
        estimatedTime: response.estimated_time,
        rate: response.rate
      }
    } catch (error) {
      throw this.handleError('BRIDGE_QUOTE_FETCH_FAILED', error)
    }
  }

  /**
   * Create a bridge deposit
   */
  async createDeposit(quote: BridgeQuote): Promise<BridgeDeposit> {
    try {
      const response = await this.makeRequest('/deposit', 'POST', {
        quote: {
          from_chain: quote.fromChain,
          to_chain: quote.toChain,
          amount: quote.amount * 100000000,
          output_amount: quote.outputAmount * 100000000
        }
      })

      return {
        id: response.deposit_id,
        quote,
        depositAddress: response.deposit_address,
        memo: response.memo,
        expiry: new Date(response.expiry * 1000),
        status: 'pending',
        createdAt: new Date(response.created_at * 1000)
      }
    } catch (error) {
      throw this.handleError('BRIDGE_DEPOSIT_CREATION_FAILED', error)
    }
  }

  /**
   * Create a bridge withdrawal
   */
  async createWithdrawal(
    amount: number,
    destination: string
  ): Promise<BridgeWithdrawal> {
    try {
      const response = await this.makeRequest('/withdrawal', 'POST', {
        amount: amount * 100000000,
        destination
      })

      return {
        id: response.withdrawal_id,
        amount,
        destination,
        status: 'pending',
        createdAt: new Date(response.created_at * 1000),
        fees: {
          bridge: response.fees.bridge / 100000000,
          network: response.fees.network / 100000000
        }
      }
    } catch (error) {
      throw this.handleError('BRIDGE_WITHDRAWAL_CREATION_FAILED', error)
    }
  }

  /**
   * Get bridge transaction details
   */
  async getTransaction(id: string): Promise<BridgeTransaction> {
    try {
      const response = await this.makeRequest(`/transactions/${id}`, 'GET')

      return {
        id: response.id,
        fromChain: response.from_chain,
        toChain: response.to_chain,
        amount: response.amount / 100000000,
        status: response.status,
        createdAt: new Date(response.created_at * 1000),
        completedAt: response.completed_at ? new Date(response.completed_at * 1000) : undefined,
        txHash: response.tx_hash,
        fees: {
          bridge: response.fees.bridge / 100000000,
          network: response.fees.network / 100000000
        }
      }
    } catch (error) {
      throw this.handleError('BRIDGE_TRANSACTION_FETCH_FAILED', error)
    }
  }

  /**
   * List bridge transactions for an address
   */
  async listTransactions(address: string): Promise<BridgeTransaction[]> {
    try {
      const response = await this.makeRequest(`/transactions?address=${address}`, 'GET')

      return response.transactions.map((tx: any) => ({
        id: tx.id,
        fromChain: tx.from_chain,
        toChain: tx.to_chain,
        amount: tx.amount / 100000000,
        status: tx.status,
        createdAt: new Date(tx.created_at * 1000),
        completedAt: tx.completed_at ? new Date(tx.completed_at * 1000) : undefined,
        txHash: tx.tx_hash,
        fees: {
          bridge: tx.fees.bridge / 100000000,
          network: tx.fees.network / 100000000
        }
      }))
    } catch (error) {
      throw this.handleError('BRIDGE_TRANSACTIONS_FETCH_FAILED', error)
    }
  }

  /**
   * Get bridge status and statistics
   */
  async getBridgeStatus(): Promise<{
    isOperational: boolean
    totalVolume24h: number
    averageFee: number
    processingTime: number
  }> {
    try {
      const response = await this.makeRequest('/status', 'GET')

      return {
        isOperational: response.is_operational,
        totalVolume24h: response.total_volume_24h / 100000000,
        averageFee: response.average_fee / 100000000,
        processingTime: response.processing_time
      }
    } catch (error) {
      throw this.handleError('BRIDGE_STATUS_FETCH_FAILED', error)
    }
  }

  /**
   * Validate a Bitcoin deposit address
   */
  async validateBitcoinAddress(address: string): Promise<boolean> {
    try {
      const response = await this.makeRequest('/validate/bitcoin-address', 'POST', {
        address
      })

      return response.is_valid
    } catch (error) {
      throw this.handleError('BITCOIN_ADDRESS_VALIDATION_FAILED', error)
    }
  }

  /**
   * Validate a Starknet address
   */
  async validateStarknetAddress(address: string): Promise<boolean> {
    try {
      const response = await this.makeRequest('/validate/starknet-address', 'POST', {
        address
      })

      return response.is_valid
    } catch (error) {
      throw this.handleError('STARKNET_ADDRESS_VALIDATION_FAILED', error)
    }
  }

  /**
   * Get supported networks and tokens
   */
  async getSupportedNetworks(): Promise<{
    bitcoin: {
      enabled: boolean
      minAmount: number
      maxAmount: number
      fee: number
    }
    starknet: {
      enabled: boolean
      minAmount: number
      maxAmount: number
      fee: number
      supportedTokens: Array<{
        address: string
        symbol: string
        decimals: number
      }>
    }
  }> {
    try {
      const response = await this.makeRequest('/networks', 'GET')

      return {
        bitcoin: {
          enabled: response.bitcoin.enabled,
          minAmount: response.bitcoin.min_amount / 100000000,
          maxAmount: response.bitcoin.max_amount / 100000000,
          fee: response.bitcoin.fee / 100000000
        },
        starknet: {
          enabled: response.starknet.enabled,
          minAmount: response.starknet.min_amount / 100000000,
          maxAmount: response.starknet.max_amount / 100000000,
          fee: response.starknet.fee / 100000000,
          supportedTokens: response.starknet.supported_tokens.map((token: any) => ({
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals
          }))
        }
      }
    } catch (error) {
      throw this.handleError('SUPPORTED_NETWORKS_FETCH_FAILED', error)
    }
  }

  // Private helper methods

  private async makeRequest(endpoint: string, method: string, data?: any): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ATOMIQ_API_KEY}`
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network request failed')
    }
  }

  private handleError(code: string, error: any): AtomiqError {
    return {
      code,
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error,
      timestamp: new Date()
    }
  }
}

// Factory function to create Bridge service instance
export function createBridgeService(
  apiUrl?: string,
  contractAddress?: string
): BridgeService {
  const defaultApiUrl = apiUrl || process.env.NEXT_PUBLIC_BRIDGE_API_URL || 'https://bridge.atomiq.com'
  const defaultContractAddress = contractAddress || process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS || ''

  if (!defaultContractAddress) {
    // Return mock service for development
    return new MockBridgeService()
  }

  return new BridgeServiceImplementation(defaultApiUrl, defaultContractAddress)
}

// Mock service for development and testing
export class MockBridgeService implements BridgeService {
  private mockTransactions: BridgeTransaction[] = []

  async getQuote(
    fromChain: 'bitcoin' | 'starknet',
    toChain: 'bitcoin' | 'starknet',
    amount: number
  ): Promise<BridgeQuote> {
    const bridgeFee = amount * 0.001 // 0.1% bridge fee
    const networkFee = fromChain === 'bitcoin' ? 0.00001 : 0.0001 // Different network fees
    const outputAmount = amount - bridgeFee - networkFee

    return {
      fromChain,
      toChain,
      amount,
      outputAmount,
      fees: {
        bridge: bridgeFee,
        network: networkFee,
        total: bridgeFee + networkFee
      },
      estimatedTime: fromChain === 'bitcoin' ? 1800 : 30, // 30 min for Bitcoin, 30 sec for Starknet
      rate: 0.9989 // Effective rate after fees
    }
  }

  async createDeposit(quote: BridgeQuote): Promise<BridgeDeposit> {
    const deposit: BridgeDeposit = {
      id: `deposit_${Date.now()}`,
      quote,
      depositAddress: quote.fromChain === 'bitcoin'
        ? `tb1q${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
        : `0x${Math.random().toString(16).substring(2, 66)}`,
      memo: quote.fromChain === 'bitcoin' ? `crossbtc_${Date.now()}` : undefined,
      expiry: new Date(Date.now() + 3600000), // 1 hour
      status: 'pending',
      createdAt: new Date()
    }

    return deposit
  }

  async createWithdrawal(
    amount: number,
    destination: string
  ): Promise<BridgeWithdrawal> {
    const withdrawal: BridgeWithdrawal = {
      id: `withdrawal_${Date.now()}`,
      amount,
      destination,
      status: 'pending',
      createdAt: new Date(),
      fees: {
        bridge: amount * 0.001,
        network: destination.startsWith('tb1') ? 0.00001 : 0.0001
      }
    }

    return withdrawal
  }

  async getTransaction(id: string): Promise<BridgeTransaction> {
    let tx = this.mockTransactions.find(t => t.id === id)

    if (!tx) {
      // Create a mock transaction if not found
      tx = {
        id,
        fromChain: 'bitcoin',
        toChain: 'starknet',
        amount: 0.1,
        status: 'pending',
        createdAt: new Date(),
        fees: {
          bridge: 0.0001,
          network: 0.00001
        }
      }
      this.mockTransactions.push(tx)
    }

    // Simulate status progression
    if (Math.random() > 0.7) {
      tx.status = 'confirming'
    }
    if (Math.random() > 0.9) {
      tx.status = 'completed'
      tx.completedAt = new Date()
      tx.txHash = `0x${Math.random().toString(16).substring(2, 66)}`
    }

    return tx
  }

  async listTransactions(address: string): Promise<BridgeTransaction[]> {
    return this.mockTransactions.slice(0, 10) // Return last 10 transactions
  }

  async validateBitcoinAddress(address: string): Promise<boolean> {
    // Simple Bitcoin address validation
    return /^(bc1|tb1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)
  }

  async validateStarknetAddress(address: string): Promise<boolean> {
    // Simple Starknet address validation
    return /^0x[a-fA-F0-9]{64}$/.test(address)
  }
}