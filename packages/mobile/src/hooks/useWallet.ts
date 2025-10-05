import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WalletBalance {
  lightning: number;
  bitcoin: number;
  currency: string;
}

interface Payment {
  id: string;
  type: 'lightning' | 'bitcoin';
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  address?: string;
  invoice?: string;
}

export const useWallet = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mock wallet balance query
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async (): Promise<WalletBalance> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        lightning: 0.02500000,
        bitcoin: 0.00050000,
        currency: 'BTC',
      };
    },
  });

  // Mock payments query
  const { data: payments } = useQuery({
    queryKey: ['wallet-payments'],
    queryFn: async (): Promise<Payment[]> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return [
        {
          id: '1',
          type: 'lightning',
          amount: 0.00100000,
          timestamp: new Date('2024-01-15T10:30:00'),
          status: 'completed',
          description: 'Coffee payment',
          invoice: 'lnbc1...abc',
        },
        {
          id: '2',
          type: 'bitcoin',
          amount: 0.00050000,
          timestamp: new Date('2024-01-14T15:45:00'),
          status: 'completed',
          description: 'Received from friend',
          address: 'bc1q...def',
        },
        {
          id: '3',
          type: 'lightning',
          amount: 0.00250000,
          timestamp: new Date('2024-01-13T09:15:00'),
          status: 'completed',
          description: 'Online purchase',
          invoice: 'lnbc1...xyz',
        },
        {
          id: '4',
          type: 'lightning',
          amount: 0.00080000,
          timestamp: new Date('2024-01-12T18:20:00'),
          status: 'pending',
          description: 'Pending payment',
          invoice: 'lnbc1...123',
        },
      ];
    },
  });

  // Create payment mutation (receive)
  const createPaymentMutation = useMutation({
    mutationFn: async (type: 'lightning' | 'bitcoin'): Promise<{ invoice?: string; address?: string }> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate payment creation
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (type === 'lightning') {
          return {
            invoice: `lnbc1${Math.random().toString(16).substr(2, 20)}...`,
          };
        } else {
          return {
            address: `bc1q${Math.random().toString(16).substr(2, 32)}`,
          };
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (result, type) => {
      const identifier = type === 'lightning' ? result.invoice : result.address;

      Alert.alert(
        'Payment Created',
        `${type === 'lightning' ? 'Invoice' : 'Address'}:\n${identifier}\n\nShare this to receive payment.`,
        [
          { text: 'Copy', onPress: () => {/* Copy to clipboard */ } },
          { text: 'Share', onPress: () => {/* Share payment details */ } },
          { text: 'OK' },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to create payment: ${error.message}`);
    },
  });

  // Send payment mutation
  const sendPaymentMutation = useMutation({
    mutationFn: async ({ type, amount }: { type: 'lightning' | 'bitcoin'; amount: number }): Promise<Payment> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate payment sending
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate random failure for demo
        if (Math.random() < 0.1) {
          throw new Error('Payment failed');
        }

        return {
          id: Date.now().toString(),
          type,
          amount: -amount, // Negative for outgoing
          timestamp: new Date(),
          status: 'completed',
          description: 'Payment sent',
        };
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (payment) => {
      // Update cache
      queryClient.setQueryData(['wallet-payments'], (old: Payment[] | undefined) =>
        old ? [payment, ...old] : [payment]
      );

      // Update balance
      queryClient.setQueryData(['wallet-balance'], (old: WalletBalance | undefined) =>
        old ? {
          ...old,
          [payment.type]: old[payment.type] + payment.amount,
        } : undefined
      );

      Alert.alert('Success', `Sent ${Math.abs(payment.amount)} BTC via ${payment.type}!`);
    },
    onError: (error) => {
      Alert.alert('Error', `Payment failed: ${error.message}`);
    },
  });

  // Action functions
  const createPayment = useCallback((type: 'lightning' | 'bitcoin') => {
    createPaymentMutation.mutate(type);
  }, [createPaymentMutation]);

  const sendPayment = useCallback((type: 'lightning' | 'bitcoin', amount: number = 0.001) => {
    if (amount <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }

    if (balance && amount > balance[type]) {
      Alert.alert('Error', `Insufficient ${type} balance`);
      return;
    }

    sendPaymentMutation.mutate({ type, amount });
  }, [sendPaymentMutation, balance]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    queryClient.invalidateQueries({ queryKey: ['wallet-payments'] });
  }, [queryClient]);

  return {
    balance,
    payments,
    isLoading: isLoading || balanceLoading,
    error,
    createPayment,
    sendPayment,
    refresh,
    isCreating: createPaymentMutation.isPending,
    isSending: sendPaymentMutation.isPending,
  };
};