#!/bin/bash

echo "Testing Image Serving..."
echo "========================"
echo ""

# Check if backend is running
echo "1. Checking if backend is running on port 5000..."
if curl -s http://localhost:5000/api/products > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is NOT running. Please start it with: cd backend && python run.py"
    exit 1
fi

echo ""
echo "2. Checking uploads directory..."
UPLOAD_DIR="backend/uploads"
if [ -d "$UPLOAD_DIR" ]; then
    IMAGE_COUNT=$(ls -1 "$UPLOAD_DIR" | wc -l)
    echo "   ✅ Uploads directory exists with $IMAGE_COUNT files"
    echo "   First image: $(ls "$UPLOAD_DIR" | head -1)"
    FIRST_IMAGE=$(ls "$UPLOAD_DIR" | head -1)
else
    echo "   ❌ Uploads directory not found"
    exit 1
fi

echo ""
echo "3. Testing image URL..."
if [ ! -z "$FIRST_IMAGE" ]; then
    IMAGE_URL="http://localhost:5000/uploads/$FIRST_IMAGE"
    echo "   Testing: $IMAGE_URL"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$IMAGE_URL")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ Image is accessible! (HTTP $HTTP_CODE)"
    else
        echo "   ❌ Image NOT accessible (HTTP $HTTP_CODE)"
        echo "   This means the /uploads route is not working"
    fi
else
    echo "   ⚠️  No images found to test"
fi

echo ""
echo "4. Checking if CORS is configured..."
CORS_CHECK=$(curl -s -H "Origin: http://localhost:5173" -I http://localhost:5000/api/products | grep -i "access-control-allow-origin")
if [ ! -z "$CORS_CHECK" ]; then
    echo "   ✅ CORS is configured: $CORS_CHECK"
else
    echo "   ❌ CORS headers not found"
fi

echo ""
echo "========================"
echo "Test complete!"
