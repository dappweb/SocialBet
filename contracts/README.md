# SoulCast Token Smart Contracts

SOUL token and governance contracts for the SoulCast KOL Intent Prediction Market platform.

## Contracts

| Contract | Description |
|----------|-------------|
| `SoulCastToken.sol` | ERC-20 token with staking, issuance fee burn, role-based access |
| `SoulCastGovernor.sol` | DAO governance with 7-day voting, 1M SOUL proposal threshold |

## Token Specifications

- **Name:** SoulCast Token
- **Symbol:** SOUL
- **Total Supply:** 2,100,000,000 (2.1 billion)
- **Decimals:** 18
- **Chains:** Ethereum, BSC (Solana uses SPL token)

## Key Features

### 1. Issuance Fee Burn
Tokens are redeemed and destroyed as issuance fees via `transferWithIssuanceFee()`.

### 2. Staking
- `stake(amount)` - Stake SOUL tokens
- `unstake(amount)` - Unstake and claim rewards
- `claimRewards()` - Claim pending rewards
- Default: 5% annual reward rate

### 3. Token Distribution
| Allocation | Percentage | Amount |
|------------|------------|--------|
| Community Rewards & Airdrops | 30% | 630M |
| Intent Prediction Rewards | 25% | 525M |
| KOL & Creator Incentives | 15% | 315M |
| AI Avatar Development Fund | 10% | 210M |
| Liquidity Provision Rewards | 8% | 168M |
| Platform Operations Reserve | 7% | 147M |
| Team & Advisors (4yr vest) | 4% | 84M |
| Marketing & Partnerships | 1% | 21M |

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to testnet
npm run deploy:sepolia

# Deploy to BSC testnet
npm run deploy:bsc-testnet
```

## Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

## Deployment

```bash
# Local (Hardhat network)
npm run deploy:local

# Sepolia testnet
npm run deploy:sepolia

# Ethereum mainnet
npm run deploy:mainnet

# BSC mainnet
npm run deploy:bsc
```

## Solana Note

For Solana, use an SPL token instead of this ERC-20 contract. The SPL token can be created using:
- Metaplex for token metadata
- Associated Token Accounts for user balances
- Anchor framework for custom programs

## Security

- Uses OpenZeppelin contracts v5.0
- Role-based access control (MINTER, BURNER, STAKING, FEE_MANAGER)
- ReentrancyGuard for staking operations
- EIP-2612 permit for gasless approvals

## License

MIT
