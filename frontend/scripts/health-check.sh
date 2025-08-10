#!/bin/bash

# CupTrack Development Environment Health Check
# This script verifies the development environment is ready

set -e

echo "🏥 CupTrack Development Environment Health Check"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ISSUES_FOUND=0
WARNINGS_FOUND=0

# Function to print colored output
print_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
}

print_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    ((ISSUES_FOUND++))
}

print_warn() {
    echo -e "${YELLOW}⚠️  WARN: $1${NC}"
    ((WARNINGS_FOUND++))
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO: $1${NC}"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_fail "Not in frontend directory (package.json not found)"
    exit 1
fi

print_info "Running health check from $(pwd)"

echo ""
echo "🔍 System Requirements"
echo "---------------------"

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [[ $NODE_VERSION == "not found" ]]; then
    print_fail "Node.js is not installed"
else
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_pass "Node.js version: $NODE_VERSION (>= 18 required)"
    else
        print_fail "Node.js version: $NODE_VERSION (>= 18 required, found $NODE_MAJOR)"
    fi
fi

# Check npm version
NPM_VERSION=$(npm --version 2>/dev/null || echo "not found")
if [[ $NPM_VERSION == "not found" ]]; then
    print_fail "npm is not installed"
else
    print_pass "npm version: $NPM_VERSION"
fi

echo ""
echo "📦 Dependencies"
echo "---------------"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_fail "node_modules directory not found - run npm install"
else
    print_pass "node_modules directory exists"
fi

# Check package-lock.json
if [ ! -f "package-lock.json" ]; then
    print_warn "package-lock.json not found - dependencies may be inconsistent"
else
    print_pass "package-lock.json exists"
fi

# Check critical dependencies
CRITICAL_DEPS=("react" "react-scripts" "typescript" "@types/react")
echo "  Checking critical dependencies..."

for dep in "${CRITICAL_DEPS[@]}"; do
    if npm list "$dep" >/dev/null 2>&1; then
        VERSION=$(npm list "$dep" --depth=0 2>/dev/null | grep "$dep" | sed 's/.*@//' | sed 's/ .*//')
        print_pass "$dep@$VERSION installed"
    else
        print_fail "$dep is missing or not properly installed"
    fi
done

# Check for known problematic dependencies
echo "  Checking for known issues..."

# Check TypeScript version compatibility
if npm list typescript >/dev/null 2>&1; then
    TS_VERSION=$(npm list typescript --depth=0 2>/dev/null | grep typescript | sed 's/.*@//' | sed 's/ .*//')
    TS_MAJOR=$(echo $TS_VERSION | cut -d'.' -f1)
    if [ "$TS_MAJOR" -ge 5 ]; then
        print_warn "TypeScript $TS_VERSION may conflict with react-scripts 5.0.1 (expects ^3.2.1 || ^4)"
    else
        print_pass "TypeScript version $TS_VERSION is compatible"
    fi
fi

# Check ajv dependency (known issue)
if npm list ajv >/dev/null 2>&1; then
    print_pass "ajv dependency is installed"
else
    print_warn "ajv dependency missing - may cause webpack issues"
fi

echo ""
echo "🌐 Network & Ports"
echo "-------------------"

# Check if development ports are available
PORTS=(3000 3001 3002 3003)
OCCUPIED_PORTS=()

for port in "${PORTS[@]}"; do
    if lsof -ti:$port >/dev/null 2>&1; then
        PID=$(lsof -ti:$port)
        PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
        OCCUPIED_PORTS+=("$port (PID: $PID, Process: $PROCESS)")
        print_warn "Port $port is occupied by PID $PID ($PROCESS)"
    else
        print_pass "Port $port is available"
    fi
done

# Test internet connectivity for npm registry
echo "  Testing npm registry connectivity..."
if npm ping >/dev/null 2>&1; then
    print_pass "npm registry is reachable"
else
    print_warn "npm registry connectivity issues detected"
fi

echo ""
echo "⚙️ Configuration"
echo "----------------"

# Check tsconfig.json
if [ ! -f "tsconfig.json" ]; then
    print_warn "tsconfig.json not found"
else
    print_pass "tsconfig.json exists"
fi

# Check for React Scripts configuration
if [ -f "src/index.tsx" ]; then
    print_pass "React entry point (src/index.tsx) exists"
else
    print_fail "React entry point (src/index.tsx) not found"
fi

# Check for common directories
REQUIRED_DIRS=("src" "public")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_pass "$dir directory exists"
    else
        print_fail "$dir directory missing"
    fi
done

echo ""
echo "🧹 Environment Health"
echo "---------------------"

# Check npm cache
CACHE_SIZE=$(du -sh ~/.npm 2>/dev/null | cut -f1 || echo "unknown")
print_info "npm cache size: $CACHE_SIZE"

# Check for common lockfiles that might conflict
LOCKFILES=("yarn.lock" "pnpm-lock.yaml")
for lockfile in "${LOCKFILES[@]}"; do
    if [ -f "$lockfile" ]; then
        print_warn "$lockfile found - may conflict with npm"
    fi
done

# Check disk space
AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
print_info "Available disk space: $AVAILABLE_SPACE"

echo ""
echo "📊 Summary"
echo "----------"

if [ $ISSUES_FOUND -eq 0 ] && [ $WARNINGS_FOUND -eq 0 ]; then
    print_pass "Environment is healthy! Ready for development."
elif [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Environment has $WARNINGS_FOUND warnings but should work${NC}"
    echo "Consider addressing warnings for optimal performance"
else
    echo -e "${RED}❌ Environment has $ISSUES_FOUND critical issues and $WARNINGS_FOUND warnings${NC}"
    echo "Please fix critical issues before starting development"
fi

# Provide recommendations
echo ""
echo "🔧 Recommendations"
echo "------------------"

if [ ${#OCCUPIED_PORTS[@]} -gt 0 ]; then
    echo "• Kill occupied ports: lsof -ti:3000,3001,3002,3003 | xargs kill -9"
fi

if [ $ISSUES_FOUND -gt 0 ]; then
    echo "• Run 'npm install --legacy-peer-deps' to fix dependency issues"
    echo "• Run './scripts/dev-start.sh' for automated cleanup and startup"
fi

if [ $WARNINGS_FOUND -gt 0 ]; then
    echo "• Consider running 'npm cache clean --force' to clear cache"
    echo "• Review warnings above and update dependencies if needed"
fi

echo ""
echo "🚀 Next Steps"
echo "-------------"
if [ $ISSUES_FOUND -eq 0 ]; then
    echo "• Run './scripts/dev-start.sh' to start the development server"
    echo "• Or run 'npm start' for manual startup"
else
    echo "• Fix the issues listed above first"
    echo "• Then run this health check again"
fi

exit $ISSUES_FOUND