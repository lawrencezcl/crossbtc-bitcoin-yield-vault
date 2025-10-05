import {
  LightningService,
  LightningNodeInfo,
  LightningChannel,
  LightningPayment,
  LightningInvoice,
  AtomiqError
} from '@/types/atomiq'

export class LightningServiceImplementation implements LightningService {
  private rpcUrl: string
  private macaroon: string
  private cert: string
  private isConnected: boolean = false

  constructor(rpcUrl: string, macaroon: string, cert: string) {
    this.rpcUrl = rpcUrl
    this.macaroon = macaroon
    this.cert = cert
  }

  /**
   * Get Lightning node information
   */
  async getNodeInfo(): Promise<LightningNodeInfo> {
    try {
      const response = await this.makeRequest('/v1/getinfo', 'GET')
      return {
        identity_pubkey: response.identity_pubkey,
        alias: response.alias,
        color: response.color,
        num_peers: response.num_peers,
        num_pending_channels: response.num_pending_channels,
        num_active_channels: response.num_active_channels,
        num_inactive_channels: response.num_inactive_channels,
        block_height: response.block_height,
        block_hash: response.block_hash,
        best_header_timestamp: response.best_header_timestamp,
        synced_to_chain: response.synced_to_chain,
        testnet: response.chains.some((chain: any) => chain.chain === 'bitcoin' && chain.network === 'testnet'),
        chains: response.chains
      }
    } catch (error) {
      throw this.handleError('LIGHTNING_NODE_INFO_FAILED', error)
    }
  }

  /**
   * Get Lightning wallet balance
   */
  async getBalance(): Promise<{ balance: number; pending_balance: number }> {
    try {
      const response = await this.makeRequest('/v1/balance/blockchain', 'GET')
      return {
        balance: response.confirmed_balance / 100000000, // Convert satoshis to BTC
        pending_balance: response.unconfirmed_balance / 100000000
      }
    } catch (error) {
      throw this.handleError('LIGHTNING_BALANCE_FETCH_FAILED', error)
    }
  }

  /**
   * Create a Lightning invoice for receiving payments
   */
  async createInvoice(amount: number, memo?: string): Promise<LightningInvoice> {
    try {
      const satoshis = Math.floor(amount * 100000000)
      const payload = {
        value: satoshis,
        memo: memo || 'CrossBTC deposit',
        expiry: 3600, // 1 hour expiry
        private: false
      }

      const response = await this.makeRequest('/v1/invoices', 'POST', payload)

      return {
        paymentHash: response.r_hash,
        bolt11: response.payment_request,
        amount: satoshis / 100000000,
        timestamp: new Date(response.creation_date * 1000),
        expiry: new Date((response.creation_date + response.expiry) * 1000),
        memo: response.memo,
        status: response.settled ? 'paid' : 'pending'
      }
    } catch (error) {
      throw this.handleError('LIGHTNING_INVOICE_CREATION_FAILED', error)
    }
  }

  /**
   * Pay a Lightning invoice
   */
  async payInvoice(invoice: string): Promise<LightningPayment> {
    try {
      const payload = {
        payment_request: invoice,
        fee_limit: { fixed: Math.floor(0.0001 * 100000000) } // 0.0001 BTC fee limit
      }

      const response = await this.makeRequest('/v2/router/send', 'POST', payload)
      const payment = response.payment

      return {
        payment_hash: payment.payment_hash,
        value: payment.value,
        creation_date: new Date(payment.creation_date * 1000).toISOString(),
        fee: payment.fee,
        payment_preimage: payment.payment_preimage,
        value_sat: payment.value_sat,
        value_msat: payment.value_msat,
        payment_request: payment.payment_request,
        status: payment.status,
        fee_sat: payment.fee_sat,
        fee_msat: payment.fee_msat,
        creation_time_ns: payment.creation_time_ns,
        htlcs: payment.htlcs || []
      }
    } catch (error) {
      throw this.handleError('LIGHTNING_PAYMENT_FAILED', error)
    }
  }

  /**
   * Get invoice details by payment hash
   */
  async getInvoice(paymentHash: string): Promise<LightningInvoice> {
    try {
      const response = await this.makeRequest(`/v1/invoice/${paymentHash}`, 'GET')

      return {
        paymentHash: response.r_hash,
        bolt11: response.payment_request,
        amount: response.value / 100000000,
        timestamp: new Date(response.creation_date * 1000),
        expiry: new Date((response.creation_date + response.expiry) * 1000),
        memo: response.memo,
        status: response.settled ? 'paid' : (response.canceled ? 'expired' : 'pending')
      }
    } catch (error) {
      throw this.handleError('LIGHTNING_INVOICE_FETCH_FAILED', error)
    }
  }

