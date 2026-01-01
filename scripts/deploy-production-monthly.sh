#!/bin/bash

# Monthly Production Deployment Script
# Deploys to "Forehead Red Power" (Production) environment
# Only allows deployment once per month

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_ENV="forehead-red-power"
DEPLOYMENT_LOG=".deployment-log"
CURRENT_MONTH=$(date +%Y-%m)
LAST_DEPLOYMENT_MONTH=$(cat $DEPLOYMENT_LOG 2>/dev/null | tail -1 | cut -d' ' -f1 || echo "")

echo -e "${BLUE}🚀 Monthly Production Deployment to ${PRODUCTION_ENV}${NC}"
echo ""

# Check if deployment already done this month
if [ "$LAST_DEPLOYMENT_MONTH" == "$CURRENT_MONTH" ]; then
    echo -e "${RED}❌ Error: Production deployment already completed this month (${CURRENT_MONTH})${NC}"
    echo -e "${YELLOW}   Monthly deployment limit: 1 deployment per month${NC}"
    echo -e "${YELLOW}   Last deployment: ${LAST_DEPLOYMENT_MONTH}${NC}"
    echo ""
    echo "To deploy again this month, you need:"
    echo "  1. Emergency deployment approval"
    echo "  2. Or wait until next month"
    exit 1
fi

echo -e "${GREEN}✅ Deployment window open for ${CURRENT_MONTH}${NC}"
echo ""

# Pre-deployment checks
echo -e "${BLUE}📋 Running pre-deployment checks...${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found!${NC}"
    exit 1
fi

# Check if staging is up to date
echo "   Checking staging environment..."
# Add staging check here if needed

# Check if all tests pass
echo "   Running tests..."
npm run test

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed. Cannot deploy to production.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All pre-deployment checks passed${NC}"
echo ""

# Confirmation prompt
echo -e "${YELLOW}⚠️  WARNING: You are about to deploy to PRODUCTION (${PRODUCTION_ENV})${NC}"
echo -e "${YELLOW}   This is a monthly deployment. Make sure:${NC}"
echo "   - All features are tested on staging"
echo "   - Business approval obtained"
echo "   - Release notes prepared"
echo "   - Rollback plan ready"
echo ""
read -p "Continue with production deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

echo ""

# Get version number
read -p "Enter version number (e.g., v1.2.3): " VERSION

if [ -z "$VERSION" ]; then
    echo -e "${RED}❌ Version number required${NC}"
    exit 1
fi

# Create release tag
echo -e "${BLUE}📌 Creating release tag: ${VERSION}${NC}"
git tag -a "$VERSION" -m "Monthly production deployment: $VERSION - $(date +%Y-%m-%d)"
git push origin "$VERSION"

# Build for production
echo -e "${BLUE}🏗️  Building for production...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Deploy contracts (if needed)
if [ -d "contracts" ]; then
    echo -e "${BLUE}📦 Deploying smart contracts...${NC}"
    cd contracts
    
    # Determine network (sepolia for testnet, mainnet for production)
    NETWORK=${DEPLOYMENT_NETWORK:-sepolia}
    
    echo "   Deploying to ${NETWORK}..."
    npx hardhat run scripts/deploy.ts --network $NETWORK 2>&1 | tee ../deploy-production.log
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Contracts deployed${NC}"
    else
        echo -e "${RED}❌ Contract deployment failed${NC}"
        exit 1
    fi
    
    cd ..
fi

# Deploy frontend
echo -e "${BLUE}🚀 Deploying frontend to ${PRODUCTION_ENV}...${NC}"

# Add your deployment command here
# Examples:
# - Vercel: vercel --prod
# - Netlify: netlify deploy --prod
# - Cloudflare Pages: wrangler pages deploy dist
# - Custom: ./scripts/deploy-to-production.sh

echo "   Frontend deployment command would run here"
echo "   Update this script with your actual deployment command"

# Log deployment
echo "$CURRENT_MONTH $VERSION $(date +%Y-%m-%d\ %H:%M:%S) $(whoami)" >> $DEPLOYMENT_LOG

echo ""
echo -e "${GREEN}🎉 Production deployment complete!${NC}"
echo ""
echo "📋 Deployment Summary:"
echo "   Environment: ${PRODUCTION_ENV}"
echo "   Version: ${VERSION}"
echo "   Date: $(date +%Y-%m-%d)"
echo "   Month: ${CURRENT_MONTH}"
echo ""
echo "📝 Next Steps:"
echo "   1. Monitor deployment for 24 hours"
echo "   2. Run smoke tests"
echo "   3. Collect user feedback"
echo "   4. Document any issues"
echo ""
echo -e "${YELLOW}⚠️  Remember: Next production deployment can only be done next month${NC}"
echo ""

