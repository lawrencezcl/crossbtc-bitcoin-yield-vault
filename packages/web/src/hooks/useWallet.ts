/**
 * Unified wallet hook for Xverse and Chipi Pay integrations
 */
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { xverseWallet, XverseWalletAccount } from '@/services/wallets/xverse';
import { chipiPay, ChipiPaymentRequest, ChipiPaymentResponse } from '@/services/wallets/chipiPay';

export interface WalletState {
  isXverseConnected: boolean;
  isChipiInitialized: boolean;
  xverseAccount: XverseWalletAccount | null;
  chipiBalances: any[];
  error: string | null;
}

export const useWallet = () => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<WalletState>({
    isXverseConnected: false,
    isChipiInitialized: false,
    xverseAccount: null,
    chipiBalances: [],
    error: null,
  });

  // Initialize Chipi Pay
  const { mutate: initializeChipi } = useMutation({
    mutationFn: async () => {
      await chipiPay.initialize();
    },
    onSuccess: () => {
      setState(prev => ({ ...prev, isChipiInitialized: true, error: null }));
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: `Chipi Pay initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    },
  });

  // Connect Xverse wallet
  const { mutate: connectXverse, isPending: isConnectingXverse } = useMutation({
    mutationFn: async (): Promise<XverseWalletAccount> => {
      return await xverseWallet.connect();
    },
    onSuccess: (account) => {
      setState(prev => ({
        ...prev,
        isXverseConnected: true,
        xverseAccount: account,
        error: null,
      }));

      // Fetch Chipi balances after wallet connection
      if (account.address) {
        queryClient.invalidateQueries({ queryKey: ['chipi-balances'] });
      }
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: `Xverse connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    },
  });

  // Disconnect Xverse wallet
  const disconnectXverse = useCallback(() => {
    xverseWallet.disconnect();
    setState(prev => ({
      ...prev,
      isXverseConnected: false,
      xverseAccount: null,
      chipiBalances: [],
    }));
    queryClient.clear();
  }, [queryClient]);

  // Get Chipi balances
  const { data: chipiBalances, isLoading: isLoadingBalances } = useQuery({
    queryKey: ['chipi-balances'],
    queryFn: async () => {
      if (!state.xverseAccount?.address) return [];
      return await chipiPay.getBalances(state.xverseAccount.address);
    },
    enabled: !!state.xverseAccount?.address && state.isChipiInitialized,
    onSuccess: (balances) => {
      setState(prev => ({ ...prev, chipiBalances: balances }));
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: `Failed to fetch balances: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    },
  });

  // Create payment/bridge
  const { mutate: createPayment, isPending: isCreatingPayment } = useMutation({
    mutationFn: async (request: ChipiPaymentRequest): Promise<ChipiPaymentResponse> => {
      return await chipiPay.createPayment(request);
    },
    onSuccess: (response) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['chipi-balances'] });
      queryClient.invalidateQueries({ queryKey: ['chipi-transactions'] });
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: `Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    },
  });

  // Send Bitcoin via Xverse
  const { mutate: sendBitcoin, isPending: isSendingBitcoin } = useMutation({
    mutationFn: async (params: { toAddress: string; amount: number; message?: string }) => {
      return await xverseWallet.sendBitcoin(params);
    },
    onSuccess: () => {
      // Invalidate Xverse related queries
      queryClient.invalidateQueries({ queryKey: ['xverse-state'] });
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: `Bitcoin transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    },
  });

  // Create Lightning invoice
  const { mutate: createLightningInvoice, isPending: isCreatingInvoice } = useMutation({
    mutationFn: async (params: { amount: number; memo?: string }) => {
      return await chipiPay.createLightningInvoice(params.amount, params.memo);
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: `Invoice creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    },
  });

  // Pay Lightning invoice
  const { mutate: payLightningInvoice, isPending: isPayingInvoice } = useMutation({
    mutationFn: async (invoice: string) => {
      return await chipiPay.payLightningInvoice(invoice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chipi-balances'] });
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: `Lightning payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    },
  });

  // Get bridge routes
  const { mutate: getBridgeRoutes } = useMutation({
    mutationFn: async (params: { fromChain: string; toChain: string; asset: string }) => {
      return await chipiPay.getBridgeRoutes(params.fromChain, params.toChain, params.asset);
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        error: `Failed to get bridge routes: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    },
  });

  // Initialize services on mount
  useEffect(() => {
    if (!state.isChipiInitialized) {
      initializeChipi();
    }

    // Set up Xverse event listeners
    const handleAccountChanged = (account: XverseWalletAccount | null) => {
      setState(prev => ({
        ...prev,
        isXverseConnected: !!account,
        xverseAccount: account,
      }));

      if (account) {
        queryClient.invalidateQueries({ queryKey: ['chipi-balances'] });
      }
    };

    const handleNetworkChanged = (network: 'mainnet' | 'testnet') => {
      console.log('Xverse network changed to:', network);
    };

    xverseWallet.onAccountChanged(handleAccountChanged);
    xverseWallet.onNetworkChanged(handleNetworkChanged);

    // Cleanup
    return () => {
      // Note: Xverse doesn't provide a way to remove event listeners
      // This is a limitation of the current API
    };
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return {
    // State
    state,
    isLoading: {
      connectingXverse: isConnectingXverse,
      creatingPayment: isCreatingPayment,
      sendingBitcoin: isSendingBitcoin,
      creatingInvoice: isCreatingInvoice,
      payingInvoice: isPayingInvoice,
      balances: isLoadingBalances,
    },

    // Actions
    connectXverse,
    disconnectXverse,
    createPayment,
    sendBitcoin,
    createLightningInvoice,
    payLightningInvoice,
    getBridgeRoutes,

    // Computed values
    isReady: state.isXverseConnected && state.isChipiInitialized,
    totalBalance: chipiBalances?.reduce((sum, balance) => sum + balance.balance, 0) || 0,

    // Wallet availability
    isXverseAvailable: xverseWallet.isAvailable(),
    isChipiReady: state.isChipiInitialized,
  };
};