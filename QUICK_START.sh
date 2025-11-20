#!/bin/bash

# AgriLink Hub - Quick Start Script
# This script initializes the database and creates the admin user

echo "=================================================="
echo "AgriLink Hub - Quick Start Setup"
echo "=================================================="
echo ""

# Navigate to backend directory
cd backend

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Create database and admin user
echo ""
echo "Creating database and admin user..."
python3 create_admin.py

echo ""
echo "=================================================="
echo "Setup Complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Keep this terminal open and run: python3 run.py"
echo "2. Open a new terminal for frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo "3. Open browser to http://localhost:5173"
echo "4. Login with:"
echo "   Email: admin@agrilink.com"
echo "   Password: admin123"
echo ""
echo "=================================================="
