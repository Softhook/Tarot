#!/bin/bash

# Simple script to start the Tarot app locally
# This ensures the service worker and PWA features work properly

PORT=8080

echo "🔮 Starting Tarot app locally on port $PORT..."
echo "📱 Open http://localhost:$PORT in your browser"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Try to use Python 3 first, then Python 2, then Node.js
if command -v python3 >/dev/null 2>&1; then
    python3 -m http.server $PORT
elif command -v python >/dev/null 2>&1; then
    python -m SimpleHTTPServer $PORT
elif command -v npx >/dev/null 2>&1; then
    npx serve . -p $PORT
else
    echo "❌ Error: No suitable server found."
    echo "Please install Python or Node.js to run the local server."
    exit 1
fi