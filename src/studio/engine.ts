import type { Flow, FlowEdge, FlowNode } from './flow'

export type CompiledTransition = {
  id: string
  to: string
  intent: string
  examples: string[]
  question: string
}

export type CompiledState = {
  id: string
  kind: FlowNode['kind']
  say: string
  audio: string
  slot?: string
  tool?: string
  transitions: CompiledTransition[]
}

export type AudioAsset = {
  key: string
  nodeId: string
  text: string
  voice: string
  characters: number
}

export type CompiledProgram = {
  flowId: string
  version: number
  voice: string
  states: Record<string, CompiledState>
  audio: AudioAsset[]
  fallback: {
    threshold: number
    bridgeText: string
    bridgeAudio: string
  }
}

const BRIDGE_KEY = 'pizzavoice/bridge/v1'

export function audioKey(flow: Flow, node: FlowNode) {
  return `${flow.id}/${node.id}/v${flow.version}`
}

export function compileFlow(flow: Flow): CompiledProgram {
  const states: Record<string, CompiledState> = {}
  const audio: AudioAsset[] = []

  for (const node of flow.nodes) {
    const outgoing = flow.edges.filter((item) => item.from === node.id)

    states[node.id] = {
      id: node.id,
      kind: node.kind,
      say: node.text,
      audio: audioKey(flow, node),
      slot: node.slot,
      tool: node.tool,
      transitions: outgoing.map((item) => ({
        id: item.id,
        to: item.to,
        intent: item.intent,
        examples: item.examples,
        question: `${item.intent}. ${item.examples.join(' ; ')}`,
      })),
    }

    if (node.text.trim()) {
      audio.push({
        key: audioKey(flow, node),
        nodeId: node.id,
        text: node.text,
        voice: flow.voice,
        characters: node.text.length,
      })
    }
  }

  audio.push({
    key: BRIDGE_KEY,
    nodeId: 'handoff',
    text: flow.fallback.bridgeText,
    voice: flow.voice,
    characters: flow.fallback.bridgeText.length,
  })

  return {
    flowId: flow.id,
    version: flow.version,
    voice: flow.voice,
    states,
    audio,
    fallback: {
      threshold: flow.fallback.threshold,
      bridgeText: flow.fallback.bridgeText,
      bridgeAudio: BRIDGE_KEY,
    },
  }
}

export type RouteResult = {
  transitionId: string | null
  confidence: number
  source: 'local' | 'jev' | 'single' | 'none'
  probabilities: Array<{ id: string; score: number }>
  reason?: string
}

const STOP_WORDS = new Set([
  'le',
  'la',
  'les',
  'un',
  'une',
  'des',
  'de',
  'du',
  'au',
  'aux',
  'et',
  'ou',
  'je',
  'tu',
  'vous',
  'nous',
  'il',
  'elle',
  'on',
  'ce',
  'cette',
  'ces',
  'pour',
  'avec',
  'sans',
  'est',
  'sont',
  'ai',
  'as',
  'a',
  'avoir',
  'voudrais',
  'veux',
  'peux',
  'peut',
  'svp',
  'plait',
  'bonjour',
  'bonsoir',
  'merci',
  'oui',
  'non',
  'c',
  'j',
  'l',
  'd',
  's',
  'qu',
  'que',
  'qui',
  'quoi',
  'dans',
  'sur',
  'chez',
  'moi',
  'mon',
  'ma',
  'mes',
])

export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokens(value: string) {
  return normalize(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

function similarity(utterance: string, example: string) {
  const said = normalize(utterance)
  const target = normalize(example)
  if (!said || !target) return 0
  if (said === target) return 1
  if (said.includes(target) || target.includes(said)) {
    return 0.85
  }

  const saidTokens = tokens(said)
  const targetTokens = tokens(target)
  if (saidTokens.length === 0) return 0

  let overlap = 0
  for (const token of saidTokens) {
    if (targetTokens.some((item) => item === token || item.startsWith(token.slice(0, 4)))) {
      overlap += 1
    }
  }

  return overlap / saidTokens.length
}

export function scoreEdge(utterance: string, edge: CompiledTransition) {
  let best = 0
  for (const example of edge.examples) {
    best = Math.max(best, similarity(utterance, example))
  }
  return best
}

export function routeLocally(
  state: CompiledState,
  utterance: string,
  threshold: number,
): RouteResult {
  if (state.transitions.length === 0) {
    return {
      transitionId: null,
      confidence: 0,
      source: 'none',
      probabilities: [],
      reason: 'no_transition',
    }
  }

  if (state.transitions.length === 1) {
    return {
      transitionId: state.transitions[0].id,
      confidence: 1,
      source: 'single',
      probabilities: [{ id: state.transitions[0].id, score: 1 }],
    }
  }

  const scored = state.transitions
    .map((edge) => ({ id: edge.id, score: scoreEdge(utterance, edge) }))
    .sort((a, b) => b.score - a.score)

  const top = scored[0]
  const second = scored[1]
  const confidence = top.score / (top.score + second.score + 0.25)

  if (top.score < 0.42 || confidence < threshold) {
    return {
      transitionId: null,
      confidence,
      source: 'none',
      probabilities: scored,
      reason: top.score < 0.42 ? 'no_match' : 'low_confidence',
    }
  }

  return {
    transitionId: top.id,
    confidence,
    source: 'local',
    probabilities: scored,
  }
}

export function slotValue(intent: string): Record<string, string> {
  const normalized = normalize(intent)
  const slots: Record<string, string> = {}

  if (normalized.includes('margherita')) slots.pizza = 'Margherita'
  if (normalized.includes('regina')) slots.pizza = 'Regina'
  if (normalized.includes('quatre fromages')) slots.pizza = 'Quatre fromages'
  if (normalized.includes('diavola')) slots.pizza = 'Diavola'
  if (normalized === '1 pizza') slots.quantity = '1'
  if (normalized === '2 pizzas') slots.quantity = '2'
  if (normalized === '3 pizzas') slots.quantity = '3'
  if (normalized === 'coca') slots.drink = 'Coca'
  if (normalized === 'eau') slots.drink = 'Eau'
  if (normalized === 'diabolo') slots.drink = 'Diabolo'
  if (normalized === 'sur place') slots.mode = 'sur place'
  if (normalized === 'a emporter') slots.mode = 'à emporter'
  if (normalized === 'en livraison') slots.mode = 'en livraison'

  return slots
}

export function renderText(text: string, slots: Record<string, string>) {
  const quantity = slots.quantity ?? '1'
  const pizza = slots.pizza ?? 'Margherita'
  const drink = slots.drink
  const mode = slots.mode ?? 'à emporter'

  const order = [
    `${quantity} × ${pizza}`,
    drink ? `1 × ${drink}` : null,
    mode === 'en livraison'
      ? `Livraison${slots.address ? ` au ${slots.address}` : ''}`
      : mode,
  ]
    .filter(Boolean)
    .join(', ')

  return text
    .replaceAll('{{order}}', order)
    .replaceAll('{{reference}}', 'PV-1042')
}

export function outgoingEdges(flow: Flow, nodeId: string): FlowEdge[] {
  return flow.edges.filter((edge) => edge.from === nodeId)
}
