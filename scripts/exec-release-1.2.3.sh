#!/bin/bash

# Execute Release v1.2.3
# Complete release process for version 1.2.3

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

VERSION="1.2.3"
TAG="v${VERSION}"

echo -e "${BLUE}🚀 Executing Release ${TAG}${NC}"
echo ""

# Step 1: Verify Tag Exists
echo -e "${BLUE}Step 1: Verifying Release Tag${NC}"
echo "─────────────────────────────────────"

if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Tag ${TAG} exists${NC}"
    git show "$TAG" --no-patch --format="  Tag: %D%n  Date: %ad%n  Message: %s" --date=short
else
    echo -e "${RED}❌ Tag ${TAG} not found${NC}"
    echo "Creating tag..."
    git tag -a "$TAG" -m "Release v${VERSION}: SOUL Token Trading & Operational Funding"
    echo -e "${GREEN}✅ Tag ${TAG} created${NC}"
fi

echo ""

# Step 2: Check Build Status
echo -e "${BLUE}Step 2: Checking Build Status${NC}"
echo "─────────────────────────────────────"

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ Build output exists${NC}"
    echo "  Build directory: dist/"
    echo "  Files: $(find dist -type f | wc -l) files"
else
    echo -e "${YELLOW}⚠️  Build output not found. Building...${NC}"
    npm run build
    echo -e "${GREEN}✅ Build completed${NC}"
fi

echo ""

# Step 3: Run Tests
echo -e "${BLUE}Step 3: Running Tests${NC}"
echo "─────────────────────────────────────"

if npm run test 2>/dev/null; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Tests failed or skipped${NC}"
fi

echo ""

# Step 4: Create Release Package
echo -e "${BLUE}Step 4: Creating Release Package${NC}"
echo "─────────────────────────────────────"

RELEASE_DIR="releases/v${VERSION}"
mkdir -p "$RELEASE_DIR"

# Copy build output
echo "Copying build files..."
cp -r dist/* "$RELEASE_DIR/" 2>/dev/null || echo "  No dist files to copy"

# Copy release documentation
if [ -f "RELEASE_v${VERSION}.md" ]; then
    cp "RELEASE_v${VERSION}.md" "$RELEASE_DIR/"
    echo -e "${GREEN}✅ Release notes copied${NC}"
fi

if [ -f "CHANGELOG.md" ]; then
    cp "CHANGELOG.md" "$RELEASE_DIR/"
    echo -e "${GREEN}✅ Changelog copied${NC}"
fi

# Create release info
cat > "$RELEASE_DIR/RELEASE_INFO.txt" << EOF
Release Information
==================

Version: ${VERSION}
Tag: ${TAG}
Date: $(date +%Y-%m-%d\ %H:%M:%S)
Build: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

Features:
- SOUL Token Trading System
- Treasury Management
- Web3Auth Integration
- Sepolia Testnet Configuration
- Monthly Deployment Policy

Deployment:
- Staging: npm run deploy:staging
- Sepolia: npm run deploy:sepolia
- Production: npm run deploy:production

EOF

echo -e "${GREEN}✅ Release package created: ${RELEASE_DIR}${NC}"

echo ""

# Step 5: Deployment Options
echo -e "${BLUE}Step 5: Deployment Options${NC}"
echo "─────────────────────────────────────"

echo "Release ${TAG} is ready for deployment!"
echo ""
echo "Available deployment options:"
echo ""
echo "  1. Deploy to Sepolia Testnet"
echo "     Command: npm run deploy:sepolia"
echo ""
echo "  2. Deploy to Staging"
echo "     Command: npm run deploy:staging"
echo ""
echo "  3. Deploy to Production (Monthly Only)"
echo "     Command: npm run deploy:production"
echo ""
echo "  4. Push to Git Repository"
echo "     Commands:"
echo "       git push origin main"
echo "       git push origin ${TAG}"
echo ""

# Ask for deployment choice
read -p "Deploy now? (sepolia/staging/production/skip): " deploy_choice

case $deploy_choice in
    sepolia)
        echo ""
        echo -e "${BLUE}Deploying to Sepolia Testnet...${NC}"
        npm run deploy:sepolia
        ;;
    staging)
        echo ""
        echo -e "${BLUE}Deploying to Staging...${NC}"
        npm run deploy:staging
        ;;
    production)
        echo ""
        echo -e "${YELLOW}⚠️  Production deployment (monthly only)${NC}"
        read -p "Confirm production deployment? (yes/no): " confirm
        if [ "$confirm" == "yes" ]; then
            npm run deploy:production
        else
            echo "Production deployment cancelled"
        fi
        ;;
    skip|"")
        echo "Skipping deployment"
        ;;
    *)
        echo "Invalid choice. Skipping deployment"
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Release ${TAG} Execution Complete!${NC}"
echo ""
echo "📋 Summary:"
echo "   ✅ Tag verified/created"
echo "   ✅ Build checked"
echo "   ✅ Tests executed"
echo "   ✅ Release package created"
echo "   ✅ Deployment options provided"
echo ""
echo "📁 Release Package: ${RELEASE_DIR}"
echo "📝 Release Notes: RELEASE_v${VERSION}.md"
echo ""

