#!/bin/bash

# Deploy to Solana Devnet
# Uses provided secret key for deployment

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying to Solana Devnet${NC}"
echo ""

# Secret key array (provided by user)
SECRET_KEY_ARRAY="[24,243,40,13,251,242,198,54,1,41,175,7,3,78,239,156,94,6,250,201,18,81,249,251,88,114,92,4,81,238,206,244,61,61,241,237,128,180,248,248,150,247,198,176,129,235,104,160,88,141,96,105,40,22,120,191,207,32,5,83,84,186,168,222]"

# Convert secret key array to base58
echo -e "${BLUE}Step 1: Converting secret key...${NC}"
cd solana

# Create keypair file from array
node -e "
const sk = ${SECRET_KEY_ARRAY};
const fs = require('fs');
const keypair = Buffer.from(sk);
fs.writeFileSync('deployer-keypair.json', JSON.stringify(Array.from(keypair)));
console.log('✅ Keypair file created');
" 2>/dev/null || {
    # Alternative: use bs58 if available
    node -e "
    const sk = ${SECRET_KEY_ARRAY};
    const bs58 = require('bs58');
    const keypair = Buffer.from(sk);
    const base58 = bs58.encode(keypair);
    console.log('Base58:', base58);
    " > deployer-keypair-base58.txt 2>/dev/null || echo "Keypair conversion attempted"
}

echo -e "${GREEN}✅ Secret key processed${NC}"
echo ""

# Check if Anchor is installed
echo -e "${BLUE}Step 2: Checking Anchor installation...${NC}"
if command -v anchor &> /dev/null; then
    ANCHOR_VERSION=$(anchor --version)
    echo -e "${GREEN}✅ Anchor installed: ${ANCHOR_VERSION}${NC}"
else
    echo -e "${YELLOW}⚠️  Anchor CLI not found. Installing...${NC}"
    echo "Please install Anchor: https://www.anchor-lang.com/docs/installation"
    exit 1
fi

echo ""

# Check if solana CLI is installed
echo -e "${BLUE}Step 3: Checking Solana CLI...${NC}"
if command -v solana &> /dev/null; then
    SOLANA_VERSION=$(solana --version)
    echo -e "${GREEN}✅ Solana CLI installed: ${SOLANA_VERSION}${NC}"
    
    # Set cluster to devnet
    echo "Setting cluster to devnet..."
    solana config set --url https://api.devnet.solana.com
    
    # Get cluster info
    echo "Cluster info:"
    solana cluster-version
    solana config get
else
    echo -e "${RED}❌ Solana CLI not found${NC}"
    echo "Please install Solana CLI: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

echo ""

# Set keypair
echo -e "${BLUE}Step 4: Setting up keypair...${NC}"
if [ -f "deployer-keypair.json" ]; then
    # Convert JSON array to Solana keypair format
    node -e "
    const fs = require('fs');
    const sk = ${SECRET_KEY_ARRAY};
    const keypair = Buffer.from(sk);
    fs.writeFileSync('deployer-keypair.json', JSON.stringify(Array.from(keypair)));
    " 2>/dev/null || true
    
    # Set as default keypair
    solana config set --keypair deployer-keypair.json 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Could not set keypair automatically${NC}"
        echo "Please set keypair manually or use: solana config set --keypair <path>"
    }
    
    # Get public key
    if solana address &> /dev/null; then
        PUBKEY=$(solana address)
        echo -e "${GREEN}✅ Keypair set${NC}"
        echo "  Public Key: ${PUBKEY}"
    else
        echo -e "${YELLOW}⚠️  Could not get public key${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Keypair file not created${NC}"
fi

echo ""

# Check balance
echo -e "${BLUE}Step 5: Checking SOL balance...${NC}"
if solana balance &> /dev/null; then
    BALANCE=$(solana balance 2>/dev/null | head -1)
    echo "Balance: ${BALANCE}"
    
    # Check if balance is sufficient (need at least 2 SOL for deployment)
    BALANCE_SOL=$(echo "$BALANCE" | grep -oE '[0-9.]+' | head -1)
    if (( $(echo "$BALANCE_SOL < 2" | bc -l 2>/dev/null || echo "1") )); then
        echo -e "${YELLOW}⚠️  Insufficient balance. Need at least 2 SOL for deployment.${NC}"
        echo "Get devnet SOL from: https://faucet.solana.com/"
        echo "Or run: solana airdrop 2"
    else
        echo -e "${GREEN}✅ Sufficient balance${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not check balance${NC}"
fi

echo ""

# Build program
echo -e "${BLUE}Step 6: Building Solana program...${NC}"
if [ -f "Anchor.toml" ]; then
    # Update Anchor.toml for devnet
    if ! grep -q "devnet" Anchor.toml; then
        echo "Updating Anchor.toml for devnet..."
        cat >> Anchor.toml << 'ANCHOR_CONFIG'

[programs.devnet]
soulcast = "SoulCastTokenProgramID111111111111111111111111"

[provider.devnet]
cluster = "Devnet"
wallet = "./deployer-keypair.json"
ANCHOR_CONFIG
    fi
    
    echo "Building program..."
    anchor build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Anchor.toml not found${NC}"
    exit 1
fi

echo ""

# Deploy program
echo -e "${BLUE}Step 7: Deploying to Solana Devnet...${NC}"
echo "Deploying program..."

anchor deploy --provider.cluster devnet --provider.wallet ./deployer-keypair.json 2>&1 | tee ../deploy-solana-devnet.log

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "📋 Deployment Summary:"
    echo "   Network: Solana Devnet"
    echo "   Program ID: $(grep 'Program Id:' ../deploy-solana-devnet.log 2>/dev/null | tail -1 || echo 'Check deploy-solana-devnet.log')"
    echo "   Transaction: $(grep 'Transaction signature:' ../deploy-solana-devnet.log 2>/dev/null | tail -1 || echo 'Check deploy-solana-devnet.log')"
    echo ""
    echo "🔗 View on Solana Explorer:"
    echo "   https://explorer.solana.com/?cluster=devnet"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check deploy-solana-devnet.log for details"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Solana Devnet Deployment Complete!${NC}"

