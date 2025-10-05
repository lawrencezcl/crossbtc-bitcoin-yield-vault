# Cross-Chain Bitcoin Yield Vault - E2E Testing

This document provides comprehensive information about the End-to-End (E2E) testing setup for the Cross-Chain Bitcoin Yield Vault application using Playwright.

## 🎯 Overview

The E2E testing suite covers:
- **Critical User Journeys**: Essential user flows from landing to deposit completion
- **Component Interactions**: Detailed testing of individual components
- **Responsive Design**: Multi-device and viewport testing
- **Data Flow**: API integration and state management testing
- **Performance**: Application performance and Core Web Vitals

## 📁 Test Structure

```
tests/
├── e2e/
│   ├── critical-journeys/     # Essential user flows
│   │   ├── landing-page.spec.ts
│   │   └── deposit-flow.spec.ts
│   ├── components/            # Component-specific tests
│   │   ├── vault-balance-card.spec.ts
│   │   └── deposit-modal.spec.ts
│   ├── responsive/            # Responsive design tests
│   │   └── responsive-design.spec.ts
│   ├── data-flow/            # API and data testing
│   │   └── data-flow.spec.ts
│   └── performance/          # Performance testing
│       └── performance.spec.ts
├── fixtures/
│   └── page-fixture.ts       # Custom Playwright fixtures
├── utils/
│   ├── test-utils.ts         # Test utilities and helpers
│   └── constants.ts          # Test constants and selectors
├── global-setup.ts           # Global test setup
├── global-teardown.ts        # Global test teardown
└── fixed-pages/              # Fixed pages for testing
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js**: Version 18 or higher (recommended)
2. **Application**: Ensure the Next.js app runs on `http://localhost:3000`

### Installation

```bash
# Install Playwright and dependencies
npm install

# Install browser binaries
npm run test:e2e:install

# Install system dependencies (for some browsers)
npm run test:e2e:install-deps
```

## 🧪 Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests with Playwright UI
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug
```

### Browser-Specific Tests

```bash
# Run tests on Chrome only
npm run test:e2e:chrome

# Run tests on Firefox only
npm run test:e2e:firefox

# Run tests on Safari only
npm run test:e2e:safari

# Run tests on mobile browsers
npm run test:e2e:mobile
```

### Category-Specific Tests

```bash
# Run critical user journey tests
npm run test:e2e:critical

# Run component interaction tests
npm run test:e2e:components

# Run responsive design tests
npm run test:e2e:responsive

# Run performance tests
npm run test:e2e:performance

# Run data flow tests
npm run test:e2e:data-flow
```

### Development & Debugging

```bash
# Generate tests with codegen
npm run test:e2e:codegen

# View test reports
npm run test:e2e:report

# Run all tests (unit + E2E)
npm run test:all

# Run tests for CI
npm run test:ci
```

## 📊 Test Reports

After running tests, you can view detailed reports:

```bash
# Open HTML report
npm run test:e2e:report

# Reports are generated in:
# - playwright-report/index.html (HTML report)
# - test-results.json (JSON report)
# - test-results.xml (JUnit report for CI)
```

## 🎯 Test Categories

### 1. Critical User Journeys

**Location**: `tests/e2e/critical-journeys/`

Tests essential user flows:
- Landing page loading and display
- Vault balance information display
- Deposit modal functionality
- Form validation and submission
- Transaction completion

**Key Features**:
- ✅ Page load performance
- ✅ Data display accuracy
- ✅ User interaction flows
- ✅ Error handling

### 2. Component Interactions

**Location**: `tests/e2e/components/`

Detailed testing of individual components:
- Vault Balance Card
- Deposit Modal
- Yield Overview
- Transaction History

**Key Features**:
- ✅ Component state management
- ✅ User interactions
- ✅ Data updates
- ✅ Accessibility

### 3. Responsive Design

**Location**: `tests/e2e/responsive/`

Multi-device testing:
- Mobile devices (iPhone SE, iPhone 12)
- Tablet devices (iPad)
- Desktop (various screen sizes)
- Orientation changes

**Key Features**:
- ✅ Layout adaptation
- ✅ Touch interactions
- ✅ Viewport handling
- ✅ Mobile-specific features

### 4. Data Flow

**Location**: `tests/e2e/data-flow/`

API and data management testing:
- Data loading and display
- Real-time updates
- Error handling
- Caching mechanisms

**Key Features**:
- ✅ API integration
- ✅ State synchronization
- ✅ Error recovery
- ✅ Performance optimization

### 5. Performance

**Location**: `tests/e2e/performance/`

Application performance testing:
- Page load times
- Core Web Vitals
- Memory usage
- Bundle size optimization

**Key Features**:
- ✅ Load performance
- ✅ Animation smoothness
- ✅ Memory efficiency
- ✅ Asset optimization

## 🔧 Configuration

### Playwright Configuration

**File**: `playwright.config.ts`

Key settings:
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Viewports**: Mobile (375x667, 390x844), Tablet (768x1024), Desktop (1024x768, 1920x1080)
- **Timeouts**: 30s test timeout, 10s action timeout
- **Retries**: 2 retries on CI
- **Reporting**: HTML, JSON, JUnit

### Test Environment

- **Base URL**: `http://localhost:3000`
- **Web Server**: Automatically starts with `npm run dev`
- **Mock Data**: Available via fixtures for consistent testing
- **Screenshots**: Captured on failure and at key points

