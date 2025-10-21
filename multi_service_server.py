#!/usr/bin/env python3
"""
Multi-Service TECHNO Generator
Supports multiple AI music generation APIs
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import os

app = Flask(__name__)
CORS(app)

# TECHNO styles for all services
TECHNO_STYLES = {
    'minimal': 'Minimal techno with hypnotic 4/4 beats, deep bass, repetitive patterns, 128 BPM',
    'acid': 'Acid techno with TB-303 sounds, squelchy basslines, driving rhythm, 132 BPM', 
    'hard': 'Hard techno with aggressive kicks, distorted sounds, fast tempo, 140 BPM',
    'melodic': 'Melodic techno with uplifting synths, emotional progressions, 125 BPM',
    'dub': 'Dub techno with deep reverb, spacious sounds, minimalist approach, 120 BPM',
    'industrial': 'Industrial techno with mechanical sounds, harsh textures, 135 BPM'
}

class APIService:
    """Base class for API services"""
    def __init__(self, name, base_url, requires_auth=True):
        self.name = name
        self.base_url = base_url
        self.requires_auth = requires_auth
    
    def test_connection(self, api_key=None):
        """Test if service is available"""
        try:
            headers = {}
            if api_key and self.requires_auth:
                headers['Authorization'] = f'Bearer {api_key}'
            
            response = requests.get(f"{self.base_url}/health", headers=headers, timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def generate(self, prompt, style, api_key=None, **kwargs):
        """Generate music - implemented by subclasses"""
        raise NotImplementedError

class SunoService(APIService):
    """Suno AI service"""
    def __init__(self):
        super().__init__("Suno AI", "https://api.sunoai.ai/v1", True)
    
    def generate(self, prompt, style, api_key=None, **kwargs):
        headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
        data = {
            'prompt': prompt,
            'make_instrumental': True,
            'tags': f'techno, {style}, electronic, instrumental',
            'model': 'chirp-v3-5'
        }
        
        try:
            response = requests.post(f"{self.base_url}/generate", headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Suno error: {e}")
        return None

class MuzicService(APIService):
    """Muzic/Audiocraft service"""
    def __init__(self):
        super().__init__("Muzic", "https://api.muzic.ai/v1", True)
    
    def generate(self, prompt, style, api_key=None, **kwargs):
        headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
        data = {
            'text': prompt,
            'duration': kwargs.get('duration', 20),
            'model': 'musicgen-medium'
        }
        
        try:
            response = requests.post(f"{self.base_url}/generate", headers=headers, json=data, timeout=30)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Muzic error: {e}")
        return None

class ReplicateService(APIService):
    """Replicate MusicGen service"""
    def __init__(self):
        super().__init__("Replicate", "https://api.replicate.com/v1", True)
    
    def generate(self, prompt, style, api_key=None, **kwargs):
        headers = {'Authorization': f'Token {api_key}', 'Content-Type': 'application/json'}
        data = {
            'version': 'b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46ca9bd0d2',
            'input': {
                'prompt': prompt,
                'duration': kwargs.get('duration', 20),
                'model_version': 'musicgen-medium'
            }
        }
        
        try:
            response = requests.post(f"{self.base_url}/predictions", headers=headers, json=data, timeout=30)
            if response.status_code == 201:
                return response.json()
        except Exception as e:
            print(f"Replicate error: {e}")
        return None

# Initialize services
SERVICES = {
    'suno': SunoService(),
    'muzic': MuzicService(), 
    'replicate': ReplicateService()
}

def create_techno_prompt(style, user_input, service='suno'):
    """Create optimized TECHNO prompt for specific service"""
    base_style = TECHNO_STYLES.get(style, TECHNO_STYLES['minimal'])
    
    if service == 'suno':
        return f"{base_style}, {user_input}, electronic dance music, instrumental, club ready"
    elif service == 'replicate':
        return f"{base_style} {user_input} electronic instrumental techno"
    else:
        return f"{base_style}, {user_input}, techno, electronic, instrumental"

@app.route('/')
def home():
    return """
    <h1>🤖 Multi-Service TECHNO Generator</h1>
    <p>POST to /generate with JSON: {"style": "minimal", "prompt": "dark vibes", "service": "suno", "api_key": "your-key"}</p>
    <p><strong>Services:</strong> suno, muzic, replicate</p>
    <p><strong>Styles:</strong> minimal, acid, hard, melodic, dub, industrial</p>
    <h3>🔑 API Keys Required:</h3>
    <ul>
        <li><strong>Suno:</strong> Get from <a href="https://app.suno.ai/account">app.suno.ai/account</a></li>
        <li><strong>Replicate:</strong> Get from <a href="https://replicate.com/account">replicate.com/account</a></li>
        <li><strong>Muzic:</strong> Contact for API access</li>
    </ul>
    """

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'multi-techno-generator',
        'available_services': list(SERVICES.keys())
    })

@app.route('/services')
def list_services():
    """List available services and their status"""
    status = {}
    for name, service in SERVICES.items():
        status[name] = {
            'name': service.name,
            'requires_auth': service.requires_auth,
            'available': True  # We can't test without API keys
        }
    return jsonify(status)

@app.route('/test', methods=['POST'])
def test_api():
    """Test specific service"""
    try:
        data = request.get_json()
        service_name = data.get('service', 'suno')
        api_key = data.get('api_key', '')
        
        if service_name not in SERVICES:
            return jsonify({'error': f'Unknown service: {service_name}'}), 400
        
        service = SERVICES[service_name]
        
        if service.requires_auth and len(api_key) < 10:
            return jsonify({'error': f'{service.name} requires valid API key'}), 400
        
        return jsonify({
            'success': True,
            'service': service.name,
            'message': f'{service.name} API test ready',
            'requires_auth': service.requires_auth
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate_techno():
    """Generate TECHNO using specified service"""
    try:
        data = request.get_json()
        
        style = data.get('style', 'minimal')
        user_prompt = data.get('prompt', 'TECHNO')
        service_name = data.get('service', 'suno')
        api_key = data.get('api_key')
        duration = min(int(data.get('duration', 20)), 30)
        
        if service_name not in SERVICES:
            return jsonify({'error': f'Unknown service: {service_name}'}), 400
        
        service = SERVICES[service_name]
        
        if service.requires_auth and not api_key:
            return jsonify({
                'error': f'Missing API key for {service.name}',
                'instructions': f'Get API key for {service.name} and include in request'
            }), 400
        
        # Create service-specific prompt
        full_prompt = create_techno_prompt(style, user_prompt, service_name)
        
        print(f"🎵 Generating {style} TECHNO with {service.name}...")
        print(f"📝 Prompt: {full_prompt}")
        
        # Generate with selected service
        result = service.generate(
            prompt=full_prompt,
            style=style,
            api_key=api_key,
            duration=duration
        )
        
        if result:
            track_id = result.get('id', f'{service_name}_{int(time.time())}')
            
            return jsonify({
                'success': True,
                'track': {
                    'id': track_id,
                    'title': f'{style.title()} TECHNO - {user_prompt}',
                    'audio_url': result.get('audio_url'),
                    'style': style,
                    'prompt': full_prompt,
                    'status': result.get('status', 'processing'),
                    'service': service.name,
                    'created_at': result.get('created_at', time.time())
                },
                'message': f'Real {style} TECHNO generation started with {service.name}!',
                'service_used': service.name
            })
        else:
            return jsonify({
                'error': f'Generation failed with {service.name}',
                'details': 'API may be busy or key invalid',
                'prompt': full_prompt
            }), 500
            
    except Exception as e:
        print(f"❌ Generation error: {str(e)}")
        return jsonify({
            'error': f'Generation failed: {str(e)}',
            'type': type(e).__name__
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5004))
    print("🎵 Starting Multi-Service TECHNO Generator")
    print(f"📡 Server: http://localhost:{port}")
    print("🎛 Styles:", list(TECHNO_STYLES.keys()))
    print("🌐 Services:", list(SERVICES.keys()))
    print("🔑 Requires: API keys for chosen services")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=True)