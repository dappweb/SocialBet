#!/bin/bash

# Script to update environment variables with deployed fundraising contract addresses
# Usage: ./scripts/update-fundraising-addresses.sh <token_sale> <vesting> <liquidity_manager>

set -e

TOKEN_SALE=$1
VESTING=$2
LIQUIDITY=$3

ENV_FILE=".env.local"

# Create .env.local if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating $ENV_FILE..."
    touch "$ENV_FILE"
fi

# Update Token Sale address
if [ -n "$TOKEN_SALE" ]; then
    if grep -q "VITE_TOKEN_SALE_CONTRACT" "$ENV_FILE"; then
        sed -i "s|VITE_TOKEN_SALE_CONTRACT=.*|VITE_TOKEN_SALE_CONTRACT=$TOKEN_SALE|" "$ENV_FILE"
        echo "✅ Updated VITE_TOKEN_SALE_CONTRACT=$TOKEN_SALE"
    else
        echo "VITE_TOKEN_SALE_CONTRACT=$TOKEN_SALE" >> "$ENV_FILE"
        echo "✅ Added VITE_TOKEN_SALE_CONTRACT=$TOKEN_SALE"
    fi
fi

# Update Vesting address
if [ -n "$VESTING" ]; then
    if grep -q "VITE_VESTING_CONTRACT" "$ENV_FILE"; then
        sed -i "s|VITE_VESTING_CONTRACT=.*|VITE_VESTING_CONTRACT=$VESTING|" "$ENV_FILE"
        echo "✅ Updated VITE_VESTING_CONTRACT=$VESTING"
    else
        echo "VITE_VESTING_CONTRACT=$VESTING" >> "$ENV_FILE"
        echo "✅ Added VITE_VESTING_CONTRACT=$VESTING"
    fi
fi

# Update Liquidity Manager address
if [ -n "$LIQUIDITY" ]; then
    if grep -q "VITE_LIQUIDITY_MANAGER_CONTRACT" "$ENV_FILE"; then
        sed -i "s|VITE_LIQUIDITY_MANAGER_CONTRACT=.*|VITE_LIQUIDITY_MANAGER_CONTRACT=$LIQUIDITY|" "$ENV_FILE"
        echo "✅ Updated VITE_LIQUIDITY_MANAGER_CONTRACT=$LIQUIDITY"
    else
        echo "VITE_LIQUIDITY_MANAGER_CONTRACT=$LIQUIDITY" >> "$ENV_FILE"
        echo "✅ Added VITE_LIQUIDITY_MANAGER_CONTRACT=$LIQUIDITY"
    fi
fi

echo ""
echo "📋 Updated $ENV_FILE with fundraising contract addresses"
echo "   Remember to restart your dev server if running"

