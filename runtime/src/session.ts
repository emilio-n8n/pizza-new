import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { mulawToPcm16, splitFrames } from './audio'
import { transcribe } from './asr'
import { config } from './config'
import { GeminiLive } from './gemini'
import { createProductOrder, getLocation, getMenu, getDrivers } from './product'
import {
  audioPath,
  bridgePath,
  type ProgramState,
  type Tenant,
} from './program'
import { FALLBACK_TEXT, renderText, slotValue } from './slots'
import { synthesizeMulaw, ttsKey } from './tts'
import { Vad } from './vad'

export interface SessionTransport {
  media(frame: Buffer): void
  clear(): void
  event(type: string, payload?: Record<string, unknown>): void
  close(): void
}

const FRAME_BYTES = 160
const FRAME_MS = 20

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

class Playback {
  private timer: NodeJS.Timeout | null = null
  private stopped = false
  private onDone: (() => void) | null = null

  constructor(private send: (frame: Buffer) => void) {}

  get isPlaying() {
    return this.timer !== null
  }

  play(buffer: Buffer, onDone: () => void) {
    this.stop()
    this.stopped = false
    this.onDone = onDone

    const frames = splitFrames(buffer, FRAME_BYTES)
    if (frames.length === 0) {
      this.onDone = null
      onDone()
      return
    }

    let index = 0
    const start = Date.now()

    const tick = () => {
      if (this.stopped) return
      if (index >= frames.length) {
        this.timer = null
        const done = this.onDone
        this.onDone = null
        done?.()
        return
      }

      this.send(frames[index])
      index += 1
      const delay = Math.max(0, start + index * FRAME_MS - Date.now())
      this.timer = setTimeout(tick, delay)
    }

    tick()
  }

  stop() {
    this.stopped = true
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    const done = this.onDone
    this.onDone = null
    done?.()
  }
}

export class CallSession {
  private vad = new Vad()
  private playback: Playback
  private currentId = ''
  private waiting = false
  private interrupted = false
  private handoff = false
  private bridgeDone = false
  private closed = false
  private slots: Record<string, string> = {}
  private history: Array<{ role: 'agent' | 'client'; text: string }> = []
  private gemini: GeminiLive | null = null
  private eventCount = 0
  private orderCreated = false
  private transcript: Array<{ at: string; role: 'client' | 'agent'; text: string }> = []
  private transcriptPath = ''

  constructor(
    private transport: SessionTransport,
    private tenant: Tenant,
    private callSid: string,
    private callerPhone = '',
  ) {
    this.playback = new Playback((frame) => this.sendMedia(frame))
    this.vad.onSpeechStart = () => this.onSpeechStart()
  }

  async start() {
    const call = {
      callSid: this.callSid,
      tenant: this.tenant.id,
      flow: this.tenant.program.flowId,
      version: this.tenant.program.version,
    }
    console.log('[call] start', call)

    const startNode = Object.values(this.tenant.program.states).find(
      (node) => node.kind === 'start',
    )
    if (!startNode) {
      console.error('[call] aucun nœud start dans le programme')
      this.close()
      return
    }

    await this.speak(startNode.id)
  }

  handleMedia(payloadBase64: string) {
    if (this.closed) return
    const mulaw = Buffer.from(payloadBase64, 'base64')

    for (const frame of splitFrames(mulaw, FRAME_BYTES)) {
      this.eventCount += 1

      if (this.handoff) {
        this.gemini?.sendAudio(frame)
        continue
      }

      const utterance = this.vad.push(mulawToPcm16(frame))
      if (utterance) {
        void this.handleUtterance(utterance)
      }
    }
  }

  close() {
    if (this.closed) return
    this.closed = true
    this.playback.stop()
    this.gemini?.close()
    this.gemini = null
    this.flushTranscript()
    this.transport.event('end')
    console.log('[call] end', {
      callSid: this.callSid,
      tenant: this.tenant.id,
      events: this.eventCount,
      turns: this.history.length,
    })
  }

  private listen() {
    if (this.closed) return
    this.waiting = true
    this.transport.event('listening')
  }

  private onSpeechStart() {
    if (this.handoff) return
    if (!config.bargeIn || !this.playback.isPlaying) return

    this.interrupted = true
    this.playback.stop()
    this.transport.clear()
  }

