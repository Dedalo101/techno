#!/usr/bin/env python3
"""
Real Udio TECHNO Generator Server
Using proper UdioWrapper implementation for real TECHNO generation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import time

app = Flask(__name__)
CORS(app)

class UdioWrapper:
    API_BASE_URL = "https://www.udio.com/api"

    def __init__(self, auth_token):
        self.auth_token = auth_token
        self.all_track_ids = []

    def make_request(self, url, method, data=None, headers=None):
        try:
            if method == 'POST':
                response = requests.post(url, headers=headers, json=data)
            else:
                response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            print(f"Error making {method} request to {url}: {e}")
            return None

    def get_headers(self, get_request=False):
        headers = {
            "Accept": "application/json, text/plain, */*" if get_request else "application/json",
            "Content-Type": "application/json",
            "Cookie": f"; sb-api-auth-token={self.auth_token}",
            "Origin": "https://www.udio.com",
            "Referer": "https://www.udio.com/my-creations",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Dest": "empty"
        }
        if not get_request:
            headers.update({
                "sec-ch-ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"',
                "sec-fetch-dest": "empty"
            })
        return headers

    def create_song(self, prompt, seed=-1, custom_lyrics=None):
        song_result = self.generate_song(prompt, seed, custom_lyrics)
        if not song_result:
            return None
        track_ids = song_result.get('track_ids', [])
        self.all_track_ids.extend(track_ids)
        return self.process_songs(track_ids, "techno_tracks")

    def generate_song(self, prompt, seed, custom_lyrics=None):
        url = f"{self.API_BASE_URL}/generate-proxy"
        headers = self.get_headers()
        data = {"prompt": prompt, "samplerOptions": {"seed": seed}}
        if custom_lyrics:
            data["lyricInput"] = custom_lyrics
        response = self.make_request(url, 'POST', data, headers)
        return response.json() if response else None

    def process_songs(self, track_ids, folder):
        """Process generated songs and wait until ready"""
        print(f"Processing TECHNO tracks: {track_ids}")
        max_wait_time = 300  # 5 minutes max wait
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            status_result = self.check_song_status(track_ids)
            if status_result is None:
                print(f"Error checking song status.")
                return None
            elif status_result.get('all_finished', False):
                songs = []
                for song in status_result['data']['songs']:
                    songs.append(song)
                print(f"TECHNO tracks ready!")
                return songs
            else:
                time.sleep(5)
        
        print("Timeout waiting for tracks to complete")
        return None

    def check_song_status(self, song_ids):
        url = f"{self.API_BASE_URL}/songs?songIds={','.join(song_ids)}"
        headers = self.get_headers(True)
        response = self.make_request(url, 'GET', None, headers)
        if response:
            data = response.json()
            all_finished = all(song['finished'] for song in data['songs'])
            return {'all_finished': all_finished, 'data': data}
        else:
            return None

# TECHNO-specific prompts optimized for Udio
TECHNO_STYLES = {
    'minimal': 'Minimal techno, hypnotic loops, stripped-down beats, repetitive patterns, underground warehouse atmosphere, 130 BPM',
    'acid': 'Acid techno, TB-303 basslines, squelchy acid sounds, driving 4/4 kick drums, rave energy, 135 BPM',
    'hard': 'Hard techno, aggressive kicks, distorted sounds, fast BPM, industrial atmosphere, dark energy, 150 BPM',
    'melodic': 'Melodic techno, emotional progressions, uplifting synths, deep basslines, progressive structure, 125 BPM',
    'dub': 'Dub techno, deep reverb, spacious mix, echo effects, atmospheric pads, Berlin underground style, 120 BPM',
    'industrial': 'Industrial techno, mechanical sounds, heavy distortion, metallic percussion, dystopian atmosphere, 140 BPM'
}

def create_techno_prompt(style, user_input):
    """Create optimized TECHNO prompt for Udio"""
    base_style = TECHNO_STYLES.get(style, TECHNO_STYLES['minimal'])
    return f"{base_style}, {user_input}, electronic dance music, instrumental, club ready, professional production"

@app.route('/')
def home():
    """API home page"""
    return """
    <h1>🤖 Real Udio TECHNO Generator API</h1>
    <p>POST to /generate with JSON: {"style": "minimal", "prompt": "dark warehouse vibes", "auth_token": "your-udio-token"}</p>
    <p>Styles: minimal, acid, hard, melodic, dub, industrial</p>
    <p>Status: Ready for real TECHNO generation!</p>
    """

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'real-udio-techno-generator'})

@app.route('/test', methods=['POST'])
def test_api():
    """Test API endpoint"""
    try:
        data = request.get_json()
        auth_token = data.get('auth_token', '')
        
        if len(auth_token) < 10:
            return jsonify({'error': 'Token too short - need real Udio auth token'}), 400
            
        return jsonify({
            'success': True,
            'message': 'Real Udio API test ready',
            'token_length': len(auth_token),
            'api_base': UdioWrapper.API_BASE_URL
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate_techno():
    """Generate real TECHNO track using Udio API"""
    try:
        data = request.get_json()
        
        style = data.get('style', 'minimal')
        user_prompt = data.get('prompt', 'TECHNO')
        auth_token = data.get('auth_token')
        
        if not auth_token:
            return jsonify({
                'error': 'Missing auth_token',
                'instructions': 'Get your Udio auth token from udio.com cookies (sb-api-auth-token)'
            }), 400
        
        if len(auth_token) < 10:
            return jsonify({
                'error': 'Invalid auth token format',
                'instructions': 'Token should be a long string from Udio cookies'
            }), 400
        
        # Create TECHNO-optimized prompt
        full_prompt = create_techno_prompt(style, user_prompt)
        
        print(f"🎵 Generating {style} TECHNO with Udio API...")
        print(f"📝 Prompt: {full_prompt}")
        
        # Initialize Udio wrapper with real auth token
        udio = UdioWrapper(auth_token)
        
        # Generate TECHNO track with Udio
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
                    'title': track.get('title', f'{style.title()} TECHNO - {user_prompt}'),
                    'audio_url': track.get('song_path'),
                    'style': style,
                    'prompt': full_prompt,
                    'status': 'real_generated',
                    'duration': track.get('duration_seconds', 'unknown'),
                    'created_at': track.get('created_at')
                },
                'message': f'Real {style} TECHNO generated with Udio!'
            })
        else:
            return jsonify({
                'error': 'No tracks generated',
                'details': 'Udio API may be busy or token invalid',
                'prompt': full_prompt
            }), 500
            
    except Exception as e:
        print(f"❌ Generation error: {str(e)}")
        return jsonify({
            'error': f'Generation failed: {str(e)}',
            'type': type(e).__name__,
            'details': 'Check your Udio auth token and try again'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))  # Use different port to avoid conflicts
    print("🎵 Starting Real Udio TECHNO Generator")
    print(f"📡 Server: http://localhost:{port}")
    print("🎛 Styles:", list(TECHNO_STYLES.keys()))
    print("🔑 Requires: Real Udio auth token from udio.com")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=True)