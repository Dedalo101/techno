const SUNO_COOKIE = 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3NjEwNTc4MDAsImZ2YSI6WzAsLTFdLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2NsZXJrX2lkIjoidXNlcl8zNE5WbVZsZk5NTFR4UWQ1YWpvbDNZdnFIaE4iLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2VtYWlsIjoiYXp4Y3Z0cmV3QGdtYWlsLmNvbSIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvcGhvbmUiOm51bGwsImlhdCI6MTc2MTA1NDIwMCwiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjhhNDIyYTUzOTdkNDhlZDI5NWZlIiwibmJmIjoxNzYxMDU0MTkwLCJzaWQiOiJzZXNzXzM0TlZtWDhjZUo0SUhsdElxWFJGdHlLZWFmZCIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzROVm1WbGZOTUxUeFFkNWFqb2wzWXZxSGhOIn0.NWjhr7jekVmkw74E0XInhB8dNpgrfWMFSA1Btyevmy0pN2IksvCa0nWumqsl_Gw63yakxbe2LIUKS2jczQCte7I01ItdXRX3MxhTV0G-_INSjtrXsHo1KP9s1VACFm1hZyEPbb3Ldu0j8Bi21k1s1rFTW-2GBepg4nUiRqB9PuuK48s7-IZ2_NpZjvv7_UQ9Y_OckwdgOz851Lt2Qf3CmlKimozp76i0kw1vEnvFOVb6zoPgSmF28Ql2mdylWxzMkO4AwuFkr0RbMv2-F-tSKP9VQtfWF3tyTy7-jqpDQWeCVVU6J5FIt3EU20POZR80hv0UOaQiFqeuTtPiIaXWcg';

class TechnoGenerator {
    constructor() {
        this.quotaCount = 10;
        this.selectedStyle = 'industrial';
        this.isGenerating = false;
        this.init();
    }

    init() {
        this.loadQuota();
        this.checkDailyReset();
        this.setupEventListeners();
        this.updateQuotaDisplay();
    }

    setupEventListeners() {
        // Subgenre selection
        document.querySelectorAll('.subgenre-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.subgenre-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedStyle = e.target.dataset.style;
            });
        });

        // Set default selection
        document.querySelector('.subgenre-btn[data-style="industrial"]').classList.add('active');

        // Generate button
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateTrack();
        });

        // Reset quota button
        document.getElementById('reset-quota').addEventListener('click', () => {
            this.resetQuota();
        });
    }

    loadQuota() {
        const savedQuota = localStorage.getItem('techno-quota');
        if (savedQuota) {
            this.quotaCount = parseInt(savedQuota);
        }
    }

    checkDailyReset() {
        const lastReset = localStorage.getItem('techno-last-reset');
        const today = new Date().toDateString();
        if (lastReset !== today) {
            this.quotaCount = 10;
            localStorage.setItem('techno-quota', '10');
            localStorage.setItem('techno-last-reset', today);
        }
    }

    updateQuotaDisplay() {
        document.getElementById('quota-display').textContent = `Daily quota: ${this.quotaCount}/10`;
    }

    resetQuota() {
        this.quotaCount = 10;
        localStorage.setItem('techno-quota', '10');
        localStorage.setItem('techno-last-reset', new Date().toDateString());
        this.updateQuotaDisplay();
        this.hideError();
    }

    async generateTrack() {
        if (this.isGenerating || this.quotaCount <= 0) {
            this.showError('Daily quota exceeded! Reset or wait for tomorrow.');
            return;
        }
        
        this.startGeneration();
        
        try {
            const prompt = this.createEnhancedPrompt(this.selectedStyle);
            const data = await this.callSunoAPI(prompt);
            this.showResult(data);
            this.updateQuota();
        } catch (error) {
            console.error('Generation error:', error);
            this.showError(`Generation failed: ${error.message}`);
        } finally {
            this.stopGeneration();
        }
    }

    createEnhancedPrompt(style) {
        const prompts = {
            industrial: 'Industrial techno THENO track, heavy distorted kicks, mechanical percussion, dark atmosphere, 128 BPM',
            acid: 'Acid techno THENO track, TB-303 basslines, squelchy synths, hypnotic patterns, 130 BPM',
            minimal: 'Minimal techno THENO track, repetitive loops, subtle progression, deep bass, 124 BPM',
            hardtechno: 'Hard techno THENO track, aggressive kicks, driving bassline, intense energy, 135 BPM',
            detroit: 'Detroit techno THENO track, futuristic sounds, emotional melodies, classic 909 drums, 126 BPM'
        };
        return prompts[style] || prompts.industrial;
    }

    async callSunoAPI(prompt) {
        const response = await fetch('https://suno-api-zeta-wine.vercel.app/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUNO_COOKIE}`
            },
            body: JSON.stringify({
                prompt: prompt,
                make_instrumental: true,
                wait_audio: true
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('No tracks generated');
        }
        
        return data[0];
    }

    showResult(track) {
        if (!track || !track.audio_url) {
            throw new Error('Invalid track data received');
        }

        const resultDiv = document.getElementById('result');
        const trackInfoDiv = document.getElementById('track-info');
        const audioPlayer = document.getElementById('audio-player');
        const audioSource = document.getElementById('audio-source');
        const downloadLink = document.getElementById('download-link');

        trackInfoDiv.innerHTML = `
            <h4>${track.title || 'THENO Track'}</h4>
            <p>Style: ${this.selectedStyle.charAt(0).toUpperCase() + this.selectedStyle.slice(1)}</p>
            <p>Duration: ~20 seconds</p>
        `;

        audioSource.src = track.audio_url;
        audioPlayer.load();
        downloadLink.href = track.audio_url;
        downloadLink.download = `theno-${this.selectedStyle}-${Date.now()}.mp3`;

        resultDiv.classList.remove('hidden');
        this.hideError();
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        document.getElementById('result').classList.add('hidden');
    }

    hideError() {
        document.getElementById('error').classList.add('hidden');
    }

    startGeneration() {
        this.isGenerating = true;
        const btnText = document.getElementById('btn-text');
        const loading = document.getElementById('loading');
        
        btnText.classList.add('hidden');
        loading.classList.remove('hidden');
        document.getElementById('generate-btn').disabled = true;
        
        document.getElementById('result').classList.add('hidden');
        this.hideError();
    }

    stopGeneration() {
        this.isGenerating = false;
        const btnText = document.getElementById('btn-text');
        const loading = document.getElementById('loading');
        
        loading.classList.add('hidden');
        btnText.classList.remove('hidden');
        document.getElementById('generate-btn').disabled = false;
    }

    updateQuota() {
        this.quotaCount--;
        localStorage.setItem('techno-quota', this.quotaCount.toString());
        this.updateQuotaDisplay();
    }
}

// Initialize the generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TechnoGenerator();
});