import {
  StarknetService,
  StarknetAccount,
  StarknetBalance,
  StarknetTransaction,
  AtomiqError
} from '@/types/atomiq'
import { Account, Contract, RpcProvider, cairo, uint256 } from 'starknet'

export class StarknetServiceImplementation implements StarknetService {
  private provider: RpcProvider
  private network: 'mainnet' | 'testnet'

  constructor(rpcUrl: string, network: 'mainnet' | 'testnet' = 'testnet') {
    this.provider = new RpcProvider({ nodeUrl: rpcUrl })
    this.network = network
  }

  /**
   * Get Starknet account information
   */
  async getAccount(address: string): Promise<StarknetAccount> {
    try {
      const account = new Account(this.provider, address, '')

      // Determine account type based on contract class
      const contract = new Contract(
        account.accountContract.abi,
        address,
        this.provider
      )

      let type: 'argent' | 'braavos' | 'openzeppelin' = 'openzeppelin'

      // Try to identify account type by checking specific methods
      if (contract.functions['isValidSignature']) {
        type = 'argent'
      } else if (contract.functions['getOwner']) {
        type = 'braavos'
      }

      return {
        address,
        publicKey: '', // Would need to be derived from account implementation
        contractAddress: address,
        type
      }
    } catch (error) {
      throw this.handleError('STARKNET_ACCOUNT_FETCH_FAILED', error)
    }
  }

  /**
   * Get balance for a Starknet address
   */
  async getBalance(address: string, tokenAddress?: string): Promise<StarknetBalance> {
    try {
      // Default to ETH if no token address provided
      const ethAddress = tokenAddress || this.getEthAddress()

      // ERC20 ABI for balanceOf function
      const { abi } = await this.provider.getClassAt(ethAddress)
      const contract = new Contract(abi, ethAddress, this.provider)

      const balance = await contract.call('balanceOf', [address])
      const decimals = await contract.call('decimals')
      const symbol = await contract.call('symbol')

      const balanceBN = uint256.uint256ToBN(balance.low, balance.high)
      const decimalsValue = Number(decimals)
      const formattedBalance = Number(balanceBN) / Math.pow(10, decimalsValue)

      return {
        balance: balanceBN.toString(),
        decimals: decimalsValue,
        symbol: Array.isArray(symbol) ? symbol.join('') : symbol.toString(),
        formatted: formattedBalance.toString()
      }
    } catch (error) {
      throw this.handleError('STARKNET_BALANCE_FETCH_FAILED', error)
    }
  }

  /**
   * Send a transaction to Starknet
   */
  async sendTransaction(tx: any): Promise<string> {
    try {
      const account = new Account(this.provider, tx.address, tx.privateKey)

      const response = await account.execute(
        tx.calls,
        tx.calldata || [],
        {
          maxFee: tx.maxFee || 0,
          version: tx.version || '0x1'
        }
      )

      return response.transaction_hash
    } catch (error) {
      throw this.handleError('STARKNET_TRANSACTION_SEND_FAILED', error)
    }
  }

  /**
   * Get transaction details by hash
   */
  async getTransaction(hash: string): Promise<StarknetTransaction> {
    try {
      const receipt = await this.provider.getTransactionReceipt(hash)
      const transaction = await this.provider.getTransaction(hash)

      return {
        hash: receipt.transaction_hash,
        type: this.mapTransactionType(transaction.type),
        contract_address: transaction.contract_address,
        entry_point_selector: transaction.entry_point_selector,
        calldata: transaction.calldata,
        signature: transaction.signature,
        max_fee: transaction.max_fee?.toString() || '0',
        version: transaction.version?.toString() || '0x1',
        nonce: transaction.nonce?.toString() || '0',
        status: this.mapReceiptStatus(receipt.status),
        block_number: receipt.block_number,
        block_hash: receipt.block_hash,
        transaction_index: receipt.transaction_index,
        created_at: new Date().toISOString()
      }
    } catch (error) {
      throw this.handleError('STARKNET_TRANSACTION_FETCH_FAILED', error)
    }
  }

  /**
   * Wait for a transaction to be confirmed
   */
  async waitForTransaction(hash: string): Promise<StarknetTransaction> {
    try {
      let transaction: StarknetTransaction | null = null
      let attempts = 0
      const maxAttempts = 30 // 30 retries, 5 seconds each = 2.5 minutes max

      while (attempts < maxAttempts) {
        try {
          transaction = await this.getTransaction(hash)

          if (transaction.status === 'ACCEPTED_ON_L2' || transaction.status === 'ACCEPTED_ON_L1') {
            break
          }
        } catch (error) {
          // Transaction might not be ready yet
        }

        attempts++
        await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
      }

      if (!transaction) {
        throw new Error('Transaction not found after maximum attempts')
      }

      return transaction
    } catch (error) {
      throw this.handleError('STARKNET_TRANSACTION_WAIT_FAILED', error)
    }
  }

