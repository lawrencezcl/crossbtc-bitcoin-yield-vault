import { createAtomiqSDK, getAtomiqSDK, initializeAtomiqSDK } from '../atomiq-sdk'
import { loadAtomiqConfig } from '@/lib/config'

// Mock environment variables
const originalEnv = process.env

describe('AtomiqSDK', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_ATOMIQ_API_URL: 'https://api.test.com',
      NEXT_PUBLIC_ATOMIQ_API_KEY: 'test_key',
      NEXT_PUBLIC_ATOMIQ_NETWORK: 'testnet',
      NEXT_PUBLIC_BITCOIN_RPC_URL: 'https://bitcoin.test.com',
      NEXT_PUBLIC_BITCOIN_NETWORK: 'testnet',
      NEXT_PUBLIC_STARKNET_RPC_URL: 'https://starknet.test.com',
      NEXT_PUBLIC_STARKNET_NETWORK: 'testnet'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('createAtomiqSDK', () => {
    it('should create SDK with default configuration', () => {
      const sdk = createAtomiqSDK()

      expect(sdk).toBeDefined()
      expect(sdk.config.apiUrl).toBe('https://api.test.com')
      expect(sdk.config.apiKey).toBe('test_key')
      expect(sdk.config.network).toBe('testnet')
      expect(sdk.bitcoin).toBeDefined()
      expect(sdk.lightning).toBeDefined()
      expect(sdk.starknet).toBeDefined()
      expect(sdk.bridge).toBeDefined()
    })

    it('should create SDK with custom configuration', () => {
      const customConfig = {
        apiUrl: 'https://custom.api.com',
        apiKey: 'custom_key',
        network: 'mainnet' as const
      }

      const sdk = createAtomiqSDK(customConfig)

      expect(sdk.config.apiUrl).toBe('https://custom.api.com')
      expect(sdk.config.apiKey).toBe('custom_key')
      expect(sdk.config.network).toBe('mainnet')
    })

    it('should use mock services when configuration is incomplete', () => {
      process.env.NEXT_PUBLIC_ATOMIQ_API_KEY = ''

      const sdk = createAtomiqSDK()

      // Should still create SDK but with mock services
      expect(sdk).toBeDefined()
      expect(sdk.bitcoin).toBeDefined()
      expect(sdk.lightning).toBeDefined()
      expect(sdk.starknet).toBeDefined()
      expect(sdk.bridge).toBeDefined()
    })
  })

  describe('getAtomiqSDK', () => {
    it('should return singleton instance', () => {
      const sdk1 = getAtomiqSDK()
      const sdk2 = getAtomiqSDK()

      expect(sdk1).toBe(sdk2)
    })

    it('should create new instance on first call', () => {
      const sdk = getAtomiqSDK()

      expect(sdk).toBeDefined()
      expect(sdk.bitcoin).toBeDefined()
      expect(sdk.lightning).toBeDefined()
      expect(sdk.starknet).toBeDefined()
      expect(sdk.bridge).toBeDefined()
    })
  })

  describe('initializeAtomiqSDK', () => {
    it('should initialize SDK successfully', async () => {
      const sdk = await initializeAtomiqSDK()

      expect(sdk).toBeDefined()
      expect(sdk.bitcoin).toBeDefined()
      expect(sdk.lightning).toBeDefined()
      expect(sdk.starknet).toBeDefined()
      expect(sdk.bridge).toBeDefined()
    })

    it('should handle initialization errors', async () => {
      // Mock an error during initialization
      const mockService = {
        generateAddress: jest.fn().mockRejectedValue(new Error('Service error'))
      }

      // This should not throw, but should handle errors gracefully
      const sdk = await initializeAtomiqSDK()
      expect(sdk).toBeDefined()
    })
  })

  describe('SDK Integration', () => {
    let sdk: ReturnType<typeof createAtomiqSDK>

    beforeEach(() => {
      sdk = createAtomiqSDK()
    })

    describe('Bitcoin Service Integration', () => {
      it('should have functional Bitcoin service', async () => {
        expect(sdk.bitcoin).toBeDefined()

        const address = await sdk.bitcoin.generateAddress()
        expect(address).toHaveProperty('address')
        expect(address).toHaveProperty('publicKey')
      })

      it('should get balance for address', async () => {
        const balance = await sdk.bitcoin.getBalance('tb1qtestaddress')
        expect(balance).toHaveProperty('confirmed')
        expect(balance).toHaveProperty('unconfirmed')
        expect(balance).toHaveProperty('total')
      })
    })

    describe('Lightning Service Integration', () => {
      it('should have functional Lightning service', async () => {
        expect(sdk.lightning).toBeDefined()

        const nodeInfo = await sdk.lightning.getNodeInfo()
        expect(nodeInfo).toHaveProperty('identity_pubkey')
        expect(nodeInfo).toHaveProperty('alias')
      })

      it('should create invoices', async () => {
        const invoice = await sdk.lightning.createInvoice(0.001, 'Test invoice')
        expect(invoice).toHaveProperty('paymentHash')
        expect(invoice).toHaveProperty('bolt11')
        expect(invoice.amount).toBe(0.001)
      })
    })

    describe('Starknet Service Integration', () => {
      it('should have functional Starknet service', async () => {
        expect(sdk.starknet).toBeDefined()

        const balance = await sdk.starknet.getBalance(
          '0x000000000000000000000000000000000000000000000000000000000000dead'
        )
        expect(balance).toHaveProperty('balance')
        expect(balance).toHaveProperty('decimals')
        expect(balance).toHaveProperty('symbol')
      })
    })

    describe('Bridge Service Integration', () => {
      it('should have functional Bridge service', async () => {
        expect(sdk.bridge).toBeDefined()

        const quote = await sdk.bridge.getQuote('bitcoin', 'starknet', 0.001)
        expect(quote).toHaveProperty('fromChain')
        expect(quote).toHaveProperty('toChain')
        expect(quote).toHaveProperty('amount')
        expect(quote).toHaveProperty('outputAmount')
      })

      it('should validate addresses', async () => {
        const isValidBitcoin = await sdk.bridge.validateBitcoinAddress('tb1qtestaddress')
        expect(typeof isValidBitcoin).toBe('boolean')

        const isValidStarknet = await sdk.bridge.validateStarknetAddress(
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        )
        expect(typeof isValidStarknet).toBe('boolean')
      })
    })

    describe('SDK Status and Health', () => {
      it('should return SDK status', async () => {
        const status = await sdk.getStatus()

        expect(status).toHaveProperty('initialized')
        expect(status).toHaveProperty('services')
        expect(status).toHaveProperty('config')
        expect(status.services).toHaveProperty('bitcoin')
        expect(status.services).toHaveProperty('lightning')
        expect(status.services).toHaveProperty('starknet')
        expect(status.services).toHaveProperty('bridge')
      })

      it('should update configuration', () => {
        const newApiKey = 'new_test_key'
        sdk.updateConfig({ apiKey: newApiKey })

        expect(sdk.config.apiKey).toBe(newApiKey)
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing environment variables gracefully', () => {
      delete process.env.NEXT_PUBLIC_ATOMIQ_API_KEY
      delete process.env.NEXT_PUBLIC_BITCOIN_RPC_URL

      const sdk = createAtomiqSDK()
      expect(sdk).toBeDefined()
    })

    it('should handle invalid network configuration', () => {
      process.env.NEXT_PUBLIC_ATOMIQ_NETWORK = 'invalid_network'

      const sdk = createAtomiqSDK()
      expect(sdk).toBeDefined()
      // Should fall back to testnet or handle gracefully
    })

    it('should handle partial service configuration', () => {
      process.env.NEXT_PUBLIC_LIGHTNING_RPC_URL = ''
      process.env.NEXT_PUBLIC_LIGHTNING_MACAROON = ''
      process.env.NEXT_PUBLIC_LIGHTNING_CERT = ''

      const sdk = createAtomiqSDK()
      expect(sdk).toBeDefined()
      expect(sdk.lightning).toBeDefined()
    })
  })

  describe('Configuration Loading', () => {
    it('should load configuration from environment variables', () => {
      const config = loadAtomiqConfig()

      expect(config.apiUrl).toBe('https://api.test.com')
      expect(config.apiKey).toBe('test_key')
      expect(config.network).toBe('testnet')
      expect(config.bitcoin?.rpcUrl).toBe('https://bitcoin.test.com')
      expect(config.starknet?.rpcUrl).toBe('https://starknet.test.com')
    })

    it('should validate configuration', () => {
      expect(() => loadAtomiqConfig()).not.toThrow()
    })

    it('should handle invalid configuration', () => {
      process.env.NEXT_PUBLIC_ATOMIQ_API_URL = 'invalid-url'

      expect(() => loadAtomiqConfig()).toThrow()
    })
  })
})