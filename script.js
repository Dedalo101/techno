const SUNO_COOKIE = 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yT1o2eU1EZzhscWRKRWloMXJvemY4T3ptZG4iLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJzdW5vLWFwaSIsImF6cCI6Imh0dHBzOi8vc3Vuby5jb20iLCJleHAiOjE3NjEwNTc4MDAsImZ2YSI6WzAsLTFdLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2NsZXJrX2lkIjoidXNlcl8zNE5WbVZsZk5NTFR4UWQ1YWpvbDNZdnFIaE4iLCJodHRwczovL3N1bm8uYWkvY2xhaW1zL2VtYWlsIjoiYXp4Y3Z0cmV3QGdtYWlsLmNvbSIsImh0dHBzOi8vc3Vuby5haS9jbGFpbXMvcGhvbmUiOm51bGwsImlhdCI6MTc2MTA1NDIwMCwiaXNzIjoiaHR0cHM6Ly9jbGVyay5zdW5vLmNvbSIsImp0aSI6IjhhNDIyYTUzOTdkNDhlZDI5NWZlIiwibmJmIjoxNzYxMDU0MTkwLCJzaWQiOiJzZXNzXzM0TlZtWDhjZUo0SUhsdElxWFJGdHlLZWFmZCIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzROVm1WbGZOTUxUeFFkNWFqb2wzWXZxSGhOIn0.NWjhr7jekVmkw74E0XInhB8dNpgrfWMFSA1Btyevmy0pN2IksvCa0nWumqsl_Gw63yakxbe2LIUKS2jczQCte7I01ItdXRX3MxhTV0G-_INSjtrXsHo1KP9s1VACFm1hZyEPbb3Ldu0j8Bi21k1s1rFTW-2GBepg4nUiRqB9PuuK48s7-IZ2_NpZjvv7_UQ9Y_OckwdgOz851Lt2Qf3CmlKimozp76i0kw1vEnvFOVb6zoPgSmF28Ql2mdylWxzMkO4AwuFkr0RbMv2-F-tSKP9VQtfWF3tyTy7-jqpDQWeCVVU6J5FIt3EU20POZR80hv0UOaQiFqeuTtPiIaXWcg';

let quotaCount = 10;
let isGenerating = false;

// Initialize quota on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedQuota = localStorage.getItem('techno-quota');
    if (savedQuota) {
        quotaCount = parseInt(savedQuota);
    }
    checkDailyReset();
    updateQuotaDisplay();
});

function checkDailyReset() {
    const lastReset = localStorage.getItem('techno-last-reset');
    const today = new Date().toDateString();
    if (lastReset !== today) {
        quotaCount = 10;
        localStorage.setItem('techno-quota', '10');
        localStorage.setItem('techno-last-reset', today);
    }
}

function updateQuotaDisplay() {
    document.getElementById('quota-count').textContent = quotaCount;
}

async function generateTrack() {
    if (isGenerating || quotaCount <= 0) {
        document.getElementById('result').innerHTML = '<div style="color:#ff6b6b">Daily quota exceeded!</div>';
        return;
    }
    
    const subgenre = document.getElementById('subgenre').value;
    const prompt = document.getElementById('prompt').value.trim();
    
    if (!prompt) {
        document.getElementById('result').innerHTML = '<div style="color:#ff6b6b">Please enter a prompt</div>';
        return;
    }

    startGeneration();
    
    try {
        const enhancedPrompt = createEnhancedPrompt(subgenre, prompt);
        console.log('Generating with prompt:', enhancedPrompt);
        
        const response = await fetch('https://suno-api-zeta-wine.vercel.app/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUNO_COOKIE}`
            },
            body: JSON.stringify({
                prompt: enhancedPrompt,
                make_instrumental: true,
                wait_audio: true
            })
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('No tracks generated');
        }
        
        showResult(data[0]);
        updateQuota();
        
    } catch (error) {
        console.error('Generation error:', error);
        document.getElementById('result').innerHTML = `<div style="color:#ff6b6b">Generation failed: ${error.message}</div>`;
    } finally {
        stopGeneration();
    }
}

function createEnhancedPrompt(subgenre, userPrompt) {
    const prompts = {
        minimal: `Minimal techno: hypnotic loops, ${userPrompt}`,
        acid: `Acid techno: TB-303 basslines, ${userPrompt}`,
        hard: `Hard techno: aggressive kicks, ${userPrompt}`,
        melodic: `Melodic techno: emotional progressions, ${userPrompt}`,
        dub: `Dub techno: deep reverb, spacious mix, ${userPrompt}`
    };
    return prompts[subgenre] || userPrompt;
}

function showResult(track) {
    if (!track || !track.audio_url) {
        document.getElementById('result').innerHTML = '<div style="color:#ff6b6b">Invalid track data received</div>';
        return;
    }

    document.getElementById('result').innerHTML = `
        <div style="background:#1a1a2e;padding:20px;border-radius:10px;margin:10px 0">
            <h3>🎵 ${track.title || 'Generated Track'}</h3>
            <audio controls style="width:100%;margin:10px 0">
                <source src="${track.audio_url}" type="audio/mpeg">
            </audio>
            <a href="${track.audio_url}" download style="display:block;background:#00ffff;color:#000;padding:10px;text-align:center;border-radius:5px;text-decoration:none;margin:10px 0">Download MP3</a>
        </div>
    `;
}

function startGeneration() {
    isGenerating = true;
    document.querySelector('button').textContent = 'GENERATING...';
    document.querySelector('button').disabled = true;
    document.getElementById('progress').innerHTML = 'Generating track...';
    document.getElementById('result').innerHTML = '';
}

function stopGeneration() {
    isGenerating = false;
    document.querySelector('button').textContent = 'GENERATE';
    document.querySelector('button').disabled = false;
    document.getElementById('progress').innerHTML = '';
}

function updateQuota() {
    quotaCount--;
    localStorage.setItem('techno-quota', quotaCount.toString());
    updateQuotaDisplay();
}