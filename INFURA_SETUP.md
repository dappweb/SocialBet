# Using Infura for Sepolia Deployment

## Get Infura API Key

1. **Sign up**: https://infura.io
2. **Create project**: Dashboard → Create New Key
3. **Select network**: Ethereum → Sepolia
4. **Copy API key**: It looks like `abc123def456...`

## Update Environment

Edit `.env.local`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
```

Replace `YOUR_INFURA_API_KEY` with your actual key.

## Alternative: Public RPC (No Key Required)

If you don't want to use Infura, try these public endpoints:

```env
# Option 1: PublicNode
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Option 2: Tenderly
SEPOLIA_RPC_URL=https://sepolia.gateway.tenderly.co

# Option 3: Ankr
SEPOLIA_RPC_URL=https://rpc.ankr.com/eth_sepolia
```

## Test Connection

After updating, test:
```bash
cd contracts
npm run deploy:prediction-market:sepolia
```
