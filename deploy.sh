#!/bin/bash

# AI Models Comparison Platform - Deployment Script

echo "🚀 Deploying AI Models Comparison Platform..."

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: main.py not found. Are you in the right directory?"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Please create it from env.example"
    echo "   cp env.example .env"
    echo "   # Then edit .env with your API keys"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run tests
echo "🧪 Running tests..."
python -c "
import requests
import sys

try:
    # Test if server is running
    response = requests.get('http://localhost:8000/health', timeout=5)
    if response.status_code == 200:
        print('✅ Server is running')
    else:
        print('❌ Server not responding')
        sys.exit(1)
except Exception as e:
    print('❌ Server not running. Please start it first:')
    print('   python main.py')
    sys.exit(1)
"

echo "✅ Deployment checks passed!"
echo ""
echo "📋 Next steps:"
echo "1. Create GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: ai-models-comparison-platform"
echo "   - Description: 🤖 Compare multiple LLM models with smart evaluation"
echo "   - Public repository"
echo "   - Don't initialize with README (we have one)"
echo ""
echo "2. Connect and push to GitHub:"
echo "   git remote add origin https://github.com/YOUR-USERNAME/ai-models-comparison-platform.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. For production deployment:"
echo "   pip install gunicorn"
echo "   gunicorn main:app --host 0.0.0.0 --port 8000 --workers 4"
echo ""
echo "🎉 Ready for GitHub!"
