import { AtomiqConfig } from '@/types/atomiq'

/**
 * Load Atomiq SDK configuration from environment variables
 */
export function loadAtomiqConfig(): AtomiqConfig {
  const config: AtomiqConfig = {
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

  // Validate configuration
  validateConfig(config)

  return config
}

/**
 * Validate Atomiq SDK configuration
 */
export function validateConfig(config: AtomiqConfig): void {
  const errors: string[] = []

  // Check required fields
  if (!config.apiUrl) {
    errors.push('Atomiq API URL is required')
  }

  if (!config.apiKey) {
    errors.push('Atomiq API key is required')
  }

  if (!config.bitcoin?.rpcUrl) {
    errors.push('Bitcoin RPC URL is required')
  }

  if (!config.starknet?.rpcUrl) {
    errors.push('Starknet RPC URL is required')
  }

  // Check Lightning configuration (optional but warn if partially configured)
  const lightningConfigured = [
    config.lightning?.rpcUrl,
    config.lightning?.macaroon,
    config.lightning?.cert
  ].filter(Boolean).length

  if (lightningConfigured > 0 && lightningConfigured < 3) {
    errors.push('Lightning configuration is incomplete. Either provide all Lightning settings or none.')
  }

  // Check network consistency
  const networks = [
    config.network,
    config.bitcoin?.network,
    config.starknet?.network
  ].filter(Boolean) as ('mainnet' | 'testnet')[]

  if (networks.length > 0 && networks.some(n => n !== networks[0])) {
    errors.push('All network configurations must be consistent (all mainnet or all testnet)')
  }

  // Validate URL formats
  if (config.apiUrl && !isValidUrl(config.apiUrl)) {
    errors.push('Invalid Atomiq API URL format')
  }

  if (config.bitcoin?.rpcUrl && !isValidUrl(config.bitcoin.rpcUrl)) {
    errors.push('Invalid Bitcoin RPC URL format')
  }

  if (config.lightning?.rpcUrl && !isValidUrl(config.lightning.rpcUrl)) {
    errors.push('Invalid Lightning RPC URL format')
  }

  if (config.starknet?.rpcUrl && !isValidUrl(config.starknet.rpcUrl)) {
    errors.push('Invalid Starknet RPC URL format')
  }

  if (config.bridge?.apiUrl && !isValidUrl(config.bridge.apiUrl)) {
    errors.push('Invalid Bridge API URL format')
  }

  // Validate addresses
  if (config.bridge?.contractAddress && !isValidStarknetAddress(config.bridge.contractAddress)) {
    errors.push('Invalid Bridge contract address format')
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
  }
}

/**
 * Check if configuration is complete for production
 */
export function isProductionReady(config: AtomiqConfig): boolean {
  return !!(
    config.apiKey &&
    config.bitcoin?.rpcUrl &&
    config.starknet?.rpcUrl &&
    config.bridge?.contractAddress &&
    config.network === 'mainnet' // For production, should be mainnet
  )
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus(config: AtomiqConfig): {
  status: 'complete' | 'partial' | 'minimal'
  services: {
    atomiq: boolean
    bitcoin: boolean
    lightning: boolean
    starknet: boolean
    bridge: boolean
  }
  warnings: string[]
  recommendations: string[]
} {
  const services = {
    atomiq: !!config.apiKey,
    bitcoin: !!config.bitcoin?.rpcUrl,
    lightning: !!(config.lightning?.rpcUrl && config.lightning?.macaroon && config.lightning?.cert),
    starknet: !!config.starknet?.rpcUrl,
    bridge: !!(config.bridge?.apiUrl && config.bridge?.contractAddress)
  }

  const enabledServices = Object.values(services).filter(Boolean).length
  const totalServices = Object.keys(services).length

  let status: 'complete' | 'partial' | 'minimal' = 'minimal'
  if (enabledServices === totalServices) {
    status = 'complete'
  } else if (enabledServices >= 3) {
    status = 'partial'
  }

  const warnings: string[] = []
  const recommendations: string[] = []

  if (!services.atomiq) {
    warnings.push('Atomiq API key not configured - using mock service')
  }

  if (!services.bitcoin) {
    warnings.push('Bitcoin RPC not configured - using mock service')
  }

  if (!services.lightning) {
    recommendations.push('Configure Lightning Network for instant payments')
  }

  if (!services.starknet) {
    warnings.push('Starknet RPC not configured - using mock service')
  }

  if (!services.bridge) {
    recommendations.push('Configure bridge service for cross-chain operations')
  }

  if (config.network === 'testnet') {
    recommendations.push('Consider switching to mainnet for production deployment')
  }

  return {
    status,
    services,
    warnings,
    recommendations
  }
}

// Utility functions

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function isValidStarknetAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address)
}

/**
 * Development configuration helper
 */
export function getDevelopmentConfig(): Partial<AtomiqConfig> {
  return {
    network: 'testnet',
    bitcoin: {
      rpcUrl: 'https://blockstream.info/testnet/api',
      network: 'testnet'
    },
    starknet: {
      network: 'testnet',
      rpcUrl: 'https://starknet-testnet.infura.io/v3/your_infura_key'
    }
  }
}

/**
 * Production configuration helper
 */
export function getProductionConfig(): Partial<AtomiqConfig> {
  return {
    network: 'mainnet',
    bitcoin: {
      rpcUrl: 'https://blockstream.info/api',
      network: 'mainnet'
    },
    starknet: {
      network: 'mainnet',
      rpcUrl: 'https://starknet-mainnet.infura.io/v3/your_infura_key'
    }
  }
}