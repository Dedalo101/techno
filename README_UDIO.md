# 🤖 AI TECHNO Generator

A simple web interface for generating TECHNO music using Udio AI API.

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python udio_server.py
```

### 3. Open the Interface
- Local testing: Open `index_udio.html` in your browser
- GitHub Pages: Visit https://techno.agg.homes

### 4. Get Udio API Key
1. Go to [udio.com](https://udio.com)
2. Open Developer Tools (F12)
3. Go to Application → Cookies
4. Copy the `sb-api-auth-token` value
5. Enter it in the API Settings

## TECHNO Styles

- **🔄 Minimal**: Hypnotic loops, stripped-down beats
- **🧪 Acid**: TB-303 basslines, squelchy sounds
- **⚡ Hard**: Aggressive kicks, fast BPM
- **🎹 Melodic**: Emotional progressions, uplifting synths
- **🌊 Dub**: Deep reverb, spacious mix
- **🏭 Industrial**: Mechanical sounds, heavy distortion

## Features

- ✅ Multiple TECHNO subgenres
- ✅ Udio API integration
- ✅ Local Python server
- ✅ Terminal-style UI
- ✅ Direct audio playback
- ✅ Track download

## Architecture

```
Frontend (HTML/CSS/JS) → Python Server → Udio API
```

The Python server handles Udio API authentication and CORS issues that would occur with direct browser requests.

## Troubleshooting

**Server not starting?**
```bash
pip install flask flask-cors udio_wrapper
python udio_server.py
```

**API not working?**
- Check your Udio API token
- Make sure you have an active Udio account
- Try refreshing the token from udio.com

**CORS errors?**
- Use the Python server instead of direct API calls
- The server runs on `http://localhost:5000` by default

## Development

To modify TECHNO generation parameters, edit the `TECHNO_STYLES` dictionary in `udio_server.py`.

## License

Open source - Feel free to modify and distribute.

---

🎵 **Made for TECHNO lovers** 🎵