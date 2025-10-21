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
      <h1 className="visually-hidden">Techno generator</h1>

      <section className="card" aria-labelledby="techno-title">
        <div id="techno-title" className="logo" aria-hidden>TECHNO</div>

        <button
          className="neon-btn"
          onClick={generateTechno}
          disabled={isGenerating}
          aria-busy={isGenerating}
          aria-label="Generate twenty second techno track"
        >
          {isGenerating ? 'GENERATING…' : 'MAKE TECHNO'}
        </button>

        <div className="status" role="status" aria-live="polite">{status}</div>

        {audioUrl && (
          <div className="player">
            <audio controls src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
            <a className="download" href={audioUrl} download="techno-track.mp3">Download</a>
          </div>
        )}
      </section>

      <style jsx global>{`
        :root{
          --bg:#05050a;
          --card:#071019;
          --accent:#00ff99;
          --neon:#ff0077;
          --muted:#6b6b6b;
          --glass: rgba(255,255,255,0.04);
          --radius:14px;
        }

        *{box-sizing:border-box}
        html,body,#__next{height:100%}
        body{
          margin:0;
          font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          background: radial-gradient(ellipse at top, #071018 0%, var(--bg) 40%);
          color:#fff;
          -webkit-font-smoothing:antialiased;
          line-height:1.3;
        }

        .visually-hidden{position:absolute!important;height:1px;width:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);white-space:nowrap}

        .techno-root{display:flex;height:100vh;align-items:center;justify-content:center;padding:20px}
        .card{
          width:min(720px,92vw);
          background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
          border-radius:var(--radius);
          padding:48px;
          display:flex;
          align-items:center;
          flex-direction:column;
          gap:18px;
          box-shadow:0 10px 40px rgba(0,0,0,0.6);
          border:1px solid rgba(255,255,255,0.03);
        }

        .logo{
          font-weight:800;
          font-size:2.8rem;
          letter-spacing:0.15em;
          color:var(--accent);
          text-shadow:0 0 18px rgba(0,255,153,0.12),0 0 36px rgba(255,0,119,0.04);
        }

        .neon-btn{
          appearance:none;
          border:0;
          padding:18px 48px;
          border-radius:10px;
          background: linear-gradient(90deg, var(--neon), #7f00ff);
          color:#fff;
          font-weight:700;
          font-size:1.25rem;
          cursor:pointer;
          box-shadow:0 6px 30px rgba(255,0,119,0.18), 0 0 40px rgba(0,255,153,0.04) inset;
          transition: transform .12s ease, box-shadow .12s ease, filter .12s;
        }
        .neon-btn:active{transform:translateY(1px) scale(.998)}
        .neon-btn:disabled{opacity:.6;filter:grayscale(.2);cursor:wait}

        .status{font-size:.95rem;color:var(--muted);min-height:1.2em}

        .player{display:flex;gap:12px;align-items:center;flex-direction:column}
        .download{color:var(--accent);text-decoration:none;border:1px solid rgba(0,255,153,0.12);padding:8px 14px;border-radius:8px}
        a.download:focus, .neon-btn:focus {outline:3px solid rgba(0,255,153,0.12);outline-offset:4px}

        @media (max-width:520px){
          .card{padding:28px}
          .logo{font-size:2rem}
          .neon-btn{padding:14px 30px;font-size:1.05rem}
        }
      `}</style>
    </main>
  )
}
