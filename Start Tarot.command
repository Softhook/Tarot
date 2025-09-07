#!/bin/bash
cd "$(dirname "$0")"
echo "🔮 Starting Design Wishes Tarot..."
echo "📱 The app will open in your browser shortly"
echo ""

# Start server in background and open browser
if command -v python3 >/dev/null 2>&1; then
    python3 -m http.server 8080 &
    SERVER_PID=$!
elif command -v python >/dev/null 2>&1; then
    python -m SimpleHTTPServer 8080 &
    SERVER_PID=$!
else
    echo "❌ Python not found. Please install Python to run this app."
    read -p "Press Enter to exit..."
    exit 1
fi

# Wait a moment for server to start
sleep 2

# Open in default browser
open http://localhost:8080

echo "🎴 Tarot app is now running!"
echo "🌐 Visit: http://localhost:8080"
echo "🛑 Close this window to stop the server"

# Keep terminal open and wait for user to close
trap "kill $SERVER_PID 2>/dev/null; exit" INT TERM
wait $SERVER_PID