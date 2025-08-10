#!/bin/bash

# CupTrack Development Server Startup Script
# This script handles cleanup and ensures clean server startup

set -e  # Exit on any error

echo "🚀 CupTrack Development Server Startup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Step 1: Kill any existing processes on development ports
echo "🧹 Cleaning up existing processes..."
PORTS=(3000 3001 3002 3003)
KILLED_ANY=false

for port in "${PORTS[@]}"; do
    PIDS=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$PIDS" ]; then
        echo "   Killing processes on port $port: $PIDS"
        echo $PIDS | xargs kill -9 2>/dev/null || true
        KILLED_ANY=true
    fi
done

if [ "$KILLED_ANY" = true ]; then
    print_status "Cleaned up existing processes"
    sleep 2  # Wait for processes to fully terminate
else
    print_status "No existing processes to clean up"
fi

# Step 2: Check if node_modules exists and is healthy
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    print_warning "Dependencies need to be installed"
    npm install --legacy-peer-deps
    print_status "Dependencies installed"
else
    # Quick health check of key dependencies
    if [ ! -d "node_modules/react-scripts" ]; then
        print_warning "Core dependencies missing, reinstalling..."
        npm install --legacy-peer-deps
        print_status "Dependencies reinstalled"
    else
        print_status "Dependencies look healthy"
    fi
fi

# Step 3: Clear npm cache if there were issues in the last week
CACHE_DIR="$HOME/.npm"
if [ -d "$CACHE_DIR" ]; then
    # Check if cache is older than 7 days
    if find "$CACHE_DIR" -maxdepth 1 -name "_cacache" -mtime +7 | grep -q .; then
        print_warning "Clearing old npm cache..."
        npm cache clean --force 2>/dev/null || true
        print_status "npm cache cleared"
    fi
fi

# Step 4: Check for common configuration issues
echo "🔍 Checking configuration..."

# Check TypeScript configuration
if ! npm list typescript >/dev/null 2>&1; then
    print_warning "TypeScript dependency issue detected"
fi

# Check for common missing dependencies that cause startup failures
CRITICAL_DEPS=("react-scripts" "typescript" "ajv")
MISSING_DEPS=()

for dep in "${CRITICAL_DEPS[@]}"; do
    if ! npm list "$dep" >/dev/null 2>&1; then
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    print_warning "Missing critical dependencies: ${MISSING_DEPS[*]}"
    print_warning "Attempting to fix..."
    npm install "${MISSING_DEPS[@]}" --legacy-peer-deps
    print_status "Dependencies fixed"
fi

# Step 5: Start the development server
echo "🌟 Starting development server..."
print_status "Starting React development server on http://localhost:3000"
print_warning "Server starting... this may take a moment"

# Use PORT environment variable to ensure consistent port
export PORT=3000

# Start the server and capture the PID for potential cleanup
npm start &
SERVER_PID=$!

# Wait a moment and check if the server started successfully
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    print_status "Development server started successfully!"
    echo "📱 Access your application at: http://localhost:3000"
    echo "🛑 To stop the server: Ctrl+C or kill $SERVER_PID"
    
    # Wait for the server process
    wait $SERVER_PID
else
    print_error "Failed to start development server"
    exit 1
fi