# Execute Next Steps - Solana Devnet Deployment

**Status**: ⚠️ **Prerequisites Required**  
**Date**: 2025-01-27

---

## ✅ What's Ready

### Configuration Complete
- ✅ **Keypair File**: `solana/deployer-keypair.json` (64 bytes)
- ✅ **Base58 Key**: `Vw48uTzGPte9LTPgyAjQjau3frhXr7s9YQqQ91LmddGTCie63gHabBUJz89JPeSKLagi85zs6vZyT8wc1hX6acd`
- ✅ **Anchor.toml**: Configured for devnet
- ✅ **Deployment Scripts**: Created and ready

### Files Created
- ✅ `scripts/deploy-solana-devnet.sh`
- ✅ `scripts/deploy-solana-devnet-direct.sh`
- ✅ `scripts/exec-next-solana.sh`
- ✅ `solana/scripts/create-keypair.js`
- ✅ `docs/deployment/SOLANA_DEVNET_SETUP.md`

---

## ⚠️ Prerequisites Required

### 1. Install Solana CLI

**Option A: Automatic Installation**
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

**Option B: Manual Installation**
- Visit: https://docs.solana.com/cli/install-solana-cli-tools
- Follow platform-specific instructions

**Verify Installation**
```bash
solana --version
# Should show: solana-cli x.x.x
```

### 2. Install Anchor (for building programs)

**Install Rust** (if not installed)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Install Anchor**
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

**Verify Installation**
```bash
anchor --version
# Should show: anchor-cli x.x.x
```

---

## 🚀 Once Prerequisites Are Installed

### Quick Deployment

```bash
# Execute next steps automatically
./scripts/exec-next-solana.sh

# Or use npm script
npm run deploy:solana:devnet
```

### Manual Deployment Steps

#### Step 1: Configure Solana
```bash
cd solana

# Set cluster to devnet
solana config set --url https://api.devnet.solana.com

# Set keypair
solana config set --keypair ./deployer-keypair.json

# Verify
solana address
solana balance
```

#### Step 2: Get Devnet SOL
```bash
# Request airdrop (2 SOL)
solana airdrop 2

# Or use web faucet: https://faucet.solana.com/
```

#### Step 3: Build Program
```bash
# Build with Anchor
anchor build

# Output: target/deploy/soulcast.so
```

#### Step 4: Deploy Program
```bash
# Deploy to devnet
solana program deploy target/deploy/soulcast.so \
  --program-id target/deploy/soulcast-keypair.json

# Or with Anchor
anchor deploy --provider.cluster devnet
```

---

## 📋 Current Status

### ✅ Completed
- [x] Keypair file created and verified
- [x] Anchor.toml configured for devnet
- [x] Deployment scripts created
- [x] Documentation prepared

### ⏳ Pending
- [ ] Solana CLI installation
- [ ] Anchor installation (for building)
- [ ] Devnet SOL acquisition
- [ ] Program build
- [ ] Program deployment

---

## 🔧 Installation Commands Summary

```bash
# 1. Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# 2. Install Rust (if needed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 3. Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# 4. Verify installations
solana --version
anchor --version

# 5. Deploy
cd /home/zyj_dev/Documents/SocialBet
./scripts/exec-next-solana.sh
```

---

## 📝 Next Actions

1. **Install Prerequisites**
   - Solana CLI
   - Anchor framework

2. **Run Deployment**
   ```bash
   ./scripts/exec-next-solana.sh
   ```

3. **Verify Deployment**
   - Check Solana Explorer
   - Test program functions

---

## 🔗 Useful Links

- **Solana CLI Installation**: https://docs.solana.com/cli/install-solana-cli-tools
- **Anchor Installation**: https://www.anchor-lang.com/docs/installation
- **Devnet Faucet**: https://faucet.solana.com/
- **Solana Explorer**: https://explorer.solana.com/?cluster=devnet

---

**Status**: ⚠️ **Waiting for Prerequisites**  
**Keypair**: ✅ Ready  
**Configuration**: ✅ Complete  
**Next**: Install Solana CLI and Anchor, then deploy

