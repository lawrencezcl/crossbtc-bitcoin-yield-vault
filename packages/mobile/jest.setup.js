import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  })),
}));

jest.mock('@/hooks/useVault', () => ({
  useVault: jest.fn(() => ({
    balance: { total: 0.525, principal: 0.5, yield: 0.025, currency: 'BTC' },
    transactions: [],
    isLoading: false,
    error: null,
    deposit: jest.fn(),
    withdraw: jest.fn(),
    claimYield: jest.fn(),
    refresh: jest.fn(),
  })),
}));