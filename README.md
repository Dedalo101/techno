# 🤖 AI Techno Generator - techno.agg.homes

**FREE GitHub Pages hosted AI techno music generator using Suno-API**

## 🎵 Features

- **12 Techno Subgenres**: Detroit, Minimal, Acid, Dub, Industrial, Hard, Melodic, Ambient, Deep, Hardgroove, Hypnotic, Rave
- **AI-Powered Generation**: Advanced prompts for authentic techno styles
- **Instant Playback**: Built-in audio player with download options
- **Daily Quota System**: 10 free tracks per day (resets automatically)
- **Mobile Responsive**: Works perfectly on all devices
- **No Backend Costs**: Pure client-side, hosted on GitHub Pages

## 🚀 Live Demo

Visit: **[techno.agg.homes](https://techno.agg.homes)**

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **API**: Suno-API (unofficial wrapper)
- **Hosting**: GitHub Pages (100% free)
- **Domain**: Custom domain via GitHub Pages
- **Storage**: LocalStorage for quota tracking

## 📁 Project Structure

```
├── index.html          # Main application page
├── style.css           # Modern dark theme styles
├── script.js           # Suno-API integration & UI logic
├── CNAME              # Custom domain configuration
└── README.md          # Project documentation
```

## 🎯 How It Works

1. **Select Subgenre**: Choose from 12 authentic techno styles
2. **Describe Track**: Enter your creative prompt
3. **Generate**: AI creates a unique 2:30 techno track
4. **Download**: Get high-quality MP3 instantly

## 🔧 Setup Instructions

1. **Fork this repository**
2. **Enable GitHub Pages** in repository settings
3. **Configure custom domain** (optional)
4. **Add Suno-API credentials** (see script.js)

## 💡 Customization

### Adding New Subgenres
Edit the `subgenrePrompts` object in `script.js`:

```javascript
const subgenrePrompts = {
    newstyle: `New Style: your enhanced prompt template, ${userPrompt}`
};
```

### Styling Changes
Modify `style.css` for custom themes:
- Colors: Update CSS custom properties
- Layout: Adjust container and grid styles
- Animations: Modify keyframe animations

### API Integration
Replace the demo API calls in `script.js` with real Suno-API endpoints:

```javascript
async callSunoAPI(prompt) {
    const response = await fetch('https://api.suno.ai/generate', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
        body: JSON.stringify({ prompt })
    });
    return await response.json();
}
```

## 🎨 Design Features

- **Cyberpunk Aesthetic**: Neon colors, glitch effects, dark theme
- **Glassmorphism UI**: Translucent cards with backdrop blur
- **Smooth Animations**: Hover effects, progress bars, fade-ins
- **Responsive Design**: Mobile-first approach
- **Visual Feedback**: Loading states, error handling

## 📊 Quota System

- **Daily Limit**: 10 tracks per user per day
- **Auto Reset**: Quota resets at midnight local time
- **Local Storage**: Tracks usage without backend
- **Visual Indicator**: Real-time quota display

## 🌐 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

## 📄 License

MIT License - Feel free to fork, modify, and distribute!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🎵 Generated Track Examples

The AI generates authentic techno based on subgenre:

- **Minimal**: Hypnotic loops, subtle progression
- **Acid**: TB-303 basslines, psychedelic elements  
- **Hard**: Aggressive kicks, industrial sounds
- **Melodic**: Emotional progressions, uplifting
- **Dub**: Deep reverb, spacious atmospheric mix

## 🔮 Roadmap

- [ ] Real Suno-API integration
- [ ] User accounts and history
- [ ] Advanced audio controls
- [ ] Social sharing features
- [ ] Playlist creation
- [ ] Export to streaming platforms

---

**Made with ❤️ for the techno community**

🎧 **Generate your next underground anthem at [techno.agg.homes](https://techno.agg.homes)**

To run this application:

```
npm run dev
```
