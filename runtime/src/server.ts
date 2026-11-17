import { createHmac, timingSafeEqual } from 'node:crypto'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'

import { WebSocketServer, type WebSocket } from 'ws'

import {
  mulawToPcm16,
  pcm16LeToSamples,
  pcm16ToMulaw,
  resample,
} from './audio'
import { config } from './config'
import { loadTenant } from './program'
import { CallSession, type SessionTransport } from './session'
import { OnboardingSession } from './onboarding'

class TwilioTransport implements SessionTransport {
  constructor(
    private ws: WebSocket,
    private streamSid: string,
  ) {}

  media(frame: Buffer) {
    if (this.ws.readyState !== 1) return
    this.ws.send(
      JSON.stringify({
        event: 'media',
        streamSid: this.streamSid,
        media: { payload: frame.toString('base64') },
      }),
    )
  }

  clear() {
    if (this.ws.readyState !== 1) return
    this.ws.send(JSON.stringify({ event: 'clear', streamSid: this.streamSid }))
  }

  event() {
    // Twilio n'a pas de canal d'événements pour le client.
  }

  close() {
    if (this.ws.readyState === 1) this.ws.close()
  }
}

class WebTransport implements SessionTransport {
  constructor(private ws: WebSocket) {}

  media(frame: Buffer) {
    if (this.ws.readyState !== 1) return
    const pcm = mulawToPcm16(frame)
    const buffer = Buffer.alloc(pcm.length * 2)
    for (let i = 0; i < pcm.length; i += 1) {
      buffer.writeInt16LE(pcm[i], i * 2)
    }
    this.ws.send(
      JSON.stringify({
        type: 'audio',
        sampleRate: 8000,
        data: buffer.toString('base64'),
      }),
    )
  }

  clear() {
    if (this.ws.readyState !== 1) return
    this.ws.send(JSON.stringify({ type: 'clear' }))
  }

  event(type: string, payload: Record<string, unknown> = {}) {
    if (this.ws.readyState !== 1) return
    this.ws.send(JSON.stringify({ type, ...payload }))
  }

  close() {
    if (this.ws.readyState !== 1) return
    this.ws.send(JSON.stringify({ type: 'end' }))
    this.ws.close()
  }
}

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(body))
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })
}

function publicWsUrl(request: IncomingMessage, tenant: string) {
  if (process.env.PUBLIC_WS_URL) {
    const base = process.env.PUBLIC_WS_URL
    return `${base}${base.includes('?') ? '&' : '?'}tenant=${encodeURIComponent(tenant)}`
  }

  const proto = String(request.headers['x-forwarded-proto'] ?? 'http').includes('https')
    ? 'wss'
    : 'ws'
  const host = String(request.headers['x-forwarded-host'] ?? request.headers.host ?? 'localhost')
  return `${proto}://${host}/media?tenant=${encodeURIComponent(tenant)}`
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => {
    const map: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;',
    }
    return map[char]
  })
}

function twiml(request: IncomingMessage, tenant: string, caller = '') {
  const wsUrl = publicWsUrl(request, tenant)
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}">
      <Parameter name="tenant" value="${tenant}"/>
      <Parameter name="caller" value="${escapeXml(caller)}"/>
    </Stream>
  </Connect>
