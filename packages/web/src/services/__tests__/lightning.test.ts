import { LightningServiceImplementation, MockLightningService } from '../lightning'
import { LightningNodeInfo, LightningChannel, LightningPayment, LightningInvoice } from '@/types/atomiq'

// Mock fetch for real service
global.fetch = jest.fn()

describe('LightningService', () => {
  let service: LightningServiceImplementation
  let mockService: MockLightningService

  beforeEach(() => {
    service = new LightningServiceImplementation(
      'https://lightning-node:8080',
      'test_macaroon',
      'test_cert'
    )
    mockService = new MockLightningService()
    jest.clearAllMocks()
  })

  describe('Real Lightning Service', () => {
    describe('getNodeInfo', () => {
      it('should fetch node information', async () => {
        const mockNodeInfo = {
          identity_pubkey: '0x1234567890abcdef',
          alias: 'test-node',
          color: '#f7931a',
          num_peers: 5,
          num_pending_channels: 1,
          num_active_channels: 3,
          num_inactive_channels: 0,
          block_height: 123456,
          block_hash: '0xabcdef1234567890',
          best_header_timestamp: '1640995200',
          synced_to_chain: true,
          testnet: true,
          chains: [{ chain: 'bitcoin', network: 'testnet' }]
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockNodeInfo
        })

        const nodeInfo = await service.getNodeInfo()

        expect(nodeInfo.identity_pubkey).toBe('0x1234567890abcdef')
        expect(nodeInfo.alias).toBe('test-node')
        expect(nodeInfo.num_active_channels).toBe(3)
        expect(nodeInfo.synced_to_chain).toBe(true)
      })

      it('should handle API errors', async () => {
        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' })
        })

        await expect(service.getNodeInfo()).rejects.toThrow()
      })
    })

    describe('createInvoice', () => {
      it('should create a Lightning invoice', async () => {
        const mockInvoice = {
          r_hash: '0xabcdef1234567890',
          payment_request: 'lnbcrt1mockinvoice',
          value: 100000000,
          creation_date: 1640995200,
          expiry: 3600,
          memo: 'Test invoice',
          settled: false
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockInvoice
        })

        const invoice = await service.createInvoice(0.001, 'Test invoice')

        expect(invoice.paymentHash).toBe('0xabcdef1234567890')
        expect(invoice.amount).toBe(0.001)
        expect(invoice.bolt11).toBe('lnbcrt1mockinvoice')
        expect(invoice.memo).toBe('Test invoice')
        expect(invoice.status).toBe('pending')
      })
    })

    describe('payInvoice', () => {
      it('should pay a Lightning invoice', async () => {
        const mockPayment = {
          payment: {
            payment_hash: '0x1234567890abcdef',
            value: 100000000,
            creation_date: 1640995200,
            fee: 1000,
            payment_preimage: '0xfedcba0987654321',
            value_sat: 100000000,
            value_msat: '100000000000',
            payment_request: 'lnbcrt1mockinvoice',
            status: 'SUCCEEDED',
            fee_sat: 1000,
            fee_msat: '1000000',
            creation_time_ns: '1640995200000000000',
            htlcs: []
          }
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockPayment
        })

        const payment = await service.payInvoice('lnbcrt1mockinvoice')

        expect(payment.payment_hash).toBe('0x1234567890abcdef')
        expect(payment.status).toBe('SUCCEEDED')
        expect(payment.value).toBe(100000000)
        expect(payment.fee).toBe(1000)
      })
    })

    describe('getBalance', () => {
      it('should fetch wallet balance', async () => {
        const mockBalance = {
          confirmed_balance: 50000000,
          unconfirmed_balance: 10000000
        }

        ;(fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockBalance
        })

        const balance = await service.getBalance()

        expect(balance.balance).toBe(0.05)
        expect(balance.pending_balance).toBe(0.01)
      })
    })
  })

  describe('Mock Lightning Service', () => {
    describe('getNodeInfo', () => {
      it('should return mock node info', async () => {
        const nodeInfo = await mockService.getNodeInfo()

        expect(nodeInfo).toHaveProperty('identity_pubkey')
        expect(nodeInfo).toHaveProperty('alias')
        expect(nodeInfo).toHaveProperty('num_active_channels')
        expect(nodeInfo).toHaveProperty('synced_to_chain')
        expect(typeof nodeInfo.num_peers).toBe('number')
      })
    })

    describe('createInvoice', () => {
      it('should create a mock invoice', async () => {
        const invoice = await mockService.createInvoice(0.002, 'Test invoice')

        expect(invoice).toHaveProperty('paymentHash')
        expect(invoice).toHaveProperty('bolt11')
        expect(invoice).toHaveProperty('amount')
        expect(invoice).toHaveProperty('status')
        expect(invoice.amount).toBe(0.002)
        expect(invoice.memo).toBe('Test invoice')
        expect(invoice.status).toBe('pending')
      })
    })

    describe('payInvoice', () => {
      it('should pay a mock invoice', async () => {
        const payment = await mockService.payInvoice('lnbcrt1mockinvoice')

        expect(payment).toHaveProperty('payment_hash')
        expect(payment).toHaveProperty('status')
        expect(payment).toHaveProperty('value')
        expect(payment.status).toBe('SUCCEEDED')
        expect(typeof payment.value).toBe('number')
      })
    })

    describe('getBalance', () => {
      it('should return mock balance', async () => {
        const balance = await mockService.getBalance()

        expect(balance).toHaveProperty('balance')
        expect(balance).toHaveProperty('pending_balance')
        expect(typeof balance.balance).toBe('number')
        expect(typeof balance.pending_balance).toBe('number')
      })
    })

    describe('getChannels', () => {
      it('should return mock channels', async () => {
        const channels = await mockService.getChannels()

        expect(Array.isArray(channels)).toBe(true)
        expect(channels.length).toBeGreaterThan(0)

        if (channels.length > 0) {
          const channel = channels[0]
          expect(channel).toHaveProperty('active')
          expect(channel).toHaveProperty('remote_pubkey')
          expect(channel).toHaveProperty('capacity')
          expect(channel).toHaveProperty('local_balance')
          expect(channel).toHaveProperty('remote_balance')
        }
      })
    })

    describe('listPayments', () => {
      it('should return mock payments', async () => {
        const payments = await mockService.listPayments()

        expect(Array.isArray(payments)).toBe(true)
        expect(payments.length).toBeGreaterThanOrEqual(0)

        if (payments.length > 0) {
          const payment = payments[0]
          expect(payment).toHaveProperty('payment_hash')
          expect(payment).toHaveProperty('status')
          expect(payment).toHaveProperty('value')
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(service.getNodeInfo()).rejects.toThrow()
    })

    it('should handle invalid JSON responses', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        }
      })

      await expect(service.getNodeInfo()).rejects.toThrow()
    })

    it('should handle authentication errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      })

      await expect(service.getNodeInfo()).rejects.toThrow()
    })
  })
})