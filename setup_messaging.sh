
#!/bin/bash
# Messaging System Setup Script
# Run this script to set up the messaging system

echo "================================================"
echo "  AgriLink Hub - Messaging System Setup"
echo "================================================"
echo ""

# Navigate to backend directory
cd backend || exit 1

echo "Step 1: Creating messages table..."
python setup_messages.py

if [ $? -eq 0 ]; then
    echo ""
    echo "Step 2: Verifying setup..."
    python verify_setup.py

    if [ $? -eq 0 ]; then
        echo ""
        echo "================================================"
        echo "  ✅ SETUP COMPLETE!"
        echo "================================================"
        echo ""
        echo "To start using the messaging system:"
        echo ""
        echo "1. Restart your Flask backend:"
        echo "   cd backend"
        echo "   python -m flask run"
        echo ""
        echo "2. Open the app and go to Messages tab"
        echo ""
    else
        echo ""
        echo "⚠️  Verification found some issues"
        echo "Please check the output above"
    fi
else
    echo ""
    echo "❌ Failed to create messages table"
    echo "Please check the error message above"
    exit 1
fi