</Response>`
}

function validTwilioSignature(
  token: string,
  signature: string | undefined,
  url: string,
  params: URLSearchParams,
) {
  if (!signature) return false
  const payload = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .reduce((acc, [key, value]) => `${acc}${key}${value}`, url)
  const expected = createHmac('sha1', token)
    .update(Buffer.from(payload, 'utf8'))
    .digest()
  const provided = Buffer.from(signature, 'base64')
  if (expected.length !== provided.length) return false
  return timingSafeEqual(expected, provided)
}

function requestUrl(request: IncomingMessage) {
  const proto = String(request.headers['x-forwarded-proto'] ?? 'http').includes('https')
    ? 'https'
    : 'http'
  const host = String(
    request.headers['x-forwarded-host'] ?? request.headers.host ?? 'localhost',
  )
  return `${proto}://${host}${request.url ?? '/twilio'}`
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost')

  if (url.pathname === '/health') {
    json(response, 200, {
      ok: true,
      engine: 'gemini-live',
      jev: 'disabled',
      groq: Boolean(config.groqKey),
      gemini: Boolean(config.geminiKey),
      tools: [
        'get_menu',
        'get_delivery_info',
        'get_opening_hours',
        'get_available_drivers',
        'get_restaurant_info',
        'create_order',
      ],
      voice: config.ttsVoice,
      product: config.agentApiKey ? 'ok' : 'missing',
    })
    return
  }

  if (url.pathname === '/' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('PizzaVoice runtime\n')
    return
  }

  if (url.pathname === '/twilio') {
    let tenant = url.searchParams.get('tenant') ?? ''
    let caller = ''
    let form = new URLSearchParams()

    if (request.method === 'POST') {
      const raw = await readBody(request)
      form = new URLSearchParams(raw)

      if (config.twilioAuthToken) {
        const signature = request.headers['x-twilio-signature']
        if (
          typeof signature !== 'string' ||
          !validTwilioSignature(
            config.twilioAuthToken,
            signature,
            requestUrl(request),
            form,
          )
        ) {
          console.warn('[twilio] signature invalide')
          response.writeHead(403, { 'Content-Type': 'text/plain' })
          response.end('invalid signature')
          return
        }
      }

      const to = form.get('To') ?? ''
      caller = form.get('From') ?? ''
      if (!tenant) tenant = to.replace(/\D/g, '')
    }

    if (!tenant) tenant = 'default'

    response.writeHead(200, { 'Content-Type': 'text/xml; charset=utf-8' })
    response.end(twiml(request, tenant, caller))
    return
  }

  json(response, 404, { error: 'not_found' })
})

const wss = new WebSocketServer({ noServer: true })

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url ?? '/', 'http://localhost')
  if (!['/media', '/web-call', '/phone-ws', '/onboarding-ws'].includes(url.pathname)) {
    socket.destroy()
    return
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request)
  })
})

