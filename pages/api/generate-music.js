export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt } = req.body

    // Using the correct Udio API endpoint
    const response = await fetch('https://udioapi.pro/api/v2/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.UDIO_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'chirp-v5',
        gpt_description_prompt: prompt || 'THENO music style, energetic, 20 seconds'
      })
    })

    if (!response.ok) {
      throw new Error(`Udio API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    res.status(200).json({
      success: true,
      audioUrl: data.audio_url || data.url,
      trackId: data.id,
      data: data,
      message: 'Music generated successfully'
    })

  } catch (error) {
    console.error('Error calling Udio API:', error)
    res.status(500).json({ 
      error: 'Failed to generate music',
      message: error.message 
    })
  }
}