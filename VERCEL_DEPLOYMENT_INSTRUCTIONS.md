# Vercel Deployment Instructions

## 🚀 Quick Deployment to Vercel

Since there are network connectivity issues with pushing to GitHub directly, here are step-by-step instructions for deploying your CrossBTC Vault to Vercel.

## 📋 Step 1: Manual GitHub Setup

### Option A: Create Repository Manually
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Repository name: `crossbtc-vault`
4. Description: `Cross-Chain Bitcoin Yield Vault with Instant Payments`
5. Make it **Public**
6. **DO NOT** initialize with README (we already have one)
7. Click "Create repository"

### Option B: Use GitHub CLI (if internet is stable)
```bash
# If you have gh CLI installed and can connect
gh repo create crossbtc-vault --public --description "Cross-Chain Bitcoin Yield Vault with Instant Payments"
```

## 📂 Step 2: Upload Code to GitHub

### Manual Upload Method (if git push fails)
1. **Download your project files** as a ZIP
2. **Extract locally** if needed
3. **Go to your GitHub repository**
4. **Click "Add file" → "Upload files"**
5. **Drag and drop all your project files**
6. **Add commit message**: "Initial commit: CrossBTC Vault v1.0.0"
7. **Click "Commit changes"**

### Git Push Method (if internet allows)
```bash
# Add remote (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/crossbtc-vault.git

# Push to GitHub
git push -u origin main
```

## 🌐 Step 3: Deploy to Vercel

### Using Vercel Dashboard (Recommended)

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up/login** with your GitHub account
3. **Click "New Project"**
4. **Import your GitHub repository** (`crossbtc-vault`)
5. **Configure Project Settings**:

#### Project Configuration
- **Framework Preset**: `Next.js`
- **Root Directory**: `packages/web`
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`

#### Environment Variables
Add these in the Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://crossbtc-vault.vercel.app/api
NEXT_PUBLIC_WS_URL=wss://crossbtc-vault.vercel.app
NEXT_PUBLIC_BITCOIN_RPC_URL=https://bitcoin-mainnet.rpc.coindesk.com
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-mainnet.infura.io/v3/demo
NEXT_PUBLIC_XVERSE_API_KEY=your_xverse_api_key
NEXT_PUBLIC_CHIPI_API_KEY=your_chipi_api_key
```

6. **Click "Deploy"**
7. **Wait for deployment** (2-5 minutes)
8. **Your app will be live** at the provided URL!

### Using Vercel CLI (Advanced)

If you have Node.js 18+ and can install Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd packages/web
vercel --prod

# Follow the prompts to configure your project
```

## 🔑 API Keys Configuration

### Required Services

1. **Starknet RPC (Infura)**
   - Go to [infura.io](https://infura.io)
   - Create account and new project
   - Select "Starknet" network
   - Copy your project URL

2. **Xverse API**
   - Go to [xverse.app](https://xverse.app)
   - Register for developer access
   - Get your API key

3. **Chipi Pay API**
   - Go to [chipi.io](https://chipi.io)
   - Sign up for API access
   - Get your API key

### Environment Variables Template
Copy this to your Vercel environment variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://crossbtc-vault.vercel.app/api
NEXT_PUBLIC_WS_URL=wss://crossbtc-vault.vercel.app

# Blockchain Services
NEXT_PUBLIC_BITCOIN_RPC_URL=https://bitcoin-mainnet.rpc.coindesk.com
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-mainnet.infura.io/v3/YOUR_INFURA_KEY

# Wallet Integrations
NEXT_PUBLIC_XVERSE_API_KEY=your_xverse_api_key
NEXT_PUBLIC_CHIPI_API_KEY=your_chipi_api_key

# Security
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_APP_SECRET=your_app_secret_here

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## 📱 Mobile App Deployment

### iOS App Store

1. **Prepare Xcode Project**
```bash
cd packages/mobile
npm install
cd ios
pod install
```

2. **Open in Xcode**
   - Open `CrossBTCVault.xcworkspace`
   - Configure signing certificates
   - Set bundle identifier
   - Build and archive

3. **Submit to App Store**
   - Use Xcode Organizer to upload
   - Complete App Store Connect listing

### Android Play Store

1. **Build Android APK**
```bash
cd packages/mobile/android
./gradlew assembleRelease
```

2. **Sign the APK**
   - Generate keystore: `keytool -genkey -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000`
   - Configure signing in `android/app/build.gradle`

3. **Submit to Play Store**
   - Upload to Google Play Console
   - Complete store listing

## 🔍 Testing Your Deployment

### Manual Testing Checklist
- [ ] App loads successfully at the Vercel URL
- [ ] Dashboard displays Bitcoin vault information
- [ ] Wallet connection works (Xverse extension)
- [ ] Cross-chain bridge interface loads
- [ ] Security dashboard shows metrics
- [ ] Mobile app builds and runs
- [ ] All navigation links work
- [ ] Responsive design works on mobile

### Automated Testing
The project includes comprehensive tests:
```bash
# Run all tests
npm run test

# E2E tests (if locally)
cd packages/web && npm run test:e2e
```

## 🔧 Troubleshooting

### Common Vercel Issues

1. **Build Failed**
   - Check Node.js version in Vercel logs
   - Verify all dependencies in package.json
   - Check for TypeScript errors

2. **Environment Variables Not Working**
   - Ensure variables start with `NEXT_PUBLIC_` for client-side access
   - Restart deployment after adding variables
   - Check variable names and values

3. **API Connectivity Issues**
   - Verify RPC URLs are accessible
   - Check API key validity
   - Test endpoints manually

4. **White Screen / 404 Errors**
   - Check if build output directory is correct (`.next`)
   - Verify root directory setting (`packages/web`)
   - Check Next.js page structure

### Getting Help
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Issues**: Create issue in repository
- **Discord**: Join our community server
- **Email**: support@crossbtc.io

## 📊 Post-Deployment

### Monitoring Setup
1. **Vercel Analytics**: Enable in Vercel dashboard
2. **Error Tracking**: Consider adding Sentry
3. **Performance Monitoring**: Use built-in Vercel metrics
4. **Uptime Monitoring**: Set up health checks

### Domain Configuration (Optional)
1. **Custom Domain**: Add in Vercel dashboard
2. **DNS Settings**: Configure CNAME to Vercel
3. **SSL Certificate**: Automatically provisioned by Vercel

## 🎯 Success Metrics

Your deployment is successful when:
- ✅ App loads at the Vercel URL
- ✅ All main features work
- ✅ Mobile apps build and run
- ✅ No console errors
- ✅ Responsive design works
- ✅ Security features are functional

## 🚀 Going Live

Once deployed:
1. **Share your Vercel URL** with stakeholders
2. **Test with real Bitcoin transactions** (small amounts)
3. **Monitor performance** in Vercel dashboard
4. **Set up alerts** for errors and downtime
5. **Join community** for support and updates

---

## 🎉 Congratulations!

Your CrossBTC Vault is now live on Vercel! Users can now:
- Manage Bitcoin yield vaults
- Bridge assets across chains
- Access instant Lightning payments
- Monitor security and risk metrics
- Use native mobile applications

For ongoing support and updates, join our community and follow the documentation in the repository.