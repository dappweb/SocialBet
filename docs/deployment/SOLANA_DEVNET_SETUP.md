# Solana Devnet Deployment Guide

## Overview

This guide covers deploying Soulcast Solana programs to Solana Devnet using the provided secret key.

---

## Prerequisites

1. **Solana CLI** installed
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

2. **Anchor Framework** (optional, for building)
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

3. **Node.js** and npm

---

## Secret Key Configuration

### Provided Secret Key
- **Format**: Array of 64 bytes
- **Base58**: `Vw48uTzGPte9LTPgyAjQjau3frhXr7s9YQqQ91LmddGTCie63gHabBUJz89JPeSKLagi85zs6vZyT8wc1hX6acd`
- **Location**: `solana/deployer-keypair.json`

### Keypair File
The keypair file is automatically created from the secret key array:
```json
[24,243,40,13,251,242,198,54,1,41,175,7,3,78,239,156,94,6,250,201,18,81,249,251,88,114,92,4,81,238,206,244,61,61,241,237,128,180,248,248,150,247,198,176,129,235,104,160,88,141,96,105,40,22,120,191,207,32,5,83,84,186,168,222]
```

---

## Deployment Steps

### Option 1: Automated Deployment Script

```bash
# Deploy to Solana Devnet
npm run deploy:solana:devnet

# Or use direct script
./scripts/deploy-solana-devnet-direct.sh
```

### Option 2: Manual Deployment

#### Step 1: Navigate to Solana Directory
```bash
cd solana
```

#### Step 2: Create Keypair File
```bash
node scripts/create-keypair.js
```

#### Step 3: Set Solana Config
```bash
# Set cluster to devnet
solana config set --url https://api.devnet.solana.com

# Set keypair
solana config set --keypair ./deployer-keypair.json

# Verify
solana address
solana balance
```

#### Step 4: Get Devnet SOL
```bash
# Request airdrop (2 SOL)
solana airdrop 2

# Or use faucet: https://faucet.solana.com/
```

#### Step 5: Build Program
```bash
# If Anchor is installed
anchor build

# This creates: target/deploy/soulcast.so
```

#### Step 6: Deploy Program
```bash
# Deploy the program
solana program deploy target/deploy/soulcast.so \
  --program-id target/deploy/soulcast-keypair.json

# Or with Anchor
anchor deploy --provider.cluster devnet
```

---

## Program Information

### Program ID
- **Default**: `SoulCastTokenProgramID111111111111111111111111`
- **Actual**: Will be generated on first deployment

### Program Features
- Token staking
- Issuance fee burn
- Transfer with fees
- User stake management

---

## Verification

### Check Deployment
```bash
# Get program info
solana program show <PROGRAM_ID>

# Check account
solana account <PROGRAM_ID>
```

### View on Explorer
```
https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet
```

---

## Troubleshooting

### Issue: "Insufficient funds"
**Solution**: Get devnet SOL
```bash
solana airdrop 2
# Or visit: https://faucet.solana.com/
```

### Issue: "Anchor CLI not found"
**Solution**: Install Anchor
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### Issue: "Keypair file not found"
**Solution**: Create keypair
```bash
cd solana
node scripts/create-keypair.js
```

### Issue: "Program already deployed"
**Solution**: Upgrade program
```bash
solana program deploy target/deploy/soulcast.so \
  --program-id <EXISTING_PROGRAM_ID> \
  --upgrade-authority deployer-keypair.json
```

---

## Configuration Files

### Anchor.toml
```toml
[programs.devnet]
soulcast = "SoulCastTokenProgramID111111111111111111111111"

[provider.devnet]
cluster = "Devnet"
wallet = "./deployer-keypair.json"
```

### Keypair File
- **Location**: `solana/deployer-keypair.json`
- **Format**: JSON array of 64 bytes
- **Security**: ⚠️ Never commit to git!

---

## Security Notes

1. **Never commit** `deployer-keypair.json` to git
2. **Keep secret key secure** - this controls the deployment account
3. **Use devnet only** for testing
4. **Mainnet requires** additional security measures

---

## Next Steps

After deployment:

1. **Verify Program**
   - Check on Solana Explorer
   - Verify program ID
   - Test program functions

2. **Update Configuration**
   - Update program ID in frontend
   - Configure RPC endpoints
   - Update environment variables

3. **Test Integration**
   - Test staking functions
   - Test token transfers
   - Verify fee burning

---

**Last Updated**: 2025-01-27  
**Status**: ✅ Ready for Deployment

