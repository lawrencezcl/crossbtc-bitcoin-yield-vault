# Quick Start Guide

Get your CrossBTC Vault application running in minutes! 🚀

## 🎯 Prerequisites

- Node.js 18+ (for local development)
- GitHub account
- Vercel account (free)

## ⚡ 5-Minute Deployment

### Step 1: Fork & Clone

1. **Fork the repository** on GitHub
2. **Clone to your machine**:
```bash
git clone https://github.com/YOUR_USERNAME/crossbtc-vault.git
cd crossbtc-vault
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and click "New Project"
2. **Import your forked repository**
3. **Configure settings**:
   - **Framework**: Next.js
   - **Root Directory**: `packages/web`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
```
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NEXT_PUBLIC_WS_URL=wss://your-app.vercel.app
NEXT_PUBLIC_BITCOIN_RPC_URL=https://bitcoin-mainnet.rpc.coindesk.com
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-mainnet.infura.io/v3/demo
```

5. **Click "Deploy"** 🎉

### Step 3: Access Your App

Your CrossBTC Vault will be live at:
`https://your-app-name.vercel.app`

## 🔧 Local Development

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/crossbtc-vault.git
cd crossbtc-vault

# Install dependencies
npm install
cd packages/web && npm install

# Set up environment
cp packages/web/.env.example packages/web/.env.local

# Start development server
cd packages/web && npm run dev
```

Visit `http://localhost:3000` to see your app!

## 📱 Mobile App Setup

### iOS Setup
```bash
cd packages/mobile
npm install
cd ios && pod install
npm run ios
```

### Android Setup
```bash
cd packages/mobile
npm install
npm run android
```

## 🌐 What You Get

### Core Features
- ✅ **Bitcoin Vault Dashboard** - Real-time balance and yield tracking
- ✅ **Cross-Chain Bridging** - Bitcoin ↔ Starknet via Chipi Pay
- ✅ **Lightning Payments** - Instant Bitcoin transactions
- ✅ **Yield Strategies** - Troves lending and Vesu borrowing
- ✅ **Security Dashboard** - Risk monitoring and alerts
- ✅ **Mobile App** - Native iOS and Android applications

### Technical Stack
- **Web**: Next.js 12.3.4, React 18, TypeScript, Tailwind CSS
- **Mobile**: React Native, TypeScript, shadcn UI components
- **Blockchain**: Bitcoin, Lightning Network, Starknet
- **Security**: Advanced risk management and monitoring

## 🔑 Environment Variables

### Required Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NEXT_PUBLIC_WS_URL=wss://your-app.vercel.app

# Blockchain Services
NEXT_PUBLIC_BITCOIN_RPC_URL=https://bitcoin-mainnet.rpc.coindesk.com
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-mainnet.infura.io/v3/YOUR_KEY

# Wallet Integrations
NEXT_PUBLIC_XVERSE_API_KEY=your_xverse_api_key
NEXT_PUBLIC_CHIPI_API_KEY=your_chipi_api_key
```

### Get API Keys
1. **Starknet RPC**: Create account at [Infura](https://infura.io)
2. **Xverse**: Register at [Xverse Developer Portal](https://xverse.app)
3. **Chipi Pay**: Sign up at [Chipi Pay](https://chipi.io)

## 🚀 Production Deployment

### Using Vercel CLI
```bash
# Install Vercel CLI (Node.js 18+)
npm install -g vercel

# Login and deploy
cd packages/web
vercel --prod
```

### Using Docker
```bash
# Build and run with Docker
docker-compose up -d
```

## 📊 Monitoring

Your deployment includes:
- **Performance Monitoring** - Built-in Vercel analytics
- **Error Tracking** - Automatic error logging
- **Uptime Monitoring** - Health checks and alerts
- **Security Monitoring** - Risk assessment and alerts

## 🔒 Security Features

- **Multi-signature wallet support**
- **Biometric authentication (mobile)**
- **Transaction limits and validation**
- **Real-time risk monitoring**
- **Emergency pause mechanisms**

## 🆘 Getting Help

### Quick Links
- **Documentation**: [Full Documentation](./README.md)
- **Deployment Guide**: [Detailed Setup](./DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/crossbtc/vault/issues)
- **Discord**: [Community Support](https://discord.gg/crossbtc)

### Common Issues

1. **Build fails on Vercel**
   - Check Node.js version compatibility
   - Verify all environment variables are set
   - Review build logs for specific errors

2. **Can't connect to wallet**
   - Ensure API keys are correctly configured
   - Check network connectivity
   - Verify wallet extension is installed

3. **Mobile app won't build**
   - Install iOS dependencies: `cd packages/mobile/ios && pod install`
   - Check Android SDK configuration
   - Verify React Native version compatibility

## 🎯 Next Steps

After deployment:

1. **Configure your API keys** for full functionality
2. **Set up custom domain** (optional)
3. **Configure monitoring** and alerts
4. **Test all features** with small amounts
5. **Join our community** for support and updates

## 📈 Scaling Your Application

### Adding More Features
- **Custom yield strategies** - Add new DeFi protocols
- **Advanced analytics** - Enhanced reporting and insights
- **Multi-chain support** - Expand to other blockchains
- **Institutional features** - High-volume trading tools

### Performance Optimization
- **CDN configuration** - Faster content delivery
- **Database optimization** - Improve query performance
- **Caching strategies** - Reduce API response times
- **Load balancing** - Handle high traffic volumes

---

**🎉 Congratulations!** Your CrossBTC Vault application is now live and ready to help users maximize their Bitcoin yield with instant payment capabilities.

For detailed documentation and advanced configuration, see the [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md) files.