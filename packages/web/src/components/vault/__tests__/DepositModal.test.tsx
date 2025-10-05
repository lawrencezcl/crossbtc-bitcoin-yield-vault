import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DepositModal } from '../DepositModal'

// Mock utils
jest.mock('@/lib/utils', () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`
}))

describe('DepositModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onDeposit: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders modal when open', () => {
    render(<DepositModal {...defaultProps} />)

    expect(screen.getByText('Deposit Bitcoin')).toBeInTheDocument()
    expect(screen.getByText('Amount (BTC)')).toBeInTheDocument()
    expect(screen.getByText('Deposit Method')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<DepositModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Deposit Bitcoin')).not.toBeInTheDocument()
  })

  it('handles amount input correctly', () => {
    render(<DepositModal {...defaultProps} />)

    const amountInput = screen.getByPlaceholderText('0.00000000')
    fireEvent.change(amountInput, { target: { value: '0.5' } })

    expect(amountInput).toHaveValue('0.5')
  })

  it('rejects invalid amount input', () => {
    render(<DepositModal {...defaultProps} />)

    const amountInput = screen.getByPlaceholderText('0.00000000')
    fireEvent.change(amountInput, { target: { value: 'abc' } })

    expect(amountInput).toHaveValue('')
  })

  it('handles quick amount buttons', () => {
    render(<DepositModal {...defaultProps} />)

    const quickButton = screen.getByText('0.1 BTC')
    fireEvent.click(quickButton)

    const amountInput = screen.getByPlaceholderText('0.00000000')
    expect(amountInput).toHaveValue('0.10000000')
  })

  it('switches between deposit methods', () => {
    render(<DepositModal {...defaultProps} />)

    // Initially Bitcoin should be selected
    expect(screen.getByText('Bitcoin')).toBeInTheDocument()

    // Click on Lightning
    const lightningButton = screen.getByText('Lightning')
    fireEvent.click(lightningButton)

    expect(screen.getByText('Lightning Network')).toBeInTheDocument()
  })

  it('shows Bitcoin method information', () => {
    render(<DepositModal {...defaultProps} />)

    expect(screen.getByText('Bitcoin Deposit')).toBeInTheDocument()
    expect(screen.getByText(/Send Bitcoin to the generated address/)).toBeInTheDocument()
  })

  it('shows Lightning method information when selected', () => {
    render(<DepositModal {...defaultProps} />)

    const lightningButton = screen.getByText('Lightning')
    fireEvent.click(lightningButton)

    expect(screen.getByText('Lightning Network')).toBeInTheDocument()
    expect(screen.getByText(/Pay the Lightning invoice for instant deposit/)).toBeInTheDocument()
  })

  it('handles deposit with valid amount', () => {
    const onDeposit = jest.fn()
    render(<DepositModal {...defaultProps} onDeposit={onDeposit} />)

    const amountInput = screen.getByPlaceholderText('0.00000000')
    fireEvent.change(amountInput, { target: { value: '0.5' } })

    const depositButton = screen.getByText('Deposit')
    fireEvent.click(depositButton)

    expect(onDeposit).toHaveBeenCalledWith(0.5, 'bitcoin')
  })

  it('does not call onDeposit with invalid amount', () => {
    const onDeposit = jest.fn()
    render(<DepositModal {...defaultProps} onDeposit={onDeposit} />)

    const depositButton = screen.getByText('Deposit')
    fireEvent.click(depositButton)

    expect(onDeposit).not.toHaveBeenCalled()
  })

  it('disables deposit button when loading', () => {
    render(<DepositModal {...defaultProps} loading={true} />)

    const amountInput = screen.getByPlaceholderText('0.00000000')
    fireEvent.change(amountInput, { target: { value: '0.5' } })

    const depositButton = screen.getByText('Processing...')
    expect(depositButton).toBeDisabled()
  })

  it('shows estimated USD value', () => {
    render(<DepositModal {...defaultProps} />)

    const amountInput = screen.getByPlaceholderText('0.00000000')
    fireEvent.change(amountInput, { target: { value: '1' } })

    expect(screen.getByText('Estimated USD Value')).toBeInTheDocument()
    expect(screen.getByText('$43000.00')).toBeInTheDocument()
  })

  it('handles cancel button', () => {
    const onClose = jest.fn()
    render(<DepositModal {...defaultProps} onClose={onClose} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('handles deposit with Lightning method', () => {
    const onDeposit = jest.fn()
    render(<DepositModal {...defaultProps} onDeposit={onDeposit} />)

    // Select Lightning method
    const lightningButton = screen.getByText('Lightning')
    fireEvent.click(lightningButton)

    // Enter amount
    const amountInput = screen.getByPlaceholderText('0.00000000')
    fireEvent.change(amountInput, { target: { value: '0.25' } })

    // Click deposit
    const depositButton = screen.getByText('Deposit')
    fireEvent.click(depositButton)

    expect(onDeposit).toHaveBeenCalledWith(0.25, 'lightning')
  })
})