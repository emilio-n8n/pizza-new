// Configuration d'un nouvel établissement à la voix, avec Gemini Live.
//
// Le gérant parle, Gemini remplit un brouillon (establishment, menu, hours,
// delivery), et enregistre quand tout est complet. Aucune question affichée :
// c'est l'agent qui mène l'entretien.

import { GeminiLive, type GeminiTool, type ToolCall } from './gemini'
import { saveOnboarding, type OnboardingPayload } from './product'

export type OnboardingDraft = {
  establishment: {
    name: string
    address: string
    postalCode: string
    city: string
    cuisine: string
    phone: string
  }
  menu: Array<{ name: string; category: string; priceCents: number }>
  hours: Array<{ day: number; closed: boolean; open: string; close: string }>
  delivery: {
    enabled: boolean
    feeCents: number
    minOrderCents: number
    radiusKm: number
    postalCodes: string
  }
}

export const emptyDraft = (): OnboardingDraft => ({
  establishment: { name: '', address: '', postalCode: '', city: '', cuisine: '', phone: '' },
  menu: [],
  hours: [],
  delivery: {
    enabled: true,
    feeCents: -1,
    minOrderCents: -1,
    radiusKm: -1,
    postalCodes: '',
  },
})

const PROMPT = `Tu es l'assistant de mise en route de PizzaVoice. Tu parles à un gérant de pizzeria qui vient de créer son compte, et tu vas configurer son standard téléphonique en discutant, sans lui montrer de formulaire.

Ton ton : chaleureux, direct, efficace. Français, phrases courtes. Tu tutoies ou voussoyez selon ce que le gérant emploie.

CE QUE TU DOIS OBTENIR, dans cet ordre, une question à la fois :
1. Le nom de la pizzeria.
2. L'adresse (rue), le code postal et la ville.
3. Le téléphone de l'établissement.
4. Le type de cuisine (italienne, napolitaine, etc.).
5. La carte : tu demandes les plats et les prix. Tu acceptes que la personne te lise sa carte en désordre ; tu construis la liste au fur et à mesure. Ne demande pas de catégories compliquées : "Pizza" suffit par défaut, mets "Boisson" ou "Dessert" quand c'est évident.
6. Les horaires par jour. Tu peux simplifier : "tous les jours de 11h30 à 14h30 et de 18h à 22h30" → tu appliques.
7. La livraison : oui ou non, frais, commande minimum, rayon en km, codes postaux desservis.

RÈGLES :
- Tu appelles \`update_draft\` à CHAQUE information obtenue, sans attendre. Ne garde rien en tête.
- Tu ne récapitule que quand tu as tout, en une phrase fluide, et tu demandes confirmation.
- À la confirmation, tu appelles \`save_establishment\`. S'il répond ok, tu annonces que c'est enregistré et que le standard peut prendre des appels, puis tu raccroches.
- Si \`save_establishment\` répond qu'il manque quelque chose, tu redemandes UNIQUEMENT ce qui manque, calmement.
- N'invente JAMAIS un prix, une adresse ou un horaire. Si la personne ne sait pas, tu laisses vide et tu le signales.
- Ne mentionne pas que tu utilises des outils. Tu parles comme une personne compétente.
- Annonce en une phrase, au tout début, que tu vas configurer sa pizzeria ensemble et que ça prend deux minutes.
- Tu parles UNIQUEMENT en français. Si un mot te vient en anglais, reformule en français.
- Une seule question par tour. Tu ne poses pas deux questions dans la même phrase.`

