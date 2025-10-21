import { useState } from 'react'

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [progress, setProgress] = useState('')

  const generateTechno = async () => {
    setIsGenerating(true)
    setProgress('Generating your techno track...')
    setAudioUrl(null)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.audioUrl) {
        setAudioUrl(data.audioUrl)
        setProgress('🎵 Your techno track is ready!')
      } else {
        throw new Error(data.message || 'Failed to generate track')
      }
    } catch (error) {
      console.error('Error:', error)
      setProgress(`❌ Error: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ 
        fontSize: '4rem', 
        marginBottom: '2rem', 
        color: '#00ff00',
        textShadow: '0 0 20px #00ff00',
        textAlign: 'center'
      }}>
        TECHNO
      </h1>
      
      <button
        onClick={generateTechno}
        disabled={isGenerating}
        style={{
          fontSize: '2rem',
          padding: '20px 40px',
          backgroundColor: isGenerating ? '#333' : '#ff0080',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          marginBottom: '2rem',
          transition: 'all 0.3s',
          boxShadow: isGenerating ? 'none' : '0 0 20px #ff0080'
        }}
      >
        {isGenerating ? 'GENERATING...' : 'GENERATE TECHNO'}
      </button>

      {progress && (
        <p style={{ 
          fontSize: '1.2rem', 
          color: isGenerating ? '#ffff00' : '#00ff00',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {progress}
        </p>
      )}

      {audioUrl && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <audio 
            controls 
            autoPlay
            style={{ 
              marginBottom: '1rem',
              width: '300px'
            }}
          >
            <source src={audioUrl} type="audio/mpeg" />
          </audio>
          <br />
          <a 
            href={audioUrl} 
            download="techno-track.mp3"
            style={{ 
              color: '#00ff00', 
              fontSize: '1.2rem',
              textDecoration: 'none',
              border: '2px solid #00ff00',
              padding: '10px 20px',
              borderRadius: '5px',
              display: 'inline-block',
              marginTop: '10px'
            }}
          >
            ⬇ DOWNLOAD
          </a>
        </div>
      )}
    </div>
  )
}
