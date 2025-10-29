#!/bin/bash
# Quick start script for the backend server

echo "🏥 Starting Medication Reminder API Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting server on http://0.0.0.0:8000"
echo "📖 API docs available at http://localhost:8000/docs"
echo ""
echo "🔑 Default credentials:"
echo "   Username: nurse"
echo "   Password: nurse123"
echo ""
echo "💡 Find your IP for mobile testing:"
echo "   macOS/Linux: ifconfig | grep inet"
echo "   Windows: ipconfig"
echo ""

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
