// Application constants for testing
export const APP_CONSTANTS = {
  BASE_URL: 'http://localhost:3000',
  APP_NAME: 'Cross-Chain Bitcoin Yield Vault',
} as const;

// Selectors for key components
export const SELECTORS = {
  // Header
  HEADER: 'header',
  LOGO: '[data-testid="logo"]',
  NAVIGATION: 'nav',
  CONNECT_WALLET: '[data-testid="connect-wallet"]',

  // Main content
  MAIN_CONTENT: 'main',
  HERO_SECTION: '[data-testid="hero-section"]',

  // Vault components
  VAULT_BALANCE_CARD: '[data-testid="vault-balance-card"]',
  VAULT_BALANCE_AMOUNT: '[data-testid="vault-balance-amount"]',
  VAULT_BALANCE_USD: '[data-testid="vault-balance-usd"]',
  VAULT_CHANGE_24H: '[data-testid="vault-change-24h"]',

  // Yield components
  YIELD_OVERVIEW: '[data-testid="yield-overview"]',
  APY_DISPLAY: '[data-testid="apy-display"]',
  PROJECTED_YIELD: '[data-testid="projected-yield"]',

  // Deposit modal
  DEPOSIT_MODAL: '[data-testid="deposit-modal"]',
  DEPOSIT_BUTTON: '[data-testid="deposit-button"]',
  CLOSE_MODAL: '[data-testid="close-modal"]',
  AMOUNT_INPUT: '[data-testid="amount-input"]',
  QUICK_AMOUNT_BUTTONS: '[data-testid="quick-amount-buttons"]',
  METHOD_TABS: '[data-testid="method-tabs"]',
  BITCOIN_METHOD: '[data-testid="bitcoin-method"]',
  LIGHTNING_METHOD: '[data-testid="lightning-method"]',
  SUBMIT_DEPOSIT: '[data-testid="submit-deposit"]',

  // Transaction components
  TRANSACTION_HISTORY: '[data-testid="transaction-history"]',
  TRANSACTION_LIST: '[data-testid="transaction-list"]',
  TRANSACTION_ITEM: '[data-testid="transaction-item"]',

  // Form validation
  ERROR_MESSAGE: '[data-testid="error-message"]',
  VALIDATION_ERROR: '[data-testid="validation-error"]',

  // Loading states
  LOADING_SPINNER: '[data-testid="loading-spinner"]',
  SKELETON: '[data-testid="skeleton"]',

  // Toast/Notifications
  TOAST: '[data-testid="toast"]',
  NOTIFICATION: '[data-testid="notification"]',

  // Mobile specific
  MOBILE_MENU: '[data-testid="mobile-menu"]',
  MOBILE_MENU_TOGGLE: '[data-testid="mobile-menu-toggle"]',
} as const;

// Test data
export const TEST_DATA = {
  // Valid amounts
  VALID_AMOUNTS: {
    SMALL: '0.001',
    MEDIUM: '0.1',
    LARGE: '1.0',
    VERY_LARGE: '10.0',
  },

  // Invalid amounts
  INVALID_AMOUNTS: {
    ZERO: '0',
    NEGATIVE: '-0.1',
    TEXT: 'abc',
    EMPTY: '',
    SPACES: '   ',
    TOO_MANY_DECIMALS: '0.123456789',
    TOO_LARGE: '999999',
  },

  // Mock transaction data
  MOCK_TRANSACTIONS: [
    {
      id: '1',
      type: 'deposit',
      amount: 0.1,
      method: 'bitcoin',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'completed',
    },
    {
      id: '2',
      type: 'deposit',
      amount: 0.05,
      method: 'lightning',
      timestamp: '2024-01-14T15:45:00Z',
      status: 'completed',
    },
    {
      id: '3',
      type: 'deposit',
      amount: 0.2,
      method: 'bitcoin',
      timestamp: '2024-01-13T09:15:00Z',
      status: 'pending',
    },
  ],

  // Mock vault data
  MOCK_VAULT_DATA: {
    balance: {
      btc: 0.5,
      usd: 25000,
      change24h: 2.5,
    },
    apy: 12.5,
    projectedYield: 15.2,
  },

  // Viewports for responsive testing
  VIEWPORTS: {
    MOBILE_SMALL: { width: 375, height: 667 }, // iPhone SE
    MOBILE_LARGE: { width: 414, height: 896 }, // iPhone 11
    TABLET: { width: 768, height: 1024 }, // iPad
    DESKTOP_SMALL: { width: 1024, height: 768 },
    DESKTOP_LARGE: { width: 1920, height: 1080 },
  },

  // Performance thresholds
  PERFORMANCE_THRESHOLDS: {
    MAX_PAGE_LOAD_TIME: 3000, // 3 seconds
    MAX_FIRST_CONTENTFUL_PAINT: 2000, // 2 seconds
    MAX_LARGEST_CONTENTFUL_PAINT: 4000, // 4 seconds
    MAX_CUMULATIVE_LAYOUT_SHIFT: 0.1,
    MAX_FIRST_INPUT_DELAY: 100, // 100ms
  },
} as const;

// Test categories and tags
export const TEST_CATEGORIES = {
  CRITICAL_JOURNEY: 'critical-journey',
  COMPONENT: 'component',
  RESPONSIVE: 'responsive',
  PERFORMANCE: 'performance',
  ACCESSIBILITY: 'accessibility',
  DATA_FLOW: 'data-flow',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred',
  INVALID_AMOUNT: 'Please enter a valid amount',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  WALLET_CONNECTION: 'Failed to connect wallet',
  TRANSACTION_FAILED: 'Transaction failed',
  AMOUNT_TOO_SMALL: 'Amount is too small',
  AMOUNT_TOO_LARGE: 'Amount exceeds maximum limit',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  DEPOSIT_SUCCESS: 'Deposit successful',
  WALLET_CONNECTED: 'Wallet connected successfully',
  TRANSACTION_COMPLETED: 'Transaction completed',
} as const;