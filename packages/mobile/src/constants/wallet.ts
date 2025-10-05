export const WALLET_TYPES = {
  BITCOIN: 'bitcoin',
  LIGHTNING: 'lightning',
  STARKNET: 'starknet',
} as const;

export const SUPPORTED_WALLETS = {
  [WALLET_TYPES.BITCOIN]: [
    {
      id: 'xverse',
      name: 'Xverse Wallet',
      description: 'Bitcoin wallet for Web3',
      icon: 'xverse',
      supported: true,
    },
    {
      id: 'unisat',
      name: 'UniSat Wallet',
      description: 'Browser extension for Bitcoin',
      icon: 'unisat',
      supported: false, // Not implemented yet
    },
    {
      id: 'sparrow',
      name: 'Sparrow Wallet',
      description: 'Desktop Bitcoin wallet',
      icon: 'sparrow',
      supported: false, // Not implemented yet
    },
  ],
  [WALLET_TYPES.LIGHTNING]: [
    {
      id: 'chipi',
      name: 'Chipi Pay',
      description: 'Lightning payments made easy',
      icon: 'chipi',
      supported: true,
    },
    {
      id: 'phoenix',
      name: 'Phoenix Wallet',
      description: 'Mobile Lightning wallet',
      icon: 'phoenix',
      supported: false, // Not implemented yet
    },
    {
      id: 'zeus',
      name: 'Zeus LN',
      description: 'Lightning Network wallet',
      icon: 'zeus',
      supported: false, // Not implemented yet
    },
  ],
  [WALLET_TYPES.STARKNET]: [
    {
      id: 'argentx',
      name: 'Argent X',
      description: 'Starknet wallet',
      icon: 'argentx',
      supported: false, // Not implemented yet
    },
    {
      id: 'braavos',
      name: 'Braavos',
      description: 'Starknet mobile wallet',
      icon: 'braavos',
      supported: false, // Not implemented yet
    },
  ],
};

export const WALLET_CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
} as const;

export const WALLET_ERRORS = {
  NOT_INSTALLED: 'WALLET_NOT_INSTALLED',
  CONNECTION_FAILED: 'WALLET_CONNECTION_FAILED',
  USER_REJECTED: 'USER_REJECTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_PARAMS: 'INVALID_PARAMS',
} as const;