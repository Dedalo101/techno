let currentTrackData = null;
const apiKeyInput = document.getElementById('apiKey');
const modelSelect = document.getElementById('model');
const modeRadios = document.querySelectorAll('input[name="mode"]');
const inspirationMode = document.getElementById('inspirationMode');
const customMode = document.getElementById('customMode');
const descriptionTextarea = document.getElementById('description');
const lyricsTextarea = document.getElementById('lyrics');
const styleInput = document.getElementById('style');
const titleInput = document.getElementById('title');
const instrumentalCheckbox = document.getElementById('instrumental');
const genderSelect = document.getElementById('gender');
const styleWeightSlider = document.getElementById('styleWeight');
const weirdnessSlider = document.getElementById('weirdness');
const audioWeightSlider = document.getElementById('audioWeight');
const generateBtn = document.getElementById('generateBtn');
const statusDiv = document.getElementById('status');
const resultsDiv = document.getElementById('results');

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ff006e', '#8338ec'];
    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particlesContainer.appendChild(particle);
        setTimeout(() => particle.parentNode?.removeChild(particle), 8000);
    }, 200);
}

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    setupEventListeners();
    loadSettings();
});

function setupEventListeners() {
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            inspirationMode.style.display = e.target.value === 'inspiration' ? 'block' : 'none';
            customMode.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
    });
    
    descriptionTextarea.addEventListener('input', () => updateCharCount(descriptionTextarea, 400));
    lyricsTextarea.addEventListener('input', () => updateCharCount(lyricsTextarea, 3000));
    styleWeightSlider.addEventListener('input', (e) => document.getElementById('styleWeightValue').textContent = e.target.value);
    weirdnessSlider.addEventListener('input', (e) => document.getElementById('weirdnessValue').textContent = e.target.value);
    audioWeightSlider.addEventListener('input', (e) => document.getElementById('audioWeightValue').textContent = e.target.value);
    generateBtn.addEventListener('click', generateMusic);
    [apiKeyInput, modelSelect].forEach(el => el.addEventListener('change', saveSettings));
}

function updateCharCount(textarea, maxLength) {
    const current = textarea.value.length;
    const counter = textarea.nextElementSibling;
    counter.textContent = `${current}/${maxLength} characters`;
    counter.style.color = current > maxLength * 0.9 ? '#ff6b6b' : 'rgba(255, 255, 255, 0.6)';
}

function showStatus(message, type = 'info') {
    statusDiv.className = `status ${type}`;
    statusDiv.innerHTML = message;
    statusDiv.style.display = 'block';
}

async function generateMusic() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) return showStatus('❌ Please enter your Udio API key', 'error');

    const mode = document.querySelector('input[name="mode"]:checked').value;
    let requestBody = {
        model: modelSelect.value,
        make_instrumental: instrumentalCheckbox.checked,
        style_weight: parseFloat(styleWeightSlider.value),
        weirdness_constraint: parseFloat(weirdnessSlider.value),
        audio_weight: parseFloat(audioWeightSlider.value)
    };

    if (genderSelect.value) requestBody.gender = genderSelect.value;

    if (mode === 'inspiration') {
        const description = descriptionTextarea.value.trim();
        if (!description) return showStatus('❌ Please enter a music description', 'error');
        requestBody.gpt_description_prompt = description;
    } else {
        const lyrics = lyricsTextarea.value.trim();
        if (!lyrics) return showStatus('❌ Please enter lyrics or a detailed prompt', 'error');
        requestBody.prompt = lyrics;
        if (styleInput.value.trim()) requestBody.style = styleInput.value.trim();
        if (titleInput.value.trim()) requestBody.title = titleInput.value.trim();
    }

    try {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '🎧 Generating...';
        showStatus('🎵 Creating your music...', 'loading');

        const response = await fetch('https://udioapi.pro/api/v2/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        
        if (result.code === 200) {
            showStatus('✅ Music generation started!', 'success');
            displayResult(result);
        } else {
            throw new Error(result.message || 'Generation failed');
        }
    } catch (error) {
        showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '🎵 Generate Music';
    }
}

function displayResult(result) {
    resultsDiv.innerHTML = `
        <div class="result-item">
            <h4>🎵 Generation Started</h4>
            <p><strong>Task ID:</strong> ${result.data.task_id}</p>
            <p><strong>Work ID:</strong> ${result.workId}</p>
            <p><strong>Status:</strong> Processing</p>
            <p><strong>Model:</strong> ${modelSelect.value}</p>
            <div class="result-actions">
                <button onclick="window.open('https://udioapi.pro/dashboard', '_blank')" class="action-btn">📊 Dashboard</button>
                <button onclick="navigator.clipboard.writeText('${result.data.task_id}')" class="action-btn">📋 Copy ID</button>
            </div>
        </div>
    ` + resultsDiv.innerHTML;
}

function saveSettings() {
    localStorage.setItem('udioSettings', JSON.stringify({
        apiKey: apiKeyInput.value,
        model: modelSelect.value
    }));
}

function loadSettings() {
    const saved = localStorage.getItem('udioSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        apiKeyInput.value = settings.apiKey || '';
        modelSelect.value = settings.model || 'chirp-v4-5';
    }
}
