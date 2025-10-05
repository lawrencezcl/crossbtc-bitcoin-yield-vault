# Deployment Guide

This guide covers deploying the CrossBTC Vault application to various platforms.

## 🚀 Vercel Deployment (Recommended)

### Prerequisites
- GitHub repository with the code
- Vercel account
- Node.js 18+ (for local development)

### Step 1: Push to GitHub

1. **Create GitHub Repository**
```bash
# If you haven't already created the repo
gh repo create crossbtc-vault --public --description "Cross-Chain Bitcoin Yield Vault with Instant Payments"
```

2. **Push Code to GitHub**
```bash
git remote add origin https://github.com/your-username/crossbtc-vault.git
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Method 1: Using Vercel Dashboard (Recommended)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `crossbtc-vault` repository

2. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `packages/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://crossbtc-vault.vercel.app/api
   NEXT_PUBLIC_WS_URL=wss://crossbtc-vault.vercel.app
   NEXT_PUBLIC_BITCOIN_RPC_URL=https://bitcoin-mainnet.rpc.coindesk.com
   NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-mainnet.infura.io/v3/YOUR_KEY
   NEXT_PUBLIC_XVERSE_API_KEY=your_xverse_api_key
   NEXT_PUBLIC_CHIPI_API_KEY=your_chipi_api_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://crossbtc-vault.vercel.app`

#### Method 2: Using Vercel CLI

1. **Install Vercel CLI** (requires Node.js 18+)
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from project directory**
```bash
cd packages/web
vercel --prod
```

4. **Configure Deployment**
   - Follow the prompts to configure your project
   - Add environment variables when prompted
   - Choose your team/account

### Step 3: Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Wait for certificate to be issued

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -f packages/web/Dockerfile -t crossbtc-vault .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

### Production Docker Compose
```bash
# Use production configuration
docker-compose -f docker-compose.yml up -d
```

## 🔧 Manual Deployment

### Build for Production
```bash
cd packages/web
npm install
npm run build
```

### Using Node.js
```bash
npm install -g serve
cd packages/web
npm run build
serve .next -l 3000
```

### Using PM2 (Process Manager)
```bash
npm install -g pm2
cd packages/web
npm run build
pm2 start npm --name "crossbtc-vault" -- start
```

## 📱 Mobile App Deployment

### iOS App Store

1. **Prepare iOS Build**
```bash
cd packages/mobile
npm install
cd ios
pod install
```

2. **Build for Production**
```bash
# Using Xcode
npx react-native run-ios --configuration Release

# Or using command line
cd ios
xcodebuild -workspace CrossBTCVault.xcworkspace \
  -scheme CrossBTCVault \
  -configuration Release \
  -destination generic/platform=iOS \
  -archivePath CrossBTCVault.xcarchive \
  archive
```

3. **Submit to App Store**
   - Open Xcode
   - Product → Archive
   - Upload to App Store Connect

### Android Play Store

1. **Prepare Android Build**
```bash
cd packages/mobile
cd android
./gradlew assembleRelease
```

2. **Sign APK**
   - Generate signing key
   - Configure `android/app/build.gradle`
   - Sign the release APK

3. **Submit to Play Store**
   - Create Play Console account
   - Upload signed APK or AAB
   - Complete store listing

## 🌐 Environment Configuration

### Development Environment
```bash
# packages/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_BITCOIN_RPC_URL=https://bitcoin-mainnet.rpc.coindesk.com
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-mainnet.infura.io/v3/YOUR_KEY
```

### Production Environment
```bash
# Environment variables for production
NEXT_PUBLIC_API_URL=https://api.crossbtc.io
NEXT_PUBLIC_WS_URL=wss://api.crossbtc.io
BITCOIN_RPC_URL=https://bitcoin-mainnet.rpc.coindesk.com
STARKNET_RPC_URL=https://starknet-mainnet.infura.io/v3/YOUR_KEY
XVERSE_API_KEY=your_xverse_api_key
CHIPI_API_KEY=your_chipi_api_key
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://user:password@host:port/database
```

## 🔒 Security Considerations

### Environment Variables
- Never commit sensitive data to version control
- Use Vercel's environment variable management
- Use different keys for development and production
- Rotate API keys regularly

### HTTPS and SSL
- Vercel provides automatic SSL certificates
- Enforce HTTPS in production
- Use secure cookies and headers

### API Security
- Implement rate limiting
- Use JWT authentication
- Validate all inputs
- Monitor for suspicious activity

## 📊 Monitoring and Analytics

### Vercel Analytics
- Built-in performance monitoring
- Error tracking
- Usage analytics

### Custom Monitoring
```bash
# Application monitoring
npm install @vercel/analytics

# Error tracking
npm install @sentry/nextjs
```

### Health Checks
```bash
# Add health check endpoint
# GET /api/health
```

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment Secrets
Add these to your repository secrets:
- `VERCEL_TOKEN`: Your Vercel API token
- `ORG_ID`: Your Vercel organization ID
- `PROJECT_ID`: Your Vercel project ID

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names and values
   - Restart deployment after changing variables

3. **API Connectivity**
   - Verify API URLs are accessible
   - Check CORS settings
   - Test API endpoints manually

4. **Domain Issues**
   - Verify DNS configuration
   - Check SSL certificate status
   - Ensure domain points to Vercel

### Debug Mode
```bash
# Enable debug logging
DEBUG=* vercel --prod

# Check build logs
vercel logs <deployment-url>
```

### Performance Optimization
```bash
# Analyze bundle size
npm run analyze

# Enable compression
# Added automatically by Vercel

# Optimize images
# Use next/image component
```

## 📞 Support

For deployment issues:
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Issues**: Create an issue in the repository
- **Discord Community**: Join our Discord server
- **Email**: support@crossbtc.io

---

## 🎯 Quick Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] Vercel account set up
- [ ] Environment variables configured
- [ ] Build process tested locally
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate verified
- [ ] Monitoring and analytics set up
- [ ] Error tracking configured
- [ ] Performance optimization applied
- [ ] Security measures implemented

Once deployed, your CrossBTC Vault application will be available at your Vercel URL with full functionality including Bitcoin vault management, cross-chain bridging, and real-time yield optimization.