# On-Chain and Web Page Function Alignment

This document outlines how all on-chain smart contract functions are aligned with web page functionality.

## Contract Service Architecture

### Core Service: `soulContractService.ts`
Provides typed interface to interact with `SoulCastToken.sol` smart contract.

### High-Level Service: `stakingService.ts`
Provides user-friendly interface for staking operations with error handling and callbacks.

## Function Alignment Matrix

### 1. Balance Operations

| On-Chain Function | Web Service | Frontend Usage | Status |
|-------------------|-------------|----------------|--------|
| `balanceOf(address)` | `getBalance()` | `AuthContext` syncs balance | ✅ Aligned |
| Backend API `sosTokenBalance` | `usersApi.getById()` | Fallback when on-chain unavailable | ✅ Aligned |

### 2. Staking Operations

| On-Chain Function | Web Service | Frontend Usage | Status |
|-------------------|-------------|----------------|--------|
| `stake(uint256 amount)` | `stake()` → `stakingService.stakeTokens()` | Staking UI components | ✅ Aligned |
| `unstake(uint256 amount)` | `unstake()` → `stakingService.unstakeTokens()` | Unstaking UI components | ✅ Aligned |
| `claimRewards()` | `claimRewards()` → `stakingService.claimStakingRewards()` | Claim rewards button | ✅ Aligned |
| `getStakeInfo(address)` | `getStakeInfo()` → `stakingService.getUserStakeInfo()` | Display staking info | ✅ Aligned |
| `calculateRewards(address)` | `calculateRewards()` → `stakingService.getPendingRewards()` | Show pending rewards | ✅ Aligned |
| `stakingRewardRateBps()` | `getStakingRewardRate()` → `stakingService.getStakingAPY()` | Display APY | ✅ Aligned |

### 3. Transfer Operations

| On-Chain Function | Web Service | Frontend Usage | Status |
|-------------------|-------------|----------------|--------|
| `transfer(address to, uint256 amount)` | `transfer()` | Standard token transfers | ✅ Aligned |
| `transferWithIssuanceFee(address to, uint256 amount)` | `transferWithIssuanceFee()` | Market creation payments | ✅ Aligned |

### 4. Token Statistics

| On-Chain Function | Web Service | Frontend Usage | Status |
|-------------------|-------------|----------------|--------|
| `getTokenStats()` | `getTokenStats()` | Token dashboard, statistics page | ✅ Aligned |
| Returns: totalSupply, circulatingSupply, totalStaked, totalBurned, issuanceFeeBurned, stakingRewardsPool | | | |

### 5. Allocation Management

| On-Chain Function | Web Service | Frontend Usage | Status |
|-------------------|-------------|----------------|--------|
| `getAllocation(uint256 id)` | `getAllocation()` | Token distribution tracking | ✅ Aligned |
| `getReleasableAmount(uint256 id)` | Included in `getAllocation()` | Vesting schedule display | ✅ Aligned |

### 6. Fee Management

| On-Chain Function | Web Service | Frontend Usage | Status |
|-------------------|-------------|----------------|--------|
| `issuanceFeeBps()` | `getIssuanceFee()` | Display fee percentage | ✅ Aligned |

## Integration Points

### AuthContext Integration
- **Dual Balance Sync**: Fetches balance from both backend API and on-chain contract
- **On-Chain Priority**: Uses on-chain balance if higher (more accurate)
- **Fallback**: Falls back to API balance if on-chain fetch fails

### Market Creation Flow
1. User creates market → Frontend validates Soul balance
2. `deductSoul()` called → Updates local state immediately
3. Backend API validates and deducts → `POST /api/markets` checks balance
4. On-chain validation (future): Contract validates balance before market creation

### Staking Flow
1. User stakes tokens → `stakingService.stakeTokens()` called
2. Service calls `soulContractService.stake()` → Interacts with contract
3. Transaction sent → User confirms in wallet
4. Balance updated → Both on-chain and local state synced

## Configuration

### Contract Addresses
Set in environment variables:
- `VITE_SOUL_TOKEN_SEPOLIA` - Sepolia testnet
- `VITE_SOUL_TOKEN_MAINNET` - Ethereum mainnet
- `VITE_SOUL_TOKEN_LOCAL` - Local development

### Network Detection
Contract service automatically detects network from provider's chainId:
- ChainId 1 → Mainnet
- ChainId 11155111 → Sepolia
- ChainId 31337/1337 → Localhost

## Error Handling

All contract interactions include:
- Try-catch error handling
- User-friendly error messages
- Fallback to API when on-chain fails
- Transaction receipt validation

## Future Enhancements

1. **Market Creation On-Chain**: Move market creation to smart contract
2. **Betting On-Chain**: Implement betting directly on smart contract
3. **Multi-Chain Support**: Extend to Solana and BSC
4. **Gas Optimization**: Batch transactions where possible
5. **Event Listening**: Real-time updates via contract events

## Testing

To test alignment:
1. Deploy contract to testnet
2. Set contract address in `.env`
3. Connect wallet
4. Test each function through UI
5. Verify on-chain state matches UI state

