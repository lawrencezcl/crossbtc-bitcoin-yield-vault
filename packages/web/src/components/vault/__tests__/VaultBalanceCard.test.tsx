import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VaultBalanceCard } from '../VaultBalanceCard'

// Mock the utils module
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  formatCurrency: (amount: number) => `${amount.toFixed(8)} BTC`,
  formatPercentage: (value: number) => `${(value * 100).toFixed(2)}%`
}))

const mockVault = {
  id: 'vault-1',
  balance: 0.5,
  yieldEarned: 0.025,
  apr: 0.075,
  change24h: 0.023
}

describe('VaultBalanceCard', () => {
  it('renders vault information correctly', () => {
    render(<VaultBalanceCard vault={mockVault} />)

    expect(screen.getByText('Bitcoin Yield Vault')).toBeInTheDocument()
    expect(screen.getByText('0.52500000 BTC')).toBeInTheDocument() // Total balance
    expect(screen.getByText('0.50000000 BTC')).toBeInTheDocument() // Principal
    expect(screen.getByText('+0.02500000 BTC')).toBeInTheDocument() // Yield earned
    expect(screen.getByText('7.50%')).toBeInTheDocument() // APR
    expect(screen.getByText('+2.30%')).toBeInTheDocument() // 24h change
  })

  it('shows loading state correctly', () => {
    render(<VaultBalanceCard vault={null} loading={true} />)

    // Should show skeleton loading elements
    expect(screen.getByText('Bitcoin Yield Vault')).toBeInTheDocument()
    expect(screen.queryByText('0.52500000 BTC')).not.toBeInTheDocument()
  })

  it('shows create vault state when no vault', () => {
    render(<VaultBalanceCard vault={null} onDeposit={jest.fn()} />)

    expect(screen.getByText('No vault found. Create your first vault to start earning yield.')).toBeInTheDocument()
    expect(screen.getByText('Create Vault')).toBeInTheDocument()
  })

  it('handles deposit button click', () => {
    const onDeposit = jest.fn()
    render(<VaultBalanceCard vault={mockVault} onDeposit={onDeposit} />)

    const depositButton = screen.getByText('Deposit')
    fireEvent.click(depositButton)

    expect(onDeposit).toHaveBeenCalledTimes(1)
  })

  it('handles withdraw button click', () => {
    const onWithdraw = jest.fn()
    render(<VaultBalanceCard vault={mockVault} onWithdraw={onWithdraw} />)

    const withdrawButton = screen.getByText('Withdraw')
    fireEvent.click(withdrawButton)

    expect(onWithdraw).toHaveBeenCalledTimes(1)
  })

  it('displays negative change correctly', () => {
    const negativeVault = { ...mockVault, change24h: -0.015 }
    render(<VaultBalanceCard vault={negativeVault} />)

    expect(screen.getByText('-1.50%')).toBeInTheDocument()
  })

  it('shows correct APR badge color', () => {
    render(<VaultBalanceCard vault={mockVault} />)

    const aprBadge = screen.getByText('7.50%')
    expect(aprBadge).toHaveClass('text-bitcoin-600')
  })

  it('formats currency correctly with custom decimals', () => {
    render(<VaultBalanceCard vault={mockVault} />)

    const totalBalance = screen.getByText('0.52500000 BTC')
    expect(totalBalance).toBeInTheDocument()
  })

  it('calculates total value correctly', () => {
    render(<VaultBalanceCard vault={mockVault} />)

    // Total should be balance + yield earned = 0.5 + 0.025 = 0.525
    expect(screen.getByText('0.52500000 BTC')).toBeInTheDocument()
  })
})