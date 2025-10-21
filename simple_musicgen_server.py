#!/usr/bin/env python3
"""
Simple MusicGen TECHNO Generator
Reliable version with proper error handling
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import os
import tempfile
import base64

app = Flask(__name__)
CORS(app)

# Try to import MusicGen dependencies
musicgen_available = False
try:
    import torch
    import torchaudio
    from transformers import MusicgenForConditionalGeneration, AutoProcessor
    musicgen_available = True
    print("✅ MusicGen dependencies loaded successfully")
except ImportError as e:
    print(f"⚠ MusicGen not available: {e}")
    print("📦 Install with: pip install transformers torch torchaudio")

# Global model variables
model = None
processor = None
model_loaded = False

# TECHNO-specific prompts
TECHNO_STYLES = {
    'minimal': 'minimal techno, repetitive beats, deep bass, 128 BPM, electronic',
    'acid': 'acid techno, TB-303 bass, squelchy sounds, 132 BPM, electronic',
    'hard': 'hard techno, aggressive kicks, 140 BPM, electronic, driving',
    'melodic': 'melodic techno, uplifting synths, 125 BPM, electronic, emotional',
    'dub': 'dub techno, deep reverb, spacious, 120 BPM, electronic, minimal',
    'industrial': 'industrial techno, mechanical sounds, 135 BPM, electronic, harsh'
}

def load_musicgen_model():
    """Load MusicGen model with proper error handling"""
    global model, processor, model_loaded
    
    if not musicgen_available:
        return False
    
    if model_loaded:
        return True
    
    try:
        print("🔄 Loading MusicGen model (first time may take 5+ minutes)...")
        
        # Use the smallest model for faster loading
        model_name = "facebook/musicgen-small"
        
        print("📦 Loading processor...")
        processor = AutoProcessor.from_pretrained(model_name)
        
        print("🧠 Loading model...")
        model = MusicgenForConditionalGeneration.from_pretrained(model_name)
        
        # Use CPU for compatibility (GPU if available)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = model.to(device)
        
        model_loaded = True
        print(f"✅ MusicGen loaded successfully on {device}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to load MusicGen: {e}")
        return False

def generate_audio(prompt, duration=15):
    """Generate audio with MusicGen"""
    try:
        if not load_musicgen_model():
            return None
        
        print(f"🎵 Generating: {prompt}")
        
        # Process the prompt
        inputs = processor(
            text=[prompt],
            padding=True,
            return_tensors="pt",
        )
        
        # Move to same device as model
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Generate audio
        with torch.no_grad():
            audio_values = model.generate(**inputs, max_new_tokens=duration * 50)
        
        # Convert to numpy
        audio_np = audio_values[0, 0].cpu().numpy()
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        sample_rate = model.config.audio_encoder.sample_rate
        
        # Convert to tensor and save
        audio_tensor = torch.from_numpy(audio_np).unsqueeze(0)
        torchaudio.save(temp_file.name, audio_tensor, sample_rate)
        
        return temp_file.name
        
    except Exception as e:
        print(f"❌ Audio generation error: {e}")
        return None

@app.route('/')
def home():
    status = "✅ Available" if musicgen_available else "❌ Not installed"
    loaded = "✅ Loaded" if model_loaded else "⏳ Will load on first use"
    device = "🚀 GPU" if (musicgen_available and torch.cuda.is_available()) else "💻 CPU"
    
    return f"""
    <h1>🤖 Simple MusicGen TECHNO Generator</h1>
    <p><strong>Status:</strong> {status}</p>
    <p><strong>Model:</strong> {loaded}</p>
    <p><strong>Device:</strong> {device}</p>
    <br>
    <p>POST to /generate: {{"style": "minimal", "prompt": "dark vibes"}}</p>
    <p>Styles: minimal, acid, hard, melodic, dub, industrial</p>
    <br>
    <h3>Setup:</h3>
    <p>pip install transformers torch torchaudio</p>
    """

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'musicgen_available': musicgen_available,
        'model_loaded': model_loaded,
        'gpu_available': musicgen_available and torch.cuda.is_available()
    })

@app.route('/test', methods=['POST'])
def test_api():
    """Test endpoint"""
    if not musicgen_available:
        return jsonify({
            'error': 'MusicGen not available',
            'install': 'pip install transformers torch torchaudio'
        }), 400
    
    return jsonify({
        'success': True,
        'message': 'MusicGen ready for TECHNO generation',
        'model_loaded': model_loaded,
        'device': 'GPU' if torch.cuda.is_available() else 'CPU'
    })

@app.route('/generate', methods=['POST'])
def generate_techno():
    """Generate TECHNO with MusicGen"""
    if not musicgen_available:
        return jsonify({
            'error': 'MusicGen not installed',
            'install': 'Run: pip install transformers torch torchaudio',
            'fallback': 'Use demo_server.py for immediate testing'
        }), 400
    
    try:
        data = request.get_json()
        style = data.get('style', 'minimal')
        user_prompt = data.get('prompt', 'TECHNO')
        duration = min(int(data.get('duration', 15)), 20)  # Max 20 seconds
        
        # Create full prompt
        base_style = TECHNO_STYLES.get(style, TECHNO_STYLES['minimal'])
        full_prompt = f"{base_style}, {user_prompt}"
        
        print(f"🎵 Generating {style} TECHNO...")
        print(f"📝 Prompt: {full_prompt}")
        print(f"⏱ Duration: {duration} seconds")
        
        # Generate audio
        audio_file = generate_audio(full_prompt, duration)
        
        if audio_file and os.path.exists(audio_file):
            # Return file path (in real deployment, you'd serve this or upload to cloud)
            track_id = f'musicgen_{int(time.time())}'
            
            return jsonify({
                'success': True,
                'track': {
                    'id': track_id,
                    'title': f'{style.title()} TECHNO - {user_prompt}',
                    'audio_file': audio_file,  # Local path
                    'style': style,
                    'prompt': full_prompt,
                    'status': 'generated',
                    'duration': f'{duration} seconds',
                    'service': 'MusicGen AI',
                    'note': 'Real AI-generated TECHNO!'
                },
                'message': f'Real {style} TECHNO generated with MusicGen AI!',
                'file_info': {
                    'path': audio_file,
                    'size': os.path.getsize(audio_file) if os.path.exists(audio_file) else 0
                }
            })
        else:
            return jsonify({
                'error': 'Audio generation failed',
                'details': 'MusicGen may need more memory or different settings'
            }), 500
            
    except Exception as e:
        print(f"❌ Generation error: {str(e)}")
        return jsonify({
            'error': f'Generation failed: {str(e)}',
            'type': type(e).__name__
        }), 500

@app.route('/load_model', methods=['POST'])
def load_model():
    """Manually load the model"""
    if not musicgen_available:
        return jsonify({
            'error': 'MusicGen not available - install dependencies first'
        }), 400
    
    if load_musicgen_model():
        return jsonify({
            'success': True,
            'message': 'MusicGen model loaded successfully'
        })
    else:
        return jsonify({
            'error': 'Failed to load MusicGen model'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5006))
    print("🎵 Starting Simple MusicGen TECHNO Generator")
    print(f"📡 Server: http://localhost:{port}")
    print(f"🎛 Styles: {list(TECHNO_STYLES.keys())}")
    print(f"🔧 MusicGen: {'✅ Available' if musicgen_available else '❌ Install dependencies'}")
    
    if not musicgen_available:
        print("\n💡 To enable real AI generation:")
        print("   pip install transformers torch torchaudio")
        print("   (Downloads ~1.5GB model on first use)")
    
    print("=" * 60)
    app.run(host='0.0.0.0', port=port, debug=True)