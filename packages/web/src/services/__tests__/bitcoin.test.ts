import { BitcoinServiceImplementation, MockBitcoinService } from '../bitcoin'
import { BitcoinAddress, BitcoinBalance, BitcoinTransaction } from '@/types/atomiq'

// Mock fetch for real service
global.fetch = jest.fn()

describe('BitcoinService', () => {
  let service: BitcoinServiceImplementation
  let mockService: MockBitcoinService

  beforeEach(() => {
    service = new BitcoinServiceImplementation('https://blockstream.info/testnet/api', 'testnet')
    mockService = new MockBitcoinService()
    jest.clearAllMocks()
  })

  describe('Real Bitcoin Service', () => {
    describe('generateAddress', () => {
      it('should generate a valid Bitcoin address', async () => {
        const address = await service.generateAddress()

        expect(address).toHaveProperty('address')
        expect(address).toHaveProperty('publicKey')
        expect(address).toHaveProperty('path')
        expect(address.address).toMatch(/^(tb1|[1-3])[a-zA-HJ-NP-Z0-9]{25,62}$/)
      })

      it('should include private key for generated address', async () => {
        const address = await service.generateAddress()

        expect(address).toHaveProperty('privateKey')
        expect(address.privateKey).toMatch(/^[L|K][a-km-zA-HJ-NP-Z1-9]{51,52}$/)
      })
    })

    describe('getBalance', () => {
      it('should fetch balance for a valid address', async () => {
        const mockResponse = {
          chain_stats: {
            funded_txo_sum: 100000000,
            spent_txo_sum: 50000000
          },
          mempool_stats: {
            funded_txo_sum: 25000000,
            spent_txo_sum: 0
          }
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const balance = await service.getBalance('tb1qtestaddress')

        expect(balance).toEqual({
          confirmed: 0.5,
          unconfirmed: 0.25,
          total: 0.75
        })
      })

      it('should handle API errors', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 404
        })

        await expect(service.getBalance('invalid_address')).rejects.toThrow()
      })
    })

    describe('getTransaction', () => {
      it('should fetch transaction details', async () => {
        const mockTx = {
          txid: 'test_txid',
          version: 1,
          locktime: 0,
          vin: [],
          vout: [{
            scriptpubkey: '0014testscript',
            scriptpubkey_asm: 'OP_0 testscript',
            scriptpubkey_type: 'witness_v0_keyhash',
            value: 100000000
          }],
          size: 250,
          fee: 1000,
          status: {
            confirmed: true,
            block_height: 123456
          }
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockTx
        })

        const transaction = await service.getTransaction('test_txid')

        expect(transaction.txid).toBe('test_txid')
        expect(transaction.fee).toBe(0.00001)
        expect(transaction.status.confirmed).toBe(true)
      })
    })
  })

  describe('Mock Bitcoin Service', () => {
    describe('generateAddress', () => {
      it('should generate a mock Bitcoin address', async () => {
        const address = await mockService.generateAddress()

        expect(address).toHaveProperty('address')
        expect(address).toHaveProperty('publicKey')
        expect(address).toHaveProperty('privateKey')
        expect(address).toHaveProperty('path')
        expect(address.address).toMatch(/^tb1q/)
      })
    })

    describe('getBalance', () => {
      it('should return mock balance data', async () => {
        const balance = await mockService.getBalance('tb1qtestaddress')

        expect(balance).toHaveProperty('confirmed')
        expect(balance).toHaveProperty('unconfirmed')
        expect(balance).toHaveProperty('total')
        expect(typeof balance.confirmed).toBe('number')
        expect(typeof balance.unconfirmed).toBe('number')
        expect(typeof balance.total).toBe('number')
      })
    })

    describe('createTransaction', () => {
      it('should create a mock transaction', async () => {
        const tx = await mockService.createTransaction('tb1qdestination', 0.1, 'tb1qsource')

        expect(tx).toHaveProperty('txid')
        expect(tx).toHaveProperty('version')
        expect(tx).toHaveProperty('vout')
        expect(tx.vout).toHaveLength(1)
        expect(tx.vout[0].value).toBe(10000000) // 0.1 BTC in satoshis
      })
    })

    describe('sendTransaction', () => {
      it('should send a mock transaction', async () => {
        const mockTx = {
          txid: 'mock_tx_123',
          version: 1,
          locktime: 0,
          vin: [],
          vout: [{ scriptpubkey: '0014test', scriptpubkey_asm: '', scriptpubkey_type: 'witness_v0_keyhash', value: 100000000 }],
          size: 250,
          fee: 0.00001,
          status: { confirmed: false }
        }

        const txid = await mockService.sendTransaction(mockTx)

        expect(txid).toBe('mock_tx_123')
      })
    })

    describe('monitorAddress', () => {
      it('should set up address monitoring', async () => {
        const callback = jest.fn()

        mockService.monitorAddress('tb1qtestaddress', callback)

        // Should not throw
        expect(() => mockService.monitorAddress('tb1qtestaddress', callback)).not.toThrow()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(service.getBalance('tb1qtestaddress')).rejects.toThrow()
    })

    it('should handle invalid responses', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' })
      })

      await expect(service.getBalance('tb1qtestaddress')).rejects.toThrow()
    })
  })
})