import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Optimized settings for smaller file size
    const sampleRate = 22050; // Half of 44.1kHz - still good quality
    const duration = 20; // 20 seconds
    const numSamples = sampleRate * duration;
    const bitsPerSample = 8; // 8-bit for smaller size
    const bytesPerSample = bitsPerSample / 8;
    
    // Create smaller WAV buffer
    const buffer = Buffer.alloc(44 + numSamples * bytesPerSample);
    
    // WAV header for 8-bit mono audio
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * bytesPerSample, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM format
    buffer.writeUInt16LE(1, 22); // Mono channel
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
    buffer.writeUInt16LE(bytesPerSample, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * bytesPerSample, 40);
    
    // Generate optimized techno audio
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      
      // Simplified but effective techno sound
      const kick = Math.sin(2 * Math.PI * 50 * t) * Math.exp(-10 * (t % 0.6)) * 0.7;
      const bass = Math.sin(2 * Math.PI * 70 * t + Math.sin(t * 3) * 0.3) * 0.3;
      const hihat = (Math.random() - 0.5) * 0.1 * (Math.floor(t * 8) % 4 === 2 ? 1 : 0);
      const synth = Math.sin(2 * Math.PI * 200 * t) * 0.15 * (Math.sin(t * 0.3) + 1) / 2;
      
      const sample = Math.max(-1, Math.min(1, kick + bass + hihat + synth));
      // Convert to 8-bit unsigned (0-255)
      const intSample = Math.floor((sample + 1) * 127.5);
      buffer.writeUInt8(intSample, 44 + i);
    }
    
    // Create public directory if it doesn't exist
    const publicDir = path.join(process.cwd(), 'public', 'generated');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const filename = `techno-track-${timestamp}.wav`;
    const filepath = path.join(publicDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    
    // Create compact .bat player
    const batContent = `@echo off
title TECHNO Player
cls
echo.
echo  ████████ ███████  ██████ ██   ██ ███    ██  ██████  
echo     ██    ██      ██      ██   ██ ████   ██ ██    ██ 
echo     ██    █████   ██      ███████ ██ ██  ██ ██    ██ 
echo     ██    ██      ██      ██   ██ ██  ██ ██ ██    ██ 
echo     ██    ███████  ██████ ██   ██ ██   ████  ██████  
echo.
echo  Track: ${filename} (${duration}s, ${Math.floor(buffer.length/1024)}KB)
echo  Quality: ${sampleRate}Hz, ${bitsPerSample}-bit
echo.
echo  Press any key to play...
pause >nul
start "" "${filename}"
echo  Playing now! Press any key to exit...
pause >nul
`;
    
    const batFilename = `TECHNO-Player-${timestamp}.bat`;
    const batFilepath = path.join(publicDir, batFilename);
    
    fs.writeFileSync(batFilepath, batContent);
    
    res.status(200).json({
      success: true,
      audioUrl: `/generated/${filename}`,
      exeUrl: `/generated/${batFilename}`,
      duration: duration,
      fileSize: Math.floor(buffer.length / 1024) + 'KB'
    });
    
  } catch (error) {
    console.error('Generation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
