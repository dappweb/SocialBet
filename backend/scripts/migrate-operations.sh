#!/bin/bash
# Migrate Operations Tables to Cloudflare D1
# This script runs the operations migration for Cloudflare D1 database

set -e

DB_NAME="${DB_NAME:-socialbet-db}"
LOCAL="${LOCAL:-false}"

echo "🔄 Migrating Operations & Management Tables"
echo "==========================================="
echo "Database: $DB_NAME"
echo "Mode: $([ "$LOCAL" = "true" ] && echo "Local" || echo "Remote")"
echo ""

if [ "$LOCAL" = "true" ]; then
    echo "Running local migration..."
    wrangler d1 execute "$DB_NAME" --local --file=./scripts/migrate-operations-tables.sql
else
    echo "Running production migration..."
    echo -e "\033[1;33m⚠️  WARNING: This will modify the production database!\033[0m"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "Migration cancelled."
        exit 0
    fi
    
    wrangler d1 execute "$DB_NAME" --file=./scripts/migrate-operations-tables.sql
fi

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Set up admin users: node scripts/setup-admin.js <user_id>"
echo "2. Verify tables: wrangler d1 execute $DB_NAME --command='SELECT name FROM sqlite_master WHERE type=\"table\" AND name LIKE \"%operations%\" OR name LIKE \"%treasury%\"'"






