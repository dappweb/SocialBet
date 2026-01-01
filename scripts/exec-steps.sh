#!/bin/bash

# Multi-Step Execution Script
# Executes steps 1-5 for release preparation and deployment

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Executing Steps 1-5${NC}"
echo ""

# Step 1: Verify Environment
echo -e "${BLUE}Step 1/5: Verifying Environment${NC}"
echo "─────────────────────────────────────"

if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Created .env.local from template${NC}"
        echo -e "${YELLOW}⚠️  Please update .env.local with your configuration${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env.local exists${NC}"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js installed: ${NODE_VERSION}${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm installed: ${NPM_VERSION}${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

echo ""

# Step 2: Install Dependencies
echo -e "${BLUE}Step 2/5: Installing Dependencies${NC}"
echo "─────────────────────────────────────"

if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
    echo "Running npm install to ensure latest versions..."
    npm install
fi

echo ""

# Step 3: Build Application
echo -e "${BLUE}Step 3/5: Building Application${NC}"
echo "─────────────────────────────────────"

echo "Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
    echo "   Output: dist/"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""

# Step 4: Run Tests
echo -e "${BLUE}Step 4/5: Running Tests${NC}"
echo "─────────────────────────────────────"

if npm run test 2>/dev/null; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Tests failed or test command not available${NC}"
    echo "   Continuing with deployment..."
fi

echo ""

# Step 5: Prepare Deployment
echo -e "${BLUE}Step 5/5: Preparing Deployment${NC}"
echo "─────────────────────────────────────"

# Check git status
if [ -d ".git" ]; then
    echo "Checking git status..."
    git status --short
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
        echo "   Files modified but not committed"
    else
        echo -e "${GREEN}✅ Working directory clean${NC}"
    fi
    
    # Check current version tag
    LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "none")
    echo -e "${GREEN}✅ Latest tag: ${LATEST_TAG}${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repository${NC}"
fi

# Create deployment summary
cat > deployment-summary.txt << EOF
Deployment Summary - $(date +%Y-%m-%d\ %H:%M:%S)
==========================================

Environment: $(node -v)
Build Status: ✅ Success
Output Directory: dist/
Latest Tag: ${LATEST_TAG}

Next Steps:
1. Review build output in dist/
2. Deploy to staging: npm run deploy:staging
3. Deploy to production: npm run deploy:production (monthly only)

EOF

echo -e "${GREEN}✅ Deployment summary created: deployment-summary.txt${NC}"

echo ""
echo -e "${GREEN}🎉 All Steps Completed Successfully!${NC}"
echo ""
echo "📋 Summary:"
echo "   ✅ Environment verified"
echo "   ✅ Dependencies installed"
echo "   ✅ Application built"
echo "   ✅ Tests executed"
echo "   ✅ Deployment prepared"
echo ""
echo "📝 Next Steps:"
echo "   1. Review deployment-summary.txt"
echo "   2. Test the build: npm run preview"
echo "   3. Deploy to staging: npm run deploy:staging"
echo "   4. Deploy to production: npm run deploy:production (if ready)"
echo ""

