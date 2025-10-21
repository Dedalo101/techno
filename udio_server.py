#!/usr/bin/env python3
"""
Simple Udio TECHNO Generator Server
Optimized for TECHNO music generation using UdioWrapper
"""

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import os
import sys

# Try to import udio_wrapper, install if not available
try:
    from udio_wrapper import UdioWrapper
except ImportError:
    print("Installing udio_wrapper...")
    os.system("pip install udio_wrapper")
    from udio_wrapper import UdioWrapper

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

def create_techno_prompt(style, user_input):
    """Create optimized TECHNO prompt"""
    base_style = TECHNO_STYLES.get(style, TECHNO_STYLES['minimal'])
    return f"{base_style}, {user_input}, electronic dance music, club ready, professional production"

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
        
        # Initialize Udio wrapper
        udio = UdioWrapper(auth_token)
        
        # Generate TECHNO track
        print(f"Generating TECHNO: {full_prompt}")
        
        result = udio.create_song(
            prompt=full_prompt,
            seed=-1,  # Random generation
            custom_lyrics=""  # Instrumental TECHNO
        )
        
        if result and len(result) > 0:
            track = result[0]  # Get first generated track
            return jsonify({
                'success': True,
                'track': {
                    'id': track.get('id'),
                    'title': track.get('title', f'TECHNO - {style.title()}'),
                    'audio_url': track.get('song_path'),
                    'style': style,
                    'prompt': full_prompt
                }
            })
        else:
            return jsonify({
                'error': 'No tracks generated',
                'prompt': full_prompt
            }), 500
            
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🎵 Starting UDIO TECHNO Generator on port {port}")
    print("Available styles:", list(TECHNO_STYLES.keys()))
    app.run(host='0.0.0.0', port=port, debug=True)