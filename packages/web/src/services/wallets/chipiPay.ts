/**
 * Chipi Pay Integration Service
 * Provides instant payment and cross-chain bridge functionality
 */

export interface ChipiPaymentRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  asset: 'BTC' | 'BTC_LN' | 'STARKNET_BTC';
  speed: 'instant' | 'normal' | 'economy';
  message?: string;
}

export interface ChipiPaymentResponse {
  paymentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fromChain: string;
  toChain: string;
  estimatedTime: number; // seconds
  fee: {
    asset: string;
    amount: number;
  };
  transactionHash?: string;
  lightningInvoice?: string;
}

export interface ChipiBalance {
  asset: string;
  balance: number;
  available: number;
  locked: number;
}

export interface ChipiBridgeRoute {
  fromChain: string;
  toChain: string;
  asset: string;
  available: boolean;
  estimatedTime: number;
  fee: {
    amount: number;
    asset: string;
  };
  minAmount: number;
  maxAmount: number;
}

class ChipiPayService {
  private apiKey: string;
  private baseUrl: string;
  private isInitialized: boolean = false;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_CHIPI_API_KEY || 'demo_key';
    this.baseUrl = process.env.NEXT_PUBLIC_CHIPI_API_URL || 'https://api.chipi.io/v1';
  }

  /**
   * Initialize Chipi Pay service
   */
  public async initialize(): Promise<void> {
    try {
      // Test API connectivity
      const response = await this.makeRequest('/health', 'GET');

      if (response.status === 'ok') {
        this.isInitialized = true;
        console.log('Chipi Pay service initialized successfully');
      } else {
        throw new Error('Chipi Pay service health check failed');
      }
    } catch (error) {
      console.error('Chipi Pay initialization error:', error);
      // For demo purposes, we'll continue without throwing
      this.isInitialized = true;
    }
  }

  /**
   * Check if service is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get supported assets and chains
   */
  public async getSupportedAssets(): Promise<any> {
    try {
      const response = await this.makeRequest('/assets', 'GET');
      return response;
    } catch (error) {
      console.error('Failed to get supported assets:', error);
      return this.getMockAssets();
    }
  }

  /**
   * Get account balances
   */
  public async getBalances(address: string): Promise<ChipiBalance[]> {
    try {
      const response = await this.makeRequest(`/balances/${address}`, 'GET');
      return response.balances || [];
    } catch (error) {
      console.error('Failed to get balances:', error);
      return this.getMockBalances();
    }
  }

  /**
   * Get available bridge routes
   */
  public async getBridgeRoutes(
    fromChain: string,
    toChain: string,
    asset: string
  ): Promise<ChipiBridgeRoute[]> {
    try {
      const response = await this.makeRequest(
        `/routes?from=${fromChain}&to=${toChain}&asset=${asset}`,
        'GET'
      );
      return response.routes || [];
    } catch (error) {
      console.error('Failed to get bridge routes:', error);
      return this.getMockRoutes();
    }
  }

  /**
   * Create payment/bridge request
   */
  public async createPayment(
    request: ChipiPaymentRequest
  ): Promise<ChipiPaymentResponse> {
    try {
      const response = await this.makeRequest('/payments', 'POST', request);
      return response;
    } catch (error) {
      console.error('Failed to create payment:', error);
      throw new Error(`Payment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payment status
   */
  public async getPaymentStatus(paymentId: string): Promise<ChipiPaymentResponse> {
    try {
      const response = await this.makeRequest(`/payments/${paymentId}`, 'GET');
      return response;
    } catch (error) {
      console.error('Failed to get payment status:', error);
      throw new Error(`Failed to get payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create Lightning invoice
   */
  public async createLightningInvoice(
    amount: number,
    memo?: string
  ): Promise<{ invoice: string; paymentHash: string }> {
    try {
      const response = await this.makeRequest('/invoices', 'POST', {
        amount,
        memo: memo || `CrossBTC vault deposit - ${Date.now()}`,
        expiry: 3600, // 1 hour
      });
      return response;
    } catch (error) {
      console.error('Failed to create Lightning invoice:', error);
      throw new Error(`Invoice creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pay Lightning invoice
   */
  public async payLightningInvoice(
    invoice: string,
    amount?: number
  ): Promise<{ preimage: string; paymentHash: string; status: string }> {
    try {
      const response = await this.makeRequest('/invoices/pay', 'POST', {
        invoice,
        amount,
      });
      return response;
    } catch (error) {
      console.error('Failed to pay Lightning invoice:', error);
      throw new Error(`Lightning payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction history
   */
  public async getTransactionHistory(address: string): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/transactions/${address}`, 'GET');
      return response.transactions || [];
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return this.getMockTransactions();
    }
  }

  /**
   * Make HTTP request to Chipi API
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Mock data for demo purposes
   */
  private getMockAssets() {
    return {
      assets: [
        { symbol: 'BTC', name: 'Bitcoin', chains: ['bitcoin', 'lightning', 'starknet'] },
        { symbol: 'STARKNET_BTC', name: 'Wrapped Bitcoin on Starknet', chains: ['starknet'] },
      ],
      chains: [
        { id: 'bitcoin', name: 'Bitcoin', type: 'L1' },
        { id: 'lightning', name: 'Lightning Network', type: 'L2' },
        { id: 'starknet', name: 'Starknet', type: 'L2' },
      ],
    };
  }

  private getMockBalances(): ChipiBalance[] {
    return [
      {
        asset: 'BTC',
        balance: 0.52500000,
        available: 0.50000000,
        locked: 0.02500000,
      },
      {
        asset: 'STARKNET_BTC',
        balance: 0.30000000,
        available: 0.30000000,
        locked: 0.00000000,
      },
    ];
  }

  private getMockRoutes(): ChipiBridgeRoute[] {
    return [
      {
        fromChain: 'bitcoin',
        toChain: 'starknet',
        asset: 'BTC',
        available: true,
        estimatedTime: 300, // 5 minutes
        fee: {
          amount: 0.0001,
          asset: 'BTC',
        },
        minAmount: 0.001,
        maxAmount: 10,
      },
      {
        fromChain: 'starknet',
        toChain: 'bitcoin',
        asset: 'STARKNET_BTC',
        available: true,
        estimatedTime: 600, // 10 minutes
        fee: {
          amount: 0.0002,
          asset: 'BTC',
        },
        minAmount: 0.001,
        maxAmount: 10,
      },
      {
        fromChain: 'bitcoin',
        toChain: 'lightning',
        asset: 'BTC',
        available: true,
        estimatedTime: 10, // 10 seconds
        fee: {
          amount: 0.00001,
          asset: 'BTC',
        },
        minAmount: 0.00001,
        maxAmount: 0.1,
      },
    ];
  }

  private getMockTransactions() {
    return [
      {
        id: '1',
        type: 'bridge',
        fromChain: 'bitcoin',
        toChain: 'starknet',
        asset: 'BTC',
        amount: 0.10000000,
        status: 'completed',
        timestamp: new Date('2024-01-15'),
        fee: 0.0001,
        transactionHash: '0x123...456',
      },
      {
        id: '2',
        type: 'payment',
        fromChain: 'lightning',
        toChain: 'bitcoin',
        asset: 'BTC',
        amount: 0.02500000,
        status: 'completed',
        timestamp: new Date('2024-01-14'),
        fee: 0.00001,
        lightningInvoice: 'lnbc100n1p3...xyz',
      },
    ];
  }
}

// Create singleton instance
export const chipiPay = new ChipiPayService();