import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface VaultBalance {
  total: number;
  principal: number;
  yield: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'yield';
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

export const useVault = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mock vault balance query
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['vault-balance'],
    queryFn: async (): Promise<VaultBalance> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        total: 0.52500000,
        principal: 0.50000000,
        yield: 0.02500000,
        currency: 'BTC',
      };
    },
  });

  // Mock transactions query
  const { data: transactions } = useQuery({
    queryKey: ['vault-transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          id: '1',
          type: 'deposit',
          amount: 0.10000000,
          timestamp: new Date('2024-01-15'),
          status: 'completed',
          txHash: '0x123...456',
        },
        {
          id: '2',
          type: 'yield',
          amount: 0.00123456,
          timestamp: new Date('2024-01-14'),
          status: 'completed',
          txHash: '0x789...abc',
        },
        {
          id: '3',
          type: 'deposit',
          amount: 0.40000000,
          timestamp: new Date('2024-01-10'),
          status: 'completed',
          txHash: '0xdef...012',
        },
      ];
    },
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (amount: number): Promise<Transaction> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate blockchain interaction
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate random failure for demo
        if (Math.random() < 0.1) {
          throw new Error('Transaction failed');
        }

        return {
          id: Date.now().toString(),
          type: 'deposit',
          amount,
          timestamp: new Date(),
          status: 'completed',
          txHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        };
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (transaction) => {
      // Update cache
      queryClient.setQueryData(['vault-transactions'], (old: Transaction[] | undefined) =>
        old ? [transaction, ...old] : [transaction]
      );

      // Update balance
      queryClient.setQueryData(['vault-balance'], (old: VaultBalance | undefined) =>
        old ? {
          ...old,
          total: old.total + transaction.amount,
          principal: old.principal + transaction.amount,
        } : undefined
      );

      Alert.alert('Success', `Deposited ${amount} BTC successfully!`);
    },
    onError: (error) => {
      Alert.alert('Error', `Deposit failed: ${error.message}`);
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount: number): Promise<Transaction> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate blockchain interaction
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate random failure for demo
        if (Math.random() < 0.1) {
          throw new Error('Insufficient balance');
        }

        return {
          id: Date.now().toString(),
          type: 'withdraw',
          amount,
          timestamp: new Date(),
          status: 'completed',
          txHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        };
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (transaction) => {
      // Update cache
      queryClient.setQueryData(['vault-transactions'], (old: Transaction[] | undefined) =>
        old ? [transaction, ...old] : [transaction]
      );

      // Update balance
      queryClient.setQueryData(['vault-balance'], (old: VaultBalance | undefined) =>
        old ? {
          ...old,
          total: old.total - transaction.amount,
          principal: old.principal - transaction.amount,
        } : undefined
      );

      Alert.alert('Success', `Withdrew ${amount} BTC successfully!`);
    },
    onError: (error) => {
      Alert.alert('Error', `Withdrawal failed: ${error.message}`);
    },
  });

  // Claim yield mutation
  const claimYieldMutation = useMutation({
    mutationFn: async (): Promise<Transaction> => {
      setIsLoading(true);
      setError(null);

      try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const currentBalance = balance;
        if (!currentBalance) {
          throw new Error('No balance available');
        }

        return {
          id: Date.now().toString(),
          type: 'yield',
          amount: currentBalance.yield,
          timestamp: new Date(),
          status: 'completed',
          txHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        };
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (transaction) => {
      // Update cache
      queryClient.setQueryData(['vault-transactions'], (old: Transaction[] | undefined) =>
        old ? [transaction, ...old] : [transaction]
      );

      // Update balance - reset yield to 0
      queryClient.setQueryData(['vault-balance'], (old: VaultBalance | undefined) =>
        old ? {
          ...old,
          principal: old.principal + old.yield,
          yield: 0,
        } : undefined
      );

      Alert.alert('Success', `Claimed ${transaction.amount} BTC yield!`);
    },
    onError: (error) => {
      Alert.alert('Error', `Yield claim failed: ${error.message}`);
    },
  });

  // Action functions
  const deposit = useCallback((amount: number) => {
    if (amount <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }
    depositMutation.mutate(amount);
  }, [depositMutation]);

  const withdraw = useCallback((amount: number) => {
    if (amount <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }

    if (balance && amount > balance.total) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    withdrawMutation.mutate(amount);
  }, [withdrawMutation, balance]);

  const claimYield = useCallback(() => {
    if (!balance || balance.yield <= 0) {
      Alert.alert('Error', 'No yield available to claim');
      return;
    }
    claimYieldMutation.mutate();
  }, [claimYieldMutation, balance]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['vault-balance'] });
    queryClient.invalidateQueries({ queryKey: ['vault-transactions'] });
  }, [queryClient]);

  return {
    balance,
    transactions,
    isLoading: isLoading || balanceLoading,
    error,
    deposit,
    withdraw,
    claimYield,
    refresh,
    isDepositing: depositMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
    isClaiming: claimYieldMutation.isPending,
  };
};