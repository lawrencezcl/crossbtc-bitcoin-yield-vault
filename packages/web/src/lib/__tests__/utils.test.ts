import {
  isValidBitcoinAddress,
  isValidLightningInvoice,
  satoshiToBTC,
  btcToSatoshi,
  formatCurrency,
  formatPercentage,
  timeAgo,
  copyToClipboard,
  generateId,
  debounce
} from '../utils'

describe('Utils', () => {
  describe('isValidBitcoinAddress', () => {
    it('validates bech32 addresses correctly', () => {
      expect(isValidBitcoinAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')).toBe(true)
      expect(isValidBitcoinAddress('tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')).toBe(true)
      expect(isValidBitcoinAddress('BC1QXY2KGDYGJRSQTZQ2N0YRF2493P83KKFJHX0WLH')).toBe(true)
    })

    it('validates legacy addresses correctly', () => {
      expect(isValidBitcoinAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true)
      expect(isValidBitcoinAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true)
    })

    it('rejects invalid addresses', () => {
      expect(isValidBitcoinAddress('invalid')).toBe(false)
      expect(isValidBitcoinAddress('bc1invalid')).toBe(false)
      expect(isValidBitcoinAddress('')).toBe(false)
      expect(isValidBitcoinAddress('0x1234567890123456789012345678901234567890')).toBe(false)
    })
  })

  describe('isValidLightningInvoice', () => {
    it('validates BOLT11 invoices correctly', () => {
      expect(isValidLightningInvoice('lnbc2500u1p3kjx6gpp5qw3d7qf0e3h0j0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0f0xq0p3kjx6g')).toBe(true)
    })

    it('rejects invalid invoices', () => {
      expect(isValidLightningInvoice('invalid')).toBe(false)
      expect(isValidLightningInvoice('')).toBe(false)
      expect(isValidLightningInvoice('lnbcinvalid')).toBe(false)
    })
  })

  describe('satoshiToBTC', () => {
    it('converts satoshi to BTC correctly', () => {
      expect(satoshiToBTC(100000000)).toBe('1.00000000')
      expect(satoshiToBTC(50000000)).toBe('0.50000000')
      expect(satoshiToBTC(1)).toBe('0.00000001')
      expect(satoshiToBTC(0)).toBe('0.00000000')
    })
  })

  describe('btcToSatoshi', () => {
    it('converts BTC to satoshi correctly', () => {
      expect(btcToSatoshi(1)).toBe(100000000)
      expect(btcToSatoshi(0.5)).toBe(50000000)
      expect(btcToSatoshi(0.00000001)).toBe(1)
      expect(btcToSatoshi(0)).toBe(0)
    })

    it('handles decimal precision correctly', () => {
      expect(btcToSatoshi(1.123456789)).toBe(112345678)
      expect(btcToSatoshi(0.999999999)).toBe(99999999)
    })
  })

  describe('formatCurrency', () => {
    it('formats BTC correctly', () => {
      expect(formatCurrency(1.23456789, 'BTC')).toBe('1.23456789 BTC')
      expect(formatCurrency(0.00000001, 'BTC')).toBe('0.00000001 BTC')
    })

    it('formats USD correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
      expect(formatCurrency(0, 'USD')).toBe('$0.00')
    })

    it('uses custom decimals', () => {
      expect(formatCurrency(1.23456789, 'BTC', 4)).toBe('1.2346 BTC')
      expect(formatCurrency(1234.56, 'USD', 0)).toBe('$1,235')
    })
  })

  describe('formatPercentage', () => {
    it('formats percentages correctly', () => {
      expect(formatPercentage(0.075)).toBe('7.50%')
      expect(formatPercentage(0.5)).toBe('50.00%')
      expect(formatPercentage(0.001)).toBe('0.10%')
      expect(formatPercentage(1)).toBe('100.00%')
    })

    it('uses custom decimals', () => {
      expect(formatPercentage(0.075, 0)).toBe('8%')
      expect(formatPercentage(0.075, 4)).toBe('7.5000%')
    })
  })

  describe('timeAgo', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('shows correct relative times', () => {
      expect(timeAgo(new Date('2024-01-01T12:00:30Z'))).toBe('just now')
      expect(timeAgo(new Date('2024-01-01T11:30:00Z'))).toBe('30 minutes ago')
      expect(timeAgo(new Date('2024-01-01T08:00:00Z'))).toBe('4 hours ago')
      expect(timeAgo(new Date('2023-12-30T12:00:00Z'))).toBe('2 days ago')
      expect(timeAgo(new Date('2023-11-01T12:00:00Z'))).toBe('2 months ago')
    })
  })

  describe('copyToClipboard', () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined)
        }
      })
    })

    it('copies text to clipboard successfully', async () => {
      const result = await copyToClipboard('test text')

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text')
      expect(result).toBe(true)
    })

    it('handles clipboard errors', async () => {
      navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'))

      const result = await copyToClipboard('test text')

      expect(result).toBe(false)
    })
  })

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })

    it('generates IDs with expected format', () => {
      const id = generateId()

      // Should contain alphanumeric characters
      expect(/^[a-z0-9]+$/.test(id)).toBe(true)
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('delays function execution', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('cancels previous calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('passes arguments correctly', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2')
      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })
})