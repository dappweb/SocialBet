#!/bin/bash

# Staging Deployment Script
# Can be deployed multiple times per week for testing

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

STAGING_ENV="staging"

echo -e "${BLUE}🚀 Deploying to Staging Environment${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.local not found. Using defaults.${NC}"
fi

# Build for staging
echo -e "${BLUE}🏗️  Building for staging...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Deploy contracts to testnet (if needed)
if [ -d "contracts" ]; then
    echo -e "${BLUE}📦 Deploying contracts to testnet...${NC}"
    cd contracts
    npx hardhat run scripts/deploy.ts --network sepolia 2>&1 | tee ../deploy-staging.log
    cd ..
fi

# Deploy frontend to staging
echo -e "${BLUE}🚀 Deploying frontend to ${STAGING_ENV}...${NC}"

# Add your staging deployment command here
# Examples:
# - Vercel: vercel
# - Netlify: netlify deploy
# - Cloudflare Pages: wrangler pages deploy dist --branch staging

echo "   Staging deployment command would run here"
echo "   Update this script with your actual deployment command"

echo ""
echo -e "${GREEN}✅ Staging deployment complete!${NC}"
echo ""
echo "📋 Deployment Summary:"
echo "   Environment: ${STAGING_ENV}"
echo "   Date: $(date +%Y-%m-%d\ %H:%M:%S)"
echo ""

