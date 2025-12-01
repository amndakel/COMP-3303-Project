#!/bin/bash

# Transit App - Run Script for Arch Linux
# This script starts both frontend and backend PHP servers

echo "Starting Transit App servers..."
echo ""

# Start backend server on port 8001
echo "Starting backend server on http://localhost:8001"
cd backend
php -S localhost:8001 router.php > /dev/null 2>&1 &
BACKEND_PID=$!
cd ..

# Start frontend server on port 8000
echo "Starting frontend server on http://localhost:8000"
cd frontend
php -S localhost:8000 > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✓ Frontend: http://localhost:8000"
echo "✓ Backend:  http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Servers stopped.'; exit" INT

# Keep script running
wait

