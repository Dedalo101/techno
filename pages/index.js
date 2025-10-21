import { useState } from 'react'

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [status, setStatus] = useState('')

  const generateTechno = async () => {
    setIsGenerating(true)
    setAudioUrl(null)
    setStatus('Starting generation...')
    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Minimal high-energy techno, 20 seconds, driving kick, rolling bass, bright synth stabs'
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Generation failed')
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl)
        setStatus('Ready — listen or download')
      } else {
        setStatus('No audio returned')
      }
    } catch (err) {
      console.error(err)
      setStatus('Error: ' + (err.message || 'unknown'))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="techno-root">
      <section className="card">
        <div className="logo">TECHNO</div>
        <button
          className="neon-btn"
          onClick={generateTechno}
          disabled={isGenerating}
        >
          {isGenerating ? 'GENERATING…' : 'MAKE TECHNO'}
        </button>
        <div className="status">{status}</div>
        {audioUrl && (
          <div className="player">
            <audio controls src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
            <a className="download" href={audioUrl} download="techno-track.mp3">Download</a>
          </div>
        )}
      </section>
    </main>
  )
}
