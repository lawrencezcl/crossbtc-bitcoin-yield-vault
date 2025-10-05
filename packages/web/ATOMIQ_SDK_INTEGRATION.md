# Atomiq SDK Integration Documentation

## Overview

This document outlines the comprehensive integration of the Atomiq SDK into the Cross-Bitcoin Yield Vault application. The integration enables real Bitcoin and Lightning Network operations while maintaining backward compatibility with existing mock data.

## Architecture

### SDK Components

1. **Bitcoin Service** - Handles Bitcoin address generation, balance checking, and transaction management
2. **Lightning Service** - Manages Lightning Network invoices, payments, and channel operations
3. **Starknet Service** - Interacts with Starknet blockchain for cross-chain operations
4. **Bridge Service** - Facilitates Bitcoin to Starknet and Starknet to Bitcoin transfers
5. **SDK Manager** - Orchestrates all services and provides unified interface

### File Structure

```
src/
├── services/
│   ├── atomiq-sdk.ts          # Main SDK orchestrator
│   ├── bitcoin.ts             # Bitcoin service implementation
│   ├── lightning.ts           # Lightning service implementation
│   ├── starknet.ts            # Starknet service implementation
│   ├── bridge.ts              # Bridge service implementation
│   └── __tests__/             # Service test suites
├── types/
│   ├── atomiq.ts              # TypeScript interfaces
│   └── vault.ts               # Existing vault types (enhanced)
├── hooks/
│   └── useVault.ts            # Enhanced vault hook with SDK integration
├── lib/
│   └── config.ts              # Configuration management
└── components/vault/
    └── DepositModal.tsx       # Enhanced deposit modal
```

## Installation

### Dependencies

The following packages were installed for Atomiq SDK integration:

```bash
npm install @atomiqlabs/sdk @atomiqlabs/sdk-lib @atomiqlabs/chain-starknet @atomiqlabs/btc-bitcoind @atomiqlabs/wallet-lnd @atomiqlabs/bolt11 @noble/curves @noble/hashes starknet get-starknet-core bitcoinjs-lib
```

### Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# Atomiq SDK Configuration
NEXT_PUBLIC_ATOMIQ_API_URL=https://api.atomiq.com
NEXT_PUBLIC_ATOMIQ_API_KEY=your_atomiq_api_key_here
NEXT_PUBLIC_ATOMIQ_NETWORK=testnet

# Bitcoin Configuration
NEXT_PUBLIC_BITCOIN_RPC_URL=https://blockstream.info/testnet/api
NEXT_PUBLIC_BITCOIN_NETWORK=testnet

# Lightning Network Configuration
NEXT_PUBLIC_LIGHTNING_RPC_URL=https://your-lnd-node-url
NEXT_PUBLIC_LIGHTNING_MACAROON=your_macaroon_here
NEXT_PUBLIC_LIGHTNING_CERT=your_cert_here

# Starknet Configuration
NEXT_PUBLIC_STARKNET_NETWORK=testnet
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-testnet.infura.io/v3/your_infura_key

# Cross-Chain Bridge Configuration
NEXT_PUBLIC_BRIDGE_API_URL=https://bridge.atomiq.com
NEXT_PUBLIC_BRIDGE_CONTRACT_ADDRESS=your_bridge_contract_address

# Security Configuration
NEXT_PUBLIC_ENABLE_MAINNET=false
NEXT_PUBLIC_MAX_DEPOSIT_AMOUNT=10
NEXT_PUBLIC_MIN_DEPOSIT_AMOUNT=0.0001
```

## Usage

### SDK Initialization

The SDK is automatically initialized through the `AtomiqSDKProvider` in the app layout:

```tsx
import { AtomiqSDKProvider } from '@/services/atomiq-sdk'
import { loadAtomiqConfig } from '@/lib/config'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const config = loadAtomiqConfig()

  return (
    <AtomiqSDKProvider config={config}>
      {children}
    </AtomiqSDKProvider>
  )
}
```

### Hook Integration

The `useVault` hook has been enhanced to use real SDK data:

```tsx
import { useVault } from '@/hooks/useVault'