  /**
   * Get list of Lightning channels
   */
  async getChannels(): Promise<LightningChannel[]> {
    try {
      const response = await this.makeRequest('/v1/channels', 'GET')
      return response.channels.map((channel: any) => ({
        active: channel.active,
        remote_pubkey: channel.remote_pubkey,
        channel_point: channel.channel_point,
        chan_id: channel.chan_id,
        capacity: channel.capacity,
        local_balance: channel.local_balance,
        remote_balance: channel.remote_balance,
        commit_fee: channel.commit_fee,
        commit_weight: channel.commit_weight,
        fee_per_kw: channel.fee_per_kw,
        unsettled_balance: channel.unsettled_balance,
        total_satoshis_sent: channel.total_satoshis_sent,
        total_satoshis_received: channel.total_satoshis_received,
        num_updates: channel.num_updates.toString(),
        pending_htlcs: channel.pending_htlcs || []
      }))
    } catch (error) {
      throw this.handleError('LIGHTNING_CHANNELS_FETCH_FAILED', error)
    }
  }

  /**
   * List all payments
   */
  async listPayments(): Promise<LightningPayment[]> {
    try {
      const response = await this.makeRequest('/v1/payments', 'GET')
      return response.payments.map((payment: any) => ({
        payment_hash: payment.payment_hash,
        value: payment.value,
        creation_date: new Date(payment.creation_date * 1000).toISOString(),
        fee: payment.fee,
        payment_preimage: payment.payment_preimage,
        value_sat: payment.value_sat,
        value_msat: payment.value_msat,
        payment_request: payment.payment_request,
        status: payment.status,
        fee_sat: payment.fee_sat,
        fee_msat: payment.fee_msat,
        creation_time_ns: payment.creation_time_ns,
        htlcs: payment.htlcs || []
      }))
    } catch (error) {
      throw this.handleError('LIGHTNING_PAYMENTS_FETCH_FAILED', error)
    }
  }

  /**
   * Check connection status
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.getNodeInfo()
      this.isConnected = true
      return true
    } catch (error) {
      this.isConnected = false
      return false
    }
  }

  /**
   * Open a new channel with another node
   */
  async openChannel(
    nodePubkey: string,
    amount: number,
    privateChannel: boolean = false
  ): Promise<string> {
    try {
      const satoshis = Math.floor(amount * 100000000)
      const payload = {
        node_pubkey_string: nodePubkey,
        local_funding_amount: satoshis,
        private: privateChannel,
        target_conf: 2,
        sat_per_byte: 1
      }

      const response = await this.makeRequest('/v1/channels', 'POST', payload)
      return response.funding_txid_str
    } catch (error) {
      throw this.handleError('LIGHTNING_CHANNEL_OPEN_FAILED', error)
    }
  }

  /**
   * Close an existing channel
   */
  async closeChannel(
    channelPoint: string,
    forceClose: boolean = false
  ): Promise<string> {
    try {
      const [fundingTxid, outputIndex] = channelPoint.split(':')
      const payload = {
        channel_point: {
          funding_txid_str: fundingTxid,
          output_index: parseInt(outputIndex)
        },
        force: forceClose
      }

      const response = await this.makeRequest('/v1/channels/close', 'POST', payload)
      return response.closing_txid
    } catch (error) {
      throw this.handleError('LIGHTNING_CHANNEL_CLOSE_FAILED', error)
    }
  }

  // Private helper methods

