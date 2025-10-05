# Cross-Bitcoin Yield Vault - Atomiq SDK Integration

A comprehensive Next.js application for Bitcoin yield generation with real blockchain operations through the Atomiq SDK.

## Features

### 🚀 Real Blockchain Integration
- **Bitcoin Operations**: Address generation, balance checking, transaction management
- **Lightning Network**: Instant payments, invoice creation, channel management
- **Cross-Chain Bridge**: Bitcoin ↔ Starknet transfers with real-time tracking
- **Starknet Integration**: Yield generation on Starknet blockchain

### 💰 Yield Generation
- **Vault Management**: Secure Bitcoin storage with yield generation
- **Real-Time Balances**: Live balance updates from multiple networks
- **Transaction History**: Complete transaction tracking across all networks
- **Fee Optimization**: Intelligent fee calculation and display

### 🎨 Professional UI/UX
- **Modern Design**: Built with Tailwind CSS and Bitcoin theming
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Real-Time Updates**: Auto-refreshing data and transaction status
- **Error Handling**: Comprehensive error states and user feedback

### 🔒 Security & Reliability
- **Mock Data Fallback**: Graceful degradation when services are unavailable
- **Environment Configuration**: Secure API key and endpoint management
- **Type Safety**: Full TypeScript implementation
- **Testing Suite**: Comprehensive unit and integration tests

## Quick Start

### Prerequisites

- Node.js 14+
- npm or yarn
- Atomiq API access (for production)

### Installation

1. **Clone and Install**
   ```bash
   cd packages/web
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Open Application**
   Navigate to `http://localhost:3003`

### Configuration

Edit `.env.local` with your settings:

```bash
# Atomiq SDK
NEXT_PUBLIC_ATOMIQ_API_KEY=your_api_key_here
NEXT_PUBLIC_ATOMIQ_NETWORK=testnet

# Bitcoin
NEXT_PUBLIC_BITCOIN_RPC_URL=https://blockstream.info/testnet/api

# Lightning Network (optional)
NEXT_PUBLIC_LIGHTNING_RPC_URL=your_lightning_node
NEXT_PUBLIC_LIGHTNING_MACAROON=your_macaroon

# Starknet
NEXT_PUBLIC_STARKNET_RPC_URL=your_starknet_rpc_url

# Bridge
NEXT_PUBLIC_BRIDGE_API_URL=https://bridge.atomiq.com
```

## Architecture

### Component Structure
```
src/
├── components/
│   ├── ui/                    # Base UI components
│   └── vault/                 # Vault-specific components
├── services/                  # Atomiq SDK integration
├── hooks/                     # React hooks
├── types/                     # TypeScript definitions
├── lib/                       # Utilities and configuration
└── app/                       # Next.js app router
```

### Key Services

- **BitcoinService**: Bitcoin address generation and transactions
- **LightningService**: Lightning Network operations
- **StarknetService**: Starknet blockchain interactions
- **BridgeService**: Cross-chain transfers
- **AtomiqSDK**: Unified service orchestrator

## Usage Examples

### Using the Vault Hook

```tsx
import { useVault } from '@/hooks/useVault'

function VaultDashboard() {
  const {
    vault,
    transactions,
    loading,
    error,
    deposit,
    withdraw,
    sdkStatus
  } = useVault('user-123', {
    enableRealData: true,
    autoRefresh: true
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Balance: {vault?.balance} BTC</h1>
      <button onClick={() => deposit(0.01, 'bitcoin')}>
        Deposit Bitcoin
      </button>
    </div>
  )
}
```

### Direct SDK Usage

```tsx
import { useAtomiqSDK } from '@/services/atomiq-sdk'

function BitcoinOperations() {
  const sdk = useAtomiqSDK()

  const handleDeposit = async () => {
    const address = await sdk.bitcoin.generateAddress()
    console.log('Send Bitcoin to:', address.address)
  }

  const createLightningInvoice = async () => {
    const invoice = await sdk.lightning.createInvoice(0.001)
    console.log('Lightning Invoice:', invoice.bolt11)
  }
}
```

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run test suite
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run linting
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- bitcoin.test.ts
```

### Mock Services

For development without blockchain connections, the SDK automatically provides mock services:

- Generate mock Bitcoin addresses
- Create mock Lightning invoices
- Simulate bridge transactions
- Mock balance data

## Production Deployment

### Environment Setup

1. **Configure Production Variables**
   ```bash
   NEXT_PUBLIC_ATOMIQ_NETWORK=mainnet
   NEXT_PUBLIC_ENABLE_MAINNET=true
   ```

2. **Set Up Monitoring**
   - Enable SDK status monitoring
   - Configure error reporting
   - Set up performance monitoring

3. **Security Considerations**
   - Use HTTPS endpoints
   - Secure API key management
   - Enable rate limiting
   - Monitor for unusual activity

### Performance Optimization

- Enable Next.js optimizations
- Configure proper caching
- Optimize bundle size
- Monitor Core Web Vitals

## Troubleshooting

### Common Issues

**SDK Not Initializing**
- Check environment variables
- Verify API key validity
- Ensure network connectivity

**Bitcoin Transactions Failing**
- Verify RPC URL configuration
- Check network settings (mainnet/testnet)
- Monitor transaction fees

**Lightning Service Errors**
- Verify Lightning node connection
- Check macaroon permissions
- Ensure node is synced

**Bridge Operations Issues**
- Verify bridge API access
- Check contract addresses
- Monitor transaction status

### Debug Tools

- Browser console logging
- SDK status dashboard
- Network request monitoring
- Error boundary information

## API Reference

### Core Services

#### BitcoinService
```typescript
generateAddress(): Promise<BitcoinAddress>
getBalance(address: string): Promise<BitcoinBalance>
createTransaction(to: string, amount: number): Promise<BitcoinTransaction>
```

#### LightningService
```typescript
createInvoice(amount: number, memo?: string): Promise<LightningInvoice>
payInvoice(invoice: string): Promise<LightningPayment>
getBalance(): Promise<{ balance: number; pending_balance: number }>
```

#### BridgeService
```typescript
getQuote(fromChain: string, toChain: string, amount: number): Promise<BridgeQuote>
createDeposit(quote: BridgeQuote): Promise<BridgeDeposit>
createWithdrawal(amount: number, destination: string): Promise<BridgeWithdrawal>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [Atomiq SDK Integration Guide](./ATOMIQ_SDK_INTEGRATION.md)
- **Issues**: Create GitHub issues for bug reports
- **Discussions**: Use GitHub discussions for questions
- **API Reference**: Check inline TypeScript documentation

## Roadmap

### Upcoming Features

- [ ] Enhanced transaction monitoring
- [ ] Advanced Lightning channel management
- [ ] Multi-asset support
- [ ] Mobile wallet integration
- [ ] Advanced analytics dashboard
- [ ] Webhook support for real-time updates

### Technical Improvements

- [ ] Performance optimizations
- [ ] Enhanced error recovery
- [ ] Improved test coverage
- [ ] Better documentation
- [ ] SDK version management

---

Built with ❤️ using Next.js, TypeScript, and the Atomiq SDK