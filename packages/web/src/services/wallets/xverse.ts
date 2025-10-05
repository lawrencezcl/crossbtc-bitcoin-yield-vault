/**
 * Xverse Wallet Integration Service
 * Provides Bitcoin wallet functionality through Xverse browser extension and mobile app
 */

export interface XverseWalletAccount {
  address: string;
  publicKey: string;
  balance: number;
  network: 'mainnet' | 'testnet';
}

export interface XverseTransactionParams {
  toAddress: string;
  amount: number;
  feeRate?: number;
  message?: string;
}

export interface XverseSignedTransaction {
  txHex: string;
  txid: string;
}

class XverseWalletService {
  private isInstalled: boolean = false;
  private currentAccount: XverseWalletAccount | null = null;
  private network: 'mainnet' | 'testnet' = 'mainnet';

  constructor() {
    this.checkInstallation();
  }

  /**
   * Check if Xverse wallet is installed
   */
  private checkInstallation(): void {
    this.isInstalled = !!(window as any).bitcoin && !!(window as any).xverse;
  }

  /**
   * Check if Xverse wallet is available
   */
  public isAvailable(): boolean {
    return this.isInstalled;
  }

  /**
   * Get current wallet state
   */
  public getState() {
    return {
      isInstalled: this.isInstalled,
      isConnected: !!this.currentAccount,
      currentAccount: this.currentAccount,
      network: this.network,
    };
  }

  /**
   * Connect to Xverse wallet
   */
  public async connect(): Promise<XverseWalletAccount> {
    if (!this.isInstalled) {
      throw new Error('Xverse wallet is not installed');
    }

    try {
      const bitcoin = (window as any).bitcoin;

      // Request account access
      const accounts = await bitcoin.requestAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];

      // Get account balance
      const balance = await this.getBalance(account.address);

      this.currentAccount = {
        address: account.address,
        publicKey: account.publicKey || account.address,
        balance,
        network: this.network,
      };

      return this.currentAccount;
    } catch (error) {
      console.error('Xverse connection error:', error);
      throw new Error(`Failed to connect to Xverse wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disconnect from Xverse wallet
   */
  public disconnect(): void {
    this.currentAccount = null;
  }

  /**
   * Get Bitcoin balance for address
   */
  private async getBalance(address: string): Promise<number> {
    try {
      // Use blockchain API to get balance
      const response = await fetch(`https://blockstream.info/api/address/${address}`);
      const data = await response.json();

      // Convert satoshis to BTC
      const chainStats = data.chain_stats || {};
      const funded = chainStats.funded_txo_sum || 0;
      const spent = chainStats.spent_txo_sum || 0;
      const balance = (funded - spent) / 100000000;

      return balance;
    } catch (error) {
      console.error('Balance fetch error:', error);
      return 0;
    }
  }

  /**
   * Send Bitcoin transaction
   */
  public async sendBitcoin(params: XverseTransactionParams): Promise<XverseSignedTransaction> {
    if (!this.currentAccount) {
      throw new Error('Wallet not connected');
    }

    try {
      const bitcoin = (window as any).bitcoin;

      // Create transaction parameters
      const txParams = {
        fromAddress: this.currentAccount.address,
        toAddress: params.toAddress,
        amount: Math.floor(params.amount * 100000000), // Convert to satoshis
        feeRate: params.feeRate || 10, // sat/byte
        message: params.message || '',
      };

      // Sign and send transaction
      const result = await bitcoin.sendBitcoin(txParams);

      return {
        txHex: result.txHex,
        txid: result.txid,
      };
    } catch (error) {
      console.error('Transaction error:', error);
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sign message
   */
  public async signMessage(message: string): Promise<string> {
    if (!this.currentAccount) {
      throw new Error('Wallet not connected');
    }

    try {
      const bitcoin = (window as any).bitcoin;

      const signature = await bitcoin.signMessage(message, this.currentAccount.address);

      return signature;
    } catch (error) {
      console.error('Message signing error:', error);
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Switch network
   */
  public async switchNetwork(network: 'mainnet' | 'testnet'): Promise<void> {
    try {
      const bitcoin = (window as any).bitcoin;

      await bitcoin.switchNetwork(network);
      this.network = network;

      // Update current account with new network
      if (this.currentAccount) {
        this.currentAccount.network = network;
        this.currentAccount.balance = await this.getBalance(this.currentAccount.address);
      }
    } catch (error) {
      console.error('Network switch error:', error);
      throw new Error(`Failed to switch network: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction history
   */
  public async getTransactionHistory(): Promise<any[]> {
    if (!this.currentAccount) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await fetch(
        `https://blockstream.info/api/address/${this.currentAccount.address}/txs`
      );
      const transactions = await response.json();

      return transactions.map((tx: any) => ({
        txid: tx.txid,
        status: tx.status?.confirmed ? 'confirmed' : 'pending',
        amount: this.calculateTransactionAmount(tx, this.currentAccount!.address),
        timestamp: tx.status?.block_time ? new Date(tx.status.block_time * 1000) : new Date(),
        fee: tx.fee / 100000000, // Convert to BTC
      }));
    } catch (error) {
      console.error('Transaction history error:', error);
      return [];
    }
  }

  /**
   * Calculate transaction amount for address
   */
  private calculateTransactionAmount(tx: any, address: string): number {
    let inputAmount = 0;
    let outputAmount = 0;

    // Calculate inputs
    tx.vin.forEach((input: any) => {
      if (input.prevout?.scriptpubkey_address === address) {
        inputAmount += input.prevout.value;
      }
    });

    // Calculate outputs
    tx.vout.forEach((output: any) => {
      if (output.scriptpubkey_address === address) {
        outputAmount += output.value;
      }
    });

    return (outputAmount - inputAmount) / 100000000; // Convert to BTC
  }

  /**
   * Listen to account changes
   */
  public onAccountChanged(callback: (account: XverseWalletAccount | null) => void): void {
    if (this.isInstalled) {
      const bitcoin = (window as any).bitcoin;

      bitcoin.on('accountsChanged', async (accounts: any[]) => {
        if (accounts.length === 0) {
          this.currentAccount = null;
          callback(null);
        } else {
          const account = accounts[0];
          const balance = await this.getBalance(account.address);

          this.currentAccount = {
            address: account.address,
            publicKey: account.publicKey || account.address,
            balance,
            network: this.network,
          };

          callback(this.currentAccount);
        }
      });
    }
  }

  /**
   * Listen to network changes
   */
  public onNetworkChanged(callback: (network: 'mainnet' | 'testnet') => void): void {
    if (this.isInstalled) {
      const bitcoin = (window as any).bitcoin;

      bitcoin.on('networkChanged', (network: 'mainnet' | 'testnet') => {
        this.network = network;
        callback(network);
      });
    }
  }
}

// Create singleton instance
export const xverseWallet = new XverseWalletService();

// Type declaration for Xverse window object
declare global {
  interface Window {
    bitcoin?: {
      requestAccounts: () => Promise<any[]>;
      sendBitcoin: (params: any) => Promise<any>;
      signMessage: (message: string, address: string) => Promise<string>;
      switchNetwork: (network: 'mainnet' | 'testnet') => Promise<void>;
      on: (event: string, callback: Function) => void;
    };
    xverse?: any;
  }
}