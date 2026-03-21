#!/bin/bash

# CodeNest Quick Start Script
# This script helps you set up and run the CodeNest project

echo "🚀 CodeNest Quick Start"
echo "======================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

if ! command_exists mysql; then
    echo -e "${YELLOW}⚠ MySQL client not found. Make sure MySQL server is running.${NC}"
fi

# Backend Setup
echo -e "\n${YELLOW}Setting up Backend...${NC}"
cd codenest_backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠ Please update .env with your database credentials${NC}"
    fi
fi

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Ask if user wants to create superuser
read -p "Do you want to create a superuser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

# Frontend Setup
echo -e "\n${YELLOW}Setting up Frontend...${NC}"
cd ../project2

# Install dependencies
echo "Installing Node dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
    fi
fi

# Done
echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n${YELLOW}To start the application:${NC}"
echo "1. Backend:  cd codenest_backend && source venv/bin/activate && python manage.py runserver"
echo "2. Frontend: cd project2 && npm run dev"
echo -e "\n${YELLOW}Or use the start script: ./start-dev.sh${NC}"
