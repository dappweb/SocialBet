#!/bin/bash
# Verify Operations System Setup
# Checks if all components are properly configured

set -e

echo "🔍 Verifying Operations & Management System Setup"
echo "=================================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Check 1: Database schema
echo "1. Database Schema"
if [ -f "backend/schema.sql" ]; then
    if grep -q "treasury_transactions" backend/schema.sql; then
        echo -e "${GREEN}✓${NC} Operations tables in schema.sql"
    else
        echo -e "${RED}✗${NC} Operations tables missing from schema.sql"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} schema.sql not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 2: Backend routes
echo "2. Backend Routes"
if [ -f "backend/src/routes/operations.ts" ]; then
    echo -e "${GREEN}✓${NC} Operations routes file exists"
    
    if grep -q "operationsRoutes" backend/src/index.ts; then
        echo -e "${GREEN}✓${NC} Routes registered in index.ts"
    else
        echo -e "${RED}✗${NC} Routes not registered"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} Operations routes file missing"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 3: Frontend components
echo "3. Frontend Components"
COMPONENTS=(
    "components/OperationsDashboard.tsx"
    "components/TreasuryManagement.tsx"
    "components/SimpleChart.tsx"
)

for comp in "${COMPONENTS[@]}"; do
    if [ -f "$comp" ]; then
        echo -e "${GREEN}✓${NC} $comp"
    else
        echo -e "${RED}✗${NC} $comp missing"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# Check 4: API service
echo "4. API Service"
if grep -q "operationsApi" services/api.ts; then
    echo -e "${GREEN}✓${NC} Operations API service found"
else
    echo -e "${RED}✗${NC} Operations API service missing"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 5: Navigation
echo "5. Navigation Integration"
if grep -q "'operations'" App.tsx; then
    echo -e "${GREEN}✓${NC} Operations view in App.tsx"
else
    echo -e "${RED}✗${NC} Operations view not in App.tsx"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "Operations" components/Sidebar.tsx; then
    echo -e "${GREEN}✓${NC} Operations in Sidebar"
else
    echo -e "${RED}✗${NC} Operations not in Sidebar"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 6: Type definitions
echo "6. Type Definitions"
if grep -q "isAdmin" types.ts; then
    echo -e "${GREEN}✓${NC} isAdmin in types.ts"
else
    echo -e "${YELLOW}⚠${NC}  isAdmin not in types.ts (may need update)"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 7: Scripts
echo "7. Setup Scripts"
SCRIPTS=(
    "backend/scripts/setup-admin.sql"
    "backend/scripts/setup-admin.js"
    "backend/scripts/migrate-operations-tables.sql"
    "scripts/test-operations-system.sh"
    "scripts/deploy-operations-system.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo -e "${GREEN}✓${NC} $script"
    else
        echo -e "${YELLOW}⚠${NC}  $script not found"
        WARNINGS=$((WARNINGS + 1))
    fi
done
echo ""

# Summary
echo "=================================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "System is ready for:"
    echo "1. Database migration"
    echo "2. Admin user setup"
    echo "3. Testing"
    echo "4. Deployment"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠${NC}  Setup complete with $WARNINGS warning(s)"
    exit 0
else
    echo -e "${RED}✗${NC} Setup incomplete: $ERRORS error(s), $WARNINGS warning(s)"
    exit 1
fi






