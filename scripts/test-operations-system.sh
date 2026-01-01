#!/bin/bash
# Test Operations & Management System
# Tests all operations endpoints and verifies system functionality

set -e

API_URL="${API_URL:-http://localhost:8787}"
TEST_USER_ID="${TEST_USER_ID:-me}"

echo "🧪 Testing Operations & Management System"
echo "=========================================="
echo "API URL: $API_URL"
echo "Test User ID: $TEST_USER_ID"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    elif [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "  Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Health check
echo "1. Health Check"
test_endpoint "Health Check" "GET" "/api/health"
echo ""

# Treasury endpoints
echo "2. Treasury Management"
test_endpoint "Get Treasury" "GET" "/api/operations/treasury"
echo ""

# Transaction endpoints
echo "3. Transaction Management"
test_endpoint "Get Transactions" "GET" "/api/operations/transactions?limit=10"

# Test creating a transaction (trade fee - doesn't require admin)
TRANSACTION_DATA='{
  "transactionType": "trade_fee",
  "amount": 25.50,
  "currency": "USD",
  "description": "Test transaction from system test",
  "category": "operations",
  "status": "completed"
}'
test_endpoint "Create Transaction" "POST" "/api/operations/transactions" "$TRANSACTION_DATA"
echo ""

# Statistics endpoint
echo "4. Statistics"
test_endpoint "Get Stats" "GET" "/api/operations/stats"
echo ""

# Summary
echo "=========================================="
echo "Test Summary:"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}Failed: $TESTS_FAILED${NC}"
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
fi

