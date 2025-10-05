import {
  AtomiqSDK,
  AtomiqConfig,
  BitcoinService,
  LightningService,
  StarknetService,
  BridgeService
} from '@/types/atomiq'
import { createBitcoinService, MockBitcoinService } from './bitcoin'
import { createLightningService, MockLightningService } from './lightning'
import { createStarknetService, MockStarknetService } from './starknet'
import { createBridgeService, MockBridgeService } from './bridge'

export class AtomiqSDKImplementation implements AtomiqSDK {
  public readonly bitcoin: BitcoinService
  public readonly lightning: LightningService
  public readonly starknet: StarknetService
  public readonly bridge: BridgeService
  public readonly config: AtomiqConfig

  constructor(config: AtomiqConfig) {
    this.config = config

    // Initialize services based on configuration and environment
    if (this.shouldUseMockServices()) {
      this.bitcoin = new MockBitcoinService()
      this.lightning = new MockLightningService()
      this.starknet = new MockStarknetService()
      this.bridge = new MockBridgeService()
    } else {
      this.bitcoin = createBitcoinService(
        config.bitcoin?.rpcUrl,
        config.bitcoin?.network
      )
      this.lightning = createLightningService(
        config.lightning?.rpcUrl,
        config.lightning?.macaroon,
        config.lightning?.cert
      )
      this.starknet = createStarknetService(
        config.starknet?.rpcUrl,
        config.starknet?.network
      )
      this.bridge = createBridgeService(
        config.bridge?.apiUrl,
        config.bridge?.contractAddress
      )
    }
  }

  /**
   * Initialize the SDK and verify all services are working
   */
  async initialize(): Promise<void> {
    try {
      // Test Bitcoin service
      await this.bitcoin.generateAddress()

      // Test Lightning service if configured
      if (this.config.lightning) {
        await this.lightning.getNodeInfo()
      }

      // Test Starknet service
      const starknetBalance = await this.starknet.getBalance(
        '0x000000000000000000000000000000000000000000000000000000000000dead'
      )

      // Test Bridge service
      await this.bridge.getQuote('bitcoin', 'starknet', 0.01)

      console.log('Atomiq SDK initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Atomiq SDK:', error)
      throw error
    }
  }

  /**
   * Get SDK status and health check
   */
  async getStatus(): Promise<{
    initialized: boolean
    services: {
      bitcoin: boolean
      lightning: boolean
      starknet: boolean
      bridge: boolean
    }
    config: AtomiqConfig
  }> {
    const status = {
      initialized: true,
      services: {
        bitcoin: false,
        lightning: false,
        starknet: false,
        bridge: false
      },
      config: this.config
    }

    try {
      // Test Bitcoin service
      await this.bitcoin.generateAddress()
      status.services.bitcoin = true
    } catch (error) {
      console.error('Bitcoin service health check failed:', error)
    }

    try {
      // Test Lightning service if configured
      if (this.config.lightning) {
        await this.lightning.getNodeInfo()
        status.services.lightning = true
      } else {
        status.services.lightning = true // Not configured, consider healthy
      }
    } catch (error) {
      console.error('Lightning service health check failed:', error)
    }

    try {
      // Test Starknet service
      await this.starknet.getBalance(
        '0x000000000000000000000000000000000000000000000000000000000000dead'
      )
      status.services.starknet = true
    } catch (error) {
      console.error('Starknet service health check failed:', error)
    }

    try {
      // Test Bridge service
      await this.bridge.getQuote('bitcoin', 'starknet', 0.01)
      status.services.bridge = true
    } catch (error) {
      console.error('Bridge service health check failed:', error)
    }

    status.initialized = Object.values(status.services).every(Boolean)
    return status
  }

  /**
   * Update SDK configuration
   */
  updateConfig(newConfig: Partial<AtomiqConfig>): void {
    Object.assign(this.config, newConfig)
  }

  private shouldUseMockServices(): boolean {
    // Use mock services in development or when critical config is missing
    const isDevelopment = process.env.NODE_ENV === 'development'
    const hasIncompleteConfig = !this.config.apiKey || !this.config.bitcoin?.rpcUrl

    return isDevelopment || hasIncompleteConfig
  }
}

/**
 * Create and configure the Atomiq SDK
 */
