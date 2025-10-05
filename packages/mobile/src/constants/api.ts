export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.crossbtc.io',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'wss://api.crossbtc.io',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export const API_ENDPOINTS = {
  // Vault endpoints
  VAULT: {
    BALANCE: '/vault/balance',
    STRATEGIES: '/vault/strategies',
    TRANSACTIONS: '/vault/transactions',
    DEPOSIT: '/vault/deposit',
    WITHDRAW: '/vault/withdraw',
    CLAIM_YIELD: '/vault/claim-yield',
    SWITCH_STRATEGY: '/vault/switch-strategy',
    STATS: '/vault/stats',
  },

  // Wallet endpoints
  WALLET: {
    BALANCE: '/wallet/balance',
    PAYMENTS: '/wallet/payments',
    CREATE_PAYMENT: '/wallet/create-payment',
    SEND_PAYMENT: '/wallet/send-payment',
    CONNECT: '/wallet/connect',
    DISCONNECT: '/wallet/disconnect',
  },

  // Blockchain endpoints
  BLOCKCHAIN: {
    BITCOIN_RPC: '/blockchain/bitcoin',
    STARKNET_RPC: '/blockchain/starknet',
    LIGHTNING_RPC: '/blockchain/lightning',
    BRIDGE: '/blockchain/bridge',
  },

  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    PREFERENCES: '/user/preferences',
    SECURITY: '/user/security',
  },
};

export const WEBSOCKET_EVENTS = {
  // Vault events
  VAULT_BALANCE_UPDATED: 'vault:balance:updated',
  VAULT_TRANSACTION_COMPLETED: 'vault:transaction:completed',
  VAULT_YIELD_EARNED: 'vault:yield:earned',

  // Payment events
  PAYMENT_SENT: 'payment:sent',
  PAYMENT_RECEIVED: 'payment:received',
  PAYMENT_FAILED: 'payment:failed',

  // System events
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
};