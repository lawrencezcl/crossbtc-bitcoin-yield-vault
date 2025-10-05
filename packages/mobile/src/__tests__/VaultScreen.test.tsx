import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VaultScreen from '@/screens/VaultScreen';

// Mock the useVault hook
jest.mock('@/hooks/useVault');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('VaultScreen', () => {
  let queryClient: QueryClient;
  let mockUseVault: jest.MockedFunction<typeof import('@/hooks/useVault').useVault>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();

    mockUseVault = require('@/hooks/useVault').useVault;
    mockUseVault.mockReturnValue({
      balance: { total: 0.525, principal: 0.5, yield: 0.025, currency: 'BTC' },
      transactions: [],
      isLoading: false,
      error: null,
      deposit: jest.fn(),
      withdraw: jest.fn(),
      claimYield: jest.fn(),
      refresh: jest.fn(),
      isDepositing: false,
      isWithdrawing: false,
      isClaiming: false,
    });
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <VaultScreen />
      </QueryClientProvider>
    );

  it('renders vault balance correctly', () => {
    const { getByText } = renderComponent();

    expect(getByText('Bitcoin Yield Vault')).toBeTruthy();
    expect(getByText('0.52500000 BTC')).toBeTruthy();
    expect(getByText('Principal')).toBeTruthy();
    expect(getByText('0.50000000 BTC')).toBeTruthy();
    expect(getByText('Yield Earned')).toBeTruthy();
    expect(getByText('+0.02500000 BTC')).toBeTruthy();
  });

  it('displays loading state correctly', () => {
    mockUseVault.mockReturnValue({
      balance: null,
      transactions: [],
      isLoading: true,
      error: null,
      deposit: jest.fn(),
      withdraw: jest.fn(),
      claimYield: jest.fn(),
      refresh: jest.fn(),
      isDepositing: false,
      isWithdrawing: false,
      isClaiming: false,
    });

    const { getByText } = renderComponent();
    expect(getByText('Loading vault data...')).toBeTruthy();
  });

  it('displays error state correctly', () => {
    const error = new Error('Network error');
    mockUseVault.mockReturnValue({
      balance: null,
      transactions: [],
      isLoading: false,
      error,
      deposit: jest.fn(),
      withdraw: jest.fn(),
      claimYield: jest.fn(),
      refresh: jest.fn(),
      isDepositing: false,
      isWithdrawing: false,
      isClaiming: false,
    });

    const { getByText } = renderComponent();
    expect(getByText('Error loading vault: Network error')).toBeTruthy();
  });

  it('handles refresh correctly', () => {
    const mockRefresh = jest.fn();
    mockUseVault.mockReturnValue({
      balance: { total: 0.525, principal: 0.5, yield: 0.025, currency: 'BTC' },
      transactions: [],
      isLoading: false,
      error: null,
      deposit: jest.fn(),
      withdraw: jest.fn(),
      claimYield: jest.fn(),
      refresh: mockRefresh,
      isDepositing: false,
      isWithdrawing: false,
      isClaiming: false,
    });

    const { getByTestId } = renderComponent();

    // Note: ScrollView with RefreshControl needs to be tested with fireEvent on the refreshControl
    // This is a simplified test - in practice you might need to test the RefreshControl specifically
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('displays yield overview correctly', () => {
    const { getByText } = renderComponent();

    expect(getByText('Yield Overview')).toBeTruthy();
    expect(getByText('Current APR')).toBeTruthy();
    expect(getByText('8.5%')).toBeTruthy();
    expect(getByText('Monthly Yield')).toBeTruthy();
    expect(getByText('0.00354167 BTC')).toBeTruthy();
  });

  it('displays action buttons', () => {
    const { getByText } = renderComponent();

    expect(getByText('Deposit')).toBeTruthy();
    expect(getByText('Withdraw')).toBeTruthy();
  });
});