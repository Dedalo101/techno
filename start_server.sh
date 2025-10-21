#!/bin/bash
# TECHNO Generator Server Launcher
# Choose your preferred server mode

echo "🎵 AI TECHNO Generator Server Options"
echo "====================================="
echo "1. Mock Server (Recommended for testing)"
echo "2. Udio Server (Requires API key)" 
echo "3. Quiet Server (No warnings)"
echo "4. Kill all servers"
echo ""

read -p "Choose option (1-4): " choice

case $choice in
    1)
        echo "🚀 Starting Mock TECHNO Server..."
        python simple_server.py
        ;;
    2)
        echo "🚀 Starting Udio TECHNO Server..."
        python udio_server.py
        ;;
    3)
        echo "🚀 Starting Quiet Server..."
        python quiet_server.py
        ;;
    4)
        echo "🛑 Stopping all servers..."
        pkill -f "python.*server"
        echo "✅ All servers stopped"
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-4."
        ;;
esac