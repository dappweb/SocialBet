# Prediction Market Testing Guide

## Contract Deployed ✅

**Contract Address**: `0x04fC67aA613253Ec04d90426Dd61365415861b2f`  
**Etherscan**: https://sepolia.etherscan.io/address/0x04fC67aA613253Ec04d90426Dd61365415861b2f

## Frontend Testing Steps

### 1. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

This loads the new `VITE_PREDICTION_MARKET_SEPOLIA` environment variable.

### 2. Test Market Creation

**Prerequisites**:
- Wallet connected (Web3Auth or MetaMask)
- At least 10 SOUL tokens
- Connected to Sepolia network

**Steps**:
1. Click "Create Market" button
2. Fill in:
   - Question: "Will Bitcoin reach $100k by 2025?"
   - Category: Crypto
   - End Date: Future date
   - Initial Liquidity: 10 (or more)
3. Submit
4. **Expected**: 
   - 10 SOUL tokens deducted
   - Market created on-chain
   - Transaction hash displayed
   - Market appears in feed

**Verify on Etherscan**:
- Check transaction hash
- Verify SOUL token transfer
- Check contract state

### 3. Test Betting

**Prerequisites**:
- Market created and active
- Wallet connected
- SOUL tokens for betting

**Steps**:
1. Find a market in the feed
2. Click "Bet YES" or "Bet NO"
3. Enter bet amount (minimum 1 SOUL)
4. Submit transaction
5. **Expected**:
   - Transaction sent to contract
   - Bet recorded on-chain
   - Market prices update
   - Transaction hash displayed

**Verify**:
- Check transaction on Etherscan
- Verify bet recorded in contract
- Check updated pool sizes

### 4. Test Market Resolution

**Prerequisites**:
- Market end date has passed
- You are market creator or admin
- Wallet connected

**Steps**:
1. Open market details
2. Click "Resolve Market" (if you're creator/admin)
3. Select outcome: YES, NO, or INVALID
4. Submit transaction
5. **Expected**:
   - Market marked as resolved
   - Outcome set
   - Users can claim winnings

**Verify**:
- Check contract state on Etherscan
- Verify resolution event emitted

### 5. Test Claiming Winnings

**Prerequisites**:
- Market resolved
- You have winning bets
- Wallet connected

**Steps**:
1. Open resolved market
2. Click "Claim Winnings"
3. Submit transaction
4. **Expected**:
   - Payout calculated
   - SOUL tokens transferred
   - Transaction hash displayed

**Verify**:
- Check transaction on Etherscan
- Verify SOUL token balance increased

## Contract Interaction Tests

### Using Hardhat Console

```bash
cd contracts
npx hardhat console --network sepolia
```

Then:
```javascript
const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
const market = PredictionMarket.attach("0x04fC67aA613253Ec04d90426Dd61365415861b2f");

// Get market count
await market.getMarketCount();

// Get market data
await market.getMarket(1);

// Get prices
await market.getMarketPrices(1);
```

## Troubleshooting

### "Contract not configured"
- Check `.env.local` has `VITE_PREDICTION_MARKET_SEPOLIA`
- Restart dev server

### "Insufficient balance"
- Ensure you have SOUL tokens
- Check token approval if needed

### "Transaction failed"
- Check gas limit
- Verify network (Sepolia)
- Check contract state

### "Market not found"
- Verify market ID
- Check if market was created on-chain

## Expected Gas Costs

- Create Market: ~150,000 - 200,000 gas
- Place Bet: ~100,000 - 150,000 gas
- Resolve Market: ~80,000 - 120,000 gas
- Claim Winnings: ~100,000 - 150,000 gas

## Monitoring

Watch contract on Etherscan:
- Transactions tab
- Events tab
- Contract tab (read functions)

## Next Steps After Testing

1. ✅ Verify all functions work
2. ✅ Test edge cases
3. ✅ Monitor gas usage
4. ✅ Check event emissions
5. ✅ Test with multiple users
6. ✅ Prepare for mainnet deployment