function MyComponent() {
  const {
    vault,
    transactions,
    loading,
    error,
    sdkStatus,
    bitcoinAddress,
    lightningInvoice,
    deposit,
    withdraw,
    getBitcoinBalance,
    getLightningBalance
  } = useVault('user-id', {
    enableRealData: true,
    autoRefresh: true
  })

  // Use real blockchain data
}
```

### Service Usage

Direct service access through the SDK:

```tsx
import { useAtomiqSDK } from '@/services/atomiq-sdk'

function BitcoinOperations() {
  const sdk = useAtomiqSDK()

  const generateAddress = async () => {
    const address = await sdk.bitcoin.generateAddress()
    console.log('Generated address:', address.address)
  }

  const createInvoice = async () => {
    const invoice = await sdk.lightning.createInvoice(0.001, 'Test invoice')
    console.log('Created invoice:', invoice.bolt11)
  }

  const getBridgeQuote = async () => {
    const quote = await sdk.bridge.getQuote('bitcoin', 'starknet', 0.1)
    console.log('Bridge quote:', quote)
  }
}
```

## Features

### Bitcoin Operations

- **Address Generation**: Creates secure Bitcoin addresses for deposits
- **Balance Checking**: Monitors Bitcoin wallet balances
- **Transaction Creation**: Creates and signs Bitcoin transactions
- **Transaction Monitoring**: Tracks transaction status and confirmations

### Lightning Network Integration

- **Invoice Creation**: Generates Lightning Network invoices
- **Payment Processing**: Pays Lightning invoices instantly
- **Balance Tracking**: Monitors Lightning wallet balances
- **Channel Management**: Manages Lightning payment channels

### Cross-Chain Bridge Operations

- **Bitcoin to Starknet Bridge**: Bridges Bitcoin to Starknet for yield generation
- **Starknet to Bitcoin Bridge**: Bridges back to Bitcoin for withdrawals
- **Bridge Status Tracking**: Monitors cross-chain transaction status
- **Fee Management**: Calculates and displays bridge fees

### Error Handling

- **Comprehensive Error Management**: Handles SDK errors gracefully
- **Fallback to Mock Data**: Maintains functionality when SDK is unavailable
- **User Feedback**: Provides clear error messages and status indicators
- **Network Resilience**: Handles network failures and retries

## API Reference

### BitcoinService

```typescript
interface BitcoinService {
  generateAddress(): Promise<BitcoinAddress>
  getBalance(address: string): Promise<BitcoinBalance>
  createTransaction(to: string, amount: number, fromAddress?: string): Promise<BitcoinTransaction>
  sendTransaction(transaction: BitcoinTransaction): Promise<string>
  getTransaction(txid: string): Promise<BitcoinTransaction>
  monitorAddress(address: string, callback: (tx: BitcoinTransaction) => void): void
}
```

### LightningService

```typescript
interface LightningService {
  getNodeInfo(): Promise<LightningNodeInfo>
  getBalance(): Promise<{ balance: number; pending_balance: number }>
  createInvoice(amount: number, memo?: string): Promise<LightningInvoice>
  payInvoice(invoice: string): Promise<LightningPayment>
  getInvoice(paymentHash: string): Promise<LightningInvoice>
  getChannels(): Promise<LightningChannel[]>
  listPayments(): Promise<LightningPayment[]>
}
```

### BridgeService

```typescript
interface BridgeService {
  getQuote(fromChain: string, toChain: string, amount: number): Promise<BridgeQuote>
  createDeposit(quote: BridgeQuote): Promise<BridgeDeposit>
  createWithdrawal(amount: number, destination: string): Promise<BridgeWithdrawal>
  getTransaction(id: string): Promise<BridgeTransaction>
  listTransactions(address: string): Promise<BridgeTransaction[]>
}
```

## Testing

### Test Suite Structure

```bash
src/services/__tests__/
├── bitcoin.test.ts      # Bitcoin service tests
├── lightning.test.ts    # Lightning service tests
├── bridge.test.ts       # Bridge service tests
└── atomiq-sdk.test.ts   # SDK integration tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- bitcoin.test.ts

