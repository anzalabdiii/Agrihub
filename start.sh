#!/bin/bash

# AgriLink Hub - Start Script
# Starts both backend and frontend servers

echo "=========================================="
echo "Starting AgriLink Hub"
echo "=========================================="

# Start backend in background
echo "Starting backend server..."
cd backend
source venv/bin/activate
python3 run.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Start frontend
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================="
echo "AgriLink Hub is running!"
echo "=========================================="
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=========================================="

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
