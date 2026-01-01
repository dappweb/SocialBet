#!/bin/bash
# Deploy Release v1.2.3

set -e

VERSION="1.2.3"
TAG="v${VERSION}"

echo "🚀 Deploying Release ${TAG}"

# 1. Verify build
if [ ! -d "dist" ]; then
    echo "Building..."
    npm run build
fi

# 2. Deploy to Sepolia
echo "📦 Deploying to Sepolia Testnet..."
npm run deploy:sepolia

echo "✅ Release ${TAG} deployed!"