  async handleText(text: string) {
    if (this.closed) return
    if (this.handoff) {
      // Mode Gemini Live : le texte du banc de test part directement au modèle.
      this.recordTranscript('client', text)
      this.gemini?.sendText(text)
      return
    }
    if (!this.waiting) {
      console.log('[session] texte ignoré, agent occupé', text)
      return
    }
    this.waiting = false
    await this.processClientText(text)
  }

  private async handleUtterance(pcm: Int16Array) {
    if (!this.waiting || this.closed) return
    this.waiting = false

    try {
      const text = await transcribe(pcm)
      if (!text) {
        this.listen()
        return
      }
      await this.processClientText(text)
    } catch (error) {
      console.error('[session] erreur tour', error)
      this.listen()
    }
  }

  private async processClientText(text: string) {
    try {
      this.history.push({ role: 'client', text })
      this.transport.event('client', { text })
      if (config.logTranscripts) console.log('[client]', text)

      const node = this.tenant.program.states[this.currentId]
      if (!node) {
        this.close()
        return
      }

      if (node.kind === 'capture') {
        if (node.slot) this.slots[node.slot] = text
        const next = node.transitions[0]
        if (next) {
          await this.speak(next.to)
        } else {
          this.listen()
        }
        return
      }

      // JEV retiré : on bascule directement sur Gemini Live
      this.handoffToGemini()
      return
    } catch (error) {
      console.error('[session] erreur tour', error)
      this.listen()
    }
  }

  private async speak(nodeId: string, depth = 0) {
    if (this.closed) return
    if (depth > 12) {
      console.error('[session] boucle de nœuds détectée')
      this.close()
      return
    }

    const node = this.tenant.program.states[nodeId]
    if (!node) {
      this.close()
      return
    }

    this.currentId = nodeId
    this.waiting = false
    this.interrupted = false

    if (node.tool === 'create_order' && !this.orderCreated) {
      this.orderCreated = true
      const quantity = Number(this.slots.quantity ?? 1)
      const items = [
        {
          name: this.slots.pizza ?? 'Commande pizzeria',
          quantity: Number.isFinite(quantity) ? quantity : 1,
        },
      ]
      if (this.slots.drink) {
        items.push({ name: this.slots.drink, quantity: 1 })
      }

      const mode =
        this.slots.mode === 'en livraison'
          ? 'delivery'
          : this.slots.mode === 'sur place'
            ? 'dine-in'
            : 'pickup'

      const order = await createProductOrder({
        tenant: this.tenant.id,
        locationId: this.tenant.locationId,
        phone: this.callerPhone || '+33600000000',
        address: this.slots.address ?? '',
        mode,
        items,
      })

      if (order) {
        this.slots.reference = order.reference
        this.slots.trackingUrl = order.trackingUrl
        console.log('[order] créée', {
          reference: order.reference,
          total: order.totalCents,
          tracking: order.trackingUrl,
        })
      }
    }

    const text = node.say.includes('{{')
      ? renderText(node.say, this.slots)
      : node.say

    this.history.push({ role: 'agent', text })
    this.transport.event('agent', { text, node: node.id })
    if (config.logTranscripts) console.log('[agent]', text)

    const audio = await this.ensureAudio(node, text)
    if (audio.length > 0) {
      await new Promise<void>((resolve) => this.playback.play(audio, resolve))
    } else {
      await sleep(400)
    }

    if (this.closed) return

    if (this.interrupted) {
      this.interrupted = false
      this.listen()
      return
    }

    if (node.kind === 'say' || node.kind === 'action') {
      const next = node.transitions[0]
      if (next) {
        await this.speak(next.to, depth + 1)
        return
      }
    }

    if (node.kind === 'end') {
      setTimeout(() => this.close(), 700)
      return
    }

    if (node.kind === 'handoff' || node.kind === 'start') {
      // JEV retiré : Gemini Live prend la main dès la fin de l'accueil.
      this.handoffToGemini()
      return
    }

    this.listen()
  }

