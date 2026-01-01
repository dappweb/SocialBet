# Soulcast Deployment Guide

## Moon Island ETH Testnet Deployment

This guide covers deploying Soulcast to the Moon Island ETH testnet.

---

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Moon Island Testnet Account** with private key
4. **Testnet ETH** for gas fees
5. **Web3Auth Account** (for authentication)

---

## Environment Setup

### 1. Create Environment File

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

### 2. Configure Moon Island Testnet

Edit `.env.local` and add your Moon Island testnet configuration:

```env
# Moon Island ETH Testnet
MOON_ISLAND_RPC_URL=https://rpc.moonisland.eth
MOON_ISLAND_CHAIN_ID=0x123456  # Update with actual chain ID
MOON_ISLAND_BLOCK_EXPLORER=https://explorer.moonisland.eth

# Deployment Account Private Key (Moon Island Testnet)
PRIVATE_KEY=b24a73b993f8836a9279b9ae6c3a693ef2cc4a0731d4ec900cd96e93614dfac2

# Default Chain
DEFAULT_CHAIN=moonisland

# Web3Auth Configuration
WEB3AUTH_CLIENT_ID=your_web3auth_client_id
WEB3AUTH_NETWORK=sapphire_devnet
```

**⚠️ Security Note**: Never commit `.env.local` to git. It's already in `.gitignore`.

### 3. Vite Environment Variables

For Vite to access environment variables, prefix them with `VITE_`:

```env
# Vite Environment Variables (accessible in frontend)
VITE_DEFAULT_CHAIN=moonisland
VITE_MOON_ISLAND_RPC_URL=https://rpc.moonisland.eth
VITE_MOON_ISLAND_CHAIN_ID=0x123456
VITE_MOON_ISLAND_BLOCK_EXPLORER=https://explorer.moonisland.eth
VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
VITE_WEB3AUTH_NETWORK=sapphire_devnet
```

---

## Smart Contract Deployment

### 1. Install Dependencies

```bash
cd contracts
npm install
```

### 2. Compile Contracts

```bash
npm run compile
```

### 3. Deploy to Moon Island Testnet

```bash
# Deploy all contracts
npx hardhat run scripts/deploy.ts --network moonisland

# Or deploy specific contract
npx hardhat run scripts/deploy-token.ts --network moonisland
```

### 4. Verify Contracts (Optional)

```bash
npx hardhat verify --network moonisland <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Frontend Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Build for Production

```bash
npm run build
```

This creates a `dist/` directory with optimized production files.

### 3. Deploy to Hosting Platform

#### Option A: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Option C: Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Cloudflare dashboard

#### Option D: Static Hosting

Upload the `dist/` folder to any static hosting service:
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps
- Google Cloud Storage

---

## Configuration Updates

### Update Chain Configuration

After deployment, update the Moon Island testnet details in:

1. **`contexts/Web3AuthContext.tsx`** - Web3Auth chain config
2. **`contracts/hardhat.config.ts`** - Hardhat network config
3. **`.env.local`** - Environment variables

### Get Moon Island Testnet Details

You'll need to obtain:
- **Chain ID**: From Moon Island documentation
- **RPC URL**: Public RPC endpoint
- **Block Explorer**: URL for viewing transactions

Update these in your `.env.local` file.

---

## Post-Deployment Checklist

- [ ] Verify smart contracts are deployed and verified
- [ ] Test Web3Auth login on Moon Island testnet
- [ ] Verify wallet connection works
- [ ] Test transaction functionality
- [ ] Check block explorer for deployed contracts
- [ ] Verify environment variables are set correctly
- [ ] Test on multiple browsers
- [ ] Verify mobile responsiveness

---

## Troubleshooting

### Issue: "Invalid chain ID"

**Solution**: Update `MOON_ISLAND_CHAIN_ID` in `.env.local` with the correct chain ID (hex format, e.g., `0x123456`).

### Issue: "RPC URL not accessible"

**Solution**: 
1. Verify the RPC URL is correct
2. Check if you need authentication
3. Try alternative RPC endpoints

### Issue: "Insufficient funds"

**Solution**: 
1. Get testnet ETH from Moon Island faucet
2. Verify your account has enough balance
3. Check gas price settings

### Issue: "Web3Auth not connecting"

**Solution**:
1. Verify `WEB3AUTH_CLIENT_ID` is correct
2. Check Web3Auth network setting matches your environment
3. Ensure Moon Island chain is supported by Web3Auth

---

## Security Best Practices

1. **Never commit private keys** to git
2. **Use environment variables** for sensitive data
3. **Rotate keys** if exposed
4. **Use testnet accounts** for development
5. **Verify contracts** on block explorer
6. **Enable HTTPS** for production
7. **Use secure RPC endpoints**

---

## Moon Island Testnet Account

**Account Private Key**: `b24a73b993f8836a9279b9ae6c3a693ef2cc4a0731d4ec900cd96e93614dfac2`

**⚠️ Warning**: This is a testnet account. Never use this private key on mainnet or share it publicly.

### Getting Testnet ETH

1. Visit Moon Island faucet (if available)
2. Request testnet ETH to your account address
3. Wait for confirmation

### Account Address

Derive the account address from the private key:

```bash
# Using Node.js
node -e "const { privateToAddress } = require('ethereumjs-util'); console.log('0x' + privateToAddress(Buffer.from('b24a73b993f8836a9279b9ae6c3a693ef2cc4a0731d4ec900cd96e93614dfac2', 'hex')).toString('hex'));"
```

Or use a tool like [MyEtherWallet](https://www.myetherwallet.com/) to import the private key and view the address.

---

## Deployment Scripts

### Quick Deploy Script

Create `scripts/deploy-moonisland.sh`:

```bash
#!/bin/bash

# Load environment variables
source .env.local

# Deploy contracts
cd contracts
npx hardhat run scripts/deploy.ts --network moonisland

# Build frontend
cd ..
npm run build

echo "Deployment complete!"
echo "Contracts deployed to Moon Island testnet"
echo "Frontend built in dist/ directory"
```

Make it executable:

```bash
chmod +x scripts/deploy-moonisland.sh
```

Run:

```bash
./scripts/deploy-moonisland.sh
```

---

## Monitoring

### Block Explorer

Monitor deployments and transactions on Moon Island block explorer:
- URL: Update with actual Moon Island explorer URL
- View contract addresses
- Check transaction status
- Monitor gas usage

### Logs

Check deployment logs for errors:

```bash
# Hardhat deployment logs
npx hardhat run scripts/deploy.ts --network moonisland 2>&1 | tee deploy.log

# Frontend build logs
npm run build 2>&1 | tee build.log
```

---

## Rollback Procedure

If deployment fails:

1. **Smart Contracts**: Deploy new version or use upgradeable contracts
2. **Frontend**: Revert to previous build from version control
3. **Environment**: Update environment variables to previous values

---

## Support

For issues or questions:
1. Check Moon Island testnet documentation
2. Review error logs
3. Verify configuration matches testnet requirements
4. Contact Moon Island support if needed

---

**Last Updated**: 2025-01-27

