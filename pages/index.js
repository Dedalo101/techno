import { useState } from 'react'
import '../styles/globals.css'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [audioUrl, setAudioUrl] = useState('')

  const generate = async () => {
    setLoading(true)
    setStatus('Requesting generation…')
    setAudioUrl('')
    try {
      const res = await fetch('/api/generate', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Generation failed')
      setAudioUrl(json.audioUrl)
      setStatus(json.audioUrl ? 'Ready — listen or download' : 'Generation started')
    } catch (err) {
      setStatus('Error: ' + (err.message || 'unknown'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="techno-root" role="main">
      <section className="card" aria-labelledby="title">
        <h1 id="title" className="logo" aria-hidden>TECHNO</h1>

        <button
          className="neon-btn"
          onClick={generate}
          disabled={loading}
          aria-busy={loading}
          aria-label="Generate a twenty second techno track"
        >
          {loading ? 'GENERATING…' : 'MAKE TECHNO'}
        </button>

        <div className="status" role="status" aria-live="polite">{status}</div>

        {audioUrl && (
          <div className="player">
            <audio controls src={audioUrl} />
            <a className="download" href={audioUrl} download="techno-track.mp3">Download</a>
          </div>
        )}
      </section>
    </main>
  )
}