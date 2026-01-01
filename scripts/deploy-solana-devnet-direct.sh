#!/bin/bash

# Direct Solana Devnet Deployment
# Uses Solana CLI with provided secret key

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying to Solana Devnet${NC}"
echo ""

cd solana

# Step 1: Create keypair file
echo -e "${BLUE}Step 1: Creating keypair file...${NC}"
node -e "
const fs = require('fs');
const sk = [24,243,40,13,251,242,198,54,1,41,175,7,3,78,239,156,94,6,250,201,18,81,249,251,88,114,92,4,81,238,206,244,61,61,241,237,128,180,248,248,150,247,198,176,129,235,104,160,88,141,96,105,40,22,120,191,207,32,5,83,84,186,168,222];
const keypair = Buffer.from(sk);
fs.writeFileSync('deployer-keypair.json', JSON.stringify(Array.from(keypair)));
console.log('✅ Keypair created');
"

if [ ! -f "deployer-keypair.json" ]; then
    echo -e "${RED}❌ Failed to create keypair file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Keypair file created${NC}"
echo ""

# Step 2: Check Solana CLI
echo -e "${BLUE}Step 2: Checking Solana CLI...${NC}"
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found${NC}"
    echo "Install from: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

SOLANA_VERSION=$(solana --version)
echo -e "${GREEN}✅ Solana CLI: ${SOLANA_VERSION}${NC}"

# Set cluster to devnet
solana config set --url https://api.devnet.solana.com
echo -e "${GREEN}✅ Cluster set to devnet${NC}"
echo ""

# Step 3: Set keypair
echo -e "${BLUE}Step 3: Setting keypair...${NC}"
KEYPAIR_PATH="$(pwd)/deployer-keypair.json"
solana config set --keypair "$KEYPAIR_PATH"

# Get public key
PUBKEY=$(solana address 2>/dev/null || echo "unknown")
echo -e "${GREEN}✅ Keypair set${NC}"
echo "  Public Key: ${PUBKEY}"
echo ""

# Step 4: Check balance
echo -e "${BLUE}Step 4: Checking SOL balance...${NC}"
BALANCE=$(solana balance 2>/dev/null || echo "0 SOL")
echo "Balance: ${BALANCE}"

# Extract numeric balance
BALANCE_SOL=$(echo "$BALANCE" | grep -oE '[0-9.]+' | head -1 || echo "0")

if (( $(echo "$BALANCE_SOL < 2" | bc -l 2>/dev/null || echo "1") )); then
    echo -e "${YELLOW}⚠️  Insufficient balance. Requesting airdrop...${NC}"
    solana airdrop 2 ${PUBKEY} 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Airdrop failed. Please get SOL from: https://faucet.solana.com/${NC}"
        echo "Or manually run: solana airdrop 2"
    }
    sleep 2
    BALANCE=$(solana balance 2>/dev/null || echo "0 SOL")
    echo "New Balance: ${BALANCE}"
fi

echo ""

# Step 5: Build program (if Anchor is available)
echo -e "${BLUE}Step 5: Building program...${NC}"
if command -v anchor &> /dev/null; then
    echo "Building with Anchor..."
    anchor build
    
    if [ -f "target/deploy/soulcast.so" ]; then
        echo -e "${GREEN}✅ Build successful${NC}"
        PROGRAM_SO="target/deploy/soulcast.so"
    else
        echo -e "${YELLOW}⚠️  Build output not found${NC}"
        PROGRAM_SO=""
    fi
else
    echo -e "${YELLOW}⚠️  Anchor CLI not found. Skipping build.${NC}"
    echo "If you have a compiled .so file, specify its path."
    PROGRAM_SO=""
fi

echo ""

# Step 6: Deploy program
echo -e "${BLUE}Step 6: Deploying program...${NC}"

if [ -n "$PROGRAM_SO" ] && [ -f "$PROGRAM_SO" ]; then
    echo "Deploying ${PROGRAM_SO}..."
    solana program deploy "$PROGRAM_SO" --program-id target/deploy/soulcast-keypair.json 2>&1 | tee ../deploy-solana-devnet.log
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Deployment successful!${NC}"
        
        # Extract program ID
        PROGRAM_ID=$(solana address -k target/deploy/soulcast-keypair.json 2>/dev/null || echo "unknown")
        echo ""
        echo "📋 Deployment Summary:"
        echo "   Network: Solana Devnet"
        echo "   Program ID: ${PROGRAM_ID}"
        echo "   Public Key: ${PUBKEY}"
        echo ""
        echo "🔗 View on Solana Explorer:"
        echo "   https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet"
    else
        echo -e "${RED}❌ Deployment failed${NC}"
        echo "Check deploy-solana-devnet.log for details"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Program binary not found${NC}"
    echo ""
    echo "To deploy manually:"
    echo "  1. Build program: anchor build"
    echo "  2. Deploy: solana program deploy target/deploy/soulcast.so"
    echo ""
    echo "Or install Anchor:"
    echo "  https://www.anchor-lang.com/docs/installation"
fi

echo ""
echo -e "${GREEN}🎉 Solana Devnet Deployment Process Complete!${NC}"