  /**
   * Get the current block number
   */
  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber()
    } catch (error) {
      throw this.handleError('STARKNET_BLOCK_NUMBER_FETCH_FAILED', error)
    }
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(tx: any): Promise<string> {
    try {
      const account = new Account(this.provider, tx.address, tx.privateKey)

      const feeEstimate = await account.estimateInvokeFee(
        tx.calls,
        {
          nonce: tx.nonce
        }
      )

      return feeEstimate.suggestedMaxFee.toString()
    } catch (error) {
      throw this.handleError('STARKNET_GAS_ESTIMATE_FAILED', error)
    }
  }

  // Private helper methods

  private getEthAddress(): string {
    return this.network === 'mainnet'
      ? '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' // ETH on mainnet
      : '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7' // ETH on testnet (same address)
  }

  private mapTransactionType(type: string): 'INVOKE' | 'DECLARE' | 'DEPLOY' | 'DEPLOY_ACCOUNT' {
    switch (type) {
      case 'INVOKE':
        return 'INVOKE'
      case 'DECLARE':
        return 'DECLARE'
      case 'DEPLOY':
        return 'DEPLOY'
      case 'DEPLOY_ACCOUNT':
        return 'DEPLOY_ACCOUNT'
      default:
        return 'INVOKE'
    }
  }

  private mapReceiptStatus(status: any): 'RECEIVED' | 'PENDING' | 'ACCEPTED_ON_L2' | 'ACCEPTED_ON_L1' | 'REJECTED' {
    switch (status) {
      case 'RECEIVED':
        return 'RECEIVED'
      case 'PENDING':
        return 'PENDING'
      case 'ACCEPTED_ON_L2':
        return 'ACCEPTED_ON_L2'
      case 'ACCEPTED_ON_L1':
        return 'ACCEPTED_ON_L1'
      case 'REJECTED':
        return 'REJECTED'
      default:
        return 'RECEIVED'
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

// Factory function to create Starknet service instance
export function createStarknetService(
  rpcUrl?: string,
  network?: 'mainnet' | 'testnet'
): StarknetService {
  const defaultRpcUrl = rpcUrl || process.env.NEXT_PUBLIC_STARKNET_RPC_URL || 'https://starknet-testnet.infura.io/v3/your_infura_key'
  const defaultNetwork = network || (process.env.NEXT_PUBLIC_STARKNET_NETWORK as 'mainnet' | 'testnet') || 'testnet'

  return new StarknetServiceImplementation(defaultRpcUrl, defaultNetwork)
}

// Mock service for development and testing
export class MockStarknetService implements StarknetService {
  private mockTransactions: StarknetTransaction[] = []

  async getAccount(address: string): Promise<StarknetAccount> {
    return {
      address,
      publicKey: `0x${Math.random().toString(16).substring(2, 66)}`,
      contractAddress: address,
      type: 'argent'
    }
  }

  async getBalance(address: string, tokenAddress?: string): Promise<StarknetBalance> {
    const balance = Math.random() * 1000
    return {
      balance: (balance * Math.pow(10, 18)).toString(),
      decimals: 18,
      symbol: 'ETH',
      formatted: balance.toFixed(6)
    }
  }

  async sendTransaction(tx: any): Promise<string> {
    const hash = `0x${Math.random().toString(16).substring(2, 66)}`

    const mockTx: StarknetTransaction = {
      hash,
      type: 'INVOKE',
      contract_address: tx.address,
      entry_point_selector: `0x${Math.random().toString(16).substring(2, 66)}`,
      calldata: tx.calldata || [],
      signature: [`0x${Math.random().toString(16).substring(2, 66)}`],
      max_fee: tx.maxFee || '1000000000000000',
      version: '0x1',
      nonce: Math.floor(Math.random() * 100).toString(),
      status: 'PENDING',
      created_at: new Date().toISOString()
    }

    this.mockTransactions.push(mockTx)
    return hash
  }

  async getTransaction(hash: string): Promise<StarknetTransaction> {
    const tx = this.mockTransactions.find(t => t.hash === hash)
    if (!tx) {
      throw new Error('Transaction not found')
    }

    // Simulate status updates
    if (Math.random() > 0.5) {
      tx.status = 'ACCEPTED_ON_L2'
      tx.block_number = Math.floor(Math.random() * 100000)
    }

    return tx
  }

  async waitForTransaction(hash: string): Promise<StarknetTransaction> {
    const tx = await this.getTransaction(hash)
    tx.status = 'ACCEPTED_ON_L2'
    return tx
  }
}