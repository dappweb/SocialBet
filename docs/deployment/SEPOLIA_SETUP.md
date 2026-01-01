# Ethereum Sepolia Testnet Setup

## ✅ Configuration Complete

Soulcast is now configured for deployment on Ethereum Sepolia testnet.

---

## 📋 Configuration Summary

### Network Details

- **Network Name**: Sepolia Testnet
- **Chain ID**: 11155111 (0xaa36a7 in hex)
- **RPC URL**: https://rpc.sepolia.org
- **Block Explorer**: https://sepolia.etherscan.io
- **Currency**: SepoliaETH (testnet ETH)

### Account Information

- **Private Key**: Configured in `.env.local`
- **Account**: Derived from private key `b24a73b993f8836a9279b9ae6c3a693ef2cc4a0731d4ec900cd96e93614dfac2`

---

## 🚀 Quick Start

### 1. Get Sepolia Testnet ETH

You'll need SepoliaETH for gas fees. Get it from:
- **Alchemy Sepolia Faucet**: https://sepoliafaucet.com/
- **Infura Sepolia Faucet**: https://www.infura.io/faucet/sepolia
- **PoW Faucet**: https://sepolia-faucet.pk910.de/

### 2. Deploy Contracts

```bash
# Option 1: Use deployment script (recommended)
npm run deploy:sepolia

# Option 2: Manual deployment
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

### 3. Verify Contracts (Optional)

After deployment, verify contracts on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### 4. Build Frontend

```bash
npm run build
```

### 5. Deploy Frontend

Deploy the `dist/` folder to your hosting platform.

---

## 📝 Environment Variables

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_DEFAULT_CHAIN` | `sepolia` | Default chain for the app |
| `VITE_SEPOLIA_RPC_URL` | `https://rpc.sepolia.org` | Sepolia RPC endpoint |
| `SEPOLIA_RPC_URL` | `https://rpc.sepolia.org` | Sepolia RPC for Hardhat |
| `PRIVATE_KEY` | `b24a73b9...` | Deployment account private key |
| `VITE_WEB3AUTH_CLIENT_ID` | Your Web3Auth ID | Web3Auth client ID |
| `VITE_WEB3AUTH_NETWORK` | `sapphire_devnet` | Web3Auth network |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `ETHERSCAN_API_KEY` | For contract verification |
| `GEMINI_API_KEY` | For AI assistant fallback |

---

## 🔧 Configuration Files

### Web3Auth Context

The `contexts/Web3AuthContext.tsx` is configured to:
- Default to Sepolia testnet
- Use Sepolia chain ID: `0xaa36a7` (11155111)
- Use Sepolia RPC: `https://rpc.sepolia.org`
- Display "Sepolia Testnet" in UI

### Hardhat Configuration

The `contracts/hardhat.config.ts` includes:
- Sepolia network configuration
- Chain ID: 11155111
- Etherscan verification support

---

## 📊 Sepolia Testnet Information

### Network Specifications

- **Chain ID**: 11155111
- **Network ID**: 11155111
- **Currency Symbol**: SepoliaETH
- **Block Time**: ~12 seconds
- **Consensus**: Proof of Stake (PoS)

### RPC Endpoints

Multiple RPC endpoints available:
- Official: `https://rpc.sepolia.org`
- Alchemy: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
- Infura: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
- Ankr: `https://rpc.ankr.com/eth_sepolia`

### Block Explorer

- **Etherscan**: https://sepolia.etherscan.io
- View transactions, contracts, and accounts
- Verify and publish source code

---

## 🧪 Testing

### Test Contract Deployment

```bash
# Deploy to Sepolia
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia

# Check deployment
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Test Frontend Connection

1. Start development server:
   ```bash
   npm run dev
   ```

2. Connect wallet (MetaMask, etc.)
3. Switch network to Sepolia testnet
4. Test transactions

---

## 🔍 Verification Steps

### 1. Verify Environment

```bash
# Check environment variables
grep "VITE_DEFAULT_CHAIN" .env.local
# Should output: VITE_DEFAULT_CHAIN=sepolia
```

### 2. Verify Chain Configuration

```bash
# Test Web3Auth connection
npm run dev
# Open browser console and check chain ID
# Should show: 11155111 (Sepolia)
```

### 3. Verify Contract Deployment

After deployment:
- Check `deploy-sepolia.log` for contract addresses
- Verify on Sepolia Etherscan
- Test contract functions

---

## 🆘 Troubleshooting

### Issue: "Insufficient funds for gas"

**Solution**: Get SepoliaETH from faucet
- Visit https://sepoliafaucet.com/
- Enter your wallet address
- Request testnet ETH

### Issue: "Invalid chain ID"

**Solution**: 
- Verify `VITE_DEFAULT_CHAIN=sepolia` in `.env.local`
- Check Web3Auth network configuration
- Ensure wallet is connected to Sepolia

### Issue: "RPC URL not accessible"

**Solution**:
- Try alternative RPC endpoints
- Check if rate limiting is applied
- Use Alchemy or Infura with API key

### Issue: "Contract verification failed"

**Solution**:
- Ensure `ETHERSCAN_API_KEY` is set
- Check constructor arguments match
- Verify contract is deployed correctly

---

## 📚 Useful Resources

### Documentation
- **Sepolia Testnet**: https://sepolia.dev/
- **Etherscan Sepolia**: https://sepolia.etherscan.io
- **Hardhat Sepolia**: https://hardhat.org/hardhat-runner/docs/config#networks-configuration

### Faucets
- **Alchemy Faucet**: https://sepoliafaucet.com/
- **Infura Faucet**: https://www.infura.io/faucet/sepolia
- **PoW Faucet**: https://sepolia-faucet.pk910.de/

### Tools
- **Sepolia Explorer**: https://sepolia.etherscan.io
- **Remix IDE**: https://remix.ethereum.org (supports Sepolia)
- **MetaMask**: Add Sepolia network automatically

---

## ✅ Deployment Checklist

Before deploying:

- [ ] `.env.local` configured with Sepolia settings
- [ ] Account has SepoliaETH for gas fees
- [ ] Contracts compiled successfully
- [ ] Web3Auth configured for Sepolia
- [ ] Frontend builds without errors
- [ ] Test wallet connection on Sepolia
- [ ] Verify contracts on Etherscan

After deploying:

- [ ] Contracts deployed and verified
- [ ] Contract addresses updated in frontend (if needed)
- [ ] Frontend deployed to hosting platform
- [ ] Test transactions on Sepolia
- [ ] Monitor contract interactions
- [ ] Check block explorer for activity

---

## 🔐 Security Notes

1. **Testnet Only**: This configuration is for testnet only
2. **Private Key**: Never commit private keys to git
3. **Environment Variables**: Keep `.env.local` secure
4. **Mainnet**: Use different accounts and keys for mainnet

---

## 📞 Support

For issues:
1. Check Sepolia testnet status
2. Verify RPC endpoint is accessible
3. Ensure sufficient testnet ETH
4. Review deployment logs
5. Check Etherscan for transaction status

---

**Last Updated**: 2025-01-27  
**Status**: ✅ Configured for Sepolia Testnet  
**Default Chain**: Sepolia