export function createAtomiqSDK(config?: Partial<AtomiqConfig>): AtomiqSDK {
  const defaultConfig: AtomiqConfig = {
    apiUrl: process.env.NEXT_PUBLIC_ATOMIQ_API_URL || 'https://api.atomiq.com',
    apiKey: process.env.NEXT_PUBLIC_ATOMIQ_API_KEY || '',
    network: (process.env.NEXT_PUBLIC_ATOMIQ_NETWORK as 'mainnet' | 'testnet') || 'testnet',
    bitcoin: {
      rpcUrl: process.env.NEXT_PUBLIC_BITCOIN_RPC_URL || 'https://blockstream.info/testnet/api',
      network: (process.env.NEXT_PUBLIC_BITCOIN_NETWORK as 'mainnet' | 'testnet') || 'testnet'
    },
    lightning: {
      rpcUrl: process.env.NEXT_PUBLIC_LIGHTNING_RPC_URL || '',
      macaroon: process.env.NEXT_PUBLIC_LIGHTNING_MACAROON || '',
      cert: process.env.NEXT_PUBLIC_LIGHTNING_CERT || ''
    },
    starknet: {
      network: (process.env.NEXT_PUBLIC_STARKNET_NETWORK as 'mainnet' | 'testnet') || 'testnet',
      rpcUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || 'https://starknet-testnet.infura.io/v3/your_infura_key'
    },
    bridge: {
      apiUrl: process.env.NEXT_PUBLIC_BRIDGE_API_URL || 'https://bridge.atomiq.com',
      contractAddress: process.env.NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS || ''
    }
  }

  const finalConfig = { ...defaultConfig, ...config }
  return new AtomiqSDKImplementation(finalConfig)
}

/**
 * Global SDK instance (singleton pattern)
 */
let globalSDKInstance: AtomiqSDK | null = null

/**
 * Get the global SDK instance
 */
export function getAtomiqSDK(config?: Partial<AtomiqConfig>): AtomiqSDK {
  if (!globalSDKInstance) {
    globalSDKInstance = createAtomiqSDK(config)
  }
  return globalSDKInstance
}

/**
 * Initialize the global SDK instance
 */
export async function initializeAtomiqSDK(config?: Partial<AtomiqConfig>): Promise<AtomiqSDK> {
  const sdk = getAtomiqSDK(config)
  await sdk.initialize()
  return sdk
}

/**
 * SDK React Hook for easy integration
 */
export function useAtomiqSDK(): AtomiqSDK {
  const sdk = getAtomiqSDK()
  return sdk
}

/**
 * SDK Provider for React context
 */
import { createContext, useContext, ReactNode } from 'react'

const AtomiqSDKContext = createContext<AtomiqSDK | null>(null)

interface AtomiqSDKProviderProps {
  children: ReactNode
  config?: Partial<AtomiqSDK>
  onInitialized?: (sdk: AtomiqSDK) => void
  onError?: (error: Error) => void
}

export function AtomiqSDKProvider({
  children,
  config,
  onInitialized,
  onError
}: AtomiqSDKProviderProps) {
  const [sdk, setSDK] = React.useState<AtomiqSDK | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const initializeSDK = async () => {
      try {
        setLoading(true)
        setError(null)

        const atomiqSDK = createAtomiqSDK(config)
        await atomiqSDK.initialize()

        setSDK(atomiqSDK)
        setLoading(false)
        onInitialized?.(atomiqSDK)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize SDK')
        setError(error)
        setLoading(false)
        onError?.(error)
      }
    }

    initializeSDK()
  }, [config, onInitialized, onError])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bitcoin-500"></div>
        <span className="ml-2 text-muted-foreground">Initializing Atomiq SDK...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-2">Failed to initialize Atomiq SDK</div>
        <div className="text-sm text-muted-foreground">{error.message}</div>
      </div>
    )
  }

  return (
    <AtomiqSDKContext.Provider value={sdk}>
      {children}
    </AtomiqSDKContext.Provider>
  )
}

/**
 * Hook to access the SDK from context
 */
export function useAtomiqSDKContext(): AtomiqSDK {
  const sdk = useContext(AtomiqSDKContext)
  if (!sdk) {
    throw new Error('useAtomiqSDKContext must be used within an AtomiqSDKProvider')
  }
  return sdk
}