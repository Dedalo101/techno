#!/usr/bin/env python3
"""
Production-ready TECHNO Generator Server
Suppresses development warnings for cleaner output
"""

import logging
import warnings
import os
import sys

# Suppress Flask development server warning
warnings.filterwarnings('ignore', message='This is a development server.*')

# Suppress Werkzeug logging for cleaner output
logging.getLogger('werkzeug').setLevel(logging.ERROR)

# Import and run the server
if __name__ == '__main__':
    print("🎵 Starting TECHNO Generator (Production Mode)")
    print("🔇 Warnings suppressed for cleaner output")
    print("=" * 50)
    
    # Import after suppressing warnings
    from simple_server import app, TECHNO_STYLES
    
    port = int(os.environ.get('PORT', 5000))
    print(f"📡 Server: http://localhost:{port}")
    print(f"🎛 Styles: {len(TECHNO_STYLES)} TECHNO variants available")
    print("=" * 50)
    
    # Run without debug mode to suppress warnings
    app.run(host='0.0.0.0', port=port, debug=False)