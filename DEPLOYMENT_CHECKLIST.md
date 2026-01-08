# Gongen Platform Deployment Checklist

**Date**: 2025-01-27  
**Status**: Pre-Deployment Review

---

## 📋 Overview

This document outlines what needs to be completed to deploy the Gongen (SoulCast) online platform. The platform consists of:
- **Frontend**: React + Vite application
- **Backend**: Cloudflare Workers API
- **Database**: Cloudflare D1
- **Smart Contracts**: Ethereum/Solana contracts
- **Hosting**: Cloudflare Pages (frontend) + Cloudflare Workers (backend)

---

## ✅ What's Already Done

1. ✅ **Frontend Build Configuration**
   - Vite build setup complete
   - Production build scripts configured
   - Build output directory: `dist/`

2. ✅ **Backend Infrastructure**
   - Cloudflare Workers configured (`wrangler.toml`)
   - D1 database configured (database_id: `acf5ab8f-ea91-429c-bcd2-bf7899f91acc`)
   - API routes implemented
   - CORS configured for `https://socialbet.pages.dev`

3. ✅ **Deployment Scripts**
   - Staging deployment script (`scripts/deploy-staging.sh`)
   - Production deployment script (`scripts/deploy-production-monthly.sh`)
   - Sepolia testnet deployment script (`scripts/deploy-sepolia.sh`)

4. ✅ **Smart Contract Setup**
   - Hardhat configuration for multiple networks
   - Deployment scripts for Sepolia, Moon Island, Solana

5. ✅ **Documentation**
   - Deployment guides exist
   - Environment variable documentation

---

## ❌ What Needs to Be Done

### 1. Environment Configuration ⚠️ **CRITICAL**

#### Missing Files:
- [ ] **`.env.example`** - Template file for environment variables
- [ ] **`.env.local`** - Actual environment file (should not be committed)

#### Required Environment Variables:

**Frontend (VITE_ prefix required):**
```env
# Blockchain Configuration
VITE_DEFAULT_CHAIN=sepolia
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
VITE_SOUL_TOKEN_SEPOLIA=0x...  # Contract address after deployment
VITE_PLATFORM_ADDRESS=0x...     # Address to receive fees

# Web3Auth
VITE_WEB3AUTH_CLIENT_ID=your_client_id
VITE_WEB3AUTH_NETWORK=sapphire_devnet

# API Configuration
VITE_API_URL=https://api.kolmarket.ai

# Optional: Gemini AI
GEMINI_API_KEY=your_gemini_key
```

**Backend (Cloudflare Workers):**
- [ ] Set environment variables in Cloudflare Dashboard
- [ ] Configure secrets via `wrangler secret put <KEY>`

**Smart Contract Deployment:**
```env
PRIVATE_KEY=your_deployment_private_key
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_etherscan_key  # For contract verification
```

---

### 2. Backend Deployment ⚠️ **CRITICAL**

#### Cloudflare Workers Setup:
- [ ] **Authenticate with Cloudflare:**
  ```bash
  cd backend
  wrangler login
  ```

- [ ] **Deploy D1 Database:**
  ```bash
  # Database already created (ID: acf5ab8f-ea91-429c-bcd2-bf7899f91acc)
  # Run migrations
  wrangler d1 execute socialbet-db --file=./schema.sql
  wrangler d1 execute socialbet-db --file=./seed.sql
  ```

- [ ] **Deploy Workers:**
  ```bash
  cd backend
  npm run deploy
  # Or: wrangler deploy
  ```

- [ ] **Verify Deployment:**
  - [ ] Test health endpoint: `https://api.kolmarket.ai/health`
  - [ ] Test API endpoints
  - [ ] Verify CORS configuration

---

### 3. Frontend Deployment ⚠️ **CRITICAL**

#### Current Status:
- Deployment scripts exist but **don't actually deploy** - they just build
- Need to configure actual deployment commands

#### Options:

**Option A: Cloudflare Pages (Recommended - matches backend)**
- [ ] **Install Wrangler CLI:**
  ```bash
  npm install -g wrangler
  ```

- [ ] **Deploy to Cloudflare Pages:**
  ```bash
  npm run build
  wrangler pages deploy dist --project-name=socialbet
  ```

- [ ] **Or configure via Cloudflare Dashboard:**
  - [ ] Connect GitHub repository
  - [ ] Set build command: `npm run build`
  - [ ] Set output directory: `dist`
  - [ ] Add environment variables in dashboard

**Option B: Vercel**
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Update deployment scripts
- [ ] Deploy: `vercel --prod`

**Option C: Netlify**
- [ ] Install Netlify CLI: `npm i -g netlify-cli`
- [ ] Update deployment scripts
- [ ] Deploy: `netlify deploy --prod`

#### Update Deployment Scripts:
- [ ] Update `scripts/deploy-staging.sh` with actual deployment command
- [ ] Update `scripts/deploy-production-monthly.sh` with actual deployment command

---

### 4. Smart Contract Deployment

#### Ethereum Contracts (Sepolia):
- [ ] **Get Sepolia ETH** for gas fees
  - Alchemy Faucet: https://sepoliafaucet.com/
  - Infura Faucet: https://www.infura.io/faucet/sepolia

- [ ] **Deploy Contracts:**
  ```bash
  cd contracts
  npm install
  npm run deploy:sepolia
  # Or: npx hardhat run scripts/deploy-sepolia.ts --network sepolia
  ```

- [ ] **Update Environment Variables:**
  - [ ] Copy deployed contract addresses to `.env.local`
  - [ ] Update `VITE_SOUL_TOKEN_SEPOLIA` with contract address

- [ ] **Verify Contracts (Optional):**
  ```bash
  npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
  ```

