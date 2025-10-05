import { renderHook, act, waitFor } from '@testing-library/react'
import { useVault } from '../useVault'

// Mock fetch
global.fetch = jest.fn()

describe('useVault', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useVault('test-user'))

    expect(result.current.loading).toBe(true)
    expect(result.current.vault).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('loads vault data successfully', async () => {
    const { result } = renderHook(() => useVault('test-user'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.vault).not.toBeNull()
    expect(result.current.vault?.userId).toBe('test-user')
    expect(result.current.vault?.balance).toBe(0.5)
    expect(result.current.transactions).toHaveLength(3)
  })

  it('handles deposit correctly', async () => {
    const { result } = renderHook(() => useVault('test-user'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialBalance = result.current.vault?.balance || 0

    await act(async () => {
      await result.current.deposit({
        amount: 0.1,
        method: 'bitcoin',
        userId: 'test-user'
      })
    })

    expect(result.current.vault?.balance).toBe(initialBalance + 0.1)
    expect(result.current.transactions[0].type).toBe('deposit')
    expect(result.current.transactions[0].amount).toBe(0.1)
  })

  it('handles withdrawal correctly', async () => {
    const { result } = renderHook(() => useVault('test-user'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialBalance = result.current.vault?.balance || 0

    await act(async () => {
      await result.current.withdraw({
        amount: 0.1,
        method: 'lightning',
        destination: 'bc1test',
        userId: 'test-user'
      })
    })

    expect(result.current.vault?.balance).toBe(initialBalance - 0.1)
    expect(result.current.transactions[0].type).toBe('withdrawal')
    expect(result.current.transactions[0].amount).toBe(0.1)
  })

  it('prevents withdrawal when insufficient balance', async () => {
    const { result } = renderHook(() => useVault('test-user'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await expect(result.current.withdraw({
      amount: 10, // More than balance
      method: 'bitcoin',
      destination: 'bc1test',
      userId: 'test-user'
    })).rejects.toThrow('Insufficient balance')
  })

  it('handles yield claim correctly', async () => {
    const { result } = renderHook(() => useVault('test-user'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const initialBalance = result.current.vault?.balance || 0
    const initialYield = result.current.vault?.yieldEarned || 0

    await act(async () => {
      const result = await result.current.claimYield()
      expect(result.success).toBe(true)
      expect(result.amount).toBe(initialYield)
    })

    expect(result.current.vault?.balance).toBe(initialBalance + initialYield)
    expect(result.current.vault?.yieldEarned).toBe(0)
    expect(result.current.transactions[0].type).toBe('yield')
  })

  it('prevents yield claim when no yield available', async () => {
    const { result } = renderHook(() => useVault('test-user'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Manually set yield to 0
    if (result.current.vault) {
      result.current.vault.yieldEarned = 0
    }

    await expect(result.current.claimYield()).rejects.toThrow('No yield to claim')
  })

  it('handles auto-refresh correctly', async () => {
    jest.useFakeTimers()

    const { result } = renderHook(() =>
      useVault('test-user', { autoRefresh: true, refreshInterval: 1000 })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Should trigger refetch
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    jest.useRealTimers()
  })

  it('does not auto-refresh when disabled', async () => {
    jest.useFakeTimers()

    const { result } = renderHook(() =>
      useVault('test-user', { autoRefresh: false })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    // Should not trigger refetch
    expect(result.current.loading).toBe(false)

    jest.useRealTimers()
  })

  it('handles refetch manually', async () => {
    const { result } = renderHook(() => useVault('test-user'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.refetch()
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('does not fetch without userId', () => {
    renderHook(() => useVault(''))

    // Should not attempt to fetch without userId
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('handles Bitcoin deposits correctly', async () => {
    const { result } = renderHook(() => useVault('test-user'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deposit({
        amount: 0.5,
        method: 'bitcoin',
        userId: 'test-user'
      })
    })

    expect(result.current.transactions[0].description).toBe('Bitcoin deposit')
    expect(result.current.transactions[0].fees).toBe(0.00001)
  })

  it('handles Lightning deposits correctly', async () => {
    const { result } = renderHook(() => useVault('test-user'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deposit({
        amount: 0.25,
        method: 'lightning',
        userId: 'test-user'
      })
    })

    expect(result.current.transactions[0].description).toBe('Lightning deposit')
    expect(result.current.transactions[0].fees).toBe(0.000001)
  })
})