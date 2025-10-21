const SUNO_COOKIE = 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3NjEwNTc4MDAsImZ2YSI6WzAsLTFdLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2NsZXJrX2lkIjoidXNlcl8zNE5WbVZsZk5NTFR4UWQ1YWpvbDNZdnFIaE4iLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2VtYWlsIjoiYXp4Y3Z0cmV3QGdtYWlsLmNvbSIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvcGhvbmUiOm51bGwsImlhdCI6MTc2MTA1NDIwMCwiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjhhNDIyYTUzOTdkNDhlZDI5NWZlIiwibmJmIjoxNzYxMDU0MTkwLCJzaWQiOiJzZXNzXzM0TlZtWDhjZUo0SUhsdElxWFJGdHlLZWFmZCIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzROVm1WbGZOTUxUeFFkNWFqb2wzWXZxSGhOIn0.NWjhr7jekVmkw74E0XInhB8dNpgrfWMFSA1Btyevmy0pN2IksvCa0nWumqsl_Gw63yakxbe2LIUKS2jczQCte7I01ItdXRX3MxhTV0G-_INSjtrXsHo1KP9s1VACFm1hZyEPbb3Ldu0j8Bi21k1s1rFTW-2GBepg4nUiRqB9PuuK48s7-IZ2_NpZjvv7_UQ9Y_OckwdgOz851Lt2Qf3CmlKimozp76i0kw1vEnvFOVb6zoPgSmF28Ql2mdylWxzMkO4AwuFkr0RbMv2-F-tSKP9VQtfWF3tyTy7-jqpDQWeCVVU6J5FIt3EU20POZR80hv0UOaQiFqeuTtPiIaXWcg';

class TechnoGenerator {
    constructor() {
        this.quotaCount = 10;
        this.isGenerating = false;
        this.init();
    }

    init() {
        document.getElementById('quota-count').textContent = this.quotaCount;
        const savedQuota = localStorage.getItem('techno-quota');
        if (savedQuota) {
            this.quotaCount = parseInt(savedQuota);
            document.getElementById('quota-count').textContent = this.quotaCount;
        }
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
        if (this.isGenerating || this.quotaCount <= 0) return;
        
        const subgenre = document.getElementById('subgenre').value;
        const prompt = document.getElementById('prompt').value.trim();
        
        if (!prompt) {
            alert('Please describe your track');
            return;
        }

        this.startGeneration();
        
        try {
            const enhancedPrompt = this.createEnhancedPrompt(subgenre, prompt);
            await this.callSunoAPI(enhancedPrompt);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.stopGeneration();
        }
    }

    createEnhancedPrompt(subgenre, userPrompt) {
        const prompts = {
            minimal: `Minimal techno: hypnotic loops, ${userPrompt}`,
            acid: `Acid techno: TB-303 basslines, ${userPrompt}`,
            hard: `Hard techno: aggressive kicks, ${userPrompt}`,
            melodic: `Melodic techno: emotional progressions, ${userPrompt}`,
            dub: `Dub techno: deep reverb, spacious mix, ${userPrompt}`
        };
        return prompts[subgenre] || userPrompt;
    }

    async callSunoAPI(prompt) {
        document.getElementById('progress').innerHTML = 'Generating...';
        
        const response = await fetch('https://suno-api-zeta-wine.vercel.app/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUNO_COOKIE}`
            },
            body: JSON.stringify({
                prompt: prompt,
                make_instrumental: false,
                wait_audio: true
            })
        });

        if (!response.ok) throw new Error('Generation failed');
        
        const data = await response.json();
        this.showResult(data);
        this.updateQuota();
    }

    showResult(data) {
        document.getElementById('progress').innerHTML = '';
        const result = document.getElementById('result');
        
        if (data[0] && data[0].audio_url) {
            result.innerHTML = `
                <div style="background:#1a1a2e;padding:20px;border-radius:10px;margin:10px 0">
                    <h3>🎵 ${data[0].title || 'Generated Track'}</h3>
                    <audio controls style="width:100%;margin:10px 0">
                        <source src="${data[0].audio_url}" type="audio/mpeg">
                    </audio>
                    <a href="${data[0].audio_url}" download style="display:block;background:#00ffff;color:#000;padding:10px;text-align:center;border-radius:5px;text-decoration:none;margin:10px 0">Download MP3</a>
                </div>
            `;
        } else {
            result.innerHTML = '<div style="color:#ff6b6b">Generation failed. Try again.</div>';
        }
    }

    showError(message) {
        document.getElementById('progress').innerHTML = '';
        document.getElementById('result').innerHTML = `<div style="color:#ff6b6b">${message}</div>`;
    }

    startGeneration() {
        this.isGenerating = true;
        document.querySelector('button').textContent = 'GENERATING...';
        document.querySelector('button').disabled = true;
    }

    stopGeneration() {
        this.isGenerating = false;
        document.querySelector('button').textContent = 'GENERATE';
        document.querySelector('button').disabled = false;
    }

    updateQuota() {
        this.quotaCount--;
        localStorage.setItem('techno-quota', this.quotaCount.toString());
        document.getElementById('quota-count').textContent = this.quotaCount;
    }
}

const generator = new TechnoGenerator();

function generateTrack() {
    generator.generateTrack();
}