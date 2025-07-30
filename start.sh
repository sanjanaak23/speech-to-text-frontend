#!/bin/bash

# SpeechCraft AI - Easy Startup Script
echo "🎤 Starting SpeechCraft AI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Install dependencies if node_modules don't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Check if environment files exist and create them if needed
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env file from template..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env and add your OpenAI API key!"
    echo "💡 Get your API key from: https://platform.openai.com/api-keys"
    echo "📂 File location: backend/.env"
    echo ""
fi

if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file from template..."
    cp .env.example .env
fi

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down SpeechCraft AI..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

echo "🚀 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

echo "🚀 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ SpeechCraft AI is running!"
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for either process to exit
wait