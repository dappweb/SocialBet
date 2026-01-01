#!/bin/bash

# Complete SOUL Token Deployment Script
# Deploys SOUL token to both Solana Devnet and Ethereum Sepolia

set -e  # Exit on error

echo "🚀 Starting Complete SOUL Token Deployment..."
echo "   This will deploy to both Solana Devnet and Ethereum Sepolia"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============ SOLANA DEPLOYMENT ============
echo -e "${YELLOW}📦 Step 1: Deploying to Solana Devnet...${NC}"
echo ""

cd solana

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found. Please install it first:${NC}"
    echo "   sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found. Please install it first:${NC}"
    echo "   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
    echo "   avm install latest"
    echo "   avm use latest"
    exit 1
fi

# Set Solana cluster to devnet
solana config set --url devnet

# Check if keypair exists
if [ ! -f "deployer-keypair.json" ]; then
    echo -e "${RED}❌ Deployer keypair not found at solana/deployer-keypair.json${NC}"
    echo "   Please create it first using the provided secret key"
    exit 1
fi

# Set keypair
solana config set --keypair deployer-keypair.json

# Check balance
BALANCE=$(solana balance --output json | jq -r '.balance')
echo "   Deployer balance: $BALANCE SOL"

if [ "$BALANCE" = "0" ]; then
    echo -e "${YELLOW}⚠️  Balance is 0. Requesting airdrop...${NC}"
    solana airdrop 2
    sleep 5
fi

# Build the program
echo ""
echo "   Building Solana program..."
anchor build

# Deploy the program
echo ""
echo "   Deploying program to devnet..."
anchor deploy --provider.cluster devnet

# Get program ID
PROGRAM_ID=$(solana address -k target/deploy/soulcast-keypair.json)
echo ""
echo -e "${GREEN}✅ Solana program deployed!${NC}"
echo "   Program ID: $PROGRAM_ID"

# Initialize mint (if needed)
echo ""
echo "   Initializing SOUL token mint..."
# TODO: Add mint initialization command

cd ..

# ============ ETHEREUM SEPOLIA DEPLOYMENT ============
echo ""
echo -e "${YELLOW}📦 Step 2: Deploying to Ethereum Sepolia...${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found!${NC}"
    echo "   Please create .env.local from .env.example and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ Error: PRIVATE_KEY not set in .env.local${NC}"
    exit 1
fi

cd contracts

# Compile contracts
echo "   Compiling contracts..."
npx hardhat compile

# Deploy contracts
echo "   Deploying to Sepolia testnet..."
npx hardhat run scripts/deploy-sepolia.ts --network sepolia 2>&1 | tee ../deploy-sepolia.log

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Ethereum contracts deployed successfully!${NC}"
    echo "   Check deploy-sepolia.log for contract addresses"
else
    echo -e "${RED}❌ Contract deployment failed. Check deploy-sepolia.log for details.${NC}"
    exit 1
fi

cd ..

# ============ UPDATE ENVIRONMENT VARIABLES ============
echo ""
echo -e "${YELLOW}📝 Step 3: Updating environment variables...${NC}"

# Extract contract addresses from logs
SEPOLIA_ADDRESS=$(grep -oP 'SoulCastToken deployed to: \K[^\s]+' deploy-sepolia.log || echo "")

if [ -n "$SEPOLIA_ADDRESS" ]; then
    # Update .env.local
    if grep -q "VITE_SOUL_TOKEN_SEPOLIA" .env.local; then
        sed -i "s|VITE_SOUL_TOKEN_SEPOLIA=.*|VITE_SOUL_TOKEN_SEPOLIA=$SEPOLIA_ADDRESS|" .env.local
    else
        echo "VITE_SOUL_TOKEN_SEPOLIA=$SEPOLIA_ADDRESS" >> .env.local
    fi
    echo "   ✅ Updated VITE_SOUL_TOKEN_SEPOLIA=$SEPOLIA_ADDRESS"
fi

if [ -n "$PROGRAM_ID" ]; then
    if grep -q "VITE_SOUL_TOKEN_SOLANA" .env.local; then
        sed -i "s|VITE_SOUL_TOKEN_SOLANA=.*|VITE_SOUL_TOKEN_SOLANA=$PROGRAM_ID|" .env.local
    else
        echo "VITE_SOUL_TOKEN_SOLANA=$PROGRAM_ID" >> .env.local
    fi
    echo "   ✅ Updated VITE_SOUL_TOKEN_SOLANA=$PROGRAM_ID"
fi

# ============ BUILD FRONTEND ============
echo ""
echo -e "${YELLOW}🏗️  Step 4: Building frontend...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully!${NC}"
    echo "   Output: dist/"
else
    echo -e "${RED}❌ Frontend build failed.${NC}"
    exit 1
fi

# ============ SUMMARY ============
echo ""
echo -e "${GREEN}🎉 Complete SOUL Token Deployment Finished!${NC}"
echo ""
echo "📋 Deployment Summary:"
echo "===================="
echo "Solana Devnet:"
echo "  - Program ID: $PROGRAM_ID"
echo "  - Network: https://api.devnet.solana.com"
echo ""
echo "Ethereum Sepolia:"
echo "  - Token Address: $SEPOLIA_ADDRESS"
echo "  - Network: https://sepolia.etherscan.io"
echo ""
echo "📚 Next Steps:"
echo "   1. Verify contracts on block explorers"
echo "   2. Test token transfers on both chains"
echo "   3. Test staking functionality"
echo "   4. Deploy frontend to hosting platform"
echo ""
echo "🔗 Useful Links:"
echo "   - Solana Explorer: https://explorer.solana.com/?cluster=devnet"
echo "   - Sepolia Etherscan: https://sepolia.etherscan.io"
echo "   - Sepolia Faucet: https://sepoliafaucet.com/"
echo ""

