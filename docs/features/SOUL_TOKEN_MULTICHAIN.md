# SOUL Token Multi-Chain Implementation

## Overview

The SOUL token is now fully functional on both **Ethereum Sepolia** and **Solana Devnet**, providing users with flexibility to interact with SOUL tokens on their preferred blockchain.

---

## Architecture

### Dual-Chain Support

1. **Ethereum/Sepolia**
   - ERC-20 token contract (`SoulCastToken.sol`)
   - Full staking functionality
   - Issuance fee burn mechanism
   - Token distribution allocations

2. **Solana/Devnet**
   - SPL token program (`soulcast/lib.rs`)
   - Staking with rewards
   - Transfer with fee burn
   - Mint authority management

---

## Features

### 1. Token Balance Display

The `SoulTokenBalance` component displays balances across all connected chains:

- **Multi-chain aggregation**: Shows total balance across Ethereum and Solana
- **Chain-specific breakdown**: Individual balances per chain
- **Real-time updates**: Auto-refreshes every 30 seconds
- **Staking info**: Optional display of staked amounts and pending rewards

**Usage:**
```tsx
import SoulTokenBalance from './components/SoulTokenBalance';

<SoulTokenBalance showStaking={true} compact={false} />
```

### 2. Token Staking

The `SoulTokenStaking` component allows users to stake SOUL tokens on either chain:

- **Chain selection**: Choose between Ethereum or Solana
- **Stake/Unstake**: Deposit or withdraw staked tokens
- **Claim rewards**: Collect staking rewards
- **Real-time info**: View staked amount and pending rewards

**Usage:**
```tsx
import SoulTokenStaking from './components/SoulTokenStaking';

<SoulTokenStaking onClose={() => setIsOpen(false)} />
```

### 3. Token Trading

The existing `SoulTokenTrading` component supports trading on both chains:

- **Fiat on-ramp**: Buy SOUL with fiat via Web3Auth
- **Crypto trading**: Buy/sell with ETH or SOL
- **Multi-chain**: Automatically detects connected wallets

---

## Service Layer

### `soulTokenService.ts`

Provides unified functions for interacting with SOUL tokens on both chains:

#### Balance Functions
- `getEthereumBalance(address, provider, network)`: Get SOUL balance on Ethereum/Sepolia
- `getSolanaBalance(address, connection, mintAddress)`: Get SOUL balance on Solana
- `getTotalBalance(...)`: Aggregate balances across all chains

#### Transfer Functions
- `transferEthereum(to, amount, provider)`: Transfer SOUL on Ethereum
- `transferSolana(to, amount, fromKeypair, connection)`: Transfer SOUL on Solana

#### Staking Functions
- `stakeEthereum(amount, provider)`: Stake SOUL on Ethereum
- `getEthereumStakeInfo(address, provider)`: Get staking info on Ethereum
- `getSolanaStakeInfo(address, connection)`: Get staking info on Solana

---

## Smart Contracts

### Ethereum (Sepolia)

**Contract**: `SoulCastToken.sol`
- **Location**: `contracts/contracts/SoulCastToken.sol`
- **Features**:
  - ERC-20 standard with 18 decimals
  - Total supply: 2.1 billion tokens
  - Staking with rewards (5% APY default)
  - Issuance fee burn (1% default)
  - Token distribution allocations
  - Upgradeable (UUPS pattern)

**Deployment**:
```bash
cd contracts
npx hardhat run scripts/deploy-sepolia.ts --network sepolia
```

### Solana (Devnet)

**Program**: `soulcast`
- **Location**: `solana/programs/soulcast/src/lib.rs`
- **Features**:
  - SPL token mint (9 decimals)
  - Staking with rewards
  - Transfer with fee burn
  - Mint authority via PDA

**Deployment**:
```bash
cd solana
anchor build
anchor deploy --provider.cluster devnet
```

---

## Configuration

### Environment Variables

Add to `.env.local`:

