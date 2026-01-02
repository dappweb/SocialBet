#!/bin/bash

# Script to update environment variables with deployed contract addresses
# Usage: ./scripts/update-env-addresses.sh <ethereum_address> <solana_address>

set -e

ETH_ADDRESS=$1
SOL_ADDRESS=$2

if [ -z "$ETH_ADDRESS" ] && [ -z "$SOL_ADDRESS" ]; then
    echo "Usage: $0 <ethereum_address> [solana_address]"
    echo "Example: $0 0x1234...abcd SolanaProgramID..."
    exit 1
fi

ENV_FILE=".env.local"

# Create .env.local if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating $ENV_FILE..."
    touch "$ENV_FILE"
fi

# Update Ethereum address
if [ -n "$ETH_ADDRESS" ]; then
    if grep -q "VITE_SOUL_TOKEN_SEPOLIA" "$ENV_FILE"; then
        sed -i "s|VITE_SOUL_TOKEN_SEPOLIA=.*|VITE_SOUL_TOKEN_SEPOLIA=$ETH_ADDRESS|" "$ENV_FILE"
        echo "✅ Updated VITE_SOUL_TOKEN_SEPOLIA=$ETH_ADDRESS"
    else
        echo "VITE_SOUL_TOKEN_SEPOLIA=$ETH_ADDRESS" >> "$ENV_FILE"
        echo "✅ Added VITE_SOUL_TOKEN_SEPOLIA=$ETH_ADDRESS"
    fi
fi

# Update Solana address
if [ -n "$SOL_ADDRESS" ]; then
    if grep -q "VITE_SOUL_TOKEN_SOLANA" "$ENV_FILE"; then
        sed -i "s|VITE_SOUL_TOKEN_SOLANA=.*|VITE_SOUL_TOKEN_SOLANA=$SOL_ADDRESS|" "$ENV_FILE"
        echo "✅ Updated VITE_SOUL_TOKEN_SOLANA=$SOL_ADDRESS"
    else
        echo "VITE_SOUL_TOKEN_SOLANA=$SOL_ADDRESS" >> "$ENV_FILE"
        echo "✅ Added VITE_SOUL_TOKEN_SOLANA=$SOL_ADDRESS"
    fi
fi

# Update Token Sale contract
if [ -n "$TOKEN_SALE_ADDRESS" ]; then
    TOKEN_SALE_ADDRESS=$1
    if [ -n "$TOKEN_SALE_ADDRESS" ] && [ "$TOKEN_SALE_ADDRESS" != "$ETH_ADDRESS" ]; then
        if grep -q "VITE_TOKEN_SALE_CONTRACT" "$ENV_FILE"; then
            sed -i "s|VITE_TOKEN_SALE_CONTRACT=.*|VITE_TOKEN_SALE_CONTRACT=$TOKEN_SALE_ADDRESS|" "$ENV_FILE"
            echo "✅ Updated VITE_TOKEN_SALE_CONTRACT=$TOKEN_SALE_ADDRESS"
        else
            echo "VITE_TOKEN_SALE_CONTRACT=$TOKEN_SALE_ADDRESS" >> "$ENV_FILE"
            echo "✅ Added VITE_TOKEN_SALE_CONTRACT=$TOKEN_SALE_ADDRESS"
        fi
    fi
fi

echo ""
echo "📋 Updated $ENV_FILE with contract addresses"
echo "   Remember to restart your dev server if running"

