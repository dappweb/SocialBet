# Release v1.2.3 - SOUL Token Trading & Operational Funding

**Release Date**: 2025-01-27  
**Version**: 1.2.3  
**Status**: ✅ Ready for Deployment

---

## 🎉 Major Features

### SOUL Token Trading System
- Buy SOUL tokens with fiat (credit card, bank transfer)
- Buy SOUL tokens with ETH
- Sell SOUL tokens for fiat or crypto
- Real-time price calculation
- Web3Auth Wallet Services integration

### Treasury Management
- Operational fund dashboard
- Revenue tracking
- Fund allocation management
- Platform fee collection (2.5%)

### Deployment Management
- Monthly production deployment policy
- Automated deployment scripts
- Release versioning

---

## 📋 What's New

### Components
- `SoulTokenTrading.tsx` - Token trading interface
- `TreasuryManagement.tsx` - Treasury dashboard
- Enhanced `RightPanel.tsx` - Trading CTA

### Services
- `tokenTrading.ts` - Trading logic and calculations

### Configuration
- Sepolia testnet setup
- Environment-based chain configuration
- Deployment scripts

### Documentation
- SOUL token trading guide
- Deployment schedule and policy
- Sepolia testnet setup guide

---

## 🚀 Deployment Instructions

### Prerequisites
- Node.js installed
- Environment variables configured (`.env.local`)
- Sepolia testnet ETH for gas fees

### Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Sepolia testnet**
   ```bash
   npm run deploy:sepolia
   ```

3. **Deploy to production** (monthly only)
   ```bash
   npm run deploy:production
   ```

---

## 🔧 Configuration

### Environment Variables Required

```env
VITE_DEFAULT_CHAIN=sepolia
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key
VITE_WEB3AUTH_CLIENT_ID=your_client_id
VITE_WEB3AUTH_NETWORK=sapphire_devnet
```

---

## 📊 Key Metrics

- **Platform Fee**: 2.5% on all trades
- **SOUL Token Price**: $0.05 USD
- **Min Trade**: $10 USD
- **Max Trade**: $100,000 USD

---

## 🔐 Security

- Smart contract security audits recommended
- Private keys stored securely (never committed)
- Environment variables properly configured
- Testnet deployment first

---

## 📝 Notes

- Web3Auth Wallet Services integration ready (SDK installation needed)
- Smart contract deployment required for full functionality
- Price feeds need oracle integration for production

---

## 🐛 Known Issues

- Fiat on-ramp requires Web3Auth Wallet Services SDK installation
- Smart contracts need deployment
- Price feeds are mock data (needs oracle integration)

---

## 📚 Documentation

- [SOUL Token Trading Guide](./docs/features/SOUL_TOKEN_TRADING.md)
- [Deployment Schedule](./docs/deployment/DEPLOYMENT_SCHEDULE.md)
- [Sepolia Setup](./docs/deployment/SEPOLIA_SETUP.md)

---

**Next Release**: v1.2.4 (Planned for next month)
