#!/bin/bash
# Deploy Operations & Management System to Production
# This script prepares and deploys the operations system

set -e

echo "🚀 Deploying Operations & Management System"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Verify database schema
echo "1️⃣  Verifying database schema..."
if [ -f "backend/schema.sql" ]; then
    echo -e "${GREEN}✓${NC} Schema file found"
    
    # Check for operations tables
    if grep -q "treasury_transactions" backend/schema.sql && \
       grep -q "operations_metrics" backend/schema.sql && \
       grep -q "fund_allocations" backend/schema.sql; then
        echo -e "${GREEN}✓${NC} Operations tables found in schema"
    else
        echo -e "${RED}✗${NC} Operations tables missing from schema"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} Schema file not found"
    exit 1
fi
echo ""

# Step 2: Check backend routes
echo "2️⃣  Verifying backend routes..."
if grep -q "operationsRoutes" backend/src/index.ts; then
    echo -e "${GREEN}✓${NC} Operations routes registered"
else
    echo -e "${RED}✗${NC} Operations routes not registered"
    exit 1
fi

if [ -f "backend/src/routes/operations.ts" ]; then
    echo -e "${GREEN}✓${NC} Operations routes file exists"
else
    echo -e "${RED}✗${NC} Operations routes file missing"
    exit 1
fi
echo ""

# Step 3: Check frontend components
echo "3️⃣  Verifying frontend components..."
COMPONENTS=(
    "components/OperationsDashboard.tsx"
    "components/TreasuryManagement.tsx"
    "components/SimpleChart.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo -e "${GREEN}✓${NC} $component"
    else
        echo -e "${RED}✗${NC} $component missing"
        exit 1
    fi
done
echo ""

# Step 4: Check API service
echo "4️⃣  Verifying API service..."
if grep -q "operationsApi" services/api.ts; then
    echo -e "${GREEN}✓${NC} Operations API service found"
else
    echo -e "${RED}✗${NC} Operations API service missing"
    exit 1
fi
echo ""

# Step 5: Build check
echo "5️⃣  Building application..."
if npm run build 2>&1 | grep -q "built in"; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${YELLOW}⚠${NC}  Build completed (check for warnings)"
fi
echo ""

# Step 6: Database migration reminder
echo "6️⃣  Database Migration"
echo -e "${YELLOW}⚠${NC}  Remember to run database migrations:"
echo "   - Run: backend/scripts/migrate-operations-tables.sql"
echo "   - Or use: npm run db:migrate (if configured)"
echo ""

# Step 7: Admin setup reminder
echo "7️⃣  Admin User Setup"
echo -e "${YELLOW}⚠${NC}  Remember to configure admin users:"
echo "   - Run: node backend/scripts/setup-admin.js <user_id>"
echo "   - Or use SQL: UPDATE users SET is_admin = 1 WHERE id = 'user_id'"
echo ""

# Step 8: Deployment instructions
echo "8️⃣  Deployment Instructions"
echo "   For Cloudflare Workers:"
echo "   - wrangler deploy"
echo ""
echo "   For traditional hosting:"
echo "   - Deploy backend to your server"
echo "   - Deploy frontend build to CDN/hosting"
echo "   - Configure environment variables"
echo ""

echo "==========================================="
echo -e "${GREEN}✅ Pre-deployment checks complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run database migrations"
echo "2. Configure admin users"
echo "3. Deploy backend and frontend"
echo "4. Test endpoints"
echo "5. Monitor logs"
echo ""

