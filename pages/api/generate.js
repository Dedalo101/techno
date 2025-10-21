import fetch from 'node-fetch'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const API_KEY = process.env.UDIO_API_KEY
  if (!API_KEY) {
    return res.status(500).json({ message: 'Missing UDIO_API_KEY in server environment' })
  }

  try {
    // Step 1: request generation
    const body = {
      gpt_description_prompt: "Minimal high-energy techno, exactly 20 seconds, driving kick, rolling bass, bright synth stabs, 130 BPM",
      make_instrumental: true,
      model: "chirp-v3-5"
    }

    const genRes = await fetch('https://udioapi.pro/v2/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(body)
    })

    const genJson = await genRes.json().catch(() => null)
    if (!genRes.ok) {
      const err = genJson?.message || JSON.stringify(genJson) || genRes.statusText
      return res.status(502).json({ message: `Udio generate error: ${err}` })
    }

    // If API returned direct audio URL, return it
    if (genJson?.audio_url || genJson?.url) {
      return res.status(200).json({ audioUrl: genJson.audio_url || genJson.url })
    }

    // Otherwise expect a job id and poll status
    const jobId = genJson?.job_id || genJson?.id
    if (!jobId) {
      return res.status(500).json({ message: 'No audio_url or job id returned from Udio' })
    }

    // Poll for completion
    const maxAttempts = 30
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // wait between polls
      await new Promise(r => setTimeout(r, 2000))

      const statusRes = await fetch(`https://udioapi.pro/v2/status/${jobId}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      })

      const statusJson = await statusRes.json().catch(() => null)
      if (!statusRes.ok) {
        // continue polling on transient errors
        continue
      }

      if (statusJson?.status === 'completed' && (statusJson.audio_url || statusJson.url)) {
        return res.status(200).json({ audioUrl: statusJson.audio_url || statusJson.url })
      }

      if (statusJson?.status === 'failed') {
        return res.status(502).json({ message: 'Udio job failed' })
      }
    }

    return res.status(504).json({ message: 'Timed out waiting for Udio job' })
  } catch (err) {
    console.error('Udio handler error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}