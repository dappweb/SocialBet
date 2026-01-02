# Smart Contract Documentation

**Date**: 2025-01-27  
**Network**: Sepolia Testnet

---

## 📋 Contract Information

### SOUL Token Contract

- **Contract Name**: SoulCastToken
- **Contract Address**: `0x0D6A6F6B15512cc9bf37621D9E5A4A4e1f41ef66`
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Block Explorer**: https://sepolia.etherscan.io/address/0x0D6A6F6B15512cc9bf37621D9E5A4A4e1f41ef66

---

## 🔧 Contract Details

### Token Specifications
- **Name**: SoulCast Token
- **Symbol**: SOUL
- **Total Supply**: 2.1 billion SOUL (2,100,000,000 * 10^18)
- **Decimals**: 18
- **Standard**: ERC-20 (Upgradeable)

### Contract Features
- ✅ ERC-20 Token Standard
- ✅ Burnable (ERC20Burnable)
- ✅ Permit (EIP-2612) for gasless approvals
- ✅ Access Control (Role-based)
- ✅ Reentrancy Protection
- ✅ UUPS Upgradeable Pattern
- ✅ Staking Functionality
- ✅ Issuance Fee Mechanism

---

## 🔐 Roles & Permissions

The contract uses OpenZeppelin's AccessControl with the following roles:

- **MINTER_ROLE**: Can mint new tokens
- **BURNER_ROLE**: Can burn tokens
- **STAKING_ROLE**: Can manage staking operations
- **FEE_MANAGER_ROLE**: Can manage issuance fees
- **UPGRADER_ROLE**: Can upgrade the contract (UUPS pattern)

---

## 💰 Token Distribution

### Allocation Structure
The contract includes allocation tracking for token distribution:
- Allocation name
- Allocation amount
- Released amount
- Beneficiary address
- Vesting start time
- Vesting duration

### Issuance Fee
- **Fee Type**: Burn mechanism
- **Maximum Fee**: 5% (500 basis points)
- **Default**: Configurable by FEE_MANAGER_ROLE
- **Effect**: Fees are burned, reducing total supply

---

## 📊 Staking System

### Staking Features
- Users can stake SOUL tokens
- Staking rewards pool
- Annual reward rate (configurable in basis points)
- Reward claiming functionality

### Staking Structure
```solidity
struct StakeInfo {
    uint256 amount;           // Staked amount
    uint256 stakedAt;          // Timestamp when staked
    uint256 lastRewardClaim;   // Last reward claim timestamp
}
```

---

## 🔄 Contract Functions

### Standard ERC-20 Functions
- `transfer(address to, uint256 amount)`
- `transferFrom(address from, address to, uint256 amount)`
- `approve(address spender, uint256 amount)`
- `balanceOf(address account)`
- `totalSupply()`

### Staking Functions
- `stake(uint256 amount)` - Stake tokens
- `unstake(uint256 amount)` - Unstake tokens
- `claimRewards()` - Claim staking rewards
- `getStakeInfo(address user)` - Get user staking info

### Issuance Functions
- `transferWithIssuanceFee(address to, uint256 amount)` - Transfer with fee burn
- `setIssuanceFeeBps(uint256 feeBps)` - Set issuance fee (FEE_MANAGER_ROLE)

### Administrative Functions
- `initialize(address admin)` - Initialize contract (one-time)
- `upgradeTo(address newImplementation)` - Upgrade contract (UPGRADER_ROLE)

---

## ⚠️ Deployment Notes

### Initialization Status
- **Status**: ⚠️ Contract deployed but initialization step encountered an error
- **Action Required**: Verify if contract needs manual initialization
- **Contract Address**: Valid and deployed on blockchain

### Verification Steps
1. Check contract on Etherscan
2. Verify contract code matches source
3. Test contract initialization if needed
4. Verify all roles are properly assigned

---

## 🔗 Integration

### Frontend Integration
The contract is integrated into the frontend via:
- `services/soulContractService.ts` - Contract interaction service
- `utils/contractConfig.ts` - Contract configuration
- Environment variable: `VITE_SOUL_TOKEN_SEPOLIA`

### Usage in Application
1. **Token Balance**: Display user's SOUL balance
2. **Market Creation**: Use `transferWithIssuanceFee()` for market creation fees
3. **Staking**: Allow users to stake/unstake tokens
4. **Trading**: Enable token transfers for betting

---

## 📝 Environment Configuration

### Required Environment Variables
```env
VITE_SOUL_TOKEN_SEPOLIA=0x0D6A6F6B15512cc9bf37621D9E5A4A4e1f41ef66
VITE_DEFAULT_CHAIN=sepolia
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

### RPC Endpoints
- **Primary**: https://rpc.sepolia.org
- **Alternative**: https://ethereum-sepolia-rpc.publicnode.com
- **Infura**: https://sepolia.infura.io/v3/YOUR_KEY
- **Alchemy**: https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

---

## 🧪 Testing

### Test Network
- **Network**: Sepolia Testnet
- **Faucet**: https://sepoliafaucet.com/
- **Explorer**: https://sepolia.etherscan.io

### Test Scenarios
1. **Token Transfer**: Test basic ERC-20 transfers
2. **Issuance Fee**: Test `transferWithIssuanceFee()` function
3. **Staking**: Test stake/unstake functionality
4. **Roles**: Verify role-based access control
5. **Upgrade**: Test contract upgradeability (if applicable)

---

## 🔒 Security Considerations

### Audit Status
- ⚠️ **Not Audited**: Contract has not undergone formal security audit
- **Recommendation**: Conduct security audit before mainnet deployment

### Security Features
- ✅ ReentrancyGuard protection
- ✅ Access control for sensitive functions
- ✅ Upgradeable pattern (UUPS)
- ✅ OpenZeppelin battle-tested libraries

### Best Practices
1. Verify contract on Etherscan
2. Test all functions on testnet
3. Review access control settings
4. Monitor for unusual activity
5. Keep private keys secure

---

## 📚 Resources

- **Etherscan**: https://sepolia.etherscan.io/address/0x0D6A6F6B15512cc9bf37621D9E5A4A4e1f41ef66
- **OpenZeppelin Docs**: https://docs.openzeppelin.com/contracts
- **Hardhat Docs**: https://hardhat.org/docs
- **Sepolia Faucet**: https://sepoliafaucet.com/

---

## 🔄 Upgrade Path

### UUPS Upgradeable Pattern
The contract uses UUPS (Universal Upgradeable Proxy Standard) pattern:
- Allows contract upgrades without changing address
- Only UPGRADER_ROLE can upgrade
- Requires careful upgrade process

### Upgrade Process
1. Deploy new implementation contract
2. Call `upgradeTo(newImplementation)` from UPGRADER_ROLE
3. Verify upgrade on Etherscan
4. Test all functions after upgrade

---

**Last Updated**: 2025-01-27  
**Status**: Contract deployed, initialization needs verification

