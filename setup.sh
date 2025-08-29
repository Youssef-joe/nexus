#!/bin/bash

echo "🚀 Setting up L&D Nexus Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can start it with: brew services start mongodb/brew/mongodb-community"
    echo "   Or: sudo systemctl start mongod"
fi

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd server/nexus
npm install
cd ../..

echo "📦 Installing frontend dependencies..."
cd nexus-learning-path
npm install
cd ..

echo "⚙️  Setting up environment files..."

# Create backend .env if it doesn't exist
if [ ! -f "server/nexus/.env" ]; then
    cp server/nexus/.env server/nexus/.env.example 2>/dev/null || true
    echo "📝 Created server/nexus/.env - Please configure your environment variables"
fi

# Create frontend .env if it doesn't exist
if [ ! -f "nexus-learning-path/.env" ]; then
    echo "VITE_API_URL=http://localhost:3001/api" > nexus-learning-path/.env
    echo "📝 Created nexus-learning-path/.env"
fi

echo ""
echo "✅ Setup complete! Next steps:"
echo ""
echo "1. Configure your environment variables:"
echo "   - Edit server/nexus/.env with your MongoDB URI, JWT secret, OpenAI API key, etc."
echo "   - Edit nexus-learning-path/.env if needed"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:3001/api"
echo ""
echo "🎉 Happy coding!"