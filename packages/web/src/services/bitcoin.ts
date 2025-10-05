import {
  BitcoinService,
  BitcoinAddress,
  BitcoinBalance,
  BitcoinTransaction,
  AtomiqError,
  ApiResponse
} from '@/types/atomiq'
import * as bitcoin from 'bitcoinjs-lib'

export class BitcoinServiceImplementation implements BitcoinService {
  private rpcUrl: string
  private network: bitcoin.Network
  private addressWatchers: Map<string, (tx: BitcoinTransaction) => void> = new Map()

  constructor(rpcUrl: string, network: 'mainnet' | 'testnet' = 'testnet') {
    this.rpcUrl = rpcUrl
    this.network = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet
  }

  /**
   * Generate a new Bitcoin address for deposits
   */
  async generateAddress(): Promise<BitcoinAddress> {
    try {
      const keyPair = bitcoin.ECPair.makeRandom({ network: this.network })
      const { address } = bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: this.network
      })

      if (!address) {
        throw new Error('Failed to generate Bitcoin address')
      }

      return {
        address,
        publicKey: keyPair.publicKey.toString('hex'),
        privateKey: keyPair.toWIF(),
        path: `m/84'/1'/0'/0/0` // Standard BIP84 path for P2WPKH
      }
    } catch (error) {
      throw this.handleError('BITCOIN_ADDRESS_GENERATION_FAILED', error)
    }
  }

  /**
   * Get the balance of a Bitcoin address
   */
  async getBalance(address: string): Promise<BitcoinBalance> {
    try {
      const response = await fetch(`${this.rpcUrl}/address/${address}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const chain_stats = data.chain_stats || {}
      const mempool_stats = data.mempool_stats || {}

      const confirmed = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum
      const unconfirmed = mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum
      const total = confirmed + unconfirmed

      return {
        confirmed: confirmed / 100000000, // Convert satoshis to BTC
        unconfirmed: unconfirmed / 100000000,
        total: total / 100000000
      }
    } catch (error) {
      throw this.handleError('BITCOIN_BALANCE_FETCH_FAILED', error)
    }
  }

  /**
   * Create a Bitcoin transaction
   */
  async createTransaction(
    to: string,
    amount: number,
    fromAddress?: string
  ): Promise<BitcoinTransaction> {
    try {
      if (!fromAddress) {
        throw new Error('Source address is required for creating transactions')
      }

      // Get UTXOs for the source address
      const utxos = await this.getUTXOs(fromAddress)

      // Calculate required amount including fees
      const satoshis = Math.floor(amount * 100000000)
      const fee = Math.ceil(this.estimateFee(utxos.length, 2) * 100000000)
      const totalRequired = satoshis + fee

      // Select UTXOs
      const selectedUTXOs = this.selectUTXOs(utxos, totalRequired)
      if (selectedUTXOs.length === 0) {
        throw new Error('Insufficient balance')
      }

      // Create PSBT (Partially Signed Bitcoin Transaction)
      const psbt = new bitcoin.Psbt({ network: this.network })

      // Add inputs
      for (const utxo of selectedUTXOs) {
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: Buffer.from(utxo.scriptPubKey, 'hex'),
            value: utxo.value
          }
        })
      }

      // Add output
      psbt.addOutput({
        address: to,
        value: satoshis
      })

      // Add change output if needed
      const totalInput = selectedUTXOs.reduce((sum, utxo) => sum + utxo.value, 0)
      const change = totalInput - totalRequired
      if (change > 546) { // Dust limit
        psbt.addOutput({
          address: fromAddress,
          value: change
        })
      }

      // Calculate and set fee
      const actualFee = totalInput - satoshis - (change > 546 ? change : 0)
      const virtualSize = Math.ceil(psbt.extractTransaction().virtualSize() / 4) * 4

      return {
        txid: '', // Will be set after broadcasting
        version: psbt.tx.getVersion(),
        locktime: psbt.tx.locktime,
        vin: selectedUTXOs.map(utxo => ({
          txid: utxo.txid,
          vout: utxo.vout,
          scriptsig: '',
          scriptsig_asm: '',
          prevout: {
            scriptpubkey: utxo.scriptPubKey,
            scriptpubkey_asm: '',
            scriptpubkey_type: 'witness_v0_keyhash',
            value: utxo.value
          }
        })),
        vout: psbt.tx.outs.map(output => ({
          scriptpubkey: output.script.toString('hex'),
          scriptpubkey_asm: '',
          scriptpubkey_type: 'witness_v0_keyhash',
          value: output.value
        })),
        size: virtualSize,
        fee: actualFee / 100000000,
        status: {
          confirmed: false
        }
      }
    } catch (error) {
      throw this.handleError('BITCOIN_TRANSACTION_CREATION_FAILED', error)
    }
  }

  /**
   * Send a signed Bitcoin transaction
   */
  async sendTransaction(transaction: BitcoinTransaction): Promise<string> {
    try {
      // In a real implementation, you would sign the transaction here
      // For now, we'll simulate the broadcast

      const response = await fetch(`${this.rpcUrl}/tx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tx: transaction })
      })

      if (!response.ok) {
        throw new Error(`Transaction broadcast failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.txid
    } catch (error) {
      throw this.handleError('BITCOIN_TRANSACTION_SEND_FAILED', error)
    }
  }

  /**
   * Get transaction details by TXID
   */
  async getTransaction(txid: string): Promise<BitcoinTransaction> {
    try {
      const response = await fetch(`${this.rpcUrl}/tx/${txid}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        txid: data.txid,
        version: data.version,
        locktime: data.locktime,
        vin: data.vin.map((input: any) => ({
          txid: input.txid,
          vout: input.vout,
          scriptsig: input.scriptsig || '',
          scriptsig_asm: input.scriptsig_asm || '',
          witness: input.witness || [],
          prevout: input.prevout
        })),
        vout: data.vout.map((output: any) => ({
          scriptpubkey: output.scriptpubkey,
          scriptpubkey_asm: output.scriptpubkey_asm,
          scriptpubkey_type: output.scriptpubkey_type,
          value: output.value
        })),
        size: data.size,
        fee: data.fee ? data.fee / 100000000 : 0,
        status: {
          confirmed: data.status?.confirmed || false,
          block_height: data.status?.block_height,
          block_hash: data.status?.block_hash,
          block_time: data.status?.block_time
        }
      }
    } catch (error) {
      throw this.handleError('BITCOIN_TRANSACTION_FETCH_FAILED', error)
    }
  }

  /**
   * Monitor an address for new transactions
   */
  monitorAddress(address: string, callback: (tx: BitcoinTransaction) => void): void {
    this.addressWatchers.set(address, callback)

    // Start monitoring in the background
    this.startAddressMonitoring(address, callback)
  }

  /**
   * Stop monitoring an address
   */
  stopMonitoringAddress(address: string): void {
    this.addressWatchers.delete(address)
  }

  // Private helper methods

  private async getUTXOs(address: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.rpcUrl}/address/${address}/utxo`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data || []
    } catch (error) {
      throw this.handleError('BITCOIN_UTXO_FETCH_FAILED', error)
    }
  }

  private selectUTXOs(utxos: any[], amount: number): any[] {
    let selected: any[] = []
    let total = 0

    // Sort UTXOs by amount (descending) for efficiency
    const sortedUTXOs = utxos.sort((a, b) => b.value - a.value)

    for (const utxo of sortedUTXOs) {
      selected.push(utxo)
      total += utxo.value

      if (total >= amount) {
        break
      }
    }

    return total >= amount ? selected : []
  }

  private estimateFee(inputs: number, outputs: number): number {
    // Simple fee estimation (in BTC per byte)
    // In production, use a proper fee estimation API
    const baseSize = 10 + inputs * 148 + outputs * 34
    const witnessSize = inputs * 27 + inputs * 1 + 2
    const virtualSize = Math.ceil((baseSize * 3 + witnessSize) / 4)

    // Assume 1 sat/byte for testnet, adjust based on network conditions
    return virtualSize * 0.00000001
  }

  private async startAddressMonitoring(
    address: string,
    callback: (tx: BitcoinTransaction) => void
  ): Promise<void> {
    const checkInterval = 30000 // 30 seconds

    const checkTransactions = async () => {
      if (!this.addressWatchers.has(address)) {
        return // Stop monitoring if no longer watching
      }

      try {
        const response = await fetch(`${this.rpcUrl}/address/${address}/txs`)
        if (response.ok) {
          const transactions = await response.json()

          // Process new transactions (implementation depends on specific requirements)
          // This is a simplified version
          for (const txData of transactions) {
            const tx = await this.getTransaction(txData.txid)
            callback(tx)
          }
        }
      } catch (error) {
        console.error('Error monitoring address:', error)
      }

      // Schedule next check
      setTimeout(checkTransactions, checkInterval)
    }

    // Start monitoring
    setTimeout(checkTransactions, checkInterval)
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

// Factory function to create Bitcoin service instance
export function createBitcoinService(
  rpcUrl?: string,
  network?: 'mainnet' | 'testnet'
): BitcoinService {
  const defaultRpcUrl = rpcUrl || process.env.NEXT_PUBLIC_BITCOIN_RPC_URL || 'https://blockstream.info/testnet/api'
  const defaultNetwork = network || (process.env.NEXT_PUBLIC_BITCOIN_NETWORK as 'mainnet' | 'testnet') || 'testnet'

  return new BitcoinServiceImplementation(defaultRpcUrl, defaultNetwork)
}

// Mock service for development and testing
export class MockBitcoinService implements BitcoinService {
  private mockAddresses: BitcoinAddress[] = []

  async generateAddress(): Promise<BitcoinAddress> {
    const address = {
      address: `tb1q${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      publicKey: `0x${Math.random().toString(16).substring(2, 66)}`,
      privateKey: `L${Math.random().toString(36).substring(2, 52)}`,
      path: `m/84'/1'/0'/0/${this.mockAddresses.length}`
    }

    this.mockAddresses.push(address)
    return address
  }

  async getBalance(address: string): Promise<BitcoinBalance> {
    return {
      confirmed: Math.random() * 10,
      unconfirmed: Math.random() * 0.1,
      total: Math.random() * 10.1
    }
  }

  async createTransaction(to: string, amount: number, fromAddress?: string): Promise<BitcoinTransaction> {
    return {
      txid: `mock_tx_${Date.now()}`,
      version: 1,
      locktime: 0,
      vin: [],
      vout: [{
        scriptpubkey: '0014' + Math.random().toString(16).substring(2, 42),
        scriptpubkey_asm: '',
        scriptpubkey_type: 'witness_v0_keyhash',
        value: amount * 100000000
      }],
      size: 250,
      fee: 0.00001,
      status: { confirmed: false }
    }
  }

  async sendTransaction(transaction: BitcoinTransaction): Promise<string> {
    return transaction.txid
  }

  async getTransaction(txid: string): Promise<BitcoinTransaction> {
    return {
      txid,
      version: 1,
      locktime: 0,
      vin: [],
      vout: [{
        scriptpubkey: '0014' + Math.random().toString(16).substring(2, 42),
        scriptpubkey_asm: '',
        scriptpubkey_type: 'witness_v0_keyhash',
        value: 100000000
      }],
      size: 250,
      fee: 0.00001,
      status: { confirmed: Math.random() > 0.5 }
    }
  }

  monitorAddress(address: string, callback: (tx: BitcoinTransaction) => void): void {
    // Mock monitoring - generate a fake transaction every 30 seconds
    setInterval(async () => {
      const mockTx = await this.getTransaction(`mock_tx_${Date.now()}`)
      callback(mockTx)
    }, 30000)
  }
}