## 📱 Viewport Coverage

| Device Type | Viewport | Use Case |
|-------------|----------|----------|
| iPhone SE | 375x667 | Small mobile devices |
| iPhone 12 | 390x844 | Modern mobile devices |
| iPad | 768x1024 | Tablet devices |
| Desktop Small | 1024x768 | Small desktop screens |
| Desktop Large | 1920x1080 | Large desktop screens |
| Ultra-wide | 2560x1440 | Ultra-wide monitors |

## 🎭 Test Data

### Mock Data Structure

```typescript
// Vault Balance
{
  btc: 0.5,
  usd: 25000,
  change24h: 2.5
}

// Transactions
{
  id: 'tx123',
  type: 'deposit',
  amount: 0.1,
  method: 'bitcoin',
  timestamp: '2024-01-15T10:30:00Z',
  status: 'completed'
}

// Yield Data
{
  apy: 12.5,
  projectedYield: 15.2
}
```

### Test Scenarios

- ✅ Valid amounts and form inputs
- ✅ Invalid amounts and validation errors
- ✅ Network errors and retry mechanisms
- ✅ Loading states and skeletons
- ✅ Empty states and no data scenarios

## 🔍 Selectors & Testing IDs

### Key Selectors

```typescript
// Header
HEADER: 'header'
LOGO: '[data-testid="logo"]'
NAVIGATION: 'nav'

// Vault Components
VAULT_BALANCE_CARD: '[data-testid="vault-balance-card"]'
VAULT_BALANCE_AMOUNT: '[data-testid="vault-balance-amount"]'
YIELD_OVERVIEW: '[data-testid="yield-overview"]'

// Deposit Modal
DEPOSIT_MODAL: '[data-testid="deposit-modal"]'
AMOUNT_INPUT: '[data-testid="amount-input"]'
SUBMIT_DEPOSIT: '[data-testid="submit-deposit"]'

// Transaction History
TRANSACTION_HISTORY: '[data-testid="transaction-history"]'
TRANSACTION_ITEM: '[data-testid="transaction-item"]'
```

## 🚨 Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Include test categories and tags
- Follow AAA pattern (Arrange, Act, Assert)

### Test Data Management
- Use fixtures for consistent test data
- Mock API responses for reliability
- Clean up test data after each test
- Avoid hardcoding values where possible

### Error Handling
- Test both success and failure scenarios
- Verify error messages are user-friendly
- Test retry mechanisms
- Check loading and error states

### Performance
- Use appropriate wait strategies
- Avoid unnecessary delays
- Test on realistic viewports
- Monitor test execution time

## 🔧 Debugging

### Debug Mode
```bash
# Run tests in debug mode
npm run test:e2e:debug

# Run specific test in debug mode
npx playwright test --debug tests/e2e/critical-journeys/landing-page.spec.ts
```

### Codegen
```bash
# Generate test code interactively
npm run test:e2e:codegen
```

### Trace Viewer
```bash
# View trace files
npx playwright show-trace trace.zip
```

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e:install
      - run: npm run test:ci
```

### Environment Variables

- `CI`: Set to `true` in CI environments
- `BASE_URL`: Override default test URL
- `DEBUG`: Enable debug logging

## 📈 Performance Metrics

### Thresholds

- **Page Load**: < 3 seconds
- **First Contentful Paint**: < 2 seconds
- **Largest Contentful Paint**: < 4 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Monitoring

- Core Web Vitals tracking
- Memory usage monitoring
- Bundle size analysis
- Network request optimization

## 🔄 Continuous Improvement

### Regular Tasks
- [ ] Update test data regularly
- [ ] Review and optimize slow tests
- [ ] Add new test cases for features
- [ ] Monitor test flakiness
- [ ] Update browser versions

### Maintenance
- [ ] Update Playwright version
- [ ] Review test coverage
- [ ] Optimize test execution time
- [ ] Clean up test reports

## 📞 Support

For issues with E2E testing:

1. Check test logs and reports
2. Verify application is running on `localhost:3000`
3. Ensure browser dependencies are installed
4. Review test configuration
5. Check network connectivity for API calls

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Test Reporting](https://playwright.dev/docs/test-reporters)
- [Debugging Tests](https://playwright.dev/docs/debug)