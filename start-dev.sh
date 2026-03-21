#!/bin/bash

# Start both backend and frontend in development mode

echo "🚀 Starting CodeNest Development Servers..."

# Start backend in background
echo "Starting Django backend..."
cd codenest_backend
source venv/bin/activate
python manage.py runserver &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting React frontend..."
cd ../project2
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started!"
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
