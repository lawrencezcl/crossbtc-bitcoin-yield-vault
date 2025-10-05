# Contributing to CrossBTC Vault

Thank you for your interest in contributing to CrossBTC Vault! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Docker (for local development)

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/crossbtcandpayment.git
cd crossbtcandpayment
```

2. **Install Dependencies**
```bash
npm install
cd packages/web && npm install
cd ../mobile && npm install
```

3. **Environment Setup**
```bash
# Copy environment templates
cp packages/web/.env.example packages/web/.env.local
cp packages/mobile/.env.example packages/mobile/.env
```

4. **Start Development**
```bash
# Web app
cd packages/web && npm run dev

# Mobile app
cd packages/mobile && npm run start
```

## 📁 Project Structure

```
packages/
├── web/                 # Next.js web application
├── mobile/              # React Native mobile app
├── contracts/           # Cairo smart contracts
└── shared/              # Shared utilities
```

## 🎯 How to Contribute

### 1. Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Search existing issues before creating new ones
- Use appropriate issue templates
- Provide detailed information and reproduction steps

### 2. Submitting Pull Requests

#### Development Workflow
1. Create a feature branch from `develop`
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit PR to `develop` branch

#### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

#### Commit Messages
Follow conventional commit format:
```
type(scope): description

feat(vault): add yield strategy selection
fix(wallet): resolve connection timeout issue
docs(readme): update installation instructions
```

### 3. Code Standards

#### TypeScript
- Use strict TypeScript settings
- Provide proper type definitions
- Avoid `any` types
- Use interfaces for object shapes

#### React/React Native
- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use proper prop types

#### CSS/Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Maintain consistent color scheme
- Use semantic HTML elements

### 4. Testing

#### Requirements
- Unit tests for all new functions
- Integration tests for API endpoints
- Component tests for UI components
- E2E tests for critical user flows

#### Running Tests
```bash
# All tests
npm run test

# Web app tests
cd packages/web && npm run test

# Mobile app tests
cd packages/mobile && npm run test

# E2E tests
cd packages/web && npm run test:e2e
```

#### Test Coverage
- Maintain minimum 80% test coverage
- Focus on critical business logic
- Test error conditions and edge cases

## 📝 Development Guidelines

### Web Development

#### Components
- Use shadcn/ui components when possible
- Create reusable components
- Follow atomic design principles
- Implement proper loading and error states

#### API Integration
- Use React Query for data fetching
- Implement proper error handling
- Add optimistic updates where appropriate
- Cache API responses effectively

#### State Management
- Use React Query for server state
- Use local state for UI state
- Avoid global state when possible
- Implement proper state normalization

### Mobile Development

#### Navigation
- Use React Navigation
- Implement proper deep linking
- Handle navigation states correctly
- Provide proper error boundaries

#### Native Integrations
- Use proper native modules
- Handle platform-specific code
- Implement proper permissions
- Test on both iOS and Android

#### Performance
- Optimize images and assets
- Use proper memoization
- Implement lazy loading
- Monitor bundle size

### Security Considerations

#### Input Validation
- Validate all user inputs
- Sanitize data before processing
- Implement proper error handling
- Use parameterized queries

#### API Security
- Use HTTPS for all API calls
- Implement proper authentication
- Add rate limiting
- Secure sensitive data

#### Wallet Security
- Never store private keys
- Use secure key storage
- Implement proper signing flows
- Validate transaction data

## 📋 Pull Request Process

### Before Submitting
1. Run all tests and ensure they pass
2. Check code coverage requirements
3. Update documentation if needed
4. Rebase your branch if needed
5. Ensure clean commit history

### PR Template
Use the provided PR template and include:
- Clear description of changes
- Related issue numbers
- Testing information
- Screenshots for UI changes
- Breaking changes documentation

### Review Process
1. Automated checks (tests, linting, security)
2. Code review by maintainers
3. Required approvals before merge
4. Automated deployment after merge

## 🏗️ Architecture Decisions

### Technology Stack
- **Web**: Next.js 12.3.4, React 18, TypeScript
- **Mobile**: React Native, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State**: React Query, Zustand
- **Testing**: Jest, React Testing Library, Playwright

### Design Principles
- Mobile-first responsive design
- Component-based architecture
- Type-safe development
- Security-first approach
- Performance optimization

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for complex functions
- Document component props and usage
- Include examples for custom hooks
- Document API endpoints

### User Documentation
- Update README for new features
- Create user guides for complex flows
- Add troubleshooting information
- Include video tutorials when helpful

## 🐛 Bug Reports

### Bug Report Template
When reporting bugs, include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment information
- Screenshots or recordings
- Related logs or error messages

### Debugging Information
- Browser and version
- Operating system
- Network conditions
- Console errors
- API responses

## 🚀 Release Process

### Version Management
- Use semantic versioning
- Update CHANGELOG for each release
- Tag releases properly
- Create release notes

### Deployment
- Automated deployments for main branch
- Manual deployments for releases
- Rollback procedures
- Performance monitoring

## 💬 Community

### Communication Channels
- GitHub Discussions for general questions
- Discord for real-time chat
- Twitter for announcements
- Email for security issues

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Follow GitHub's CoC

## 🎁 Recognition

Contributors will be recognized through:
- Contributor list in README
- Special Discord roles
- Contributor badge on profile
- Mention in release notes

## 📞 Getting Help

If you need help with contributing:
- Check existing documentation
- Search GitHub issues and discussions
- Ask questions in Discord
- Create a discussion for complex topics

Thank you for contributing to CrossBTC Vault! 🚀