export function onboardingTools(): GeminiTool[] {
  return [
    {
      name: 'update_draft',
      description:
        "Enregistre les informations obtenues jusque-là. Appeler à chaque nouvelle information. Les champs omis ne sont pas modifiés.",
      parameters: {
        type: 'object',
        properties: {
          establishment: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { type: 'string' },
              postalCode: { type: 'string' },
              city: { type: 'string' },
              cuisine: { type: 'string' },
              phone: { type: 'string' },
            },
          },
          menu: {
            type: 'array',
            description:
              "Plats avec prix. priceCents = prix en centimes (13,50 € → 1350).",
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                category: { type: 'string' },
                priceCents: { type: 'number' },
              },
              required: ['name', 'priceCents'],
            },
          },
          hours: {
            type: 'array',
            description: 'Horaires par jour. day : 0=dimanche … 6=samedi.',
            items: {
              type: 'object',
              properties: {
                day: { type: 'number' },
                closed: { type: 'boolean' },
                open: { type: 'string' },
                close: { type: 'string' },
              },
              required: ['day', 'closed'],
            },
          },
          delivery: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              feeCents: { type: 'number' },
              minOrderCents: { type: 'number' },
              radiusKm: { type: 'number' },
              postalCodes: { type: 'string' },
            },
          },
        },
      },
    },
    {
      name: 'save_establishment',
      description:
        "Enregistre définitivement l'établissement et sa carte. Appeler seulement après confirmation orale du gérant.",
      parameters: { type: 'object', properties: {} },
    },
  ]
}

export class OnboardingSession {
  private draft: OnboardingDraft = emptyDraft()
  private gemini: GeminiLive

  constructor(
    private sessionId: string,
    private voice: string,
    private onAudio: (mulaw: Buffer) => void,
    private onStatus: (payload: Record<string, unknown>) => void,
  ) {
    this.gemini = new GeminiLive(PROMPT, '', onboardingTools(), voice)
    this.gemini.onAudio = (mulaw) => this.onAudio(mulaw)
    this.gemini.onReady = () => this.onStatus({ type: 'ready' })
    this.gemini.onError = (error) => this.onStatus({ type: 'error', message: error.message })
    this.gemini.onTranscript = (role, text) => this.onStatus({ type: 'transcript', role, text })
    this.gemini.onToolCall = (calls) => this.handleTools(calls)
  }

  start() {
    this.gemini.connect()
    this.onStatus({ type: 'onboarding_started' })
  }

  sendAudio(mulaw: Buffer) {
    this.gemini.sendAudio(mulaw)
  }

  sendText(text: string) {
    this.gemini.sendText(text)
  }

  close() {
    this.gemini.close()
  }

  get currentDraft() {
    return this.draft
  }

  private async handleTools(calls: ToolCall[]): Promise<Record<string, unknown>[]> {
    const results: Record<string, unknown>[] = []
    for (const call of calls) {
      console.log('[onboarding tool]', call.name, JSON.stringify(call.args).slice(0, 300))
      if (call.name === 'update_draft') {
        this.applyPatch(call.args)
        const missing = this.missing()
        results.push({
          enregistre: true,
          champs_manquants: missing,
          resume: this.summary(),
        })
        continue
      }
      if (call.name === 'save_establishment') {
        const missing = this.missing()
        if (missing.length > 0) {
          results.push({
            ok: false,
            champs_manquants: missing,
            message: `Il manque encore : ${missing.join(', ')}.`,
          })
          continue
        }
        const payload = this.toPayload()
        const saved = await saveOnboarding(this.sessionId, payload)
        if (saved.ok) {
          this.onStatus({ type: 'onboarding_saved', name: this.draft.establishment.name })
          results.push({ ok: true, message: 'Établissement enregistré.' })
        } else {
          results.push({ ok: false, message: saved.message ?? 'échec' })
        }
        continue
      }
      results.push({ ok: false, message: 'outil inconnu' })
    }
    return results
  }

