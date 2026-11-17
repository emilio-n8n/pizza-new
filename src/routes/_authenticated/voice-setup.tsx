import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { Brand } from '#/components/brand'

export const Route = createFileRoute('/_authenticated/voice-setup')({
  head: () => ({ meta: [{ title: 'Configuration à la voix, PizzaVoice' }] }),
  component: VoiceSetup,
})

type Msg = { role: 'client' | 'agent' | 'system'; text: string }

const VOICES = ['Kore', 'Puck', 'Zephyr', 'Charon', 'Fenrir', 'Leda', 'Orus', 'Aoede'] as const

function downsample(input: Float32Array, from: number, to: number) {
  if (to === from) return input
  const ratio = from / to
  const length = Math.round(input.length / ratio)
  const out = new Float32Array(length)
  let offset = 0
  for (let i = 0; i < length; i += 1) {
    const next = Math.round((i + 1) * ratio)
    let sum = 0
    let count = 0
    for (let j = offset; j < next && j < input.length; j += 1) {
      sum += input[j]
      count += 1
    }
    out[i] = count > 0 ? sum / count : 0
    offset = next
  }
  return out
}

function floatToPcm16Base64(samples: Float32Array) {
  const buffer = new ArrayBuffer(samples.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true)
  }
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function VoiceSetup() {
  const { session } = Route.useRouteContext()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'live' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [voice, setVoice] = useState<string>('Kore')
  const [messages, setMessages] = useState<Msg[]>([])

  const wsRef = useRef<WebSocket | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const queueRef = useRef<AudioBuffer[]>([])
  const playingRef = useRef(false)

  useEffect(() => () => stop(true), [])

  function addMessage(role: Msg['role'], text: string) {
    setMessages((prev) => [...prev.slice(-40), { role, text }])
  }

  function playNext() {
    const ctx = ctxRef.current
    if (!ctx || playingRef.current) return
    const next = queueRef.current.shift()
    if (!next) return
    playingRef.current = true
    const source = ctx.createBufferSource()
    source.buffer = next
    source.connect(ctx.destination)
    source.onended = () => {
      playingRef.current = false
      playNext()
    }
    source.start()
  }

  async function start() {
    if (status === 'live') return
    setError(null)
    setMessages([])

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      streamRef.current = stream

      const ctx = new AudioContext()
      ctxRef.current = ctx
      await ctx.resume()

      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const ws = new WebSocket(`${scheme}://${window.location.host}/onboarding-ws`)
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'start', sessionId: session.user.id, voice }))

        const source = ctx.createMediaStreamSource(stream)
        const processor = ctx.createScriptProcessor(4096, 1, 1)
        processorRef.current = processor
        const silent = ctx.createGain()
        silent.gain.value = 0
        source.connect(processor)
        processor.connect(silent)
        silent.connect(ctx.destination)

        processor.onaudioprocess = (event) => {
          if (ws.readyState !== WebSocket.OPEN) return
          const input = event.inputBuffer.getChannelData(0)
          const pcm16k = downsample(input, ctx.sampleRate, 16000)
          ws.send(
            JSON.stringify({
              type: 'audio',
              sampleRate: 16000,
              data: floatToPcm16Base64(pcm16k),
            }),
          )
        }

        setStatus('live')
      }

      ws.onmessage = (event) => {
        let message: {
          type?: string
          role?: string
          text?: string
          data?: string
          message?: string
          name?: string
        }
        try {
          message = JSON.parse(event.data)
        } catch {
          return
        }

        if (message.type === 'audio' && message.data) {
          const binary = atob(message.data)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
          const view = new DataView(bytes.buffer)
          const samples = new Float32Array(bytes.length / 2)
          for (let i = 0; i < samples.length; i += 1) {
            samples[i] = view.getInt16(i * 2, true) / 0x8000
          }
          const buffer = ctx.createBuffer(1, samples.length, 8000)
          buffer.copyToChannel(samples, 0)
          queueRef.current.push(buffer)
          playNext()
          return
        }

        if (message.type === 'transcript' && message.text) {
          addMessage(message.role === 'client' ? 'client' : 'agent', message.text)
          return
        }

        if (message.type === 'onboarding_saved') {
          setStatus('saved')
          addMessage('system', `Établissement « ${message.name ?? ''} » enregistré.`)
          setTimeout(() => navigate({ to: '/app' }), 4000)
          return
        }

        if (message.type === 'error') {
          setError(message.message ?? 'erreur')
          setStatus('error')
        }
      }

      ws.onerror = () => {
        setError(`Connexion impossible sur ${ws.url}.`)
        setStatus('error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Micro inaccessible')
      setStatus('error')
    }
  }

  function stop(silent = false) {
    processorRef.current?.disconnect()
    processorRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    queueRef.current = []
    playingRef.current = false
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }))
    }
    wsRef.current?.close()
    wsRef.current = null
    ctxRef.current?.close().catch(() => undefined)
    ctxRef.current = null
    if (!silent) setStatus('idle')
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-top">
          <Brand />
          <p className="small-note">
            <Link to="/onboarding">Configurer à l'écrit</Link>
          </p>
        </div>

        <div className="auth-main">
          <div className="auth-card">
            <p className="eyebrow">Mise en route à la voix</p>
            <h1 className="auth-title">On configure votre pizzeria ensemble.</h1>
            <p className="lede" style={{ fontSize: 15 }}>
              Appuyez sur le bouton et répondez. L'assistant note au fur et à mesure : nom,
              adresse, carte, horaires, livraison. Deux minutes, aucune question à remplir.
            </p>

            <div className="field">
              <label htmlFor="setup-voice">Voix de l'assistant</label>
              <select
                id="setup-voice"
                value={voice}
                onChange={(event) => setVoice(event.target.value)}
                disabled={status === 'live'}
              >
                {VOICES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {error ? <p className="auth-error">{error}</p> : null}

            {status === 'live' ? (
              <button className="btn btn-block" type="button" onClick={() => stop()}>
                Terminer
              </button>
            ) : (
              <button
                className="btn btn-primary btn-block"
                type="button"
                onClick={start}
                disabled={status === 'saved'}
              >
                {status === 'saved' ? 'Enregistré' : 'Démarrer la configuration'}
              </button>
            )}

            {messages.length > 0 ? (
              <div className="setup-transcript" aria-live="polite">
                {messages.map((message, index) => (
                  <p key={index} className={`setup-line setup-${message.role}`}>
                    <strong>{message.role === 'client' ? 'Vous' : message.role === 'agent' ? 'Assistant' : '—'}</strong>{' '}
                    {message.text}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <aside className="auth-aside" aria-hidden="true">
        <img src="/images/counter.webp" alt="" />
        <div className="auth-quote">
          <p>« Vous parlez, il note. À la fin, votre standard est prêt à sonner. »</p>
          <span>Mise en route · 2 minutes</span>
        </div>
      </aside>
    </div>
  )
}
