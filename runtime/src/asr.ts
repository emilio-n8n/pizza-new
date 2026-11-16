import { config, requireKey } from './config'
import { encodeWav } from './audio'

export async function transcribe(pcm: Int16Array): Promise<string> {
  if (!config.groqKey) {
    console.warn('[asr] GROQ_API_KEY absent, transcription ignorée')
    return ''
  }

  const wav = encodeWav(pcm, 8000)
  const form = new FormData()
  form.append(
    'file',
    new Blob([new Uint8Array(wav)], { type: 'audio/wav' }),
    'tour.wav',
  )
  form.append('model', config.groqModel)
  form.append('language', 'fr')
  form.append('response_format', 'json')
  form.append('temperature', '0')

  const response = await fetch(
    'https://api.groq.com/openai/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${requireKey('groqKey')}` },
      body: form,
    },
  )

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Groq ${response.status}: ${detail.slice(0, 240)}`)
  }

  const payload = (await response.json()) as { text?: string }
  return (payload.text ?? '').trim()
}
