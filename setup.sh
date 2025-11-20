#!/bin/bash

# AgriLink Hub - Complete Setup Script
# This script sets up the entire application including PostgreSQL database

set -e  # Exit on error

echo "=========================================="
echo "AgriLink Hub - Complete Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="myproject_db"
DB_USER="myuser"
DB_PASSWORD="mypassword"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 is not installed. Please install Python 3.8 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found: $(python3 --version)${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js 16 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}✗ PostgreSQL is not installed. Please install PostgreSQL 12 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL found${NC}"

echo ""
echo -e "${YELLOW}Step 2: Setting up PostgreSQL database...${NC}"

# Check if database exists, create if it doesn't
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}Database '$DB_NAME' already exists.${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
        sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
        echo -e "${GREEN}✓ Existing database dropped${NC}"
    fi
fi

# Create database user if not exists
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    echo "Creating database user '$DB_USER'..."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo -e "${GREEN}✓ Database user created${NC}"
else
    echo -e "${GREEN}✓ Database user '$DB_USER' already exists${NC}"
fi

# Create database if not exists
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Creating database '$DB_NAME'..."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    echo -e "${GREEN}✓ Database created${NC}"
fi

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo -e "${GREEN}✓ Privileges granted${NC}"

echo ""
echo -e "${YELLOW}Step 3: Setting up Python backend...${NC}"

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip > /dev/null 2>&1

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
fi

# Create uploads directory
mkdir -p uploads
echo -e "${GREEN}✓ Uploads directory created${NC}"

# Initialize database and seed data
echo "Initializing database and seeding data..."
python3 init_db.py
echo -e "${GREEN}✓ Database initialized and seeded${NC}"

cd ..

echo ""
echo -e "${YELLOW}Step 4: Setting up React frontend...${NC}"

cd frontend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ Frontend .env file created${NC}"
fi

# Install Node dependencies
echo "Installing Node.js dependencies (this may take a few minutes)..."
npm install > /dev/null 2>&1
echo -e "${GREEN}✓ Node.js dependencies installed${NC}"

cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend (in one terminal):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python3 run.py"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:5000"
echo ""
echo "=========================================="
echo "Default Login Credentials:"
echo "=========================================="
echo "ADMIN:"
echo "  Email: admin@agrilink.com"
echo "  Password: admin123"
echo ""
echo "FARMER:"
echo "  Email: john.farmer@gmail.com"
echo "  Password: farmer123"
echo ""
echo "BUYER:"
echo "  Email: buyer1@gmail.com"
echo "  Password: buyer123"
echo "=========================================="
