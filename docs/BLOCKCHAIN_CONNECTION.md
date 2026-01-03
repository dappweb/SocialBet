# Blockchain Connection Guide

This document describes how Soulcast is connected to the blockchain and how to configure it.

## Overview

Soulcast now has full blockchain integration for:
- ✅ SOUL token balance queries (on-chain)
- ✅ Market creation payments (on-chain transfer with issuance fee)
- ✅ Staking operations (stake, unstake, claim rewards)
- ✅ Token transfers
- ✅ Dual sync (API + blockchain)

## Configuration

### 1. Environment Variables

Add these to your `.env` file:

```bash
# SOUL Token Contract Addresses
VITE_SOUL_TOKEN_SEPOLIA=0x...  # Sepolia testnet contract address
VITE_SOUL_TOKEN_MAINNET=0x...   # Mainnet contract address (when deployed)
VITE_SOUL_TOKEN_LOCAL=0x...     # Local development contract address

# Platform Address (for receiving market creation fees)
VITE_PLATFORM_ADDRESS=0x...     # Address to receive SOUL tokens

# Web3Auth
VITE_WEB3AUTH_CLIENT_ID=your_client_id

# Network Configuration
VITE_DEFAULT_CHAIN=sepolia       # Options: sepolia, mainnet, moonisland
```

### 2. Deploy Contracts

First, deploy the SoulCastToken contract:

```bash
cd contracts
npm install
npx hardhat run scripts/deploy-sepolia.ts --network sepolia
```

Copy the deployed contract address to your `.env` file.

### 3. Verify Connection

1. Start the development server: `npm run dev`
2. Connect your wallet
3. Check the WalletBalance component - it should show on-chain SOUL balance
4. Try creating a market - it should use on-chain transfer

## How It Works

### Balance Sync

1. **On-Chain First**: When wallet is connected, fetches balance from blockchain
2. **API Fallback**: Falls back to API balance if on-chain fails
3. **Dual Display**: Shows both on-chain and API balance when available

### Market Creation Flow

1. User creates market → Frontend validates balance
2. **If wallet connected**:
   - Calls `transferWithIssuanceFee()` on-chain
   - Waits for transaction confirmation
   - Updates balance from blockchain
3. **If no wallet**:
   - Uses backend API only
   - Updates balance from API

### Staking Flow

1. User stakes tokens → `stakingService.stakeTokens()` called
2. Service calls `soulContractService.stake()` → On-chain transaction
3. User confirms in wallet
4. Balance updated from blockchain

## Network Support

Currently supported:
- ✅ Sepolia Testnet (default)
- ✅ Ethereum Mainnet (when configured)
- ✅ Localhost/Hardhat (for development)

Future:
- BSC (Binance Smart Chain)
- Solana

## Troubleshooting

### "Contract address not configured" Error

**Solution**: Set the contract address in `.env`:
```bash
VITE_SOUL_TOKEN_SEPOLIA=0xYourContractAddress
```

### Balance Not Updating

1. Check wallet is connected
2. Verify contract address is correct
3. Check network matches (Sepolia vs Mainnet)
4. Look for errors in browser console

### Transaction Fails

1. Ensure you have enough ETH for gas
2. Check you have enough SOUL tokens
3. Verify contract is deployed on current network
4. Check transaction on block explorer

## Testing

### Test On-Chain Balance

```typescript
import { getBalance } from './services/soulContractService';
import { useWeb3Auth } from './contexts/Web3AuthContext';

const { provider, walletAddress } = useWeb3Auth();
const balance = await getBalance(walletAddress, provider);
console.log('On-chain balance:', balance.balance);
```

### Test Market Creation Payment

1. Ensure you have > 10 SOUL tokens
2. Connect wallet
3. Create a market
4. Check transaction on block explorer
5. Verify balance decreased

## Architecture

```
Frontend Components
    ↓
Contract Service (soulContractService.ts)
    ↓
Ethers.js / Web3Auth Provider
    ↓
Blockchain (Ethereum/Sepolia)
```

## Next Steps

1. Deploy contracts to testnet
2. Set contract addresses in `.env`
3. Test all operations
4. Deploy to mainnet (when ready)






