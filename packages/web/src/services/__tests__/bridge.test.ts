import { BridgeServiceImplementation, MockBridgeService } from '../bridge'
import { BridgeQuote, BridgeDeposit, BridgeWithdrawal, BridgeTransaction } from '@/types/atomiq'

// Mock fetch for real service
global.fetch = jest.fn()

describe('BridgeService', () => {
  let service: BridgeServiceImplementation
  let mockService: MockBridgeService

  beforeEach(() => {
    service = new BridgeServiceImplementation(
      'https://bridge.atomiq.com',
      '0x1234567890abcdef'
    )
    mockService = new MockBridgeService()
    jest.clearAllMocks()
  })

  describe('Real Bridge Service', () => {
    describe('getQuote', () => {
      it('should fetch bridge quote', async () => {
        const mockQuote = {
          from_chain: 'bitcoin',
          to_chain: 'starknet',
          amount: 100000000,
          output_amount: 99890000,
          fees: {
            bridge: 100000,
            network: 10000
          },
          estimated_time: 1800,
          rate: 0.9989
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockQuote
        })

        const quote = await service.getQuote('bitcoin', 'starknet', 0.001)

        expect(quote.fromChain).toBe('bitcoin')
        expect(quote.toChain).toBe('starknet')
        expect(quote.amount).toBe(0.001)
        expect(quote.outputAmount).toBe(0.0009989)
        expect(quote.fees.bridge).toBe(0.000001)
        expect(quote.fees.network).toBe(0.0000001)
        expect(quote.estimatedTime).toBe(1800)
      })

      it('should handle API errors', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Invalid parameters' })
        })

        await expect(service.getQuote('bitcoin', 'starknet', 0.001)).rejects.toThrow()
      })
    })

    describe('createDeposit', () => {
      it('should create bridge deposit', async () => {
        const mockQuote = {
          from_chain: 'bitcoin',
          to_chain: 'starknet',
          amount: 100000000,
          output_amount: 99890000
        }

        const mockDeposit = {
          deposit_id: 'deposit_123',
          quote: mockQuote,
          deposit_address: 'tb1qtestaddress',
          memo: 'crossbtc_123',
          expiry: 1640995200 + 3600,
          created_at: 1640995200
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockDeposit
        })

        const quote = {
          fromChain: 'bitcoin',
          toChain: 'starknet',
          amount: 0.001,
          outputAmount: 0.0009989,
          fees: { bridge: 0.000001, network: 0.0000001, total: 0.0000011 },
          estimatedTime: 1800,
          rate: 0.9989
        }

        const deposit = await service.createDeposit(quote)

        expect(deposit.id).toBe('deposit_123')
        expect(deposit.depositAddress).toBe('tb1qtestaddress')
        expect(deposit.quote).toEqual(quote)
        expect(deposit.status).toBe('pending')
      })
    })

    describe('createWithdrawal', () => {
      it('should create bridge withdrawal', async () => {
        const mockWithdrawal = {
          withdrawal_id: 'withdrawal_123',
          amount: 100000000,
          destination: 'tb1qdestination',
          status: 'pending',
          created_at: 1640995200,
          fees: {
            bridge: 100000,
            network: 10000
          }
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockWithdrawal
        })

        const withdrawal = await service.createWithdrawal(0.001, 'tb1qdestination')

        expect(withdrawal.id).toBe('withdrawal_123')
        expect(withdrawal.amount).toBe(0.001)
        expect(withdrawal.destination).toBe('tb1qdestination')
        expect(withdrawal.status).toBe('pending')
      })
    })

    describe('getTransaction', () => {
      it('should fetch transaction details', async () => {
        const mockTransaction = {
          id: 'tx_123',
          from_chain: 'bitcoin',
          to_chain: 'starknet',
          amount: 100000000,
          status: 'completed',
          created_at: 1640995200,
          completed_at: 1640997000,
          tx_hash: '0xabcdef1234567890',
          fees: {
            bridge: 100000,
            network: 10000
          }
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockTransaction
        })

        const transaction = await service.getTransaction('tx_123')

        expect(transaction.id).toBe('tx_123')
        expect(transaction.fromChain).toBe('bitcoin')
        expect(transaction.toChain).toBe('starknet')
        expect(transaction.amount).toBe(0.001)
        expect(transaction.status).toBe('completed')
        expect(transaction.txHash).toBe('0xabcdef1234567890')
      })
    })

    describe('validateBitcoinAddress', () => {
      it('should validate Bitcoin addresses', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ is_valid: true })
        })

        const isValid = await service.validateBitcoinAddress('tb1qtestaddress')

        expect(isValid).toBe(true)
      })

      it('should reject invalid addresses', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ is_valid: false })
        })

        const isValid = await service.validateBitcoinAddress('invalid')

        expect(isValid).toBe(false)
      })
    })
  })

  describe('Mock Bridge Service', () => {
    describe('getQuote', () => {
      it('should return mock bridge quote', async () => {
        const quote = await mockService.getQuote('bitcoin', 'starknet', 0.001)

        expect(quote).toHaveProperty('fromChain')
        expect(quote).toHaveProperty('toChain')
        expect(quote).toHaveProperty('amount')
        expect(quote).toHaveProperty('outputAmount')
        expect(quote).toHaveProperty('fees')
        expect(quote).toHaveProperty('estimatedTime')
        expect(quote).toHaveProperty('rate')

        expect(quote.fromChain).toBe('bitcoin')
        expect(quote.toChain).toBe('starknet')
        expect(quote.amount).toBe(0.001)
        expect(quote.outputAmount).toBeLessThan(quote.amount)
      })
    })

    describe('createDeposit', () => {
      it('should create mock bridge deposit', async () => {
        const quote = {
          fromChain: 'bitcoin',
          toChain: 'starknet',
          amount: 0.001,
          outputAmount: 0.0009989,
          fees: { bridge: 0.000001, network: 0.0000001, total: 0.0000011 },
          estimatedTime: 1800,
          rate: 0.9989
        }

        const deposit = await mockService.createDeposit(quote)

        expect(deposit).toHaveProperty('id')
        expect(deposit).toHaveProperty('quote')
        expect(deposit).toHaveProperty('depositAddress')
        expect(deposit).toHaveProperty('status')
        expect(deposit).toHaveProperty('createdAt')
        expect(deposit.quote).toEqual(quote)
        expect(deposit.status).toBe('pending')
      })
    })

    describe('createWithdrawal', () => {
      it('should create mock bridge withdrawal', async () => {
        const withdrawal = await mockService.createWithdrawal(0.001, 'tb1qdestination')

        expect(withdrawal).toHaveProperty('id')
        expect(withdrawal).toHaveProperty('amount')
        expect(withdrawal).toHaveProperty('destination')
        expect(withdrawal).toHaveProperty('status')
        expect(withdrawal).toHaveProperty('createdAt')
        expect(withdrawal).toHaveProperty('fees')

        expect(withdrawal.amount).toBe(0.001)
        expect(withdrawal.destination).toBe('tb1qdestination')
        expect(withdrawal.status).toBe('pending')
      })
    })

    describe('getTransaction', () => {
      it('should return mock transaction', async () => {
        const transaction = await mockService.getTransaction('tx_123')

        expect(transaction).toHaveProperty('id')
        expect(transaction).toHaveProperty('fromChain')
        expect(transaction).toHaveProperty('toChain')
        expect(transaction).toHaveProperty('amount')
        expect(transaction).toHaveProperty('status')
        expect(transaction).toHaveProperty('createdAt')
        expect(transaction).toHaveProperty('fees')

        expect(transaction.id).toBe('tx_123')
        expect(['bitcoin', 'starknet']).toContain(transaction.fromChain)
        expect(['bitcoin', 'starknet']).toContain(transaction.toChain)
      })
    })

    describe('validateBitcoinAddress', () => {
      it('should validate correct Bitcoin addresses', async () => {
        const validAddresses = [
          'tb1qtestaddress123456789',
          '1testaddress123456789',
          '3testaddress123456789'
        ]

        for (const address of validAddresses) {
          const isValid = await mockService.validateBitcoinAddress(address)
          expect(isValid).toBe(true)
        }
      })

      it('should reject invalid Bitcoin addresses', async () => {
        const invalidAddresses = [
          'invalid',
          '0x1234567890abcdef',
          'short',
          ''
        ]

        for (const address of invalidAddresses) {
          const isValid = await mockService.validateBitcoinAddress(address)
          expect(isValid).toBe(false)
        }
      })
    })

    describe('validateStarknetAddress', () => {
      it('should validate correct Starknet addresses', async () => {
        const validAddresses = [
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
        ]

        for (const address of validAddresses) {
          const isValid = await mockService.validateStarknetAddress(address)
          expect(isValid).toBe(true)
        }
      })

      it('should reject invalid Starknet addresses', async () => {
        const invalidAddresses = [
          'invalid',
          '0x123',
          'tb1qtestaddress',
          ''
        ]

        for (const address of invalidAddresses) {
          const isValid = await mockService.validateStarknetAddress(address)
          expect(isValid).toBe(false)
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(service.getQuote('bitcoin', 'starknet', 0.001)).rejects.toThrow()
    })

    it('should handle invalid JSON responses', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        }
      })

      await expect(service.getQuote('bitcoin', 'starknet', 0.001)).rejects.toThrow()
    })

    it('should handle authentication errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      })

      await expect(service.createDeposit({} as BridgeQuote)).rejects.toThrow()
    })

    it('should handle rate limiting', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' })
      })

      await expect(service.getQuote('bitcoin', 'starknet', 0.001)).rejects.toThrow()
    })
  })
})