import { useCallback, useEffect, useState } from 'react'
import Button from '../components/Button'
import ClickCount from '../components/ClickCount'
import styles from '../styles/home.module.css'

function throwError() {
  console.log(
    // The function body() is not defined
    document.body()
  )
}

// Add this function to handle Udio API call
async function generateThenoMusic() {
  try {
    const response = await fetch('/api/generate-music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'THENO music style, energetic, 20 seconds',
        duration: 20
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to generate music')
    }
    
    const data = await response.json()
    
    // Open the generated audio in a new tab or play it
    if (data.audioUrl) {
      window.open(data.audioUrl, '_blank')
    }
    
    return data
  } catch (error) {
    console.error('Error generating music:', error)
    alert('Failed to generate music. Please try again.')
  }
}

function Home() {
  const [count, setCount] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const increment = useCallback(() => {
    setCount((v) => v + 1)
  }, [setCount])

  const handleGenerateMusic = async () => {
    setIsGenerating(true)
    try {
      await generateThenoMusic()
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    const r = setInterval(() => {
      increment()
    }, 1000)

    return () => {
      clearInterval(r)
    }
  }, [increment])

  return (
    <main className={styles.main}>
      <h1>Fast Refresh Demo</h1>
      <p>
        Fast Refresh is a Next.js feature that gives you instantaneous feedback
        on edits made to your React components, without ever losing component
        state.
      </p>
      <hr className={styles.hr} />
      <div>
        <p>
          Auto incrementing value. The counter won't reset after edits or if
          there are errors.
        </p>
        <p>Current value: {count}</p>
      </div>
      <hr className={styles.hr} />
      <div>
        <p>Component with state.</p>
        <ClickCount />
      </div>
      <hr className={styles.hr} />
      <div>
        <p>Generate a 20-second THENO music track using Udio API.</p>
        <Button
          onClick={handleGenerateMusic}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate THENO Music'}
        </Button>
      </div>
      <hr className={styles.hr} />
      <div>
        <p>
          The button below will throw 2 errors. You'll see the error overlay to
          let you know about the errors but it won't break the page or reset
          your state.
        </p>
        <Button
          onClick={(e) => {
            setTimeout(() => document.parentNode(), 0)
            throwError()
          }}
        >
          Throw an Error
        </Button>
      </div>
      <hr className={styles.hr} />
    </main>
  )
}

export default Home
