// AI Techno Generator - Suno API Integration
class TechnoGenerator {
    constructor() {
        this.quotaCount = 10;
        this.isGenerating = false;
        this.init();
    }

    init() {
        // Update quota display
        document.getElementById('quota-count').textContent = this.quotaCount;
        
        // Load saved quota from localStorage
        const savedQuota = localStorage.getItem('techno-quota');
        if (savedQuota) {
            this.quotaCount = parseInt(savedQuota);
            document.getElementById('quota-count').textContent = this.quotaCount;
        }

        // Reset quota daily
        this.checkDailyReset();
    }

    checkDailyReset() {
        const lastReset = localStorage.getItem('techno-last-reset');
        const today = new Date().toDateString();
        
        if (lastReset !== today) {
            this.quotaCount = 10;
            localStorage.setItem('techno-quota', '10');
            localStorage.setItem('techno-last-reset', today);
            document.getElementById('quota-count').textContent = this.quotaCount;
        }
    }

    async generateTrack() {
        if (this.isGenerating) return;
        if (this.quotaCount <= 0) {
            this.showError('Daily quota reached! Come back tomorrow for more tracks.');
            return;
        }

        const subgenre = document.getElementById('subgenre').value;
        const prompt = document.getElementById('prompt').value.trim();

        if (!subgenre) {
            this.showError('Please select a techno subgenre');
            return;
        }

        if (!prompt) {
            this.showError('Please describe your track');
            return;
        }

        this.startGeneration();

        try {
            // Create enhanced prompt based on subgenre
            const enhancedPrompt = this.createEnhancedPrompt(subgenre, prompt);
            
            // Call Suno API
            await this.callSunoAPI(enhancedPrompt);
            
        } catch (error) {
            console.error('Generation error:', error);
            this.showError(error.message || 'Failed to generate track. Please try again.');
        } finally {
            this.stopGeneration();
        }
    }

    createEnhancedPrompt(subgenre, userPrompt) {
        const subgenrePrompts = {
            minimal: `Minimal techno: stripped-down, hypnotic, repetitive beats, subtle progression, ${userPrompt}`,
            acid: `Acid techno: TB-303 basslines, squelchy acid sounds, driving 4/4 beats, psychedelic, ${userPrompt}`,
            hard: `Hard techno: aggressive kicks, fast BPM (140-150), industrial sounds, relentless energy, ${userPrompt}`,
            melodic: `Melodic techno: emotional progressions, atmospheric pads, uplifting melodies, deep basslines, ${userPrompt}`,
            dub: `Dub techno: deep reverb, echo delays, atmospheric, spacious mix, Berlin sound, ${userPrompt}`,
            detroit: `Detroit techno: futuristic, mechanical precision, synth stabs, original techno soul, ${userPrompt}`,
            industrial: `Industrial techno: harsh textures, metallic percussion, dark atmosphere, mechanical rhythms, ${userPrompt}`,
            ambient: `Ambient techno: atmospheric pads, subtle beats, ethereal soundscapes, meditative, ${userPrompt}`,
            deep: `Deep techno: underground vibe, rolling basslines, dark atmosphere, hypnotic grooves, ${userPrompt}`,
            hardgroove: `Hardgroove techno: percussive elements, tribal rhythms, groove-focused, driving energy, ${userPrompt}`,
            hypnotic: `Hypnotic techno: repetitive patterns, trance-inducing, mesmerizing loops, mental journey, ${userPrompt}`,
            rave: `Rave techno: classic 90s energy, piano stabs, euphoric breakdowns, hands-up moments, ${userPrompt}`
        };

        return subgenrePrompts[subgenre] || `Techno: ${userPrompt}`;
    }

    async callSunoAPI(prompt) {
        // For demo purposes, we'll simulate the API call
        // In production, you would use the actual Suno API
        
        this.showProgress('Connecting to Suno AI...');
        await this.delay(2000);
        
        this.showProgress('Generating your techno track...');
        await this.delay(8000);
        
        this.showProgress('Processing audio...');
        await this.delay(5000);
        
        this.showProgress('Finalizing track...');
        await this.delay(3000);

        // Simulate successful generation
        const mockTrack = {
            id: Math.random().toString(36).substr(2, 9),
            title: this.generateTrackTitle(),
            prompt: prompt,
            duration: '02:30',
            audio_url: this.createDemoAudio(), // This would be the real audio URL from Suno
            created_at: new Date().toISOString()
        };

        this.showResult(mockTrack);
        this.updateQuota();
    }

