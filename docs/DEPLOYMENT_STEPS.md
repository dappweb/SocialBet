# Deployment Steps for Blockchain Connection

## Step 1: Compile Contracts ✅

Contracts are already compiled. To recompile:
```bash
cd contracts
npm run compile
```

## Step 2: Configure Environment

Create or update `.env.local` in the root directory:

```bash
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://rpc.sepolia.org
# Or use a faster alternative:
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
# SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Optional: Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Step 3: Deploy to Sepolia

```bash
cd contracts
npx hardhat run scripts/deploy-sepolia.ts --network sepolia
```

**Note**: If you get timeout errors, try:
1. Using a different RPC endpoint (Alchemy, Infura, etc.)
2. Checking your network connection
3. Ensuring you have Sepolia ETH for gas fees

## Step 4: Update Frontend .env

After deployment, the script will output the contract address. Add it to your root `.env` file:

```bash
# In root directory .env file
VITE_SOUL_TOKEN_SEPOLIA=0x...  # Contract address from deployment
VITE_PLATFORM_ADDRESS=0x...    # Address to receive market creation fees
```

## Step 5: Test the Connection

1. Start the dev server: `npm run dev`
2. Connect your wallet (MetaMask, etc.)
3. Check WalletBalance component - should show on-chain SOUL balance
4. Try creating a market - should use on-chain transfer

## Troubleshooting

### Timeout Errors
- Use a faster RPC endpoint (Alchemy, Infura)
- Check your internet connection
- Try deploying during off-peak hours

### "PRIVATE_KEY not set" Error
- Ensure `.env.local` exists in root directory
- Check PRIVATE_KEY is set correctly (without 0x prefix)

### "Insufficient funds" Error
- Get Sepolia ETH from a faucet:
  - https://sepoliafaucet.com/
  - https://faucet.quicknode.com/ethereum/sepolia
  - https://www.alchemy.com/faucets/ethereum-sepolia

### Contract Address Not Found
- Check deployment output for the contract address
- Verify it's added to `.env` file
- Restart dev server after updating .env

## Alternative: Local Testing

For local testing without deploying to Sepolia:

```bash
# Start local Hardhat node
cd contracts
npx hardhat node

# In another terminal, deploy to localhost
npx hardhat run scripts/deploy-sepolia.ts --network localhost

# Update .env with localhost address
VITE_SOUL_TOKEN_LOCAL=0x...
```

## Verification

After deployment, verify the contract on Etherscan:
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```






