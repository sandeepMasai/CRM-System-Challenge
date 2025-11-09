#!/bin/bash

# Frontend Environment Setup Script
# This script helps create the .env file from the example

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Frontend Environment Setup${NC}"
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "Do you want to overwrite it? (yes/no): " overwrite
    if [ "$overwrite" != "yes" ]; then
        echo "Setup cancelled. Existing .env file preserved."
        exit 0
    fi
fi

# Copy from example
if [ -f env.example ]; then
    cp env.example .env
    echo -e "${GREEN}✅ Created .env file from env.example${NC}"
    echo ""
    echo -e "${YELLOW}📝 Please edit .env file with your configuration:${NC}"
    echo "   - VITE_API_URL: Backend API URL"
    echo "   - VITE_SOCKET_URL: Socket.IO server URL"
    echo "   - VITE_FRONTEND_URL: Frontend URL"
    echo ""
    echo "For development, defaults should work fine."
    echo "For production, update with your actual URLs."
else
    echo -e "${RED}❌ Error: env.example file not found!${NC}"
    exit 1
fi

