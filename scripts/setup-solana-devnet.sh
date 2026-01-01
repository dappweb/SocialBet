#!/bin/bash

# Setup Solana Devnet Environment
# Installs Solana CLI and configures for deployment

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 Setting up Solana Devnet Environment${NC}"
echo ""

# Step 1: Install Solana CLI
echo -e "${BLUE}Step 1: Installing Solana CLI...${NC}"

if command -v solana &> /dev/null; then
    SOLANA_VERSION=$(solana --version)
    echo -e "${GREEN}✅ Solana CLI already installed: ${SOLANA_VERSION}${NC}"
else
    echo -e "${YELLOW}Installing Solana CLI...${NC}"
    echo "Run this command to install:"
    echo "  sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    echo ""
    read -p "Install Solana CLI now? (yes/no): " install_choice
    
    if [ "$install_choice" == "yes" ]; then
        sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
        export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
        echo -e "${GREEN}✅ Solana CLI installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Skipping Solana CLI installation${NC}"
        echo "Please install manually: https://docs.solana.com/cli/install-solana-cli-tools"
    fi
fi

echo ""

# Step 2: Create keypair
echo -e "${BLUE}Step 2: Creating keypair file...${NC}"
cd solana

node -e "
const fs = require('fs');
const sk = [24,243,40,13,251,242,198,54,1,41,175,7,3,78,239,156,94,6,250,201,18,81,249,251,88,114,92,4,81,238,206,244,61,61,241,237,128,180,248,248,150,247,198,176,129,235,104,160,88,141,96,105,40,22,120,191,207,32,5,83,84,186,168,222];
const keypair = Buffer.from(sk);
fs.writeFileSync('deployer-keypair.json', JSON.stringify(Array.from(keypair)));
console.log('✅ Keypair created');
" 2>/dev/null

if [ -f "deployer-keypair.json" ]; then
    echo -e "${GREEN}✅ Keypair file created${NC}"
else
    echo -e "${RED}❌ Failed to create keypair${NC}"
    exit 1
fi

echo ""

# Step 3: Configure Solana
if command -v solana &> /dev/null; then
    echo -e "${BLUE}Step 3: Configuring Solana...${NC}"
    
    # Set cluster
    solana config set --url https://api.devnet.solana.com
    echo -e "${GREEN}✅ Cluster set to devnet${NC}"
    
    # Set keypair
    KEYPAIR_PATH="$(pwd)/deployer-keypair.json"
    solana config set --keypair "$KEYPAIR_PATH"
    echo -e "${GREEN}✅ Keypair set${NC}"
    
    # Get public key
    PUBKEY=$(solana address 2>/dev/null || echo "unknown")
    echo "  Public Key: ${PUBKEY}"
    
    # Check balance
    BALANCE=$(solana balance 2>/dev/null || echo "0 SOL")
    echo "  Balance: ${BALANCE}"
    
    echo ""
    echo -e "${GREEN}✅ Solana configured${NC}"
else
    echo -e "${YELLOW}⚠️  Solana CLI not available. Configuration skipped.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Install Solana CLI (if not installed)"
echo "  2. Get devnet SOL: solana airdrop 2"
echo "  3. Build program: cd solana && anchor build"
echo "  4. Deploy: npm run deploy:solana:devnet"