  private async makeRequest(endpoint: string, method: string, data?: any): Promise<any> {
    const url = `${this.rpcUrl}${endpoint}`
    const headers = {
      'Grpc-Metadata-macaroon': this.macaroon,
      'Content-Type': 'application/json'
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

// Factory function to create Lightning service instance
export function createLightningService(
  rpcUrl?: string,
  macaroon?: string,
  cert?: string
): LightningService {
  const defaultRpcUrl = rpcUrl || process.env.NEXT_PUBLIC_LIGHTNING_RPC_URL || ''
  const defaultMacaroon = macaroon || process.env.NEXT_PUBLIC_LIGHTNING_MACAROON || ''
  const defaultCert = cert || process.env.NEXT_PUBLIC_LIGHTNING_CERT || ''

  if (!defaultRpcUrl || !defaultMacaroon) {
    // Return mock service for development
    return new MockLightningService()
  }

  return new LightningServiceImplementation(defaultRpcUrl, defaultMacaroon, defaultCert)
}

// Mock service for development and testing
export class MockLightningService implements LightningService {
  private mockInvoices: LightningInvoice[] = []
  private mockPayments: LightningPayment[] = []

  async getNodeInfo(): Promise<LightningNodeInfo> {
    return {
      identity_pubkey: `0x${Math.random().toString(16).substring(2, 66)}`,
      alias: 'CrossBTC-Lightning-Node',
      color: '#f7931a',
      num_peers: Math.floor(Math.random() * 10),
      num_pending_channels: Math.floor(Math.random() * 3),
      num_active_channels: Math.floor(Math.random() * 5),
      num_inactive_channels: Math.floor(Math.random() * 2),
      block_height: 1234567,
      block_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      best_header_timestamp: new Date().toISOString(),
      synced_to_chain: true,
      testnet: true,
      chains: [{ chain: 'bitcoin', network: 'testnet' }]
    }
  }

  async getBalance(): Promise<{ balance: number; pending_balance: number }> {
    return {
      balance: Math.random() * 5,
      pending_balance: Math.random() * 0.5
    }
  }

  async createInvoice(amount: number, memo?: string): Promise<LightningInvoice> {
    const invoice: LightningInvoice = {
      paymentHash: `invoice_${Date.now()}`,
      bolt11: `lnbcrt1${Math.random().toString(36).substring(2)}`,
      amount,
      timestamp: new Date(),
      expiry: new Date(Date.now() + 3600000), // 1 hour
      memo: memo || 'CrossBTC deposit',
      status: 'pending'
    }

    this.mockInvoices.push(invoice)
    return invoice
  }

  async payInvoice(invoice: string): Promise<LightningPayment> {
    const payment: LightningPayment = {
      payment_hash: `payment_${Date.now()}`,
      value: Math.floor(Math.random() * 100000000), // Random amount in satoshis
      creation_date: new Date().toISOString(),
      fee: Math.floor(Math.random() * 1000), // Random fee in satoshis
      payment_preimage: Math.random().toString(16).substring(2, 66),
      value_sat: Math.floor(Math.random() * 100000000),
      value_msat: `${Math.floor(Math.random() * 100000000)}000`,
      payment_request: invoice,
      status: 'SUCCEEDED',
      fee_sat: Math.floor(Math.random() * 1000),
      fee_msat: `${Math.floor(Math.random() * 1000)}000`,
      creation_time_ns: `${Date.now() * 1000000}`,
      htlcs: []
    }

    this.mockPayments.push(payment)
    return payment
  }

  async getInvoice(paymentHash: string): Promise<LightningInvoice> {
    const invoice = this.mockInvoices.find(inv => inv.paymentHash === paymentHash)
    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // Simulate random status updates
    if (Math.random() > 0.5) {
      invoice.status = 'paid'
    }

    return invoice
  }

  async getChannels(): Promise<LightningChannel[]> {
    const numChannels = Math.floor(Math.random() * 5) + 1
    return Array.from({ length: numChannels }, (_, i) => ({
      active: Math.random() > 0.2,
      remote_pubkey: `0x${Math.random().toString(16).substring(2, 66)}`,
      channel_point: `${Math.random().toString(16).substring(2, 66)}:${i}`,
      chan_id: Math.floor(Math.random() * 1000000),
      capacity: Math.floor(Math.random() * 1000000000),
      local_balance: Math.floor(Math.random() * 500000000),
      remote_balance: Math.floor(Math.random() * 500000000),
      commit_fee: Math.floor(Math.random() * 10000),
      commit_weight: Math.floor(Math.random() * 1000),
      fee_per_kw: Math.floor(Math.random() * 1000),
      unsettled_balance: Math.floor(Math.random() * 100000),
      total_satoshis_sent: Math.floor(Math.random() * 100000000),
      total_satoshis_received: Math.floor(Math.random() * 100000000),
      num_updates: Math.floor(Math.random() * 1000).toString(),
      pending_htlcs: []
    }))
  }

  async listPayments(): Promise<LightningPayment[]> {
    return this.mockPayments
  }
}