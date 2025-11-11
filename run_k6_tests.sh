#!/bin/bash

# K6 Load Testing Suite Runner
# Runs all load tests with appropriate configurations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
API_KEY="${API_KEY:-test_key_12345}"
API_SECRET="${API_SECRET:-test_secret_67890}"
RESULTS_DIR="k6_results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create results directory
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}K6 Load Testing Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo "API Base URL: $API_BASE_URL"
echo "Results Directory: $RESULTS_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

# Function to run a test
run_test() {
  local test_file=$1
  local test_name=$2
  local test_description=$3
  local duration=$4
  local output_file="$RESULTS_DIR/${test_name}_${TIMESTAMP}"

  echo -e "${YELLOW}Running: $test_name${NC}"
  echo "Description: $test_description"
  echo "Duration: $duration"
  echo ""

  k6 run \
    -e API_BASE_URL="$API_BASE_URL" \
    -e API_KEY="$API_KEY" \
    -e API_SECRET="$API_SECRET" \
    --out json="$output_file.json" \
    "$test_file"

  local exit_code=$?

  if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}✓ $test_name passed${NC}"
  else
    echo -e "${RED}✗ $test_name failed${NC}"
  fi

  echo ""
  return $exit_code
}

# Parse command line arguments
if [ $# -eq 0 ]; then
  # Run all tests
  tests_to_run="all"
else
  tests_to_run="$1"
fi

# Run tests based on argument
case "$tests_to_run" in
  "smoke")
    # Quick smoke test
    echo -e "${BLUE}Running SMOKE TESTS${NC}"
    run_test "k6_tests/01_auth_setup.js" "auth_setup_smoke" "Quick auth validation" "5m"
    ;;

  "load")
    # Load tests
    echo -e "${BLUE}Running LOAD TESTS${NC}"
    run_test "k6_tests/01_auth_setup.js" "auth_setup_load" "Auth & setup load test" "25m"
    run_test "k6_tests/02_payment_load_test.js" "payment_load" "Payment processing load test" "30m"
    run_test "k6_tests/04_subscription_load_test.js" "subscription_load" "Subscription batch processing test" "28m"
    ;;

  "stress")
    # Stress tests
    echo -e "${BLUE}Running STRESS TESTS${NC}"
    run_test "k6_tests/06_spike_stress_test.js" "spike_stress" "Spike and stress testing" "10m"
    ;;

  "security")
    # Security-focused tests
    echo -e "${BLUE}Running SECURITY TESTS${NC}"
    run_test "k6_tests/03_request_signing_test.js" "request_signing" "API request signing verification" "25m"
    run_test "k6_tests/05_fraud_detection_test.js" "fraud_detection" "Fraud detection performance" "42m"
    ;;

  "realistic")
    # End-to-end workflow tests
    echo -e "${BLUE}Running REALISTIC SCENARIO TESTS${NC}"
    run_test "k6_tests/07_realistic_scenario.js" "realistic_scenario" "End-to-end user workflows" "30m"
    ;;

  "all")
    # Run all tests sequentially
    echo -e "${BLUE}Running ALL TESTS${NC}"
    echo "This will take approximately 3-4 hours"
    echo ""

    run_test "k6_tests/01_auth_setup.js" "auth_setup" "Auth & setup test" "25m"
    run_test "k6_tests/02_payment_load_test.js" "payment_load" "Payment processing load test" "30m"
    run_test "k6_tests/03_request_signing_test.js" "request_signing" "Request signing test" "25m"
    run_test "k6_tests/04_subscription_load_test.js" "subscription_load" "Subscription batch test" "28m"
    run_test "k6_tests/05_fraud_detection_test.js" "fraud_detection" "Fraud detection test" "42m"
    run_test "k6_tests/07_realistic_scenario.js" "realistic_scenario" "Realistic scenarios" "30m"
    ;;

  *)
    echo -e "${RED}Unknown test suite: $tests_to_run${NC}"
    echo "Valid options:"
    echo "  smoke      - Quick smoke test (5m)"
    echo "  load       - Load tests (83m)"
    echo "  stress     - Stress tests (10m)"
    echo "  security   - Security tests (67m)"
    echo "  realistic  - Realistic scenarios (30m)"
    echo "  all        - All tests (210m+ total)"
    echo "  <filename> - Run specific test file"
    exit 1
    ;;
esac

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Test suite completed${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Results saved to: $RESULTS_DIR"
echo ""
echo "To view results:"
echo "  cat $RESULTS_DIR/results_${TIMESTAMP}.json | jq '.metrics'"
echo ""
echo "To generate HTML report:"
echo "  k6 run --out html=$RESULTS_DIR/report_${TIMESTAMP}.html <test_file>"
echo ""
