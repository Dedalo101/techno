#!/usr/bin/env python3
"""
MusicGen AI TECHNO Generator Server
Using Meta's MusicGen model for local generation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torchaudio
from transformers import AutoTokenizer, MusicgenForConditionalGeneration
import tempfile
import os
import time

app = Flask(__name__)
CORS(app)

# Global model variables
model = None
tokenizer = None
model_loaded = False

# TECHNO-specific prompts optimized for MusicGen
TECHNO_STYLES = {
    'minimal': 'minimal techno with repetitive 4/4 beats, deep bass, hypnotic loops, 128 BPM',
    'acid': 'acid techno with TB-303 style bass, squelchy sounds, driving rhythm, 132 BPM',
    'hard': 'hard techno with aggressive kicks, distorted elements, fast tempo, 140 BPM',
    'melodic': 'melodic techno with uplifting synths, emotional chords, progressive structure, 125 BPM',
    'dub': 'dub techno with deep reverb, spacious mix, echo effects, minimalist approach, 120 BPM',
    'industrial': 'industrial techno with mechanical sounds, harsh textures, metallic percussion, 135 BPM'
}

def load_model():
    """Load MusicGen model (this will download ~1.5GB first time)"""
    global model, tokenizer, model_loaded
    
    if model_loaded:
        return True
    
    try:
        print("🔄 Loading MusicGen model (this may take a few minutes first time)...")
        
        # Use smaller model for faster loading/generation
        model_name = "facebook/musicgen-small"  # ~1.5GB vs ~3.3GB for medium
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = MusicgenForConditionalGeneration.from_pretrained(model_name)
        
        # Move to GPU if available
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = model.to(device)
        
        model_loaded = True
        print(f"✅ MusicGen model loaded on {device}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return False

def generate_techno_audio(prompt, duration=20):
    """Generate TECHNO audio using MusicGen"""
    try:
        if not model_loaded:
            if not load_model():
                return None
        
        print(f"🎵 Generating audio for: {prompt}")
        
        # Tokenize the prompt
        inputs = tokenizer(prompt, return_tensors="pt", padding=True)
        
        # Move inputs to same device as model
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Generate audio
        with torch.no_grad():
            audio_values = model.generate(
                **inputs,
                max_new_tokens=duration * 50,  # Approximate tokens per second
                do_sample=True,
                guidance_scale=3.0,
            )
        
        # Convert to numpy and save as temporary file
        audio_values = audio_values.cpu().numpy().squeeze()
        
        # Create temporary audio file
        temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        sample_rate = model.config.audio_encoder.sample_rate
        
        torchaudio.save(
            temp_file.name,
            torch.from_numpy(audio_values).unsqueeze(0),
            sample_rate
        )
        
        return temp_file.name
        
    except Exception as e:
        print(f"❌ Audio generation error: {e}")
        return None

def create_techno_prompt(style, user_input):
    """Create optimized TECHNO prompt for MusicGen"""
    base_style = TECHNO_STYLES.get(style, TECHNO_STYLES['minimal'])
    return f"{base_style}, {user_input}, electronic dance music, instrumental, professional production"

@app.route('/')
def home():
    return f"""
    <h1>🤖 MusicGen TECHNO Generator</h1>
    <p>POST to /generate with JSON: {{"style": "minimal", "prompt": "dark warehouse vibes"}}</p>
    <p>Styles: minimal, acid, hard, melodic, dub, industrial</p>
    <p>Model loaded: {'✅ Yes' if model_loaded else '❌ No - will load on first generation'}</p>
    <p>Device: {'🚀 GPU' if torch.cuda.is_available() else '💻 CPU'}</p>
    """

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy', 
        'service': 'musicgen-techno-generator',
        'model_loaded': model_loaded,
        'gpu_available': torch.cuda.is_available()
    })

@app.route('/load_model', methods=['POST'])
def load_model_endpoint():
    """Manually trigger model loading"""
    try:
        if load_model():
            return jsonify({
                'success': True,
                'message': 'MusicGen model loaded successfully',
                'device': 'GPU' if torch.cuda.is_available() else 'CPU'
            })
        else:
            return jsonify({'error': 'Failed to load model'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/test', methods=['POST'])
def test_api():
    """Test endpoint"""
    try:
        data = request.get_json()
        
        return jsonify({
            'success': True,
            'message': 'MusicGen API test ready',
            'model_loaded': model_loaded,
            'device': 'GPU' if torch.cuda.is_available() else 'CPU'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate_techno():
    """Generate real TECHNO track using MusicGen"""
    try:
        data = request.get_json()
        
        style = data.get('style', 'minimal')
        user_prompt = data.get('prompt', 'TECHNO')
        duration = min(int(data.get('duration', 20)), 30)  # Max 30 seconds
        
        # Create TECHNO-optimized prompt
        full_prompt = create_techno_prompt(style, user_prompt)
        
        print(f"🎵 Generating {style} TECHNO with MusicGen...")
        print(f"📝 Prompt: {full_prompt}")
        print(f"⏱ Duration: {duration} seconds")
        
        # Generate audio
        audio_file = generate_techno_audio(full_prompt, duration)
        
        if audio_file and os.path.exists(audio_file):
            # In a real implementation, you'd serve this file or upload to cloud storage
            # For now, just return success with file path
            track_id = f'musicgen_{int(time.time())}'
            
            return jsonify({
                'success': True,
                'track': {
                    'id': track_id,
                    'title': f'{style.title()} TECHNO - {user_prompt}',
                    'audio_file': audio_file,  # Local file path
                    'style': style,
                    'prompt': full_prompt,
                    'status': 'generated',
                    'duration': duration,
                    'model': 'musicgen-small'
                },
                'message': f'Real {style} TECHNO generated with MusicGen!',
                'note': 'Audio file generated locally - implement file serving for web access'
            })
        else:
            return jsonify({
                'error': 'Audio generation failed',
                'details': 'MusicGen model may need more memory or different settings',
                'prompt': full_prompt
            }), 500
            
    except Exception as e:
        print(f"❌ Generation error: {str(e)}")
        return jsonify({
            'error': f'Generation failed: {str(e)}',
            'type': type(e).__name__,
            'details': 'Check system requirements and model loading'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5003))
    print("🎵 Starting MusicGen TECHNO Generator")
    print(f"📡 Server: http://localhost:{port}")
    print("🎛 Styles:", list(TECHNO_STYLES.keys()))
    print("🔄 Note: Model will auto-load on first generation")
    print("💾 First run downloads ~1.5GB MusicGen model")
    print("🚀 GPU recommended for faster generation")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=True)