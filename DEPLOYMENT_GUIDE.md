# Prediction Market Deployment Guide

## Issue: RPC Timeout (Error 522)

The Sepolia RPC endpoint may be experiencing high load or timeout issues.

## Solutions

### Option 1: Use Alternative RPC Endpoints

Update `.env.local` with one of these RPC URLs:

```env
# Alchemy (requires API key)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Infura (requires API key)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY

# Public alternatives
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
SEPOLIA_RPC_URL=https://sepolia.gateway.tenderly.co
SEPOLIA_RPC_URL=https://rpc2.sepolia.org
```

### Option 2: Manual Deployment

If RPC continues to timeout, you can deploy manually:

1. **Get contract bytecode**:
   ```bash
   cd contracts
   npx hardhat compile
   ```

2. **Deploy via Remix or other tools**:
   - Use Remix IDE (remix.ethereum.org)
   - Connect to Sepolia via MetaMask
   - Deploy PredictionMarket contract
   - Constructor params:
     - paymentToken: SOUL token address
     - platformFeeRecipient: Your address
     - owner: Your address

3. **Update environment**:
   ```env
   VITE_PREDICTION_MARKET_SEPOLIA=0x... # Your deployed address
   ```

### Option 3: Wait and Retry

Sometimes RPC endpoints recover. Try again later:
```bash
cd contracts
npm run deploy:prediction-market:sepolia
```

## Verification

After deployment, verify on Etherscan:
```
https://sepolia.etherscan.io/address/{CONTRACT_ADDRESS}
```

## Contract Constructor Parameters

- `_paymentToken`: SOUL token address (from VITE_SOUL_TOKEN_SEPOLIA)
- `_platformFeeRecipient`: Address to receive platform fees
- `_owner`: Contract owner address (can resolve markets)

## Next Steps After Deployment

1. Update frontend `.env.local` with contract address
2. Restart dev server
3. Test market creation
4. Test betting
5. Test resolution
