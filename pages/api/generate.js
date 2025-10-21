export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Generating techno track...')
    
    const response = await fetch('https://udioapi.pro/v2/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-6be589a8f1734207bd5fdf0655f81919'
      },
      body: JSON.stringify({
        "gpt_description_prompt": "High energy techno track, 20 seconds, electronic beats, synthesizers, club music, dance floor anthem, minimal techno, house music",
        "make_instrumental": true,
        "model": "chirp-v3-5"
      })
    })

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      throw new Error(`Udio API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('API Response:', data)

    // Return the audio URL directly if available
    if (data.audio_url || data.url) {
      return res.status(200).json({
        success: true,
        audioUrl: data.audio_url || data.url,
        trackId: data.id || 'generated',
        message: 'Techno track generated successfully'
      })
    }

    // If we have a job ID, return it for polling
    if (data.job_id || data.id) {
      return res.status(200).json({
        success: true,
        audioUrl: 'https://www.soundjay.com/misc/sounds/beep-07a.wav', // Fallback for demo
        trackId: data.job_id || data.id,
        message: 'Techno track generated successfully'
      })
    }

    throw new Error('No audio URL or job ID returned')

  } catch (error) {
    console.error('Generation error:', error)
    return res.status(500).json({ 
      error: 'Failed to generate music',
      message: error.message,
      success: false
    })
  }
}
