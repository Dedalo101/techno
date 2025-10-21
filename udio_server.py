#!/usr/bin/env python3
"""
Simple Udio TECHNO Generator Server
Direct API integration for reliable TECHNO generation
"""

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import os
import sys
import time
from flask_cors import CORS
import requests
import json
import time
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# TECHNO-specific prompts and styles
TECHNO_STYLES = {
    'minimal': 'Minimal techno with hypnotic loops, stripped-down beats, repetitive patterns, underground warehouse atmosphere',
    'acid': 'Acid techno with TB-303 basslines, squelchy acid sounds, driving 4/4 kick drums, rave energy',
    'hard': 'Hard techno with aggressive kicks, distorted sounds, fast BPM, industrial atmosphere, dark energy',
    'melodic': 'Melodic techno with emotional progressions, uplifting synths, deep basslines, progressive structure',
    'dub': 'Dub techno with deep reverb, spacious mix, echo effects, atmospheric pads, Berlin underground style',
    'industrial': 'Industrial techno with mechanical sounds, heavy distortion, metallic percussion, dystopian atmosphere'
}

# Udio API endpoints
UDIO_API_BASE = "https://www.udio.com/api"

def create_techno_prompt(style, user_input):
    """Create optimized TECHNO prompt"""
    base_style = TECHNO_STYLES.get(style, TECHNO_STYLES['minimal'])
    return f"{base_style}, {user_input}, electronic dance music, club ready, professional production"

def make_udio_request(endpoint, method='GET', data=None, auth_token=None):
    """Make authenticated request to Udio API"""
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
    
    if auth_token:
        headers['Authorization'] = f'Bearer {auth_token}'
        headers['Cookie'] = f'sb-api-auth-token={auth_token}'
    
    url = f"{UDIO_API_BASE}/{endpoint}"
    
    try:
        if method == 'POST':
            response = requests.post(url, headers=headers, json=data, timeout=30)
        else:
            response = requests.get(url, headers=headers, timeout=30)
        
        return response
    except Exception as e:
        print(f"Request error: {e}")
        return None

@app.route('/')
def home():
    """Simple test page"""
    return """
    <h1>🤖 UDIO TECHNO Generator API</h1>
    <p>POST to /generate with JSON: {"style": "minimal", "prompt": "dark warehouse vibes", "auth_token": "your-token"}</p>
    <p>Styles: minimal, acid, hard, melodic, dub, industrial</p>
    """

@app.route('/generate', methods=['POST'])
def generate_techno():
    """Generate TECHNO track using Udio API"""
    try:
        data = request.get_json()
        
        # Extract parameters
        style = data.get('style', 'minimal')
        user_prompt = data.get('prompt', 'TECHNO')
        auth_token = data.get('auth_token')
        
        if not auth_token:
            return jsonify({
                'error': 'Missing auth_token. Get it from udio.com cookies (sb-api-auth-token)',
                'instructions': 'Go to udio.com → F12 → Application → Cookies → sb-api-auth-token'
            }), 400
        
        # Create TECHNO-optimized prompt
        full_prompt = create_techno_prompt(style, user_prompt)
        
        print(f"Generating TECHNO: {full_prompt}")
        
        # For now, let's create a mock response to test the flow
        # Once we get the API working, we'll implement the real Udio calls
        
        # Simulate generation time
        time.sleep(2)
        
        # Mock successful response
        track_data = {
            'id': f'techno_{int(time.time())}',
            'title': f'{style.title()} TECHNO - {user_prompt}',
            'audio_url': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',  # Demo audio
            'style': style,
            'prompt': full_prompt,
            'status': 'generated'
        }
        
        return jsonify({
            'success': True,
            'track': track_data,
            'message': f'Mock {style} TECHNO generated! Real Udio integration coming soon...'
        })
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': f'Generation failed: {str(e)}',
            'type': type(e).__name__
        }), 500

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'udio-techno-generator'})

@app.route('/test', methods=['POST'])
def test_generation():
    """Test endpoint with mock data - no auth required"""
    try:
        data = request.get_json()
        # No auth required for test endpoint
        
        style = data.get('style', 'minimal')
        user_prompt = data.get('prompt', 'TECHNO')
        
        # Return mock success response
        return jsonify({
            'success': True,
            'track': {
                'id': f'test-{style}-{int(time.time())}',
                'title': f'Test {style.title()} TECHNO Track',
                'audio_url': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
                'style': style,
                'prompt': f'{TECHNO_STYLES[style]}, {user_prompt}'
            }
        })
    except Exception as e:
        return jsonify({'error': f'Test failed: {str(e)}'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🎵 Starting UDIO TECHNO Generator on port {port}")
    print("Available styles:", list(TECHNO_STYLES.keys()))
    app.run(host='0.0.0.0', port=port, debug=True)