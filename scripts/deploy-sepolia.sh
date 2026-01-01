#!/bin/bash

# Ethereum Sepolia Testnet Deployment Script
# This script deploys contracts and builds the frontend for Sepolia testnet

set -e  # Exit on error

echo "🚀 Starting Sepolia Testnet Deployment..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "   Please create .env.local from .env.example and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env.local"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "   Network: Sepolia Testnet"
echo "   Chain ID: 11155111"
echo ""

# Deploy Smart Contracts
echo "📦 Deploying smart contracts to Sepolia testnet..."
cd contracts

if [ ! -f "hardhat.config.ts" ]; then
    echo "❌ Error: contracts/hardhat.config.ts not found"
    exit 1
fi

# Compile contracts
echo "   Compiling contracts..."
npx hardhat compile

# Deploy contracts
echo "   Deploying to Sepolia testnet..."
npx hardhat run scripts/deploy-sepolia.ts --network sepolia 2>&1 | tee ../deploy-sepolia.log

if [ $? -eq 0 ]; then
    echo "✅ Smart contracts deployed successfully!"
    echo "   Check deploy-sepolia.log for contract addresses"
else
    echo "❌ Contract deployment failed. Check deploy-sepolia.log for details."
    exit 1
fi

cd ..

echo ""

# Build Frontend
echo "🏗️  Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully!"
    echo "   Output: dist/"
else
    echo "❌ Frontend build failed."
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Review deploy-sepolia.log for contract addresses"
echo "   2. Verify contracts on Sepolia Etherscan: https://sepolia.etherscan.io"
echo "   3. Deploy dist/ folder to your hosting platform"
echo "   4. Update frontend with contract addresses if needed"
echo ""
echo "🔗 Useful Links:"
echo "   - Sepolia Etherscan: https://sepolia.etherscan.io"
echo "   - Sepolia Faucet: https://sepoliafaucet.com/"
echo ""