#### Solana Contracts (Devnet):
- [ ] **Deploy Solana Program:**
  ```bash
  cd solana
  anchor build
  anchor deploy
  ```

- [ ] **Update Environment Variables:**
  - [ ] Add `VITE_SOUL_TOKEN_SOLANA` with program ID
  - [ ] Add `VITE_SOLANA_RPC_URL`

---

### 5. Database Setup

#### Cloudflare D1:
- [ ] **Run Schema Migration:**
  ```bash
  cd backend
  wrangler d1 execute socialbet-db --file=./schema.sql
  ```

- [ ] **Seed Initial Data (Optional):**
  ```bash
  wrangler d1 execute socialbet-db --file=./seed.sql
  ```

- [ ] **Verify Database:**
  - [ ] Test database queries via API
  - [ ] Verify tables exist

---

### 6. Domain & DNS Configuration

- [ ] **Configure Custom Domain (if needed):**
  - [ ] Set up DNS records in Cloudflare
  - [ ] Configure SSL/TLS certificates
  - [ ] Update CORS settings if using custom domain

- [ ] **Update API URL:**
  - [ ] If using custom domain, update `VITE_API_URL` in environment variables
  - [ ] Update backend CORS to include custom domain

---

### 7. Security & Configuration

#### Environment Variables:
- [ ] **Create `.env.example`** with all required variables (no secrets)
- [ ] **Create `.env.local`** with actual values (add to `.gitignore`)
- [ ] **Set Cloudflare Workers secrets:**
  ```bash
  wrangler secret put GEMINI_API_KEY
  wrangler secret put PRIVATE_KEY  # If needed
  ```

#### Security Checklist:
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Verify no secrets in code
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting (if needed)
- [ ] Set up monitoring/alerting

---

### 8. Testing & Verification

#### Pre-Deployment Testing:
- [ ] **Local Testing:**
  ```bash
  npm run dev
  # Test all features locally
  ```

- [ ] **Build Testing:**
  ```bash
  npm run build
  npm run preview
  # Test production build locally
  ```

- [ ] **Backend Testing:**
  ```bash
  cd backend
  npm run dev
  # Test API endpoints
  ```

#### Post-Deployment Verification:
- [ ] **Frontend:**
  - [ ] Verify site loads correctly
  - [ ] Test wallet connection
  - [ ] Test market creation
  - [ ] Test betting functionality
  - [ ] Test on multiple browsers
  - [ ] Test mobile responsiveness

- [ ] **Backend:**
  - [ ] Test all API endpoints
  - [ ] Verify database connections
  - [ ] Test CORS configuration
  - [ ] Monitor error logs

- [ ] **Smart Contracts:**
  - [ ] Verify contracts on block explorer
  - [ ] Test token transfers
  - [ ] Test market creation fees
  - [ ] Test staking (if applicable)

---

### 9. Documentation Updates

- [ ] **Update README.md** with:
  - [ ] Deployment instructions
  - [ ] Environment setup guide
  - [ ] Production URLs

- [ ] **Create deployment runbook** with:
  - [ ] Step-by-step deployment process
  - [ ] Rollback procedures
  - [ ] Troubleshooting guide

---

### 10. Monitoring & Maintenance

- [ ] **Set up monitoring:**
  - [ ] Cloudflare Analytics
  - [ ] Error tracking (e.g., Sentry)
  - [ ] Uptime monitoring

- [ ] **Set up alerts:**
  - [ ] API error alerts
  - [ ] Database error alerts
  - [ ] Deployment failure alerts

---

## 🚀 Quick Start Deployment Commands

### Complete Deployment (Step by Step):

```bash
# 1. Setup environment
cp .env.example .env.local  # Create from template
# Edit .env.local with actual values

# 2. Deploy backend
cd backend
wrangler login
wrangler d1 execute socialbet-db --file=./schema.sql
npm run deploy

# 3. Deploy smart contracts
cd ../contracts
npm install
npm run deploy:sepolia
# Update .env.local with contract addresses

# 4. Build frontend
cd ..
npm install
npm run build

# 5. Deploy frontend
wrangler pages deploy dist --project-name=socialbet
# Or use your preferred hosting platform
```

---

## 📝 Priority Order

1. **HIGH PRIORITY** (Required for deployment):
   - Environment configuration (`.env.local`)
   - Backend deployment (Cloudflare Workers)
   - Frontend deployment (Cloudflare Pages or alternative)
   - Smart contract deployment

2. **MEDIUM PRIORITY** (Should be done):
   - Database migrations
   - Contract verification
   - Testing & verification
   - Documentation updates

3. **LOW PRIORITY** (Can be done post-deployment):
   - Custom domain setup
   - Advanced monitoring
   - Performance optimizations

---

## ⚠️ Known Issues

1. **Deployment Scripts**: The deployment scripts (`deploy-staging.sh`, `deploy-production-monthly.sh`) don't actually deploy - they just build. Need to add actual deployment commands.

2. **Missing .env.example**: No template file for environment variables exists.

3. **CORS Configuration**: Backend CORS is hardcoded to `https://socialbet.pages.dev` - may need to update for actual deployment URL.

4. **Database Migrations**: Need to verify if migrations have been run on production D1 database.

---

## 📞 Next Steps

1. **Immediate Actions:**
   - Create `.env.example` template
   - Set up `.env.local` with actual values
   - Deploy backend to Cloudflare Workers
   - Deploy frontend to Cloudflare Pages

2. **Before Production:**
   - Complete all testing
   - Deploy and verify smart contracts
   - Set up monitoring
   - Document deployment process

3. **Post-Deployment:**
   - Monitor for errors
   - Collect user feedback
   - Plan next iteration

---

**Last Updated**: 2025-01-27






