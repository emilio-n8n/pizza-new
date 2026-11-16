import { createHash } from 'node:crypto'

import { config, requireKey } from './config'
import { pcm16LeToSamples, pcm16ToMulaw, resample } from './audio'

function splitText(text: string, max = 900): string[] {
  if (text.length <= max) return [text]
  const sentences = text.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ''
  for (const sentence of sentences) {
    if ((current + sentence).length > max && current) {
      chunks.push(current.trim())
      current = ''
    }
    current += `${sentence} `
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

let nextAllowedAt = 0

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function throttle() {
  const now = Date.now()
  const waitFor = Math.max(0, nextAllowedAt - now)
  nextAllowedAt = Math.max(now, nextAllowedAt) + config.ttsIntervalMs
  if (waitFor > 0) await wait(waitFor)
}

async function synthesizeChunk(
  text: string,
  attempt = 0,
  retries = 4,
  timeoutMs = 60000,
): Promise<Buffer> {
  const key = requireKey('geminiKey')
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiTtsModel}:generateContent?key=${key}`

  await throttle()

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: config.ttsVoice },
          },
        },
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text()

    if ((response.status === 429 || response.status >= 500) && attempt < retries) {
      const backoff = 10000 * (attempt + 1)
      console.warn(
        `[tts] ${response.status}, nouvelle tentative dans ${backoff / 1000}s`,
      )
      await wait(backoff)
      return synthesizeChunk(text, attempt + 1, retries, timeoutMs)
    }

    throw new Error(`Gemini TTS ${response.status}: ${detail.slice(0, 300)}`)
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data?: string; mimeType?: string }
        }>
      }
    }>
  }

  const part = payload.candidates?.[0]?.content?.parts?.find(
    (item) => item.inlineData?.data,
  )
  if (!part?.inlineData?.data) {
    throw new Error('Gemini TTS: aucune donnée audio dans la réponse')
  }

  const mime = part.inlineData.mimeType ?? 'audio/L16;rate=24000'
  const rate = Number(mime.match(/rate=(\d+)/)?.[1] ?? 24000)
  let data = Buffer.from(part.inlineData.data, 'base64')

  if (data.subarray(0, 4).toString() === 'RIFF') {
    data = data.subarray(44)
  }

  const pcm = pcm16LeToSamples(data)
  const downsampled = resample(pcm, rate, 8000)
  return pcm16ToMulaw(downsampled)
}

export function ttsKey(text: string) {
  return createHash('sha256')
    .update(`${config.ttsVoice}:${config.geminiTtsModel}:${text}`)
    .digest('hex')
}

export async function synthesizeMulaw(
  text: string,
  options?: { retries?: number; timeoutMs?: number },
): Promise<Buffer> {
  const chunks = splitText(text)
  const parts: Buffer[] = []
  for (const chunk of chunks) {
    parts.push(
      await synthesizeChunk(
        chunk,
        0,
        options?.retries ?? 4,
        options?.timeoutMs ?? 60000,
      ),
    )
  }
  return Buffer.concat(parts)
}
