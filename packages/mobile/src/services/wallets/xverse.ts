/**
 * Xverse Wallet Integration Service for React Native
 * Provides Bitcoin wallet functionality through Xverse mobile app deep linking
 */
import { Linking, Alert } from 'react-native';

export interface XverseMobileAccount {
  address: string;
  publicKey: string;
  balance: number;
  network: 'mainnet' | 'testnet';
}

export interface XverseMobileTransactionParams {
  toAddress: string;
  amount: number;
  feeRate?: number;
  message?: string;
}

class XverseMobileService {
  private currentAccount: XverseMobileAccount | null = null;
  private network: 'mainnet' | 'testnet' = 'mainnet';
  private deepLinkPrefix: string = 'xverse://';

  constructor() {
    this.setupDeepLinkListener();
  }

  /**
   * Set up deep link listener for Xverse responses
   */
  private setupDeepLinkListener(): void {
    // Handle deep link events when Xverse returns data
    Linking.addEventListener('url', this.handleDeepLink.bind(this));
  }

  /**
   * Handle deep link responses from Xverse
   */
  private async handleDeepLink(event: { url: string }): Promise<void> {
    const { url } = event;

    if (!url.startsWith(this.deepLinkPrefix)) {
      return;
    }

    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const action = urlParams.get('action');
      const data = urlParams.get('data');

      if (action && data) {
        const parsedData = JSON.parse(decodeURIComponent(data));
        this.handleXverseResponse(action, parsedData);
      }
    } catch (error) {
      console.error('Deep link handling error:', error);
    }
  }

  /**
   * Handle responses from Xverse app
   */
  private handleXverseResponse(action: string, data: any): void {
    switch (action) {
      case 'connect':
        this.handleConnectResponse(data);
        break;
      case 'signTransaction':
        this.handleSignTransactionResponse(data);
        break;
      case 'signMessage':
        this.handleSignMessageResponse(data);
        break;
      default:
        console.warn('Unknown action from Xverse:', action);
    }
  }

  /**
   * Handle connection response
   */
  private handleConnectResponse(data: any): void {
    if (data.success && data.account) {
      this.currentAccount = {
        address: data.account.address,
        publicKey: data.account.publicKey || data.account.address,
        balance: data.account.balance || 0,
        network: data.account.network || 'mainnet',
      };

      // Emit event or update state as needed
      this.emitAccountChange(this.currentAccount);
    } else {
      Alert.alert('Connection Failed', data.error || 'Failed to connect to Xverse wallet');
    }
  }

  /**
   * Handle transaction signing response
   */
  private handleSignTransactionResponse(data: any): void {
    // Emit event or update state with transaction result
    this.emitTransactionResult(data);
  }

  /**
   * Handle message signing response
   */
  private handleSignMessageResponse(data: any): void {
    // Emit event or update state with signature result
    this.emitSignatureResult(data);
  }

  /**
   * Check if Xverse app is installed
   */
  public async isInstalled(): Promise<boolean> {
    try {
      const appUrl = 'xverse://';
      const supported = await Linking.canOpenURL(appUrl);
      return supported;
    } catch (error) {
      console.error('Error checking Xverse installation:', error);
      return false;
    }
  }

  /**
   * Get current wallet state
   */
  public getState() {
    return {
      isConnected: !!this.currentAccount,
      currentAccount: this.currentAccount,
      network: this.network,
    };
  }

  /**
   * Connect to Xverse wallet via deep link
   */
  public async connect(): Promise<XverseMobileAccount> {
    const isInstalled = await this.isInstalled();

    if (!isInstalled) {
      throw new Error('Xverse app is not installed');
    }

    try {
      const deepLinkUrl = `${this.deepLinkPrefix}connect?callback=${encodeURIComponent('crossbtc://xverse-callback')}&dapp=${encodeURIComponent('CrossBTC Vault')}`;

      await Linking.openURL(deepLinkUrl);

      // Return a promise that resolves when we get the response
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 30000); // 30 second timeout

        // Store resolve/reject for use in deep link handler
        (this as any)._connectResolve = resolve;
        (this as any)._connectReject = reject;
        (this as any)._connectTimeout = timeout;
      });
    } catch (error) {
      console.error('Xverse connection error:', error);
      throw new Error(`Failed to connect to Xverse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disconnect from Xverse wallet
   */
  public disconnect(): void {
    this.currentAccount = null;
    this.emitAccountChange(null);
  }

  /**
   * Send Bitcoin transaction via Xverse
   */
  public async sendBitcoin(params: XverseMobileTransactionParams): Promise<{ txHex: string; txid: string }> {
    if (!this.currentAccount) {
      throw new Error('Wallet not connected');
    }

    try {
      const deepLinkUrl = `${this.deepLinkPrefix}send?` +
        `to=${encodeURIComponent(params.toAddress)}&` +
        `amount=${params.amount}&` +
        `feeRate=${params.feeRate || 10}&` +
        `message=${encodeURIComponent(params.message || '')}&` +
        `callback=${encodeURIComponent('crossbtc://xverse-callback')}`;

      await Linking.openURL(deepLinkUrl);

      // Return promise that resolves when transaction is signed
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Transaction timeout'));
        }, 60000); // 60 second timeout

        (this as any)._transactionResolve = resolve;
        (this as any)._transactionReject = reject;
        (this as any)._transactionTimeout = timeout;
      });
    } catch (error) {
      console.error('Transaction error:', error);
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sign message via Xverse
   */
  public async signMessage(message: string): Promise<string> {
    if (!this.currentAccount) {
      throw new Error('Wallet not connected');
    }

    try {
      const deepLinkUrl = `${this.deepLinkPrefix}sign?` +
        `message=${encodeURIComponent(message)}&` +
        `address=${encodeURIComponent(this.currentAccount.address)}&` +
        `callback=${encodeURIComponent('crossbtc://xverse-callback')}`;

      await Linking.openURL(deepLinkUrl);

      // Return promise that resolves when message is signed
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Message signing timeout'));
        }, 30000); // 30 second timeout

        (this as any)._signatureResolve = resolve;
        (this as any)._signatureReject = reject;
        (this as any)._signatureTimeout = timeout;
      });
    } catch (error) {
      console.error('Message signing error:', error);
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Bitcoin balance via blockchain API
   */
  public async getBalance(address: string): Promise<number> {
    try {
      const response = await fetch(`https://blockstream.info/api/address/${address}`);
      const data = await response.json();

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
   * Emit account change event
   */
  private emitAccountChange(account: XverseMobileAccount | null): void {
    // This would typically emit to a state management solution
    // For now, we'll just update the current account
    this.currentAccount = account;

    // Resolve pending connection promise
    if ((this as any)._connectResolve) {
      if (account) {
        (this as any)._connectResolve(account);
      } else {
        (this as any)._connectReject(new Error('Connection cancelled'));
      }

      clearTimeout((this as any)._connectTimeout);
      (this as any)._connectResolve = null;
      (this as any)._connectReject = null;
      (this as any)._connectTimeout = null;
    }
  }

  /**
   * Emit transaction result event
   */
  private emitTransactionResult(result: any): void {
    if ((this as any)._transactionResolve) {
      if (result.success) {
        (this as any)._transactionResolve({
          txHex: result.txHex,
          txid: result.txid,
        });
      } else {
        (this as any)._transactionReject(new Error(result.error || 'Transaction failed'));
      }

      clearTimeout((this as any)._transactionTimeout);
      (this as any)._transactionResolve = null;
      (this as any)._transactionReject = null;
      (this as any)._transactionTimeout = null;
    }
  }

  /**
   * Emit signature result event
   */
  private emitSignatureResult(result: any): void {
    if ((this as any)._signatureResolve) {
      if (result.success) {
        (this as any)._signatureResolve(result.signature);
      } else {
        (this as any)._signatureReject(new Error(result.error || 'Message signing failed'));
      }

      clearTimeout((this as any)._signatureTimeout);
      (this as any)._signatureResolve = null;
      (this as any)._signatureReject = null;
      (this as any)._signatureTimeout = null;
    }
  }

  /**
   * Open Xverse app store page for installation
   */
  public async openAppStore(): Promise<void> {
    try {
      // iOS App Store
      const iosUrl = 'https://apps.apple.com/app/xverse-wallet/id1598432997';
      // Google Play Store
      const androidUrl = 'https://play.google.com/store/apps/details?id=com.xverse.mobile';

      // Try iOS first, then Android
      try {
        await Linking.openURL(iosUrl);
      } catch {
        await Linking.openURL(androidUrl);
      }
    } catch (error) {
      console.error('Error opening app store:', error);
      Alert.alert('Error', 'Could not open app store. Please install Xverse manually.');
    }
  }
}

// Create singleton instance
export const xverseMobile = new XverseMobileService();