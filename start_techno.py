#!/usr/bin/env python3
"""
Quick Start Script for TECHNO Generator
"""

import os
import subprocess
import time

def check_server_running(port):
    """Check if server is running on port"""
    try:
        import requests
        response = requests.get(f'http://localhost:{port}/health', timeout=2)
        return response.status_code == 200
    except:
        return False

def main():
    print("🎵 AI TECHNO Generator - Quick Start")
    print("=" * 50)
    
    # Check if demo server is running
    if check_server_running(5005):
        print("✅ Demo server already running on port 5005")
    else:
        print("🚀 Starting demo server...")
        subprocess.Popen(['python', 'demo_server.py'])
        time.sleep(2)
    
    # Check if HTTP server is running
    if check_server_running(8000):
        print("✅ HTTP server already running on port 8000")
    else:
        print("🌐 Starting HTTP server...")
        subprocess.Popen(['python', '-m', 'http.server', '8000'])
        time.sleep(1)
    
    print("\n🎧 TECHNO Generator Ready!")
    print("📱 Open: http://localhost:8000/index_udio.html")
    print("🎛 Features:")
    print("  ✅ 6 TECHNO styles")
    print("  ✅ Instant generation")
    print("  ✅ No API key needed")
    print("  ✅ Real audio playback")
    print("\n💡 For real AI generation:")
    print("  • MusicGen (free): pip install transformers torch")
    print("  • Suno AI ($10/mo): app.suno.ai")
    print("  • Replicate (pay per use): replicate.com")

if __name__ == '__main__':
    main()