# CrossBTC Vault Mobile App

A React Native mobile application for managing Bitcoin yield vaults with instant payment capabilities across Bitcoin and Starknet networks.

## Features

- 📱 **Native Mobile Experience** - Built with React Native for iOS and Android
- 🎨 **Modern UI Design** - Bitcoin-themed interface using shadcn/ui design principles
- 💰 **Vault Management** - View balances, deposits, withdrawals, and yield earnings
- 🔄 **Real-time Updates** - Live balance updates and transaction status tracking
- 📊 **Yield Analytics** - Detailed APR information and strategy breakdowns
- 🔒 **Secure Operations** - Biometric authentication and secure key storage
- ⚡ **Instant Payments** - Lightning Network integration for fast Bitcoin transactions

## Tech Stack

- **React Native 0.72.6** - Cross-platform mobile development framework
- **TypeScript** - Type-safe development
- **React Query** - Data fetching and state management
- **React Navigation** - Navigation and routing
- **Atomiq SDK** - Bitcoin and Lightning Network integration
- **Jest** - Unit testing framework
- **Detox** - End-to-end testing framework

## Getting Started

### Prerequisites

- Node.js >= 16
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install iOS dependencies:
```bash
cd ios && pod install && cd ..
```

3. Install Android dependencies:
```bash
# No additional setup needed for Android
```

### Running the App

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Metro bundler
```bash
npm start
```

## Testing

### Unit Tests
```bash
npm test
```

### End-to-End Tests
```bash
# Build the app for testing
npm run test:e2e:build

# Run iOS tests
npm run test:e2e:ios

# Run Android tests
npm run test:e2e:android
```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   └── ui/        # Basic UI components (Button, Card, Input, etc.)
├── screens/       # Screen components
├── hooks/         # Custom React hooks
├── services/      # API and blockchain services
├── navigation/    # Navigation configuration
├── theme/         # Theme and styling
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── __tests__/     # Test files
```

## Key Components

### UI Components

- **Button** - Customizable button with multiple variants and sizes
- **Card** - Container component with consistent styling
- **Input** - Form input with validation and error handling

### Screens

- **VaultScreen** - Main vault interface showing balance and actions
- More screens to be added...

### Hooks

- **useVault** - Vault state management and operations

### Services

Services for blockchain interactions (to be implemented):
- Bitcoin operations
- Lightning Network operations
- Starknet integration
- Wallet connectivity

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the established theme system in `src/theme/`
- Write tests for all new components and hooks
- Use React Query for data fetching and caching

### Git Workflow

1. Create feature branches from `main`
2. Write descriptive commit messages
3. Ensure all tests pass before merging
4. Follow conventional commit format

### Testing

- Write unit tests for all components and hooks
- Use Jest mocks for external dependencies
- Test both success and error scenarios
- Maintain good test coverage

## Security Considerations

- Use React Native Keychain for secure storage
- Implement biometric authentication for sensitive operations
- Validate all user inputs
- Use HTTPS for all API communications
- Never log sensitive information

## Performance Optimization

- Use React.memo for expensive components
- Implement proper caching strategies
- Optimize images and assets
- Use React Native's built-in performance tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.