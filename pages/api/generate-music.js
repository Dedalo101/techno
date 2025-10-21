export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const API_KEY = process.env.UDIO_API_KEY
  if (!API_KEY) {
    return res.status(500).json({ message: 'Server misconfigured: missing Udio API key' })
  }

  try {
    const { prompt } = req.body || {}
    
    // Exact API call as specified in udioapi.pro documentation
    const response = await fetch('https://udioapi.pro/v2/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        "gpt_description_prompt": prompt || "High energy minimal techno track, 20 seconds, driving kick drum, rolling bassline, bright synth stabs, club music",
        "make_instrumental": true,
        "model": "chirp-v3-5"
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Udio API Error:', response.status, errorText)
      return res.status(502).json({ message: `Udio API error: ${response.status} - ${errorText}` })
    }

    const data = await response.json()
    console.log('Udio API Response:', data)

    // If direct audio URL is returned
    if (data.audio_url || data.url) {
      return res.status(200).json({ 
        audioUrl: data.audio_url || data.url,
        success: true 
      })
    }

    // If job ID is returned, poll for completion
    const jobId = data.job_id || data.id
    if (!jobId) {
      return res.status(500).json({ message: 'No audio URL or job ID returned from Udio API' })
    }

    // Poll status endpoint
    const maxAttempts = 30
    let attempts = 0
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
      
      const statusResponse = await fetch(`https://udioapi.pro/v2/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      })

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        
        if (statusData.status === 'completed' && (statusData.audio_url || statusData.url)) {
          return res.status(200).json({ 
            audioUrl: statusData.audio_url || statusData.url,
            success: true 
          })
        }
        
        if (statusData.status === 'failed') {
          return res.status(502).json({ message: 'Track generation failed' })
        }
      }
    }

    return res.status(504).json({ message: 'Generation timed out after polling' })

  } catch (error) {
    console.error('API Handler Error:', error)
    return res.status(500).json({ 
      message: 'Server error: ' + error.message 
    })
  }
}
