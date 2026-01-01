#!/bin/bash

# Execute Next Steps for Solana Devnet Deployment
# Installs prerequisites and deploys

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Executing Next Steps for Solana Devnet Deployment${NC}"
echo ""

# Step 1: Check/Install Solana CLI
echo -e "${BLUE}Step 1: Checking Solana CLI...${NC}"
if command -v solana &> /dev/null; then
    SOLANA_VERSION=$(solana --version)
    echo -e "${GREEN}✅ Solana CLI installed: ${SOLANA_VERSION}${NC}"
else
    echo -e "${YELLOW}⚠️  Solana CLI not found${NC}"
    echo "Installing Solana CLI..."
    
    # Try to install
    if curl -sSfL https://release.solana.com/stable/install --output /tmp/solana-install.sh 2>/dev/null; then
        sh /tmp/solana-install.sh
        export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
        
        if command -v solana &> /dev/null; then
            echo -e "${GREEN}✅ Solana CLI installed${NC}"
        else
            echo -e "${YELLOW}⚠️  Installation may require shell restart${NC}"
            echo "Please run: export PATH=\"\$HOME/.local/share/solana/install/active_release/bin:\$PATH\""
        fi
    else
        echo -e "${RED}❌ Failed to download Solana installer${NC}"
        echo "Please install manually: https://docs.solana.com/cli/install-solana-cli-tools"
        exit 1
    fi
fi

echo ""

# Step 2: Configure Solana
if command -v solana &> /dev/null; then
    echo -e "${BLUE}Step 2: Configuring Solana for Devnet...${NC}"
    cd solana
    
    # Set cluster
    solana config set --url https://api.devnet.solana.com 2>/dev/null || true
    echo -e "${GREEN}✅ Cluster set to devnet${NC}"
    
    # Set keypair
    if [ -f "deployer-keypair.json" ]; then
        KEYPAIR_PATH="$(pwd)/deployer-keypair.json"
        solana config set --keypair "$KEYPAIR_PATH" 2>/dev/null || true
        echo -e "${GREEN}✅ Keypair configured${NC}"
        
        # Get public key
        PUBKEY=$(solana address 2>/dev/null || echo "unknown")
        echo "  Public Key: ${PUBKEY}"
    else
        echo -e "${RED}❌ Keypair file not found${NC}"
        exit 1
    fi
    
    echo ""
    
    # Step 3: Check/Get Balance
    echo -e "${BLUE}Step 3: Checking SOL Balance...${NC}"
    BALANCE=$(solana balance 2>/dev/null || echo "0 SOL")
    echo "Current Balance: ${BALANCE}"
    
    # Extract numeric balance
    BALANCE_SOL=$(echo "$BALANCE" | grep -oE '[0-9.]+' | head -1 || echo "0")
    
    if (( $(echo "$BALANCE_SOL < 2" | bc -l 2>/dev/null || echo "1") )); then
        echo -e "${YELLOW}⚠️  Insufficient balance. Requesting airdrop...${NC}"
        solana airdrop 2 ${PUBKEY} 2>/dev/null || {
            echo -e "${YELLOW}⚠️  Airdrop failed. Please get SOL from: https://faucet.solana.com/${NC}"
            echo "Or run manually: solana airdrop 2"
        }
        sleep 3
        BALANCE=$(solana balance 2>/dev/null || echo "0 SOL")
        echo "New Balance: ${BALANCE}"
    else
        echo -e "${GREEN}✅ Sufficient balance${NC}"
    fi
    
    echo ""
    
    # Step 4: Build Program
    echo -e "${BLUE}Step 4: Building Solana Program...${NC}"
    
    if command -v anchor &> /dev/null; then
        echo "Building with Anchor..."
        anchor build 2>&1 | tee ../build-solana.log
        
        if [ -f "target/deploy/soulcast.so" ]; then
            echo -e "${GREEN}✅ Build successful${NC}"
            echo "  Program: target/deploy/soulcast.so"
        else
            echo -e "${RED}❌ Build output not found${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Anchor not found. Skipping build.${NC}"
        echo "Install Anchor: cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
        echo "Then run: avm install latest && avm use latest"
        exit 1
    fi
    
    echo ""
    
    # Step 5: Deploy Program
    echo -e "${BLUE}Step 5: Deploying to Solana Devnet...${NC}"
    
    if [ -f "target/deploy/soulcast.so" ]; then
        echo "Deploying program..."
        solana program deploy target/deploy/soulcast.so \
            --program-id target/deploy/soulcast-keypair.json \
            2>&1 | tee ../deploy-solana-devnet.log
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Deployment successful!${NC}"
            
            # Get program ID
            PROGRAM_ID=$(solana address -k target/deploy/soulcast-keypair.json 2>/dev/null || echo "unknown")
            
            echo ""
            echo "📋 Deployment Summary:"
            echo "   Network: Solana Devnet"
            echo "   Program ID: ${PROGRAM_ID}"
            echo "   Deployer: ${PUBKEY}"
            echo "   Balance: ${BALANCE}"
            echo ""
            echo "🔗 View on Solana Explorer:"
            echo "   https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet"
            echo ""
            echo -e "${GREEN}🎉 Solana Devnet Deployment Complete!${NC}"
        else
            echo -e "${RED}❌ Deployment failed${NC}"
            echo "Check deploy-solana-devnet.log for details"
            exit 1
        fi
    else
        echo -e "${RED}❌ Program binary not found${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Solana CLI not available${NC}"
    echo "Please install Solana CLI first"
    exit 1
fi