# Run tests with coverage
npm test -- --coverage
```

### Test Features

- **Mock Services**: Complete mock implementations for testing
- **Network Mocking**: Mock HTTP requests for external services
- **Error Scenarios**: Comprehensive error handling tests
- **Integration Tests**: End-to-end workflow testing

## Development

### Mock Services

For development without real blockchain connections, the SDK automatically falls back to mock services when:

- Environment variables are not configured
- Network connectivity is unavailable
- Services return errors

### Configuration Validation

The SDK includes comprehensive configuration validation:

```typescript
import { validateConfig, getConfigStatus } from '@/lib/config'

const status = getConfigStatus(config)
console.log('SDK Status:', status.status) // 'complete' | 'partial' | 'minimal'
console.log('Warnings:', status.warnings)
console.log('Recommendations:', status.recommendations)
```

### Debug Mode

Enable debug logging:

```typescript
// In development, SDK automatically enables debug logging
// Check browser console for detailed operation logs
```

## Security Considerations

### API Key Management

- Store API keys in environment variables, not in code
- Use different keys for development and production
- Rotate keys regularly
- Monitor API key usage

### Network Security

- Always use HTTPS endpoints in production
- Validate all external responses
- Implement proper error boundaries
- Sanitize user inputs

### Private Key Handling

- Private keys are only generated client-side
- Never transmit private keys to servers
- Use secure random number generation
- Implement proper key storage if needed

## Production Deployment

### Environment Setup

1. Configure production environment variables
2. Set up proper API keys and endpoints
3. Enable mainnet networks (if required)
4. Configure monitoring and logging

### Monitoring

The SDK provides health monitoring:

```typescript
const status = await sdk.getStatus()
console.log('Services Status:', status.services)
```

### Performance Optimization

- Use React.memo for expensive components
- Implement proper loading states
- Cache frequently accessed data
- Optimize API call patterns

## Troubleshooting

### Common Issues

1. **SDK Initialization Failed**
   - Check environment variables
   - Verify API key validity
   - Ensure network connectivity

2. **Bitcoin Service Not Working**
   - Verify Bitcoin RPC URL
   - Check network configuration
   - Test with mock services first

3. **Lightning Service Errors**
   - Verify Lightning node connection
   - Check macaroon and certificate
   - Ensure node is synced

4. **Bridge Service Issues**
   - Verify bridge API URL
   - Check contract address
   - Monitor transaction status

### Debug Tools

- Browser console logging
- Network request monitoring
- SDK status dashboard
- Error boundary information

## Migration Guide

### From Mock to Real Data

1. Configure environment variables
2. Test with small amounts
3. Gradually enable real services
4. Monitor for errors
5. Update user documentation

### Backward Compatibility

The integration maintains full backward compatibility:

- Existing components work unchanged
- Mock data fallback ensures reliability
- Progressive enhancement approach
- No breaking changes to APIs

## Future Enhancements

### Planned Features

- Enhanced transaction monitoring
- Advanced Lightning channel management
- Multi-asset support
- Advanced fee optimization
- Mobile wallet integration

### API Expansion

- Webhook support for real-time updates
- Advanced analytics and reporting
- Batch transaction processing
- Enhanced error recovery
- Performance optimization tools

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review test cases for usage examples
3. Enable debug logging for detailed information
4. Check browser console for error messages
5. Verify configuration settings

## License

This integration follows the same license as the parent project. Refer to the main project license for details.