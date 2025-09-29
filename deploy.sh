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
echo "1. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git push origin main"
echo ""
echo "2. Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "3. Set environment variables in Vercel:"
echo "   vercel env add OPENAI_API_KEY"
echo "   vercel env add ANTHROPIC_API_KEY"
echo "   vercel env add GOOGLE_API_KEY"
echo ""
echo "🎉 Ready for deployment!"
