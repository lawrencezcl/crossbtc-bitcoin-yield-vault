// Common types used across the mobile app

export interface VaultBalance {
  total: number;
  principal: number;
  yield: number;
  apr: number;
  totalYield: number;
  yieldStrategies: YieldStrategy[];
}

export interface YieldStrategy {
  id: string;
  name: string;
  allocation: number;
  apr: number;
  description?: string;
  risk: 'low' | 'medium' | 'high';
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'yield' | 'payment';
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  txHash?: string;
  address?: string;
  invoice?: string;
}

export interface WalletBalance {
  lightning: number;
  bitcoin: number;
  currency: string;
}

export interface Payment {
  id: string;
  type: 'lightning' | 'bitcoin';
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  address?: string;
  invoice?: string;
}

export interface WalletOption {
  id: string;
  name: string;
  type: 'bitcoin' | 'lightning' | 'starknet';
  address: string;
  balance: number;
  connected: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface VaultDepositParams {
  vaultId?: string;
  method: 'bitcoin' | 'lightning';
  amount: number;
}

export interface VaultWithdrawParams {
  vaultId?: string;
  method: 'bitcoin' | 'lightning';
  amount: number;
}

export interface PaymentSendParams {
  type: 'lightning' | 'bitcoin';
  amount: number;
  recipient: string;
}

export interface PaymentCreateParams {
  type: 'lightning' | 'bitcoin';
  amount?: number;
  description?: string;
}