import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

type Message = {
  id: string
  role: 'agent' | 'client' | 'system'
  text: string
}

type Status = 'idle' | 'connecting' | 'live' | 'ended'

function base64(bytes: Uint8Array) {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function downsample(input: Float32Array, from: number, to: number) {
  if (from === to) return input
  const ratio = from / to
  const length = Math.floor(input.length / ratio)
  const output = new Float32Array(length)
  for (let i = 0; i < length; i += 1) {
    const start = Math.floor(i * ratio)
    let sum = 0
    let count = 0
    for (let j = 0; j < ratio; j += 1) {
      const index = start + j
      if (index >= input.length) break
      sum += input[index]
      count += 1
    }
    output[i] = count > 0 ? sum / count : 0
  }
  return output
}

function toInt16(input: Float32Array) {
  const output = new Int16Array(input.length)
  for (let i = 0; i < input.length; i += 1) {
    const value = Math.max(-1, Math.min(1, input[i]))
    output[i] = value < 0 ? value * 0x8000 : value * 0x7fff
  }
  return output
}

export const Route = createFileRoute('/_authenticated/app/telephone')({
  head: () => ({ meta: [{ title: 'Téléphone, PizzaVoice' }] }),
  component: WebPhone,
})

function WebPhone() {
  const { session } = Route.useRouteContext()
  const location = session.location
  const [status, setStatus] = useState<Status>('idle')
  const [handoff, setHandoff] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [phone, setPhone] = useState('+33600000000')
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourcesRef = useRef<AudioBufferSourceNode[]>([])
  const nextTimeRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  useEffect(() => {
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addMessage(role: Message['role'], text: string) {
    if (!text.trim()) return
    setMessages((current) => [
      ...current,
      { id: globalThis.crypto.randomUUID(), role, text },
    ])
  }

  function stopSources() {
    for (const source of sourcesRef.current) {
      try {
        source.stop()
      } catch {
        // déjà arrêtée
      }
    }
    sourcesRef.current = []
    nextTimeRef.current = 0
  }

  function playAudio(data: string, sampleRate: number) {
    const ctx = ctxRef.current
    if (!ctx) return

    const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0))
    const view = new DataView(bytes.buffer)
    const samples = new Float32Array(bytes.length / 2)
    for (let i = 0; i < samples.length; i += 1) {
      samples[i] = view.getInt16(i * 2, true) / 0x8000
    }

    const buffer = ctx.createBuffer(1, samples.length, sampleRate)
    buffer.copyToChannel(samples, 0)

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)

    const start = Math.max(ctx.currentTime + 0.03, nextTimeRef.current)
    source.start(start)
    nextTimeRef.current = start + buffer.duration
    sourcesRef.current.push(source)
    source.onended = () => {
      sourcesRef.current = sourcesRef.current.filter((item) => item !== source)
    }
  }

  async function start() {
    setError(null)
    setMessages([])
    setHandoff(false)
    setStatus('connecting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      const ctx = new AudioContext()
      ctxRef.current = ctx
      await ctx.resume()

      // En production le runtime est proxifié sur /phone-ws du même hôte ;
      // on déduit l'URL du navigateur pour que le tunnel (Cloudflare) marche sans config.
      const configured =
        (import.meta.env.VITE_RUNTIME_WS_URL as string | undefined)?.trim() || ''
      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const url = configured || `${scheme}://${window.location.host}/phone-ws`

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'start',
            tenant: location?.twilioNumber?.replace(/\D/g, '') || 'default',
            phone,
          }),
        )
        setStatus('live')

        const source = ctx.createMediaStreamSource(stream)
        const processor = ctx.createScriptProcessor(4096, 1, 1)
        processorRef.current = processor
        const silent = ctx.createGain()
        silent.gain.value = 0

        processor.onaudioprocess = (event) => {
          if (ws.readyState !== WebSocket.OPEN) return
          const input = event.inputBuffer.getChannelData(0)
          const pcm16k = downsample(input, ctx.sampleRate, 16000)
          const int16 = toInt16(pcm16k)
          const bytes = new Uint8Array(int16.buffer)
          ws.send(
            JSON.stringify({
              type: 'audio',
              sampleRate: 16000,
              data: base64(bytes),
            }),
          )
        }

        source.connect(processor)
        processor.connect(silent)
        silent.connect(ctx.destination)
      }

      ws.onmessage = (event) => {
        let message: {
          type?: string
          text?: string
          data?: string
          sampleRate?: number
        }
        try {
          message = JSON.parse(event.data)
        } catch {
          return
        }

        if (message.type === 'audio' && message.data) {
          playAudio(message.data, message.sampleRate ?? 8000)
          return
        }
        if (message.type === 'agent' && message.text) {
          addMessage('agent', message.text)
          return
        }
        if (message.type === 'client' && message.text) {
          addMessage('client', message.text)
          return
        }
        if (message.type === 'handoff') {
          setHandoff(true)
          addMessage('system', 'Gemini Live prend le relais.')
          return
        }
        if (message.type === 'clear') {
          stopSources()
          return
        }
        if (message.type === 'end') {
          setStatus('ended')
        }
      }

      ws.onerror = () => {
        setError(`Connexion au runtime impossible sur ${url}. Vérifiez que le proxy et le runtime tournent, et que l'URL est en wss en HTTPS.`)
        setStatus('idle')
      }

      ws.onclose = () => {
        if (status !== 'ended') setStatus('ended')
      }
    } catch (cause) {
      setStatus('idle')
      setError(
        cause instanceof Error
          ? `Micro inaccessible : ${cause.message}`
          : 'Micro inaccessible.',
      )
    }
  }

  function stop() {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }))
      wsRef.current.close()
    }
    wsRef.current = null

    processorRef.current?.disconnect()
    processorRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    stopSources()
    void ctxRef.current?.close()
    ctxRef.current = null
    setStatus('ended')
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Téléphone</h2>
          <p>Appelez l'agent depuis votre navigateur, sans Twilio.</p>
        </div>
      </div>

      <div className="webcall-grid">
        <section className="panel webcall-panel">
          <div className="webcall-status">
            <span className={`status-live${status === 'live' ? '' : ' status-draft'}`}>
              <span className="dot" aria-hidden="true" />
              {status === 'live'
                ? handoff
                  ? 'Gemini Live'
                  : 'Appel en cours'
                : status === 'connecting'
                  ? 'Connexion…'
                  : status === 'ended'
                    ? 'Appel terminé'
                    : 'Prêt'}
            </span>
            <span className="mono">{location?.name ?? 'Maison Luigi'}</span>
          </div>

          <div className="field" style={{ marginTop: 18 }}>
            <label htmlFor="webcall-phone">Numéro du client (pour le suivi)</label>
            <input
              id="webcall-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={status === 'live' || status === 'connecting'}
              inputMode="tel"
            />
          </div>

          <p className="small-note" style={{ marginTop: 10 }}>
            Le micro nécessite HTTPS ou localhost. Le numéro sert à créer la commande et à
            envoyer le lien de suivi.
          </p>

          <div className="webcall-actions">
            {status === 'idle' || status === 'ended' ? (
              <button className="btn btn-primary btn-block" type="button" onClick={() => void start()}>
                Appeler l'agent
              </button>
            ) : (
              <button className="btn btn-secondary btn-block" type="button" onClick={stop}>
                Raccrocher
              </button>
            )}
          </div>

          {error ? (
            <p className="wizard-error" role="alert" style={{ marginTop: 12 }}>
              {error}
            </p>
          ) : null}
        </section>

        <section className="panel webcall-transcript">
          <div className="app-section-head">
            <div>
              <h2>Conversation</h2>
              <p>Ce que l'agent a entendu et répondu.</p>
            </div>
            <span className="mono">{messages.length} tours</span>
          </div>

          <div className="webcall-messages" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="empty-state">
                <h3>Aucun appel en cours.</h3>
                <p>Lancez l'appel, parlez, et vérifiez la commande dans l'onglet Commandes.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`studio-msg is-${message.role}`}>
                  <span className="studio-msg-role">
                    {message.role === 'agent'
                      ? 'Agent'
                      : message.role === 'client'
                        ? 'Vous'
                        : 'Système'}
                  </span>
                  <p>{message.text}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  )
}