function handleTwilio(ws: WebSocket, request: IncomingMessage) {
  const url = new URL(request.url ?? '/', 'http://localhost')
  let tenantId = url.searchParams.get('tenant') ?? 'default'
  let session: CallSession | null = null

  ws.on('message', (raw) => {
    let message: {
      event?: string
      start?: {
        streamSid?: string
        callSid?: string
        customParameters?: Record<string, string>
      }
      media?: { payload?: string }
    }

    try {
      message = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (message.event === 'start') {
      const streamSid = message.start?.streamSid
      if (!streamSid) return

      tenantId = message.start?.customParameters?.tenant ?? tenantId ?? 'default'
      const tenant = loadTenant(tenantId)

      if (!tenant) {
        console.error('[twilio] tenant introuvable', tenantId)
        ws.close(1011, 'tenant introuvable')
        return
      }

      session = new CallSession(
        new TwilioTransport(ws, streamSid),
        tenant,
        message.start?.callSid ?? '',
        message.start?.customParameters?.caller ?? '',
      )
      console.log('[twilio] stream start', { tenant: tenant.id, streamSid })
      void session.start()
      return
    }

    if (message.event === 'media') {
      if (message.media?.payload) {
        session?.handleMedia(message.media.payload)
      }
      return
    }

    if (message.event === 'stop') {
      session?.close()
      ws.close()
    }
  })

  ws.on('close', () => session?.close())
  ws.on('error', (error) => console.error('[twilio] websocket error', error.message))
}

function handleOnboarding(ws: WebSocket) {
  let session: OnboardingSession | null = null

  const send = (payload: Record<string, unknown>) => {
    if (ws.readyState === 1) ws.send(JSON.stringify(payload))
  }

  ws.on('message', (raw) => {
    let message: {
      type?: string
      sessionId?: string
      voice?: string
      data?: string
      sampleRate?: number
      text?: string
    }

    try {
      message = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (message.type === 'start') {
      if (!message.sessionId) {
        send({ type: 'error', message: 'sessionId manquant' })
        ws.close(1008, 'sessionId manquant')
        return
      }
      session = new OnboardingSession(
        message.sessionId,
        message.voice ?? config.ttsVoice,
        (mulaw) => {
          if (ws.readyState !== 1) return
          const pcm = mulawToPcm16(mulaw)
          const buffer = Buffer.alloc(pcm.length * 2)
          for (let i = 0; i < pcm.length; i += 1) buffer.writeInt16LE(pcm[i], i * 2)
          ws.send(
            JSON.stringify({
              type: 'audio',
              sampleRate: 8000,
              data: buffer.toString('base64'),
            }),
          )
        },
        send,
      )
      console.log('[onboarding] start', { sessionId: message.sessionId })
      session.start()
      return
    }

    if (message.type === 'text' && message.text) {
      send({ type: 'transcript', role: 'client', text: message.text })
      session?.sendText(message.text)
      return
    }

    if (message.type === 'audio' && message.data) {
      const pcm = pcm16LeToSamples(Buffer.from(message.data, 'base64'))
      const rate = message.sampleRate ?? 16000
      const pcm8 = resample(pcm, rate, 8000)
      session?.sendAudio(pcm16ToMulaw(pcm8))
      return
    }

    if (message.type === 'stop') {
      session?.close()
      ws.close()
    }
  })

  ws.on('close', () => {
    console.log('[onboarding] fin')
    session?.close()
  })
  ws.on('error', (error) => console.error('[onboarding] ws', error.message))
}

function handleWebCall(ws: WebSocket) {
  let session: CallSession | null = null

  ws.on('message', (raw) => {
    let message: {
      type?: string
      tenant?: string
      phone?: string
      sampleRate?: number
      data?: string
      text?: string
    }

    try {
      message = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (message.type === 'start') {
      const tenant = loadTenant(message.tenant ?? 'default')
      if (!tenant) {
        ws.close(1011, 'tenant introuvable')
        return
      }

      session = new CallSession(
        new WebTransport(ws),
        tenant,
        `web-${Date.now()}`,
        message.phone ?? '',
      )
      console.log('[webcall] start', { tenant: tenant.id })
      void session.start()
      return
    }

    if (message.type === 'text' && message.text) {
      void session?.handleText(message.text)
      return
    }

    if (message.type === 'audio' && message.data) {
      const pcm = pcm16LeToSamples(Buffer.from(message.data, 'base64'))
      const rate = message.sampleRate ?? 16000
      const pcm8 = resample(pcm, rate, 8000)
      session?.handleMedia(pcm16ToMulaw(pcm8).toString('base64'))
      return
    }

    if (message.type === 'stop') {
      session?.close()
      ws.close()
    }
  })

  ws.on('close', () => session?.close())
  ws.on('error', (error) => console.error('[webcall] websocket error', error.message))
}

wss.on('connection', (ws, request) => {
  const url = new URL(request.url ?? '/', 'http://localhost')
  if (url.pathname === '/onboarding-ws') {
    handleOnboarding(ws)
    return
  }
  if (url.pathname === '/web-call' || url.pathname === '/phone-ws') {
    handleWebCall(ws)
    return
  }
  handleTwilio(ws, request)
})

server.listen(config.port, () => {
  console.log(`[runtime] écoute sur :${config.port}`)
  console.log(
    JSON.stringify({
      groq: config.groqKey ? 'ok' : 'missing',
      gemini: config.geminiKey ? 'ok' : 'missing',
      engine: 'gemini-live',
      handoff: config.handoffEnabled,
      product: config.agentApiKey ? 'ok' : 'missing',
    }),
  )
})
