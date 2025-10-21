#!/usr/bin/env python3
"""
Simple Mock TECHNO Generator Server
For testing the frontend interface
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import random

app = Flask(__name__)
CORS(app)

# TECHNO styles
TECHNO_STYLES = {
    'minimal': 'Minimal techno with hypnotic loops and stripped-down beats',
    'acid': 'Acid techno with TB-303 basslines and squelchy sounds',
    'hard': 'Hard techno with aggressive kicks and fast BPM',
    'melodic': 'Melodic techno with emotional progressions and uplifting synths',
    'dub': 'Dub techno with deep reverb and spacious mix',
    'industrial': 'Industrial techno with mechanical sounds and heavy distortion'
}

@app.route('/')
def home():
    return """
    <h1>🤖 TECHNO Generator API</h1>
    <p>POST to /generate with JSON: {"style": "minimal", "prompt": "dark vibes", "auth_token": "test"}</p>
    <p>Available styles: minimal, acid, hard, melodic, dub, industrial</p>
    """

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'techno-generator'})

@app.route('/test', methods=['POST'])
def test_api():
    try:
        data = request.get_json()
        auth_token = data.get('auth_token', '')
        
        if len(auth_token) < 3:
            return jsonify({'error': 'Token too short'}), 400
            
        return jsonify({
            'success': True,
            'message': 'API test successful',
            'token_length': len(auth_token)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate_techno():
    try:
        data = request.get_json()
        
        style = data.get('style', 'minimal')
        prompt = data.get('prompt', 'TECHNO')
        auth_token = data.get('auth_token')
        
        if not auth_token:
            return jsonify({
                'error': 'Missing auth_token',
                'instructions': 'Please add your Udio API key in settings'
            }), 400
        
        # Simulate generation time
        time.sleep(random.uniform(1, 3))
        
        # Mock successful response
        track_id = f'techno_{int(time.time())}'
        
        return jsonify({
            'success': True,
            'track': {
                'id': track_id,
                'title': f'{style.title()} TECHNO - {prompt}',
                'audio_url': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
                'style': style,
                'prompt': f'{TECHNO_STYLES[style]}, {prompt}',
                'status': 'mock_generated'
            },
            'message': f'Mock {style} TECHNO generated successfully!'
        })
        
    except Exception as e:
        print(f"Generation error: {e}")
        return jsonify({
            'error': f'Generation failed: {str(e)}',
            'type': type(e).__name__
        }), 500

if __name__ == '__main__':
    print("🎵 Starting TECHNO Generator Mock Server on port 5000")
    print("Available styles:", list(TECHNO_STYLES.keys()))
    app.run(host='0.0.0.0', port=5000, debug=True)