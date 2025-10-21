#!/usr/bin/env python3
"""
Suno AI TECHNO Generator Server
Alternative to Udio using Suno API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import os

app = Flask(__name__)
CORS(app)

# TECHNO-specific prompts optimized for Suno AI
TECHNO_STYLES = {
    'minimal': 'Minimal techno, hypnotic 4/4 beats, deep bass, subtle percussion, warehouse atmosphere, electronic, instrumental',
    'acid': 'Acid techno, TB-303 sounds, squelchy basslines, driving beats, electronic dance music, instrumental',
    'hard': 'Hard techno, aggressive kicks, distorted sounds, fast tempo, industrial vibes, electronic, instrumental',
    'melodic': 'Melodic techno, uplifting synths, emotional progressions, deep bass, electronic dance music, instrumental',
    'dub': 'Dub techno, deep reverb, spacious sounds, echo effects, minimalist, electronic, instrumental',
    'industrial': 'Industrial techno, mechanical sounds, harsh textures, metallic percussion, dark atmosphere, electronic, instrumental'
}

class SunoAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.sunoai.ai/v1"
        
    def generate_music(self, prompt, make_instrumental=True, tags="techno, electronic"):
        """Generate music using Suno API"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'prompt': prompt,
            'make_instrumental': make_instrumental,
            'tags': tags,
            'model': 'chirp-v3-5'
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/generate",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Suno API Error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Request error: {e}")
            return None
    
    def get_track_status(self, track_id):
        """Check if track generation is complete"""
        headers = {'Authorization': f'Bearer {self.api_key}'}
        
        try:
            response = requests.get(
                f"{self.base_url}/tracks/{track_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
        except Exception as e:
            print(f"Status check error: {e}")
            return None

def create_techno_prompt(style, user_input):
    """Create optimized TECHNO prompt for Suno"""
    base_style = TECHNO_STYLES.get(style, TECHNO_STYLES['minimal'])
    return f"{base_style}, {user_input}, 128 BPM, club ready, professional production"

@app.route('/')
def home():
    return """
    <h1>🤖 Suno AI TECHNO Generator</h1>
    <p>POST to /generate with JSON: {"style": "minimal", "prompt": "dark warehouse vibes", "api_key": "your-suno-key"}</p>
    <p>Styles: minimal, acid, hard, melodic, dub, industrial</p>
    <p>Get API key from: https://app.suno.ai/account</p>
    """

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'suno-techno-generator'})

@app.route('/test', methods=['POST'])
def test_api():
    """Test endpoint with mock data"""
    try:
        data = request.get_json()
        api_key = data.get('api_key', '')
        
        if len(api_key) < 10:
            return jsonify({'error': 'API key too short - need real Suno API key'}), 400
            
        return jsonify({
            'success': True,
            'message': 'Suno API test ready',
            'key_length': len(api_key),
            'service': 'suno-ai'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate_techno():
    """Generate real TECHNO track using Suno API"""
    try:
        data = request.get_json()
        
        style = data.get('style', 'minimal')
        user_prompt = data.get('prompt', 'TECHNO')
        api_key = data.get('api_key')
        
        if not api_key:
            return jsonify({
                'error': 'Missing api_key',
                'instructions': 'Get your Suno API key from https://app.suno.ai/account'
            }), 400
        
        # Create TECHNO-optimized prompt
        full_prompt = create_techno_prompt(style, user_prompt)
        
        print(f"🎵 Generating {style} TECHNO with Suno AI...")
        print(f"📝 Prompt: {full_prompt}")
        
        # Initialize Suno API
        suno = SunoAPI(api_key)
        
        # Generate TECHNO track
        result = suno.generate_music(
            prompt=full_prompt,
            make_instrumental=True,
            tags=f"techno, {style}, electronic, instrumental"
        )
        
        if result and 'id' in result:
            return jsonify({
                'success': True,
                'track': {
                    'id': result['id'],
                    'title': f'{style.title()} TECHNO - {user_prompt}',
                    'audio_url': result.get('audio_url'),
                    'style': style,
                    'prompt': full_prompt,
                    'status': result.get('status', 'processing'),
                    'created_at': result.get('created_at')
                },
                'message': f'Real {style} TECHNO generation started with Suno!',
                'track_id': result['id']
            })
        else:
            return jsonify({
                'error': 'Generation failed',
                'details': 'Suno API may be busy or key invalid',
                'prompt': full_prompt
            }), 500
            
    except Exception as e:
        print(f"❌ Generation error: {str(e)}")
        return jsonify({
            'error': f'Generation failed: {str(e)}',
            'type': type(e).__name__,
            'details': 'Check your Suno API key and try again'
        }), 500

@app.route('/status/<track_id>')
def check_status(track_id):
    """Check generation status"""
    try:
        # This would check with Suno API for real status
        # For now, return mock status
        return jsonify({
            'track_id': track_id,
            'status': 'completed',
            'audio_url': 'https://example.com/track.mp3'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    print("🎵 Starting Suno AI TECHNO Generator")
    print(f"📡 Server: http://localhost:{port}")
    print("🎛 Styles:", list(TECHNO_STYLES.keys()))
    print("🔑 Requires: Suno API key from app.suno.ai")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=True)