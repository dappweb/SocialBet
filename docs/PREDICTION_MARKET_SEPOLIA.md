# Prediction Market on Sepolia Testnet

## Overview

Complete prediction market functionality has been implemented on Ethereum Sepolia testnet, enabling fully decentralized market creation, betting, and resolution.

## Smart Contracts

### PredictionMarket.sol

A comprehensive prediction market contract supporting:

- **Market Creation**: Create YES/NO binary prediction markets
- **Betting**: Place bets on either YES or NO outcomes
- **Automatic Market Maker (AMM)**: Dynamic pricing based on pool sizes
- **Market Resolution**: Resolve markets after end date
- **Claim Winnings**: Users can claim payouts from winning bets
- **Platform Fees**: 2.5% fee on all bets (250 basis points)

#### Key Features

- **Payment Token**: Uses SOUL token (or native ETH if configured)
- **Minimum Bet**: 1 token (18 decimals)
- **Maximum Bet**: 1,000,000 tokens
- **Platform Fee**: 2.5% (250 bps)
- **Access Control**: Owner and market creators can resolve markets

#### Contract Address

Deploy to Sepolia using:
```bash
cd contracts
npm run deploy:prediction-market:sepolia
```

The contract address will be saved to `.env.local` as `VITE_PREDICTION_MARKET_SEPOLIA`.

## Frontend Integration

### Services

**`services/predictionMarketService.ts`**

Complete service layer for interacting with the PredictionMarket contract:

- `createMarket()` - Create a new market on-chain
- `placeBet()` - Place a bet on a market
- `resolveMarket()` - Resolve a market (owner/creator only)
- `claimWinnings()` - Claim winnings from resolved markets
- `getMarket()` - Fetch market data from blockchain
- `getMarketPrices()` - Get current YES/NO prices
- `getUserBets()` - Get user's bets for a market
- `calculatePayout()` - Calculate potential payout
- `getClaimableAmount()` - Get claimable winnings

### Components

**`components/BetModal.tsx`**
- Updated to use on-chain transactions
- Automatically places bets on Sepolia when wallet connected
- Falls back to API-only if wallet not connected

**`components/CreateMarketModal.tsx`**
- Creates markets on-chain when wallet connected
- Syncs with backend for UI metadata
- Requires 10 SOUL tokens to create a market

**`components/MarketResolutionModal.tsx`**
- New component for resolving markets
- Only accessible to market creators or admins
- Supports YES, NO, and INVALID outcomes

## Deployment Instructions

### Prerequisites

1. SOUL token deployed on Sepolia
2. Private key with Sepolia ETH for gas
3. Environment variables configured

### Steps

1. **Set Environment Variables**

   In `contracts/.env.local` or root `.env.local`:
   ```env
   PRIVATE_KEY=your_private_key_here
   SEPOLIA_RPC_URL=https://rpc.sepolia.org
   SOUL_TOKEN_ADDRESS=0x... # Your SOUL token address
   ```

2. **Deploy Contract**

   ```bash
   cd contracts
   npm run deploy:prediction-market:sepolia
   ```

3. **Update Frontend Environment**

   The deployment script automatically adds `VITE_PREDICTION_MARKET_SEPOLIA` to `.env.local`.

   If manual update needed:
   ```env
   VITE_PREDICTION_MARKET_SEPOLIA=0x... # Contract address from deployment
   ```

4. **Verify Deployment**

   Check the contract on Etherscan:
   ```
   https://sepolia.etherscan.io/address/{CONTRACT_ADDRESS}
   ```

## Usage Flow

### Creating a Market

1. User connects wallet (Web3Auth or MetaMask)
2. User has at least 10 SOUL tokens
3. User fills out market creation form
4. On submit:
   - 10 SOUL tokens deducted
   - Market created on-chain (if wallet connected)
   - Market synced to backend for UI
5. Market appears in feed with on-chain data

### Placing a Bet

1. User clicks "Bet YES" or "Bet NO" on a market
2. User enters bet amount
3. On submit:
   - Transaction sent to PredictionMarket contract
   - Bet placed on-chain
   - Backend synced for UI
4. User's bet recorded in contract

### Resolving a Market

1. Market end date passes
2. Market creator or admin opens resolution modal
3. Selects outcome (YES, NO, or INVALID)
4. Transaction sent to contract
5. Market marked as resolved
6. Users can claim winnings

### Claiming Winnings

1. Market is resolved
2. User has winning bets
3. User clicks "Claim Winnings"
4. Transaction sent to contract
5. Payout calculated and transferred

## AMM Pricing Formula

The contract uses a simple AMM formula for pricing:

```
YES Price = YES Pool / (YES Pool + NO Pool)
NO Price = NO Pool / (YES Pool + NO Pool)
```

Payout calculation:
```
Payout = (Winning Pool * Bet Amount) / Losing Pool
```

## Platform Fees

- **Fee Rate**: 2.5% (250 basis points)
- **Recipient**: Set in constructor (default: deployer)
- **Applied To**: All bets placed
- **Distribution**: Fee transferred to platform fee recipient immediately

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Only owner/creator can resolve markets
- **Input Validation**: All inputs validated
- **Safe Math**: Using Solidity 0.8.20 built-in overflow protection
- **SafeERC20**: Using OpenZeppelin's SafeERC20 for token transfers

## Testing

### Manual Testing

1. **Create Market**:
   - Connect wallet
   - Create market with initial liquidity
   - Verify market appears on-chain

2. **Place Bet**:
   - Place YES bet
   - Place NO bet
   - Verify prices update
   - Check balances

3. **Resolve Market**:
   - Wait for end date (or use time manipulation in test)
   - Resolve as YES
   - Verify resolution

4. **Claim Winnings**:
   - User with winning bet claims
   - Verify payout received

### Automated Testing

```bash
cd contracts
npm run test
```

## Troubleshooting

### "Prediction market contract not configured"

- Ensure `VITE_PREDICTION_MARKET_SEPOLIA` is set in `.env.local`
- Restart dev server after adding environment variable

### "Insufficient balance"

- Ensure user has enough SOUL tokens (or ETH if using native token)
- Check token approval if using ERC-20

### "Market not expired"

- Markets can only be resolved after their end date
- Check market end date in contract

### "Not authorized"

- Only market creator or contract owner can resolve
- Check if user is creator or admin

## Next Steps

1. **Deploy to Sepolia**: Run deployment script
2. **Test Functionality**: Create markets, place bets, resolve
3. **Monitor**: Watch contract on Etherscan
4. **Optimize**: Adjust fees, limits as needed
5. **Mainnet**: Deploy to mainnet after thorough testing

## Contract Functions Reference

### Public Functions

- `createMarket(question, category, endDate, initialLiquidity)` - Create market
- `placeBet(marketId, side, amount)` - Place bet
- `resolveMarket(marketId, outcome)` - Resolve market
- `claimWinnings(marketId)` - Claim winnings
- `closeMarket(marketId)` - Emergency close (owner only)
- `cancelMarket(marketId)` - Cancel market (owner only)

### View Functions

- `getMarket(marketId)` - Get market data
- `getUserBets(marketId, user)` - Get user's bets
- `getMarketPrices(marketId)` - Get current prices
- `calculatePayout(marketId, side, amount)` - Calculate potential payout
- `getClaimableAmount(marketId, user)` - Get claimable winnings
- `getMarketCount()` - Get total market count

## Events

- `MarketCreated` - Emitted when market is created
- `BetPlaced` - Emitted when bet is placed
- `MarketResolved` - Emitted when market is resolved
- `BetClaimed` - Emitted when winnings are claimed
- `MarketClosed` - Emitted when market is closed