```env
# Ethereum Sepolia
VITE_SOUL_TOKEN_SEPOLIA=0x...  # Contract address after deployment

# Solana Devnet
VITE_SOUL_TOKEN_SOLANA=...     # Program ID after deployment
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Token Configuration

The `SOUL_TOKEN_CONFIG` in `soulTokenService.ts` defines:

```typescript
{
  symbol: 'SOUL',
  name: 'SoulCast Token',
  decimals: {
    ethereum: 18,
    solana: 9,
  },
  totalSupply: 2_100_000_000,
  addresses: {
    sepolia: process.env.VITE_SOUL_TOKEN_SEPOLIA || '',
    solana: process.env.VITE_SOUL_TOKEN_SOLANA || '',
  },
}
```

---

## Deployment

### Complete Deployment (Both Chains)

Use the unified deployment script:

```bash
./scripts/deploy-solana-sepolia.sh
```

This script:
1. Deploys Solana program to devnet
2. Deploys Ethereum contract to Sepolia
3. Updates environment variables
4. Builds the frontend

### Individual Deployments

**Ethereum Sepolia only:**
```bash
./scripts/deploy-sepolia.sh
```

**Solana Devnet only:**
```bash
./scripts/deploy-solana-devnet.sh
```

---

## Integration

### App.tsx Integration

The components are already integrated in `App.tsx`:

```tsx
// Lazy loaded components
const SoulTokenBalance = lazy(() => import('./components/SoulTokenBalance'));
const SoulTokenStaking = lazy(() => import('./components/SoulTokenStaking'));

// Modal states
const [isStakingModalOpen, setIsStakingModalOpen] = useState(false);

// Handlers
const handleOpenStakingModal = useCallback(() => setIsStakingModalOpen(true), []);
const handleCloseStakingModal = useCallback(() => setIsStakingModalOpen(false), []);
```

### RightPanel Integration

The `RightPanel` component includes buttons to:
- Trade SOUL tokens
- Stake SOUL tokens

Both buttons open their respective modals.

---

## Usage Examples

### Check Balance

```typescript
import { getTotalBalance } from './services/soulTokenService';

const { total, balances } = await getTotalBalance(
  ethereumAddress,
  solanaAddress,
  ethereumProvider,
  solanaConnection
);

console.log(`Total SOUL: ${total}`);
balances.forEach(b => {
  console.log(`${b.chain}: ${b.formatted} SOUL`);
});
```

### Stake Tokens

```typescript
import { stakeEthereum } from './services/soulTokenService';

const txHash = await stakeEthereum(100, provider); // Stake 100 SOUL
console.log(`Staking transaction: ${txHash}`);
```

### Transfer Tokens

```typescript
import { transferEthereum, transferSolana } from './services/soulTokenService';

// Ethereum
const ethTx = await transferEthereum(recipientAddress, 50, provider);

// Solana
const solTx = await transferSolana(recipientAddress, 50, keypair, connection);
```

---

## Testing

### Ethereum Sepolia

1. Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
2. Deploy contract: `npx hardhat run scripts/deploy-sepolia.ts --network sepolia`
3. Verify on [Sepolia Etherscan](https://sepolia.etherscan.io)

### Solana Devnet

1. Get testnet SOL: `solana airdrop 2`
2. Deploy program: `anchor deploy --provider.cluster devnet`
3. Verify on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

---

## Known Limitations

1. **Solana Staking**: Full implementation requires additional Anchor program setup
2. **Cross-chain transfers**: Not yet implemented (requires bridge)
3. **Reward calculation**: Currently uses mock data for Solana
4. **Transaction waiting**: Ethereum transactions use simulated waiting (should use proper confirmation)

---

## Future Enhancements

1. **Cross-chain bridge**: Enable SOUL transfers between Ethereum and Solana
2. **Unified staking**: Single interface for staking across chains
3. **Reward aggregation**: Combined rewards view across chains
4. **Gas optimization**: Batch transactions where possible
5. **Mobile wallet support**: Enhanced mobile wallet integration

---

## Support

For issues or questions:
- Check deployment logs: `deploy-sepolia.log`
- Review contract addresses in `.env.local`
- Verify network connectivity
- Check wallet connection status

---

## References

- [Ethereum Sepolia Docs](https://ethereum.org/en/developers/docs/networks/#sepolia)
- [Solana Devnet Docs](https://docs.solana.com/clusters/devnet)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Hardhat Documentation](https://hardhat.org/docs)