    generateTrackTitle() {
        const titles = [
            'Neon Pulse', 'Warehouse Echo', 'Digital Dreams', 'Midnight Circuit',
            'Cyber Rhythm', 'Electric Underground', 'Synthetic Storm', 'Bass Division',
            'Techno Cathedral', 'Machine Heart', 'Future Shock', 'Binary Beat',
            'Chrome Resonance', 'Voltage Drop', 'Data Stream', 'Neural Network'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    }

    createDemoAudio() {
        // Create a simple demo audio element with a placeholder
        // In production, this would be the actual audio URL from Suno API
        return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgk';
    }

    showProgress(message) {
        const progressEl = document.getElementById('progress');
        const resultEl = document.getElementById('result');
        
        progressEl.classList.remove('hidden');
        progressEl.classList.add('active');
        resultEl.innerHTML = `<div class="loading">${message}</div>`;
        resultEl.classList.add('show');
    }

    showResult(track) {
        const resultEl = document.getElementById('result');
        const progressEl = document.getElementById('progress');
        
        progressEl.classList.add('hidden');
        progressEl.classList.remove('active');
        
        resultEl.innerHTML = `
            <div class="track-info">
                <h3>🎵 ${track.title}</h3>
                <p><strong>Prompt:</strong> ${track.prompt}</p>
                <p><strong>Duration:</strong> ${track.duration}</p>
                <p><strong>Generated:</strong> ${new Date(track.created_at).toLocaleString()}</p>
            </div>
            <audio class="audio-player" controls>
                <source src="${track.audio_url}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
            <a href="${track.audio_url}" class="download-btn" download="${track.title}.mp3">
                📥 Download MP3
            </a>
        `;
        
        resultEl.classList.add('show');
    }

    showError(message) {
        const resultEl = document.getElementById('result');
        const progressEl = document.getElementById('progress');
        
        progressEl.classList.add('hidden');
        progressEl.classList.remove('active');
        
        resultEl.innerHTML = `<div class="error">❌ ${message}</div>`;
        resultEl.classList.add('show');
    }

    startGeneration() {
        this.isGenerating = true;
        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.textContent = 'GENERATING...';
        
        // Hide previous results
        document.getElementById('result').classList.remove('show');
    }

    stopGeneration() {
        this.isGenerating = false;
        const btn = document.getElementById('generateBtn');
        btn.disabled = false;
        btn.textContent = 'GENERATE TRACK';
    }

    updateQuota() {
        this.quotaCount--;
        localStorage.setItem('techno-quota', this.quotaCount.toString());
        document.getElementById('quota-count').textContent = this.quotaCount;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the generator
const generator = new TechnoGenerator();

// Global function for the onclick handler
function generateTrack() {
    generator.generateTrack();
}

// Handle form submission with Enter key
document.getElementById('prompt').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generateTrack();
    }
});

// Add some UI enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add typing effect to placeholder
    const promptInput = document.getElementById('prompt');
    const placeholders = [
        'Dark warehouse, 130 BPM, driving bassline...',
        'Underground rave, acid synths, euphoric...',
        'Minimal loops, hypnotic rhythm, deep...',
        'Industrial sounds, mechanical beats...',
        'Melodic progressions, emotional journey...'
    ];
    
    let placeholderIndex = 0;
    setInterval(() => {
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        promptInput.placeholder = placeholders[placeholderIndex];
    }, 3000);
    
    // Add visual feedback for interactions
    const inputs = document.querySelectorAll('input, select, button');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// Console welcome message
console.log(`
🤖 AI TECHNO GENERATOR
━━━━━━━━━━━━━━━━━━━━━━━━
Welcome to the future of techno!
Generate unlimited AI tracks at techno.agg.homes
━━━━━━━━━━━━━━━━━━━━━━━━
`);