  private applyPatch(args: Record<string, unknown>) {
    const est = args.establishment as Record<string, unknown> | undefined
    if (est) {
      for (const key of ['name', 'address', 'postalCode', 'city', 'cuisine', 'phone'] as const) {
        const value = est[key]
        if (typeof value === 'string' && value.trim()) {
          this.draft.establishment[key] = value.trim()
        }
      }
    }

    const menu = args.menu as Array<Record<string, unknown>> | undefined
    if (Array.isArray(menu)) {
      for (const item of menu) {
        const name = typeof item.name === 'string' ? item.name.trim() : ''
        const priceCents = Number(item.priceCents)
        if (!name || !Number.isFinite(priceCents) || priceCents <= 0) continue
        const category =
          typeof item.category === 'string' && item.category.trim()
            ? item.category.trim()
            : 'Pizza'
        const existing = this.draft.menu.find(
          (entry) => entry.name.toLowerCase() === name.toLowerCase(),
        )
        if (existing) {
          existing.priceCents = Math.round(priceCents)
          existing.category = category
        } else {
          this.draft.menu.push({ name, category, priceCents: Math.round(priceCents) })
        }
      }
    }

    const hours = args.hours as Array<Record<string, unknown>> | undefined
    if (Array.isArray(hours)) {
      for (const slot of hours) {
        const day = Number(slot.day)
        if (!Number.isInteger(day) || day < 0 || day > 6) continue
        const entry = {
          day,
          closed: Boolean(slot.closed),
          open: typeof slot.open === 'string' && slot.open ? slot.open : '11:30',
          close: typeof slot.close === 'string' && slot.close ? slot.close : '22:30',
        }
        const index = this.draft.hours.findIndex((h) => h.day === day)
        if (index >= 0) this.draft.hours[index] = entry
        else this.draft.hours.push(entry)
      }
    }

    const delivery = args.delivery as Record<string, unknown> | undefined
    if (delivery) {
      if (typeof delivery.enabled === 'boolean') this.draft.delivery.enabled = delivery.enabled
      const fee = Number(delivery.feeCents)
      if (Number.isFinite(fee) && fee >= 0) this.draft.delivery.feeCents = Math.round(fee)
      const min = Number(delivery.minOrderCents)
      if (Number.isFinite(min) && min >= 0) this.draft.delivery.minOrderCents = Math.round(min)
      const radius = Number(delivery.radiusKm)
      if (Number.isFinite(radius) && radius >= 0) this.draft.delivery.radiusKm = radius
      if (typeof delivery.postalCodes === 'string') {
        this.draft.delivery.postalCodes = delivery.postalCodes.trim()
      }
    }
  }

  private missing(): string[] {
    const missing: string[] = []
    const est = this.draft.establishment
    if (!est.name) missing.push('nom de la pizzeria')
    if (!est.address) missing.push('adresse')
    if (!est.city) missing.push('ville')
    if (this.draft.menu.length === 0) missing.push('au moins un produit avec son prix')
    if (this.draft.delivery.enabled) {
      if (this.draft.delivery.feeCents < 0) missing.push('frais de livraison')
      if (this.draft.delivery.minOrderCents < 0) missing.push('commande minimum')
    }
    return missing
  }

  private summary() {
    const est = this.draft.establishment
    return {
      nom: est.name || null,
      adresse: [est.address, est.postalCode, est.city].filter(Boolean).join(', ') || null,
      telephone: est.phone || null,
      cuisine: est.cuisine || null,
      produits: this.draft.menu.length,
      jours_renseignes: this.draft.hours.length,
      livraison: this.draft.delivery.enabled,
    }
  }

  private toPayload(): OnboardingPayload {
    return {
      establishment: this.draft.establishment,
      menu: this.draft.menu,
      hours: this.draft.hours.length > 0 ? this.draft.hours : undefined,
      delivery: {
        enabled: this.draft.delivery.enabled,
        feeCents: Math.max(0, this.draft.delivery.feeCents),
        minOrderCents: Math.max(0, this.draft.delivery.minOrderCents),
        radiusKm: Math.max(0, this.draft.delivery.radiusKm),
        postalCodes: this.draft.delivery.postalCodes,
      },
    }
  }
}
