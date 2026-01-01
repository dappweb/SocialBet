# Quick Start - Solana Devnet Deployment

## 🚀 Fast Track Deployment

### 1. Install Prerequisites (One-time)

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### 2. Deploy (After Installation)

```bash
cd /home/zyj_dev/Documents/SocialBet
./scripts/exec-next-solana.sh
```

That's it! The script will:
- ✅ Configure Solana for devnet
- ✅ Set up keypair
- ✅ Get devnet SOL
- ✅ Build program
- ✅ Deploy to devnet

---

## 📋 What's Already Done

✅ Keypair created: `solana/deployer-keypair.json`  
✅ Configuration: `solana/Anchor.toml`  
✅ Scripts: Ready to use  
✅ Documentation: Complete  

## ⚠️ What You Need

- Solana CLI (install command above)
- Anchor (install command above)
- Internet connection

---

**Ready to deploy once prerequisites are installed!**