  private async ensureAudio(node: ProgramState, text: string) {
    const dynamic = node.say.includes('{{')
    const key = dynamic ? `dynamic/${ttsKey(text)}` : node.audio
    const path = audioPath(this.tenant, key)

    if (existsSync(path)) {
      return readFileSync(path)
    }

    if (!config.geminiKey) {
      console.warn('[tts] audio manquant et GEMINI_API_KEY absent', {
        key,
        text,
      })
      return Buffer.alloc(0)
    }

    try {
      const audio = await synthesizeMulaw(text, {
        retries: 0,
        timeoutMs: 6000,
      })
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, audio)
      return audio
    } catch (error) {
      console.error('[tts] échec', error)

      const fallbackText = FALLBACK_TEXT[node.id]
      if (fallbackText) {
        const fallbackPath = audioPath(
          this.tenant,
          `fallbacks/${node.id}`,
        )
        if (existsSync(fallbackPath)) {
          return readFileSync(fallbackPath)
        }
      }

      return Buffer.alloc(0)
    }
  }

  private async handoffToGemini() {
    if (this.handoff || this.closed) return
    if (!config.handoffEnabled) {
      this.waiting = false
      return
    }

    if (!config.geminiKey) {
      console.error('[handoff] GEMINI_API_KEY absent')
      this.waiting = false
      return
    }

    this.handoff = true
    this.waiting = false
    this.bridgeDone = false
    console.log('[handoff] Gemini Live', config.geminiLiveModel)
    this.transport.event('handoff', {})

    const location = await getLocation()
    const menu = await getMenu()
    const drivers = await getDrivers()

    const restaurantName = location?.name ?? this.tenant.name
    const address = location
      ? `${location.address}, ${location.postalCode} ${location.city}`
      : ''
    const phone = location?.phone ?? ''
    const cuisine = location?.cuisine ?? 'Italienne'
    const hours = location?.hours ?? []
    const delivery = location?.delivery

    const dayLabels = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const hoursText = hours
      .map((h) => {
        if (h.closed) return `${dayLabels[h.day]} : fermé`
        return `${dayLabels[h.day]} : ${h.open}–${h.close}`
      })
      .join(', ')

    const deliveryText = delivery
      ? `Livraison ${delivery.enabled ? 'activée' : 'désactivée'}, frais ${delivery.feeCents / 100} €, commande minimum ${delivery.minOrderCents / 100} €, rayon ${delivery.radiusKm} km${delivery.postalCodes ? ', codes postaux : ' + delivery.postalCodes : ''}`
      : 'Livraison non configurée'

    const menuText = menu.length > 0
      ? menu.map((m) => `${m.name} (${m.priceEuros} €)${m.description ? ' — ' + m.description : ''}`).join('; ')
      : 'Menu non chargé'

    const tools = [
      {
        name: 'get_menu',
        description: "Récupère la carte de la pizzeria avec les prix. Utiliser avant de proposer un plat ou un prix.",
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'get_delivery_info',
        description: "Récupère les infos de livraison : frais, minimum de commande, rayon, codes postaux acceptés, statut activé/désactivé.",
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'get_opening_hours',
        description: "Récupère les horaires d'ouverture par jour.",
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'get_available_drivers',
        description: "Récupère la liste des livreurs et leur disponibilité (actif ou non).",
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'get_restaurant_info',
        description: "Récupère les infos générales du restaurant : nom, adresse, téléphone, type de cuisine.",
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'create_order',
        description: "Crée une commande. Nécessite : items (liste de {name, quantity}), mode (delivery/pickup/dine-in), phone (téléphone client), address (adresse de livraison si delivery).",
        parameters: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                },
                required: ['name', 'quantity'],
              },
            },
            mode: { type: 'string', enum: ['delivery', 'pickup', 'dine-in'] },
            phone: { type: 'string' },
            address: { type: 'string' },
          },
          required: ['items', 'mode', 'phone'],
        },
      },
    ]

    const prompt = [
      `Tu es Sophie, l'assistante vocale de la pizzeria ${restaurantName}.`,
      `Adresse : ${address}. Téléphone : ${phone}. Cuisine : ${cuisine}.`,
      `Horaires : ${hoursText}.`,
      `Livraison : ${deliveryText}.`,
      `Carte : ${menuText}.`,
      '',
      'Tu prends les commandes, tu réponds aux questions sur la carte, les prix, les horaires, la livraison et la disponibilité des livreurs.',
      'Tu utilises les outils à ta disposition pour récupérer les données à jour — ne devine jamais un prix, un horaire ou une disponibilité.',
      'Réponds en français, avec des phrases courtes et naturelles.',
      'Demande confirmation avant de valider une commande.',
      'Si le client demande quelque chose hors de ton périmètre, dis-le poliment.',
    ].join(' ')

    const gemini = new GeminiLive(prompt, this.historyText(), tools)
    this.gemini = gemini

    gemini.onAudio = (mulaw) => {
      if (this.bridgeDone) this.sendMedia(mulaw)
    }
    gemini.onInterrupt = () => this.transport.clear()
    gemini.onError = (error) => console.error('[gemini]', error.message)
    gemini.onReady = () => console.log('[gemini] prêt')
    gemini.onTranscript = (role, text) => this.recordTranscript(role, text)

    gemini.onToolCall = async (calls) => {
      const results: Record<string, unknown>[] = []
      for (const call of calls) {
        console.log('[gemini tool]', call.name, call.args)
        try {
          switch (call.name) {
            case 'get_menu': {
              const m = await getMenu()
              results.push({ menu: m })
              break
            }
            case 'get_delivery_info': {
              const loc = await getLocation()
              results.push({ delivery: loc?.delivery ?? null })
              break
            }
            case 'get_opening_hours': {
              const loc = await getLocation()
              const dl = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
              results.push({
                hours: (loc?.hours ?? []).map((h) => ({
                  day: dl[h.day],
                  closed: h.closed,
                  open: h.open,
                  close: h.close,
                })),
              })
              break
            }
            case 'get_available_drivers': {
              const ds = await getDrivers()
              results.push({ drivers: ds })
              break
            }
            case 'get_restaurant_info': {
              const loc = await getLocation()
              results.push({
                name: loc?.name ?? this.tenant.name,
                address: loc ? `${loc.address}, ${loc.postalCode} ${loc.city}` : '',
                phone: loc?.phone ?? '',
                cuisine: loc?.cuisine ?? '',
              })
              break
            }
            case 'create_order': {
              const args = call.args as {
                items: Array<{ name: string; quantity: number }>
                mode: 'delivery' | 'pickup' | 'dine-in'
                phone: string
                address?: string
              }
              const order = await createProductOrder({
                tenant: this.tenant.id,
                locationId: this.tenant.locationId,
                phone: args.phone,
                address: args.address ?? '',
                mode: args.mode,
                items: args.items,
              })
              if (order) {
                results.push({
                  success: true,
                  reference: order.reference,
                  totalEuros: (order.totalCents / 100).toFixed(2),
                  trackingUrl: order.trackingUrl,
                })
              } else {
                results.push({ success: false, error: 'commande non créée' })
              }
              break
            }
            default:
              results.push({ error: 'outil inconnu' })
          }
        } catch (error) {
          results.push({ error: String(error) })
        }
      }
      return results
    }

    gemini.connect()

    const bridge = await this.ensureBridge()
    if (bridge.length > 0) {
      await new Promise<void>((resolve) => this.playback.play(bridge, resolve))
    }
    this.bridgeDone = true
  }

  private async ensureBridge() {
    const path = bridgePath(this.tenant)
    if (existsSync(path)) return readFileSync(path)
    if (!config.geminiKey) return Buffer.alloc(0)

    try {
      const audio = await synthesizeMulaw(
        this.tenant.program.fallback.bridgeText,
      )
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, audio)
      return audio
    } catch (error) {
      console.error('[bridge] échec', error)
      return Buffer.alloc(0)
    }
  }

  private recordTranscript(role: 'client' | 'agent', text: string) {
    const entry = { at: new Date().toISOString(), role, text: text.trim() }
    if (!entry.text) return
    this.transcript.push(entry)
    if (!this.transcriptPath) {
      const dir = resolve(config.dataDir, 'transcripts')
      mkdirSync(dir, { recursive: true })
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      this.transcriptPath = join(dir, `${this.callSid || 'call'}-${stamp}`)
    }
    try {
      appendFileSync(
        this.transcriptPath + '.jsonl',
        JSON.stringify(entry) + '\n',
        'utf8',
      )
    } catch (error) {
      console.error('[transcript] écriture', error)
    }
  }

  private flushTranscript() {
    if (!this.transcriptPath || this.transcript.length === 0) return
    try {
      writeFileSync(
        this.transcriptPath + '.json',
        JSON.stringify(
          {
            callSid: this.callSid,
            tenant: this.tenant.id,
            caller: this.callerPhone,
            startedAt: this.transcript[0]?.at,
            endedAt: new Date().toISOString(),
            turns: this.transcript,
          },
          null,
          2,
        ),
        'utf8',
      )
      console.log('[transcript] enregistré', this.transcriptPath)
    } catch (error) {
      console.error('[transcript] écriture finale', error)
    }
  }

  private historyText() {
    return this.history
      .slice(-8)
      .map((item) => `${item.role}: ${item.text}`)
      .join('\n')
  }

  private sendMedia(buffer: Buffer) {
    for (const frame of splitFrames(buffer, FRAME_BYTES)) {
      this.transport.media(frame)
    }
  }
}
