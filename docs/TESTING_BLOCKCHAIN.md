# Blockchain Connection Testing Guide

## Prerequisites

1. **Hardhat Node Running** (for localhost testing):
   ```bash
   cd contracts
   npx hardhat node
   ```

2. **Contract Deployed**:
   - Localhost: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
   - Address saved in `.env` as `VITE_SOUL_TOKEN_LOCAL`

3. **Dev Server Running**:
   ```bash
   npm run dev
   ```

## Step 1: Verify Contract Connection ✅

### Test Contract Address Resolution
The contract service should automatically detect the network and use the correct address:
- Chain ID 31337 (localhost) → Uses `VITE_SOUL_TOKEN_LOCAL`
- Chain ID 11155111 (Sepolia) → Uses `VITE_SOUL_TOKEN_SEPOLIA`

### Verify in Browser Console
```javascript
// Check if contract address is configured
console.log('Local:', import.meta.env.VITE_SOUL_TOKEN_LOCAL);
console.log('Sepolia:', import.meta.env.VITE_SOUL_TOKEN_SEPOLIA);
```

## Step 2: Test On-Chain Balance Fetching ✅

### Setup
1. Connect MetaMask to localhost:8545
2. Import test account: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   - Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. This account has 2.1B SOUL tokens (total supply)

### Test in WalletBalance Component
1. Navigate to the app
2. Connect wallet
3. Expand WalletBalance component
4. Should show:
   - On-chain SOUL balance: 2,100,000,000.0000 SOUL
   - "On-chain" label
   - API balance (if different)

### Expected Behavior
- Balance fetched from contract `balanceOf()` function
- Displayed with 4 decimal places
- Updates when wallet connects/disconnects

## Step 3: Test Market Creation with Blockchain Payment ✅

### Prerequisites
- Wallet connected
- Account has > 10 SOUL tokens
- Hardhat node running

### Test Flow
1. Click "Create Market" button
2. Fill in market details:
   - Question: "Will Bitcoin hit $100k in 2024?"
   - Category: Crypto
   - End Date: Future date
   - Liquidity: 1000 USDC
3. Click "Create Market"

### Expected Behavior
1. **If wallet connected**:
   - Shows transaction hash in toast: "Transaction sent! Hash: 0x..."
   - MetaMask popup appears for transaction confirmation
   - After confirmation: "Transaction confirmed! 10 SOUL transferred with fee."
   - Balance updates automatically
   - Market created successfully

2. **If no wallet**:
   - Uses backend-only mode
   - Shows: "10 SOUL deducted" (from API)
   - Market created successfully

### Verify Transaction
- Check transaction hash on block explorer (localhost:8545)
- Verify `transferWithIssuanceFee()` was called
- Check balance decreased by 10 SOUL + issuance fee

## Step 4: Verify Balance Sync ✅

### Test Dual Sync
1. **On-Chain Balance**:
   - Fetched from `soulContractService.getBalance()`
   - More accurate, real-time
   - Shows in WalletBalance component

2. **API Balance**:
   - Fetched from `usersApi.getById()`
   - Fallback when on-chain unavailable
   - Cached in localStorage

### Expected Behavior
- On-chain balance takes priority when wallet connected
- API balance used as fallback
- Both displayed when they differ (shows sync status)
- Auto-refreshes after transactions

### Test Scenarios
1. **Wallet Connected**:
   - Should show on-chain balance
   - Updates immediately after transactions

2. **Wallet Disconnected**:
   - Falls back to API balance
   - Still functional for backend-only operations

3. **Balance Mismatch**:
   - Shows both balances
   - Indicates sync needed
   - On-chain is authoritative

## Testing Checklist

### Contract Connection
- [x] Contract address configured in .env
- [x] Contract service loads ABI correctly
- [x] Network detection works (chainId)
- [x] Error handling for missing addresses

### Balance Fetching
- [ ] WalletBalance shows on-chain balance
- [ ] Balance updates on wallet connect
- [ ] Fallback to API when on-chain fails
- [ ] Displays both balances when different

### Market Creation
- [ ] Transaction sent when wallet connected
- [ ] Transaction hash displayed
- [ ] MetaMask confirmation works
- [ ] Balance updates after transaction
- [ ] Market created successfully
- [ ] Backend validation passes

### Balance Sync
- [ ] On-chain balance prioritized
- [ ] API balance as fallback
- [ ] Sync status displayed
- [ ] Auto-refresh after transactions

## Troubleshooting

### "Contract address not configured"
- Check `.env` file has `VITE_SOUL_TOKEN_LOCAL` or `VITE_SOUL_TOKEN_SEPOLIA`
- Restart dev server after updating .env
- Verify network matches (localhost vs Sepolia)

### Balance shows 0
- Check wallet is connected
- Verify contract address is correct
- Ensure you're on the right network
- Check browser console for errors

### Transaction fails
- Ensure Hardhat node is running (for localhost)
- Check you have enough ETH for gas
- Verify you have enough SOUL tokens
- Check transaction in MetaMask

### Balance not updating
- Refresh the page
- Check browser console for errors
- Verify transaction was confirmed
- Check contract events

## Test Results

### Step 1: Contract Connection
- Status: ✅ Ready
- Contract Address: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- Network: localhost (31337)

### Step 2: Balance Fetching
- Status: ⏳ Ready for testing
- Component: WalletBalance
- Expected: Shows 2.1B SOUL for deployer account

### Step 3: Market Creation
- Status: ⏳ Ready for testing
- Payment Method: `transferWithIssuanceFee()`
- Amount: 10 SOUL

### Step 4: Balance Sync
- Status: ⏳ Ready for testing
- Sync Method: On-chain priority, API fallback

## Next Steps

1. Start Hardhat node: `cd contracts && npx hardhat node`
2. Start dev server: `npm run dev`
3. Connect MetaMask to localhost:8545
4. Import test account
5. Test each step above
6. Verify all operations work correctly






